<template>
  <component :is="tag" class="pg-radio" :class="classnames" @click="handleToggle">
    <input type="radio" :checked="checked" :disabled="is_disabled" hidden>

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
      size: {type: String, default: '', validator: v => !v || ['lg', 'base', 'sm'].includes(v)},
      trueValue: { type: String | Number | Boolean, default: true },
      falseValue: { type: String | Number | Boolean, default: false },
      disabled: { type: Boolean, default: false },
      tag: { type: String, default: 'li' },
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    computed: {
      is_disabled() {
        return this.$props.disabled || this.pgRadioGroup?.is_disabled;
      },
      checked() {
        if (!this.pgRadioGroup) {
          return this.$props.value === this.$props.trueValue;
        }
        return this.pgRadioGroup?.value === this.$props.value;
      },

      bordered() {
        return this.pgRadioGroup && this.pgRadioGroup.border;
      },

      classnames() {
        let { size } = this.$props;

        let classnames = {disabled: this.is_disabled, checked: this.checked, border: this.bordered};

        // 如果 size 不存在，则判断 form-item 的 计算属性 _size_。
        if (!size) {
          if (this.pgFormItem?._size_ && this.pgFormItem._size_ !== 'base') {
            size = this.pgFormItem._size_;
          }
          if (this.pgRadioGroup?.size && this.pgRadioGroup.size !== 'base') {
            size = this.pgRadioGroup.size;
          }
        }

        if (!!size) {
          classnames[size] = true;
        }
        return classnames;
      },

    },
    beforeCreate() {
      this.pgRadioGroup = findUpComponent(this, 'pg-radio-group');
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
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
