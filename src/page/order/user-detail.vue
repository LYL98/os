<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">
    <h4 class="mt-10">订单信息</h4>
    <div class="row">
      <div class="col-4">下单时间：{{ item.created }}</div>
      <div class="col-4">订单编号：{{ item.code }}</div>
      <div class="col-4">配送日期：{{ item.delivery_date || '-' }}</div>
    </div>

    <h4 class="mt-20">用户信息</h4>
    <div class="row">
      <div class="col-4">姓名：{{ item.linkman || '-' }}</div>
      <div class="col-4">联系方式：{{ item.phone }}</div>
      <div class="col-4 overflow-ellipsis">自提点名称：{{ item.store && item.store.title || '-' }}</div>
    </div>
    <div class="row">
      <div class="col-4">推广者：{{ item.p_member && item.p_member.login_phone || '-' }}</div>
      <div class="col-4">自提点佣金：{{ item.commission_amount ? `¥${Handle.returnPrice(item.commission_amount)}` : '-' }}</div>
    </div>

    <h4 class="mt-20">商品信息</h4>
    <pg-table
      :data="item.order_items"
      primary-key="item_code"
      :highlight-row="false"
      borderless
      placeholder="商品信息为空..."
    >
      <pg-column title="商品编号/名称">
        <template v-slot="{row}">
          <div class="overflow-ellipsis">{{ row.item_code }} / {{ row.item_title }}</div>
        </template>
      </pg-column>
      <pg-column title="销售价" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.item_price_sale">¥{{ Handle.returnPrice(row.item_price_sale) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="数量" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.num">{{ row.num }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="返利金额" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.divide_amount">¥{{ Handle.returnPrice(row.divide_amount) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="小计" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.amount">¥{{ Handle.returnPrice(row.amount) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="实付金额" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.real_amount">¥{{ Handle.returnPrice(row.real_amount) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
    </pg-table>
    <div class="row mt-10">
      <div class="col-4">订单商品金额:
        <span v-if="item.item_amount">¥{{ Handle.returnPrice(item.item_amount) }}</span>
        <span v-else>-</span>
      </div>
      <div class="col-4">优惠金额:
        <span v-if="item.item_dis_amount">¥{{ Handle.returnPrice(item.item_dis_amount) }}</span>
        <span v-else>-</span>
      </div>
      <div class="col-4">订单金额:
        <span v-if="item.item_real_amount">¥{{ Handle.returnPrice(item.item_real_amount) }}</span>
        <span v-else>-</span>
      </div>
    </div>

    <h4 class="mt-20">付款记录</h4>
    <pg-table
      :data="item.pay_record && item.pay_record.out_code ? [item.pay_record] : []"
      :serialable="false"
      :highlight-row="false"
      primary-key="out_code"
      borderless
      placeholder="暂无付款记录..."
    >
      <pg-column title="发起时间" prop="created"></pg-column>
      <pg-column title="完成时间" prop="updated"></pg-column>
      <pg-column title="付款编号" prop="out_code"></pg-column>
      <pg-column title="实付金额" prop="pay_fee">
        <template v-slot="{row}">
          <span v-if="row.pay_fee">
            ¥{{ Handle.returnPrice(row.pay_fee) }}
          </span>
          <span v-else>-</span>
        </template>
      </pg-column>
    </pg-table>

    <h4 class="mt-20">订单日志</h4>
    <div class="row">
      <div class="col-2 after-divider" v-for="item in item.action_logs" :key="item.action">
        <div>{{ Constant.ORDER_USER_LOG('enum')[item.action] || item.action || '-' }}</div>
        <span class="text-secondary">{{ item.created }}</span>
      </div>
    </div>
  </div>
</template>

<script>

  import { Handle, Constant } from '@/util';
  export default {
    name: 'user-detail',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } }
    },
    created() {
      this.Handle = Handle;
      this.Constant = Constant;
    }
  }
</script>

<style lang="scss" scoped>

  .after-divider + .after-divider {
    position: relative;

    &::after {
      position: absolute;
      left: -70px;
      top: 8px;
      display: inline-block;
      content: '';
      background-color: #ddd;
      height: 1px;
      width: 60px;
    }
  }

</style>
