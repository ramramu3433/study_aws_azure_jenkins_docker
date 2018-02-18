define(["require", "exports", "underscore", "./DataTableUtilities", "./DataTableOperations", "../TableEntityProcessor"], function (require, exports, _, DataTableUtilities, DataTableOperations, TableEntityProcessor) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TableCommands = (function () {
        function TableCommands(container) {
            this._container = container;
        }
        TableCommands.prototype.isEnabled = function (commandName, selectedEntites) {
            var singleItemSelected = DataTableUtilities.containSingleItem(selectedEntites);
            var atLeastOneItemSelected = DataTableUtilities.containItems(selectedEntites);
            switch (commandName) {
                case TableCommands.editEntityCommand:
                    return singleItemSelected;
                case TableCommands.deleteEntitiesCommand:
                case TableCommands.reorderColumnsCommand:
                    return atLeastOneItemSelected;
                default:
                    break;
            }
            return false;
        };
        TableCommands.prototype.tryOpenEntityEditor = function (viewModel) {
            if (this.isEnabled(TableCommands.editEntityCommand, viewModel.selected())) {
                this.editEntityCommand(viewModel);
                return true;
            }
            return false;
        };
        /**
         * Edit entity
         */
        TableCommands.prototype.editEntityCommand = function (viewModel) {
            if (!viewModel) {
                return null; // Error
            }
            if (!DataTableUtilities.containSingleItem(viewModel.selected())) {
                return null; // Erorr
            }
            var entityToUpdate = viewModel.selected()[0];
            var originalNumberOfProperties = entityToUpdate ? 0 : Object.keys(entityToUpdate).length - 1; // .metadata is always a property for etag
            this._container.editTableEntity_open(entityToUpdate, viewModel, originalNumberOfProperties);
            return null;
        };
        TableCommands.prototype.deleteEntitiesCommand = function (viewModel) {
            if (!viewModel) {
                return null; // Error
            }
            if (!DataTableUtilities.containItems(viewModel.selected())) {
                return null; // Error
            }
            var entitiesToDelete = viewModel.selected();
            if (window.confirm("Are you sure you want to delete the selected entities?")) {
                var documentsToDelete = TableEntityProcessor.convertEntitiesToDocuments(entitiesToDelete, viewModel.queryTablesTab.collection);
                var promiseArray_1 = [];
                documentsToDelete.forEach(function (document) {
                    var promise = viewModel.queryTablesTab.documentClientUtility.deleteDocument(document, null /*options*/);
                    promiseArray_1.push(promise);
                });
                Promise.all(promiseArray_1).then(function (results) {
                    return viewModel.removeEntitiesFromCache(entitiesToDelete).then(function () {
                        viewModel.redrawTableThrottled();
                    });
                });
            }
            return null;
        };
        TableCommands.prototype.customizeColumnsCommand = function (viewModel) {
            var table = viewModel.table;
            var displayedColumnNames = DataTableOperations.getDataTableHeaders(table);
            var columnsCount = displayedColumnNames.length;
            var currentOrder = DataTableOperations.getInitialOrder(columnsCount);
            //Debug.assert(!!table && !!currentOrder && displayedColumnNames.length === currentOrder.length);
            var currentSettings;
            try {
                currentSettings = currentOrder.map(function (value, index) {
                    return table.column(index).visible();
                });
            }
            catch (err) {
                // Error
            }
            var parameters = {
                columnNames: displayedColumnNames,
                order: currentOrder,
                visible: currentSettings
            };
            this._container.tableColumnOptions_open(parameters, viewModel);
            return null;
        };
        TableCommands.prototype.reorderColumnsBasedOnSelectedEntities = function (viewModel) {
            var selected = viewModel.selected();
            if (!selected || !selected.length) {
                return null;
            }
            var table = viewModel.table;
            var currentColumnNames = DataTableOperations.getDataTableHeaders(table);
            var headersCount = currentColumnNames.length;
            var headersUnion = DataTableUtilities.getPropertyIntersectionFromTableEntities(selected);
            // An array with elements representing indexes of selected entities' header union out of initial headers.
            var orderOfLeftHeaders = headersUnion.map(function (item) { return currentColumnNames.indexOf(item); });
            // An array with elements representing initial order of the table.
            var initialOrder = DataTableOperations.getInitialOrder(headersCount);
            // An array with elements representing indexes of headers not present in selected entities' header union.
            var orderOfRightHeaders = _.difference(initialOrder, orderOfLeftHeaders);
            // This will be the target order, with headers in selected entities on the left while others on the right, both in the initial order, respectively.
            var targetOrder = orderOfLeftHeaders.concat(orderOfRightHeaders);
            return DataTableOperations.reorderColumns(table, targetOrder);
        };
        TableCommands.prototype.resetColumns = function (viewModel) {
            viewModel.reloadTable();
        };
        return TableCommands;
    }());
    // Command Ids
    TableCommands.editEntityCommand = "edit";
    TableCommands.deleteEntitiesCommand = "delete";
    TableCommands.reorderColumnsCommand = "reorder";
    TableCommands.resetColumnsCommand = "reset";
    TableCommands.customizeColumnsCommand = "customizeColumns";
    exports.default = TableCommands;
});
