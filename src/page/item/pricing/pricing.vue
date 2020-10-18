<template>
  <div class="pg-page">
    <div class="p-20">
      <div class="d-flex">
        <pg-select v-model="query.province_code" @change="changeProvince">
          <pg-option
            v-for="item in provinceListAuth"
            :key="item.code"
            :value="item.code"
          >{{item.title}}</pg-option>
        </pg-select>
        <pg-datepicker
          class="ml-20"
          style="width: 200px"
          v-model="query.opt_date"
          @change="changeQuery"
          placeholder="日期"
        />
        <pg-button-group
          class="ml-20 min-width"
          v-model="query.is_presale"
          :options="{ '全部': '', '非预售': 0, '预售': 1 }"
          @change="changeQuery"
        />
        <pg-search
          class="w-25 ml-20"
          placeholder="商品编号、名称"
          clearable
          v-model="query.condition"
          @change="changeQuery"
        />
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
      </div>
      <div class="d-flex mt-10">
        <pg-cascader
          class="ml-0"
          :options="systemClassTree"
          v-model="query.system_class_code"
          @change="changeQuery"
          placeholder="按科学分类筛选"
          clearable
        />
        <pg-select
          v-model="query.buyer_id"
          searchable
          @search="commonBuyerList"
          style="width: 200px"
          class="ml-20"
          placeholder="采购员"
          clearable
          @change="changeQuery"
        >
          <pg-option
            v-for="item in buyerList"
            :key="item.id"
            :value="item.id"
          >{{`${item.realname} ${item.phone ? '('+item.phone+')':''}`}}</pg-option>
        </pg-select>
        <pg-input
          class="ml-20"
          suffix="%"
          type="decimal"
          v-model="query.markup_rate"
          placeholder="加价率低于"
          @keyup.enter.native="changeQuery"
        />
      </div>

      <div class="card mt-10">
        <div class="card-header font-weight-bolder position-relative">
          <pg-tabs v-model="query.status" @change="changeQuery">
            <pg-tab v-for="(item, label) in queryTabsData" :key="item" :index="item">{{label}}</pg-tab>
          </pg-tabs>
        </div>
        <div class="card-body">
          <pg-table
            fixed-header
            :data="list.items"
            primary-key="item_id"
            :page="query.page"
            :page-size="query.page_size"
            borderless
            checkable
            @selection="handleSelectionChange"
            :disabled-keys="disabledKeys"
          >
            <pg-column title="商品编号/名称">
              <template v-slot="{row}">
                <div class="pre">
                  {{ row.code }} / {{ row.title }}
                  <span class="is-presale" v-if="row.is_presale">预</span>
                </div>
              </template>
            </pg-column>
            <pg-column title="昨日销售价" width="100px">
              <template
                v-slot="{row}"
              >{{row.price_sale_last ? `&yen;&nbsp;${Handle.returnPrice(row.price_sale_last)}` : '-'}}</template>
            </pg-column>
            <!--昨日销量+排序-->
            <pg-column width="100px" prop="sale_num_last">
              <template v-slot="{row}">{{row.sale_num_last ? `${row.sale_num_last}&nbsp;件` : '-'}}</template>
            </pg-column>
            <template v-slot:sale_num_last>
                <div class="d-flex">
                      <div>昨日销量</div>
                      <pg-column-sort v-model="query.sort" asc="-sale_num_last" desc="sale_num_last"
                                @change="changeQuery"></pg-column-sort>
                  </div>
            </template>

            <pg-column title="今日供货价" width="100px">
              <template
                v-slot="{row}"
              >{{row.price_buy ? `&yen;&nbsp;${Handle.returnPrice(row.price_buy)}` : '-'}}</template>
            </pg-column>
            <pg-column title="今日建议价" width="140px">
              <template v-slot="{row}">{{returnSuggestPrice(row)}}</template>
            </pg-column>
            <pg-column title="今日加价率" width="100px">
              <template v-slot="{row}">{{returnRate(row.price_buy, row.price_sale)}}</template>
            </pg-column>
            <pg-column title="今日销售价" width="100px">
              <template v-slot="{row}">
                <span
                  :style="returnStyle(row)"
                >{{row.price_sale ? `&yen;&nbsp;${Handle.returnPrice(row.price_sale)}` : '-'}}</span>
              </template>
            </pg-column>
            <!--总库存+排序-->
            <pg-column width="100px" prop="available_num">
              <template v-slot="{row}">{{row.available_num ? `${row.available_num}&nbsp;件` : '-'}}</template>
            </pg-column>
            <template v-slot:available_num>
                <div class="d-flex">
                      <div>总库存</div>
                      <pg-column-sort v-model="query.sort" asc="-available_num" desc="available_num"
                                @change="changeQuery"></pg-column-sort>
                  </div>
            </template>
            
            <pg-column prop title="操作" width="86px">
              <template v-slot="{row}">
                <div>
                  <a
                    class="mr-10 text-decoration-none"
                    @click="handleDetailItem(row, 'add')"
                    v-if="(app.auth.isAdmin || app.auth.ItemPriceFix) &&
                      (row.available_num > 0 || row.is_presale) &&
                      query.opt_date === today && !row.is_quoted"
                  >报价</a>
                  <pg-confirm
                    @confirm="handleAuditItem([row])"
                    help-text="您确定通过审核?"
                    v-else-if="(!row.is_audited && row.is_quoted) && (app.auth.isAdmin || app.auth.ItemPriceAudit) && query.opt_date === today"
                  >
                    <a class="mr-10 text-decoration-none">审核</a>
                  </pg-confirm>
                  <a
                    class="mr-10 text-decoration-none"
                    @click="handleDetailItem(row, 'detail')"
                    v-if="(app.auth.isAdmin || app.auth.ItemPriceDetail) && row.is_quoted"
                  >详情</a>
                </div>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer d-flex">
          <div>
            <span
              style="margin-right: 20px;"
            >整体计划加价率：{{list.markup_rate_all ? returnMarkup(list.markup_rate_all) + '%' : '-'}}</span>
            <span v-if="list.num === 0"></span>
            <pg-confirm
              @confirm="handleAuditItem(multipleSelection)"
              help-text="您确定批量通过审核?"
              v-else-if="(app.auth.isAdmin || app.auth.ItemPriceAudit)"
            >
              <pg-button class="primary" :disabled="multipleSelection.length === 0">批量审核</pg-button>
            </pg-confirm>
          </div>
          <div class="ml-auto" v-if="list.num > 0">
            <pg-pagination :num="list.num" v-model="query" @change="itemPriceQuery" />
          </div>
        </div>
      </div>

      <pg-dialog
        v-model="dialog.visible"
        :title="{'add': '报价', 'edit': '修改报价', 'detail': '报价详情'}[dialog.type]"
        width="1000px"
      >
        <pricing-opt
          v-if="dialog.visible"
          :type="dialog.type"
          :item="dialog.item"
          :provinceCode="dialog.provinceCode"
          :optDate="dialog.optDate"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </pg-dialog>
    </div>
  </div>
