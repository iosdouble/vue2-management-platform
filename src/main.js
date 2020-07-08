// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueRouter from 'vue-router';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App';
import Index from './views/index/index';
import Table from './views/table/table';
import Form from './views/form/form';
// import ue from './views/editor/editor';
import Flow from './views/flow/flow'
import Approval from './views/approval/approval'
import 'font-awesome/css/font-awesome.min.css';
import Mock from './mock/mock';

import '../static/UE/ueditor.config.js'
import '../static/UE/ueditor.all.min.js'
import '../static/UE/lang/zh-cn/zh-cn.js'
import '../static/UE/ueditor.parse.min.js'

Mock.mockData();
Vue.use(VueRouter);// 安装路由功能
/* eslint-disable no-new */
Vue.use(VueRouter);
Vue.prototype.$http = axios;
Vue.use(ElementUI);

// 后端对比cookies判断是否登录，凡接口response的header带有x-auth-token的即未登录，跳转首页。
// Vue.http.interceptors.push((request, next) => {
//   request.credentials = true;
//   next((response) => {
//     let messageHeader;
//     /* global IS_PRODUCTION:true */
//     if (IS_PRODUCTION) {
//       messageHeader = "X-Auth-Token";
//     } else {
//       messageHeader = "x-auth-token";
//     }
//     if (messageHeader in response.headers.map) {
//       router.push({path: '/login'});
//     }
//     return response
//   });
// });

let routes = [
  {
    path: '/',
    component: App,
    children: [
      {path: '/index', component: Index, name: '首页', class: 'fa-line-chart'},
      {path: '/table', component: Table, name: '流程操作', class: 'fa-table'},
      {path: '/flow', component: Flow, name: '工单操作', class: 'fa-envelope'},
      {path: '/approval', component: Approval, name: '审批操作', class: 'fa-line-chart'},
      {path: '/form', component: Form, name: '提交任务', class: 'fa-newspaper-o'},
      // {path: '/editor', component: ue, name: '编辑器', class: 'fa-plug'}
    ]
  }
];
let router = new VueRouter({
  // 'mode': 'history', 去掉URL的#号，需要配置服务器http://router.vuejs.org/zh-cn/essentials/history-mode.html
  'linkActiveClass': 'active',
  routes
});
let app = new Vue({
  router
}).$mount('#app');
export default app;
