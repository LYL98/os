<template>
  <div class="city-price px-10">

    <div class="d-flex" v-if="type === 'add'">
      <pg-cascader
        :options="systemClassTree"
        v-model="query.system_class_code"
        @change="changeQuery"
        placeholder="按科学分类筛选"
        clearable
      />
      <pg-cascader
        class="ml-20"
        :level="2"
        primary-key="id"
        parent-key="parent_id"
        :options="displayClassTree"
        v-model="query.display_class_id"
        @change="changeQuery"
        placeholder="按展示分类筛选"
        clearable
      />
      <pg-search class="w-25 ml-20" placeholder="商品编号、名称" clearable v-model="query.condition" @change="changeQuery"/>
    </div>

    <div class="pg-transfer mt-20" :style="type === 'add' ? 'width: 900px;' : 'width: 550px;'">
      <template v-if="type === 'add'">
        <div class="pg-transfer-table-wrapper unselected" style="min-width: 260px;">
          <pg-table
            :data="filterItems"
            checkable
            primary-key="id"
            placeholder=""
            :serialable="false"
            :highlight-row="false"
            height="300px"
            borderless
            @selection="handleSelectionChange"
          >
            <pg-column prop="title" title="商品列表"></pg-column>
          </pg-table>
        </div>
        <div class="selector" style="min-width: 75px;">
          <pg-button color="primary" circle size="sm" @click="intoEditList" :disabled="selectedList.length <= 0">
            <i class="icon-arrow-right22" style="font-size: 20px" :class="{ 'text-light': selectedList.length <= 0, 'text-white': selectedList.length > 0 }"></i>
          </pg-button>
          <pg-button color="primary" circle size="sm" class="mt-20" @click="removeEditList" :disabled="removeList.length <= 0">
            <i class="icon-arrow-left22" style="font-size: 20px" :class="{ 'text-light': removeList.length <= 0, 'text-white': removeList.length > 0 }"></i>
          </pg-button>
        </div>
      </template>
      <div class="pg-transfer-table-wrapper selected" style="min-width: 550px;">
        <pg-table
          :data="editList"
          primary-key="id"
          placeholder=""
          :serialable="false"
          :highlight-row="false"
          height="300px"
          borderless
          :checkable="type === 'add'"
          @selection="handleRemoveChange"
        >
          <template v-slot:discount>
            <pg-input class="transfer-input" type="decimal:1" suffix="%" size="sm" placeholder="折扣率" v-model="allDiscount" @change="changeAllDiscount"></pg-input>
          </template>

          <pg-column width="40px" v-if="type === 'add'">
            <template v-slot="{row}">
              <a class="text-decoration-none" @click="singleRemoveItem(row)">移除</a>
            </template>
          </pg-column>

          <pg-column prop="title" title="商品" :width="type === 'add' ? '220px' : '260px'"></pg-column>
          <pg-column prop="price_sale" title="定价" width="80px">
            <template v-slot="{row}">
              {{ !!row.price_sale ? '￥' + Handle.returnPrice(row.price_sale) : '未报价' }}
            </template>
          </pg-column>

          <pg-column prop="discount" :ellipsis="false" title="折扣率" width="80px">
            <template v-slot="{row}">
              <pg-input class="transfer-input" :class="row.discount_error ? 'has-error' : ''" type="decimal:1" size="sm" suffix="%" v-model="row.discount" @change="changeDiscount(row)"></pg-input>
            </template>
          </pg-column>
          <pg-column title="浮动价格" width="80px">
            <template v-slot="{row}">
              {{ !!row.discount && !!row.price_sale ? '￥' + Handle.returnPrice(row.price_sale * row.discount / 100) : '' }}
            </template>
          </pg-column>

        </pg-table>
      </div>
    </div>

    <div class="text-center mt-30">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :disabled="editList.length <= 0" :loading="loading">确定</pg-button>
    </div>
  </div>
</template>

<script>
import { Http, Api, Handle } from '@/util';

