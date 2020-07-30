<template>
  <div>

    <div class="d-flex mt-20">
      <pg-select v-model="query.activity_type" placeholder="按发放类型筛选" clearable @change="changeQuery">
        <pg-option v-for="item in Constant.ACTIVITY_COUPON_GRANT_TYPE()" :key="item.value" :value="item.value">{{ item.label }}</pg-option>
      </pg-select>
      <pg-select class="ml-20" v-model="query.status" placeholder="按领用状态筛选" clearable @change="changeQuery">
        <pg-option v-for="item in Constant.ACTIVITY_COUPON_RECORD_STATUS()" :key="item.value" :value="item.value">{{ item.label }}</pg-option>
      </pg-select>
      <pg-button flat class="ml-10" @click="resetQuery">重置筛选条件</pg-button>
    </div>

    <pg-table
      :data="list.items"
      primary-key="id"
      :page="query.page"
      :page-size="query.page_size"
      :highlight-row="false"
      :height="app.windowHeight - 210 + 'px'"
      borderless
      :serialable="false"
    >
      <pg-column prop="created" title="领取时间">
        <template v-slot="{row}">{{ row.created || '-' }}</template>
      </pg-column>
      <pg-column prop="login_phone" title="领取人">
        <template v-slot="{row}">{{ row.login_phone || '-' }}</template>
      </pg-column>
      <pg-column prop="grant_way" title="发放类型" width="80px">
        <template v-slot="{row}">
          {{ Constant.ACTIVITY_COUPON_GRANT_TYPE('enum')[row.grant_way] || row.grant_way || '-' }}
        </template>
      </pg-column>
      <pg-column title="领用状态" width="90px" text-align="center">
        <template v-slot="{row}">
          <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
            <span :class="`status-dot mr-5 bg-${Constant.ACTIVITY_COUPON_RECORD_STATUS('color')[row.status]}`"></span>
            {{ Constant.ACTIVITY_COUPON_RECORD_STATUS('enum')[row.status] || row.status || '-' }}
          </div>
        </template>
      </pg-column>
      <pg-column prop="use_time" title="使用时间">
        <template v-slot="{row}">{{ row.use_time || '-' }}</template>
      </pg-column>
      <pg-column prop="order_code" title="关联单号">
        <template v-slot="{row}">{{ row.order_code || '-' }}</template>
      </pg-column>

      <pg-column title="操作" width="70px">
        <template v-slot="{row}">
          <pg-confirm
            help-text="确认取消发放该优惠券"
            v-if="row.status === 'wait_use' && (app.auth.isAdmin || app.auth.ClsActivityCouponRecordStop)"
            @confirm="handleStopItem(row)"
          >
            <a class="text-decoration-none">取消发放</a>
          </pg-confirm>
        </template>
      </pg-column>

    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="couponRecord"/>
    </div>

  </div>

</template>
<script>

  import { Http, Api, Constant } from '@/util';

  export default {
    name: 'coupon-list-record',
    inject: ['app'],
    props: {
      id: { type: Number, default: 0 },
    },
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
      }
    },

    created() {
      this.Constant = Constant;
      this.initQuery();
      this.couponRecord();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          id: this.$props.id,
          activity_type: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.couponRecord();
      },

      resetQuery() {
        this.initQuery();
        this.couponRecord();
      },

      handleStopItem(item) {
        Http.post(Api.activityCouponRecordStop, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '优惠券已取消发放' });
            this.couponRecord();
          });
      },

      couponRecord() {
        Http.get(Api.activityCouponRecord, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] };
          });
      },
    }

  }
</script>

<style lang="scss" scoped>
  .status-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
</style>
