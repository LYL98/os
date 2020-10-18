<template>
  <div>
    <div class="row">
      <div class="col-12">
        审核状态：
        <span v-if="item.status">{{ Constant.FINANCIAL_BALANCE_STATUS('enum')[item.status] }}</span>
        <span v-else>-</span>
      </div>
    </div>

    <div class="row mt-10">
      <div class="col-12">
        审核人：
        <span v-if="item.checker_name">{{item.checker_name}}</span>
        <span v-else>-</span>
      </div>
    </div>

    <div class="row mt-10">
      <div class="col-12">
        审核时间：
        <span v-if="item.updated">{{item.updated}}</span>
        <span v-else>-</span>
      </div>
    </div>

    <div class="row mt-10">
      <div class="col-12">
        审核备注：
        <span v-if="item.audit_remark">{{ item.audit_remark }}</span>
        <span v-else>-</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Http, Api, Constant, Handle } from '@/util'

export default {
  name: 'balance-edit',
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
        title: '',
        balance: '',
        change_type: '1',
        amount: '',
        opt_type: '',
        remark: '',
      },
      loading: false,
    }
  },
  created() {
    this.Handle = Handle
    this.Constant = Constant
    const formData = { ...this.$data.formData }
    formData.id = this.$props.item.id
    formData.title = this.$props.item.title
    formData.balance = this.$props.item.balance
    this.$data.formData = formData
  },

  methods: {
    onSubmit() {
      this.$refs['form'].validateAll().then((valid) => {
        if (!valid) return

        let formData = { ...this.$data.formData }
        formData.amount = Handle.handlePrice(Number(formData.amount))
        this.$data.loading = true
        Http.post(Api.financeBalanceEdit, formData)
          .then(() => {
            this.$data.loading = false
            this.$toast({
              type: 'success',
              message: '充值记录提交成功！等待财务审核...',
            })
            this.$emit('submit')
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
