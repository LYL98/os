<template>
  <div class="pg-page">

    <div class="pg-page-header">
      <pg-select v-model="query.province_code" class="ml-auto mr-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>
    </div>

    <div class="p-20">
      <div class="d-flex">
        <pg-button-group style="width: 240px;" :options="{'全部': '', '全场满减': 'type_reduction', '全场满折': 'scope_discount' }" v-model="query.promotion_type" @change="changeQuery"></pg-button-group>
        <pg-button-group class="ml-20" :options="{'全部': '', '已上架': 'st_activated', '未上架': 'st_deactivated' }" v-model="query.status" @change="changeQuery"></pg-button-group>
        <pg-search class="ml-20 w-25" placeholder="活动名称" v-model="query.topic" @change="changeQuery"></pg-search>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
        <pg-button class="ml-auto" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.MarketingScopePromotionAdd">新增</pg-button>
      </div>

      <div class="card mt-10">
        <div class="card-header font-weight-bolder">
          <pg-tabs v-model="query.date_status" @change="changeQuery">
            <pg-tab index="">全部</pg-tab>
            <pg-tab index="date_before">未开展</pg-tab>
            <pg-tab index="date_on">进行中</pg-tab>
            <pg-tab index="date_out_of">已结束</pg-tab>
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
            <pg-column title="活动主题" width="240px">
              <template v-slot="{row}">
                <a class="text-dark" @click="handleDetailItem(row)">{{ row.topic || '-' }}</a>
              </template>
            </pg-column>
            <pg-column title="有效期" width="240px">
              <template v-slot="{row}">
                <span>{{ row.time_start }}</span>
                <span> ～ </span>
                <span>{{ row.time_end }}</span>
              </template>
            </pg-column>
            <pg-column title="促销类型" width="90px">
              <template v-slot="{row}">
                {{ row.promotion_type === 'type_reduction' ? '全场满减'
                : (row.promotion_type === 'scope_discount' ? '全场满折' : '-') }}
              </template>
            </pg-column>
            <pg-column title="上架状态" width="90px">
              <template v-slot="{row}">
                {{ row.status === 'st_activated' ? '已上架'
                : (row.status === 'st_deactivated' ? '未上架' : '-') }}
              </template>
            </pg-column>
            <pg-column title="活动状态" width="80px" text-align="center">
              <template v-slot="{row}">
                <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                  <span :class="`status-dot mr-5 bg-${Constant.ACTIVITY_SCOPE_STATUS('color')[row.date_status]}`"></span>
                  {{ Constant.ACTIVITY_SCOPE_STATUS('enum')[row.date_status] || row.date_status || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="操作" width="90px">
              <template v-slot="{row}">
                <pg-confirm
                  @confirm="handleStartItem(row)"
                  help-text="确认上架该活动"
                  v-if="(app.auth.isAdmin || app.auth.MarketingScopePromotionStart) && (row.status === 'st_deactivated' && row.date_status !== 'date_out_of')"
                >
                  <a class="text-decoration-none mr-10">上架</a>
                </pg-confirm>
                <pg-confirm
                  @confirm="handleHaltItem(row)"
                  help-text="确认下架该活动"
                  v-if="(app.auth.isAdmin || app.auth.MarketingScopePromotionHalt) && (row.status === 'st_activated' && row.date_status !== 'date_out_of')"
                >
                  <a class="text-decoration-none">下架</a>
                </pg-confirm>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination :num="list.num" v-model="query" @change="scopeQuery"/>
        </div>
      </div>
    </div>

    <pg-dialog :title="`${dialog.type === 'add' ? '新增' : '修改'} 全场营销`" v-model="dialog.visible">
      <scope-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer :title="`${drawer.item && drawer.item.topic || ''} 详情`" v-model="drawer.visible" width="500px">
      <scope-detail
        v-if="drawer.visible"
        :item="drawer.item"
      />
    </pg-drawer>

  </div>
</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

import scopeEdit from './scope-edit';
import scopeDetail from './scope-detail';

export default {
  name: 'scope',
  inject: ['app'],
  components: { scopeEdit, scopeDetail },
  data() {
    return {
      query: {},
      list: {
        items: [],
      },
      dialog: {
        type: 'add',
        visible: false,
        item: {},
      },
      drawer: {
        visible: false,
        item: {}
      },
      provinceListAuth: [],
    }
  },

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    document.title = '全场营销 - 商城 - 蒲公英运营管理系统';
    this.initQuery();
    this.commonProvinceListAuth();
    this.scopeQuery();
  },

  methods: {

    changeProvince(province_code) {
      this.app.changeProvince(province_code);
      this.$data.query.province_code = province_code;
      this.changeQuery();
    },

    initQuery() {
      this.$data.query = {
        province_code: this.app.userInfo.province_code,
        date_status: '',
        promotion_type: '',
        status: '',
        topic: '',
        page: 1,
        page_size: 20,
      }
    },

    changeQuery() {
      this.$data.query.page = 1;
      this.scopeQuery();
    },

    resetQuery() {
      this.initQuery();
      this.scopeQuery();
    },

    scopeQuery() {
      Http.get(Api.activityScopeQuery, this.$data.query)
        .then(res => {
          this.$data.list = res.data || { items: [] }
        });
    },

    handleDetailItem(row) {
      Http.get(Api.activityScopeDetail, { promotion_id: row.id })
        .then(res => {
          this.$data.drawer = { visible: true, item: res.data || {} };
        });
    },

    handleAddItem() {
      this.$data.dialog = { type: 'add', visible: true, item: {} };
    },

    handleStartItem(item) {
      Http.post(Api.activityScopeStart, { promotion_id: item.id })
        .then(() => {
          this.scopeQuery();
        });
    },

    handleHaltItem(item) {
      Http.post(Api.activityScopeHalt, { promotion_id: item.id })
        .then(() => {
          this.scopeQuery();
        });
    },

    handleSubmit() {
      this.handleCancel();
      this.scopeQuery();
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
