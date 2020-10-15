import * as React from 'react';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { useBoolean } from '@uifabric/react-hooks';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import {sp} from '@pnp/sp-commonjs';

interface ExportPaneProps{
  isOpen: boolean;
  context: ListViewCommandSetContext;
}


export const ExportPane: React.FunctionComponent<ExportPaneProps> = (props: ExportPaneProps) => {
  const [isOpen, setIsOpen] = React.useState(props.isOpen);;
  const dismissPanel = () => {
    setIsOpen(false);
    // props.onDismiss();
  };
  React.useEffect(() => {
    setIsOpen(true);
  }, [props]);

  const getFields = () => {
      let result: any[];
      sp.web.lists.getByTitle(props.context.pageContext.list.title)
      .fields.filter("Hidden eq false").get().then(res => {result = res; console.log(res)});
      console.log(result);
      return result;
    }

  return (
    <div>
      <Panel
        headerText="Sample panel"
        isOpen={isOpen}
        onDismiss={dismissPanel}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
      >
        <p>Content goes here.</p>
        <div>
          { getFields().map(el => (
            <p>{el}</p>
          )) }
        </div>
      </Panel>
    </div>
  );


};

