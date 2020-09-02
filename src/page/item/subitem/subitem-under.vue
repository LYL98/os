<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-cascader
        level='4'
        style="width:200px;"
        :options="systemClassTree"
        v-model="query.system_class_code"
        @change="changeQuery"
        placeholder="按科学分类筛选"
        clearable
      />
      <pg-search class="w-25 ml-20" clearable placeholder="商品编号、名称" v-model="query.condition" @change="changeQuery"/>
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>

      <div class="ml-auto">
        <pg-button @click="handleExport" v-if="app.auth.isAdmin || app.auth.ClsItemSubitemExport">导出</pg-button>
      </div>
    </div>

    <div class="card mt-10">
      <div class="card-body">
        <pg-table
          fixed-header
          :data="list.items"
          primary-key="id"
          :page="query.page"
          :page-size="query.page_size"
          borderless
        >
          <pg-column title="商品编号/名称" width="300px">
            <template v-slot="{row}">
              <a class="text-dark" @click="handleDetailItem(row)">
                {{ row.code }} / {{ row.title }}
              </a>
            </template>
          </pg-column>
          <pg-column prop="item_spec" title="商品规格" width="200px">
            <template v-slot="{row}">
              <div v-if="row.p_item && row.p_item.origin_place && row.p_item.package_spec && (row.p_item.weight || row.p_item.weight === 0)" class="overflow-ellipsis">
                <span>{{ row.p_item.origin_place }}、</span>
                <span>{{ row.p_item.package_spec }}、</span>
                <span>{{ Handle.returnWeight(row.p_item.weight) }}{{row.p_item.weight_unit === 'jin' ? '斤' : row.p_item.weight_unit}}</span>
              </div>
              <span v-else>-</span>
            </template>
          </pg-column>
          <pg-column prop="" title="操作" width="120px">
            <template v-slot="{row}">
              <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.ClsItemSubitemOnGround">上架</a>
              <a class="text-decoration-none" @click="handleLogsItem(row)" v-if="app.auth.isAdmin || app.auth.ClsItemSubitemModifyLog">操作日志</a>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="subitemQuery"/>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" title="上架待售商品" width="800px">
      <subitem-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'detail'" :title="`${drawer.item.code} / ${drawer.item.title} 商品详情`" width="800px">
      <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`">
        <subitem-edit
          v-if="drawer.visible"
          :type="drawer.type"
          :item="drawer.item"
        />
      </div>
    </pg-drawer>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'logs'" :title="`${drawer.item.code} / ${drawer.item.title} 操作日志`" width="700px">
      <subitem-logs
        v-if="drawer.visible"
        :id="drawer.item.id"
      />
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import subitemEdit from './subitem-edit';
  import subitemLogs from './subitem-logs';

  export default {
    name: 'subitem-under',
    components: {subitemEdit, subitemLogs},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          visible: false,
          type: 'on',
          item: {}
        },
        drawer: {
          visible: false,
          type: 'detail',
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
      this.subitemQuery();
      this.commonSystemClassTree();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          display_class_id: '', // 展示分类
          system_class_code: '', // 分类
          condition: '',
          is_presale: '', // 预售商品
          is_on_sale: 0, // 在售 1 待售 0
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.subitemQuery();
      },

      resetQuery() {
        this.initQuery();
        this.subitemQuery();
      },

      subitemQuery() {
        Http.get(Api.subitemQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleExport() {
        this.$loading.show();
        const query = this.$data.query;
        Http.get(Api.subitemExportCheck, query)
          .then(() => {
            return Http.download(Api.subitemExport, query, { filename: '待售商品.xls' })
          })
          .then(() => {
            this.$loading.hide();
          })
          .catch(() => {
            this.$loading.hide();
          })
      },

      handleDetailItem(item) {
        Http.get(Api.subitemDetail, { id: item.id })
          .then(res => {
            this.$data.drawer = { visible: true, type: 'detail', item: res.data || {} };
          });
      },

      handleModifyItem(item) {
        Http.get(Api.subitemDetail, { id: item.id })
          .then(res => {
            this.$data.dialog = { visible: true, type: 'on', item: res.data || {} };
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.subitemQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, type: 'on', item: {} };
      },

      handleLogsItem(row) {
        this.$data.drawer = { visible: true, type: 'logs', item: row };
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

</style>
