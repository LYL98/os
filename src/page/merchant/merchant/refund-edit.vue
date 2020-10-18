<template>
  <pg-form ref="form" item-width="300px" class="pr-10">

    <pg-form-item label="门店名称">
      <pg-input v-model="formData.title" placeholder="请输入商户名称" disabled></pg-input>
    </pg-form-item>

    <pg-form-item label="修改类型" rules="required">
      <pg-radio-group inline border v-model="formData.radio" @change="changeType">
        <pg-radio :value="1">增加</pg-radio>
        <pg-radio :value="0">减少</pg-radio>
      </pg-radio-group>
    </pg-form-item>

    <pg-form-item label="剩余筐数">
      <div class="d-flex">
        <span style="min-width: 100px" class="form-item-label text-left"> {{ item.frame_num }} 个</span>

        <pg-form-item
          item-width="190px"
          v-if="formData.radio == 1"
          key="num+"
          label="增加的筐数"
          :show-label="false"
          rules="required|min_value:1|max_value:1000000"
        >
          <pg-input type="number" suffix="个" prefix="+" v-model="formData.frame_num"></pg-input>
        </pg-form-item>

        <pg-form-item
          item-width="190px"
          v-if="formData.radio == 0"
          key="num-"
          label="减少的筐数"
          :show-label="false"
          :rules="`required|min_value:1|max_value:${item.frame_num}`"
        >
          <pg-input type="number" suffix="个" prefix="—" v-model="formData.frame_num"></pg-input>
        </pg-form-item>
      </div>
    </pg-form-item>

    <pg-form-item label="剩余金额">
      <div class="d-flex">
        <span style="min-width: 100px"  class="form-item-label text-left"> {{ Handle.returnPrice(item.frame_amount) }} 元</span>

        <pg-form-item
          item-width="190px"
          v-if="formData.radio == 1"
          key="amount+"
          label="增加的金额"
          :show-label="false"
          rules="required|min_value:0.01:blur|max_value:1000000"
        >
          <pg-input type="decimal:2" suffix="元" prefix="+" v-model="formData.frame_amount"></pg-input>
        </pg-form-item>

        <pg-form-item
          item-width="190px"
          v-if="formData.radio == 0"
          key="amount-"
          label="减少的金额"
          :show-label="false"
          :rules="`required|min_value:0.01:blur|max_value:${Handle.returnPrice(item.frame_amount)}`"
        >
          <pg-input type="decimal:2" suffix="元" prefix="—" v-model="formData.frame_amount"></pg-input>
        </pg-form-item>
      </div>
    </pg-form-item>

    <pg-form-item label="备注">
      <pg-textarea v-model="formData.remark"></pg-textarea>
    </pg-form-item>

    <div class="text-center mt-10">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api, Handle } from '@/util';

export default {
  name: 'merchant-detail-edit',
  inject: ['app'],
  props: {
    type: { type: String, default: 'modify' },
    item: { type: Object, default() { return {} } },
  },
  data() {
    return {
      formData: {

      },
      loading: false,
    }
  },
  created() {

    this.Handle = Handle;

    const {id, title} = this.$props.item;
    this.$data.formData = {
      store_id: id,
      title: title,
      radio: 1,
      frame_amount: '',
      frame_num: '',
      remark: ''
    };
  },

  methods: {

    changeType() {
      this.$data.formData = {
        ...this.$data.formData,
        frame_amount: '',
        frame_num: '',
      };
    },

    onSubmit() {
      this.$refs['form'].validateAll().then(valid => {
        if (!valid) return;

        const formData = {...this.$data.formData};
        formData.frame_amount = Handle.handlePrice(formData.frame_amount);
        formData.frame_num = Number(formData.frame_num);

        if (formData.radio === 0) {
          formData.frame_amount = -formData.frame_amount;
          formData.frame_num = -formData.frame_num;
        }

        this.$data.loading = true;
        Http.post(Api.merchantRefundEdit, formData)
          .then(() => {
            this.$data.loading = false;
            this.$toast({ type: 'success', message: `门店退筐信息修改成功！` });
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
