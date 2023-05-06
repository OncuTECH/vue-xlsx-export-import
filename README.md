简体中文

## 🌱vue2.x

```bash
# 安装依赖
npm install com-excel-import-export --save
# or
yarn add com-excel-import-export --save

# main.js 导入 or 组件引用 
import comExcel from 'com-excel-import-excel'

Vue.install(comExcel)


# 示例1 组件使用
<com-excel-import-excel ref="excel-import"/>
this.$refs['excelImport'].importToExcel()
this.$refs['excelImport'].exportExport()


# 示例2 api使用
# 导入表格
this.$excelFile.importToExcel(function (res) {
  console.log(res)
})

# 导出数据表格
this.$excelFile.exportExport([
    { value: '测试数据11', value1: '测试数2据' ,value3: '测试数据33333'},
    { value: '似懂非懂', value1: '测试数2据' ,value3: '测试数据33333'},
    { value: '测试数据11', value1: '第三方的身份' ,value3: '测试数据33333'},
    { value: '测试数据11', value1: '测试数2据' ,value3: '的身份水电费'},
    { value: '测试数据11', value1: '测试数2据' ,value3: '测试数据33333'},
    { value: '测试数据11', value1: '测试数2据' ,value3: '测试数据33333'},
  ],
  [
    {
      label: '标题1', prop: 'value1',
      children: [
        { label: '标题1-1', prop: 'value' },
        { label: '标题1-2', prop: 'value' },
        { label: '标题1-3', prop: 'value',  
        children: [
            { label: '标题1-3-1', prop: 'value' ,
             children: [
                { label: '标题1-3-1-2', prop: 'value' },
                { label: '标题1-3-1-2', prop: 'value' },
                { label: '标题1-3-1-3', prop: 'value' },
                { label: '标题1-3-1-4', prop: 'value' },
              ],},
            { label: '标题1-3-2', prop: 'value' },
            { label: '标题1-3-3', prop: 'value' },``****``
            { label: '标题1-3-4', prop: 'value' ,
            children: [
                { label: '标题1-3-4-1', prop: 'value' },
                { label: '标题1-3-4-2', prop: 'value' },
                { label: '标题1-3-4-3', prop: 'value' },
                { label: '标题1-3-4-4', prop: 'value' },
              ],
              },
          ], },
        { label: '标题1-4', prop: 'value',
         children: [
            { label: '标题1-1', prop: 'value' },
            { label: '标题1-2', prop: 'value' },
            { label: '标题1-3', prop: 'value' },
            { label: '标题1-4', prop: 'value' },
          ], },
      ],
    },
    { label: '标题2', prop: 'value1' },
    { label: '标题3', prop: 'value3' },
    { label: '标题4', prop: 'value1' },
])

```

## 🔊 友情链接

- [uView uni-app 生态最优秀的 UI 框架](https://github.com/YanxinNet/uView/)

## 🎨 鸣谢

| Project                                                          |
| ---------------------------------------------------------------- |
| [vue](https://github.com/vuejs/vue)                              |
| [element-ui](https://github.com/ElemeFE/element)                 |
| [element-plus](https://github.com/element-plus/element-plus)     |
| [ant-design-vue](https://github.com/vueComponent/ant-design-vue) |
| [mock](https://github.com/nuysoft/Mock)                          |
| [axios](https://github.com/axios/axios)                          |
| [wangEditor](https://github.com/wangeditor-team/wangEditor)      |

## 💚 适合人群

- 正在以及想使用 element-ui/element-plus 开发，前端开发经验 1 年+。
- 熟悉 Vue.js 技术栈，使用它开发过几个实际项目。
- 对原理技术感兴趣，想进阶和提升的同学。
