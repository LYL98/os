<template>
  <div>

    <h3 class="mb-20">基础信息</h3>

    <div class="row no-gutters">
      <div class="col-4">活动名称：{{ item.title }}</div>
      <div class="col-4">活动日期：{{ item.act_date }}</div>
      <div class="col-4">起止时间：{{ item.begin_time }} ~ {{ item.end_time }}</div>
    </div>

    <h3 class="mt-20">活动商品</h3>
    <pg-table
      :data="item.items"
      primary-key="id"
      :highlight-row="false"
      borderless
      :serialable="false"
      :height="app.windowHeight - 260 + 'px'"
    >
      <pg-column title="商品编号/名称" prop="title" width="300px">
        <template v-slot="{row}">
          {{ row.code }} / {{ row.title }}
        </template>
      </pg-column>
      <pg-column title="原价" prop="price_origin" width="90px" text-align="center">
        <template v-slot="{row}">
          ¥{{ Handle.returnPrice(row.price_origin) }}
        </template>
      </pg-column>
      <pg-column title="活动价" prop="act_price" width="90px" text-align="center">
        <template v-slot="{row}">
          {{ row.act_price ? `¥${Handle.returnPrice(row.act_price)}` : '-' }}
        </template>
      </pg-column>
      <pg-column title="返利金额" prop="title" width="90px" text-align="center">
        <template v-slot="{row}">
          {{ row.cash_back ? `¥${Handle.returnPrice(row.cash_back)}` : '-' }}
        </template>
      </pg-column>
      <pg-column title="活动库存" prop="act_stock" width="90px" text-align="center"></pg-column>
      <pg-column title="客户限购数" prop="title" width="90px" text-align="center">
        <template v-slot="{row}">
          {{ row.purchase_limit || '-' }}
        </template>
      </pg-column>
    </pg-table>

  </div>

</template>
<script>

  import { Handle } from '@/util';

  export default {
    name: 'seckill-detail',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {}
    },

    created() {
      this.Handle = Handle;
    },

  }
</script>

<style lang="scss" scoped>

</style>
