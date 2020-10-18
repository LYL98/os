<template>
  <pg-form ref="form" item-width="260px">
    <pg-form-item rules="required" label="分配">
      <pg-button-group
        :disabled="!(app.auth.isAdmin || app.auth.OrderAfterSaleAllocateToService)"
        style="width: 238px"
        v-model="formData.allocateType"
        :options="{ '分配给客服': 'service', '分配给自己': 'my' }"
      ></pg-button-group>
    </pg-form-item>

    <pg-form-item rules="required" label="客服" v-if="formData.allocateType=='service'">
      <pg-select
        v-model="formData.operator_id"
        placeholder="请选择客服"
        searchable
        clearable
        @change="changeQuery"
      >
        <pg-option
          v-for="item in operatorList"
          :key="item.id"
          :value="item.id"
        >{{ item.realname }} {{ item.phone }}</pg-option>
      </pg-select>
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api } from '@/util'

export default {
  name: 'allocate',
  inject: ['app','listQuery'],
  props: {
    item: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      formData: {
        operator_id: '',
        allocateType: 'service',
        ids: []
      },
      loading: false,
      operatorList: [],
    }
  },
  created() {
    let item = [];
    if(Array.isArray(this.$props.item)) {
      item = [...this.$props.item];
    }else {
      item.push(this.$props.item);
    }
    item.forEach((v)=>{
      this.$data.formData.ids.push(v.id);
    })
    this.commonOperatorList()
  },

  methods: {
    commonOperatorList() {
      Http.get(Api.commonOperatorList, { post: 'service' }).then((res) => {
        if (res.code === 0) {
          this.$data.operatorList = res.data
        }
      })
    },
    onSubmit() {
      this.$refs['form'].validateAll().then((valid) => {
        if (!valid) return

        const formData = { ...this.$data.formData }
        if(formData.allocateType === 'my') {
            formData.operator_id = this.app.$data.userInfo.id;
        } 

        this.$data.loading = true
        Http.post(Api.orderAftersaleAllocateToOperator, formData)
          .then(() => {
            this.$data.loading = false
            this.$toast({ type: 'success', message: '分配成功' })
            this.$emit('submit')
            this.listQuery.$data.selectionItems = [];
          })
          .catch(() => {
            this.$data.loading = false
          })
      })
    },
    onCancel() {
      this.$emit('cancel')
    },
  },
}
</script>
