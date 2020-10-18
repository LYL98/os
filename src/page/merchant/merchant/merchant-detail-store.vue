<template>
  <div>

    <div class="d-flex -mt-40">
      <pg-button
        class="ml-auto"
        style="z-index: 100"
        color="primary"
        v-if="app.auth.isAdmin || app.auth.MerchantStoreAdd"
        @click="handleAddItem"
      >
        新增门店
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
        <pg-column title="门店名称" width="120px">
          <template v-slot="{row}">
            <a
              v-if="app.auth.isAdmin || app.auth.MerchantStoreDetail"
              class="text-dark"
              @click="handleDetailItem(row)"
            >{{ row.title || '-' }}</a>
            <span v-else>{{ row.title || '-' }}</span>
          </template>
        </pg-column>
        <pg-column title="县域" width="100px">
          <template v-slot="{row}">
            {{ row.city && row.city.title || '-' }}
          </template>
        </pg-column>
        <pg-column title="成长值" width="80px">
          <template v-slot="{row}">
            {{ row.growth || '-' }}
          </template>
        </pg-column>
        <pg-column title="黑名单" width="70px">
          <template v-slot="{row}">
            <span class="badge badge-sm badge-danger py-2" v-if="row.is_black">是</span>
            <span class="badge badge-sm badge-primary py-2" v-else>否</span>
          </template>
        </pg-column>
        <pg-column title="收货人/联系方式" width="140px">
          <template v-slot="{row}">
            {{ row.linkman }} / {{ row.phone }}
          </template>
        </pg-column>
        <pg-column title="收货地址" width="200px">
          <template v-slot="{row}">
            {{ row.address }}
          </template>
        </pg-column>
        <pg-column title="状态" width="70px" text-align="center">
          <template v-slot="{row}">
            <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
              <span :class="`status-dot mr-5 bg-${Constant.MERCHANT_STORE_STATUS('color')[row.status]}`"></span>
              {{ Constant.MERCHANT_STORE_STATUS('enum')[row.status] || row.status || '-' }}
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
                    <li class="dropdown-item" v-if="(app.auth.isAdmin || app.auth.MerchantStoreApprove) && row.status === 'wait_audit'">
                      <pg-confirm help-text="确认审核通过该门店" @confirm="handleApproveItem(row)">审核通过</pg-confirm>
                    </li>
                    <li class="dropdown-item" v-if="(app.auth.isAdmin || app.auth.MerchantStoreFreeze) && row.status === 'business'">
                      <pg-confirm help-text="确认冻结该门店" @confirm="handleFreezeItem(row)">冻结</pg-confirm>
                    </li>
                    <li class="dropdown-item" v-if="(app.auth.isAdmin || app.auth.MerchantStoreUnFreeze) && row.status === 'freeze'">
                      <pg-confirm help-text="确认解冻该门店" @confirm="handleUnFreezeItem(row)">解冻</pg-confirm>
                    </li>
                    <li class="dropdown-item" v-if="(app.auth.isAdmin || app.auth.MerchantStoreBlacklistAdd) && !row.is_black">
                      <pg-confirm help-text="确认将该门店添加到黑名单" @confirm="handleBlacklistItem(row)">添加黑名单</pg-confirm>
                    </li>
                    <li class="dropdown-item" v-if="(app.auth.isAdmin || app.auth.MerchantStoreBlacklistRemove) && row.is_black">
                      <pg-confirm help-text="确认审核通过该门店" @confirm="handleUnBlacklistItem(row)">移除黑名单</pg-confirm>
                    </li>
                    <li class="dropdown-item" v-if="app.auth.isAdmin || app.auth.MerchantStoreEdit" @click="handleModifyItem(row)">
                      修改详情
                    </li>
                    <li class="dropdown-item" v-if="app.auth.isAdmin || app.auth.MerchantStoreEditTag" @click="handleModifyTag(row)">
                      修改标签
                    </li>
                  </ul>
                </div>
              </template>
            </pg-popper>
          </template>
        </pg-column>
      </pg-table>
    </div>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'add' || dialog.type === 'modify'"
      :title="`${ dialog.type === 'add' ? '新增' : '修改' }门店`"
      width="900px"
    >
      <merchant-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        :merchant_id="merchant_id"
        module="store"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'detail'"
      :title="`${dialog.item.title}  详情`"
      width="900px"
    >
      <merchant-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        :merchant_id="merchant_id"
        module="store"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog
      v-model="dialog.visible"
      v-if="dialog.type === 'tag'"
      :title="`修改门店标签`"
      width="500px"
    >
      <merchant-detail-store-tag-edit
        v-if="dialog.visible"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

  </div>

</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

import merchantEdit from './merchant-edit';
import merchantDetailStoreTagEdit from './merchant-detail-store-tag-edit';

export default {
  name: 'merchant-detail-store',
  components: {merchantEdit, merchantDetailStoreTagEdit},
  inject: ['app'],
  props: {
    storeQuery: Function,
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
    this.merchantStoreList();
  },

  methods: {

    merchantStoreList() {
      Http.get(Api.storeList, {merchant_id: this.$props.merchant_id})
        .then(res => {
          this.$data.list = res.data || [];
        })
    },

    handleAddItem() {
      this.$data.dialog = {visible: true, type: 'add', item: {}};
    },

    handleDetailItem(item) {
      Http.get(Api.storeDetail, {id: item.id})
        .then(res => {
          this.$data.dialog = {visible: true, type: 'detail', item: res.data || {}};
        });
    },

    handleModifyItem(item) {
      Http.get(Api.storeDetail, {id: item.id})
        .then(res => {
          this.$data.dialog = {visible: true, type: 'modify', item: res.data || {}};
        });
    },

    handleModifyTag(item) {
      this.$data.dialog = {visible: true, type: 'tag', item: item};
    },

    handleApproveItem(item) {
      Http.post(Api.storeApprove, {id: item.id})
        .then(() => {
          this.merchantStoreList();
          this.$props.storeQuery && this.$props.storeQuery();
          this.$toast({message: '商户审核通过', type: 'success'});
        });
    },

    handleFreezeItem(item) {
      Http.post(Api.storeFreeze, {id: item.id})
        .then(() => {
          this.merchantStoreList();
          this.$props.storeQuery && this.$props.storeQuery();
          this.$toast({message: '门店冻结成功', type: 'success'});
        });
    },

    handleUnFreezeItem(item) {
      Http.post(Api.storeUnFreeze, {id: item.id})
        .then(() => {
          this.merchantStoreList();
          this.$props.storeQuery && this.$props.storeQuery();
          this.$toast({message: '门店解冻成功', type: 'success'});
        });
    },

    handleBlacklistItem(item) {
      Http.post(Api.storeBlacklistAdd, {ids: [item.id]})
        .then(() => {
          this.merchantStoreList();
          this.$props.storeQuery && this.$props.storeQuery();
          this.$toast({message: '门店已添加到黑名单', type: 'success'});
        });
    },

    handleUnBlacklistItem(item) {
      Http.post(Api.storeBlacklistRemove, {id: item.id})
        .then(() => {
          this.merchantStoreList();
          this.$props.storeQuery && this.$props.storeQuery();
          this.$toast({message: '门店已从黑名单移除', type: 'success'});
        });
    },

    handleSubmit() {
      this.handleCancel();
      this.merchantStoreList();
      this.$props.storeQuery && this.$props.storeQuery();
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
