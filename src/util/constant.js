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

  MERCHANT_STORE_STATUS: (type) => {
    return handleType([
      { label: '待审核', value: 'wait_audit', color: 'warning' },
      { label: '营业中', value: 'business', color: 'success' },
      { label: '冻结中', value: 'freeze', color: 'secondary' },
    ], type);
  },

  MERCHANT_REFUND_REASON: (type) => {
    return handleType([
      { label: '门店退筐', value: 'frame_return' },
      { label: '发货增加', value: 'order_done' },
      { label: '手动修改', value: 'manual_fix' },
    ], type);
  },

  // 全场营销 活动状态
  ACTIVITY_SCOPE_STATUS: (type) => {
    return handleType([
      { label: '未开展', value: 'date_before', color: 'warning' },
      { label: '进行中', value: 'date_on', color: 'success' },
      { label: '已结束', value: 'date_out_of', color: 'secondary' },
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
      { label: '商品满额', value: 'goods_amount' },
      { label: '商品满件', value: 'goods_num' },
      { label: '运费满额', value: 'delivery_fee' },
      { label: '新用户注册', value: 'register' },
    ], type);
  },

  ACTIVITY_LIVE_STATUS: (type) => {
    return handleType([
      { label: '直播中', value: 101, color: 'success' },
      { label: '待开播', value: 102, color: 'warning' },
      { label: '已结束', value: 103, color: 'secondary' },
    ], type);
  },

  //商品运营专区类型
  ITEM_TAGS_DISPLAY: (type) => {
    return handleType([
      { label: '金刚区', value: 'kingkong' },
      { label: '卡片区', value: 'card' },
      { label: '推荐区', value: 'recommend' },
    ], type);
  },

  //用户订单状态
  ORDER_USER_STATUS: (type) => {
    return handleType([
      { label: '待确认', value: 'wait_confirm', color: 'primary' },
      { label: '待发货', value: 'wait_delivery', color: 'secondary' },
      { label: '待收货', value: 'deliveried', color: 'warning' },
      { label: '已完成', value: 'received', color: 'success' },
      { label: '已取消', value: 'order_canceled', color: 'danger' },
    ], type);
  },

  ORDER_LIST_USER_STATUS: (type) => {
    return handleType([
      { label: '待确认', value: 'wait_confirm', color: 'primary' },
      { label: '待发货', value: 'wait_delivery', color: 'secondary' },
      { label: '待发货', value: 'confirmed', color: 'secondary' },
      { label: '待发货', value: 'assigned', color: 'secondary' },
      { label: '待收货', value: 'deliveried', color: 'warning' },
      { label: '已完成', value: 'received', color: 'success' },
      { label: '已完成', value: 'order_done', color: 'success' },
      { label: '已取消', value: 'order_canceled', color: 'danger' },
    ], type);
  },

  //用户订单退款原因
  ORDER_USER_REFUND_RECORD_REASON: (type) => {
    return handleType([
      { label: '改单退款', value: 'sys_refund' },
      { label: '取消订单退款', value: 'cancel_order_refund' },
      { label: '运费重算', value: 'freight_redone' },
      { label: '金额退回', value: 'pay_after_cancel' },
    ], type);
  },

  //用户订单日志
  ORDER_USER_LOG: (type) => {
    return handleType([
      { label: '订单创建', value: 'order' },
      { label: '订单付款', value: 'pay' },
      { label: '订单确认', value: 'confirm' },
      { label: '订单发货', value: 'delivery' },
      { label: '订单完成', value: 'receive' },
      { label: '订单取消', value: 'cancel' },
      { label: '支付发起', value: 'launch_pay' },
      { label: '支付回调', value: 'callback_begin' },
      { label: '回调成功', value: 'callback_success' },
    ], type);
  },

  //售后单处理方式
  AFTER_SALE_HANDLE_WAY: (type) => {
    return handleType([
      { label: '仅退款', value: 'only_refund' },
      { label: '仅退货', value: 'only_goods' },
      { label: '退货退款', value: 'refund_goods' },
      { label: '其他', value: 'other' },
    ], type);
  },

  //售后单销售类型
  AFTER_SALE_SALE_TYPE: (type) => {
    return handleType([
      { label: '平台', value: '平台' },
      { label: '自营', value: '自营' },
    ], type);
  },

  //售后单处理进度
  AFTER_SALE_HANDLE_LOADING: (type) => {
    return handleType([
      { label: '素材补充', value: 'supplement_material' },
      { label: '线下核实', value: 'verify_offline' },
      { label: '退货中', value: 'restoring' },
    ], type);
  },

  //售后单处理类型
  AFTER_SALE_OPT_TYPE: (type) => {
    return handleType([
      { value: 'quality', label: '质量异常' },
      { value: 'delivery', label: '物流异常' },
      { value: 'amount_delivery', label: '运费退还' },
      { value: 'weight', label: '少称' },
      { value: 'not_match', label: '与SKU描述不相符' },
      // { value: 'num', label: '缺货/错货' }, //新增时不显示
      { value: 'num_short', label: '缺货' },
      { value: 'num_error', label: '错货' },
      { value: 'big_order_bonus', label: '大单优惠' },
      { value: 'betray_low_price', label: '违反低价承诺' },
      { value: 'other', label: '其他' }
    ], type);
  },

  //售后单状态
  AFTER_SALE_STATUS: (type) => {
    return handleType([
      { value: 'init', label: '待分配', color: 'primary' },
      { value: 'waiting_dispose', label: '待处理', color: 'secondary' },
      { value: 'handling', label: '处理中', color: 'warning' },
      { value: 'close', label: '已完成', color: 'success' }
    ], type);
  },

  //退货单单状态
  RETURN_GOODS_STATUS: (type) => {
    return handleType([
      { value: 'init', label: '待处理', color: 'primary' },
      { value: 'pick', label: '已取货', color: 'secondary' },
      { value: 'finish', label: '已完成', color: 'success' },
      { value: 'close', label: '关闭', color: 'danger' }
    ], type);
  },

  // 商户充值操作人类型
  FINANCIAL_BALANCE_OPERATOR_CLASS: (type) => {
    return handleType([
      { value: 'member', label: '用户' },
      { value: 'operator', label: '运营人员' },
      { value: 'background', label: '后台' },
    ], type);
  },

  FINANCIAL_BALANCE_RECHARGE_REASON: (type) => {
    return handleType([
      { value: 'manual_aftersale', label: '退赔售后' },
      { value: 'manual_discount', label: '优惠充值' },
      { value: 'manual_promotion', label: '活动充值' },
      { value: 'manual_frame_return', label: '周转筐充值' },
      { value: 'manual_return_cash', label: '返点充值' },
      { value: 'manual_freight_redone', label: '运费充值' },
      { value: 'manual_other', label: '其他' },
    ], type);
  },

  // 商户金额变更原因
  FINANCIAL_BALANCE_REASON: (type) => {
    return handleType([
      { value: 'manual_deduct', label: '手动扣款' },
      { value: 'pay', label: '用户支付' },
      { value: 'top_up', label: '用户充值' },
      { value: 'freight_redone', label: '运费重算' },
      { value: 'sys_refund', label: '系统退款' },
      { value: 'cancel_order_refund', label: '订单取消退款' },
      { value: 'after_sale_refund', label: '售后退款' },
      { value: 'frame_return', label: '退筐退款' },
      { value: 'refund_for_pay_after_cancel', label: '金额退回' },
      { value: 'manual_aftersale', label: '退赔售后(手动充值)' },
      { value: 'manual_discount', label: '优惠充值(手动充值)' },
      { value: 'manual_promotion', label: '活动充值(手动充值)' },
      { value: 'manual_frame_return', label: '周转筐充值(手动充值)' },
      { value: 'manual_return_cash', label: '返点充值(手动充值)' },
      { value: 'manual_freight_redone', label: '运费充值(手动充值)' },
      { value: 'gb_transfer', label: '团购余额转账' },
      { value: 'manual_other', label: '其他(手动充值)' },
    ], type);
  },
  // 客户财务余额审核状态
  FINANCIAL_BALANCE_STATUS: (type) => {
    return handleType([
      { value: 'wait_check', label: '待审核', color: 'primary' },
      { value: 'checked', label: '审核通过', color: 'success' },
      { value: 'declined', label: '被驳回', color: 'danger' }
    ], type);
  },

  // 客户财务余额审核状态
  FINANCIAL_BALANCE_CHANGE_TYPE: (type) => {
    return handleType([
      { value: 'manual_topup', label: '充值' },
      { value: 'manual_deduct', label: '扣款' }
    ], type);
  },

  // 对账单平台类型
  S_STATEMENT_PLAT_TYPE: (type) => {
    return handleType([
      { value: 'B', label: '平台' },
      { value: 'C', label: '零售' }
    ], type);
  },
  //财务对财单状态
  SUP_BILL_STATUS: (type) => {
    return handleType([
      { value: 'init', label: '待确认', color: 'primary'},
      { value: 'confirmed', label: '已确认', color: 'secondary'},
      { value: 'wait_paid', label: '待结款', color: 'warning'},
      { value: 'paid', label: '已结款', color: 'success'}
    ], type);
  },

  //供应商流水类型
  FINANCIAL_SUP_BDETAIL_BILLREASON: (type)=>{
    return handleType([
      { value: 'local_buy', label: '货款' }, //反采采购
      { value: 'distribution', label: '货款' }, //预采采购
      { value: 'item_damage', label: '货损' }, //货损
      { value: 'commission_dedup', label: '佣金扣款' }, //佣金扣款
      { value: 'refund', label: '退货' }, //退货
      { value: 'other', label: '其它' }, //其它（手动充值、扣款）
    ], type);
  },

  //供应商流水类型 
  FINANCIAL_SUP_BDETAIL_ADD_BILLREASON: (type)=>{
    return handleType([
      { value: 'other', label: '其它' }, //其它（手动充值、扣款）
      { value: 'item_damage', label: '货损' }, //货损
      { value: 'commission_dedup', label: '佣金扣款' }, //佣金扣款
    ], type);
  },

  //供应商账期
  FINANCIAL_SUP_BDETAIL_BILL_TERM: (type) => {
    return handleType([
      { value: '0', label: '现结' },
      { value: '7', label: '周结' },
      { value: '14', label: '双周结' },
      { value: '30', label: '单月结' },
      { value: '60', label: '双月结' }
    ], type);
  },

  //财务流水状态
  FINANCIAL_SUP_BDETAIL_STATUS: (type)=>{
    return handleType([
      { value: 'wait_audit', label: '待审核', color: 'primary' },
      { value: 'wait_paid', label: '待结款', color: 'secondary' },
      { value: 'paid', label: '已结款', color: 'success' },
      { value: 'audit_failed', label: '作废', color: 'danger' }
    ], type);
  },
  
};
