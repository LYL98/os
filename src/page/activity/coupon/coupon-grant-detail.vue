<template>

  <div v-if="formData.grant_way === 'manual'">
    <pg-table
      :data="manualGrantPhones.items"
      borderless
      :highlight-row="false"
      :page="query.page"
      :page-size="query.page_size"
      :height="app.windowHeight - 170 + 'px'"
    >
      <pg-column prop="phone" title="发放手机号" width="120px"></pg-column>
      <pg-column prop="num" title="发放数量" width="80px" text-align="center"></pg-column>
      <pg-column prop="status" title="发放状态" width="90px" text-align="center">
        <template v-slot="{row}">
          <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
            <span :class="`status-dot mr-5 bg-${Constant.ACTIVITY_COUPON_MANUAL_GRANT_STATUS('color')[row.status]}`"></span>
            {{ Constant.ACTIVITY_COUPON_MANUAL_GRANT_STATUS('enum')[row.status] || row.status || '-' }}
          </div>
        </template>
      </pg-column>
      <pg-column prop="updated" title="发放时间" width="140px">
        <template v-slot="{row}">
          {{ row.updated || '-' }}
        </template>
      </pg-column>
    </pg-table>
    <div class="card-footer">
      <pg-pagination :num="manualGrantPhones.num" v-model="query" @change="manualGrantPhonesQuery"/>
    </div>
  </div>

  <div :style="`height: ${app.windowHeight - 70 + 'px'}; overflow-y: auto;`" v-else>
    <pg-form item-width="200px" label-width="90px" ref="form" :disabled="type === 'detail'">

      <div class="row no-gutters">
        <pg-form-item label="发放数量" item-width="295px" help-text="单次发放数量 不能超过 优惠券总量">
          <pg-input v-model="formData.total_num" type="number" suffix="张" placeholder="请输入本次发放的数量"></pg-input>
        </pg-form-item>
      </div>

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

        <div class="row no-gutters" v-if="formData.condition === 'goods'">
          <pg-form-item label="商品" :show-label="false" rules="required" item-width="380px" style="padding-left: 100px">
            <pg-transfer key="item" :data="itemList" v-model="formData.item_ids" disabled placeholder="商品列表"></pg-transfer>
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

    </pg-form>
  </div>

</template>

<script>

  import {Http, Api, Handle, Constant} from '@/util';

  export default {
    name: 'coupon-grant-detail',
    inject: ['app'],
    props: {
      type: {type: String, default: 'detail'},
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

        itemList: [],
        loading: false,

        query: {},
        manualGrantPhones: [],
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      this.commonItemList();

      const { type, item } = this.$props;
      if (type === 'detail') {
        const formData = { ...item };
        formData.receive_cnt_limit = !!formData.max_receive_cnt;
        formData.max_receive_cnt = formData.max_receive_cnt ? Number(formData.max_receive_cnt) : '';
        formData.order_amt_thr = formData.order_amt_thr ? Handle.returnPrice(formData.order_amt_thr) : '';
        formData.goods_amt_thr = formData.goods_amt_thr ? Handle.returnPrice(formData.goods_amt_thr) : '';
        this.$data.formData = formData;

        if (formData.grant_way === 'manual') {
          this.initQuery();
          this.manualGrantPhonesQuery();
        }
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
              label: item.code + ' / ' + item.title,
              value: item.id
            }));
          })
      },


      initQuery() {
        this.$data.query = {
          id: this.$data.formData.id,
          page: 1,
          page_size: 20
        }
      },

      manualGrantPhonesQuery() {
        Http.get(Api.activityCouponManualGrantPhones, this.$data.query)
          .then(res => {
            this.$data.manualGrantPhones = res.data || { items: [] };
          });
      }

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
