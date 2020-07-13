<template>
  <div class="pg-page d-flex flex-column justify-content-center">
    <div class="card">

      <pg-button-group v-model="btg" disabled :options="{ 'all': 0, 'only': 1, 'none': 2 }">
      </pg-button-group>

      <pg-button color="light" outline>light button</pg-button>



      <pg-form size="md" ref="form" item-width="200px" class="p-20">

        <pg-confirm>
          <template v-slot:help-text>
            <div style="width: 150px">
              {{ area }}
            </div>
          </template>
          <pg-button>打开</pg-button>
        </pg-confirm>



        <pg-tooltip>
          帮助说明...
        </pg-tooltip>

        <pg-tooltip>
          <div style="width: 200px" class="text-left">
            帮助说明...帮助说明...帮助说明...帮助说明...帮助说明...帮助说明...
          </div>
        </pg-tooltip>

        <pg-form-item label="排序" rules="required|decimal:2">
          <template slot="label">
            排序
            <pg-tooltip>
              帮助说明...
            </pg-tooltip>
          </template>
          <pg-input type="number" v-model="rank" @change="changeRank" suffix="元"/>
        </pg-form-item>

        <pg-form-item label="单选">
          <pg-radio-group v-model="radio" inline border>
            <pg-radio :value="1">男</pg-radio>
            <pg-radio :value="0">女</pg-radio>
          </pg-radio-group>
        </pg-form-item>

        <pg-form-item label="多选">
          <pg-checkbox-group v-model="checkbox" inline border>
            <pg-checkbox :value="1">男</pg-checkbox>
            <pg-checkbox :value="0">女</pg-checkbox>
          </pg-checkbox-group>
        </pg-form-item>

        <pg-form-item rules="required">
          <pg-textarea v-model="area"></pg-textarea>
        </pg-form-item>
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

        <pg-transfer :data="data" style="width: 800px;">
          <template v-slot:selected>
            <pg-column prop="label" title="label"></pg-column>
            <pg-column prop="value" title="value">
              <template v-slot="{row}">
                {{ row.value * 100 }}
              </template>
            </pg-column>
          </template>
        </pg-transfer>

        <pg-form-item
            size="lg"
            label="确认密码"
            help-text="两次密码必须保持一致两次密码必须保持一致两次密码必须保持一致两次密码必须保持一致两次密码必须保持一致"
            :rules="{ required: true, [`logic:${rank}:blur`]: confirmPass }"
        >
          <pg-input type="password" placeholder="请确认新密码" v-model="formData.confirm_password"></pg-input>
        </pg-form-item>

        <pg-form-item label="生效时间" item-width="500px">
          <pg-datepicker v-model="date" :limit="limit" range :quickable="true" timeable clearable></pg-datepicker>
        </pg-form-item>

        <pg-form-item label="商品详情" rules="required" item-width="600px">
          <pg-editor v-model="content"/>
        </pg-form-item>

        <pg-form-item>
          <pg-select value="2">
                <pg-option value="1">1</pg-option>
                <pg-option value="2">2</pg-option>
                <pg-option value="3">3</pg-option>
              </pg-select>
        </pg-form-item>

        <pg-form-item>
          <pg-input disabled>
            <template slot="suffix">
              <pg-select value="2">
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
  </div>
</template>

<script>

  export default {
    name: "modify-pwd",
    data() {
      return {
        checkbox: [0],
        radio: 0,
        area: '',
        rank: '1',
        video: 'item/123',
        content: '123',
        date: { begin_date: '2020-04-13', end_date: '2020-05-16' },
        limit: { from: '2020-04-11', to: '2020-05-19' },
        data: [
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
          { label: '5', value: 5 },
        ],
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
        validate: (v, n) => {
          console.log('n: ', n[0]);
          return this.$data.formData.password === v
        },
        getMsg: '两次密码输入不一致'
      }
    },

    methods: {
      changeRank(v) {
        console.log('change: ', v);
        
      },
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
