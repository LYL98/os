<template>
  <div class="pg-page">
    <div class="p-20">
      <div class="d-flex">
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
          v-model="query.zone_id"
          placeholder="按片区筛选"
          searchable
          clearable
          @change="changeZone"
          :disabled="!query.province_code"
        >
          <pg-option v-for="item in zoneList" :key="item.id" :value="item.id">{{
            item.title
          }}</pg-option>
        </pg-select>

        <pg-select
          class="ml-20"
          v-model="query.city_id"
          placeholder="按县域筛选"
          searchable
          clearable
          @change="changeQuery"
          :disabled="!query.province_code || !query.zone_id"
        >
          <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{
            item.title
          }}</pg-option>
        </pg-select>

        <pg-datepicker
          class="ml-20"
          style="width: 450px"
          v-model="query"
          range
          quickable
          @change="changeQuery"
          clearable
          placeholder="下单时间段"
        ></pg-datepicker>
      </div>

      <div class="d-flex mt-10">
        <pg-button-group
          style="width: 238px"
          v-model="query.pay_status"
          :options="{ 全部: '', 未付清: 'wait_complete', 已付清: 'done' }"
          @change="changeQuery"
        ></pg-button-group>
        <pg-button-group
          class="ml-20"
          style="width: 238px"
          v-model="query.to_be_canceled"
          :options="{ 全部: '', 现付订单: 1, 后付订单: 0 }"
          @change="changeQuery"
        ></pg-button-group>
        <pg-button-group
          class="ml-20"
          style="width: 238px"
          v-model="query.order_type"
          :options="{ 全部: '', 普通订单: 'normal', 预售订单: 'presale' }"
          @change="changeQuery"
        ></pg-button-group>
      </div>

      <div class="d-flex mt-10">
        <pg-search
          style="width: 238px"
          clearable
          placeholder="订单编号、门店"
          v-model="query.condition"
          @change="changeQuery"
        />
        <pg-button class="ml-10" flat @click="resetQuery"
          >重置筛选条件</pg-button
        >
        <div
          class="ml-auto"
          v-if="
            app.auth.isAdmin ||
            app.auth.OrderListExport ||
            app.auth.OrderItemExport
          "
        >
          <pg-button
            @click="handleExport"
            v-if="app.auth.isAdmin || app.auth.OrderListExport"
            >导出订单列表</pg-button
          >
          <pg-button
            class="ml-20"
            @click="handleExportItems"
            v-if="app.auth.isAdmin || app.auth.OrderItemExport"
            >导出订单商品详情</pg-button
          >
        </div>
      </div>

      <div class="card mt-10">
        <div class="card-header font-weight-bolder">
          <pg-tabs v-model="query.status" @change="changeQueryStatus">
            <pg-tab index>全部</pg-tab>
            <pg-tab
              v-for="item in Constant.ORDER_USER_STATUS()"
              :index="item.value"
              :key="item.value"
              >{{ item.label }}</pg-tab
            >
          </pg-tabs>
        </div>
        <div class="card-body custom-order-table">
          <pg-table
            fixed-header
            :data="list.items"
            primary-key="id"
            :page="query.page"
            :page-size="query.page_size"
            borderless
          >
            <pg-column title="订单编号/下单时间" width="105px" style="padding: 0 0 0 10px;">
              <template v-slot="{ row }">
                <div class="position-relative order-serial">
                  <div class="position-absolute no">
                    <a class="text-dark" @click="handleDetailItem(row)">{{ row.code }}</a>
                  </div>
                  <div class="position-absolute text-secondary datetime">
                    <span>{{ row.created }}</span>
                  </div>
                </div>
              </template>
            </pg-column>
            <pg-column title="县域" width="80px" style="padding: 0 0 0 10px;">
              <template v-slot="{row}">
                {{ row.city_title || '-' }}
              </template>
            </pg-column>
            <pg-column title="门店名称" width="100px" style="padding: 0 0 0 10px;">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">
                  {{ row.store_title || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="订单总额" width="75px" class="px-5" text-align="center">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">
                  <span
                    v-if="
                      row.item_total_price ||
                      row.delivery_fee ||
                      row.fram_total_price 
                    "
                    >¥{{
                      Handle.returnPrice(
                        row.item_total_price +
                          row.delivery_fee +
                          row.fram_total_price
                      )
                    }}</span
                  >
                  <span v-else>-</span>
                </div>
              </template>
            </pg-column>
            <pg-column title="优惠金额" width="75px" class="px-5" text-align="center">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">
                  <span v-if="row.coupon_reduction || row.delivery_disfee || row.promotion_reduction"
                    >¥{{
                      Handle.returnPrice(
                        row.coupon_reduction + row.delivery_disfee + row.promotion_reduction
                      )
                    }}</span
                  >
                  <span v-else>-</span>
                </div>
              </template>
            </pg-column>
            <pg-column title="订单实收" width="75px" class="px-5" text-align="center">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">
                  <span v-if="row.order_price">¥{{ Handle.returnPrice(row.order_price)}}</span>
                  <span v-else>-</span>
                </div>
              </template>
            </pg-column>

<!--            <pg-column title="付款状态" width="75px" class="px-5" text-align="center">-->
<!--              <template v-slot="{ row }">-->
<!--                <div class="overflow-ellipsis">-->
<!--                  <span v-if="row.pay_status == 'wait_complete'">未付清</span>-->
<!--                  <span v-else-if="row.pay_status == 'done'">已付清</span>-->
<!--                  <span v-else>-</span>-->
<!--                </div>-->
<!--              </template>-->
<!--            </pg-column>-->

            <pg-column title="已付款" width="75px" class="px-5" text-align="center">
              <template v-slot="{ row }">
                <div class="overflow-ellipsis">
                  <span v-if="row.amount_pay && row.amount_pay > 0" :class="{ 'text-danger': row.amount_pay != row.order_price, 'text-haha': row.amount_pay == row.order_price }">
                    ¥{{ Handle.returnPrice(row.amount_pay) }}
                  </span>
                  <span v-else>-</span>
                </div>
              </template>
            </pg-column>
<!--            <pg-column title="待付款" width="75px" class="px-5" text-align="center">-->
<!--              <template v-slot="{ row }">-->
<!--                <div class="overflow-ellipsis">-->
<!--                  <span v-if="row.order_price"-->
<!--                    >{{ row.order_price - row.amount_pay == 0 ? '' : '￥'-->
<!--                    }}{{-->
<!--                      row.order_price - row.amount_pay == 0-->
<!--                        ? '-'-->
<!--                        : Handle.returnPrice(row.order_price - row.amount_pay)-->
<!--                    }}</span-->
<!--                  >-->
<!--                  <span v-else>-</span>-->
<!--                </div>-->
<!--              </template>-->
<!--            </pg-column>-->

            <pg-column title="订单状态" width="75px" class="px-5" text-align="center">
              <template v-slot="{ row }">
                <div
                  class="d-flex justify-content-center align-items-center overflow-ellipsis"
                >
                  <span
                    :class="`status-dot mr-5 bg-${
                      Constant.ORDER_LIST_USER_STATUS('color')[row.status]
                    }`"
                  ></span>
                  <span>
                    {{
                      Constant.ORDER_LIST_USER_STATUS('enum')[row.status] ||
                      row.status ||
                      '-'
                    }}
                  </span>
                </div>
              </template>
            </pg-column>
            <pg-column title="操作" width="60px">
              <template v-slot="{ row }">
                <pg-confirm
                  help-text="确认取消该订单"
                  v-if="
                    (app.auth.isAdmin || app.auth.OrderCancel) &&
                    row.status == 'wait_confirm'
                  "
                  @confirm="handleCancelItem(row)"
                >
                  <a class="text-decoration-none">取消</a>
                </pg-confirm>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination
            :num="list.num"
            v-model="query"
            @change="orderUserQuery"
          />
        </div>
      </div>
    </div>

    <pg-drawer v-model="drawer.visible" width="1150px">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">{{ drawer.item.code || '' }} 用户订单详情</h3>
          <div
            v-if="drawer.item && drawer.item.status"
            :class="`badge badge-sm badge-${
              Constant.ORDER_USER_STATUS('color')[drawer.item.status]
            } badge-outline ml-20`"
          >
            {{
              Constant.ORDER_USER_STATUS('enum')[drawer.item.status] ||
              drawer.item.status ||
              '-'
            }}
          </div>
        </div>
      </template>
      <user-detail v-if="drawer.visible" :item="drawer.item" />
    </pg-drawer>

    <pg-drawer
      v-model="drawer_inner.visible"
      width="950px"
      v-if="drawer_inner.type === 'after-sale'"
    >
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">售后单详情</h3>
          <div
            v-if="drawer_inner.item && drawer_inner.item.status"
            :class="`badge badge-sm badge-${
              Constant.AFTER_SALE_STATUS('color')[drawer_inner.item.status]
            } badge-outline ml-20`"
          >
            {{
              Constant.AFTER_SALE_STATUS('enum')[drawer_inner.item.status] ||
              drawer_inner.item.status ||
              '-'
            }}
          </div>
        </div>
      </template>
      <after-sale-detail v-if="drawer_inner.visible" :item="drawer_inner.item" />
    </pg-drawer>
  </div>
</template>
<script>
import { Http, Api, Handle, Constant } from '@/util'
import userDetail from './user-detail'
import afterSaleDetail from './../after-sale/after-sale-detail'

export default {
  name: 'user',
  components: { userDetail, afterSaleDetail },
  inject: ['app'],
  provide() {
    return {
      user: this,
    }
  },
  data() {
    return {
      query: {},
      list: {
        items: [],
      },
      drawer: {
        visible: false,
        item: {},
      },
      drawer_inner: {
        visible: false,
        item: {},
      },
      provinceListAuth: [],
      cityList: [],
      zoneList: [],
    }
  },
  created() {
    this.Handle = Handle
    this.Constant = Constant
    document.title = '用户订单 - 商城 - 蒲公英运营管理系统'
    this.initQuery()
    this.orderUserQuery()
    this.commonProvinceListAuth()
    this.commonZoneList()
    this.commonCityList()
  },

  methods: {
    initQuery() {
      this.$data.query = {
        province_code: this.app.userInfo.province_code,
        zone_id: '',
        city_id: '',
        status: '',
        pay_status: '',
        order_type: '',
        condition: '',
        to_be_canceled: '',
        begin_date: '',
        end_date: '',
        is_init: 1, // 初始状态下，返回列表不含已取消的订单。1 表示初始状态
        page: 1,
        page_size: 20,
      }
    },

    changeProvince() {
      this.$data.query.zone_id = ''
      this.$data.query.city_id = ''
      this.commonZoneList()
      this.changeQuery()
    },

    changeZone() {
      this.$data.query.city_id = ''
      this.commonCityList()
      this.changeQuery()
    },

    changeQueryStatus() {
      this.changeQuery()
      if (this.$data.query.status == 'order_canceled') {
        this.$data.query.is_init = 0
      } else {
        this.$data.query.is_init = 1
      }
    },

    changeQuery() {
      this.$data.query.page = 1
      this.orderUserQuery()
    },

    resetQuery() {
      this.initQuery()
      this.orderUserQuery()
    },

    orderUserQuery() {
      Http.get(Api.orderUserQuery, this.$data.query).then((res) => {
        this.$data.list = res.data || { items: [] }
      })
    },

    handleDetailItem(item) {
      Http.get(Api.orderUserDetail, { id: item.id }).then((res) => {
        this.$data.drawer = { visible: true, item: res.data || {} }
      })
    },

    handleCancelItem(item) {
      Http.post(Api.orderUserCancel, { id: item.id }).then(() => {
        this.$toast({ type: 'success', message: '用户订单取消成功' })
        this.orderUserQuery()
      })
    },

    handleSubmit() {
      this.handleCancel()
      this.orderUserQuery()
    },

    handleCancel() {
      this.$data.dialog = { type: 'add', visible: false, item: {} }
    },

    handleExport() {

      this.$loading.show();
      Http.get(Api.orderUserListExport, this.$data.query)
        .then(() => {
          this.$toast({ type: 'success', message: '导出任务创建成功，请在 我的账号 -> 导出管理 中查看导出进度。' });
          this.app.notification.check();
          this.$loading.hide();
        })
        .catch(() => {
          this.$loading.hide();
        });

      // this.$loading.show()
      // Http.get(Api.orderUserListExportCheck, this.$data.query)
      //   .then(() => {
      //     // return Http.download(Api.orderUserListExport, this.$data.query, {
      //     //   filename: '用户订单列表.xls',
      //     // })
      //
      //     return Http.get(Api.orderUserListExport, this.$data.query);
      //   })
      //   .then(() => {
      //     this.$loading.hide()
      //   })
      //   .catch(() => {
      //     this.$loading.hide()
      //   })
    },

    handleExportItems() {
      this.$loading.show();
      Http.get(Api.orderUserItemExport, this.$data.query)
          .then(() => {
            this.$toast({ type: 'success', message: '导出任务创建成功，请在 我的账号 -> 导出管理 中查看导出进度。' });
            this.app.notification.check();
            this.$loading.hide();
          })
          .catch(() => {
            this.$loading.hide();
          });
      // this.$loading.show()
      // Http.get(Api.orderUserItemExportCheck, this.$data.query)
      //   .then(() => {
      //     return Http.download(Api.orderUserItemExport, this.$data.query, {
      //       filename: '用户订单商品详情.xls',
      //     })
      //   })
      //   .then(() => {
      //     this.$loading.hide()
      //   })
      //   .catch(() => {
      //     this.$loading.hide()
      //   })
    },

    commonProvinceListAuth() {
      Http.get(Api.commonProvinceListAuth).then((res) => {
        this.$data.provinceListAuth = res.data || []
      })
    },

    commonZoneList() {
      Http.get(Api.commonZoneList, {
        province_code: this.$data.query.province_code,
      }).then((res) => {
        this.$data.zoneList = res.data || []
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

</style>
