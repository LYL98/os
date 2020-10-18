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
        v-model="query.city_id"
        :clearable="true"
        class="ml-20"
        placeholder="按县域筛选"
        :disabled="!query.province_code"
        @change="changeQuery"
      >
        <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
      </pg-select>
      <pg-search class="ml-20 w-25" placeholder="门店名称、手机号、客户经理" clearable v-model="query.condition" @change="changeQuery"/>
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>

    <div class="card mt-10">
      <div class="card-header font-weight-bolder">
        <pg-tabs v-model="query.gb_included" @change="changeQuery">
          <pg-tab index="">全部</pg-tab>
          <pg-tab index="1">已开通</pg-tab>
          <pg-tab index="0">未开通</pg-tab>
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
          <pg-column title="门店名称" width="130px">
            <template v-slot="{row}">
              {{ row.title }}
            </template>
          </pg-column>
          <pg-column title="县域" width="80px">
            <template v-slot="{row}">
              {{ row.city || '-' }}
            </template>
          </pg-column>
          <pg-column title="门店信息" width="120px">
            <template v-slot="{row}">
              {{ row.business_ares || '' }} {{ Array.isArray(row.facility) ? row.facility.join(',') : '' }}
            </template>
          </pg-column>
          <pg-column title="门店地址" width="200px">
            <template v-slot="{row}">
              {{ row.address || '-' }}
            </template>
          </pg-column>
          <pg-column title="店主年龄" width="75px">
            <template v-slot="{row}">
              {{ row.kp_age || '-' }}
            </template>
          </pg-column>
          <pg-column title="客户经理" width="90px">
            <template v-slot="{row}">
              {{ row.csm || '-' }}
            </template>
          </pg-column>
          <pg-column title="申请时间" width="90px" style="padding: 5px 10px;">
            <template v-slot="{row}">
              <div>{{ row.created.slice(0, 10) }}</div>
              <div>{{ row.created.slice(11) }}</div>
            </template>
          </pg-column>
          <pg-column title="操作时间" width="90px" style="padding: 5px 10px;">
            <template v-slot="{row}">
              <div>{{ row.updated.slice(0, 10) }}</div>
              <div>{{ row.updated.slice(11) }}</div>
            </template>
          </pg-column>
          <pg-column prop="" title="操作" width="75px">
            <template v-slot="{row}">
              <pg-confirm
                help-text="确认将该开通满天星门店"
                v-if="(app.auth.isAdmin || app.auth.MerchantIncludedApplyPass) && !row.gb_included"
                @confirm="handleApproveItem(row)"
              >
                <a class="text-decoration-none">审核通过</a>
              </pg-confirm>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="applyQuery"/>
      </div>
    </div>

  </div>

</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

export default {
  name: 'apply',
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
    this.applyQuery();
  },

  methods: {
    initQuery() {
      this.$data.query = {
        province_code: '',
        city_id: '',
        condition: '',
        gb_included: '',
        page: 1,
        page_size: 20,
      }
    },

    changeQuery() {
      this.$data.query.page = 1;
      this.applyQuery();
    },

    resetQuery() {
      this.initQuery();
      this.applyQuery();
    },
    changeProvince() {
      this.$data.cityList = [];
      this.$data.query.city_id = '';

      this.commonCityList();
      this.changeQuery();
    },

    applyQuery() {
      Http.get(Api.includedApplyQuery, this.$data.query)
        .then(res => {
          this.$data.list = res.data || {items: []}
        });
    },

    handleApproveItem(item) {
      Http.post(Api.includedApplyPass, {id: item.id})
        .then(() => {
          this.applyQuery();
          this.$toast({message: '已开通满天星门店功能', type: 'success'});
        });
    },

    handleSubmit() {
      this.handleCancel();
      this.applyQuery();
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
    //县域列表
    commonCityList() {
      Http.get(Api.commonCityList, {
        province_code: this.$data.query.province_code,
      }).then(res => {
        this.$data.cityList = res.data || [];
      });
    },
  }
}
</script>

<style scoped>
</style>
