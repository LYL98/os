<template>
  <pg-form ref="form" item-width="260px">
    <pg-form-item label="原密码" rules="required" class="mt-10">
      <pg-input type="password" placeholder="请输入原密码" v-model="formData.password_ori"></pg-input>
    </pg-form-item>

    <pg-form-item label="新密码" rules="required">
      <pg-input type="password" placeholder="请输入新密码" v-model="formData.password" @change="changePassword"></pg-input>
    </pg-form-item>

    <pg-form-item label="确认密码" :rules="{ required: true, 'logic:blur': confirmPass }">
      <pg-input type="password" placeholder="请确认新密码" v-model="formData.confirm_password"></pg-input>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="cancel">取消</pg-button>
      <pg-button class="ml-20" color="primary" @click="submit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import md5 from 'md5';
  import pgForm from './../form/form';
  import pgFormItem from './../form/form-item';
  import pgInput from './../input/input';
  import pgButton from './../button/button';
  import Toast from './../toast';
  import Http from './../../http/http';
  import { osConfig } from './../../pgyos.config';

  export default {
    name: "modify-pwd",
    components: {
      pgForm, pgFormItem, pgInput, pgButton, Toast
    },
    data() {
      return {
        formData: {
          password_ori: '',
          password: '',
          confirm_password: ''
        },
        loading: false,
      }
    },

    created() {
      this.confirmPass = {
        validate: (v) => {
          return this.$data.formData.password === v
        },
        getMsg: '两次密码输入不一致'
      }
    },

    methods: {

      changePassword(v) {
        if (v && this.$data.formData.confirm_password) {
          this.$refs['form']?.validate('确认密码');
        }
      },

      submit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          this.$data.loading = true;
          let data = {...this.$data.formData};
          data.password_ori = md5(data.password_ori);
          data.password = md5(data.password);
          Http.post(osConfig().modify_password_api, { password_ori: data.password_ori, password: data.password })
            .then(() => {
              this.$toast({
                type: 'success',
                message: '密码修改成功'
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