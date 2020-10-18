<template>
  <div class="pg-page">
    <div class="pg-page-header">
     <pg-select v-model="province_code" class="ml-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>

      <pg-tabs v-model="tab_index" borderless class="font-size-lg font-weight-bolder">
        <pg-tab index="on">在售商品</pg-tab>
        <pg-tab index="under">待售商品</pg-tab>
      </pg-tabs>

     
    </div>

    <list-on v-if="tab_index === 'on' && (app.auth.isAdmin || app.auth.ItemList) "/>
    <list-under v-if="tab_index === 'under' && (app.auth.isAdmin || app.auth.ItemListForSale) "/>
  </div>

</template>
<script>

  import { Http, Api } from '@/util';
  import listUnder from './list-under';
  import listOn from './list-on';

  export default {
    name: 'list',
    components: {listOn, listUnder},
    inject: ['app'],
    data() {
      let tab_index = 'on';
      let province_code = this.app.userInfo.province_code;
      const { auth } = this.app;
      if (!auth.isAdmin) {
        tab_index = auth.ItemList ? 'on' : auth.ItemListForSale ? 'under' : '';
      }
      return {
        tab_index: tab_index,
        provinceListAuth: [],
        province_code: province_code,
      }
    },

    created() {
      document.title = '货架商品 - 运营中心 - 蒲公英运营管理系统';
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
