<template>
  <pg-form ref="form" item-width="260px">
    <pg-form-item rules="required" label="商户名称">
      <pg-input type="text" v-model="formData.title" disabled></pg-input>
    </pg-form-item>

    <pg-form-item label="账户余额" rules="required">
      <pg-input type="decimal" v-model="formData.balance" disabled suffix="元"></pg-input>
    </pg-form-item>

    <pg-form-item rules="required" label="类型">
      <pg-button-group
        style="width: 238px"
        v-model="formData.change_type"
        @change="changeQueryType"
        :options="{ '充值': '1', '扣款': '-1' }"
      ></pg-button-group>
    </pg-form-item>

    <pg-form-item :rules="{required: true}" label="充值类型" v-if="formData.change_type == '1'">
      <pg-select v-model="formData.opt_type" placeholder="请选择充值类型" searchable clearable>
        <pg-option
          v-for="item in Constant.FINANCIAL_BALANCE_RECHARGE_REASON()"
          :key="item.label"
          :value="item.value"
        >{{ item.label }}</pg-option>
      </pg-select>
    </pg-form-item>

    <pg-form-item
      label="金额"
      :rules="{'required': true,'decimal:2': true,'max_value:1000000': true}"
       v-if="formData.change_type == '1'"
    >
      <pg-input type="decimal" v-model="formData.amount" suffix="元"></pg-input>
    </pg-form-item>

    <pg-form-item
      label="金额"
      :rules="{'required': true,'logic:blur': deduct_amount_validator,'decimal:2': true,'max_value:1000000': true}"
       v-if="formData.change_type == '-1'"
    >
      <pg-input type="decimal" v-model="formData.amount" suffix="元"></pg-input>
    </pg-form-item>

    <pg-form-item label="备注">
      <pg-textarea v-model="formData.remark" style="height:200px;" maxlength="200" :placeholder="请输入备注"></pg-textarea>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">提交财务审核</pg-button>
    </div>

    <div class="mt-10 pl-50 text-secondary">* 充值/扣款提交后，需在财务审核模块中审核通过才能生效。</div>
  </pg-form>
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
      loading: false
    }
  },
  created() {
    this.Handle = Handle
    this.Constant = Constant
    const formData = { ...this.$data.formData }
    formData.id = this.$props.item.id
    formData.title = this.$props.item.title
    formData.balance = Handle.returnPrice(this.$props.item.balance)
    this.$data.formData = formData
    this.deduct_amount_validator = {
      validate: (v) => {
        let balance = this.formData.balance
        if (this.$data.formData.opt_type === 1) return true;
        return v <= Number(balance)
      },
      getMsg: '扣款金额不能超过账户余额',
    }
  },

  methods: {
    onSubmit() {
      this.$refs['form'].validateAll().then((valid) => {
        if (!valid) return

        let formData = { ...this.$data.formData }
        if (formData.change_type == '-1') {
          formData.opt_type = 'manual_deduct'
          formData.amount = -Handle.handlePrice(formData.amount)
        }else {
          formData.amount = Handle.handlePrice(formData.amount)
        }
        this.$data.loading = true
        Http.post(Api.financeBalanceEdit, formData)
          .then(() => {
            this.$data.loading = false
            this.$toast({
              type: 'success',
              message: `${
                formData.change_type == '1' ? '充值' : '扣款'
              }记录提交成功！等待财务审核...`,
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
    changeQueryType() {
      this.$data.formData.opt_type = ''
      this.$data.formData.amount = ''
    },
  },
}
</script>
