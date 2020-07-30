<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">
    <h4 class="mt-10">门店信息</h4>
    <div class="row">
      <div class="col-4">门店名称：{{ item.store && item.store.title || '-' }}</div>
      <div class="col-8 overflow-ellipsis">门店地址：{{ item.store && item.store.address || '-' }}</div>
    </div>
    <div class="row mt-10">
      <div class="col-4">配送日期：{{ item.delivery_date || '-' }}</div>
      <div class="col-4">联系方式：{{ item.store && item.store.phone || '-' }}</div>
      <div class="col-4">所在县域：{{ item.city && item.city.title || '-' }}</div>
    </div>
    <div class="row mt-10">
      <div class="col-4">实付金额：{{ item.item_amount ?  `¥${Handle.returnPrice(item.item_amount)}` : '-' }}</div>
      <div class="col-4">利润分成：{{ item.item_divide_amount ? `¥${Handle.returnPrice(item.item_divide_amount)}` : '-' }}</div>
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

    <h4 class="mt-20">订单日志</h4>
    <div class="row">
      <div class="col-4 after-divider" v-for="item in item.logs" :key="item.action">
        <div>{{ Constant.ORDER_STORE_LOG('enum')[item.action] || item.action || '-' }}</div>
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

  .w-100 {
    min-width: 150px;
  }

  .after-divider + .after-divider {
    position: relative;

    &::after {
      position: absolute;
      left: -130px;
      top: 8px;
      display: inline-block;
      content: '';
      background-color: #ddd;
      height: 1px;
      width: 110px;
    }
  }

</style>
