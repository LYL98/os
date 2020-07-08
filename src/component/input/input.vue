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
        :disabled="is_disabled"
        :placeholder="placeholder"
        :maxlength="maxlength"
        v-model.trim="ev"
        @input="onChange"
        @focus="onFocus"
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
      // ev + '' 转换为字符串 去除空格后 ，如果不为空，则表示该数据存在
      if ((ev + '').trim()) {
        this.$props.valid && this.pgFormItem?.sync?.(ev);
      }
      return {
        ev: ev
      }
    },
    computed: {
      classnames() {
        let { size, material, flat } = this.$props;

        let classnames = {disabled: this.is_disabled, material, flat};

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
        if (['number', 'phone', 'decimal'].includes(this.$props.type)) {
          return 'text';
        }
        return this.$props.type;
      },
      is_disabled() {
        return this.$props.disabled || !!this.pgFormItem?.disabled;
      },
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

      onChange() {
        let ev = this.$data.ev + '';
        if (!!ev.trim()) {
          switch (this.$props.type) {
            case 'number':
            case 'phone':
              if (!/^[0-9]*$/.test(ev)) {
                ev = ev.replace(/[^\d.]/g,"");
              }
              break;
            case 'decimal':
              if (!/^(([1-9][0-9]*)|([0]\.\d{1,2}|[1-9][0-9]*\.\d{0,2}))$/.test(ev)) {
                ev = ev.replace(/[^\d.]/g,"");
                ev = ev.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');
              }
              break;
          }
        }
        this.$data.ev = ev;
        this.$emit('change', ev);
      },

      onFocus(e) {
        this.$emit('focus', e);
      },
      onBlur(e) {
        this.pgFormItem?.onBlur?.(e.target.value);
        this.$emit('blur', e);
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
