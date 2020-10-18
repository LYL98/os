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
          placeholder="创建时间"
        ></pg-datepicker>

        <pg-button-group
          class="ml-20"
          style="width: 238px"
          v-model="query.custom_type"
          :options="{ 全部: '', 商城: 'B', 零售: 'C' }"
          @change="changeQuery"
        ></pg-button-group>

        <pg-select
          class="ml-20"
          v-model="query.storehouse_id"
          @change="changeQuery"
          style="width: 168px"
          placeholder="仓"
          searchable
          clearable
        >
          <pg-option
            v-for="item in storehouseList"
            :key="item.code"
            :value="item.code"
            >{{ item.title }}</pg-option
          >
        </pg-select>
      </div>
      <div class="d-flex mt-10">
        <pg-search
          clearable
          placeholder="供应商名称"
          v-model="query.condition"
          @change="changeQuery"
        />
        <pg-button class="ml-10" flat @click="resetQuery"
          >重置筛选条件</pg-button
        >
        <pg-button
          class="ml-auto"
          @click="handleExport()"
          v-if="app.auth.isAdmin || app.auth.FinanceSStatementExport"
          >导出对账单</pg-button
        >
      </div>

      <div class="card mt-10">
        <div class="card-header font-weight-bolder position-relative">
          <pg-tabs v-model="query.status" @change="changeQuery">
            <pg-tab index>全部</pg-tab>
            <pg-tab
              v-for="item in Constant.SUP_BILL_STATUS()"
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
            checkable
            @selection="onSelectionItems"
            :disabled-keys="disabledKeys"
            :page="query.page"
            :page-size="query.page_size"
            borderless
          >
            <pg-column title="供应商名称/创建时间" width="130px" style="padding: 0 10px 0 10px">
              <!-- <template v-slot="{ row }">
                <a
                  class="overflow-ellipsis text-dark"
                  v-if="app.auth.isAdmin || app.auth.FinanceSStatementDetail"
                  @click="handleDetailItem(row)"
                >
                  {{ (row.supplier && row.supplier.title) || '-' }}
                </a>
              </template> -->
              <template v-slot="{ row }">
                <div class="position-relative order-serial">
                  <div class="position-absolute normal overflow-ellipsis">
                    <a class="text-dark" @click="handleDetailItem(row)">{{ (row.supplier && row.supplier.title) || '-' }}</a>
                  </div>
                  <div class="position-absolute text-secondary datetime">
                    <span>{{ row.created }}</span>
                  </div>
                </div>
              </template>
            </pg-column>

            <pg-column title="更新时间" width="120px">
              <template v-slot="{ row }">
                <div class="position-relative">
                  <span>{{ row.updated }}</span>
                </div>
              </template>
            </pg-column>

            <pg-column title="仓" width="70px" text-align="center">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">
                  {{ row.storehouse_title || '-' }}
                </div>
              </template>
            </pg-column>

            <pg-column title="账单时间" width="170">
              <template v-slot="{ row }">
                {{ row.begin_term }}&nbsp;至&nbsp;{{ row.end_term }}
              </template>
            </pg-column>

            <pg-column title="账单金额" width="80px" text-align="center">
              <template v-slot="{ row }">
                <span v-if="row.bill_amount > 0">{{
                  `¥${Handle.returnPrice(row.bill_amount)}`
                }}</span>
                <span v-else-if="row.bill_amount < 0">{{
                  `-¥${Handle.returnPrice(Math.abs(row.bill_amount))}`
                }}</span>
                <span v-else>&yen;0</span>
              </template>
            </pg-column>
            <pg-column prop="bill_date" title="结款日期" width="80">
              <template v-slot="{ row }">
                <span v-if="!!row.bill_date">{{
                  Handle.returnDateFormat(row.bill_date, 'yyyy-MM-dd')
                }}</span>
                <span v-else>-</span>
              </template>
            </pg-column>
            <pg-column prop="created_date" title="账期生成日期" width="90">
              <template v-slot="{ row }">
                {{ Handle.returnDateFormat(row.created, 'yyyy-MM-dd') }}
              </template>
            </pg-column>

            <pg-column title="状态" width="65px" text-align="center">
              <template v-slot="{ row }">
                <span
                  :class="`status-dot mr-5 bg-${
                    Constant.SUP_BILL_STATUS('color')[row.status]
                  }`"
                ></span>
                <span class="overflow-ellipsis" v-if="!!row.status">{{
                  Constant.SUP_BILL_STATUS('enum')[row.status]
                }}</span>
                <span v-else>-</span>
              </template>
            </pg-column>

            <pg-column title="操作" width="80px" text-align="center">
              <template v-slot="{ row }">
                <pg-confirm
                  @confirm="supplierStatementPay(row)"
                  help-text="确认结款"
                  v-if="
                    (app.auth.isAdmin || app.auth.FinanceSStatementPay) &&
                    row.status === 'wait_paid'
                  "
                >
                  <a class="text-decoration-none">结款</a>
                </pg-confirm>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer d-flex align-items-center">
          <pg-button
            class="mr-auto"
            @click="supplierStatementPay('batch')"
            :disabled="
              !Array.isArray(selectionItems) ||
              selectionItems.length <= 0 ||
              query.status == ''
            "
            >批量结款</pg-button
          >
          <pg-pagination
            :num="list.num"
            v-model="query"
            @change="financeSupBillQuery"
          />
        </div>
      </div>
    </div>

    <pg-drawer
      v-model="drawer.visible"
      width="1200px"
      v-if="drawer.type == 'detail'"
    >
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">账期详情</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${
              Constant.SUP_BILL_STATUS('color')[drawer.item.status]
            } badge-outline ml-20`"
          >
            {{
              Constant.SUP_BILL_STATUS('enum')[drawer.item.status] ||
              drawer.item.status ||
              '-'
            }}
          </div>
        </div>
      </template>
      <sup-bill-detail v-if="drawer.visible" :item="drawer.item" />
    </pg-drawer>

    <!-- <pg-dialog
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
    </pg-dialog> -->
  </div>
