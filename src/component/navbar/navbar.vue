<template>
  <div class="pg-navbar-wrapper">
    <div class="space-h-50"></div>
    <div class="pg-navbar">
      <div class="pg-nav-item ml-20" style="min-width: 112px">
        <div class="pg-nav-logo d-flex align-items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 152.66 152.66">
            <g>
              <path
                fill="#fadb28"
                class="cls-1"
                d="M76.33,0A76.33,76.33,0,0,0,43.68,145.33c1-.51.37-1.69.34-2.5a44.39,44.39,0,0,1,3-17.74c2.93-7.66,7.69-14.16,12.64-20.51,2.09-2.68,4.22-5.11,2.16-8.76a2.29,2.29,0,0,1-.1-1.45c.51-2.23-1.35-2.82-3-3.9A55,55,0,0,1,38.7,68c-.83-1.71-1.29-3.23-3.12-3.74a4.45,4.45,0,0,1-3.23-4.08,4.54,4.54,0,0,1,1.79-4.64c2-1.34,4-1.53,5.84.1a4.83,4.83,0,0,1,1.27,6.08c-.53,1.2-1.11,1.84-.35,3.42a56.64,56.64,0,0,0,20.33,23c.6.4,1.41,1.18,1.72.79s-.7-1.36-1.1-2A42.4,42.4,0,0,1,55.27,69a73,73,0,0,1,.88-23.87c.38-2,1.05-3.62-.51-5.39a5,5,0,0,1,2.66-8.12,4.94,4.94,0,0,1,5.78,3.2A4.84,4.84,0,0,1,61.71,41a4.92,4.92,0,0,0-3.19,4.65c-.33,3.3-1,6.56-1.28,9.86-.82,10.24.4,20.08,5.95,29,.59,1,1.28,2.59,2.68,2,1.64-.66,1.26-1.84,1.22-3.64A101.71,101.71,0,0,1,67.63,68c.55-4.53,2.29-9.63,1.14-13.63-.5-1.72,1.15-3.3,3-3.81a3.07,3.07,0,0,1,3.84,1.8c.88,1.86.77,3.91-1.15,4.86-2.08,1-2.59,2.7-2.93,4.65a101,101,0,0,0-1.81,19.48c0,2.07.39,3.41,2.77,4,1.94.47,2.47-.36,3.47-2.26A108.8,108.8,0,0,0,88.44,40.45c.3-4,1.19-8.52-1.5-11.55-1.28-1.45-.34-3.69,1.18-4.93a3.33,3.33,0,0,1,4.49.22c1.49,1.35,2.07,3.48.67,4.84-2.23,2.17-2.12,4.81-2.22,7.39s-.12,5.08-.39,7.59a108.81,108.81,0,0,1-13,41c-.77,1.39-1,2.73.36,3.67.47.33,1.57-.59,2.41-1.22A42.88,42.88,0,0,0,94.06,69.58c.72-1.68,1.32-2.33,0-3.88a5,5,0,0,1,1.08-7.2A4.85,4.85,0,0,1,102,60.22a4.93,4.93,0,0,1-2.35,7.09c-1.88.69-2.44,2-3.1,3.7-2.77,7.16-7.44,12.91-13.13,17.89-1,.85-2.72,1.61-3.22,2.54.31.17.47.33.64.34a3.9,3.9,0,0,0,1.13-.1c13.4-3.62,24.41-10.69,32-22.78,1.16-1.84,1.74-3.3.31-5.48-1.77-2.69-.21-6.38,2.67-7.52a5,5,0,0,1,6.6,3.44,5,5,0,0,1-3.94,6.59c-1.78.33-1.79,2.66-2.59,4.09a45.9,45.9,0,0,1-10.43,12.76A56.39,56.39,0,0,1,83.31,94.61c-.74.15-2.94.23-2.92.55.06,1.06,1.25,1.15,2.14,1.27a52.28,52.28,0,0,0,30-5,3.66,3.66,0,0,0,2.25-2.76c.61-2.81,2.71-4.11,5-3.39a4.13,4.13,0,0,1,2.68,5.12,4,4,0,0,1-5.53,2.64c-1.32-.46-2.49.45-3.67,1.05-10.11,5.19-20.84,6.41-31.95,5-1.3-.16-2.07-.65-2.8.5a8.81,8.81,0,0,1-9.41,4.22,2.71,2.71,0,0,0-2.72,1.16C55.94,117.41,50,131.12,53.44,147.85a5.62,5.62,0,0,0,.46,1.45A76.33,76.33,0,1,0,76.33,0Z"
              />
            </g>
          </svg>
          <span class="brand">蒲公英</span>
          </div>
      </div>
      <div class="pg-nav-item" style="min-width: 150px">
        <a class="nav" :href="origin_yy">系统首页</a>
        <pg-popper auto-close trigger="hover" placement="bottom" v-if="adminMode">
          <a class="nav">
            <span>总览</span>
            <i class="icon-arrow-down12 text-light"></i>
          </a>
          <div class="pg-nav-service-panel" slot="content">
            <div class="pg-nav-service-panel--inner pg-panel-animation">
              <div class="menu-list-all">
                <div class="menu-area-col" v-for="route in routes.gyl" :key="route.value">
                  <div class="menu-area">
                    <div class="menu-area-tit">
                      <svg width="16" height="16">
                        <g fill="none" fill-rule="evenodd">
                          <path d="M0 0h16v16H0z" />
                          <path
                              d="M3.281 5L8 2.304 12.719 5 8 7.696 3.281 5zM8 0L1 4v8l3.027 1.73a3.968 3.968 0 01.642-1.937L3 10.839V7.143L8 10l5-2.857v3.696l-3.416 1.953A1.989 1.989 0 008 12a2 2 0 000 4c.729 0 1.361-.395 1.71-.978L15 12V4L8 0z"
                              fill="#888"
                              fill-rule="nonzero"
                          />
                        </g>
                      </svg>
                      <span>{{ route.label }}</span>
                    </div>
                    <div class="menu-area-con">
                      <a v-for="item in route.items" :key="item.value" @click="handleJump(item)">
                        <span>{{ item.label }}</span>
                      </a>
                    </div>
                  </div>
                </div>
                <div class="menu-area-col" v-for="route in routes.bsc" :key="route.value">
                  <div class="menu-area">
                    <div class="menu-area-tit">
                      <svg width="16" height="16">
                        <g fill="none" fill-rule="evenodd">
                          <path d="M0 0h16v16H0z" />
                          <path
                            d="M3.281 5L8 2.304 12.719 5 8 7.696 3.281 5zM8 0L1 4v8l3.027 1.73a3.968 3.968 0 01.642-1.937L3 10.839V7.143L8 10l5-2.857v3.696l-3.416 1.953A1.989 1.989 0 008 12a2 2 0 000 4c.729 0 1.361-.395 1.71-.978L15 12V4L8 0z"
                            fill="#888"
                            fill-rule="nonzero"
                          />
                        </g>
                      </svg>
                      <span>{{ route.label }}</span>
                    </div>
                    <div class="menu-area-con">
                      <a v-for="item in route.items" :key="item.value" @click="handleJump(item)">
                        <span>{{ item.label }}</span>
                      </a>
                    </div>
                  </div>
                </div>
                <div class="menu-area-col" v-for="route in routes.cls" :key="route.value">
                  <div class="menu-area">
                    <div class="menu-area-tit">
                      <svg width="16" height="16">
                        <g fill="none" fill-rule="evenodd">
                          <path d="M0 0h16v16H0z" />
                          <path
                            d="M3.281 5L8 2.304 12.719 5 8 7.696 3.281 5zM8 0L1 4v8l3.027 1.73a3.968 3.968 0 01.642-1.937L3 10.839V7.143L8 10l5-2.857v3.696l-3.416 1.953A1.989 1.989 0 008 12a2 2 0 000 4c.729 0 1.361-.395 1.71-.978L15 12V4L8 0z"
                            fill="#888"
                            fill-rule="nonzero"
                          />
                        </g>
                      </svg>
                      <span>{{ route.label }}</span>
                    </div>
                    <div class="menu-area-con">
                      <a v-for="item in route.items" :key="item.value" @click="handleJump(item)">
                        <span>{{ item.label }}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </pg-popper>
      </div>
      <div class="position-relative d-flex align-items-center" style="min-width: 800px;">
        <div class="pg-nav-item" v-for="(route, index) in routes.gyl" :key="route.value" :class="index === 0 ? 'ml-20 pl-10 pg-nav-shortcut' : ''">
          <pg-popper auto-close trigger="hover" placement="bottom-start">
            <a class="nav">
              <span>{{ route.label }}</span>
              <i class="icon-arrow-down12 text-light"></i>
            </a>
            <div class="pg-nav-subitem-panel" slot="content">
              <div class="pg-nav-subitem-panel--inner">
                <a v-for="item in route.items" @click="handleJump(item)" :key="item.value">{{ item.label }}</a>
              </div>
            </div>
          </pg-popper>
        </div>
        <div class="pg-nav-item" v-for="(route, index) in routes.bsc" :key="route.value" :class="index === 0 ? 'ml-20 pl-10 pg-nav-shortcut' : ''">
          <pg-popper auto-close trigger="hover" placement="bottom-start">
            <a class="nav">
              <span>{{ route.label }}</span>
              <i class="icon-arrow-down12 text-light"></i>
            </a>
            <div class="pg-nav-subitem-panel" slot="content">
              <div class="pg-nav-subitem-panel--inner">
                <a v-for="item in route.items" @click="handleJump(item)" :key="item.value">{{ item.label }}</a>
              </div>
            </div>
          </pg-popper>
        </div>
        <div class="pg-nav-item" v-for="(route, index) in routes.cls" :key="route.value" :class="index === 0 ? 'ml-20 pl-10 pg-nav-shortcut' : ''">
          <pg-popper auto-close trigger="hover" placement="bottom-start">
            <a class="nav">
              <span>{{ route.label }}</span>
              <i class="icon-arrow-down12 text-light"></i>
            </a>
            <div class="pg-nav-subitem-panel" slot="content">
              <div class="pg-nav-subitem-panel--inner">
                <a v-for="item in route.items" @click="handleJump(item)" :key="item.value">{{ item.label }}</a>
              </div>
            </div>
          </pg-popper>
        </div>
      </div>

      <div class="pg-nav-item ml-auto text-right">
        <pg-popper auto-close trigger="hover" placement="bottom-end">
          <div class="d-flex align-items-center justify-content-end mr-20" style="min-width: 150px">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="-1 -1 22 22" id="user-avatar" x="164" y="119">
              <defs>
                <circle id="dba" cx="10" cy="10" r="10" />
              </defs>
              <g fill="none" fill-rule="evenodd">
                <path d="M0 0h20v20H0z" />
                <g>
                  <mask id="dbb" fill="#fff">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#dba" />
                  </mask>
                  <use fill="#006EFF" fill-rule="nonzero" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#dba" />
                  <path
                    d="M16.85 17.286A9.972 9.972 0 0 0 20 10c0-5.523-4.477-10-10-10S0 4.477 0 10a9.972 9.972 0 0 0 3.157 7.292c1.789 1.68 11.903 1.677 13.693-.006z"
                    fill="#006EFF"
                    fill-rule="nonzero"
                    mask="url(#dbb)"
                  />
                  <path
                    d="M17.64 20c-.171-.89-.468-2.172-.765-2.656-.469-.782-1.563-1.25-2.5-1.875-.938-.625-2.5-1.406-2.5-2.344 0-.781.781-1.094 1.25-2.188.438-1.03.469-2.03.469-3.593 0-1.719-1.563-3.125-3.594-3.125-2.031 0-3.594 1.406-3.594 3.125 0 1.562.032 2.562.469 3.593.469 1.094 1.25 1.407 1.25 2.188 0 .938-1.563 1.719-2.5 2.344-.938.625-2.031 1.094-2.5 1.875-.297.484-.578 1.765-.766 2.656h15.282z"
                    fill="#FFF"
                    fill-rule="nonzero"
                    mask="url(#dbb)"
                  />
                </g>
              </g>
            </svg>
            <a class="nav overflow-ellipsis d-inline-block">
              <span>{{ username }}</span>
              <i class="icon-arrow-down12 ml-5 text-white"></i>
            </a>
          </div>
          <div class="pg-nav-subitem-panel" slot="content">
            <div class="pg-nav-subitem-panel--inner pg-panel-animation">
              <a @click="dialog.visible = true"> <i class="icon-lock text-light mr-5"></i> 修改密码</a>
              <span class="divider-line"></span>
              <a @click="handleLogout"> <i class="icon-switch2 text-light mr-5"></i> 退出登录</a>
            </div>
          </div>
        </pg-popper>
      </div>

      <pg-dialog title="修改密码" v-model="dialog.visible">
        <modify-pwd v-if="dialog.visible" @submit="dialog.visible = false" @cancel="dialog.visible = false" />
      </pg-dialog>
    </div>
  </div>
