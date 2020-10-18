<template>
  <pg-form
    item-width="200px"
    label-width="90px"
    ref="form"
    :disabled="type === 'detail'"
    :style="type === 'detail' ? `height: ${app.windowHeight - 70 + 'px'}; overflow-y: auto;` : ''"
  >

    <div class="row no-gutters" style="min-width: 750px;">
      <div class="col-7">
        <pg-form-item label="优惠券名称" item-width="295px" rules="required|max_length:15">
          <pg-input v-model="formData.title" placeholder="请输入优惠券名称"></pg-input>
        </pg-form-item>
      </div>

      <div class="col-5">
        <pg-form-item label="发放总量" label-width="70px" item-width="169px" rules="required|min_value:1|max_value:1000000">
          <pg-input v-model="formData.total_num" type="number" placeholder="请输入发放总量" suffix="张"></pg-input>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">
      <pg-form-item label="优惠券有效期" class="pb-0" rules="required" item-width="550px">
        <pg-radio-group v-model="formData.date_type" @change="changeDateOrDays">
          <div class="d-flex" style="height: 50px">
            <pg-radio value="fixed">
              固定日期
            </pg-radio>
            <template v-if="formData.date_type === 'fixed'">
              <pg-form-item label="开始日期" :show-label="false" rules="required" class="ml-15 pb-20">
                <pg-datepicker v-model="formData.effective_date" :limit="{ from: today }" placeholder="开始日期" @change="changeEffectiveDate"></pg-datepicker>
              </pg-form-item>
              <span class="form-item-label mx-20">至</span>
              <pg-form-item label="结束日期" :show-label="false" :rules="{'required': true, 'logic': expire_date_validator}" class="pb-20">
                <pg-datepicker v-model="formData.expire_date" :limit="{ from: today }" placeholder="结束日期"></pg-datepicker>
              </pg-form-item>
            </template>
          </div>
          <div class="d-flex" style="height: 80px">
            <pg-radio value="offset">
              自用户领券
            </pg-radio>
            <template v-if="formData.date_type === 'offset'">
              <pg-form-item rules="required|max_value:1000000" class="ml-3" item-width="200px" help-text="延迟生效天数为0时，表示领券后立即生效">
                <pg-input v-model="formData.effective_days" type="number" suffix="天" placeholder="请输入延迟生效的天数"></pg-input>
              </pg-form-item>
              <span class="form-item-label mx-10">后生效，有效期</span>
              <pg-form-item rules="required|min_value:1|max_value:1000000" item-width="145px">
                <pg-input v-model="formData.expire_days" type="number" suffix="天" placeholder="请输入有效期"></pg-input>
              </pg-form-item>
            </template>
          </div>
        </pg-radio-group>
      </pg-form-item>
    </div>

    <div class="row no-gutters">
      <pg-form-item label="优惠类型" class="pb-0" item-width="550px" rules="required">
        <pg-radio-group v-model="formData.discount_type">
          <div class="d-flex" style="height: 60px">
            <pg-radio value="reduce">满减</pg-radio>
            <pg-form-item
              class="pb-20"
              style="margin-left: 37px"
              v-if="formData.discount_type === 'reduce'"
              key="reduce"
              label="满减金额"
              :show-label="false"
              rules="required|min_value:0.01:blur|max_value:1000000"
            >
              <pg-input v-model="formData.benefit" placeholder="请输入满减金额" type="decimal" suffix="元" @change="changeBenefitAmount"></pg-input>
            </pg-form-item>
          </div>
        </pg-radio-group>
      </pg-form-item>
    </div>

    <div class="row no-gutters mt-10">
      <pg-form-item label="使用门槛" class="pb-0 required" item-width="550px">
        <pg-radio-group v-model="formData.use_type" @change="changeThreshold">
          <pg-radio class="mb-10" value="any">无门槛</pg-radio>
          <div class="d-flex" style="height: 50px">
            <pg-radio value="amount">商品金额满</pg-radio>
            <template v-if="formData.use_type === 'amount'">
              <pg-form-item label="商品金额" :show-label="false" class="ml-25" rules="required|min_value:0.01:blur|max_value:1000000">
                <pg-input v-model="formData.threshold" placeholder="请输入使用门槛" type="decimal" suffix="元"></pg-input>
              </pg-form-item>
            </template>
          </div>
          <div class="d-flex" style="height: 60px">
            <pg-radio value="delivery_fee">运费金额满</pg-radio>
            <template v-if="formData.use_type === 'delivery_fee'">
              <pg-form-item
                label="运费金额"
                :show-label="false"
                class="ml-25"
                :rules="{'required': true, 'min_value:0.01:blur': true, 'max_value:1000000': true, logic: delivery_fee_validator}"
              >
                <pg-input v-model="formData.threshold" placeholder="请输入使用门槛" type="decimal" suffix="元"></pg-input>
              </pg-form-item>
            </template>
          </div>
        </pg-radio-group>
      </pg-form-item>
    </div>

    <template v-if="formData.use_type === 'amount'">
      <div class="row no-gutters">
        <pg-form-item key="delivery" label="适用范围" item-width="295px">
          <pg-button-group
            v-model="formData.scope_type"
            :options="{ '全场': 'all', '自营': 'operation', '单品': 'goods', '品类': 'category' }"
            @change="formData.scope_list = []"
          ></pg-button-group>
        </pg-form-item>
        <pg-form-item item-width="270px" class="ml-20">
          <pg-radio-group inline v-model="formData.usable_scope_type" v-if="formData.scope_type === 'goods'">
            <pg-radio value="usable">指定商品可用</pg-radio>
            <pg-radio value="unusable">指定商品不可用</pg-radio>
          </pg-radio-group>
          <pg-radio-group inline v-model="formData.usable_scope_type" v-if="formData.scope_type === 'category'">
            <pg-radio value="usable">指定品类可用</pg-radio>
            <pg-radio value="unusable">指定品类不可用</pg-radio>
          </pg-radio-group>
        </pg-form-item>
      </div>

      <div class="row no-gutters" style="padding-left: 100px" v-if="formData.scope_type === 'goods' && type !== 'detail'">
        <pg-search placeholder="请输入商品编号/名称查询" style="width: 240px;" class="-mb-1" immediate debounce
                   @change="commonItemList"></pg-search>
      </div>

      <div class="row no-gutters" style="padding-left: 100px" v-if="formData.scope_type === 'category' && type !== 'detail'">
        <pg-button-group v-model="display_class_level" style="width: 240px;" class="-mb-1" :options="{ '全部': '', '一级分类': 1, '二级分类': 2 }"></pg-button-group>
      </div>

      <div class="row no-gutters" style="padding-left: 100px" v-if="formData.scope_type === 'goods'">
        <pg-form-item item-width="550px" rules="required">
          <pg-transfer
            key="item"
            :data="itemList"
            :required-data="item_required_data"
            v-model="formData.scope_list"
            placeholder="商品列表"
          ></pg-transfer>
        </pg-form-item>
      </div>

      <div class="row no-gutters" style="padding-left: 100px" v-if="formData.scope_type === 'category'">
        <pg-form-item item-width="550px" rules="required">
          <pg-transfer key="display-class" :data="display_class_list" v-model="formData.scope_list" placeholder="展示分类"></pg-transfer>
        </pg-form-item>
      </div>
    </template>

    <div class="row no-gutters mt-30" v-if="type !== 'detail'">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

