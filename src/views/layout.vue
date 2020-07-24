<template>
  <div class="pg-app">

    <pg-drawer v-model="drawer" title="限制root登录" width="800px"></pg-drawer>

    <div class="pg-navbar">
    </div>
    <div class="main">
      <pg-sidebar title="零售中心" :routes="routeConfig" />
      <div class="pg-page">

        <div class="pg-page-header">
          安全组
        </div>

        <div class="pg-page-message">
          通知：2019年12月17日后，将增加实例最多绑定安全组数、安全组绑定最多实例数、规则引用数等限制，详情请参考
        </div>

        <div class="pg-page-content">

          <div class="query" style="display: flex; justify-content: flex-start">
            <pg-button color="primary" @click="drawer = true">创建商户</pg-button>


            <pg-select v-model="selected" searchable clearable>
              <pg-option value="1">第1项</pg-option>
              <pg-option value="2" disabled>第2项</pg-option>
              <pg-option value="3">第3项</pg-option>
              <pg-option value="4">第4项</pg-option>
              <pg-option value="5">第5项</pg-option>
            </pg-select>

            <pg-button-group value="2">
              <pg-button value="1">1</pg-button>
              <pg-button value="2">2</pg-button>
              <pg-button value="3">3</pg-button>
            </pg-button-group>

            <pg-input v-model="number" type="decimal"/>
            <pg-search style="width: 300px" clearable></pg-search>
          </div>

          <div class="card">

            <pg-button @click="remove_remark = !remove_remark"></pg-button>

            <pg-table primary-key="id" :disabled-keys="[1,2]" :data="tableData" :expand-all="false" fixed-header checkable>

              <template v-slot:name>
                <div class="d-flex">
                  <div class="text-center">
                    <div>安义</div>
                    <div>1/2/3</div>
                  </div>
                  <pg-column-sort v-model="query.order" asc="1" desc="2"></pg-column-sort>
                </div>
                
                <!-- <pg-select flat width="60px">
                  <pg-option>全部</pg-option>
                  <pg-option>未冻结</pg-option>
                  <pg-option>已冻结</pg-option> -->
                <!-- </pg-select> -->
              </template>

              <template v-slot:expand-row="{row}">
                <div>{{row.name}}</div>
              </template>

              <pg-column prop="name" title="门店名称" sort-key="name"></pg-column>
              <pg-column prop="remark" title="备注" v-if="!remove_remark"></pg-column>
              <pg-column title="备注">
                <template v-slot="{row}">
                  <pg-confirm help-text="确认删除">
                    <pg-switch :value="true"></pg-switch>
                  </pg-confirm>
                </template>
              </pg-column>
            </pg-table>
            
            <pg-pagination class="m-20"/>
          </div>
        </div>

