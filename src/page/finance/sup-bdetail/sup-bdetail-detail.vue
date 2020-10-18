<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">
    <h4 class="mt-10">流水信息</h4>
    <div class="row">
      <div class="col-6">供应商：{{ item.supplier.title }}</div>
      <div
        class="col-6"
      >流水类型：{{ Constant.FINANCIAL_SUP_BDETAIL_BILLREASON('enum')[item.bill_reason] }}</div>
    </div>

    <!--手动新增没有商品-->
    <template
      v-if="item.bill_reason !== 'other' && item.bill_reason !== 'item_damage' && item.bill_reason !== 'commission_dedup'"
    >
      <div class="row">
        <div class="col-6">流水区域：{{ item.province_title || '-' }}</div>
        <div
          class="col-6"
        >采购单号：{{ item.purchase_code || '-' }}</div>
      </div>
      <template v-if="item.bill_reason === 'local_buy' || item.bill_reason === 'distribution'">
        <div class="row">
          <div class="col-6">商品编号/名称：{{ item.item_code }}/{{item.item_title}}</div>
          
        </div>
        <div class="row">
          <div class="col-6">采购日期：{{ item.order_date }}</div>
          <div class="col-6">采购价：{{ `￥${Handle.returnPrice(item.item_price_buy)}` || '-' }}</div>
        </div>
        <div class="row">
          <div class="col-6">采购数量：{{item.num ? item.num + '件' : '-'}}</div>
          <div class="col-6">收货数量：{{item.num_in ? item.num_in + '件' : '-'}}</div>
        </div>
        <div class="row">
          <div
            class="col-6"
          >收货商品金额：{{item.item_total_price ? '¥' + Handle.returnPrice(item.item_total_price) : '-'}}</div>
          <div
            class="col-6"
          >筐总金额：{{item.frame_price ? '¥' + Handle.returnPrice(item.frame_price) : '-'}}</div>
        </div>
        <div class="row">  
          <div class="col-6">
            总金额：
            <span
              class="text-warning"
              v-if="item.bill_amount > 0"
            >{{`￥${Handle.returnPrice(item.bill_amount)}`}}</span>
            <span
              class="text-success"
              v-else-if="item.bill_amount < 0"
            >{{`-￥${Handle.returnPrice(Math.abs(item.bill_amount))}`}}</span>
            <span v-else>-</span>
          </div>
        </div>
      </template>
      <template v-if="item.bill_reason == 'refund'">
        <div class="row">
          <div class="col-6">商品编号/名称：{{ item.item_code }}/{{item.item_title}}</div>
          <div class="col-6">采购价：{{ `￥${Handle.returnPrice(item.item_price_buy)}` || '-' }}</div>
        </div>
        <div class="row">
          <div class="col-6">采购数量：{{item.num ? item.num + '件' : '-'}}</div>
          <div class="col-6">
            总金额：
            <span
              class="text-warning"
              v-if="item.bill_amount > 0"
            >{{`￥${Handle.returnPrice(item.bill_amount)}`}}</span>
            <span
              class="text-success"
              v-else-if="item.bill_amount < 0"
            >{{`-￥${Handle.returnPrice(Math.abs(item.bill_amount))}`}}</span>
            <span v-else>-</span>
          </div>
        </div>
      </template>
    </template>
    <div class="row">
      <div class="col-12 text-wrap">备注：{{item.remark || '-'}}</div>
    </div>
    <h4 class="mt-10">操作记录</h4>
    <div class="row">
      <div class="col-6">创建人：{{item.creator && item.creator.realname || '系统'}}</div>
      <div class="col-6">创建时间：{{item.creator && item.creator.created || item.created || '-'}}</div>
    </div>
    <div class="row" v-if="item.auditor && item.auditor.id">
      <div class="col-6">审核人：{{item.auditor && item.auditor.realname || '-'}}</div>
      <div class="col-6">审核时间：{{item.audit_time || '-'}}</div>
    </div>
    <div class="row" v-if="item.auditor && item.auditor.id">
      <div class="col-6">审核备注：{{item.audit_remark || '-'}}</div>
    </div>
  </div>
</template>

<script>
import { Handle, Constant } from "@/util";
export default {
  name: "sup-bdetail-detail",
  inject: ["app"],
  props: {
    item: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      list: {
        items: []
      },
      query: {}
    };
  },
  created() {
    this.Constant = Constant;
    this.Handle = Handle;
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
</style>
