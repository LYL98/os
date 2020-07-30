const handleType = (data, type) => {
  let obj = {};
  if (type === 'options') {
    data.forEach((item) => {
      obj[item.label] = item.value;
    });
    return obj;
  }

  if (type === 'enum') {
    data.forEach((item) => {
      if (item.value) {
        obj[item.value] = item.label;
      }
    });
    return obj;
  }

  if (type === 'color') {
    data.forEach((item) => {
      if (item.value) {
        obj[item.value] = item.color;
      }
    });
    return obj;
  }

  return data;
};

module.exports = {
  PAGE_SIZE: 20,
  LOCAL_USER_INFO: 'pgy_user_info',
  LOCAL_ROUTE_RECORDS: 'pgy_route_records', // 路由访问记录

  SUBITEM_SCHEDULER_STATUS: (type) => {
    return handleType([
      { label: '未生效', value: 'ineffective', color: 'warning' },
      { label: '已生效', value: 'effective', color: 'primary' },
      { label: '已作废', value: 'stopped', color: 'secondary' },
    ], type);
  },

  // 秒杀活动状态
  ACTIVITY_SECKILL_STATUS: (type) => {
    return handleType([
      { label: '待审核', value: 'init', color: 'warning' },
      { label: '未开始', value: 'ready', color: 'primary' },
      { label: '进行中', value: 'processing', color: 'success' },
      { label: '已结束', value: 'end', color: 'secondary' },
      { label: '已作废', value: 'stopped', color: 'secondary' },
    ], type);
  },

  // 秒杀活动商品状态
  ACTIVITY_SECKILL_ITEM_STATUS: (type) => {
    return handleType([
      { label: '待审核', value: 'init', color: 'warning' },
      { label: '未开始', value: 'ready', color: 'primary' },
      { label: '进行中', value: 'processing', color: 'success' },
      { label: '已结束', value: 'end', color: 'secondary' },
      { label: '已作废', value: 'stopped', color: 'secondary' },
      { label: '已下架', value: 'off_shelf', color: 'secondary' },
    ], type);
  },

  // 优惠券状态
  ACTIVITY_COUPON_STATUS: (type) => {
    return handleType([
      { label: '待审核', value: 'wait_audit', color: 'warning' },
      { label: '已生效', value: 'effective', color: 'success' },
      { label: '已过期', value: 'expired', color: 'secondary' },
      { label: '已作废', value: 'stopped', color: 'secondary' },
    ], type);
  },

  // 优惠券明细状态
  ACTIVITY_COUPON_RECORD_STATUS: (type) => {
    return handleType([
      { label: '待使用', value: 'wait_use', color: 'primary' },
      { label: '已使用', value: 'used', color: 'success' },
      { label: '已过期', value: 'expired', color: 'secondary' },
      { label: '已作废', value: 'stopped', color: 'secondary' },
    ], type);
  },

  // 优惠券 发放列表 的 发放状态
  ACTIVITY_COUPON_GRANT_STATUS: (type) => {
    return handleType([
      { label: '待审核', value: 'wait_audit', color: 'warning' },
      { label: '未发放', value: 'no_grant', color: 'primary' },
      { label: '已发放', value: 'granting', color: 'success' },
      { label: '已结束', value: 'end', color: 'secondary' },
      { label: '已作废', value: 'stopped', color: 'secondary' },
    ], type);
  },

  // 优惠券发放类型
  ACTIVITY_COUPON_GRANT_TYPE: (type) => {
    return handleType([
      { label: '自动发放', value: 'auto' },
      { label: '手动发放', value: 'manual' },
      { label: '主动领取', value: 'receive' },
    ], type);
  },

  // 优惠券发放条件
  ACTIVITY_COUPON_GRANT_CONDITION: (type) => {
    return handleType([
      { label: '订单满额', value: 'order' },
      { label: '商品满额', value: 'goods' },
      { label: '新用户注册', value: 'register' },
      { label: '分享链接', value: 'share' },
    ], type);
  },

  //用户订单状态
  ORDER_USER_STATUS: (type) => {
    return handleType([
      { label: '待付款', value: 'init', color: 'primary' },
      { label: '待发货', value: 'paid', color: 'warning' },
      { label: '待提货', value: 'wait_delivery_customer', color: 'danger' },
      { label: '已提货', value: 'picked', color: 'success' },
      { label: '已取消', value: 'canceled', color: 'secondary' },
    ], type);
  },
  //门店订单状态
  ORDER_STORE_STATUS: (type) => {
    return handleType([
      { label: '待发货', value: 'init', color: 'warning' },
      { label: '已发货', value: 'wait_pick', color: 'success' },
      { label: '已完成', value: 'picked', color: 'secondary' },
    ], type);
  },

  //用户订单日志
  ORDER_USER_LOG: (type) => {
    return handleType([
      { label: '订单创建', value: 'create' },
      { label: '订单付款', value: 'pay' },
      { label: '支付回调', value: 'pay_confirm' },
      { label: '支付回调', value: 'pay_callback' },
      { label: '订单发货', value: 'delivery' },
      { label: '订单到货', value: 'receive' },
      { label: '订单完成', value: 'picked' },
      { label: '订单完成', value: 'platform_confirm_pick' },
      { label: '订单取消', value: 'cancel' },
    ], type);
  },
  //门店订单日志
  ORDER_STORE_LOG: (type) => {
    return handleType([
      { label: '订单创建', value: 'create' },
      { label: '订单发货', value: 'delivery' },
      { label: '订单完成', value: 'pick' },
    ], type);
  },

  // 推广者提现状态
  PROMOTER_WITHDRAW_STATUS: (type) => {
    return handleType([
      { label: '待审核', value: 'init', color: 'warning' },
      { label: '已通过', value: 'transfer', color: 'success' },
      { label: '已驳回', value: 'reject', color: 'secondary' },
    ], type);
  }
};
