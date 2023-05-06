<script>
var XLSX = require('xlsx')
function noop() {}
// 深度克隆
// 判断arr是否为一个数组，返回一个bool值
function isArray(arr) {
  return Object.prototype.toString.call(arr) === "[object Array]";
}

function deepClone(obj) {
  // 对常见的“非”值，直接返回原来值
  if ([null, undefined, NaN, false].includes(obj)) return obj;
  if (typeof obj !== "object" && typeof obj !== "function") {
    //原始类型直接返回
    return obj;
  }
  var o = isArray(obj) ? [] : {};
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = typeof obj[i] === "object" ? deepClone(obj[i]) : obj[i];
    }
  }
  return o;
}

Date.prototype.Format = function (fmt = 'yyyy-MM-dd HH:mm') {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "H+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


export default /*#__PURE__*/{
  name: 'ComExcelImportExportSample', // vue component name

  mounted() {
    // console.log(this.$options.mixins)
  },
  methods: {
    /**
     * 构建excel表头
     * @param revealList 列表页面展示的表头
     * @returns {[]} excel表格展示的表头
     */
    buildHeader(revealList) {
      let excelHeader = []
      // 构建生成excel表头需要的数据结构
      this.getHeader(revealList, excelHeader, 0, 0)
      // 多行表头长短不一，短的向长的看齐，不够的补上行合并占位符
      let max = Math.max(...(excelHeader.map(a => a.length)))
      excelHeader.filter(e => e.length < max).forEach(
          e => this.pushRowSpanPlaceHolder(e, max - e.length))
      return excelHeader
    },

    /**
     * 生成头部
     * @param headers 展示的头部
     * @param excelHeader excel头部
     * @param deep 深度
     * @param perOffset 前置偏移量
     * @returns {number}  后置偏移量
     */
    getHeader(headers, excelHeader, deep, perOffset) {
      let offset = 0
      let cur = excelHeader[deep]
      if (!cur) {
        cur = excelHeader[deep] = []
      }
      // 填充行合并占位符
      this.pushRowSpanPlaceHolder(cur, perOffset - cur.length)
      for (let i = 0; i < headers.length; i++) {

        let head = headers[i]
        cur.push(`${head.label}`)
        if (head.hasOwnProperty('children') && Array.isArray(head.children)
            && head.children.length > 0) {
          let childOffset = this.getHeader(head.children, excelHeader, deep + 1,
              cur.length - 1)
          // 填充列合并占位符
          this.pushColSpanPlaceHolder(cur, childOffset - 1)
          offset += childOffset
        } else {
          offset++
        }
      }
      return offset
    },
    /**
     * 根据选中的数据和展示的列，生成结果
     * @param selectionData
     * @param revealList
     */
    extractData(revealList, selectionData) {
      // 列
      let headerList = this.flat(revealList)
      // 导出的结果集
      let excelRows = []
      // 如果有children集合的话会用到
      let dataKeys = new Set(Object.keys(selectionData[0]))
      selectionData.some(e => {
        if (e.children && e.children.length > 0) {
          let childKeys = Object.keys(e.children[0])
          for (let i = 0; i < childKeys.length; i++) {
            dataKeys.delete(childKeys[i])
          }
          return true
        }
      })


      this.flatData(selectionData, (list) => {
        excelRows.push(...this.buildExcelRow(dataKeys, headerList, list))
      })
      return excelRows
    },

    /**
     *
     * */
    buildExcelRow(mainKeys, headers, rawDataList) {
      // 合计行
      let sumCols = []
      // 数据行
      let rows = []
      for (let i = 0; i < rawDataList.length; i++) {

        let cols = []
        let rawData = rawDataList[i]
        // 提取数据
        for (let j = 0; j < headers.length; j++) {

          let header = headers[j]
          // 父元素键需要行合并
          if (rawData['rowSpan'] === 0 && mainKeys.has(header.prop)) {
            cols.push('!$ROW_SPAN_PLACEHOLDER')
          } else {
            let value
            if (typeof header.exeFun === 'function') {
              value = header.exeFun(rawData)
            } else {
              value = rawData[header.prop]
            }
            cols.push(value)
            // 如果该列需要合计,并且是数字类型
            if (header['summable'] && typeof value === 'number') {
              sumCols[j] = (sumCols[j] ? sumCols[j] : 0) + value
            }
          }
        }
        rows.push(cols)
      }
      // 如果有合计行
      if (sumCols.length > 0) {
        rows.push(...this.sumRowHandle(sumCols))
      }
      return rows
    },

    /**
     * 求和
     * @param sumCols
     * @returns {*[]}
     */
    sumRowHandle(sumCols) {
      //TODO
      return []
    },
    /**
     * 合并头部单元格
     **/
    doMerges(arr) {
      // 要么横向合并 要么纵向合并
      let deep = arr.length
      let merges = []
      for (let y = 0; y < deep; y++) {
        // 先处理横向合并
        let row = arr[y]
        let colSpan = 0
        for (let x = 0; x < row.length; x++) {

          if (row[x] === '!$COL_SPAN_PLACEHOLDER') {

            row[x] = undefined
            if (x + 1 === row.length) {

              merges.push({
                s: {
                  r: y, c: x - colSpan - 1,
                }, e: {
                  r: y, c: x,
                },
              })
            }
            colSpan++
          } else if (colSpan > 0 && x > colSpan) {

            merges.push({
              s: {
                r: y, c: x - colSpan - 1,
              }, e: {
                r: y, c: x - 1,
              },
            })
            colSpan = 0
          } else {

            colSpan = 0
          }
        }
      }
      // 再处理纵向合并
      let colLength = arr[0].length
      for (let x = 0; x < colLength; x++) {

        let rowSpan = 0
        for (let y = 0; y < deep; y++) {

          if (arr[y][x] === '!$ROW_SPAN_PLACEHOLDER') {

            arr[y][x] = undefined
            if (y + 1 === deep) {

              merges.push({
                s: {
                  r: y - rowSpan, c: x,
                }, e: {
                  r: y, c: x,
                },
              })
            }
            rowSpan++
          } else if (rowSpan > 0 && y > rowSpan) {

            merges.push({
              s: {
                r: y - rowSpan - 1, c: x,
              }, e: {
                r: y - 1, c: x,
              },
            })
            rowSpan = 0
          } else {

            rowSpan = 0
          }
        }
      }
      return merges
    },

    /**
     * @param data {Array} 表头 + 内容 所有row
     * @param headerRows {Number} 表头行数
     */
    aoa_to_sheet(data, headerRows) {

      const ws = {}
      const range = {
        s: {
          c: 10000000, r: 10000000,
        },
        e: {
          c: 0, r: 0,
        },
      }
      for (let R = 0; R !== data.length; ++R) {

        //
        for (let C = 0; C !== data[R].length; ++C) {
          if (range.s.r > R) {
            range.s.r = R
          }
          if (range.s.c > C) {
            range.s.c = C
          }
          if (range.e.r < R) {
            range.e.r = R
          }
          if (range.e.c < C) {
            range.e.c = C
          }
          /// 这里生成cell的时候，使用上面定义的默认样式
          const cell = {
            v: data[R][C] || '',
            s: {
              font: {
                name: '宋体', sz: 11, color: {
                  auto: 1,
                },
              },
              alignment: {
                /// 自动换行
                wrapText: 1,
                // 居中
                horizontal: 'center',
                vertical: 'center',
                indent: 0,
              },
            },
          }

          // 头部列表加边框
          if (R < headerRows) {

            cell.s.border = {
              top: {
                style: 'thin', color: {
                  rgb: '000000',
                },
              },
              left: {
                style: 'thin', color: {
                  rgb: '000000',
                },
              },
              bottom: {
                style: 'thin', color: {
                  rgb: '000000',
                },
              },
              right: {
                style: 'thin', color: {
                  rgb: '000000',
                },
              },
            }
            cell.s.fill = {
              patternType: 'solid',
              fgColor: {
                // theme: 3, "tint": 0.3999755851924192,
                rgb: 'd6eacd',
              },
              bgColor: {
                // theme: 7, "tint": 0.3999755851924192,
                rgb: 'd6eacd',
              },
            }
            // 内容区域 && 是错误导出
          }

          // else if (type === 1) {
          //   // 错误数据 用背景色区分出来
          //   if (data[R][C].toString().indexOf('<error>') !== -1) {
          //     cell.v = data[R][C].split('<error>')[1];
          //     cell.s.font = {
          //       name: "微软雅黑",
          //       sz: 8,
          //       color: {
          //         // auto: 1,
          //         rgb: "FFFFFF"
          //       }
          //     };
          //
          //     cell.s.border = {
          //       top: {
          //         style: 'thin', color: {
          //           rgb: "000000"
          //         }
          //       },
          //       left: {
          //         style: 'thin', color: {
          //           rgb: "000000"
          //         }
          //       },
          //       bottom: {
          //         style: 'thin', color: {
          //           rgb: "000000"
          //         }
          //       },
          //       right: {
          //         style: 'thin', color: {
          //           rgb: "000000"
          //         }
          //       },
          //     };
          //
          //     cell.s.fill = {
          //       patternType: 'solid',
          //       fgColor: {
          //         // theme: 3, "tint": 0.3999755851924192,
          //         rgb: 'FA5C7C'
          //       },
          //       bgColor: {
          //         // theme: 7, "tint": 0.3999755851924192,
          //         rgb: 'FA5C7C'
          //       }
          //     }
          //   }
          //
          // }


          const cell_ref = XLSX.utils.encode_cell({
            c: C, r: R,
          })

          // 设置类型  值为数值类型
          if (C !== 0) {
            if (typeof cell.v === 'number' || !([undefined, null, ''].includes(cell.v) && !isNaN(cell.v))) {
              cell.t = 'n'
            }
          } else if (typeof cell.v === 'boolean') {
            cell.t = 'b'
          } else {
            cell.t = 's'
          }
          ws[cell_ref] = cell
        }
      }
      if (range.s.c < 10000000) {
        ws['!ref'] = XLSX.utils.encode_range(range)
      }
      return ws
    },
    /**
     * 填充行合并占位符
     * */
    pushRowSpanPlaceHolder(arr, count) {
      for (let i = 0; i < count; i++) {
        arr.push('!$ROW_SPAN_PLACEHOLDER')
      }
    },
    // 填充列合并占位符
    pushColSpanPlaceHolder(arr, count) {
      for (let i = 0; i < count; i++) {
        arr.push('!$COL_SPAN_PLACEHOLDER')
      }
    },
    /**
     * 展开数据，为了实现父子关系的数据进行行合并
     *   [{
     *     a:1,
     *     b:2,
     *     child: [
     *       {
     *         c:3
     *       },
     *     ]
     *   }]
     * @param list
     * @param eachDataCallBack
     */
    flatData(list, eachDataCallBack) {
      let resultList = []
      for (let i = 0; i < list.length; i++) {
        let data = list[i]
        let rawDataList = []
        // 每个子元素都和父元素合并成一条数据
        if (data.children && data.children.length > 0) {
          for (let j = 0; j < data.children.length; j++) {
            let copy = Object.assign({}, data, data.children[j])
            rawDataList.push(copy)
            copy['rowSpan'] = (j > 0 ? 0 : data.children.length)
          }
        } else {
          data['rowSpan'] = 1
          rawDataList.push(data)
        }
        resultList.push(...rawDataList)
        if (typeof eachDataCallBack === 'function') {
          eachDataCallBack(rawDataList)
        }
      }
      return resultList
    },
    // 扁平头部
    flat(revealList) {
      let result = [];
      (revealList || []).forEach(e => {
        if (e.hasOwnProperty('children') && (e.children || []).length) {
          result.push(...this.flat(e.children))
        } else if (e.hasOwnProperty('label')) {
          result.push(e)
        }
      })
      return result
    },
    s2ab(s) {
      let buf = new ArrayBuffer(s.length)
      let view = new Uint8Array(buf)
      for (let i = 0; i !== s.length; ++i) {

        view[i] = s.charCodeAt(i) & 0xFF
      }
      return buf
    },
    openDownloadXLSXDialog(url, saveName) {
      if (typeof url == 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url) // 创建blob地址
      }
      var aLink = document.createElement('a')
      aLink.href = url
      aLink.download = saveName || '' // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
      var event
      if (window.MouseEvent) {
        event = new MouseEvent('click')
      } else {
        event = document.createEvent('MouseEvents')
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false,
            false, false, false, 0, null)
      }
      aLink.dispatchEvent(event)
    },

    /**
     * 导入触发选择文件
     * @param {function} callback
     * @returns {Promise<unknown>}
     */
    importToExcel(callback) {
      this.sendRes = callback || noop
      this.$el.click();
    },


    /**
     * 导出
     * @param {Array} tableList [row]
     * @param {Array} headerOptions [ label: '合作监所', prop: 'prisonsName', children: [..] },]
     * @param {string} fileName
     * */
    async exportExport(tableList, headerOptions, fileName) {

      let newtableList = deepClone(tableList) || [{}]

      let sheetName = `${fileName ? fileName : 'excel文件'}_${new Date().Format('MM月dd日HH时mm分')}`

      // excel表头
      let excelHeader = this.buildHeader(headerOptions)
      // 头部行数，用来固定表头
      let headerRows = excelHeader.length
      // 提取数据
      let dataList = this.extractData(headerOptions, newtableList)
      excelHeader.push(...dataList, [])
      // 计算合并
      let merges = this.doMerges(excelHeader)
      // 生成sheet
      let ws = this.aoa_to_sheet(excelHeader, headerRows)
      // 单元格合并
      ws['!merges'] = merges

      // console.log(excelHeader, 'excelHeader');
      // console.log(dataList, 'dataList');
      // console.log(merges, 'merges');
      // console.log(ws, 'ws');

      // 头部冻结
      ws['!freeze'] = {
        xSplit: '1',
        ySplit: '' + headerRows,
        topLeftCell: 'B' + (headerRows + 1),
        activePane: 'bottomRight',
        state: 'frozen',
      }
      // 列宽
      ws['!cols'] = Array(2).fill({
        wpx: 180,
      })
      let workbook = {
        SheetNames: [sheetName],
        Sheets: {},
      }
      workbook.Sheets[sheetName] = ws
      // excel样式
      let wopts = {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary',
        cellStyles: true,
      }
      let wbout = XLSX.write(workbook, wopts)
      let blob = new Blob([this.s2ab(wbout)], {type: 'application/octet-stream'})
      this.openDownloadXLSXDialog(blob, sheetName + '.xlsx')
    },


    /**
     * 导入数据
     * @param event
     * @returns {Promise<unknown>}
     */
    importMainExport(event) {
      if (!event.currentTarget.files.length) return
      let f = event.currentTarget.files[0]
      let reader = new FileReader()
      const rABS = true
      reader.onload = e => {
        try {
          let dataResult = e.target.result
          if (!rABS) dataResult = new Uint8Array(dataResult)
          const workbook = XLSX.read(dataResult, {
            type: rABS ? 'binary' : 'array',
          })
          // 假设我们的数据在第一个标签
          const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]]
          // XLSX自带了一个工具把导入的数据转成json
          let jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, {header: 1})
          // 去除空行
          for (let i = 0, len = jsonArr.length; i < len; len--) {
            if (!jsonArr[len - 1].length) {
              jsonArr.splice(len - 1, 1)
            }
          }
          // console.log(jsonArr, 'jsonArr 已读取数据');
          // document.querySelector('#upload-excel-file')?.value = null;
          this.sendRes({
            code: 200,
            message: '成功',
            list: jsonArr,
          })
        } catch (e) {
          this.sendRes({
            code: 500,
            message: e,
          })
        }
      }

      if (rABS) {
        reader.readAsBinaryString(f)
      } else {
        reader.readAsArrayBuffer(f)
      }
    },

  }

};
</script>

<template>
  <input type="file"
         @change="importMainExport"
         id="upload-export-file"
         class="com-excel-import-export-sample"
         accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
</template>

<style scoped>
#upload-export-file {
  display: none;
}
</style>
