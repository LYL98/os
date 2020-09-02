<template>
  <pg-form item-width="350px" ref="form" key="subitem" :disabled="type === 'detail'">

    <h3 class="mb-20">基础信息</h3>
    <div class="row no-gutters">
      <pg-form-item label="活动类型" :rules="{required: true}">
        <pg-button-group v-model="formData.act_type" :options="{ '限时抢购': 'flash','秒杀': 'seckill'  }" @change="changeQuery"></pg-button-group>
      </pg-form-item>
    </div>

    
    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="活动名称" rules="required|max_length:15" help-text="活动名称长度不超过15个字符，新增成功后不可再次编辑">
          <pg-input placeholder="请输入活动名称" v-model="formData.title"></pg-input>
        </pg-form-item>
      </div>
      <div class="col-6">
        <pg-form-item label="活动日期" rules="required">
          <pg-datepicker :limit="{from: today}" placeholder="请指定活动开展的日期" v-model="formData.act_date"></pg-datepicker>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="开始时间" :rules="{required: true}">
          <pg-timepicker placeholder="活动的开始时间" v-model="formData.begin_time" @change="changeBeginTime"></pg-timepicker>
        </pg-form-item>
      </div>
      <div class="col-6">
        <pg-form-item label="结束时间" :rules="{required: true, logic: end_time_validator}">
          <pg-timepicker placeholder="活动的结束时间" v-model="formData.end_time"></pg-timepicker>
        </pg-form-item>
      </div>
    </div>

    <h3 class="mb-20">活动商品</h3>
    <pg-search
      style="width: 430px"
      :options="comp_item_list"
      placeholder="请输入商品编号/名称，筛选并添加需要参加活动的商品"
      @select="onSelectItem"
      @change="commonItemList"
      auto-complete
      immediate
      debounce
    >
    </pg-search>
    <pg-table
      style="width: 900px"
      :data="formData.items"
      primary-key="item_id"
      borderless
      :serialable="false"
      placeholder="暂无活动商品"
    >
      <pg-column title="商品编号/名称" width="240px" class="position-relative">
        <template v-slot="{row}">
          {{row.item_code}}/{{row.item_title}}
        </template>
      </pg-column>
      <pg-column title="销售价" width="70px">
        <template v-slot="{row}">
          ¥{{row.price_sale}}
        </template>
      </pg-column>
      <pg-column title="活动价">
        <template v-slot="{row}">
          <pg-form-item item-width="80px" :rules="{required: true, 'min_value:0.01': true}" class="pb-0">
            <pg-input size="sm" suffix="元" type="decimal" v-model="row.act_price"></pg-input>
          </pg-form-item>
        </template>
      </pg-column>
      <pg-column title="返利金额">
        <template v-slot="{row}">
          <pg-form-item item-width="80px" rules="required" class="pb-0">
            <pg-input size="sm" suffix="元" type="decimal" v-model="row.cash_back"></pg-input>
          </pg-form-item>
        </template>
      </pg-column>
      <pg-column title="活动库存" class="position-relative">
        <template v-slot="{row}">
          <span class="position-absolute" style="top: 3px;">当前库存：{{ row.stock }}件</span>
          <pg-form-item item-width="80px" :rules="{required: true, 'min_value:1': true, [`logic:${row.stock}`]: act_stock_validator}" class="pb-0">
            <pg-input size="sm" suffix="件" type="number" v-model="row.act_stock" @change="changeActStock(row)"></pg-input>
          </pg-form-item>
        </template>
      </pg-column>
      <pg-column title="客户限购数">
        <template v-slot="{row}">
          <pg-form-item
            class="pb-0"
            item-width="90px"
            :label="`客户限购数${row.item_id}`"
            :show-label="false"
            :rules="{[`logic:${row.item_id}`]: act_stock_validator}"
          >
            <pg-input size="sm" suffix="件/人" type="number" v-model="row.purchase_limit"></pg-input>
          </pg-form-item>
        </template>
      </pg-column>
      <pg-column title="操作" width="60px">
        <template v-slot="{row}">
          <a class="text-decoration-none" @click="onRemoveItem(row)">移除</a>
        </template>
      </pg-column>
    </pg-table>

    <div class="row no-gutters mt-30" v-if="type !== 'detail'">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'seckill-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      let today = new Date();
      today = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

      const province_code = this.app.userInfo.province_code;
      return {
        today: today,

        formData: {
          act_type: 'flash',
          title: '',
          act_date: '',
          begin_time: '',
          end_time: '',
          province_code: province_code,
          items: []

        },

        itemList: [],

        loading: false,
      }
    },

    computed: {
      comp_item_list() {
        return this.$data.itemList.filter(item => !this.$data.formData.items.some(d => d.item_id === item.id));
      }
    },

    created() {
      this.Handle = Handle;
      this.commonItemList();

      this.end_time_validator = {
        validate: (v) => {
          if (!this.$data.formData.begin_time) return true;
          return new Date('2020-01-01 ' + this.$data.formData.begin_time).getTime() < new Date('2020-01-01 ' + v).getTime();
        },
        getMsg: '结束时间必须大于开始时间'
      };

      this.act_stock_validator = {
        validate: (v, n) => {
          let stock = Number(n[0]);
          return v <= stock;
        },
        getMsg: '不能大于当前库存'
      };

      this.purchase_limit_validator = {
        validate: (v, n) => {
          const item_id = Number(n[0]);
          const row = this.$data.formData.items.find(item => item.item_id === item_id);
          if (!row) return true;
          return v <= Number(row.act_stock);
        },
        getMsg: '不能大于活动库存'
      };


      if (this.$props.type === 'modify') {
        const { id, title, act_type, act_date, begin_time, end_time, province_code, items} = this.$props.item;
        this.$data.formData = {
          act_id: id,
          title,
          act_type,
          act_date,
          begin_time,
          end_time,
          province_code,
          items: (items || []).map(item => ({
            item_id: item.item_id,
            item_code: item.code,
            item_title: item.title,
            price_origin: Handle.returnPrice(item.price_origin),
            price_sale: Handle.returnPrice(item.price_sale),
            act_price: Handle.returnPrice(item.act_price),
            cash_back: Handle.returnPrice(item.cash_back),
            stock: item.stock,
            act_stock: Number(item.act_stock),
            purchase_limit: Number(item.purchase_limit)
          }))
        };
      }
    },
    methods: {

      changeBeginTime(v) {
        if (v && this.$data.formData.end_time) {
          this.$refs['form']?.validate('结束时间');
        }
      },

      changeActStock(row) {
        if (row.act_stock && row.purchase_limit) {
          this.$refs['form']?.validate(`客户限购量${row.item_id}`);
        }
      },

      onSubmit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          const formData = {...this.$data.formData};

          if (formData.items.length === 0) {
            this.$toast({ type: 'warning', message: '活动商品不能为空' });
            return;
          }

          formData.items = formData.items.map(item => ({
            item_id: item.item_id,
            act_price: Handle.handlePrice(item.act_price),
            cash_back: Handle.handlePrice(item.cash_back),
            act_stock: Number(item.act_stock),
            purchase_limit: Number(item.purchase_limit)
          }));

          this.$data.loading = true;
          const type = this.$props.type;
          Http.post(type === 'add' ? Api.activitySeckillAdd : Api.activitySeckillModify, formData)
            .then(() => {
              this.$toast({ type: 'success', message: `活动${type === 'add' ? '新增' : '修改'}成功` });
              this.$data.loading = false;
              this.$emit('submit');
            })
            .catch(() => {
              this.$data.loading = false;
            });
        });

      },

      onSelectItem(item) {
        this.$data.formData.items = [
          ...this.$data.formData.items,
          {
            item_id: item.id,
            item_code: item.code,
            item_title: item.title,
            price_origin: Handle.returnPrice(item.price_origin),
            price_sale: Handle.returnPrice(item.price_sale),
            act_price: '',
            cash_back: Handle.returnPrice(item.price_divide),
            stock: item.stock,
            act_stock: '',
            purchase_limit: ''
          }
        ];
      },

      onRemoveItem(item) {
        this.$data.formData.items = this.$data.formData.items.filter(d => d.item_id !== item.item_id);
      },

      commonItemList(condition = '') {
        Http.get(Api.commonItemList, {
          province_code: this.app.userInfo.province_code,
          condition: condition,
          need_num: 30,
          is_deleted: 0,
        })
          .then(res => {
            console.log(res);
            this.$data.itemList = (res.data || [])
              .map(item => ( { ...item, value: item.id, label: item.code + ' / ' + item.title })).filter((item)=>{
                return(item.item_type === 'operation' && !item.is_presale)
              });
          })
      },

      onCancel() {
        this.$emit('cancel');
      },

    }
  }
</script>

<style scoped>
  .pg-table tbody td {
    padding: 20px 10px;
  }
</style>
