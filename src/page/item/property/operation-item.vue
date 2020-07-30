<template>
  <div>

    <div class="d-flex mt-20">
      <pg-cascader
        :options="systemClassTree"
        v-model="query.system_class_code"
        @change="changeQuery"
        placeholder="按科学分类筛选"
        clearable
      />
      <pg-search class="ml-20" placeholder="商品编号、名称" v-model="query.condition" @change="changeQuery"/>
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>

    <div class="d-flex mt-20 mb-10">
      <pg-confirm @confirm="handleDeleteItem(selectionItems)" help-text="确认将所选商品从专区移除" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyOperationItemDelete">
        <pg-button :disabled="!Array.isArray(selectionItems) || selectionItems.length <= 0">批量删除</pg-button>
      </pg-confirm>
      <div class="ml-auto">
        <pg-button class="ml-20" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyOperationItemAdd">新增专区商品</pg-button>
      </div>
    </div>

    <pg-table
      :data="list.items"
      primary-key="id"
      :page="query.page"
      :page-size="query.page_size"
      checkable
      @selection="onSelectionItems"
      :height="app.windowHeight - 270 + 'px'"
      borderless
    >
      <pg-column prop="title" title="商品编号/名称">
        <template v-slot="{row}">
          <div class="overflow-ellipsis">
            {{ row.code }} / {{ row.title }}
          </div>
        </template>
      </pg-column>
      <pg-column prop="created" title="创建时间" width="160"></pg-column>
      <pg-column prop="" title="操作" width="80px">
        <template v-slot="{row}">
          <pg-confirm @confirm="handleDeleteItem([row])" help-text="确认将该商品从专区移除" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyOperationItemDelete">
            <a class="mr-10 text-decoration-none">删除</a>
          </pg-confirm>
        </template>
      </pg-column>
    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="operationItemQuery"/>
    </div>

    <pg-dialog title="新增专区商品" width="700px" v-model="dialog.visible">
      <operation-item-edit
        v-if="dialog.visible"
        :operation="operation"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import operationItemEdit from './operation-item-edit';

  export default {
    name: 'operation-item',
    components: {operationItemEdit},
    inject: ['app'],
    props: {
      operation: { type: Object, default() { return {} } },
    },
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          visible: false,
          item: {},
        },
        selectionItems: [],
        systemClassTree: [],
      }
    },

    created() {
      this.Handle = Handle;
      this.initQuery();
      this.operationItemQuery();
      this.commonSystemClassTree();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          id: this.$props.operation.id, // 运营专区的id
          system_class_code: '',
          condition: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.operationItemQuery();
      },

      resetQuery() {
        this.initQuery();
        this.operationItemQuery();
      },

      operationItemQuery() {
        Http.get(Api.operationItemQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleAddItem() {
        this.$data.dialog = { visible: true, item: {} };
      },

      handleDeleteItem(items) {
        Http.post(Api.operationItemDelete, { item_tag_id: this.$props.operation.id, item_ids: items.map(d => d.id) })
          .then(() => {
            this.$toast({ type: 'success', message: '专区商品删除成功' });
            this.operationItemQuery();
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.operationItemQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, item: {} };
      },

      onSelectionItems(items) {
        this.$data.selectionItems = items;
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
