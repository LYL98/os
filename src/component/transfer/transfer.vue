<template>
  <div class="pg-transfer">
    <div class="pg-transfer-table-wrapper">
      <pg-table :data="optionals" primary-key="value" placeholder="" :serialable="false" :highlight-row="false" :height="height" borderless checkable @selection="onSelectionAdd">
        <pg-column prop="label" :title="placeholder"></pg-column>
      </pg-table>
    </div>
    <div class="selector">
      <pg-button color="primary" circle size="sm" @click="doSelect" :disabled="addList.length <= 0">
        <i class="icon-arrow-right22" style="font-size: 20px" :class="{ 'text-secondary': addList.length <= 0, 'text-light': addList.length > 0 }"></i>
      </pg-button>
      <pg-button color="primary" circle size="sm" class="mt-20" @click="doRemove" :disabled="removeList.length <= 0">
        <i class="icon-arrow-left22" style="font-size: 20px" :class="{ 'text-secondary': removeList.length <= 0, 'text-light': removeList.length > 0 }"></i>
      </pg-button>
    </div>
    <div class="pg-transfer-table-wrapper">
      <pg-table :data="selectedList" primary-key="value" placeholder="" :serialable="false" :highlight-row="false" :height="height" borderless checkable @selection="onSelectionRemove">
        <pg-column prop="label" title="已选择"></pg-column>
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
        if(item1.value == item2.value){ //让json数组对象的内容与新数组的内容作比较，相同的话，改变标记为false
          flag = false;
        }
      }
      if (flag) { //判断是否重复
        newJson.push(item1); //不重复的放入新数组。  新数组的内容会继续进行上边的循环。
      }
    }
    return newJson;
  }

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
      valid: { type: Boolean, default: true },
      height: { type: String, default: '200px' }
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    data() {

      // let ev = this.$props.value;
      // let selectedList = this.$props.data.filter(d => ev.some(item => item === d.value));
      // if (ev && ev.length > 0 && this.$props.valid) {
      //   this.pgFormItem?.sync?.(ev);
      // }

      let ev = this.$props.value;
      if (Array.isArray(ev) && ev.length > 0) {
        this.pgFormItem?.sync?.(ev);
      }

      return {
        selectedList: [],

        // 已选中，待操作的数据
        addList: [],
        removeList: [],
      }
    },
    computed: {
      // 可以被选择的列表，不包含已经选中的。
      optionals() {
        return this.$props.data.filter(item => !this.$data.selectedList.some(d => d.value === item.value));
      },
    },

    watch: {
      value: {
        deep: true,
        immediate: false,
        handler(next, prev) {
          // 1、需要同步到已经选择的列表中
          this.$data.selectedList = unique(
            [...this.$data.selectedList, 
            ...this.$props.data.filter(d => next.some(item => item === d.value))]
          );
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
            ...next.filter(d => this.$props.value.some(item => item === d.value))]
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
      },

      doRemove() {
        this.$data.selectedList = this.$data.selectedList.filter(d => !this.$data.removeList.some(item => item.value === d.value));
        this.$data.removeList = [];
        this.$emit('change', this.$data.selectedList.map(item => item.value));
      }
    }
  }
</script>