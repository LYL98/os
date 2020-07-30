<template>
  <pg-form ref="form" item-width="260px">

    <pg-form-item label="审核类型" rules="required">
      <pg-button-group v-model="type" :options="{'通过': 'approve', '驳回': 'reject'}"></pg-button-group>
    </pg-form-item>
    <pg-form-item label="备注">
      <pg-textarea v-model="formData.remark" maxlength="50"></pg-textarea>
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
    name: 'promoter-withdraw-approve',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {

        type: 'approve',

        formData: {
          id: '',
          remark: ''
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
          const type = this.$data.type;

          this.$data.loading = true;
          Http.post(type === 'approve' ? Api.promoterWithdrawApprove : Api.promoterWithdrawReject, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: type === 'approve' ? '推广者提现审核通过' : '已拒绝该提现申请' });
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
