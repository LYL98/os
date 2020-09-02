import Home from './page/home.vue'

export default [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/item/pitem',
    name: 'pitem',
    component: () => import(/* webpackChunkName: "pitem" */ './page/item/pitem/pitem.vue')
  },
  {
    path: '/item/subitem',
    name: 'subitem',
    component: () => import(/* webpackChunkName: "subitem" */ './page/item/subitem/subitem.vue'),
  },
  {
    path: '/item/subitem/edit',
    name: 'subitem-edit',
    component: () => import(/* webpackChunkName: "subitem" */ './page/item/subitem/subitem-edit.vue')
  },
  {
    path: '/item/storeItem',
    name: 'storeitem',
    component: () => import(/* webpackChunkName: "storeitem" */ './page/item/storeitem/store-item.vue'),
  },
  {
    path: '/item/property',
    name: 'property',
    component: () => import(/* webpackChunkName: "property" */ './page/item/property/property.vue')
  },
  {
    path: '/item/stock',
    name: 'stock',
    component: () => import(/* webpackChunkName: "stock" */ './page/item/stock/stock.vue')
  },
  {
    path: '/activity/seckill',
    name: 'activity-seckill',
    component: () => import(/* webpackChunkName: "activity-seckill" */ './page/activity/seckill/seckill.vue')
  },
  {
    path: '/activity/coupon',
    name: 'activity-coupon',
    component: () => import(/* webpackChunkName: "activity-seckill" */ './page/activity/coupon/coupon.vue')
  },
  {
    path: '/user/store',
    name: 'user-store',
    component: () => import(/* webpackChunkName: "user-store" */ './page/user/store.vue'),
  },
  {
    path: '/order/store-sale',
    name: 'store-sale',
    component: () => import(/* webpackChunkName: "store-sale" */ './page/order/store-sale.vue'),
  },
  {
    path: '/order/after-sale',
    name: 'order-after-sale',
    component: () => import(/* webpackChunkName: "order-after-sale" */ './page/order/after-sale.vue'),
  },
  {
    path: '/user/promoter',
    name: 'promoter',
    component: () => import(/* webpackChunkName: "user-promoter" */ './page/user/promoter.vue'),
  },
  {
    path: '/user/member',
    name: 'user-member',
    component: () => import(/* webpackChunkName: "user-member" */ './page/user/member.vue'),
  },
  {
    path: '/order/user',
    name: 'order-user',
    component: () => import(/* webpackChunkName: "order-user" */ './page/order/user.vue'),
  },
  {
    path: '/order/store',
    name: 'order-store',
    component: () => import(/* webpackChunkName: "order-store" */ './page/order/store.vue'),
  },
  {
    path: '/finance/promoter-withdraw',
    name: 'finance-promoter-withdraw',
    component: () => import(/* webpackChunkName: "finance-promoter" */ './page/finance/promoter-withdraw.vue'),
  },
  {
    path: '/finance/store-withdraw',
    name: 'finance-store-withdraw',
    component: () => import(/* webpackChunkName: "finance-store" */ './page/finance/store-withdraw.vue'),
  },
  {
    path: '/setting/banner',
    name: 'setting-banner',
    component: () => import(/* webpackChunkName: "setting" */ './page/setting/banner.vue'),
  },
  {
    path: '/setting/operation',
    name: 'setting-operation',
    component: () => import(/* webpackChunkName: "setting" */ './page/setting/operation.vue'),
  },
];
