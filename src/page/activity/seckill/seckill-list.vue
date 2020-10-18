<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-datepicker style="width: 450px;" v-model="query" quickable range clearable @change="changeQuery" />
      <pg-search class="w-25 ml-20" placeholder="活动名称" v-model="query.condition" clearable @change="changeQuery" />
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>

      <pg-button class="ml-auto" color="primary" v-if="app.auth.isAdmin || app.auth.ClsActivitySeckillAdd" @click="handleAddItem">新增</pg-button>
    </div>
    <div class="card mt-10">
      <div class="card-header font-weight-bolder">
        <pg-tabs v-model="query.status" @change="changeQuery">
          <pg-tab index="">全部</pg-tab>
          <pg-tab v-for="item in Constant.ACTIVITY_SECKILL_STATUS()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
        </pg-tabs>
      </div>
      <div class="card-body">
        <pg-table
          :data="list.items"
          primary-key="id"
          :page="query.page"
          :page-size="query.page_size"
          fixed-header
        >
          <template v-slot:expand-row="{row}">
            <div class="p-15">
              <div class="row">
                <div class="col-2">
                  更新人：{{row.last_updater || '-'}}
                </div>
                <div class="col-3">
                  更新时间：{{row.updated || '-'}}
                </div>
                <div class="col-2">
                  审核人：{{row.auditor || '-'}}
                </div>
                <div class="col-3">
                  审核时间：{{row.audit_time || '-'}}
                </div>
              </div>
            </div>
          </template>
          <pg-column prop="title" title="活动名称" width="140px">
            <template v-slot="{row}">
              <a class="text-dark" @click="handleDetailItem(row)">{{ row.title || '-' }}</a>
            </template>
          </pg-column>
          <pg-column prop="act_date" title="活动日期" width="90px"></pg-column>
          <pg-column title="起止时间" width="120px">
            <template v-slot="{row}">
              {{row.begin_time}} ~ {{row.end_time}}
            </template>
          </pg-column>
          <pg-column title="状态" width="80px" text-align="center">
            <template v-slot="{row}">
              <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                <span :class="`status-dot mr-5 bg-${Constant.ACTIVITY_SECKILL_STATUS('color')[row.status]}`"></span>
                {{ Constant.ACTIVITY_SECKILL_STATUS('enum')[row.status] || row.status || '-' }}
              </div>
            </template>
          </pg-column>
          <pg-column title="操作" width="150px">
            <template v-slot="{row}">
              <a
                class="text-decoration-none mr-10"
                v-if="row.status === 'init' && (app.auth.isAdmin || app.auth.ClsActivitySeckillModify)"
                @click="handleModifyItem(row)"
              >修改</a>
              <pg-confirm
                help-text="确认删除该活动"
                v-if="row.status === 'init' && (app.auth.isAdmin || app.auth.ClsActivitySeckillDelete)"
                @confirm="handleDeleteItem(row)"
              >
                <a class="text-decoration-none mr-10">删除</a>
              </pg-confirm>
              <pg-confirm
                help-text="确认审核通过该活动"
                v-if="row.status === 'init' && (app.auth.isAdmin || app.auth.ClsActivitySeckillAudit)"
                @confirm="handleAuditItem(row)"
              >
                <a class="text-decoration-none mr-10">审核</a>
              </pg-confirm>
              <pg-confirm
                help-text="确认取消该活动"
                v-if="row.status === 'ready' && (app.auth.isAdmin || app.auth.ClsActivitySeckillAuditCancel)"
                @confirm="handleAuditCancelItem(row)"
              >
                <a class="text-decoration-none mr-10">取消审核</a>
              </pg-confirm>
              <pg-confirm
                help-text="确认作废该活动"
                v-if="(row.status === 'ready' || row.status === 'processing') && (app.auth.isAdmin || app.auth.ClsActivitySeckillStop)"
                @confirm="handleStopItem(row)"
              >
                <a class="text-decoration-none mr-10">作废</a>
              </pg-confirm>
              <a v-if="(app.auth.isAdmin || app.auth.ClsActivitySeckillLogs)" class="text-decoration-none" @click="handleLogsItem(row)">操作日志</a>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="seckillQuery"/>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" :title="`${dialog.type === 'add' ? '新增' : '修改'}秒杀活动`">
      <seckill-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'detail'" :title="`${drawer.item.title} 活动详情`" width="800px">
      <seckill-detail
        v-if="drawer.visible"
        :item="drawer.item"
      />
    </pg-drawer>

    <pg-drawer v-model="drawer.visible" v-if="drawer.type === 'logs'" :title="`${drawer.item.title} 操作日志`" width="800px">
      <seckill-logs
        v-if="drawer.visible"
        :id="drawer.item.id"
      />
    </pg-drawer>
  </div>
</template>
<script>

  import { Http, Api, Constant } from '@/util';

  import seckillEdit from './seckill-edit';
  import seckillDetail from './seckill-detail';
  import seckillLogs from './seckill-logs';

  export default {
    name: 'seckill-list',
    components: { seckillEdit, seckillDetail, seckillLogs },
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: []
        },
        dialog: {
          visible: false,
          type: 'add',
          item: {}
        },
        drawer: {
          visible: false,
          type: 'detail',
          item: {}
        }
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
      this.Constant = Constant;
      this.initQuery();
      this.seckillQuery();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          status: '',
          begin_date: '',
          end_date: '',
          condition: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.seckillQuery();
      },

      resetQuery() {
        this.initQuery();
        this.seckillQuery();
      },

      seckillQuery() {
        Http.get(Api.activitySeckillQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleDetailItem(item) {
        Http.get(Api.activitySeckillDetail, { act_id: item.id})
          .then(res => {
            this.$data.drawer = { visible: true, type: 'detail', item: res.data || {} };
          });
      },

      handleAddItem() {
        this.$data.dialog = { visible: true, type: 'add', item: {} };
      },

      handleModifyItem(item) {
        Http.get(Api.activitySeckillDetail, { act_id: item.id})
          .then(res => {
            this.$data.dialog = { visible: true, type: 'modify', item: res.data || {} };
          });
      },

      handleAuditItem(item) {
        Http.post(Api.activitySeckillAudit, { act_id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '秒杀活动审核通过' });
            this.seckillQuery();
          });
      },

      handleAuditCancelItem(item) {
        Http.post(Api.activitySeckillAuditCancel, { act_id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '秒杀活动已取消审核' });
            this.seckillQuery();
          });
      },

      handleDeleteItem(item) {
        Http.post(Api.activitySeckillDelete, { act_id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '秒杀活动删除成功' });
            this.seckillQuery();
          });
      },

      handleStopItem(item) {
        Http.post(Api.activitySeckillStop, { act_id: item.id})
          .then(() => {
            this.$toast({ type: 'success', message: '秒杀活动已作废' });
            this.seckillQuery();
          });
      },

      handleLogsItem(item) {
        this.$data.drawer = { visible: true, type: 'logs', item: item };
      },

      handleSubmit() {
        this.handleCancel();
        this.seckillQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, type: 'add', item: {} };
      },
    }

  }
</script>

<style lang="scss" scoped>

  .status-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
</style>
