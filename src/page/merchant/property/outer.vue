<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-button class="ml-auto" color="primary" v-if="app.auth.isAdmin || app.auth.MerchantOuterTagsAdd" @click="handleAddItem">新增</pg-button>
    </div>
    <div class="card mt-10">
      <div class="card-body">
        <pg-table
          :data="list"
          primary-key="id"
          fixed-header
          :serialable="false"
          borderless
        >
          <pg-column prop="title" title="名称" width="180px"></pg-column>
          <pg-column prop="rank" title="排序" width="100px"></pg-column>
          <pg-column prop="updated" title="创建时间" width="140px">
            <template v-slot="{row}">
              {{ row.created || '-' }}
            </template>
          </pg-column>
          <pg-column title="操作" width="90px">
            <template v-slot="{row}">
              <a
                class="text-decoration-none mr-10"
                v-if="(app.auth.isAdmin || app.auth.MerchantOuterTagsEdit)"
                @click="handleModifyItem(row)"
              >修改</a>
              <pg-confirm
                v-if="(app.auth.isAdmin || app.auth.MerchantOuterTagsDelete)"
                help-text="确认删除该商户外标签"
                @confirm="handleDeleteItem(row)"
              >
                <a class="text-decoration-none">删除</a>
              </pg-confirm>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" :title="`${dialog.type === 'add' ? '新增' : '修改'}商户外标签`">
      <outer-edit
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

import { Http, Api, Handle, Constant } from '@/util';
import outerEdit from './outer-edit';

export default {
  name: 'grade',
  components: { outerEdit },
  inject: ['app'],
  data() {
    return {
      query: {},
      list: [],
      dialog: {
        visible: false,
        type: 'add',
        item: {}
      },
    }
  },

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    this.outerQuery();
  },

  methods: {

    outerQuery() {
      Http.get(Api.merchantPropertyOuterTagList)
        .then(res => {
          this.$data.list = res.data || [];
        });
    },

    handleAddItem() {
      this.$data.dialog = { visible: true, type: 'add', item: {} };
    },

    handleModifyItem(item) {
      this.$data.dialog = { visible: true, type: 'modify', item: item };
    },

    handleDeleteItem(item) {
      Http.post(Api.merchantPropertyOuterTagDelete, { id: item.id })
        .then(() => {
          this.$toast({ type: 'success', message: '商户外标签删除成功' });
          this.outerQuery();
        });
    },

    handleSubmit() {
      this.handleCancel();
      this.outerQuery();
    },

    handleCancel() {
      this.$data.dialog = { visible: false, type: 'add', item: {} };
    },
  }

}
</script>
