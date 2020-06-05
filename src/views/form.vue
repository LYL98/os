<template>
  <div class="pg-page d-flex flex-column justify-content-center">
    <div class="card">
      <pg-form size="md" ref="form" item-width="200px" vertical class="p-20">
        <pg-form-item>
          <pg-uploader v-model="video" type="video"/>
        </pg-form-item>
        <pg-form-item
            label="原密码"
            rules="required"
        >
          <pg-input type="password" placeholder="请输入原密码" v-model="formData.password_ori"></pg-input>
        </pg-form-item>

        <pg-form-item
            size="base"
            label="新密码"
            :rules="{ required: true, 'pwd:blur': true}"
            help-text="两次密码必须保持一致"
        >
          <pg-input type="password" placeholder="请输入新密码" v-model="formData.password" @change="changePassword"></pg-input>
        </pg-form-item>

        <pg-form-item
            size="lg"
            label="确认密码"
            help-text="两次密码必须保持一致两次密码必须保持一致两次密码必须保持一致两次密码必须保持一致两次密码必须保持一致"
            :rules="{ required: true, 'logic:blur': confirmPass }"
        >
          <pg-input type="password" placeholder="请确认新密码" v-model="formData.confirm_password"></pg-input>
        </pg-form-item>

        <pg-form-item label="生效时间" item-width="500px">
          <pg-datepicker v-model="date" :limit="limit" range :quickable="true" timeable ></pg-datepicker>
        </pg-form-item>

        <pg-form-item label="商品详情" rules="required" item-width="600px">
          <pg-editor v-model="content" disabled/>
        </pg-form-item>

        <pg-form-item>
          <pg-select value="2" disabled>
                <pg-option value="1">1</pg-option>
                <pg-option value="2">2</pg-option>
                <pg-option value="3">3</pg-option>
              </pg-select>
        </pg-form-item>

        <pg-form-item>
          <pg-input disabled>
            <template slot="suffix">
              <pg-select value="2" disabled>
                <pg-option value="1">1</pg-option>
                <pg-option value="2">2</pg-option>
                <pg-option value="3">3</pg-option>
              </pg-select>
            </template>
          </pg-input>
        </pg-form-item>

        <div class="text-center mt-20">
          <pg-button @click="cancel">取消</pg-button>
          <pg-button class="ml-20" color="primary" @click.native="submit" :loading="loading">确定</pg-button>
        </div>

      </pg-form>
    </div>

    <div class="pg-page-footer fixed mt-20">
      123
    </div>
  </div>
</template>

<script>

  export default {
    name: "modify-pwd",
    data() {
      return {
        video: '',
        content: '123',
        date: { begin_date: '2020-04-13', end_date: '2020-05-16' },
        limit: { from: '2020-04-11', to: '2020-05-19' },
        formData: {
          password_ori: '',
          password: '',
          confirm_password: ''
        },
        loading: false
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
        let that = this;
        this.$refs['form']?.validateAll().then(valid => {
          if (valid) {
            that.$data.loading = true;
            let data = {...that.$data.formData};
          }
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
