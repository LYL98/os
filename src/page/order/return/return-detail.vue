<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">
    <h4 class="mt-10">基础信息</h4>
    <div class="row">
      <div class="col-3">退货单号：{{ item.code }}</div>

      <div class="col-3" v-if="item.handle_way !== 'only_goods'">
        退款金额：
        <span style="color: #ff3724;">&yen;{{ Handle.returnPrice(item.refund_amount) }}</span>
      </div>
    </div>

    <h4 class="mt-20">退货信息</h4>
    <div class="row">
      <div class="col-6">商品编号/名称：{{ item.item_code }} / {{ item.item_title }}</div>
      <div class="col-3">售后单号：{{ item.aftersale_code || '-' }}</div>
      <div class="col-3">门店名称：{{ item.store_title || '-' }}</div>
    </div>

    <div class="row">
      <div class="col-6">县域：{{ item.city_title || '-' }}</div>
      <div
        class="col-3"
      >处理方式：{{ item.handle_way ? Constant.AFTER_SALE_HANDLE_WAY('enum')[item.handle_way] : '-'}}</div>
      <div class="col-3">退货数量：{{ item.back_num ? item.back_num + '件' : '-'}}</div>
    </div>

    <div class="row">
      <div class="col-6">退货描述：{{ item.reason || '-' }}</div>
      <div class="col-3">创建时间：{{ item.created || '-' }}</div>
      <div class="col-3">创建人：{{ item.create_name || '-' }}</div>
    </div>

    <h4 class="mt-20" v-if="item.status == 'pick' || item.status == 'finish'">收货信息</h4>
    <div v-if="item.status == 'pick' || item.status == 'finish'">
      <div class="row" v-if="item.status == 'pick' || item.status == 'finish'">
        <div class="col-6">取货司机：{{ item.take_driver_name }}</div>
        <div class="col-6">取货时间：{{ item.take_time || '-' }}</div>
      </div>
      <div class="row" v-if="item.status == 'finish'">
        <div class="col-6">收货人：{{ item.recv_name }}</div>
        <div class="col-6">收货时间：{{ item.done_time || '-' }}</div>
      </div>
      <div class="row" v-if="item.status == 'finish'">
        <div class="col-6">收货备注：{{ item.recv_desc || '-' }}</div>
      </div>
    </div>

    <h4 class="mt-20" v-if="item.status === 'close'">关闭信息</h4>
    <div v-if="item.status === 'close'">
      <div class="row">
        <div class="col-12">关闭原因：{{ item.close_reason }}</div>
      </div>
      <div class="row">
        <div class="col-6">操作人：{{ item.closer_name }}</div>
        <div class="col-6">关闭时间：{{ item.done_time || '-' }}</div>
      </div>
    </div>

    <h4 class="mt-20">订单日志</h4>
    <div class="row">
      <div class="col-3 after-divider" v-for="v in item.activities" :key="v.action">
        <div>{{ Constant.RETURN_GOODS_STATUS('enum')[v.content] || v.content || '-' }}</div>
        <span class="text-secondary">{{ v.timestamp }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Handle, Constant } from '@/util'
import pgyos from '@/pgyos.entry';
export default {
  name: 'user-detail',
  inject: ['app'],
  props: {
    item: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    cos_tenctent_path() {
      return pgyos.osConfig().cos_tenctent_path
    },
  },
  created() {
    this.Handle = Handle
    this.Constant = Constant
  },
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
