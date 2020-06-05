<template>
  <div class="pg-sidebar-wrapper">
    <div class="space-w-200"></div>
    <div class="pg-sidebar">

      <div class="pg-sidebar-title">
        {{ title }}
      </div>

      <ul class="navigation scroll-hidden">

        <li v-for="(nav, index) in routes" :key="index" :class="{
          'has-ul': nav.children,
          active: currentPath && nav.path === currentPath,
          open: accordions[index]
        }">

          <span v-if="nav.group" class="group-title">{{ nav.title }}</span>

          <router-link :to="nav.path" v-if="nav.path" @click.native="doToggle(index)">
            <i :class="nav.icon"></i>
            <span class="ml-10">{{ nav.name }}</span>
          </router-link>

          <a @click="doToggle(index)" v-if="nav.children">
            <i :class="nav.icon"></i>
            <span class="ml-10">{{ nav.name }}</span>
          </a>
          <ul v-if="nav.children" :style="`height: ${ accordions[index] ? nav.children.length * 37 + 10 : 0 }px;`">
            <li v-for="(item, index) in nav.children" :class="{active: item.path === currentPath}" :key="index">
              <router-link :to="item.path" v-if="item.path">
                <span>{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </li>

      </ul>

      <div class="footer">
        <span class="copyright">&copy {{year}} 蒲公英运营管理系统</span>
      </div>
    </div>
  </div>

</template>

<script>
  export default {
    name: 'pg-sidebar',
    props: {
      routes: { type: Array, default() { return [] } },
      title: { type: String, default: '' },
      currentPath: { type: String, default: '/' },
    },
    data() {
      return {
        routeComplete: false,
        accordions: [],
        year: new Date().getFullYear(),
      }
    },

    methods: {

      doToggle(index) {

        this.$data.accordions[index]
          ? this.$set(this.$data.accordions, index, false)
          : this.$set(this.$data.accordions, index, true);

        this.$data.accordions.forEach((item, i) => {
          if (i !== index && item === true) {
            this.$set(this.$data.accordions, i, false);
          }
        });
      }
    },

  };
</script>

<style scoped>
</style>
