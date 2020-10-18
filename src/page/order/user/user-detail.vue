<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">
    <h4 class="mt-10">订单信息</h4>
    <div class="row">
      <div class="col-3">下单时间：{{ item.created }}</div>
      <div class="col-3">订单编号：{{ item.code }}</div>
      <div class="col-3">订单类型：{{ item.is_presale ? '预售订单' : '普通订单' }}</div>
      <div class="col-3">配送日期：{{ item.delivery_date || '-' }}</div>
    </div>

    <h4 class="mt-20">收货地址</h4>
    <div class="row">
      <div class="col-3">县域：{{ item.city_title || '-' }}</div>
      <div class="col-3">门店名称：{{ item.store_title || '-' }}</div>
    </div>
    <div class="row">
      <div class="col-3">会员等级：{{ item.vip_title || '-' }}</div>
      <div class="col-3">收件人：{{item.linkman}} {{item.phone ? '(' + item.phone + ')' : '' }}</div>
      <div class="col-6">收件地址：{{ item.address || '-' }}</div>
    </div>

    <h4 class="mt-20">商品信息</h4>
    <pg-table
      :data="item.items"
      primary-key="item_code"
      :highlight-row="false"
      borderless
      placeholder="商品信息为空..."
    >
      <template v-slot:expand-row="{row}">
        <div class="p-15">
          <div class="row">
            <div class="col-6">
              商品参数：
              <span v-for="(item, index) in row.item_attrs" :key="index">
                {{item}}
                <span v-if="index < (row.item_attrs.length - 1)">、</span>
              </span>
            </div>
          </div>
        </div>
      </template>
      <pg-column title="商品图" width="70">
        <template v-slot="{row}">
          <img
            class="cursor-pointer"
            :src="cos_tenctent_path + row.item_image"
            width="48"
            height="48"
            v-preview="row.item_image"
          />
        </template>
      </pg-column>
      <pg-column title="商品编号/名称" width="100">
        <template v-slot="{row}">
          <div class="text-wrap">{{ row.item_code }} / {{ row.item_title }}</div>
        </template>
      </pg-column>
      <pg-column title="筐" width="70px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.frame_price">¥{{ Handle.returnPrice(row.frame_price) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="销售类型" width="70px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.sale_type" class="overflow-ellipsis">{{ row.sale_type }}{{row.is_gift ? '-赠品' : '' }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="销售原价" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.item_price_sale">¥{{ Handle.returnPrice(row.item_price_sale)}}/件</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="实际售价" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.final_price">¥{{ Handle.returnPrice(row.final_price) }}/件</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="运费单价" width="80px" text-align="center">
        <template v-slot="{row}">
          <span
            v-if="!!row.final_delivery_price"
          >¥{{ Handle.returnPrice(row.final_delivery_price) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="件数" width="100px" text-align="center">
        <template v-slot="{row}">
          <div class="list-unstyled text-wrap">
              <span>{{ row.count_pre }}件</span>
              <span v-if="row.count_real !== row.count_pre">-></span>
            <template v-if="row.count_real !== row.count_pre">
                <span
                  :class="row.count_real > row.count_pre ? 'red' : 'green'"
                >{{ row.count_real }}件</span>
            </template>
          </div>
        </template>
      </pg-column>
      <pg-column title="商品金额" width="80px" text-align="center">
        <template v-slot="{row}">
          <span
            v-if="!!row.item_price_sale && !!row.count_pre && !row.is_gift"
          >¥{{ Handle.returnPrice(row.item_price_sale * row.count_pre) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="商品实付" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.final_price && !!row.count_real && !row.is_gift">¥{{ Handle.returnPrice(row.final_price * row.count_real) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="运费实付" width="70px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.final_delivery_price && !!row.count_real">¥{{ Handle.returnPrice(row.final_delivery_price * row.count_real) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="小计" width="80px" text-align="center">
        <template v-slot="{row}">
          <div>
            <span v-if="row.final_price && !row.is_gift">&yen;{{ Handle.returnPrice(row.final_price * row.count_real + row.final_delivery_price * row.count_real) }}</span>
            <span v-else>-</span>
          </div>
        </template>
      </pg-column>
      <pg-column title="售后详情" width="80px" text-align="center">
        <template v-slot="{row}">
          <!-- 如果存在售后情况，判断是否已完成，如果未完成，则提示用户查看售后详情 -->
          <div v-if="row.aftersale">
            <!-- 有售后单的情况下，如果是已经完成，则直接显示已完成即可 -->
            <span v-if="row.aftersale.status === 'close'">已完成</span>
            <span v-else-if="row.aftersale.status === 'handling'">处理中</span>
            <span v-else>待处理</span><br/>
            <a
              class="operator"
              @click="orderShowHideAfterSaleDetail(row.aftersale.id)"
              v-if="(app.auth.isAdmin || app.auth.OrderAfterSaleDetail) && item.ori_com !== 'after-sale'"
            >{{row.aftersale.status === 'waiting_dispose' || row.aftersale.status === 'handling' ? '查看进度':'查看详情'}}</a>
          </div>
          <div v-else>-</div>
        </template>
      </pg-column>
    </pg-table>
    <div class="row mt-10">
      <div class="col-2">
        商品金额:
        <span v-if="item.item_total_price">¥{{ Handle.returnPrice(item.item_total_price) }}</span>
        <span v-else>-</span>
        <ul class="secondary" style="margin-left:-10px;">
          <li>自营商品总计：
            <span v-if="detail.amount_zy">¥{{Handle.returnPrice(detail.amount_zy)}}</span>
            <span v-else>-</span>
          </li>
          <li>平台商品总计：
            <span v-if="detail.amount_pt">¥{{Handle.returnPrice(detail.amount_pt)}}</span>
            <span v-else>-</span>
          </li>
        </ul>
      </div>
      <div class="col-2">
        运费总计:
        <span v-if="item.delivery_fee || item.delivery_disfee">¥{{ Handle.returnPrice(item.delivery_fee + item.delivery_disfee) }}</span>
        <span v-else>-</span>
      </div>
      <div class="col-2">
        筐金额:
        <span v-if="item.fram_total_price">¥{{ Handle.returnPrice(item.fram_total_price) }}</span>
        <span v-else>-</span>
      </div>
      <div class="col-2">
        订单总额:
        <span v-if="item.item_total_price">¥{{ Handle.returnPrice(item.delivery_fee+ item.delivery_disfee+item.item_total_price + item.fram_total_price) }}</span>
        <span v-else>-</span>
      </div>
      <div class="col-2" style="margin-left:-10px;">
        优惠金额:
        <span v-if="item.coupon_reduction || item.delivery_disfee || item.promotion_reduction">-¥{{ Handle.returnPrice(item.coupon_reduction + item.delivery_disfee + item.promotion_reduction) }}</span>
        <span v-else>-</span>
        <ul class="secondary">
          <li>商品优惠券：
            <span v-if="item.coupon_reduction">¥{{Handle.returnPrice(item.coupon_reduction)}}</span>
            <span v-else>-</span>
          </li>
          <li>运费优惠券：
            <span v-if="item.delivery_disfee">¥{{Handle.returnPrice(item.delivery_disfee)}}</span>
            <span v-else>-</span>
          </li>
          <li>全场满折/减：
            <span v-if="item.promotion_reduction">¥{{Handle.returnPrice(item.promotion_reduction)}}</span>
            <span v-else>-</span>
          </li>
        </ul>
      </div>
      
      <div class="col-2">
        订单实收:
        <span v-if="item.order_price">¥{{ Handle.returnPrice(item.order_price) }}</span>
        <span v-else>-</span>
      </div>
    </div>

    <h4 class="mt-20">付款记录</h4>
    <pg-table
      :data="item.pay_record"
      :serialable="false"
      :highlight-row="false"
      primary-key="code"
      borderless
      placeholder="暂无付款记录..."
    >
      <pg-column title="发起时间" prop="created"></pg-column>
      <pg-column title="完成时间" prop="updated"></pg-column>
      <pg-column title="付款编号" prop="code"></pg-column>
      <pg-column title="支付总金额" prop="total_fee">
        <template v-slot="{row}">
          <span v-if="row.total_fee">¥{{ Handle.returnPrice(row.total_fee) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="余额支付">
        <template v-slot="{row}">
          <span v-if="row.balance_fee">¥{{ Handle.returnPrice(row.balance_fee) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="第三方支付">
        <template v-slot="{row}">
          <span v-if="row.pay_fee">¥{{ Handle.returnPrice(row.pay_fee) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="状态">
        <template v-slot="{row}">
          <span v-if="row.status === 'success'">成功</span>
          <span v-else>失败</span>
        </template>
      </pg-column>
    </pg-table>

    <h4 class="mt-20">退款记录</h4>
    <pg-table
      :data="item.refund_record ? item.refund_record : []"
      :serialable="false"
      :highlight-row="false"
      primary-key="id"
      borderless
      placeholder="暂无退款记录..."
    >
      <pg-column title="退款时间" prop="created"></pg-column>
      <pg-column title="订单总金额" prop="amount_order">
        <template v-slot="{row}">
          <span v-if="row.amount_order">¥{{ Handle.returnPrice(row.amount_order) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="退款前订单支付金额" prop="amount_pay_pre">
        <template v-slot="{row}">
          <span v-if="row.amount_pay_pre">¥{{ Handle.returnPrice(row.amount_pay_pre) }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
      <pg-column title="退款方式" prop="amount">
        <template>
          <span>账户余额</span>
        </template>
      </pg-column>
      <pg-column title="退款原因" prop="reason">
        <template v-slot="{row}">
          <span
            v-if="row.reason"
          >{{ Constant.ORDER_USER_REFUND_RECORD_REASON('enum')[row.reason] || '-' }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>
    </pg-table>

    <h4 class="mt-20">订单日志</h4>
    <div class="row">
      <div class="col-2 after-divider" v-for="v in item.action_log" :key="v.action">
        <div>{{ Constant.ORDER_USER_LOG('enum')[v.action] || v.action || '-' }}</div>
        <span class="text-secondary">{{ v.created }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import { Http, Api, Handle, Constant } from '@/util'

import pgyos from '@/pgyos.entry';
export default {
  name: 'user-detail',
  inject: ['app','user'],
  props: {
    item: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data(){
    return {
      drawer: {
        visible: false,
        type: '',
        item: {},
      },
      detail: {}
    }
  },
  computed: {
    cos_tenctent_path() {
      return pgyos.osConfig().cos_tenctent_path
    },
  },
  created() {
    this.Handle = Handle
    this.Constant = Constant
    const item = {...this.$props.item};
    const refund_record = [...this.$props.item.refund_record]
    this.$props.item.refund_record = [...refund_record]
    item.amount_pt = 0;
    item.amount_zy = 0;
    item.items.forEach(v => {
      if(v.sale_type == '平台' && !v.is_gift){
        item.amount_pt += v.item_price_sale * v.count_pre 
      }else if(v.sale_type == '自营' && !v.is_gift){
        item.amount_zy += v.item_price_sale * v.count_pre 
      }
    });
    this.$data.detail = item
  },
  methods:{
    orderShowHideAfterSaleDetail(id) {
      Http.post(Api.orderAftersaleDetail, { id: id }).then((res) => {
        let rd = {...res.data};
        rd.ori_com = 'user-detail';//追踪组件数据来源标识
        this.user.$data.drawer_inner = { visible: true, type: 'after-sale', item: rd || {} }
      })
    }
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
