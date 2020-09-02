<template>
  <div class="pg-page">
    <div class="pg-page-header">

      <pg-select :value="app.userInfo.province_code" class="ml-auto mr-20" @change="changeProvince">
        <pg-option
          v-for="item in provinceListAuth"
          :key="item.code"
          :value="item.code"
        >{{item.title}}
        </pg-option>
      </pg-select>
    </div>

    <div class="p-20">

      <div class="card p-20"> 

        <div class="d-flex align-items-center">
          <h3 class="mr-30 mb-2">首页专区展示</h3>

          <div class="d-flex align-items-center ml-30" v-for="item in indexZoneList" :key="item.key">
            <span>{{item.label}}</span>
            <pg-confirm @confirm="handleSettingConstant(`${item.key}`,`${item.label}`)"
                        :help-text="`确认${formData[item.key] ? '隐藏' : '展示'}${item.label}`">
              <pg-switch class="ml-20 mt-5" :value="formData[item.key]" :trueValue='true'
                         :falseValue='false' v-if="app.auth.isAdmin || app.auth.ClsSettingBanner"></pg-switch>
            </pg-confirm>
          </div>

        </div>

      </div>

      <div class="card mt-20">

        <div class="card-header d-flex justify-content-between pt-20 px-20">
          <h3>Banner管理</h3>
          <pg-button class="ml-auto" color="primary" @click="handleAddItem"
                     v-if="app.auth.isAdmin || app.auth.ClsSettingBannerAdd">新增
          </pg-button>
        </div>

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
              <a class="text-decoration-none mr-10" @click="handleModifyItem(row)"
                 v-if="app.auth.isAdmin || app.auth.ClsSettingBannerModify">修改</a>
              <pg-confirm @confirm="handleDeleteItem(row)" help-text="确认删除该Banner"
                          v-if="app.auth.isAdmin || app.auth.ClsSettingBannerDelete">
                <a class="text-decoration-none">删除</a>
              </pg-confirm>
            </template>
          </pg-column>
        </pg-table>
      </div>
    </div>

    <pg-dialog v-model="dialog.visible" :title="`${dialog.type === 'add' ? '新增' : '修改'}Banner`" width="650px">
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

  import {Http, Api} from '@/util';
  import pgyos from '@/pgyos.entry';

  import bannerEdit from './banner-edit';

  export default {
    name: 'banner',
    components: {bannerEdit},
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

        formData: {},

        indexZoneList: [
          {
            label: '预售专区',
            key: 'is_show_presale'
          },{
            label: '秒杀专区',
            key: 'is_show_seckill'
          },{
            label: '限时抢购专区',
            key: 'is_show_flash'
          },{
            label: '到货时间提示',
            key: 'is_show_receive_time'
          }
        ]
      }
    },

    computed: {
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      }
    },

    created() {
      document.title = '首页管理 - 零售中心 - 蒲公英运营管理系统';
      this.initQuery();
      this.settingBannerList();
      this.commonProvinceListAuth();
      this.settingConstantGet();
    },

    methods: {

      initQuery() {
        this.$data.query = {
          province_code: this.app.userInfo.province_code,
        }
      },

      changeProvince(province_code) {
        this.app.changeProvince(province_code);
        this.$data.query.province_code = province_code;
        this.settingBannerList();
        this.settingConstantGet();
      },

      handleAddItem() {
        this.$data.dialog = {type: 'add', visible: true, item: {}};
      },

      handleModifyItem(item) {
        this.$data.dialog = {type: 'modify', visible: true, item: item};
      },

      handleDeleteItem(item) {
        Http.post(Api.settingBannerDelete, {id: item.id})
          .then(() => {
            this.$toast({type: 'success', message: 'Banner删除成功'});
            this.settingBannerList();
          })
      },

      handleChangeItem(item) {
        let formData = {...item};
        formData.is_usable = !formData.is_usable;
        Http.post(Api.settingBannerModify, formData)
          .then(() => {
            this.$toast({type: 'success', message: `Banner状态已修改为${formData.is_usable ? '显示' : '禁用'}`});
            this.settingBannerList();
          })
      },

      handleSubmit() {
        this.handleCancel();
        this.settingBannerList();
      },

      handleCancel() {
        this.$data.dialog = {type: 'add', visible: false, item: {}};
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

      handleSettingConstant(key,label) {

        const formData = {...this.$data.formData};
        
        formData[key] = formData[key] ? false : true;

        formData.province_code = this.$data.query.province_code;

        Http.post(Api.settingConstantedit, formData)
          .then(() => {
            this.$toast({type: 'success', message: `${label}已${formData[key] ? '显示' : '隐藏'}`});
            this.settingConstantGet();
          });
      },

      //  请求的数据 -- 转换组件需要的数据结构 -- 映射到组件的数据结构 -- 修改 -- 转换为接口需要的数据结构 -- 提交数据

      settingConstantGet() {
        Http.get(Api.settingConstantGet, this.$data.query)
          .then(res => {
            this.$data.formData = res.data || {};
          });
      }

    },
  }
</script>

<style lang="scss" scoped>

</style>
