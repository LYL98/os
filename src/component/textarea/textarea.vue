<template>
  <label class="pg-textarea" :class="is_disabled ? 'disabled' : ''">
    <textarea
        class="pg-form-control"
        :class="is_disabled ? 'disabled' : ''"
        :value="ev"
        @input="onChange"
        :cols="cols"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="is_disabled"
        :maxlength="maxlength"
        :data-count="count"
        :data-limit="limit"
        ref="textarea"
    >
    </textarea>
    <span class="pg-textarea-counter">
      <span v-show="count > 0" class="count">{{ count }}</span>
      <span>{{ limit }}</span>
    </span>
  </label>
</template>

<script>
  import {debounce, findUpComponent} from '../_util/assist';

  export default {
    name: 'pg-textarea',
    props: {
      placeholder: {type: String, default: '请输入备注...'},
      disabled: {type: Boolean, default: false},
      valid: {type: Boolean, default: true},
      maxlength: {type: Number, default: 200},
      value: {type: String | Number, default: ''},
      cols: {type: Number | String, default: 60},
      rows: {type: Number | String, default: 3},
    },
    model: {
      prop: 'value',
      event: 'change',
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
      is_disabled() {
        return this.$props.disabled || !!this.pgFormItem?.disabled;
      },
      count() {
        return this.$props?.value?.length || 0;
      },
      limit() {
        return `${this.count ? '' : 0} / ${this.$props.maxlength}`;
      },
    },
    watch: {
      value: {
        immediate: false,
        handler: function (val) {
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

    mounted() {
      this.textRef = this.$refs['textarea'];
    },
    methods: {

      onChange(e) {
        this.autoScroll();
        this.$emit('change', e.target.value);
      },

      autoScroll() {
        if (this.count > 80) {
          if (!this.debounceScroll) {
            this.debounceScroll = debounce(function() {
              this.textRef && (this.textRef.scrollTop = this.textRef.scrollHeight);
            }, 150);
            return;
          }
          this.debounceScroll();
        }
      },

    },
  };
</script>

<style scoped>

</style>
