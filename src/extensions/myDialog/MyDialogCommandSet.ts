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
  public onListViewUpdated(
    event: IListViewCommandSetListViewUpdatedParameters
  ): void {
    const compareOneCommand: Command = this.tryGetCommand("COMMAND_1");
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = event.selectedRows.length === 1;
    }
  }

  filterStringBuilder(a: { checkboxes: any[]; field: any; }[]): string {
    let filterString: string;
    a.forEach((el,index)=> {
      el.checkboxes.forEach((elCheckbox,index) => {
        if(index < 1){
          filterString += 'or';
        }
        filterString = `${el.field} eq ${el.checkboxes[index]}`;
        console.log(index);
      })
      
    });
    return filterString;
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    var checkboxes;
    switch (event.itemId) {
      case "COMMAND_1":
        Dialog.alert(`${this.properties.sampleTextOne}`);
        break;
      case "COMMAND_2":
        // let _renderPanel = React.createElement(
        //   ExportPane,
        //   {
        //    isOpen: this.open,
        //    context: this.context
        //   }
        // );
        // ReactDom.render(_renderPanel,this._container);

        const filters = document.getElementById("FiltersPane-id").children;
        let a: IFilters[] = [];
        console.log(a);
        //itera sugli elementi del filter pane
        for (let j = 1; j < filters.length; j++) {
          //inserisce il nome del field
          try {
            a.push({
              field: filters.item(j).getAttribute("data-section-key"),
              checkboxes: [],
            });
          } catch (e) {
            console.log(e);
          }
          console.log(a[j - 1].field);
          switch (filters.item(j).getAttribute("data-section-type")) {
            case "3":
              //assegna gli checkbox del elemento corrente
              checkboxes = filters
                .item(j)
                .getElementsByClassName("ms-FocusZone")[0].children;
              console.log(checkboxes);
              //itera sui checkbox di ogni elemento
              for (let i = 0; i < checkboxes.length; i++) {
                //inserisce i checkbox selezionati
                if (
                  checkboxes.item(i).getAttribute("data-is-checked") === "true"
                ) {
                  //prende il tipo del elemento
                  let type: string;
                  this.context.listView.columns.filter((el) =>
                    el.field.internalName ===
                    filters.item(j).getAttribute("data-section-key")
                      ? (type = el.field.fieldType)
                      : null
                  );
                  console.log(type);
                  let value = checkboxes
                    .item(i)
                    .getAttribute("data-checked-value");

                  if (type == "Number") {
                    a[j - 1].checkboxes[i] =
                      isNaN(value.replace(/,/g, "")) === false ? value.replace(/,/g, "") : "null";
                    console.log(a[j - 1].checkboxes[i]);
                  } else {
                    try {
                      a[j - 1].checkboxes[i] = value;
                      console.log(a[j - 1].checkboxes[i]);
                    } catch (e) {
                      console.log(e);
                    }
                  }
                }
              }
              break;
            case "1":
              break;
          }
        }
        console.log(a);
        console.log(this.filterStringBuilder(a));
        try {
          sp.web.lists
            .getByTitle(this.context.pageContext.list.title)
            .items.filter(this.filterStringBuilder(a))
            .get()
            .then((res) => console.log(res));
        } catch (e) {
          console.log(e);
        }
      default:
        throw new Error("Unknown command");
    }
  }
}

interface IFilters {
  field: string;
  checkboxes: any[];
}
