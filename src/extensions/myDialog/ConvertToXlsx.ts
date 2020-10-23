import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export class ConvertToXlsx {
  public static convertToXslx(list: any) {
    const json = list;
    const sheet = XLSX.utils.json_to_sheet(json);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet);
    const link = document.createElement("a");
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
}
