<template>
  <li>
    <div
        class="d-flex position-relative"
        @mouseenter="isHover=true"
        @mouseleave="isHover=false"
    >
      <i
        v-if="isFolder"
        class="icon"
        :class="(isOpen || expend) ? 'icon-arrow-down5' : 'icon-arrow-right5'"
        @click="toggle"
      ></i>
      <pg-checkbox v-if="checkable" :disabled="disabled" style="margin-left: 20px;" tag="div" :value="options[primaryKey]" @change="onChange">{{ options.title }}</pg-checkbox>
      <div style="margin-left: 20px;" v-else>{{ options.title }}</div>
      <transition name="fade">
        <div v-if="isHover">
          <slot :node="options" :level="options.paths.length"></slot>
        </div>
      </transition>
    </div>

    <ul v-show="isFolder && (isOpen || expend)" :class="{ 'd-flex flex-wrap': isFolder && (isOpen || expend) && options.paths.length >= 4 }">
      <pg-tree-node
          :checkable="checkable"
          v-for="item in options.childs"
          :disabled="disabled"
          :key="item[primaryKey]"
          :options="item"
          :expend="expend"
          :update="update"
      >
        <template v-slot="scope">
          <slot :node="scope.node" :level="scope.node.paths.length"></slot>
        </template>
      </pg-tree-node>
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
      checkable: { type: Boolean, default: true },
      expend: { type: Boolean, default: false },
      primaryKey: { type: String, default: 'code' },
    },
    data() {
      return {
        isOpen: false,
        isHover: false,
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
        const primaryKey = this.$props.primaryKey || 'code';
        return options.childs ? options.childs.reduce((list, child) => {
          list.push(child[primaryKey]);
          const foundChild = this.getChildren(child);
          return list.concat(foundChild);
        }, []) : [];
      }
    }
  }
</script>

<style scoped>

</style>
