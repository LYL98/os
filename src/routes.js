import Home from './page/home.vue'

export default [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/merchant',
    name: 'merchant',
    component: () => import(/* webpackChunkName: "merchant" */ './page/merchant/merchant/index.vue')
  },
  {
    path: '/merchant/amap',
    name: 'merchant-amap',
    component: () => import(/* webpackChunkName: "merchant-store" */ './page/merchant/merchant/amap.vue')
  },
  {
    path: '/merchant/property',
    name: 'merchant-property',
    component: () => import(/* webpackChunkName: "merchant-property" */ './page/merchant/property/index.vue')
  },
  {
    path: '/merchant/vip',
    name: 'merchant-vip',
    component: () => import(/* webpackChunkName: "vip" */ './page/merchant/vip/vip.vue')
  },
  {
    path: '/merchant/blacklist',
    name: 'merchant-blacklist',
    component: () => import(/* webpackChunkName: "blacklist" */ './page/merchant/blacklist/blacklist.vue')
  },

  /**商品模块开始 */
  //货架商品
  {
    path: '/item/list',
    name: 'item-list',
    component: () => import(/* webpackChunkName: "item-list" */ './page/item/list/list.vue'),
  },
  //货架商品属性
  {
    path: '/item/property',
    name: 'item-property',
    component: () => import(/* webpackChunkName: "property" */ './page/item/property/property.vue')
  },
  {
    path: '/item/pricing',
    name: 'item-pricing',
    component: () => import(/* webpackChunkName: "pricing" */ './page/item/pricing/pricing.vue')
  },

  //客户提报
  {
    path: '/item/customer/advice',
    name: 'item-customer-advice',
    component: () => import(/* webpackChunkName: "customer-advice" */ './page/item/customer-advice/customer-advice.vue')
  },

  /**商品模块结束 */

  /** 营销模块 开始 */
  {
    path: '/activity/scope',
    name: 'activity-scope',
    component: () => import(/* webpackChunkName: "activity-scope" */ './page/activity/scope/scope.vue')
  },
  {
    path: '/activity/coupon',
    name: 'activity-coupon',
    component: () => import(/* webpackChunkName: "activity-coupon" */ './page/activity/coupon/coupon.vue')
  },
  {
    path: '/activity/city-price',
    name: 'activity-city-price',
    component: () => import(/* webpackChunkName: "activity-city-price" */ './page/activity/city-price/city-price.vue')
  },
  {
    path: '/activity/step-price',
    name: 'activity-step-price',
    component: () => import(/* webpackChunkName: "activity-step-price" */ './page/activity/step-price/step-price.vue')
  },
  {
    path: '/activity/live',
    name: 'activity-live',
    component: () => import(/* webpackChunkName: "activity-live" */ './page/activity/live/live.vue')
  },
  /** 营销模块 结束 */

  /**订单模块开始 */
  {
    path: '/order/user',
    name: 'order-user',
    component: () => import(/* webpackChunkName: "order-user" */ './page/order/user/user.vue')
  },
  {
    path: '/order/after-sale',
    name: 'after-sale',
    component: () => import(/* webpackChunkName: "after-sale" */ './page/order/after-sale/after-sale.vue')
  },
  {
    path: '/order/return',
    name: 'return',
    component: () => import(/* webpackChunkName: "return" */ './page/order/return/return.vue')
  },
  /**订单模块结束 */

  /** 财务模块开始 */
  {
    path: '/finance/balance',
    name: 'finance-balance',
    component: () => import(/* webpackChunkName: "finance" */ './page/finance/balance/balance.vue')
  },
  {
    path: '/finance/approve',
    name: 'finance-balance',
    component: () => import(/* webpackChunkName: "finance" */ './page/finance/approve/approve.vue')
  },
  {
    path: '/finance/sup-bdetail',
    name: 'finance-sup-bdetail',
    component: () => import(/* webpackChunkName: "finance" */ './page/finance/sup-bdetail/sup-bdetail.vue')
  },
  {
    path: '/finance/sup-bill',
    name: 'finance-sup-bill',
    component: () => import(/* webpackChunkName: "finance" */ './page/finance/sup-bill/sup-bill.vue')
  },
  /** 财务模块结束 */

  /** 设置模块开始 */
  {
    path: '/setting/banner',
    name: 'setting-banner',
    component: () => import(/* webpackChunkName: "setting" */ './page/setting/banner.vue')
  },
  {
    path: '/setting/operation',
    name: 'setting-operation',
    component: () => import(/* webpackChunkName: "operation" */ './page/setting/operation.vue'),
  },
  /** 设置模块结束 */

];
