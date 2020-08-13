import { api_prefix_apollo, api_prefix_vesta, api_prefix_juno } from './../env.config';

export default {

  commonProvinceListAuth: api_prefix_vesta + '/m/common/my_province',
  commonProvinceList: api_prefix_vesta + '/m/common/province/list', //区域列表 (组件共用）
  commonStoreList: api_prefix_vesta + '/m/common/store/list', // 门店列表(组件共用)
  commonStoreMemberList: api_prefix_vesta + '/m/common/member/list', // 门店列表(组件共用)
  commonZoneList: api_prefix_vesta + '/m/common/zone/list', //片区列表（组件共用）
  commonCityList: api_prefix_vesta + '/m/common/city/list', //县区列表（组件共用）
  commonSystemClassList: api_prefix_vesta + '/m/common/system_class/list', // 科学分类列表
  commonSystemClassTree: api_prefix_vesta + '/m/common/system_class/tree', // 科学分类树形数据
  tencentPresignedUrl: api_prefix_vesta + '/common/tencent/presigned_url', //腾讯云上传url（组件共用）

  commonItemList: api_prefix_juno + '/m/common/item/list', // 商品列表
  commonItemDetail: api_prefix_juno + '/m/common/item/detail', // 商品详情
  commonItemTagList: api_prefix_juno + '/m/common/item_tag/list', // 运营专区（即：商品标签）
  commonDisplayClassList: api_prefix_juno + '/m/common/display_class/list', // 展示分类
  commonItemTagImageList: api_prefix_juno + '/m/common/tag_images/list', // 运营专区（即：商品标签）

  // 商品库
  pitemQuery: api_prefix_juno + '/m/p_item/query', // 查询
  pitemDetail: api_prefix_juno + '/m/p_item/detail', // 详情
  pitemAdd: api_prefix_juno + '/m/p_item/add', // 新增
  pitemEdit: api_prefix_juno + '/m/p_item/edit', // 修改
  pitemDelete: api_prefix_juno + '/m/p_item/delete', // 删除
  pitemRecover: api_prefix_juno + '/m/p_item/recover', // 恢复
  pitemModifyLog: api_prefix_juno + '/m/p_item/modify/query', // 操作日志
  pitemExportCheck: api_prefix_juno + '/m/p_item/export_check', // 导出检查
  pitemExport: api_prefix_juno + '/m/p_item/export', // 导出

  // 货架商品
  subitemQuery: api_prefix_juno + '/m/sub_item/query', // 查询
  subitemDetail: api_prefix_juno + '/m/sub_item/detail', // 详情
  subitemEdit: api_prefix_juno + '/m/sub_item/edit', // 修改
  subitemOnGround: api_prefix_juno + '/m/sub_item/on_ground', // 上架
  subitemUnderGround: api_prefix_juno + '/m/sub_item/under_ground', // 下架
  subitemModifyLog: api_prefix_juno + '/m/sub_item/modify/query', // 操作日志
  subitemExportCheck: api_prefix_juno + '/m/sub_item/export_check', // 导出检查
  subitemExport: api_prefix_juno + '/m/sub_item/export', // 导出
  // 定时调价
  subitemPriceQuery: api_prefix_juno + '/m/item_price/query', // 查询
  subitemPriceDetail: api_prefix_juno + '/m/item_price/detail', // 详情
  subitemPriceAdd: api_prefix_juno + '/m/item_price/add', // 新增
  subitemPriceEdit: api_prefix_juno + '/m/item_price/edit', // 修改
  subitemPriceDelete: api_prefix_juno + '/m/item_price/delete', // 修改
  // 发圈素材
  subitemMaterialList: api_prefix_juno + '/m/item/material/list', // 列表
  subitemMaterialAdd: api_prefix_juno + '/m/item/material/add', // 新增
  subitemMaterialModify: api_prefix_juno + '/m/item/material/edit', // 编辑
  subitemMaterialDelete: api_prefix_juno + '/m/item/material/delete', // 删除

  // 定时上下架
  subitemSchedulerQuery: api_prefix_juno + '/m/item/scheduler/query', // 查询
  subitemSchedulerAdd: api_prefix_juno + '/m/item/scheduler/add', // 新增
  subitemSchedulerStop: api_prefix_juno + '/m/item/scheduler/stop', // 作废

  // 运营专区
  operationQuery: api_prefix_juno + '/m/item_tag/query', // 查询
  operationAdd: api_prefix_juno + '/m/item_tag/add', // 新增
  operationEdit: api_prefix_juno + '/m/item_tag/edit', // 修改
  operationDelete: api_prefix_juno + '/m/item_tag/delete', // 删除
  operationItemQuery: api_prefix_juno + '/m/item_tag/item/query', // 专区商品查询
  operationItemAdd: api_prefix_juno + '/m/item_tag/add_item', // 新增专区商品
  operationItemDelete: api_prefix_juno + '/m/item_tag/delete_item', // 删除专区商品

  // 展示分类
  displayClassQuery: api_prefix_juno + '/m/display_class/query', // 查询
  displayClassAdd: api_prefix_juno + '/m/display_class/add', // 新增
  displayClassEdit: api_prefix_juno + '/m/display_class/edit', // 修改
  displayClassDelete: api_prefix_juno + '/m/display_class/delete', // 删除

  // 营销活动 - 秒杀
  activitySeckillQuery: api_prefix_juno + '/m/activity/query', // 查询
  activitySeckillDetail: api_prefix_juno + '/m/activity/detail', // 详情
  activitySeckillAdd: api_prefix_juno + '/m/activity/add', // 新增
  activitySeckillModify: api_prefix_juno + '/m/activity/edit', // 修改
  activitySeckillAudit: api_prefix_juno + '/m/activity/audit', // 审核
  activitySeckillAuditCancel: api_prefix_juno + '/m/activity/audit/cancel', // 审核
  activitySeckillDelete: api_prefix_juno + '/m/activity/delete', // 删除
  activitySeckillStop: api_prefix_juno + '/m/activity/stop', // 作废
  activitySeckillLog: api_prefix_juno + '/m/activity/opt_log/query', // 活动操作日志

  // 营销活动 - 秒杀 - 活动商品
  activitySeckillItemQuery: api_prefix_juno + '/m/activity/item/query', // 查询
  activitySeckillItemModify: api_prefix_juno + '/m/activity/item/edit', // 调整
  activitySeckillItemModifyStock: api_prefix_juno + '/m/activity/item/edit_stock', // 调整库存
  activitySeckillItemOnShelf: api_prefix_juno + '/m/activity/item/on_shelf', // 上架
  activitySeckillItemOffShelf: api_prefix_juno + '/m/activity/item/off_shelf', // 下架

  // 营销活动 - 优惠券
  activityCouponQuery: api_prefix_juno + '/m/coupon/query', // 查询
  activityCouponDetail: api_prefix_juno + '/m/coupon/detail', // 详情
  activityCouponAdd: api_prefix_juno + '/m/coupon/add', // 新增
  activityCouponModify: api_prefix_juno + '/m/coupon/edit', // 修改
  activityCouponAudit: api_prefix_juno + '/m/coupon/audit', // 审核
  activityCouponDelete: api_prefix_juno + '/m/coupon/delete', // 删除
  activityCouponStop: api_prefix_juno + '/m/coupon/stop', // 作废
  activityCouponIncreaseTotal: api_prefix_juno + '/m/coupon/num/edit', // 增加总量

  activityCouponGrantAdd: api_prefix_juno + '/m/coupon_activity/add', // 发放

  // 营销活动 - 优惠券 - 领用明细
  activityCouponRecord: api_prefix_juno + '/m/coupon_detail/query', // 明细
  activityCouponRecordStop: api_prefix_juno + '/m/coupon_detail/stop', // 明细 取消发放

  // 营销活动 - 优惠券 - 发放列表
  activityCouponGrantQuery: api_prefix_juno + '/m/coupon_activity/query', // 查询
  activityCouponGrantDetail: api_prefix_juno + '/m/coupon_activity/detail', // 详情
  activityCouponManualGrantPhones: api_prefix_juno + '/m/coupon_activity/phones', // 手动发放手机号的记录查询
  activityCouponGrantAudit: api_prefix_juno + '/m/coupon_activity/audit', // 审核
  activityCouponGrantDelete: api_prefix_juno + '/m/coupon_activity/delete', // 删除
  activityCouponGrantActive: api_prefix_juno + '/m/coupon_activity/activate', // 启动发放
  activityCouponGrantPause: api_prefix_juno + '/m/coupon_activity/pause', // 暂停发放
  activityCouponGrantStop: api_prefix_juno + '/m/coupon_activity/stop', // 作废
  activityCouponManualGrantFirst: api_prefix_juno + '/m/coupon_activity/grant', // 手动发放类型 第一次发放 { id }
  activityCouponManualGrantAgain: api_prefix_juno + '/m/coupon_activity/grant', // 手动发放类型 再次发放 { id, phones }

  // 零售门店
  userStoreQuery: api_prefix_vesta + '/m/store/query', // 查询
  userStoreDetail: api_prefix_vesta + '/m/store/detail', // 详情
  // userStoreAdd: api_prefix_vesta + '/m/store/gb/edit', // 新增
  userStoreFreeze: api_prefix_vesta + '/m/store/gb/freeze', // 冻结门店
  userStoreUnFreeze: api_prefix_vesta + '/m/store/gb/unfreeze', // 解冻门店
  userStoreBalanceLogs: api_prefix_vesta + '/m/store/balance_log/query', // 余额明细
  // userStoreHeaderAdd: api_prefix_vesta + '/m/store/header/add', // 新增团长
  userStoreHeaderFreeze: api_prefix_vesta + '/m/store/header/gb/freeze', // 冻结推广者
  userStoreHeaderUnFreeze: api_prefix_vesta + '/m/store/header/gb/unfreeze', // 解冻推广者

  // 推广者
  userPromoterQuery: api_prefix_juno + '/m/promoter/query', // 查询
  userPromoterAdd: api_prefix_juno + '/m/promoter/add', // 新增
  userPromoterModify: api_prefix_juno + '/m/promoter/edit', // 修改
  userPromoterFreeze: api_prefix_juno + '/m/promoter/freeze', // 冻结
  userPromoterUnFreeze: api_prefix_juno + '/m/promoter/un_freeze', // 解冻
  userPromoterBalanceAdjust: api_prefix_juno + '/m/promoter/balance/adjust', // 余额调整
  userPromoterBalance: api_prefix_juno + '/m/promoter/balance_log/query', // 余额明细

  // 消费者
  userMemberQuery: api_prefix_juno + '/m/gb_member/query', // 查询
  userMemberFreeze: api_prefix_juno + '/m/gb_member/freeze', // 冻结/解冻

  // 用户订单
  orderUserQuery: api_prefix_juno + '/m/order/query', // 查询
  orderUserDetail: api_prefix_juno + '/m/order/detail', // 详情
  orderUserCancel: api_prefix_juno + '/m/order/cancel', // 取消
  orderUserExportCheck: api_prefix_juno + '/m/order/export_check', // 导出检查
  orderUserExport: api_prefix_juno + '/m/order/export', // 导出
  orderUserExportItemsCheck: api_prefix_juno + '/m/order/items_export_check', // 导出详情检查
  orderUserExportItems: api_prefix_juno + '/m/order/items_export', // 导出详情

  // 门店订单
  orderStoreQuery: api_prefix_juno + '/m/store_order/query', // 查询
  orderStoreDetail: api_prefix_juno + '/m/store_order/detail', // 详情
  orderStoreDelivery: api_prefix_juno + '/m/store_order/delivery', // 发货
  orderStoreDeliveryAll: api_prefix_juno + '/m/store_order/delivery_all', // 一键发货
  orderStoreItemExportCheck: api_prefix_juno + '/m/store_order/item_sum/export_check', // 导出订单商品汇总检查
  orderStoreItemExport: api_prefix_juno + '/m/store_order/item_sum/export', // 导出订单商品汇总
  orderStoreDetailExportCheck: api_prefix_juno + '/m/store_order/detail/export_check', // 导出订单详情检查
  orderStoreDetailExport: api_prefix_juno + '/m/store_order/detail/export', // 导出订单详情
  orderStoreExportCheck: api_prefix_juno + '/m/store_order/export_check', // 导出订单检查
  orderStoreExport: api_prefix_juno + '/m/store_order/export', // 导出订单

  // 推广者提现申请
  promoterWithdrawQuery: api_prefix_juno + '/m/promoter/withdraw/query', // 查询
  promoterWithdrawApprove: api_prefix_juno + '/m/promoter/withdraw/approve', // 审核通过
  promoterWithdrawReject: api_prefix_juno + '/m/promoter/withdraw/reject', // 申请拒绝

  // banner管理
  settingBannerList: api_prefix_juno + '/m/banner/list', // 列表
  settingBannerDetail: api_prefix_juno + '/m/banner/detail', // 详情
  settingBannerAdd: api_prefix_juno + '/m/banner/add', // 新增
  settingBannerModify: api_prefix_juno + '/m/banner/edit', // 修改
  settingBannerDelete: api_prefix_juno + '/m/banner/delete', // 删除

  // 区域运营设置
  settingConstantGet: api_prefix_juno + '/m/constant/get', // 获取系统常量
  settingConstantedit: api_prefix_juno + '/m/constant/edit', // 编辑系统常量

  // 权限树
  permissionTree: api_prefix_apollo + '/m/system/permission/list/tree',// 权限树
  systemClassTree: api_prefix_vesta + '/m/basicdata/system_class/list/tree',// 权限树

}
