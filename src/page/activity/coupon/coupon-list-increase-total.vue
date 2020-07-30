<template>
  <pg-form item-width="250px" ref="form">

    <pg-form-item label="增加数量" rules="required|min_value:1|max_value:1000000">
      <pg-input placeholder="请输入需要增加的数量" auto-focus type="number" v-model="formData.num" suffix="张"></pg-input>
    </pg-form-item>

    <div class="row no-gutters">
      <div class="col-12 text-center">
        <pg-button @click="onCancel">取消</pg-button>
        <pg-button class="ml-20" color="primary" :loading="loading" @click="onSubmit">确定</pg-button>
      </div>
    </div>
  </pg-form>

</template>

<script>

  import { Http, Api } from '@/util';

  export default {
    name: 'coupon-list-increase-total',
    inject: ['app'],
    props: {
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
      const {id} = this.$props.item;
      this.$data.formData = {id, num: ''};

    },
    methods: {

      onSubmit() {
        this.$refs['form']?.validateAll().then(valid => {
          if (!valid) return;
          const formData = {...this.$data.formData};

          formData.num = Number(formData.num);

          this.$data.loading = true;
          Http.post(Api.activityCouponIncreaseTotal, formData)
            .then(() => {
              this.$toast({ type: 'success', message: `优惠券总量增加成功` });
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

    }
  }
</script>
