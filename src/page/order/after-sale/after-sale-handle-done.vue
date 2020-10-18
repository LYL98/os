<template>
  <pg-form ref="form" item-width="250px">
    <div class="row" style="width:300px;">
      <pg-form-item rules="required" label="处理类型">
        <pg-select
          v-model="formData.opt_type"
          placeholder="按处理类型筛选"
          searchable
          clearable
          @change="changeOptType"
        >
          <pg-option
            v-for="item in Constant.AFTER_SALE_OPT_TYPE()"
            :key="item.value"
            :value="item.value"
          >{{ item.label }}</pg-option>
        </pg-select>
      </pg-form-item>
      <pg-form-item rules="required" label="处理方式">
        <pg-select
          v-model="formData.handle_way"
          placeholder="按处理方式筛选"
          searchable
          clearable
          :disabled='formData.opt_type === ""'
          @change="changeHandleWay"
        >
          <pg-option
            v-for="item in Constant.AFTER_SALE_HANDLE_WAY()"
            :key="item.value"
            :value="item.value"
          >{{ item.label }}</pg-option>
        </pg-select>
      </pg-form-item>
      <!-- 仅退款 其他-->
      <pg-form-item
        :rules="{required: true,'min_value:1': true, [`logic:${item.count_real}`]: num_validator }"
        v-if="formData.handle_way == 'only_refund' || formData.handle_way == 'other'"
        label="处理件数"
      >
        <pg-input v-model="formData.num" type="number" suffix="件"></pg-input>
      </pg-form-item>

      <!-- 退货退款 仅退货-->
      <pg-form-item
        :rules="{required: true,'min_value:1': true, [`logic:${item.count_real}`]: num_validator }"
        v-if="formData.handle_way == 'only_goods' || formData.handle_way == 'refund_goods'"
        label="退货件数"
      >
        <pg-input v-model="formData.num" type="number" suffix="件" @change="changeRefundPrice"></pg-input>
      </pg-form-item>

      <pg-form-item
        :rules="{required: true, 'min_value:0.01': true,[`logic:${item.max_refund_amount_when_refund}`]: refund_validator}"
        label="退款金额"
        v-if="formData.handle_way === 'only_refund'"
        :help-text="`最多可退款金额：${Handle.returnPrice(maxPrice.price)} 元`"
      >
        <pg-input type="decimal" v-model="formData.refund" suffix="元"></pg-input>
      </pg-form-item>

      <pg-form-item
        :rules="{required: true, 'min_value:0.01': true,[`logic:${item.max_refund_amount_when_refund}`]: refund_validator}"
        label="退货金额"
        v-if="formData.handle_way === 'refund_goods'"
        :help-text="`最多可退货金额：${Handle.returnPrice(maxPrice.price)} 元`"
      >
        <pg-input type="decimal" v-model="formData.refund" suffix="元"></pg-input>
      </pg-form-item>

      <pg-form-item
        label="退货描述"
        v-model="refund"
        v-if="formData.handle_way === 'only_goods' || formData.handle_way === 'refund_goods'"
      >
        <pg-textarea v-model="formData.opt_detail" maxlength="200" style="height:120px;" :placeholder="请输入关闭原因"></pg-textarea>
      </pg-form-item>

      <pg-form-item label="处理描述" v-model="refund" v-else>
        <pg-textarea v-model="formData.opt_detail" maxlength="200" style="height:120px;" :placeholder="请输入关闭原因"></pg-textarea>
      </pg-form-item>
    </div>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api, Constant, Handle } from '@/util'

