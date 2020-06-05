<template>
  <button class="pg-button" :class="classnames" :disabled="disabled || (pgButtonGroup && pgButtonGroup.disabled) || loading" @click="onClick">
    <slot></slot>
  </button>
</template>

<script>

  import {findUpComponent} from './../_util/assist';

  export default {
    name: 'pg-button',
    props: {
      disabled: {type: Boolean, default: false},
      loading: {type: Boolean, default: false},
      outline: {type: Boolean, default: false},
      flat: {type: Boolean, default: false},

      square: {type: Boolean, default: false},
      circle: {type: Boolean, default: false},
      round: {type: Boolean, default: false},
      block: {type: Boolean, default: false},
      size: {type: String, default: '', validator: v => !v || ['lg', 'sm', 'base'].includes(v) },

      color: {
        type: String,
        default: '',
        validator: v =>
          !v || ['primary', 'secondary', 'success', 'warning', 'danger'].includes(v),
      },

      // 支持 button-group 模式
      value: {type: String | Number | Boolean, default: ''}
    },

    computed: {

      groupValue() {
        return this.pgButtonGroup?.$props?.value;
      },

      groupSize() {
        return this.pgButtonGroup?.$props?.size;
      },

      groupList() {
        return this.pgButtonGroup?.$data?.groupList || [];
      },

      classnames() {

        if (this.pgButtonGroup) {
          let classnames = '';
          if (this.groupValue === this.$props.value) {
            classnames = 'primary outline z-index-1';
          }
          this.groupSize && this.groupSize !== 'base' && (classnames += ` ${this.groupSize}`);
          return classnames;

        }

        const {size, color, outline, flat, square, circle, round, block, loading} = this.$props;

        let classnames = {outline, flat, square, circle, round, block, loading};

        size && size !== 'base' && (classnames[size] = true);
        color && (classnames[color] = true);
        return classnames;

      },
    },

    beforeCreate() {
      this.pgButtonGroup = findUpComponent(this, 'pg-button-group');
    },

    methods: {
      onClick(e) {
        this.$emit('click', e);

        // 判断 group 模式下的 按钮值 切换
        if (this.groupValue && this.$props.value !== this.groupValue) {
          this.pgButtonGroup?.update?.(this.$props.value);
        }

      }
    }
  };
</script>

<style scoped>
  .z-index-1 {
    z-index: 1;
  }

</style>
