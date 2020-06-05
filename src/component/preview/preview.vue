<template>
  <transition name="fade">
    <div class="pg-preview-wrapper"
         v-if="visible"
    >
      <div class="pg-preview-header">
        <div class="title overflow-ellipsis">
          <span class="icon"></span>
          <span>{{title}}</span>
        </div>
        <ul class="controls list-unstyled">
          <!--        <li class="download" @click="onDownload"></li>-->
          <li class="close" @click="onClose"></li>
        </ul>
      </div>
      <div
        class="pg-preview-body"
        @mouseenter="hoving=true"
        @mouseleave="hoving=false"
      >

        <img
          v-if="type === 'image'"
          id="img"
          @load="onLoad"
          :class="draging && 'cursor-grabbing'"
          :style="`transform: translate(${translate.x}px, ${translate.y}px) rotate(${rotate}deg) scale(${scale});`"
          :src="src"
          @mousedown="onMousedown"
        />
        <video 
          v-if="type === 'video'" 
          :src="src" 
          controls 
          autoplay 
          @load="onLoad"
        />

        <transition name="fade">
          <div class="scale-info" v-show="scaling">
            {{ parseInt(scale * 100) + '%' }}
          </div>
        </transition>

        <svg
          v-if="type === 'image' && loading"
          version="1.1"
          id="loader-1"
          x="0px"
          y="0px"
          width="40px"
          height="40px"
          viewBox="0 0 50 50"
          style="enable-background:new 0 0 50 50; position: absolute;"
          xml:space="preserve"
        >
          <path
            fill="#000"
            d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"
          >
            <animateTransform
              attributeType="xml"
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        <template v-if="list.length > 1">
          <span
            class="arrow prev"
            @click="onPrev"
            @mouseenter="hoving=false"
            @mouseleave="hoving=true"
          ></span>
          <span
            class="arrow next"
            @click="onNext"
            @mouseenter="hoving=false"
            @mouseleave="hoving=true"
          ></span>
        </template>

        <transition name="fade" v-if="type === 'image'">
          <ul class="toolbar list-unstyled" v-if="hoving">
            <li class="minus" @click="onMinus"></li>
            <li class="rotate" @click="onRotate"></li>
            <li class="plus" @click="onPlus"></li>
          </ul>
        </transition>
      </div>

    </div>
  </transition>

</template>

<script>
	import {debounce} from '../_util/assist';

	export default {
		name: 'pg-preview',

		data() {
			return {
				visible: true,
				hoving: false,

        loading: true,
        type: 'image',
				src: '',
				list: [],

				rotate: 0,

				scale: 1,
				scaling: false,

				translate: {x: 0, y: 0},
				drag: {x: 0, y: 0},
				draging: false,
			};
		},

		computed: {

			index() {
				let index = 0;
				let {src, list} = this.$data;
				for (let i = 0; i < list.length; i++) {
					if (src === list[i]) {
						index = i;
						break;
					}
				}
				return index;
			},

			title() {
				let arr = this.$data.src.toString().split("/");
				return arr[arr.length - 1] || '';
			}
		},
		methods: {
			onLoad() {
				this.loading = false;
			},

			show({src, list = [], type = 'image'} = {}) {
        this.$data.type = type;
				this.$data.src = src;
				this.$data.list = list;
				this.$data.visible = true;
				document.body.style.overflowY = 'hidden';
			},

			onMousedown(e) {
				if (e.button != 0) return; // 如果不是左键单击
				e.preventDefault();
				this.drag.x = e.clientX - this.translate.x; // 已经拖拽的距离
				this.drag.y = e.clientY - this.translate.y;
				this.draging = true;

				let onDrag = (ev) => {
					this.translate.x = ev.clientX - this.drag.x;
					this.translate.y = ev.clientY - this.drag.y;
				};

				let onClose = () => {
					this.draging = false;
					document.removeEventListener('mousemove', onDrag);
					document.removeEventListener('mouseup', onClose);
				};

				document.addEventListener('mousemove', onDrag);
				document.addEventListener('mouseup', onClose);

			},

			onDownload() {

			},

			onClose() {
				this.initTrans();
				this.$data.visible = false;
				document.body.style.overflowY = 'auto';
			},

			onPrev() {
				this.initTrans();
				const index = this.index === 0 ? this.$data.list.length - 1 : this.index - 1;
				this.$data.src = this.$data.list[index];
			},

			onNext() {
				this.initTrans();
				const maxIndex = this.$data.list.length - 1;
				const index = this.index === maxIndex ? 0 : this.index + 1;
				this.$data.src = this.$data.list[index];
			},

			onRotate() {
				if (this.$data.rotate === -270) {
					this.$data.rotate = 0;
					return;
				}
				this.$data.rotate -= 90;
			},

			onScroll(e) {
				if (Math.abs(scroll) > 100) {
					const scale = ((this.$data.scale * 100 + parseInt(scroll / 100)) / 100).toFixed(2);
					if (scale < 0.2) {
						this.$data.scale = 0.2;
					} else if (scale > 2) {
						this.$data.scale = 2;
					} else {
						this.$data.scale = scale;
					}
					this.onScale();
				}
			},

			onMinus() {
				if (this.$data.scale.toFixed(1) == 0.2) return;
				this.$data.scale = (this.$data.scale * 10 - 2) / 10;
				this.onScale();
			},

			onPlus() {
				if (this.$data.scale.toFixed(1) == 2) return;
				this.$data.scale = (this.$data.scale * 10 + 2) / 10;
				this.onScale();
			},

			initTrans() {
				this.loading = true;
				this.$data.rotate = 0;
				this.$data.translate = {x: 0, y: 0};
			},

			onScale() {
				this.$data.scaling = true;
				if (!this.debounceEmit) {
					this.debounceEmit = debounce(() => {
						this.$data.scaling = false;
					}, 1000);
					return;
				}
				this.debounceEmit();
			}
		},
	};
</script>

<style scoped>

</style>
