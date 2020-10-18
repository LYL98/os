<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-select
        v-model="query.province_code"
        :clearable="false"
        class="ml-0"
        placeholder="按区域筛选"
        @change="changeProvince"
      >
        <pg-option :key="1" :value="''">全部</pg-option>
        <pg-option v-for="item in provinceList" :key="item.code" :value="item.code">{{ item.title }}</pg-option>
      </pg-select>
      <pg-select
        v-model="query.zone_id"
        :clearable="query.city_id ? false : true"
        class="ml-20"
        placeholder="按片区筛选"
        :disabled="query.province_code ? false : true"
        @change="changeZone"
      >
        <pg-option v-for="item in zoneList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
      </pg-select>
      <pg-select
        v-model="query.city_id"
        :clearable="true"
        class="ml-20"
        placeholder="按县域筛选"
        :disabled="query.province_code ? query.zone_id ? false : true : true"
        @change="changeQuery"
      >
        <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
      </pg-select>
      <pg-select
        class="ml-20"
        v-model="query.csm_id"
        @change="changeQuery"
        clearable
        searchable
        placeholder="按客户经理筛选"
      >
        <pg-option v-for="item in salesmanList" :key="item.id" :value="item.id">{{ item.realname }}({{item.phone }})</pg-option>
      </pg-select>
      <pg-select
        class="ml-20"
        v-model="query.vip_level"
        @change="changeQuery"
        clearable
        searchable
        placeholder="按会员等级筛选"
      >
        <pg-option v-for="item in vipList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
      </pg-select>
    </div>
    <div class="d-flex mt-10">

      <pg-button-group v-model="query.is_post_pay" :options="{ '全部': '', '协议': 1, '非协议': 0 }" @change="changeQuery"/>
      <pg-button-group class="ml-20" v-model="query.has_location" :options="{ '全部': '', '已定位': 1, '无定位': 0 }" @change="changeQuery"/>

      <pg-datepicker
        style="width: 460px"
        class="ml-20"
        quickable
        range
        clearable
        v-model="query"
        @change="changeQuery"
        placeholder="创建时间"
      />

    </div>

    <div class="d-flex mt-10">
      <pg-search style="width: 440px" placeholder="门店名称、用户名称/电话" clearable v-model="query.condition" @change="changeQuery"/>
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
      <div class="ml-auto">
        <pg-button v-if="app.auth.isAdmin || app.auth.MerchantExport" @click="handleExport">
          导出商户列表
        </pg-button>
        <pg-button class="ml-20" color="primary" v-if="app.auth.isAdmin || app.auth.MerchantAdd" @click="handleAddItem">
          创建商户
        </pg-button>
      </div>
    </div>

    <div class="card mt-10">
      <div class="card-header font-weight-bolder">
        <pg-tabs v-model="query.status" @change="changeQuery">
          <pg-tab index="">全部</pg-tab>
          <pg-tab v-for="item in Constant.MERCHANT_STORE_STATUS()" :index="item.value" :key="item.value">
            {{ item.label }}
          </pg-tab>
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
          <pg-column title="门店名称" width="220px">
            <template v-slot="{row}">
              <a class="text-dark" v-if="app.auth.isAdmin || app.auth.MerchantAuditDetail" @click="handleDetailMerchant(row)">{{ row.title || '-' }}</a>
              <span v-else>{{ row.title || '-' }}</span>
            </template>
          </pg-column>
          <pg-column title="会员等级" width="80px">
            <template v-slot="{row}">
              {{ row.vip_title || '-' }}
            </template>
          </pg-column>
          <pg-column title="黑名单" width="60px">
            <template v-slot="{row}">
              <span class="badge badge-sm badge-danger py-2" v-if="row.is_black">是</span>
              <span class="badge badge-sm badge-primary py-2" v-else>否</span>
            </template>
          </pg-column>
          <pg-column title="商户名称" width="220px">
            <template v-slot="{row}">
              {{ row.merchant && row.merchant.title || '-' }}
            </template>
          </pg-column>
          <pg-column title="协议商户" width="70px">
            <template v-slot="{row}">
              <span class="badge badge-sm badge-success py-2" v-if="row.merchant && row.merchant.is_post_pay">是</span>
              <span class="badge badge-sm badge-warning py-2" v-else>否</span>
            </template>
          </pg-column>
          <pg-column title="县域" width="100px">
            <template v-slot="{row}">
              {{ row.city && row.city.title || '-' }}
            </template>
          </pg-column>
          <pg-column title="状态" width="70px" text-align="center">
            <template v-slot="{row}">
              <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                <span :class="`status-dot mr-5 bg-${Constant.MERCHANT_STORE_STATUS('color')[row.status]}`"></span>
                {{ Constant.MERCHANT_STORE_STATUS('enum')[row.status] || row.status || '-' }}
              </div>
            </template>
          </pg-column>
          <pg-column prop="" title="操作" width="120px">
            <template v-slot="{row}">
              <pg-confirm
                help-text="确认审核通过该门店"
                v-if="(app.auth.isAdmin || app.auth.MerchantStoreApprove) && row.status === 'wait_audit'"
                @confirm="handleApproveItem(row)"
              >
                <a class="text-decoration-none mr-10">审核通过</a>
              </pg-confirm>
              <pg-confirm
                help-text="确认冻结该门店"
                v-if="(app.auth.isAdmin || app.auth.MerchantStoreFreeze) && row.status === 'business'"
                @confirm="handleFreezeItem(row)"
              >
                <a class="text-decoration-none mr-10">冻结</a>
              </pg-confirm>
              <pg-confirm
                help-text="确认解冻该门店"
                v-if="(app.auth.isAdmin || app.auth.MerchantStoreUnFreeze) && row.status === 'freeze'"
                @confirm="handleUnFreezeItem(row)"
              >
                <a class="text-decoration-none mr-10">解冻</a>
              </pg-confirm>
              <pg-confirm
                help-text="确认删除该门店"
                v-if="app.auth.isAdmin || app.auth.MerchantStoreDelete"
                @confirm="handleDeleteItem(row)"
              >
                <a class="text-decoration-none">删除</a>
              </pg-confirm>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="storeQuery"/>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" title="新增商户" width="900px">
      <merchant-edit
        v-if="dialog.visible"
        :type="dialog.type"
        module="merchant"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" :title="`商户详情`" width="900px">
      <merchant-detail
        v-if="drawer.visible"
        :type="drawer.type"
        :merchant_id="drawer.item.merchant_id"
        :storeQuery="storeQuery"
      />
    </pg-drawer>

  </div>

