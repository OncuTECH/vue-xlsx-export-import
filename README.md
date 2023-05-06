VueJS excel file import or export tool

## 🌱vue2.x

```bash
# 
npm install oncu-vuejs-excel-export-import --save
# or
yarn add oncu-vuejs-excel-export-import --save

# main.js 
import comExcel from 'oncu-vuejs-excel-export-import'

Vue.install(comExcel)


# 
<com-excel-import-excel ref="excel-import"/>
this.$refs['excelImport'].importToExcel()
this.$refs['excelImport'].exportExport()


# Api
this.$excelFile.importToExcel(function (res) {
  console.log(res)
})

#
this.$excelFile.exportExport([
    { value: 'value1', value1: 'value2' ,value3: 'value3'}
  ],
  [
    { label: 'Label1', prop: 'value1' },
    { label: 'Label2', prop: 'value2' },
    { label: 'Label3', prop: 'value3' },
])

```
