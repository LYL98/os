<template>
  <pg-form ref="form" item-width="260px">

    <pg-form-item rules="required" label="关闭原因" help-text="关闭退货单后用户将无法退货,请填写关闭原因">
      <pg-textarea v-model="formData.close_reason" maxlength="50" :placeholder="请输入关闭原因"></pg-textarea>
    </pg-form-item>
    
    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import { Http, Api } from '@/util';

  export default {
    name: 'return-close',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {

        formData: {
          id: '',
          close_reason: ''
        },
        loading: false,
      }
    },
    created() {
      this.$data.formData.id = this.$props.item.id;
    },

    methods: {

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};

          this.$data.loading = true;
          Http.post(Api.orderSaleBackClose, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: '退货单已关闭' });
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
