<template>
  <component :is="tag" class="pg-radio" :class="{checked: checked, disabled, border: bordered}" @click="handleToggle">
    <input type="radio" :checked="checked" :disabled="disabled" hidden>

    <span class="toggle" @click="doToggle"></span>

    <label @click="doToggle">
      <slot></slot>
    </label>

  </component>
</template>

<script>
  import {findUpComponent} from './../_util/assist';

  export default {
    name: 'pg-radio',
    props: {
      value: { type: String | Number | Boolean, default: false },
      trueValue: { type: String | Number | Boolean, default: true },
      falseValue: { type: String | Number | Boolean, default: false },
      disabled: { type: Boolean, default: false },
      border: { type: Boolean, default: false },
      tag: { type: String, default: 'li' },
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    computed: {
      checked() {
        if (!this.pgRadioGroup) {
          return this.$props.value === this.$props.trueValue;
        }
        return this.pgRadioGroup?.value === this.$props.value;
      },
      bordered() {
        return this.pgRadioGroup && this.$props.border;
      }
    },
    beforeCreate() {
      this.pgRadioGroup = findUpComponent(this, 'pg-radio-group');
      if (!this.pgRadioGroup && this.$props.border) {
        console.warn('[pgyos]: the border style need radio-group inline type!');
      }
    },
    methods: {
      /**
       * 如果是inline模式，扩大可点击区域范围
       */

      handleToggle() {
        if (this.pgRadioGroup?.inline && this.$props.border) {
          this.doToggle();
        }
      },

      doToggle() {
        let v = this.$props.value;

        // 判断是否 group 模式
        if (this.pgRadioGroup) {
          this.pgRadioGroup?.onCheck?.(v);
        } else {
          v = this.checked ? this.$props.falseValue : this.$props.trueValue;
        }

        this.$emit('change', v);
      }
    }
  };
</script>

<style scoped>

</style>
