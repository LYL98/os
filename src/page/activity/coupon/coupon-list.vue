<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-button-group v-model="query.coupon_type" :options="{ '全部': '', '满减': 'reduce', '满折': 'discount' }" @change="changeQuery"></pg-button-group>
      <pg-search class="w-25 ml-20" placeholder="优惠券名称" v-model="query.condition" clearable @change="changeQuery" />
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>

      <pg-button class="ml-auto" color="primary" v-if="app.auth.isAdmin || app.auth.ClsActivityCouponAdd" @click="handleAddItem">新增</pg-button>
    </div>
    <div class="card mt-10">
      <div class="card-header font-weight-bolder">
        <pg-tabs v-model="query.status" @change="changeQuery">
          <pg-tab index="">全部</pg-tab>
          <pg-tab v-for="item in Constant.ACTIVITY_COUPON_STATUS()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
        </pg-tabs>
      </div>
      <div class="card-body">
        <pg-table
          :data="list.items"
          primary-key="id"
          :page="query.page"
          :page-size="query.page_size"
          fixed-header
        >
          <template v-slot:expand-row="{row}">
            <div class="p-15">
              <div class="row">
                <div class="col-2">
                  优惠券编号：{{ row.code }}
                </div>
                <div class="col-3">
                  优惠券名称：{{ row.title }}
                </div>
                <div class="col-4">
                  优惠内容：
                  {{ !row.threshold_amount ? '无门槛' : `满${Handle.returnPrice(row.threshold_amount)}元` }}
                  <span v-if="row.coupon_type === 'reduce'">减{{ Handle.returnPrice(row.reduce_amount) }}元</span>
                  <span v-else-if="row.coupon_type === 'discount'">{{ Handle.returnDiscount(row.discount) }}折{{ row.max_dis_amt ? ` 减免上限${Handle.returnPrice(row.max_dis_amt)}元` : '' }}</span>
                  <span v-else>-</span>
                </div>
                <div class="col-3">
                  创建时间：{{row.created || '-'}}
                </div>
              </div>
              <div class="row mt-10">
                <div class="col-2">
                  审核人：{{row.auditor || '-'}}
                </div>
                <div class="col-3">
                  审核时间：{{row.audit_time || '-'}}
                </div>
                <div class="col-7">
                  发放编号：{{Array.isArray(row.activity_codes) && row.activity_codes.length > 0 ? row.activity_codes.join(',') : '-'}}
                </div>
              </div>
            </div>
          </template>
          <pg-column prop="title" title="优惠券编号/名称" width="170px">
            <template v-slot="{row}">
              <a class="text-dark" @click="handleDetailItem(row)">{{ row.code }} / {{ row.title }}</a>
            </template>
          </pg-column>
          <pg-column prop="coupon_type" title="优惠内容" width="180px">
            <template v-slot="{row}">
              {{ !row.threshold_amount ? '无门槛' : `满${Handle.returnPrice(row.threshold_amount)}元` }}
              <span v-if="row.coupon_type === 'reduce'">减{{ Handle.returnPrice(row.reduce_amount) }}元</span>
              <span v-else-if="row.coupon_type === 'discount'">{{ Handle.returnDiscount(row.discount) }}折{{ row.max_dis_amt ? ` 减免上限${Handle.returnPrice(row.max_dis_amt)}元` : '' }}</span>
              <span v-else>-</span>
            </template>
          </pg-column>
          <pg-column title="有效期" width="200px">
            <template v-slot="{row}">
              <span v-if="row.date_type === 'fixed' && row.effective_date && row.expire_date">
                {{row.effective_date}} ~ {{row.expire_date}}
              </span>
              <span v-else-if="row.date_type === 'custom' && row.expire_days">
                {{!!row.effective_days ? `领券${row.effective_days}天后生效` : '领券后立即生效' }}, 有效期{{row.expire_days}}天
              </span>
              <span v-else>-</span>
            </template>
          </pg-column>
          <pg-column title="状态" width="70px" text-align="center">
            <template v-slot="{row}">
              <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                <span :class="`status-dot mr-5 bg-${Constant.ACTIVITY_COUPON_STATUS('color')[row.status]}`"></span>
                {{ Constant.ACTIVITY_COUPON_STATUS('enum')[row.status] || row.status || '-' }}
              </div>
            </template>
          </pg-column>
          <pg-column title="已使用/已发放/总量" width="160px" text-align="center">
            <template v-slot="{row}">
              {{ row.used_num }} / {{ row.send_num }} / {{ row.total_num }}
            </template>
          </pg-column>
          <pg-column title="操作" width="200px">
            <template v-slot="{row}">
              <a
                class="text-decoration-none mr-10"
                @click="handleModifyItem(row)"
                v-if="row.status === 'wait_audit' && (app.auth.isAdmin || app.auth.ClsActivityCouponModify)"
              >修改</a>
              <pg-confirm
                help-text="确认审核通过该优惠券"
                v-if="row.status === 'wait_audit' && (app.auth.isAdmin || app.auth.ClsActivityCouponAudit)"
                @confirm="handleAuditItem(row)"
              >
                <a class="text-decoration-none mr-10">审核</a>
              </pg-confirm>
              <pg-confirm
                help-text="确认删除该优惠券"
                v-if="row.status === 'wait_audit' && (app.auth.isAdmin || app.auth.ClsActivityCouponDelete)"
                @confirm="handleDeleteItem(row)"
              >
                <a class="text-decoration-none mr-10">删除</a>
              </pg-confirm>

              <a class="text-decoration-none mr-10"
                 v-if="row.status === 'effective' && (app.auth.isAdmin || app.auth.ClsActivityCouponIncreaseTotal)"
                 @click="handleIncreaseItem(row)"
              >增加总量</a>

              <a class="text-decoration-none mr-10"
                v-if="row.status === 'effective' && (app.auth.isAdmin || app.auth.ClsActivityCouponGrantAdd)"
                @click="handleGrantItem(row)"
              >发放</a>
              <pg-confirm
                help-text="确认作废该优惠券"
                v-if="row.status === 'effective' && row.status !== '' && (app.auth.isAdmin || app.auth.ClsActivityCouponStop)"
                @confirm="handleStopItem(row)"
              >
                <a class="text-decoration-none mr-10">作废</a>
              </pg-confirm>
              <a class="text-decoration-none"
                v-if="row.status !== 'wait_audit' && (app.auth.isAdmin || app.auth.ClsActivityCouponRecord)"
                @click="handleRecordItem(row)"
              >领用明细</a>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="couponQuery"/>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'add' || dialog.type === 'modify'" :title="`${dialog.type === 'add' ? '新增' : '修改'}优惠券`">
      <coupon-list-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'increase'" :title="`增加优惠券总量`">
      <coupon-list-increase-total
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'grant'" :title="`发放优惠券`">
      <coupon-grant-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        :selected-coupon-id="dialog.item.id"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'detail'" :title="`${drawer.item.title} 详情`" width="730px">
      <coupon-list-edit
        v-if="drawer.visible"
        :type="drawer.type"
        :item="drawer.item"
      />
    </pg-drawer>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'record'" :title="`${drawer.item.title} 明细`" width="900px">
      <coupon-list-record
        v-if="drawer.visible"
        :id="drawer.item.id"
      />
    </pg-drawer>
  </div>
