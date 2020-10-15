<template>
  <div class="pg-page">
    <pg-navbar
        :username="app.userInfo.realname"
        @logout="handleLogout"
        @jump="handleJump"
    />
    <div class="pg-body p-20">
      <div class="w-1280 row m-auto">
        <div class="col-8">
          <div class="card px-20">
            <div class="card-title">
              快速搜索访问
            </div>
            <div class="card-body">
              <pg-search
                  auto-focus
                  auto-complete
                  :options="route_search_options"
                  @select="app.handleRouteRecords"
                  size="lg"
                  class="w-100"
                  placeholder="搜索二级模块名称（支持拼音模糊匹配）如：商品库、用户订单、sp、dd 等..."
              />
              <!--  最近访问列表 -->
              <div class="shortcut-list">最近访问</div>
              <div class="row route-records">
                <div class="col-12 empty" v-if="app.route_records.length <= 0">
                  暂时还没有访问记录～
                </div>
                <div class="col-3 mb-10" v-else v-for="item in app.route_records" :key="item.value">
                  <pg-button
                      size="sm"
                      block
                      color="light"
                      class="text-left"
                      @click="app.handleRouteRecords(item)"
                  >{{ item.label }}</pg-button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-4">
          <div class="card px-20 bg-user">
            <div class="card-title d-flex align-items-center divider-line-bottom pb-15">
              <div class="avatar">
                <svg width="48px" height="48px" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg"
                     xmlns:xlink="http://www.w3.org/1999/xlink">
                  <defs>
                    <linearGradient x1="0%" y1="100%" x2="100%" y2="16.5090461%" id="linearGradient-1">
                      <stop stop-color="#E8F0FF" offset="0%"></stop>
                      <stop stop-color="#CCDDFF" offset="100%"></stop>
                    </linearGradient>
                    <path
                        d="M19,0 C8.512,0 0,8.512 0,19 C0,29.4861 8.512,38 19,38 C29.488,38 38,29.4861 38,19 C38,8.512 29.488,0 19,0"
                        id="path-2"></path>
                  </defs>
                  <g id="导航" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="总览页-填写" transform="translate(-984.000000, -123.000000)">
                      <g id="个人信息" transform="translate(964.000000, 100.000000)">
                        <g id="2019更新-icon-头像-默认头像-男的副本" transform="translate(19.000000, 20.000000)">
                          <g id="Page-1" transform="translate(1.000000, 3.000000)">
                            <rect id="矩形" x="0" y="0" width="48" height="48"></rect>
                            <g id="合并形状" transform="translate(4.000000, 5.000000)">
                              <mask id="mask-3" fill="white">
                                <use xlink:href="#path-2"></use>
                              </mask>
                              <use id="Mask" fill="url(#linearGradient-1)" opacity="0.419666109"
                                   xlink:href="#path-2"></use>
                              <path
                                  d="M15.3594948,25.1393725 C16.6445565,27.4257832 18.0357,28.8408938 19.0018429,28.8408938 C19.9874678,28.8408938 21.4154061,27.3681373 22.7217958,25 L27.7936372,25.9630113 C30.5110312,26.478974 32.5236021,28.7856976 32.6663894,31.5479538 L32.9945734,37.8967533 C33.0515951,38.99985 32.2035836,39.9403116 31.1004869,39.9973332 C31.0661001,39.9991108 31.031673,40 30.9972402,40 L7.00362174,40 C5.89905224,40 5.00362174,39.1045695 5.00362174,38 C5.00362174,37.9549423 5.00514438,37.9098975 5.00818707,37.8649426 L5.41483693,31.8568051 C5.59195864,29.2398817 7.44837442,27.0413166 9.99861965,26.4282019 L15.3594948,25.1393725 Z M12.0080716,13.8267826 C12.0027117,13.7185307 12,13.609582 12,13.5 C12,9.91014913 14.9101491,7 18.5,7 C22.0898509,7 25,9.91014913 25,13.5 C25,13.609582 24.9972883,13.7185307 24.9919284,13.8267826 C24.9972883,13.9702881 25,14.123672 25,14.2874143 C25,19.6515273 22.1061784,24 18.5,24 C14.8938216,24 12,19.6515273 12,14.2874143 C12,14.123672 12.0027117,13.9702881 12.0080716,13.8267826 Z"
                                  fill="#006DFF"
                                  opacity="0.5"
                                  mask="url(#mask-3)"
                              ></path>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
              <div class="userinfo ml-10">
                <div>{{ app.userInfo.phone }}</div>
                <div class="role">
                  权限级别：
                  <span class="overflow-ellipsis">{{ app.userInfo.opt_type === 'global' ? '总部' : '区域' }}</span>
                  <span class="is-admin" v-if="app.userInfo.is_admin">超级管理员</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card px-20 mt-20 wechat-card">
            <div class="card-title">
              <svg width="18" height="18" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g stroke="none" stroke-width="1" fill="#777" fill-rule="evenodd">
                  <g transform="translate(-985.000000, -264.000000)" fill="#777">
                    <g transform="translate(964.000000, 241.000000)">
                      <g transform="translate(21.000000, 23.000000)">
                        <path
                            d="M5.50201042,6.74798958 C4.81220964,6.74798958 4.25301563,6.18879557 4.25301563,5.49899479 C4.25301563,4.80919402 4.81220964,4.25 5.50201042,4.25 C6.19181119,4.25 6.75100521,4.80919402 6.75100521,5.49899479 C6.75100521,6.18879557 6.19181119,6.74798958 5.50201042,6.74798958 Z M10.4979896,6.74798958 C9.80818881,6.74798958 9.24899479,6.18879557 9.24899479,5.49899479 C9.24899479,4.80919402 9.80818881,4.25 10.4979896,4.25 C11.1877904,4.25 11.7469844,4.80919402 11.7469844,5.49899479 C11.7469844,6.18879557 11.1877904,6.74798958 10.4979896,6.74798958 Z M10.3447781,13.6945214 C9.60323537,13.8931321 8.81588073,14 8,14 C3.581722,14 0,10.8659932 0,7 C0,3.13400675 3.581722,0 8,0 C12.418278,0 16,3.13400675 16,7 C16,9.24777988 14.7891865,11.2481092 12.9071281,12.5288654 L13.7310151,14.5885828 C13.7925491,14.7424178 13.7177243,14.917009 13.5638893,14.978543 C13.4900151,15.0080927 13.407428,15.0070857 13.3342963,14.9757435 L10.3447781,13.6945214 Z M8,12 C11.3686986,12 14,9.69761131 14,7 C14,4.30238869 11.3686986,2 8,2 C4.63130136,2 2,4.30238869 2,7 C2,9.69761131 4.63130136,12 8,12 Z"
                        ></path>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
              运营助手小程序
            </div>
            <div class="card-body">
              <div class="wechat-relevance">
                扫描小程序二维码，即可使用小程序版本运营助手，实时管理业务，提高工作效率。
              </div>
              <img class="wechat-qrcode" src="@/assets/qrcode-nyx.png" v-if="env === 'pro'"/>
              <img class="wechat-qrcode" src="@/assets/qrcode-nyx-dev.png" v-else/>
            </div>
          </div>
        </div>
      </div>
      <div class="w-1280 row m-auto" v-if="app.auth.isAdmin || (app.auth.SystemOperatorList && app.auth.SystemRoleList)">
        <div class="col-12">
          <div class="card mt-20">
            <div class="card-title">
              <pg-tabs v-model="tab">
                <pg-tab index="operator">运营人员</pg-tab>
                <pg-tab index="role">角色管理</pg-tab>
              </pg-tabs>
            </div>
            <div class="card-body">
              <operator v-show="tab === 'operator'"></operator>
              <role v-show="tab === 'role'"></role>
            </div>
          </div>
        </div>
      </div>
      <div class="w-1280 row m-auto" v-else-if="app.auth.SystemOperatorList">
        <div class="col-12">
          <div class="card mt-20">
            <div class="card-body">
              <operator></operator>
            </div>
          </div>
        </div>
      </div>
      <div class="w-1280 row m-auto" v-else-if="app.auth.SystemRoleList">
        <div class="col-12">
          <div class="card mt-20">
            <div class="card-body">
              <role></role>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import pgyos from '@/index';
  import { env } from './../env.config';
  import operator from './../views/operator/operator';
  import role from './../views/role/role';

  export default {
    name: 'Home',
    components: {
      operator,
      role,
    },
    inject: ['app'],
    data() {
      return {
        tab: 'operator',
      };
    },
    computed: {
      route_search_options() {
        return [];
      }
    },

    created() {
      document.title = '蒲公英运营管理中心';
      this.env = env;
    },

    methods: {
      handleLogout() {
        this.app?.handleLogout();
      },
      handleJump(item) {
        this.app?.handleRouteRecords(item)
      },
    },
  };
