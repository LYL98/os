<template>
  <pg-form ref="form" item-width="260px">
    <pg-form-item
      :rules="`required|min_value:0.01|max_value:${Handle.returnPrice(maxPrice.price)}|decimal:2`"
      label="退款金额"
      :help-text="`最多可退款金额：${Handle.returnPrice(maxPrice.price)} 元`"
    >
      <pg-input
        v-model="formData.handle_second_refund_amount"
        type="decimal"
        suffix="元"
        placeholder="请输入退款金额"
      ></pg-input>
    </pg-form-item>

    <pg-form-item rules="required" label="处理描述">
      <pg-textarea v-model="formData.handle_second_remark" style="height:80px" maxlength="50" :placeholder="请输入处理描述"></pg-textarea>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api, Handle } from '@/util'

export default {
  name: 'after-sale-second-handle',
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
        handle_second_refund_amount: '',
        handle_second_remark: ''
      },
      loading: false,
      operatorList: [],
      maxPrice: {
        price: '',
      },
    }
  },
  created() {
    this.$data.formData.id = this.$props.item.id
    this.Handle = Handle
    this.initMaxRefund()
  },

  methods: {

    initMaxRefund() {
      let item = { ...this.$props.item }
      if (item.opt_type === 'num_short') {
        //处理类型为缺货时
        this.$data.maxPrice.price = item.max_refund_amount_when_refund
      } else {
        //处理类型除了缺货的情况外的处理
        this.$data.maxPrice.price = item.max_refund_amount
      }
    },
    
    onSubmit() {
      this.$refs['form'].validateAll().then((valid) => {
        if (!valid) return

        const formData = { ...this.$data.formData }
        formData.handle_second_refund_amount = Handle.handlePrice(formData.handle_second_refund_amount);

        this.$data.loading = true
        Http.post(Api.orderAftersaleHandleSecondTime, formData)
          .then(() => {
            this.$data.loading = false
            this.$toast({ type: 'success', message: '二次处理成功' })
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
