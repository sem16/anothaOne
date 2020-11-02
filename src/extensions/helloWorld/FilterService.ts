import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { IFieldInfo, sp } from "@pnp/sp-commonjs";
import { ConvertToXlsx } from "./ConvertToXlsx";
import { exclude } from "./excluded";

export class FilterService {
  private context: ListViewCommandSetContext;
  private filterString = "";
  fields: IFieldInfo[];
  constructor(_context) {
    this.context = _context;
  }
  async cheangeColumnName(jsonList: any) {
    let keys;
    let fieldNotInListview: Boolean = true;
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
      keys = Object.keys(column);
      //cambia gli internal name in display name
      this.fields.forEach((res) => {
        keys.forEach((key) => {
          if (key === res.StaticName && key !== res.Title) {
            column[res.Title] = column[key];
            delete column[key];
          }
          if(res.TypeAsString === 'DateTime'){
            try{ column[res.Title] = column[res.Title].substring(0,10 );
            } catch{}
          }
        });
      });
      Object.keys(column).forEach((key) => {
        //cancella i field non presenti nella list view
        this.context.listView.columns.forEach(col =>  {
          if(col.field.displayName === key || key === "Nome società")
            fieldNotInListview = false;
        });
        if(fieldNotInListview){
          delete column[key];
        }
        fieldNotInListview = true;
      })

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
      } catch (e) {}
    });
    return filterString;
  }

  public getFilters() {
    let filters;
    let checkboxes;
    try {
      filters = document.getElementById("FiltersPane-id").children;
    } catch (e) {}
    let saveFilters: IFilters[] = [];
    console.log(saveFilters);
    //itera sugli elementi del filter pane
    if (filters != null) {
      for (let j = 1; j < filters.length; j++) {
        //inserisce il nome del field
        try {
          saveFilters.push({
            field: filters.item(j).getAttribute("data-section-key"),
            checkboxes: [],
          });
        } catch (e) {
          console.log(e);
        }
        console.log(saveFilters[j - 1].field);
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
                this.fields.forEach((el) =>
                  el.InternalName ===
                  filters.item(j).getAttribute("data-section-key")
                    ? (type = el.TypeAsString)
                    : null
                );
                console.log(type);
                let value = checkboxes
                  .item(i)
                  .getAttribute("data-checked-value");
                if (type == "Number") {
                  saveFilters[j - 1].checkboxes.push(
                    isNaN(value.replace(/,/g, "")) === false
                      ? parseInt(value.replace(/,/g, ""))
                      : null
                  );
                  console.log(saveFilters[j - 1].checkboxes[i]);
                } else {
                  try {
                    if(( value === "(Empty)" && !(value === "(Vuoto))" ) || ( !(value === "(Empty)") && (value === "(Vuoto)") ))){
                      saveFilters[j - 1].checkboxes.push(null);
                    }
                    else{
                      saveFilters[j - 1].checkboxes.push(value);
                    }
                    console.log(saveFilters[j - 1].checkboxes[i]);
                  } catch (e) {
                    console.log(e);
                  }
                }
              }
            }
            break;
          case "1":
            let useSpecificDate = null;
            try {
              useSpecificDate = filters
                .item(j)
                .getElementsByClassName("FiltersPane-slider")
                .item(0).childNodes[0].childNodes[1].childNodes[0].ariaDisabled;
            } catch (e) {}

            if (useSpecificDate === "true") {
              filters
                .item(j)
                .getElementsByClassName("FiltersPane-section")
                .item(0)
                .childNodes[0].childNodes[0].childNodes.forEach((el, i) => {
                  let ischecked = el.getAttribute("data-is-checked");
                  if (ischecked == "true") {
                    let dataValue = el.getAttribute("data-checked-value");
                    let date = new Date(dataValue.replace("/", "-"));
                    date.toString() !== "Invalid Date"
                      ? saveFilters[j - 1].checkboxes.push(
                          `${date.getFullYear()}-${
                            date.getMonth() + 1
                          }-${date.getDate()}`
                        )
                      : saveFilters[j - 1].checkboxes.push(null);
                    console.log(saveFilters[j - 1].checkboxes[i]);
                  }
                });
            } else {
              let sliderOptions = [-92, -32, -7, -1, 0, +1, +7, +32, +92, +365];
              let sliderValue = parseInt(
                filters
                  .item(j)
                  .getElementsByClassName("FiltersPane-slider")
                  .item(0).childNodes[0].childNodes[1].childNodes[0]
                  .ariaValueNow
              );
              if (sliderValue != 0) {
                let date = new Date();
                date.setDate(date.getDate() + sliderOptions[sliderValue - 1]);
                console.log(
                  `${date.getFullYear()}-${
                    date.getMonth() + 1
                  }-${date.getDate()}`
                );
                sp.web.lists
                  .getByTitle(this.context.pageContext.list.title)
                  .items.filter(
                    `Data_apertura_quick ge ${date.getFullYear()}-${
                      date.getMonth() + 1
                    }-${date.getDate()}`
                  )
                  .get()
                  .then((res) => console.log(res));
              }
            }

            break;
        }
      }

      console.log(saveFilters);
      console.log(this.filterStringBuilder(saveFilters));
      this.filterString = this.filterStringBuilder(saveFilters);
      try {
        sp.web.lists
          .getByTitle(this.context.pageContext.list.title)
          .items.filter(this.filterString)
          .get()
          .then((res) => {
            if(res.length === 0){
              throw new Error("lista vuota");
            }
            this.cheangeColumnName(res).then(() =>
              ConvertToXlsx.convertToXslx(res)
            );
            console.log(res);
          });
      } catch (e) {
        console.log(e);
      }
    } else {
      sp.web.lists
        .getByTitle(this.context.pageContext.list.title)
        .items.filter(this.filterString)
        .get()
        .then((res) => {
          this.cheangeColumnName(res).then(() =>
            ConvertToXlsx.convertToXslx(res)
          );
          console.log(res);
        });
    }
  }

  public async filterService(){
    this.fields = await sp.web.lists.getByTitle(this.context.pageContext.list.title)
    .fields.get();
    this.getFilters();
  }
}

interface IFilters {
  field: string;
  checkboxes: any[];
}