</script>

<style lang="scss" scoped>
  .w-1280 {
    width: 1240px;
  }

  .card {
    background-color: #fff;
    box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.2);
    padding-bottom: 20px;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
  }

  .card-title {
    font-weight: 600;
    padding-top: 20px;
    font-size: 14px;
  }

  .card-body {
    padding: 15px 0 20px;
  }

  .shortcut-list {
    margin-top: 25px;
    font-size: 14px;
    margin-bottom: 15px;
  }

  .route-records {
    height: 68px;

    .empty {
      margin-top: 20px;
      text-align: center;
      color: #bbb;
    }

  }

  .avatar,
  .userinfo {
    display: inline-block;
  }

  .card-title .role {
    font-size: 12px;
    color: #666;
    font-weight: 400;
  }

  .card-title .is-admin {
    background-color: #33d386;
    padding: 0 4px;
    color: #fff;
    line-height: 18px;
    display: inline-block;
    margin-left: 4px;
  }

  .card.wechat-card {
    padding-right: 0;
    background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjEzNnB4IiBoZWlnaHQ9IjEzNnB4IiB2aWV3Qm94PSIwIDAgMTM2IDEzNiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjIgKDY3MTQ1KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4NCiAgICA8dGl0bGU+5omL5py6PC90aXRsZT4NCiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4NCiAgICA8ZGVmcz4NCiAgICAgICAgPHJlY3QgaWQ9InBhdGgtMSIgeD0iMCIgeT0iMCIgd2lkdGg9IjEzNiIgaGVpZ2h0PSIxMzYiPjwvcmVjdD4NCiAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSIxOTkuNTQ3MDM3JSIgeTE9IjE5MC4xMjA4MDQlIiB4Mj0iMCUiIHkyPSIwJSIgaWQ9ImxpbmVhckdyYWRpZW50LTMiPg0KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjAlIj48L3N0b3A+DQogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRDdEN0Q3IiBvZmZzZXQ9IjEwMCUiPjwvc3RvcD4NCiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4NCiAgICA8L2RlZnM+DQogICAgPGcgaWQ9IuWvvOiIqiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+DQogICAgICAgIDxnIGlkPSLmgLvop4jpobUt5aGr5YaZIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTE4Mi4wMDAwMDAsIC0yNDEuMDAwMDAwKSI+DQogICAgICAgICAgICA8ZyBpZD0i5LqRK+ekvuWMuumXruetlCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOTY0LjAwMDAwMCwgMjQxLjAwMDAwMCkiPg0KICAgICAgICAgICAgICAgIDxnIGlkPSLmiYvmnLoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIxNy4wMDAwMDAsIDAuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgICAgIDxtYXNrIGlkPSJtYXNrLTIiIGZpbGw9IndoaXRlIj4NCiAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+DQogICAgICAgICAgICAgICAgICAgIDwvbWFzaz4NCiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9Ik1hc2siIG9wYWNpdHk9IjAuNjA4MDAzMTYyIj48L2c+DQogICAgICAgICAgICAgICAgICAgIDxnIGlkPSLliIbnu4QtMTQiIG1hc2s9InVybCgjbWFzay0yKSI+DQogICAgICAgICAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMS4wMDAwMDAsIDkuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTEwOS40MTk3NDcsMTUzLjA3NjA1MyBDMTA5Ljc4NzkzOSwxNTIuNDcwODUxIDExMCwxNTEuNzYwMTkgMTEwLDE1MSBMMTEwLDIwIEMxMTAsMTcuNzkwODYxIDEwOC4yMDkxMzksMTYgMTA2LDE2IEwxMCwxNiBDNy43OTA4NjEsMTYgNiwxNy43OTA4NjEgNiwyMCBMNiwxNTEgQzYsMTUxLjc2MDE5IDYuMjEyMDYwNjcsMTUyLjQ3MDg1MSA2LjU4MDI1MzE0LDE1My4wNzYwNTMgQzIuNzA1ODEyNTcsMTUxLjM3NDEzNSA1LjUxNDY1MjU3ZS0xNiwxNDcuNTAzMDU2IDAsMTQzIEwwLDExIEMtNy40Mzk4OTEyNmUtMTYsNC45MjQ4Njc3NSA0LjkyNDg2Nzc1LDEuMTE1OTgzNjllLTE1IDExLDAgTDEwNSwwIEMxMTEuMDc1MTMyLC0xLjExNTk4MzY5ZS0xNSAxMTYsNC45MjQ4Njc3NSAxMTYsMTEgTDExNiwxNDMgQzExNiwxNDcuNTAzMDU2IDExMy4yOTQxODcsMTUxLjM3NDEzNSAxMDkuNDE5NzQ3LDE1My4wNzYwNTMgWiIgaWQ9IuWQiOW5tuW9oueKtiIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudC0zKSIgb3BhY2l0eT0iMC42NDQ4MzM1MTkiPjwvcGF0aD4NCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNDgsNyBMNzMsNyBDNzMuNTUyMjg0Nyw3IDc0LDcuNDQ3NzE1MjUgNzQsOCBDNzQsOC41NTIyODQ3NSA3My41NTIyODQ3LDkgNzMsOSBMNDgsOSBDNDcuNDQ3NzE1Myw5IDQ3LDguNTUyMjg0NzUgNDcsOCBDNDcsNy40NDc3MTUyNSA0Ny40NDc3MTUzLDcgNDgsNyBaIE00MSwxMCBDMzkuODk1NDMwNSwxMCAzOSw5LjEwNDU2OTUgMzksOCBDMzksNi44OTU0MzA1IDM5Ljg5NTQzMDUsNiA0MSw2IEM0Mi4xMDQ1Njk1LDYgNDMsNi44OTU0MzA1IDQzLDggQzQzLDkuMTA0NTY5NSA0Mi4xMDQ1Njk1LDEwIDQxLDEwIFoiIGlkPSLlkIjlubblvaLnirYiIGZpbGw9IiM5MDkwOTAiIG9wYWNpdHk9IjAuMjA5NTQyNDExIj48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGcgaWQ9IuWIhue7hC03IiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE1LjAwMDAwMCwgMjkuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xLjUsMTIuNDg4NjE0NSBMMC41LDEyLjQ4ODYxNDUgTDAuNSwzLjM1NTIzNzggQzAuNSwxLjk3NDUyNTkzIDEuNjE5Mjg4MTMsMC44NTUyMzc4MDEgMywwLjg1NTIzNzgwMSBMMTIuNzgxOTU1NCwwLjg1NTIzNzgwMSBMMTIuNzgxOTU1NCwxLjg1NTIzNzggTDMsMS44NTUyMzc4IEMyLjE3MTU3Mjg4LDEuODU1MjM3OCAxLjUsMi41MjY4MTA2OCAxLjUsMy4zNTUyMzc4IEwxLjUsMTIuNDg4NjE0NSBaIE04My43ODE5NTU0LDEzLjQ4ODYxNDUgTDgzLjc4MTk1NTQsNC4zNTUyMzc4IEM4My43ODE5NTU0LDMuNTI2ODEwNjggODMuMTEwMzgyNSwyLjg1NTIzNzggODIuMjgxOTU1NCwyLjg1NTIzNzggTDcyLjUsMi44NTUyMzc4IEw3Mi41LDEuODU1MjM3OCBMODIuMjgxOTU1NCwxLjg1NTIzNzggQzgzLjY2MjY2NzMsMS44NTUyMzc4IDg0Ljc4MTk1NTQsMi45NzQ1MjU5MyA4NC43ODE5NTU0LDQuMzU1MjM3OCBMODQuNzgxOTU1NCwxMy40ODg2MTQ1IEw4My43ODE5NTU0LDEzLjQ4ODYxNDUgWiBNODQuNzkzMzQwOSw3NC44NjY2MjMzIEw4NS43OTMzNDA5LDc0Ljg2NjYyMzMgTDg1Ljc5MzM0MDksODQuMTQ0NDM3MiBDODUuNzkzMzQwOSw4NS40NDUzNzg2IDg0LjczODcxOTYsODYuNSA4My40Mzc3NzgyLDg2LjUgTDczLjUxMTM4NTUsODYuNSBMNzMuNTExMzg1NSw4NS41IEw4My40Mzc3NzgyLDg1LjUgQzg0LjE4NjQzNDgsODUuNSA4NC43OTMzNDA5LDg0Ljg5MzA5MzkgODQuNzkzMzQwOSw4NC4xNDQ0MzcyIEw4NC43OTMzNDA5LDc0Ljg2NjYyMzMgWiBNMi41MTEzODU1NCw3NC44NjY2MjMzIEwyLjUxMTM4NTU0LDg0LjE0NDQzNzIgQzIuNTExMzg1NTQsODQuODkzMDkzOSAzLjExODI5MTY2LDg1LjUgMy44NjY5NDgzMSw4NS41IEwxMy43OTMzNDA5LDg1LjUgTDEzLjc5MzM0MDksODYuNSBMMy44NjY5NDgzMSw4Ni41IEMyLjU2NjAwNjkxLDg2LjUgMS41MTEzODU1NCw4NS40NDUzNzg2IDEuNTExMzg1NTQsODQuMTQ0NDM3MiBMMS41MTEzODU1NCw3NC44NjY2MjMzIEwyLjUxMTM4NTU0LDc0Ljg2NjYyMzMgWiIgaWQ9IuWQiOW5tuW9oueKtiIgZmlsbD0iIzk3OTc5NyIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9nPg0KICAgICAgICAgICAgICAgICAgICAgICAgPC9nPg0KICAgICAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgPC9nPg0KICAgICAgICAgICAgPC9nPg0KICAgICAgICA8L2c+DQogICAgPC9nPg0KPC9zdmc+');
    background-repeat: no-repeat;
    background-position: 230px bottom;
    position: relative;
    height: 137px;
  }

  .card-body .wechat-relevance {
    font-size: 12px;
    color: #888;
    width: 176px;
    line-height: 18px;
  }

  .card-body .wechat-qrcode {
    position: absolute;
    width: 80px;
    height: 80px;
    right: 55px;
    top: 42px;
  }

  .divider-line-bottom {
    border-bottom: 1px solid #e3e3e3;
  }

  .bg-user {
    background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzY2cHgiIGhlaWdodD0iMTUycHgiIHZpZXdCb3g9IjAgMCAzNjYgMTUyIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA1NS4xICg3ODEzNikgLSBodHRwczovL3NrZXRjaGFwcC5jb20gLS0+CiAgICA8dGl0bGU+6IOM5pmv5Zu+PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IuiDjOaZr+WbviIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgZmlsbC1ydWxlPSJub256ZXJvIiBpZD0i5YiG57uELTI0Ij4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzA3LjQyNzYwMywgOS43MTg1NzYpIHJvdGF0ZSgtNDUuMDAwMDAwKSB0cmFuc2xhdGUoLTMwNy40Mjc2MDMsIC05LjcxODU3NikgdHJhbnNsYXRlKDI0Ny40Mjc2MDMsIC01OS43ODE0MjQpIj4KICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSLnn6nlvaIiIGZpbGw9IiNFRkVGRUYiIHBvaW50cz0iNTguNTk3NjU4MiAwLjY2Mzg2MDA5NyAxMTcuNzY1NDQzIDMwLjA0MzcyNTkgMTE3Ljc2NTQ0MyA5Mi40NzU5NDA2IDU4LjU5NzY1ODIgNjMuMDk2MDc0OSI+PC9wb2x5Z29uPgogICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9IuefqeW9oiIgZmlsbD0iI0VGRUZFRiIgcG9pbnRzPSIwLjkxODYyNTg4NiA0Ni44Mjk4NjUyIDYwLjA4NjQxMTEgNzYuMjA5NzMxIDYwLjA4NjQxMTEgMTM4LjY0MTk0NiAwLjkxODYyNTg4NiAxMDkuMjYyMDgiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSLnn6nlvaIiIGZpbGw9IiNGOEY4RjgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMwLjQ3NDA0NCwgNDYuNTY5OTAwKSBzY2FsZSgtMSwgMSkgdHJhbnNsYXRlKC0zMC40NzQwNDQsIC00Ni41Njk5MDApICIgcG9pbnRzPSIwLjg5MDE1MTc4NyAwLjY2Mzg2MDA5NyA2MC4wNTc5MzcgMzAuMDQzNzI1OSA2MC4wNTc5MzcgOTIuNDc1OTQwNiAwLjg5MDE1MTc4NyA2My4wOTYwNzQ5Ij48L3BvbHlnb24+CiAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0i55+p5b2iIiBmaWxsPSIjRjhGOEY4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4OS42MjQyMzksIDkyLjczNTkwNikgc2NhbGUoLTEsIDEpIHRyYW5zbGF0ZSgtODkuNjI0MjM5LCAtOTIuNzM1OTA2KSAiIHBvaW50cz0iNjAuMDQwMzQ1OSA0Ni44Mjk4NjUyIDExOS4yMDgxMzEgNzYuMjA5NzMxIDExOS4yMDgxMzEgMTM4LjY0MTk0NiA2MC4wNDAzNDU5IDEwOS4yNjIwOCI+PC9wb2x5Z29uPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=');
    background-position: right top;
    background-repeat: no-repeat;
  }
</style>