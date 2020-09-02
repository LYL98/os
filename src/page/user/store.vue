<template>
  <div class="pg-page">

    <div class="p-20">
      <div class="d-flex">
        <pg-select v-model="query.province_code" @change="changeProvince">
          <pg-option
            v-for="item in provinceListAuth"
            :key="item.code"
            :value="item.code"
          >{{ item.title }}</pg-option>
        </pg-select>
        <pg-select class="ml-20" v-model="query.city_id" placeholder="按县域筛选" searchable clearable @change="changeQuery" :disabled="!query.province_code">
          <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
        </pg-select>
        <pg-search class="w-25 ml-20" clearable placeholder="门店名称" v-model="query.condition" @change="changeQuery"/>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>

<!--        <div class="ml-auto">-->
<!--          <pg-button color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.ClsUserStoreAdd">新增</pg-button>-->
<!--        </div>-->
      </div>

      <div class="card mt-10">
        <div class="card-body">
          <pg-table
            fixed-header
            :data="list.items"
            primary-key="id"
            :page="query.page"
            :page-size="query.page_size"
            borderless
          >
            <pg-column title="门店名称" width="140px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.title || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="门店地址" width="260px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.address || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="推广者分润比例" prop="promoter_rate" width="70px" text-align="center">
              <template v-slot="{row}">
                {{ row.promoter_rate ? `${Handle.returnPercent(row.promoter_rate)}%` : '-' }}
              </template>
            </pg-column>
            <pg-column title="联系方式" width="110px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.phone || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="县域" width="80px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.city && row.city.title || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="账户余额" width="90px" text-align="center">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  <span v-if="row.balance">¥{{ Handle.returnPrice(row.balance) }}</span>
                  <span v-else>-</span>
                </div>
              </template>
            </pg-column>
            <pg-column title="创建时间" prop="created" width="140px"></pg-column>
            <pg-column title="操作" width="80px">
              <template v-slot="{row}">
                <a class="text-decoration-none" @click="handleBalanceItem(row)" v-if="app.auth.isAdmin || app.auth.ClsUserStoreBalanceLogs">余额明细</a>
              </template>
            </pg-column>

          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination :num="list.num" v-model="query" @change="userStoreQuery"/>
        </div>
      </div>
    </div>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'detail'" :title="`${drawer.item && drawer.item.title || ''} 门店详情`" width="700px">
      <template slot="header">
        <div class="d-flex">
          <h3 class="mb-0">{{drawer.item && drawer.item.title || ''}} 门店详情</h3>
          <div
            class="ml-20 badge badge-sm badge-outline"
            :class="`${drawer.item && drawer.item.is_freeze_header ? 'badge-danger' : 'badge-primary'}`"
          >
            {{ drawer.item && drawer.item.is_freeze_header ? '已冻结' : '正常' }}
          </div>
        </div>
      </template>
      <store-detail
        v-if="drawer.visible"
        :item="drawer.item"
        @submit="handleSubmit"
      />
    </pg-drawer>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'balance'" :title="`${drawer.item && drawer.item.title || ''} 余额明细`" width="700px">
      <store-balance
        v-if="drawer.visible"
        :item="drawer.item"
      />
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';
  import storeDetail from './store-detail';
  import storeBalance from './store-balance';

  export default {
    name: 'user-store',
    components: {storeDetail, storeBalance},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          type: 'add',
          visible: false,
          item: {}
        },
        drawer: {
          type: 'detail',
          visible: false,
          item: {}
        },
        loading: false,
        provinceListAuth: [],
        cityList: [],
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      document.title = '零售门店 - 零售中心 - 蒲公英运营管理系统';
      this.initQuery();
      this.userStoreQuery();
      this.commonProvinceListAuth();
      this.commonCityList();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          gb_included: 1, // 表示已经开启团购的门店
          is_audited: 1, // 是否通过审核
          province_code: this.app.userInfo.province_code,
          city_id: '',
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

      changeQuery() {
        this.$data.query.page = 1;
        this.userStoreQuery();
      },

      resetQuery() {
        this.initQuery();
        this.userStoreQuery();
      },

      userStoreQuery() {
        Http.get(Api.userStoreQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleDetailItem(item) {
        this.$data.drawer = { type: 'detail', visible: true, item: item }
      },

      handleBalanceItem(item) {
        this.$data.drawer = { type: 'balance', visible: true, item: item }
      },

      // handleFreezeItem(item) {
      //   Http.post(!item.is_freeze_header ? Api.userStoreFreeze : Api.userStoreUnFreeze, {store_id: item.id})
      //     .then(() => {
      //       this.$toast({ type: 'success', message: `门店${!item.is_freeze_header ? '冻结' : '解冻'}成功` });
      //       this.userStoreQuery();
      //     });
      // },

      handleSubmit() {
        this.handleCancel();
        this.userStoreQuery();
      },

      handleCancel() {
        this.$data.dialog = { type: 'add', visible: false, item: {} };
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

</style>
