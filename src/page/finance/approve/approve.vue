<template>
  <div class="pg-page">
    <div class="p-20">
      <div class="d-flex mt-10">
        <pg-datepicker
          style="width: 450px"
          v-model="query"
          range
          quickable
          @change="changeQuery"
          clearable
          beginDateKey="begin_date"
          endDateKey="end_date"
          placeholder="提交时间"
        ></pg-datepicker>
        <pg-select
          class="ml-20"
          v-model="query.opt_type"
          placeholder="类型"
          searchable
          clearable
          @change="changeQuery"
        >
          <pg-option
            v-for="item in Constant.FINANCIAL_BALANCE_CHANGE_TYPE()"
            :key="item.value"
            :value="item.value"
            >{{ item.label }}</pg-option
          >
        </pg-select>
      </div>
      <div class="d-flex mt-10">
        <pg-select
          v-model="query.province_code"
          @change="changeProvince"
          style="width: 168px"
          placeholder="请选择区域"
          clearable
        >
          
          <pg-option
            v-for="item in provinceListAuth"
            :key="item.code"
            :value="item.code"
            >{{ item.title }}</pg-option
          >
        </pg-select>
        <pg-search
          class="ml-20"
          style="width: 262px"
          clearable
          placeholder="提交人、审核人名称"
          v-model="query.operator_name"
          @change="changeQuery"
        />
        <pg-search
          class="ml-20"
          clearable
          placeholder="商户名称"
          v-model="query.merchant_title"
          @change="changeQuery"
        />
        <pg-button class="ml-10" flat @click="resetQuery"
          >重置筛选条件</pg-button
        >
      </div>

      <div class="card mt-10">
        <div class="card-header font-weight-bolder position-relative">
          <pg-tabs v-model="query.status" @change="changeQuery">
            <pg-tab index>全部</pg-tab>
            <pg-tab
              v-for="item in Constant.FINANCIAL_BALANCE_STATUS()"
              :index="item.value"
              :key="item.value"
              >{{ item.label }}</pg-tab
            >
          </pg-tabs>
        </div>
        <div class="card-body">
          <pg-table
            fixed-header
            :data="list.items"
            primary-key="id"
            :page="query.page"
            :page-size="query.page_size"
          >
            <template v-slot:expand-row="{ row }">
              <div class="p-15">
                <div class="row">
                  <div class="col-12 text-wrap">
                    充值/扣款备注：{{ row.remark || '-' }}
                  </div>
                </div>
              </div>
            </template>
            <pg-column title="商户名称" width="120px">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">{{ row.merchant_title }}</div>
              </template>
            </pg-column>

            <pg-column title="充值/扣款类型" width="120px">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">
                  {{ row.amount > 0 ? '充值' : '扣款' }}
                </div>
              </template>
            </pg-column>

            <pg-column title="金额" width="80px" text-align="center">
              <template v-slot="{ row }">
                <span v-if="!!row.amount && row.amount > 0">{{
                  `¥${Handle.returnPrice(row.amount)}`
                }}</span>
                <span v-if="!!row.amount && row.amount < 0">{{
                  `-¥${Handle.returnPrice(-row.amount)}`
                }}</span>
              </template>
            </pg-column>
            <pg-column title="提交人" width="80px" text-align="center">
              <template v-slot="{ row }">
                <span class="overflow-ellipsis" v-if="!!row.creator_name">{{
                  row.creator_name
                }}</span>
                <span v-else>-</span>
              </template>
            </pg-column>
            <pg-column title="审核人" width="80px" text-align="center">
              <template v-slot="{ row }">
                <span class="overflow-ellipsis" v-if="!!row.checker_name">{{
                  row.checker_name
                }}</span>
                <span v-else>-</span>
              </template>
            </pg-column>
            <pg-column title="审核状态" width="80px" text-align="center">
              <template v-slot="{ row }">
                <span
                  :class="`status-dot mr-5 bg-${
                    Constant.FINANCIAL_BALANCE_STATUS('color')[row.status]
                  }`"
                ></span>
                <span class="overflow-ellipsis" v-if="!!row.status">{{
                  Constant.FINANCIAL_BALANCE_STATUS('enum')[row.status]
                }}</span>
                <span v-else>-</span>
              </template>
            </pg-column>

            <pg-column prop="created" title="提交时间" width="140"></pg-column>

            <pg-column title="操作" width="120px" text-align="center">
              <template v-slot="{ row }">
                <a
                  class="text-decoration-none"
                  v-if="
                    (app.auth.isAdmin || app.auth.FinanceApproveEdit) &&
                    row.status === 'wait_check'
                  "
                  @click="handleItemAudit(row)"
                  >审核</a
                >
                <a
                  class="text-decoration-none ml-20"
                  v-if="
                    (app.auth.isAdmin || app.auth.FinanceApproveDetail) &&
                    (row.status == 'checked' || row.status == 'declined')
                  "
                  @click="handleApproveLog(row)"
                  >审核详情</a
                >
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination
            :num="list.num"
            v-model="query"
            @change="financeBalanceCheckQuery"
          />
        </div>
      </div>
    </div>

    <pg-drawer
      v-model="drawer.visible"
      width="800px"
      v-if="drawer.type == 'detail'"
    >
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">审核详情</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${
              Constant.FINANCIAL_BALANCE_STATUS('color')[drawer.item.status]
            } badge-outline ml-20`"
          >
            {{
              Constant.FINANCIAL_BALANCE_STATUS('enum')[drawer.item.status] ||
              drawer.item.status ||
              '-'
            }}
          </div>
        </div>
      </template>
      <approve-detail v-if="drawer.visible" :item="drawer.item" />
    </pg-drawer>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'check'"
      title="财务审核"
    >
      <approve-check
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>
  </div>
</template>
<script>
import { Http, Api, Handle, Constant } from '@/util'
import approveCheck from './approve-check'
import approveDetail from './approve-detail'
export default {
  name: 'approve',
  inject: ['app'],
  components: { approveCheck, approveDetail },
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
    document.title = '财务审核 - 商城 - 蒲公英运营管理系统'
    this.initQuery()
    this.financeBalanceCheckQuery()
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
      this.financeBalanceCheckQuery()
    },

    resetQuery() {
      this.initQuery()
      this.financeBalanceCheckQuery()
    },

    financeBalanceCheckQuery() {
      Http.get(Api.financeBalanceCheckQuery, this.$data.query).then((res) => {
        this.$data.list = res.data || { items: [] }
      })
    },

    handleItemAudit(item) {
      this.$data.dialog = { visible: true, type: 'check', item: item }
    },

    handleApproveLog(item) {
      this.$data.drawer = { visible: true, type: 'detail', item: item }
    },

    handleSubmit() {
      this.handleCancel()
      this.financeBalanceCheckQuery()
    },

    handleCancel() {
      this.$data.dialog = { visible: false, type: 'check', item: {} }
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
