<template>
  <div class="p-20">
    <div class="d-flex">
      <div class="alert-primary">每月第一天00:00, 根据成长值规则更新门店的会员等级，会员等级有效期为1个月。</div>
      <pg-button class="ml-auto" color="primary" v-if="app.auth.isAdmin || app.auth.BscMerchantVipListAdd" @click="handleAddItem">新增</pg-button>
    </div>
    <div class="card mt-10">
      <div class="card-body">
        <pg-table
          :data="list"
          primary-key="level"
          fixed-header
          :serialable="false"
          borderless
        >
          <pg-column prop="level" title="会员等级" width="60px" text-align="center">
            <template v-slot="{row}">
              <span>VIP{{ row.level || '-' }}</span>
            </template>
          </pg-column>
          <pg-column prop="title" title="会员等级名称" width="180px"></pg-column>
          <pg-column prop="growth" title="升级成长值" width="100px" text-align="center"></pg-column>
          <pg-column prop="title" title="优惠折扣" width="100px" text-align="center">
            <template v-slot="{row}">
              {{ row.discount ? `${Handle.returnDiscount(row.discount)}折` : '-' }}
            </template>
          </pg-column>
          <pg-column prop="merchant_num" title="当前商户数" width="100px" text-align="center">
            <template v-slot="{row}">
              {{ row.merchant_num || '-' }}
            </template>
          </pg-column>
          <pg-column prop="store_num" title="当前门店数" width="100px" text-align="center">
            <template v-slot="{row}">
              {{ row.store_num || '-' }}
            </template>
          </pg-column>
          <pg-column prop="updated" title="最后更新时间" width="140px">
            <template v-slot="{row}">
              {{ row.updated || '-' }}
            </template>
          </pg-column>
          <pg-column title="操作" width="60px">
            <template v-slot="{row}">
              <a
                class="text-decoration-none"
                v-if="(app.auth.isAdmin || app.auth.BscMerchantVipListModify)"
                @click="handleModifyItem(row)"
              >修改</a>
            </template>
          </pg-column>
        </pg-table>
      </div>
      <div class="card-footer">
<!--        <pg-pagination :num="list.num" v-model="query" @change="vipQuery"/>-->
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" :title="`${dialog.type === 'add' ? '新增' : '修改'}会员等级`">
      <vip-list-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>
  </div>
</template>
<script>

  import { Http, Api, Handle, Constant } from '@/util';
  import vipListEdit from './vip-list-edit';

  export default {
    name: 'vip-list',
    components: {vipListEdit },
    inject: ['app'],
    data() {
      return {
        query: {},
        list: [],
        dialog: {
          visible: false,
          type: 'add',
          item: {}
        },
      }
    },

    created() {
      this.Handle = Handle;
      this.Constant = Constant;
      this.vipQuery();
    },

    methods: {

      vipQuery() {
        Http.get(Api.merchantVipQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || [];
          });
      },

      handleAddItem() {
        Http.get(Api.merchantVipNewLevel, {})
          .then(res => {
            if (!res.data || !res.data.level) {
              this.$toast({ type: 'warning', message: '获取最新等级失败，请联系管理员。' });
              return;
            }
            this.$data.dialog = { visible: true, type: 'add', item: res.data };
          });
      },

      handleModifyItem(item) {
        this.$data.dialog = { visible: true, type: 'modify', item: item };
      },

      handleSubmit() {
        this.handleCancel();
        this.vipQuery();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, type: 'add', item: {} };
      },
    }

  }
</script>

<style lang="scss" scoped>

  .alert-primary {
    font-size: 12px;
    line-height: inherit;
    padding: 5px 30px 5px 10px;
    vertical-align: middle;
    color: #003b80;
    border: 1px solid #97c7ff;
    border-radius: 2px;
    background: #e5f0ff;
    position: relative;
    box-sizing: border-box;
    max-width: 900px;
    margin-right: auto;
  }

  .status-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
</style>
