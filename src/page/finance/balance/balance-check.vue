<template>
  <div>
    <div class="d-flex mt-20">
      <pg-button-group
        style="width: 238px"
        v-model="query.opt_type"
        :options="{ '全部': '', '充值': 'manual_topup', '扣款': 'manual_deduct' }"
        @change="changeQuery"
      ></pg-button-group>

      <pg-datepicker
        class="ml-20"
        style="width: 450px;"
        v-model="query"
        range
        quickable
        @change="changeQuery"
        clearable
        placeholder="提交时间"
      ></pg-datepicker>
    </div>

    <div class="d-flex mt-20">
      <pg-select
        v-model="query.status"
        @change="changeQuery"
        placeholder="请选择审核状态"
        style="width: 168px;"
        clearable
        searchable
      >
        <pg-option
          v-for="item in Constant.FINANCIAL_BALANCE_STATUS()"
          :key="item.value"
          :value="item.value"
        >{{ item.label }}</pg-option>
      </pg-select>

      <pg-search
        class="ml-20"
        placeholder="提交人名称"
        v-model="query.operator_name"
        @change="changeQuery"
      />
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>

    <pg-table
      :data="list.items"
      primary-key="id"
      :page="query.page"
      :page-size="query.page_size"
      :height="app.windowHeight - 270 + 'px'"
    >
      <template v-slot:expand-row="{row}">
        <div class="p-15">
          <div class="row">
            <div class="col-12 text-wrap">充值/扣款备注：{{ row.remark || '-' }}</div>
          </div>
        </div>
      </template>
      <pg-column prop="created" title="提交时间" width="120"></pg-column>
      <pg-column prop="amount" title="充值/扣款" width="80">
        <template v-slot="{row}">{{ row.amount >= 0 ? '充值' : '扣款' }}</template>
      </pg-column>
      <pg-column prop="opt_type" title="充值/扣款类型" width="120">
        <template v-slot="{row}">
          <div>{{ Constant.FINANCIAL_BALANCE_REASON('enum')[row.opt_type] || '-' }}</div>
        </template>
      </pg-column>
      <pg-column title="金额" width="80">
        <template v-slot="{row}">
          <div
            class="overflow-ellipsis text-warning"
            v-if="row.amount&&row.amount>0"
          >{{ `¥${Handle.returnPrice(row.amount)}` || '-' }}</div>
          <div
            class="overflow-ellipsis text-success"
            v-if="row.amount&&row.amount<0"
          >{{ `-¥${Handle.returnPrice(Math.abs(row.amount))}` || '-' }}</div>
        </template>
      </pg-column>
      <pg-column prop="creator_name" title="提交人" width="80"></pg-column>
      <pg-column prop="status" title="审核状态" width="100">
        <template v-slot="{row}">
          <span
            :class="`status-dot mr-5 bg-${
              Constant.FINANCIAL_BALANCE_STATUS('color')[row.status]
            }`"
          ></span>
          <span>{{ Constant.FINANCIAL_BALANCE_STATUS('enum')[row.status] || '-' }}</span>
        </template>
      </pg-column>

      <pg-column prop title="操作" width="80px">
        <template v-slot="{row}">
          <a
            @click="handleShowDetail(row)"
            class="mr-10 text-decoration-none"
            v-if="(app.auth.isAdmin || app.auth.FinanceBalanceApproveDetail) && row.status === 'checked' || row.status === 'declined' "
          >查看详情</a>
        </template>
      </pg-column>
    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="financeBalanceCheckQuery" />
    </div>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'detail'" title="审核详情" width="160px">
      <balance-check-detail
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
import balanceCheckDetail from './balance-check-detail'

export default {
  name: 'balance-check',
  inject: ['app'],
  components: { balanceCheckDetail },
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
      query: {},
      list: {
        items: [],
      },
      dialog: {
        visible: false,
        item: {},
      },
      selectionItems: [],
      systemClassTree: [],
    }
  },

  created() {
    this.Handle = Handle
    this.Constant = Constant
    this.initQuery()
    this.financeBalanceCheckQuery()
  },

  methods: {
    initQuery() {
      this.$data.query = {
        merchant_id: this.$props.item.id,
        status: '',
        opt_type: '',
        creator_name: '',
        begin_date: '',
        end_date: '',
        page: 1,
        page_size: 20,
      }
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

    handleShowDetail(item) {
      Http.get(Api.financeBalanceCheckDetail, { id: item.id }).then((res) => {
        this.$data.dialog = { visible: true, type: 'detail', item: res.data }
      })
    },

    handleSubmit() {
      this.handleCancel()
      this.financeBalanceCheckQuery()
    },

    handleCancel() {
      this.$data.dialog = { visible: false, item: {} }
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
