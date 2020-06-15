<template>
  <textarea name="ckeditor" id="ckeditor" rows="20" cols="80">
    {{ ev }}
  </textarea>
</template>

<script>
import Http from './../../http/http';
import Toast from './../toast';
import { osConfig } from './../../pgyos.config';
import {findUpComponent} from './../_util/assist';

export default {
  name: 'pg-editor',

  props: {
    value: { type: String, default: '' },
    valid: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
  },

  model: {
    prop: 'value',
    event: 'change'
  },

  data() {
    let ev = this.$props.value;
    // ev + '' 转换为字符串 去除空格后 ，如果不为空，则表示该数据存在
    if ((ev + '').trim()) {
      this.$props.valid && this.pgFormItem?.sync?.(ev);
    }
    return {
      ev: ev
    }
  },

  computed: {
    is_disabled() {
      return this.$props.disabled || !!this.pgFormItem?.disabled;
    },
  },

  watch: {
    is_disabled: {
      immiable: true,
      handler(v) {
        CKEDITOR && CKEDITOR.instances && CKEDITOR.instances.ckeditor && CKEDITOR.instances.ckeditor.setReadOnly(v);
      }
    },
    value(v) {
      this.$nextTick(() => {
        this.$props.valid && this.pgFormItem?.sync?.(v);
      });
      if (!CKEDITOR || !CKEDITOR.instances || !CKEDITOR.instances.ckeditor) return;
      if (v === CKEDITOR.instances.ckeditor.getData()) return;
      CKEDITOR.instances.ckeditor.setData(v);
    }
  },

  beforeCreate() {
    this.pgFormItem = findUpComponent(this, 'pg-form-item');
  },

  mounted() {
    CKEDITOR && CKEDITOR.replace('ckeditor');
    CKEDITOR && CKEDITOR.on('instanceReady', this.instanceReady);
  },

  beforeDestory() {
    CKEDITOR && CKEDITOR.instances.ckeditor && CKEDITOR.instances.ckeditor.destroy();
  },

  methods: {

    instanceReady(e) {
      this.$emit('created')
      CKEDITOR.instances.ckeditor.setReadOnly(this.is_disabled);

      e.editor.widgets.on('instanceCreated', params => {
      });

      e.editor.on('change', change => {
        this.$emit('change', CKEDITOR.instances.ckeditor.getData());
      });

      // const upload = e.editor.uploadRepository;
      // upload.on('instanceCreated', eve => {
      //   console.log('eve:', eve);
      // });

      // e.editor.on('fileUploadRequest', evt => {
      //   this.fileUploadRequest(evt);
      //   // Prevented the default behavior.
      //   evt.stop();
      // });
      // e.editor.on('fileUploadResponse', evt => {
      //   // evt.stop();
      //   console.log('fileUploadResponse', evt);
      // });

    },

    fileUploadRequest(evt) {
      Http.get(osConfig().cos_presigned_api, { module: 'item' }).then((res) => {
          var fileLoader = evt.data.fileLoader;
          // var formData = new FormData(),
          //     xhr = fileLoader.xhr;

          // fileLoader.uploadUrl = res.data.presigned_url;
          // xhr.open( 'PUT', fileLoader.uploadUrl, true );
          // formData.append( 'upload', fileLoader.file, fileLoader.fileName );
          // fileLoader.xhr.send( formData );

          fileLoader.uploadUrl = res.data.presigned_url;
          fileLoader.xhr = new XMLHttpRequest();
          fileLoader.xhr.onreadystatechange = function(e) {
            if (fileLoader.xhr.readyState === 4) {
              if (fileLoader.xhr.status === 200) {
                return { code: 0, data: res.data.key };
              } else {
                return { code: 4, message: '图片上传失败！请重试...', data: null };
              }
            }
          };
          fileLoader.xhr.open('PUT', fileLoader.uploadUrl, false);
          fileLoader.xhr.send(fileLoader.file);
        });
    }
  }
};
</script>
