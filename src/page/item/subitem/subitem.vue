<template>
  <div class="pg-page">
    <div class="pg-page-header">

      <pg-tabs v-model="tab_index" borderless class="font-size-lg font-weight-bolder">
        <pg-tab index="on">在售商品</pg-tab>
        <pg-tab index="under">待售商品</pg-tab>
        <pg-tab index="scheduler" v-if="app.auth.isAdmin || app.auth.ClsItemSubitemScheduler">定时上下架</pg-tab>
      </pg-tabs>

      <pg-select v-model="province_code" class="ml-auto mr-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>
    </div>

    <subitem-on v-if="tab_index === 'on'"/>
    <subitem-under v-if="tab_index === 'under'"/>
    <subitem-scheduler v-if="tab_index === 'scheduler' && (app.auth.isAdmin || app.auth.ClsItemSubitemScheduler)"/>

  </div>

</template>
<script>

  import { Http, Api } from '@/util';
  import subitemUnder from './subitem-under';
  import subitemOn from './subitem-on';
  import subitemScheduler from './subitem-scheduler';

  export default {
    name: 'subitem',
    components: {subitemOn, subitemUnder, subitemScheduler},
    inject: ['app'],
    data() {
      let province_code = this.app.userInfo.province_code;
      return {
        tab_index: 'on',
        provinceListAuth: [],
        province_code: province_code,
      }
    },

    created() {
      document.title = '货架商品 - 零售中心 - 蒲公英运营管理系统';
      this.commonProvinceListAuth();
    },

    methods: {

      changeProvince(province_code) {
        this.app.changeProvince(province_code);
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
