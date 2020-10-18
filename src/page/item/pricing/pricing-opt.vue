<template>
  <div>
    <pg-form ref="form" class="px-20" label-width="90px" item-width="240px" :disabled="type === 'detail'">
      <h4 class="mt-20">商品报价</h4>
      <div class="p-10 mb-20">
        <pg-form-item label="商品编号/名称" item-width="800px">
          <div style="padding-top: 5px;">
            {{item.code}}/{{item.title}}
            <span class="is-presale" v-if="item.is_presale">预</span>
          </div>
        </pg-form-item>
        <div class="row no-gutters">
          <div class="col-5">
            <pg-form-item
              label="总库存"
              :rules="{
                  'required': true,
                  'min_value:1': true
                }"
            >
              <pg-input
                type="number"
                :disabled="!item.is_presale"
                v-model.number="item.available_num"
                suffix="件"
              ></pg-input>
            </pg-form-item>
          </div>
          <div class="col-5">
            <pg-form-item
              label="今日销售价"
              :rules="{
                  'required': true,
                  'min_value:0.01': true
                }"
            >
              <pg-input
                type="decimal"
                v-model="item.price_sale"
                :placeholder="'建议：' + returnSuggestPrice(item)"
                suffix="元"
              />
            </pg-form-item>
          </div>
          <div class="col-2">
            <!--已报过价-->
            <template
              v-if="optDate === today && (type === 'edit' || type === 'detail') && (app.auth.isAdmin || app.auth.ItemPriceFix) && (item.available_num > 0 || item.is_presale)"
            >
              <pg-button @click="showHideEdit('edit')" v-if="type === 'detail'">修改</pg-button>
              <template v-else>
                <pg-button color="primary" :loading="loading" @click="onSubmit" :disabled="loading">确认</pg-button>
                <pg-button class="ml-10" @click="showHideEdit('detail')">取消</pg-button>
              </template>
            </template>
            <!--未报过价-->
            <template v-else>
              <pg-confirm @confirm="onSubmit" :help-text="confirmStr">
                <pg-button color="primary" :loading="loading" :disabled="loading">确认</pg-button>
              </pg-confirm>
              <pg-button class="ml-10" @click="onCancel">取消</pg-button>
            </template>
          </div>
        </div>
      </div>

      <h4 class="mt-20">报价参考信息</h4>
      <div class="p-10 mb-20" style="background-color: #f2f2f2;">
        <div class="row">
          <div class="col-4 mb-5">
            <span class="d-inline-block w-25">今日供货价:</span>
            {{item.price_buy ? '￥' + Handle.returnPrice(item.price_buy) : '-'}}
          </div>
          <div class="col-4 mb-5">
            <span class="d-inline-block w-25">今日建议价:</span>
            {{returnSuggestPrice(item)}}
          </div>
          <div class="col-4 mb-5">
            <span class="d-inline-block w-25">今日加价率:</span>
            {{returnRate(item.price_buy, Handle.handlePrice(item.price_sale))}}
          </div>
          <div class="col-4">
            <span class="d-inline-block w-25">昨日供货价:</span>
            {{item.price_buy_last ? '￥' + Handle.returnPrice(item.price_buy_last) : '-'}}
          </div>
          <div class="col-4">
            <span class="d-inline-block w-25">昨日销售价:</span>
            {{item.price_sale_last ? '￥' + Handle.returnPrice(item.price_sale_last) : '-'}}
          </div>
          <div class="col-4">
            <span class="d-inline-block w-25">昨日销量:</span>
            {{item.sale_num_last ? item.sale_num_last + '件' : '-'}}
          </div>
        </div>
      </div>

      <template v-if="priceData.stocks.length > 0">
        <h4 class="mt-20">仓库信息</h4>
        <pg-table :data="priceData.stocks" primary-key="batch_code" borderless class="mb-20">
          <pg-column title="批次">
            <template v-slot="{row}">{{row.batch_code}}</template>
          </pg-column>
          <pg-column title="采购价" width="240">
            <template v-slot="{row}">&yen;{{Handle.returnPrice(row.price)}}</template>
          </pg-column>
          <pg-column title="库存" width="160">
            <template v-slot="{row}">{{row.num ? row.num + '件' : '-'}}</template>
          </pg-column>
        </pg-table>
      </template>

      <template v-if="priceData.accept_stocks.length > 0">
        <h4 class="mt-20">场地信息</h4>
        <pg-table :data="priceData.accept_stocks" primary-key="id" borderless class="mb-20">
          <pg-column title="批次">
            <template v-slot="{row}">{{row.batch_code}}</template>
          </pg-column>
          <pg-column title="采购价" width="240">
            <template v-slot="{row}">&yen;{{Handle.returnPrice(row.price_buy)}}</template>
          </pg-column>
          <pg-column title="库存" width="160">
            <template v-slot="{row}">{{row.num ? row.num + '件' : '-'}}</template>
          </pg-column>
        </pg-table>
      </template>

      <template v-if="priceData.distributes.length > 0">
        <h4 class="mt-20">调拨信息</h4>
        <pg-table :data="priceData.distributes" primary-key="id" borderless class="mb-20">
          <pg-column title="调拨单号">
            <template v-slot="{row}">{{row.batch_code}}</template>
          </pg-column>
          <pg-column title="采购价" width="140">
            <template v-slot="{row}">&yen;{{Handle.returnPrice(row.price)}}</template>
          </pg-column>
          <pg-column title="调拨数量" width="140">
            <template v-slot="{row}">{{row.num ? row.num + '件' : '-'}}</template>
          </pg-column>
          <pg-column title="发车时间" width="160">
            <template v-slot="{row}">{{row.created}}</template>
          </pg-column>
        </pg-table>
      </template>

      <template v-if="priceData.p_orders.length > 0">
        <h4 class="mt-20">采购信息</h4>
        <pg-table :data="priceData.p_orders" primary-key="id" borderless class="mb-20">
          <pg-column title="采购单号">
            <template v-slot="{row}">{{row.code}}</template>
          </pg-column>
          <pg-column title="采购价" width="140">
            <template v-slot="{row}">&yen;{{Handle.returnPrice(row.price_buy)}}</template>
          </pg-column>
          <pg-column title="采购数量" width="140">
            <template v-slot="{row}">{{row.num ? row.num + '件' : '-'}}</template>
          </pg-column>
          <pg-column title="待收货数量" width="140">
            <template
              v-slot="{row}"
            >{{row.num - row.num_in_stock ? `${row.num - row.num_in_stock}件` : '-'}}</template>
          </pg-column>
          <pg-column title="创建时间" width="160">
            <template v-slot="{row}">{{row.created}}</template>
          </pg-column>
        </pg-table>
      </template>

      <template v-if="priceData.biddings.length > 0">
        <h4 class="mt-20">反采供应商信息</h4>
        <pg-table :data="priceData.biddings" primary-key="id" borderless class="mb-20">
          <pg-column title="供应商名称">
            <template v-slot="{row}">{{row.title}}</template>
          </pg-column>
          <pg-column title="供应商报价">
            <template
              v-slot="{row}"
            >{{row.bidding.price ? '￥' + Handle.returnPrice(row.bidding.price) : '-'}}</template>
          </pg-column>
          <pg-column title="供应商库存">
            <template v-slot="{row}">{{row.bidding.num ? row.bidding.num + '件' : '-'}}</template>
          </pg-column>
          <pg-column title="供应商报价时间" width="160">
            <template v-slot="{row}">{{row.bidding.created || '-'}}</template>
          </pg-column>
        </pg-table>
      </template>
    </pg-form>
  </div>
