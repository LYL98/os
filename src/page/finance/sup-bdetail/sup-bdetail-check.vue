<template>
  <pg-form ref="form" item-width="260px">

    <pg-form-item label="审核类型" rules="required">
      <pg-button-group v-model="formData.audit_status" :options="{'审核通过': 'success', '作废': 'fail'}"></pg-button-group>
    </pg-form-item>
    <pg-form-item label="备注">
      <pg-textarea v-model="formData.remark" maxlength="200" placeholder="请输入备注..."></pg-textarea>
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
    name: 'approve-check',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        formData: {
          id: '',
          audit_status: 'success',
          remark: '',
        },
        
        loading: false,
      }
    },
    created() {
      this.Handle = Handle
      this.$data.formData.id = this.$props.item.id;
    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          let ids = []
          let item = this.$props.item
          if (Array.isArray(item)) {
            ids = Handle.returnListKeyList('id', item)
          } else {
            ids = [item.id]
          }

          const formData = {...this.$data.formData};

          this.$data.loading = true;
          Http.post(Api.financeSupBDetailAudit, {...formData, ids})
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: formData.audit_status === 'success' ? '供应商流水审核通过' : '已作废该供应商流水审核' });
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
