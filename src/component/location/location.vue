<template>
  <div class="pg-location-wrapper">
    <pg-input
        class="pg-location w-100"
        :size="size"
        :valid="false"
        :disabled="isDisabled"
        readonly
        :placeholder="placeholder"
        :value="level === 'province' ? location.city_title + location.poi : location.poi"
        @click.native="toggleVisible"
    >
      <template slot="suffix">
        <span @click="toggleVisible">
          <i class="icon-pin-alt font-size-sm font-weight-bolder pr-10 pl-5"></i>
        </span>
      </template>
    </pg-input>
    <!-- v-show -->
    <transition name="fade">
      <div
          class="pg-location-container"
          v-show="visible"
          v-transfer-dom
          :data-transfer="true"
      >
        <nav class="navbar">
          <div class="action">
            <span @click="onClose">关闭</span>
            <span @click="onSubmit">选择好了</span>
          </div>
          <pg-search
              :valid="false"
              immediate
              debounce
              v-model="searchwords"
              placeholder="请输入搜索词..."
              style="min-width: 500px; width: 500px;"
              @change="changeSearchwords"
          ></pg-search>
        </nav>
        <div class="content">
          <ul class="poi-list">
            <li
                v-for="(item, index) in poiList"
                :key="index"
                :class="item.id === selectedItem.id ? 'active' : ''"
                @click="selectedItem=item"
            >
              <span class="font-size-13 font-weight-bold">{{item.name}}</span>
              <span
                  class="font-size-12"
              >{{ item.pname }}{{ item.cityname }}{{ item.adname }}{{ item.address }}</span>
            </li>
          </ul>
          <div class="amap-container">
            <div :id="id"></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>

  const MAP_STYLE = "amap://styles/light";
  // const MAP_STYLE = "amap://styles/32ba6c5351b91e3bc43e6814a198a918";

  const ICON_CENTER_POINT = require("./center.png");

  const debounce = function(func, wait) {
    let timeout;

    return function() {
      let context = this;
      let args = arguments;

      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  };

  import pgInput from '../input/input';
  import pgSearch from '../search/search';

  import {findUpComponent} from './../_util/assist';
  import TransferDom from '../_util/transfer-dom';

  export default {
    name: "pg-location",
    components: {pgInput, pgSearch},
    directives: {TransferDom},
    props: {
      location: {
        type: Object,
        default: () => ({
          lng: "",
          lat: "",
          province_title: "",
          city_title: "",
          poi: "",
        })
      },
      size: {
        type: String,
        default: 'base',
        validator: v => ['lg', 'sm', 'base'].includes(v),
      },
      id: { type: String, default: 'amap' },
      level: { type: String, default: "city" }, // province | city | all
      disabled: { type: Boolean, default: false },
      placeholder: { type: String, default: "请选择地理位置" }
    },
    model: {
      prop: "location",
      event: "change"
    },
    computed: {
      isDisabled() {
        // 如果外部设置了disabled 属性，则直接禁用
        if (this.$props.disabled || !!this.pgFormItem?.disabled) return true;

        const { lng, lat, province_title, city_title } = this.$props.location;
        if (lng && lat) return false;
        if (this.$props.level === "city" && province_title && city_title) return false;
        if (this.$props.level === "province" && province_title) return false;
        if (this.$props.level === "all") return false;

        return true;
      }
    },
    data() {

      let ev = this.$props.location;
      // ev + '' 转换为字符串 去除空格后 ，如果不为空，则表示该数据存在
      if (ev && ev.lng && ev.lat) {
        this.pgFormItem?.sync?.(ev);
      }

      return {
        visible: false,
        mapComplete: false,
        searchwords: "",

        selectedItem: {},

        poiList: []
      };
    },
    watch: {
      location: {
        deep: true,
        immediate: false,
        handler: function(next, prev) {
          this.$data.mapComplete && this.initLogic();
          this.$nextTick(() => {
            this.pgFormItem?.sync?.(next);
          });
        }
      },
      // 切换选中项时，设置地图中心点位置
      selectedItem: {
        deep: true,
        immediate: false,
        handler: function(next, pre) {
          if (next && next.location && next.location.lng && next.location.lat) {
            if (this.map) {
              this.map.setCenter([next.location.lng, next.location.lat]);
              this.$data.mapComplete && this.initCenterPoint(next.location.lng, next.location.lat);
            }
          }
        }
      }
    },
    beforeCreate() {
      this.pgFormItem = findUpComponent(this, 'pg-form-item');
    },
    created() {
    },
    mounted() {
      this.initMap();
    },
    beforeDestroy() {
      this.destroyMap();
    },
    methods: {
      toggleVisible() {
        if (this.isDisabled) return;
        this.$data.visible = !this.$data.visible;
      },
      initMap() {

        if (!AMapLoader) return;

        let config = {
          zoom: 16,
          isHotspot: false,
          scrollWheel: true,
          mapStyle: MAP_STYLE
        };
        const { location, id } = this.$props;
        if (location && location.lag && location.lat) {
          config.center = [location.lng, location.lat];
        }

        AMapLoader.load({
          "key": "fc4a17b0d84178585e6aae0c3fe18270",              // 申请好的Web端开发者Key，首次调用 load 时必填
          "version": "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
          "plugins": ['AMap.Geocoder', 'AMap.PlaceSearch', 'AMap.ToolBar', 'AMap.Scale', 'AMap.PolygonEditor', 'AMap.MouseTool'],          // 需要使用的的插件列表，如比例尺'AMap.Scale'等

        }).then(AMap => {

          this.map = new AMap.Map(id, config);

          this.map.addControl(new AMap.ToolBar({ position: "RB" }));
          this.map.addControl(new AMap.Scale());

          this.geoCoder = new AMap.Geocoder({
            city: "全国",
            radius: 2000,
            batch: false,
            extensions: "all"
          });
          this.placeSearch = new AMap.PlaceSearch({
            // city 指定搜索所在城市，支持传入格式有：城市名、citycode和adcode
            city: "全国",
            citylimit: true,
            extensions: "all",
            pageSize: 30
          });

          this.map.on("complete", () => {
            this.$data.mapComplete = true;
            this.initLogic();
          });
        });

      },
      destroyMap() {
        if (this.centerPoint) {
          (this.centerPoint.getExtData().listeners || []).forEach(listener => {
            // AMap.event.removeListener(listener);
            listener.off("dragend");
          });
          this.centerPoint.setExtData({ listeners: [] });
        }
        this.centerPoint && this.map.remove(this.centerPoint);
        this.map && this.map.destroy();
      },

      // 初始化地图后执行的选点逻辑。
      initLogic() {

        if (!this.map) return;

        const { province_title, city_title, lng, lat } = this.$props.location;
        // 如果中心点存在，则可以： 初始化地图、初始化中心点、根据中心点geo逆地理编码，再根据编码后的第一个地理位置获取poilist
        if (lng && lat) {
          this.map.setCenter([lng, lat]);
          this.initCenterPoint(lng, lat);
          this.geoCoder.getAddress(
            new AMap.LngLat(lng, lat),
            (status, result) => {
              if (status === "complete" && result.info === "OK") {
                const { aois, formattedAddress } = result.regeocode;
                let keywords = Array.isArray(aois) && aois.length > 0 ? aois[0].name: formattedAddress;

                if (keywords.indexOf(city_title) < 0) {
                  keywords = city_title + keywords;
                }
                if (keywords.indexOf(province_title) < 0) {
                  keywords = province_title + keywords;
                }

                this.placeSearch.search(keywords, (status, result) => {
                  if (status === "complete" && result.info === "OK") {
                    this.$data.poiList = result.poiList.pois || [];
                  }
                });
              }
            }
          );
          return;
        }

        // 如果存在省份、城市，则初始化地图、根据 省份 + 城市名称 获取 poilist
        if (this.$props.level === "city" && province_title && city_title) {
          // + city_title
          this.placeSearch.search(province_title, (status, result) => {
            if (status === "complete" && result.info === "OK") {
              this.$data.poiList = result.poiList.pois || [];
              let poi = this.$data.poiList[0];
              this.map.setCenter([poi.location.lng, poi.location.lat]);
              this.initCenterPoint(poi.location.lng, poi.location.lat);
            }
          });
          return;
        }

        if (this.$props.level === "province" && province_title) {
          //+ (city_title || '')
          this.placeSearch.search(province_title, (status, result) => {
            if (status === "complete" && result.info === "OK") {
              this.$data.poiList = result.poiList.pois || [];
              let poi = this.$data.poiList[0];
              this.map.setCenter([poi.location.lng, poi.location.lat]);
              this.initCenterPoint(poi.location.lng, poi.location.lat);
            }
          });
          return;
        }
        if (this.$props.level === "all") {
          //+ (city_title || '')
          this.placeSearch.search(province_title || '深圳市', (status, result) => {
            if (status === "complete" && result.info === "OK") {
              this.$data.poiList = result.poiList.pois || [];
              let poi = this.$data.poiList[0];
              this.map.setCenter([poi.location.lng, poi.location.lat]);
              this.initCenterPoint(poi.location.lng, poi.location.lat);
            }
          });
        }
      },

      // 初始化中心点
      initCenterPoint(lng, lat) {
        if (this.centerPoint) {
          this.centerPoint.setPosition([lng, lat]);
          return;
        }

        let marker = new AMap.Marker({
          position: new AMap.LngLat(lng, lat),
          icon: ICON_CENTER_POINT,
          offset: new AMap.Pixel(-26, -52),
          draggable: true
        });

        let listeners = [];

        // listeners.push(
        //   AMap.event.addListener(marker, 'dragend', (e) => {
        //     this.map.setCenter(e.lnglat);
        //     this.onCenterRegeo(e.lnglat);
        //   })
        // );
        listeners.push(
          marker.on("dragend", e => {
            this.map.setCenter(e.lnglat);
            this.onCenterRegeo(e.lnglat);
          })
        );
        marker.setExtData({ listeners: listeners });
        this.centerPoint = marker;
        this.map.add(marker);
      },

      // 根据中心点位置，逆地理位置编码
      onCenterRegeo({ lng, lat }) {
        if (!this.map) return;
        this.geoCoder.getAddress(new AMap.LngLat(lng, lat), (status, result) => {
          if (status === "complete" && result.info === "OK") {
            const { aois, formattedAddress } = result.regeocode;
            let keywords = Array.isArray(aois) && aois.length > 0 ? aois[0].name : formattedAddress;
            const { province_title, city_title } = this.$props.location;
            if (this.$props.level === "city" && keywords.indexOf(city_title) < 0) {
              keywords = city_title + keywords;
            }
            if (this.$props.level === "province" && keywords.indexOf(province_title) < 0) {
              keywords = province_title + keywords;
            }
            this.placeSearch.search(keywords, (status, result) => {
              if (status === "complete" && result.info === "OK") {
                this.$data.poiList = result.poiList.pois || [];
              }
            });
          }
        });
      },

      changeSearchwords(v) {
        if (!v) {
          return;
        }
        if (this.debounceInput) {
          this.debounceInput(v);
          return;
        }

        // 注册防抖函数
        this.debounceInput = debounce(() => {
          this.onSearch();
        }, 300);
      },

      onSearch() {
        if (!this.placeSearch) return;
        let keywords = this.$data.searchwords || "";
        const { province_title, city_title } = this.$props.location;
        if (this.$props.level === "city" && keywords.indexOf(city_title) < 0) {
          keywords = city_title + keywords;
        }
        if (this.$props.level === "province" && keywords.indexOf(province_title) < 0) {
          keywords = province_title + keywords;
        }
        this.placeSearch.search(keywords, (status, result) => {
          if (status === "complete" && result.info === "OK") {
            this.$data.poiList = result.poiList.pois || [];
          }
        });
      },

      onClose() {
        this.$data.visible = false;
      },

      onSubmit() {
        let item = this.$data.selectedItem;

        if (item.location && item.location.lng && item.location.lat) {
          let location = {
            ...this.$props.location,
            lng: item.location.lng,
            lat: item.location.lat,
            poi: item.name
          };

          // 如果是省级选择，则添加城市
          if (this.$props.level === "province") {
            location.city_title = item.cityname;
          }
          //如果设置中心点
          if (this.$props.level === "all") {

            location.province_title = item.pname;
            location.city_title = item.cityname;
          }
          this.$emit("change", location);
        }

        this.$data.visible = false;
      }
    }
  };
</script>