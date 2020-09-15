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
          <a :class="{ active: active_index === 1 }" @click.stop="onCascade(1)" v-if="level >= 2">二级</a>
          <a :class="{ active: active_index === 2 }" @click.stop="onCascade(2)" v-if="level >= 3">三级</a>
          <a :class="{ active: active_index === 3 }" @click.stop="onCascade(3)" v-if="level >= 4">四级</a>
        </div>
        <div class="city-select-content">
          <ul class="dropdown-list">
            <li
                v-for="item in list"
                :key="item[primaryKey]"
                @click.stop="onSelect(item, active_index)"
                :class="{ active: select_list[active_index] && item[primaryKey] === select_list[active_index][primaryKey] }"
            >
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

import { findUpComponent, treeToList } from './../_util/assist';

export default {
  name: 'pg-cascader',
  components: { pgPopper, pgInput, pgSearch },
  props: {
    primaryKey: { type: String, default: 'code' }, // item项的主键标识 code | id
    parentKey: { type: String, default: 'top_code' }, // item项的父键标识 top_code | parent_id
    value: { type: String | Number | Array, required: true }, // 当前值
    level: { type: String | Number, default: 3 },
    titles: { type: Array, default() { return ['一级', '二级', '三级', '四级'] } },
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
      list: [], // 当前选中的列表
      select_list: [], // 选中的值列表（级联选择器，选中的值是一个数组）
    };
  },
  computed: {
    is_disabled() {
      return this.$props.disabled || !!this.pgFormItem?.disabled;
    },
    label() {
      return this.$data.select_list.map((item) => item.title).join(' / ');
    },
    expandedTreeList() {
      const options = this.$props.options;
      if (Array.isArray(options)) {
        return treeToList(options);
      }
      return [];
    }
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

    // 更新组件内部状态
    upCascade(val) {
      const { primaryKey } = this.$props;

      if (!val) {
        this.$data.active_index = 0;
        this.$data.select_list = [];
        this.$data.list = this.expandedTreeList.filter(item => item._node_level_ === 1);
        return;
      }

      if (this.$data.select_list.length > 0) return; // 如果已经存在选中的值，则不更新

      let node = this.expandedTreeList.find(item => item[primaryKey] === val);

      if (node) {
        this.$data.select_list = [...node._node_path_];
      }

    },

    onCascade(index) {
      const { primaryKey, parentKey } = this.$props;

      this.$data.active_index = index;
      switch (index) {
        // 如果是第一级，则直接返回一级列表
        case 0:
          this.$data.list = this.expandedTreeList.filter(item => item._node_level_ === 1);
          break;
        default:
          const item = this.$data.select_list[index - 1];
          if (!item) {
            this.$data.list = [];
          } else {
            this.$data.list = this.expandedTreeList.filter(d => d[parentKey] === item[primaryKey]);
          }
          break;
      }

    },
    onSelect(item, active_index) {
      const { primaryKey, parentKey } = this.$props;

      this.$data.select_list = [...item._node_path_];
      if (this.$props.level - 1 > active_index) {
        this.$data.list = this.expandedTreeList.filter(d => d[parentKey] === item[primaryKey]);
        this.$data.active_index = active_index + 1;
      }
      this.$emit('change', item[primaryKey]);
      this.$emit('selection', item);
    },
    onToggle(e) {
      if (this.is_disabled) {
        e.stopPropagation();
      }
    },
    onClear() {
      this.$data.active_index = 0;
      this.$data.list = this.expandedTreeList.filter(item => item._node_level_ === 1);
      this.$data.select_list = [];
      this.$emit('change', '');
    },
  },
};
</script>
