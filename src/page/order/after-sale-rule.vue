<template>
  <pg-form item-width="250px" ref="form">

    <pg-editor v-model="formData.text" @created="commonAftersaleRule"></pg-editor>

    <div class="row no-gutters mt-30">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

  import { Http, Api } from '@/util';

  export default {
    name: 'after-sale-rule',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        formData: {
          text: '' // 售后规则
        },

        loading: false,
      }
    },

    created() {
    },
    methods: {

      onSubmit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          const formData = {...this.$data.formData};

          this.$data.loading = true;
          Http.post(Api.orderAfterSaleRule, formData)
            .then(() => {
              this.$toast({ type: 'success', message: `售后规则修改成功` });
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

      commonAftersaleRule() {
        Http.get(Api.commonAftersaleRule)
          .then(res => {
            this.$data.formData.text = res.data || '';
          });
      },

    }
  }
</script>
