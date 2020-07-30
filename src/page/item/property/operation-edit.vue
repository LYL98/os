<template>
  <pg-form ref="form" item-width="200px" label-width="90px">
    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="名称" rules="required|max_length:4:blur" help-text="小于等于4个字符">
          <pg-input v-model="formData.title" placeholder="请输入运营专区名称"/>
        </pg-form-item>
      </div>
      <div class="col-6">
        <pg-form-item label="排序" rules="min_value:0:blur|max_value:999:blur" help-text="请输入0 - 999的数值, 值越大, 排序越靠前">
          <pg-input type="number" v-model="formData.rank" placeholder="请输入运营专区的排序值"/>
        </pg-form-item>
      </div>
    </div>

    <div class="row no-gutters">
      <div class="col-6">
        <pg-form-item label="简称" rules="required|max_length:4:blur" help-text="小于等于4个字符, 做为标签显示在商品的标题前面">
          <pg-input v-model="formData.sample_title" placeholder="请输入简称"/>
        </pg-form-item>
      </div>
      <div class="col-6">
        <pg-form-item label="概述" rules="required|max_length:4:blur" help-text="小于等于4个字符, 概述将显示在零售商城的首页">
          <pg-input v-model="formData.remark" placeholder="请输入概述"/>
        </pg-form-item>
      </div>
    </div>
    <pg-form-item label="是否显示标签" rules="required" help-text="专区简称将做为标签, 显示在商品名称前面, 商品名称前最多显示两个标签">
      <pg-button-group v-model="formData.is_show" :options="{ '显示': true, '不显示': false }">
      </pg-button-group>
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
    name: 'operation-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      const province_code = this.app.userInfo.province_code;
      return {
        formData: {
          province_code: province_code,
          title: '',
          sample_title: '',
          rank: '',
          is_show: true,
          remark: '',
        },
        loading: false,
      }
    },
    created() {
      if (this.$props.type === 'modify') {
        this.$data.formData = { ...this.$props.item };
      }
    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          formData.rank = Number(formData.rank);

          this.$data.loading = true;
          const type = this.$props.type;
          Http.post(type === 'add' ? Api.operationAdd : Api.operationEdit, formData)
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
      }
    }
  }
</script>
