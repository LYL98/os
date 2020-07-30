<template>
  <div>

    <div class="d-flex mt-20 mb-10">
      <pg-button-group v-model="query.is_effect" :options="{ '全部': '', '未生效': 0, '已生效': 1 }" @change="changeQuery"/>
      <pg-button color="primary" class="ml-auto" @click="handleAddItem">新增</pg-button>
    </div>

    <div class="edit-form-container" :style="`height: ${dialog.visible ? '400px' : '0'}`">
      <!-- subitem 对应的是在售商品。item 对应的是单条调价记录 -->
      <subitem-price-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        :subitem="subitem"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>

    <pg-table
      :data="list.items"
      primary-key="id"
      :page="query.page"
      :page-size="query.page_size"
      :serialable="false"
      borderless
      placeholder="暂无定时调价记录..."
    >
      <pg-column title="调价生效时间" prop="effect_time" width="160px"></pg-column>
      <pg-column prop="price_sale" title="销售价" width="100px">
        <template v-slot="{row}">
          {{ row.price_sale ? '¥' : '' }}{{ Handle.returnPrice(row.price_sale) }}
        </template>
      </pg-column>
      <pg-column prop="price_divide" title="利润分成" width="100px">
        <template v-slot="{row}">
          {{ row.price_divide ? '¥' : '' }}{{ Handle.returnPrice(row.price_divide) }}
        </template>
      </pg-column>
      <pg-column prop="" title="创建人"  width="130px">
        <template v-slot="{row}">
          {{ row.last_updater && row.last_updater.realname || '-' }}
        </template>
      </pg-column>
      <pg-column prop="" title="操作"  width="100px">
        <template v-slot="{row}">
          <a class="mr-10 text-decoration-none" @click="handleModifyItem(row)" v-if="!row.is_effect">修改</a>
          <pg-confirm help-text="确认删除定时调价" @confirm="handleDeleteItem(row)" class="mr-10" v-if="!row.is_effect">
            <a class="text-decoration-none">删除</a>
          </pg-confirm>
        </template>
      </pg-column>
    </pg-table>

    <div class="card-footer">
      <pg-pagination :num="list.num" v-model="query" @change="subitemPriceQuery"/>
    </div>

  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';

  import subitemPriceEdit from './subitem-price-edit';

  export default {
    name: 'subitem-price',
    components: {subitemPriceEdit},
    props: {
      subitem: { type: Object, default() { return {} } },
    },
    data() {
      return {
        query: {},
        list: {
          items: [],
        },
        dialog: {
          type: 'add',
          visible: false,
          item: {}
        }
      }
    },

    created() {
      this.Handle = Handle;
      this.initQuery();
      this.subitemPriceQuery();
    },

    methods: {
      initQuery() {
        this.$data.query = {
          item_id: this.$props.subitem.id,
          is_effect: '',
          page: 1,
          page_size: 10,
        }
      },

      changeQuery() {
        this.$data.query.page = 1;
        this.subitemPriceQuery();
      },

      handleAddItem() {
        this.$data.dialog = { type: 'add', visible: true, item: {} };
      },

      handleModifyItem(item) {
        this.$data.dialog = { type: 'modify', visible: true, item: item };
      },

      handleSubmit() {
        this.handleCancel();
        this.subitemPriceQuery();
      },

      handleDeleteItem(item) {
        Http.post(Api.subitemPriceDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: '定时调价删除成功' });
            this.subitemPriceQuery();
          });
      },

      handleCancel() {
        this.$data.dialog = { visible: false, item: {} };
      },

      subitemPriceQuery() {
        Http.get(Api.subitemPriceQuery, this.$data.query)
          .then(res => {
            this.$data.list = res.data || { items: [] };
          });
      },
    }

  }
</script>

<style lang="scss" scoped>
  .edit-form-container {
    height: 0;
    overflow: hidden;
    transition: height .2s ease-in-out;
  }
</style>
