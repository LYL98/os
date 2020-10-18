<template>
  <div class="pg-page">
    <div class="pg-page-header">

      <pg-tabs v-model="tab_index" borderless class="font-size-lg font-weight-bolder">
        <pg-tab index="store" v-if="app.auth.isAdmin || app.auth.MerchantStoreQuery">门店</pg-tab>
        <pg-tab index="apply" v-if="app.auth.isAdmin || app.auth.MerchantIncludedApply">满天星门店申请</pg-tab>
        <pg-tab index="intention" v-if="app.auth.isAdmin || app.auth.IntentionMerchantQuery">意向客户</pg-tab>
        <pg-tab index="refund" v-if="app.auth.isAdmin || app.auth.MerchantRefundQuery">门店筐</pg-tab>
      </pg-tabs>

    </div>

    <store v-if="tab_index === 'store' && (app.auth.isAdmin || app.auth.MerchantStoreQuery)"/>
    <apply v-if="tab_index === 'apply' && (app.auth.isAdmin || app.auth.MerchantIncludedApply)"/>
    <intention v-if="tab_index === 'intention' && (app.auth.isAdmin || app.auth.IntentionMerchantQuery)"/>
    <refund v-if="tab_index === 'refund' && (app.auth.isAdmin || app.auth.MerchantRefundQuery)"/>

  </div>

</template>
<script>

import store from './store';
import apply from './apply';
import intention from './intention';
import refund from './refund';

export default {
  name: 'merchant',
  components: { store, apply, intention, refund },
  inject: ['app'],
  data() {

    let tab_index = 'store';
    const { auth } = this.app;
    if (!auth.isAdmin) {
      tab_index = auth.MerchantStoreQuery
        ? 'store' : auth.MerchantIncludedApply
          ? 'apply' : auth.IntentionMerchantQuery
            ? 'intention' : auth.MerchantRefundQuery
              ? 'refund' : '';
    }

    return {
      tab_index: tab_index,
    }
  },

  created() {
    document.title = '商户 - 商城 - 蒲公英运营管理系统';
  },

  methods: {

  }

}
</script>

<style lang="scss" scoped>

</style>
