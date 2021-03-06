<template>
  <div>
    <div class="d-flex">
      <pg-button-group :options="{ '全部': '', '进行中': 'processing', '已完成': 'finished' }" v-model="query.status" @change="changeQuery"></pg-button-group>

      <pg-confirm @confirm="handleClearItems" help-text="确认清空所有记录？" class="ml-auto">
        <pg-button flat :disabled="list.num <= 0">清空所有记录</pg-button>
      </pg-confirm>
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
      <pg-column title="任务名称" prop="title" width="160px">
        <template v-slot="{row}">
          <span :class="row.status === 'finished' && !row.is_notify ? 'font-weight-bolder' : ''">{{ row.title }}</span>
        </template>
      </pg-column>
      <pg-column title="开始时间" prop="created" width="140px">
        <template v-slot="{row}">
          <span :class="row.status === 'finished' && !row.is_notify ? 'font-weight-bolder' : ''">{{ row.created }}</span>
        </template>
      </pg-column>
      <pg-column title="状态" prop="status" width="100px">
        <template v-slot="{row}">
          <span v-if="row.status === 'finished'" :class="row.is_notify ? '' : 'font-weight-bolder'">已完成</span>
          <div v-else-if="row.status === 'processing'" class="growth">进行中 ...</div>
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
      this.exportQuery();
    },

    exportQuery() {
      const notificationCheck = this.$props.notificationCheck;
      typeof notificationCheck === 'function' && notificationCheck('list', this.$data.query);
    },

    handleDownloadItem(item) {
      this.$loading.show();
      Http.download(this.$props.notification_api.exportDownload, { id: item.id },{ filename: item.title + '.xls' })
        .then(() => {
          this.$loading.hide();
          !item.is_notify && this.handleModifyItem(item);
        })
        .catch(() => {
          this.$loading.hide();
        })
    },

    handleDeleteItem(item) {
      Http.post(this.$props.notification_api.exportDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '导出任务删除成功' });
            this.exportQuery();
          });
    },

    handleClearItems() {
      Http.post(this.$props.notification_api.exportClear)
        .then(() => {
          this.$toast({ type: 'success', message: '导出记录已清空' });
          this.exportQuery();
        });
    },

    // 修改为已读
    handleModifyItem(item) {
      Http.post(this.$props.notification_api.exportNotifyModify, { ids: [item.id] })
        .then(() => {
          item.is_notify = true;
        });
    },
  }

}
</script>

<style scoped>
  .growth {
    overflow: hidden;
    animation: growthWidth 2s infinite;
  }

  @keyframes growthWidth
  {
    from { width: 38px; }
    to { width: 50px; }
  }
</style>
