<template>
  <div class="p-20">
    <div class="d-flex">
        <pg-select
            v-model="query.province_code"
            :clearable="false"
            class="ml-0"
            placeholder="按区域筛选"
            @change="changeProvince"
         >
            <pg-option :key="1" :value="''" >全部</pg-option>
            <pg-option v-for="item in provinceList" :key="item.code" :value="item.code" >{{item.title}}</pg-option>
        </pg-select>
        <pg-select
            v-model="query.zone_id"
            :clearable="query.city_id ? false : true"
            class="ml-20"
            placeholder="按片区筛选"
            :disabled="query.province_code ? false : true"
            @change="changeZone"
         >
            <pg-option v-for="item in zoneList" :key="item.id" :value="item.id">{{item.title}}</pg-option>
        </pg-select>
        <pg-select
            v-model="query.city_id"
            :clearable="true"
            class="ml-20"
            placeholder="按县域筛选"
            :disabled="query.province_code ? query.zone_id ? false : true : true"
            @change="changeQuery"
         >
            <pg-option v-for="item in cityList" :key="item.id" :value="item.id" >{{item.title}}</pg-option>
        </pg-select>
        <pg-cascader
            class="ml-20"
            :level="2"
            primary-key="id"
            parent-key="parent_id"
            :options="displayClassTree"
            v-model="query.display_class_id"
            @change="changeQuery"
            placeholder="按展示分类筛选"
            clearable
            :disabled="query.province_code ? false : true"
        />
    </div>
    <div class="d-flex mt-10">

        <pg-datepicker
            style="width: 450px"
            class="ml-0"
            quickable
            range
            clearable
            v-model="query"
            @change="changeQuery"
            placeholder="创建时间"
        />

      <pg-search class="w-25 ml-20" placeholder="商品名称、门店名称" clearable v-model="query.condition" @change="changeQuery"/>
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>


    </div>

    <div class="card mt-10">
      <div class="card-header d-flex border-bottom-solid">
          <div class="ml-auto my-10 mr-10">
            <pg-button class="mr-10" @click="handleExport" v-if="app.auth.isAdmin || app.auth.AdvicedItemExport">导出客户提报表</pg-button>
            <pg-button @click="handleShowEchart" color="primary" v-if="app.auth.isAdmin || app.auth.AdvicedItemStatistical">客户提报统计</pg-button>

          </div>
      </div>
      <div class="card-body">
        <pg-table
          fixed-header
          :data="list.items"
          primary-key="id"
          :page="query.page"
          :page-size="query.page_size"
          borderless
        >
          <pg-column title="门店名称" width="220px">
            <template v-slot="{row}">
              <a class="text-dark pre" @click="handleDetailItem(row)" v-if="app.auth.isAdmin || app.auth.ItemListDetail">
                {{ row.store && row.store.title || '-' }}
              </a>
              <div class="pre" v-else>{{ row.store && row.store.title || '-' }}</div>
            </template>
          </pg-column>
          <pg-column title="县域" >
            <template v-slot="{row}">
              <div class="pre">
                {{ row.city && row.city.title || '-' }}
              </div>
            </template>
          </pg-column>
          <pg-column title="展示分类" >
            <template v-slot="{row}">
              <div class="pre">
                {{ row.display_class && row.display_class.title || '-' }}
              </div>
            </template>
          </pg-column>
          <pg-column title="商品名称" >
            <template v-slot="{row}">
              <div class="pre">
               {{ row.title }}
              </div>
            </template>
          </pg-column>
          <pg-column title="提报时间" >
            <template v-slot="{row}">
              <div class="pre">
                {{ row.created }}
              </div>
            </template>
          </pg-column>
          <pg-column prop="" title="操作" width="80px">
            <template v-slot="{row}">
              <a class="text-decoration-none" @click="handleDetailItem(row)" v-if="app.auth.isAdmin || app.auth.ItemListForSaleEditRecord">详情</a>
              <div v-else> - </div>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="advicedItemQuery"/>
      </div>
    </div>


    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'detail'" :title="`客户提报详情`" width="600px">
      <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`">
        <div class="row">
            <div class="col-4">门店名称: </div>
            <div class="col-8">{{ drawer.item.store && drawer.item.store.title || '-' }}</div>
        </div>
         <div class="row">
            <div class="col-4">县域: </div>
            <div class="col-8">{{ drawer.item.city && drawer.item.city.title || '-' }}</div>
        </div>
         <div class="row">
            <div class="col-4">展示分类: </div>
            <div class="col-8">{{ drawer.item.display_class && drawer.item.display_class.title || '-' }}</div>
        </div>
         <div class="row">
            <div class="col-4">商品名称: </div>
            <div class="col-8">{{ drawer.item.title || '-' }}</div>
        </div>
        <div class="row">
            <div class="col-4">品牌: </div>
            <div class="col-8">{{ drawer.item.brand || '-' }}</div>
        </div>
        <div class="row">
            <div class="col-4">规格: </div>
            <div class="col-8">{{ drawer.item.item_spec || '-' }}</div>
        </div>
        <div class="row">
            <div class="col-4">原进货渠道: </div>
            <div class="col-8">{{ drawer.item.purchase_channel || '-' }}</div>
        </div>
        <div class="row">
            <div class="col-4">提报时间: </div>
            <div class="col-8">{{ drawer.item.created || '-' }}</div>
        </div>
        <div class="row">
            <div class="col-4">描述: </div>
            <div class="col-8">{{ drawer.item.remark || '-' }}</div>
        </div>
      </div>
    </pg-drawer>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'echarts'" :title="`提报统计`" width="700px">
       <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`">
          <customer-advice-echarts
              v-if="drawer.visible"
              :item="drawer.item"
            />
       </div>

    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import customerAdviceEcharts from './customer-advice-echarts';

