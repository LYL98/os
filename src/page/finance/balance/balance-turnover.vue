<template>
  <div>
    <div class="d-flex">
      <pg-datepicker
        style="width: 450px;"
        v-model="query"
        range
        quickable
        @change="changeQuery"
        clearable
        placeholder="提交时间"
      ></pg-datepicker>

      <pg-select
        class="ml-20"
        v-model="query.opt_type"
        @change="changeQuery"
        placeholder="请选择变动原因"
        style="width: 168px;"
        clearable
        searchable
      >
        <pg-option
          v-for="item in Constant.FINANCIAL_BALANCE_REASON()"
          :key="item.value"
          :value="item.value"
        >{{ item.label }}</pg-option>
      </pg-select>

      <pg-select
        class="ml-20"
        v-model="query.operator_class"
        @change="changeQuery"
        placeholder="请选择操作人类型"
        style="width: 168px;"
        clearable
        searchable
      >
        <pg-option
          v-for="item in Constant.FINANCIAL_BALANCE_OPERATOR_CLASS()"
          :key="item.value"
          :value="item.value"
        >{{ item.label }}</pg-option>
      </pg-select>
    </div>

    <div class="d-flex mt-20">
      <pg-search placeholder="操作人名称" v-model="query.operator_name" @change="changeQuery" />
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
      <pg-column prop="created" title="时间" width="120"></pg-column>
      <pg-column prop="old_balance" title="原有金额" width="80">
        <template v-slot="{row}">
          <span v-if="!!row.old_balance">{{`¥${Handle.returnPrice(row.old_balance)}`}}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="变动金额" width="80">
        <template v-slot="{row}">
          <div
            class="overflow-ellipsis text-danger"
            v-if="row.amount>0"
          >{{ `¥${Handle.returnPrice(row.amount)}` || '-' }}</div>
          <div
            class="overflow-ellipsis text-success"
            v-if="row.amount<0"
          >{{ `-¥${Handle.returnPrice(Math.abs(row.amount))}` || '-' }}</div>
        </template>
      </pg-column>
      <pg-column title="现有金额" width="80">
        <template v-slot="{row}">
          <div class="overflow-ellipsis">{{ `¥${Handle.returnPrice(row.new_balance)}` || '-' }}</div>
        </template>
      </pg-column>
      <pg-column prop="operator_name" title="操作人" width="80"></pg-column>
      <pg-column prop="operator_class" title="操作人类型" width="80">
        <template v-slot="{row}">
          <div>{{ Constant.FINANCIAL_BALANCE_OPERATOR_CLASS('enum')[row.operator_class] || '-' }}</div>
        </template>
      </pg-column>
      <pg-column prop="opt_type" title="变动原因" width="100">
        <template v-slot="{row}">
          <div>{{ Constant.FINANCIAL_BALANCE_REASON('enum')[row.opt_type] || '-' }}</div>
        </template>
      </pg-column>
    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="financeBalanceLogQuery" />
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
  name: 'balance-turnover',
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
      operator: {
        member: '用户',
        operator: '运营人员',
        background: '后台',
      },
    }
  },

  created() {
    this.Handle = Handle
    this.Constant = Constant
    this.initQuery()
    this.financeBalanceLogQuery()
  },

  methods: {
    initQuery() {
      this.$data.query = {
        merchant_id: this.$props.item.id,
        opt_type: '',
        operator_class: '',
        operator_name: '',
        begin_date: '',
        end_date: '',
        page: 1,
        page_size: 20,
      }
    },

    changeQuery() {
      this.$data.query.page = 1
      this.financeBalanceLogQuery()
    },

    resetQuery() {
      this.initQuery()
      this.financeBalanceLogQuery()
    },

    financeBalanceLogQuery() {
      Http.get(Api.financeBalanceLogQuery, this.$data.query).then((res) => {
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
      this.financeBalanceLogQuery()
    },

    handleCancel() {
      this.$data.dialog = { visible: false, item: {} }
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
