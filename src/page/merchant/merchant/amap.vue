<template>
  <div class="amap-wrapper">

    <div class="card query-container d-flex align-items-center p-10" :style="`right: ${isShowNoDis ? '280px' : '20px'}`">
      <pg-select style="width: 120px" clearable v-model="query.province_code" @change="changeProvince" placeholder="按区域筛选">
        <pg-option v-for="item in provinceList" :key="item.code" :value="item.code">{{ item.title }}</pg-option>
      </pg-select>
      <pg-select style="width: 120px" clearable v-model="query.zone_id" @change="changeZone" placeholder="按片区筛选" class="ml-10" :disabled="!query.province_code">
        <pg-option v-for="item in zoneList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
      </pg-select>
      <pg-select style="width: 120px" clearable v-model="query.city_id" @change="changeCity" placeholder="按县域筛选" class="ml-10" :disabled="!query.zone_id">
        <pg-option v-for="item in cityList" :key="item.id" :value="item.id">{{ item.title }}</pg-option>
      </pg-select>
      <pg-search style="width: 160px" clearable v-model="query.condition" @change="changeQuery" placeholder="门店名称" class="ml-10"></pg-search>
      <div class="ml-auto">
        <span>共计</span>
        <span class="text-danger px-5 font-weight-bolder">{{noDistanceStore.num}}</span>
        <span>家无路程门店</span>
      </div>
      <div class="ml-10">
        <pg-button circle color="primary" @click="isShowNoDis = true" v-if="!isShowNoDis">
          <i class="icon-enter6 text-white"></i>
        </pg-button>
        <pg-button circle @click="isShowNoDis = false" v-else>
          <i class="icon-esc"></i>
        </pg-button>
      </div>
    </div>

    <div class="card store-container" :style="`width: ${isShowNoDis ? '260px' : '0'}`">
      <template v-if="isShowNoDis">
        <div class="p-10 bg-white" style="height: 50px;">
          <pg-search immediate debounce clearable flat placeholder="请输入门店名称搜索..." v-model="noDitQuery.condition" @change="storeNoDistance"></pg-search>
        </div>

        <pg-table
          style="margin-top: -52px"
          :data="noDistanceStore.items"
          primary-key="id"
          borderless
          :serialable="false"
          :height="`${app.windowHeight - 200}px`"
        >
          <pg-column title="门店名称" style="padding: 8px 15px 5px;">
            <template v-slot="{row}">
              <div class="overflow-ellipsis line-height-1 mt-1">{{ row.title }}</div>
              <div class="d-flex">
                <span class="text-secondary">{{ row.geo && row.geo.city_title }}</span>
                <a class="text-decoration-none ml-auto" @click="calcJourney(row)">计算路程</a>
              </div>
            </template>
          </pg-column>
        </pg-table>
        <div class="card-footer" style="width: 260px">
          <pg-pagination layout="prev, pager, next" :num="noDistanceStore.num" v-model="noDitQuery" @change="storeNoDistance"></pg-pagination>
        </div>
      </template>
    </div>
    <div id="amap"></div>
  </div>
</template>

<script>
import { Http, Api } from '@/util';

