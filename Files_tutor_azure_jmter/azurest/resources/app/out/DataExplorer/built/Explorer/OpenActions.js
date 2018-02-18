// TODO convert this file to an action registry in order to have actions and their handlers be more tightly coupled.
define(["require", "exports", "../Shared/DataExplorerActionInterfaces"], function (require, exports, ActionInterfaces) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function handleOpenAction(action, databases) {
        if (action.actionType === ActionInterfaces.ActionType.OpenCollectionTab) {
            openCollectionTab(action, databases);
        }
    }
    exports.handleOpenAction = handleOpenAction;
    function openCollectionTab(action, databases) {
        var _loop_1 = function (i) {
            if (databases[i].id() === action.databaseResourceId) {
                var subscription_1 = databases[i].collections.subscribe(function (collections) {
                    for (var j = 0; j < collections.length; j++) {
                        if (collections[j].id() === action.collectionResourceId) {
                            // select the collection
                            collections[j].expandCollection();
                            switch (action.tabKind) {
                                case ActionInterfaces.TabKind.SQLDocuments:
                                    collections[j].onDocumentDBDocumentsClick();
                                    break;
                                case ActionInterfaces.TabKind.MongoDocuments:
                                    collections[j].onMongoDBDocumentsClick();
                                    break;
                                case ActionInterfaces.TabKind.TableEntities:
                                    collections[j].onTableEntitiesClick();
                                    break;
                                case ActionInterfaces.TabKind.Graph:
                                    collections[j].onGraphDocumentsClick();
                                    break;
                                case ActionInterfaces.TabKind.SQLQuery:
                                    collections[j].onNewQueryClick(collections[j], null, generateQueryText(action, collections[j].partitionKeyProperty));
                                    break;
                            }
                            break;
                        }
                    }
                    subscription_1.dispose();
                });
                return "break";
            }
        };
        for (var i = 0; i < databases.length; i++) {
            var state_1 = _loop_1(i);
            if (state_1 === "break")
                break;
        }
    }
    function generateQueryText(action, partitionKeyProperty) {
        if (!action.query) {
            return "SELECT * FROM c";
        }
        else if (!!action.query.text) {
            return action.query.text;
        }
        else if (!!action.query.partitionKeys && action.query.partitionKeys.length > 0) {
            var query = "SELECT * FROM c WHERE";
            for (var i = 0; i < action.query.partitionKeys.length; i++) {
                var partitionKey = action.query.partitionKeys[i];
                if (!partitionKey) {
                    query = query.concat(" c." + partitionKeyProperty + " = " + action.query.partitionKeys[i]);
                }
                else if (typeof partitionKey !== "string") {
                    query = query.concat(" NOT IS_DEFINED(c." + partitionKeyProperty + ")");
                }
                else {
                    query = query.concat(" c." + partitionKeyProperty + " = \"" + action.query.partitionKeys[i] + "\"");
                }
                if (i !== action.query.partitionKeys.length - 1) {
                    query = query.concat(" OR");
                }
            }
            return query;
        }
        return "SELECT * FROM c";
    }
});
