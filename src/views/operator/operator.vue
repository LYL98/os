<template>
  <div class="px-20">
    <div class="d-flex">
      <!--
          如果用户是local类型：
            1、只显示他所在权限级别的区域
            2、默认选中该区域
            3、不可清除
            4、重置时，也默认选中该区域
        -->
      <pg-select
          placeholder="按区域筛选"
          :value="query.opt_type === 'local' ? query.province_code : query.opt_type"
          :clearable="app.userInfo.opt_type !== 'local'"
          @change="handleChangeQuery"
      >
        <pg-option label="总部" v-if="app.userInfo.opt_type !== 'local'" value="global">总部</pg-option>
        <pg-option v-for="item in provinceList" :key="item.value" :value="item.value" @click="handleChangeProvince(item.value)">{{ item.label }}</pg-option>
      </pg-select>
      <pg-select searchable class="ml-20" placeholder="按角色筛选" v-model="query.role_id" @change="changeQuery">
        <pg-option v-for="item in roleList" :key="item.value" :value="item.value">{{ item.label }}</pg-option>
      </pg-select>
      <pg-select class="ml-20" placeholder="按职务筛选" v-model="query.post" @change="changeQuery">
        <pg-option v-for="item in OPERATOR_POST" :key="item.value" :value="item.value">{{ item.label }}</pg-option>
      </pg-select>
      <pg-search class="ml-20 w-25" placeholder="用户名/手机号" v-model="query.condition" @change="changeQuery"></pg-search>
      <pg-button class="ml-20" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>
    <div class="d-flex mt-10">
      <pg-button-group
          :options="{ '全部': '', '已冻结': '1', '未冻结': '0' }"
          v-model="query.is_freeze"
          @change="changeQuery"
      />
      <pg-button class="ml-auto" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.SystemOperatorAdd">新增运营人员</pg-button>
    </div>

    <pg-table
        class="mt-10"
        :data="list.items"
        primary-key="id"
        borderless
        :page="query.page"
        :page-size="query.page_size"
    >
      <pg-column width="160px" prop="realname" title="姓名"></pg-column>
      <pg-column width="100px" prop="phone" title="手机号"></pg-column>
      <pg-column width="100px" prop="post" title="职务">
        <template v-slot="{ row }">
          {{ OPERATOR_POST_ENUM[row.post] || '-' }}
        </template>
      </pg-column>
      <pg-column width="360px" prop="roles" title="角色">
        <template v-slot="{ row }">
          {{ row.roles.join(',') || '-' }}
        </template>
      </pg-column>
      <pg-column width="100px" prop="is_freeze" title="状态">
        <template v-slot="{ row }">
          <pg-confirm
              v-if="app.auth.isAdmin || app.auth.SystemOperatorFreeze"
              :help-text="`确认${row.is_freeze ? '解冻' : '冻结'}该用户`"
              @confirm="handleFreezeItem(row)"
          >
            <pg-switch :value="!row.is_freeze"/>
          </pg-confirm>
          <span v-else>{{ row.is_freeze ? '已冻结' : '未冻结' }}</span>
        </template>
      </pg-column>
      <pg-column width="160px" title="操作">
        <template v-slot="{row}">
          <a class="mr-10 font-size-sm" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.SystemOperatorEdit">修改</a>
          <a class="mr-10 font-size-sm" @click="handleResetPassword(row)" v-if="app.auth.isAdmin || app.auth.SystemOperatorPasswordReset">重置密码</a>
          <pg-confirm help-text="确认解除微信绑定" @confirm="handleWechatUnbound(row)" v-if="row.unbound_enable && (app.auth.isAdmin || app.auth.SystemOperatorWechatUnbound)">
            <a class="mr-10 font-size-sm">解绑微信</a>
          </pg-confirm>
        </template>
      </pg-column>
    </pg-table>
    <div class="d-flex mt-20 px-20 justify-content-end">
      <pg-pagination :num="list.num" v-model="query" @change="operatorQuery"/>
    </div>

    <pg-dialog v-model="dialog.visible" :title="`${dialog.type === 'add' ? '新增' : '编辑'}运营人员`" width="880px">
      <operator-edit
          v-if="dialog.visible"
          :type="dialog.type"
          :item="dialog.item"
          @submit="handleSubmit"
          @cancel="handleCancel"
      />
    </pg-dialog>
    <pg-dialog v-model="reset.visible" title="重置密码">
      <operator-reset-password
          v-if="reset.visible"
          :item="reset.item"
          @submit="handleSubmit"
          @cancel="handleCancel"
      />
    </pg-dialog>
  </div>