export default {
  name: 'after-sale-handle-done',
  inject: ['app','listQuery'],
  props: {
    item: {
      type: Object,
      default() {
        return {}
      },
    },
    orderAftersaleDetail: Function,
  },
  data() {
    return {
      formData: {
        handle_way: '',
        opt_detail: '',
        opt_type: '',
        refund: '',
        num: '',
      },
      loading: false,
      operatorList: [],
      maxPrice: {
        price: '',
      },
    }
  },
  created() {
    this.Constant = Constant
    this.Handle = Handle
    this.$data.formData.id = this.$props.item.id
    this.$data.max_refund_amount_when_refund = this.$props.item.max_refund_amount_when_refund
    let num_message = `件数不能大于${this.$props.item.count_real}件`;
    
    
    this.num_validator = {
      validate: (v, n) => {
        let num = Number(n[0])
        return v <= num
      },
      getMsg: num_message,
    }
    
  },

  methods: {
    // 选择不同的处理方式和处理类型,输入件数时,自动计算的显示的退款金额
    changeRefundPrice(){
      //先判断是否是退货
      let { formData } = this
      if(formData.opt_type === 'num_short' ){
         let n = this.$data.formData.num || 1
         this.$data.formData.refund = this.$props.item.count_real == 0 ? '' : Handle.returnPrice(this.$props.item.max_refund_amount_when_refund / this.$props.item.count_real * n)
      }else{
        let r = this.$props.item.final_price
        let n = this.$data.formData.num || 1
        this.$data.formData.refund = Handle.returnPrice(r * n)
      }

    },
    //当选择处理类型为缺货时 或者其他类型时,显示的最大退款金额和默认退款金额
    changeOptType(v) {
      let formData = { ...this.$data.formData }
      let item = { ...this.$props.item }
      if (v === 'num_short') {
        //处理类型为缺货时
        this.$data.maxPrice.price = item.max_refund_amount_when_refund
        //缺货情况下的默认退款
        if (formData.handle_way === 'only_refund') {
          formData.refund = item.default_only_refund + item.final_delivery_price
        } else if (formData.handle_way === 'refund_goods') {
          let n = formData.num || 1
          //如果 count_real = 0
          formData.refund =
            item.count_real == 0
              ? ''
              : (item.max_refund_amount_when_refund / item.count_real) * n
        }
      } else {
        //处理类型除了缺货的情况外的处理
        let n = formData.num || 1
        this.$data.maxPrice.price = item.max_refund_amount

        if (formData.handle_way === 'only_refund') {
          formData.refund = item.default_only_refund
        } else if (formData.handle_way === 'refund_goods') {
          formData.refund = item.final_price * n
        }
        // let r = item.final_price
        // let n = formData.num || 1
        // formData.refund = r * n
        // this.$data.maxPrice.price = item.max_refund_amount;
      }
      formData.refund = Handle.returnPrice(formData.refund)
      this.$data.formData = formData
    },
    //选择不同处理方式,显示的默认可处理金额
    changeHandleWay(v) {
      //先判断是否是缺货
      let formData = { ...this.$data.formData }
      let item = { ...this.$props.item }
      let refund_message = `${formData.handle_way === 'only_refund' ? '退款金额' : '退货金额'}不能大于最多可${formData.handle_way === 'only_refund' ? '退款金额' : '退货金额'}`;
      this.refund_validator = {
        validate: (v, n) => {
          let num = Number(n[0]/100)
          return v <= num
        },
        getMsg: refund_message,
      }
      if (formData.opt_type === 'num_short') {
        //缺货情况下的仅退款 和 退货退款的默认金额不一样
        if (v === 'refund_goods') {
          let n = formData.num || 1
          formData.refund =
            item.count_real == 0
              ? ''
              : (item.max_refund_amount_when_refund / item.count_real) * n
        } else if (v === 'only_refund') {
          formData.refund = item.default_only_refund + item.final_delivery_price
        }
      } else {
        if (v === 'only_refund') {
          formData.refund = item.default_only_refund
        } else if (v === 'refund_goods') {
          let n = formData.num || 1
          formData.refund = item.final_price * n
        }
      }
      formData.refund = Handle.returnPrice(formData.refund)
      this.$data.formData = formData
    },
    onSubmit() {
      this.$refs['form'].validateAll().then((valid) => {
        if (!valid) return

        const formData = { ...this.$data.formData }
        formData.aftersale_id = this.$props.item.id
        formData.refund = Handle.handlePrice(formData.refund)
        formData.num = Number(formData.num);

        this.$data.loading = true
        Http.post(Api.orderAfterSaleUpdate, formData)
          .then(() => {
            this.$data.loading = false
            this.$toast({ type: 'success', message: '处理完成' })
            this.$emit('submit')
            // this.$emit('orderAftersaleDetail');
            this.listQuery.orderAftersaleQuery();
            this.orderAftersaleDetail && this.orderAftersaleDetail();
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
