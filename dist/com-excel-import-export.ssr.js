'use strict';function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}var XLSX = require('xlsx');

function noop() {} // 深度克隆
// 判断arr是否为一个数组，返回一个bool值


function isArray(arr) {
  return Object.prototype.toString.call(arr) === "[object Array]";
}

function deepClone(obj) {
  // 对常见的“非”值，直接返回原来值
  if ([null, undefined, NaN, false].includes(obj)) return obj;

  if (_typeof(obj) !== "object" && typeof obj !== "function") {
    //原始类型直接返回
    return obj;
  }

  var o = isArray(obj) ? [] : {};

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = _typeof(obj[i]) === "object" ? deepClone(obj[i]) : obj[i];
    }
  }

  return o;
}

Date.prototype.Format = function () {
  var fmt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'yyyy-MM-dd HH:mm';
  var o = {
    "M+": this.getMonth() + 1,
    //月份
    "d+": this.getDate(),
    //日
    "H+": this.getHours(),
    //小时
    "m+": this.getMinutes(),
    //分
    "s+": this.getSeconds(),
    //秒
    "q+": Math.floor((this.getMonth() + 3) / 3),
    //季度
    "S": this.getMilliseconds() //毫秒

  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
  }

  return fmt;
};

var script = {
  name: 'ComExcelImportExportSample',
  // vue component name
  data: function data() {
    return {
      multiple: false
    };
  },
  mounted: function mounted() {// console.log(this.$options.mixins)
  },
  methods: {
    /**
     * 构建excel表头
     * @param revealList 列表页面展示的表头
     * @returns {[]} excel表格展示的表头
     */
    buildHeader: function buildHeader(revealList) {
      var _this = this;

      var excelHeader = []; // 构建生成excel表头需要的数据结构

      this.getHeader(revealList, excelHeader, 0, 0); // 多行表头长短不一，短的向长的看齐，不够的补上行合并占位符

      var max = Math.max.apply(Math, _toConsumableArray(excelHeader.map(function (a) {
        return a.length;
      })));
      excelHeader.filter(function (e) {
        return e.length < max;
      }).forEach(function (e) {
        return _this.pushRowSpanPlaceHolder(e, max - e.length);
      });
      return excelHeader;
    },

    /**
     * 生成头部
     * @param headers 展示的头部
     * @param excelHeader excel头部
     * @param deep 深度
     * @param perOffset 前置偏移量
     * @returns {number}  后置偏移量
     */
    getHeader: function getHeader(headers, excelHeader, deep, perOffset) {
      var offset = 0;
      var cur = excelHeader[deep];

      if (!cur) {
        cur = excelHeader[deep] = [];
      } // 填充行合并占位符


      this.pushRowSpanPlaceHolder(cur, perOffset - cur.length);

      for (var i = 0; i < headers.length; i++) {
        var head = headers[i];
        cur.push("".concat(head.label));

        if (head.hasOwnProperty('children') && Array.isArray(head.children) && head.children.length > 0) {
          var childOffset = this.getHeader(head.children, excelHeader, deep + 1, cur.length - 1); // 填充列合并占位符

          this.pushColSpanPlaceHolder(cur, childOffset - 1);
          offset += childOffset;
        } else {
          offset++;
        }
      }

      return offset;
    },

    /**
     * 根据选中的数据和展示的列，生成结果
     * @param selectionData
     * @param revealList
     */
    extractData: function extractData(revealList, selectionData) {
      var _this2 = this;

      // 列
      var headerList = this.flat(revealList); // 导出的结果集

      var excelRows = []; // 如果有children集合的话会用到

      var dataKeys = new Set(Object.keys(selectionData[0]));
      selectionData.some(function (e) {
        if (e.children && e.children.length > 0) {
          var childKeys = Object.keys(e.children[0]);

          for (var i = 0; i < childKeys.length; i++) {
            dataKeys.delete(childKeys[i]);
          }

          return true;
        }
      });
      this.flatData(selectionData, function (list) {
        excelRows.push.apply(excelRows, _toConsumableArray(_this2.buildExcelRow(dataKeys, headerList, list)));
      });
      return excelRows;
    },

    /**
     *
     * */
    buildExcelRow: function buildExcelRow(mainKeys, headers, rawDataList) {
      // 合计行
      var sumCols = []; // 数据行

      var rows = [];

      for (var i = 0; i < rawDataList.length; i++) {
        var cols = [];
        var rawData = rawDataList[i]; // 提取数据

        for (var j = 0; j < headers.length; j++) {
          var header = headers[j]; // 父元素键需要行合并

          if (rawData['rowSpan'] === 0 && mainKeys.has(header.prop)) {
            cols.push('!$ROW_SPAN_PLACEHOLDER');
          } else {
            var value = void 0;

            if (typeof header.exeFun === 'function') {
              value = header.exeFun(rawData);
            } else {
              value = rawData[header.prop];
            }

            cols.push(value); // 如果该列需要合计,并且是数字类型

            if (header['summable'] && typeof value === 'number') {
              sumCols[j] = (sumCols[j] ? sumCols[j] : 0) + value;
            }
          }
        }

        rows.push(cols);
      } // 如果有合计行


      if (sumCols.length > 0) {
        rows.push.apply(rows, _toConsumableArray(this.sumRowHandle(sumCols)));
      }

      return rows;
    },

    /**
     * 求和
     * @param sumCols
     * @returns {*[]}
     */
    sumRowHandle: function sumRowHandle(sumCols) {
      //TODO
      return [];
    },

    /**
     * 合并头部单元格
     **/
    doMerges: function doMerges(arr) {
      // 要么横向合并 要么纵向合并
      var deep = arr.length;
      var merges = [];

      for (var y = 0; y < deep; y++) {
        // 先处理横向合并
        var row = arr[y];
        var colSpan = 0;

        for (var x = 0; x < row.length; x++) {
          if (row[x] === '!$COL_SPAN_PLACEHOLDER') {
            row[x] = undefined;

            if (x + 1 === row.length) {
              merges.push({
                s: {
                  r: y,
                  c: x - colSpan - 1
                },
                e: {
                  r: y,
                  c: x
                }
              });
            }

            colSpan++;
          } else if (colSpan > 0 && x > colSpan) {
            merges.push({
              s: {
                r: y,
                c: x - colSpan - 1
              },
              e: {
                r: y,
                c: x - 1
              }
            });
            colSpan = 0;
          } else {
            colSpan = 0;
          }
        }
      } // 再处理纵向合并


      var colLength = arr[0].length;

      for (var _x = 0; _x < colLength; _x++) {
        var rowSpan = 0;

        for (var _y = 0; _y < deep; _y++) {
          if (arr[_y][_x] === '!$ROW_SPAN_PLACEHOLDER') {
            arr[_y][_x] = undefined;

            if (_y + 1 === deep) {
              merges.push({
                s: {
                  r: _y - rowSpan,
                  c: _x
                },
                e: {
                  r: _y,
                  c: _x
                }
              });
            }

            rowSpan++;
          } else if (rowSpan > 0 && _y > rowSpan) {
            merges.push({
              s: {
                r: _y - rowSpan - 1,
                c: _x
              },
              e: {
                r: _y - 1,
                c: _x
              }
            });
            rowSpan = 0;
          } else {
            rowSpan = 0;
          }
        }
      }

      return merges;
    },

    /**
     * @param data {Array} 表头 + 内容 所有row
     * @param headerRows {Number} 表头行数
     */
    aoa_to_sheet: function aoa_to_sheet(data, headerRows) {
      var ws = {};
      var range = {
        s: {
          c: 10000000,
          r: 10000000
        },
        e: {
          c: 0,
          r: 0
        }
      };

      for (var R = 0; R !== data.length; ++R) {
        //
        for (var C = 0; C !== data[R].length; ++C) {
          if (range.s.r > R) {
            range.s.r = R;
          }

          if (range.s.c > C) {
            range.s.c = C;
          }

          if (range.e.r < R) {
            range.e.r = R;
          }

          if (range.e.c < C) {
            range.e.c = C;
          } /// 这里生成cell的时候，使用上面定义的默认样式


          var cell = {
            v: ![undefined, null, ''].includes(data[R][C]) ? data[R][C] : '',
            s: {
              font: {
                name: '宋体',
                sz: 11,
                color: {
                  auto: 1
                }
              },
              alignment: {
                /// 自动换行
                wrapText: 1,
                // 居中
                horizontal: 'center',
                vertical: 'center',
                indent: 0
              }
            }
          }; // 头部列表加边框

          if (R < headerRows) {
            cell.s.border = {
              top: {
                style: 'thin',
                color: {
                  rgb: '000000'
                }
              },
              left: {
                style: 'thin',
                color: {
                  rgb: '000000'
                }
              },
              bottom: {
                style: 'thin',
                color: {
                  rgb: '000000'
                }
              },
              right: {
                style: 'thin',
                color: {
                  rgb: '000000'
                }
              }
            };
            cell.s.fill = {
              patternType: 'solid',
              fgColor: {
                // theme: 3, "tint": 0.3999755851924192,
                rgb: 'd6eacd'
              },
              bgColor: {
                // theme: 7, "tint": 0.3999755851924192,
                rgb: 'd6eacd'
              }
            }; // 内容区域 && 是错误导出
          } // else if (type === 1) {
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


          var cell_ref = XLSX.utils.encode_cell({
            c: C,
            r: R
          }); // 设置类型  值为数值类型

          cell.t = 's'; // if (C !== 0) {
          //   if (typeof cell.v === 'number' || !([undefined, null, ''].includes(cell.v) && !isNaN(cell.v))) {
          //     cell.t = 'n'
          //   }
          // } else if (typeof cell.v === 'boolean') {
          //   cell.t = 'b'
          // } else {
          //   cell.t = 's'
          // }

          ws[cell_ref] = cell;
        }
      }

      if (range.s.c < 10000000) {
        ws['!ref'] = XLSX.utils.encode_range(range);
      }

      return ws;
    },

    /**
     * 填充行合并占位符
     * */
    pushRowSpanPlaceHolder: function pushRowSpanPlaceHolder(arr, count) {
      for (var i = 0; i < count; i++) {
        arr.push('!$ROW_SPAN_PLACEHOLDER');
      }
    },
    // 填充列合并占位符
    pushColSpanPlaceHolder: function pushColSpanPlaceHolder(arr, count) {
      for (var i = 0; i < count; i++) {
        arr.push('!$COL_SPAN_PLACEHOLDER');
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
    flatData: function flatData(list, eachDataCallBack) {
      var resultList = [];

      for (var i = 0; i < list.length; i++) {
        var data = list[i];
        var rawDataList = []; // 每个子元素都和父元素合并成一条数据

        if (data.children && data.children.length > 0) {
          for (var j = 0; j < data.children.length; j++) {
            var copy = Object.assign({}, data, data.children[j]);
            rawDataList.push(copy);
            copy['rowSpan'] = j > 0 ? 0 : data.children.length;
          }
        } else {
          data['rowSpan'] = 1;
          rawDataList.push(data);
        }

        resultList.push.apply(resultList, rawDataList);

        if (typeof eachDataCallBack === 'function') {
          eachDataCallBack(rawDataList);
        }
      }

      return resultList;
    },
    // 扁平头部
    flat: function flat(revealList) {
      var _this3 = this;

      var result = [];
      (revealList || []).forEach(function (e) {
        if (e.hasOwnProperty('children') && (e.children || []).length) {
          result.push.apply(result, _toConsumableArray(_this3.flat(e.children)));
        } else if (e.hasOwnProperty('label')) {
          result.push(e);
        }
      });
      return result;
    },
    s2ab: function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);

      for (var i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
      }

      return buf;
    },
    openDownloadXLSXDialog: function openDownloadXLSXDialog(url, saveName) {
      if (_typeof(url) == 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url); // 创建blob地址
      }

      var aLink = document.createElement('a');
      aLink.href = url;
      aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效

      var event;

      if (window.MouseEvent) {
        event = new MouseEvent('click');
      } else {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      }

      aLink.dispatchEvent(event);
    },

    /**
     * 导入触发选择文件
     * @param {function} callback
     * @param {Boolean} isSelect
     * @returns {Promise<unknown>}
     */
    importToExcel: function importToExcel(callback, isSelect) {
      if (isSelect) {
        this.multiple = true;
      }

      this.sendRes = callback || noop;
      this.$el.click();
    },

    /**
     * 导出
     * @param {Array} tableList [row]
     * @param {Array} headerOptions [ label: '合作监所', prop: 'prisonsName', children: [..] },]
     * @param {string} fileName
     * */
    exportExport: function exportExport(tableList, headerOptions, fileName) {
      var _this4 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var newtableList, sheetName, excelHeader, headerRows, dataList, merges, ws, workbook, wopts, wbout, blob;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                newtableList = deepClone(tableList) || [{}];
                sheetName = "".concat(fileName ? fileName : 'excel文件', "_").concat(new Date().Format('MM月dd日HH时mm分')); // excel表头

                excelHeader = _this4.buildHeader(headerOptions); // 头部行数，用来固定表头

                headerRows = excelHeader.length; // 提取数据

                dataList = _this4.extractData(headerOptions, newtableList);
                excelHeader.push.apply(excelHeader, _toConsumableArray(dataList).concat([[]])); // 计算合并

                merges = _this4.doMerges(excelHeader); // 生成sheet

                ws = _this4.aoa_to_sheet(excelHeader, headerRows);
                console.log(dataList, excelHeader, merges, ws); // 单元格合并

                ws['!merges'] = merges; // console.log(excelHeader, 'excelHeader');
                // console.log(dataList, 'dataList');
                // console.log(merges, 'merges');
                // console.log(ws, 'ws');
                // 头部冻结

                ws['!freeze'] = {
                  xSplit: '1',
                  ySplit: '' + headerRows,
                  topLeftCell: 'B' + (headerRows + 1),
                  activePane: 'bottomRight',
                  state: 'frozen'
                };
                ws['!cols'] = headerOptions.map(function (el) {
                  return {
                    wpx: el.width || 100 // MDW: true,

                  };
                }); // 列宽

                Array(2).fill({
                  wpx: 180
                });
                workbook = {
                  SheetNames: [sheetName],
                  Sheets: {}
                };
                workbook.Sheets[sheetName] = ws; // excel样式

                wopts = {
                  bookType: 'xlsx',
                  bookSST: false,
                  type: 'binary',
                  cellStyles: true
                };
                wbout = XLSX.write(workbook, wopts);
                blob = new Blob([_this4.s2ab(wbout)], {
                  type: 'application/octet-stream'
                });

                _this4.openDownloadXLSXDialog(blob, sheetName + '.xlsx');

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },

    /**
     * 导出
     * @param {Array} sheets -> tableList [row]  headerOptions [ label: '合作监所', prop: 'prisonsName', children: [..] },]
     * @param {string} fileName
     * */
    exportExportSheets: function exportExportSheets() {
      var _arguments = arguments,
          _this5 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var sheets, fileName, sheetName, workbook, wopts, wbout, blob;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                sheets = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : [];
                fileName = _arguments.length > 1 ? _arguments[1] : undefined;
                sheetName = "".concat(fileName ? fileName : 'excel文件', "_").concat(new Date().Format('MM月dd日HH时mm分'));
                workbook = {
                  SheetNames: [],
                  Sheets: {}
                };
                sheets.map(function (el, index) {
                  var sheet = 'Sheet' + (index + 1);
                  workbook.SheetNames.push(el.name || sheet);
                  var newtableList = deepClone(el.tableList) || [{}]; // excel表头

                  var excelHeader = _this5.buildHeader(el.headerOptions); // 头部行数，用来固定表头


                  var headerRows = excelHeader.length; // 提取数据

                  var dataList = _this5.extractData(el.headerOptions, newtableList);

                  excelHeader.push.apply(excelHeader, _toConsumableArray(dataList).concat([[]])); // 计算合并

                  var merges = _this5.doMerges(excelHeader); // 生成sheet


                  var ws = _this5.aoa_to_sheet(excelHeader, headerRows); // 单元格合并


                  ws['!merges'] = merges; // console.log(excelHeader, 'excelHeader');
                  // console.log(dataList, 'dataList');
                  // console.log(merges, 'merges');
                  // console.log(ws, 'ws');
                  // 头部冻结

                  ws['!freeze'] = {
                    xSplit: '1',
                    ySplit: '' + headerRows,
                    topLeftCell: 'B' + (headerRows + 1),
                    activePane: 'bottomRight',
                    state: 'frozen'
                  }; // 列宽

                  ws['!cols'] = ((el === null || el === void 0 ? void 0 : el.headerOptions) || []).map(function (item) {
                    return {
                      wpx: item.width || 100 // MDW: true,

                    };
                  });
                  workbook.Sheets[el.name || sheet] = ws;
                  console.log(dataList, excelHeader, merges, ws);
                }); // excel样式

                wopts = {
                  bookType: 'xlsx',
                  bookSST: false,
                  type: 'binary',
                  cellStyles: true
                };
                wbout = XLSX.write(workbook, wopts);
                blob = new Blob([_this5.s2ab(wbout)], {
                  type: 'application/octet-stream'
                });

                _this5.openDownloadXLSXDialog(blob, sheetName + '.xlsx');

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },

    /**
     * 导入数据
     * @param event
     * @returns {Promise<unknown>}
     */
    importMainExport: function importMainExport(event) {
      var _this6 = this;

      if (!event.currentTarget.files.length) return;
      var f = null;
      var zipFile = null;
      event.currentTarget.files;

      for (var len = event.currentTarget.files.length, i = 0; i < len; i++) {
        var fileName = event.currentTarget.files[i].name;
        var pos = fileName.lastIndexOf(".");
        var lastName = fileName.substring(pos, fileName.length);

        if (lastName.toLowerCase() === ".xlsx") {
          f = event.currentTarget.files[i];
        }

        if (lastName.toLowerCase() === ".zip") {
          zipFile = event.currentTarget.files[i];
        }
      }

      if (!f) return;
      var reader = new FileReader();
      var rABS = true;

      reader.onload = function (e) {
        try {
          var dataResult = e.target.result;
          if (!rABS) ;
          var workbook = XLSX.read(dataResult, {
            type: rABS ? 'binary' : 'array'
          }); // 假设我们的数据在第一个标签

          var firstWorksheet = workbook.Sheets[workbook.SheetNames[0]]; // XLSX自带了一个工具把导入的数据转成json

          var jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, {
            header: 1
          }); // 去除空行

          for (var _i = 0, _len = jsonArr.length; _i < _len; _len--) {
            if (!jsonArr[_len - 1].length) {
              jsonArr.splice(_len - 1, 1);
            }
          }

          document.querySelector('#upload-export-file').value = null;

          _this6.sendRes({
            code: 200,
            message: '成功',
            list: jsonArr,
            files: zipFile
          });
        } catch (e) {
          _this6.sendRes({
            code: 500,
            message: e
          });
        }
      };

      {
        reader.readAsBinaryString(f);
      }
    }
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}function createInjectorSSR(context) {
    if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
    }
    if (!context)
        return () => { };
    if (!('styles' in context)) {
        context._styles = context._styles || {};
        Object.defineProperty(context, 'styles', {
            enumerable: true,
            get: () => context._renderStyles(context._styles)
        });
        context._renderStyles = context._renderStyles || renderStyles;
    }
    return (id, style) => addStyle(id, style, context);
}
function addStyle(id, css, context) {
    const group = css.media || 'default' ;
    const style = context._styles[group] || (context._styles[group] = { ids: [], css: '' });
    if (!style.ids.includes(id)) {
        style.media = css.media;
        style.ids.push(id);
        let code = css.source;
        style.css += code + '\n';
    }
}
function renderStyles(styles) {
    let css = '';
    for (const key in styles) {
        const style = styles[key];
        css +=
            '<style data-vue-ssr-id="' +
                Array.from(style.ids).join(' ') +
                '"' +
                (style.media ? ' media="' + style.media + '"' : '') +
                '>' +
                style.css +
                '</style>';
    }
    return css;
}/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('input', {
    staticClass: "com-excel-import-export-sample",
    attrs: {
      "type": "file",
      "multiple": true,
      "id": "upload-export-file"
    },
    on: {
      "change": _vm.importMainExport
    }
  }, []);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = function __vue_inject_styles__(inject) {
  if (!inject) return;
  inject("data-v-0f570d26_0", {
    source: "#upload-export-file[data-v-0f570d26]{display:none}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


var __vue_scope_id__ = "data-v-0f570d26";
/* module identifier */

var __vue_module_identifier__ = "data-v-0f570d26";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, createInjectorSSR, undefined);

var __vue_component__$1 = __vue_component__;/* eslint-disable import/prefer-default-export */var components$1=/*#__PURE__*/Object.freeze({__proto__:null,ComExcelImportExportSample:__vue_component__$1});var install = function installComExcelImportExport(Vue) {
  Object.entries(components$1).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        componentName = _ref2[0],
        component = _ref2[1];

    Vue.component(componentName, component);
    var Upload = Vue.extend(component);
    var instance = new Upload({
      propsData: {}
    });
    var anchor = document.createElement('div');
    window.document.body.appendChild(anchor);
    instance.$mount(anchor); // window.setTimeout(_=> {
    //   instance.$el.style.display = 'none'
    //   instance.importToExcel(function (res) {
    //     console.log(res)
    //   })
    //   // instance.exportExport([{value: 0,value1: '测试数2据',}], [{label: '标题1', prop: 'value1', children: [{label: '标题1-1', prop: 'value',},{label: '标题1-2', prop: 'value',},{label: '标题1-3', prop: 'value',},{label: '标题1-4', prop: 'value',}]}, {label: '标题2', prop: 'value1'}])
    // }, 4000)

    window.setTimeout(function (_) {// instance.$el.style.display = 'none'
      // instance.importToExcel(function (res) {
      //   console.log(res, '---')
      // }, true)
      // console.log(2222)
      // instance.exportExportSheets([
      //   {
      //     name: '测试1',
      //     tableList: [{value: 0, value1: '测试数2据',}],
      //     headerOptions: [{
      //       label: '标题1',
      //       prop: 'value1',
      //       children: [{label: '标题1-1', prop: 'value',}, {label: '标题1-2', prop: 'value',}, {
      //         label: '标题1-3',
      //         prop: 'value',
      //       }, {label: '标题1-4', prop: 'value',}]
      //     }, {label: '标题2', prop: 'value1'}]
      //
      //   },
      //
      //   {
      //     name: '测试2',
      //     tableList: [{value: 0, value1: '测试数2据',}],
      //     headerOptions: [{
      //       label: '标题1',
      //       prop: 'value1',
      //       children: [{label: '标题1-1', prop: 'value',}, {label: '标题1-2', prop: 'value',}, {
      //         label: '标题1-3',
      //         prop: 'value',
      //       }, {label: '标题1-4', prop: 'value',}]
      //     }, {label: '标题2', prop: 'value1'}]
      //
      //   },
      // ])
    }, 4000);
    Vue.prototype.$excelFile = instance;
    Vue.prototype.$excelOpen = instance.importToExcel;
    Vue.prototype.$excelToFile = instance.exportExport;
    Vue.prototype.$exportExportSheets = instance.exportExportSheets;
  });
}; // Create module definition for Vue.use()
var components=/*#__PURE__*/Object.freeze({__proto__:null,'default':install,ComExcelImportExportSample:__vue_component__$1});// only expose one global var, with component exports exposed as properties of
// that global var (eg. plugin.component)

Object.entries(components).forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      componentName = _ref2[0],
      component = _ref2[1];

  if (componentName !== 'default') {
    install[componentName] = component;
  }
});module.exports=install;