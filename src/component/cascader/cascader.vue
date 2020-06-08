<template>
  <pg-popper :trigger="trigger" v-model="expend" :width="popperWidth" :appendToBody="appendToBody" :disabled="is_disabled">
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
      :value="label"
      @click.stop="onToggle"
      @clear="onClear"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
    >
      <template slot="suffix">
        <span @click.stop="onToggle">
          <i class="icon-arrow-down5 pr-5"></i>
        </span>
      </template>
    </pg-input>

    <div class="dropdown-box" slot="content" :style="`width: ${popperWidth};`">
      <div class="city-select-wrap">
        <div class="city-select-tab">
          <a :class="{ active: active_index === 0 }" @click.stop="onCascade(0)">一级</a>
          <a :class="{ active: active_index === 1 }" @click.stop="onCascade(1)">二级</a>
          <a :class="{ active: active_index === 2 }" @click.stop="onCascade(2)">三级</a>
        </div>
        <div class="city-select-content">
          <ul class="dropdown-list">
            <li v-for="item in list" :key="item.code" @click.stop="onSelect(item, active_index)" :class="{ active: select_list[active_index] && item.code === select_list[active_index].code }">
              {{ item.title }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </pg-popper>
</template>

<script>

import pgPopper from './../popper/popper';
import pgInput from './../input/input';
import pgSearch from './../search/search';

import { findUpComponent } from './../_util/assist';

export default {
  name: 'pg-cascader',
  components: { pgPopper, pgInput, pgSearch },
  props: {
    value: { type: String | Number | Array, required: true }, // 当前值
    placeholder: { type: String, default: '请选择' },
    textAlign: { type: String, default: 'left' },
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    size: {
      type: String,
      default: 'base',
      validator: (v) => ['lg', 'sm', 'base'].includes(v),
    },
    searchable: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    valid: { type: Boolean, default: true },
    material: { type: Boolean, default: false },
    flat: { type: Boolean, default: false },
    trigger: { type: String, default: 'click', validator: (v) => ['click', 'hover'].includes(v) },
    appendToBody: { type: Boolean, default: true },
    placement: { type: String, default: 'bottom-start' }, // // bottom-start or bottom-end
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    let ev = this.$props.value;
    if (ev) {
      this.$props.valid && this.pgFormItem?.sync?.(ev);
    }
    return {
      expend: false,
      popperWidth: 'auto',
      isHover: false,
      active_index: 0,
      list: [],
      select_list: [],
    };
  },
  computed: {
    is_disabled() {
      return this.$props.disabled || !!this.pgFormItem?.disabled;
    },
    label() {
      return this.$data.select_list.map((item) => item.title).join(' / ');
    },
  },
  watch: {
    value: {
      immediate: false,
      deep: true,
      handler: function(val) {
        this.$props.valid && this.pgFormItem?.sync?.(val);
        this.upCascade(val);
      },
    },
    options: {
      immediate: true,
      deep: true,
      handler: function(val) {
        this.$data.list = val || [];
        Array.isArray(val) && val.length > 0 && this.upCascade(this.$props.value);
      },
    }
  },
  beforeCreate() {
    this.pgFormItem = findUpComponent(this, 'pg-form-item');
  },
  mounted() {
    this.$data.popperWidth = window.getComputedStyle(this.$el).width;
  },
  methods: {

    upCascade(code) {
      if (!code) {
        this.$data.active_index = 0;
        this.$data.select_list = [];
        this.$data.list = [...this.$props.options];
        return;
      }
      if (this.$data.select_list.length > 0) return;
      let d = code.slice(0, 2);
      let options = this.$props.options || [];
      options.forEach(item => {
        if (item.code === d) {
          this.$data.select_list = [item];
          d = code.slice(0, 4);
          item.childs.forEach(item => {
            if (item.code === d) {
              this.$data.select_list = [...this.$data.select_list, item];
              item.childs.forEach(item => {
                if (item.code === code) {
                  this.$data.select_list = [...this.$data.select_list, item];
                }
              });
            }
          })
        }
      });
    },

    onCascade(index) {
      this.$data.active_index = index;
      let item = null;
      switch (index) {
        case 0:
          this.$data.list = this.$props.options;
          break;
        case 1:
          if (this.$data.select_list[0]) {
            item = this.$props.options.find((item) => item.code === this.$data.select_list[0].code);
          }
          this.$data.list = (item && item.childs) || [];
          break;
        case 2:
          if (this.$data.select_list[0] && this.$data.select_list[1]) {
            item = this.$props.options.find((item) => item.code === this.$data.select_list[0].code);
            if (item) {
              item = item.childs.find((item) => item.code === this.$data.select_list[1].code);
            }
          }

          this.$data.list = (item && item.childs) || [];
          break;
      }
    },
    onSelect(item, active_index) {
      switch (active_index) {
        case 0:
          this.$data.select_list = [item];
          this.$data.list = item.childs;
          this.$data.active_index = active_index + 1;
          break;
        case 1:
          this.$set(this.$data.select_list, 1, item);
          this.$data.select_list = this.$data.select_list.filter((item, index) => index <= 1);
          this.$data.list = item.childs;
          this.$data.active_index = active_index + 1;
          break;
        case 2:
          this.$set(this.$data.select_list, 2, item);
          break;
      }
      this.$emit('change', item.code);
    },
    onToggle(e) {
      if (this.is_disabled) {
        e.stopPropagation();
      }
    },
    onClear() {
      this.$data.active_index = 0;
      this.$data.list = [...this.$props.options];
      this.$data.select_list = [];
      this.$emit('change', '');
    },
  },
};
</script>
