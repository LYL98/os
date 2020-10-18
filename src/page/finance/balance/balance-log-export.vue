<template>
  <pg-form ref="form" item-width="260px">
    <pg-form-item rules="required" label="当前区域">
      <pg-select
        v-model="formData.province_code"
        @change="changeProvince"
        style="width: 168px;"
      >
<!--        <pg-option value v-if="app.userInfo.opt_type === 'global'">全部</pg-option>-->
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{ item.title }}</pg-option>
      </pg-select>
    </pg-form-item>

    <pg-form-item rules="required" label="选择日期" help-text="注：选择查询日期">
      <pg-datepicker
        style="width: 450px;"
        v-model="formData"
        range
        quickable
        @change="changeQuery"
        beginDateKey="begin_date"
        endDateKey="end_date"
        clearable
      ></pg-datepicker>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button class="position-relative ml-20">
        预览
        <img
          style="width:100%;height:100%;left:0;top:0;opacity:0;"
          class="cursor-pointer position-absolute"
          src="./export_preview_balance_log.png"
          width="48"
          height="48"
          v-preview="export_preview_balance_log"
        />
      </pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">导出</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api, Constant, Handle } from '@/util'

export default {
  name: 'balance-log-export',
  inject: ['app'],
  props: {
    item: {
      type: Object,
      default() {
        return {}
      },
    },
    province_code: {type: String, default: ''}
  },
  data() {
    return {
      formData: {
        province_code: this.$props.province_code || this.app.userInfo.province_code,
        begin_date: '',
        end_date: '',
      },
      loading: false,
      provinceListAuth: [],
    }
  },
  created() {
    this.Handle = Handle
    this.Constant = Constant
    this.commonProvinceListAuth()
  },

  methods: {
    onSubmit() {
      this.$refs['form'].validateAll().then((valid) => {
        if (!valid) return
        let formData = { ...this.$data.formData }
        this.$loading.show()
        Http.get(Api.financeBalanceMerchantLogExportCheck, formData)
          .then(() => {
            return Http.download(
              Api.financeBalanceMerchantLogExport,
              formData,
              {
                filename: '商户流水列表.xls',
              }
            )
          })
          .then(() => {
            this.$loading.hide()
          })
          .catch(() => {
            this.$loading.hide()
          })
      })
    },
    onCancel() {
      this.$emit('cancel')
    },

    commonProvinceListAuth() {
      Http.get(Api.commonProvinceListAuth).then((res) => {
        this.$data.provinceListAuth = res.data || []
      })
    },
  },
}
</script>
