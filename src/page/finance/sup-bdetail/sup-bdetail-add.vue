<template>
  <pg-form ref="form" item-width="260px" label-width="80px">
    <pg-form-item label="供应商类型" rules="required">
      <pg-button-group
        @change="changeType"
        v-model="formData.custom_type"
        :options="{ 商城: 'B', 零售: 'C' }"
      ></pg-button-group>
    </pg-form-item>

    <pg-form-item rules="required" label="选择供应商">
      <pg-select
        v-model="formData.supplier_id"
        placeholder="供应商"
        searchable
        clearable
        @change="changeSupplier"
      >
        <pg-option
          v-for="item in supplierList"
          :key="item.id"
          :value="item.id"
          >{{ item.title }}</pg-option
        >
      </pg-select>
    </pg-form-item>

    <pg-form-item rules="required"  label="选择仓">
      <pg-select
        v-model="formData.storehouse_id"
        style="width: 168px"
        placeholder="仓"
        searchable
        clearable
      >
      <!-- :disabled="!formData.supplier_id || supplierType === 'local_pur'" -->
        <pg-option
          v-for="item in storehouseList"
          :key="item.id"
          :value="item.id"
          >{{ item.title }}</pg-option
        >
      </pg-select>
    </pg-form-item>
    <pg-form-item label="操作类型" rules="required">
      <pg-button-group
        v-model="formData.type"
        @change="changeOptType"
        :options="{ 充值: 'top_up', 扣款: 'withhold' }"
      ></pg-button-group>
    </pg-form-item>
    <pg-form-item label="流水类型">
      <pg-select
        v-model="formData.bill_reason"
        style="width: 168px"
        placeholder="流水类型"
        searchable
        clearable
      >
        <pg-option
          v-for="item in billReasonList"
          :key="item.value"
          :value="item.value"
          >{{ item.label }}</pg-option
        >
      </pg-select>
    </pg-form-item>
    <pg-form-item
      :rules="{ required: true, 'min_value:0.01': true }"
      label="金额"
    >
      <pg-input type="decimal" v-model="formData.bill_amount" suffix="元"></pg-input>
    </pg-form-item>
    
    <pg-form-item label="备注">
      <pg-textarea
        v-model="formData.remark"
        maxlength="200"
        placeholder="请输入备注..."
      ></pg-textarea>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button
        color="primary"
        class="ml-20"
        @click="onSubmit"
        :loading="loading"
        >确定</pg-button
      >
    </div>
  </pg-form>
</template>

<script>
import { Http, Api, Constant, Handle } from '@/util'

export default {
  name: 'sup-detail-add',
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
        supplier: {},
        creator: {},
        auditor: {},
        supplier_id: '',
        type: 'top_up', //充值top_up、扣款withhold
        bill_reason: 'other', //其它other、货损item_damage
        bill_amount: '',
        remark: '',
        custom_type: 'B',
        more_custom_type: 'A,B',
        storehouse_id: '',
      },
      loading: false,
      storehouseList: [],
      supplierList: [],
      supplierType: '',
      billReasonList: []
    }
  },
  created() {
    this.Constant = Constant
    this.Handle = Handle
    this.$data.billReasonList = Constant.FINANCIAL_SUP_BDETAIL_ADD_BILLREASON().filter(item=>{
      return item.value == 'other'
    })
    this.commonStorehouseList()
    this.commonSupplierList()
  },

  methods: {
    changeOptType(val) {
      let formData = {...this.$data.formData};
      formData.bill_reason = 'other'
      if(val == 'top_up') {
        this.$data.billReasonList = Constant.FINANCIAL_SUP_BDETAIL_ADD_BILLREASON().filter(item=>{
          return item.value == 'other'
        })
      }else {
        this.$data.billReasonList = Constant.FINANCIAL_SUP_BDETAIL_ADD_BILLREASON()
      }
    },
    changeType(val){
      let formData = {...this.$data.formData};
      if(val == 'B') {
        formData.more_custom_type = 'A,B'
      }else {
        formData.more_custom_type = 'A,C'
      }
      formData.supplier_id = ''
      formData.more_custom_type = val
      formData.storehouse_id = ''
      this.$data.formData = formData
    },
    changeSupplier() {
      // this.$data.supplierType = v.supplier_type
      // if(v.province_code === 'nationwide'){
      //     this.commonStorehouseList()
      // }else{
      //   this.commonStorehouseList(v.province_code)
      // }
    },
    onSubmit() {
      this.$refs['form'].validateAll().then((valid) => {
        if (!valid) return
        const formData = { ...this.$data.formData }
        if(formData.type == 'withhold') {
          formData.bill_amount = Handle.handlePrice(-formData.bill_amount)
        }else {
          formData.bill_amount = Handle.handlePrice(formData.bill_amount)
        }
        formData.supplier_id = Number(formData.supplier_id)
        this.$data.loading = true
        Http.post(Api.financeSupBDetailAdd, { ...formData })
          .then(() => {
            this.$data.loading = false
            this.$emit('submit')
            this.$toast({
              type: 'success',
              message: '新增成功',
            })
          })
          .catch(() => {
            this.$data.loading = false
          })
      })
    },
    commonStorehouseList() {
      Http.get(Api.commonStorehouseList, {
          need_num: 200,
          // province_code: province_code
        }).then((res) => {
        this.$data.storehouseList = res.data || []
        // console.log(res.data[0].id)
        // this.$data.formData.storehouse_id = res.data[0].id
        // console.log(this.$data.formData)
      })
    },
    commonSupplierList() {
      Http.get(Api.commonSupplierList).then((res) => {
        this.$data.supplierList = res.data || []
      })
    },
    onCancel() {
      this.$emit('cancel')
    },
  },
}
</script>
