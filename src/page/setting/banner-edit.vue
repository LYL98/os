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
        :options="{ '商品': 'item', '预售商品': 'presale', '展示分类': 'display', '秒杀': 'seckill', '优惠券': 'coupon', '其他': 'other' }"
      />
    </pg-form-item>
    <pg-form-item :key="item" label="商品" rules="required" v-if="formData.url.type === 'item'">
      <pg-select searchable @search="commonItemList" v-model="formData.url.link_id" placeholder="请选择需要链接到的商品">
        <pg-option
          v-for="item in itemList"
          :key="item.id"
          :value="item.id"
        >{{ item.title }}</pg-option>
      </pg-select>
    </pg-form-item>
    <pg-form-item :key="presale" label="预售商品" rules="required" v-if="formData.url.type === 'presale'">
      <pg-select searchable v-model="formData.url.link_id" placeholder="请选择需要链接到的预售商品">
        <pg-option
          v-for="item in itemPresaleList"
          :key="item.id"
          :value="item.id"
        >{{ item.title }}</pg-option>
      </pg-select>
    </pg-form-item>
    <pg-form-item :key="display" label="展示分类" rules="required" v-if="formData.url.type === 'display'">
      <pg-select searchable v-model="formData.url.link_id" placeholder="请选择需要链接到的展示分类">
        <pg-option
          v-for="item in itemDisplayClassList"
          :key="item.id"
          :value="item.id"
        >{{ item.title }}</pg-option>
      </pg-select>
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
          }
        },
        loading: false,
        itemList: [],
        itemPresaleList: [],
        itemDisplayClassList: [],
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
        if (typeof formData.url === 'string') {
          formData.url = JSON.parse(formData.url);

          if (typeof formData.url === 'object' && ['item', 'presale', 'display', 'seckill', 'coupon'].includes(formData.url.type)) { // 只处理正确格式的字符串
          } else {
            formData.url = { type: 'other', link_id: '' };
          }
        } else {
          formData.url = { type: 'other', link_id: '' };
        }
        this.$data.formData = formData;
      }
      this.commonItemList();
      this.commonItemPresaleList();
      this.commonDisplayClassList();
    },

    methods: {
      onSubmit() {
        this.$refs['form'].validateAll().then(valid => {
          if (!valid) return;

          const formData = {...this.$data.formData};
          formData.rank = Number(formData.rank);
          formData.url = JSON.stringify(formData.url);

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
      commonItemPresaleList(condition = '') {
        Http.get(Api.commonItemList, {
          province_code: this.province_code,
          condition,
          need_num: 30,
          is_presale: 1,
          is_on_sale: 1,
          is_deleted: 0,
        })
          .then(res => {
            this.$data.itemPresaleList = res.data || [];
          });
      },
      commonDisplayClassList() {
        Http.get(Api.commonDisplayClassList, { province_code: this.province_code })
          .then(res => {
            this.$data.itemDisplayClassList = res.data || [];
          });
      },

      onCancel() {
        this.$emit('cancel');
      },
    }
  }
</script>
