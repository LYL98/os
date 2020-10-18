<template>
  <pg-form ref="form" item-width="260px">

    <pg-form-item label="审核类型" rules="required">
      <pg-button-group v-model="formData.status" :options="{'审核通过': 'checked', '驳回': 'declined'}"></pg-button-group>
    </pg-form-item>
    <pg-form-item label="备注">
      <pg-textarea v-model="formData.audit_remark" style="height:200px;" maxlength="200" placeholder="请输入备注..."></pg-textarea>
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
    name: 'approve-check',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        formData: {
          id: '',
          status: 'checked',
          audit_remark: ''
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
          Http.post(Api.financeBalanceCheckEdit, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: formData.status === 'checked' ? '财务审核通过' : '已驳回该申请记录' });
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
