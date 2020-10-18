<template>
  <pg-form item-width="200px" label-width="90px" ref="form" key="auto" class="pr-20" :disabled="type === 'detail'">

    <pg-form-item label="发放活动名称" rules="max_length:15" item-width="295px">
      <pg-input v-model="formData.title" placeholder="请输入发放活动名称"></pg-input>
    </pg-form-item>

    <div class="row no-gutters">
      <pg-form-item
        label="发放数量"
        item-width="295px"
        :rules="{ 'required': true, 'min_value:1': true, [`max_value:${item.stock}`]: type !== 'detail' }"
        help-text="单次发放数量 不能超过 优惠券总量"
      >
        <pg-input v-model="formData.total_num" type="number" suffix="张" placeholder="请输入本次发放的数量"></pg-input>
      </pg-form-item>
    </div>

    <div class="row no-gutters">
      <pg-form-item label="发放时限" rules="required" item-width="295px" :disabled="false">
        <pg-datepicker v-model="formData" :limit="{ from: today, to: limit_to }" range begin-date-key="begin_date" end-date-key="end_date"></pg-datepicker>
      </pg-form-item>
    </div>

    <template v-if="formData.grant_way === 'auto'">
      <div class="row no-gutters">
        <pg-form-item label="发放条件" item-width="400px">
          <pg-button-group
            basis-auto
            v-model="formData.condition"
            :options="Constant.ACTIVITY_COUPON_GRANT_CONDITION('options')"
            @change="changeGrantCondition"
          >
          </pg-button-group>
        </pg-form-item>
      </div>

      <div class="row no-gutters" v-if="formData.condition === 'order'">
        <pg-form-item item-width="240px;">
          <div class="form-item-label" style="padding-left: 100px">订单金额(包含运费) >= </div>
        </pg-form-item>
        <pg-form-item label="订单总金额" :show-label="false" rules="required|min_value:0.01:blur|max_value:1000000">
          <pg-input v-model="formData.threshold" type="decimal" suffix="元"></pg-input>
        </pg-form-item>
      </div>

      <template v-if="formData.condition === 'goods_amount'">
        <pg-radio-group v-model="formData.goods_scope" style="padding-left: 100px;" @change="formData.threshold = ''">
          <div class="d-flex" style="height: 50px;">
            <pg-radio style="height: 30px; width: 150px;" value="goods">商品金额(自营 + 平台)</pg-radio>
            <template v-if="formData.goods_scope === 'goods'">
              <div class="ml-10 mr-25" style="height: 30px; line-height: 30px;"> >= </div>
              <pg-form-item label="商品金额" :show-label="false" rules="required|min_value:0.01:blur|max_value:1000000">
                <pg-input v-model="formData.threshold" type="decimal" suffix="元" placeholder="请输入商品金额"></pg-input>
              </pg-form-item>
            </template>
          </div>
          <div class="d-flex" style="height: 50px;">
            <pg-radio style="height: 30px; width: 150px;" value="goods_operation">商品金额(仅自营)</pg-radio>
            <template v-if="formData.goods_scope === 'goods_operation'">
              <div class="ml-10 mr-25" style="height: 30px; line-height: 30px;"> >= </div>
              <pg-form-item label="商品金额" :show-label="false" rules="required|min_value:0.01:blur|max_value:1000000">
                <pg-input v-model="formData.threshold" type="decimal" suffix="元" placeholder="请输入商品金额"></pg-input>
              </pg-form-item>
            </template>
          </div>
          <div class="d-flex" style="height: 50px;">
            <pg-radio style="height: 30px; width: 150px" value="goods_merchant">商品金额(仅平台)</pg-radio>
            <template v-if="formData.goods_scope === 'goods_merchant'">
              <div class="ml-10 mr-25" style="height: 30px; line-height: 30px;"> >= </div>
              <pg-form-item label="商品金额" :show-label="false" rules="required|min_value:0.01:blur|max_value:1000000">
                <pg-input v-model="formData.threshold" type="decimal" suffix="元" placeholder="请输入商品金额"></pg-input>
              </pg-form-item>
            </template>
          </div>
          <div class="d-flex" style="height: 60px;">
            <pg-radio style="height: 30px; width: 150px" value="goods_custom">商品金额</pg-radio>
            <template v-if="formData.goods_scope === 'goods_custom'">
              <div class="ml-10 mr-25" style="height: 30px; line-height: 30px;"> >= </div>
              <pg-form-item label="商品金额" :show-label="false" rules="required|min_value:0.01:blur|max_value:1000000">
                <pg-input v-model="formData.threshold" type="decimal" suffix="元" placeholder="请输入商品金额"></pg-input>
              </pg-form-item>
            </template>
          </div>
        </pg-radio-group>

        <div class="row no-gutters" style="padding-left: 100px" v-if="formData.goods_scope === 'goods_custom' && type === 'grant'">
          <pg-search placeholder="请输入商品编号/名称查询" style="width: 265px;" size="lg" class="-mb-1" immediate debounce
                     @change="commonItemList"></pg-search>
        </div>

        <div class="row no-gutters" v-if="formData.goods_scope === 'goods_custom'">
          <pg-form-item label="商品" :show-label="false" rules="required" item-width="600px" style="padding-left: 100px">
            <pg-transfer key="item" :required-data="item_required_data" :data="itemList" v-model="formData.item_ids" placeholder="商品列表"></pg-transfer>
          </pg-form-item>
        </div>
      </template>

      <template v-if="formData.condition === 'goods_num'">
        <div class="row no-gutters">
          <pg-form-item>
            <div class="form-item-label" style="padding-left: 100px">商品购买数量 >= </div>
          </pg-form-item>
          <pg-form-item label="商品购买数量" :show-label="false" rules="required|min_value:1|max_value:1000000">
            <pg-input v-model="formData.threshold" type="number" suffix="件"></pg-input>
          </pg-form-item>
        </div>

        <div class="row no-gutters" style="padding-left: 100px" v-if="type === 'grant'">
          <pg-search placeholder="请输入商品编号/名称查询" style="width: 265px;" size="lg" class="-mb-1" immediate debounce
                     @change="commonItemList"></pg-search>
        </div>

        <div class="row no-gutters">
          <pg-form-item label="商品" :show-label="false" rules="required" item-width="600px" style="padding-left: 100px">
            <pg-transfer key="item" :required-data="item_required_data" :data="itemList" v-model="formData.item_ids" placeholder="商品列表"></pg-transfer>
          </pg-form-item>
        </div>
      </template>

      <div class="row no-gutters" v-if="formData.condition === 'delivery_fee'">
        <pg-form-item item-width="240px;">
          <div class="form-item-label" style="padding-left: 100px">运费实付金额 >= </div>
        </pg-form-item>
        <pg-form-item label="运费实付金额" :show-label="false" rules="required|min_value:0.01:blur|max_value:1000000">
          <pg-input v-model="formData.threshold" type="decimal" suffix="元"></pg-input>
        </pg-form-item>
      </div>

    </template>

    <div class="row no-gutters">
      <pg-form-item label="领取次数上限" item-width="350px" required>
        <pg-radio-group v-model="formData.receive_cnt_limit" @change="changeReceiveCntLimit" :disabled="formData.condition === 'register'">
          <pg-radio :value="false">不限</pg-radio>
          <div class="d-flex">
            <pg-radio :value="true">限制每人可领取</pg-radio>
            <pg-form-item rules="required|min_value:1|max_value:999" class="ml-20 pb-0" v-if="formData.receive_cnt_limit">
              <pg-input v-model="formData.max_receive_cnt" type="number" suffix="张" :disabled="formData.condition === 'register'"></pg-input>
            </pg-form-item>
          </div>
        </pg-radio-group>
      </pg-form-item>
    </div>

    <pg-form-item item-width="500px" label="提示" v-if="type === 'grant'">
      <template v-slot:label>
        <i class="icon-info22 text-warning"></i>
      </template>
      <span class="form-item-label">手动发放有一定耗时！在发放成功后一段时间，才能看到发放记录</span>
    </pg-form-item>

    <div class="row no-gutters" v-if="type === 'grant'">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button  class="ml-20" color="primary" :loading="loading" @click="onSubmit('save')">保存</pg-button>
        <pg-button outline class="ml-20" color="primary" :loading="loading" @click="onSubmit('grant')">确认发放</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

