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
      <pg-datepicker
        style="width: 450px"
        class="ml-20"
        quickable
        range
        clearable
        v-model="query"
        @change="changeQuery"
        placeholder="开始日期 ～ 结束日期"
      />
    </div>
    <div class="d-flex mt-10">
      <pg-search style="width: 356px;" placeholder="门店名称、电话" clearable v-model="query.store_title" @change="changeQuery"/>
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>

    <div class="mt-10">
      <div class="card-header font-weight-bolder">
        <pg-tabs v-model="query.reason" @change="changeQuery">
          <pg-tab index="" class="-ml-20">全部</pg-tab>
          <pg-tab v-for="item in Constant.MERCHANT_REFUND_REASON()" :index="item.value" :key="item.value">
            {{ item.label }}
          </pg-tab>
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
          :serialable="false"
          :height="`${app.windowHeight - 320}px`"
        >
          <pg-column title="时间" width="140px">
            <template v-slot="{row}">
              {{ row.created }}
            </template>
          </pg-column>
          <pg-column title="门店" width="120px">
            <template v-slot="{row}">
              {{ row.store_title || '-' }}
            </template>
          </pg-column>
          <pg-column title="筐数变动" width="90px">
            <template v-slot="{row}">
              <div v-if="row.frame_num == row.frame_num_old">-</div>
              <div v-else :class="(row.frame_num > row.frame_num_old ? 'text-danger' : row.frame_num < row.frame_num_old ? 'text-success' : '')">
                {{ row.frame_num > row.frame_num_old ? '+' : '-'}}{{ Math.abs(row.frame_num - row.frame_num_old) }}
              </div>
            </template>
          </pg-column>
          <pg-column title="金额变动" width="90px">
            <template v-slot="{row}">
              <div v-if="row.frame_amount == row.frame_amount_old">-</div>
              <div v-else :class="(row.frame_amount > row.frame_amount_old ? 'text-danger' : row.frame_amount < row.frame_amount_old ? 'text-success' : '')">
                {{ row.frame_amount > row.frame_amount_old ? '+￥' : '-￥'}}{{ Handle.returnPrice(Math.abs(row.frame_amount - row.frame_amount_old)) }}
              </div>
            </template>
          </pg-column>
          <pg-column title="修改类型" width="80px">
            <template v-slot="{row}">
              {{ Constant.MERCHANT_REFUND_REASON('enum')[row.reason] || row.reason || '-' }}
            </template>
          </pg-column>
          <pg-column title="备注" width="200px">
            <template v-slot="{row}">
              {{ row.remark || '-' }}
            </template>
          </pg-column>
          <pg-column title="修改人" width="90px">
            <template v-slot="{row}">
              {{ row.operator_name || '-' }}
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="refundLogQuery"/>
      </div>
    </div>

  </div>

</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

export default {
  name: 'refund-detail',
  components: {},
  inject: ['app'],
  data() {
    return {
      query: {},
      list: {
        items: [],
      },
      provinceList: [],//区域列表
      cityList: [],
    }
  },

  watch: {},

  created() {
    console.log('created');
    this.Handle = Handle;
    this.Constant = Constant;
    this.commonProvinceList();
    this.initQuery();
    this.refundLogQuery();
  },

  methods: {
    initQuery() {
      this.$data.query = {
        province_code: '',
        city_id: '',
        store_title: '',
        reason: '',
        begin_date: '',
        end_date: '',
        page: 1,
        page_size: 20,
      }
    },

    changeQuery() {
      this.$data.query.page = 1;
      this.refundLogQuery();
    },

    resetQuery() {
      this.initQuery();
      this.refundLogQuery();
    },

    changeProvince() {
      this.$data.cityList = [];
      this.$data.query.city_id = '';
      this.commonCityList();
      this.refundLogQuery();
    },

    refundLogQuery() {
      Http.get(Api.merchantRefundLogQuery, this.$data.query)
        .then(res => {
          this.$data.list = res.data || {items: []}
        });
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
