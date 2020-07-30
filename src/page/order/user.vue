<template>
  <div class="pg-page">

    <div class="p-20">
      <div class="d-flex">
        <pg-select v-model="query.province_code" @change="changeQuery" style="width: 168px;">
          <pg-option value="" v-if="app.userInfo.opt_type === 'global'">全部</pg-option>
          <pg-option
            v-for="item in provinceListAuth"
            :key="item.code"
            :value="item.code"
          >{{ item.title }}</pg-option>
        </pg-select>
        <pg-datepicker style="width: 168px;" class="ml-20" v-model="query.delivery_date" @change="changeQuery" clearable placeholder="配送日期"></pg-datepicker>
        <pg-datepicker class="ml-20" style="width: 450px;" v-model="query" range quickable @change="changeQuery" clearable placeholder="下单时间段"></pg-datepicker>
      </div>

      <div class="d-flex mt-10">
        <pg-search style="width: 356px" clearable placeholder="订单编号、收货人姓名" v-model="query.condition" @change="changeQuery"/>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
        <div class="ml-auto" v-if="app.auth.isAdmin || app.auth.ClsOrderUserExport">
          <pg-button @click="handleExport">导出订单</pg-button>
          <pg-button class="ml-20" @click="handleExportItems">导出用户明细单</pg-button>
        </div>
      </div>

      <div class="card mt-10">
        <div class="card-header font-weight-bolder">
          <pg-tabs v-model="query.status" @change="changeQuery">
            <pg-tab index="">全部</pg-tab>
            <pg-tab v-for="item in Constant.ORDER_USER_STATUS()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
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
            <pg-column title="订单编号" width="120px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  <a class="text-dark" @click="handleDetailItem(row)">
                    {{ row.code }}
                  </a>
                </div>
              </template>
            </pg-column>
            <pg-column title="收货人" width="120px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.linkman }}
                </div>
              </template>
            </pg-column>
            <pg-column title="自提点" width="200px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.store && row.store.title || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="实付金额" width="90px" text-align="center">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  <span v-if="row.item_real_amount">¥{{ Handle.returnPrice(row.item_real_amount) }}</span>
                  <span v-else>-</span>
                </div>
              </template>
            </pg-column>
            <pg-column title="状态" width="80px" text-align="center">
              <template v-slot="{row}">
                <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                  <span :class="`status-dot mr-5 bg-${Constant.ORDER_USER_STATUS('color')[row.status]}`"></span>
                  {{ Constant.ORDER_USER_STATUS('enum')[row.status] || row.status || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="配送日期" prop="delivery_date" width="90px">
            </pg-column>
            <pg-column title="下单时间" prop="created" width="140px">
            </pg-column>
            <pg-column title="操作" width="80px">
              <template v-slot="{row}">
                <pg-confirm
                  help-text="确认取消该订单"
                  v-if="row.status === 'init' || row.status === 'paid' && (app.auth.isAdmin || app.auth.ClsOrderUserCancel)"
                  @confirm="handleCancelItem(row)"
                >
                  <a class="text-decoration-none">取消</a>
                </pg-confirm>
              </template>
            </pg-column>

          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination :num="list.num" v-model="query" @change="orderUserQuery"/>
        </div>
      </div>
    </div>

    <pg-drawer v-model="drawer.visible" width="900px">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">{{drawer.item.code || ''}} 用户订单详情</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${Constant.ORDER_USER_STATUS('color')[drawer.item.status]} badge-outline ml-20`"
          >
            {{ Constant.ORDER_USER_STATUS('enum')[drawer.item.status] || drawer.item.status || '-' }}
          </div>
        </div>
      </template>
      <user-detail
        v-if="drawer.visible"
        :item="drawer.item"
      />
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';
  import userDetail from './user-detail';

  export default {
    name: 'pitem',
    components: {userDetail},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        drawer: {
          visible: false,
          item: {}
        },
        provinceListAuth: [],
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      document.title = '用户订单 - 零售中心 - 蒲公英运营管理系统';
      this.initQuery();
      this.orderUserQuery();
      this.commonProvinceListAuth();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code,
          delivery_date: '',
          begin_date: '',
          end_date: '',
          condition: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.orderUserQuery();
      },

      resetQuery() {
        this.initQuery();
        this.orderUserQuery();
      },

      orderUserQuery() {
        Http.get(Api.orderUserQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleDetailItem(item) {
        Http.get(Api.orderUserDetail, { id: item.id })
          .then(res => {
            this.$data.drawer = { visible: true, item: res.data || {} }
          })
      },

      handleCancelItem(item) {
        Http.post(Api.orderUserCancel, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '用户订单取消成功' });
            this.orderUserQuery();
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.orderUserQuery();
      },

      handleCancel() {
        this.$data.dialog = { type: 'add', visible: false, item: {} };
      },

      handleExport() {
        this.$loading.show();
        Http.get(Api.orderUserExportCheck, this.$data.query)
          .then(() => {
            return Http.download(Api.orderUserExport, this.$data.query, { filename: '用户订单.xls' })
          })
          .then(() => {
            this.$loading.hide();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      handleExportItems() {
        this.$loading.show();
        Http.get(Api.orderUserExportItemsCheck, this.$data.query)
          .then(() => {
            return Http.download(Api.orderUserExportItems, this.$data.query, { filename: '用户订单详情.xls' })
          })
          .then(() => {
            this.$loading.hide();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      commonProvinceListAuth() {
        Http.get(Api.commonProvinceListAuth)
          .then(res => {
            this.$data.provinceListAuth = res.data || [];
          });
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
