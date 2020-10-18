<template>
  <div class="pg-page">
    <div class="p-20">
      <div class="d-flex mt-10">
        <pg-select v-model="query.province_code" @change="changeProvince" style="width: 168px;" placeholder="请选择区域" clearable>
          <pg-option
            v-for="item in provinceListAuth"
            :key="item.code"
            :value="item.code"
          >{{ item.title }}</pg-option>
        </pg-select>

        <pg-search
          class="ml-20"
          clearable
          placeholder="商户名称"
          v-model="query.title"
          @change="changeQuery"
        />
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
        <div
          class="ml-auto"
          v-if="app.auth.isAdmin || app.auth.FinanceBalanceExport || app.auth.FinanceBalanceMerchantLogExport || app.auth.FinanceBalanceMerchantLog"
        >
          <pg-button @click="handleBalanceExport" v-if="app.auth.isAdmin || app.auth.FinanceBalanceExport">导出商户余额列表</pg-button>
          <pg-button
            class="ml-20"
            @click="handleBalanceMerchantLogExport"
            v-if="app.auth.isAdmin || app.auth.FinanceBalanceMerchantLogExport"
          >导出商户流水列表</pg-button>
          <pg-button
            class="ml-20 primary"
            @click="handleMerchantLog"
            v-if="app.auth.isAdmin || app.auth.FinanceBalanceMerchantLog"
          >商户流水变动记录</pg-button>
        </div>
      </div>

      <div class="card mt-10">
        <div class="card-body">
          <pg-table
            fixed-header
            :data="list.items"
            primary-key="id"
            :page="query.page"
            :page-size="query.page_size"
            borderless
          >
            <pg-column title="商户名称" width="180px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.title }}
                </div>
              </template>
            </pg-column>
            <pg-column title="账户余额" width="180px" text-align="center">
              <template v-slot="{row}">
                <span v-if="!!row.balance">{{`¥${Handle.returnPrice(row.balance)}`}}</span>
                <span v-else>0</span>
              </template>
            </pg-column>
            <pg-column title="操作" width="200px">
              <template v-slot="{row}">
                <a class="text-decoration-none" v-if="app.auth.isAdmin || app.auth.FinanceBalanceEdit" @click="handleItemEdit(row)">充值/扣款</a>
                <a class="text-decoration-none ml-20" v-if="app.auth.isAdmin || app.auth.FinanceBalanceApproveLog" @click="handleApproveLog(row)">充值/扣款记录</a>
                <a class="text-decoration-none ml-20" v-if="app.auth.isAdmin || app.auth.FinanceBalanceLog" @click="handleBalanceLog(row)">账户流水记录</a>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination :num="list.num" v-model="query" @change="financeBalanceQuery" />
        </div>
      </div>
    </div>

    <pg-drawer v-model="drawer.visible" width="900px" v-if="drawer.type=='approve'">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">{{drawer.item.title || ''}} 充值/扣款记录</h3>
        </div>
      </template>
      <balance-check v-if="drawer.visible" :item="drawer.item" />
    </pg-drawer>

    <pg-drawer v-model="drawer.visible" width="900px" v-if="drawer.type=='balance'">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">{{drawer.item.title || ''}} 账户流水记录</h3>
        </div>
      </template>
      <balance-turnover v-if="drawer.visible" :item="drawer.item" />
    </pg-drawer>

    <pg-drawer v-model="drawer.visible" width="900px" v-if="drawer.type=='merchant-log'">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">{{drawer.item.code || ''}} 商户流水变动记录</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${Constant.ORDER_USER_STATUS('color')[drawer.item.status]} badge-outline ml-20`"
          >{{ Constant.ORDER_USER_STATUS('enum')[drawer.item.status] || drawer.item.status || '-' }}</div>
        </div>
      </template>
      <balance-merchant-log v-if="drawer.visible" :item="drawer.item" />
    </pg-drawer>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'edit'" title="充值/扣款">
      <balance-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'export'" title="导出商户流水列表" width="600px">
      <balance-log-export
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        :province_code="query.province_code"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>
  </div>
</template>
<script>
import { Http, Api, Handle, Constant } from '@/util'
import balanceEdit from './balance-edit'
import balanceCheck from './balance-check'
import balanceTurnover from './balance-turnover'
import balanceLogExport from './balance-log-export'
import balanceMerchantLog from './balance-merchant-log'
export default {
  name: 'balance',
  inject: ['app'],
  components:{ balanceEdit, balanceCheck, balanceTurnover, balanceLogExport, balanceMerchantLog },
  data() {
    return {
      query: {},
      list: {
        items: [],
      },
      drawer: {
        visible: false,
        type: 'approve',
        item: {},
      },
      dialog: {
        visible: false,
        item: {},
      },
      provinceListAuth: [],
    }
  },
  created() {
    this.Handle = Handle
    this.Constant = Constant
    document.title = '客户财务管理 - 商城 - 蒲公英运营管理系统'
    this.initQuery()
    this.financeBalanceQuery()
    this.commonProvinceListAuth()
  },

  methods: {
    initQuery() {
      this.$data.query = {
        province_code: '',
        title: '',
        begin_date: '',
        end_date: '',
        page: 1,
        page_size: 20,
      }
    },

    changeProvince() {
      this.$data.query.zone_id = ''
      this.$data.query.city_id = ''
      this.changeQuery()
    },

    changeQuery() {
      this.$data.query.page = 1
      this.financeBalanceQuery()
    },

    resetQuery() {
      this.initQuery()
      this.financeBalanceQuery()
    },

    financeBalanceQuery() {
      Http.get(Api.financeBalanceQuery, this.$data.query).then((res) => {
        this.$data.list = res.data || { items: [] }
      })
    },

    handleItemEdit(item) {
        this.$data.dialog = { visible: true, type: 'edit', item: item }
    },

    handleApproveLog(item) {
        this.$data.drawer = { visible: true, type: 'approve', item: item }
    },

    handleBalanceLog(item) {
        this.$data.drawer = { visible: true, type: 'balance', item: item }
    },

    handleSubmit() {
      this.handleCancel()
      this.financeBalanceQuery()
    },

    handleCancel() {
      this.$data.dialog = { visible: false,type: 'export', item: {} }
    },

    handleBalanceExport() {
      this.$loading.show()
      Http.get(Api.financeBalanceExportCheck, {
          province_code: this.$data.query.province_code,
          title: this.$data.query.title
        })
        .then(() => {
          return Http.download(Api.financeBalanceExport, this.$data.query, {
            filename: '商户余额列表.xls',
          })
        })
        .then(() => {
          this.$loading.hide()
        })
        .catch(() => {
          this.$loading.hide()
        })
    },

    handleBalanceMerchantLogExport() {
      this.$data.dialog = { visible: true, type: 'export', item: {} }
    },

    handleMerchantLog() {
      this.$data.drawer = { visible: true, type: 'merchant-log', item: {} }
    },

    commonProvinceListAuth() {
      Http.get(Api.commonProvinceListAuth).then((res) => {
        this.$data.provinceListAuth = res.data || []
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.status-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
</style>
