<template>
  <div class="p-20">
    <div class="d-flex">
        <pg-datepicker
              :quickable="false"
              :clearable="false"
              v-model="query.opt_date"
              placeholder="销售日期"
              @change="changeQuery"
            ></pg-datepicker>
      <pg-select v-model="query.item_tag_id" class="ml-20" placeholder="按运营专区筛选" searchable @search="commonItemTagList" clearable @change="changeQuery">
        <pg-option
          v-for="item in itemTagList"
          :key="item.id"
          :value="item.id"
        >
          {{ item.title }}
        </pg-option>
      </pg-select>
      
      <pg-search class="w-25 ml-20" placeholder="商品编号、名称" clearable v-model="query.condition" @change="changeQuery"/>
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>

    <div class="d-flex mt-10">
        <pg-cascader
       
        :options="systemClassTree"
        v-model="query.system_class_code"
        @change="changeQuery"
        placeholder="按科学分类筛选"
        clearable
      />
      <pg-select style="width: 200px;" v-model="query.buyer_id" @change="changeQuery" searchable @search="commonBuyerList" clearable placeholder="按采购员筛选" class="ml-20">
              <pg-option
                v-for="item in buyerList"
                :key="item.id"
                :value="item.id"
              >
                {{ item.realname }} / {{ item.phone }}
              </pg-option>
        </pg-select>
      
    </div>

    <div class="card mt-10">
      <div class="card-body">
        <pg-table
          fixed-header
          :data="list.items"
          primary-key="item_code"
          :page="query.page"
          :page-size="query.page_size"
          borderless
        >
        <template v-slot:real_stock>
            实库库存&nbsp;<pg-tooltip>仓库各批次库存与场地各批次库存之和</pg-tooltip>
        </template>
        <template v-slot:on_way_stock>
            在途库存&nbsp;<pg-tooltip>销售日期为今日的采购单商品数量之和</pg-tooltip>
        </template>
        <template v-slot:supplier_bid_stock>
            供应商库存&nbsp;<pg-tooltip>今日有报价的供应商库存之和</pg-tooltip>
        </template>
          <pg-column title="商品编号/名称">
            <template v-slot="{row}">
                <div class="pre">
                <a class="text-dark" @click="handleDetailItem(row)" v-if="app.auth.isAdmin || app.auth.ClsItemStockForSaleSnapShotDetail">
                    {{ row.item_code }} / {{ row.item_title }}
                </a>
                <div v-else class="pre">{{ row.item_code }} / {{ row.item_title }}</div>
                </div>
            </template>
          </pg-column>
          <pg-column prop="sold_yesterday" title="昨日销量" width="100px">
            <template v-slot="{row}">
             {{row.sold_yesterday ? row.sold_yesterday +'件' : '-'}}
            </template>
          </pg-column>
          <pg-column prop="real_stock" title="实库库存" width="100px">
            <template v-slot="{row}">
             {{row.real_stock ? row.real_stock +'件' : '-'}}
            </template>
          </pg-column>
          <pg-column title="在途库存" width="100px" prop="on_way_stock">
            <template v-slot="{row}">
             {{row.on_way_stock ? row.on_way_stock + '件' : '-'}}
            </template>
          </pg-column>
          <pg-column title="供应商库存" width="100px" prop="supplier_bid_stock">
            <template v-slot="{row}">
                    {{row.supplier_bid_stock ? row.supplier_bid_stock + '件' : '-'}}
            </template>
          </pg-column>
          <pg-column title="总库存" width="100px" prop="total_stock_num">
            <template v-slot="{row}">
                    {{row.total_stock_num ? row.total_stock_num + '件' : '-'}}
            </template>
          </pg-column>
          <template v-slot:total_stock_num>
              <div class="d-flex">
                    <div>总库存
                    <pg-column-sort v-model="query.sort" asc="-total_stock_num" desc="total_stock_num"
                              @change="changeQuery"></pg-column-sort>
                    </div>
                </div>
              
          </template>
          <pg-column prop="" title="操作" width="60px">
              <template v-slot="{row}">
                
                  <a class="mr-10 text-decoration-none" @click="handleDetailItem(row)" v-if="app.auth.isAdmin || app.auth.ClsItemStockForSaleSnapShotDetail">详情</a>
                 <div v-else> - </div>
              </template>
            </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="supCPlatStockForSaleSnapShot"/>
      </div>
    </div>

     <!-- 详情 -->
    <pg-drawer v-model="drawer.visible" title="商品每日库存详情" width="800px">
        <!-- :height="app.windowHeight - 400 + 'px'" -->
      <div class="" :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`">
      <stock-day-detail
        v-if="drawer.visible"
        :item="drawer.item"
        @submit="handleDetailSub"
      />
      </div>
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import stockDayDetail from './stock-day-detail'

  export default {
    name: 'stock-day',
    components: {stockDayDetail},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        systemClassTree: [],
        displayClassList: [],
        itemTagList:[],
        buyerList:[],
        drawer:{
            visible: false,
            item: {},
            type: 'detail'
        }
      }
    },

    watch: {
      'app.userInfo.province_code': {
        handler(val) {
          this.$data.query.province_code = val;
          this.$data.query.display_class_id = '';
          this.commonDisplayClassList();
          this.commonItemTagList()
          this.changeQuery();
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.initQuery();
      this.supCPlatStockForSaleSnapShot();
      this.commonSystemClassTree();
      this.commonDisplayClassList();
      this.commonItemTagList();
      this.commonBuyerList();

    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          buyer_id: '', // 采购
          system_class_code: '', // 科学分类
          condition: '',
          opt_date:this.Handle.formatDate(new Date(), 'yyyy-MM-dd'),
          item_tag_id:'',
          sort:'',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.supCPlatStockForSaleSnapShot();
      },

      resetQuery() {
        this.initQuery();
        this.supCPlatStockForSaleSnapShot();
      },

      supCPlatStockForSaleSnapShot() {
        Http.get(Api.supCPlatStockForSaleSnapShot, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleDetailItem(item) {
        Http.get(Api.itemStockDetail, {province_code: this.app.userInfo.province_code, item_code: item.item_code, opt_date: this.$data.query.opt_date })
          .then(res => {
            this.$data.drawer = { visible: true, type: 'detail', item: res.data || {} };
          });
      },


      commonSystemClassTree() {
        Http.get(Api.commonSystemClassTree)
          .then(res => {
            this.$data.systemClassTree = res.data || [];
          });
      },

      commonDisplayClassList() {
        Http.get(Api.commonDisplayClassList, { province_code: this.app.userInfo.province_code })
          .then(res => {
            this.$data.displayClassList = res.data || [];
          });
      },

      commonItemTagList(condition=''){
           Http.get(Api.commonItemTagList, { province_code: this.app.userInfo.province_code, condition: condition })
          .then(res => {
            this.$data.itemTagList = res.data || [];
          });
      },
      commonBuyerList(condition=''){
           Http.get(Api.commonBuyerList, {  province_code: this.app.userInfo.province_code,condition: condition })
          .then(res => {
            this.$data.buyerList = res.data || [];
          });
      }
    }

  }
</script>

<style lang="scss" scoped>
.is-mark {
    color: #fff;
    background: #FFA349;
    border-radius: 3px;
    display: inline-block;
    padding: 0 5px;
  }
    /*文本自动换行*/
.pre {
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
}
</style>
