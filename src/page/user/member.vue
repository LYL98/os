<template>
  <div class="pg-page">

    <div class="p-20">
      <div class="d-flex">
        <pg-button-group v-model="query.is_freeze" :options="{ '全部': '', '正常': 0, '已冻结': 1 }" @change="changeQuery"></pg-button-group>
        <pg-select class="ml-20" v-model="query.province_code" @change="changeQuery">
          <pg-option value="" v-if="app.userInfo.opt_type === 'global'">全部</pg-option>
          <pg-option
            v-for="item in provinceListAuth"
            :key="item.code"
            :value="item.code"
          >{{ item.title }}</pg-option>
        </pg-select>
        <pg-search class="w-25 ml-20" clearable placeholder="微信昵称、团员名称" v-model="query.condition" @change="changeQuery"/>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
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
            <pg-column title="头像" width="80px">
              <template v-slot="{row}">
                <img class="rounded-round cursor-pointer" :src="cos_tenctent_path + row.avatar" alt="" width="32" height="32" v-preview>
              </template>
            </pg-column>
            <pg-column title="微信昵称" width="140px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.nickname || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="消费者名称" width="140px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.linkman || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="联系方式" width="120px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">
                  {{ row.phone || '-' }}
                </div>
              </template>
            </pg-column>
            <pg-column title="状态" width="80px">
              <template v-slot="{row}">
                <pg-confirm
                  v-if="app.auth.isAdmin || app.auth.ClsUserMemberFreeze"
                  :help-text="`确认${row.is_freeze ? '解冻' : '冻结'}该用户`"
                  @confirm="handleFreezeItem(row)"
                >
                  <pg-switch :value="!row.is_freeze"/>
                </pg-confirm>
                <span v-else>{{ row.is_freeze ? '已冻结' : '正常' }}</span>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination :num="list.num" v-model="query" @change="userMemberQuery"/>
        </div>
      </div>
    </div>

  </div>

</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';
  import pgyos from '@/pgyos.entry';

  export default {
    name: 'user-member',
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        loading: false,
        provinceListAuth: [],
      }
    },

    computed: {
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      document.title = '消费者 - 零售中心 - 蒲公英运营管理系统';
      this.initQuery();
      this.userMemberQuery();
      this.commonProvinceListAuth();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code,
          is_freeze: '',
          condition: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.userMemberQuery();
      },

      resetQuery() {
        this.initQuery();
        this.userMemberQuery();
      },

      userMemberQuery() {
        Http.get(Api.userMemberQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleFreezeItem(item) {
        Http.post(Api.userMemberFreeze, {gb_member_id: item.id, is_freeze: !item.is_freeze})
          .then(() => {
            this.$toast({ type: 'success', message: `消费者${!item.is_freeze ? '冻结' : '解冻'}成功` });
            this.userMemberQuery();
          });
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
