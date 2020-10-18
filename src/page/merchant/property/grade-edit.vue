<template>
  <pg-form ref="form" label-width="90px" item-width="300px" class="pr-20">

    <pg-form-item label="编号" rules="required|max_length:12" help-text="商户等级编号格式：12位以内的字母和数字组合">
      <pg-input placeholder="请输入编号" v-model="formData.code" :disabled="type === 'modify'"></pg-input>
    </pg-form-item>

    <pg-form-item label="名称" rules="required|max_length:6">
      <pg-input placeholder="请输入6位以内的字符" v-model="formData.title"></pg-input>
    </pg-form-item>

    <pg-form-item label="排序" rules="required|min_value:0|max_value:999">
      <pg-input type="number" placeholder="请输入排序值 0 ～ 999" v-model="formData.rank"></pg-input>
    </pg-form-item>

    <div class="text-center">
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
        code: '',
        title: '',
        rank: '',
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
    onSubmit() {
      this.$refs['form'].validateAll().then(valid => {
        if (!valid) return;

        const formData = {...this.$data.formData};

        this.$data.loading = true;
        const type = this.$props.type;
        Http.post(type === 'add' ? Api.merchantPropertyGradeAdd : Api.merchantPropertyGradeEdit, formData)
          .then(() => {
            this.$data.loading = false;
            this.$toast({ type: 'success', message: `商户等级${type === 'add' ? '新增' : '修改'}成功` });
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
