<template>
  <textarea name="ckeditor" id="ckeditor" rows="20" cols="80">
    {{ ev }}
  </textarea>
</template>

<script>
  import Http from './../../http/http';
  import {osConfig} from './../../pgyos.config';
  import {findUpComponent} from './../_util/assist';

  export default {
    name: 'pg-editor',

    props: {
      value: {type: String, default: ''},
      valid: {type: Boolean, default: true},
      disabled: {type: Boolean, default: false},
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
        this.$emit('created');
        CKEDITOR.instances.ckeditor.setReadOnly(this.is_disabled);

        e.editor.widgets.on('instanceCreated', params => {
        });

        e.editor.on('change', change => {
          this.$emit('change', CKEDITOR.instances.ckeditor.getData());
        });

        e.editor.on('fileUploadRequest', evt => {

          Http.get(osConfig().cos_presigned_api, {module: 'item'}, { handleError: false })
            .then((res) => {
              var fileLoader = evt.data.fileLoader;

              fileLoader.uploadUrl = res.data.presigned_url;
              fileLoader.xhr.open('PUT', fileLoader.uploadUrl, true);
              fileLoader.xhr.send(fileLoader.file);
            })
            .catch((e) => {
              alert(e.message);
            });

          evt.stop();
        });

        e.editor.on('fileUploadResponse', evt => {
          evt.stop();

          let data = evt.data,
              xhr  = data.fileLoader.xhr;

          if (xhr.readyState === 4) {
            if (xhr.status === 200 && !!xhr.responseURL) {
              data.url = xhr.responseURL.split('?')[0];
            } else {
              data.message = '图片上传失败！请重试...';
              evt.cancel();
            }
          }

        });

      },

    }
  };
</script>
