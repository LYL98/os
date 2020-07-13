<template>
  <div class="pg-uploader-wrapper">

    <draggable class="d-flex" :sort="!is_disabled && multiple" v-model="list" @end="onEndDrag">
      <div
          class="pg-img-box"
          v-for="item in list"
          :key="item"
          @mouseenter="onMouseenter(item)"
          @mouseleave="onMouseleave"
      >
        <img
            v-if="type === 'image'"
            :src="item"
            class="file-img"
            width="54"
            height="54"
            alt=""
        />
        <img
            v-if="type === 'video'"
            class="file-img"
            width="54"
            height="54"
            alt=""
            src="data:image/png;base64,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"
        >
        <img
            v-if="type === 'apk'"
            class="file-img"
            width="54"
            height="54"
            alt=""
            src="data:image/jpeg;base64,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"
        >
        <transition name="fade">
          <div class="pg-hover-mask" v-if="hover_item === item && (!is_disabled || type !== 'apk')">
            <pg-button flat circle size="sm" @click="onRemoveItem(item)" v-if="!is_disabled"><i class="icon-bin"></i></pg-button>
            <pg-button flat circle size="sm" @click="onPreviewItem(item)" v-if="type !== 'apk'"><i class="icon-search4"></i></pg-button>
          </div>
        </transition>
      </div>
    </draggable>

    <div class="pg-uploader" :class="{loading, disabled: is_disabled}" @click="onSelect" v-if="(multiple ? list.length < limit : list.length < 1)">
      <input type="file" :accept="accept" class="file-input" hidden @change="onChange" ref="file-input" :multiple="multiple">
      <i v-if="loading" class="icon-spinner3 spinner"></i>
      <i class="icon-plus2" v-else></i>
    </div>
  </div>
</template>

<script>

  import {findUpComponent} from './../_util/assist';
  import Http from './../../http/http';
  import Toast from './../toast';
  import Preview from './../preview';
  import pgButton from './../button/button';
  import { osConfig } from './../../pgyos.config';

  export default {
    name: "pg-uploader",
    components: {
      'draggable': window['vuedraggable'],
      'pg-button': pgButton,
    },
    props: {
      module: { type: String, default: 'item' },
      multiple: {type: Boolean, default: false},
      value: { type: String | Array, default: '' },
      type: { type: String, default: 'image' },
      limit: { type: Number, default: 5 },
      disabled: { type: Boolean, default: false },
    },
    model: {
      prop: 'value',
      event: 'change'
    },

    computed: {
      is_disabled() {
        return this.$props.disabled || !!this.pgFormItem?.disabled;
      },
      accept() {
        switch (this.$props.type) {
          case 'apk':
            return '.apk';
          case 'video':
            return 'audio/mp4';
          default: 
            return 'image/*';
        }
      }
    },

    watch: {
      value(v) {
        const {multiple} = this.$props;
        this.$data.list = multiple ? v.map(d => osConfig().cos_tenctent_path + d) 
                                   : v ? [osConfig().cos_tenctent_path + v] : [];
        this.pgFormItem?.sync?.(this.$data.list);
      }
    },

    data() {
      const {multiple, value} = this.$props;
      let v = [];
      if (multiple) {
        if (Array.isArray(value) && value.length > 0) {
          v = value.map(d => osConfig().cos_tenctent_path + d);
          this.pgFormItem?.sync?.(v);
        }
      } else {
        if (value) {
          v = [osConfig().cos_tenctent_path + value];
          this.pgFormItem?.sync?.(v);
        }
      }

      return {
        loading: false,
        list: v,
        hover_item: '',
      }
    },

    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },

    methods: {

      onSelect(e) {
        if (this.is_disabled) return;

        if (this.$data.loading) return;
        this.$refs['file-input']?.click?.();
      },

      onChange(event) {
        
        let files = event.target.files;

        const { multiple, value, limit } = this.$props;

        if (multiple) {
          if (limit - value.length < files.length) {
            Toast({ type: 'warning', message: `最多还能选择${limit - value.length}张图片` });
            return;
          }
          this.tencentPresignedUrl(files);
        } else {
          let file = files[0];
          if (!file) return;
          this.tencentPresignedUrl(files);
        }

      },

      // 获取到腾讯云的上传url
      tencentPresignedUrl(files) {
        this.$data.loading = true;
        files = [...files]; // files 类数组 需要进行转化。
        Promise.all(files.map(file => {
          return Http.get(osConfig().cos_presigned_api, {module: this.$props.module})
          .then(res => {
            let formData = {
              file: file,
              key: res.data.key,
              presigned_url: res.data.presigned_url
            };
            return this.upTencentPath(formData);
          })
        })).then(list => {
            this.$data.loading = false;
            let d = this.$props.multiple ? [...this.$props.value, ...list.map(d => d.data)] : list[0].data;
            this.$emit('change', d);
        }).catch(e => {
            this.$data.loading = false;
            Toast({ type: 'danger', message: e.message });
          });
      },

      upTencentPath(data) {
        return new Promise((resolve, reject) => {
          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                resolve({ code: 0, data: data.key });
              } else {
                reject({ code: 4, message: '图片上传失败！请重试...', data: null });
              }
            }
          };
          xhr.open('PUT', data.presigned_url, false);
          xhr.send(data.file);
        });
      },

      onEndDrag() {
        let list = this.$data.list.map(item => item.substring(osConfig().cos_tenctent_path.length));
        this.$emit('change', list);
      },

      onMouseenter(item) {
        this.$data.hover_item = item;
      },

      onMouseleave() {
        this.$data.hover_item = '';
      },

      onRemoveItem(item) {
        const { multiple, value } = this.$props;
        if (multiple) {
          this.$emit('change', value.filter(d => (osConfig().cos_tenctent_path + d) !== item));
        } else {
          this.$emit('change', '');
        }
      },

      onPreviewItem(item) {
        Preview({ src: item, list: this.$data.list, type: this.$props.type });
      },
    }
  }
</script>

<style scoped>

</style>