<template>
  <component :is="tag" class="pg-checkbox" :class="{checked: checked, disabled, 'flex-row-reverse': reverse}">

    <input type="checkbox" :checked="checked" :disabled="disabled" hidden>

    <i class="cursor-pointer icon-checkbox-partial text-primary" @click="doToggle" v-if="indeterminate"></i>

    <span class="toggle" @click="doToggle" v-else>
    </span>

    <label @click="doToggle">
      <slot></slot>
    </label>

  </component>
</template>

<script>

  import {findUpComponent} from './../_util/assist';
  export default {
    name: 'pg-checkbox',
    // inject: ['pgCheckboxGroup'],
    props: {
      value: { type: String | Number | Boolean | Object, default: false },
      trueValue: { type: String | Number | Boolean | Object, default: true },
      falseValue: { type: String | Number | Boolean | Object, default: false },
      disabled: { type: Boolean, default: false },
      reverse: { type: Boolean, default: false }, // 反转
      indeterminate: { type: Boolean, default: false }, // 未确定状态
      tag: { type: String, default: 'li' },
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    computed: {
      checked() {
        if (!this.pgCheckboxGroup) {
          return this.$props.value === this.$props.trueValue;
        }
        return this.pgCheckboxGroup?.value?.some?.(item => item === this.$props.value);
      }
    },
    beforeCreate() {
      this.pgCheckboxGroup = findUpComponent(this, 'pg-checkbox-group');
    },
    methods: {
      doToggle() {
        let v = this.$props.value;
        let checked = !this.checked;

        // 判断是否 group 模式
        if (this.pgCheckboxGroup) {
          this.pgCheckboxGroup?.onCheck?.(v);
          this.$emit('change', checked);
        } else {
          // v = checked ? this.$props.falseValue : this.$props.trueValue;
          v = checked ? this.$props.trueValue : this.$props.falseValue;
          this.$emit('change', v);
        }
      }
    }
  };
</script>

<style scoped>

</style>
