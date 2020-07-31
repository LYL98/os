<template>
  <div class="pg-page">
    <div class="p-20">
      <div class="d-flex">
        <pg-button-group v-model="query.is_freeze" :options="{ '全部': '', '正常': 0, '已冻结': 1 }" @change="changeQuery"></pg-button-group>
        <pg-select class="ml-20" v-model="query.province_code" @change="changeQuery">
          <pg-option
            v-for="item in provinceListAuth"
            :key="item.code"
            :value="item.code"
          >{{ item.title }}</pg-option>
        </pg-select>
        <pg-search class="w-25 ml-20" clearable placeholder="手机号码、昵称、门店名称" v-model="query.condition" @change="changeQuery"/>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>

        <pg-button @click="toggle = !toggle">toggle</pg-button>
        <pg-button color="primary" class="ml-auto" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.ClsUserPromoterAdd">新增</pg-button>
      </div>

      <div class="card mt-10">
        <div class="card-header font-weight-bolder">
          <pg-tabs v-model="query.is_header" @change="changeQuery">
            <pg-tab index="">全部</pg-tab>
            <pg-tab :index="1">门店推广者</pg-tab>
            <pg-tab :index="0">个人推广者</pg-tab>
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
            <template v-slot:ord_amount_cum>
              搜索
            </template>
            <pg-column title="推广者名称 / 手机号" width="160px">
              <template v-slot="{row}">
                {{ row.nickname || '-' }}{{ row.login_phone && ' / ' }}{{ row.login_phone || '' }}
              </template>
            </pg-column>
            <pg-column title="所属门店" width="190px">
              <template v-slot="{row}">
                {{ row.store && row.store.title || '-' }}
              </template>
            </pg-column>
            <pg-column title="累计分享下单金额" prop="ord_amount_cum" width="120px" text-align="center" v-if="toggle">
              <template v-slot="{row}">
                <span v-if="!!row.ord_amount_cum">¥</span>{{ Handle.returnPrice(row.ord_amount_cum + row.ord_amount_today) || '-' }}
              </template>
            </pg-column>
            <pg-column title="累计推广购买人次" width="120px" text-align="center">
              <template v-slot="{row}">
                {{ (row.ord_count_cum + row.ord_count_today) || '-' }}
              </template>
            </pg-column>
            <pg-column title="拉新人数" width="90px" text-align="center">
              <template v-slot="{row}">
                {{ (row.pull_new_cum + row.pull_new_today) || '-' }}
              </template>
            </pg-column>
            <pg-column title="账户余额" width="90px" text-align="center">
              <template v-slot="{row}">
                <span v-if="!!row.balance">¥</span>{{ Handle.returnPrice(row.balance) || '-' }}
              </template>
            </pg-column>
            <pg-column title="状态" width="60px">
              <template v-slot="{row}">
                <pg-confirm
                  v-if="!row.is_header && (app.auth.isAdmin || app.auth.ClsUserPromoterFreeze)"
                  :help-text="`确认${row.is_freeze ? '解冻' : '冻结'}该推广者`"
                  @confirm="handleFreezeItem(row)"
                >
                  <pg-switch :value="!row.is_freeze"/>
                </pg-confirm>
                <span v-else>
                  <pg-switch disabled :value="!row.is_freeze"/>
                </span>
              </template>
            </pg-column>
            <pg-column title="操作" width="170px">
             <template v-slot="{row}">
               <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="!row.is_header && (app.auth.isAdmin || app.auth.ClsUserPromoterModify)">修改</a>
               <a class="mr-10 text-decoration-none" @click="handleAdjustItem(row)" v-if="!row.is_header && (app.auth.isAdmin || app.auth.ClsUserPromoterBalanceAdjust)">余额调整</a>
               <a class="text-decoration-none" v-if="!row.is_header && (app.auth.isAdmin || app.auth.ClsUserPromoterBalance)" @click="handleBalanceItem(row)">余额明细</a>
             </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination :num="list.num" v-model="query" @change="userPromoterQuery"/>
        </div>
      </div>
    </div>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'add' || dialog.type === 'modify'"
      :title="`${dialog.type === 'add' ? '新增' : '修改'}推广者`"
      width="450px"
    >
      <promoter-edit
        v-if="dialog.visible"
        :query="query"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'adjust'" :title="`${dialog.item.nickname} / ${dialog.item.login_phone} 余额调整`" width="450px">
      <promoter-adjust
        v-if="dialog.visible"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" :title="`${drawer.item.nickname} / ${drawer.item.login_phone} 余额明细`" width="960px">
      <promoter-balance
        v-if="drawer.visible"
        :id="drawer.item.id"
      />
    </pg-drawer>
  </div>

</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';

  import promoterEdit from './promoter-edit';
  import promoterAdjust from './promoter-adjust';
  import promoterBalance from './promoter-balance';

  export default {
    name: 'user-promoter',
    components: { promoterEdit, promoterAdjust, promoterBalance },
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
          visible: false,
          item: {}
        },
        toggle: true,
        loading: false,
        provinceListAuth: [],
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      document.title = '推广者 - 零售中心 - 蒲公英运营管理系统';
      this.initQuery();
      this.userPromoterQuery();
      this.commonProvinceListAuth();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code,
          is_header: '',
          is_freeze: '',
          condition: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.userPromoterQuery();
      },

      resetQuery() {
        this.initQuery();
        this.userPromoterQuery();
      },

      handleAddItem() {
        this.$data.dialog = { type: 'add', visible: true, item: {} };
      },

      handleModifyItem(item) {
        this.$data.dialog = { type: 'modify', visible: true, item: item };
      },

      handleAdjustItem(item) {
        this.$data.dialog = { visible: true, type: 'adjust', item: item };
      },

      handleSubmit() {
        this.handleCancel();
        this.userPromoterQuery();
      },

      handleCancel() {
        this.$data.dialog = { type: 'add', visible: false, item: {} };
      },

      userPromoterQuery() {
        Http.get(Api.userPromoterQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleFreezeItem(item) {
        Http.post(!item.is_freeze ? Api.userPromoterFreeze : Api.userPromoterUnFreeze, {id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: `推广者${!item.is_freeze ? '冻结' : '解冻'}成功` });
            this.userPromoterQuery();
          });
      },

      handleBalanceItem(item) {
        this.$data.drawer = { visible: true, item: item };
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

<style lang="scss" scoped>

</style>
