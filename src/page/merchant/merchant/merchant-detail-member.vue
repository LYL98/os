<template>
  <div>

    <div class="d-flex -mt-40">
      <pg-button
        class="ml-auto"
        style="z-index: 100"
        color="primary"
        v-if="app.auth.isAdmin || app.auth.MerchantMemberAdd"
        @click="handleAddItem"
      >
        新增用户
      </pg-button>
    </div>

    <div class="mt-10">
      <pg-table
        :data="list"
        primary-key="id"
        borderless
        :serialable="false"
        :height="`${app.windowHeight - 340}px`"
      >
        <pg-column title="头像" width="80px">
          <template v-slot="{row}">
            <img
              class="cursor-pointer border-radius-base"
              v-preview
              :src="(app.cos_tenctent_path + row.avatar)"
              width="48"
              height="48"
            />
          </template>
        </pg-column>
        <pg-column title="姓名" width="100px">
          <template v-slot="{row}">
            {{ row.realname }}
          </template>
        </pg-column>
        <pg-column title="登录手机" width="110px">
          <template v-slot="{row}">
            {{ row.phone }}
          </template>
        </pg-column>
        <pg-column title="账号权限" width="100px">
          <template v-slot="{row}">
            {{ row.is_main ? '主账号' : '子账号' }}
          </template>
        </pg-column>
        <pg-column title="门店名称" width="200px">
          <template v-slot="{row}">
            {{ row.is_main ? "-" : ( Array.isArray(row.store_titles) ? row.store_titles.join('、') : '-') }}
          </template>
        </pg-column>
        <pg-column title="状态" width="70px" text-align="center">
          <template v-slot="{row}">
            <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
              <span :class="`status-dot mr-5 bg-${row.is_freeze ? 'danger' : 'primary'}`"></span>
              {{ row.is_freeze ? '已冻结' : '正常' }}
            </div>
          </template>
        </pg-column>
        <pg-column prop="" title="操作" width="80px">
          <template v-slot="{row}">
            <pg-popper append-to-body trigger="hover">
              <i class="icon-menu9 cursor-pointer"></i>
              <template v-slot:content>
                <div class="dropdown-box">
                  <ul class="dropdown-list">
                    <li class="dropdown-item" v-if="(app.auth.isAdmin || app.auth.MerchantMemberFreeze) && !row.is_freeze">
                      <pg-confirm help-text="确认冻结该用户" @confirm="handleFreezeItem(row)">冻结</pg-confirm>
                    </li>
                    <li class="dropdown-item" v-if="(app.auth.isAdmin || app.auth.MerchantMemberUnFreeze) && row.is_freeze">
                      <pg-confirm help-text="确认解冻该用户" @confirm="handleUnFreezeItem(row)">解冻</pg-confirm>
                    </li>
                    <li class="dropdown-item" v-if="(app.auth.isAdmin || app.auth.MerchantMemberUnBindWechat) && row.weapp_openid">
                      <pg-confirm help-text="确认解除微信绑定" @confirm="handleUnBindWechat(row)">解除微信绑定</pg-confirm>
                    </li>
                    <li class="dropdown-item" v-if="app.auth.isAdmin || app.auth.MerchantMemberEdit" @click="handleModifyItem(row)">
                      修改
                    </li>
                    <li class="dropdown-item" v-if="app.auth.isAdmin || app.auth.MerchantMemberDelete">
                      <pg-confirm help-text="确认删除该用户" @confirm="handleDeleteItem(row)">删除</pg-confirm>
                    </li>
                  </ul>
                </div>
              </template>
            </pg-popper>
          </template>
        </pg-column>
      </pg-table>
    </div>

    <pg-dialog v-model="dialog.visible" :title="`${dialog.type === 'add' ? '新增' : '修改'}用户`" width="700px">
      <merchant-detail-member-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        :merchant_id="merchant_id"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

  </div>

</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

import merchantDetailMemberEdit from './merchant-detail-member-edit';

export default {
  name: 'merchant-detail-member',
  components: { merchantDetailMemberEdit },
  inject: ['app'],
  props: {
    merchant_id: { type: Number, default: 0 },
  },
  data() {
    return {
      query: {},
      list: [],
      dialog: {
        visible: false,
        type: 'modify',
        item: {}
      },
    }
  },

  watch: {},

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    this.merchantMemberList();
  },

  methods: {

    merchantMemberList() {
      Http.get(Api.memberList, {merchant_id: this.$props.merchant_id})
        .then(res => {
          this.$data.list = res.data || [];
        })
    },

    handleAddItem() {
      this.$data.dialog = {visible: true, type: 'add', item: {}};
    },

    handleModifyItem(item) {
      this.$data.dialog = {visible: true, type: 'modify', item: item};
    },

    handleFreezeItem(item) {
      Http.post(Api.memberFreeze, {id: item.id})
        .then(() => {
          this.merchantMemberList();
          this.$toast({message: '用户冻结成功', type: 'success'});
        });
    },

    handleUnFreezeItem(item) {
      Http.post(Api.memberUnFreeze, {id: item.id})
        .then(() => {
          this.merchantMemberList();
          this.$toast({message: '用户解冻成功', type: 'success'});
        });
    },

    handleDeleteItem(item) {
      Http.post(Api.memberDelete, {id: item.id})
        .then(() => {
          this.merchantMemberList();
          this.$toast({message: '用户删除成功', type: 'success'});
        });
    },

    handleUnBindWechat(item) {
      Http.post(Api.memberUnBindWechat, {id: item.id})
        .then(() => {
          this.merchantMemberList();
          this.$toast({message: '用户已解除微信绑定', type: 'success'});
        });
    },

    handleSubmit() {
      this.handleCancel();
      this.merchantMemberList();
    },

    handleCancel() {
      this.$data.dialog = {visible: false, type: 'add', item: {}};
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
