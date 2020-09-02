<template>
  <pg-form ref="form" item-width="170px">
    <div class="row no-gutters">
      <div class="col-5">
        <pg-form-item label="名称" rules="required|max_length:6:blur" help-text="小于等于6个字符">
          <pg-input v-model="formData.title" placeholder="请输入展示分类名称"/>
        </pg-form-item>
      </div>
      <div class="col-7">
        <pg-form-item label="排序" rules="min_value:0:blur|max_value:999:blur" help-text="请输入0 - 999的数值, 值越大, 排序越靠前">
          <pg-input type="number" v-model="formData.rank" placeholder="请输入展示分类的排序值"/>
        </pg-form-item>
      </div>
    </div>
    <pg-form-item label="分类ICON" rules="required" help-text="鼠标悬浮显示操作按钮, 可删除系统推荐的ICON, 自定义上传展示分类ICON">
      <pg-uploader v-model="formData.image" module="item"/>
    </pg-form-item>
    <pg-form-item label="系统推荐" item-width="480px">
      <div class="d-flex flex-wrap">
        <div class="img-box" v-for="(item, index) in itemTagImageList" :key="index" @click="formData.image = item">
          <img width="48" height="48" :src="cos_tenctent_path + item" alt="" />
          <transition name="fade">
            <i class="icon-checkmark-circle text-primary" v-if="formData.image === item"></i>
          </transition>
        </div>
      </div>
    </pg-form-item>
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
    name: 'display-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'top' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      const province_code = this.app.userInfo.province_code;
      return {
        formData: {
          province_code: province_code,
          title: '',
          rank: '',
          upper_id: '',
          image: 'tags/icon01.png',
        },
        loading: false,
        itemTagImageList: [],
      }
    },
    computed: {
      cos_tenctent_path() {
        return pgyos.osConfig().cos_tenctent_path;
      }
    },
    created() {
      // 表示添加子类
      if (this.$props.type === 'add') {
        this.$data.formData.upper_id = this.$props.item.id;
      }

      if (this.$props.type === 'modify') {
        this.$data.formData = { ...this.$props.item };
      }

      this.commonItemTagImageList();
    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          formData.rank = Number(formData.rank);
          formData.upper_id = Number(formData.upper_id);

          this.$data.loading = true;
          const type = this.$props.type;
          Http.post(type === 'modify' ? Api.displayClassEdit : Api.displayClassAdd, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `${type === 'modify' ? '修改' : '新增'}展示分类成功` });
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

      commonItemTagImageList() {
        Http.get(Api.commonItemTagImageList)
          .then(res => {
            this.itemTagImageList = (res.data || []).map(d => d.image);
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