</template>

<script>
import modifyPwd from './modify-pwd';
import { osConfig } from './../../pgyos.config';
import Http from './../../http/http';

export default {
  name: 'pg-navbar',
  components: {
    modifyPwd,
  },
  props: {
    username: { type: String, default: '' },
  },
  data() {
    return {
      dialog: {
        visible: false,
      },
      routes: {
        yy: [],
        gyl: [],
        bsc: [],
        cls: [],
      },
      origin_yy: '',
      adminMode: false,
    };
  },

  created() {
    const { auth, origin_yy, origin_gyl, origin_bsc, origin_sc, origin_cls, nav_router_api } = osConfig();
    const authorization = (list, prefix) => {
      return list
        .map((item) => {
          let childs = item.childs.map((d) => ({ label: d.title, value: d.code, url: prefix + '/#' + d.router })).filter((d) => auth.isAdmin || auth[d.value]);
          return { label: item.title, value: item.code, items: childs };
        })
        .filter((item) => (auth.isAdmin || auth[item.value]) && Array.isArray(item.items) && item.items.length > 0);
    };

    this.$data.origin_yy = origin_yy;
    this.$data.adminMode = !!auth.isAdmin;

    Http.get(nav_router_api, { is_nav_router: 1 })
      .then(res => {
        const routes = res.data || [];

        const yy = authorization(routes.filter(item => item.client === 'yy'), origin_yy);
        const gyl = authorization(routes.filter(item => item.client === 'gyl'), origin_gyl);
        const cls = authorization(routes.filter(item => item.client === 'cls'), origin_cls);
        const bsc = authorization(routes.filter(item => item.client === 'bsc'), origin_bsc);
        const sc = authorization(routes.filter(item => item.client === 'sc'), origin_sc);

        this.$data.routes = { yy, gyl, bsc: [...bsc, ...sc], cls };
      });

  },

  methods: {

    handleLogout() {
      Http.get(osConfig().logout_api).then(() => {
        this.$emit('logout');
      });
    },

    handleJump(item) {
      return;
      this.$emit('jump', item);
    },
  },
};
</script>
