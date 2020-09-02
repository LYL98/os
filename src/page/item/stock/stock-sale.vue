<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-select v-model="query.display_class_id" class="" placeholder="按展示分类筛选" searchable @search="commonDisplayClassList" clearable @change="changeQuery">
        <pg-option
          v-for="item in displayClassList"
          :key="item.id"
          :value="item.id"
        >
          {{ item.title }}
        </pg-option>
      </pg-select>
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
      <pg-button-group  class="ml-20" v-model="query.act" :options="{ '全部': '', '预售商品': 'is_presale', '秒杀商品': 'seckill' }" @change="changeQuery"/>
      
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
                        {{ row.item_code }} / {{ row.item_title }}
                    <span class="is-mark" v-if="row.is_presale">预</span>
                </div>
            </template>
          </pg-column>
          <pg-column prop="real_stock" title="实库库存" width="100px">
            <template v-slot="{row}">
             {{row.real_stock ? row.real_stock + '件' : '-'}}
            </template>
          </pg-column>
          <pg-column title="在途库存" width="100px" prop="on_way_stock">
            <template v-slot="{row}">
             {{row.on_way_stock ? row.on_way_stock + '件' : '-'}}

              <!-- {{ !!row.price_sale ? '¥' : '' }} {{ Handle.returnPrice(row.price_sale) || '-' }} -->
            </template>
          </pg-column>
          <pg-column title="供应商库存" width="100px" prop="supplier_bid_stock">
            <template v-slot="{row}">
              {{ row.supplier_bid_stock && row.supplier_bid_stock + '件' || '-' }}
            </template>
          </pg-column>
          <pg-column title="总库存" width="100px" prop="total_stock_num">
            <template v-slot="{row}">
              {{ row.total_stock_num || '-' }}{{ !!row.total_stock_num ? '件' : '' }}
            </template>
          </pg-column>
          <pg-column title="活动库存" width="100px">
            <template v-slot="{row}">
              {{row.activity_stock ? row.activity_stock + '件' : '-'}}
            </template>
          </pg-column>
          <pg-column title="已售库存" width="100px">
            <template v-slot="{row}">
              {{ row.sold_num || '-' }}{{ !!row.sold_num ? '件' : '' }}
            </template>
          </pg-column>
          <pg-column title="可售库存" width="100px" prop="saliable_num" >
            <template v-slot="{row}">
                {{row.saliable_num ? row.saliable_num + '件' : '-'}}
            </template>
          </pg-column>
          <template v-slot:saliable_num>
              <div class="">
                    <div>可售库存
                    <pg-column-sort v-model="query.sort" asc="-saliable_num" desc="saliable_num"
                              @change="changeQuery"></pg-column-sort>
                    </div>
                </div>
              
          </template>
          <template v-slot:total_stock_num>
              <div class="">
                    <div>总库存
                    <pg-column-sort v-model="query.sort" asc="-total_stock_num" desc="total_stock_num"
                              @change="changeQuery"></pg-column-sort>
                    </div>
                </div>
              
          </template>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="supCPlatStockForSale"/>
      </div>
    </div>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';


  export default {
    name: 'stock-sale',
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        systemClassTree: [],
        displayClassList: [],
        itemTagList:[]
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
      this.supCPlatStockForSale();
      this.commonSystemClassTree();
      this.commonDisplayClassList();
      this.commonItemTagList()
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          display_class_id: '', // 展示分类
          system_class_code: '', // 科学分类
          condition: '',
          act:'',
          item_tag_id:'',
          sort:'',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.supCPlatStockForSale();
      },

      resetQuery() {
        this.initQuery();
        this.supCPlatStockForSale();
      },

      supCPlatStockForSale() {
        Http.get(Api.supCPlatStockForSale, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      commonSystemClassTree() {
        Http.get(Api.commonSystemClassTree)
          .then(res => {
            this.$data.systemClassTree = res.data || [];
          });
      },

      commonDisplayClassList(condition='') {
        Http.get(Api.commonDisplayClassList, { province_code: this.app.userInfo.province_code, condition: condition })
          .then(res => {
            this.$data.displayClassList = res.data || [];
          });
      },

      commonItemTagList(condition=''){
           Http.get(Api.commonItemTagList, { province_code: this.app.userInfo.province_code, condition: condition })
          .then(res => {
            this.$data.itemTagList = res.data || [];
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
