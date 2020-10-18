<template>
  <div class="pg-page">

      <div id="main" style="height: 700px;"></div>

  </div>
</template>
<script>

import { Handle } from "@/util";

export default {
  name: "customer-advice-echarts",
  inject: ["app"],
  props: {
    item: { type: Array, default() { return [] } },
  },
  data() {
    return {

      loading: false,
      columnPlot:null,
    };
  },

  created() {
    this.Handle = Handle;



  },
  mounted() {
    this.initChart()


  },
  methods: {
    initChart() {


      this.drawBar()


    },
    drawBar(){
      const data = this.$props.item
      const columnPlot = new G2Plot.Column(document.getElementById('main'),
          {
            forceFit: true,
            data,
            // padding: 'auto',
            // columnSize: 10,
            xField: 'display_class',
            yField: 'num',
            xAxis: {
              visible: true,
              label: {
                autoHide: true,
              },
            },
            meta: {
              display_class: {
                  alias:'展示分类'
                },
              num: {
                alias:'提报次数'
              }
            },

            yAxis: {
              visible: true,
              label: {
                visible: true,
              },
            },
            // colorField: 'display_class',
            interactions: [
              {
                type: 'scrollbar',
              },
            ],
            });

      columnPlot.render();
  },
  }
};
</script>

<style lang="scss" scoped>

</style>
