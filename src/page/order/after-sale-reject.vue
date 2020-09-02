<template>
  <pg-form item-width="250px" ref="form">

    <pg-form-item label="备注">
      <pg-textarea placeholder="请输入备注..." auto-focus v-model="formData.reason"></pg-textarea>
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

  import { Http, Api } from '@/util';

  export default {
    name: 'after-sale-increase-refuse',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        formData: {
          id: '',
          reason: ''
        },

        loading: false,
      }
    },

    created() {
      const {id} = this.$props.item;
      this.$data.formData.id = id;
    },
    methods: {

      onSubmit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          const formData = {...this.$data.formData};

          formData.id = Number(formData.id);

          this.$data.loading = true;
          Http.post(Api.orderAfterSaleReject, formData)
            .then(() => {
              this.$toast({ type: 'success', message: `售后单已拒绝` });
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
