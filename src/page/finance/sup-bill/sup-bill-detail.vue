<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">
    <div class="row d-flex align-items-center">
      <div class="col-4">
        账单时间：{{item.begin_term}}&nbsp;至&nbsp;{{item.end_term}}
      </div>
      <div class="col-2">账单金额：
        <span v-if="item.bill_amount>0">{{ `¥${Handle.returnPrice(item.bill_amount)}` || '-' }}</span>
        <span v-else-if="item.bill_amount<0">{{ `-¥${Handle.returnPrice(-item.bill_amount)}` || '-' }}</span>
        <span v-else></span>
      </div>
      <div class="col-3">结款日期：
        <span v-if="!!item.bill_date">{{ item.bill_date }}</span>
        <span v-else>-</span>
      </div>
      <pg-button
        outline
        class="ml-auto mr-10 primary"
        @click="handleExport(item)"
        >导出详情</pg-button
      >
    </div>

    <div class="mt-10">
      <div class="card-body">
        <pg-table
          :data="list.items"
          primary-key="id"
          :page="query.page"
          :page-size="query.page_size"
          borderless
        >
          <pg-column title="商品编号/名称">
            <template v-slot="{ row }">
              <div>{{row.item_code}}</div>
              <div class="overflow-ellipsis">{{row.item_title || '-'}}</div>
            </template>
          </pg-column>

          <pg-column title="采购单号" width="130px">
            <template v-slot="{ row }">{{row.purchase_code || '-'}}</template>
          </pg-column>

          <pg-column title="流水类型" width="80px">
            <template v-slot="{ row }">
              <div class="overflow-ellipsis">
                {{ Constant.FINANCIAL_SUP_BDETAIL_BILLREASON('enum')[row.bill_reason] || '-' }}
              </div>
            </template>
          </pg-column>

          <pg-column title="采购价" width="80px">
            <template v-slot="{ row }">
              <div class="overflow-ellipsis">
                <span v-if="!!row.item_price_buy">{{`¥${Handle.returnPrice(row.item_price_buy)}`}}</span>
                <span v-else>-</span>
              </div>
            </template>
          </pg-column>

          <pg-column title="销售价" width="80px">
            <template v-slot="{ row }">
              <div class="overflow-ellipsis">
                <span v-if="!!row.item_price_sale">{{`¥${Handle.returnPrice(row.item_price_sale)}`}}</span>
                <span v-else>-</span>
              </div>
            </template>
          </pg-column>

          <pg-column title="收货数量" width="80px">
            <template v-slot="{ row }">
              <div class="overflow-ellipsis">
                <span v-if="row.bill_reason === 'local_buy' && !!row.item_num">{{ row.item_num }}件</span>
                <span v-else>-</span>
              </div>
            </template>
          </pg-column>

          <pg-column title="金额" width="80px">
            <template v-slot="{ row }">
              <div class="overflow-ellipsis">
                <span class="text-success" v-if="row.bill_amount < 0">{{`-¥${Handle.returnPrice(Math.abs(row.bill_amount))}`}}</span>
                <span class="text-warning" v-else-if="row.bill_amount > 0">{{`¥${Handle.returnPrice(row.bill_amount)}`}}</span>
                <span v-else>-</span>
              </div>
            </template>
          </pg-column>

          <pg-column title="备注" width="80px">
            <template v-slot="{ row }">
              <div class="overflow-ellipsis">
                {{ row.remark || '-' }}
              </div>
            </template>
          </pg-column>

          <pg-column title="操作人/操作时间" width="140px">
            <template v-slot="{ row }">
              <div class="overflow-ellipsis">
                <div>{{ row.creator.realname || '系统' }}</div>
                <div class="text-secondary datetime">{{ row.created }}</div>
              </div>
            </template>
          </pg-column>

          <pg-column title="审核人/审核时间" width="140px">
            <template v-slot="{ row }">
              <div class="overflow-ellipsis">
                <div>{{ row.auditor.realname || '系统' }}</div>
                <div class="text-secondary datetime">{{ row.audit_time }}</div>
              </div>
            </template>
          </pg-column>
        </pg-table>
      </div>
    </div>
  </div>
</template>

<script>
import { Http, Api, Handle, Constant } from '@/util'
export default {
  name: 'sup-bill-detail',
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
      list: {
        items: [],
      },
      query: {},
    }
  },
  created() {
    this.Constant = Constant
    this.Handle = Handle
    this.financeSupBillDetail()
  },
  methods: {
    financeSupBillDetail() {
      let id = this.$props.item.id
      Http.get(Api.financeSupBillDetail, { id }).then((res) => {
        this.$data.list = {items: res.data.bill_details} || { items: [] }
      })
    },
    handleExport(item) {
      let id = item.id
      this.$loading.show()
      Http.get(Api.financeSupBillDetailExportCheck, { id })
      .then(() => {
        return Http.download(Api.financeSupBillDetailExport, { id } , {
          filename: '供应商账期详情.xls',
        })
      })
      .then(() => {
        this.$loading.hide()
      })
      .catch(() => {
        this.$loading.hide()
      })
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
