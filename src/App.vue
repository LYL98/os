<template>
  <div id="app">
    <pg-navbar
        v-if="complete"
        :username="userInfo.realname"
        @logout="handleLogout"
        @jump="handleJump"
    />

    <div class="page-content" v-if="complete">
      <pg-sidebar title="零售中心" :current-path="currentPath" :routes="sidebar_routes"/>
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
        let d = [
          {name: '商品库', icon: 'icon-file-text', code: 'ClsItemPitem', path: '/item/pitem'},
          {name: '货架商品', icon: 'icon-bookmark4', code: 'ClsItemSubitem', path: '/item/subitem'},
          {name: '货架商品属性', icon: 'icon-color-sampler', code: 'ClsItemProperty', path: '/item/property'},
          { group: true, title: '营销活动', codes: ['ClsActivitySeckill', 'ClsActivityCoupon'] },
          {name: '秒杀', icon: 'icon-rocket', code: 'ClsActivitySeckill', path: '/activity/seckill'},
          {name: '优惠券', icon: 'icon-cash2', code: 'ClsActivityCoupon', path: '/activity/coupon'},
          { group: true, title: '用户管理', codes: ['ClsUserStore', 'ClsUserPromoter', 'ClsUserMember'] },
          {name: '零售门店', icon: 'icon-home2', code: 'ClsUserStore', path: '/user/store'},
          {name: '推广者', icon: 'icon-vcard', code: 'ClsUserPromoter', path: '/user/promoter'},
          {name: '消费者', icon: 'icon-user', code: 'ClsUserMember', path: '/user/member'},
          { group: true, title: '订单管理', codes: ['ClsOrderUser', 'ClsOrderStore'] },
          {name: '用户订单', icon: 'icon-browser', code: 'ClsOrderUser', path: '/order/user'},
          {name: '门店订单', icon: 'icon-windows2', code: 'ClsOrderStore', path: '/order/store'},
          { group: true, title: '财务管理', codes: ['ClsFinancePromoterWithdraw'] },
          {name: '推广者提现', icon: 'icon-coin-yen', code: 'ClsFinancePromoterWithdraw', path: '/finance/promoter-withdraw'},
          { group: true, title: '设置', codes: ['ClsSettingBanner', 'ClsSettingOperation'] },
          {name: 'Banner管理', icon: 'icon-width', code: 'ClsSettingBanner', path: '/setting/banner'},
          {name: '区域运营设置', icon: 'icon-cog', code: 'ClsSettingOperation', path: '/setting/operation'},
        ];
        if (this.auth.isAdmin) return d;
        return d.filter(item => {
          if (item.group) {
            return Array.isArray(item.codes) && item.codes.some(code => this.auth[code]);
          }
          return this.auth[item.code]
        });
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
      }
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
