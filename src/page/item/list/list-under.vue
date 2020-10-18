<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-cascader
            :options="systemClassTree"
            v-model="query.system_class_code"
            @change="changeQuery"
            placeholder="按科学分类筛选"
            clearable
        />
      <pg-checkbox v-model="query.has_real_stock" class="ml-20"  @change="changeQuery" :trueValue="1" :falseValue="''">有库存商品</pg-checkbox>
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
          <pg-column title="商品编号/名称">
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
          <pg-column title="商品参数" >
            <template v-slot="{row}">
              <div v-if="row.origin_place || row.item_spec || (row.gross_weight || row.gross_weight === 0)" class="pre">
                <span>{{ row.origin_place }}</span>
                <span v-if="row.item_spec">、{{ row.item_spec }}</span>
                <span v-if="!!row.gross_weight">、{{ Handle.returnWeight(row.gross_weight) }}斤</span>
              </div>
              <span v-else>-</span>
            </template>
          </pg-column>
          <pg-column title="筐" width="100px" >
            <template v-slot="{row}">
                <div class="pre" v-if="row.frame_id">
                    {{ row.frame && row.frame.title }}&nbsp;(&yen;{{Handle.returnPrice(row.frame && row.frame.price)}})
                </div>
                <span v-else> - </span>
            </template>
          </pg-column>
          <pg-column prop="" title="操作" width="120px">
            <template v-slot="{row}">
              <!--  待售功能 -->
              <div v-if="app.auth.isAdmin || app.auth.ItemListForSaleOnGround || app.auth.ItemListForSaleEditRecord">
                  <a class="mr-10 text-decoration-none" @click="handleOnItem(row)" v-if="app.auth.isAdmin || app.auth.ItemListForSaleOnGround">上架</a>
                  <a class="text-decoration-none" @click="handleLogsItem(row)" v-if="app.auth.isAdmin || app.auth.ItemListForSaleEditRecord">操作日志</a>
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

    <pg-dialog v-model="dialog.visible" title="上架商品" width="800px">
      <list-under-edit
        v-if="dialog.visible && dialog.type === 'on_sale'"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'detail'" :title="`${drawer.item.code} / ${drawer.item.title} 商品详情`" width="800px">
      <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`">
        <list-under-edit
          v-if="drawer.visible"
          :type="drawer.type"
          :item="drawer.item"
        />
      </div>
    </pg-drawer>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'logs'" :title="`${drawer.item.code} / ${drawer.item.title} 操作日志`" width="700px">
      <list-logs
        v-if="drawer.visible"
        :id="drawer.item.id"
      />
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import listUnderEdit from './list-under-edit';

  import listLogs from './list-logs';


  export default {
    name: 'list-under',
    components: {listUnderEdit, listLogs},
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
      }
    },

    watch: {
      'app.userInfo.province_code': {
        handler(val) {
          this.$data.query.province_code = val;
          this.changeQuery();
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.initQuery();
      this.itemQuery();
      this.commonSystemClassTree();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          has_real_stock: '',
          system_class_code: '', // 科学分类
          condition: '',
          is_on_sale: 0, // 在售 1 待售 0
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

      handleSubmit() {
        this.handleCancel();
        this.itemQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, type: 'modify', item: {} };
      },
// 上架
      handleOnItem(item) {
         Http.get(Api.itemDetail, { id: item.id })
          .then(res => {
            this.$data.dialog = { visible: true, type: 'on_sale', item: res.data || {} };
          });
      },

//操作日志
      handleLogsItem(item) {
        this.$data.drawer = { visible: true, type: 'logs', item: item };
      },

      handleExport() {
        this.$loading.show();
        const query = this.$data.query;
        Http.get(Api.itemExportCheck, query)
          .then(() => {
            return Http.download(Api.itemExport, query, { filename: '待售商品.xls' })
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
</style>
