
import { saveAs } from "file-saver";
import * as XLSX from 'xlsx';

export class ConvertToXlsx {
  public static convertToXslx(list: any) {
    const json = list;
    console.log(json)
    let cols;
    const sheet = XLSX.utils.json_to_sheet(json);
    const workbook = XLSX.utils.book_new();
    cols =   Object.keys(json[0]).map(key => ({wch: this.fitToColumn(key,json,key.length)}))
    sheet['!cols'] = cols;
    sheet['!rows'] = [{hpx: 28}];
    sheet
    console.log(sheet["!cols"])
    XLSX.utils.book_append_sheet(workbook, sheet);
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    saveAs(
      new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }),
      "test.xlsx"
    );
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
        : obj[key].toString().length > miniumLength? obj[key].toString().length : miniumLength
      : miniumLength);
    console.log(Math.max(...temp));
    return Math.max(...temp);
  }
}

