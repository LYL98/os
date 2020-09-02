<template>
  <div class="pg-page">
    <div class="pg-page-header">

      <pg-tabs v-model="tab_index" borderless class="font-size-lg font-weight-bolder">
        <pg-tab index="stockSale" v-if="app.auth.isAdmin || app.auth.ClsItemStockForSale">销售库存</pg-tab>
        <pg-tab index="stockDay" v-if="app.auth.isAdmin || app.auth.ClsItemStockForSaleSnapShot">每日库存</pg-tab>
      </pg-tabs>

      <pg-select :value="app.userInfo.province_code" class="ml-auto mr-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>
    </div>

    <stock-sale v-if="tab_index === 'stockSale' && (app.auth.isAdmin || app.auth.ClsItemStockForSale)"></stock-sale>
    <stock-day v-if="tab_index === 'stockDay' && (app.auth.isAdmin || app.auth.ClsItemStockForSaleSnapShot)"></stock-day>

  </div>

</template>
<script>

  import { Http, Api } from '@/util';
  import stockSale from './stock-sale';
  import stockDay from './stock-day';

  export default {
    name: 'stock',
    components: { stockSale, stockDay },
    inject: ['app'],
    data() {

      let tab_index = 'stockSale';
      const { auth } = this.app;
      if (!auth.isAdmin) {
        tab_index = auth.ClsItemStockForSale ? 'stockSale' : auth.ClsItemStockForSaleSnapShot ? 'stockDay' : '';
      }

      return {
        tab_index: tab_index,
        provinceListAuth: [],
      }
    },

    created() {
      document.title = '商品库存 - 零售中心 - 蒲公英运营管理系统';
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
