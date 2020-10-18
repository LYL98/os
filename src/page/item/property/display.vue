<template>
  <div>

    <div class="card mx-20 mb-10 mt-20">
      <div class="card-header border-bottom-solid d-flex">
          <div class="ml-auto my-10 mr-10" v-if="app.auth.isAdmin || app.auth.ItemDisplayClassAdd">
              <pg-button class="ml-20" color="primary" @click="handleAddItem(null)">新增一级展示分类</pg-button>
          </div>
      </div>
      <div class="card-body">
        <pg-table
          fixed-header
          :data="list"
          primary-key="id"
          borderless
          expandAll
        >
          <pg-column prop="title" title="名称" width="200"></pg-column>
          <pg-column prop="rank" title="排序" width="150"></pg-column>
          <pg-column prop="remark" title="备注" width="150">
            <template v-slot="{row}">
              <div class="pre">
                {{row.remark || '-'}}
              </div>
            </template>
          </pg-column>
          <pg-column prop="created" title="创建时间" width="150"></pg-column>
          <pg-column prop="" title="操作" width="140px">
            <template v-slot="{row}">
              <a class="mr-10 text-decoration-none" @click="handleAddItem(row)" v-if="app.auth.isAdmin || app.auth.ItemDisplayClassAdd">添加子分类</a>
              <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.ItemDisplayClassEdit">修改</a>
              <pg-confirm @confirm="handleDeleteItem(row)" help-text="确认删除该展示分类" v-if="app.auth.isAdmin || app.auth.ItemDisplayClassDelete">
                <a class="mr-10 text-decoration-none">删除</a>
              </pg-confirm>
            </template>
          </pg-column>
          <template v-slot:expand-row="{row}">
            <pg-table
                class=" p-15"
                :data="row.childs"
                primary-key="id"
                borderless
                :highlight-row="false"
              >
              <pg-column prop="title" title="名称" width="200"></pg-column>
              <pg-column prop="rank" title="排序" width="150"></pg-column>
              <pg-column prop="remark" title="备注" width="150">
                <template v-slot="{row}">
                  <div class="pre">
                    {{row.remark || '-'}}
                  </div>
                </template>
              </pg-column>
              <pg-column prop="created" title="创建时间" width="150"></pg-column>
              <pg-column prop="" title="" width="140px">
                <template v-slot="{row}">
                  <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.ItemDisplayClassEdit">修改</a>
                  <pg-confirm @confirm="handleShowDelete(row)" help-text="确认删除该展示分类" v-if="app.auth.isAdmin || app.auth.ItemDisplayClassDelete">
                    <a class="mr-10 text-decoration-none">删除</a>
                  </pg-confirm>
                </template>
              </pg-column>
            </pg-table>
          </template>
        </pg-table>
      </div>
      <div class="card-footer">
      </div>
    </div>

    <pg-dialog :title="dialog.title" v-model="dialog.visible" :width="dialog.type === 'delete' ? '700px' : '550px'">
      <display-add-edit
        v-if="dialog.visible && dialog.type !== 'delete'"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
      <display-delete
        v-if="dialog.visible && dialog.type === 'delete'"
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
  import displayAddEdit from './display-add-edit';
  import displayDelete from './display-delete';


  export default {
    name: 'display',
    components: {displayAddEdit,displayDelete},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: [],
        dialog: {
          type: 'add',
          visible: false,
          item: {},
          title:''
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
      this.basicdataDisplayClassList();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.basicdataDisplayClassList();
      },

      resetQuery() {
        this.initQuery();
        this.basicdataDisplayClassList();
      },

      basicdataDisplayClassList() {
        Http.get(Api.basicdataDisplayClassList, this.$data.query)
          .then(res => {
            this.$data.list = res.data || []
          });
      },

      handleAddItem(item={}) {
        this.$data.dialog = { type: 'add', visible: true, item: item || {}, title: '新增展示分类' };
      },

      handleModifyItem(item) {
        this.$data.dialog = { type: 'modify', visible: true, item: item ,title: '修改展示分类'};
      },
      //删除一级分类
      handleDeleteItem(item) {
        Http.post(Api.basicdataDisplayClassDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '展示分类删除成功' });
            this.basicdataDisplayClassList();
          });
      },
      //删除二级分类
      handleShowDelete(item){
        if(item.is_bind_item === false){
          Http.post(Api.basicdataDisplayClassDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '展示分类删除成功' });
            this.basicdataDisplayClassList();
          });
        }else{
            this.$data.dialog = { type: 'delete', visible: true, item: item ,title: `删除 "${item.title}" 分类`};
        }
      },

      handleSubmit() {
        this.handleCancel();
        this.basicdataDisplayClassList();
      },

      handleCancel() {
        this.$data.dialog = { type: 'add', visible: false, item: {}, title:'' };
      },

    }

  }
</script>

<style lang="scss" scoped>
  .pre {
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
}
.border-bottom-solid{
    border-bottom: 1px solid #ddd;
}
</style>
