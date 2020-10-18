import { api_prefix_mercury, api_prefix_vesta, api_prefix_apollo } from './../env.config';

export default {

  commonBuyerList: api_prefix_apollo + '/m/common/buyer/list', //采购员列表（组件共用）
  commonOperatorList: api_prefix_apollo + '/m/common/operator/list', //运营人员列表（组件共用）

  commonProvinceListAuth: api_prefix_mercury + '/m/common/my_province',
  commonProvinceList: api_prefix_mercury + '/m/common/province/list', //区域列表 (组件共用）
  commonZoneList: api_prefix_mercury + '/m/common/zone/list', //片区列表（组件共用）
  commonCityList: api_prefix_mercury + '/m/common/city/list', //县区列表（组件共用）
  commonSystemClassList: api_prefix_mercury + '/m/common/system_class/list', // 科学分类列表
  commonSystemClassTree: api_prefix_mercury + '/m/common/system_class/tree', // 科学分类树形数据

  commonDisplayClassList: api_prefix_vesta + '/m/common/display_class/list', // 展示分类
  commonDisplayClassTree: api_prefix_vesta + '/m/common/display_class/list_new', //展示分类列表（组件共用）(级联数据类型)

  tencentPresignedUrl: api_prefix_vesta + '/common/tencent/presigned_url', //腾讯云上传url（组件共用）
  commonStoreList: api_prefix_vesta + '/m/common/store/list', // 门店列表(组件共用)
  commonStoreMemberList: api_prefix_vesta + '/m/common/member/list', // 门店列表(组件共用)
  commonVipList: api_prefix_vesta + '/m/common/vip_level/list', // 会员等级列表
  commonSupplierList: api_prefix_mercury + '/m/common/supplier/list', // 供应商列表(组件共用)

  commonItemList: api_prefix_vesta + '/m/common/item/list', // 商品列表
  commonItemDetail: api_prefix_vesta + '/m/common/item/detail', // 商品详情
  commonItemTagList: api_prefix_vesta + '/m/common/item_tags/list', // 运营专区（即：商品标签）
  commonItemTagImageList: api_prefix_vesta + '/m/common/tag_images/list', // 运营专区（即：商品标签）
  commonItemTagsIcons: api_prefix_vesta + '/m/common/tag_images/list', // 商品icon默认标签
  commonItemInnerTagsList: api_prefix_vesta + '/m/common/item_inner_tags/list', //商品加价标签接口（组件共用）

  commonMerchantGradeList: api_prefix_vesta + '/m/common/grade/list', // 商户等级
  commonMerchantInnerTagList: api_prefix_vesta + '/m/common/merchant_inner_tags/list', // 商户内标签
  commonMerchantOuterTagList: api_prefix_vesta + '/m/common/merchant_outer_tags/list', // 商户外标签
  commonMerchantStoreTagList: api_prefix_vesta + '/m/common/store_tag/list', // 商户门店标签

  commonStorehouseList: api_prefix_mercury + '/m/common/storehouse/list', //获取仓列表（组件共用）

  //商品 - 货架商品
  itemEdit: api_prefix_vesta + '/m/item/edit', //商品编辑
  itemInnerTagEdit: api_prefix_vesta + '/m/item/inner_tag/edit', //商品加价标签修改
  itemQuery: api_prefix_vesta + '/m/item/query',//商品列表

  itemUnderGround: api_prefix_vesta + '/m/item/under_ground',//商品下架
  itemOnGround: api_prefix_vesta + '/m/item/on_ground', //商品上架（包括编辑）
  itemDetail: api_prefix_vesta + '/m/item/detail',//商品详情
  itemModifyDetail: api_prefix_vesta + '/m/item/modify_detail', //商品操作日志
  itemExportCheck: api_prefix_vesta + '/m/item/export_check', //商品列表导出检查
  itemExport: api_prefix_vesta + '/m/item/export', //商品列表导出
  itemPriceQuery: api_prefix_vesta + '/m/item/price/query',//每日定价页面查询
  itemPriceFix: api_prefix_vesta + '/m/item/price/fix',//商品定价
  itemPriceAudit: api_prefix_vesta + '/m/item/price/audit', //商品定价审核
  itemChgSupplier: api_prefix_vesta + '/m/item/chg_supplier', //修改反采商品的供应商
  itemPriceDetail: api_prefix_vesta + '/m/item/price/detail', //商品供应商报价列表
  pItemGetSuppliers: api_prefix_mercury + '/m/p_item/get_suppliers', //返回商品的供应商
  itemPriceFixPlanQuery: api_prefix_vesta + '/m/price_fix_plan/query', //调价列表
  itemPriceFixPlanEdit: api_prefix_vesta + '/m/price_fix_plan/edit', //调价修改
  itemPriceFixPlanAdd: api_prefix_vesta + '/m/price_fix_plan/add', //调价新增
  itemPriceFixPlanDelete: api_prefix_vesta + '/m/price_fix_plan/delete', //调价删除







  //商品 - 货架商品属性 - 商品价格标签
  basicdataItemInnerTagsAdd: api_prefix_vesta + '/m/basicdata/item_inner_tags/add',//商品加价标签新增
  basicdataItemInnerTagsEdit: api_prefix_vesta + '/m/basicdata/item_inner_tags/edit',//商品加价标签修改
  basicdataItemInnerTagsList: api_prefix_vesta + '/m/basicdata/item_inner_tags/list',//商品加价标签列表
  basicdataItemInnerTagsDelete: api_prefix_vesta + '/m/basicdata/item_inner_tags/delete',//商品加价标签删除

  //商品 - 货架商品属性 - 商品运营专区
  basicdataItemTagsAdd: api_prefix_vesta + '/m/basicdata/item_tags/add',//商品标签新增
  basicdataItemTagsEdit: api_prefix_vesta + '/m/basicdata/item_tags/edit',//商品标签修改
  basicdataItemTagsList: api_prefix_vesta + '/m/basicdata/item_tags/list',//商品标签列表
  basicdataItemTagsDelete: api_prefix_vesta + '/m/basicdata/item_tags/delete',//商品标签删除
  basicdataItemTagsDetail: api_prefix_vesta + '/m/basicdata/item_tags/detail', //icon标签详情

  itemQueryByItemTag: api_prefix_vesta + '/m/item/query/by_item_tag',//商品运营专区内查看商品
  itemTagRankEdit: api_prefix_vesta + '/m/item/tag/rank/edit',//商品在运营专区内排名修改
  itemTagAdd: api_prefix_vesta + '/m/item/tag/add',//将商品添加至指定的运营专区内(批量)
  itemTagDelete: api_prefix_vesta + '/m/item/tag/delete',//将运营专区内查看商品删除
  itemTagUpdate: api_prefix_vesta + '/m/item/tag/update',//将商品更新至指定的运营专区内(批量)

  //商品 - 货架商品属性 - 展示分类
  basicdataDisplayClassList: api_prefix_vesta + '/m/basicdata/display_class/list',//商品展示分类列表
  basicdataDisplayClassAdd: api_prefix_vesta + '/m/basicdata/display_class/add',//商品展示分类新增
  basicdataDisplayClassEdit: api_prefix_vesta + '/m/basicdata/display_class/edit',//商品展示分类修改
  basicdataDisplayClassDelete: api_prefix_vesta + '/m/basicdata/display_class/delete',//商品展示分类删除

  //商品 - 客户提报
  advicedItemQuery: api_prefix_vesta + '/m/adviced_item/query',//客户的提报列表
  advicedItemStatistical: api_prefix_vesta + '/m/adviced_item/statistical',//提报商品统计
  advicedItemExport: api_prefix_vesta + '/m/adviced_item/export',//客户提报导出
  advicedItemExportCheck: api_prefix_vesta + '/m/adviced_item/export_check',//客户提报导出 检查

  // 商户
  merchantList: api_prefix_vesta + '/m/merchant/list', //商户列表
  merchantAdd: api_prefix_vesta + '/m/merchant/add', //新增商户
  merchantEdit: api_prefix_vesta + '/m/merchant/edit', //修改商户
  merchantDetail: api_prefix_vesta + '/m/merchant/detail', //商户详情
  merchantApprove: api_prefix_vesta + '/m/merchant/approve', //商户审核
  merchantFreeze: api_prefix_vesta + '/m/merchant/freeze', //商户冻结
  merchantUnFreeze: api_prefix_vesta + '/m/merchant/unfreeze', //商户解冻
  merchantGradeTagsEdit: api_prefix_vesta + '/m/merchant/grade_tags/edit', //商户内标签修改
  merchantBalanceEdit: api_prefix_vesta + '/m/merchant/balance/edit',  // 商户充值 / 扣款
  merchantRefundEdit: api_prefix_vesta + '/m/store/frame/edit', //修改门店的退筐信息
  merchantRefundLogQuery: api_prefix_vesta + '/m/store/frame/log/query', // 退筐日志查询
  merchantExport: api_prefix_vesta + '/m/store/export', // 商户导出
  merchantExportCheck: api_prefix_vesta + '/m/store/export_check', // 商户导出
  merchantBatchGroupBuy: api_prefix_vesta + '/m/store/batch/gb_include', // 批量设置团购商户

  storeQuery: api_prefix_vesta + '/m/store/query', // 所有门店的查询结果
  storeList: api_prefix_vesta + '/m/store/list', //单商户下的门店列表
  storeDetail: api_prefix_vesta + '/m/store/detail', //门店详情
  storeAdd: api_prefix_vesta + '/m/store/add', //添加门店
  storeEdit: api_prefix_vesta + '/m/store/edit', //修改门店
  storeFreeze: api_prefix_vesta + '/m/store/freeze', //门店冻结
  storeUnFreeze: api_prefix_vesta + '/m/store/unfreeze', //门店解冻
  storeDelete: api_prefix_vesta + '/m/store/delete', //删除门店
  storeApprove: api_prefix_vesta + '/m/store/approve',//门店审核
  storeTagEdit: api_prefix_vesta + '/m/store/store_tag_relation/edit', //门店标签修改
  storeBlacklistAdd: api_prefix_vesta + '/m/blacklist/add', // 门店添加黑名单
  storeBlacklistRemove: api_prefix_vesta + '/m/blacklist/remove', // 门店移除黑名单

  storeByProvince: api_prefix_vesta + '/m/store/by_province', //地图模式-区域级别的总览
  storeByZone: api_prefix_vesta + '/m/store/by_zone', //地图模式-片区级别的总览
  storeByCity: api_prefix_vesta + '/m/store/by_city', //地图模式-县域级别的总览
  storeLocationDetail: api_prefix_vesta + '/m/store/location_detail', //地图模式-县域级别的门店具体位置分布
  storeNoDistance: api_prefix_vesta + '/m/store/no_distance', //地图模式-没有距离的门店
  storeDistance: api_prefix_vesta + '/m/update_one_store_distance', //捞距离

  memberAdd: api_prefix_vesta + '/m/member/add', //新用户资料添加
  memberEdit: api_prefix_vesta + '/m/member/edit', //用户资料修改
  memberDelete: api_prefix_vesta + '/m/member/delete', // 删除用户
  memberList: api_prefix_vesta + '/m/member/list', //用户列表
  memberPasswordReset: api_prefix_vesta + '/m/member/password_reset', //重置密码
  memberFreeze: api_prefix_vesta + '/m/member/freeze', //冻结用户账号
  memberUnFreeze: api_prefix_vesta + '/m/member/unfreeze', //解冻用户账号
  memberUnBindWechat: api_prefix_vesta + '/m/member/unbind_wechat', //解除微信绑定

  // 商户 - 意向客户
  intentionMerchantQuery: api_prefix_vesta + '/m/intention_merchant/query', // 查询
  intentionMerchantAdd: api_prefix_vesta + '/m/intention_merchant/add', // 新增
  intentionMerchantEdit: api_prefix_vesta + '/m/intention_merchant/edit', // 修改
  intentionMerchantDetail: api_prefix_vesta + '/m/intention_merchant/detail', // 详情
  intentionMerchantAudit: api_prefix_vesta + '/m/intention_merchant/audit', // 激活 id: intention_merchant_id
  intentionMerchantDelete: api_prefix_vesta + '/m/intention_merchant/delete', // 删除
  intentionMerchantExport: api_prefix_vesta + '/m/intention_merchant/export', // 意向客户导出
  intentionMerchantExportCheck: api_prefix_vesta + '/m/intention_merchant/export_check', // 意向客户导出

  // 商户 - 满天星门店申请列表
  includedApplyQuery: api_prefix_vesta + '/m/included/apply/query', // 查询
  includedApplyPass: api_prefix_vesta + '/m/included/apply/pass', // 审核通过

  // 商户属性
  merchantPropertyGradeList: api_prefix_vesta + '/m/basicdata/grade/list', //商户等级列表
  merchantPropertyGradeAdd: api_prefix_vesta + '/m/basicdata/grade/add', //商户级别添加
  merchantPropertyGradeEdit: api_prefix_vesta + '/m/basicdata/grade/edit', //商户级别修改
  merchantPropertyGradeDelete: api_prefix_vesta + '/m/basicdata/grade/delete', //商户等级删除

  merchantPropertyInnerTagList: api_prefix_vesta + '/m/basicdata/merchant_inner_tags/list', //商户内标签
  merchantPropertyInnerTagAdd: api_prefix_vesta + '/m/basicdata/merchant_inner_tags/add', //商户内标签添加
  merchantPropertyInnerTagEdit: api_prefix_vesta + '/m/basicdata/merchant_inner_tags/edit', //商户内标签修改
  merchantPropertyInnerTagDelete: api_prefix_vesta + '/m/basicdata/merchant_inner_tags/delete', //商户内标签删除

  merchantPropertyOuterTagList: api_prefix_vesta + '/m/basicdata/merchant_outer_tags/list', //商户外标签
  merchantPropertyOuterTagAdd: api_prefix_vesta + '/m/basicdata/merchant_outer_tags/add', //商户外标签新增
  merchantPropertyOuterTagEdit: api_prefix_vesta + '/m/basicdata/merchant_outer_tags/edit', //商户外标签修改
  merchantPropertyOuterTagDelete: api_prefix_vesta + '/m/basicdata/merchant_outer_tags/delete', //商户外标签删除

  merchantPropertyStoreTagList: api_prefix_vesta + '/m/basicdata/store_tag/list', //门店标签列表
  merchantPropertyStoreTagAdd: api_prefix_vesta + '/m/basicdata/store_tag/add', //添加门店标签基础数据
  merchantPropertyStoreTagEdit: api_prefix_vesta + '/m/basicdata/store_tag/edit', //修改门店标签基础数据
  merchantPropertyStoreTagDelete: api_prefix_vesta + '/m/basicdata/store_tag/delete', //删除门店标签基础数据

  // 商户管理 - 会员等级
  merchantVipQuery: api_prefix_vesta + '/m/vip/query', // 查询
  merchantVipDetail: api_prefix_vesta + '/m/vip/detail', // 详情
  merchantVipNewLevel: api_prefix_vesta + '/m/vip/new_level', // 获取新的vip等级
  merchantVipAdd: api_prefix_vesta + '/m/vip/add', // 新增
  merchantVipModify: api_prefix_vesta + '/m/vip/edit', // 修改
  merchantVipConfigGrowthSet: api_prefix_vesta + '/m/vip/config/growth/set', // 成长值设置
  merchantVipConfigGrowthGet: api_prefix_vesta + '/m/vip/config/growth/get', // 成长值读取
  merchantVipConfigDescSet: api_prefix_vesta + '/m/vip/config/desc/set', // 会员等级说明设置
  merchantVipConfigDescGet: api_prefix_vesta + '/m/vip/config/desc/get', // 会员等级说明读取

  // 商户管理 - 黑名单
  merchantBlacklistQuery: api_prefix_vesta + '/m/blacklist/query', // 查询
  merchantBlacklistAdd: api_prefix_vesta + '/m/blacklist/add', // 新增
  merchantBlacklistRemove: api_prefix_vesta + '/m/blacklist/remove', // 移除

  // 营销活动 - 全场营销
  activityScopeQuery: api_prefix_vesta + '/m/scope_promotion/query', // 查询
  activityScopeDetail: api_prefix_vesta + '/m/promotion/detail', // 详情
  activityScopeAdd: api_prefix_vesta + '/m/scope_promotion/add', // 新增
  activityScopeStart: api_prefix_vesta + '/m/promotion/start', // 上架
  activityScopeHalt: api_prefix_vesta + '/m/promotion/end', // 下架

  // 营销活动 - 优惠券
  activityCouponQuery: api_prefix_vesta + '/m/coupon/query', // 查询
  activityCouponDetail: api_prefix_vesta + '/m/coupon/detail', // 详情
  activityCouponAdd: api_prefix_vesta + '/m/coupon/add', // 新增
  activityCouponModify: api_prefix_vesta + '/m/coupon/edit', // 修改
  activityCouponAudit: api_prefix_vesta + '/m/coupon/audit', // 审核
  activityCouponDelete: api_prefix_vesta + '/m/coupon/delete', // 删除
  activityCouponStop: api_prefix_vesta + '/m/coupon/stop', // 作废
  activityCouponIncreaseTotal: api_prefix_vesta + '/m/coupon/num/edit', // 增加总量

  activityCouponGrantAdd: api_prefix_vesta + '/m/coupon_activity/add', // 发放

  // 营销活动 - 优惠券 - 领用明细
  activityCouponRecord: api_prefix_vesta + '/m/coupon_detail/query', // 明细
  activityCouponRecordStop: api_prefix_vesta + '/m/coupon_detail/stop', // 明细 取消发放

  // 营销活动 - 优惠券 - 发放列表
  activityCouponGrantQuery: api_prefix_vesta + '/m/coupon_activity/query', // 查询
  activityCouponGrantDetail: api_prefix_vesta + '/m/coupon_activity/detail', // 发放详情
  activityCouponManualGrantDetail: api_prefix_vesta + '/m/coupon_activity/manual/detail', // 手动发放的详情
  activityCouponGrantAudit: api_prefix_vesta + '/m/coupon_activity/audit', // 审核
  activityCouponGrantDelete: api_prefix_vesta + '/m/coupon_activity/delete', // 删除
  activityCouponGrantActive: api_prefix_vesta + '/m/coupon_activity/activate', // 启动发放
  activityCouponGrantPause: api_prefix_vesta + '/m/coupon_activity/pause', // 暂停发放
  activityCouponGrantStop: api_prefix_vesta + '/m/coupon_activity/stop', // 作废
  activityCouponManualGrantFirst: api_prefix_vesta + '/m/coupon_activity/grant', // 手动发放类型 第一次发放 { coupon_id }
  activityCouponManualGrantAgain: api_prefix_vesta + '/m/coupon_activity/grant', // 手动发放类型 再次发放 { id }

  // 营销活动 - 县域定价
  activityCityPriceQuery: api_prefix_vesta + '/m/item/city_price/query', // 县域定价查询
  activityCityPriceAdd: api_prefix_vesta + '/m/item/city_price/add', // 新增
  activityCityPriceModify: api_prefix_vesta + '/m/item/city_price/batch_edit', // 修改
  activityCityPriceDelete: api_prefix_vesta + '/m/item/city_price/delete', // 删除

  // 营销活动 - 阶梯定价
  activityStepPriceQuery: api_prefix_vesta + '/m/item/query', // 阶梯定价查询，本质上查询的是商品接口，has_step_price = 1 表示过滤出具有阶梯定价的商品
  activityStepPriceAdd: api_prefix_vesta + '/m/item/step_price/add', // 新增
  activityStepPriceModify: api_prefix_vesta + '/m/item/step_price/batch_edit', // 修改
  activityStepPriceDelete: api_prefix_vesta + '/m/item/step_price/delete', // 删除

  // 营销活动 - 直播管理
  activityLiveQuery: api_prefix_vesta + '/m/live_video/query', // 直播列表
  activityLiveEdit: api_prefix_vesta + '/m/live_video/province/edit', // 设置直播播放区域

  // 设置 - Banner管理
  settingBannerList: api_prefix_vesta + '/m/system/banner/list', // 查询
  settingBannerAdd: api_prefix_vesta + '/m/system/banner/add', // 新增
  settingBannerModify: api_prefix_vesta + '/m/system/banner/update', // 修改
  settingBannerDelete: api_prefix_vesta + '/m/system/banner/delete', // 删除

  // 设置 - 运营设置
  settingOperationBrand: api_prefix_vesta + '/m/basicdata/constant/brand', // 品牌信息
  settingOperationBusiness: api_prefix_vesta + '/m/basicdata/constant/order/time', // 营业时间
  settingOperationConfirm: api_prefix_vesta + '/m/basicdata/constant/confirm/time', // 订单确认时间
  settingOperationDelivery: api_prefix_vesta + '/m/basicdata/constant/delivery', // 运费规则
  settingOperationDescription: api_prefix_vesta + '/m/basicdata/constant/unified_description', // 商品统一描述

  //用户订单
  orderUserQuery: api_prefix_vesta + '/m/order/query',//列表
  orderUserDetail: api_prefix_vesta + '/m/order/detail',//详情
  orderUserCancel: api_prefix_vesta + '/m/order/cancel',//取消
  orderUserListExportCheck: api_prefix_vesta + '/m/order/list/export_check', //订单列表导出
  orderUserListExport: api_prefix_vesta + '/m/order/list/export', //订单列表导出
  orderUserItemExportCheck: api_prefix_vesta + '/m/order/item/export_check', //订单商品导出
  orderUserItemExport: api_prefix_vesta + '/m/order/item/export', //订单商品导出

  //售后
  orderAftersaleQuery: api_prefix_vesta + '/m/aftersale/query',//售后单列表
  orderAftersaleListExportCheck: api_prefix_vesta + '/m/aftersale/list/export_check', //售后汇总表导出 检查
  orderAftersaleListExport: api_prefix_vesta + '/m/aftersale/list/export', //售后汇总表导出
  orderAftersaleRespListExportCheck: api_prefix_vesta + '/m/aftersale_resp/list/export_check', //售后追责表导出 检查
  orderAftersaleRespListExport: api_prefix_vesta + '/m/aftersale_resp/list/export', //售后追责表导出
  orderAftersaleDetail: api_prefix_vesta + '/m/aftersale/detail', //获取售后单详情
  orderAftersaleAppend: api_prefix_vesta + '/m/aftersale/append', //售后单回复
  orderAftersaleDialogRevoke: api_prefix_vesta + '/m/aftersale/dialog_revoke',//撤回消息
  orderAftersaleAddLog: api_prefix_vesta + '/m/aftersale/add_log',//售后单添加备注
  orderAftersaleHandleLoading: api_prefix_vesta + '/m/aftersale/handle_loading', //更新售后单处理进度
  orderAfterSaleUpdate: api_prefix_vesta + '/m/aftersale/handle_done', //售后处理
  orderAftersaleAllocateToOperator: api_prefix_vesta + '/m/aftersale/allocate_to_operator', //批量将售后单分配给客服人员以待处理
  orderAftersaleHandleSecondTime: api_prefix_vesta + '/m/aftersale/handle_second_time', //二次处理

  //退货单相关
  orderSaleBackQuery: api_prefix_vesta + '/m/saleback/query', //获取负责处理的退货单
  orderSaleBackDetail: api_prefix_vesta + '/m/saleback/detail', //退货单详情
  orderSaleBackClose: api_prefix_vesta + '/m/saleback/close', //关闭退货单

  // 财务管理
  financeBalanceQuery: api_prefix_vesta + '/m/balance/query', // 商户余额列表
  financeBalanceEdit: api_prefix_vesta + '/m/balance/check/add', // 充值/扣款
  financeBalanceLogQuery: api_prefix_vesta + '/m/merchant/balance/log/query', // 商户流水变更记录
  financeBalanceExportCheck: api_prefix_vesta + '/m/balance/export_check', // 商户余额列表导出
  financeBalanceExport: api_prefix_vesta + '/m/balance/export', // 商户余额列表导出
  financeBalanceMerchantLogExportCheck: api_prefix_vesta + '/m/balance/log/export_check', // 商户流水列表导出
  financeBalanceMerchantLogExport: api_prefix_vesta + '/m/balance/log/export', // 商户流水列表导出

  financeBalanceCheckQuery: api_prefix_vesta + '/m/balance/check/query', // 审核记录(充值/扣款记录)
  financeBalanceCheckEdit: api_prefix_vesta + '/m/balance/check/edit', // 审核
  financeBalanceCheckDetail: api_prefix_vesta + '/m/balance/check/detail', // 审核详情

  financeSupBillQuery: api_prefix_mercury + '/m/sup_bill/query', //对账单查询
  financeSupBillDetail: api_prefix_mercury + '/m/sup_bill/detail', //对账单详情
  financeSupBillDetailExportCheck: api_prefix_mercury + '/m/sup_bill/detail/export_check', //对账单详情导出检查
  financeSupBillDetailExport: api_prefix_mercury + '/m/sup_bill/detail/export', //对账单详情导出
  financeSupBillPay: api_prefix_mercury + '/m/sup_bill/pay', //批量结款
  financeSupBillExportCheck: api_prefix_mercury + '/m/sup_bill/export_check', //对账单导出检查
  financeSupBillExport: api_prefix_mercury + '/m/sup_bill/export', //对账单导出

  financeSupBDetailQuery: api_prefix_mercury + '/m/sup_bdetail/query', //账单明细详情查询
  financeSupBdetailExportCheck: api_prefix_mercury + '/m/sup_bdetail/export_check', //供应商流水导出检查
  financeSupBdetailExport: api_prefix_mercury + '/m/sup_bdetail/export', //供应商流水导出
  financeSupBDetailDetail: api_prefix_mercury + '/m/sup_bdetail/detail', //账单明细详情
  financeSupBDetailAdd: api_prefix_mercury + '/m/sup_bdetail/add', //财务人员手动添加账单变更明细
  financeSupBDetailAddByExcel: api_prefix_mercury + '/m/sup_bdetail/add_by_excel', //财务人员手动导入账单变更明细
  financeSupBDetailAudit: api_prefix_mercury + '/m/sup_bdetail/audit', //供应流水审核
  financeSupBDetailPay: api_prefix_mercury + '/m/sup_bdetail/pay', //手动结款
  financeSupBDetailPayByQuery: api_prefix_mercury + '/m/sup_bdetail/pay_by_query', //一键结款

}
