<template>
  <div class="pg-page">

    <div class="pg-page-header">
      <pg-select v-model="query.province_code" class="ml-auto mr-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>
    </div>

    <div class="p-20">

      <div class="d-flex" v-for="(zone, index) in cityList" :key="zone.zone_id" :class="{ 'mb-10': index === cityList.length - 1 }">
        <div class="zone-title">{{ zone.zone_title }}</div>
        <div class="city-container">
          <template v-for="city in zone.list">
            <pg-button :key="city.id" v-if="city.id === query.city_id" size="sm" color="primary">{{ city.title }}</pg-button>
            <pg-button :key="city.id" v-else flat @click="changeCity(city)" size="sm">{{ city.title }}</pg-button>
          </template>
        </div>
      </div>

      <div class="d-flex">
        <pg-datepicker
          style="width: 450px;"
          v-model="query"
          begin-date-key="update_begin"
          end-date-key="update_end"
          range
          quickable
          @change="changeQuery"
          clearable
          placeholder="生效日期"
        ></pg-datepicker>
        <pg-search class="ml-20 w-25" placeholder="商品编号/名称" v-model="query.topic" @change="changeQuery"></pg-search>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
      </div>

      <div class="d-flex mt-10">
        <pg-button color="primary" outline :disabled="multipleSelection.length <= 0" @click="handleModifyItems(multipleSelection)" v-if="app.auth.isAdmin || app.auth.MarketingStrategyCityModify">批量修改</pg-button>
        <pg-confirm
          @confirm="handleDeleteItems(multipleSelection)"
          help-text="确认删除所选商品的县域定价"
          v-if="app.auth.isAdmin || app.auth.MarketingStrategyCityDelete"
        >
          <pg-button class="ml-10" outline color="primary" :disabled="multipleSelection.length <= 0">批量删除</pg-button>
        </pg-confirm>
        <pg-button class="ml-auto" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.MarketingStrategyCityAdd">新增</pg-button>
      </div>

      <div class="card mt-10">
        <div class="card-body">
          <pg-table
            fixed-header
            :data="list.items"
            primary-key="id"
            :page="query.page"
            :page-size="query.page_size"
            checkable
            borderless
            @selection="onSelection"
          >
            <template v-slot:discount>
              浮动率
              <pg-column-sort v-model="query.sort" asc="discount" desc="-discount" @change="changeQuery"></pg-column-sort>
            </template>

            <pg-column title="商品编号/名称" width="260px">
              <template v-slot="{row}">
                {{ row.item && row.item.code }} / {{ row.item && row.item.title }}
              </template>
            </pg-column>
            <pg-column title="定价" width="80px">
              <template v-slot="{row}">
                <span v-if="row.item && row.item.price_sale">¥{{ Handle.returnPrice(row.item.price_sale) }}</span>
                <span v-else>未报价</span>
              </template>
            </pg-column>
            <pg-column title="浮动率" prop="discount" width="80px">
              <template v-slot="{row}">
                {{ Handle.returnDiscount(row.discount) }}%
              </template>
            </pg-column>
            <pg-column title="浮动价格" width="80px">
              <template v-slot="{row}">
                <span v-if="row.item && row.item.price_sale">
                  ￥{{ Handle.returnPrice(Handle.returnDiscount(row.item.price_sale * row.discount / 100)) }}
                </span>
                <span v-else>未报价</span>
              </template>
            </pg-column>
            <pg-column title="总库存" width="110px">
              <template v-slot="{row}">
                <span v-if="row.item && row.item.item_stock">{{ row.item.item_stock }}件</span>
                <span v-else>-</span>
              </template>
            </pg-column>
            <pg-column title="已售数量" width="110px">
              <template v-slot="{row}">
                <span v-if="row.item && row.item.sale_already">{{ row.item.sale_already }}件</span>
                <span v-else>-</span>
              </template>
            </pg-column>
            <pg-column title="生效时间" width="140px">
              <template v-slot="{row}">
                {{ row.updated || '-' }}
              </template>
            </pg-column>
            <pg-column title="操作" width="90px">
              <template v-slot="{row}">
                <a v-if="app.auth.isAdmin || app.auth.MarketingStrategyCityModify" @click="handleModifyItems([row])" class="text-decoration-none mr-10">修改</a>
                <pg-confirm
                  @confirm="handleDeleteItems([row])"
                  help-text="确认删除所选商品的县域定价"
                  v-if="app.auth.isAdmin || app.auth.MarketingStrategyCityDelete"
                >
                  <a class="text-decoration-none">删除</a>
                </pg-confirm>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer d-flex">
          <pg-button outline color="primary" :disabled="multipleSelection.length <= 0" @click="handleModifyItems(multipleSelection)" v-if="app.auth.isAdmin || app.auth.MarketingStrategyCityModify">批量修改</pg-button>
          <pg-confirm
            @confirm="handleDeleteItems(multipleSelection)"
            help-text="确认删除所选商品的县域定价"
            v-if="app.auth.isAdmin || app.auth.MarketingStrategyCityDelete"
          >
            <pg-button class="ml-10" outline color="primary" :disabled="multipleSelection.length <= 0">批量删除</pg-button>
          </pg-confirm>
          <pg-pagination class="ml-auto" :num="list.num" v-model="query" @change="cityPriceQuery"/>
        </div>
      </div>
    </div>

    <pg-dialog :title="`${dialog.type === 'add' ? '新增' : '修改'} 县域定价`" v-model="dialog.visible">
      <city-price-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :city="selectedCity"
        :items="dialog.items"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

  </div>
