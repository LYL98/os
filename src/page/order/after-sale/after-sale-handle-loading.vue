<template>
  <pg-form ref="form" item-width="260px">

    <pg-form-item rules="required" label="处理进度">
      <pg-select
        class="ml-20"
        v-model="formData.handle_loading"
        placeholder="按售后进度筛选"
        searchable
        clearable
        @change="changeQuery"
      >
        <pg-option
          v-for="item in Constant.AFTER_SALE_HANDLE_LOADING()"
          :key="item.value"
          :value="item.value"
        >{{ item.label }}</pg-option>
      </pg-select>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api, Constant } from '@/util'

export default {
  name: 'after-sale-handle-loading',
  inject: ['app','listQuery'],
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
        handle_loading: '',
        id: ''
      },
      loading: false,
      operatorList: [],
    }
  },
  created() {
    this.Constant = Constant
    this.$data.formData.id = this.$props.item.id
  },

  methods: {

    onSubmit() {
      this.$refs['form'].validateAll().then((valid) => {
        if (!valid) return

        const formData = { ...this.$data.formData }
        formData.operator_id = this.app.$data.userInfo.id;

        this.$data.loading = true
        Http.post(Api.orderAftersaleHandleLoading, formData)
          .then(() => {
            this.$data.loading = false
            this.$toast({ type: 'success', message: '处理进度更新成功' })
            this.$emit('submit')
            this.listQuery.orderAftersaleQuery();
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
