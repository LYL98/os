<template>
  <pg-form ref="form" item-width="300px" class="pr-10">

    <pg-form-item label="门店标签">
      <div class="d-flex mb-10" v-for="parent in storeTagList" :key="parent.id">
        <div class="form-item-label">{{ parent.title }}</div>
        <div class="d-flex flex-wrap">
          <div
            v-for="tag in parent.child_tags"
            :key="tag.id"
            class="badge cursor-pointer"
            style="user-select: none;"
            :class="{ 'badge-secondary outline': !(formData.tag_ids.includes(tag.id)), 'badge-primary': formData.tag_ids.includes(tag.id) }"
            @click="changeStoreTag(parent, tag)"
          >{{ tag.title }}</div>
        </div>
      </div>
    </pg-form-item>

    <div class="text-center mt-10">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
import { Http, Api } from '@/util';

export default {
  name: 'merchant-detail-tag-edit',
  inject: ['app'],
  props: {
    type: { type: String, default: 'tag' },
    item: { type: Object, default() { return {} } },
  },
  data() {
    return {
      formData: {
        store_id: 0,
        tag_ids: [],
      },
      loading: false,

      storeTagList: [],

    }
  },
  created() {

    const { id, tags } = this.$props.item;
    this.$data.formData = { store_id: id, tag_ids: tags.map(item => item.id) };
    this.commonMerchantStoreTagList();
  },

  methods: {

    changeStoreTag(parent, tag) {
      let tag_ids = this.$data.formData.tag_ids;

      // 如果列表为空，则直接添加
      if (tag_ids.length === 0) {
        this.$data.formData.tag_ids = [tag.id];
        return;
      }

      // 如果该tag 在列表中存在，则移除
      if (tag_ids.includes(tag.id)) {
        this.$data.formData.tag_ids = tag_ids.filter(id => id !== tag.id);
        return;
      }

      // 如果该tag 在列表中不存在，移除兄弟tag 再添加
      const brother_tag_ids = parent.child_tags.map(item => item.id);
      tag_ids = tag_ids.filter(id => !brother_tag_ids.includes(id));

      this.$data.formData.tag_ids = [...tag_ids, tag.id];
    },

    onSubmit() {
      this.$refs['form'].validateAll().then(valid => {
        if (!valid) return;

        const formData  = { ...this.$data.formData };

        this.$data.loading = true;
        Http.post(Api.storeTagEdit, formData)
          .then(() => {
            this.$data.loading = false;
            this.$toast({ type: 'success', message: `门店标签修改成功` });
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

    commonMerchantStoreTagList() {
      Http.get(Api.commonMerchantStoreTagList)
        .then(res => {
          this.$data.storeTagList = res.data || [];
        });
    },

  }
}
</script>
