<template>
  <div>

    <div class="d-flex mx-20 mt-20 mb-10">
      <div class="ml-auto">
        <pg-button class="ml-20" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyOperationAdd">新增运营专区</pg-button>
      </div>
    </div>

    <div class="card mx-20">
      <div class="card-body">
        <pg-table
          fixed-header
          :data="list.items"
          primary-key="id"
          :page="query.page"
          :page-size="query.page_size"
          borderless
        >
          <pg-column prop="title" title="名称" width="200px"></pg-column>
          <pg-column prop="remark" title="概述" width="100px"></pg-column>
          <pg-column prop="rank" title="排序" width="120px"></pg-column>
          <pg-column prop="created" title="创建时间" width="200px"></pg-column>
          <pg-column prop="" title="操作" width="120px">
            <template v-slot="{row}">
              <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyOperationModify">修改</a>
              <pg-confirm @confirm="handleDeleteItem(row)" help-text="确认删除该运营专区" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyOperationDelete">
                <a class="mr-10 text-decoration-none">删除</a>
              </pg-confirm>
              <a class="text-decoration-none" @click="handleOperationItem(row)" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyOperationItemQuery">专区商品</a>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="operationQuery"/>
      </div>
    </div>

    <pg-dialog :title="`${dialog.type === 'add' ? '新增' : '修改'}运营专区`" width="780px" v-model="dialog.visible">
      <operation-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer :title="`${drawer.operation.title} 专区商品`" width="600px" v-model="drawer.visible">
      <operation-item
        v-if="drawer.visible"
        :operation="drawer.operation"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import operationEdit from './operation-edit';
  import operationItem from './operation-item';

  export default {
    name: 'operation',
    components: {operationEdit, operationItem},
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
          operation: {},
        },
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
      this.operationQuery();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.operationQuery();
      },

      resetQuery() {
        this.initQuery();
        this.operationQuery();
      },

      operationQuery() {
        Http.get(Api.operationQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleAddItem() {
        this.$data.dialog = { type: 'add', visible: true, item: {} };
      },

      handleModifyItem(item) {
        this.$data.dialog = { type: 'modify', visible: true, item: item };
      },

      handleDeleteItem(item) {
        Http.post(Api.operationDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '运营专区删除成功' });
            this.operationQuery();
          });
      },

      handleOperationItem(item) {
        this.$data.drawer = { visible: true, operation: item };
      },

      handleSubmit() {
        this.handleCancel();
        this.operationQuery();
      },

      handleCancel() {
        this.$data.dialog = { type: 'add', visible: false, item: {} };
      },

    }

  }
</script>

<style lang="scss" scoped>

</style>
