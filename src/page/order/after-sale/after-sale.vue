<template>
  <div>
    <div class="d-flex mx-20 mt-20 mb-10">
      <pg-datepicker
        style="width: 450px"
        v-model="query"
        range
        quickable
        @change="changeQuery"
        clearable
        beginDateKey="begin_date"
        endDateKey="end_date"
        placeholder="下单时间段"
      ></pg-datepicker>

      <pg-datepicker
        class="ml-20"
        style="width: 450px"
        v-model="query"
        range
        quickable
        @change="changeQuery"
        clearable
        beginDateKey="handle_begin_date"
        endDateKey="handle_end_date"
        placeholder="处理时间段"
      ></pg-datepicker>
    </div>

    <div class="d-flex mx-20 mb-10">
      <pg-select
        v-model="query.province_code"
        @change="changeProvince"
        style="width: 168px"
      >
        <pg-option value v-if="app.userInfo.opt_type === 'global'"
          >全部</pg-option
        >
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
          >{{ item.title }}</pg-option
        >
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
        <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{
          item.title
        }}</pg-option>
      </pg-select>

      <pg-select
        class="ml-20"
        v-model="query.opt_type"
        placeholder="按处理类型筛选"
        searchable
        clearable
        @change="changeQuery"
      >
        <pg-option
          v-for="item in Constant.AFTER_SALE_OPT_TYPE()"
          :key="item.value"
          :value="item.value"
          >{{ item.label }}</pg-option
        >
      </pg-select>

      <pg-select
        class="ml-20"
        v-model="query.handle_loading"
        placeholder="按处理进度筛选"
        searchable
        clearable
        @change="changeQuery"
      >
        <pg-option
          v-for="item in Constant.AFTER_SALE_HANDLE_LOADING()"
          :key="item.value"
          :value="item.value"
          >{{ item.label }}</pg-option
        >
      </pg-select>

      <pg-select
        class="ml-20"
        v-model="query.operator_id"
        placeholder="按客服筛选"
        searchable
        clearable
        @change="changeQuery"
      >
        <pg-option v-for="item in operatorList" :key="item.id" :value="item.id"
          >{{ item.realname }} {{ item.phone }}</pg-option
        >
      </pg-select>
    </div>

    <div class="d-flex mx-20 mb-10">
      <pg-button
        class="danger"
        flat
        :style="`border:1px solid ${query.flag_7 ? '#006eff' : '#ddd'};`"
        @click="changeFlag('flag_7')"
        >超过7小时未完成</pg-button
      >
      <pg-button
        class="warning"
        flat
        :style="`border:1px solid ${query.flag_2 ? '#006eff' : '#ddd'};`"
        @click="changeFlag('flag_2')"
        >超过2小时未回应</pg-button
      >

      <pg-select
        class="ml-20"
        v-model="query.vip_level"
        placeholder="按会员等级筛选"
        searchable
        clearable
        @change="changeQuery"
      >
        <pg-option
          v-for="item in vipLevelList"
          :key="item.level"
          :value="item.level"
          >{{ item.title }}</pg-option
        >
      </pg-select>

      <pg-select
        class="ml-20"
        v-model="query.sale_type"
        placeholder="按销售类型筛选"
        searchable
        clearable
        @change="changeQuery"
      >
        <pg-option
          v-for="item in Constant.AFTER_SALE_SALE_TYPE()"
          :key="item.value"
          :value="item.value"
          >{{ item.label }}</pg-option
        >
      </pg-select>

      <pg-search
        class="ml-20"
        style="width: 260px"
        clearable
        placeholder="售后单号、门店名称、商品编号、名称"
        v-model="query.condition"
        @change="changeQuery"
      />
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>

    <div class="card mx-20">
      <div class="card-header font-weight-bolder position-relative">
        <pg-tabs v-model="query.status" @change="changeQuery">
          <pg-tab index>全部</pg-tab>
          <pg-tab
            v-for="item in Constant.AFTER_SALE_STATUS()"
            :index="item.value"
            :key="item.value"
            >{{ item.label }}</pg-tab
          >
        </pg-tabs>
        <div
          style="width: 260px; top: 10px; right: 0"
          class="ml-auto position-absolute"
          v-if="app.auth.isAdmin || app.auth.OrderAftersaleExport"
        >
          <pg-button @click="handleExport">导出售后汇总表</pg-button>
          <pg-button class="ml-20" @click="handleExportItems"
            >导出售后追责表</pg-button
          >
        </div>
      </div>
      <div class="card-body">
        <pg-table
          fixed-header
          :data="list.items"
          primary-key="id"
          :checkable="query.status !== '' && query.status !== 'close'"
          @selection="onSelectionItems"
          :page="query.page"
          :page-size="query.page_size"
          borderless
        >
          <!--          <template v-slot:expand-row="{row}">-->
          <!--            <div class="p-15">-->
          <!--              <div class="row">-->
          <!--                <div class="col-3">下单日期：{{ row.created || '-' }}</div>-->
          <!--              </div>-->
          <!--            </div>-->
          <!--          </template>-->
          <pg-column
            prop="code"
            title="售后单号/下单日期"
            width="110px"
            style="padding: 0 0 0 10px"
          >
            <template v-slot="{ row }">
              <div class="position-relative order-serial">
                <div class="position-absolute no">
                  <a class="text-dark" @click="handleShowItemDetail(row)">{{
                    row.code || '-'
                  }}</a>
                </div>
                <div class="position-absolute text-secondary datetime">
                  <span>{{ row.created }}</span>
                </div>
              </div>
            </template>
          </pg-column>
          <pg-column
            prop="city_title"
            title="县域"
            width="70px"
            style="padding: 0 0 0 10px"
          ></pg-column>
          <pg-column
            prop="store_title"
            title="门店名称"
            width="110px"
            style="padding: 0 0 0 10px"
          >
            <template v-slot="{ row }">
              <span>{{row.store_title}}</span>
              <span class="blacklist-tag" v-if="row.is_black">黑</span>
            </template>  
          </pg-column>
          <pg-column
            prop
            title="商品编号/名称"
            width="150px"
            style="padding: 0 10px 0 10px"
          >
            <template v-slot="{ row }">
              <div class="position-relative order-item">
                <div class="position-absolute no text-secondary">
                  <span>{{ row.item_code || '-' }}</span>
                  <span class="title bg-primary text-secondary" style="color:#fff;margin-left:6px;" v-if="row.sale_type == '平台'">平台</span>
                </div>
                <div class="position-absolute title overflow-ellipsis">
                  <span>{{ row.item_title }}</span>
                </div>
              </div>
            </template>
          </pg-column>
          <pg-column
            prop
            title="处理进度"
            width="80px"
            style="padding: 0 0 0 10px"
          >
            <template v-slot="{ row }">
              <span v-if="row.handle_loading">{{
                Constant.AFTER_SALE_HANDLE_LOADING('enum')[row.handle_loading]
              }}</span>
              <span v-else>-</span>
            </template>
          </pg-column>
          <pg-column
            prop
            title="处理类型"
            width="80px"
            style="padding: 0 0 0 10px"
          >
            <template v-slot="{ row }">
              <span v-if="row.opt_type === 'init' || !row.opt_type">-</span>
              <span v-else>{{
                Constant.AFTER_SALE_OPT_TYPE('enum')[row.opt_type]
              }}</span>
            </template>
          </pg-column>
          <pg-column title="等级" width="60px" style="padding: 0 0 0 10px">
            <template v-slot="{ row }">
              <span class="icon-flag3 text-danger" v-if="row.flag_7"></span>
              <span class="icon-flag3 text-warning" v-if="row.flag_2"></span>
              <span v-else-if="!row.flag_7 && !row.flag_2">-</span>
            </template>
          </pg-column>
          <pg-column title="客服" width="60px" style="padding: 0 0 0 10px">
            <template v-slot="{ row }">
              <span>{{
                (row.allocated_or && row.allocated_or.realname) || '-'
              }}</span>
            </template>
          </pg-column>
          <pg-column prop title="操作" width="120px">
            <template v-slot="{ row }">
              <div>
                
                <a
                  class="mr-10 text-decoration-none"
                  @click="handleAllocateItem(row)"
                  v-if="
                    row.status === 'init' &&
                    row.status !== 'close' &&
                    (app.auth.isAdmin || app.auth.OrderAfterSaleAllocate)
                  "
                  >分配</a
                >

                <a
                  class="mr-10 text-decoration-none"
                  @click="handleAllocateItem(row)"
                  v-if="
                    row.status !== 'init' &&
                    row.status !== 'close' &&
                    (app.auth.isAdmin || app.auth.OrderAfterSaleAllocate)
                  "
                  >重新分配</a
                >

                <a
                  class="mr-10 text-decoration-none position-relative"
                  @click="handleDetailItem(row)"
                  v-if="
                    row.status === 'waiting_dispose' &&
                    (app.auth.isAdmin || app.auth.OrderAfterSaleUpdate)
                  "
                  >待处理<span class="icon-new mr-10 text-primary position-absolute" style="top:-5px;" v-if="!row.is_read"></span></a
                >

                <a
                  class="mr-10 text-decoration-none"
                  @click="handleDetailItem(row)"
                  v-if="
                    row.status === 'handling' &&
                    (app.auth.isAdmin || app.auth.OrderAfterSaleUpdate)
                  "
                  >处理</a
                >

                <a
                  class="mr-10 text-decoration-none"
                  @click="handleSecondHandleItem(row)"
                  v-if="
                    row.status === 'close' &&
                    retuHandleSecond(row) &&
                    (app.auth.isAdmin || app.auth.OrderAfterSaleHandleSecond)
                  "
                  >二次处理</a
                >
              </div>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer d-flex align-items-center">
        <pg-button
          class="mr-auto"
          @click="handleAllocateItem(selectionItems)"
          :disabled="
            !Array.isArray(selectionItems) ||
            selectionItems.length <= 0 ||
            query.status == ''
          "
          >批量分配</pg-button
        >
        <pg-pagination
          :num="list.num"
          v-model="query"
          @change="orderAftersaleQuery"
        />
      </div>
    </div>

    <pg-drawer v-model="drawer.visible" width="950px">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">售后单详情</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${
              Constant.AFTER_SALE_STATUS('color')[drawer.item.status]
            } badge-outline ml-20`"
          >
            {{
              Constant.AFTER_SALE_STATUS('enum')[drawer.item.status] ||
              drawer.item.status ||
              '-'
            }}
          </div>
        </div>
      </template>
      <after-sale-detail
        v-if="drawer.visible"
        :item.sync="drawer.item"
        @cancel="handleDrawerCancel"
      />
    </pg-drawer>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'allocate'"
      title="分配"
    >
      <after-sale-allocate
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'second-handle'"
      title="二次处理"
    >
      <after-sale-second-handle
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer
      v-model="drawer_inner_user.visible"
      width="1150px"
      v-if="drawer_inner_user.type === 'user-detail'"
    >
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">
            {{ drawer_inner_user.item.code || '' }} 用户订单详情
          </h3>
          <div
            v-if="drawer_inner_user.item && drawer_inner_user.item.status"
            :class="`badge badge-sm badge-${
              Constant.ORDER_USER_STATUS('color')[drawer_inner_user.item.status]
            } badge-outline ml-20`"
          >
            {{
              Constant.ORDER_USER_STATUS('enum')[
                drawer_inner_user.item.status
              ] ||
              drawer_inner_user.item.status ||
              '-'
            }}
          </div>
        </div>
      </template>
      <user-detail
        v-if="drawer_inner_user.visible"
        :item="drawer_inner_user.item"
      />
    </pg-drawer>

    <pg-drawer
      v-model="drawer_inner_return.visible"
      width="900px"
      v-if="drawer_inner_return.type === 'return-detail'"
    >
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">退货单详情</h3>
          <div
            v-if="drawer_inner_return.item && drawer_inner_return.item.status"
            :class="`badge badge-sm badge-${
              Constant.RETURN_GOODS_STATUS('color')[
                drawer_inner_return.item.status
              ]
            } badge-outline ml-20`"
          >
            {{
              Constant.RETURN_GOODS_STATUS('enum')[
                drawer_inner_return.item.status
              ] ||
              drawer_inner_return.item.status ||
              '-'
            }}
          </div>
        </div>
      </template>
      <return-detail
        v-if="drawer_inner_return.visible"
        :item="drawer_inner_return.item"
      />
    </pg-drawer>
  </div>
</template>
<script>
import { Http, Api, Handle, Constant } from '@/util'
import afterSaleDetail from './after-sale-detail'
import userDetail from './../user/user-detail'
import returnDetail from './../return/return-detail'
import afterSaleAllocate from './after-sale-allocate'
import afterSaleSecondHandle from './after-sale-second-handle'

export default {
  name: 'after-sale',
  components: {
    afterSaleDetail,
    afterSaleAllocate,
    afterSaleSecondHandle,
    userDetail,
    returnDetail,
  },
  inject: ['app'],
  provide() {
    return {
      listQuery: this,
    }
  },
  data() {
    return {
      query: {},
      list: {
        items: [],
      },
      dialog: {
        type: 'allocate',
        visible: false,
        item: {},
      },
      drawer: {
        visible: false,
        type: '',
        item: {},
      },
      drawer_inner_user: {
        visible: false,
        type: '',
        item: {},
      },
      drawer_inner_return: {
        visible: false,
        type: '',
        item: {},
      },
      selectionItems: [],
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
    document.title = '售后单 - 商城 - 蒲公英运营管理系统'
    this.initQuery()
    this.orderAftersaleQuery()
    this.commonProvinceListAuth()
    this.commonCityList()
    this.commonVipLevelList()
    this.commonOperatorList()
  },

  methods: {
    initQuery() {
      this.$data.query = {
        province_code: this.app.userInfo.province_code, // 省份
        zone_id: '',
        city_id: '',
        condition: '',
        status: '',
        opt_type: '',
        begin_date: '',
        end_date: '',
        handle_loading: '',
        flag_7: null,
        flag_2: null,
        handle_begin_date: '',
        handle_end_date: '',
        operator_id: '',
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
      this.orderAftersaleQuery()
    },

    resetQuery() {
      this.initQuery()
      this.orderAftersaleQuery()
    },

    orderAftersaleQuery() {
      Http.get(Api.orderAftersaleQuery, this.$data.query).then((res) => {
        this.$data.list = res.data || { items: [] }
      })
    },

    handleShowItemDetail(item) {
      Http.post(Api.orderAftersaleDetail, { id: item.id }).then((res) => {
        this.$data.drawer = { visible: true, item: res.data || {} }
      })
    },

    handleDetailItem(item) {
      Http.post(Api.orderAftersaleDetail, { id: item.id }).then((res) => {
        let rd = res.data
        rd.data_ori = 'handle'
        this.$data.drawer = { visible: true, item: rd || {} }
      })
    },

    handleSecondHandleItem(item) {
      Http.post(Api.orderAftersaleDetail, { id: item.id }).then((res) => {
        this.$data.dialog = {
          visible: true,
          type: 'second-handle',
          item: res.data,
        }
      })
    },

    //选择旗子
    changeFlag(type) {
      let query = this.$data.query
      if (type === 'flag_7') {
        query.flag_7 = query.flag_7 ? null : 1
      }
      if (type === 'flag_2') {
        query.flag_2 = query.flag_2 ? null : 1
      }
      this.$data.query = Object.assign({}, query)
      this.changeQuery()
    },

    //返回是否二次退货
    retuHandleSecond(item) {
      //如已二次处理
      if (item.handle_second_time) return

      //完成小于72小时，可二次处理
      let date = Handle.returnDateStr()
      let hours = Handle.dateTimeCalc(item.done_time, date, 'hours')
      if (hours < 72) return true
      return false
    },

    handleAllocateItem(item) {
      this.$data.dialog = { visible: true, type: 'allocate', item: item }
    },

    handleSubmit() {
      this.handleCancel()
      this.orderAftersaleQuery()
    },

    handleCancel() {
      this.$data.dialog = { type: 'allocate', visible: false, item: {} }
      this.orderAftersaleQuery()
    },

    handleDrawerCancel() {
      this.$data.drawer = { type: '', visible: false, item: {} }
      this.orderAftersaleQuery()
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

    commonVipLevelList() {
      Http.get(Api.commonVipList, {}).then((res) => {
        if (res.code === 0) {
          this.$data.vipLevelList = res.data
        }
      })
    },

    commonOperatorList() {
      Http.get(Api.commonOperatorList, { post: 'service' }).then((res) => {
        if (res.code === 0) {
          this.$data.operatorList = res.data
        }
      })
    },

    onSelectionItems(items) {
      this.$data.selectionItems = items
    },
  },
}
</script>

<style lang="scss" scoped>
.order-serial {
  height: 42px;
}

.order-serial .no {
  transform: scale(0.95);
  left: -1px;
  top: 10px;
  line-height: 1;
  letter-spacing: 0.8px;
}

.order-serial .datetime {
  transform: scale(0.88);
  left: -5px;
  top: 23px;
  line-height: 1;
}

.order-item {
  height: 42px;
}

.order-item .no {
  transform: scale(0.95);
  left: -1px;
  top: 10px;
  line-height: 1;
}

.order-item .title {
  transform: scale(0.9);
  left: -6px;
  top: 22px;
  right: -6px;
  line-height: 1;
}

.blacklist-tag {
  z-index: 100;
  font-size: 12px;
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
  padding: 2px;
  line-height: 12px;
  border-radius: 4px;
}
</style>
