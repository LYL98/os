<template>
  <pg-form ref="form" item-width="300px" class="pr-10">

    <pg-form-item label="商户等级">
      <div class="d-flex">
        <span
          v-for="item in gradeList"
          :key="item.code"
          class="badge cursor-pointer"
          style="user-select: none;"
          :class="{ 'badge-secondary outline': formData.grade_code !== item.code, 'badge-primary': formData.grade_code === item.code }"
          @click="changeGrade(item.code)"
        >{{ item.title }}</span>
      </div>
    </pg-form-item>

    <pg-form-item label="内标签">
      <div class="d-flex mb-10" v-for="parent in innerTagList" :key="parent.id">
        <div class="form-item-label">{{ parent.title }}</div>
        <div class="d-flex flex-wrap">
          <div
            v-for="tag in parent.child_tags"
            :key="tag.id"
            class="badge cursor-pointer"
            style="user-select: none;"
            :class="{ 'badge-secondary outline': !(formData.inner_tag_ids.includes(tag.id)), 'badge-primary': formData.inner_tag_ids.includes(tag.id) }"
            @click="changeInnerTag(parent, tag)"
          >{{ tag.title }}</div>
        </div>
      </div>
    </pg-form-item>

    <pg-form-item label="外标签">
      <div class="d-flex">
        <span
          v-for="item in outerTagList"
          :key="item.id"
          class="badge cursor-pointer"
          style="user-select: none;"
          :class="{ 'badge-secondary outline': !formData.outer_tags.includes(item.title), 'badge-primary': formData.outer_tags.includes(item.title) }"
          @click="changeOuterTag(item.title)"
        >{{ item.title }}</span>
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
        grade_code: '',
        inner_tag_ids: [],
        outer_tags: []
      },
      loading: false,

      gradeList: [],
      innerTagList: [],
      outerTagList: [],

    }
  },
  created() {

    const formData = { ...this.$props.item };
    formData.inner_tag_ids = formData.inner_tags.map(item => item.id);
    this.$data.formData = formData;

    this.commonMerchantGradeList();
    this.commonMerchantInnerTagList();
    this.commonMerchantOuterTagList();
  },

  methods: {
    changeGrade(grade_code) {
      this.$data.formData.grade_code = this.$data.formData.grade_code !== grade_code ? grade_code : '';
    },

    changeOuterTag(tag_title) {
      this.$data.formData.outer_tags = !this.$data.formData.outer_tags.includes(tag_title)
        ? [...this.$data.formData.outer_tags, tag_title]
        : this.$data.formData.outer_tags.filter(title => title !== tag_title);
    },

    changeInnerTag(parent, tag) {
      let inner_tag_ids = this.$data.formData.inner_tag_ids;

      // 如果列表为空，则直接添加
      if (inner_tag_ids.length === 0) {
        this.$data.formData.inner_tag_ids = [tag.id];
        return;
      }

      // 如果该tag 在列表中存在，则移除
      if (inner_tag_ids.includes(tag.id)) {
        this.$data.formData.inner_tag_ids = inner_tag_ids.filter(id => id !== tag.id);
        return;
      }

      // 如果该tag 在列表中不存在，移除兄弟tag 再添加
      const brother_tag_ids = parent.child_tags.map(item => item.id);
      inner_tag_ids = inner_tag_ids.filter(id => !brother_tag_ids.includes(id));

      this.$data.formData.inner_tag_ids = [...inner_tag_ids, tag.id];
    },

    onSubmit() {
      this.$refs['form'].validateAll().then(valid => {
        if (!valid) return;

        const { id, grade_code, inner_tag_ids, outer_tags }  = this.$data.formData;

        this.$data.loading = true;
        Http.post(Api.merchantGradeTagsEdit, { id, grade_code, inner_tag_ids, outer_tags })
          .then(() => {
            this.$data.loading = false;
            this.$toast({ type: 'success', message: `商户等级标签修改成功` });
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

    commonMerchantGradeList() {
      Http.get(Api.commonMerchantGradeList)
        .then(res => {
          this.$data.gradeList = res.data || [];
        });
    },

    commonMerchantInnerTagList() {
      Http.get(Api.commonMerchantInnerTagList)
        .then(res => {
          this.$data.innerTagList = res.data || [];
        });
    },

    commonMerchantOuterTagList() {
      Http.get(Api.commonMerchantOuterTagList)
        .then(res => {
          this.$data.outerTagList = res.data || [];
        });
    },

  }
}
</script>

<style scoped>
</style>
