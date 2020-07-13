<template>
  <component :is="tag" class="pg-checkbox" :class="classnames">

    <input type="checkbox" :checked="is_checked" :disabled="disabled" hidden>

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
      size: {type: String, default: '', validator: v => !v || ['lg', 'base', 'sm'].includes(v)},
      disabled: { type: Boolean, default: false },
      reverse: { type: Boolean, default: false }, // 反转
      indeterminate: { type: Boolean, default: false }, // 未确定状态
      checked: { type: Boolean, default: false }, // 可通过该参数设置为选中状态，适用于checkbox-group下 自定义 不在选中列表中的项 为选中状态
      tag: { type: String, default: 'li' },
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    computed: {
      is_checked() {

        if (this.$props.checked) return true;

        if (!this.pgCheckboxGroup) {
          return this.$props.value === this.$props.trueValue;
        }
        return this.pgCheckboxGroup?.value?.some?.(item => item === this.$props.value);
      },
      bordered() {
        return this.pgCheckboxGroup && this.pgCheckboxGroup.border;
      },
      classnames() {
        let { size, disabled, reverse } = this.$props;

        let classnames = {disabled: disabled, checked: this.is_checked, border: this.bordered, 'flex-row-reverse': reverse};

        // 如果 size 不存在，则判断 form-item 的 计算属性 _size_。
        if (!size) {
          if (this.pgFormItem?._size_ && this.pgFormItem._size_ !== 'base') {
            size = this.pgFormItem._size_;
          }
          if (this.pgCheckboxGroup?.size && this.pgCheckboxGroup.size !== 'base') {
            size = this.pgCheckboxGroup.size;
          }
        }

        if (!!size) {
          classnames[size] = true;
        }
        return classnames;
      },
    },
    beforeCreate() {
      this.pgCheckboxGroup = findUpComponent(this, 'pg-checkbox-group');
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },
    methods: {
      doToggle() {
        let v = this.$props.value;
        let is_checked = !this.is_checked;

        // 判断是否 group 模式
        if (this.pgCheckboxGroup) {
          this.pgCheckboxGroup?.onCheck?.(v);
          this.$emit('change', is_checked);
        } else {
          // v = is_checked ? this.$props.falseValue : this.$props.trueValue;
          v = is_checked ? this.$props.trueValue : this.$props.falseValue;
          this.$emit('change', v);
        }
      }
    }
  };
</script>

<style scoped>

</style>
