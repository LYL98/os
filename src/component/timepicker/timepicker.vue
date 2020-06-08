<template>

  <pg-popper class="pg-time-picker" :trigger="trigger" v-model="expend" :width="popperWidth" :disabled="is_disabled">

    <pg-input
        class="pg-select"
        :size="size"
        :style="`width: ${popperWidth};`"
        :text-align="textAlign"
        :valid="false"
        :disabled="is_disabled"
        :material="material"
        :flat="flat"
        readonly
        :clearable="clearable"
        :placeholder="placeholder"
        :value="value"
        @click.stop="onToggle"
        @clear="onClear"
        @mouseenter="isHover=true"
        @mouseleave="isHover=false"
    >
      <template slot="suffix">
        <span @click.stop="onToggle">
          <i class="icon-alarm"></i>
        </span>
      </template>
    </pg-input>

    <div class="dropdown-box" slot="content" :style="`width: ${popperWidth};`">
      <pg-timer v-model="ev" :type="type" :visible="expend"/>
      <pg-button block color="secondary" @click="onSubmit">确定</pg-button>
    </div>

  </pg-popper>

</template>

<script>
  import pgPopper from './../popper/popper';
  import pgTimer from './timer';
  import {findUpComponent} from "../_util/assist";

  export default {
    name: 'pg-timepicker',
    components: {pgPopper, pgTimer},
    props: {
      size: {
        type: String,
        default: 'base',
        validator: v => ['lg', 'sm', 'base'].includes(v),
      },
      clearable: {type: Boolean, default: false},
      trigger: {type: String, default: 'click', validator: v => ['click', 'hover'].includes(v)},
      value: { type: String, default: '' },
      placeholder: { type: String, default: '选择时间' },
      textAlign: { type: String, default: 'left' },
      disabled: {type: Boolean, default: false},
      material: {type: Boolean, default: false},
      flat: {type: Boolean, default: false},
      type: { type: String, default: 'hh:mm:ss' },
      appendToBody: {type: Boolean, default: true},
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    data() {
      let ev = this.$props.value;
      if (ev) {
        this.pgFormItem?.sync?.(ev);
      }
      return {
        ev: ev,
        isHover: false,
        expend: false,
        loading: false,
        popperWidth: 'auto',
      };
    },
    computed: {
      is_disabled() {
        return this.$props.disabled || !!this.pgFormItem?.disabled;
      },
    },
    watch: {
      value(val) {
        this.pgFormItem?.sync?.(val);
        this.$data.ev = val;
      },
    },

    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },

    mounted() {
      this.$data.popperWidth = window.getComputedStyle(this.$el).width;
    },

    methods: {
      onToggle(e) {
        if (this.is_disabled) {
          e.stopPropagation();
        }
      },
      onSubmit() {
        this.$emit('change', this.$data.ev);
        this.$data.expend = false;
      },
      onClear() {
        this.$emit('change', '');
      }
    }
  };
</script>

<style scoped>

</style>
