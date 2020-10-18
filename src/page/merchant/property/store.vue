<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-search class="w-25" clearable v-model="query.condition" @change="changeQuery"></pg-search>
      <pg-button class="ml-auto" color="primary" v-if="app.auth.isAdmin || app.auth.MerchantStoreTagsAdd" @click="handleAddItem">新增</pg-button>
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
          <pg-column prop="title" title="名称" width="120px"></pg-column>
          <pg-column prop="updated" title="标签项" width="500px">
            <template v-slot="{row}">
              <span class="mr-5 badge py-0 badge-primary" v-for="item in row.child_tags" :key="item.id">{{ item.title }}</span>
            </template>
          </pg-column>
          <pg-column prop="updated" title="创建时间" width="140px">
            <template v-slot="{row}">
              {{ row.created || '-' }}
            </template>
          </pg-column>
          <pg-column title="操作" width="90px">
            <template v-slot="{row}">
              <a
                class="text-decoration-none mr-10"
                v-if="(app.auth.isAdmin || app.auth.MerchantStoreTagsEdit)"
                @click="handleModifyItem(row)"
              >修改</a>
              <pg-confirm
                v-if="(app.auth.isAdmin || app.auth.MerchantStoreTagsDelete)"
                help-text="确认删除该门店标签"
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

    <pg-dialog v-model="dialog.visible" :title="`${dialog.type === 'add' ? '新增' : '修改'}门店标签`">
      <store-edit
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
import storeEdit from './store-edit';

export default {
  name: 'inner',
  components: { storeEdit },
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
    this.initQuery();
    this.storeQuery();
  },

  methods: {

    initQuery() {
      this.$data.query = { condition: '' };
    },

    changeQuery() {
      this.storeQuery();
    },

    storeQuery() {
      Http.get(Api.merchantPropertyStoreTagList, this.$data.query)
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
      Http.post(Api.merchantPropertyStoreTagDelete, { id: item.id })
        .then(() => {
          this.$toast({ type: 'success', message: '门店标签删除成功' });
          this.storeQuery();
        });
    },

    handleSubmit() {
      this.handleCancel();
      this.storeQuery();
    },

    handleCancel() {
      this.$data.dialog = { visible: false, type: 'add', item: {} };
    },
  }

}
</script>