import {Http, Api, Handle, Constant} from '@/util';

export default {
  name: 'coupon-list-delivery-edit',
  inject: ['app'],
  props: {
    type: {type: String, default: 'add'},
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
    return {
      today: today,

      formData: {
        province_code: province_code,

        coupon_type: 'delivery', // 优惠券类型 goods ｜ delivery
        title: '', // 优惠券名称
        total_num: '', // 发放总量

        date_type: 'fixed', // fixed | offset 按 日期范围 还是 按天数 计算优惠券有效期 前端冗余字段
        effective_date: '', // 固定日期 开始
        expire_date: '', // 固定日期 结束
        effective_days: '', // 领券后多少天有效
        expire_days: '', // 领券后多少天失效

        discount_type: 'reduce', // reduce ｜ discount ｜ gift // 使用类型

        use_type: 'any', // any ｜ amount ｜ num ｜ delivery_fee
        threshold: '', // 满数值
        benefit: '', // 优惠数值
        max_dis_amt: '', // 减免金额上线
        gift_info: [], // 赠送商品 [ { item_id, gift_num } ]

        scope_type: 'all', // 适用范围  all | operation | merchant | goods | category
        usable_scope_type: 'usable', // 可用 不可用  usable ｜ unusable
        scope_list: [],
        usable_scope: [], // 指定可用范围 列表
        unusable_scope: [], // 指定不可用范围 列表

      },

      item_required_data: [],
      itemList: [],

      displayClassList: [],

      display_class_level: '',
      loading: false,
    }
  },

  computed: {
    display_class_list() {
      const { display_class_level, displayClassList } = this.$data;

      if (display_class_level) {
        return displayClassList.filter(item => item.level === display_class_level);
      }
      return this.displayClassList;
    }
  },

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    this.commonItemList();
    this.commonDisplayClassList();

    const { type, item } = this.$props;
    if (type === 'modify' || type === 'detail') {
      const formData = { ...item };

      formData.effective_days = (formData.effective_days === 0 || !!formData.effective_days) ? Number(formData.effective_days) : '';
      formData.expire_days = Number(formData.expire_days) || '';

      formData.benefit = Handle.returnPrice(formData.benefit);
      formData.max_dis_amt = Handle.returnPrice(formData.max_dis_amt);

      switch (formData.use_type) {
        case 'amount':
        case 'delivery_fee':
          formData.threshold = Handle.returnPrice(formData.threshold);
          break;
        default:
          formData.threshold = Number(formData.threshold) || '';
          break;
      }

      if (!formData.usable_scope_type) {
        formData.usable_scope_type = 'usable';
      }

      if (formData.usable_scope_type === 'usable') {
        this.$data.item_required_data = [...formData.usable_scope].map(item => ({ label: item.title, value: item.id }));
        formData.scope_list = [...formData.usable_scope].map(item => item.id);
      } else {
        this.$data.item_required_data = [...formData.unusable_scope].map(item => ({ label: item.title, value: item.id }));
        formData.scope_list = [...formData.unusable_scope].map(item => item.id);
      }

      this.$data.formData = formData;
    }

    this.expire_date_validator = {
      //  date_type
      validate: v => {
        if (!this.formData.date_type === 'offset') return true;
        if (!this.$data.formData.effective_date) return true;
        return new Date(this.$data.formData.effective_date).getTime() <= new Date(v).getTime();
      },
      getMsg: '结束日期不能小于开始日期'
    };

    this.delivery_fee_validator = {
      validate: v => {
        if (!this.$data.formData.benefit) return true;
        return Number(v) > this.$data.formData.benefit;
      },
      getMsg: '使用门槛必须大于满减金额'
    };

  },
  methods: {

    changeDateOrDays() {
      this.$data.formData = {
        ...this.$data.formData,
        effective_date: '',
        expire_date: '',
        effective_days: '',
        expire_days: '',
      }
    },

    changeEffectiveDate(v) {
      if (v && this.$data.formData.expire_date) {
        this.$refs['form']?.validate('结束日期');
      }
    },

    changeBenefitAmount(v) {
      if (v && this.$data.formData.threshold) {
        this.$refs['form']?.validate('运费金额');
      }
    },

    changeThreshold() {
      this.$data.formData = {
        ...this.$data.formData,
        threshold: '',
        scope_type: 'all',
        usable_scope_type: 'usable',
        scope_list: []
      };
    },

    onSubmit() {
      this.$refs['form']?.validateAll().then(valid => {
        if (!valid) return;
        const formData = {...this.$data.formData};

        formData.total_num = Number(formData.total_num);

        if (formData.date_type === 'fixed') {
          formData.effective_days = '';
          formData.expire_days = '';

        } else if (formData.date_type === 'offset') {

          formData.effective_date = '';
          formData.expire_date = '';
          formData.effective_days = Number(formData.effective_days);
          formData.expire_days = Number(formData.expire_days);

        }

        formData.benefit = Handle.handlePrice(formData.benefit);
        formData.max_dis_amt = Handle.handlePrice(formData.max_dis_amt);

        switch (formData.use_type) {
          case 'amount':
          case 'delivery_fee':
            formData.threshold = Handle.handlePrice(formData.threshold);
            break;
          default:
            formData.threshold = Number(formData.threshold);
            break;
        }

        if (formData.usable_scope_type === 'usable') {
          formData.usable_scope = [...formData.scope_list];
          formData.unusable_scope = [];
        } else {
          formData.unusable_scope = [...formData.scope_list];
          formData.usable_scope = [];
        }

        this.$data.loading = true;

        const type = this.$props.type;
        Http.post(type === 'add' ? Api.activityCouponAdd : Api.activityCouponModify, formData)
          .then(() => {
            this.$toast({type: 'success', message: `运费优惠券${type === 'add' ? '新增' : '修改'}成功`});
            this.$data.loading = false;
            this.$emit('submit');
          })
          .catch(() => {
            this.$data.loading = false;
          });
      });

    },

    commonGiftList(condition = '') {
      Http.get(Api.commonItemList, {
        province_code: this.app.userInfo.province_code,
        condition: condition,
        need_num: 30,
        is_gift: 1,
        is_deleted: 0,
      })
        .then(res => {
          const type = this.$props.type;
          const gift_info = this.$data.formData.gift_info;
          this.$data.giftList = (res.data || []).map(item => {
            let gift_num = 1;
            if (type === 'modify') {
              // 找到详情中的商品
              const gift = gift_info.find(gift => gift.item_id === item.id);
              if (gift) {
                gift_num = gift.gift_num;
              }
            }
            return {label: item.title, value: item.id, item_id: item.id, gift_num: gift_num};
          });
        })
    },

    commonItemList(condition = '') {
      Http.get(Api.commonItemList, {
        province_code: this.app.userInfo.province_code,
        condition: condition,
        need_num: 30,
        is_gift: 0,
        is_on_sale: 1,
        is_deleted: 0,
      })
        .then(res => {
          this.$data.itemList = (res.data || []).map(item => ({label: item.title, value: item.id}));
        })
    },

    commonDisplayClassList() {
      Http.get(Api.commonDisplayClassList, {
        province_code: this.app.userInfo.province_code,
      })
        .then(res => {
          this.$data.displayClassList = (res.data || []).map(item => ({
            label: item.title,
            value: item.id,
            level: item.level
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
</style>
