"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Q = require("q");
var host = global.host;
exports.actionNamespaces = {
    expand: "CloudExplorer.ElementInteraction.expand",
    childrenQuery: "CloudExplorer.ElementInteraction.childrenQuery",
    select: "CloudExplorer.ElementInteraction.select",
    query: "CloudExplorer.ElementInteraction.query",
    getAttributes: "CloudExplorer.ElementInteraction.getAttributes",
    loadMoreChildren: "CloudExplorer.ElementInteraction.loadMoreChildren",
    executeDefaultAction: "CloudExplorer.ElementInteraction.executeDefaultAction"
};
// Note: This is a CSS-style query - it searches deeply
function childrenQuery(query, targetChildAttributesQuery) {
    var selector = "*";
    if (targetChildAttributesQuery) {
        selector = convertQueryToQueryString(targetChildAttributesQuery);
    }
    return host.executeOperation(exports.actionNamespaces.childrenQuery, { queryResult: query, selector: selector });
}
exports.childrenQuery = childrenQuery;
function childrenQueryWithAttributes(attributesQuery, targetChildAttributesQuery) {
    return getNodes(attributesQuery).then(function (queryResult) {
        return childrenQuery(queryResult, targetChildAttributesQuery);
    });
}
exports.childrenQueryWithAttributes = childrenQueryWithAttributes;
/**
 * Try to find the target child specified by targetChildQuery under a node specified by query.
 * It will keep loading children of the parent node specified by query until the target is found or there are no more children to load.
 * CONSIDER: if there are no many children, a timeout/cancel is needed.
 */
function queryFromAll(query, targetChildQuery, caseInsensitive) {
    if (caseInsensitive === void 0) { caseInsensitive = false; }
    var selector = "*";
    if (targetChildQuery) {
        selector = convertQueryToQueryString(targetChildQuery);
    }
    var loadMoreAndSelect = function (query, childSelector) {
        return host.executeOperation(exports.actionNamespaces.childrenQuery, { queryResult: query, selector: selector, caseInsensitive: caseInsensitive }).then(function (childrenQueryResult) {
            if (childrenQueryResult && childrenQueryResult.uids && childrenQueryResult.uids.length) {
                return Q.resolve(childrenQueryResult);
            }
            else {
                return loadMoreChildren(query).then(function (queryResult) {
                    if (queryResult && queryResult.uids && queryResult.uids.length) {
                        return loadMoreAndSelect(query, childSelector);
                    }
                    else {
                        return Q.resolve({ nodeNotFound: true });
                    }
                });
            }
        });
    };
    return loadMoreAndSelect(query, selector);
}
exports.queryFromAll = queryFromAll;
function queryFromAllWithAttributes(attributesQuery, targetChildAttributesQuery) {
    return getNodes(attributesQuery).then(function (queryResult) {
        return queryFromAll(queryResult, targetChildAttributesQuery);
    });
}
exports.queryFromAllWithAttributes = queryFromAllWithAttributes;
function loadMoreChildren(query) {
    if (query && query.uids && query.uids.length) {
        return host.executeOperation(exports.actionNamespaces.loadMoreChildren, { queryResult: query }).then(function (queryResult) {
            if (queryResult && queryResult.noMoreChildren) {
                return Q.resolve(null);
            }
            else if (queryResult && queryResult.uids && queryResult.uids.length) {
                return Q.resolve(queryResult);
            }
        });
    }
    return Q.resolve(null);
}
exports.loadMoreChildren = loadMoreChildren;
function expand(query) {
    var expandPromise = Q.resolve(false);
    if (query && query.uids && query.uids.length) {
        expandPromise = host.executeOperation(exports.actionNamespaces.expand, { queryResult: query }).then(function (_) { return query; });
    }
    return expandPromise;
}
exports.expand = expand;
function expandWithAttributes(attributesQuery) {
    return getNodes(attributesQuery).then(function (queryResult) {
        return expand(queryResult);
    });
}
exports.expandWithAttributes = expandWithAttributes;
// Note: This is a CSS-style query - it searches deeply
function expandChildrenWithAttributes(query, targetChildAttributesQuery) {
    return childrenQuery(query, targetChildAttributesQuery).then(function (queryResult) {
        return expand(queryResult);
    });
}
exports.expandChildrenWithAttributes = expandChildrenWithAttributes;
function selectNode(query) {
    if (query && query.uids && query.uids.length) {
        return host.executeOperation(exports.actionNamespaces.select, { queryResult: query });
    }
    else {
        return Q.resolve(false);
    }
}
exports.selectNode = selectNode;
function selectNodeWithAttributes(attributesQuery) {
    return getNodes(attributesQuery).then(function (queryResult) {
        return selectNode(queryResult);
    });
}
exports.selectNodeWithAttributes = selectNodeWithAttributes;
function getNodes(attributesQuery) {
    var queryString = convertQueryToQueryString(attributesQuery);
    return host.executeOperation(exports.actionNamespaces.query, { selector: queryString });
}
exports.getNodes = getNodes;
;
function convertQueryToQueryString(attributesQuery) {
    var queryString = "";
    attributesQuery.forEach(function (attribute) {
        queryString += "[" + attribute.name + " = \"" + attribute.value + "\"]";
    });
    return queryString;
}
exports.convertQueryToQueryString = convertQueryToQueryString;
