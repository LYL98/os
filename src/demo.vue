<template>
  <div class="p-20">

    <div class="card">
      <pg-tree
          :checkable="false"
          class="mt-30 ml-20 p-30"
          :options="system_class_tree"
          :expend="system_class_tree_expend"
      >
        <template v-slot="{node, level}">
          <a class="ml-20" @click="onclick(node, level)" v-if="level <= 2">添加子类型</a>
          <a class="ml-20" @click="onclick(node, level)">操作</a>
          <a class="ml-20" @click="onclick(node, level)">删除</a>
        </template>
      </pg-tree>
    </div>

  </div>
</template>

<script>

  import { Http, Api } from '@/util';

  export default {
    name: 'demo',
    data() {
      return {
        system_class_tree_expend: true,
        system_class_tree: {childs: []},
      }
    },

    created() {
      this.systemClassTree();
    },

    methods: {
      systemClassTree() {
        Http.get(Api.systemClassTree, {}).then((res) => {
          this.$data.system_class_tree.childs = res.data;
        });
      },

      onclick(node, level) {
        console.log(node, node.title, level);
      },

    }
  }
</script>