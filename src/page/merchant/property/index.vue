<template>
  <div class="pg-page">
    <div class="pg-page-header">

      <pg-tabs v-model="tab_index" borderless class="font-size-lg font-weight-bolder">
        <pg-tab index="grade" v-if="app.auth.isAdmin || app.auth.MerchantGrade">商户等级</pg-tab>
        <pg-tab index="inner" v-if="app.auth.isAdmin || app.auth.MerchantInnerTags">商户内标签</pg-tab>
        <pg-tab index="outer" v-if="app.auth.isAdmin || app.auth.MerchantOuterTags">商户外标签</pg-tab>
        <pg-tab index="store" v-if="app.auth.isAdmin || app.auth.MerchantStoreTags">门店标签</pg-tab>
      </pg-tabs>

    </div>

    <grade v-if="tab_index === 'grade' && (app.auth.isAdmin || app.auth.MerchantGrade)"/>
    <inner v-if="tab_index === 'inner' && (app.auth.isAdmin || app.auth.MerchantInnerTags)"/>
    <outer v-if="tab_index === 'outer' && (app.auth.isAdmin || app.auth.MerchantOuterTags)"/>
    <store v-if="tab_index === 'store' && (app.auth.isAdmin || app.auth.MerchantStoreTags)"/>

  </div>

</template>
<script>


import grade from './grade';
import inner from './inner';
import outer from './outer';
import store from './store';

export default {
  name: 'merchant',
  components: { grade, inner, outer, store },
  inject: ['app'],
  data() {

    let tab_index = 'grade';
    const { auth } = this.app;
    if (!auth.isAdmin) {
      tab_index = auth.MerchantGrade
        ? 'grade' : auth.MerchantInnerTags
          ? 'inner' : auth.MerchantOuterTags
            ? 'outer' : auth.MerchantStoreTags
              ? 'store' : '';
    }

    return {
      tab_index: tab_index,
    }
  },

  created() {
    document.title = '商户属性 - 商城 - 蒲公英运营管理系统';
  },

  methods: {

  }

}
</script>

<style lang="scss" scoped>

</style>
