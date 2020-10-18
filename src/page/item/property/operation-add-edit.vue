<template>
  <pg-form ref="form" item-width="200px" label-width="90px">
    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="专区名称" rules="required|max_length:4:blur">
          <pg-input v-model="formData.title" placeholder="请输入4位以内字符"/>
        </pg-form-item>
      </div>
     <div class="col-6">
        <pg-form-item label="标签显示" rules="required" >
          <pg-button-group
            v-model="formData.be_showned"
            :options="{ '显示': true, '不显示': false }"
          ></pg-button-group>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">
      <div class="col-6" v-if="formData.be_showned">
        <pg-form-item label="简称" rules="required|max_length:4:blur" help-text="用作专区标签显示">
          <pg-input v-model="formData.abb_title" placeholder="请输入简称"/>
        </pg-form-item>
      </div>
    </div>
    <h4>设置显示信息</h4>
    <pg-form-item label="首页显示位置" rules="required" :help-text="returnDisText">
      <pg-button-group @change="changeDisplay" v-model="formData.display_place" :options="{ '金刚区': 'kingkong', '卡片区': 'card','推荐区':'recommend' }">
      </pg-button-group> 
    </pg-form-item>
    <pg-form-item label="排序" rules="" help-text="">
          <pg-input type="number" v-model="formData.rank" placeholder="0 - 999"/>
    </pg-form-item>
    <!--  金刚区 -->
    <div v-if="formData.display_place === 'kingkong'">
      <pg-form-item label="分类ICON" rules="required" help-text="鼠标悬浮显示操作按钮, 可删除系统推荐的ICON, 自定义上传展示分类ICON">
        <pg-uploader v-model="formData.image" module="item"/>
      </pg-form-item>
      <pg-form-item label="系统推荐" item-width="480px">
        <div class="d-flex flex-wrap">
          <div class="img-box" v-for="(item, index) in iconImages" :key="index" @click="formData.image = item">
            <img width="48" height="48" :src="cos_tenctent_path + item" alt="" />
            <transition name="fade">
              <i class="icon-checkmark-circle text-primary" v-if="formData.image === item"></i>
            </transition>
          </div>
        </div>
      </pg-form-item>

      <pg-form-item label="专题头图" help-text="建议上传1:1的图片">
            <pg-uploader module="itemTags" v-model="formData.topic_image_header" multiple :limit="1" />
      </pg-form-item>

      <pg-form-item label="专题详情图" help-text="可上传多张">
            <pg-uploader module="itemTags" v-model="formData.topic_image_detail" multiple />
      </pg-form-item>
    </div>

    <!-- 卡片区 -->
    <template  v-if="formData.display_place === 'card'">
      <!-- :rules="{'required': isShow}" -->
       <pg-form-item label="封面图" rules="required" help-text="" v-if="formData.display_place === 'card'">
            <pg-uploader :key="1" module="itemTags" v-model="formData.cover_image" multiple :limit="1" />
      </pg-form-item>
      <pg-form-item label="专题头图" help-text="建议上传1:1的图片">
            <pg-uploader module="itemTags" v-model="formData.topic_image_header" multiple :limit="1" />
      </pg-form-item>

      <pg-form-item label="专题详情图" help-text="可上传多张">
            <pg-uploader module="itemTags" v-model="formData.topic_image_detail" multiple />
      </pg-form-item>
    </template>
    

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import { Http, Api } from '@/util';
  import pgyos from '@/pgyos.entry';

  export default {
    name: 'operation-add-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      const province_code = this.app.userInfo.province_code;
      //tags/icon01.png
      return {
        formData: {
          province_code: province_code,
          image: '',
          be_showned: true,
          title:'',
          abb_title:'',
          rank:'',
          display_place:'kingkong',
          topic_image_header: [],//专题头图
          cover_image:[],//封面图
          topic_image_detail: [],//专题详情图
        },
        loading: false,
        iconImages: [],
      }
    },
    computed: {
      returnDisText(){
        if(this.$data.formData.display_place == 'kingkong'){
          return '*金刚区最多仅显示16个，根据排序来显示'
        }else if(this.$data.formData.display_place == 'card'){
          return '*卡片区最多显示3个，根据排序来显示'
        }else if (this.$data.formData.display_place == 'recommend'){
          return '*推荐区最多显示1个，根据排序来显示'
        }else {
          return ''
        }
      },
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      }
    },
    created() {
      this.commonItemTagsIcons();
      if (this.$props.type === 'modify') {
        this.$data.formData = { ...this.$props.item };
      }
    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          formData.rank = formData.rank || 0;
          formData.rank = Number(formData.rank);
          if(formData.display_place === 'recommend'){
            formData.cover_image = []
            formData.topic_image_header = []
            formData.topic_image_detail = []
            formData.image = ''
          }else if(formData.display_place === 'kingkong'){
            formData.cover_image = []
          }else if(formData.display_place === 'card'){
            formData.image = ''
          }

          this.$data.loading = true;
          const type = this.$props.type;
          Http.post(type === 'add' ? Api.basicdataItemTagsAdd : Api.basicdataItemTagsEdit, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `${type === 'add' ? '新增' : '修改'}运营专区成功` });
              this.$emit('submit');
            })
            .catch(() => {
              this.$data.loading = false;
            });

        });
      },
      onCancel() {
        this.$emit('cancel');
      },
      //获取ICONs
      commonItemTagsIcons(){
         Http.get(Api.commonItemTagsIcons, {})
          .then(res => {
            this.$data.iconImages = (res.data || []).map(d => d.image);
            this.$data.formData.image = this.$data.formData.image || this.$data.iconImages?.[0]
          });
      },
    }
  }
</script>
<style lang="scss" scoped>
  .img-box {
    border: 1px solid #ddd;
    min-width: 48px;
    width: 48px;
    min-height: 48px;
    border-radius: 2px;
    margin-right: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: border-color .3s ease-in-out;
    position: relative;

    &:hover {
      border-color: #bbb;
    }

    .icon-checkmark-circle {
      position: absolute;
      top: 2px;
      left: 2px;
    }
  }
</style>