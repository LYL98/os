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
          city_title: "",
          lat: '',
          lng: '',
          poi: "",
          province_title: "",
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