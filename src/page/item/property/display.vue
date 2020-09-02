<template>
  <div>

    <div class="d-flex mx-20 mt-20 mb-10">
      <pg-button-group v-model="tree_expend" :options="{ '全部折叠': false, '全部展开': true }"></pg-button-group>
      <div class="ml-auto">
        <pg-button class="ml-20" color="primary" @click="handleAddTop" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyDisplayAdd">新增一级分类</pg-button>
      </div>
    </div>

    <div class="card mx-20 py-20">
      <div class="card-body">
        <pg-tree
          :checkable="false"
          :options="tree"
          :expend="tree_expend"
        >
          <template v-slot="{node, level}">
            <div class="pl-10">
              <a class="ml-10" @click="handleAddItem(node)" v-if="level === 1 && (app.auth.isAdmin || app.auth.ClsItemPropertyDisplayAdd)">添加子类</a>
              <a class="ml-10" @click="handleModifyItem(node)" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyDisplayModify">编辑</a>
              <a class="ml-10" @click="handleDeleteItem(node)" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyDisplayDelete">删除</a>
            </div>
          </template>
        </pg-tree>
      </div>
    </div>

    <pg-dialog :title="`${dialog.type === 'add' ? '新增' : '修改'}展示分类`" v-model="dialog.visible" width="600px">
      <display-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import displayEdit from './display-edit';

  export default {
    name: 'display',
    components: {displayEdit},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },

        tree: { childs: [] },
        tree_expend: false,

        dialog: {
          type: 'top',
          visible: false,
          item: {},
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
      this.displayClassTree();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
        }
      },

      changeQuery() {
        this.displayClassTree();
      },

      resetQuery() {
        this.initQuery();
        this.displayClassTree();
      },

      displayClassTree() {
        Http.get(Api.displayClassTree, this.$data.query)
          .then(res => {

            this.$data.tree = { childs: res.data || [] };
          });
      },

      handleAddTop() {
        this.$data.dialog = { type: 'top', visible: true, item: {} };
      },

      handleAddItem(item) {
        console.log('item', item);
        this.$data.dialog = { type: 'add', visible: true, item: item };
      },

      handleModifyItem(item) {
        this.$data.dialog = { type: 'modify', visible: true, item: item };
      },

      handleDeleteItem(item) {
        if (!window.confirm("确定删除该展示分类?")) return;
        Http.post(Api.displayClassDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '展示分类删除成功' });
            this.displayClassTree();
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.displayClassTree();
      },

      handleCancel() {
        this.$data.dialog = { type: 'top', visible: false, item: {} };
      },

    }

  }
</script>

<style lang="scss" scoped>

</style>
