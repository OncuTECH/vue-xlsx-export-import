
// Import vue components
import * as components from './lib-components/index';

// install function executed by Vue.use()
const install = function installComExcelImportExport(Vue) {
  Object.entries(components).forEach(([componentName, component]) => {
    Vue.component(componentName, component);
    const Upload = Vue.extend(component);
    const instance = new Upload({
      propsData: {

      },
    });

    const anchor = document.createElement('div')
    window.document.body.appendChild(anchor)
    instance.$mount(anchor)
    // window.setTimeout(_=> {
      // instance.$el.style.display = 'none'
      // instance.importToExcel(function (res) {
      //   console.log(res)
      // })
      // instance.exportExport([{value: '测试数据11',value1: '测试数2据',}], [{label: '标题1', prop: 'value1', children: [{label: '标题1-1', prop: 'value',},{label: '标题1-2', prop: 'value',},{label: '标题1-3', prop: 'value',},{label: '标题1-4', prop: 'value',}]}, {label: '标题2', prop: 'value1'}])
    // }, 3000)

    Vue.prototype.$excelFile = instance
    Vue.prototype.$excelOpen = instance.importToExcel
    Vue.prototype.$excelToFile = instance.exportExport
  });


};

// Create module definition for Vue.use()
export default install;

// To allow individual component use, export components
// each can be registered via Vue.component()
export * from './lib-components/index';
