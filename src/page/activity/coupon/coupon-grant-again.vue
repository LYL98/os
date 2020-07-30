<template>
  <pg-form vertical label-width="90px" ref="form" class="pr-20">

    <!-- 手动发放 -->
    <pg-form-item
      label="发放用户"
      :rules="{ 'logic:blur': phones_validator }"
      item-width="500px"
      help-text="输入用户手机号，以分号;隔开，每个手机号固定发放一张"
    >
      <pg-textarea
        :disabled="has_import_phones"
        rows="30"
        style="height: 300px"
        v-model="formData.phones"
        maxlength="100000"
        placeholder="输入 或 复制粘贴 符合规则的手机号..."
      ></pg-textarea>
    </pg-form-item>

    <input
      class="mt-20"
      type="file"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      @change="changeImportPhones"
    />

    <a class="ml-20" href="/excel/优惠券发放手机号导入模版.xlsx">下载导入模版</a>

    <div class="mt-20 text-secondary">
      注: 手动输入 和 批量导入，不可同时使用；批量导入后，将自动清空手动输入的手机号。
    </div>

    <div class="row no-gutters mt-30">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

  import {Http, Api, Excel} from '@/util';

  export default {
    name: 'coupon-grant-again',
    inject: ['app'],
    props: {
      type: {type: String, default: 'add'},
      item: {
        type: Object, default() {
          return {}
        }
      },
    },
    computed: {
      has_import_phones() {
        return Object.keys(this.$data.import_phones).length > 0
      }
    },

    data() {

      return {

        import_phones: {},

        formData: {
          id: '', // 需要发放的优惠券id

          // 手动发放
          phones: '', // 手机号, 不可重复

          // 主动领取 使用 start_time 、end_time、max_receive_cnt 字段

        },

        loading: false,
      }
    },

    created() {
      this.$data.formData.id = this.$props.item.id;

      this.phones_validator = {
        validate: v => {
          return /^([，；,;]*1\d{10}[，；,;]*)*$/.test(v);
        },
        getMsg: '输入格式不正确'
      }

    },
    methods: {

      onSubmit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          const formData = {...this.$data.formData};
          if (this.has_import_phones) {
            formData.phones = this.$data.import_phones;
          } else {
            formData.phones = this.arrayToMap(formData.phones.split(/[\n\s+,，；;]/g), 1);
          }

          if (Object.keys(formData.phones).length === 0) {
            this.$toast({type: 'warning', message: `请输入或导入发放用户`});
            return;
          }

          this.$data.loading = true;
          Http.post(Api.activityCouponManualGrantAgain, formData)
            .then(() => {
              this.$toast({type: 'success', message: `优惠券发放成功`});
              this.$data.loading = false;
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

      changeImportPhones(e) {
        const file = e.target.files[0];
        if (!file) return;
        Excel.read(file).then(res => {
          this.$data.import_phones = this.arrayToMap(res.data || []);
          if (this.$data.import_phones) {
            this.$toast({ type: 'success', message: '手机号码导入成功' });
          }
          if (this.has_import_phones) {
            this.$data.formData.phones = '';
          }
        }).catch(e => {
          this.$toast({ type: 'danger', message: e.message || '导入文件读取失败...' });
        })
      },

      arrayToMap(array, fixed_value = '') {
        let phones = {};
        if (!Array.isArray(array)) {
          this.$toast({ type: 'danger', message: '导入数据格式不正确' });
          return;
        }
        for (let i = 0; i < array.length; i++) {
          let item = array[i];
          let key = item['手机号码'] || item;
          let value = item['发放张数'] || 1;
          if (/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(key) && /^\+?[1-9][0-9]*$/.test(value)) {
            if (phones[key]) {
              phones[key] = phones[key] + Number(fixed_value || value);
            } else {
              phones[key] = (fixed_value || value);
            }
          } else {
            phones = {};
            this.$toast({ type: 'danger', message: '导入数据格式不正确' });
            break;
          }
        }
        return phones;
      },

    }
  }
</script>

<style scoped>
  .pg-table tbody td {
    padding: 20px 10px;
  }
</style>
