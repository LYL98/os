<template>
  <div class="pl-15">
    <div class="row">
      <div class="col-7">
        <pg-form-item label="优惠券名称:" class="pb-0" item-width="250px">
          <span class="form-item-label">{{ item.title }}</span>
        </pg-form-item>
      </div>
      <div class="col-5">
        <pg-form-item label="剩余总量:" class="pb-0" item-width="100px">
          <span class="form-item-label">{{ item.stock }}张</span>
        </pg-form-item>
      </div>
    </div>
    <div class="row no-gutters">
      <pg-form-item label="有效期:" class="pb-20" item-width="300px">
        <span class="form-item-label" v-if="item.date_type === 'fixed' && item.effective_date && item.expire_date">
          {{item.effective_date}} ~ {{item.expire_date}}
        </span>
        <span class="form-item-label" v-else-if="item.date_type === 'offset' && item.expire_days">
          {{!!item.effective_days ? `领券${item.effective_days}天后生效` : '领券后立即生效' }}, 有效期{{item.expire_days}}天
        </span>
        <span class="form-item-label" v-else>-</span>
      </pg-form-item>
    </div>

    <div class="row no-gutters">
      <pg-form-item label="发放类型:" item-width="295px">
        <pg-button-group v-model="grant_way" :options="Constant.ACTIVITY_COUPON_GRANT_TYPE('options')"></pg-button-group>
      </pg-form-item>
    </div>

    <coupon-grant-form-auto class="-ml-20" type="grant" :item="item" v-if="grant_way === 'auto'" @submit="handleSubmit" @cancel="handleCancel" />
    <coupon-grant-form-manual class="-ml-20" type="grant" :item="item" v-if="grant_way === 'manual'" @submit="handleSubmit" @cancel="handleCancel" />
    <coupon-grant-form-receive class="-ml-20" type="grant" :item="item" v-if="grant_way === 'receive'" @submit="handleSubmit" @cancel="handleCancel" />

  </div>
</template>

<script>

  import {Constant} from '@/util';
  import couponGrantFormAuto from './coupon-grant-form-auto';
  import couponGrantFormManual from './coupon-grant-form-manual';
  import couponGrantFormReceive from './coupon-grant-form-receive';

  export default {
    name: 'coupon-grant-edit',
    components: { couponGrantFormAuto, couponGrantFormManual, couponGrantFormReceive },
    inject: ['app'],
    props: {
      type: {type: String, default: 'grant'},
      item: {
        type: Object, default() {
          return {}
        }
      },
    },

    data() {
      return {
        grant_way: 'auto'
      }
    },

    created() {
      this.Constant = Constant;
    },
    methods: {

      handleSubmit() {
        this.$emit('submit');
      },

      handleCancel() {
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
