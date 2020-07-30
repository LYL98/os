<template>
  <pg-form item-width="200px" label-width="90px" ref="form" :disabled="type === 'detail'">

    <div class="row no-gutters">
      <div class="col-7">
        <pg-form-item label="优惠券名称" item-width="295px" rules="required|max_length:15">
          <pg-input v-model="formData.title" placeholder="请输入优惠券名称"></pg-input>
        </pg-form-item>
      </div>

      <div class="col-5">
        <pg-form-item label="总量" label-width="70px" item-width="169px" rules="required|min_value:1|max_value:1000000">
          <pg-input v-model="formData.stock" type="number" placeholder="请输入发放总量" suffix="张"></pg-input>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">
      <pg-form-item label="优惠券有效期" class="pb-0" rules="required" item-width="550px">
        <pg-radio-group v-model="formData.date_type" @change="changeDateOrDays">
          <div class="d-flex" style="height: 50px">
            <pg-radio value="fixed">
              固定日期
            </pg-radio>
            <template v-if="formData.date_type === 'fixed'">
              <pg-form-item rules="required" class="ml-15 pb-20">
                <pg-datepicker v-model="formData.effective_date" :limit="{ from: today }" placeholder="开始日期"></pg-datepicker>
              </pg-form-item>
              <span class="form-item-label mx-20">至</span>
              <pg-form-item rules="required" class="pb-20">
                <pg-datepicker v-model="formData.expire_date" :limit="{ from: today }" placeholder="结束日期"></pg-datepicker>
              </pg-form-item>
            </template>
          </div>
          <div class="d-flex" style="height: 60px">
            <pg-radio value="custom">
              自用户领券
            </pg-radio>
            <template v-if="formData.date_type === 'custom'">
              <pg-form-item rules="required|max_value:1000000" class="ml-3" item-width="200px" help-text="延迟生效天数为0时，表示领券后立即生效">
                <pg-input v-model="formData.effective_days" type="number" suffix="天" placeholder="请输入延迟生效的天数"></pg-input>
              </pg-form-item>
              <span class="form-item-label mx-10">后生效，有效期</span>
              <pg-form-item rules="required|min_value:1|max_value:1000000" item-width="145px">
                <pg-input v-model="formData.expire_days" type="number" suffix="天" placeholder="请输入有效期"></pg-input>
              </pg-form-item>
            </template>
          </div>
        </pg-radio-group>
      </pg-form-item>
    </div>

    <div class="row no-gutters mt-10">
      <pg-form-item label="使用门槛" class="pb-0 required" item-width="550px">
        <pg-radio-group v-model="formData.has_threshold" @change="changeThreshold">
          <pg-radio class="mb-10" :value="false">无</pg-radio>
          <div class="d-flex" style="height: 60px">
            <pg-radio :value="true">金额满</pg-radio>
            <template v-if="formData.has_threshold">
              <pg-form-item label="使用门槛" :show-label="false" class="ml-25" rules="required|min_value:0.01:blur|max_value:1000000">
                <pg-input v-model="formData.threshold_amount" placeholder="请输入使用门槛" type="decimal" suffix="元" @change="changeThresholdAmount"></pg-input>
              </pg-form-item>
            </template>
          </div>
        </pg-radio-group>
      </pg-form-item>
    </div>

    <div class="row no-gutters">
      <pg-form-item label="优惠券类型" class="pb-0" item-width="550px" rules="required">
        <pg-radio-group
          v-model="formData.coupon_type"
          @change="changeCouponType"
        >
          <div class="d-flex" style="height: 50px">
            <pg-radio value="reduce">满减</pg-radio>
            <pg-form-item
              v-if="formData.coupon_type === 'reduce'"
              class="pb-20"
              style="margin-left: 37px"
              key="reduce_amount"
              label="减免金额"
              :show-label="false"
              :rules="{'required': true, 'min_value:0.01:blur': true, 'max_value:1000000': true, 'logic': reduce_amount_validator}"
            >
              <pg-input v-model="formData.reduce_amount" placeholder="请输入满减金额" type="decimal" suffix="元"></pg-input>
            </pg-form-item>
          </div>
          <div class="d-flex" style="height: 60px">
            <pg-radio value="discount">满折</pg-radio>
            <template v-if="formData.coupon_type === 'discount'">
              <pg-form-item style="margin-left: 37px" key="discount" label="折扣" :show-label="false" rules="required|decimal:1|min_value:0.1:blur|max_value:10">
                <pg-input v-model="formData.discount" placeholder="请输入折扣" type="decimal" suffix="折"></pg-input>
              </pg-form-item>
              <span class="form-item-label mx-20">减免上限</span>
              <pg-form-item label="减免上限" :show-label="false" item-width="100px" :rules="{'logic': max_dis_amt_validator}">
                <pg-input v-model="formData.max_dis_amt" type="decimal" suffix="元"></pg-input>
              </pg-form-item>
            </template>
          </div>
        </pg-radio-group>
      </pg-form-item>
    </div>

    <div class="row no-gutters">
      <pg-form-item label="适用范围" item-width="291px">
        <pg-button-group
          v-model="formData.scope_type"
          :options="{ '全场': 'all', '单品': 'goods', '品类': 'category' }"
          @change="formData.scope_list = []"
        ></pg-button-group>
      </pg-form-item>
      <pg-form-item item-width="270px" class="ml-20">
        <pg-radio-group inline v-model="formData.usable_scope_type" v-if="formData.scope_type === 'goods'">
          <pg-radio value="usable">指定商品可用</pg-radio>
          <pg-radio value="unusable">指定商品不可用</pg-radio>
        </pg-radio-group>
        <pg-radio-group inline v-model="formData.usable_scope_type" v-if="formData.scope_type === 'category'">
          <pg-radio value="usable">指定品类可用</pg-radio>
          <pg-radio value="unusable">指定品类不可用</pg-radio>
        </pg-radio-group>
      </pg-form-item>
    </div>

    <div class="row no-gutters" style="padding-left: 100px" v-if="formData.scope_type === 'goods' && type !== 'detail'">
      <pg-search size="lg" placeholder="请输入商品编号/名称查询" style="width: 240px;" class="-mb-1" immediate debounce
                 @change="commonItemList"></pg-search>
    </div>

    <div class="row no-gutters" style="padding-left: 100px" v-if="formData.scope_type === 'goods'">
      <pg-form-item item-width="550px" rules="required">
        <pg-transfer
          key="item"
          :data="itemList"
          :required-data="transfer_required_data"
          v-model="formData.scope_list"
          placeholder="商品列表"
        ></pg-transfer>
      </pg-form-item>
    </div>

    <div class="row no-gutters" style="padding-left: 100px" v-if="formData.scope_type === 'category'">
      <pg-form-item item-width="550px" rules="required">
        <pg-transfer key="display-class" :data="displayClassList" v-model="formData.scope_list" placeholder="展示分类"></pg-transfer>
      </pg-form-item>
    </div>

    <div class="row no-gutters mt-30" v-if="type !== 'detail'">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

  import {Http, Api, Handle} from '@/util';

  export default {
    name: 'coupon-edit',
    inject: ['app'],
    props: {
      type: {type: String, default: 'add'},
      item: {
        type: Object, default() {
          return {}
        }
      },
    },
    data() {
      let today = new Date();
      today = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

      const province_code = this.app.userInfo.province_code;
      return {
        today: today,


        formData: {
          province_code: province_code,

          title: '', // 优惠券名称
          stock: '', // 发放总量

          date_type: 'fixed', // fixed | custom 按 日期范围 还是 按天数 计算优惠券有效期 前端冗余字段
          effective_date: '', // 固定日期 开始
          expire_date: '', // 固定日期 结束
          effective_days: '', // 领券后多少天有效
          expire_days: '', // 领券后多少天失效

          has_threshold: true,
          threshold_amount: '', // 使用门槛

          coupon_type: 'reduce', // 优惠券类型 reduce | discount
          reduce_amount: '', // 减免金额
          discount: '', // 减免折扣
          max_dis_amt: '', // 减免金额上线

          scope_type: 'all', // 适用范围  all | goods | category
          usable_scope_type: 'usable', // 可用 不可用  usable ｜ unusable
          scope_list: [],
          usable_scope: [], // 指定可用范围 列表
          unusable_scope: [], // 指定不可用范围 列表

        },

        transfer_required_data: [],
        itemList: [],
        displayClassList: [],
        loading: false,
      }
    },

    created() {
      this.Handle = Handle;
      this.commonItemList();
      this.commonDisplayClassList();

      const { type, item } = this.$props;
      if (type === 'modify' || type === 'detail') {
        const formData = { ...item };

        formData.effective_days = (formData.effective_days === 0 || !!formData.effective_days) ? Number(formData.effective_days) : '';
        formData.expire_days = Number(formData.expire_days) || '';

        if (formData.threshold_amount) {
          formData.has_threshold = true;
          formData.threshold_amount = Handle.returnPrice(formData.threshold_amount) || '';
        } else {
          formData.has_threshold = false;
        }

        formData.reduce_amount = Handle.returnPrice(formData.reduce_amount) || '';
        formData.discount = Handle.returnDiscount(formData.discount) || '';
        formData.max_dis_amt = Handle.returnPrice(formData.max_dis_amt) || '';

        if (!formData.usable_scope_type) {
          formData.usable_scope_type = 'usable';
        }

        if (formData.usable_scope_type === 'usable') {
          this.$data.transfer_required_data = [...formData.usable_scope].map(item => ({ label: item.title, value: item.id }));
          formData.scope_list = [...formData.usable_scope].map(item => item.id);
        } else {
          this.$data.transfer_required_data = [...formData.unusable_scope].map(item => ({ label: item.title, value: item.id }));
          formData.scope_list = [...formData.unusable_scope].map(item => item.id);
        }

        this.$data.formData = formData;
      }

      this.reduce_amount_validator = {
        validate: v => {
          if (!this.formData.has_threshold) return true;
          return Number(v) < this.$data.formData.threshold_amount;
        },
        getMsg: '减免金额必须小于使用门槛'
      };

      this.max_dis_amt_validator = {
        validate: v => {
          if (!this.formData.has_threshold) return true;
          return Number(v) < this.$data.formData.threshold_amount;
        },
        getMsg: '减免上限必须小于使用门槛'
      }

    },
    methods: {

      changeThresholdAmount(v) {
        if (v && this.$data.formData.reduce_amount) {
          this.$refs['form']?.validate('减免金额');
        }
        if (v && this.$data.formData.max_dis_amt) {
          this.$refs['form']?.validate('减免上限');
        }
      },

      changeCouponType() {
        this.$data.formData = {
          ...this.$data.formData,
          reduce_amount: '',
          discount: '',
          max_dis_amt: '',
        }
      },

      changeDateOrDays() {
        this.$data.formData = {
          ...this.$data.formData,
          effective_date: '',
          expire_date: '',
          effective_days: '',
          expire_days: '',
        }
      },

      changeThreshold() {
        this.$data.formData = {
          ...this.$data.formData,
          threshold_amount: '',
        };
        if (this.$data.formData.reduce_amount) {
          this.$refs['form']?.validate('减免金额');
        }
        if (this.$data.formData.max_dis_amt) {
          this.$refs['form']?.validate('减免上限');
        }
      },

      onSubmit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          const formData = {...this.$data.formData};

          formData.stock = Number(formData.stock);

          if (formData.date_type === 'fixed') {
            formData.effective_days = '';
            formData.expire_days = '';

          } else if (formData.date_type === 'custom') {

            formData.effective_date = '';
            formData.expire_date = '';
            formData.effective_days = Number(formData.effective_days);
            formData.expire_days = Number(formData.expire_days);

          }

          if (formData.has_threshold) {
            formData.threshold_amount = Handle.handlePrice(formData.threshold_amount);
          }

          if (formData.coupon_type === 'reduce') {
            formData.reduce_amount = Handle.handlePrice(formData.reduce_amount);
          }

          if (formData.coupon_type === 'discount') {
            formData.discount = Handle.handleDiscount(formData.discount);
            formData.max_dis_amt = Handle.handlePrice(formData.max_dis_amt);
          }

          if (formData.usable_scope_type === 'usable') {
            formData.usable_scope = [...formData.scope_list];
            formData.unusable_scope = [];
          } else {
            formData.unusable_scope = [...formData.scope_list];
            formData.usable_scope = [];
          }

          this.$data.loading = true;

          const type = this.$props.type;
          Http.post(type === 'add' ? Api.activityCouponAdd : Api.activityCouponModify, formData)
            .then(() => {
              this.$toast({type: 'success', message: `优惠券${type === 'add' ? '新增' : '修改'}成功`});
              this.$data.loading = false;
              this.$emit('submit');
            })
            .catch(() => {
              this.$data.loading = false;
            });
        });

      },

      commonItemList(condition = '') {
        Http.get(Api.commonItemList, {
          province_code: this.app.userInfo.province_code,
          condition: condition,
          need_num: 30,
          is_on_sale: 1,
          is_deleted: 0,
        })
          .then(res => {
            this.$data.itemList = (res.data || []).map(item => ({label: item.title, value: item.id}));
          })
      },

      commonDisplayClassList() {
        Http.get(Api.commonDisplayClassList, {
          province_code: this.app.userInfo.province_code,
        })
          .then(res => {
            this.$data.displayClassList = (res.data || []).map(item => ({
              label: item.title,
              value: item.id
            }));
          })
      },

      onCancel() {
        this.$emit('cancel');
      },

    }
  }
</script>

<style scoped>
</style>
