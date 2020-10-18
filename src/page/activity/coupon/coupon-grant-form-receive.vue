<template>
  <pg-form item-width="200px" label-width="90px" ref="form" key="receive" class="pr-20" :disabled="type === 'detail'">

    <pg-form-item label="发放活动名称" rules="max_length:15" item-width="300px">
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

    <div class="row no-gutters">
      <pg-form-item label="领取次数上限" item-width="350px" required>
        <pg-radio-group v-model="formData.receive_cnt_limit" @change="changeReceiveCntLimit">
          <pg-radio :value="false">不限</pg-radio>
          <div class="d-flex">
            <pg-radio :value="true">限制每人可领取</pg-radio>
            <pg-form-item rules="required|min_value:1|max_value:999" class="ml-20 pb-0" v-if="formData.receive_cnt_limit">
              <pg-input v-model="formData.max_receive_cnt" type="number" suffix="张"></pg-input>
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
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit('save')">保存</pg-button>
        <pg-button outline class="ml-20" color="primary" :loading="loading" @click="onSubmit('grant')">确认发放</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

import {Http, Api, Handle, Constant} from '@/util';

export default {
  name: 'coupon-grant-form-receive',
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

        grant_way: 'receive', // 发放类型 auto 自动发放 | manual 手动发放 ｜ receive 主动领取
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

      loading: false,
    }
  },

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    this.$data.formData.coupon_id = this.$props.item.id;

    if (this.$props.type === 'detail') {
      const formData = { ...this.$props.item };
      if (['order', 'goods_amount', 'delivery_fee'].includes(formData.condition)) {
        formData.threshold = Handle.returnPrice(formData.threshold);
      }
      this.$data.formData = formData;
    }

  },
  methods: {

    changeReceiveCntLimit() {
      this.$data.formData.max_receive_cnt = 1;
    },

    onSubmit(save_or_grant) {
      this.$refs['form']?.validateAll().then(valid => {
        if (!valid) return;
        const formData = {...this.$data.formData};

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

    onCancel() {
      this.$emit('cancel');
    },

  }
}
</script>
