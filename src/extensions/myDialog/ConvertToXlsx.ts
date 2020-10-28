import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import * as excel from "exceljs";
import {Column} from 'exceljs'
export class ConvertToXlsx {
  public static convertToXslx(list: any) {
    const json = list;
    console.log(json)
    const workbook = new excel.Workbook();
    const sheet = workbook.addWorksheet('foglio 1');
    Object.keys(json[0]).forEach((key,i) => {
      let col =sheet.getColumn(i+1)
      col.header = key;
      col.key = key;
      col.width = this.fitToColumn(key,list,key.length);
    });
    const rows = sheet.addRows(json);
    rows.forEach((row,i) => {
      i%2 === 0 ? row.fill = {pattern: "solid",fgColor: {argb:'C7EEF7'},type: 'pattern'}
      : row.fill = {pattern: "solid",fgColor: {argb:'7CB3F7'},type: 'pattern'}
      row.border = {
        top: {style:'thin', color: {argb: '878889'}},
        left: {style:'thin', color: {argb: '878889'}},
        bottom: {style:'thin', color: {argb: '878889'}},
        right: {style:'thin', color: {argb: '878889'}}
      };
      row.height = 25;
    });
    const header = sheet.getRow(1);
    header.font = {bold: true,size: 13,color: {argb: 'FFFFFF'}};
    header.height = 30;
    header.fill = {pattern: "solid",fgColor: {argb:'6BB8EA'},type: 'pattern'}
    header.border = {
      top: {style:'thin', color: {argb: '878889'}},
      left: {style:'thin', color: {argb: '878889'}},
      bottom: {style:'thin', color: {argb: '878889'}},
      right: {style:'thin', color: {argb: '878889'}}
    };
    //sheet.getRow(1).model = {style: {font: {bold: true,size: 17} }};
    workbook.xlsx.writeBuffer().then(data => {
      saveAs(new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    })


    // const sheet = XLSX.utils.json_to_sheet(json);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, sheet);
    // const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    // const te = new excel.Workbook();
    // te.xlsx.load(this.s2ab(wbout)).then(wb => {
    //   const worksheet = wb.getWorksheet(0);
    //   worksheet.columns.forEach(column => {
    //     column.width = 25;
    //   })
    //   wb.xlsx.writeBuffer().then(data => {
    //     saveAs(new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    //   });
    // });

    // te.xlsx.writeBuffer().then(data => {
    //   saveAs(new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    // });


    // saveAs(
    //   new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }),
    //   "test.xlsx"
    // );
  }

  static s2ab(s) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf); //create uint8array as viewer
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
    return buf;
  }

  static fitToColumn(key,json,miniumLength){
    console.log('minumlegth: ' + miniumLength)
    let temp: number[] = json.map(obj =>
      obj[key] !== null && 'undefined'?
        typeof obj[key] === 'string' ?
          obj[key].length > miniumLength? obj[key].length : miniumLength
          : obj[key].toString().length > miniumLength? obj[key].toString().length: miniumLength
      : 0);
    console.log(Math.max(...temp));
    return Math.max(...temp) + 3;
  }
}

