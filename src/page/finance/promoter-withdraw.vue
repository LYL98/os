<template>
  <div class="pg-page">

    <div class="p-20">
      <div class="d-flex">
        <pg-datepicker style="width: 450px;" v-model="query" range quickable @change="changeQuery" clearable placeholder="提现申请时间"></pg-datepicker>
        <pg-search class="w-25 ml-20" clearable placeholder="申请人、转账银行" v-model="query.condition" @change="changeQuery"/>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
      </div>

      <div class="card mt-10">
        <div class="card-header font-weight-bolder">
          <pg-tabs v-model="query.status" @change="changeQuery">
            <pg-tab index="">全部</pg-tab>
            <pg-tab v-for="item in Constant.PROMOTER_WITHDRAW_STATUS()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
          </pg-tabs>
        </div>
        <div class="card-body">
          <pg-table
            fixed-header
            :data="list.items"
            primary-key="id"
            :page="query.page"
            :page-size="query.page_size"
            borderless
          >
            <pg-column title="提现单号" width="130px" prop="code">
              <template v-slot="{row}">
                <a class="text-dark" @click="handleDetailItem(row)">{{ row.code }}</a>
              </template>
            </pg-column>
            <pg-column title="申请时间" width="160px" prop="created"></pg-column>
            <pg-column title="申请人" width="120px" prop="realname"></pg-column>
            <pg-column title="转账银行" prop="bank_acc" width="140px"></pg-column>
            <pg-column title="银行卡号" width="200px">
              <template v-slot="{row}">
                {{ row.acc_card_no || '-' }}
                <pg-button size="sm" flat square @click="handleCopyItem(row.acc_card_no)" v-if="!!row.acc_card_no">
                  <i class="icon-stack font-size-sm"></i>
                </pg-button>
              </template>
            </pg-column>
            <pg-column title="提现金额" width="90px" text-align="center">
              <template v-slot="{row}">
                {{ !!row.amount ? '¥' : '' }}{{ Handle.returnPrice(row.amount) }}
              </template>
            </pg-column>
            <pg-column title="状态" width="80px" text-align="center">
              <template v-slot="{row}">
                <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                  <span :class="`status-dot mr-5 bg-${Constant.PROMOTER_WITHDRAW_STATUS('color')[row.status]}`"></span>
                  {{ Constant.PROMOTER_WITHDRAW_STATUS('enum')[row.status] || row.status || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="操作" width="60px">
              <template v-slot="{row}">
                <a
                  v-if="row.status === 'init' && (app.auth.isAdmin || app.auth.ClsFinancePromoterWithdrawApprove)"
                  class="mr-10 text-decoration-none"
                  @click="handleApproveItem(row)"
                >审核</a>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination :num="list.num" v-model="query" @change="promoterWithdrawQuery"/>
        </div>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" title="推广者提现审核">
      <promoter-withdraw-approve
        v-if="dialog.visible"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" width="500px">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">{{drawer.item.code}} 提现单详情</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${Constant.PROMOTER_WITHDRAW_STATUS('color')[drawer.item.status]} badge-outline ml-20`"
          >
            {{ Constant.PROMOTER_WITHDRAW_STATUS('enum')[drawer.item.status] || drawer.item.status || '-' }}
          </div>
        </div>
      </template>
      <promoter-withdraw-detail
        v-if="drawer.visible"
        :item="drawer.item"
      />
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';

  import promoterWithdrawApprove from './promoter-withdraw-approve';
  import promoterWithdrawDetail from './promoter-withdraw-detail';

  export default {
    name: 'promoter-withdraw',
    components: {
      promoterWithdrawApprove,
      promoterWithdrawDetail
    },
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          visible: false,
          item: {}
        },
        drawer: {
          visible: false,
          item: {}
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      document.title = '推广者提现 - 财务管理 - 蒲公英运营管理系统';
      this.initQuery();
      this.promoterWithdrawQuery();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          begin_date: '',
          end_date: '',
          condition: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.promoterWithdrawQuery();
      },

      resetQuery() {
        this.initQuery();
        this.promoterWithdrawQuery();
      },

      promoterWithdrawQuery() {
        Http.get(Api.promoterWithdrawQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleDetailItem(item) {
        this.$data.drawer = { visible: true, item: item };
      },

      handleApproveItem(item) {
        this.$data.dialog = { visible: true, item: item };
      },

      handleSubmit() {
        this.handleCancel();
        this.promoterWithdrawQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, item: {} };
      },

      handleCopyItem(val) {
        const input = document.createElement('input');
        input.setAttribute('readonly', 'readonly');
        input.setAttribute('value', val);
        document.body.appendChild(input);
        input.setSelectionRange(0, val.length);
        input.select();
        if (document.execCommand('copy')) {
          document.execCommand('copy');
          this.$toast({ type: 'success', message: `银行卡号 ${val} 复制成功` });
        }
        document.body.removeChild(input);
      },
    }

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