</template>

<script>
import { Http, Api, Handle } from "@/util";

export default {
  name: "pricing-opt",
  inject: ["app"],
  props: {
    type: { type: String, default: "" },
    provinceCode: { type: String, default: "" },
    optDate: { type: String, default: "" },
    item: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    let today = Handle.formatDate(new Date(), "yyyy-MM-dd");
    return {
      today: today,
      loading: false,
      priceData: {
        stocks: [],
        accept_stocks: [],
        distributes: [],
        p_orders: [],
        biddings: [],
      },
      confirmStr: ""
    };
  },
  created() {
    this.Handle = Handle;
    let priceSale = "";
    if(this.$props.item.price_sale){
      priceSale = Handle.returnPrice(this.$props.item.price_sale);
    }
    this.$props.item.price_sale = priceSale;
    this.$props.item.price_sale_temp = priceSale; //修改时用到
    this.itemPriceDetail();
  },
  methods: {
    //详情时修改报价
    showHideEdit(type) {
      this.$props.type = type;
      if (type === "detail") {
        this.$props.item.price_sale = this.$props.item.price_sale_temp;
      }
    },
    //获取供应商列表
    itemPriceDetail() {
      let { item, optDate } = this.$props;
      this.$loading.show();
      Http.get(Api.itemPriceDetail, {
        item_id: item.item_id,
        opt_date: optDate,
      })
        .then((res) => {
          this.$loading.hide();
          this.$data.priceData = res.data;
          this.$props.item.price_buy = res.data.price_buy; //今日供价

          //报价提示
          let str = '反采供应商尚未报价，确认报价后供应商将不可报价，是否确认报价';
          if(res.data.biddings.length > 0){
            str = '确认报价后，供应商的报价将不可更改，系统将根据该价格直接下单采购';
          }
          //预售
          if(item.is_presale){
            str = '是否确认报价';
          }
          this.$data.confirmStr = str;
        })
        .catch(() => {
          this.$loading.hide();
        });
    },
    onSubmit() {
      this.$refs["form"].validateAll().then((valid) => {
        if (!valid) return;
        this.$data.loading = true;
        let { item, provinceCode, type } = this.$props;
        Http.post(Api.itemPriceFix, {
          province_code: provinceCode,
          item_id: item.item_id,
          price_sale: Handle.handlePrice(item.price_sale),
          available_num: item.available_num, //预售商品传available_num可改库存
        })
          .then(() => {
            this.$toast({
              type: "success",
              message: type === "add" ? "报价成功" : "报价修改成功",
            });
            this.$data.loading = false;
            if (type === "edit") {
              this.$props.type = "detail";
            }
            this.$emit("submit");
          })
          .catch(() => {
            this.$data.loading = false;
          });
      });
    },

    onCancel() {
      this.$emit("cancel");
    },

    //返回今日加价率(询价，销售价)
    returnRate(p1, p2) {
      if (!p1 || !p2) return "-";
      //传的数值：如10.3 传 103
      return this.returnMarkup((p2 / p1 - 1) * 1000) + " %";
    },
    //返回加价率
    returnMarkup(data) {
      if (!data) return 0;
      let v = data / 10;
      let p = v.toFixed(1);
      if (p.substring(p.length - 2, p.length) === ".0") {
        return p.substring(0, p.length - 2);
      }
      return p;
    },
    //返回建议价(今日询价，今日加价率)
    returnSuggestPrice(item) {
      let fun = (priceBuy, markupRate) => {
        let v = priceBuy * (1 + markupRate / 1000);
        let p = parseInt(v);
        return p; //返回分
      };
      let min = fun(item.price_buy, item.rise_min);
      let max = fun(item.price_buy, item.rise_max);
      if (min === 0 && max === 0) return "-";
      return `￥ ${Handle.returnPrice(min)} - ￥ ${Handle.returnPrice(max)}`;
    },
  },
};
</script>
<style lang="scss" scoped>
.is-presale {
  position: relative;
  top: -1px;
  background-color: #ff5252;
  color: #fff;
  padding: 0 2px;
  border-radius: 3px;
  font-size: 12px;
  height: 16px;
  line-height: 16px;
}
</style>