<!--        <pg-drawer v-model="drawer"></pg-drawer>-->

      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "layout",
    created() {
      // this.$loading.show();

    },
    data() {
      return {
        query: {
          order: '1'
        },
        text: '',
        drawer: false,
        qrcodePopper: false,
        remove_remark: false,
        toggle: false,
        time: '10:20:30',
        date: { begin_date: '2020-04-13', end_date: '2020-05-16' },
        limit: { from: '2020-04-11', to: '2020-05-19' },
        number: '',
        selected: '1',
        routeConfig: [
          { name: '地图派单', icon: 'icon-map5', path: '/', code: 'Assign', id: 1 },
          { name: '列表派单', icon: 'icon-file-text', path: '/orders', code: 'SendOrder', id: 2 },
          { group: true, title: '监控台' },
          { name: '运单监控台', icon: 'icon-truck', path: '/watch', code: 'Watch', id: 3 },
          { name: '数据监控台', icon: 'icon-pie-chart8', path: '/monitor', code: 'Monitor', id: 4 },
          {
            name: '运营管理', icon: 'icon-graph', code: 'Operation', id: 5, children: [
              { name: '运单管理', path: '/operation/waybill', code: 'OperationWaybill', },
              { name: '营业部管理', path: '/operation/distribution', code: 'OperationDistribution', },
              { name: '维修厂管理', path: '/operation/repair', code: 'OperationRepair', },
              { name: '优惠券管理', path: '/operation/coupon', code: 'OperationCoupon', },
              { name: '优惠充值', path: '/operation/recharge', code: 'OperationRecharge', },
              { name: '小队管理', path: '/operation/team', code: 'OperationTeam', },
            ]
          },
          {
            name: '财务管理', icon: 'icon-coin-yen', code: 'Finance', id: 6, children: [
              { name: '汽配商财务', path: '/finance/supplierFinance', code: 'FinanceSupplierFinance', },
              { name: '汽配商财务审核', path: '/finance/supplierApprove', code: 'FinanceSupplierApprove', },
              { name: '小狮哥财务', path: '/finance/serviceFinance', code: 'FinanceServiceFinance', },
              { name: '小狮哥财务审核', path: '/finance/serviceApprove', code: 'FinanceServiceApprove', },
              { name: '平台代收货款', path: '/finance/platformColl', code: 'FinancePlatformColl', },
              { name: '平台运费', path: '/finance/platformFreight', code: 'FinancePlatformFreight', },
            ]
          },
          { group: true, title: '用户设置' },
          {
            name: '用户管理', icon: 'icon-users', code: 'User', id: 7, children: [
              { name: '运营人员', path: '/user/operator', code: 'UserOperator', },
              { name: '小狮哥', path: '/user/service', code: 'UserService', },
              { name: '汽配商', path: '/user/supplier', code: 'UserSupplier', },
            ]
          },
          {
            name: '系统设置', icon: 'icon-cog', code: 'System', id: 8, children: [
              { name: '角色权限', path: '/system/role', code: 'SystemRole', },
              { name: '基础信息', path: '/system/constantList', code: 'SystemConstantList', },
              { name: '运营设置', path: '/system/operate', code: 'SystemOperate', },
              { name: 'APP版本管理', path: '/system/version', code: 'SystemVersion', },
              { name: '小程序版本管理', path: '/system/wechatVersion', code: 'SystemSmallProgram', },
            ]
          }
        ],
        tableData: [
          { id: 1, name: '华南坂田汽配城华南坂田汽配城华南坂田汽配城华南坂田汽配城华南坂田汽配城华南坂田汽配城华南坂田汽配城', type: '提现', amount: 893700, operator: '小狮哥', remark: '提现备注', status: '已审核' },
          { id: 2, name: '江南汽配城龙岗中心', type: '奖金', amount: 37600, operator: '', remark: '商户发起(代收款时自动)', status: '未审核' },
          { id: 3, name: '云里智能圆', type: '提现', amount: 235435, operator: '小狮哥', remark: '提现备注', status: '已审核' },
          { id: 4, name: '华南坂田汽配城', type: '提现', amount: 893700, operator: '小狮哥', remark: '提现备注', status: '已审核' },
          { id: 5, name: '江南汽配城龙岗中心', type: '奖金', amount: 37600, operator: '', remark: '商户发起(代收款时自动)', status: '未审核' },
          { id: 6, name: '云里智能圆', type: '提现', amount: 235435, operator: '小狮哥', remark: '提现备注', status: '已审核' },
          { id: 7, name: '华南坂田汽配城', type: '提现', amount: 893700, operator: '小狮哥', remark: '提现备注', status: '已审核' },
          { id: 8, name: '江南汽配城龙岗中心', type: '奖金', amount: 37600, operator: '', remark: '商户发起(代收款时自动)', status: '未审核' },
          { id: 9, name: '云里智能圆', type: '提现', amount: 235435, operator: '小狮哥', remark: '提现备注', status: '已审核' },
        ]
      }
    }
  }
</script>

<style lang="scss" scoped>
  .card {
    background-color: #fff;
    box-shadow: 0 2px 3px 0 rgba(0,0,0,.2);
    padding-bottom: 20px;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
  }
</style>