<template>
  <div>
    <div class="d-flex mx-20 mt-20 mb-10">
      <pg-datepicker
        style="width: 450px;"
        v-model="query"
        range
        quickable
        @change="changeQuery"
        clearable
        placeholder="创建日期"
      ></pg-datepicker>

      <pg-button-group
        class="ml-20"
        style="width: 262px"
        v-model="query.sale_type"
        :options="{ '全部': '', '平台': '平台', '自营': '自营' }"
        @change="changeQuery"
      ></pg-button-group>
    </div>

    <div class="d-flex mx-20 mb-10">
      <pg-select v-model="query.province_code" @change="changeProvince" style="width: 168px;">
        <pg-option value v-if="app.userInfo.opt_type === 'global'">全部</pg-option>
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{ item.title }}</pg-option>
      </pg-select>

      <pg-select
        class="ml-20"
        v-model="query.city_id"
        placeholder="按县域筛选"
        searchable
        clearable
        @change="changeQuery"
        :disabled="!query.province_code"
      >
        <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
      </pg-select>

      <pg-search
        class="ml-20"
        style="width:356px;"
        clearable
        placeholder="售后单号、门店名称、商品编号、名称"
        v-model="query.condition"
        @change="changeQuery"
      />
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>

    <div class="card mx-20">
      <div class="card-header font-weight-bolder">
        <pg-tabs v-model="query.status" @change="changeQuery">
          <pg-tab index>全部</pg-tab>
          <pg-tab
            v-for="item in Constant.RETURN_GOODS_STATUS()"
            :index="item.value"
            :key="item.value"
          >{{item.label}}</pg-tab>
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
          <pg-column prop="code" title="售后单号" width="100px">
            <template v-slot="{row}">
              <div class="overflow-ellipsis">
                <a class="text-dark" @click="handleDetailItem(row)">{{ row.code || '-' }}</a>
              </div>
            </template>
          </pg-column>
          <pg-column prop="city_title" title="县域" width="80px"></pg-column>
          <pg-column prop="store_title" title="门店名称" width="160px"></pg-column>
          <pg-column prop title="商品编号/名称" width="180px">
            <template v-slot="{row}">
              <span>{{row.item_code}}/{{row.item_title}}</span>
            </template>
          </pg-column>
          <pg-column prop title="退货数量" width="80px" text-align="center">
            <template v-slot="{row}">
              <span>{{ row.back_num ? row.back_num + '件' : '-' }}</span>
            </template>
          </pg-column>
          <pg-column prop title="状态" width="80px" text-align="center">
            <template v-slot="{row}">
              <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                <span
                  :class="`status-dot mr-5 bg-${Constant.RETURN_GOODS_STATUS('color')[row.status]}`"
                ></span>
                {{ Constant.RETURN_GOODS_STATUS('enum')[row.status] || row.status || '-' }}
              </div>
            </template>
          </pg-column>
          <pg-column prop="created" title="创建时间" width="180px"></pg-column>

          <pg-column prop title="操作" width="120px">
            <template v-slot="{row}">

              <a
                class="mr-10 text-decoration-none"
                @click="handleCloseItem(row)"
                v-if="(row.status == 'init') && (app.auth.isAdmin || app.auth.OrderSaleBackClose)"
              >关闭</a>

            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="orderSaleBackQuery" />
      </div>
    </div>

    <pg-drawer v-model="drawer.visible" width="950px">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">退货单详情</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${Constant.RETURN_GOODS_STATUS('color')[drawer.item.status]} badge-outline ml-20`"
          >{{ Constant.RETURN_GOODS_STATUS('enum')[drawer.item.status] || drawer.item.status || '-' }}</div>
        </div>
      </template>
      <return-detail v-if="drawer.visible" :item="drawer.item" />
    </pg-drawer>

    <pg-dialog v-model="dialog.visible" title="关闭退货单">
      <return-close
        v-if="dialog.visible"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>
  </div>
</template>
<script>
import { Http, Api, Handle, Constant } from '@/util'
import returnDetail from './return-detail'
import returnClose from './return-close'

export default {
  name: 'return',
  components: { returnDetail, returnClose },
  inject: ['app'],
  data() {
    return {
      query: {},
      list: {
        items: [],
      },
      dialog: {
        type: '',
        visible: false,
        item: {},
      },
      drawer: {
        visible: false,
        operation: {},
      },
      provinceListAuth: [],
      cityList: [],
      vipLevelList: [],
      operatorList: [],
    }
  },

  watch: {
    'app.userInfo.province_code': {
      handler(val) {
        this.$data.query.province_code = val
        this.changeQuery()
      },
    },
  },

  created() {
    this.Handle = Handle
    this.Constant = Constant
    document.title = '退货单 - 商城 - 蒲公英运营管理系统'
    this.initQuery()
    this.orderSaleBackQuery()
    this.commonProvinceListAuth()
    this.commonCityList()
  },

  methods: {
    initQuery() {
      this.$data.query = {
        province_code: this.app.userInfo.province_code, // 省份
        zone_id: '',
        city_id: '',
        condition: '',
        status: '',
        begin_date: '',
        end_date: '',
        sale_type: '',
        page: 1,
        page_size: 20,
      }
    },

    changeProvince() {
      this.$data.query.city_id = ''
      this.commonCityList()
      this.changeQuery()
    },

    changeQuery() {
      this.$data.query.page = 1
      this.orderSaleBackQuery()
    },

    resetQuery() {
      this.initQuery()
      this.orderSaleBackQuery()
    },

    orderSaleBackQuery() {
      Http.get(Api.orderSaleBackQuery, this.$data.query).then((res) => {
        this.$data.list = res.data || { items: [] }
      })
    },

    handleDetailItem(item) {
      Http.post(Api.orderSaleBackDetail, { id: item.id }).then((res) => {
        this.$data.drawer = { visible: true, item: res.data || {} }
      })
    },

    handleCloseItem(item) {
      this.$data.dialog = { visible: true, item: item };
    },

    handleSubmit() {
      this.handleCancel()
      this.orderSaleBackQuery()
    },

    handleCancel() {
      this.$data.dialog = { type: 'add', visible: false, item: {} }
    },

    handleExport() {
      this.$loading.show()
      Http.get(Api.orderAftersaleListExportCheck, this.$data.query)
        .then(() => {
          return Http.download(Api.orderAftersaleListExport, this.$data.query, {
            filename: '导出售后汇总表.xls',
          })
        })
        .then(() => {
          this.$loading.hide()
        })
        .catch(() => {
          this.$loading.hide()
        })
    },

    handleExportItems() {
      this.$loading.show()
      Http.get(Api.orderAftersaleRespListExportCheck, this.$data.query)
        .then(() => {
          return Http.download(
            Api.orderAftersaleRespListExport,
            this.$data.query,
            {
              filename: '导出售后追责表.xls',
            }
          )
        })
        .then(() => {
          this.$loading.hide()
        })
        .catch(() => {
          this.$loading.hide()
        })
    },

    commonProvinceListAuth() {
      Http.get(Api.commonProvinceListAuth).then((res) => {
        this.$data.provinceListAuth = res.data || []
      })
    },

    commonCityList() {
      Http.get(Api.commonCityList, {
        province_code: this.$data.query.province_code,
        zone_id: this.$data.query.zone_id,
      }).then((res) => {
        this.$data.cityList = res.data || []
      })
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
