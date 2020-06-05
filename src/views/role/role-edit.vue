<template>
  <pg-form style="width: 400px" ref="form" label-width="90px" item-width="260px">
    <pg-form-item label="权限级别" rules="required">
      <pg-button-group :options="{ 总部: 'global', 区域: 'local' }" v-model="formData.role_type" @change="changeRoleType"/>
    </pg-form-item>
    <pg-form-item label="角色名称" rules="required">
      <pg-input v-model="formData.title" placeholder="请输入角色名称" :maxlength="10"></pg-input>
    </pg-form-item>
    <pg-form-item class="pb-100" label="继承角色" help-text="注：可快速复制现有角色的权限配置">
      <pg-select searchable v-model="copy_role_id" :clearable="false" placeholder="选择现有的角色">
        <pg-option
            v-for="item in found_role_list"
            :key="item.id"
            :value="item.id"
            @click="handleCopyRole(item)"
        >{{ item.title }}
        </pg-option>
      </pg-select>
    </pg-form-item>
    <pg-form-item label="仓库权限" rules="required" v-if="formData.role_type === 'global'">
      <pg-button-group :options="{ '全部仓库': 'all', '全国仓': 'global', '区域仓': 'local' }"
                       v-model="formData.storehouse_permission_type"/>
    </pg-form-item>
    <pg-form-item label="超级级管理员" v-if="formData.role_type === 'global'">
      <pg-switch v-model="formData.is_super_admin" @change="changeSuperAdmin"></pg-switch>
    </pg-form-item>
    <pg-form-item label="备注">
      <pg-textarea :maxlength="100" v-model="formData.remark" placeholder="请输入备注..."></pg-textarea>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="cancel">取消</pg-button>
      <pg-button color="primary" :loading="loading" class="ml-20" @click="submit">确认</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import {Http, Config} from '@/util';

  export default {
    name: 'role-edit',
    inject: ['app'],
    props: {
      type: {type: String, default: 'add'},
      item: {
        type: Object, default() {
          return {};
        }
      },
      roleList: {
        type: Array, default() {
          return [];
        }
      }
    },
    data() {
      return {
        copy_role_id: 0,
        formData: {
          role_type: 'global',
          title: '',
          storehouse_permission_type: 'all',
          is_super_admin: false,
          permission_codes: [],
          remark: '',
        },
        loading: false,
      };
    },
    computed: {
      found_role_list() {
        const { role_type } = this.$data.formData;
        if (!role_type) return this.$props.roleList;
        return this.$props.roleList.filter(role => role.role_type === role_type);
      }
    },

    created() {
      if (this.$props.type === 'modify') {
        this.$data.formData = {...this.$props.item};
      }
    },

    methods: {

      changeRoleType() {
        this.$data.copy_role_id = 0;
        this.$data.formData.is_super_admin = false;
        this.$data.formData.permission_codes = [];
      },

      handleCopyRole(item) {
        this.$data.formData.is_super_admin = !!item.is_super_admin;
        this.$data.formData.permission_codes = item.permission_codes;
      },

      changeSuperAdmin(checked) {
        if (checked) this.$data.formData.permission_codes = [];
      },

      submit() {
        this.$refs['form']?.validateAll().then((valid) => {
          if (!valid) return;
          this.$data.loading = true;
          let data = {...this.$data.formData};
          const API = this.$props.type === 'add' ? Config.api.roleAdd : Config.api.roleEdit;
          Http.post(API, data)
            .then(() => {
              this.$toast({
                type: 'success',
                message: '角色修改成功',
              });
              this.$data.loading = false;
              this.$emit('submit');
            })
            .catch(() => {
              this.$data.loading = false;
            });
        });
      },

      cancel() {
        this.$emit('cancel');
      },
    },
  };
</script>

<style scoped></style>
