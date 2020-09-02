<template>
  <div class="pg-page">
    <div class="p-20">
      <div class="d-flex">
        <pg-button-group class="mr-20" v-model="query.is_freeze" :options="{ '全部': '', '正常': 0, '已冻结': 1 }" @change="changeQuery"></pg-button-group>
        <pg-select class="mr-20" v-model="query.city_id" placeholder="按县域筛选" searchable clearable @change="changeQuery" :disabled="!query.province_code">
          <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
        </pg-select>
        <pg-search class="w-25" clearable placeholder="手机号码、昵称、门店名称" v-model="query.condition" @change="changeQuery"/>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>

        <pg-button color="primary" class="ml-auto" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.ClsUserPromoterAdd">新增</pg-button>
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
            <template v-slot:ord_amount_cum>
              <div>累计分享</div>
              <div>下单金额</div>
            </template>
            <template v-slot:ord_count_cum>
              <div>累计推广</div>
              <div>购买人次</div>
            </template>
            <pg-column title="推广者名称 / 手机号" width="150px">
              <template v-slot="{row}">
                {{ row.nickname || '-' }}{{ row.login_phone && '/' }}{{ row.login_phone || '' }}
              </template>
            </pg-column>
            <pg-column title="绑定门店" width="160px">
              <template v-slot="{row}">
                {{ row.store && row.store.title || '-' }}
              </template>
            </pg-column>
            <pg-column title="所在县域" width="100px">
              <template v-slot="{row}">
                {{ row && row.city || '-' }}
              </template>
            </pg-column>
            <pg-column title="累计分享下单金额" prop="ord_amount_cum" width="90px" text-align="center">
              <template v-slot="{row}">
                <span v-if="!!(row.ord_amount_cum + row.ord_amount_today)">¥</span>{{ Handle.returnPrice(row.ord_amount_cum + row.ord_amount_today) || '-' }}
              </template>
            </pg-column>
            <pg-column title="累计推广购买人次" prop="ord_count_cum" width="90px" text-align="center">
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
                  v-if="app.auth.isAdmin || app.auth.ClsUserPromoterFreeze"
                  :help-text="`确认${row.is_freeze ? '解冻' : '冻结'}该推广者`"
                  @confirm="handleFreezeItem(row)"
                >
                  <pg-switch :value="!row.is_freeze"/>
                </pg-confirm>
              </template>
            </pg-column>
            <pg-column title="操作" width="170px">
             <template v-slot="{row}">
               <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.ClsUserPromoterModify">修改</a>
               <a class="mr-10 text-decoration-none" @click="handleAdjustItem(row)" v-if="app.auth.isAdmin || app.auth.ClsUserPromoterBalanceAdjust">余额调整</a>
               <a class="text-decoration-none" v-if="app.auth.isAdmin || app.auth.ClsUserPromoterBalance" @click="handleBalanceItem(row)">余额明细</a>
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
    name: 'promoter-list',
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
        loading: false,
        cityList: [],
      }
    },

    watch: {
      'app.userInfo.province_code': {
        handler(val) {
          this.$data.query.province_code = val;
          this.$data.query.city_id = '';
          this.changeQuery();
          this.commonCityList();
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      document.title = '推广者 - 零售中心 - 蒲公英运营管理系统';
      this.initQuery();
      this.userPromoterQuery();
      this.commonCityList();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code,
          is_freeze: '',
          condition: '',
          page: 1,
          page_size: 20,
          city_id:'',
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

      commonCityList() {
        Http.get(Api.commonCityList, { province_code: this.$data.query.province_code })
          .then(res => {
            this.$data.cityList = res.data || [];
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
    }

  }
</script>

<style lang="scss" scoped>

</style>