export default {
  name: 'scope-edit',
  inject: ['app'],
  props: {
    type: { type: String, default: 'add' },
    city: { type: Object, default() { return { id: "", title: "" } } },
    items: { type: Array, default() { return [] } },
  },
  data() {
    return {
      query: {},

      itemList: [],
      editList: [],

      selectedList: [],
      removeList: [],

      allDiscount: "",

      loading: false,

      systemClassTree: [],
      displayClassTree: [],
    }
  },
  computed: {
    filterItems() {
      return this.$data.itemList.filter(item => !this.editList.some(d => d.item_id === item.id));
    },
  },

  created() {
    this.Handle = Handle;
    if (this.$props.type === 'add') {
      this.initQuery();
      this.commonItemList();
      this.commonSystemClassTree();
      this.commonDisplayClassTree();
    } else {

      this.$data.editList = [...this.$props.items].map(d => {
        return {
          id: d.id,
          item_id: d.item.id,
          code: d.item.code,
          title: d.item.title,
          city_id: this.$props.city.id,
          city_title: this.$props.city.title,
          price_sale: d.item.price_sale,
          discount: Handle.returnDiscount(d.discount),
          discount_error: false
        };
      });

    }

  },

  methods: {

    changeAllDiscount(v) {
      this.$data.editList = this.$data.editList.map(item => {
        item.discount = v;
        item.discount_error = this.validDiscount(v);
        return item;
      });
    },

    changeDiscount(item) {
      item.discount_error = this.validDiscount(item.discount);
    },

    validDiscount(discount) {
      if (!discount) return true;
      if (discount <= 0) return true;
      if (discount >= 10000) return true;
      return false;
    },

    onSubmit() {

      if (this.$data.editList.length <= 0) {
        this.$toast({ type: 'warning', message: '请先选择商品！' });
        return;
      }

      this.$data.editList = this.$data.editList.map(item => {
        item.discount_error = this.validDiscount(item.discount);
        return item;
      });

      if (this.$data.editList.some(item => item.discount_error)) {
        this.$toast({ type: 'danger', message: '请检查输入格式！' });
        return;
      }

      let entries = this.$props.type === 'add'
        ? this.$data.editList.map(item => ({
          city_id: item.city_id,
          item_id: item.item_id,
          discount: Handle.handleDiscount(item.discount)
        }))
        : this.$data.editList.map(item => ({
          id: item.id,
          discount: Handle.handleDiscount(item.discount)
        }));

      let API = this.$props.type === 'add' ? Api.activityCityPriceAdd : Api.activityCityPriceModify;

      this.$data.loading = true;
      Http.post(API, { entries })
        .then(() => {
          this.$toast({ message: `县域定价${this.$props.type === 'add' ? '新增' : '修改'}成功`, type: 'success' });
          this.$emit('submit');
          this.$data.loading = false;
        }).catch(() => {
        this.$data.loading = false;
      });
    },

    onCancel() {
      this.$emit('cancel');
    },

    handleSelectionChange(val) {
      this.$data.selectedList = val;
    },

    intoEditList() {
      if (this.$data.selectedList.length <= 0) return;

      let list = [...this.$data.selectedList].map(item => {
        return {
          item_id: item.id,
          code: item.code,
          title: item.title,
          city_id: this.$props.city.id,
          city_title: this.$props.city.title,
          price_sale: item.price_sale,
          discount: this.$data.allDiscount,
          discount_error: false
        };
      });
      this.$data.editList = [...this.$data.editList, ...list];
      this.$data.selectedList = [];
    },

    // 多选 移除
    handleRemoveChange(val) {
      this.$data.removeList = val;
    },

    // 单项 移除
    singleRemoveItem(item) {
      this.$data.editList = this.$data.editList.filter(d => d.item_id !== item.item_id);
    },

    // 移除
    removeEditList() {
      if (this.$data.removeList.length <= 0) return;
      this.$data.editList = this.$data.editList.filter(
        d => !this.$data.removeList.some(item => item.item_id === d.item_id)
      );
      this.$data.removeList = [];
    },

    initQuery() {
      this.$data.query = {
        province_code: this.app.userInfo.province_code,
        city_id: this.$props.city.id,
        is_all: 0,
        is_gift: 0,
        city_or_level: 1,
        display_class_id: "",
        system_class_codes: '',
        display_class_ids: '',
        condition: "",
      };
    },

    changeQuery() {
      this.commonItemList();
    },

    commonItemList() {
      Http.get(Api.commonItemList, this.$data.query)
        .then(res => {
          this.$data.itemList = (res.data || []);
        });
    },

    commonSystemClassTree() {
      Http.get(Api.commonSystemClassTree)
        .then(res => {
          this.$data.systemClassTree = res.data || [];
        });
    },

    commonDisplayClassTree() {
      Http.get(Api.commonDisplayClassTree, { province_code: this.app.userInfo.province_code })
        .then(res => {
          this.$data.displayClassTree = res.data || [];
        });
    },

  }
}
</script>

<style>

  .city-price .pg-transfer .pg-table thead th,
  .city-price .pg-transfer .pg-table tbody td {
    padding-left: 6px;
    padding-right: 6px;
  }

  .city-price .pg-form-control input {
    padding-left: 6px;
    padding-right: 2px;
  }

  .city-price .pg-form-control .suffix.pr-10 {
    padding-right: 4px !important;
  }

  .city-price .transfer-input {
    width: 100%;
    font-weight: normal;
  }

  .city-price .transfer-input.has-error {
    border-color: #e54545;
  }
</style>
