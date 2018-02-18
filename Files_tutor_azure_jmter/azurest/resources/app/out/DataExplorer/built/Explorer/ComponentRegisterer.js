/**
 * Register KO components here
 */
define(["require", "exports", "knockout", "./Tabs/TabComponents", "./Tree/TreeComponents", "./Panes/PaneComponents", "./Controls/CommandButton/CommandButton", "./Controls/Toolbar/Toolbar", "./Graph/GraphExplorerComponent", "./Controls/InputTypeahead/InputTypeahead", "./Graph/NewVertexComponent/NewVertexComponent", "./Controls/ErrorDisplayComponent/ErrorDisplayComponent", "./Controls/CollapsiblePanel/CollapsiblePanelComponent", "./Graph/GraphStyleComponent/GraphStyleComponent", "./Controls/JsonEditor/JsonEditorComponent"], function (require, exports, ko, TabComponents, TreeComponents, PaneComponents, CommandButton_1, Toolbar_1, GraphExplorerComponent_1, InputTypeahead_1, NewVertexComponent_1, ErrorDisplayComponent_1, CollapsiblePanelComponent_1, GraphStyleComponent_1, JsonEditorComponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ko.components.register('command-button', new CommandButton_1.CommandButtonComponent());
    ko.components.register('toolbar', new Toolbar_1.ToolbarComponent());
    ko.components.register('graph-explorer', new GraphExplorerComponent_1.GraphExplorerComponent());
    ko.components.register('input-typeahead', new InputTypeahead_1.InputTypeaheadComponent());
    ko.components.register('new-vertex-form', new NewVertexComponent_1.NewVertexComponent());
    ko.components.register('error-display', new ErrorDisplayComponent_1.ErrorDisplayComponent());
    ko.components.register('graph-style', new GraphStyleComponent_1.GraphStyleComponent());
    ko.components.register('collapsible-panel', new CollapsiblePanelComponent_1.CollapsiblePanelComponent());
    ko.components.register('json-editor', new JsonEditorComponent_1.JsonEditorComponent());
    // Collection Tabs
    ko.components.register('documents-tab', new TabComponents.DocumentsTab());
    ko.components.register('mongo-documents-tab', new TabComponents.MongoDocumentsTab());
    ko.components.register('stored-procedure-tab', new TabComponents.StoredProcedureTab());
    ko.components.register('trigger-tab', new TabComponents.TriggerTab());
    ko.components.register('user-defined-function-tab', new TabComponents.UserDefinedFunctionTab());
    ko.components.register('settings-tab', new TabComponents.SettingsTab());
    ko.components.register('query-tab', new TabComponents.QueryTab());
    ko.components.register('tables-query-tab', new TabComponents.QueryTablesTab());
    ko.components.register('graph-tab', new TabComponents.GraphTab());
    ko.components.register('mongo-shell-tab', new TabComponents.MongoShellTab());
    // Resource Tree nodes
    ko.components.register('resource-tree', new TreeComponents.ResourceTree());
    ko.components.register('database-node', new TreeComponents.DatabaseTreeNode());
    ko.components.register('collection-node', new TreeComponents.CollectionTreeNode());
    ko.components.register('stored-procedure-node', new TreeComponents.StoredProcedureTreeNode());
    ko.components.register('trigger-node', new TreeComponents.TriggerTreeNode());
    ko.components.register('user-defined-function-node', new TreeComponents.UserDefinedFunctionTreeNode());
    // Panes
    ko.components.register('add-colection-pane', new PaneComponents.AddCollectionPaneComponent());
    ko.components.register('delete-colection-confirmation-pane', new PaneComponents.DeleteCollectionConfirmationPaneComponent());
    ko.components.register('delete-database-confirmation-pane', new PaneComponents.DeleteDatabaseConfirmationPaneComponent());
    // Context menus
    ko.components.register('collection-node-context-menu', new TreeComponents.CollectionTreeNodeContextMenu());
});
