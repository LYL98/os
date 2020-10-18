<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-select
        v-model="query.province_code"
        :clearable="false"
        class="ml-0"
        placeholder="按区域筛选"
        @change="changeProvince"
      >
        <pg-option :key="1" :value="''">全部</pg-option>
        <pg-option v-for="item in provinceList" :key="item.code" :value="item.code">{{ item.title }}</pg-option>
      </pg-select>
      <pg-select
        v-model="query.zone_id"
        :clearable="query.city_id ? false : true"
        class="ml-20"
        placeholder="按片区筛选"
        :disabled="query.province_code ? false : true"
        @change="changeZone"
      >
        <pg-option v-for="item in zoneList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
      </pg-select>
      <pg-select
        v-model="query.city_id"
        :clearable="true"
        class="ml-20"
        placeholder="按县域筛选"
        :disabled="query.province_code ? query.zone_id ? false : true : true"
        @change="changeQuery"
      >
        <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
      </pg-select>
      <pg-search class="ml-20" placeholder="门店名称" clearable v-model="query.condition" @change="changeQuery"/>
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
      <pg-button class="ml-auto" color="primary" @click="handleLogs" v-if="app.auth.isAdmin || app.auth.MerchantRefundLogQuery">退筐变更记录</pg-button>
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
          <pg-column title="门店名称" width="220px">
            <template v-slot="{row}">
              {{ row.title || '-' }}
            </template>
          </pg-column>
          <pg-column title="县域" width="120px">
            <template v-slot="{row}">
              {{ row.city && row.city.title || '-' }}
            </template>
          </pg-column>
          <pg-column title="已退筐数" width="100px">
            <template v-slot="{row}">
              {{ row.frame_num_real || '-' }}
            </template>
          </pg-column>
          <pg-column title="剩余筐数" width="100px">
            <template v-slot="{row}">
              {{ row.frame_num || '-' }}
            </template>
          </pg-column>
          <pg-column title="已退金额" width="100px">
            <template v-slot="{row}">
              {{ !!row.frame_amount_real ? `¥${Handle.returnPrice(row.frame_amount_real)}` : '-' }}
            </template>
          </pg-column>
          <pg-column title="剩余金额" width="100px">
            <template v-slot="{row}">
              {{ !!row.frame_amount ? `¥${Handle.returnPrice(row.frame_amount)}` : '-' }}
            </template>
          </pg-column>
          <pg-column prop="" title="操作" width="80px">
            <template v-slot="{row}">
              <a class="text-decoration-none" v-if="app.auth.isAdmin || app.auth.MerchantRefundEdit" @click="handleModifyItem(row)">修改</a>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="refundQuery"/>
      </div>
    </div>

    <pg-dialog
      v-model="dialog.visible"
      :title="`${dialog.type === 'add' ? '新增' : dialog.type === 'modify' ? '修改' : dialog.type === 'audit' ? '激活' : ''} 意向客户`"
      width="430px"
    >
      <refund-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" title="退筐变更记录" width="900px">
      <refund-detail
        v-if="drawer.visible"
        :type="drawer.type"
        :item="drawer.item"
      />
    </pg-drawer>

  </div>

</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

import refundEdit from './refund-edit';
import refundDetail from './refund-detail';

export default {
  name: 'refund',
  components: {refundEdit, refundDetail},
  inject: ['app'],
  data() {
    return {
      query: {},
      list: {
        items: [],
      },
      dialog: {
        visible: false,
        type: 'modify',
        item: {}
      },
      drawer: {
        type: 'detail',
        visible: false,
        item: {}
      },
      provinceList: [],//区域列表
      zoneList: [],
      cityList: [],
      salesmanList: [],
      vipList: [],
    }
  },

  watch: {},

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    this.initQuery();
    this.commonProvinceList();
    this.refundQuery();
  },

  methods: {
    initQuery() {
      this.$data.query = {
        province_code: '',
        zone_id: '',
        city_id: '',
        condition: '',
        page: 1,
        page_size: 20,
      }
    },

    changeQuery() {
      this.$data.query.page = 1;
      this.refundQuery();
    },

    resetQuery() {
      this.initQuery();
      this.refundQuery();
    },
    changeProvince() {
      this.$data.zoneList = [];
      this.$data.cityList = [];
      this.$data.query.zone_id = '';
      this.$data.query.city_id = '';

      this.commonZoneList();
      this.changeQuery()
    },
    changeZone() {
      this.$data.cityList = [];
      this.$data.query.city_id = '';
      this.commonCityList();
      this.changeQuery();
    },

    refundQuery() {
      Http.get(Api.storeQuery, this.$data.query)
        .then(res => {
          this.$data.list = res.data || {items: []}
        });
    },

    handleLogs() {
      this.$data.drawer = {visible: true, type: 'detail', item: {}};
    },

    handleAddItem() {
      this.$data.dialog = {visible: true, type: 'add', item: {}};
    },

    handleModifyItem(item) {
      this.$data.dialog = {visible: true, type: 'modify', item: item };
    },

    handleSubmit() {
      this.handleCancel();
      this.refundQuery();
    },

    handleCancel() {
      this.$data.dialog = {visible: false, type: 'add', item: {}};
    },

    //区域列表
    commonProvinceList() {
      Http.get(Api.commonProvinceListAuth).then(res => {
        this.$data.provinceList = res.data || [];
      });
    },
    //片区列表
    commonZoneList() {
      Http.get(Api.commonZoneList, {
        province_code: this.$data.query.province_code
      }).then(res => {
        this.$data.zoneList = res.data || [];
      });
    },
    //县域列表
    commonCityList() {
      Http.get(Api.commonCityList, {
        province_code: this.$data.query.province_code,
        zone_id: this.$data.query.zone_id
      }).then(res => {
        this.$data.cityList = res.data || [];
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
