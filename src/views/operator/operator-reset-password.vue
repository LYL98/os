<template>
  <pg-form ref="form" item-width="260px">

    <pg-form-item label="新密码" rules="required">
      <pg-input autoFocus type="password" placeholder="请输入新密码" v-model="formData.password"></pg-input>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="cancel">取消</pg-button>
      <pg-button class="ml-20" color="primary" @click="submit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import md5 from 'md5';
  import { Http, Config } from '@/util';

  export default {
    name: "operator-reset-password",
    props: {
      item: { type: Object, default() { return {} } },
    },
    data() {
      return {
        formData: {
          password: '',
          id: this.$props.item.id,
        },
        loading: false,
      }
    },

    methods: {

      submit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          this.$data.loading = true;
          let data = {...this.$data.formData};
          data.password = md5(data.password);
          Http.post(Config.api.operatorPwdReset, data)
            .then(() => {
              this.$toast({
                type: 'success',
                message: '密码重置成功'
              });
              this.$data.loading = false;
              this.$emit('submit');

            }).catch(() => {
            this.$data.loading = false;
          });

        });
      },

      cancel() {
        this.$emit('cancel');
      }

    }
  }
</script>

<style scoped>

</style>