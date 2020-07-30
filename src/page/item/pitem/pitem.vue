<template>
  <div class="pg-page">

    <div class="pg-page-header">
      <pg-tabs v-model="query.is_deleted" borderless class="font-size-lg font-weight-bolder" @change="changeQuery">
        <pg-tab :index="0">商品库</pg-tab>
        <pg-tab :index="1">回收站</pg-tab>
      </pg-tabs>
    </div>

    <div class="p-20">
      <div class="d-flex">
        <pg-cascader
          :options="systemClassTree"
          v-model="query.system_class_code"
          @change="changeQuery"
          placeholder="按科学分类筛选"
          clearable
        />
        <pg-search class="w-25 ml-20" clearable placeholder="商品编号、名称" v-model="query.condition" @change="changeQuery"/>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>

        <div class="ml-auto" v-if="query.is_deleted === 0">
          <pg-button @click="handleExport" v-if="app.auth.isAdmin || app.auth.ClsItemPitemExport">导出</pg-button>
          <pg-button class="ml-20" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.ClsItemPitemAdd">新增</pg-button>
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
            <pg-column title="商品编号/名称" width="400px">
              <template v-slot="{row}">
                <a class="text-dark" @click="handleDetailItem(row)">
                  {{ row.code }} / {{ row.title }}
                </a>
              </template>
            </pg-column>
            <pg-column prop="item_spec" title="商品规格" width="300px">
              <template v-slot="{row}">
                <div v-if="row.origin_place && row.item_spec && (row.weight || row.weight === 0)" class="overflow-ellipsis">
                  <span>{{ row.origin_place }}、</span>
                  <span>{{ row.item_spec }}、</span>
                  <span>{{ Handle.returnWeight(row.weight) }}{{row.weight_unit === 'jin' ? '斤' : row.weight_unit}}</span>
                </div>
                <span v-else>-</span>
              </template>
            </pg-column>
            <pg-column prop="" title="操作" width="150px">
              <template v-slot="{row}">
                <div v-if="query.is_deleted === 0">
                  <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.ClsItemPitemModify">修改</a>
                  <pg-confirm @confirm="handleDeleteItem(row)" help-text="将该商品放入回收站" v-if="app.auth.isAdmin || app.auth.ClsItemPitemDelete">
                    <a class="mr-10 text-decoration-none">删除</a>
                  </pg-confirm>
                  <a class="mr-10 text-decoration-none" @click="handleLogsItem(row)" v-if="app.auth.isAdmin || app.auth.ClsItemPitemModifyLog">操作日志</a>
                </div>
                <div v-else>
                  <pg-confirm @confirm="handleRecoverItem(row)" help-text="将该商品恢复到商品库" v-if="app.auth.isAdmin || app.auth.ClsItemPitemRecover">
                    <a class="text-decoration-none">恢复</a>
                  </pg-confirm>

                </div>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination :num="list.num" v-model="query" @change="pitemQuery"/>
        </div>
      </div>
    </div>

    <pg-dialog :title="`${dialog.type === 'add' ? '新增' : '修改'}商品`" v-model="dialog.visible" width="800px">
      <pitem-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'detail'" :title="`${drawer.item.code} / ${drawer.item.title} 商品详情`" width="800px">
      <div class="pt-10" :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`">
        <pitem-edit
          v-if="drawer.visible"
          :type="drawer.type"
          :item="drawer.item"
        />
      </div>
    </pg-drawer>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'logs'" :title="`${drawer.item.code} / ${drawer.item.title} 操作日志`" width="700px">
      <pitem-logs
        v-if="drawer.visible"
        :id="drawer.item.id"
      />
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import pitemEdit from './pitem-edit';
  import pitemLogs from './pitem-logs';

  export default {
    name: 'pitem',
    components: {pitemEdit, pitemLogs},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          type: 'add',
          visible: false,
          item: {},
        },
        drawer: {
          visible: false,
          type: 'detail',
          item: {}
        },
        systemClassTree: [],
      }
    },

    created() {
      this.Handle = Handle;
      document.title = '商品库 - 零售中心 - 蒲公英运营管理系统';
      this.initQuery();
      this.pitemQuery();
      this.commonSystemClassTree();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          is_deleted: 0, // 0 表示 未删除 1 表示已删除
          system_class_code: '',
          condition: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.pitemQuery();
      },

      resetQuery() {
        this.initQuery();
        this.pitemQuery();
      },

      pitemQuery() {
        Http.get(Api.pitemQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleAddItem() {
        this.$data.dialog = { type: 'add', visible: true, item: {} };
      },

      handleDetailItem(item) {
        Http.get(Api.pitemDetail, { id: item.id })
          .then(res => {
            this.$data.drawer = { visible: true, type: 'detail', item: res.data || {} };
          });
      },

      handleModifyItem(item) {
        Http.get(Api.pitemDetail, { id: item.id })
          .then(res => {
            this.$data.dialog = { type: 'modify', visible: true, item: res.data || {} };
          });
      },

      handleDeleteItem(item) {
        Http.post(Api.pitemDelete, { id: item.id })
          .then(() => {
            this.pitemQuery();
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.pitemQuery();
      },

      handleCancel() {
        this.$data.dialog = { type: 'add', visible: false, item: {} };
      },

      handleLogsItem(row) {
        this.$data.drawer = { visible: true, type: 'logs', item: row };
      },

      handleRecoverItem(row) {
        Http.post(Api.pitemRecover, { id: row.id })
          .then(() => {
            this.pitemQuery();
          });
      },

      handleExport() {
        this.$loading.show();
        Http.get(Api.pitemExportCheck, this.$data.query)
          .then(() => {
            return Http.download(Api.pitemExport, this.$data.query, { filename: '商品库列表.xls' })
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

</style>
