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

        <pg-select class="ml-20" v-model="query.reason" placeholder="按售后原因筛选" searchable clearable @change="changeQuery">
          <pg-option v-for="item in reasonTypeList" :key="item.value" :value="item.value">{{ item.id }}</pg-option>
        </pg-select>

         <pg-datepicker class="ml-20" style="width: 450px;" v-model="query" range quickable @change="changeQuery" clearable placeholder="申请时间"></pg-datepicker>

      </div>


      <div class="d-flex mt-10">

        <pg-button-group style="width: 238px" v-model="query.is_restore" :options="{ '全部': '', '退款': 0, '退货退款': 1 }" @change="changeRestoreType" />

        <pg-search class="ml-20" style="width: 386px" clearable placeholder="客户手机号、售后单号、关联零售单号、售后商品、门店" v-model="query.condition" @change="changeQuery"/>

        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>

        <pg-button color="primary" class="ml-auto" @click="handleRule" v-if="app.auth.isAdmin || app.auth.ClsOrderAftersaleRule">售后规则</pg-button>
      
        <div class="ml-20" v-if="app.auth.isAdmin || app.auth.ClsOrderAfterSaleExport">
          <pg-button @click="handleExport">导出售后单</pg-button>
        </div>
      </div>

      <div class="card mt-10">
        <div class="card-header font-weight-bolder">
          <pg-tabs v-model="query.status" @change="changeStatus">
            <pg-tab :index="tab_index">全部</pg-tab>

            <template v-if="query.is_restore === ''">
              <pg-tab v-for="item in Constant.AFTER_SALE_STATUS()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
            </template>

            <template v-if="query.is_restore === 1">
              <pg-tab v-for="item in Constant.AFTER_NORESTORE_SALE()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
            </template>
            <template v-if="query.is_restore === 0">
              <pg-tab v-for="item in Constant.AFTER_RESTORE_SALE()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
            </template>
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

            <template v-slot:expand-row="{row}">
              <div class="p-15">
                <div class="row">
                  <div class="col-3">
                    售后商品：{{ row.item_title || '-' }}
                  </div>
                  <div class="col-2">
                    售后数量：{{ row.aftersale_num || '-' }}件
                  </div>
                  <div class="col-3">
                    售后金额：{{ `¥${Handle.returnPrice(row.aftersale_amount)}` || '-' }}
                  </div>
                  <div class="col-3" v-if="row.reason == ''">
                    -
                  </div>
                  <div class="col-3" v-if="row.reason == 'quality'">
                    售后原因：质量有问题
                  </div>
                  <div class="col-3" v-if="row.reason == 'unreceived'">
                    售后原因：未收到
                  </div>
                  <div class="col-3" v-if="row.reason == 'discrepancy'">
                    售后原因：实物与描述不符
                  </div>
                  <div class="col-3" v-if="row.reason == 'mistake'">
                    售后原因：仓库发错货
                  </div>
                </div>
                <div class="row mt-10">
                  <div class="col-3">
                    申请时间：{{row.created || '-'}}
                  </div>
                  <div class="col-3">
                    售后比例：{{ `${Handle.returnPercent(row.percent)}%` || '-' }}
                  </div>
                </div>
              </div>
            </template>
            <pg-column title="售后单号" width="150px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  <a class="text-dark" @click="handleDetailItem(row)">
                    {{ row.code || '-' }}
                  </a>
                </div>
              </template>
            </pg-column>
            <pg-column title="关联零售单号" width="150px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.order_code || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="联系方式" width="160px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.phone || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="门店" width="160px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.store_title || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="是否退货" width="60px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.is_restore ? '退货退款' : '退款' }}
                </div>
              </template>
            </pg-column>

            <pg-column title="售后状态" width="80px" text-align="center">
              <template v-slot="{row}">
                <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                  <span :class="`status-dot mr-5 bg-${Constant.AFTER_SALE_STATUS('color')[row.status]}`"></span>
                  {{ Constant.AFTER_SALE_STATUS('enum')[row.status] || row.status || '-' }}
                </div>
              </template>
            </pg-column>

          </pg-table>
        </div>
        <div class="card-footer d-flex">
          <pg-pagination class="ml-auto" :num="list.num" v-model="query" @change="orderAfterSaleQuery"/>
        </div>
      </div>
    </div>

    <pg-drawer v-model="drawer.visible" width="700px">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">售后订单详情</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${Constant.AFTER_SALE_STATUS('color')[drawer.item.status]} badge-outline ml-20`"
          >
            {{ Constant.AFTER_SALE_STATUS('enum')[drawer.item.status] || drawer.item.status || '-' }}
          </div>
        </div>
      </template>
      <after-sale-detail
        v-if="drawer.visible"
        :item="drawer.item"
      />
    </pg-drawer>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'rule'" :title="`售后规则`">
      <after-sale-rule
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'reject'" :title="`拒绝售后单`">
      <after-sale-reject
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

  import { Http, Api, Handle, Constant } from '@/util';
  import afterSaleDetail from './after-sale-detail';
  import afterSaleRule from './after-sale-rule';
  import afterSaleReject from './after-sale-reject';

  export default {
    name: 'after-sale',
    components: {afterSaleDetail, afterSaleRule, afterSaleReject},
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
        cityList: [],
        reasonTypeList: [
          {id: '未收到',value: 'unreceived'},
          {id: '质量有问题',value: 'quality'},
          {id: '实物与描述不符',value: 'discrepancy'},
          {id: '仓库发错货',value: 'mistake'},
        ],
        tab_index: '',
        dialog: {
          visible: false,
          type: 'rule',
          item: {}
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      document.title = '售后单 - 零售中心 - 蒲公英运营管理系统';
      this.initQuery();
      this.orderAfterSaleQuery();
      this.commonProvinceListAuth();
      this.commonCityList();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          status: '',//售后订单状态
          reason: '',//售后原因
          is_restore: '',//是否退货
          condition: '',//售后商品, 门店，售后单号，关联零售单号,用户手机号
          page: 1,
          page_size: 20,
          province_code: this.app.userInfo.province_code,
          city_id: '',
        }
      },

      changeProvince() {
        this.$data.query.city_id = '';
        this.commonCityList();
        this.changeQuery();
      },

      changeStatus() {
        this.changeQuery();
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.orderAfterSaleQuery();
      },

      changeRestoreType() {
        this.$data.query.status = '';
        this.$data.query.page = 1;
        this.orderAfterSaleQuery();
      },

      resetQuery() {
        this.initQuery();
        this.orderAfterSaleQuery();
      },

      orderAfterSaleQuery() {
        Http.get(Api.orderAfterSaleQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleDetailItem(item) {
        Http.get(Api.orderAfterSaleDetail, { id: item.id })
          .then(res => {
            console.log(res)
            this.$data.drawer = { visible: true, item: res.data || {} }
          })
      },

      handleRejectItem(item) {
         this.$data.dialog = { visible: true, type: 'reject', item: item };
      },

      handleAuditItem(items) {
        this.$loading.show();
        Http.post(Api.orderAfterSaleAudit, { id: (items.map(item => item.id))[0] })
          .then(() => {
            this.$loading.hide();
            this.$toast({ type: 'success', message: '审核成功' });
            this.orderAfterSaleQuery();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      handleRule() {
        this.$data.dialog = { visible: true, type: 'rule', item: {} };
      },

      handleExport() {
        this.$loading.show();
        Http.get(Api.orderAfterSaleExportCheck, this.$data.query)
          .then(() => {
            return Http.download(Api.orderAfterSaleExport, this.$data.query, { filename: '售后单.xls' })
          })
          .then(() => {
            this.$loading.hide();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      handleSubmit() {
        this.handleCancel();
        this.orderAfterSaleQuery();
      },

      handleCancel() {
        this.$data.dialog = { type: 'rule', visible: false, item: {} };
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
