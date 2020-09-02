<template>
  <div class="p-20">
    <div class="d-flex">
      <pg-datepicker style="width: 450px;" v-model="query" quickable range clearable @change="changeQuery" />
      <pg-button-group class="ml-20" v-model="query.act_type" :options="{ '全部': '', '秒杀': 'seckill', '限时抢购': 'flash' }" @change="changeQuery"></pg-button-group>
      <pg-search class="w-25 ml-20" placeholder="商品名称、活动名称" v-model="query.condition" clearable @change="changeQuery" />
      <pg-button class="ml-10" flat @click="resetQuery">重置筛选条件</pg-button>
    </div>
    <div class="card mt-10">
      <div class="card-header font-weight-bolder">
        <pg-tabs v-model="query.status" @change="changeQuery">
          <pg-tab index="">全部</pg-tab>
          <pg-tab v-for="item in Constant.ACTIVITY_SECKILL_ITEM_STATUS()" :index="item.value" :key="item.value">{{item.label}}</pg-tab>
        </pg-tabs>
      </div>
      <div class="card-body">
        <pg-table
          :data="list.items"
          primary-key="id"
          :page="query.page"
          :page-size="query.page_size"
          fixed-header
        >
          <template v-slot:expand-row="{row}">
            <div class="p-15">
              <div class="row">
                <div class="col-3">
                  所属活动：{{row.act_title}}
                </div>
                <div class="col-3">
                  活动日期：{{row.act_date}}
                </div>
                <div class="col-3">
                  起止时间：{{row.begin_time}} ~ {{row.end_time}}
                </div>
              </div>
              <div class="row mt-5">
                <div class="col-3">
                  客户限购：{{row.purchase_limit ? `${row.purchase_limit}件` : '-'}}
                </div>
                <div class="col-3">
                  销售价：{{row.price_sale ? `¥${Handle.returnPrice(row.price_sale)}` : '-'}}
                </div>
                <div class="col-3">
                  活动价：{{row.act_price ? `¥${Handle.returnPrice(row.act_price)}` : '-'}}
                </div>
                <div class="col-3">
                  返利金额：{{row.cash_back ? `¥${Handle.returnPrice(row.cash_back)}` : '-'}}
                </div>
              </div>
              <div class="row mt-5">
                <div class="col-3">
                  更新人：{{row.last_updater}}
                </div>
                <div class="col-3">
                  更新时间：{{row.updated}}
                </div>
              </div>
            </div>
          </template>
          <pg-column prop="title" title="商品名称" width="160px"></pg-column>
          <pg-column prop="act_title" title="所属活动" width="140px"></pg-column>
          <pg-column prop="act_date" title="活动日期" width="90px"></pg-column>
          <pg-column prop="title" title="活动类型" width="100px">
            <template v-slot="{row}">
              <span v-if="row.act_type === 'flash'">限时抢购</span>
              <span v-if="row.act_type === 'seckill'">秒杀</span>
            </template>
          </pg-column>
          <pg-column title="商品状态" width="70px" text-align="center">
            <template v-slot="{row}">
              <div class="d-flex justify-content-center align-items-center overflow-ellipsis">
                <span :class="`status-dot mr-5 bg-${Constant.ACTIVITY_SECKILL_ITEM_STATUS('color')[row.status]}`"></span>
                {{ Constant.ACTIVITY_SECKILL_ITEM_STATUS('enum')[row.status] || row.status || '-' }}
              </div>
            </template>
          </pg-column>
          <pg-column title="活动价" width="80px" text-align="center">
            <template v-slot="{row}">
              {{row.act_price ? `¥${Handle.returnPrice(row.act_price)}` : '-'}}
            </template>
          </pg-column>
          <pg-column title="活动库存" width="80px" text-align="center">
            <template v-slot="{row}">
              {{row.act_stock ? `${row.act_stock}件` : '-'}}
            </template>
          </pg-column>
          <pg-column title="已售数量" width="80px" text-align="center">
            <template v-slot="{row}">
              {{row.act_stock - row.left_stock ? `${row.act_stock - row.left_stock}件` : '-'}}
            </template>
          </pg-column>
          <pg-column title="活动剩余库存" width="90px" text-align="center">
            <template v-slot="{row}">
              {{row.left_stock ? `${row.left_stock}件` : '-'}}
            </template>
          </pg-column>
          <pg-column title="操作" width="130px">
            <template v-slot="{row}">
              <a
                class="text-decoration-none mr-10"
                v-if="row.is_off_shelf && (app.auth.isAdmin || app.auth.ClsActivitySeckillItemModify)"
                @click="handleModifyItem(row)"
              >调整</a>
              <a
                class="text-decoration-none mr-10"
                v-if="row.status === 'processing' && (app.auth.isAdmin || app.auth.ClsActivitySeckillItemModifyStock)"
                @click="handleModifyItemStock(row)"
              >调整库存</a>
              <pg-confirm
                help-text="确认上架该商品"
                v-if="row.is_off_shelf && (app.auth.isAdmin || app.auth.ClsActivitySeckillItemOnShelf)"
                @confirm="handleOnShelfItem(row)"
              >
                <a class="text-decoration-none mr-10">上架</a>
              </pg-confirm>
              <pg-confirm
                help-text="确认下架该商品"
                v-if="row.status === 'processing' && !row.is_off_shelf && (app.auth.isAdmin || app.auth.ClsActivitySeckillItemOffShelf)"
                @confirm="handleOffShelfItem(row)"
              >
                <a class="text-decoration-none">下架</a>
              </pg-confirm>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
        <pg-pagination :num="list.num" v-model="query" @change="seckillQuery"/>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'modify'" :title="`${dialog.item.title} 商品调整`">
      <seckill-item-edit
        v-if="dialog.visible"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>

    <pg-dialog v-model="dialog.visible" v-if="dialog.type === 'stock'" :title="`${dialog.item.title} 调整库存`">
      <seckill-item-stock
        v-if="dialog.visible"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>
  </div>
