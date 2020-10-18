<template>
  <div class="pg-page">
    <div class="pg-page-header">

      <pg-tabs v-model="tab_index" borderless class="font-size-lg font-weight-bolder">
        <pg-tab index="list" v-if="app.auth.isAdmin || app.auth.BscMerchantVipList">会员等级</pg-tab>
        <pg-tab index="growth" v-if="app.auth.isAdmin || app.auth.BscMerchantVipGrowth">成长值配置</pg-tab>
        <pg-tab index="desc" v-if="app.auth.isAdmin || app.auth.BscMerchantVipDesc">等级说明</pg-tab>
      </pg-tabs>

    </div>

    <vip-list v-if="tab_index === 'list' && (app.auth.isAdmin || app.auth.BscMerchantVipList)"/>
    <vip-growth v-if="tab_index === 'growth' && (app.auth.isAdmin || app.auth.BscMerchantVipGrowth)"/>
    <vip-desc v-if="tab_index === 'desc' && (app.auth.isAdmin || app.auth.BscMerchantVipDesc)"/>

  </div>

</template>
<script>

  import vipList from './vip-list';
  import vipGrowth from './vip-growth';
  import vipDesc from './vip-desc';

  export default {
    name: 'vip',
    components: {vipList, vipGrowth, vipDesc},
    inject: ['app'],
    data() {

      let tab_index = 'list';
      const { auth } = this.app;
      if (!auth.isAdmin) {
        tab_index = auth.BscMerchantVipList ? 'list'
          : auth.BscMerchantVipGrowth ? 'growth'
            : auth.BscMerchantVipDesc ? 'desc'
              : '';
      }

      return {
        tab_index: tab_index,
      }
    },

    created() {
      document.title = '会员等级 - 商户管理 - 蒲公英运营管理系统';
    },

    methods: {

    }

  }
</script>

<style lang="scss" scoped>

</style>
