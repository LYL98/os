<template>
  <pg-form ref="form" label-width="80px" item-width="300px" class="pr-30">

    <pg-form-item label="名称" rules="required|max_length:20">
      <pg-input placeholder="请输入20位以内的字符" v-model="formData.title"></pg-input>
    </pg-form-item>

    <div class="d-flex" v-for="(item, index) in formData.child_tags" :key="index">
      <pg-form-item
        :label="`标签项-${index + 1}`"
        rules="required|max_length:20"
      >
        <pg-input v-model="item.title" placeholder="请输入20位以内的字符"></pg-input>
      </pg-form-item>

      <a class="ml-10" style="line-height: 30px" v-if="index > 0" @click="handleRemoveItem(index)">移除</a>
    </div>

    <div>
      <pg-button style="margin-left: 90px;" size="sm" color="primary" @click="handleAddItem">增加标签项</pg-button>
    </div>

    <div class="text-center mt-30">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api } from '@/util';

export default {
  name: 'grade-edit',
  inject: ['app'],
  props: {
    type: { type: String, default: 'add' },
    item: { type: Object, default() { return {} } },
  },
  data() {
    return {
      formData: {
        title: '',
        child_tags: [ { title: '' } ]
      },
      loading: false,
    }
  },
  created() {

    const { type, item } = this.$props;

    if (type === 'modify') {
      const formData = { ...item };
      this.$data.formData = formData;
    }

  },

  methods: {
    handleAddItem() {
      this.$data.formData.child_tags = [
        ...this.$data.formData.child_tags,
        { title: '' }
      ]
    },

    handleRemoveItem(i) {
      this.$data.formData.child_tags = this.$data.formData.child_tags.filter((_, index) => index !== i);
    },

    onSubmit() {
      this.$refs['form'].validateAll().then(valid => {
        if (!valid) return;

        const formData = {...this.$data.formData};

        this.$data.loading = true;
        const type = this.$props.type;
        Http.post(type === 'add' ? Api.merchantPropertyStoreTagAdd: Api.merchantPropertyStoreTagEdit, formData)
          .then(() => {
            this.$data.loading = false;
            this.$toast({ type: 'success', message: `商户内标签${type === 'add' ? '新增' : '修改'}成功` });
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
  }
}
</script>

<style scoped>
</style>