</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';

  import seckillItemEdit from './seckill-item-edit';
  import seckillItemStock from './seckill-item-stock';

  export default {
    name: 'seckill-item',
    components: { seckillItemEdit, seckillItemStock },
    inject: ['app'],
    data() {
      return {
        query: {},
        list: {
          items: []
        },
        dialog: {
          visible: false,
          type: 'modify',
          item: {}
        },
        actTypeList:[
          {id: '限时抢购',value: 'flash'},
          {id: '秒杀',value: 'seckill'},
        ]
      }
    },

    watch: {
      'app.userInfo.province_code': {
        handler(val) {
          this.$data.query.province_code = val;
          this.changeQuery();
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      this.initQuery();
      this.seckillItemQuery();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code, // 省份
          condition: '',
          status: '',
          begin_date: '',
          end_date: '',
          page: 1,
          page_size: 20,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.seckillItemQuery();
      },

      resetQuery() {
        this.initQuery();
        this.seckillItemQuery();
      },

      seckillItemQuery() {
        Http.get(Api.activitySeckillItemQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] }
          });
      },

      handleModifyItem(item) {
        this.$data.dialog = { visible: true, type: 'modify', item: item };
      },

      handleModifyItemStock(item) {
        this.$data.dialog = { visible: true, type: 'stock', item: item };
      },

      handleOnShelfItem(item) {
        Http.post(Api.activitySeckillItemOnShelf, { act_id: item.act_id, item_id: item.item_id })
          .then(() => {
            this.$toast({ type: 'success', message: '活动商品已上架' });
            this.seckillItemQuery();
          });
      },

      handleOffShelfItem(item) {
        Http.post(Api.activitySeckillItemOffShelf, { act_id: item.act_id, item_id: item.item_id })
          .then(() => {
            this.$toast({ type: 'success', message: '活动商品已下架' });
            this.seckillItemQuery();
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.seckillItemQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, type: 'modify', item: {} };
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
