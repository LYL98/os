<template>
  <div class="pg-page">

    <div class="p-20" v-if="(app.auth.isAdmin || app.auth.BscMerchantBlacklistAdd)">
      <div class="d-flex">
        <pg-search placeholder="门店、商户名称" style="width:300px;" v-model="query.condition" clearable @change="changeQuery" />
        <pg-button color="primary" class="ml-auto" @click="handleAddItem">新增</pg-button>
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
            <pg-column title="门店名称" prop="title" width="200px">
              <template v-slot="{row}">
                {{ row.title || '-' }}
              </template>
            </pg-column>
            <pg-column title="所属商户" prop="merchant_title" width="300px">
              <template v-slot="{row}">
                {{ row.merchant_title || '-' }}
              </template>
            </pg-column>
            <pg-column title="加入时间" prop="black_time" width="140px">
              <template v-slot="{row}">
                {{ row.black_time || '-' }}
              </template>
            </pg-column>
            <pg-column title="操作人" prop="operator" width="120px">
              <template v-slot="{row}">
                {{ row.operator || '-' }}
              </template>
            </pg-column>
            <pg-column title="操作" width="60px">
              <template v-slot="{row}">
                <pg-confirm
                  v-if="(app.auth.isAdmin || app.auth.BscMerchantBlacklistRemove)"
                  help-text="确认将该门店从黑名单移除"
                  @confirm="handleRemoveItem(row)"
                >
                  <a class="text-decoration-none">移除</a>
                </pg-confirm>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer">
          <pg-pagination :num="list.num" v-model="query" @change="blacklistQuery"/>
        </div>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" :title="`${dialog.type === 'add' ? '新增' : '修改'}黑名单`">
      <blacklist-edit
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
  import blacklistEdit from './blacklist-edit';

  export default {
    name: 'merchant-blacklist',
    components: { blacklistEdit },
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          visible: false,
          type: 'add',
          item: {}
        },
        loading: false,
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      document.title = '黑名单 - 商城 - 蒲公英运营管理系统';
      this.initQuery();
      this.blacklistQuery();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.blacklistQuery();
      },

      resetQuery() {
        this.initQuery();
        this.blacklistQuery();
      },

      blacklistQuery() {
        Http.get(Api.merchantBlacklistQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleAddItem() {
        this.$data.dialog = { visible: true, type: 'add', item: {} };
      },

      handleRemoveItem(item) {
        Http.post(Api.merchantBlacklistRemove, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '门店成功移除黑名单' });
            this.blacklistQuery();
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.blacklistQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, type: 'add', item: {} };
      },

    }

  }
</script>

<style lang="scss" scoped>

</style>
