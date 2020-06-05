import axios from 'axios';
import Constant from './constant';
import Storage from './storage';
import {Toast} from '@/component';

const CancelToken = axios.CancelToken;
const isProd = process.env.NODE_ENV === 'production';

let JWT_TOKEN = '';

const getToken = () => {
  if (!JWT_TOKEN) {
    let userInfo = Storage.get(Constant.LOCAL_USER_INFO);
    JWT_TOKEN = (userInfo && userInfo.jwt_token) || '';
  }
  return JWT_TOKEN;
};

// 在用户登出时，清除token
export const clearCacheToken = () => {
  Storage.remove(Constant.LOCAL_USER_INFO);
  JWT_TOKEN = '';
};

const _interce = axios.create({
  timeout: 10000,
  responseType: "json",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
});

// 请求参数配置
let CATCHE_POSTED_LIST = []; // 缓存 post api 请求 的列表 { url: string, latest_timestamp: number  }
const THROTTLE_INTERVAL = 2000; // 防抖时间间隔，单位毫秒

const configuration = function (config) {
  let contentType = config.contentType || 'application/json';
  let handleError = true;
  let throttle = config.method === 'post'; // post 请求时，节流开关默认打开

  if (typeof config.handleError === 'boolean') {
    handleError = config.handleError;
  }

  if (config.method === 'post' && typeof config.throttle === 'boolean') {
    throttle = config.throttle;
  }

  return {contentType, handleError, throttle};
};

// 请求拦截器
_interce.interceptors.request.use(config => {
  const {throttle} = configuration(config);

  if (throttle) {
    let posted = CATCHE_POSTED_LIST.find(item => item.url === config.url);

    if (posted) {

      if (posted.latest_timestamp + THROTTLE_INTERVAL > new Date().getTime()) {
        console.warn('提交频率过于频繁，请稍后重试！', posted);
        return Promise.reject({
          response: {
            data: {code: 500, message: '提交频率过于频繁，请稍后重试！'}
          }
        });
      }

      posted.latest_timestamp = new Date().getTime();
    } else {
      posted = {url: config.url, latest_timestamp: new Date().getTime()};
      CATCHE_POSTED_LIST.push(posted);
    }
  }

  if (getToken()) {
    config.headers.common['Authorization'] = 'Bearer ' + getToken();
  }
  if (!isProd) {
    console.log('【请求url】:', config.url, '\n');
    config.method === 'post' && console.log('【上送数据】:', config.data, '\n');
  }
  return config;
});

// 响应拦截器
_interce.interceptors.response.use(
  response => {
    !isProd && console.log('【返回数据】: ', response.data, '\n');
    
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
      clearCacheToken();
      if (window.location.pathname + window.location.hash === '/#/login') {
        return Promise.reject({message: message});
      }
      window.location = "/#/login";
      return Promise.reject({message: message});
    }

    Toast({type: 'danger', message: message});
    return Promise.reject({message: message});

  },
  error => {
    !isProd && console.log('【错误信息】: ', error, '\n');
    let message = (error.response && error.response.data && error.response.data.message) || '服务器异常! 请稍后再试...';
    // 服务器异常
    Toast({type: 'danger', message: message});
    return Promise.reject({message: message});
  }
);

export default {
  clearCacheToken,
  get(url, data = {}, config = {}) {
    return _interce.get(url, {
      ...config,
      params: data,
      CancelToken: new CancelToken(function executor(c) {
        config.canceler && (config.canceler = c);
      })
    });
  },
  post(url, data = {}, config = {}) {
    return _interce.post(url, data, {
      ...config,
      CancelToken: new CancelToken(function executor(c) {
        config.canceler && (config.canceler = c);
      })
    });
  },
}
