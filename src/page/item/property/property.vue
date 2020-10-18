<template>
  <div class="pg-page">
    <div class="pg-page-header">
      <pg-select :value="app.userInfo.province_code" class="ml-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>

      <pg-tabs v-model="tab_index" borderless class="font-size-lg font-weight-bolder">
        <pg-tab index="price" v-if="app.auth.isAdmin || app.auth.ItemTagsPrice">商品价格标签</pg-tab>
        <pg-tab index="operation" v-if="app.auth.isAdmin || app.auth.ItemTags">商品运营专区</pg-tab>
        <pg-tab index="display" v-if="app.auth.isAdmin || app.auth.ItemDisplayClass">展示分类</pg-tab>
      </pg-tabs>

      
    </div>
    <item-price v-if="tab_index === 'price' && (app.auth.isAdmin || app.auth.ItemTagsPrice)"></item-price>
    <operation v-if="tab_index === 'operation' && (app.auth.isAdmin || app.auth.ItemTags)"></operation>
    <display v-if="tab_index === 'display' && (app.auth.isAdmin || app.auth.ItemDisplayClass)"></display>

  </div>

</template>
<script>

  import { Http, Api } from '@/util';
  import operation from './operation';
  import display from './display';
  import itemPrice from './item-price';

  

  export default {
    name: 'property',
    components: { operation, display, itemPrice },
    inject: ['app'],
    data() {

      let tab_index = 'price';
      const { auth } = this.app;
      if (!auth.isAdmin) {
        tab_index = auth.ItemTagsPrice ? 'price' : auth.ItemTags ? 'operation' : auth.ItemDisplayClass ? 'display' : '';
      }

      return {
        tab_index: tab_index,
        provinceListAuth: [],
      }
    },

    created() {
      document.title = '货架商品属性 - 运营中心 - 蒲公英运营管理系统';
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
