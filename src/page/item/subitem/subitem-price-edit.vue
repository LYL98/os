<template>
  <pg-form ref="form" item-width="303px" label-width="90px" class="py-20 d-flex flex-column align-items-center" style="border-bottom: 1px solid #DDD">
    <pg-form-item label="调价生效时间" rules="required">
      <pg-datepicker :quickable="false" :limit="{ from: today }" timeable v-model="formData.effect_time" :disabled="_type_ === 'modify'"/>
    </pg-form-item>
    <pg-form-item label="当前销售价">
      <pg-input suffix="元" disabled :value="current_price_sale"/>
    </pg-form-item>
    <pg-form-item label="新的销售价" rules="required|max_value:999999">
      <pg-input suffix="元" placeholder="请输入新的销售价" v-model="formData.price_sale" type="decimal"/>
    </pg-form-item>
    <pg-form-item label="当前利润分成">
      <pg-input suffix="元" disabled :value="current_price_divide"/>
    </pg-form-item>
    <pg-form-item label="新的利润分成" rules="required|max_value:999999">
      <pg-input suffix="元" placeholder="请输入新的利润分成" v-model="formData.price_divide" type="decimal"/>
    </pg-form-item>
    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'subitem-price-edit',
    props: {
      type: { type: String, default: 'add' },
      subitem: { type: Object, default() { return {} } }, // 对应的是 在售商品
      item: { type: Object, default() { return {} } }, // 对应的是 定价记录
    },
    data() {
      let today = new Date();
      today = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      return {
        today: today,
        formData: {
          effect_time: '',
          price_sale: '',
          price_divide: '', // 推广收益
        },
        loading: false,
      }
    },
    computed: {
      current_price_sale() {
        return Handle.returnPrice(this.$props.subitem.price_sale);
      },
      current_price_divide() {
        return Handle.returnPrice(this.$props.subitem.price_divide);
      }
    },
    created() {
      console.log('this.$props.subitem', this.$props.subitem);
      this._type_ = this.$props.type;
      if (this._type_ === 'modify') {
        const formData = { ...this.$props.item };
        formData.price_sale = Handle.returnPrice(formData.price_sale);
        formData.price_divide = Handle.returnPrice(formData.price_divide);
        this.$data.formData = formData;
      }
    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData, item_id: this.$props.subitem.id};
          formData.price_sale = Handle.handlePrice(formData.price_sale);
          formData.price_divide = Handle.handlePrice(formData.price_divide);

          this.$data.loading = true;
          Http.post(this._type_ === 'add' ? Api.subitemPriceAdd : Api.subitemPriceEdit, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `${this._type_ === 'add' ? '新增' : '修改'}定时调价成功` });
              this.$emit('submit');
            })
            .catch(() => {
              this.$data.loading = false;
            });

        });
      },
      onCancel() {
        this.$emit('cancel');
      }
    }
  }
</script>
