<template>
  <div class="p-20">
    <div class="d-flex">
      <div class="ml-auto">
        <pg-button color="primary" @click="handleAddItem">新增定时任务</pg-button>
      </div>
    </div>

    <div class="card mt-10">
      <div class="card-header font-weight-bolder">
        <pg-tabs v-model="query.status" @change="changeQuery">
          <pg-tab index="">全部</pg-tab>
          <pg-tab v-for="item in Constant.SUBITEM_SCHEDULER_STATUS()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
        </pg-tabs>
      </div>
      <div class="card-body">
        <pg-table
          fixed-header
          :data="list.items"
          primary-key="id"
          :page="query.page"
          :page-size="query.page_size"
          borderless
        >
          <pg-column title="类型" prop="opt_type" width="100px">
            <template v-slot="{row}">
              {{ row.opt_type === 'on_shelf' ? '上架' : '下架' }}
            </template>
          </pg-column>
          <pg-column prop="effect_time" title="生效时间" width="140px">
            <template v-slot="{row}">
              {{ row.effect_time || '-' }}
            </template>
          </pg-column>
          <pg-column title="状态" width="120px" text-align="center">
            <template v-slot="{row}">
              <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                <span :class="`status-dot mr-5 bg-${Constant.SUBITEM_SCHEDULER_STATUS('color')[row.status]}`"></span>
                {{ Constant.SUBITEM_SCHEDULER_STATUS('enum')[row.status] || row.status || '-' }}
              </div>
            </template>
          </pg-column>
          <pg-column prop="creator" title="创建人" width="120px">
            <template v-slot="{row}">
              {{ row.creator || '-' }}
            </template>
          </pg-column>
          <pg-column prop="created" title="创建时间" width="140px">
            <template v-slot="{row}">
              {{ row.created || '-' }}
            </template>
          </pg-column>
          <pg-column prop="" title="操作" width="120px">
            <template v-slot="{row}">
              <!--  待售功能 -->
              <a class="mr-10 text-decoration-none" @click="handleDetailItem(row)">查看商品</a>
              <pg-confirm
                help-text="确认作废定时任务"
                @confirm="handleStopItem(row)"
                v-if="!row.is_stopped && !row.is_effective"
              >
                <a class="text-decoration-none">作废</a>
              </pg-confirm>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="schedulerQuery"/>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" title="新增定时上下架任务">
      <subitem-scheduler-edit
        v-if="dialog.visible"
        :type="dialog.type"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" :title="`商品列表`" width="500px">
      <subitem-scheduler-items
        v-if="drawer.visible"
        :items="drawer.items"
      />
    </pg-drawer>

  </div>

</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';

  import subitemSchedulerEdit from './subitem-scheduler-edit';
  import subitemSchedulerItems from './subitem-scheduler-items';

  export default {
    name: 'subitem-scheduler',
    components: {subitemSchedulerEdit, subitemSchedulerItems},
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          visible: false,
          type: 'on',
          item: {}
        },
        drawer: {
          visible: false,
          items: []
        },
        systemClassTree: [],
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
      this.schedulerQuery();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          status: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.schedulerQuery();
      },

      resetQuery() {
        this.initQuery();
        this.schedulerQuery();
      },

      schedulerQuery() {
        Http.get(Api.subitemSchedulerQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleAddItem() {
        this.$data.dialog = { visible: true, type: 'add', item: {} };
      },

      handleDetailItem(item) {
        this.$data.drawer = { visible: true, items: item.items || [] };
      },

      handleStopItem(item) {
        Http.post(Api.subitemSchedulerStop, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '定时任务已作废' });
            this.schedulerQuery();
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.schedulerQuery();
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