</template>

<script>
  import {Http, Constant, Config} from '@/util';
  import operatorEdit from './operator-edit';
  import operatorResetPassword from './operator-reset-password';

  export default {
    name: 'operator',
    components: {operatorEdit, operatorResetPassword},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
          num: 0,
        },
        dialog: {
          type: 'add',
          item: {},
          visible: false,
        },
        reset: {
          item: {},
          visible: false,
        },

        provinceList: [],
        roleList: []
      };
    },
    created() {
      this.OPERATOR_POST_ENUM = Constant.OPERATOR_POST('enum');
      this.OPERATOR_POST = Constant.OPERATOR_POST();
      this.initQuery();
      this.operatorQuery();
      this.commonProvinceListAuth();
      this.commonRoleList();
    },
    methods: {

      handleChangeQuery(type) {
        if (type === '') {
          this.$data.query.opt_type = '';
          this.$data.query.province_code = '';
          this.changeQuery();
          return;
        }

        if (type !== 'global') {
          this.$data.query.opt_type = 'local';
          return;
        }
        this.$data.query.opt_type = type;
        this.$data.query.province_code = '';
        this.changeQuery();
      },
      handleChangeProvince(province_code) {
        this.$data.query.province_code = province_code;
        this.changeQuery();
      },

      initQuery() {
        this.$data.query = {
          opt_type: this.app.userInfo.opt_type === 'local' ? 'local' : '',
          province_code: this.app.userInfo.opt_type === 'local' ? this.app.userInfo.province_code : '',
          condition: '',
          is_freeze: '',
          post: '',
          role_id: '',
          page: 1,
          page_size: 10,
        };
      },
      changeQuery() {
        this.$data.query.page = 1;
        this.operatorQuery();
      },
      resetQuery() {
        this.initQuery();
        this.operatorQuery();
      },
      operatorQuery() {
        this.$data.loading = true;
        Http.get(Config.api.operatorQuery, this.$data.query)
          .then((res) => {
            this.$data.loading = false;
            this.$data.list = res.data;
          })
          .catch(() => {
            this.$data.loading = false;
          })
      },

      handleAddItem() {
        this.$data.dialog = {type: 'add', item: {}, visible: true};
      },

      handleModifyItem(row) {
        this.$data.dialog = {type: 'modify', item: row, visible: true};
      },

      handleSubmit() {
        this.handleCancel();
        this.operatorQuery();
      },

      handleCancel() {
        this.$data.dialog = {type: 'add', item: {}, visible: false};
        this.$data.reset = {item: {}, visible: false};
      },

      handleResetPassword(row) {
        this.$data.reset = {item: row, visible: true};
      },

      handleFreezeItem(row) {
        Http.post(row.is_freeze ? Config.api.operatorUnFreeze : Config.api.operatorFreeze, {id: row.id}).then((res) => {
          this.operatorQuery();
        });
      },

      handleWechatUnbound(row) {
        Http.post(Config.api.operatorWechatUnbound, {id: row.id}).then((res) => {
          this.operatorQuery();
        });
      },

      // 获取所有区域
      commonProvinceListAuth() {
        Http.get(Config.api.commonProvinceListAuth).then((res) => {
          this.$data.provinceList = (res.data || []).map(item => ({
            label: item.title,
            value: item.code
          }));
        });
      },

      commonRoleList() {
        Http.get(Config.api.roleList).then((res) => {
          this.$data.roleList = (res.data || []).map(item => ({
            label: item.title,
            value: item.id
          }));
        });
      },
    },
  };
</script>

<style scoped></style>
