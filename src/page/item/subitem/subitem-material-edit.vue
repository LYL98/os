<template>
  <pg-form ref="form" item-width="500px" class="py-20 d-flex flex-column align-items-center" style="border-bottom: 1px solid #DDD">
    <pg-form-item label="分享文案" rules="required">
      <pg-textarea v-model="formData.share_content" maxlength="50" placeholder="请输入分享文案，最多不超过50个字符。"/>
    </pg-form-item>
    <pg-form-item label="分享图片" help-text="用于朋友圈分享的素材图片，最多可上传8张。拖动图片可排序" rules="required">
      <pg-uploader multiple module="item" :limit="8" v-model="formData.share_images"/>
    </pg-form-item>
    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button class="ml-20" color="primary" @click="onSubmit">确定</pg-button>
    </div>
  </pg-form>

</template>
<script>

  import { Http, Api } from '@/util';

  export default {
    name: 'subitem-material-edit',
    props: {
      subitem: { type: Object, default() { return {} } },
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        formData: {
          share_content: '',
          share_images: []
        },
      }
    },

    created() {
      this._type_ = this.$props.type;
      if (this._type_ === 'modify') {
        this.$data.formData ={ ...this.$props.item };
      }
    },

    methods: {

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;
          Http.post(
            this._type_ === 'add' ? Api.subitemMaterialAdd : Api.subitemMaterialModify,
            {item_id: this.$props.subitem.id, ...this.$data.formData}
          ).then(() => {
            this.$toast({ type: 'success', message: `发圈素材${this._type_ === 'add' ? '新增' : '修改'}成功` });
            this.$emit('submit')
          });

        })
      },

      onCancel() {
        this.$emit('cancel');
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
    background-color: #eee;
    margin-top: 20px;
    padding: 10px;

  }
</style>
