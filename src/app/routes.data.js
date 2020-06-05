export default {
  tob: [
    {
      subitem: '商品',
      permission_code: 'Item',
      items: [
        { title: '商品库', permission_code: 'ItemGlobalMain', url: '/item/global/main' },
        { title: '商品属性', permission_code: 'ItemPropertyMain', url: '/item/propert/main' },
        { title: '货架商品', permission_code: 'ItemListMain', url: '/item/list/main' },
        { title: '货架商品属性', permission_code: 'ItemListPropertyMain', url: '/item/list/property/main' },
        { title: '每日报价', permission_code: 'ItemPricing', url: '/item/pricing' },
        { title: '库存销售', permission_code: 'InventoryMarket', url: '/item/inventory/market' },
        { title: '供应商', permission_code: 'ItemSupplier', url: '/item/supplier' },
        { title: '采购', permission_code: 'ItemPurchaseMain', url: '/item/purchase/main' },
        { title: '调拨', permission_code: 'ItemSupDistribute', url: '/item/sup/distribute' },
        { title: '客户提报', permission_code: 'AdvicedItemQuery', url: '/item/merchant/customer' },
      ],
    },
    {
      subitem: '业务',
      permission_code: 'Business',
      items: [
        { title: '商户', permission_code: 'MerchantMain', url: '/merchant/main' },
        { title: '商户属性', permission_code: 'MerchantPropertyMain', url: '/merchant/property/main' },
        { title: '用户订单', permission_code: 'OrderList', url: '/business/order/list' },
        { title: '售后订单', permission_code: 'OrderAfterSale', url: '/business/order/after_sale' },
        { title: '营销', permission_code: 'MarketMain', url: '/market/main' },
        { title: '营销策略', permission_code: 'MarketingStrategy', url: '/marketing/strategy' },
      ],
    },
    {
      subitem: '仓库',
      permission_code: 'Warehouse',
      items: [
        { title: '库存', permission_code: 'WarehouseInventory', url: '/warehouse/inventory' },
        { title: '库存变动记录', permission_code: 'WarehouseInventoryMove', url: '/warehouse/inventory/move' },
        { title: '出库计划', permission_code: 'OutStoragePlanMain', url: '/out/storage/play/main' },
        { title: '库', permission_code: 'WarehouseList', url: '/warehouse/list' },
      ],
    },
    {
      subitem: '场地',
      permission_code: 'Operate',
      items: [
        { title: '品控收货', permission_code: 'OperateReceivingMain', url: '/operate/receiving/main' },
        { title: '场地商品', permission_code: 'OperateItem', url: '/operate/item' },
        { title: '配送装车', permission_code: 'OperateTruckLoadMain', url: '/operate/truck/load/main' },
        { title: '发车', permission_code: 'OperateDepart', url: '/operate/depart' },
        { title: '调拨装车', permission_code: 'OperateDisTruckLoadMain', url: '/operate/dis/truck/load/main' },
        { title: '线路规划', permission_code: 'OperateLineList', url: '/operate/line/list' },
        { title: '配送人员', permission_code: 'Deliver', url: '/operate/deliver' },
        { title: '退筐', permission_code: 'OperateRefundFrame', url: '/operate/refund/frame' },
      ],
    },
    {
      subitem: '财务',
      permission_code: 'Finance',
      items: [
        { title: '客户财务管理', permission_code: 'FinanceBalanceQuery', url: '/finance/balance/query' },
        { title: '财务审核', permission_code: 'FinanceApproveQuery', url: '/finance/approve/query' },
        { title: '供应商流水', permission_code: 'FinanceSBDetail', url: '/finance/s/b/detail' },
        { title: '供应商流水审核', permission_code: 'FinanceSBDetailAudit', url: '/finance/s/b/detail/audit' },
        { title: '供应商对账单', permission_code: 'FinanceSStatement', url: '/finance/s/statement' },
      ],
    },
    {
      subitem: '统计',
      permission_code: 'Statistic',
      items: [
        { title: '商品销售统计', permission_code: 'StatisticMarket', url: '/statistic/market' },
        { title: '客户订单统计', permission_code: 'StatisticClient', url: '/statistic/client' },
        { title: '运营统计', permission_code: 'StatisticOperation', url: '/statistic/OperationStatistics' },
        { title: '导出', permission_code: 'StatisticExportPrint', url: '/statistic/export/print' },
        { title: '业务运营报表', permission_code: 'BusinessOperationStatement', url: '/statistic/operationStatement/business' },
        { title: '商品运营报表', permission_code: 'ItemOperationStatement', url: '/statistic/operationStatement/item' },
      ],
    },
    {
      subitem: '设置',
      permission_code: 'System',
      items: [
        { title: '平台设置', permission_code: 'SystemSettingMain', url: '/system/setting/main' },
        { title: '区域运营配置', permission_code: 'SettingCustom', url: '/system/setting/custom' },
        { title: '区域配置', permission_code: 'SystemAreaMain', url: '/system/area/main' },
      ],
    },
  ],
  toc: [
    {
      subitem: '零售中心',
      permission_code: 'Group',
      items: [
        { title: '零售活动', permission_code: 'GroupActivity', url: '/group/activity' },
        { title: '商品列表', permission_code: 'GroupItem', url: '/group/item' },
        { title: '用户订单', permission_code: 'GroupOrderQuery', url: '/group/order/query' },
        { title: '门店订单', permission_code: 'GroupStoreOrder', url: '/group/store/order' },
        { title: '零售门店', permission_code: 'GroupHeadQuery', url: '/group/head/query' },
        { title: '团员列表', permission_code: 'GroupMemberQuery', url: '/group/member/query' },
        { title: '零售统计', permission_code: 'GroupBuyStatement', url: '/statistic/GroupBuyStatement' },
        { title: '商品分类', permission_code: 'GroupItemClass', url: '/group/item/class' },
        { title: '回收站', permission_code: 'GroupItemRecoverList', url: '/group/item/recover' },
        { title: 'Banner管理', permission_code: 'GroupBanner', url: '/group/banner' },
      ],
    },
  ],
  acc: [
    {
      subitem: '平台管理',
      permission_code: 'Platform',
      items: [
        { title: '运营人员', permission_code: 'SystemOperatorList', url: '/system/operator/list' },
        { title: '角色管理', permission_code: 'SystemRoleList', url: '/system/role' },
      ]
    }
  ],
};