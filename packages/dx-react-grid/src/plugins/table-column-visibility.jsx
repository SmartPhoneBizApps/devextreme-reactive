import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  Action,
  Getter,
  Plugin,
  Template,
  TemplateConnector,
  TemplatePlaceholder,
} from '@devexpress/dx-react-core';
import {
  getMessagesFormatter,
  toggleColumn,
  visibleTableColumns,
  tableDataColumnsExist,
  getColumnExtensionValueGetter,
} from '@devexpress/dx-grid-core';
import { createStateHelper } from '../utils/state-helper';

const pluginDependencies = [
  { name: 'Table' },
];

const visibleTableColumnsComputed = ({ tableColumns, hiddenColumnNames }) =>
  visibleTableColumns(tableColumns, hiddenColumnNames);

const columnExtensionValueGetter = (columnExtensions, defaultValue) =>
  getColumnExtensionValueGetter(columnExtensions, 'togglingEnabled', defaultValue);

export class TableColumnVisibility extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hiddenColumnNames: props.defaultHiddenColumnNames,
    };
    const stateHelper = createStateHelper(this);

    this.toggleColumnVisibility = stateHelper.applyFieldReducer.bind(stateHelper, 'hiddenColumnNames', toggleColumn);
  }
  getState() {
    const {
      hiddenColumnNames = this.state.hiddenColumnNames,
    } = this.props;
    return {
      ...this.state,
      hiddenColumnNames,
    };
  }
  notifyStateChange(nextState, state) {
    const { hiddenColumnNames } = nextState;
    const { onHiddenColumnNamesChange } = this.props;
    if (onHiddenColumnNamesChange && hiddenColumnNames !== state.hiddenColumnNames) {
      onHiddenColumnNamesChange(hiddenColumnNames);
    }
  }
  render() {
    const {
      emptyMessageComponent: EmptyMessage,
      messages,
    } = this.props;
    const getMessage = getMessagesFormatter(messages);
    const { hiddenColumnNames } = this.getState();
    const { columnExtensions, columnTogglingEnabled } = this.props;

    return (
      <Plugin
        name="TableColumnVisibility"
        dependencies={pluginDependencies}
      >
        <Getter name="hiddenColumnNames" value={hiddenColumnNames} />
        <Getter name="tableColumns" computed={visibleTableColumnsComputed} />
        <Getter
          name="isColumnTogglingEnabled"
          value={columnExtensionValueGetter(columnExtensions, columnTogglingEnabled)}
        />
        <Action
          name="toggleColumnVisibility"
          action={this.toggleColumnVisibility}
        />

        <Template name="table">
          {params => (
            <TemplateConnector>
              {({ tableColumns }) =>
                (tableDataColumnsExist(tableColumns)
                ? <TemplatePlaceholder />
                : <EmptyMessage
                  getMessage={getMessage}
                  {...params}
                />
              )}
            </TemplateConnector>
          )}
        </Template>
      </Plugin>
    );
  }
}

TableColumnVisibility.propTypes = {
  hiddenColumnNames: PropTypes.arrayOf(PropTypes.string),
  defaultHiddenColumnNames: PropTypes.arrayOf(PropTypes.string),
  emptyMessageComponent: PropTypes.func.isRequired,
  onHiddenColumnNamesChange: PropTypes.func,
  messages: PropTypes.object,
  columnExtensions: PropTypes.array,
  columnTogglingEnabled: PropTypes.bool,
};

TableColumnVisibility.defaultProps = {
  hiddenColumnNames: undefined,
  defaultHiddenColumnNames: [],
  onHiddenColumnNamesChange: undefined,
  messages: {},
  columnExtensions: undefined,
  columnTogglingEnabled: true,
};