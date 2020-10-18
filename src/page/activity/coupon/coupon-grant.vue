<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-select v-model="query.activity_type" placeholder="按发放类型筛选" clearable @change="changeQuery">
        <pg-option v-for="item in Constant.ACTIVITY_COUPON_GRANT_TYPE()" :key="item.value" :value="item.value">{{ item.label }}</pg-option>
      </pg-select>
      <pg-search class="w-25 ml-20" placeholder="发放编号、优惠券名称" v-model="query.condition" clearable @change="changeQuery" />
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>
    <div class="card mt-10">
      <div class="card-header font-weight-bolder">
        <pg-tabs v-model="query.status" @change="changeQuery">
          <pg-tab index="">全部</pg-tab>
          <pg-tab v-for="item in Constant.ACTIVITY_COUPON_GRANT_STATUS()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
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
                <div class="col-3">
                  创建时间：{{row.created || '-'}}
                </div>
                <div class="col-3">
                  审核人：{{row.auditor || '-'}}
                </div>
                <div class="col-3">
                  审核时间：{{row.audit_time || '-'}}
                </div>
              </div>
            </div>
          </template>
          <pg-column prop="coupon_title" title="优惠券名称" width="140px">
            <template v-slot="{row}"> {{ row.coupon_title || '-' }} </template>
          </pg-column>
          <pg-column prop="code" title="发放编号" width="125px">
            <template v-slot="{row}">
              <a class="text-dark" @click="handleDetailItem(row)">{{row.code}}</a>
            </template>
          </pg-column>
          <pg-column prop="title" title="发放活动名称" width="150px">
            <template v-slot="{row}"> {{ row.title || '-' }} </template>
          </pg-column>
          <pg-column title="发放时限" width="160px">
            <template v-slot="{row}">
              <span v-if="row.begin_date && row.end_date">
                {{row.begin_date}} ~ {{row.end_date}}
              </span>
              <span v-else>-</span>
            </template>
          </pg-column>
          <pg-column prop="grant_way" title="发放类型" width="70px">
            <template v-slot="{row}">
              {{ Constant.ACTIVITY_COUPON_GRANT_TYPE('enum')[row.grant_way] || row.grant_way || '-' }}
            </template>
          </pg-column>
          <pg-column title="发放状态" width="80px" text-align="center">
            <template v-slot="{row}">
              <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                <span :class="`status-dot mr-5 bg-${Constant.ACTIVITY_COUPON_GRANT_STATUS('color')[row.status]}`"></span>
                {{ Constant.ACTIVITY_COUPON_GRANT_STATUS('enum')[row.status] || row.status || '-' }}
              </div>
            </template>
          </pg-column>
          <pg-column prop="condition" title="发放条件" width="90px">
            <template v-slot="{row}">
              <span v-if="row.grant_way === 'auto'">
                {{ Constant.ACTIVITY_COUPON_GRANT_CONDITION('enum')[row.condition] || row.condition || '-' }}
              </span>
              <span v-else>-</span>
            </template>
          </pg-column>
          <pg-column title="操作" width="130px">
            <template v-slot="{row}">

              <!--  手动发放的类型 -->
              <div v-if="row.grant_way === 'manual'">
                <pg-confirm
                  help-text="确认该发放活动"
                  v-if="row.status === 'wait_audit' && (app.auth.isAdmin || app.auth.BscActivityCouponManualGrantFirst)"
                  @confirm="handleManualGrantFirst(row)"
                >
                  <a class="text-decoration-none mr-10">确认发放</a>
                </pg-confirm>
                <pg-confirm
                  help-text="确认删除该发放活动"
                  v-if="row.status === 'wait_audit' && (app.auth.isAdmin || app.auth.BscActivityCouponGrantDelete)"
                  @confirm="handleDeleteItem(row)"
                >
                  <a class="text-decoration-none mr-10">删除</a>
                </pg-confirm>
                <a
                  class="text-decoration-none mr-10"
                  v-if="(row.status === 'no_grant' || row.status === 'granting') && (app.auth.isAdmin || app.auth.BscActivityCouponManualGrantAgain)"
                  @click="handleManualGrantAgain(row)"
                >再次发放</a>
                <pg-confirm
                  help-text="确认作废该发放活动"
                  v-if="(row.status === 'no_grant' || row.status === 'granting') && (app.auth.isAdmin || app.auth.BscActivityCouponGrantStop)"
                  @confirm="handleStopItem(row)"
                >
                  <a class="text-decoration-none">作废</a>
                </pg-confirm>
              </div>

              <!--  非手动发放的类型 -->
              <div v-else>
                <pg-confirm
                  help-text="确认审核通过该发放活动"
                  v-if="row.status === 'wait_audit' && (app.auth.isAdmin || app.auth.BscActivityCouponGrantAudit)"
                  @confirm="handleAuditItem(row)"
                >
                  <a class="text-decoration-none mr-10">审核</a>
                </pg-confirm>
                <pg-confirm
                  help-text="确认删除该发放活动"
                  v-if="row.status === 'wait_audit' && (app.auth.isAdmin || app.auth.BscActivityCouponGrantDelete)"
                  @confirm="handleDeleteItem(row)"
                >
                  <a class="text-decoration-none mr-10">删除</a>
                </pg-confirm>
                <pg-confirm
                  help-text="确认启动该发放活动"
                  v-if="row.status === 'no_grant' && row.is_active && (app.auth.isAdmin || app.auth.BscActivityCouponGrantActive)"
                  @confirm="handleActiveItem(row)"
                >
                  <a class="text-decoration-none mr-10">启动发放</a>
                </pg-confirm>
                <pg-confirm
                  help-text="确认暂停该发放活动"
                  v-if="row.status === 'granting' && (app.auth.isAdmin || app.auth.BscActivityCouponGrantPause)"
                  @confirm="handlePauseItem(row)"
                >
                  <a class="text-decoration-none mr-10">暂停发放</a>
                </pg-confirm>
                <pg-confirm
                  help-text="确认作废该发放活动"
                  v-if="(row.status === 'no_grant' || row.status === 'granting') && (app.auth.isAdmin || app.auth.BscActivityCouponGrantStop)"
                  @confirm="handleStopItem(row)"
                >
                  <a class="text-decoration-none">作废</a>
                </pg-confirm>
              </div>

            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="couponGrantQuery"/>
      </div>
    </div>

    <pg-drawer v-model="drawer.visible" :title="`${drawer.item.code} / ${drawer.item.title} 发放详情`" width="600px">
      <template slot="header">
        <div class="d-flex align-items-center">
          <h3 class="mb-0">{{`${drawer.item.code} / ${drawer.item.title} 发放详情`}}</h3>
          <div
            v-if="drawer.item && drawer.item.grant_way"
            class="badge badge-sm badge-primary badge-outline ml-20"
          >
            {{ Constant.ACTIVITY_COUPON_GRANT_TYPE('enum')[drawer.item.grant_way] || drawer.item.grant_way || '-' }}
          </div>
        </div>
      </template>
      <coupon-grant-detail
        v-if="drawer.visible"
        :type="drawer.type"
        :item="drawer.item"
      />
    </pg-drawer>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'manual_again'" :title="`${dialog.item.title} 再次发放`" width="680px">
      <coupon-grant-form-manual
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

  import { Http, Api, Constant } from '@/util';
  import couponGrantDetail from './coupon-grant-detail';
  import couponGrantFormManual from './coupon-grant-form-manual';

  export default {
    name: 'coupon-grant',
    components: {couponGrantDetail, couponGrantFormManual},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: []
        },
        dialog: {
          visible: false,
          type: 'manual_again',
          item: {}
        },
        drawer: {
          visible: false,
          item: {}
        },
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
      this.Constant = Constant;
      this.initQuery();
      this.couponGrantQuery();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          status: '',
          condition: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.couponGrantQuery();
      },

      resetQuery() {
        this.initQuery();
        this.couponGrantQuery();
      },

      couponGrantQuery() {
        Http.get(Api.activityCouponGrantQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleDetailItem(item) {
        Http.get(Api.activityCouponGrantDetail, { id: item.id})
          .then(res => {
            let rd = res.data || {};
            rd.title = item.title;
            this.$data.drawer = { visible: true, type: 'detail', item: rd };
          });
      },

      handleAuditItem(item) {
        Http.post(Api.activityCouponGrantAudit, { id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '优惠券发放审核通过' });
            this.couponGrantQuery();
          });
      },

      handleDeleteItem(item) {
        Http.post(Api.activityCouponGrantDelete, { id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '优惠券发放删除成功' });
            this.couponGrantQuery();
          });
      },

      handleActiveItem(item) {
        Http.post(Api.activityCouponGrantActive, { id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '优惠券发放已启动' });
            this.couponGrantQuery();
          });
      },

      handlePauseItem(item) {
        Http.post(Api.activityCouponGrantPause, { id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '优惠券发放已暂停' });
            this.couponGrantQuery();
          });
      },

      handleManualGrantFirst(item) {
        Http.post(Api.activityCouponManualGrantFirst, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '优惠券确认发放成功' });
            this.couponGrantQuery();
          });
      },

      handleManualGrantAgain(item) {
        this.$data.dialog = { visible: true, type: 'manual_again', item: item };
      },

      handleStopItem(item) {
        Http.post(Api.activityCouponGrantStop, { id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '优惠券发放已作废' });
            this.couponGrantQuery();
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.couponGrantQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, type: 'manual_again', item: {} };
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
