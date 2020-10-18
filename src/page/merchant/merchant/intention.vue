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
      <pg-search class="ml-20 w-25" placeholder="门店名称" clearable v-model="query.condition" @change="changeQuery"/>
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>

    <div class="card mt-10">
      <div class="card-header p-10 d-flex justify-content-end" style="border-bottom: 1px solid #ddd;">
        <pg-button v-if="app.auth.isAdmin || app.auth.IntentionMerchantExport" @click="handleExport">
          导出意向客户
        </pg-button>
        <pg-button class="ml-20" color="primary" v-if="app.auth.isAdmin || app.auth.IntentionMerchantAdd" @click="handleAddItem">
          新增
        </pg-button>
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
          <pg-column title="门店名称" width="220px">
            <template v-slot="{row}">
              <a class="text-dark" v-if="app.auth.isAdmin || app.auth.IntentionMerchantDetail" @click="handleDetailItem(row)">
                {{ row.store_title || '-' }}
              </a>
              <span v-else>{{ row.store_title || '-' }}</span>
            </template>
          </pg-column>
          <pg-column title="县域" width="120px">
            <template v-slot="{row}">
              {{ row.city && row.city.title || '-' }}
            </template>
          </pg-column>
          <pg-column title="门店地址" width="300px">
            <template v-slot="{row}">
              {{ row.address || '-' }}
            </template>
          </pg-column>
          <pg-column prop="" title="操作" width="120px">
            <template v-slot="{row}">

              <a class="text-decoration-none mr-10" v-if="app.auth.isAdmin || app.auth.IntentionMerchantEdit" @click="handleModifyItem(row)">修改</a>
              <a class="text-decoration-none mr-10" v-if="app.auth.isAdmin || app.auth.IntentionMerchantAudit" @click="handleAuditItem(row)">激活</a>

              <pg-confirm
                help-text="确认删除该意向客户"
                v-if="app.auth.isAdmin || app.auth.IntentionMerchantDelete"
                @confirm="handleDeleteItem(row)"
              >
                <a class="text-decoration-none">删除</a>
              </pg-confirm>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="intentionQuery"/>
      </div>
    </div>

    <pg-dialog
      v-model="dialog.visible"
      :title="`${dialog.type === 'add' ? '新增' : dialog.type === 'modify' ? '修改' : dialog.type === 'audit' ? '激活' : ''} 意向客户`"
      width="900px"
    >
      <merchant-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        module="intention"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-drawer v-model="drawer.visible" :title="`意向客户详情`" width="900px">
      <div :style="`height: ${app.windowHeight - 80}px; overflow-y: auto;`">
        <merchant-edit
          v-if="drawer.visible"
          :type="drawer.type"
          :item="drawer.item"
          module="intention"
        />
      </div>
    </pg-drawer>

  </div>

</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

import merchantEdit from './merchant-edit';

export default {
  name: 'intention',
  components: {merchantEdit},
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
    this.intentionQuery();
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
      this.intentionQuery();
    },

    resetQuery() {
      this.initQuery();
      this.intentionQuery();
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

    intentionQuery() {
      Http.get(Api.intentionMerchantQuery, this.$data.query)
        .then(res => {
          this.$data.list = res.data || {items: []}
        });
    },

    handleAddItem() {
      this.$data.dialog = {visible: true, type: 'add', item: {}};
    },

    handleDetailItem(item) {
      Http.get(Api.intentionMerchantDetail, {id: item.id})
        .then(res => {
          this.$data.drawer = {visible: true, type: 'detail', item: res.data || {} };
        });
    },

    handleModifyItem(item) {
      Http.get(Api.intentionMerchantDetail, {id: item.id})
        .then(res => {
          this.$data.dialog = {visible: true, type: 'modify', item: res.data || {} };
        });
    },

    handleAuditItem(item) {
      Http.get(Api.intentionMerchantDetail, {id: item.id})
        .then(res => {
          this.$data.dialog = {visible: true, type: 'audit', item: { ...(res.data || {}), intention_merchant_id: item.id } };
        });
    },

    handleDeleteItem(item) {
      this.$loading.show();
      Http.post(Api.intentionMerchantDelete, {id: item.id})
        .then(() => {
          this.intentionQuery();
          this.$toast({message: '意向客户删除成功', type: 'success'});
          this.$loading.hide();
        })
        .catch(() => {
          this.$loading.hide();
        });
    },

    handleExport() {
      this.$loading.show();
      const query = this.$data.query;
      Http.get(Api.intentionMerchantExportCheck, query)
        .then(() => {
          return Http.download(Api.intentionMerchantExport, query, {filename: '意向客户列表.xls'})
        })
        .then(() => {
          this.$loading.hide();
        })
        .catch(() => {
          this.$loading.hide();
        });
    },

    handleSubmit() {
      this.handleCancel();
      this.intentionQuery();
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
