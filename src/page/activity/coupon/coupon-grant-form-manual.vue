<template>
  <pg-form style="width: 630px;" item-width="200px" label-width="90px" ref="form" key="manual" class="pr-20">

    <pg-form-item label="发放活动名称" rules="max_length:15" item-width="300px">
      <pg-input v-model="formData.title" placeholder="请输入发放活动名称"></pg-input>
    </pg-form-item>

    <!-- 手动发放 -->
    <pg-form-item item-width="300px" label="发放方式">
      <pg-button-group v-model="formData.manual_grant_way"
                       :options="{ '选择客户发放': 'choice', '导入客户发放': 'excel' }"></pg-button-group>
    </pg-form-item>

    <pg-form-item item-width="300px" label="发放客户" v-if="formData.manual_grant_way === 'choice'">
      <pg-button-group v-model="formData.choice_type" :options="{ '县域': 'city', '指定门店': 'store', '会员等级': 'vip' }"
                       @change="changeChoiceType"></pg-button-group>
    </pg-form-item>

    <div v-if="formData.manual_grant_way === 'choice'">
      <div v-if="formData.choice_type === 'city'">
        <pg-form-item label="指定县域" item-width="216px" key="item-city" class="pb-0">
          <div class="d-flex">
            <pg-select key="choice" clearable v-model="query.zone_id" @change="changeQuery" placeholder="按片区筛选">
              <pg-option v-for="item in zoneList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
            </pg-select>
          </div>
          <pg-form-item label="县域" :show-label="false" rules="required" item-width="500px">
            <pg-transfer key="trans-city" class="mt-20" :data="cityList" v-model="formData.city_ids"></pg-transfer>
          </pg-form-item>
        </pg-form-item>
      </div>

      <div v-if="formData.choice_type === 'store'">
        <pg-form-item label="指定门店" item-width="153.5px" key="item-store" class="pb-0">
          <div class="d-flex">
            <pg-select key="store" clearable v-model="query.zone_id" @change="changeZone" placeholder="按片区筛选">
              <pg-option v-for="item in zoneList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
            </pg-select>
            <pg-select clearable class="ml-20" v-model="query.city_id" @change="changeQuery" placeholder="按县域筛选">
              <pg-option v-for="item in cityList" :key="item.id" :value="item.value">{{ item.label }}</pg-option>
            </pg-select>
            <pg-search clearable class="ml-20" v-model="query.condition" @change="changeQuery" placeholder="门店名称"></pg-search>
          </div>
          <pg-form-item label="门店" :show-label="false" rules="required" item-width="500px">
            <pg-transfer key="trans-store" class="mt-20" :data="storeList" v-model="formData.store_ids"></pg-transfer>
          </pg-form-item>
        </pg-form-item>
      </div>

      <div v-if="formData.choice_type === 'vip'">
        <pg-form-item label="指定会员等级" item-width="500px" rules="required">
          <pg-checkbox-group inline v-model="formData.vip_levels" class="flex-wrap">
            <pg-checkbox class="ml-0 mr-20" v-for="item in vipList" :key="item.value" :value="item.value">{{
                item.label
              }}
            </pg-checkbox>
          </pg-checkbox-group>
        </pg-form-item>
      </div>
    </div>

    <div style="padding-left: 100px; margin-bottom: 30px;" v-if="formData.manual_grant_way === 'excel'">
      <input
        type="file"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        @change="changeImportStores"
      />
      <a class="ml-20" href="/excel/门店优惠券发放导入模版.xlsx">下载导入模版</a>
    </div>

    <pg-form-item item-width="500px" label="提示" v-if="type === 'grant'">
      <template v-slot:label>
        <i class="icon-info22 text-warning"></i>
      </template>
      <span class="form-item-label">手动发放有一定耗时！在发放成功后一段时间，才能看到发放记录</span>
    </pg-form-item>

    <div class="row no-gutters">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit" v-if="type === 'manual_again'">确认</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit('save')" v-if="type === 'grant'">保存</pg-button>
        <pg-button outline class="ml-20" color="primary" :loading="loading" @click="onSubmit('grant')" v-if="type === 'grant'">确认发放</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

import {Http, Api, Handle, Constant, Excel} from '@/util';

