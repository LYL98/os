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
      <div class="d-flex">
        <pg-datepicker
          style="width: 450px;"
          v-model="query"
          begin-date-key="step_price_update_begin"
          end-date-key="step_price_update_end"
          range
          quickable
          @change="changeQuery"
          clearable
          placeholder="生效日期"
        ></pg-datepicker>
        <pg-cascader
          class="ml-20"
          :options="systemClassTree"
          v-model="query.system_class_code"
          @change="changeQuery"
          placeholder="按科学分类筛选"
          clearable
        />
        <pg-search class="ml-20 w-25" placeholder="商品编号/名称" v-model="query.topic" @change="changeQuery"></pg-search>
        <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
      </div>

      <div class="d-flex mt-10">
        <pg-button color="primary" outline :disabled="multipleSelection.length <= 0" @click="handleModifyItems(multipleSelection)" v-if="app.auth.isAdmin || app.auth.MarketingStrategyStepModify">批量修改</pg-button>
        <pg-confirm
          @confirm="handleDeleteItems(multipleSelection)"
          help-text="确认删除所选商品的阶梯定价"
          v-if="app.auth.isAdmin || app.auth.MarketingStrategyStepDelete"
        >
          <pg-button class="ml-10" outline color="primary" :disabled="multipleSelection.length <= 0">批量删除</pg-button>
        </pg-confirm>
        <pg-button class="ml-auto" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.MarketingStrategyStepAdd">新增</pg-button>
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
            <pg-column title="商品编号/名称" width="260px">
              <template v-slot="{row}">
                <div class="overflow-ellipsis">{{ row.code }}</div>
                <div class="overflow-ellipsis">{{ row.title }}</div>
              </template>
            </pg-column>
            <pg-column title="定价" width="100px">
              <template v-slot="{row}">
                <span v-if="row.price_sale">¥{{ Handle.returnPrice(row.price_sale) }}</span>
                <span v-else>未报价</span>
              </template>
            </pg-column>
            <pg-column title="阶梯优惠" width="150px">
              <template v-slot="{row}">
                <div v-if="Array.isArray(row.step_prices) && row.step_prices.length >= 1">
                  <div class="overflow-ellipsis" v-for="(item, index) in row.step_prices" :key="index">
                    满{{item.num}}件 ¥{{row.float_type === 'amount' ? Handle.returnPrice(row.price_sale + item.float_amount) : Handle.returnPrice(Handle.returnDiscount(row.price_sale * item.discount / 100))}}
                  </div>
                </div>
                <div v-else>-</div>
              </template>
            </pg-column>
            <pg-column title="生效时间" width="110px">
              <template v-slot="{row}">
                <div>{{ typeof row.step_prices_updated === 'string' ? row.step_prices_updated.substring(0, 10) : '-' }}</div>
                <div>{{ typeof row.step_prices_updated === 'string' ? row.step_prices_updated.substring(11) : '-' }}</div>
              </template>
            </pg-column>
            <pg-column title="总库存" width="110px">
              <template v-slot="{row}">
                <span v-if="!!row.item_stock">{{ row.item_stock }}件</span>
                <span v-else>-</span>
              </template>
            </pg-column>
            <pg-column title="已售数量" width="110px">
              <template v-slot="{row}">
                <span v-if="!!row.sale_already">{{ row.sale_already }}件</span>
                <span v-else>-</span>
              </template>
            </pg-column>
            <pg-column title="操作" width="90px">
              <template v-slot="{row}">
                <a v-if="app.auth.isAdmin || app.auth.MarketingStrategyStepModify" @click="handleModifyItems([row])" class="text-decoration-none mr-10">修改</a>
                <pg-confirm
                  @confirm="handleDeleteItems([row])"
                  help-text="确认删除所选商品的阶梯定价"
                  v-if="app.auth.isAdmin || app.auth.MarketingStrategyStepDelete"
                >
                  <a class="text-decoration-none">删除</a>
                </pg-confirm>
              </template>
            </pg-column>
          </pg-table>
        </div>
        <div class="card-footer d-flex">
          <pg-button outline color="primary" :disabled="multipleSelection.length <= 0" @click="handleModifyItems(multipleSelection)" v-if="app.auth.isAdmin || app.auth.MarketingStrategyStepModify">批量修改</pg-button>
          <pg-confirm
            @confirm="handleDeleteItems(multipleSelection)"
            help-text="确认删除所选商品的阶梯定价"
            v-if="app.auth.isAdmin || app.auth.MarketingStrategyStepDelete"
          >
            <pg-button class="ml-10" outline color="primary" :disabled="multipleSelection.length <= 0">批量删除</pg-button>
          </pg-confirm>
          <pg-pagination class="ml-auto" :num="list.num" v-model="query" @change="stepPriceQuery"/>
        </div>
      </div>
    </div>

    <pg-dialog :title="`${dialog.type === 'add' ? '新增' : '修改'} 阶梯定价`" v-model="dialog.visible">
      <step-price-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :items="dialog.items"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

  </div>
</template>
<script>

import {Http, Api, Handle, Constant} from '@/util';

import stepPriceEdit from './step-price-edit';

export default {
  name: 'scope',
  inject: ['app'],
  components: { stepPriceEdit },
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
      systemClassTree: [],

      multipleSelection: []
    }
  },

  created() {
    this.Handle = Handle;
    this.Constant = Constant;
    document.title = '阶梯定价 - 商城 - 蒲公英运营管理系统';
    this.initQuery();
    this.commonProvinceListAuth();
    this.commonSystemClassTree();
    this.stepPriceQuery();
  },

  methods: {

    onSelection(items) {
      this.$data.multipleSelection = items;
    },

    changeProvince(province_code) {
      this.app.changeProvince(province_code);
      this.$data.query.province_code = province_code;
      this.changeQuery();
    },

    initQuery() {
      this.$data.query = {
        province_code: this.app.userInfo.province_code,
        has_step_price: 1, // 表示查询具有阶梯定价的商品
        is_on_sale: 1, // 已上架
        is_gift: 0, // 不是赠品
        system_class_code: '',
        sort: '',
        discount: '',
        condition: '',
        step_price_update_begin: '',
        step_price_update_end: '',
        page: 1,
        page_size: 20
      }
    },

    changeQuery() {
      this.$data.query.page = 1;
      this.stepPriceQuery();
    },

    resetQuery() {
      this.initQuery();
      this.stepPriceQuery();
    },

    stepPriceQuery() {
      Http.get(Api.activityStepPriceQuery, this.$data.query)
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
      Http.post(Api.activityStepPriceDelete, { ids })
        .then(() => {
          this.$toast({  message: '阶梯定价删除成功', type: 'success'});
          this.$loading.hide();
          this.stepPriceQuery();
        })
        .catch(() => {
          this.$loading.hide();
        })
    },

    handleSubmit() {
      this.handleCancel();
      this.stepPriceQuery();
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

    commonSystemClassTree() {
      Http.get(Api.commonSystemClassTree)
        .then(res => {
          this.$data.systemClassTree = res.data || [];
        });
    },
  }

}
</script>

<style scoped>
</style>
