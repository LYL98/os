<template>
  <div class="p-20">

    <div class="card">
      <pg-location level="all" v-model="center_geo" @change="changeLocation"></pg-location>
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

        center_geo: {
          city_title: "深圳市",
          lat: 22.72755,
          lng: 113.90358,
          poi: "菜鸟驿站(深圳公明田寮一巷8号店)",
          province_title: "广东省"
        }
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

      changeLocation(location) {
        console.log('location:', location);
      },

      onclick(node, level) {
        console.log(node, node.title, level);
      },

    }
  }
</script>