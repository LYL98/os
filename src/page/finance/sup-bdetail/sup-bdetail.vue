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
          @change="changeCustomType"
        ></pg-button-group>

        <pg-button-group
          class="ml-20"
          style="width: 262px"
          v-model="query.sale_type"
          :options="{ 全部: '', 平台: '平台', 自营: '自营' }"
          v-if="query.custom_type === 'B'"
          @change="changeQuery"
        ></pg-button-group>
      </div>
      <div class="d-flex mt-10">
        <pg-select
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
        <pg-select
          class="ml-20"
          v-model="query.bill_reason"
          @change="changeQuery"
          style="width: 168px"
          placeholder="流水类型"
          searchable
          clearable
        >
          <pg-option
            v-for="item in Constant.FINANCIAL_SUP_BDETAIL_BILLREASON()"
            :key="item.value"
            :value="item.value"
            >{{ item.label }}</pg-option
          >
        </pg-select>
        <pg-select
          class="ml-20"
          v-model="query.bill_term"
          @change="changeQuery"
          style="width: 168px"
          placeholder="账期类型"
          searchable
          clearable
        >
          <pg-option
            v-for="item in Constant.FINANCIAL_SUP_BDETAIL_BILL_TERM()"
            :key="item.value"
            :value="item.value"
            >{{ item.label }}</pg-option
          >
        </pg-select>
        <pg-search
          class="ml-20"
          style="width: 235px"
          clearable
          placeholder="供应商名称、商品编号、名称"
          v-model="query.condition"
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
              v-for="item in Constant.FINANCIAL_SUP_BDETAIL_STATUS()"
              :index="item.value"
              :key="item.value"
              >{{ item.label }}</pg-tab
            >
          </pg-tabs>
          <div class="ml-auto position-absolute d-flex justify-content-end" style="width:340px;right:10px;top:10px">
            <pg-button
              class="ml-auto"
              @click="handleExport()"
              v-if="app.auth.isAdmin || app.auth.FinanceSBDetailExport"
              >导出流水</pg-button
            >
            <pg-button
              class="ml-20"
              @click="handleImport()"
              v-if="app.auth.isAdmin || app.auth.FinanceSBDetailImport"
              >手动导入流水</pg-button
            >

            <pg-button
              class="ml-20"
              @click="handleAdd()"
              v-if="app.auth.isAdmin || app.auth.FinanceSBDetailAdd"
              >手动新增</pg-button
            >
          </div>
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
              <template v-slot="{ row }">
                <div class="position-relative order-serial">
                  <div class="position-absolute no">
                    <a class="text-dark" @click="handleDetailItem(row)">{{
                      row.supplier && row.supplier.title
                    }}</a>
                  </div>
                  <div class="position-absolute text-secondary datetime">
                    <span>{{ row.created }}</span>
                  </div>
                </div>
              </template>
            </pg-column>

            <pg-column title="仓" width="55px">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">
                  {{ row.storehouse_title || '-' }}
                </div>
              </template>
            </pg-column>

            <pg-column title="商品编号/名称" width="120px" style="padding: 0 10px 0 10px">
              <template v-slot="{ row }">
                <div class="position-relative order-item">
                  <div class="position-absolute no text-secondary">
                    <span>{{ row.item_code || '-' }}</span>
                    <span class="title bg-primary text-secondary" style="color:#fff;margin-left:6px;" v-if="row.sale_type == '平台'">平台</span>
                  </div>
                  <div class="position-absolute title overflow-ellipsis">
                    <span>{{ row.item_title }}</span>
                  </div>
                </div>
              </template>
            </pg-column>

            <pg-column title="结算类型" width="65px">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">
                  {{
                    Constant.FINANCIAL_SUP_BDETAIL_BILL_TERM('enum')[
                      row.bill_term
                    ] || '-'
                  }}
                </div>
              </template>
            </pg-column>

            <pg-column title="流水类型" width="65px">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">
                  {{
                    Constant.FINANCIAL_SUP_BDETAIL_BILLREASON('enum')[
                      row.bill_reason
                    ] || '-'
                  }}
                </div>
              </template>
            </pg-column>

            <pg-column title="采购价" width="70px" text-align="center">
              <template v-slot="{ row }">
                <span v-if="!!row.item_price_buy && row.item_price_buy">
                  {{ `¥${Handle.returnPrice(row.item_price_buy)}` }}
                </span>
                <span v-else>-</span>
              </template>
            </pg-column>

            <pg-column title="收货数量" width="70" text-align="center">
              <template v-slot="{ row }">{{ row.item_num || '-' }}</template>
            </pg-column>

            <pg-column title="筐金额" width="75px" text-align="center">
              <template v-slot="{ row }">
                <span v-if="!!row.frame_price && row.frame_price">
                  {{ `¥${Handle.returnPrice(row.frame_price)}` }}
                </span>
                <span v-else>-</span>
              </template>
            </pg-column>

            <pg-column title="总金额" width="90px" text-align="center">
              <template v-slot="{ row }">
                <span
                  class="text-warning"
                  v-if="!!row.bill_amount && row.bill_amount > 0"
                >
                  {{ `¥${Handle.returnPrice(row.bill_amount)}` }}
                </span>
                <span
                  class="text-success"
                  v-else-if="!!row.bill_amount && row.bill_amount < 0"
                >
                  {{ `-¥${Handle.returnPrice(-row.bill_amount)}` }}
                </span>
                <span v-else>-</span>
              </template>
            </pg-column>

            <pg-column title="状态" width="75px" text-align="center">
              <template v-slot="{ row }">
                <span
                  :class="`status-dot mr-5 bg-${
                    Constant.FINANCIAL_SUP_BDETAIL_STATUS('color')[row.status]
                  }`"
                ></span>
                <span class="overflow-ellipsis" v-if="!!row.status">
                  {{
                    Constant.FINANCIAL_SUP_BDETAIL_STATUS('enum')[row.status]
                  }}
                </span>
                <span v-else>-</span>
              </template>
            </pg-column>

            <pg-column title="操作" width="60px" text-align="center">
              <template v-slot="{ row }">
                <pg-confirm
                  @confirm="handlePay(row.id)"
                  help-text="确认给选择的供应商结款？"
                >
                  <a
                    v-if="
                      (app.auth.isAdmin || app.auth.FinanceSBDetailPay) &&
                      row.bill_term === 0 &&
                      row.status === 'wait_paid'
                    "
                    class="text-decoration-none"
                    >结款</a
                  >
                </pg-confirm>
                <a
                  class="text-decoration-none"
                  v-if="
                    (app.auth.isAdmin || app.auth.FinanceSBDetailAudit) &&
                    row.status === 'wait_audit'
                  "
                  @click="handleAuditItem(row)"
                  >审核</a
                >
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer d-flex align-items-center">
          <template
            v-if="app.auth.isAdmin || app.auth.FinanceSBDetailAuditAudit"
          >
            <pg-button
              v-if="query.status === '' || query.status === 'wait_audit'"
              @click="handleAuditItem(selectionItems)"
              :disabled="
                !Array.isArray(selectionItems) || selectionItems.length <= 0
              "
              >批量审核</pg-button
            >
            <pg-button class="ml-20" v-else disabled>批量审核</pg-button>
          </template>

          <template v-if="app.auth.isAdmin || app.auth.FinanceSBDetailPay">
            <pg-confirm
              @confirm="handleAllPay()"
              help-text="确认给所有待结款的供应商结款"
            > 
              <pg-button
                class="ml-20"
                v-if="query.status === '' || query.status === 'wait_paid'"
                >一键结款</pg-button
              >
              <pg-button class="ml-20" v-else disabled>一键结款</pg-button>
            </pg-confirm>
            
            <pg-tooltip class="ml-10" v-if="query.status === '' || query.status === 'wait_paid'">此操作会将当前条件下所有未结款的供应商批量结款</pg-tooltip>
            <pg-tooltip class="ml-10" v-else>暂无可结款的流水</pg-tooltip>
            
          </template>

          <span class="amount ml-20">
            <span>总金额: </span>
            <span v-if="list.total_bill_amount > 0" class="text-warning"
              >&yen;{{ Handle.returnPrice(list.total_bill_amount) }}</span
            >
            <span v-if="list.total_bill_amount < 0" class="text-success"
              >-&yen;{{
                Handle.returnPrice(Math.abs(list.total_bill_amount))
              }}</span
            >
            <span v-if="list.total_bill_amount === 0"
              >&yen;{{ Handle.returnPrice(list.total_bill_amount) }}</span
            >
          </span>

          <pg-pagination
            class="ml-auto"
            :num="list.num"
            v-model="query"
            @change="financeSupBDetailQuery"
          />
        </div>
      </div>
    </div>

    <pg-drawer
      v-model="drawer.visible"
      width="900px"
      v-if="drawer.type == 'detail'"
    >
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">流水详情</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${
              Constant.FINANCIAL_SUP_BDETAIL_STATUS('color')[drawer.item.status]
            } badge-outline ml-20`"
          >
            {{
              Constant.FINANCIAL_SUP_BDETAIL_STATUS('enum')[
                drawer.item.status
              ] ||
              drawer.item.status ||
              '-'
            }}
          </div>
        </div>
      </template>
      <sup-bdetail-detail v-if="drawer.visible" :item="drawer.item" />
    </pg-drawer>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'check'"
      title="供应商流水审核"
    >
      <sup-bdetail-check
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'import'"
      title="手动导入流水"
    >
      <sup-bdetail-import
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'add'"
      title="手动新增"
    >
      <sup-bdetail-add
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
import supBdetailDetail from './sup-bdetail-detail'
import supBdetailCheck from './sup-bdetail-check'
import supBdetailImport from './sup-bdetail-import'
import supBdetailAdd from './sup-bdetail-add'
export default {
  name: 'approve',
  inject: ['app'],
  components: {
    supBdetailDetail,
    supBdetailCheck,
    supBdetailImport,
    supBdetailAdd,
  },
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
      formData: {
        id: '',
        audit_status: 'success',
        remark: '',
      },
      allPrice:'',
    }
  },

  computed: {
    disabledKeys: {
      get() {
        let itemIds = [];
        this.list.items.map((item) => {
          if (item.status == 'audit_failed' || item.status == 'paid' || item.status == 'wait_paid') {
            itemIds.push(item.id);
          }
        });
        return itemIds;
      },
    },
  },

  created() {
    this.Handle = Handle
    this.Constant = Constant
    document.title = '供应商流水 - 商城 - 蒲公英运营管理系统'
    this.initQuery()
    this.financeSupBDetailQuery()
    this.commonStorehouseList()
  },

  methods: {
    initQuery() {
      this.$data.query = {
        picker_value: null,
        begin_date: '',
        end_date: '',
        bill_reason: '',
        bill_term: '',
        condition: '',
        custom_type: 'B',
        storehouse_id: '',
        sale_type: '',
        page: 1,
        page_size: 20,
      }
    },

    changeQuery() {
      this.$data.query.page = 1
      this.financeSupBDetailQuery()
    },

    changeCustomType() {
      this.$data.query.sale_type = ''
      this.changeQuery()
    },

    resetQuery() {
      this.initQuery()
      this.financeSupBDetailQuery()
    },

    financeSupBDetailQuery() {
      Http.get(Api.financeSupBDetailQuery, this.$data.query).then((res) => {
        this.$data.list = res.data || { items: [] }
        this.$data.allPrice = res.data.total_bill_amount
      })
    },

    handleDetailItem(item) {
      //financeSupBDetailDetail
      let id = item.id
      Http.get(Api.financeSupBDetailDetail, { id }).then((res) => {
        this.$data.drawer = {
          visible: true,
          type: 'detail',
          item: res.data || '-',
        }
      })
    },

    handleAuditItem(item) {
      this.$data.dialog = { visible: true, type: 'check', item: item }
    },

    handlePay(ids) {
      Http.post(Api.financeSupBDetailPay, { ids: [ids] }).then(() => {
        this.$toast({ type: 'success', message: '已结款' })
        this.financeSupBDetailQuery()
      })
    },

    handleAllPay() {
      Http.post(Api.financeSupBDetailPayByQuery, this.$data.query).then(() => {
        this.$toast({ type: 'success', message: '已批量结款' })
        this.financeSupBDetailQuery()
      })
    },

    handleSubmit() {
      this.handleCancel()
      this.financeSupBDetailQuery()
    },

    handleExport() {
      this.$loading.show()
      Http.get(Api.financeSupBdetailExportCheck, { ...this.$data.query })
        .then(() => {
          return Http.download(Api.financeSupBdetailExport, this.$data.query, {
            filename: '流水.xls',
          })
        })
        .then(() => {
          this.$loading.hide()
        })
        .catch(() => {
          this.$loading.hide()
        })
    },

    handleImport() {
      this.$data.dialog = { visible: true, type: 'import', item: {} }
    },

    handleAdd() {
      this.$data.dialog = { visible: true, type: 'add', item: {} }
    },

    handleCancel() {
      this.$data.dialog = { visible: false, type: 'add', item: {} }
    },

    commonStorehouseList() {
      Http.get(Api.commonStorehouseList).then((res) => {
        this.$data.storehouseList = res.data || []
      })
    },

    onSelectionItems(items) {
      this.$data.selectionItems = items
      if(items.length > 0){
        let selectAmount = 0
          items.map(item => {
            selectAmount += item.bill_amount
          })
        this.$data.list.total_bill_amount = Number(selectAmount)
      }else{
        this.$data.list.total_bill_amount = this.$data.allPrice
      }
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

.order-serial .no {
  transform: scale(0.95);
  left: -1px;
  top: 10px;
  line-height: 1;
  letter-spacing: 0.8px;
}

.order-serial .datetime {
  transform: scale(0.88);
  left: -5px;
  top: 23px;
  line-height: 1;
}

.order-serial {
  height: 42px;
}

.order-serial .no {
  transform: scale(0.95);
  left: -1px;
  top: 10px;
  line-height: 1;
  letter-spacing: 0.8px;
}

.order-serial .datetime {
  transform: scale(0.88);
  left: -5px;
  top: 23px;
  line-height: 1;
}

.order-item {
  height: 42px;
}

.order-item .no {
  transform: scale(0.95);
  left: -1px;
  top: 10px;
  line-height: 1;
}

.order-item .title {
  transform: scale(0.9);
  left: -6px;
  top: 22px;
  right: -6px;
  line-height: 1;
}
</style>
