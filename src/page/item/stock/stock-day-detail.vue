<template>
<!-- :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`" -->
  <div >
    <div>
      <!-- <h4 class="mt-10">调拨信息</h4> -->
      <div class="row" style="background-color: #f2f2f2;padding: 10px;" >
        <div class="col-6">商品编号/名称: {{ detail.item_code}} / {{detail.item_title }}</div>
        <div class="col-6">总库存: {{ detail.total_stock_num ? detail.total_stock_num + '件' : '-' }}</div>
      </div>
       
    </div>

    <div >
      <h4 class="mt-20">仓库信息</h4>
      <pg-table
          :data="detail.stocks"
          primary-key="batch_code"
          borderless
         >
            <pg-column title="批次">
                <template v-slot="{row}"> {{ row.batch_code || '-' }}</template>
            </pg-column>
            <pg-column title="采购价">
                <template v-slot="{row}"> {{ !!row.price_buy ? '¥' : '' }} {{ Handle.returnPrice(row.price_buy) || '-' }}</template>
            </pg-column>
            <pg-column title="库存">
                <template v-slot="{row}"> {{ row.num ? row.num + '件' : '-' }}</template>
            </pg-column>
      </pg-table>
      
    </div>
    <div >
      <h4 class="mt-20">场地信息</h4>
      <pg-table
        fixed-header
          :data="detail.accept_stocks"
          primary-key="batch_code"
          borderless
         >
             <pg-column title="批次">
                <template v-slot="{row}"> {{ row.batch_code || '-' }}</template>
            </pg-column>
            <pg-column title="采购价">
                <template v-slot="{row}"> {{ !!row.price_buy ? '¥' : '' }} {{ Handle.returnPrice(row.price_buy) || '-' }}</template>
            </pg-column>
            <pg-column title="库存">
                <template v-slot="{row}"> {{ row.num ? row.num + '件' : '-' }}</template>
            </pg-column>
            
      </pg-table>
    </div>
    <div >
      <h4 class="mt-20">采购信息</h4>
      <pg-table
        fixed-header
          :data="detail.p_orders"
          primary-key="code"
          borderless
         >
            <pg-column title="采购单号">
                <template v-slot="{row}"> {{ row.code || '-'}}</template>
            </pg-column>
            <pg-column title="采购价">
                <template v-slot="{row}"> {{ !!row.price_buy ? '¥' : '' }} {{ Handle.returnPrice(row.price_buy) || '-' }}</template>
            </pg-column>
            <pg-column title="采购数量">
                <template v-slot="{row}"> {{ row.num ? row.num + '件' : '-' }}</template>
            </pg-column>
            <pg-column title="待收货数量">
                <template v-slot="{row}"> {{ Number(row.num) - Number(row.num_in) ? (Number(row.num) - Number(row.num_in))+ '件' : '-' }}</template>
            </pg-column>
            <pg-column title="创建时间">
                <template v-slot="{row}"> 
                    <div class="pre">
                    {{ row.created || '-'}}
                    </div>
                </template>
            </pg-column>
      </pg-table>
    </div>
    <div >
      <h4 class="mt-20">供应商库存</h4>
      <pg-table
        fixed-header
          :data="detail.biddings"
          primary-key="supplier_title"
          borderless
         >
            <pg-column title="供应商名称">
                <template v-slot="{row}"> {{ row.supplier_title || '-'}}</template>
            </pg-column>
            <pg-column title="供应商报价">
                <template v-slot="{row}"> {{ !!row.price ? '¥' : '' }} {{ Handle.returnPrice(row.price) || '-' }}</template>
            </pg-column>
            <pg-column title="供应商库存">
                <template v-slot="{row}"> {{ row.num ? row.num + '件' : '-' }}</template>
            </pg-column>
            <pg-column title="供应商报价时间">
                <template v-slot="{row}"> 
                    <div class="pre">
                    {{ row.created || '-'}}
                    </div>
                </template>
            </pg-column>
      </pg-table>
    </div>

  </div>
</template>

<script>
  import {Constant, Handle,} from "@/util";

  export default {
    name: "stock-day-detail",
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
        detail: {},
        isShow: false,
        loading: false,
      };
    },
    created() {
      
      this.Constant = Constant;
      this.Handle = Handle

      if (this.$props.item) {
        const detail = this.$props.item;
        this.$data.detail = this.copyJson(detail);
      }
    },
    methods: {
      //深拷贝json
      copyJson(json) {
        return JSON.parse(JSON.stringify(json));
      },
    }
  };
</script>
<style lang="scss" scope>
    .status-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
     /*文本自动换行*/
.pre {
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
}
</style>