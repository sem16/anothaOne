import { exclude } from './excluded';
import { ExportPane } from "./MyDialog";
import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters,
} from "@microsoft/sp-listview-extensibility";
import { Dialog } from "@microsoft/sp-dialog";

import * as strings from "MyDialogCommandSetStrings";
import * as React from "react";
import * as ReactDom from "react-dom";
import { sp } from "@pnp/sp-commonjs";
import { ConvertToXlsx } from "./ConvertToXlsx";
import { FilterService } from './FilterService';


/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMyDialogCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = "MyDialogCommandSet";

export default class MyDialogCommandSet extends BaseListViewCommandSet<
  IMyDialogCommandSetProperties
  > {
  private _container = document.createElement("div");
  private open = true;
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, "Initialized MyDialogCommandSet");
    return Promise.resolve();
  }

  cheangeColumnName(jsonList: any) {
    let keys;
    for (let i = 0; i < jsonList.length; i++) {
      exclude.forEach((element) => {
        try {
          delete jsonList[i][element];
        } catch (e) {
          console.log(e);
        }
      });
    }
    jsonList.forEach((column) => {
      // this.context.listView.columns.map((el) => {
      //   column[el.field.displayName] = column[el.field.internalName];
      //   delete column[el.field.internalName];
      // });
      sp.web.lists.getByTitle(this.context.pageContext.list.title).fields.get()
        .then(res => res.forEach(res => {
          keys = Object.keys(column);
          keys.forEach((el) => {
            if(el === res.StaticName){
              column[res.Title] = column[el];
              delete column[el];
            }
          })

        }));
    });
  }

  filterStringBuilder(a: { checkboxes: any[]; field: any }[]): string {
    let filterString: string = "";
    let addAnd: boolean = false;
    a.forEach((el, indexField) => {
      if (el.checkboxes.length > 0) {
        addAnd = true;
        filterString += ` ( `;
        el.checkboxes.forEach((elCheckbox, indexCheckbox) => {
          if (indexCheckbox > 0 && el.checkboxes.length > 1) {
            filterString += ` or `;
          }
          typeof elCheckbox === "number" || elCheckbox === null
            ? (filterString += `${el.field} eq ${elCheckbox}`)
            : (filterString += `${el.field} eq '${elCheckbox}'`);
        });
        filterString += ` ) `;
      }
      //aggiunge un 'or' se il prossimo field ha dei checkbox
      try {
        if (addAnd && a[indexField + 1].checkboxes.length > 0) {
          filterString += ` and `;
        }
      } catch (e) { }
    });
    return filterString;
  }
  filterString = "";
  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    var checkboxes;
    switch (event.itemId) {
      case "COMMAND_1":
        let filter:FilterService = new FilterService(this.context);
        filter.getService();
        break;
      default:
        throw new Error("Unknown command");
    }
  }
}

interface IFilters {
  field: string;
  checkboxes: any[];
}