export default {
  name: "store-map",
  components: {},
  inject: ['app'],
  data() {
    return {
      map: {},
      mapComplete: false,
      noDitQuery: {
        page_size: 20,
        page: 1
      },
      noDistanceStore: {
        items: [],
        num: 0
      },
      isShowNoDis: false,
      isShowStoreList: false,
      isShowStoreContent: true,
      query: {},
      provinceData: [],
      zoneData: [],
      cityData: [],
      cityStoreData: [],

      provinceList: [],
      zoneList: [],
      cityList: [],

    }
  },
  mounted() {
    this.initQuery();
    this.initMap();

    this.commonProvinceList();

    this.storeNoDistance();
  },
  beforeDestroy() {
    this.destroyMap();
  },
  methods: {
    initMap() {
      let config = {
        zoom: 8,
        isHotspot: false,
        scrollWheel: true, //滚轮缩放
        doubleClickZoom: true, //双击缩放（开启状下会影响覆盖物的点击事件，覆盖物click换成mouseup）
        mapStyle: 'amap://styles/light'
      };

      AMapLoader.load({
        "key": "fc4a17b0d84178585e6aae0c3fe18270", // 申请好的Web端开发者Key，首次调用 load 时必填
        "version": "1.4.15",  // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        "plugins": ['AMap.ToolBar', 'AMap.Scale'], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      }).then(AMap => {
        this.map = new AMap.Map('amap', config);

        this.map.addControl(new AMap.ToolBar({position: 'LB'}));
        this.map.addControl(new AMap.Scale());

        //地图加载完成
        this.map.on('complete', () => {
          this.$data.mapComplete = true;
        });

        //地图被点击(不用click, 与双击缩放冲突)
        this.map.on('mouseup', () => {
          this.closeInfo();
        });

        //地图滚动滚轮
        this.map.on('mousewheel', () => {
          //this.isMoveZoomMap = true;
        });

        //地图缩放等级改变(完成)
        this.map.on('zoomend', () => {
          if(!this.isMoveZoomMap) return;

          let z = this.getMapZoom();
          if(z < 6 && this.mapZoomType !== 'province'){
            this.mapZoomType = 'province';
            this.getProvinceData();
          }else if(z >= 6 && z < 9 && this.mapZoomType !== 'zone'){
            this.mapZoomType = 'zone';
            this.getZoneData();
          }else if(z >= 9 && this.mapZoomType !== 'city'){
            this.mapZoomType = 'city';
            this.getCityData()
          }
        });


      });

    },

    //获取地图等级
    getMapZoom(){
      return this.map.getZoom();
    },

    //设置地图中心点
    setMapCenter(center){
      this.map.setCenter(center);
    },

    //同时传入缩放级别和中心点经纬度
    setZoomAndCenter(zoom, center){
      this.map.setZoomAndCenter(zoom, center);
    },

    //设置地图视野
    /*
    * overlayList为覆盖物数组，缺省时为当前地图上添加的所有覆盖物图层，
    * immediately代表是否需要动画过程，
    * avoid代表上下左右的像素避让宽度，
    * maxZoom代表fitView之后的最大级别
    */
    setFitView(overlayList, immediately, avoid, maxZoom){
      if(overlayList && overlayList.length > 1){
        this.map.setFitView(overlayList, immediately, avoid, maxZoom);
      }else{
        this.map.setFitView(null, immediately, avoid, maxZoom);
      }
    },
    //销毁地图
    destroyMap() {
      this.centerPoint && this.map.remove(this.centerPoint);
      this.map && this.map.destroy();
    },

    //刷新
    initQuery() {
      this.$data.query = {
        province_code: '', //791
        zone_id: '', //15
        city_id: '', //183
        condition: ''
      };
    },
    //选择区域
    changeProvince() {
      let { query } = this;
      query.zone_id = '';
      query.city_id = '';
      query.condition = '';
      this.$data.query = query;
      this.commonZoneList();
      this.changeQuery();
    },
    //选择片区
    changeZone(){
      let { query } = this;
      query.city_id = '';
      query.condition = '';
      this.$data.query = query;
      this.commonCityList()
      this.changeQuery();
    },
    //选择县域
    changeCity(){
      this.$data.query.condition = '';
      this.changeQuery();
    },
    resetQuery() {
      this.initQuery();
      this.changeQuery();
    },
    changeQuery() {
      this.isMoveZoomMap = false;
      let { query } = this;
      this.$data.isShowStoreList = false;
      this.$data.isShowStoreContent = true;
      this.closeInfo();
      //查询县域具体门店
      if(query.city_id || query.condition){
        this.getStoreData();
      }
      //查询县域加总
      else if(query.zone_id){
        this.getCityData();
        this.$data.noDitQuery.page = 1;
        this.storeNoDistance();
      }
      //查询片区加总
      else if(query.province_code){
        this.getZoneData();
        this.$data.noDitQuery.page = 1;
        this.storeNoDistance();
      }
      //查询区域加总
      else{
        this.getProvinceData();
        this.$data.noDitQuery.page = 1;
        this.storeNoDistance();
      }
    },
    removeAll(){
      if(this.merchantProvince && this.merchantProvince.length > 0){
        this.map.remove(this.merchantProvince);
        this.merchantProvince = [];
      }
      if(this.merchantZone && this.merchantZone.length > 0){
        this.map.remove(this.merchantZone);
        this.merchantZone = [];
      }
      if(this.merchantCity && this.merchantCity.length > 0){
        this.map.remove(this.merchantCity);
        this.merchantCity = [];
      }
      if(this.merchantStore && this.merchantStore.length > 0){
        this.map.remove(this.merchantStore);
        this.merchantStore = [];
      }
      if(this.merchantStoreLayer){
        this.map.remove(this.merchantStoreLayer);
        this.merchantStoreLayer = {};
      }
    },
    //获取区域加总
    async getProvinceData(){
      this.$loading.show();
      let res = await Http.get(Api.storeByProvince, {});
      this.$loading.hide();
      if (res.code === 0) {
        this.$data.provinceData = res.data;
        this.provinceMarker();
      } else {
        this.$toast({ message: res.message, type: 'error' });
      }
    },
    //添加区域总和
    provinceMarker() {
      let { provinceData } = this;
      this.removeAll();
      this.merchantProvince = [];
      provinceData.forEach(v => {
        if(v.center_geo && v.center_geo.lat && v.center_geo.lng){
          // 点标记显示内容，HTML要素字符串
          const markerContent = `
              <div class="merchant-province-marker">
                <div class="title">${v.title}</div>
                <div class="num">${v.store_num}家</div>
              </div>
            `;
          let marker = new AMap.Marker({
            position: new AMap.LngLat(v.center_geo.lng, v.center_geo.lat),
            content: markerContent,
            offset: new AMap.Pixel(-32, -32)
          });
          marker.on('mouseup', () => {
            this.$data.query.province_code = v.code;
            this.changeQuery();
          });
          this.map.add(marker);
          this.merchantProvince.push(marker);
        }
      });

      //如果是缩放地图，不设置最佳可视化
      if(this.isMoveZoomMap) return;

      //设置最佳可视化
      if(this.merchantProvince.length === 1){
        let d = this.merchantProvince[0];
        d = d.getPosition();
        this.setZoomAndCenter(5, [d.lng, d.lat]);
      }else if(this.merchantProvince.length > 1){
        this.setFitView(this.merchantProvince, false, [150, 100, 100, 100], 5);
      }else{
        //中国地图可视区
        this.setFitView([
          new AMap.Marker({position: new AMap.LngLat(74.139565,39.074745)}),
          new AMap.Marker({position: new AMap.LngLat(123.094643,53.314546)}),
          new AMap.Marker({position: new AMap.LngLat(134.696205,48.030433)}),
          new AMap.Marker({position: new AMap.LngLat(109.647377,17.952731)})
        ]);
      }
    },

    //获取片区加总
    async getZoneData(){
      this.$loading.show();
      let res = await Http.get(Api.storeByZone, {
        province_code: this.query.province_code
      });
      this.$loading.hide();
      if (res.code === 0) {
        this.$data.zoneData = res.data;
        this.zoneMarker();
      } else {
        this.$toast({ message: res.message, type: 'error' });
      }
    },
    zoneMarker() {
      let { provinceData, zoneData, query } = this;
      this.removeAll();
      this.merchantZone = [];
      zoneData.forEach(v => {
        if(v.center_geo && v.center_geo.lat && v.center_geo.lng){
          // 点标记显示内容，HTML要素字符串
          const markerContent = `
              <div class="merchant-province-marker">
                <div class="title">${v.title}</div>
                <div class="num">${v.store_num}家</div>
              </div>
            `;
          let marker = new AMap.Marker({
            position: new AMap.LngLat(v.center_geo.lng, v.center_geo.lat),
            content: markerContent,
            offset: new AMap.Pixel(-32, -32)
          });
          marker.on('mouseup', () => {
            this.$data.query = { ...this.query, province_code: v.province_code, zone_id: v.id };
            this.changeQuery();
          });
          this.map.add(marker);
          this.merchantZone.push(marker);
        }
      });

      //如果是缩放地图，不设置最佳可视化
      if(this.isMoveZoomMap) return;

      //设置最佳可视化
      if(this.merchantZone.length === 1){
        let d = this.merchantZone[0];
        d = d.getPosition();
        this.setZoomAndCenter(8, [d.lng, d.lat]);
      }else if(this.merchantZone.length > 1){
        this.setFitView(this.merchantZone, false, [150, 100, 100, 100], 8);
      }else{
        let con = provinceData.filter(item => item.code === query.province_code);
        if(con.length > 0 && con[0].center_geo && con[0].center_geo.lng && con[0].center_geo.lat){
          this.setZoomAndCenter(8, [con[0].center_geo.lng, con[0].center_geo.lat]);
        }
      }
    },

    //获取县域加总
    async getCityData(){
      this.$loading.show();
      let res = await Http.get(Api.storeByCity, {
        province_code: this.query.province_code,
        zone_id: this.query.zone_id
      });
      this.$loading.hide();
      if (res.code === 0) {
        this.$data.cityData = res.data;
        this.cityMarker();
      } else {
        this.$toast({ message: res.message, type: 'error' });
      }
    },
    cityMarker() {
      let { zoneData, cityData, query } = this;
      this.removeAll();
      this.merchantCity = [];
      cityData.forEach(v => {
        if(v.center_geo && v.center_geo.lat && v.center_geo.lng){
          // 点标记显示内容，HTML要素字符串
          const markerContent = `
              <div class="merchant-province-marker">
                <div class="title">${v.title}</div>
                <div class="num">${v.store_num}家</div>
              </div>
            `;
          let marker = new AMap.Marker({
            position: new AMap.LngLat(v.center_geo.lng, v.center_geo.lat),
            content: markerContent,
            offset: new AMap.Pixel(-32, -32)
          });
          marker.on('mouseup', () => {
            this.$data.query = { ...this.query, province_code: v.province_code, zone_id: v.zone_id, city_id: v.id };
            this.changeQuery();
          });
          this.map.add(marker);
          this.merchantCity.push(marker);
        }
      });

      //如果是缩放地图，不设置最佳可视化
      if(this.isMoveZoomMap) return;

      //设置最佳可视化
      if(this.merchantCity.length === 1){
        let d = this.merchantCity[0];
        d = d.getPosition();
        this.setZoomAndCenter(10, [d.lng, d.lat]);
      }else if(this.merchantCity.length > 1){
        this.setFitView(this.merchantCity, false, [150, 100, 100, 100], 10);
      }else{
        let con = zoneData.filter(item => item.id === query.zone_id);
        if(con.length > 0 && con[0].center_geo && con[0].center_geo.lng && con[0].center_geo.lat){
          this.setZoomAndCenter(10, [con[0].center_geo.lng, con[0].center_geo.lat]);
        }
      }
    },

    //获取门店列表
    async getStoreData() {
      this.$loading.show();
      let res = await Http.get(Api.storeLocationDetail, this.query);
      this.$loading.hide();
      if (res.code === 0) {
        this.$data.cityStoreData = res.data;
        this.storeMarker();
        this.$data.isShowStoreList = true;
      } else {
        this.$toast({ message: res.message, type: 'danger' });
      }
    },
    storeMarker() {
      let { cityStoreData } = this;
      this.removeAll();
      this.merchantStore = [];
      cityStoreData.forEach(v => {
        if(v.geo && v.geo.lat && v.geo.lng){
          var icon = {
            type: 'image',
            image: require('./point_to.png'),
            size: [6, 6],
            anchor: 'bottom-center'
          };
          let marker = new AMap.LabelMarker({
            position: new AMap.LngLat(v.geo.lng, v.geo.lat),
            icon,
            text: {
              content: v.title,
              offset: [-10, -14],
              style: {
                fillColor: '#fff',
                strokeColor: '#006eff',
                backgroundColor: '#006eff'
              }
            }
          });
          marker.on('mouseup', () => {
            let lnglat = marker.getPosition();
            this.openInfo(lnglat, v);
          });
          marker.store_id = v.id; //记录判断用
          this.merchantStore.push(marker);
        }
      });

      this.merchantStoreLayer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: false,
        allowCollision: false,
      });
      this.merchantStoreLayer.add(this.merchantStore);
      this.map.add(this.merchantStoreLayer);

      //如果是缩放地图，不设置最佳可视化
      if(this.isMoveZoomMap) return;

      //设置最佳可视化
      if(this.merchantStore.length === 1){
        let d = this.merchantStore[0];
        d = d.getPosition();
        this.setZoomAndCenter(15, [d.lng, d.lat]);
      }else if(this.merchantStore.length > 1){
        this.setFitView(this.merchantStore, false, [150, 100, 300, 100]);
      }
    },

    mouseClickStore(item){
      if(item.geo.lng && item.geo.lat){
        let lnglat = new AMap.LngLat(item.geo.lng, item.geo.lat);
        this.openInfo(lnglat, item);
        this.setMapCenter([item.geo.lng, item.geo.lat]);
      }
    },

    //在指定位置打开信息窗体
    openInfo(lnglat, data){
      let images = '';
      if(data.images.length > 0){
        images = `<div class="images">`;
        data.images.forEach((item, index) => {
          images += `<img src="${this.app.cos_tenctent_path + data.images[index]}_200x200"/>`;
        });
        images += '</div>';
      }
      let content = `
          <div class="merchant-store-marker-detail">
            ${images}
            <div class="title">${data.title}</div>
            <div class="city">县域：${data.geo.city_title}</div>
            <div class="phone">联系人：${data.linkman}（${data.phone}）</div>
            <div class="address">地址：${data.address}</div>
          </div>
        `;
      this.infoWindow = new AMap.InfoWindow({
        content,
        offset: new AMap.Pixel(0, -22)
      });
      this.infoWindow.open(this.map, lnglat);
    },
    //关闭窗口
    closeInfo(){
      if(this.infoWindow){
        this.infoWindow.close();
      }
    },
    changeNoDitPage(page){
      this.$data.noDitQuery.page = page;
      this.storeNoDistance();
    },
    //没有路程的门店
    async storeNoDistance(){
      if(this.noDistanceStore.num === 1){
        this.$data.noDitQuery.condition = '';
      }
      let res = await Http.get(Api.storeNoDistance, {
        ...this.noDitQuery,
        province_code: this.query.province_code,
        zone_id: this.query.zone_id,
        city_id: this.query.city_id
      });
      if (res.code === 0) {
        this.$data.noDistanceStore = res.data;
      } else {
        this.$toast({ message: res.message, type: 'error' });
      }
    },
    async calcJourney(item){
      this.$loading.show();
      let res = await Http.get(Api.storeDistance, {
        store_id: item.id
      });
      this.$loading.hide();
      if (res.code === 0) {
        this.storeNoDistance();
        this.$toast({ message: '计算路程成功', type: 'success' });
      } else {
        this.$toast({ message: res.message, type: 'error' });
      }
    },

    //区域列表
    commonProvinceList() {
      Http.get(Api.commonProvinceListAuth).then(res => {
        this.$data.provinceList = res.data || [];
      });
    },
    //片区列表
    commonZoneList() {
      Http.get(Api.commonZoneList, {
        province_code: this.$data.query.province_code
      }).then(res => {
        this.$data.zoneList = res.data || [];
      });
    },
    //县域列表
    commonCityList() {
      Http.get(Api.commonCityList, {
        province_code: this.$data.query.province_code,
        zone_id: this.$data.query.zone_id
      }).then(res => {
        this.$data.cityList = res.data || [];
      });
    },
  }
}

