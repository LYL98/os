<template>
  <div class="pg-uploader-wrapper">

    <!-- <video :src="src" controls autoplay/> -->

    <template v-if="type === 'image'">
      <draggable class="d-flex" :sort="!disabled && multiple" v-model="list" @end="onEndDrag" :options="{group: 'people'}">
        <div 
          class="pg-img-box" 
          v-for="item in list" 
          :key="item"
          @mouseenter="onMouseenter(item)"
          @mouseleave="onMouseleave"
        >
          <img 
            :src="item" 
            class="file-img" 
            width="54" 
            height="54" 
            alt=""
          />
          <transition name="fade">
            <div class="pg-hover-mask" v-if="hover_item === item">
              <pg-button flat circle size="sm" @click="onRemoveItem(item)" v-if="!disabled"><i class="icon-bin"></i></pg-button>
              <pg-button flat circle size="sm" @click="onPreviewItem(item)"><i class="icon-search4"></i></pg-button>
            </div>
          </transition>
        </div>
      </draggable>
      
    </template>
    <template v-if="type === 'video'">
      <draggable class="d-flex" :sort="!disabled && multiple" v-model="list" @end="onEndDrag" :options="{group: 'people'}">
        <div
          class="pg-img-box" 
          v-for="item in list" 
          :key="item"
          @mouseenter="onMouseenter(item)"
          @mouseleave="onMouseleave"
        >
          <img 
            class="file-img" 
            width="54" 
            height="54"  
            src="data:image/png;base64,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" alt=""
          >
          <transition name="fade">
            <div class="pg-hover-mask" v-if="hover_item === item">
              <pg-button flat circle size="sm" @click="onRemoveItem(item)" v-if="!disabled"><i class="icon-bin"></i></pg-button>
              <pg-button flat circle size="sm" @click="onPreviewItem(item)"><i class="icon-search4"></i></pg-button>
            </div>
          </transition>
          <!-- <video :src="item" controls autoplay/> -->
        </div>
      </draggable>
    </template>
    <div class="pg-uploader" :class="{loading}" @click="onSelect" v-if="!disabled && (multiple ? list.length < limit : list.length < 1)">
      <input type="file" :accept="accept" class="file-input" hidden @change="onChange" ref="file-input" :multiple="multiple">
      <i v-if="loading" class="icon-spinner3 spinner"></i>
      <i class="icon-plus2" v-else></i>
    </div>
  </div>
</template>

<script>

  import vuedraggable from 'vuedraggable';

  import {findUpComponent} from './../_util/assist';
  import Http from './../../http/http';
  import Toast from './../toast';
  import Preview from './../preview';
  import pgButton from './../button/button';
  import { osConfig } from './../../pgyos.config';

  export default {
    name: "pg-uploader",
    components: {
      'draggable': vuedraggable,
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
      accept() {
        switch (this.$props.type) {
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