</template>
<script>
import { Http, Api, Handle, Constant } from '@/util'
import supBillDetail from './sup-bill-detail'
export default {
  name: 'approve',
  inject: ['app'],
  components: { supBillDetail },
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
      storehouseList: [],
      selectionItems: [],
    }
  },
  created() {
    this.Handle = Handle
    this.Constant = Constant
    document.title = '供应商对账单 - 商城 - 蒲公英运营管理系统'
    this.initQuery()
    this.financeSupBillQuery()
    this.commonStorehouseList()
  },

  computed: {
    disabledKeys: {
      get() {
        let itemIds = [];
        this.list.items.map((item) => {
          if (item.status == 'paid') {
            itemIds.push(item.id);
          }
        });
        return itemIds;
      },
    },
  },

  methods: {
    initQuery() {
      this.$data.query = {
        picker_value: null,
        begin_date: '',
        end_date: '',
        condition: '',
        custom_type: '',
        storehouse_id: '',
        status: '',
        page: 1,
        page_size: 20,
      }
    },

    changeQuery() {
      this.$data.query.page = 1
      this.financeSupBillQuery()
    },

    resetQuery() {
      this.initQuery()
      this.financeSupBillQuery()
    },

    financeSupBillQuery() {
      Http.get(Api.financeSupBillQuery, this.$data.query).then((res) => {
        this.$data.list = res.data || { items: [] }
      })
    },

    supplierStatementPay(item) {
      let ids = []
      if (item === 'batch') {
        ids = Handle.returnListKeyList('id', this.$data.selectionItems)
      } else {
        ids = [item.id]
      }
      Http.post(Api.financeSupBillPay, { ids }).then((res) => {
        this.$toast({ type: 'success', message: '结款成功' })
        this.$data.list = res.data || { items: [] }
        this.financeSupBillQuery()
      })
    },

    handleDetailItem(item) {
      this.$data.drawer = { visible: true, type: 'detail', item: item }
    },

    handleSubmit() {
      this.handleCancel()
      this.financeSupBillQuery()
    },

    handleExport() {
      this.$loading.show()
      Http.get(Api.financeSupBillExportCheck, { ...this.$data.query })
        .then(() => {
          return Http.download(Api.financeSupBillExport, this.$data.query, {
            filename: '供应商对账单.xls',
          })
        })
        .then(() => {
          this.$loading.hide()
        })
        .catch(() => {
          this.$loading.hide()
        })
    },

    handleCancel() {
      this.$data.dialog = { visible: false, type: 'check', item: {} }
    },

    commonStorehouseList() {
      Http.get(Api.commonStorehouseList).then((res) => {
        this.$data.storehouseList = res.data || []
      })
    },

    onSelectionItems(items) {
      this.$data.selectionItems = items
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

.order-serial {
  height: 42px;
}

.order-serial .normal {
  transform: scale(0.88);
  left: -4px;
  top: 10px;
  line-height: 1;
}

.order-serial .no {
  transform: scale(0.95);
  left: 0px;
  top: 10px;
  line-height: 1;
  letter-spacing: 0.8px;
}

.order-serial .datetime {
  transform: scale(0.88);
  left: -8px;
  top: 23px;
  right: 3px;
  line-height: 1;
}
</style>
