<template>
  <div>

    <div class="merchant-detail">

      <div class="row no-gutters mt-20">
        <div class="col-4">商户名称：{{ detail.title || '-' }}</div>
        <div class="col-4">协议商户：
          <span class="badge badge-sm badge-success py-2" v-if="detail.is_post_pay">是</span>
          <span class="badge badge-sm badge-warning py-2" v-else>否</span>
        </div>

        <div class="col-4 -mt-5">
          <div class="ml-auto">
            <pg-button size="sm" @click="handleModifyItem" v-if="app.auth.isAdmin || app.auth.MerchantEdit">修改商户信息</pg-button>
            <pg-button size="sm" class="ml-20" @click="handleModifyTag" v-if="app.auth.isAdmin || app.auth.MerchantGradeTags">修改等级标签</pg-button>
          </div>
        </div>
      </div>

      <div class="row no-gutters mt-10">
        <div class="col-4">授信额度：{{ Handle.returnPrice(detail.credit_limit) || '-' }}</div>
        <div class="col-4">创建时间：{{ detail.created || '-' }}</div>
        <div class="col-4">更新时间：{{ detail.updated || '-' }}</div>
      </div>

      <div class="row no-gutters mt-10">
        <div class="col-4">成长值：{{ detail.growth }}</div>
        <div class="col-4">会员等级：{{ detail.vip_title }}</div>
        <div class="col-4">等级更新时间：{{ detail.vip_updated_time || '-' }}</div>
      </div>
      <div class="row no-gutters mt-10">
        <div class="col-12">内标签：<span>{{ detail._inner_tags_str_ || '-' }}</span> </div>
      </div>
      <div class="row no-gutters mt-10">
        <div class="col-12">外标签：<span>{{ detail._outer_tags_str_ || '-' }}</span> </div>
      </div>
    </div>

    <div class="position-relative mt-10">
      <pg-tabs class="font-weight-bolder" v-model="tab_index">
        <pg-tab index="store" class="-ml-20" v-if="app.auth.isAdmin || app.auth.MerchantStoreList || app.auth.MerchantStoreEdit">门店管理</pg-tab>
        <pg-tab index="member" v-if="app.auth.isAdmin || app.auth.MerchantMemberList">用户管理</pg-tab>
      </pg-tabs>
    </div>

    <merchant-detail-store v-if="tab_index === 'store'" :merchant_id="merchant_id" :storeQuery="storeQuery"></merchant-detail-store>
    <merchant-detail-member v-if="tab_index === 'member'" :merchant_id="merchant_id"></merchant-detail-member>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'item'" title="修改商户信息">
      <merchant-detail-edit
        v-if="dialog.visible"
        :item="detail"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'tag'" title="修改商户等级标签">
      <merchant-detail-tag-edit
        v-if="dialog.visible"
        :item="detail"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

  </div>

</template>
<script>

import { Http, Api, Handle } from '@/util';

import merchantDetailEdit from './merchant-detail-edit';
import merchantDetailTagEdit from './merchant-detail-tag-edit';
import merchantDetailStore from './merchant-detail-store';
import merchantDetailMember from './merchant-detail-member';

export default {
  name: 'merchant-detail',
  components: { merchantDetailEdit, merchantDetailTagEdit, merchantDetailStore, merchantDetailMember },
  inject: ['app'],
  props: {
    storeQuery: Function,
    merchant_id: { type: Number, default: 0 },
  },
  data() {

    let tab_index = 'store';
    const { auth } = this.app;
    if (!auth.isAdmin) {
      tab_index = (auth.MerchantStoreList || auth.MerchantStoreEdit) ? 'store' : auth.MerchantMemberList ? 'member' : '';
    }

    return {
      detail: {},
      tab_index: tab_index,
      dialog: {
        visible: false,
        type: 'item'
      }
    }
  },

  created() {
    this.Handle = Handle;
    this.merchantDetail();
  },

  methods: {
    merchantDetail() {
      Http.get(Api.merchantDetail, {id: this.$props.merchant_id})
        .then(res => {
          const detail = res.data || {};
          detail._inner_tags_str_ = Array.isArray(detail.inner_tags) ? detail.inner_tags.map(item => item.title).join(', ') : [];
          detail._outer_tags_str_ = Array.isArray(detail.outer_tags) ? detail.outer_tags.join(', ') : '-';
          this.$data.detail = detail;
        });
    },

    handleModifyItem() {
      this.$data.dialog = { visible: true, type: 'item' };
    },

    handleModifyTag() {
      this.$data.dialog = { visible: true, type: 'tag' };
    },

    handleSubmit() {
      this.handleCancel();
      this.merchantDetail();
    },

    handleCancel() {
      this.$data.dialog = { visible: false, type: 'item' };
    }

  }

}
</script>
