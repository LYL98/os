import Button from './component/button/button';
import ButtonGroup from './component/button/button-group';
import Checkbox from './component/checkbox/checkbox';
import CheckboxGroup from './component/checkbox/checkbox-group';
import Cascader from './component/cascader/cascader';
import Confirm from './component/confirm/confirm';
import Datepicker from './component/datepicker/datepicker';
import Dialog from './component/dialog/dialog';
import Drawer from './component/drawer/drawer';
import Editor from './component/editor/editor';
import Form from './component/form/form';
import FormItem from './component/form/form-item';
import Input from './component/input/input';
import Navbar from './component/navbar/navbar';
import Pagination from './component/pagination/pagination';
import Popper from './component/popper/popper';
import Radio from './component/radio/radio';
import RadioGroup from './component/radio/radio-group';
import Search from './component/search/search';
import Select from './component/select/select';
import Sidebar from './component/sidebar/sidebar';
import Switch from './component/switch/switch';
import Option from './component/select/option';
import Table from './component/table/table';
import TableRow from './component/table/row';
import TableColumn from './component/table/column';
import TableColumnSort from './component/table/column-sort';
import Tabs from './component/tabs/tabs';
import Tab from './component/tabs/tab';
import Textarea from './component/textarea/textarea';
import Timepicker from './component/timepicker/timepicker';
import Tooltip from './component/tooltip/tooltip';
import Transfer from './component/transfer/transfer';
import Tree from './component/tree/tree';
import Uploader from './component/uploader/uploader';

import Loading from './component/loading';
import Toast from './component/toast';
import Preview from './component/preview';
import Http from './http/http';

const components = [
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Cascader,
  Confirm,
  Datepicker,
  Dialog,
  Drawer,
  Editor,
  Form,
  FormItem,
  Input,
  Navbar,
  Pagination,
  Popper,
  Radio,
  RadioGroup,
  Search,
  Select,
  Sidebar,
  Switch,
  Option,
  Table,
  TableRow,
  TableColumn,
  TableColumnSort,
  Tabs,
  Tab,
  Textarea,
  Timepicker,
  Tooltip,
  Transfer,
  Tree,
  Uploader
];

const install = function (Vue) {
  // 判断是否安装
  if (install.installed) return;

  // 遍历注册全局组件
  components.forEach(component => Vue.component(component.name, component));
  Vue.prototype.$loading = Loading;
  Vue.prototype.$toast = Toast;
  Vue.prototype.$preview = Preview;

};

// 判断是否直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

import { init, destory, osConfig } from './pgyos.config';

export default {
  install,
  init,
  destory,
  osConfig
}

export {
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Cascader,
  Confirm,
  Datepicker,
  Dialog,
  Drawer,
  Editor,
  Form,
  FormItem,
  Input,
  Navbar,
  Pagination,
  Popper,
  Radio,
  RadioGroup,
  Search,
  Select,
  Sidebar,
  Switch,
  Option,
  Table,
  TableRow,
  TableColumn,
  TableColumnSort,
  Tabs,
  Tab,
  Textarea,
  Timepicker,
  Tooltip,
  Transfer,
  Tree,
  Uploader,

  Loading,
  Toast,
  Preview,
  Http,
};
