define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CommandBarButtonFactory = (function () {
        function CommandBarButtonFactory() {
        }
        CommandBarButtonFactory.createMainCommandBarButtonOptions = function (container) {
            var newCollectionButtonOptions = {
                iconSrc: 'images/AddCollection.svg',
                onCommandClick: function () { return container.addCollectionPane.open(); },
                commandButtonLabel: container.addCollectionText()
            };
            var newSQLQueryButtonOptions = {
                iconSrc: 'images/AddQuery.svg',
                onCommandClick: function () {
                    var selectedCollection = container.findSelectedCollection();
                    selectedCollection && selectedCollection.onNewQueryClick(selectedCollection, null);
                },
                commandButtonLabel: 'New SQL Query',
                disabled: ko.computed(function () { return container.isDatabaseNodeOrNoneSelected() && container.isPreferredApiDocumentDB(); }),
                visible: ko.computed(function () { return !container.isDatabaseNodeOrNoneSelected() && container.isPreferredApiDocumentDB(); })
            };
            var newSQLQueryButtonOptionsForGraph = {
                iconSrc: 'images/AddSqlQuery_16x16.svg',
                onCommandClick: function () {
                    var selectedCollection = container.findSelectedCollection();
                    selectedCollection && selectedCollection.onNewQueryClick(selectedCollection, null);
                },
                commandButtonLabel: 'New SQL Query',
                disabled: ko.computed(function () { return container.isDatabaseNodeOrNoneSelected() && container.isPreferredApiGraph(); }),
                visible: ko.computed(function () { return !container.isDatabaseNodeOrNoneSelected() && container.isPreferredApiGraph(); })
            };
            var newMongoQueryButtonOptions = {
                iconSrc: 'images/AddQuery.svg',
                onCommandClick: function () {
                    var selectedCollection = container.findSelectedCollection();
                    selectedCollection && selectedCollection.onNewMongoQueryClick(selectedCollection, null);
                },
                commandButtonLabel: 'New Mongo Query',
                disabled: ko.computed(function () { return container.isDatabaseNodeOrNoneSelected() && container.isPreferredApiMongoDB(); }),
                visible: ko.computed(function () { return !container.isDatabaseNodeOrNoneSelected() && container.isPreferredApiMongoDB(); })
            };
            var newMongoShellButtonOptions = {
                iconSrc: 'images/Mongoshell1.svg',
                onCommandClick: function () {
                    var selectedCollection = container.findSelectedCollection();
                    selectedCollection && selectedCollection.onNewMongoShellClick();
                },
                commandButtonLabel: 'New Mongo Shell',
                disabled: ko.computed(function () { return container.isDatabaseNodeOrNoneSelected() && container.isPreferredApiMongoDB(); }),
                visible: ko.computed(function () { return !container.isDatabaseNodeOrNoneSelected() && container.isPreferredApiMongoDB(); })
            };
            var newStoredProcedureButtonOptions = {
                iconSrc: 'images/AddStoredProcedure.svg',
                onCommandClick: function () {
                    var selectedCollection = container.findSelectedCollection();
                    selectedCollection && selectedCollection.onNewStoredProcedureClick(selectedCollection, null);
                },
                commandButtonLabel: 'New Stored Procedure',
                disabled: ko.computed(function () { return container.isDatabaseNodeOrNoneSelected(); }),
                visible: ko.computed(function () { return !container.isDatabaseNodeOrNoneSelected(); })
            };
            var newUserDefinedFunctionButtonOptions = {
                iconSrc: 'images/AddUdf.svg',
                onCommandClick: function () {
                    var selectedCollection = container.findSelectedCollection();
                    selectedCollection && selectedCollection.onNewUserDefinedFunctionClick(selectedCollection, null);
                },
                commandButtonLabel: 'New User Defined Function',
                disabled: ko.computed(function () { return container.isDatabaseNodeOrNoneSelected(); }),
                visible: ko.computed(function () { return !container.isDatabaseNodeOrNoneSelected(); })
            };
            var newTriggerButtonOptions = {
                iconSrc: 'images/AddTrigger.svg',
                onCommandClick: function () {
                    var selectedCollection = container.findSelectedCollection();
                    selectedCollection && selectedCollection.onNewTriggerClick(selectedCollection, null);
                },
                commandButtonLabel: 'New Trigger',
                disabled: ko.computed(function () { return container.isDatabaseNodeOrNoneSelected(); }),
                visible: ko.computed(function () { return !container.isDatabaseNodeOrNoneSelected(); })
            };
            var deleteCollectionButtonOptions = {
                iconSrc: 'images/delete.svg',
                onCommandClick: function () {
                    var selectedCollection = container.findSelectedCollection();
                    selectedCollection && container.deleteCollectionConfirmationPane.open();
                },
                commandButtonLabel: 'Delete Collection',
                disabled: ko.computed(function () { return container.isDatabaseNodeOrNoneSelected(); }),
                visible: ko.computed(function () { return !container.isDatabaseNodeOrNoneSelected(); })
            };
            var provideFeedbackButtonOptions = {
                iconSrc: 'images/Feedback-Command.svg',
                onCommandClick: function () { return container.provideFeedbackEmail(); },
                commandButtonLabel: 'Feedback',
                disabled: ko.observable(container.isEmulator),
                visible: ko.observable(!container.isEmulator)
            };
            return [
                newCollectionButtonOptions,
                newSQLQueryButtonOptions,
                newSQLQueryButtonOptionsForGraph,
                newMongoQueryButtonOptions,
                newMongoShellButtonOptions,
                newStoredProcedureButtonOptions,
                newUserDefinedFunctionButtonOptions,
                newTriggerButtonOptions,
                deleteCollectionButtonOptions,
                provideFeedbackButtonOptions
            ];
        };
        return CommandBarButtonFactory;
    }());
    exports.CommandBarButtonFactory = CommandBarButtonFactory;
});