import {Http, Api, Handle, Constant} from '@/util';

export default {
  name: 'coupon-grant-edit',
  inject: ['app'],
  props: {
    type: {type: String, default: 'grant'},
    item: {
      type: Object, default() {
        return {}
      }
    },
  },

  data() {
    let today = new Date();
    today = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

    const province_code = this.app.userInfo.province_code;

    const expire_date = this.$props.item.expire_date;
    return {
      today: today,

      limit_to: expire_date,

      formData: {
        province_code: province_code,
        coupon_id: '', // 需要发放的优惠券id

        grant_way: 'auto', // 发放类型 auto 自动发放 | manual 手动发放 ｜ receive 主动领取
        title: '', // 活动名称
        total_num: '', // 本次发放的数量

        // 自动发放
        begin_date: '', // 开始时间 可编辑
        end_date: '', // 结束时间  可编辑
        condition: 'order', // order | goods_amount | goods_num | register | delivery_fee
        goods_scope: 'goods', // goods | goods_operation | goods_merchant | goods_custom
        threshold: '', // 金额
        item_ids: [], // 商品列表

        receive_cnt_limit: true, // 领取次数限制
        max_receive_cnt: 1, // 领取次数上限

        // 主动领取 使用 begin_date 、end_date、max_receive_cnt 字段

        // 手动发放
        manual_grant_way: 'choice', // choice ｜ excel
        choice_type: 'city', // city | store | vip
        city_ids: [],
        store_ids: [],
        vip_levels: [],
        stores: {}

      },

      item_required_data: [],
      itemList: [],
      loading: false,
    }
  },

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    this.commonItemList();
    this.$data.formData.coupon_id = this.$props.item.id;

    if (this.$props.type === 'detail') {
      const formData = { ...this.$props.item };
      if (['order', 'goods_amount', 'delivery_fee'].includes(formData.condition)) {
        formData.threshold = Handle.returnPrice(formData.threshold);
      }
      this.$data.formData = formData;

      this.$data.item_required_data = [...formData.items].map(item => ({ label: item.title, value: item.id }));
    }
  },
  methods: {

    changeGrantCondition() {
      this.$data.formData = {
        ...this.$data.formData,
        goods_scope: 'goods',
        threshold: '',
        item_ids: [],
      }

      if (this.$data.formData.condition === 'register') {
        this.$data.formData.receive_cnt_limit = true;
        this.$data.formData.max_receive_cnt = 1;
      }
    },

    changeReceiveCntLimit() {
      this.$data.formData.max_receive_cnt = 1;
    },

    onSubmit(save_or_grant) {
      this.$refs['form']?.validateAll().then(valid => {
        if (!valid) return;
        const formData = {...this.$data.formData};

        if (formData.grant_way === 'auto') {
          formData.threshold = formData.condition === 'goods_num' ? Number(formData.threshold) : Handle.handlePrice(formData.threshold);
        }

        formData.total_num = Number(formData.total_num);
        formData.max_receive_cnt = Number(formData.max_receive_cnt);

        formData.save_or_grant = save_or_grant || 'save';

        this.$data.loading = true;
        Http.post(Api.activityCouponGrantAdd, formData)
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

    commonItemList(condition = '') {
      Http.get(Api.commonItemList, {
        province_code: this.app.userInfo.province_code,
        condition: condition,
        need_num: 30,
        is_on_sale: 1,
        is_deleted: 0,
      })
        .then(res => {
          this.$data.itemList = (res.data || []).map(item => ({
            label: item.title,
            value: item.id
          }));
        })
    },

    onCancel() {
      this.$emit('cancel');
    },

  }
}
</script>

<style scoped>
.pg-table tbody td {
  padding: 20px 10px;
}
</style>