export default {
  name: 'coupon-grant-edit',
  inject: ['app'],
  props: {
    type: {type: String, default: 'grant'}, // grant | manual_again
    item: {
      type: Object, default() {
        return {}
      }
    },
  },

  data() {

    const province_code = this.app.userInfo.province_code;

    return {

      query: {},

      formData: {
        province_code: province_code,
        coupon_id: '', // 需要发放的优惠券id

        grant_way: 'manual', // 发放类型 auto 自动发放 | manual 手动发放 ｜ receive 主动领取
        title: '', // 活动名称
        total_num: '', // 本次发放的数量

        // 自动发放
        begin_date: '', // 开始时间 可编辑
        end_date: '', // 结束时间  可编辑
        condition: 'order', // order | goods_amount | goods_num | register | delivery_fee
        goods_scope: 'goods', // goods | goods_operation | goods_merchant | goods_custom
        threshold: '', // 金额
        item_ids: [], // 商品列表

        receive_cnt_limit: false, // 领取次数限制
        max_receive_cnt: '', // 领取次数上限

        // 主动领取 使用 begin_date 、end_date、max_receive_cnt 字段

        // 手动发放
        manual_grant_way: 'choice', // choice ｜ excel
        choice_type: 'city', // city | store | vip
        city_ids: [],
        store_ids: [],
        vip_levels: []

      },

      itemList: [],
      zoneList: [],
      cityList: [],
      storeList: [],
      vipList: [],
      loading: false,
    }
  },

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    this.initQuery();
    this.commonZoneList();
    this.commonCityList();
    this.commonStoreList();
    this.commonVipList();

    if (this.$props.type === 'grant') {
      this.$data.formData.coupon_id = this.$props.item.id;
    } else {
      this.$data.formData.id = this.$props.item.id;
    }

  },
  methods: {

    changeChoiceType() {
      this.initQuery();
      this.$data.formData = {
        ...this.$data.formData,
        city_ids: [],
        store_ids: [],
        vip_levels: []
      }
    },

    changeZone() {
      this.$data.query.city_id = '';
      this.changeQuery();
    },

    initQuery() {
      this.$data.query = {
        province_code: this.app.userInfo.province_code,
        zone_id: '',
        city_id: '',
        is_freeze_header: 0,
        is_audited: 1,
        condition: '',
        need_num: 30,
      };
    },

    changeQuery() {
      this.formData.choice_type === 'city' ? this.commonCityList() : this.commonStoreList();
    },

    changeImportStores(e) {
      const file = e.target.files[0];
      if (!file) return;
      Excel.read(file).then(res => {
        this.$data.formData.stores = this.arrayToMap(res.data);
      }).catch(e => {
        this.$toast({type: 'danger', message: e.message || '导入文件读取失败...'});
      })
    },

    arrayToMap(array) {
      let stores = {};
      if (!Array.isArray(array)) {
        this.$toast({type: 'danger', message: '导入数据格式不正确'});
        return {};
      }
      for (let i = 0; i < array.length; i++) {
        let item = array[i];
        let key = item['门店ID'] || item;
        let value = item['发放数量'] || 1;
        if (stores[key]) {
          stores[key] = stores[key] + Number(value);
        } else {
          stores[key] = Number(value);
        }
      }
      return stores;
    },

    onSubmit(save_or_grant) {
      this.$refs['form']?.validateAll().then(valid => {
        if (!valid) return;
        const formData = {...this.$data.formData};

        if (formData.stores && Object.keys(formData.stores).length <= 0) {
          this.$toast({type: 'warning', message: `请导入需要发放的门店`});
          return;
        }

        formData.total_num = Number(formData.total_num);
        formData.max_receive_cnt = Number(formData.max_receive_cnt);

        if (this.$props.type === 'grant') {
          formData.save_or_grant = save_or_grant;
        }

        this.$data.loading = true;
        Http.post(this.$props.type === 'grant' ? Api.activityCouponGrantAdd : Api.activityCouponManualGrantAgain, formData)
          .then(() => {
            this.$toast({type: 'success', message: `优惠券发放成功`});
            this.$data.loading = false;
            this.$emit('submit');
          })
          .catch(() => {
            this.$data.loading = false;
          });
      });

    },

    onCancel() {
      this.$emit('cancel');
    },

    commonZoneList() {
      Http.get(Api.commonZoneList, this.$data.query)
        .then(res => {
          this.$data.zoneList = res.data || [];
        });
    },

    commonCityList() {
      Http.get(Api.commonCityList, this.$data.query)
        .then(res => {
          this.$data.cityList = (res.data || []).map(item => ({
            label: item.title,
            value: item.id
          }));
        });
    },

    commonStoreList() {
      Http.get(Api.commonStoreList, this.$data.query)
        .then(res => {
          this.$data.storeList = (res.data || []).map(item => ({
            label: item.title,
            value: item.id
          }));
        });
    },

    commonVipList() {
      Http.get(Api.commonVipList)
        .then(res => {
          this.$data.vipList = (res.data || []).map(item => ({
            label: item.title,
            value: item.level
          }));
        });
    },

  }
}
</script>
