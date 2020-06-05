<template>
  <li>
    <span class="d-flex position-relative">
      <i
        v-if="isFolder"
        class="icon"
        :class="(isOpen || expend) ? 'icon-arrow-down5' : 'icon-arrow-right5'"
        @click="toggle"
      ></i>
      <pg-checkbox :disabled="disabled" style="margin-left: 20px;" tag="div" :value="options.code" @change="onChange">{{ options.title }}</pg-checkbox>
    </span>

    <ul v-show="isFolder && (isOpen || expend)" :class="{ 'd-flex flex-wrap': isFolder && (isOpen || expend) && options.paths.length >= 3 }">
      <pg-tree-node v-for="item in options.childs" :disabled="disabled" :key="item.code" :options="item" :expend="expend" :update="update"></pg-tree-node>
    </ul>
  </li>
</template>

<script>

  import pgCheckbox from '../checkbox/checkbox';

  export default {
    name: "pg-tree-node",
    components: { pgCheckbox },
    props: {
      options: { type: Object, default: {} },
      update: { type: Function, default: () => {} },
      disabled: { type: Boolean, default: false },
      expend: { type: Boolean, default: false },
    },
    data() {
      return {
        isOpen: false
      }
    },
    computed: {
      isFolder: {
        get() {
          return Array.isArray(this.$props.options.childs) && this.$props.options.childs.length !== 0;
        }
      }
    },
    methods: {
      toggle() {
        if (this.isFolder) {
          this.$data.isOpen = !this.$data.isOpen;
        }
      },
      onChange(checked) {
        let list = [];
        let childs = this.getChildren(this.$props.options);
        if (checked) {
          let paths = this.options.paths;
          list = this.isFolder ? [...childs, ...paths] : paths;
        } else {
          if (this.isFolder) { list = childs; }
        }

        this.$props.update(checked, list);

      },
      getChildren(options) {
        return options.childs ? options.childs.reduce((list, child) => {
          list.push(child.code);
          const foundChild = this.getChildren(child);
          return list.concat(foundChild);
        }, []) : [];
      }
    }
  }
</script>

<style scoped>

</style>
