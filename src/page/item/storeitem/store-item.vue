<template>
  <div class="p-20">
    <div class="d-flex">

      <pg-button-group style="width: 238px" v-model="query.is_on_sale" :options="{ '全部': '', '上架': 1, '下架': 0 }" @change="changeQuery" />

      <pg-select class="ml-20" v-model="query.province_code" @change="changeProvince">
        <pg-option value="" v-if="app.userInfo.opt_type === 'global'">全部</pg-option>
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{ item.title }}</pg-option>
      </pg-select>

      <pg-cascader
        class="ml-20"
        level='4'
        style="width:200px;"
        :options="systemClassTree"
        v-model="query.system_class_code"
        @change="changeQuery"
        placeholder="按科学分类筛选"
        clearable
      />
      <pg-search class="w-25 ml-20" clearable placeholder="商品名称、门店" v-model="query.condition" @change="changeQuery"/>

      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>

      <div class="ml-auto">
        <pg-button @click="handleExport" v-if="app.auth.isAdmin || app.auth.ClsItemSubitemExport">导出</pg-button>
      </div>

    </div>

    <div class="card mt-10">
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
                  更新时间：{{ row.updated || '-' }}
                </div>
                <div class="col-3">
                  更新人：{{ row.updater && row.updater.realname || '-' }}
                </div>
              </div>
            </div>

          </template>

          <pg-column prop="item_spec" class="overflow-ellipsis" title="商品名称" width="270px">
            <template v-slot="{row}">
              <a class="text-dark" @click="handleDetailItem(row)">
                {{ row.title || '-' }}
              </a>
            </template>
          </pg-column>

          <pg-column title="所属门店" class="overflow-ellipsis" prop="opt_type" width="200px">
            <template v-slot="{row}">
              {{ row.store && row.store.title}}
            </template>
          </pg-column>

          <pg-column title="科学分类" class="overflow-ellipsis" prop="system_classes" width="200px">
            <template v-slot="{row}">
              <span v-for="(item,index) in row.system_classes" :key="item">{{item.title}}{{index===(row.system_classes.length-1)?'':'/'}}</span>
            </template>
          </pg-column>

          <pg-column title="商品售价" prop="opt_type" width="100px">
            <template v-slot="{row}">
              {{ `¥${Handle.returnPrice(row.price_sale)}` || '-' }}
            </template>
          </pg-column>

          <pg-column title="当前库存" prop="opt_type" width="100px">
            <template v-slot="{row}">
              {{ row.stock || '-' }}件
            </template>
          </pg-column>

          <pg-column prop="is_on_sale" title="状态" width="120px">
            <template v-slot="{row}">
              <pg-confirm
                v-if="app.auth.isAdmin || app.auth.ClsItemStoreitemGround"
                :help-text="`确定${row.is_on_sale ? '下架' : '上架'}该产品`"
                @confirm="handleSaleItem(row)"
              >
                <pg-switch :value="row.is_on_sale"/>
              </pg-confirm>
              <span v-else>{{ row.is_on_sale ? '上架' : '下架' }}</span>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="subitemQuery"/>
      </div>
    </div>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'detail'" :title="`门店现货商品-${drawer.item.title}-商品详情`" width="800px">
      <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`">
        <store-item-detail
          v-if="drawer.visible"
          :type="drawer.type"
          :item="drawer.item"
        />
      </div>
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import storeItemDetail from './store-item-detail';

  export default {
    name: 'store-item',
    components: {storeItemDetail},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          visible: false,
          type: 'on',
          item: {}
        },
        drawer: {
          visible: false,
          type: 'detail',
          item: {}
        },
        systemClassTree: [],
        provinceListAuth: [],
      }
    },

    watch: {
      'app.userInfo.province_code': {
        handler(val) {
          this.$data.query.province_code = val;
          this.changeQuery();
        }
      }
    },

    created() {
      document.title = '当日达商品 - 零售中心 - 蒲公英运营管理系统';
      this.Handle = Handle;
      this.initQuery();
      this.subitemQuery();
      this.commonSystemClassTree();
      this.commonProvinceListAuth();
      this.commonCityList();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          display_class_id: '', // 展示分类
          display_sec_id: '',
          system_class_code: '', // 分类
          condition: '',
          is_presale: '', // 预售商品
          is_on_sale: '', // 在售 1 待售 0
          item_type: 'store',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.subitemQuery();
      },

      resetQuery() {
        this.initQuery();
        this.subitemQuery();
      },

      subitemQuery() {
        Http.get(Api.subitemQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleDetailItem(item) {
        Http.get(Api.subitemDetail, { id: item.id })
          .then(res => {
            this.$data.drawer = { visible: true, type: 'detail', item: res.data || {} };
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.subitemQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, type: 'on', item: {} };
      },

      commonSystemClassTree() {
        Http.get(Api.commonSystemClassTree)
          .then(res => {
            this.$data.systemClassTree = res.data || [];
          });
      },

      commonProvinceListAuth() {
        Http.get(Api.commonProvinceListAuth)
          .then(res => {
            this.$data.provinceListAuth = res.data || [];
          });
      },

      changeProvince() {
        this.$data.query.city_id = '';
        this.commonCityList();
        this.changeQuery();
      },

      commonCityList() {
        Http.get(Api.commonCityList, { province_code: this.$data.query.province_code })
          .then(res => {
            this.$data.cityList = res.data || [];
          });
      },

      handleSaleItem(item) {
        Http.post(!item.is_on_sale ? Api.storeItemOnSale : Api.storeItemUnderSale, {id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: `${!item.is_on_sale ? '上架' : '下架'}成功` });
            this.subitemQuery();
          });
      },

      handleExport() {
        this.$loading.show();
        const query = this.$data.query;
        Http.get(Api.subitemExportCheck, query)
          .then(() => {
            return Http.download(Api.subitemExport, query, { filename: '门店现货商品.xls' })
          })
          .then(() => {
            this.$loading.hide();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },
    }

  }
</script>

<style lang="scss" scoped>

</style>
