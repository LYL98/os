<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden`">

    <h4 class="mt-20">基础信息</h4>

    <div class="row">
      <div class="col-6">商品名称：{{ item.title || '-' }}</div>
      <div class="col-6">科学分类：<span v-for="(a,index) in item.system_classes" :key="a">{{a.title}}{{index===(item.system_classes.length-1)?'':'/'}}</span></div>
    </div>

    <div class="row mt-10">
      <div class="col-12">
        商品概述：{{  item.remark || '-'}}
      </div>
    </div>

    <div class="row mt-10">
      <div class="col-12">
        商品详情：
        <pg-editor v-model="formData.p_item.content" disabled/>
      </div>
    </div>

    <div class="row mt-20 no-gutters">
      <div class="col-9">
        <span class="mr-30">图片:</span>
        <img class="cursor-pointer mr-10" :src="cos_tenctent_path + item" width="64" height="64" alt="" v-for="item in item.p_item.images" :key="item" v-preview.list="item.images"/>
      </div>
    </div>

    <h4 class="mt-20">销售信息</h4>
    <pg-table
      :data="[item_goods]"
      primary-key="item_code"
      :highlight-row="false"
      borderless
      placeholder="销售信息为空..."
    >

      <pg-column title="销售价" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.price_sale">¥{{row.price_sale}}</span>
          <span v-else>-</span>
        </template>
      </pg-column>

      <pg-column title="原价/划线价" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.price_origin">¥{{ row.price_origin }}</span>
          <span v-else>-</span>
        </template>
      </pg-column>

      <pg-column title="当前库存" width="80px" text-align="center">
        <template v-slot="{row}">
          <span v-if="!!row.stock">{{row.stock || '-'}}件</span>
          <span v-else>-</span>
        </template>
      </pg-column>
    </pg-table>

    <h4 class="mt-20">其它信息</h4>
    <div class="row mt-10">
      <div class="col-6">
        创建时间：{{ item.created || '-'}}
      </div>
      <div class="col-6">
        创建人：{{ item.creator && item.creator.realname || '-' }}
      </div>
    </div>
    <div class="row mt-10">
      <div class="col-6">
        更新时间：{{  item.updated || '-'}}
      </div>
      <div class="col-6">
        更新人：{{ item.updater && item.updater.realname || '-' }}
      </div>
    </div>
  </div>
</template>

<script>

  import { Handle, Constant } from '@/util';
  import pgyos from '@/pgyos.entry';
  export default {
    name: 'store-item-detail',
    inject: ['app'],
    props: {
      item: { type: Object, default() { return {} } }
    },
    data() {
      return {
        formData:{},
        item_goods: {},
      }
    },
    computed: {
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      }
    },
    created() {
      this.Handle = Handle;
      this.Constant = Constant;

      const formData = { ...this.$props.item };
      this.$data.formData = formData;

      const item_goods = {};
      item_goods.price_sale = Handle.returnPrice(this.$props.item.price_sale);
      item_goods.price_origin = Handle.returnPrice(this.$props.item.price_origin);
      item_goods.stock = this.$props.item.stock;
      this.$data.item_goods = item_goods;
    },
  }
</script>

<style lang="scss" scoped>

  .w-100 {
    min-width: 150px;
  }

  .after-divider + .after-divider {
    position: relative;

    &::after {
      position: absolute;
      left: -130px;
      top: 8px;
      display: inline-block;
      content: '';
      background-color: #ddd;
      height: 1px;
      width: 110px;
    }
  }

</style>
