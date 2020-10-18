<template>
  <div>

    <div class="card mx-20 mb-10 mt-20">
      <div class="card-header font-weight-bolder d-flex border-bottom-solid">
        <div>
          <pg-tabs v-model="query.display_place" @change="changeQuery" class="no-border-bottom">
            <pg-tab index="">全部</pg-tab>
            <pg-tab v-for="item in Constant.ITEM_TAGS_DISPLAY()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
          </pg-tabs>
        </div>
        
         <div class="ml-auto my-10 mr-10">
          <pg-button class="ml-20" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.ItemTagsAdd">新增运营专区</pg-button>
        </div>
        
      </div>
      <div class="card-body">
        <pg-table
          fixed-header
          :data="list"
          primary-key="id"
          borderless
        >
          <pg-column title="名称" >
            <template v-slot="{row}">
              {{ row.title }}
            </template>
          </pg-column>
           <pg-column title="展示位置" >
            <template v-slot="{row}">
              {{ Constant.ITEM_TAGS_DISPLAY('enum')[row.display_place] || row.display_place || '-'}}
            </template>
          </pg-column>
          <pg-column title="排序" width="80px">
            <template v-slot="{row}">
              {{ row.rank }}
            </template>
          </pg-column>
          <pg-column title="创建时间" >
            <template v-slot="{row}">
              {{ row.created || '-' }}
            </template>
          </pg-column>
          <pg-column prop="" title="操作" width="180px">
            <template v-slot="{row}">
              <!-- help-text="确认删除该运营专区 ? 慎用：该专区内的运营商品会被全部删除" -->
              <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.ItemTagsEdit">修改</a>
              <pg-confirm @confirm="handleDeleteItem(row)"  v-if="app.auth.isAdmin || app.auth.ItemTagsDelete">
                <template v-slot:help-text>
                  <div style="width:100px;text-align: left;">
                    确认删除?
                  </div>
                  <div>
                    该专区内的商品会被全部删除
                  </div>
                </template>
                <a class="mr-10 text-decoration-none">删除</a>
              </pg-confirm>
              <a class="text-decoration-none" @click="handleOperationItem(row)" v-if="app.auth.isAdmin || app.auth.ItemQueryByItemTag">专区商品</a>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
      </div>
    </div>

    <pg-dialog :title="`${dialog.type === 'add' ? '新增' : '修改'}运营专区`" width="780px" v-model="dialog.visible">
      <operation-add-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer :title="`${drawer.operation.title} 专区商品`" width="800px" v-model="drawer.visible">
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

  import { Http, Api, Handle, Constant } from '@/util';
  import operationAddEdit from './operation-add-edit';
  import operationItem from './operation-item';

  export default {
    name: 'operation',
    components: {operationAddEdit, operationItem},
    inject: ['app'],
    data() {
      return {
        query: {},
        list:[],
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
      this.Constant = Constant;
      this.initQuery();
      this.basicdataItemTagsList();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          display_place: ''
        }
      },

      changeQuery() {
        this.basicdataItemTagsList();
      },

      resetQuery() {
        this.initQuery();
        this.basicdataItemTagsList();
      },

      basicdataItemTagsList() {
        Http.get(Api.basicdataItemTagsList, this.$data.query)
          .then(res => {
            this.$data.list = res.data || []
          });
      },

      handleAddItem() {
        this.$data.dialog = { type: 'add', visible: true, item: {} };
      },

      handleModifyItem(item) {
        this.$data.dialog = { type: 'modify', visible: true, item: item };
      },

      handleDeleteItem(item) {
        Http.post(Api.basicdataItemTagsDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '运营专区删除成功' });
            this.basicdataItemTagsList();
          });
      },

      handleOperationItem(item) {
        this.$data.drawer = { visible: true, operation: item };
      },

      handleSubmit() {
        this.handleCancel();
        this.basicdataItemTagsList();
      },

      handleCancel() {
        this.$data.dialog = { type: 'add', visible: false, item: {} };
      },

    }

  }
</script>

<style lang="scss" scoped>
.no-border-bottom{
  border-bottom: 0;
}
.border-bottom-solid{
    border-bottom: 1px solid #ddd;
}
</style>
