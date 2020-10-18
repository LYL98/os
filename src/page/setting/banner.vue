<template>
  <div class="pg-page">
    <div class="pg-page-header">

      <pg-select :value="app.userInfo.province_code" class="ml-auto mr-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}</pg-option>
      </pg-select>
    </div>

    <div class="p-20">

      <div class="d-flex mb-10" v-if="app.auth.isAdmin || app.auth.BannerDelete || app.auth.BannerAdd">
        <pg-confirm @confirm="handleDeleteSelections" help-text="确认删除所选Banner" v-if="app.auth.isAdmin || app.auth.BannerDelete">
          <pg-button color="primary" :disabled="selectionItems.length <= 0">批量删除</pg-button>
        </pg-confirm>
        <pg-button class="ml-auto" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.BannerAdd">新增</pg-button>
      </div>

      <div class="card">
        <pg-table :data="list" primary-key="id" fixed-header checkable @selection="onSelectionItems">
          <pg-column title="图片">
            <template v-slot="{row}">
              <img class="cursor-pointer" :src="cos_tenctent_path + row.image" v-preview width="100" height="60" alt="">
            </template>
          </pg-column>
          <pg-column title="排序" prop="rank"></pg-column>
          <pg-column title="状态">
            <template v-slot="{row}">
              <span>{{ row.is_usable ? '显示' : '禁用' }}</span>
            </template>
          </pg-column>
          <pg-column title="操作" width="100px">
            <template v-slot="{row}">
              <a class="text-decoration-none mr-10" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.BannerEdit">修改</a>
              <pg-confirm @confirm="handleDeleteItem(row)" help-text="确认删除该Banner" v-if="app.auth.isAdmin || app.auth.BannerDelete">
                <a class="text-decoration-none">删除</a>
              </pg-confirm>
            </template>
          </pg-column>
        </pg-table>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" :title="`${dialog.type === 'add' ? '新增' : '修改'}Banner`" width="600px">
      <banner-edit
        v-if="dialog.visible"
        :type="dialog.type"
        :item="dialog.item"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </pg-dialog>


  </div>

</template>
<script>

  import { Http, Api } from '@/util';
  import pgyos from '@/pgyos.entry';

  import bannerEdit from './banner-edit';

  export default {
    name: 'banner',
    components: { bannerEdit },
    inject: ['app'],
    data() {

      return {
        query: {},
        list: [],
        dialog: {
          type: 'add',
          visible: false,
          item: {}
        },

        selectionItems: [],
        provinceListAuth: [],
      }
    },

    computed: {
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      }
    },

    created() {
      document.title = 'Banner管理 - 商城 - 蒲公英运营管理系统';
      this.initQuery();
      this.settingBannerList();
      this.commonProvinceListAuth();
    },

    methods: {

      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code
        }
      },

      changeProvince(province_code) {
        this.app.changeProvince(province_code);
        this.$data.query.province_code = province_code;
        this.settingBannerList();
      },

      handleAddItem() {
        this.$data.dialog = { type: 'add', visible: true, item: {} };
      },

      handleModifyItem(item) {
        this.$data.dialog = { type: 'modify', visible: true, item: item };
      },

      handleDeleteItem(item) {
        Http.post(Api.settingBannerDelete, { ids: [item.id] })
          .then(() => {
            this.$toast({ type: 'success', message: 'Banner删除成功' });
            this.settingBannerList();
          })
      },

      handleDeleteSelections() {
        const ids = this.$data.selectionItems.map(item => item.id);
        Http.post(Api.settingBannerDelete, { ids })
          .then(() => {
            this.$toast({ type: 'success', message: 'Banner删除成功' });
            this.settingBannerList();
          })
      },


      handleSubmit() {
        this.handleCancel();
        this.settingBannerList();
      },

      handleCancel() {
        this.$data.dialog = { type: 'add', visible: false, item: {} };
      },

      settingBannerList() {
        Http.get(Api.settingBannerList, this.$data.query)
          .then(res => {
            this.$data.list = res.data || [];
          })
      },

      onSelectionItems(items) {
        this.$data.selectionItems = items;
      },

      commonProvinceListAuth() {
        Http.get(Api.commonProvinceListAuth)
          .then(res => {
            this.$data.provinceListAuth = res.data || [];
          });
      },
    }

  }
</script>

<style lang="scss" scoped>

</style>
