<template>
  <pg-form ref="form" item-width="450px">

    <pg-form-item label="图片" rules="required" help-text="鼠标悬浮显示操作按钮, 建议上传尺寸为690x280的图片">
      <pg-uploader v-model="formData.image" module="setting"/>
    </pg-form-item>
    <pg-form-item label="可用状态" item-width="300px" rules="required" help-text="如果禁用，则该图片不会显示在首页">
      <pg-button-group v-model="formData.is_usable" :options="{ '显示': true, '禁用': false }">
      </pg-button-group>
    </pg-form-item>
    <pg-form-item label="排序" item-width="300px" rules="min_value:0:blur|max_value:999:blur" help-text="请输入0 - 999的数值, 值越大, 排序越靠前">
      <pg-input type="number" v-model="formData.rank" placeholder="请输入Banner图片的排序值"/>
    </pg-form-item>
    <pg-form-item label="链接类型" rules="required" help-text="Banner图片的链接类型，选择其他表示不设置链接">
      <pg-button-group
        @change="formData.url.link_id = ''"
        v-model="formData.url.type"
        :options="{ '商品': 'item', '运营专区': 'tag', '展示分类': 'display', '没有链接': 'nolink' }"
      />
    </pg-form-item>
    <pg-form-item key="item" label="商品" rules="required" v-if="formData.url.type === 'item'">
      <pg-select searchable @search="commonItemList" v-model="formData.url.link_id" placeholder="请选择需要链接到的商品">
        <pg-option
          v-for="item in itemList"
          :key="item.id"
          :value="item.id"
        >{{ item.title }}</pg-option>
      </pg-select>
    </pg-form-item>
    <pg-form-item key="tag" label="运营专区" rules="required" v-if="formData.url.type === 'tag'">
      <pg-select searchable v-model="formData.url.link_id" placeholder="请选择需要链接到的运营专区">
        <pg-option
          v-for="item in itemTagList"
          :key="item.id"
          :value="item.id"
        >{{ item.title }}</pg-option>
      </pg-select>
    </pg-form-item>
    <pg-form-item key="display" label="展示分类" rules="required" v-if="formData.url.type === 'display'">
      <pg-cascader
        :level="2"
        primary-key="id"
        parent-key="parent_id"
        :options="itemDisplayClassTree"
        v-model="formData.url.link_id"
        @selection="onSelectDisplayClass"
        placeholder="请选择需要链接到的展示分类"
      />
    </pg-form-item>

    <div class="text-center">
      <pg-button @click="onCancel">取消</pg-button>
      <pg-button color="primary" class="ml-20" @click="onSubmit" :loading="loading">确定</pg-button>
    </div>
  </pg-form>
</template>

<script>
  import { Http, Api } from '@/util';

  export default {
    name: 'banner-edit',
    inject: ['app'],
    props: {
      type: { type: String, default: 'add' },
      item: { type: Object, default() { return {} } },
    },
    data() {
      const province_code = this.app.userInfo.province_code;
      return {
        formData: {
          province_code: province_code,
          image: '',
          is_usable: true,
          rank: '',
          url: {
            type: 'item',
            link_id: '',
            link_item: {}
          }
        },
        loading: false,
        itemList: [],
        itemTagList: [],
        itemDisplayClassTree: [],
      }
    },
    computed: {
      province_code() {
        return this.app.userInfo.province_code;
      }
    },
    created() {
      if (this.$props.type === 'modify') {
        const formData = { ...this.$props.item };
        // 解析 url
        formData.url = this.analyzeUrl(formData.url);
        this.$data.formData = formData;
      }
      this.commonItemList();
      this.commonItemTagList();
      this.commonDisplayClassTree();
    },

    methods: {
      onSelectDisplayClass(selection) {
        this.$data.formData.url.link_item = selection;
      },

      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          formData.rank = Number(formData.rank);
          formData.url = this.generateUrl(formData.url); // 生成url

          this.$data.loading = true;
          const type = this.$props.type;
          Http.post(type === 'add' ? Api.settingBannerAdd : Api.settingBannerModify, formData)
            .then(() => {
              this.$data.loading = false;
              this.$toast({ type: 'success', message: `${type === 'add' ? '新增' : '修改'}Banner成功` });
              this.$emit('submit');
            })
            .catch(() => {
              this.$data.loading = false;
            });

        });
      },

      generateUrl(item) {
        const { type, link_id, link_item } = item;
        switch (type) {
          case 'item':
            return '/pages/itemDetail/itemDetail?id=' + link_id;
          case 'tag':
            return '/pages/itemTag/itemTag?id=' + link_id;
          case 'display':
            return link_item._node_path_
              ? "app://itemList/" + link_item._node_path_.map(item => item.id).join("_")
              : '';
        }

        return '';
      },

      analyzeUrl(url) {
        let type = 'nolink', link_id = '', link_item = {};

        if (url.includes("/pages/itemDetail")) {
          type = 'item';
          link_id = Number(String(url.match(/id=\d+/)).substring(3));

        } else if (url.includes("/pages/itemTag")) {
          type = 'tag';
          link_id = Number(String(url.match(/tag=\d+/)).substring(4));

        } else if (url.includes('app://itemList')) {
          const ids = String(url.match(/\d+/g)).split(',').map(id => Number(id));
          type = 'display';
          link_id = ids[ids.length - 1];
          link_item = { id: link_id, _node_path_: ids.map(id => ({ id })) };
        }

        return { type, link_id, link_item };
      },

      commonItemList(condition = '') {
        Http.get(Api.commonItemList, {
          province_code: this.province_code,
          condition,
          need_num: 30,
          is_presale: 0,
          is_on_sale: 1,
          is_deleted: 0,
        })
          .then(res => {
            this.$data.itemList = res.data || [];
          });
      },
      commonItemTagList() {
        Http.get(Api.commonItemTagList, {province_code: this.province_code,})
          .then(res => {
            this.$data.itemTagList = res.data || [];
          });
      },
      commonDisplayClassTree() {
        Http.get(Api.commonDisplayClassTree, { province_code: this.province_code })
          .then(res => {
            this.$data.itemDisplayClassTree = res.data || [];
          });
      },

      onCancel() {
        this.$emit('cancel');
      },
    }
  }
</script>
