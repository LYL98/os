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

  // 优惠券 详情 的 手动发放 手机号状态
  ACTIVITY_COUPON_MANUAL_GRANT_STATUS: (type) => {
    return handleType([
      { label: '正在发放', value: 'ungrant', color: 'warning' },
      { label: '发放成功', value: 'success', color: 'success' },
      { label: '发放失败', value: 'fail', color: 'secondary' },
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

  // 门店余额明细类型
  USER_STORE_BALANCE_TYPE: (type) => {
    return handleType([
      { label: '推广', value: 'promote' },
      { label: '拉新', value: 'pull_new' },
      { label: '提货佣金', value: 'pick_divide' },
      { label: '转账商城', value: 'to_mall' },
      { label: '提现', value: 'withdraw' },
      { label: '提现退回', value: 'withdraw_reject' },
      { label: '门店现货收益', value: 'spot_goods' },
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

  //门店现货订单状态
  STORE_SALE_STATUS: (type) => {
    return handleType([
      { label: '待付款', value: 'init', color: 'primary' },
      { label: '待提货', value: 'wait_delivery_customer', color: 'secondary' },
      { label: '已提货', value: 'picked', color: 'success' },
      { label: '已取消', value: 'canceled', color: 'warning' },
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

  //门店商品订单日志
  ORDER_STORE_SALE_LOG: (type) => {
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

  //售后订单状态
  AFTER_SALE_STATUS: (type) => {
    return handleType([
      { label: '待审核', value: 'wait_audit', color: 'primary' },
      { label: '待退回门店', value: 'wait_restore', color: 'primary' },
      { label: '退款中', value: 'refunding', color: 'secondary' },
      { label: '退款成功', value: 'refunded', color: 'success' },
      { label: '退款失败', value: 'refund_fail', color: 'warning' },
      { label: '已拒绝', value: 'rejected', color: 'warning' },
      { label: '已关闭', value: 'closed', color: 'warning' },
      { label: '已撤销', value: 'repealed', color: 'warning' }
    ],type);
  },

  //售后订单日志
  AFTER_SALE_LOG: (type) => {
    return handleType([
      { label: '待审核', value: 'wait_audit', color: 'primary' },
      { label: '待退回门店', value: 'wait_restore', color: 'primary' },
      { label: '退款中', value: 'refunding', color: 'secondary' },
      { label: '退款成功', value: 'refunded', color: 'success' },
      { label: '退款失败', value: 'refund_fail', color: 'warning' },
      { label: '已拒绝', value: 'rejected', color: 'warning' },
      { label: '已关闭', value: 'closed', color: 'warning' },
      { label: '已撤销', value: 'repealed', color: 'warning' }
    ],type);
  },

  //售后退款订单状态
  AFTER_RESTORE_SALE: (type) => {
    return handleType([
      { label: '待审核', value: 'wait_audit', color: 'primary' },
      { label: '退款中', value: 'refunding', color: 'secondary' },
      { label: '退款成功', value: 'refunded', color: 'success' },
      { label: '退款失败', value: 'refund_fail', color: 'warning' },
      { label: '已拒绝', value: 'rejected', color: 'warning' },
      { label: '已关闭', value: 'closed', color: 'warning' },
      { label: '已撤销', value: 'repealed', color: 'warning' }
    ],type);
  },

  //售后退货退款订单状态
  AFTER_NORESTORE_SALE: (type) => {
    return handleType([
      { label: '待退回门店', value: 'wait_restore', color: 'primary' },
      { label: '退款中', value: 'refunding', color: 'secondary' },
      { label: '退款成功', value: 'refunded', color: 'success' },
      { label: '退款失败', value: 'refund_fail', color: 'warning' },
      { label: '已拒绝', value: 'rejected', color: 'warning' },
      { label: '已关闭', value: 'closed', color: 'warning' },
      { label: '已撤销', value: 'repealed', color: 'warning' }
    ],type);
  },

  // 推广者提现状态
  PROMOTER_WITHDRAW_STATUS: (type) => {
    return handleType([
      { label: '待审核', value: 'init', color: 'warning' },
      { label: '已通过', value: 'transfer', color: 'success' },
      { label: '已驳回', value: 'reject', color: 'secondary' },
    ], type);
  },

  // 门店提现状态
  STORE_WITHDRAW_STATUS: (type) => {
    return handleType([
      { label: '待转账', value: 'init', color: 'primary' },
      { label: '已转账', value: 'transfer', color: 'success' },
      { label: '已拒绝', value: 'reject', color: 'warning' },
    ], type);
  },

  // 申请者审核状态
  APPLICANT_AUDITING_STATUS: (type) => {
    return handleType([
      { label: '待审核', value: 'wait_audit', color: 'warning' },
      { label: '审核通过', value: 'pass', color: 'success' },
      { label: '审核拒绝', value: 'reject', color: 'secondary' },
    ], type);
  }
};
