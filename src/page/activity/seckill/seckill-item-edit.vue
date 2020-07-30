<template>
  <pg-form item-width="250px" label-width="80px" ref="form" key="subitem" :disabled="type === 'detail'">

    <pg-form-item label="活动价" rules="required">
      <pg-input placeholder="请输入活动价" type="decimal" v-model="formData.act_price" suffix="元"></pg-input>
    </pg-form-item>

    <pg-form-item label="返利金额" rules="required">
      <pg-input placeholder="请输入返利金额" type="decimal" v-model="formData.cash_back" suffix="元"></pg-input>
    </pg-form-item>

    <pg-form-item label="活动库存" :rules="{required: true, 'min_value:1': true, logic: custom_stock_validator}" :help-text="`商品可用库存${formData.stock + item.left_stock}件`">
      <pg-input placeholder="请输入活动库存" type="number" v-model="formData.act_stock" suffix="件" @change="changeActStock"></pg-input>
    </pg-form-item>

    <pg-form-item label="客户限购数" :rules="{ logic: custom_limit_validator }">
      <pg-input placeholder="请输入客户限购数" type="number" v-model="formData.purchase_limit" suffix="件/人"></pg-input>
    </pg-form-item>

    <div class="row no-gutters" v-if="type !== 'detail'">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'seckill-item-stock',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        formData: {
        },

        loading: false,
      }
    },


    created() {
      this.Handle = Handle;
      const {act_id, item_id, act_price, cash_back, stock, act_stock, purchase_limit} = this.$props.item;
      this.$data.formData = {
        act_id,
        item_id,
        act_price: Handle.returnPrice(act_price),
        cash_back: Handle.returnPrice(cash_back),
        stock,
        act_stock,
        purchase_limit
      };

      // 商品可用库存 = 商品库库存 + 活动剩余库存
      this.custom_stock_validator = {
        validate: (v) => {
          return v <= this.$data.formData.stock + this.$props.item.left_stock;
        },
        getMsg: '活动库存不能大于商品可用库存'
      };

      this.custom_limit_validator = {
        validate: (v) => {
          if (!this.$data.formData.act_stock) return true;
          return v <= Number(this.$data.formData.act_stock);
        },
        getMsg: '客户限购数不能大于活动库存'
      };

    },
    methods: {

      changeActStock() {
        if (!this.$data.formData.purchase_limit) return;
        this.$refs['form']?.validate('客户限购数');
      },

      onSubmit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          const formData = {...this.$data.formData};

          formData.act_price = Handle.handlePrice(formData.act_price);
          formData.cash_back = Handle.handlePrice(formData.cash_back);
          formData.act_stock = Number(formData.act_stock);
          formData.purchase_limit = Number(formData.purchase_limit);

          this.$data.loading = true;
          Http.post(Api.activitySeckillItemModify, formData)
            .then(() => {
              this.$toast({ type: 'success', message: `商品调整成功` });
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
