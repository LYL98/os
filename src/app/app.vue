<template>
  <router-view v-if="complete"></router-view>
</template>

<script>

  import pgyos from './../index';
  import { Constant, Storage, Config } from '@/util';

  export default {
    name: 'app',
    props: {
      userinfo: { type: Object, default() { return {} } },
      logout: { type: Function, default() { return () => {}; } },
    },
    provide() {
      return {
        app: this
      }
    },

    data() {
      return {
        complete: true,
        userInfo: {},

        current_client: 'acc', // 当前客户端
        oauth_href: '',  // 需要回跳的页面
        oauth_origin: '', // 域
        oauth_client: '',  // 子系统

        route_records: [], // { label, value, url };

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
      origin() {
        return window.location.origin;
      },
      isLocal() {
        return this.origin.indexOf('localhost') >= 0
          || this.origin.indexOf('192.168') >= 0
          || this.origin.indexOf('127.0') >= 0
          || this.origin.indexOf('172.') >= 0
          || this.origin.indexOf('10.') >= 0;
      },
      isDev() {
        return this.origin.indexOf('dev') >= 0 || this.origin.indexOf('test') >= 0;
      },
      isPre() {
        return this.origin.indexOf('pre') >= 0;
      },
      isPro() {
        return !this.isLocal && !this.isDev && !this.isPre;
      },
      prefix() {
        let acc_fix = this.origin;
        let tob_fix = this.origin;
        let toc_fix = this.origin;

        if (this.isDev) {
          acc_fix = '//yydev.pgyscm.com';
          tob_fix = '//bscdev.pgyscm.com';
          toc_fix = '//clsdev.pgyscm.com';
        }
        if (this.isPre) {
          acc_fix = '//yypre.pgyscm.com';
          tob_fix = '//bscpre.pgyscm.com';
          toc_fix = '//clspre.pgyscm.com';
        }
        if (this.isPro) {
          acc_fix = '//yy.pgyscm.com';
          tob_fix = '//bsc.pgyscm.com';
          toc_fix = '//cls.pgyscm.com';
        }

        return { tob: tob_fix, toc: toc_fix, acc: acc_fix };

      },
    },

    created() {
      // this.initData();
    },

    methods: {
      // 初始化数据
      initData() {

        if (window.location.href.indexOf('/oauth') >= 0 || window.location.href.indexOf('/login') >= 0) {
          this.$data.complete = true;
          return;
        }

        let userInfo = this.$data.userInfo;

        if (userInfo && userInfo.jwt_token && (userInfo.id || userInfo.id === 0)) {
          this.$data.route_records = this.authRouteRecords(userInfo.id);
          pgyos.init({ 
            is_main: true,
            jwt_token: userInfo.jwt_token, 
            auth: this.auth,
            debug: this.isLocal,
            env: 'dev',
          });
          this.$data.complete = true;
          return;
        }

        userInfo = Storage.get(Constant.LOCAL_USER_INFO);
        if (userInfo && userInfo.jwt_token && (userInfo.id || userInfo.id === 0)) {
          this.$data.userInfo = userInfo;
          this.$data.route_records = this.authRouteRecords(userInfo.id);
          pgyos.init({ 
            is_main: true,
            jwt_token: userInfo.jwt_token, 
            auth: this.auth,
            debug: this.isLocal, 
            env: 'dev',
          });
          this.$data.complete = true;
          return;
        }

        this.$router.replace('/login')
          .then(() => {
            this.$data.complete = true;
          })
          .catch(() => {
            this.$data.complete = true;
          });
      },

      // 根据登录用户id 初始化 路由访问记录，过滤调没有权限的。
      authRouteRecords(user_info_id) {
        let route_records = Storage.get(Constant.LOCAL_ROUTE_RECORDS + '_' + user_info_id);
        return (route_records || []).filter(route => this.auth.isAdmin || this.auth[route.value]);
      },

      handleLogin(userInfo) {
        Storage.set(Constant.LOCAL_USER_INFO, userInfo);
        this.$data.userInfo = userInfo;
        this.$data.route_records = this.authRouteRecords(userInfo.id);
        pgyos.init({ 
          is_main: true,
          jwt_token: userInfo.jwt_token, 
          auth: this.auth,
          debug: this.isLocal, 
          env: 'dev',
        });
        // 如果是开发环境，则直接跳转回开发本地客户端
        if (this.$data.oauth_href && this.$data.oauth_href.indexOf('localhost') >= 0) {
          window.location.href = this.$data.oauth_href;
        } else {
          this.$router.replace('/');
        }
      },

      handleLogout() {
        Storage.remove(Constant.LOCAL_USER_INFO);
        this.$data.userInfo = {};
        this.$data.route_records = [];
        pgyos.destory();
        this.$router.replace('/login');
      },

      handleRouteRecords(item) {
        let records = this.$data.route_records.filter(d => d.value !== item.value); // 剔除已经存在的
        records.unshift(item); // 新记录压入列表中
        records = records.filter((d, i) => i <= 7); // 最多保存8条访问记录
        this.$data.route_records = records;
        Storage.set(Constant.LOCAL_ROUTE_RECORDS + '_' + this.$data.userInfo.id, records);
        // let new_window = window.open(item.url);
        // new_window.opener = null;
        // new_window.target = '_blank';
        window.location.href = item.url;
      }
    }

  };
</script>

<style lang="scss">
</style>
