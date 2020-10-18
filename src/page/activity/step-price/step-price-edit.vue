<template>
  <div class="step-price px-10">

    <div class="d-flex position-relative mb-40">
      <template v-if="type === 'add'">
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
      </template>

      <pg-button-group
        class="ml-auto"
        :options="{ '按浮动率调价': 'discount', '按浮动金额调价': 'amount' }"
        :value="float_type"
        @change="changeFloatType"
      ></pg-button-group>

<!--      <pg-confirm class="ml-auto" v-else help-text="切换调价类型，降清空已经填入的浮动值" @confirm="changeFloatType">-->
<!--        <pg-button-group :options="{ '按浮动率调价': 'discount', '按浮动金额调价': 'amount' }" :value="float_type"-->
<!--        ></pg-button-group>-->
<!--      </pg-confirm>-->

      <span class="text-secondary position-absolute right-0 mt-40">按浮动金额调价时：默认为加价；输入负值表示降价</span>
    </div>

    <div class="pg-transfer mt-20" style="width: 1050px; overflow-x: auto;">
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
      <div class="pg-transfer-table-wrapper selected" style="min-width: 1050px;">
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
          <template v-slot:num-0>
            <pg-input class="transfer-input" type="number" suffix="件" size="sm" placeholder="阶梯一" v-model="all_step_prices[0].num" @change="changeAllNum(0)"></pg-input>
          </template>
          <template v-slot:discount-0>
            <pg-input
              :signed="float_type === 'amount'"
              class="transfer-input"
              type="decimal:1"
              :suffix="float_type === 'discount' ? '%' : '元'"
              size="sm"
              :placeholder="`浮动${float_type === 'discount' ? '率' : '金额'}`"
              v-model="all_step_prices[0].discount"
              @change="changeAllDiscount(0)"
            ></pg-input>
          </template>
          <template v-slot:num-1>
            <pg-input class="transfer-input" type="number" suffix="件" size="sm" placeholder="阶梯二" v-model="all_step_prices[1].num" @change="changeAllNum(1)"></pg-input>
          </template>
          <template v-slot:discount-1>
            <pg-input
              :signed="float_type === 'amount'"
              class="transfer-input"
              type="decimal:1"
              :suffix="float_type === 'discount' ? '%' : '元'"
              size="sm"
              :placeholder="`浮动${float_type === 'discount' ? '率' : '金额'}`"
              v-model="all_step_prices[1].discount"
              @change="changeAllDiscount(1)"
            ></pg-input>
          </template>
          <template v-slot:num-2>
            <pg-input class="transfer-input" type="number" suffix="件" size="sm" placeholder="阶梯三" v-model="all_step_prices[2].num" @change="changeAllNum(2)"></pg-input>
          </template>
          <template v-slot:discount-2>
            <pg-input
              :signed="float_type === 'amount'"
              class="transfer-input"
              type="decimal:1"
              :suffix="float_type === 'discount' ? '%' : '元'"
              size="sm"
              :placeholder="`浮动${float_type === 'discount' ? '率' : '金额'}`"
              v-model="all_step_prices[2].discount"
              @change="changeAllDiscount(2)"
            ></pg-input>
          </template>

          <pg-column width="40px" v-if="type === 'add'">
            <template v-slot="{row}">
              <a class="text-decoration-none" @click="singleRemoveItem(row)">移除</a>
            </template>
          </pg-column>

          <pg-column prop="title" title="商品" :width="type === 'add' ? '220px' : '260px'"></pg-column>
          <pg-column prop="price_sale" title="定价" width="75px">
            <template v-slot="{row}">
              {{ !!row.price_sale ? '￥' + Handle.returnPrice(row.price_sale) : '未报价' }}
            </template>
          </pg-column>

          <pg-column prop="num-0" :ellipsis="false" title="阶梯一" width="75px">
            <template v-slot="{row}">
              <pg-input class="transfer-input" :class="row.step_prices[0].num_error ? 'has-error' : ''" type="number" size="sm" suffix="件" v-model="row.step_prices[0].num" @change="changeNum(row.step_prices, 0)"></pg-input>
            </template>
          </pg-column>
          <pg-column prop="discount-0" :ellipsis="false" title="浮动值" width="75px">
            <template v-slot="{row}">
              <pg-input
                :signed="float_type === 'amount'"
                class="transfer-input"
                :class="row.step_prices[0].discount_error ? 'has-error' : ''"
                type="decimal:1"
                size="sm"
                :suffix="float_type === 'discount' ? '%' : '元'"
                v-model="row.step_prices[0].discount"
                @change="changeDiscount(row.step_prices, 0)"
              ></pg-input>
            </template>
          </pg-column>
          <pg-column title="优惠价格" width="75px">
            <template v-slot="{row}">
              <span v-if="!!row.step_prices[0].discount && !!row.price_sale">
                {{ '￥' + `${float_type === 'discount' ? Handle.returnPrice(row.price_sale * row.step_prices[0].discount / 100) : Handle.returnPrice(row.price_sale + Handle.handlePrice(row.step_prices[0].discount))}` }}
              </span>
              <span v-else></span>
            </template>
          </pg-column>

          <pg-column prop="num-1" :ellipsis="false" title="阶梯二" width="75px">
            <template v-slot="{row}">
              <pg-input class="transfer-input" :class="row.step_prices[1].num_error ? 'has-error' : ''" type="number" size="sm" suffix="件" v-model="row.step_prices[1].num" @change="changeNum(row.step_prices, 1)"></pg-input>
            </template>
          </pg-column>
          <pg-column prop="discount-1" :ellipsis="false" title="浮动值" width="75px">
            <template v-slot="{row}">
              <pg-input
                :signed="float_type === 'amount'"
                class="transfer-input"
                :class="row.step_prices[1].discount_error ? 'has-error' : ''"
                type="decimal:1"
                size="sm"
                :suffix="float_type === 'discount' ? '%' : '元'"
                v-model="row.step_prices[1].discount"
                @change="changeDiscount(row.step_prices, 1)"
              ></pg-input>
            </template>
          </pg-column>
          <pg-column title="优惠价格" width="75px">
            <template v-slot="{row}">
              <span v-if="!!row.step_prices[1].discount && !!row.price_sale">
                {{ '￥' + `${float_type === 'discount' ? Handle.returnPrice(row.price_sale * row.step_prices[1].discount / 100) : Handle.returnPrice(row.price_sale + Handle.handlePrice(row.step_prices[1].discount))}` }}
              </span>
              <span v-else></span>
            </template>
          </pg-column>

          <pg-column prop="num-2" :ellipsis="false" title="阶梯三" width="75px">
            <template v-slot="{row}">
              <pg-input class="transfer-input" :class="row.step_prices[2].num_error ? 'has-error' : ''" type="number" size="sm" suffix="件" v-model="row.step_prices[2].num" @change="changeNum(row.step_prices, 2)"></pg-input>
            </template>
          </pg-column>
          <pg-column prop="discount-2" :ellipsis="false" title="浮动值" width="75px">
            <template v-slot="{row}">
              <pg-input
                :signed="float_type === 'amount'"
                class="transfer-input"
                :class="row.step_prices[2].discount_error ? 'has-error' : ''"
                type="decimal:1"
                size="sm"
                :suffix="float_type === 'discount' ? '%' : '元'"
                v-model="row.step_prices[2].discount"
                @change="changeDiscount(row.step_prices, 2)"
              ></pg-input>
            </template>
          </pg-column>
          <pg-column title="优惠价格" width="75px">
            <template v-slot="{row}">
              <span v-if="!!row.step_prices[2].discount && !!row.price_sale">
                {{ '￥' + `${float_type === 'discount' ? Handle.returnPrice(row.price_sale * row.step_prices[2].discount / 100) : Handle.returnPrice(row.price_sale + Handle.handlePrice(row.step_prices[2].discount))}` }}
              </span>
              <span v-else></span>
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
    items: { type: Array, default() { return [] } },
  },
  data() {
    return {
      query: {},

      itemList: [],
      editList: [],

      selectedList: [],
      removeList: [],

      all_step_prices: [
        { num: '', discount: '' },
        { num: '', discount: '' },
        { num: '', discount: '' },
      ],

      float_type: 'discount', // discount | amount

      loading: false,

      systemClassTree: [],
      displayClassTree: [],
    }
  },
  computed: {
    filterItems() {
      return this.$data.itemList.filter(item => !this.editList.some(d => d.item_id === item.id));
    },

    // has_inputed_value() {
    //   let has_inputed_value = false;
    //   this.$data.editList.forEach(item => {
    //     item.step_prices.forEach(step => {
    //       console.log(step);
    //       if (!!step.discount) {
    //         has_inputed_value = true;
    //       }
    //     });
    //   });
    //
    //   return has_inputed_value;
    // }
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

        this.$data.float_type = d.float_type;

        return {
          item_id: d.id,
          code: d.code,
          title: d.title,
          price_sale: d.price_sale,

          step_prices: [
            {
              num: Array.isArray(d.step_prices) && d.step_prices.length >= 1 ? d.step_prices[0].num : '',
              num_error: false,
              discount: Array.isArray(d.step_prices) && d.step_prices.length >= 1
                ? (d.float_type === 'amount' ? Handle.returnPrice(d.step_prices[0].float_amount) : Handle.returnDiscount(d.step_prices[0].discount))
                : '',
              discount_error: false
            },
            {
              num: Array.isArray(d.step_prices) && d.step_prices.length >= 2 ? d.step_prices[1].num : '',
              num_error: false,
              discount: Array.isArray(d.step_prices) && d.step_prices.length >= 2
                ? (d.float_type === 'amount' ? Handle.returnPrice(d.step_prices[1].float_amount) : Handle.returnDiscount(d.step_prices[1].discount))
                : '',
              discount_error: false
            },
            {
              num: Array.isArray(d.step_prices) && d.step_prices.length >= 3 ? d.step_prices[2].num : '',
              num_error: false,
              discount: Array.isArray(d.step_prices) && d.step_prices.length >= 3
                ? (d.float_type === 'amount' ? Handle.returnPrice(d.step_prices[2].float_amount) : Handle.returnDiscount(d.step_prices[2].discount))
                : '',
              discount_error: false
            },
          ],
        }
      });
    }

  },

  methods: {

    changeFloatType() {
      this.$data.float_type = this.$data.float_type === 'amount' ? 'discount' : 'amount';
      this.$data.editList = this.$data.editList.map(item => {
        item.step_prices = item.step_prices.map(step => {
          return { num: step.num, num_error: step.num_error, discount: '', discount_error: false };
        });

        return item;
      });
      this.$data.all_step_prices = this.$data.all_step_prices.map(item => ({ num: item.num, discount: '' }));
    },

    changeAllNum(index) {
      let all_step_prices = this.$data.all_step_prices;
      this.$data.editList = this.$data.editList.map(item => {
        item.step_prices = item.step_prices.map((d, i, arr) => {
          if (i === index) {
            return {
              num: all_step_prices[index].num,
              num_error: this.validNum(all_step_prices[index].num, arr, i),
              discount: d.discount,
              discount_error: false,
            };
          }
          return d;
        });
        return item;
      });
    },

    changeNum(step_prices, index) {
      let step = step_prices[index];
      step.num_error = this.validNum(step.num, step_prices, index);
    },

    changeAllDiscount(index) {
      try {
        let all_step_prices = this.$data.all_step_prices;
        this.$data.editList = this.$data.editList.map(item => {
          item.step_prices = item.step_prices.map((d, i, arr) => {
            if (i === index) {
              return {
                num: d.num,
                num_error: false,
                discount: all_step_prices[index].discount,
                discount_error: this.validDiscount(all_step_prices[index].discount, arr, i),
              };
            }
            return d;
          });
          return item;
        });
      } catch (e) {
        console.log(e);
      }

    },

    changeDiscount(step_prices, index) {
      let step = step_prices[index];
      step.discount_error = this.validDiscount(step.discount, step_prices, index);
    },

    validNum(num, step_prices, index) {

      // 不是 0 - 10000 之间的 整数，就表示存在错误
      if (!!num && (num <= 0 || num >= 10000)) return true;

      switch(index) {
        case 0:
          // 必填
          if (!num) return true;
          // 在更新时，检查后两项是否是递增
          if (step_prices[1].num) {
            step_prices[1].num_error = Number(step_prices[1].num) <= Number(num);
          }
          if (step_prices[2].num) {
            step_prices[2].num_error = Number(step_prices[2].num) <= Number(num);
          }
          return false;
        case 1:
          // 如果 该项已经有折扣 则必填
          if (!!step_prices[1].discount && !num) return true;
          // 如果该项的值更新为空，并且第三项也没有折扣信息，则重置折扣的错误信息
          if (!num && !step_prices[2].discount && !step_prices[1].discount) {
            step_prices[1].discount_error = false;
          }

          // 如果第三项已经件数，则必填
          if (!!step_prices[2].num && !num) return true;
          // 如果该项已填，且第一项存在值，则不能小于第一项
          if (!!num && !!step_prices[0].num && Number(num) <= Number(step_prices[0].num)) return true;
          // 在更新时，检查第三项是否递增
          if (step_prices[2].num) {
            step_prices[2].num_error = Number(step_prices[2].num) <= Number(num);
          }
          return false;
        case 2:
          // 如果该项件数为空
          if (!num) {
            // 如果折扣也不存在，则重置折扣的错误
            if (!step_prices[2].discount) {
              step_prices[2].discount_error = false;
            }
            // 如果第二项没有件数 也没有折扣，则重置第二项的件数错误
            if (!step_prices[1].discount && !step_prices[1].num) {
              step_prices[1].num_error = false;
            }
            // 如果该项已经存在折扣，则必填
            if (step_prices[2].discount) return true;
          }

          // 如果该项已填，则前两项也填写，则与前两项进行比较
          if (!!num &&
            ((!!step_prices[0].num && Number(num) <= Number(step_prices[0].num))
              || (!!step_prices[1].num && Number(num) <= Number(step_prices[1].num))
            )
          ) return true;
          return false;
        default:
          return false;
      }

    },

    validDiscount(discount, step_prices, index) {

      // 不是 0 - 10000 之间的 或 小数位超过 1位，就表示存在错误
      if (!!discount && discount >= 10000) return true;

      switch(index) {
        case 0:
          if (!discount) return true;
          // 在更新时，检查后两项是否是递减
          if (step_prices[1].discount) {
            step_prices[1].discount_error = Number(step_prices[1].discount) >= Number(discount);
          }
          if (step_prices[2].discount) {
            step_prices[2].discount_error = Number(step_prices[2].discount) >= Number(discount);
          }
          return false;
        case 1:
          // 如果 该项已经存在件数 则必填
          if (!!step_prices[1].num && !discount) return true;
          // 如果该项的值更新为空，并且第三项也没有件数信息，则重置件数的错误信息
          if (!discount && !step_prices[2].num && !step_prices[1].num) {
            step_prices[1].num_error = false;
          }
          // 如果第三项已经存在折扣，则必填
          if (!!step_prices[2].discount && !discount) return true;
          // 如果该项已填，且第一项存在值，则不能大于第一项
          if (!!discount && !!step_prices[0].discount && Number(discount) >= Number(step_prices[0].discount)) return true;
          // 在更新时，检查第三项是否递减
          if (step_prices[2].discount) {
            step_prices[2].discount_error = Number(step_prices[2].discount) >= Number(discount);
          }
          return false;
        case 2:
          // 如果该项的折扣为空
          if (!discount) {
            // 如果如果件数也为空，则重置件数的错误
            if (!step_prices[2].num) {
              step_prices[2].num_error = false;
            }
            // 如果第二项没有件数 也没有折扣，则重置第二项的折扣错误
            if (!step_prices[1].num && !step_prices[1].discount) {
              step_prices[1].discount_error = false;
            }
            // 如果该项已经存在件数，则必填
            if (step_prices[2].num) return true;
          }

          // 如果该项已填，则前两项也填写，则与前两项进行比较
          if (!!discount &&
            ((!!step_prices[0].discount && Number(discount) >= Number(step_prices[0].discount))
              || (!!step_prices[1].discount && Number(discount) >= Number(step_prices[1].discount))
            )
          ) return true;
          return false;
        default:
          return false;
      }
    },

    onSubmit() {

      if (this.$data.editList.length <= 0) {
        this.$toast({ type: 'warning', message: '请先选择商品！' });
        return;
      }

      this.$data.editList = this.$data.editList.map(item => {
        item.step_prices = item.step_prices.map((d, i, arr) => {
          return { num: d.num, num_error: this.validNum(d.num, arr, i), discount: d.discount, discount_error: this.validDiscount(d.discount, arr, i) };
        });
        return item;
      });

      if (this.$data.editList.some(item => item.step_prices.some(d => d.num_error || d.discount_error))) {
        this.$toast({ type: 'danger', message: '请检查输入格式！' });
        return;
      }

      const float_type = this.$data.float_type;

      let entries = this.$props.type === 'add'
        ? this.$data.editList.map(item => ({
          item_id: item.item_id,
          float_type: float_type,
          step_prices: item.step_prices.map(d => ({
            num: Number(d.num),
            discount: float_type === 'amount' ? undefined : Handle.handleDiscount(d.discount),
            float_amount: float_type === 'amount' ? Handle.handlePrice(d.discount) : undefined,
          })),
        }))
        : this.$data.editList.map(item => ({
          id: item.item_id,
          float_type: float_type,
          step_prices: item.step_prices.map(d => ({
            num: Number(d.num),
            discount: float_type === 'amount' ? undefined : Handle.handleDiscount(d.discount),
            float_amount: float_type === 'amount' ? Handle.handlePrice(d.discount) : undefined,
          })),
        }));

      let API = this.$props.type === 'add' ? Api.activityStepPriceAdd : Api.activityStepPriceModify;

      this.$data.loading = true;
      Http.post(API, { entries })
        .then(() => {
          this.$toast({ message: `阶梯定价${this.$props.type === 'add' ? '新增' : '修改'}成功`, type: 'success' });
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
      let all_step_prices = this.$data.all_step_prices;
      let list = [...this.$data.selectedList].map(item => {
        return {
          item_id: item.id,
          code: item.code,
          title: item.title,
          price_sale: item.price_sale,

          step_prices: [
            { num: all_step_prices[0].num, num_error: false, discount: all_step_prices[0].discount, discount_error: false },
            { num: all_step_prices[1].num, num_error: false, discount: all_step_prices[1].discount, discount_error: false },
            { num: all_step_prices[2].num, num_error: false, discount: all_step_prices[2].discount, discount_error: false },
          ],
        }
      });
      this.$data.editList = [...this.$data.editList, ...list];
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
      this.$data.editList = this.$data.editList.filter(d => !this.$data.removeList.some(item => item.item_id === d.item_id));
      this.$data.removeList = [];
    },

    initQuery() {
      this.$data.query = {
        province_code: this.app.userInfo.province_code,
        is_all: 0,
        is_gift: 0,
        need_num: 30,
        city_or_level: 1,
        system_class_code: '',
        display_class_id: '',
        condition: '',
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

  .step-price .pg-transfer .pg-table thead th,
  .step-price .pg-transfer .pg-table tbody td {
    padding-left: 6px;
    padding-right: 6px;
  }

  .step-price .pg-form-control input {
    padding-left: 6px;
    padding-right: 2px;
  }

  .step-price .pg-form-control .suffix.pr-10 {
    padding-right: 4px !important;
  }

  .step-price .transfer-input {
    width: 100%;
    font-weight: normal;
  }

  .step-price .transfer-input.has-error {
    border-color: #e54545;
  }
</style>
