<template>
  <div class="pg-page">
    <div class="pg-page-header">

      <pg-tabs v-model="tab_index" borderless class="font-size-lg font-weight-bolder">
        <pg-tab index="operation" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyOperation">运营专区</pg-tab>
        <pg-tab index="display" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyDisplay">展示分类</pg-tab>
      </pg-tabs>

      <pg-select :value="app.userInfo.province_code" class="ml-auto mr-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>
    </div>

    <operation v-if="tab_index === 'operation' && (app.auth.isAdmin || app.auth.ClsItemPropertyOperation)"></operation>
    <display v-if="tab_index === 'display' && (app.auth.isAdmin || app.auth.ClsItemPropertyDisplay)"></display>

  </div>

</template>
<script>

  import { Http, Api } from '@/util';
  import operation from './operation';
  import display from './display';

  export default {
    name: 'property',
    components: { operation, display },
    inject: ['app'],
    data() {

      let tab_index = 'operation';
      const { auth } = this.app;
      if (!auth.isAdmin) {
        tab_index = auth.ClsItemPropertyOperation ? 'operation' : auth.ClsItemPropertyDisplay ? 'display' : '';
      }

      return {
        tab_index: tab_index,
        provinceListAuth: [],
      }
    },

    created() {
      document.title = '货架商品属性 - 零售中心 - 蒲公英运营管理系统';
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
