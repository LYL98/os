<template>
  <div class="px-20">
    <pg-form type="query">
      <div class="d-flex">
        <pg-button-group :options="{ 全部: '', 总部: 'global', 区域: 'local' }" v-model="query.role_type"/>
        <pg-search class="ml-20 w-25" placeholder="角色名称" :value="query.condition" @change="changeCondition"></pg-search>
        <pg-button class="ml-20" flat @click="resetQuery">重置筛选条件</pg-button>

        <div class="ml-auto">
          <!--          <pg-button color="primary" outline :disabled="loading" @click="handleExport" v-if="app.auth.isAdmin || app.auth.SystemRoleExport">导出角色</pg-button>-->
          <pg-button
              color="primary"
              class="ml-20"
              @click="handleAddItem"
              v-if="app.auth.isAdmin || app.auth.SystemRoleAdd"
          >
            新增角色
          </pg-button>
        </div>
      </div>
    </pg-form>

    <div class="d-flex">
      <pg-table
          :data="found_role_list"
          primary-key="id"
          @select-row="onSelectRow"
          borderless
          :serialable="false"
          class="mt-10"
          style="min-width: 260px; width: 260px;"
          height="600px"
      >
        <pg-column width="140px" prop="title" title="角色名称">
          <template v-slot="{row}">
            {{ row.title }}
          </template>
        </pg-column>
        <pg-column width="90px" prop="title" title="操作">
          <template v-slot="{ row }">
            <pg-confirm help-text="确认删除该角色" @confirm="handleDeleteItem(row)" v-if="app.auth.isAdmin || app.auth.SystemRoleDelete">
              <pg-button square flat size="sm">
                <i class="icon-bin"></i>
              </pg-button>
            </pg-confirm>
            <pg-button square flat size="sm" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.SystemRoleEdit">
              <i class="icon-compose"></i>
            </pg-button>
          </template>
        </pg-column>
      </pg-table>

      <div class="flex-grow-1">
        <div class="tree-header pt-20 d-flex align-items-center justify-content-end">
        </div>
        <div class="mt-20 d-flex justify-content-between">
          <div class="pl-50">
            <pg-button-group v-model="permission_tree_expend"
                             :options="{'全部折叠': false, '全部展开': true}"></pg-button-group>
          </div>
          <div class="d-flex align-items-center justify-content-end" v-if="app.auth.isAdmin || app.auth.SystemRoleEdit">
            <pg-switch v-model="formData.is_super_admin" @change="is_edited=true"
                       :disabled="formData.role_type === 'local'"></pg-switch>
            <span class="ml-10">超级管理员</span>
            <pg-button
                color="primary"
                class="ml-25"
                :disabled="!is_edited"
                :loading="loading"
                @click="handleSaveEdit"
            >
              保存修改
            </pg-button>
          </div>
        </div>
        <pg-tree
            class="mt-30 ml-20"
            :options="permission_tree"
            :expend="permission_tree_expend"
            :disabled="formData.is_super_admin"
            v-model="formData.permission_codes"
            @change="is_edited=true"
        ></pg-tree>
      </div>

    </div>

    <pg-dialog :title="`${dialog.type === 'add' ? '新增' : '编辑'}角色`" v-model="dialog.visible">
      <role-edit
          v-if="dialog.visible"
          :type="dialog.type"
          :item="dialog.item"
          :role-list="list"
          @submit="handleSubmit"
          @cancel="handleCancel"
      />
    </pg-dialog>
  </div>
</template>

<script>
  import {Http, Config} from '@/util';

  import roleEdit from './role-edit';

  export default {
    name: 'role',
    components: {roleEdit},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: [],
        dialog: {
          item: {},
          type: 'add',
          visible: false,
        },

        permission_tree: {childs: []}, // 权限树结构
        permission_tree_expend: false, // 权限树是否展开
        is_edited: false, // 表示权限树表单是否编辑过，初始化为 false，如果产生过变动，则设置为true
        formData: { // 权限树编辑表单
          is_super_admin: true,
          permission_codes: [],
        },
        loading: false,
      };
    },
    computed: {
      found_role_list() {
        const {role_type, condition} = this.$data.query;
        return this.$data.list.filter(role => {
          if (role_type) {
            return (role.role_type === role_type) && (role.title || '').indexOf(condition) > -1;
          }
          return (role.title || '').indexOf(condition) > -1;
        });
      }
    },
    created() {
      this.initQuery();
      this.roleList();
      this.permissionTree();
    },
    methods: {
      initQuery() {
        this.$data.query = {
          role_type: '',
          condition: '',
        };
      },
      changeCondition(v) {
        this.$data.query.condition = v;
      },
      resetQuery() {
        this.initQuery();
      },
      roleList() {
        Http.get(Config.api.roleList, this.$data.query).then((res) => {
          let list = res.data || [];
          this.$data.list = list;

          if (!!this.$data.formData.id) return; // 如果已经存在选中过的角色，则不初始化选中状态

          // 默认选中列表中的第一个
          if (list.length > 0) {
            this.$data.formData = list[0];
          }
        });
      },

      //获取权限树
      permissionTree() {
        Http.get(Config.api.permissionTree, {}).then((res) => {
          this.$data.permission_tree.childs = res.data;
        });
      },

      onSelectRow(row) {
        this.$data.formData = row;
      },

      handleAddItem() {
        this.$data.dialog = {
          type: 'add',
          item: {},
          visible: true
        };
      },

      handleModifyItem(row) {
        this.$data.dialog = {
          type: 'modify',
          item: row,
          visible: true
        };
      },

      handleSaveEdit() {
        let data = {...this.$data.formData};
        this.$data.loading = true;
        Http.post(Config.api.roleEdit, data)
          .then(() => {
            this.$data.loading = false;
            this.$data.is_edited = false;
            this.$toast({type: 'success', message: '角色修改成功'});
            this.roleList();
          }).catch(() => {
          this.$data.loading = false;
          this.$data.is_edited = false;
        });
      },

      //角色导出
      handleExport() {
        let query = {...this.$data.query};
        //判断是否可导出
        this.$data.loading = true;
        Http.get(Config.api.roleExportCheck, query)
          .then(() => {
            this.$data.loading = false;
            let queryStr = `${Config.api.roleExport}?time=${new Date().getTime()}`;
            for (let item in query) {
              queryStr += `&${item}=${query[item]}`;
            }
            window.open(queryStr);
          }).catch(() => {
          this.$data.loading = false;
        });

      },

      handleSubmit() {
        this.handleCancel();
        this.roleList();
      },

      handleDeleteItem(row) {
        Http.post(Config.api.roleDelete, {id: row.id}).then(() => {
          this.roleList();
        });
      },

      handleCancel() {
        this.$data.dialog = {
          type: 'add',
          item: {},
          visible: false
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  .tree-header {
    height: 55px;
    border-bottom: 1px solid #ddd;
  }
</style>
