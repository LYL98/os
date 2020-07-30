<template>
  <div :style="`height: ${app.windowHeight - 80}px; overflow-x: hidden;`">
    <div class="d-flex justify-content-between align-items-center mt-20">
      <h3>素材列表</h3>
      <pg-button color="primary" @click="handleAddItem">新增素材</pg-button>
    </div>
    <div class="edit-form-container" :style="`height: ${dialog.visible ? '280px' : '0'}`">
      <!-- subitem 对应的是在售商品。item 对应的是单条调价记录 -->
      <subitem-material-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        :subitem="subitem"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
    <div class="text-center list-empty" v-if="!loading && list.length <= 0">
      <div class="img-bg"></div>
      <div class="mt-10">该商品暂无发圈素材</div>
    </div>
    <template v-for="item in list">
      <ul class="material-list list-unstyled" :key="item.id">
        <li class="material-item">
          <div class="content">
            {{ item.share_content }}
          </div>
          <div class="images mt-10 d-flex">
            <img
              class="mr-10 cursor-pointer"
              v-for="img in item.share_images_pathed"
              :key="img"
              :src="img"
              alt=""
              width="64"
              height="64"
              v-preview.list="item.share_images_pathed"
            >
          </div>
          <div class="footer mt-10">
            <span>更新时间：{{ item.updated }}</span>
            <pg-confirm help-text="确定删除该素材" @confirm="handleDeleteItem(item.id)">
              <pg-button class="ml-10" size="sm" flat square><i class="icon-bin"></i></pg-button>
            </pg-confirm>
            <pg-button size="sm" flat square @click="handleModifyItem(item)"><i class="icon-pencil5"></i></pg-button>
          </div>
        </li>
      </ul>
    </template>
  </div>

</template>
<script>

  import { Http, Api, Handle } from '@/util';
  import pgyos from '@/pgyos.entry';

  import subitemMaterialEdit from './subitem-material-edit';

  export default {
    name: 'subitem-material',
    inject: ['app'],
    components: {subitemMaterialEdit},
    props: {
      subitem: { type: Object, default() { return {} } },
    },
    data() {
      return {
        list: [],
        dialog: {
          type: 'add',
          visible: false,
          item: {}
        },
        loading: false,
      }
    },

    computed: {
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      }
    },

    created() {
      this.Handle = Handle;
      this.subitemMaterialList();
    },

    methods: {

      handleAddItem() {
        this.$data.dialog = { type: 'add', visible: true, item: {} };
      },

      handleModifyItem(item) {
        this.$data.dialog = { type: 'modify', visible: true, item: item };
      },

      handleDeleteItem(id) {
        Http.post(Api.subitemMaterialDelete, { id: id })
          .then(() => {
            this.$toast({ type: 'success', message: '发圈素材删除成功' });
            this.subitemMaterialList();
          });
      },

      handleSubmit() {
        this.handleCancel();
        this.subitemMaterialList();
      },

      handleCancel() {
        this.$data.dialog = { visible: false, item: {} };
      },

      subitemMaterialList() {
        this.$data.loading = true;
        Http.get(Api.subitemMaterialList, { item_id: this.$props.subitem.id })
          .then(res => {
            this.$data.loading = false;
            this.$data.list = (res.data || []).map(item => {
              item.share_images_pathed = item.share_images.map(d => this.cos_tenctent_path + d);
              return item;
            });
          })
          .catch(() => {
            this.$data.loading = false;
          })
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

  .material-item {
    background-color: #f6f6f6;
    margin-top: 20px;
    padding: 10px;

  }

  .list-empty {
    margin-top: 30px;

    .img-bg {
      height: 50px;
      background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSI0MCIgZmlsbD0iI0VCRUZGNSIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0yMCA1NlYyNGg0MHYzMnoiLz48cGF0aCBmaWxsPSIjQzFDQ0REIiBkPSJNMjYgMzdoMjh2MkgyNnptMCA3aDIwdjJIMjZ6bS02LTIwaDQwdjdIMjB6Ii8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDggNDQpIj48Y2lyY2xlIGZpbGw9IiNGRkYiIGN4PSIxMCIgY3k9IjEwIiByPSI3Ii8+PHBhdGggZD0iTTEwIDJhOCA4IDAgMTEwIDE2IDggOCAwIDAxMC0xNnptMSAxMEg5djJoMnYtMnptMC02SDl2NWgyVjZ6IiBmaWxsPSIjMDA2RUZGIi8+PC9nPjwvZz48L3N2Zz4=") no-repeat;
      background-position: center;
      background-size: contain;
    }
  }
</style>
