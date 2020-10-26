import { exclude } from './excluded';
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

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
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
