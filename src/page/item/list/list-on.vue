<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-button-group class="" v-model="query.sale_type" :options="{ '全部': '', '自营': '自营', '平台': '平台' }" @change="changeQuery"/>
      <pg-button-group class="ml-20 " v-model="query.is_presale" :options="{ '全部': '', '非预售': 0, '预售': 1 }" @change="changeQuery"/>
      <pg-button-group  class="ml-20 min-width" v-model="query.is_gift" :options="{ '全部': '', '非赠品': 0, '赠品': 1 }" @change="changeQuery"/>
      <pg-button-group  class="ml-20 min-width" basis-auto v-model="query.is_vip_item" :options="{ '全部': '', '会员商品': 1, '非会员商品': 0 }" @change="changeQuery"/>

      <!-- <pg-select v-model="query.display_class_id" class="ml-20" placeholder="按展示分类筛选" clearable @change="changeQuery">
        <pg-option
          v-for="item in displayClassList"
          :key="item.id"
          :value="item.id"
        >
          {{ item.title }}
        </pg-option>
      </pg-select> -->

    </div>
    <div class="d-flex mt-10">
        <pg-cascader
            class="ml-0 my-width"

            :options="systemClassTree"
            v-model="query.system_class_code"
            @change="changeQuery"
            placeholder="按科学分类筛选"
            clearable
        />
        <pg-cascader
            class="ml-20 my-width"
            :level="2"
            primary-key="id"
            parent-key="parent_id"
            :options="displayClassTree"
            v-model="query.display_class_id"
            @change="changeQuery"
            placeholder="按展示分类筛选"
            clearable
        />
        <pg-select v-model="query.buyer_id" searchable
             @search="commonBuyerList" class="ml-20 my-width" placeholder="采购员" clearable @change="changeQuery">
            <pg-option
            v-for="item in buyerList"
            :key="item.id"
            :value="item.id"
            >
            {{`${item.realname} ${item.phone ? '('+item.phone+')':''}`}}
            </pg-option>
      </pg-select>
      <pg-select v-model="query.inner_tag_id" class="ml-20 my-width" placeholder="商品加价标签" clearable @change="changeQuery">
            <pg-option
            v-for="item in itemInnerTagsList"
            :key="item.id"
            :value="item.id"
            >
            {{ item.title }}{{`(加价率: ${Handle.returnPercent(item.rise_min)}% - ${Handle.returnPercent(item.rise_max)}%)`}}
            </pg-option>
      </pg-select>

    </div>

    <div class="d-flex mt-10">
      <pg-select v-model="query.supplier_id" class="my-width" placeholder="供应商" searchable clearable @change="changeQuery">
            <pg-option
            v-for="item in supplierList"
            :key="item.id"
            :value="item.id"
            >
            {{ item.title }}
            </pg-option>
      </pg-select>
      <pg-search class="w-25 ml-20" placeholder="商品编号、名称" clearable v-model="query.condition" @change="changeQuery"/>
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>

    <div class="card mt-10">
      <div class="card-header d-flex border-bottom-solid">
          <div class="ml-auto my-10 mr-10">
            <pg-button @click="handleExport" v-if="app.auth.isAdmin || app.auth.ItemListExport">导出商品</pg-button>
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
          <pg-column title="商品编号/名称" width="250px">
            <template v-slot="{row}">
              <a class="text-dark" @click="handleDetailItem(row)" v-if="app.auth.isAdmin || app.auth.ItemListDetail">
                {{ row.code }} / {{ row.title }}
              </a>
              <span v-else>{{ row.code }} / {{ row.title }}</span>
              <div>
                <span>&yen;{{Handle.returnPrice(row.price_sale)}} / 件</span>
                <span class="is-presale" v-if="row.is_presale">预</span>
              </div>

            </template>
          </pg-column>
          <pg-column title="商品参数" width="150px">
            <template v-slot="{row}">
              <div v-if="row.origin_place || row.item_spec || (row.gross_weight || row.gross_weight === 0)" class="pre">
                <span>{{ row.origin_place }}</span>
                <span v-if="row.item_spec">、{{ row.item_spec }}</span>
                <span v-if="!!row.gross_weight">、{{ Handle.returnWeight(row.gross_weight) }}斤</span>
              </div>
              <span v-else>-</span>
            </template>
          </pg-column>
          <pg-column title="筐" width="90px" >
            <template v-slot="{row}">
                <div class="pre" v-if="row.frame_id">
                    {{ row.frame && row.frame.title }}&nbsp;(&yen;{{Handle.returnPrice(row.frame && row.frame.price)}})
                </div>
                <span v-else> - </span>
            </template>
          </pg-column>
          <pg-column title="销售类型" width="80px" >
            <template v-slot="{row}">
              {{ row.sale_type ? row.sale_type : '-'}}
            </template>
          </pg-column>
          <pg-column title="展示分类" width="90px">
            <template v-slot="{row}">
              {{ row.display_class && row.display_class.title || '-' }}
            </template>
          </pg-column>
          <pg-column title="总库存" width="80px">
            <template v-slot="{row}">
              {{ (row.item_stock + row.sale_already) ?  (row.item_stock + row.sale_already) + '件' : '-'}}
            </template>
          </pg-column>
          <pg-column title="已售数量" width="80px">
            <template v-slot="{row}">
              {{ row.sale_already ? row.sale_already + '件' : '-'}}
            </template>
          </pg-column>
          <pg-column prop="" title="操作" width="180px">
            <template v-slot="{row}">
              <!--  待售功能-->
              <div v-if="app.auth.isAdmin || app.auth.ItemListEdit || app.auth.ItemListUnderGround || app.auth.ItemListInnerTagsEdit || app.auth.ItemListEditRecord || app.auth.ItemPriceFixPlanQuery">
                <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="(app.auth.isAdmin || app.auth.ItemListEdit)">修改销售信息</a>
                <pg-confirm help-text="确认下架该商品" @confirm="handleUnderItem(row)" class="mr-10" v-if="(app.auth.isAdmin || app.auth.ItemListUnderGround)">
                  <a class="text-decoration-none">下架</a>
                </pg-confirm>
                 <a class="mr-10 text-decoration-none" @click="handlePriceItem(row)" v-if="(app.auth.isAdmin || app.auth.ItemPriceFixPlanQuery) && (row.is_standard && row.sale_type === '自营') ">定时调价</a>
                <div class="mt-10">
                  <a class="mr-10 text-decoration-none" @click="handleMaterialItem(row)" v-if="(app.auth.isAdmin || app.auth.ItemListInnerTagsEdit)">修改商品价格标签</a>
                  <a class="text-decoration-none" @click="handleLogsItem(row)" v-if="(app.auth.isAdmin || app.auth.ItemListEditRecord)">操作日志</a>
                </div>
              </div>
              <div v-else> - </div>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="itemQuery"/>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" :title="dialog.type === 'modify' ? '修改在售商品' : '修改内标签'" :width="dialog.type === 'modify' ? '800px' : '500px'">
      <list-edit
        v-if="dialog.visible && dialog.type === 'modify'"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
      <list-edit-inner-tag
        v-if="dialog.visible && dialog.type === 'editInnerTag'"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />

    </pg-dialog>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'detail'" :title="`${drawer.item.code} / ${drawer.item.title} 商品详情`" width="800px">
      <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`">
        <list-edit
          v-if="drawer.visible"
          :type="drawer.type"
          :item="drawer.item"
        />
      </div>
    </pg-drawer>

    <!-- <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'material'" :title="`${drawer.item.code} / ${drawer.item.title} 发圈素材`" width="700px">
      <list-material
        v-if="drawer.visible"
        :subitem="drawer.item"
      />
    </pg-drawer> -->

    <!-- <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'price'" :title="`${drawer.item.code} / ${drawer.item.title} 定时调价`" width="700px">
      <subitem-price
        v-if="drawer.visible"
        :subitem="drawer.item"
      />
    </pg-drawer> -->

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'logs'" :title="`${drawer.item.code} / ${drawer.item.title} 操作日志`" width="700px">
      <list-logs
        v-if="drawer.visible"
        :id="drawer.item.id"
      />
    </pg-drawer>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'price'" :title="`${drawer.item.code} / ${drawer.item.title} 定时调价`" width="700px">
      <!-- <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`"> -->
        <list-price
          v-if="drawer.visible"
          :subitem="drawer.item"
        />
      <!-- </div> -->
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import listEdit from './list-edit';
  import listEditInnerTag from './list-edit-inner-tag';
  import listLogs from './list-logs';
  import listPrice from './list-price';

  export default {
    name: 'list-on',
    components: {listEdit, listEditInnerTag, listLogs,listPrice},
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
        systemClassTree: [],
        displayClassTree: [],
        itemInnerTagsList:[],
        buyerList:[],
        supplierList: []
      }
    },

    watch: {
      'app.userInfo.province_code': {
        handler(val) {
          this.$data.query.province_code = val;
          this.$data.query.display_class_id = '';
          this.$data.query.inner_tag_id = '';
          this.$data.query.buyer_id = '';
          this.commonDisplayClassTree();
          this.commonItemInnerTagsList();
          this.commonBuyerList();
          this.changeQuery();
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.initQuery();
      this.itemQuery();
      this.commonSystemClassTree();
      this.commonDisplayClassTree();
      this.commonItemInnerTagsList();
      this.commonBuyerList();
      this.commonSupplierList();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          display_class_id: '', // 展示分类
          system_class_code: '', // 科学分类
          condition: '',
          is_presale: '', // 预售商品
          is_on_sale: 1, // 在售 1 待售 0
          buyer_id:'',//采购员
          sale_type: '',
          is_gift:'',//是否赠品
          inner_tag_id:'',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.itemQuery();
      },

      resetQuery() {
        this.initQuery();
        this.itemQuery();
      },

      itemQuery() {
        Http.get(Api.itemQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleDetailItem(item) {
        Http.get(Api.itemDetail, { id: item.id })
          .then(res => {
            this.$data.drawer = { visible: true, type: 'detail', item: res.data || {} };
          });
      },

      handleModifyItem(item) {
        Http.get(Api.itemDetail, { id: item.id })
          .then(res => {
            this.$data.dialog = { visible: true, type: 'modify', item: res.data || {} };
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.itemQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, type: 'modify', item: {} };
      },

      handleUnderItem(item) {
        Http.post(Api.itemUnderGround, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '商品下架成功！已移动至待售商品列表' });
            this.itemQuery();
          });
      },
// 修改商品价格
      handleMaterialItem(item) {
         Http.get(Api.itemDetail, { id: item.id })
          .then(res => {
            this.$data.dialog = { visible: true, type: 'editInnerTag', item: res.data || {} };
          });
      },
//操作日志
      handleLogsItem(item) {
        this.$data.drawer = { visible: true, type: 'logs', item: item };
      },
      //定时调价
      handlePriceItem(item){
         Http.get(Api.itemDetail, { id: item.id })
          .then(res => {
            this.$data.drawer = { visible: true, type: 'price', item: res.data || {} };
          });
      },

      handleExport() {
        this.$loading.show();
        const query = this.$data.query;
        Http.get(Api.itemExportCheck, query)
          .then(() => {
            return Http.download(Api.itemExport, query, { filename: '在售商品.xls' })
          })
          .then(() => {
            this.$loading.hide();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      commonSystemClassTree() {
        Http.get(Api.commonSystemClassTree)
          .then(res => {
            this.$data.systemClassTree = res.data || [];
          });
      },

      commonDisplayClassTree() {
        Http.get(Api.commonDisplayClassTree, { province_code: this.app.userInfo.province_code })
          .then(res => {
            this.$data.displayClassTree = res.data || [];
          });
      },
      commonItemInnerTagsList(){
          Http.get(Api.commonItemInnerTagsList, { province_code: this.app.userInfo.province_code })
          .then(res => {
            this.$data.itemInnerTagsList = res.data || [];
          });
      },
      commonBuyerList(condition=""){
          Http.get(Api.commonBuyerList, { province_code: this.app.userInfo.province_code,condition: condition })
          .then(res => {
            this.$data.buyerList = res.data || [];
          });
      },
      commonSupplierList(condition=""){
          Http.get(Api.commonSupplierList, { province_code: this.app.userInfo.province_code,condition: condition })
          .then(res => {
            let rd = res.data;
            rd.filter((item)=>{
              return item.is_freeze === false
            })
            this.$data.supplierList = rd || [];
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
.is-presale {
    color: #fff;
    background: #FFA349;
    border-radius: 3px;
    display: inline-block;
    padding: 0 5px;
    margin-left: 5px;
  }
  /*文本自动换行*/
.pre {
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
}
.my-width {
  width: 210px;
}
</style>
