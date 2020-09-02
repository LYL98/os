<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">
    <div class="row mt-10">
      <div class="col-5">提现单号：{{ item.code || '-' }}</div>
      <div class="col-7">提现金额：{{ !!item.amount ? '¥' : '' }}{{ Handle.returnPrice(item.amount) }}</div>
    </div>
    <div class="row mt-10">
      <div class="col-5"><span class="letter-spacing-10">申请人</span>：{{ item.realname || '-' }}</div>
      <div class="col-7">申请时间：{{ item.created || '-' }}</div>
    </div>
    <div class="row mt-10">
      <div class="col-5">转账银行：{{ item.bank_acc || '-' }}</div>
      <div class="col-7">银行卡号：{{ item.acc_card_no || '-' }}</div>
    </div>
    <div class="row mt-10">
      <div class="col-12">所属门店：{{ item.store && item.store.title || '-' }}</div>
    </div>
    <div class="row mt-10" v-if="item.status !== 'init'">
      <div class="col-12">审核备注：{{ item.remark || '-' }}</div>
    </div>
  </div>
</template>

<script>

  import { Handle, Constant } from '@/util';

  export default {
    name: 'store-withdraw-detail',
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
  .letter-spacing-10 {
    letter-spacing: 4px;
  }
</style>
