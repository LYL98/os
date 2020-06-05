const origin = window.location.origin;
const node_env = process.argv[process.argv.length - 1];

const is_local = origin.indexOf('localhost') >= 0
  || origin.indexOf('192.168') >= 0
  || origin.indexOf('127.0') >= 0
  || origin.indexOf('172.') >= 0
  || origin.indexOf('10.') >= 0;

const is_dev = node_env === 'dev';
const is_test = node_env === 'test';
const is_pre = node_env === 'pre';
const is_pro = node_env === 'pro';

let api_prefix = '';