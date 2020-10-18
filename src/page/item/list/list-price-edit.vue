<template>
<!-- :disabled="_type_ === 'modify'" -->
  <pg-form ref="form" item-width="303px" label-width="90px" class="py-20 d-flex flex-column align-items-center" style="border-bottom: 1px solid #DDD">
    <pg-form-item label="调价生效时间" :rules="{required:true,logic: date_validator}">
      <pg-datepicker :disabled="formData.status === 'applied'" :quickable="false" range :limit="{ from: today }" timeable v-model="formData" beginDateKey="start_time"
          endDateKey="end_time"  />
    </pg-form-item>
    <pg-form-item label="当前销售价">
      <pg-input suffix="元" disabled :value="current_price_sale"/>
    </pg-form-item>
    <!-- :rules="{required: true, 'min_value:1': true, logic: custom_stock_validator}" -->
    <pg-form-item label="新的销售价" :rules="{required:true,'max_value:999999': true,'min_value:0.01': true, logic: price_validator }">
      <pg-input suffix="元" placeholder="请输入新的销售价" v-model="formData.new_price" type="decimal"/>
    </pg-form-item>
    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import { Http, Api, Handle } from '@/util';

  export default {
    name: 'list-price-edit',
    props: {
      type: { type: String, default: 'add' },
      subitem: { type: Object, default() { return {} } }, // 对应的是 在售商品
      item: { type: Object, default() { return {} } }, // 对应的是 定价记录
    },
    data() {
      let today = new Date();
      today = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      
      return {
        today: today,
        formData: {
          // start_time: '',
          // end_time:'',
          new_price: '',
        },
        loading: false,
      }
    },
    computed: {
      current_price_sale() {
        return Handle.returnPrice(this.$props.subitem.price_sale);
      },
    },
    created() {
      console.log('this.$props.subitem', this.$props.subitem);
      this._type_ = this.$props.type;
      
      if (this._type_ === 'modify') {
        const formData = { ...this.$props.item };
        console.log(formData.new_price);
        
        formData.new_price = Handle.returnPrice(formData.new_price);
        
        this.$data.formData = formData;
      }
      //校验
      this.price_validator = {
        validate: v => {
            return Number(v) !== Number(Handle.returnPrice(this.$props.subitem.price_sale));
        },
        getMsg: '不能与当前销售价一致'
        };


        this.date_validator ={
          validate: v => {
            let begintime_ms = new Date(v.start_time.replace(/-/g, "/")).getTime(); // 为开始时间
            let endtime_ms = new Date(v.end_time.replace(/-/g, "/")).getTime(); // 为结束时间

            let nowtime_ms = new Date().getTime();   // 为当前时间
            if(this.$data.formData.status === 'applied') return true;
            return (nowtime_ms < begintime_ms) && (nowtime_ms < endtime_ms) && (begintime_ms < endtime_ms);
          },
          getMsg: () => {
            let begintime_ms = new Date(this.$data.formData.start_time.replace(/-/g, "/")).getTime(); // 为开始时间
            let endtime_ms = new Date(this.$data.formData.end_time.replace(/-/g, "/")).getTime(); // 为结束时间

            let nowtime_ms = new Date().getTime();   // 为当前时间
            if ((nowtime_ms > begintime_ms)) {
                return '开始时间需大于当前时间';
              } else if((begintime_ms > endtime_ms) || (nowtime_ms > endtime_ms)) {
                return '结束时间需大于于开始时间';
              }else {
                return '请检查输入格式'
              }

          }
        }
    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData, sub_item_id: this.$props.subitem.id};
          formData.new_price = Handle.handlePrice(formData.new_price);

          this.$data.loading = true;
          Http.post(this._type_ === 'add' ? Api.itemPriceFixPlanAdd : Api.itemPriceFixPlanEdit, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `${this._type_ === 'add' ? '新增' : '修改'}定时调价成功` });
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