//   import listLogs from './list-logs';


  export default {
    name: 'customer-advice',
    components: {customerAdviceEcharts,},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          visible: false,
          type: 'modify',
          item: {}
        },
        drawer: {
          type: 'detail',
          visible: false,
          item: {}
        },
        displayClassTree: [],
        provinceList: [],//区域列表
        zoneList:[],
        cityList:[]

      }
    },

    watch: {
    },

    created() {
      this.Handle = Handle;
      this.initQuery();
      this.commonProvinceList();
      this.advicedItemQuery();
      // this.commonDisplayClassTree();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: '',
          zone_id:'',
          city_id: '',
          condition: '',
          display_class_id: '',
          begin_date: '',
          end_date:'',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.advicedItemQuery();
      },

      resetQuery() {
        this.initQuery();
        this.advicedItemQuery();
      },
      changeProvince(){
          this.$data.zoneList = [];
          this.$data.cityList = [];
          this.$data.query.zone_id = '';
          this.$data.query.city_id = '';
          this.$data.query.display_class_id = '';

          this.commonZoneList();
          this.commonDisplayClassTree();
          this.changeQuery()
      },
      changeZone(){
          this.$data.cityList = [];
          this.$data.query.city_id = '';
          this.commonCityList()
          this.changeQuery()
      },

      advicedItemQuery() {
        Http.get(Api.advicedItemQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleShowEchart() {
           Http.get(Api.advicedItemStatistical, this.$data.query)
            .then(res => {
                this.$data.drawer = { visible: true, type: 'echarts', item: res.data || {} };
            });
      },



      handleDetailItem(item) {
        this.$data.drawer = { visible: true, type: 'detail', item: item || {} };
      },

      handleExport() {
        this.$loading.show();
        const query = this.$data.query;
        Http.get(Api.advicedItemExportCheck, query)
          .then(() => {
            return Http.download(Api.advicedItemExport, query, { filename: '客户提报表.xls' })
          })
          .then(() => {
            this.$loading.hide();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      commonDisplayClassTree() {
        Http.get(Api.commonDisplayClassTree, { province_code: this.$data.query.province_code })
          .then(res => {
            this.$data.displayClassTree = res.data || [];
          });
      },
      //区域列表
      commonProvinceList(){
          Http.get(Api.commonProvinceList).then(res => {
                    this.$data.provinceList = res.data || [];
                });
      },
      //片区列表
        commonZoneList(){
             Http.get(Api.commonZoneList,{
                 province_code: this.$data.query.province_code
             }).then(res => {
                    this.$data.zoneList = res.data || [];
                });
        },
      //县域列表
      commonCityList(){
            Http.get(Api.commonCityList,{
                 province_code: this.$data.query.province_code,
                 zone_id: this.$data.query.zone_id
             }).then(res => {
                    this.$data.cityList = res.data || [];
                });
      }
    }

  }
</script>

<style lang="scss" scoped>
.min-width {
    min-width: 168px;
}
.border-bottom-solid{
    border-bottom: 1px solid #ddd;
}

  /*文本自动换行*/
.pre {
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
}
.row {
    margin-top: 5px;
}
</style>