</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

import cityPriceEdit from './city-price-edit';

export default {
  name: 'scope',
  inject: ['app'],
  components: { cityPriceEdit },
  data() {
    return {
      query: {},
      list: {
        items: [],
      },
      dialog: {
        type: 'add',
        visible: false,
        items: [],
      },
      drawer: {
        visible: false,
        item: {}
      },
      provinceListAuth: [],
      cityList: [],

      multipleSelection: []
    }
  },

  computed: {
    selectedCity() {
      let zone = this.$data.cityList.find(item => item.list.some(d => d.id === this.$data.query.city_id));
      if (!zone) return { id: '', title: '' };
      let city = zone.list.find(item => item.id === this.$data.query.city_id);
      if (!city) return { id: '', title: '' };
      return city;
    }
  },

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    document.title = '县域定价 - 商城 - 蒲公英运营管理系统';
    this.initQuery();
    this.commonProvinceListAuth();
    this.commonCityList();
  },

  methods: {

    onSelection(items) {
      this.$data.multipleSelection = items;
    },

    changeProvince(province_code) {
      this.app.changeProvince(province_code);
      this.$data.query.province_code = province_code;
      this.commonCityList();
    },

    initQuery() {
      this.$data.query = {
        province_code: this.app.userInfo.province_code,
        city_id: '',
        sort: '',
        discount: '',
        condition: '',
        update_begin: '',
        update_end: '',
        page: 1,
        page_size: 20
      }
    },

    changeCity(city) {
      this.$data.query.city_id = city.id;
      this.changeQuery();
    },

    changeQuery() {
      this.$data.query.page = 1;
      this.cityPriceQuery();
    },

    resetQuery() {
      let city_id = this.$data.query.city_id;
      this.initQuery();
      this.$data.query.city_id = city_id;
      this.cityPriceQuery();
    },

    cityPriceQuery() {
      Http.get(Api.activityCityPriceQuery, this.$data.query)
        .then(res => {
          this.$data.list = res.data || { items: [] }
        });
    },

    handleAddItem() {
      this.$data.dialog = { type: 'add', visible: true, item: {} };
    },

    handleModifyItems(items) {
      this.$data.dialog = { type: 'modify', visible: true, items: [...items], };
    },

    handleDeleteItems(items) {
      const ids = items.map(item => item.id);
      this.$loading.show();
      Http.post(Api.activityCityPriceDelete, { ids })
        .then(() => {
          this.$toast({  message: '县域定价删除成功', type: 'success'});
          this.$loading.hide();
          this.cityPriceQuery();
        })
        .catch(() => {
          this.$loading.hide();
        })
    },

    handleSubmit() {
      this.handleCancel();
      this.cityPriceQuery();
    },

    handleCancel() {
      this.$data.dialog = { type: 'add', visible: false, item: {} };
    },

    commonProvinceListAuth() {
      Http.get(Api.commonProvinceListAuth)
        .then(res => {
          this.$data.provinceListAuth = res.data || [];
        });
    },

    commonCityList() {
      Http.get(Api.commonCityList, {province_code: this.app.userInfo.province_code})
        .then(res => {
          let rd = res.data || [];
          let cityList = [];

          rd.forEach(item => {
            let zone = cityList.find(d => d.zone_id === item.zone.id);
            if (zone) {
              zone.list.push(item);
            } else {
              cityList.push({ zone_id: item.zone.id, zone_title: item.zone.title, list: [item] })
            }
          });

          this.$data.cityList = cityList
            .sort((zone1, zone2) => {
              return zone1.zone_title.localeCompare(zone2.zone_title, 'zh')
            })
            .map(item => {
              item.list.sort((param1, param2) => {
                return param1.title.localeCompare(param2.title,"zh");
              });
              return item;
            });

          if (cityList.length > 0 && cityList[0].list.length > 0) {
            this.$data.query.city_id = cityList[0].list[0].id;
            this.cityPriceQuery();
          }

        });
    },
  }

}
</script>

<style scoped>
  .zone-title {
    line-height: 24px;
    min-width: 60px;
  }

  .city-container .pg-button {
    color: #888;
    padding-left: 8px;
    padding-right: 8px;
  }

  .city-container .pg-button.primary {
    color: #FFF;
  }
</style>
