<template>
  <pg-form item-width="250px" label-width="90px" ref="form">

    <pg-form-item label="调整方式" rules="required">
      <pg-button-group :options="{ '增加': 1, '减少': 0 }" v-model="formData.opt_type" @change="changeOptType"></pg-button-group>
    </pg-form-item>

    <pg-form-item
      label="活动库存变动"
      :rules="{required: true,
      'min_value:1': true, logic: custom_stock_validator}"
      :help-text="`商品可用库存${formData.stock + item.left_stock}件，活动剩余库存${item.left_stock}件`"
    >
      <pg-input placeholder="请输入调整数量" type="number" v-model="formData.num" suffix="件"></pg-input>
    </pg-form-item>

    <div class="row no-gutters">
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
      const {act_id, item_id, stock} = this.$props.item;
      this.$data.formData = {
        act_id,
        item_id,
        opt_type: 1,
        stock,
        num: ''
      };

      this.custom_stock_validator = {
        validate: (v) => {
          if (this.$data.formData.opt_type === 0) {
            return v <= this.$props.item.left_stock;
          } else {
            return v <= this.$data.formData.stock + this.$props.item.left_stock;
          }
        },
        getMsg: () => {
          if (this.$data.formData.opt_type === 0) {
            return '活动库存减少数量不能大于活动剩余库存';
          } else {
            return '活动库存增加数量不能大于商品可用库存';
          }

        }
      };

    },
    methods: {

      changeOptType() {
        if (!this.$data.formData.num) return;
        this.$refs['form']?.validate('活动库存变动');
      },

      onSubmit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          const formData = {...this.$data.formData};

          formData.num = Number(formData.num);

          this.$data.loading = true;
          Http.post(Api.activitySeckillItemModifyStock, formData)
            .then(() => {
              this.$toast({ type: 'success', message: `商品库存调整成功` });
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
