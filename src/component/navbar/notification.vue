<template>
  <div>
    <div class="d-flex">
      <pg-button-group :options="{ '全部': '', '进行中': 'processing', '已完成': 'finished' }" v-model="query.status" @change="changeQuery"></pg-button-group>

      <pg-button flat class="ml-auto" @click="handleClearItems"> <i class="icon-bin"></i> 清空所有记录</pg-button>
    </div>

    <pg-table
        :data="list.items"
        primary-key="id"
        :page="query.page"
        :page-size="query.page_size"
        :highlight-row="false"
        :height="app.windowHeight - 200 + 'px'"
        borderless
        :serialable="false"
    >
      <pg-column title="任务名称" prop="title" width="160px"></pg-column>
      <pg-column title="开始时间" prop="created" width="140px"></pg-column>
      <pg-column title="状态" prop="status" width="100px">
        <template v-slot="{row}">
          <span v-if="row.status === 'finished'">已完成</span>
          <span v-else-if="row.status === 'processing'">进行中...</span>
          <span v-else>{{ row.status || '-' }}</span>
        </template>
      </pg-column>
      <pg-column title="操作" width="80px">
        <template v-slot="{row}">
          <a class="text-decoration-none mr-10" @click="handleDownloadItem(row)" v-if="row.status === 'finished'">下载</a>
          <pg-confirm @confirm="handleDeleteItem(row)" help-text="确认删除该导出任务？">
            <a class="text-decoration-none">删除</a>
          </pg-confirm>
        </template>
      </pg-column>
    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="changePage"/>
    </div>

  </div>

</template>
<script>

import Http from './../../http/http';

export default {
  name: 'notification',
  props: {
    notification_api: { type: String, default() { return {}; } },
    list: { type: String, default() { return { items: [] }; } },
    notificationCheck: { type: Function, default() { return () => {} } },
  },
  inject: ['app'],
  data() {
    return {
      query: {}
    }
  },

  created() {
    this.initQuery();
    this.exportQuery();
  },

  methods: {

    initQuery() {
      this.$data.query = {
        status: '',
        page: 1,
        page_size: 20
      }
    },

    changeQuery() {
      this.$data.query.page = 1;
      this.exportQuery();
    },

    changePage() {
      const notificationCheck = this.$props.notificationCheck;
      typeof notificationCheck === 'function' && notificationCheck('list', this.$data.query);
    },

    exportQuery() {
      const notificationCheck = this.$props.notificationCheck;
      typeof notificationCheck === 'function' && notificationCheck('list', this.$data.query);
    },

    handleDownloadItem(item) {
      this.$loading.show();
      Http.download(this.$props.notification_api.exportDownload, { filename: item.title + '.xls' })
        .then(() => {
          this.$loading.hide();
          this.handleModifyItem(item);
        })
        .catch(() => {
          this.$loading.hide();
        })
    },

    handleDeleteItem(item) {
      Http.post(this.$props.notification_api.exportDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '导出任务删除成功' });
            this.handleModifyItem(item);
          });
    },

    // 修改为已读
    handleModifyItem(item) {
      Http.post(this.$props.notification_api.exportNotifyModify, { ids: [item.id] })
          .then(() => {
            this.exportQuery();
          });
    },

    handleClearItems() {
      Http.post(this.$props.notification_api.exportClear)
        .then(() => {
          this.$toast({ type: 'success', message: '导出记录已清空' });
          this.exportQuery();
        });
    }
  }

}
</script>
