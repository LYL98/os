<template>
  <pg-form ref="form" item-width="108px">

    <pg-form-item label="促销类型" item-width="300px" rules="required">
      <pg-button-group v-model="formData.promotion_type" :options="{ '全场满减': 'type_reduction', '全场满折': 'scope_discount' }" @change="changePromotionType">
      </pg-button-group>
    </pg-form-item>
    <pg-form-item label="活动主题" item-width="300px" rules="required|max_length:15">
      <pg-input v-model="formData.topic" placeholder="请输入活动主题"/>
    </pg-form-item>
    <pg-form-item label="有效期" item-width="300px" :rules="{ 'required': true, logic: validate_effective_date }">
      <pg-datepicker range timeable begin-date-key="time_start" end-date-key="time_end" v-model="formData" placeholder="开始时间 ～ 结束时间"></pg-datepicker>
    </pg-form-item>
    <pg-form-item label="活动规则" class="pb-0" item-width="350px">
      <ul class="list-unstyled">
        <li class="d-flex" v-for="(item, index) in formData.rules" :key="index">
          <span class="form-item-label" style="min-width: 40px;">订单满</span>
          <pg-form-item label="满金额" :show-label="false" rules="required|min_value:0.01|max_value:1000000">
            <pg-input :auto-focus="index !== 0" type="decimal:2" suffix="元" v-model="item.full" @change="changeFull(item)"></pg-input>
          </pg-form-item>
          <template v-if="formData.promotion_type === 'type_reduction'">
            <span class="form-item-label ml-10">减</span>
            <pg-form-item
              :key="'reduction-' + index"
              label="减金额"
              :show-label="false"
              :rules="{ required: true, 'min_value:0.01': true, 'max_value:1000000': true, [`logic:${index}`]: validate_reduction }"
            >
              <pg-input type="decimal:2" suffix="元" v-model="item.reduction"></pg-input>
            </pg-form-item>
          </template>
          <template v-if="formData.promotion_type === 'scope_discount'">
            <span class="form-item-label ml-10">打</span>
            <pg-form-item
              :key="'discount-' + index"
              label="折扣"
              :show-label="false"
              :rules="{ required: true, 'min_value:0.1': true, 'max_value:10': true}"
            >
              <pg-input type="decimal:1" suffix="折" v-model="item.discount"></pg-input>
            </pg-form-item>
          </template>
          <a class="form-item-label" style="min-width: 40px;" v-if="index > 0" @click="handleRemoveRule(index)">删除</a>
        </li>
      </ul>
    </pg-form-item>

    <pg-button
      v-if="formData.rules.length < 3"
      class="mb-30"
      outline
      color="primary"
      style="margin-left: 80px; position: relative; z-index: 100;"
      @click="handleAddRule"
    >
      <i class="icon-plus3 text-primary font-size-lg"></i> 新增优惠阶梯
    </pg-button>

    <div class="text-center" style="position: relative; z-index: 200;">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api, Handle } from '@/util';

export default {
  name: 'scope-edit',
  inject: ['app'],
  props: {
    type: { type: String, default: 'add' },
    item: { type: Object, default() { return {} } },
  },
  data() {
    let today = new Date();
    today = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

    const province_code = this.app.userInfo.province_code;
    return {
      today: today,
      formData: {
        province_code: province_code,
        promotion_type: 'type_reduction',
        topic: '',
        time_start: '',
        time_end: '',
        rules: [ { full: '', reduction: '', discount: '' } ],
      },
      loading: false,
    }
  },
  computed: {
    province_code() {
      return this.app.userInfo.province_code;
    }
  },
  created() {
    if (this.$props.type === 'modify') {
      const formData = { ...this.$props.item };
      this.$data.formData = formData;
    }

    this.validate_effective_date = {
      validate: v => {
        if (!v) return true;
        return new Date(v.time_end).getTime() > new Date(v.time_start).getTime();
      },
      getMsg: '结束时间 必须大于 开始时间'
    };

    this.validate_reduction = {
      validate: (v, n) => {
        const item = this.$data.formData.rules[Number(n[0])];
        const full = Number(item.full);
        if (!full) return true;
        return v < full;
      },
      getMsg: '减金额 必须小于 满金额'
    }
  },

  methods: {

    changePromotionType() {
      this.$data.formData.rules = [{ full: '', reduction: '', discount: '' }];
    },

    changeFull(item) {
      if (item && item.full && item.reduction) {
        this.$refs['form']?.validate(`减金额`);
      }
    },

    handleAddRule() {
      this.$data.formData.rules = [...this.$data.formData.rules, { full: '', reduction: '', discount: '' }];
    },

    handleRemoveRule(index) {
      this.$data.formData.rules = this.$data.formData.rules.filter((_, i) => i !== index);
    },

    onSubmit() {
      this.$refs['form'].validateAll().then(valid => {
        if (!valid) return;

        const formData = {...this.$data.formData};
        formData.rules = formData.rules.map(item => {
          if (formData.promotion_type === 'type_reduction') {
            return { full: Handle.handlePrice(item.full), reduction: Handle.handlePrice(item.reduction) };
          } else {
            return { full: Handle.handlePrice(item.full), discount: Handle.handleDiscount(item.discount) };
          }
        });

        this.$data.loading = true;
        Http.post(Api.activityScopeAdd, formData)
          .then(() => {
            this.$data.loading = false;
            this.$toast({ type: 'success', message: `全场营销活动新增成功` });
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
