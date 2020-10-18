<template>

  <div v-if="item.grant_way === 'manual'">
    <pg-table
      :data="manualGrantStores.items"
      borderless
      :highlight-row="false"
      :page="query.page"
      :page-size="query.page_size"
      :height="app.windowHeight - 170 + 'px'"
    >
      <pg-column prop="title" title="发放门店" width="200px"></pg-column>
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
      <pg-pagination :num="manualGrantStores.num" v-model="query" @change="manualGrantQuery"/>
    </div>
  </div>

  <div :style="`height: ${app.windowHeight - 70 + 'px'}; overflow-y: auto;`" v-else>
    <coupon-grant-form-auto type="detail" :item="item" v-if="item.grant_way === 'auto'" />
    <coupon-grant-form-receive type="detail" :item="item" v-if="item.grant_way === 'receive'" />
  </div>

</template>

<script>

  import {Http, Api, Handle, Constant} from '@/util';

  import couponGrantFormAuto from './coupon-grant-form-auto';
  import couponGrantFormReceive from './coupon-grant-form-receive';

  export default {
    name: 'coupon-grant-detail',
    components: { couponGrantFormAuto, couponGrantFormReceive },
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
      return {
        query: {},
        manualGrantStores: [],
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      if (this.$props.item.grant_way === 'manual') {
        this.initQuery();
        this.manualGrantQuery();
      }

    },
    methods: {

      initQuery() {
        this.$data.query = {
          id: this.$props.item.id,
          page: 1,
          page_size: 20
        }
      },

      manualGrantQuery() {
        Http.get(Api.activityCouponManualGrantDetail, this.$data.query)
          .then(res => {
            this.$data.manualGrantStores = res.data || { items: [] };
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
