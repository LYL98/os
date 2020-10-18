<template>
  <div class="p-20">
    <div class="card">
      <div class="px-20 py-15 d-flex align-items-center">
        <h3 class="mb-0">将展示在商城「等级说明中」</h3>
        <pg-button
          color="primary"
          class="ml-auto"
          @click="handleSubmit"
          :loading="loading"
          :disabled="text === data_record.text"
        >保存修改</pg-button>
      </div>
      <pg-editor v-model="text" @created="vipConfigDescGet"></pg-editor>
    </div>
  </div>

</template>
<script>

  import { Http, Api } from '@/util';

  export default {
    name: 'vip-desc',
    inject: ['app'],
    data() {

      return {
        data_record: {
          text: ''
        },
        text: '',
        loading: false,
      }
    },

    created() {
      document.title = '会员等级 - 商城 - 蒲公英运营管理系统';
    },

    methods: {

      vipConfigDescGet() {
        Http.get(Api.merchantVipConfigDescGet, {})
          .then(res => {
            const rd = res.data || '';
            this.$data.data_record = { text: rd };
            this.$data.text = rd;
          })
      },

      handleSubmit() {
        this.$data.loading = true;
        Http.post(Api.merchantVipConfigDescSet, { text: this.$data.text })
          .then(() => {
            this.$data.loading = false;
            this.$toast({ type: 'success', message: `等级说明设置成功` });
            this.$data.data_record.text = this.$data.text;
          })
          .catch(() => {
            this.$data.loading = false;
          });
      },

    }

  }
</script>

<style lang="scss" scoped>

</style>

