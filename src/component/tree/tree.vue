<template>
  <!-- class="ui-fancytree fancytree-container fancytree-plain" -->
  <pg-checkbox-group tag="ul" v-model="value" class="pg-tree">
    <tree-node
        :checkable="checkable"
        :expend="expend"
        v-for="item in formatOptions.childs"
        :disabled="disabled"
        :key="item.code"
        :options="item"
        :update="update"
    >
      <template v-slot="{node, level}">
        <slot :node="node" :level="level"></slot>
      </template>
    </tree-node>
  </pg-checkbox-group>
</template>

<script>
  import pgCheckboxGroup from '../checkbox/checkbox-group';
  import pgTreeNode from './tree-node';

  import { findUpComponent } from '../_util/assist';

  export default {
    name: "pg-tree",
    components: { 'pg-checkbox-group': pgCheckboxGroup, 'tree-node': pgTreeNode },
    props: {
      value: { type: Array, default: [] },
      options: { type: Object, required: true },
      checkable: { type: Boolean, default: true },
      disabled: { type: Boolean, default: false },
      expend: { type: Boolean, default: false },
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    watch: {
      value(val) {
        this.pgFormItem?.sync?.(val);
      }
    },
    computed: {
      editValue: {
        get() {
          return this.$props.value;
        },
        set(val) {
          this.$emit('change', val);
        }
      },
      formatOptions: {
        get() {
          let options = this.$props.options ? JSON.parse(JSON.stringify(this.$props.options)) : {};
          const formatTree = (arr = [], paths = []) => {
            return arr.map(item => {
              let parent = [...paths];
              parent.push(item.code);
              const temp = {
                ...item,
                paths: parent
              };
              if (item.childs) {
                temp.childs = formatTree(item.childs, parent);
              }
              return temp;
            })
          };

          options.childs = formatTree(options.childs);
          return options;
        }
      }
    },
    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },
    methods: {
      update(checked = true, child = []) {
        let list = [...this.editValue];
        list = list.filter(item => !child.includes(item));
        if (checked) {
          list.push(...child);
        }
        this.editValue = list;
      }
    }
  }
</script>

<style scoped>

</style>
