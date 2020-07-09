<template>
  <router-view v-if="complete"></router-view>
</template>

<script>

  import pgyos from '@/index';
  import { env, node_env } from './../env.config';
  import { Constant, Storage, Config, Http } from '@/util';

  export default {
    name: 'app',
    provide() {
      return {
        app: this
      }
    },

    data() {
      return {
        complete: false,
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
    },

    created() {
      this.initData();
    },

    methods: {
      // 初始化数据
      initData() {

        if (window.location.href.indexOf('/oauth') >= 0 || window.location.href.indexOf('/login') >= 0) {
          this.$data.complete = true;
          return;
        }

        let userInfo = this.$data.userInfo;

        if (userInfo && userInfo.jwt_token && userInfo.province_code && (userInfo.id || userInfo.id === 0)) {
          this.onComplete(userInfo);
          this.$data.complete = true;
          return;
        }

        userInfo = Storage.get(Constant.LOCAL_USER_INFO);
        if (userInfo && userInfo.jwt_token && userInfo.province_code && (userInfo.id || userInfo.id === 0)) {
          this.$data.userInfo = userInfo;
          this.onComplete(userInfo);
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

      onComplete(userInfo) {
        this.$data.route_records = this.authRouteRecords(userInfo.id);
        pgyos.init({
          is_main: true,
          jwt_token: userInfo.jwt_token,
          debug: node_env === 'development',
          auth: this.auth,
          env: env
        });
      },

      handleLogin(userInfo) {

        Storage.set(Constant.LOCAL_USER_INFO, userInfo);
        this.$data.userInfo = userInfo;
        this.onComplete(userInfo);

        if (userInfo.province_code) {
          // 如果是开发环境，则直接跳转回开发本地客户端
          if (this.$data.oauth_href && this.$data.oauth_href.indexOf('localhost') >= 0) {
            window.location.href = this.$data.oauth_href;
          } else {
            this.$router.replace('/');
          }

        } else { // 如果不存在province_code
          Http.get(Config.api.commonProvinceListAuth)
            .then(res => {
              let rd = res.data;
              if (rd && rd.length > 0) {
                userInfo.province_code = rd[0].code;
              }
              Storage.set(Constant.LOCAL_USER_INFO, userInfo);
              this.$data.userInfo = userInfo;
              this.onComplete(userInfo);
              // 如果是开发环境，则直接跳转回开发本地客户端
              if (this.$data.oauth_href && this.$data.oauth_href.indexOf('localhost') >= 0) {
                window.location.href = this.$data.oauth_href;
              } else {
                this.$router.replace('/');
              }
            });
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