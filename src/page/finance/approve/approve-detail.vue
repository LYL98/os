<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">
    <div class="row">
      <div class="col-4">审核状态：{{ Constant.FINANCIAL_BALANCE_STATUS('enum')[item.status] }}</div>
      <div class="col-4">审核人：{{ item.checker_name }}</div>
      <div class="col-4">
        审核时间：{{ item.audit_time }}
      </div>
    </div>
    <div class="row">
        <div class="col-12">审核备注：{{ item.audit_remark || '-' }}</div>
    </div>
  </div>
</template>

<script>
import { Constant } from '@/util'
export default {
  name: 'approve-detail',
  inject: ['app'],
  props: {
    item: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  created() {
    this.Constant = Constant;
    const item = { ...this.$props.item }
    this.$props.item = item
  },
}
</script>

<style lang="scss" scoped>
</style>
