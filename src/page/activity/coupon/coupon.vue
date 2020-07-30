<template>
  <div class="pg-page">
    <div class="pg-page-header">

      <pg-tabs v-model="tab_index" borderless class="font-size-lg font-weight-bolder">
        <pg-tab index="list" v-if="app.auth.isAdmin || app.auth.ClsActivityCouponList">优惠券</pg-tab>
        <pg-tab index="grant" v-if="app.auth.isAdmin || app.auth.ClsActivityCouponGrant">发放列表</pg-tab>
      </pg-tabs>

      <pg-select v-model="province_code" class="ml-auto mr-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>
    </div>

    <coupon-list v-if="tab_index === 'list' && (app.auth.isAdmin || app.auth.ClsActivityCouponList)"/>
    <coupon-grant v-if="tab_index === 'grant' && (app.auth.isAdmin || app.auth.ClsActivityCouponGrant)"/>

  </div>

</template>
<script>

  import { Http, Api } from '@/util';

  import couponList from './coupon-list';
  import couponGrant from './coupon-grant';

  export default {
    name: 'seckill',
    components: {couponList, couponGrant},
    inject: ['app'],
    data() {
      let province_code = this.app.userInfo.province_code;

      let tab_index = 'list';
      const { auth } = this.app;
      if (!auth.isAdmin) {
        tab_index = auth.ClsActivityCouponList ? 'list' : auth.ClsActivityCouponGrant ? 'grant' : '';
      }

      return {
        tab_index: tab_index,
        provinceListAuth: [],
        province_code: province_code,
      }
    },

    created() {
      document.title = '优惠券 - 零售中心 - 蒲公英运营管理系统';
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
