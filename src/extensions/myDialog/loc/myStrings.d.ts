declare interface IMyDialogCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'MyDialogCommandSetStrings' {
  const strings: IMyDialogCommandSetStrings;
  export = strings;
}
