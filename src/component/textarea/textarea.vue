<template>
  <label class="pg-textarea" :class="is_disabled ? 'disabled' : ''">
    <textarea
        class="pg-form-control"
        :class="is_disabled ? 'disabled' : ''"
        v-model="ev"
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
  import {debounce} from '../_util/assist';

  export default {
    name: 'pg-textarea',
    props: {
      placeholder: {type: String, default: '请输入备注...'},
      disabled: {type: Boolean, default: false},
      maxlength: {type: Number, default: 200},
      value: {type: String | Number, default: ''},
      cols: {type: Number | String, default: 60},
      rows: {type: Number | String, default: 3},
    },
    model: {
      prop: 'value',
      event: 'change',
    },
    computed: {
      is_disabled() {
        return this.$props.disabled || !!this.pgFormItem?.disabled;
      },
      ev: {
        get() {
          return this.$props.value;
        },
        set(v) {
          this.autoScroll();
          this.$emit('change', v);
        },
      },
      count() {
        return this.$props?.value?.length || 0;
      },
      limit() {
        return `${this.count ? '' : 0} / ${this.$props.maxlength}`;
      },
    },

    mounted() {
      this.textRef = this.$refs['textarea'];
    },
    methods: {

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
