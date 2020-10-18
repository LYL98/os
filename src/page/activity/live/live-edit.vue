<template>
  <pg-form ref="form" class="px-20">

    <pg-form-item label="区域" :show-label="false" item-width="550px" rules="required">
      <pg-transfer :data="province_list" v-model="formData.province_codes"></pg-transfer>
    </pg-form-item>

    <div class="text-center" style="position: relative; z-index: 200;">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api } from '@/util';

export default {
  name: 'live-edit',
  inject: ['app'],
  props: {
    type: { type: String, default: 'modify' },
    item: { type: Object, default() { return {} } },
    provinceList: { type: Array, default() { return [] } }
  },
  data() {
    return {
      formData: {
        province_codes: [],
        lv_id: '',
      },
      loading: false,
    }
  },
  computed: {
    province_list() {
      return this.$props.provinceList.map(item => ({ label: item.title, value: item.code }));
    }
  },
  created() {
    this.$data.formData.lv_id = this.$props.item.id;
  },

  methods: {

    onSubmit() {
      this.$refs['form'].validateAll().then(valid => {
        if (!valid) return;

        const formData = {...this.$data.formData};

        this.$data.loading = true;
        Http.post(Api.activityLiveEdit, formData)
          .then(() => {
            this.$data.loading = false;
            this.$toast({ type: 'success', message: `直播区域设置成功` });
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
