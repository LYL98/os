<template>
  <pg-form ref="form" item-width="260px">
    <pg-form-item rules="required" label="备注" help-text="备注内容会在售后单内记录，不会显示给客户">
      <pg-textarea style="height:220px;" v-model="formData.content" maxlength="200" placeholder="请输入备注......"></pg-textarea>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api } from '@/util'

export default {
  name: 'after-sale-remark',
  inject: ['app'],
  props: {
    item: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      formData: {
        id: '',
        content: '',
      },
      loading: false,
      operatorList: [],
    }
  },
  created() {
    this.$data.formData.id = this.$props.item.id
  },

  methods: {
    
    onSubmit() {
      this.$refs['form'].validateAll().then((valid) => {
        if (!valid) return

        const formData = { ...this.$data.formData }
        formData.aftersale_id = this.$props.item.id;

        this.$data.loading = true
        Http.post(Api.orderAftersaleAddLog, formData)
          .then(() => {
            this.$data.loading = false
            this.$toast({ type: 'success', message: '备注成功' })
            this.$emit('submit')
            this.$emit('orderAftersaleDetail')
          })
          .catch(() => {
            this.$data.loading = false
          })
      })
    },
    onCancel() {
      this.$emit('cancel')
    },
  },
}
</script>