</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

import merchantEdit from './merchant-edit';
import merchantDetail from './merchant-detail';

export default {
  name: 'store',
  components: {merchantEdit, merchantDetail},
  inject: ['app'],
  data() {
    return {
      query: {},
      list: {
        items: [],
      },
      dialog: {
        visible: false,
        type: 'modify',
        item: {}
      },
      drawer: {
        type: 'detail',
        visible: false,
        item: {}
      },
      provinceList: [],//区域列表
      zoneList: [],
      cityList: [],
      salesmanList: [],
      vipList: [],
    }
  },

  watch: {},

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    this.initQuery();
    this.commonProvinceList();
    this.commonOperatorList();
    this.commonVipList();
    this.storeQuery();
  },

  methods: {
    initQuery() {
      this.$data.query = {
        status: '',
        is_post_pay: '',
        has_location: '',
        province_code: '',
        csm_id: '',
        zone_id: '',
        city_id: '',
        condition: '',
        begin_date: '',
        end_date: '',
        vip_level: '',
        page: 1,
        page_size: 20,
      }
    },

    changeQuery() {
      this.$data.query.page = 1;
      this.storeQuery();
    },

    resetQuery() {
      this.initQuery();
      this.storeQuery();
    },
    changeProvince() {
      this.$data.zoneList = [];
      this.$data.cityList = [];
      this.$data.query.zone_id = '';
      this.$data.query.city_id = '';

      this.commonZoneList();
      this.changeQuery()
    },
    changeZone() {
      this.$data.cityList = [];
      this.$data.query.city_id = '';
      this.commonCityList()
      this.changeQuery()
    },

    storeQuery() {
      Http.get(Api.storeQuery, this.$data.query)
        .then(res => {
          this.$data.list = res.data || {items: []}
        });
    },

    handleAddItem() {
      this.$data.dialog = {visible: true, type: 'add', item: {}};
    },

    handleDetailMerchant(item) {
      this.$data.drawer = {visible: true, type: 'detail', item: item};
    },

    handleApproveItem(item) {
      this.$loading.show();
      Http.post(Api.storeApprove, {id: item.id})
        .then(() => {
          this.storeQuery();
          this.$toast({message: '商户审核通过', type: 'success'});
          this.$loading.hide();
        })
        .catch(() => {
          this.$loading.hide();
        });
    },

    handleFreezeItem(item) {
      this.$loading.show();
      Http.post(Api.storeFreeze, {id: item.id})
        .then(() => {
          this.storeQuery();
          this.$toast({message: '门店冻结成功', type: 'success'});
          this.$loading.hide();
        })
        .catch(() => {
          this.$loading.hide();
        });
    },

    handleUnFreezeItem(item) {
      this.$loading.show();
      Http.post(Api.storeUnFreeze, {id: item.id})
        .then(() => {
          this.storeQuery();
          this.$toast({message: '门店解冻成功', type: 'success'});
          this.$loading.hide();
        })
        .catch(() => {
          this.$loading.hide();
        });
    },

    handleDeleteItem(item) {
      this.$loading.show();
      Http.post(Api.storeDelete, {id: item.id})
        .then(() => {
          this.storeQuery();
          this.$toast({message: '门店删除成功', type: 'success'});
          this.$loading.hide();
        })
        .catch(() => {
          this.$loading.hide();
        });
    },

    handleExport() {
      this.$loading.show();
      const query = this.$data.query;
      Http.get(Api.merchantExportCheck, query)
        .then(() => {
          return Http.download(Api.merchantExport, query, {filename: '商户列表.xls'})
        })
        .then(() => {
          this.$loading.hide();
        })
        .catch(() => {
          this.$loading.hide();
        });
    },

    handleSubmit() {
      this.handleCancel();
      this.storeQuery();
    },

    handleCancel() {
      this.$data.dialog = {visible: false, type: 'add', item: {}};
    },

    //区域列表
    commonProvinceList() {
      Http.get(Api.commonProvinceListAuth).then(res => {
        this.$data.provinceList = res.data || [];
      });
    },
    //片区列表
    commonZoneList() {
      Http.get(Api.commonZoneList, {
        province_code: this.$data.query.province_code
      }).then(res => {
        this.$data.zoneList = res.data || [];
      });
    },
    //县域列表
    commonCityList() {
      Http.get(Api.commonCityList, {
        province_code: this.$data.query.province_code,
        zone_id: this.$data.query.zone_id
      }).then(res => {
        this.$data.cityList = res.data || [];
      });
    },
    commonOperatorList() {
      Http.get(Api.commonOperatorList, {post: 'salesman', is_freeze: 0})
        .then(res => {
          this.$data.salesmanList = res.data || [];
        });
    },
    commonVipList() {
      Http.get(Api.commonVipList)
        .then(res => {
          this.$data.vipList = res.data || [];
        });
    },
  }
}
</script>

<style scoped>
.status-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
</style>
