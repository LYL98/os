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

      <div class="d-flex">
        <pg-button class="ml-auto" color="primary" @click="handleAddItem" v-if="app.auth.isAdmin || app.auth.ClsSettingBannerAdd">新增</pg-button>
      </div>

      <div class="card mt-10">
        <pg-table :data="list" fixed-header>
          <pg-column title="图片">
            <template v-slot="{row}">
              <img class="cursor-pointer" :src="cos_tenctent_path + row.image" v-preview width="100" height="60" alt="">
            </template>
          </pg-column>
          <pg-column title="排序" prop="rank"></pg-column>
          <pg-column title="状态">
            <template v-slot="{row}">
              <pg-confirm
                v-if="app.auth.isAdmin"
                :help-text="`确认${!row.is_usable ? '显示' : '禁用'}该Banner`"
                @confirm="handleChangeItem(row)"
              >
                <pg-switch :value="row.is_usable"/>
              </pg-confirm>
              <span v-else>{{ row.is_usable ? '显示' : '禁用' }}</span>
            </template>
          </pg-column>
          <pg-column title="创建时间" prop="created"></pg-column>
          <pg-column title="操作" width="100px">
            <template v-slot="{row}">
              <a class="text-decoration-none mr-10" @click="handleModifyItem(row)" v-if="app.auth.isAdmin || app.auth.ClsSettingBannerModify">修改</a>
              <pg-confirm @confirm="handleDeleteItem(row)" help-text="确认删除该Banner" v-if="app.auth.isAdmin || app.auth.ClsSettingBannerDelete">
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
        provinceListAuth: [],
      }
    },

    computed: {
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      }
    },

    created() {
      document.title = 'Banner管理 - 零售中心 - 蒲公英运营管理系统';
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
        Http.post(Api.settingBannerDelete, { id: item.id })
          .then(() => {
            this.$toast({ type: 'success', message: 'Banner删除成功' });
            this.settingBannerList();
          })
      },

      handleChangeItem(item) {
        let formData = {...item};
        formData.is_usable = !formData.is_usable;
        Http.post(Api.settingBannerModify, formData)
          .then(() => {
            this.$toast({ type: 'success', message: `Banner状态已修改为${formData.is_usable ? '显示' : '禁用'}` });
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
