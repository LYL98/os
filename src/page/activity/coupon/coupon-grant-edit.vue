<template>
  <pg-form item-width="200px" label-width="90px" ref="form" key="subitem" class="pr-20">

    <div class="row">
      <div class="col-7">
        <pg-form-item label="优惠券名称" class="pb-0" item-width="150px">
          <span class="form-item-label">{{ item.title }}</span>
        </pg-form-item>
      </div>
      <div class="col-5">
        <pg-form-item label="剩余总量" class="pb-0" item-width="100px">
          <span class="form-item-label">{{ item.stock }}张</span>
        </pg-form-item>
      </div>
    </div>
    <div class="row no-gutters">
      <pg-form-item label="有效期" class="pb-20" item-width="200px">
        <span class="form-item-label" v-if="item.effective_date && item.expire_date">{{item.effective_date}} ~ {{item.expire_date}}</span>
        <span class="form-item-label" v-else-if="item.effective_days">自领券{{item.effective_days}}天内有效</span>
        <span class="form-item-label" v-else-if="item.expire_days">自领券{{item.expire_days}}天内失效</span>
        <span class="form-item-label" v-else>-</span>
      </pg-form-item>
    </div>

    <div class="row no-gutters">
      <pg-form-item label="发放类型" item-width="295px">
        <pg-button-group v-model="formData.grant_way" :options="Constant.ACTIVITY_COUPON_GRANT_TYPE('options')"
                         @change="changeGrantType"></pg-button-group>
      </pg-form-item>
    </div>

    <div class="row no-gutters" v-if="formData.grant_way === 'auto' || formData.grant_way === 'receive'">
      <pg-form-item label="发放数量" item-width="295px" :rules="{ 'required': true, [`max_value:${item.stock}`]: true }" help-text="单次发放数量 不能超过 优惠券总量">
        <pg-input v-model="formData.stock" type="number" suffix="张" placeholder="请输入本次发放的数量"></pg-input>
      </pg-form-item>
    </div>

    <!-- 自动发放 -->
    <template v-if="formData.grant_way === 'auto' || formData.grant_way === 'receive'">
      <div class="row no-gutters">
        <pg-form-item label="发放时限" rules="required" item-width="295px" :disabled="false">
          <pg-datepicker v-model="formData" :limit="{ from: today, to: limit_to }" range begin-date-key="begin_date" end-date-key="end_date"></pg-datepicker>
        </pg-form-item>
      </div>

      <template v-if="formData.grant_way === 'auto'">
        <div class="row no-gutters">
          <pg-form-item label="发放条件" item-width="400px">
            <pg-button-group
              v-model="formData.condition"
              :options="Constant.ACTIVITY_COUPON_GRANT_CONDITION('options')"
              @change="changeGrantCondition"
            >
            </pg-button-group>
          </pg-form-item>
        </div>

        <div class="row no-gutters" v-if="formData.condition === 'order'">
          <pg-form-item>
            <div class="form-item-label" style="padding-left: 100px">订单金额 >= </div>
          </pg-form-item>
          <pg-form-item label="订单金额" :show-label="false" rules="required|min_value:0.01:blur">
            <pg-input v-model="formData.order_amt_thr" type="decimal" suffix="元"></pg-input>
          </pg-form-item>
        </div>

        <div class="row no-gutters" v-if="formData.condition === 'goods'">
          <pg-form-item>
            <div class="form-item-label" style="padding-left: 100px">商品总金额 >= </div>
          </pg-form-item>
          <pg-form-item label="商品总金额" :show-label="false" rules="required|min_value:0.01:blur">
            <pg-input v-model="formData.goods_amt_thr" type="decimal" suffix="元"></pg-input>
          </pg-form-item>
        </div>

        <div class="row no-gutters" style="padding-left: 100px" v-if="formData.condition === 'goods'">
          <pg-search placeholder="请输入商品编号/名称查询" style="width: 265px;" size="lg" class="-mb-1" immediate debounce
                     @change="commonItemList"></pg-search>
        </div>

        <div class="row no-gutters" v-if="formData.condition === 'goods'">
          <pg-form-item label="商品" :show-label="false" rules="required" item-width="600px" style="padding-left: 100px">
            <pg-transfer key="item" :data="itemList" v-model="formData.item_ids" placeholder="商品列表"></pg-transfer>
          </pg-form-item>
        </div>
      </template>

      <div class="row no-gutters">
        <pg-form-item label="领取次数上限" item-width="350px" class="pb-0" required>
          <pg-radio-group v-model="formData.receive_cnt_limit" @change="changeReceiveCntLimit">
            <pg-radio :value="false">不限</pg-radio>
            <div class="d-flex">
              <pg-radio :value="true">限制每人可领取</pg-radio>
              <pg-form-item rules="required" class="ml-20 pb-0" v-if="formData.receive_cnt_limit">
                <pg-input v-model="formData.max_receive_cnt" type="number" suffix="张"></pg-input>
              </pg-form-item>
            </div>
          </pg-radio-group>
        </pg-form-item>
      </div>
    </template>

    <!-- 手动发放 -->
    <template v-if="formData.grant_way === 'manual'">
      <pg-form-item
        label="发放用户"
        :rules="{ 'logic:blur': phones_validator }"
        item-width="500px"
        help-text="输入用户手机号，以分号 ; 隔开，每个手机号固定发放一张"
      >
        <pg-textarea
          :disabled="has_import_phones"
          rows="30"
          style="height: 300px"
          v-model="formData.phones"
          maxlength="100000"
          placeholder="输入 或 复制粘贴 符合规则的手机号..."
        ></pg-textarea>
      </pg-form-item>
      <div style="padding-left: 100px">
        <input
          class="mt-20"
          type="file"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          @change="changeImportPhones"
        />

        <a class="ml-20" href="/excel/优惠券发放手机号导入模版.xlsx">下载导入模版</a>

        <div class="mt-20 text-secondary">
          注: 手动输入 和 批量导入，不可同时使用；批量导入后，将自动清空手动输入的手机号。
        </div>
      </div>
    </template>

    <div class="row no-gutters mt-30">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

  import {Http, Api, Handle, Constant, Excel} from '@/util';

  export default {
    name: 'coupon-grant-edit',
    inject: ['app'],
    props: {
      type: {type: String, default: 'grant'},
      item: {
        type: Object, default() {
          return {}
        }
      },
    },

    computed: {
      has_import_phones() {
        return Object.keys(this.$data.import_phones).length > 0
      }
    },

    data() {
      let today = new Date();
      today = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

      const province_code = this.app.userInfo.province_code;

      const expire_date = this.$props.item.expire_date;
      return {
        today: today,

        limit_to: expire_date,

        import_phones: {},

        formData: {
          province_code: province_code,
          coupon_id: '', // 需要发放的优惠券id

          grant_way: 'auto', // 发放类型 auto 自动发放 | manual 手动发放 ｜ receive 主动领取
          title: '', // 活动名称
          stock: '', // 本次发放的数量

          // 自动发放
          begin_date: '', // 开始时间 可编辑
          end_date: '', // 结束时间  可编辑
          condition: 'order', // order | goods | register | share
          order_amt_thr: '', // 单笔金额
          goods_amt_thr: '', // 商品金额
          item_ids: [], // 商品列表

          receive_cnt_limit: false, // 领取次数限制
          max_receive_cnt: '', // 领取次数上限

          // 手动发放
          phones: '', // 手机号, 不可重复

          // 主动领取 使用 start_time 、end_time、max_receive_cnt 字段

        },

        couponList: [],
        itemList: [],
        loading: false,
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      this.commonItemList();
      this.$data.formData.coupon_id = this.$props.item.id;

      this.phones_validator = {
        validate: v => {
          return /^([，；,;]*1\d{10}[，；,;]*)*$/.test(v);
        },
        getMsg: '输入格式不正确'
      }

    },
    methods: {

      changeGrantType() {
        this.$data.formData = {
          ...this.$data.formData,
          begin_date: '',
          end_date: '',
          condition: 'order',
          order_amt_thr: '',
          goods_amt_thr: '',
          item_ids: [],
          receive_cnt_limit: false,
          max_receive_cnt: '',
          phones: '',
        }
      },

      changeGrantCondition() {
        this.$data.formData = {
          ...this.$data.formData,
          order_amt_thr: '',
          goods_amt_thr: '',
          item_ids: [],
        }
      },

      changeReceiveCntLimit() {
        this.$data.formData.max_receive_cnt = '';
      },

      onSubmit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          const formData = {...this.$data.formData};

          if (formData.grant_way === 'auto') {
            formData.order_amt_thr = Handle.handlePrice(formData.order_amt_thr);
            formData.goods_amt_thr = Handle.handlePrice(formData.goods_amt_thr);
          }
          if (formData.grant_way === 'manual') {
            if (this.has_import_phones) {
              formData.phones = this.$data.import_phones;
            } else {
              formData.phones = this.arrayToMap(formData.phones.split(/[\n\s+,，；;]/g), 1);
            }

            if (Object.keys(formData.phones).length === 0) {
              this.$toast({type: 'warning', message: `请输入或导入发放用户`});
              return;
            }
          }
          formData.stock = Number(formData.stock);
          formData.max_receive_cnt = Number(formData.max_receive_cnt);

          this.$data.loading = true;
          Http.post(Api.activityCouponGrantAdd, formData)
            .then(() => {
              this.$toast({type: 'success', message: `优惠券发放成功`});
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
            this.$data.itemList = (res.data || []).map(item => ({
              label: item.title,
              value: item.id
            }));
          })
      },

      onCancel() {
        this.$emit('cancel');
      },

      changeImportPhones(e) {
        const file = e.target.files[0];
        if (!file) return;
        Excel.read(file).then(res => {
          this.$data.import_phones = this.arrayToMap(res.data || []);
          if (this.$data.import_phones) {
            this.$toast({ type: 'success', message: '手机号码导入成功' });
          }
          if (this.has_import_phones) {
            this.$data.formData.phones = '';
          }
        }).catch(e => {
          this.$toast({ type: 'danger', message: e.message || '导入文件读取失败...' });
        })
      },

      arrayToMap(array, fixed_value = '') {
        let phones = {};
        if (!Array.isArray(array)) {
          this.$toast({ type: 'danger', message: '导入数据格式不正确' });
          return;
        }
        for (let i = 0; i < array.length; i++) {
          let item = array[i];
          let key = item['手机号码'] || item;
          let value = item['发放张数'] || 1;
          if (/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(key) && /^\+?[1-9][0-9]*$/.test(value)) {
            if (phones[key]) {
              phones[key] = phones[key] + Number(fixed_value || value);
            } else {
              phones[key] = (fixed_value || value);
            }
          } else {
            phones = {};
            this.$toast({ type: 'danger', message: '导入数据格式不正确' });
            break;
          }
        }
        return phones;
      },

    }
  }
</script>

<style scoped>
  .pg-table tbody td {
    padding: 20px 10px;
  }
</style>