</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';

  import couponListEdit from './coupon-list-edit';
  import couponListRecord from './coupon-list-record';
  import couponGrantEdit from './coupon-grant-edit';
  import couponListIncreaseTotal from './coupon-list-increase-total';

  export default {
    name: 'coupon-list',
    components: { couponListEdit, couponListRecord, couponGrantEdit, couponListIncreaseTotal },
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: []
        },
        dialog: {
          visible: false,
          type: 'add',
          item: {}
        },
        drawer: {
          visible: false,
          type: 'detail',
          item: {}
        }
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
      this.Handle = Handle;
      this.Constant = Constant;
      this.initQuery();
      this.couponQuery();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          coupon_type: '',
          status: '',
          condition: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.couponQuery();
      },

      resetQuery() {
        this.initQuery();
        this.couponQuery();
      },

      couponQuery() {
        Http.get(Api.activityCouponQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleAddItem() {
        this.$data.dialog = { visible: true, type: 'add', item: {} };
      },

      handleDetailItem(item) {
        Http.get(Api.activityCouponDetail, { id: item.id})
          .then(res => {
            this.$data.drawer = { visible: true, type: 'detail', item: res.data || {} };
          });
      },

      handleModifyItem(item) {
        Http.get(Api.activityCouponDetail, { id: item.id})
          .then(res => {
            this.$data.dialog = { visible: true, type: 'modify', item: res.data || {} };
          });
      },

      handleAuditItem(item) {
        Http.post(Api.activityCouponAudit, { id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '优惠券审核通过' });
            this.couponQuery();
          });
      },

      handleDeleteItem(item) {
        Http.post(Api.activityCouponDelete, { id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '优惠券删除成功' });
            this.couponQuery();
          });
      },

      handleIncreaseItem(item) {
        this.$data.dialog = { visible: true, type: 'increase', item: item };
      },

      handleStopItem(item) {
        Http.post(Api.activityCouponStop, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '优惠券已作废' });
            this.couponQuery();
          });
      },

      handleGrantItem(item) {
        this.$data.dialog = { visible: true, type: 'grant', item: item };
      },

      handleRecordItem(item) {
        this.$data.drawer = { visible: true, type: 'record', item: item };
      },

      handleSubmit() {
        this.handleCancel();
        this.couponQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, type: 'add', item: {} };
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
