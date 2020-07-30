<template>
  <div>

    <div class="d-flex mx-20 mt-20 mb-10">
      <div class="ml-auto">
        <pg-button class="ml-20" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyDisplayAdd">新增展示分类</pg-button>
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
          <pg-column prop="title" title="名称" width="200"></pg-column>
          <pg-column prop="rank" title="排序" width="150"></pg-column>
          <pg-column prop="created" title="创建时间" width="200"></pg-column>
          <pg-column prop="" title="操作" width="100px">
            <template v-slot="{row}">
              <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyDisplayModify">修改</a>
              <pg-confirm @confirm="handleDeleteItem(row)" help-text="确认删除该展示分类" v-if="app.auth.isAdmin || app.auth.ClsItemPropertyDisplayDelete">
                <a class="mr-10 text-decoration-none">删除</a>
              </pg-confirm>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="displayClassQuery"/>
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
        dialog: {
          type: 'add',
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
      console.log('this.app.auth', this.app.auth);
      this.Handle = Handle;
      this.initQuery();
      this.displayClassQuery();
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
        this.displayClassQuery();
      },

      resetQuery() {
        this.initQuery();
        this.displayClassQuery();
      },

      displayClassQuery() {
        Http.get(Api.displayClassQuery, this.$data.query)
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
        Http.post(Api.displayClassDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '展示分类删除成功' });
            this.displayClassQuery();
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.displayClassQuery();
      },

      handleCancel() {
        this.$data.dialog = { type: 'add', visible: false, item: {} };
      },

    }

  }
</script>

<style lang="scss" scoped>

</style>
