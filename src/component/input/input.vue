<template>
  <label class="pg-form-control mb-0" :class="classnames">
    <span class="prefix"><slot name="prefix"></slot></span>
    <span class="suffix pl-10" v-if="!!prefix">{{ prefix }}</span>
    <input
        :style="`text-align: ${textAlign}`"
        autocomplete="new-password"
        v-focus="autoFocus"
        :type="inputType"
        :readonly="readonly"
        :disabled="disabled"
        :placeholder="placeholder"
        :maxlength="maxlength"
        v-model.trim="ev"
        @input="onChange"
        @blur="onBlur"
        @keyup.enter="onEnter"
    />
    <transition name="fade">
      <span class="suffix" v-show="clearable && !!value" @click.stop="onClear">
        <i class="icon-cancel-circle2 cursor-pointer font-size-sm"></i>
      </span>
    </transition>
    <span class="suffix pr-10" v-if="!!suffix">{{ suffix }}</span>
    <span class="suffix"><slot name="suffix"></slot></span>
  </label>
</template>


<script>

  import {findUpComponent} from './../_util/assist';

  export default {
    name: 'pg-input',
    directives: {
      focus: {
        inserted(el, binding) {
          binding.value && el.focus();
        }
      },
    },


    props: {
      placeholder: {type: String, default: ''},
      size: {type: String, default: '', validator: v => !v || ['lg', 'base', 'sm'].includes(v)},
      value: {type: String | Number, default: ''},
      type: {type: String, default: 'text', validator: v => ['text', 'password', 'number', 'decimal', 'phone'].includes(v)},
      autoFocus: {type: Boolean, default: false},
      readonly: {type: Boolean, default: false},
      disabled: {type: Boolean, default: false},
      material: {type: Boolean, default: false},
      flat: {type: Boolean, default: false},
      maxlength: {type: Number | String, default: '', validator: v => !isNaN(v) },
      clearable: { type: Boolean, default: false },
      textAlign: { type: String, default: 'left', validator: v => ['left', 'center', 'right'].includes(v) },
      prefix: { type: String, default: '' },
      suffix: { type: String, default: '' },
      valid: {type: Boolean, default: true}, // 手动开启是否验证
    },


    model: {
      prop: 'value',
      event: 'change'
    },
    data() {
      let ev = this.$props.value;
      if (ev && this.$props.valid) {
        this.pgFormItem?.sync?.(ev);
      }
      return {
        ev: ev
      }
    },
    computed: {
      classnames() {
        let { size, disabled, material, flat } = this.$props;

        let classnames = {disabled, material, flat};

        // 如果 size 不存在，则判断 form-item 的 计算属性 _size_。
        if (!size) {
          if (this.pgFormItem?._size_ && this.pgFormItem._size_ !== 'base') {
            size = this.pgFormItem._size_;
          }
        }

        if (!!size) {
          classnames[size] = true;
        }
        return classnames;
      },
      inputType() {
        if (['number', 'decimal'].includes(this.$props.type)) {
          return 'text';
        }
        return this.$props.type;
      }
    },
    watch: {
      value: {
        immediate: false,
        handler: function (val, pev) {
          this.$data.ev = val;
          this.$nextTick(() => {
            this.$props.valid && this.pgFormItem?.sync?.(val);
          });
        }

      }
    },

    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },

    methods: {
      // 此处根据 type 类型，控制 输入内容的转换。

      // 1、如果是number 类型，则只允许输入 0 和 整数
      // 2、如果是decimal 类型，则只允许输入 0 和 小数，可以在外部校验输入的位数

      // 由于存在转换过程，如果输入不合规，则直接同步 this.$data.ev，不向外部 emit event。

      onChange() {
        let ev = this.$data.ev;
        if (!!ev) {
          switch (this.$props.type) {
            case 'number':
              if (!/^[1-9][0-9]*$/.test(ev)) {
                ev = parseInt(ev) + '';
                this.$data.ev = isNaN(ev) ? '' : ev;
                return;
              }
              break;
            case 'decimal':
              if (!/^(([1-9][0-9]*)|([0]\.\d{1,2}|[1-9][0-9]*\.\d{0,2}))$/.test(ev)) {
                ev = parseFloat(ev) + '';
                this.$data.ev = isNaN(ev) ? '' : ev;
                return;
              }
              break;
          }
        }
        this.$emit('change', ev);
      },


      onBlur(e) {
        this.pgFormItem?.onBlur?.(e.target.value);
      },
      onClear() {
        this.$emit('change', '');
        this.$emit('clear');
      },
      onEnter(e) {
        this.$emit('keyup', e.target.value);
      }
    }
  };
</script>

<style scoped>

</style>
