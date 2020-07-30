<template>
  <div class="pg-page">

    <div class="p-20">
      <div class="d-flex">
        <pg-select v-model="query.province_code" @change="changeProvince">
          <pg-option value="" v-if="app.userInfo.opt_type === 'global'">全部</pg-option>
          <pg-option
            v-for="item in provinceListAuth"
            :key="item.code"
            :value="item.code"
          >{{ item.title }}</pg-option>
        </pg-select>
        <pg-select class="ml-20" v-model="query.city_id" placeholder="按县域筛选" searchable clearable @change="changeQuery" :disabled="!query.province_code">
          <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
        </pg-select>
        <pg-datepicker class="ml-20" v-model="query.delivery_date" @change="changeQuery" clearable placeholder="配送日期"></pg-datepicker>
        <pg-search class="w-25 ml-20" clearable placeholder="收货人姓名" v-model="query.condition" @change="changeQuery"/>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
      </div>

      <div class="d-flex mt-10">
        <div v-if="app.auth.isAdmin || app.auth.ClsOrderStoreDelivery">
          <pg-confirm
            help-text="确认选中订单批量发货"
            @confirm="handleDeliveryItem(selectionItems)"
          >
            <pg-button color="primary" :disabled="selectionItems.length <= 0">批量发货</pg-button>
          </pg-confirm>
          <pg-confirm
            help-text="确认门店订单一键发货"
            @confirm="handleDeliveryAll"
          >
            <pg-button color="primary" class="ml-20">一键发货</pg-button>
          </pg-confirm>
        </div>
        <div class="ml-auto" v-if="app.auth.isAdmin || app.auth.ClsOrderStoreExport">
          <pg-button @click="handleExportItem">导出商品汇总</pg-button>
          <pg-button class="ml-20" @click="handleExportDetail">导出订单明细</pg-button>
          <pg-button class="ml-20" @click="handleExport">导出订单</pg-button>
        </div>
      </div>

      <div class="card mt-10">
        <div class="card-header font-weight-bolder">
          <pg-tabs v-model="query.status" @change="changeStatus">
            <pg-tab index="">全部</pg-tab>
            <pg-tab v-for="item in Constant.ORDER_STORE_STATUS()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
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
            :checkable="query.status === 'init'"
            @selection="onSelectionItems"
          >
            <pg-column title="门店" width="180px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  <a class="text-dark" @click="handleDetailItem(row)">
                    {{ row.store && row.store.title || '-' }}
                  </a>
                </div>
              </template>
            </pg-column>
            <pg-column title="地址">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.store && row.store.address || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="联系方式" width="160px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.store && row.store.linkman || '' }} {{ row.store && row.store.phone || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="县域" width="90px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.city && row.city.title || '-' }}
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
                  <span :class="`status-dot mr-5 bg-${Constant.ORDER_STORE_STATUS('color')[row.status]}`"></span>
                  {{ Constant.ORDER_STORE_STATUS('enum')[row.status] || row.status || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="配送日期" prop="delivery_date" width="90px">
            </pg-column>
            <pg-column title="操作" width="80px">
              <template v-slot="{row}">
                <pg-confirm
                  help-text="确认门店订单发货"
                  v-if="row.status === 'init' && (app.auth.isAdmin || app.auth.ClsOrderStoreDelivery)"
                  @confirm="handleDeliveryItem([row])"
                >
                  <a class="text-decoration-none">发货</a>
                </pg-confirm>
              </template>
            </pg-column>

          </pg-table>
        </div>
        <div class="card-footer d-flex">
          <div v-if="app.auth.isAdmin || app.auth.ClsOrderStoreDelivery">
            <pg-confirm
              help-text="确认选中订单批量发货"
              @confirm="handleDeliveryItem(selectionItems)"
            >
              <pg-button color="primary" :disabled="selectionItems.length <= 0">批量发货</pg-button>
            </pg-confirm>
            <pg-confirm
              help-text="确认门店订单一键发货"
              @confirm="handleDeliveryAll"
            >
              <pg-button color="primary" class="ml-20">一键发货</pg-button>
            </pg-confirm>
          </div>
          <pg-pagination class="ml-auto" :num="list.num" v-model="query" @change="orderStoreQuery"/>
        </div>
      </div>
    </div>

    <pg-drawer v-model="drawer.visible" width="700px">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">{{drawer.item.store && drawer.item.store.title || ''}} 门店订单详情</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${Constant.ORDER_STORE_STATUS('color')[drawer.item.status]} badge-outline ml-20`"
          >
            {{ Constant.ORDER_STORE_STATUS('enum')[drawer.item.status] || drawer.item.status || '-' }}
          </div>
        </div>
      </template>
      <store-detail
        v-if="drawer.visible"
        :item="drawer.item"
      />
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';
  import storeDetail from './store-detail';

  export default {
    name: 'order-store',
    components: {storeDetail},
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
        selectionItems: [],
        provinceListAuth: [],
        cityList: [],
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      document.title = '门店订单 - 零售中心 - 蒲公英运营管理系统';
      this.initQuery();
      this.orderStoreQuery();
      this.commonProvinceListAuth();
      this.commonCityList();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code,
          city_id: '',
          delivery_date: '',
          condition: '',
          page: 1,
          page_size: 20,
        }
      },

      changeProvince() {
        this.$data.query.city_id = '';
        this.commonCityList();
        this.changeQuery();
      },

      changeStatus() {
        this.$data.selectionItems = [];
        this.changeQuery();
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.orderStoreQuery();
      },

      resetQuery() {
        this.initQuery();
        this.orderStoreQuery();
      },

      orderStoreQuery() {
        Http.get(Api.orderStoreQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      onSelectionItems(items) {
        this.$data.selectionItems = items;
      },

      handleDetailItem(item) {
        Http.get(Api.orderStoreDetail, { id: item.id })
          .then(res => {
            this.$data.drawer = { visible: true, item: res.data || {} }
          })
      },

      handleDeliveryItem(items) {
        this.$loading.show();
        Http.post(Api.orderStoreDelivery, { ids: items.map(item => item.id) })
          .then(() => {
            this.$loading.hide();
            this.$toast({ type: 'success', message: '批量发货成功' });
            this.orderStoreQuery();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      handleDeliveryAll() {
        this.$loading.show();
        Http.post(Api.orderStoreDeliveryAll, { province_code: this.$data.query.province_code })
          .then(() => {
            this.$loading.hide();
            this.$toast({ type: 'success', message: '一键发货成功' });
            this.orderStoreQuery();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      handleSubmit() {
        this.handleCancel();
        this.orderStoreQuery();
      },

      handleCancel() {
        this.$data.dialog = { type: 'add', visible: false, item: {} };
      },

      handleExportItem() {
        this.$loading.show();
        Http.get(Api.orderStoreItemExportCheck, this.$data.query)
          .then(() => {
            return Http.download(Api.orderStoreItemExport, this.$data.query, { filename: '门店订单商品汇总.xls' })
          })
          .then(() => {
            this.$loading.hide();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      handleExportDetail() {
        this.$loading.show();
        Http.get(Api.orderStoreDetailExportCheck, this.$data.query)
          .then(() => {
            return Http.download(Api.orderStoreDetailExport, this.$data.query, { filename: '门店订单明细.xls' })
          })
          .then(() => {
            this.$loading.hide();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      handleExport() {
        this.$loading.show();
        Http.get(Api.orderStoreExportCheck, this.$data.query)
          .then(() => {
            return Http.download(Api.orderStoreExport, this.$data.query, { filename: '门店订单.xls' })
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

      commonCityList() {
        Http.get(Api.commonCityList, { province_code: this.$data.query.province_code })
          .then(res => {
            this.$data.cityList = res.data || [];
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
