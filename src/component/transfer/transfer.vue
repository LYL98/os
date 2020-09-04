<template>
  <div class="pg-transfer">
    <template v-if="!is_disabled">
      <div class="pg-transfer-table-wrapper unselected">
        <pg-table :data="optionals" primary-key="value" placeholder="" :serialable="false" :highlight-row="false" :height="height" borderless checkable @selection="onSelectionAdd">
          <slot name="unselected">
            <pg-column prop="label" :title="placeholder"></pg-column>
          </slot>
        </pg-table>
      </div>
      <div class="selector">
        <pg-button color="primary" circle size="sm" @click="doSelect" :disabled="addList.length <= 0">
          <i class="icon-arrow-right22" style="font-size: 20px" :class="{ 'text-light': addList.length <= 0, 'text-white': addList.length > 0 }"></i>
        </pg-button>
        <pg-button color="primary" circle size="sm" class="mt-20" @click="doRemove" :disabled="removeList.length <= 0">
          <i class="icon-arrow-left22" style="font-size: 20px" :class="{ 'text-light': removeList.length <= 0, 'text-white': removeList.length > 0 }"></i>
        </pg-button>
      </div>
    </template>
    <div 
      class="pg-transfer-table-wrapper selected" 
      :style="selectedTableWidth ?`min-width: ${selectedTableWidth}; width: ${selectedTableWidth}` : ''"
    >
      <pg-table 
        :data="selectedList" 
        primary-key="value" 
        placeholder="" 
        :serialable="false" 
        :highlight-row="false" 
        :height="height" 
        borderless 
        :checkable="!is_disabled" 
        @selection="onSelectionRemove"
      >
        <slot name="selected">
          <pg-column prop="label" title="已选择"></pg-column>
        </slot>
<!--        <pg-column v-if="singleRemove" title="操作" width="50px">-->
<!--          <template v-slot="{row}">-->
<!--            <a class="text-decoration-none" @click="onSingleRemove(row)">移除</a>-->
<!--          </template>-->
<!--        </pg-column>-->
      </pg-table>
    </div>
  </div>
</template>

<script>

  import pgTable from './../table/table';
  import pgColumn from './../table/column';

  import {findUpComponent} from './../_util/assist';

  const unique = (json) => {
    let newJson = []; //盛放去重后数据的新数组
    for (let item1 of json) {  //循环json数组对象的内容
      let flag = true;  //建立标记，判断数据是否重复，true为不重复
      for (let item2 of newJson){  //循环新数组的内容
        if(item1.value === item2.value){ //让json数组对象的内容与新数组的内容作比较，相同的话，改变标记为false
          flag = false;
        }
      }
      if (flag) { //判断是否重复
        newJson.push(item1); //不重复的放入新数组。  新数组的内容会继续进行上边的循环。
      }
    }
    return newJson;
  };

  export default {
    name: 'pg-transfer',
    components: { pgTable, pgColumn },
    props: {
      value: { type: Array, default: [] },
      placeholder: { type: String, default: '请选择' },
      data: {
        type: Array, 
        validator: v => v.length === 0 || v.every(d => d['label'] !== undefined && d['value'] !== undefined), 
        default() { return []; }
      },
      // 当 props.data 是分页数据时， value 中可能包含 data中不存在的项；
      // 需要使用该参数，把value中已选中的项，添加进来
      requiredData: {
        type: Array,
        validator: v => v.length === 0 || v.every(d => d['label'] !== undefined && d['value'] !== undefined),
        default() { return []; }
      }, //
      valid: { type: Boolean, default: true },
      disabled: { type: Boolean, default: false },
      height: { type: String, default: '202px' },
      selectedTableWidth: { type: String, default: '' }
      // singleRemove: { type: Boolean, default: true } 单项移除 与 多选移除 存在交互上的冲突，暂时屏蔽
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    data() {
      let ev = this.$props.value;
      if (Array.isArray(ev) && ev.length > 0) {
        this.$props.valid && this.pgFormItem?.sync?.(ev);
      }

      return {
        selectedList: [],

        // 已选中，待操作的数据
        addList: [],
        removeList: [],
      }
    },
    computed: {
      is_disabled() {
        return this.$props.disabled || !!this.pgFormItem?.disabled;
      },

      complete_data() {
        return unique([...this.$props.data, ...this.$props.requiredData]);
      },
      // 可以被选择的列表，不包含已经选中的。
      optionals() {
        return this.complete_data.filter(item => !this.$data.selectedList.some(d => d.value === item.value));
      },
    },

    watch: {
      value: {
        deep: true,
        immediate: false,
        handler(next, prev) {
          if (Array.isArray(next)) {
            // 当组件在外部修改value时，需要同步selectedList，主要应用于 外部手动清空value的场景
            if (next.length === 0) {
              this.$data.selectedList = [];
            
            // 兼容value 是异步的场景
            } else {
              this.$data.selectedList = unique(
                [...this.$data.selectedList,
                ...this.complete_data.filter(d => next.some(item => item === d.value))]
              );
            }

          }
  
          this.$nextTick(() => {
            this.$props.valid && this.pgFormItem?.sync?.(next);
          });
        }
      },
      data: {
        deep: true,
        immediate: true,
        handler(next, prev) {
          if (!next) return;
          this.$data.selectedList = unique(
            [...this.$data.selectedList, 
            ...this.complete_data.filter(d => this.$props.value.some(item => item === d.value))]
          );
        }
      },
    },
    
    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },

    beforeDestroy() {
      this.$data.selectedList = [];
      this.$data.addList = [];
      this.$data.removeList = [];
    },

    methods: {
      onSelectionAdd(list) {
        this.$data.addList = list;
      },

      onSelectionRemove(list) {
        this.$data.removeList = list;
      },

      doSelect() {
        this.$data.selectedList = [...this.$data.selectedList, ...this.$data.addList];
        this.$data.addList = [];
        this.$emit('change', this.$data.selectedList.map(item => item.value));
        this.$emit('selection', this.$data.selectedList);
      },

      doRemove() {
        this.$data.selectedList = this.$data.selectedList.filter(d => !this.$data.removeList.some(item => item.value === d.value));
        this.$data.removeList = [];
        this.$emit('change', this.$data.selectedList.map(item => item.value));
        this.$emit('selection', this.$data.selectedList);
      },

      // onSingleRemove(item) {
      //   this.$data.selectedList = this.$data.selectedList.filter(d => item.value !== d.value);
      //   this.$data.removeList = this.$data.removeList.filter(d => item.value !== d.value);
      //   this.$emit('change', this.$data.selectedList.map(item => item.value));
      //   this.$emit('selection', this.$data.selectedList);
      // },
    }
  }
</script>