<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">
    <h4 class="mt-10">基础信息</h4>
    <div class="row">
      <div class="col-4">售后申请时间：{{ item.created || '-' }}</div>
      <div class="col-4">客户手机号码：{{ item.phone || '-' }}</div>
      <div class="col-4">客户昵称：{{ item.nickname || '-' }}</div>
    </div>
    <div class="row mt-10">
      <div class="col-4">售后单单号：{{item.code || '-' }}</div>
      <div class="col-4">关联零售单号：{{ item.order_code || '-' }}</div>
      <div class="col-4">下单时间：{{ item.order_time || '-' }}</div>
    </div>
    <div class="row mt-10">
      <div class="col-4">提货时间：{{ item.picked_time || '-' }}</div>
      <div class="col-4">提货门店：{{ item.store_title || '-' }}</div>
      <div class="col-4">门店县域：{{ item.city || '-' }}</div>
    </div>
    <div class="row mt-10">
      <div class="col-4">是否退货：{{ item.is_restore ?  '是' : '否' }}</div>
      <div class="col-4" v-if="item.reason == 'quality'">退货原因：质量有问题</div>
      <div class="col-4" v-if="item.reason == 'unreceived'">退货原因：未收到</div>
      <div class="col-4" v-if="item.reason == 'discrepancy'">退货原因：实物与描述不符</div>
      <div class="col-4" v-if="item.reason == 'mistake'">退货原因：仓库发错货</div>
    </div>

    <h4 class="mt-20">售后商品信息</h4>
    <div class="row mt-10">
      <div class="col-8">售后商品：{{ item.item_title || '-' }}</div>
      <div class="col-4">售后数量：{{ item.aftersale_num || '-' }}</div>
    </div>

    <div class="row mt-10">
      <div class="col-4">售后比例：{{ `${Handle.returnPrice(item.percent)}%`|| '-' }}</div>
      <div class="col-4">售后金额：{{ `¥${Handle.returnPrice(item.aftersale_amount)}` || '-' }}</div>
    </div>

    <div class="row mt-10">
      <div class="col-12">
        问题描述：<span v-if="item.reason_type == 'other' && item.reason == 'mistake'">仓库发错货</span>
        <span v-if="item.reason_type == 'unreceived'">未收到</span>
        <span v-if="item.reason_type == 'other' && item.reason == 'discrepancy'">实物与描述不符</span>
        <span v-if="item.reason_type == 'other' && item.reason == 'quality'">质量有问题</span>
        <span v-if="item.reason_type == ''">-</span>
        <div class="ml-50 col-8 text-secondary">{{ item.desc || '-' }}</div>
      </div>
    </div>

    <div class="row mt-20 no-gutters">
      <div class="col-9">
        <span class="mr-30">图片:</span>
        <img class="cursor-pointer mr-10" :src="cos_tenctent_path + item" width="64" height="64" alt="" v-for="item in item.item_image" :key="item" v-preview.list="formData.item_image"/>
      </div>
    </div>

    <h4 class="mt-20">原商品信息</h4>
    <pg-table
      :data="[item.origin_item]"
      primary-key="item_code"
      :highlight-row="false"
      borderless
      placeholder="原商品信息为空..."
    >
      <pg-column title="购买数量" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.num">{{ row.num || '-' }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>

      <pg-column title="商品单价" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.item_price_sale">¥{{ Handle.returnPrice(row.item_price_sale) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>

      <pg-column title="商品金额" width="80px" text-align="center">
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
      <div class="col-4 after-divider" v-for="item in item.progress" :key="item.status">
        <div>{{ Constant.AFTER_SALE_LOG('enum')[item.status] || item.status || '-' }}</div>
        <div class="text-secondary" v-if="item.status == 'wait_restore'">{{ item.detail && (item.detail.operator) }} 审核通过，待退回门店</div>
        <div class="text-secondary" v-if="item.status == 'rejected'">拒绝原因：{{ item.detail && item.detail.reason || '-'}}</div>
        <div class="text-secondary" v-if="item.status == 'repealed'">用户主动撤消售后申请</div>
        <div class="text-secondary" v-if="item.status == 'refunding'">门店已确认，已发起退款</div>
        <div class="text-secondary" v-if="item.status == 'closed'">已超过48h的退货时间，售后单自动关闭</div>
        <span class="text-secondary">{{ item.created }}</span>
      </div>
    </div>
  </div>
</template>

<script>

  import { Handle, Constant } from '@/util';
  import pgyos from '@/pgyos.entry';
  export default {
    name: 'user-detail',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } }
    },
    data() {
      return {
        formData: {

        }
      }
    },
    computed: {
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      }
    },
    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      const formData = { ...this.$props.item };
      formData.aftersale_amount = Handle.returnPrice(formData.aftersale_amount);
      this.$data.formData = formData;
    },
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
