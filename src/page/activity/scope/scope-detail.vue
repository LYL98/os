<template>
  <div>
    <div class="row mt-15">
      <div class="col-2">促销类型：</div>
      <div class="col-8">
        {{ item.promotion_type === 'type_reduction' ? '全场满减'
        : (item.promotion_type === 'scope_discount' ? '全场满折' : '-') }}
      </div>
    </div>

    <div class="row mt-15">
      <div class="col-2">活动时间：</div>
      <div class="col-8">
        <span>{{ item.time_start }}</span>
        <span> ～ </span>
        <span>{{ item.time_end }}</span>
      </div>
    </div>

    <div class="row mt-15">
      <div class="col-2">创建人：</div>
      <div class="col-8">
        {{ item.operator && item.operator.realname || '-' }}
      </div>
    </div>

    <div class="row mt-15">
      <div class="col-2">创建时间：</div>
      <div class="col-8">
        {{ item.created || '-' }}
      </div>
    </div>

    <div class="row mt-15">
      <div class="col-2">活动规则：</div>
      <div class="col-8">
        <div class="mb-5" v-for="(rule_str, index) in rules_str" :key="index">{{ rule_str }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { Handle } from '@/util';

export default {
  name: 'scope-detail',
  inject: ['app'],
  props: {
    item: { type: Object, default() { return {} } },
  },
  computed: {
    rules_str() {
      const { promotion_type, rules } = this.$props.item;
      if (!Array.isArray(rules)) return '-';
      return rules.map(rule => {
        if (promotion_type === 'type_reduction') {
          return `全场满 ${Handle.returnPrice(rule.full)} 元，减 ${Handle.returnPrice(rule.reduction)} 元`;
        } else {
          return `全场满 ${Handle.returnPrice(rule.full)} 元，打 ${Handle.returnDiscount(rule.discount)} 折`;
        }
      })
    }
  }
}
</script>