</script>

<style lang="scss">
.amap-wrapper {
  width: 100%;
  height: calc(100vh - 50px);
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
}

.amap-wrapper .query-container {
  position: absolute;
  left: 20px;
  top: 20px;
  right: 20px;
  z-index: 100;

  transition: right .2s ease-in-out;
}

.amap-wrapper .store-container {
  position: absolute;
  right: 0;
  top: 20px;
  bottom: 20px;
  width: 0px;

  z-index: 100;

  transition: width .2s ease-in-out;
}

.amap-wrapper #amap {
  width: 100%;
  height: 100%;
}

/* 商户及共用 */
.amap-wrapper .merchant-province-marker{
  border-radius: 50%;
  background: rgba($color: #006eff, $alpha: 1);
  width: 64px;
  height: 64px;
  color: #fff;
  font-size: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
  &:hover{
    background: rgba($color: #006eff, $alpha: .9);
    z-index: 2;
  }
  >.title{
    font-size: 12px;
    font-weight: bold;
    padding: 10px 5px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }
}

.amap-wrapper .merchant-store-marker{
  border-radius: 3px;
  color: #fff;
  font-size: 12px;
  text-align: left;
  position: relative;
  z-index: 1;
  &.active{
    >.title{
      background: #ff5252;
    }
    >.point{
      border-color: #ff5252 transparent transparent transparent;
    }
  }
  >.title{
    padding: 0 3px;
    white-space: nowrap;
    background: rgba($color: #006eff, $alpha: 1);
    border-radius: 3px;
    height: 20px;
    line-height: 20px;
    overflow: hidden;
  }
  >.point{
    border: 3px solid;
    border-color: rgba($color: #006eff, $alpha: 1) transparent transparent transparent;
    height: 0;
    width: 0;
    margin-left: 10px;
  }
  &:hover{
    >.title{
      background: rgba($color: #006eff, $alpha: .9);
    }
    >.detail{
      background: rgba($color: #006eff, $alpha: .9);
    }
    >.point{
      border-color: rgba($color: #006eff, $alpha: .9) transparent transparent transparent;
    }
  }
}
.amap-wrapper .merchant-store-marker-detail{
  >.images{
    height: 48px;
    overflow: hidden;
    margin-bottom: 5px;
    >img{
      float: left;
      width: 48px;
      height: 48px;
      margin-right: 10px;
    }
  }
  >.title{
    font-weight: bold;
    margin-bottom: 5px;
  }
  >.city, >.phone, >.address{
    font-size: 12px;
  }
}
</style>
