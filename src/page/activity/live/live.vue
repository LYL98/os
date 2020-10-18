<template>
  <div class="p-20">

    <div class="d-flex">
      <pg-select clearable placeholder="全部" v-model="query.province_code" @change="changeQuery">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>
    </div>

    <div class="card mt-10">
      <div class="card-header font-weight-bolder">
        <pg-tabs v-model="query.live_status" @change="changeQuery">
          <pg-tab index>全部</pg-tab>
          <pg-tab
            v-for="item in Constant.ACTIVITY_LIVE_STATUS()"
            :index="item.value"
            :key="item.value"
          >{{item.label}}</pg-tab>
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
          <pg-column title="房间号" width="60px">
            <template v-slot="{row}">{{ row.roomid }}</template>
          </pg-column>
          <pg-column title="直播间标题" width="200px">
            <template v-slot="{row}">{{ row.name || '-' }}</template>
          </pg-column>
          <pg-column title="开播时间" width="120px">
            <template v-slot="{row}">
              {{ row.start_time  || '-' }}
            </template>
          </pg-column>
          <pg-column title="直播区域" width="240px">
            <template v-slot="{row}">
              {{row.province_titles.length > 0 ? row.province_titles.join(" 、 ") : '-'}}
            </template>
          </pg-column>
          <pg-column title="状态" width="70px" text-align="center">
            <template v-slot="{row}">
              <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                <span :class="`status-dot mr-5 bg-${Constant.ACTIVITY_LIVE_STATUS('color')[row.live_status]}`"></span>
                <span>{{ Constant.ACTIVITY_LIVE_STATUS('enum')[row.live_status] || row.live_status || '-' }}</span>
              </div>
            </template>
          </pg-column>
          <pg-column title="操作" width="70px">
            <template v-slot="{row}">
              <a
                class="text-decoration-none"
                v-if="(app.auth.isAdmin || app.auth.LiveVideoProvinceEdit) && row.live_status === 102"
                @click="handleModifyItem(row)"
              >设置区域</a>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="liveQuery"/>
      </div>
    </div>

    <pg-dialog title="直播区域设置" v-model="dialog.visible">
      <live-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        :province-list="provinceListAuth"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>
  </div>

</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

import liveEdit from './live-edit';

export default {
  name: 'scope',
  inject: ['app'],
  components: { liveEdit },
  data() {
    return {
      query: {},
      list: {
        items: [],
      },
      dialog: {
        type: 'modify',
        visible: false,
        item: {},
      },
      provinceListAuth: [],
    }
  },

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    document.title = '直播管理 - 商城 - 蒲公英运营管理系统';
    this.initQuery();
    this.commonProvinceListAuth();
    this.liveQuery();
  },

  methods: {

    initQuery() {
      this.$data.query = {
        province_code: '',
        live_status: '',
        page: 1,
        page_size: 20
      }
    },

    changeQuery() {
      this.$data.query.page = 1;
      this.liveQuery();
    },

    resetQuery() {
      this.initQuery();
      this.liveQuery();
    },

    liveQuery() {
      Http.get(Api.activityLiveQuery, this.$data.query)
        .then(res => {
          this.$data.list = res.data || { items: [] }
        });
    },

    handleModifyItem(row) {
      this.$data.dialog = { type: 'modify', visible: true, item: row };
    },

    handleSubmit() {
      this.handleCancel();
      this.liveQuery();
    },

    handleCancel() {
      this.$data.dialog = { type: 'modify', visible: false, item: {} };
    },

    commonProvinceListAuth() {
      Http.get(Api.commonProvinceListAuth)
        .then(res => {
          this.$data.provinceListAuth = res.data || [];
        });
    },

  }

}
</script>

<style scoped>
.status-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
</style>