</template>
<script>
import { Http, Api, Handle } from "@/util";
import pricingOpt from "./pricing-opt";

export default {
  name: "pricing",
  components: {
    pricingOpt,
  },
  inject: ["app"],
  data() {
    return {
      queryTabsData: {
        全部: "all",
        未报价: "init",
        待审核: "wait",
        已审核: "done",
      },
      provinceListAuth: [],
      today: "",
      query: {},
      list: {
        items: [],
        num: 0,
        markup_rate_all: 0,
      },
      dialog: {
        visible: false,
        type: "add",
        optDate: "",
        item: {},
      },
      systemClassTree: [],
      buyerList: [],
      multipleSelection: [],
    };
  },

  created() {
    document.title = "每日报价 - 运营中心 - 蒲公英运营管理系统";
    this.Handle = Handle;
    this.commonProvinceListAuth();
    this.initQuery();
    this.itemPriceQuery();
    this.commonSystemClassTree();
    this.commonBuyerList();
  },

  computed: {
    disabledKeys: {
      get() {
        let itemIds = [];
        this.list.items.map((item) => {
          if (item.is_audited || !item.is_quoted) {
            itemIds.push(item.item_id);
          }
        });
        return itemIds;
      },
    },
  },

  methods: {
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
    //选择要处理的数据
    handleSelectionChange(val) {
      this.$data.multipleSelection = val;
    },

    changeProvince(province_code) {
      this.app.changeProvince(province_code);
      this.commonSystemClassTree();
      this.commonBuyerList();
      this.changeQuery();
    },

    commonProvinceListAuth() {
      Http.get(Api.commonProvinceListAuth).then((res) => {
        this.$data.provinceListAuth = res.data || [];
      });
    },

    initQuery() {
      let optDate = Handle.formatDate(new Date(), "yyyy-MM-dd");
      this.$data.today = optDate;
      this.$data.query = {
        province_code: this.app.userInfo.province_code, // 省份
        status: "all",
        opt_date: optDate,
        buyer_id: "",
        sort: "",
        condition: "",
        markup_rate: "",
        is_presale: "",
        system_class_code: "",
        page: 1,
        page_size: 20,
      };
    },

    changeQuery() {
      this.$data.query.page = 1;
      this.itemPriceQuery();
    },

    resetQuery() {
      this.initQuery();
      this.itemPriceQuery();
    },

    itemPriceQuery() {
      this.$loading.show();
      Http.get(Api.itemPriceQuery, this.$data.query)
        .then((res) => {
          this.$loading.hide();
          this.$data.list = res.data || { items: [] };
        })
        .catch(() => {
          this.$loading.hide();
        });
    },

    handleDetailItem(item, type) {
      this.$data.dialog = {
        visible: true,
        type: type,
        provinceCode: this.query.province_code,
        optDate: this.query.opt_date,
        item: { ...item },
      };
    },

    handleSubmit() {
      if (this.dialog.type === "add") {
        this.handleCancel();
      }
      this.itemPriceQuery();
    },

    handleCancel() {
      this.$data.dialog = {
        visible: false,
        type: "add",
        provinceCode: "",
        optDate: "",
        item: {},
      };
    },

    commonSystemClassTree() {
      Http.get(Api.commonSystemClassTree).then((res) => {
        this.$data.systemClassTree = res.data || [];
      });
    },

    commonBuyerList(condition = "") {
      Http.get(Api.commonBuyerList, {
        province_code: this.app.userInfo.province_code,
        condition: condition,
      }).then((res) => {
        this.$data.buyerList = res.data || [];
      });
    },

    //审核
    handleAuditItem(items) {
      this.$loading.show();
      let ids = [];
      items.map((item) => {
        ids.push(item.item_id);
      });
      Http.post(Api.itemPriceAudit, {
        ids: ids,
      })
        .then(() => {
          this.$loading.hide();
          this.$toast({
            type: "success",
            message: "已审核",
          });
          this.$data.multipleSelection = [];
          this.itemPriceQuery();
        })
        .catch(() => {
          this.$loading.hide();
        });
    },

    //样式
    returnStyle(item) {
      if (!item.price_sale) {
        return "";
      }
      let fun = (priceBuy, markupRate) => {
        let v = priceBuy * (1 + markupRate / 1000);
        let p = parseInt(v);
        return p; //返回分
      };
      let min = fun(item.price_buy, item.rise_min);
      let max = fun(item.price_buy, item.rise_max);
      if (item.price_sale > max) {
        return "color: #ff5252; font-weight: bold;";
      }
      if (item.price_sale < min) {
        return "color: #76C627; font-weight: bold;";
      }
      return "";
    },
  },
};
</script>

<style lang="scss" scoped>
/*文本自动换行*/
.pre {
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
}

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
