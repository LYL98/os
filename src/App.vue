<template>
  <div id="app">
    <pg-navbar
      v-if="complete"
      :username="userInfo.realname"
      @logout="handleLogout"
      @jump="handleJump"
      @notification="handleNotification"
    />

    <div class="page-content" v-if="complete">
      <pg-sidebar :title="sidebar_routes.title" :current-path="currentPath" :routes="sidebar_routes.items"/>
      <router-view />
    </div>

    <iframe
      ref="transmitter"
      class="iframe-hidden"
      :src="oauth_token_page"
      @load="postMessage"
    />
  </div>
</template>
<script>

  import pgyos from './pgyos.entry';
  import {
    node_env,
    env,
    oauth_origin,
    oauth_login_page,
    oauth_token_key,
    oauth_token_page
  } from './env.config';

  // 子系统启动时，需要加载远程的userinfo
  // 如果存在userinfo 则 做对应处理，如果不存在则执行路由跳转
  export default {
    name: 'App',
    provide() {
      return {
        app: this,
      }
    },
    data() {
      return {
        currentPath: '',
        userInfo: {},
        complete: false,
        windowHeight: 600,
        oauth_token_page: '',

        notification: {
          check: () => {}
        }
      }
    },
    watch: {
      '$route.path': {
        deep: true,
        handler(val) {
          this.$data.currentPath = val;
        }
      }
    },
    computed: {
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      },
      auth() {
        const userInfo = this.$data.userInfo;

        if (!userInfo) return {};

        if (userInfo.is_admin) return { isAdmin: true };

        let d = {};
        (userInfo.permission_codes || []).forEach(item => {
          d[item] = true;
        });
        return d;
      },
      sidebar_routes() {
        let routes = [
          {
            title: '商城',
            items: [
              {name: '货架商品', icon: 'icon-cube3', code: 'ItemListMain', path: '/item/list'},
              {name: '货架商品属性', icon: 'icon-cube2', code: 'ItemListPropertyMain', path: '/item/property'},
              {name: '每日报价', icon: 'icon-dots', code: 'ItemPricing', path: '/item/pricing'},
              {name: '客户提报', icon: 'icon-truck', code: 'AdvicedItemQuery', path: '/item/customer/advice'},

              { group: true, title: '营销活动', codes: ['MarketingScopePromotionQuery', 'BscActivityCoupon', 'MarketingStrategyCity', 'MarketingStrategyStep', 'LiveManage'] },
              {name: '全场营销', icon: 'icon-megaphone', code: 'MarketingScopePromotionQuery', path: '/activity/scope'},
              {name: '优惠券', icon: 'icon-cash2', code: 'BscActivityCoupon', path: '/activity/coupon'},
              {name: '县域定价', icon: 'icon-align-bottom', code: 'MarketingStrategyCity', path: '/activity/city-price'},
              {name: '阶梯定价', icon: 'icon-equalizer', code: 'MarketingStrategyStep', path: '/activity/step-price'},
              {name: '直播管理', icon: 'icon-play', code: 'LiveManage', path: '/activity/live'},

              { group: true, title: '商户管理', codes: ['MerchantMain', 'MerchantLocation', 'MerchantPropertyMain', 'BscMerchantVip', 'BscMerchantBlacklist'] },
              {name: '商户', icon: 'icon-home', code: 'MerchantMain', path: '/merchant'},
              {name: '商户地图', icon: 'icon-map4', code: 'MerchantLocation', path: '/merchant/amap'},
              {name: '商户属性', icon: 'icon-bookmarks', code: 'MerchantPropertyMain', path: '/merchant/property'},
              {name: '会员等级', icon: 'icon-vcard', code: 'BscMerchantVip', path: '/merchant/vip'},
              {name: '黑名单', icon: 'icon-user-lock', code: 'BscMerchantBlacklist', path: '/merchant/blacklist'},

              { group: true, title: '订单管理', codes: ['OrderList', 'OrderAfterSale', 'OrderSaleBackQuery'] },
              {name: '用户订单', icon: 'icon-browser', code: 'OrderList', path: '/order/user'},
              {name: '售后单', icon: 'icon-stack', code: 'OrderAfterSale', path: '/order/after-sale'},
              {name: '退货单', icon: 'icon-stack4', code: 'OrderSaleBackQuery', path: '/order/return'},

              { group: true, title: '设置', codes: ['Banner', 'BscSettingOperation'] },
              {name: 'Banner管理', icon: 'icon-width', code: 'Banner', path: '/setting/banner'},
              {name: '运营设置', icon: 'icon-cog', code: 'BscSettingOperation', path: '/setting/operation'},
            ]
          },
          {
            title: '财务',
            items: [
              {name: '客户财务管理', icon: 'icon-clapboard', code: 'FinanceBalanceQuery', path: '/finance/balance'},
              {name: '财务审核', icon: 'icon-design', code: 'FinanceApproveQuery', path: '/finance/approve'},
              {name: '供应商流水', icon: 'icon-quill2', code: 'FinanceSBDetail', path: '/finance/sup-bdetail'},
              {name: '供应商对账单', icon: 'icon-newspaper', code: 'FinanceSStatement', path: '/finance/sup-bill'},
            ]
          },

        ];
        let data = routes[0];

        for (let i = 1; i < routes.length; i++) {
          if (routes[i] && routes[i].items.some(item => item.path === this.currentPath)) {
            data = routes[i];
          }
        }

        if (this.auth.isAdmin) return data;
        return {
          title: data.title,
          items: data.items.filter(item => {
            if (item.group) {
              return Array.isArray(item.codes) && item.codes.some(code => this.auth[code]);
            }
            return this.auth[item.code]
          })
        };

        // let d = [
        //   // { group: true, title: '商品', codes: ['ItemListMain', 'ItemListPropertyMain','ItemPricing','AdvicedItemQuery'] },
        //   {name: '货架商品', icon: 'icon-cube3', code: 'ItemListMain', path: '/item/list'},
        //   {name: '货架商品属性', icon: 'icon-cube2', code: 'ItemListPropertyMain', path: '/item/property'},
        //   {name: '每日报价', icon: 'icon-dots', code: 'ItemPricing', path: '/item/pricing'},
        //   {name: '客户提报', icon: 'icon-truck', code: 'AdvicedItemQuery', path: '/item/customer/advice'},
        //
        //   { group: true, title: '营销活动', codes: ['MarketingScopePromotionQuery', 'BscActivityCoupon', 'MarketingStrategyCity', 'MarketingStrategyStep', 'LiveManage'] },
        //   {name: '全场营销', icon: 'icon-megaphone', code: 'MarketingScopePromotionQuery', path: '/activity/scope'},
        //   {name: '优惠券', icon: 'icon-cash2', code: 'BscActivityCoupon', path: '/activity/coupon'},
        //   {name: '县域定价', icon: 'icon-align-bottom', code: 'MarketingStrategyCity', path: '/activity/city-price'},
        //   {name: '阶梯定价', icon: 'icon-equalizer', code: 'MarketingStrategyStep', path: '/activity/step-price'},
        //   {name: '直播管理', icon: 'icon-play', code: 'LiveManage', path: '/activity/live'},
        //
        //   { group: true, title: '商户管理', codes: ['MerchantMain', 'MerchantPropertyMain', 'BscMerchantVip', 'BscMerchantBlacklist'] },
        //   {name: '商户', icon: 'icon-home', code: 'MerchantMain', path: '/merchant'},
        //   {name: '商户属性', icon: 'icon-bookmarks', code: 'MerchantPropertyMain', path: '/merchant/property'},
        //   {name: '会员等级', icon: 'icon-vcard', code: 'BscMerchantVip', path: '/merchant/vip'},
        //   {name: '黑名单', icon: 'icon-user-lock', code: 'BscMerchantBlacklist', path: '/merchant/blacklist'},
        //
        //   { group: true, title: '订单管理', codes: ['OrderList', 'OrderAfterSale', 'OrderSaleBackQuery'] },
        //   {name: '用户订单', icon: 'icon-browser', code: 'OrderList', path: '/order/user'},
        //   {name: '售后单', icon: 'icon-stack', code: 'OrderAfterSale', path: '/order/after-sale'},
        //   {name: '退货单', icon: 'icon-stack4', code: 'OrderSaleBackQuery', path: '/order/return'},
        //
        //   { group: true, title: '财务管理', codes: ['FinanceBalanceQuery', 'FinanceApproveQuery', 'FinanceSBDetail', 'FinanceSStatement'] },
        //   {name: '客户财务管理', icon: 'icon-clapboard', code: 'FinanceBalanceQuery', path: '/finance/balance'},
        //   {name: '财务审核', icon: 'icon-design', code: 'FinanceApproveQuery', path: '/finance/approve'},
        //   {name: '供应商流水', icon: 'icon-quill2', code: 'FinanceSBDetail', path: '/finance/sup-bdetail'},
        //   {name: '供应商对账单', icon: 'icon-newspaper', code: 'FinanceSStatement', path: '/finance/sup-bill'},
        //
        //   { group: true, title: '设置', codes: ['Banner', 'BscSettingOperation'] },
        //   {name: 'Banner管理', icon: 'icon-width', code: 'Banner', path: '/setting/banner'},
        //   {name: '运营设置', icon: 'icon-cog', code: 'BscSettingOperation', path: '/setting/operation'},
        //
        // ];
        // if (this.auth.isAdmin) return d;
        // return d.filter(item => {
        //   if (item.group) {
        //     return Array.isArray(item.codes) && item.codes.some(code => this.auth[code]);
        //   }
        //   return this.auth[item.code]
        // });

      }
    },
    created() {
      window.addEventListener('message', this.messageHandler);
      window.addEventListener('resize', this.onWindowResize);
      this.onWindowResize();
      this.$data.oauth_token_page = oauth_token_page;
    },
    beforeDestroy() {
      window.removeEventListener('message', this.messageHandler);
      window.removeEventListener('resize', this.onWindowResize);
    },
    methods: {
      postMessage() {
        this.$refs['transmitter'].contentWindow.postMessage(
          JSON.stringify({ type: 'get', key: oauth_token_key }),
          '*'
        );
      },
      messageHandler(res) {
        if (res.origin && res.origin === oauth_origin) {
          let { code, type, data } = res.data;
          if (code === 0) {
            switch (type) {
              case 'get':
                data = data ? JSON.parse(data) : '';
                if (data && data.jwt_token && data.province_code) {
                  this.$data.userInfo = data;
                  pgyos.init({
                    jwt_token: data.jwt_token,
                    auth: this.auth,
                    debug: node_env === 'development',
                    env: env
                  });
                  this.$data.complete = true;
                } else {
                  window.location.href = oauth_login_page + '?client=cls&origin=' + encodeURIComponent(window.location.origin) + '&href=' + encodeURIComponent(window.location.href);
                }
                break;
              case 'remove':
              case 'clear':
                this.$data.userInfo = {};
                pgyos.destory();
                window.location.href = oauth_login_page + '?client=cls&origin=' + encodeURIComponent(window.location.origin) + '&href=' + encodeURIComponent(window.location.href);
                break;
            }
          } else {
            pgyos.destory();
            window.location.href = oauth_login_page + '?client=cls&origin=' + encodeURIComponent(window.location.origin) + '&href=' + encodeURIComponent(window.location.href);
          }
        }
      },

      onWindowResize() {
        let windowHeight = 0;
        if (document.compatMode === "CSS1Compat") {
          windowHeight = document.documentElement.clientHeight;
        } else {
          windowHeight = document.body.clientHeight;
        }
        this.$data.windowHeight = windowHeight;
      },

      changeProvince(province_code) {
        const userInfo = {...this.$data.userInfo, province_code};
        this.$data.userInfo = userInfo;
        this.$refs['transmitter'].contentWindow.postMessage(
          JSON.stringify({ type: 'set', key: oauth_token_key, value: JSON.stringify(userInfo) }),
          '*'
        );
      },

      handleLogout() {
        this.$refs['transmitter'].contentWindow.postMessage(
          JSON.stringify({ type: 'remove', key: oauth_token_key }),
          '*'
        );
      },

      handleJump(item) {
        window.location.href = item.url;
      },

      handleNotification(notification) {
        this.$data.notification = notification;
      },

    },
  };
</script>

<style lang="scss" scoped>

  #app {
    .page-content {
      padding-left: 200px;
      min-width: 1280px;
    }
  }

  .iframe-hidden {
    width: 1px;
    height: 1px;
    border: 0;
    position: absolute;
    left: -9999px;
    top: -9999px;
  }

</style>
