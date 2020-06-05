import axios from 'axios';
import Toast from '../component/toast';
import { osConfig, destory } from '../pgyos.config';

const CancelToken = axios.CancelToken;

// 请求参数配置
let CATCHE_POSTED_LIST = []; // 缓存 post api 请求 的列表 { url: string, latest_timestamp: number  }
const THROTTLE_INTERVAL = 2000; // 防抖时间间隔，单位毫秒

const configuration = function (config) {
  let handleError = true;
  let throttle = config.method === 'post'; // post 请求时，节流开关默认打开

  if (typeof config.handleError === 'boolean') {
    handleError = config.handleError;
  }

  if (config.method === 'post' && typeof config.throttle === 'boolean') {
    throttle = config.throttle;
  }

  return {handleError, throttle};
};

const _interce = axios.create({
  timeout: 10000,
  withCredentials: true,
  responseType: 'json',
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
});

// 请求拦截器
_interce.interceptors.request.use(config => {
  osConfig().debug && console.log('【request config】: ', config);
  

  const {throttle, handleError} = configuration(config);

  if (throttle) {
    let posted = CATCHE_POSTED_LIST.find(item => item.url === config.url);

    if (posted) {

      if (posted.latest_timestamp + THROTTLE_INTERVAL > new Date().getTime()) {
        if (handleError) {
          Toast({ type: 'warning', message: '点击频率过于频繁！需要注意哦 ~ ' })
        }
        return Promise.reject({
          response: {
            data: {code: 500, message: '点击频率过于频繁！需要注意哦 ~ '}
          }
        });
      }

      posted.latest_timestamp = new Date().getTime();
    } else {
      posted = {url: config.url, latest_timestamp: new Date().getTime()};
      CATCHE_POSTED_LIST.push(posted);
    }
  }

  if (osConfig().jwt_token) {
    config.headers.common['Authorization'] = 'Bearer ' + osConfig().jwt_token;
  }
  if (osConfig().debug) {
    console.log('【请求url】:', config.url, '\n');
    config.method === 'post' && console.log('【上送数据】:', config.data, '\n');
  }
  return config;
});

// 响应拦截器
_interce.interceptors.response.use(
  response => {
    osConfig().debug && console.log('【返回数据】: ', response.data, '\n');

    if (response.config.responseType === 'blob') {
      return response.data;
    }
    
    const {handleError} = configuration(response.config);
    // 不需要 自动处理错误
    if (!handleError) {
      return response.data;
    }

    if (response.data.code === 0) {
      return response.data;
    }

    // 需要 自动处理错误
    let message = response.data.message;
    // 200 表示登录态已失效
    if (response.data.code === 200) {
      if (window.location.pathname + window.location.hash === '/#/login') {
        destory();
        return Promise.reject({message: message});
      }

      if (osConfig().is_main) {
        window.location.href = window.location.origin + '/#/login';
      } else {
        window.location.href = osConfig().origin_yy + '/#/login'
        + "?client=tob&origin=" + encodeURIComponent(window.location.origin) 
        + "&href=" + encodeURIComponent(window.location.href);
      }

      destory();
      return Promise.reject({message: message});
    }

    Toast({type: 'danger', message: message});
    return Promise.reject({message: message});

  },
  error => {
    osConfig().debug && console.log('【错误信息】: ', error, '\n');
    let message = (error.response && error.response.data && error.response.data.message) || '服务器异常! 请稍后再试...';
    // 服务器异常
    Toast({type: 'danger', message: message});
    return Promise.reject({message: message});
  }
);

export default {
  get(url, data = {}, config = {}) {
    return _interce.get(url, {
      ...config,
      responseType: "json",
      params: data,
      CancelToken: new CancelToken(function executor(c) {
        config.canceler && (config.canceler = c);
      })
    });
  },
  post(url, data = {}, config = {}) {
    return _interce.post(url, data, {
      ...config,
      responseType: "json",
      CancelToken: new CancelToken(function executor(c) {
        config.canceler && (config.canceler = c);
      })
    });
  },
  download(url, data = {}, config = {}) {

    return new Promise((resolve, reject) => {
      _interce.get(url, {
        handleError: true,
        throttle: true,
        ...config,
        responseType: "blob",
        params: data,
        CancelToken: new CancelToken(function executor(c) {
          config.canceler && (config.canceler = c);
        })
      }).then(res => {
          const link = document.createElement("a");
          const body = document.querySelector("body");
  
          link.href = window.URL.createObjectURL(res);
          link.download = config.filename || '下载.xls';
  
          // fix Firefox
          link.style.display = "none";
          body.appendChild(link);
  
          link.click();
          body.removeChild(link);
  
          window.URL.revokeObjectURL(link.href);
          resolve({ code: 0 });

      });

    })

  }
}
