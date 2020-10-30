declare interface IHelloWorldCommandSetStrings {
  Command2: string;
}

declare module 'HelloWorldCommandSetStrings' {
  const strings: IHelloWorldCommandSetStrings;
  export = strings;
}
