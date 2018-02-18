define(["require", "exports", "knockout", "q", "./D3ForceGraph"], function (require, exports, ko, Q, D3ForceGraph_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DocumentDB = window.DocumentDB;
    /**
     * Helper class to use for registration
     */
    var GraphExplorerComponent = (function () {
        function GraphExplorerComponent() {
            return {
                viewModel: GraphExplorerViewModel,
                template: { require: "text!graph-explorer.html" }
            };
        }
        return GraphExplorerComponent;
    }());
    exports.GraphExplorerComponent = GraphExplorerComponent;
    exports.VERTEX_PROPERTY_TYPES = ['string', 'number', 'boolean'];
    var GraphExplorerViewModel = (function () {
        function GraphExplorerViewModel(params) {
            var _this = this;
            // Parameters passed to this container in explorer.html
            if (params) {
                this.resourceId = params.resourceId;
                this.endpoint = params.endpoint;
                this.databaseId = params.databaseId;
                this.graphBackendEndpoint = params.graphBackendEndpoint();
                this.stylingPane = params.stylingpane;
                this.documentClientUtility = params.documentClientUtility;
                this.newVertexPane = params.newVertexPane;
                this.collection = params.collection;
                this.masterKey = params.masterKey;
                this.isTabsContentExpanded = params.isTabsContentExpanded;
                this.isTabsContentExpanded.subscribe(function (newVal) {
                    _this.isPropertiesCollapsed(newVal);
                    _this.isResultsCollapsed(newVal);
                });
            }
            // Initialization
            this.isValidQuery = ko.observable(true);
            this.query = ko.observable(GraphExplorerViewModel.DEFAULT_QUERY);
            this.query.subscribe(function (query) { return _this.isValidQuery(GraphExplorerViewModel.isValidQuery(query)); });
            this.executeCounter = ko.observable(0);
            this.isExecuting = ko.computed(function () { return _this.executeCounter() > 0; });
            this.originalGraphData = {
                vertices: [],
                edges: [],
                targetsMap: {},
                sourcesMap: {},
                id2NodeMap: {}
            };
            this.graphData = ko.observable(null);
            this.latestPartialQueries = ko.observableArray([]);
            this.isDeleteConfirm = ko.observable(false);
            this.editedProperties = ko.observable({
                id: null,
                existingProperties: [],
                addedProperties: [],
                droppedKeys: []
            });
            this.editedSources = ko.observable({
                vertexId: null,
                currentNeighbors: [],
                droppedIds: [],
                addedEdges: []
            });
            this.editedTargets = ko.observable({
                vertexId: null,
                currentNeighbors: [],
                droppedIds: [],
                addedEdges: []
            });
            this.possibleVertices = ko.observableArray([]);
            this.possibleEdgeLabels = ko.observableArray([]);
            this.propertyTypes = exports.VERTEX_PROPERTY_TYPES;
            // Initialize d3 graph through custom bindings
            this.d3ForceGraph = new D3ForceGraph_1.D3ForceGraph(this.graphData);
            this.highlightedNode = ko.observable(null);
            this.graphConfigUiData = {
                showNeighborType: ko.observable(this.d3ForceGraph.graphConfig.showNeighborType()),
                nodeProperties: ko.observableArray([]),
                nodePropertiesWithNone: ko.observableArray([]),
                nodeCaptionChoice: ko.observable(this.d3ForceGraph.graphConfig.nodeCaption()),
                nodeColorKeyChoice: ko.observable(this.d3ForceGraph.graphConfig.nodeColorKey()),
                nodeIconChoice: ko.observable(this.d3ForceGraph.graphConfig.nodeIconKey()),
                nodeIconSet: ko.observable(null)
            };
            this.graphConfigUiData.nodeCaptionChoice.subscribe(function (key) {
                _this.d3ForceGraph.graphConfig.nodeCaption(key);
                _this.updatePossibleRootNodes(key);
                var selectedNode = _this.highlightedNode();
                if (selectedNode) {
                    _this.updatePropertiesPane(selectedNode.id);
                }
            });
            // this.nodeColorKeyChoice = ko.observable(null);
            this.graphConfigUiData.nodeColorKeyChoice.subscribe(function (val) {
                _this.d3ForceGraph.graphConfig.nodeColorKey(val === GraphExplorerViewModel.NONE_CHOICE ? null : val);
            });
            this.graphConfigUiData.showNeighborType.subscribe(this.d3ForceGraph.graphConfig.showNeighborType);
            this.graphConfigUiData.nodeIconChoice.subscribe(function (val) {
                _this.updateNodeIcons(val, _this.graphConfigUiData.nodeIconSet());
            });
            this.graphConfigUiData.nodeIconSet.subscribe(function (val) {
                _this.updateNodeIcons(_this.graphConfigUiData.nodeIconChoice(), val);
            });
            this.newVertexPane.newVertexData.subscribe(this.addVertex.bind(this));
            this.possibleRootNodes = ko.observableArray([]);
            this.rootMap = {};
            this.isPropertiesExpanded = ko.observable(true);
            this.isSourcesExpanded = ko.observable(true);
            this.isTargetsExpanded = ko.observable(true);
            this.rightPaneContent = ko.observable(0 /* READONLY_PROP */);
            this.isEditorContentValid = ko.observable(false);
            this.graphStatus = ko.observable(0 /* NOT_LOADED */);
            this.selectedRootId = ko.observable(null);
            // Subscribe to changes: a new node has been highlighted in the graph
            this.d3ForceGraph.highlightedNode.subscribe(function (nodeData) {
                if (!nodeData) {
                    _this.highlightedNode(null);
                    return;
                }
                _this.updatePropertiesPane(nodeData.id);
            });
            this.d3ForceGraph.nodeToLoadNeighbors.subscribe(function (id) {
                console.log('Load more nodes for', id);
                _this.loadNeighbors(_this.originalGraphData.id2NodeMap[id], _this.originalGraphData, 0).then(function () {
                    _this.updateGraphData(_this.originalGraphData);
                });
            });
            // Register custom handler
            ko.bindingHandlers.d3forcegraph = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    _this.d3ForceGraph.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    _this.d3ForceGraph.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                }
            };
            this.isPropertiesCollapsed = ko.observable(false);
            this.isResultsCollapsed = ko.observable(false);
            this.expandedRightPaneTitle = ko.computed(function () { return _this.getPropertyPaneTitle(); });
            this.collapsedRightPaneTitle = ko.computed(function () { return 'Properties'; });
            this.leftPaneTitle = ko.computed(function () { return 'Results'; });
            this.queryRawData = null;
            this.jsonEditorContent = ko.observable();
            this.resultDisplay = ko.observable(0 /* GRAPH */);
            this.enableShowGraph = ko.observable(false);
            this.enableShowGraph.subscribe(function (enable) {
                if (!enable) {
                    _this.showJson();
                }
            });
        } // constructor
        /**
         * Update node property pane from this node id
         * @param id node id
         */
        GraphExplorerViewModel.prototype.updatePropertiesPane = function (id) {
            var _this = this;
            if (!id || !this.originalGraphData.id2NodeMap.hasOwnProperty(id)) {
                this.highlightedNode(null);
                return;
            }
            var data = this.originalGraphData.id2NodeMap[id];
            // A bit of translation to make it easier to display
            var props = {};
            for (var p in data.properties) {
                props[p] = data.properties[p][0].value;
            }
            // update neighbors
            var sources = [];
            var targets = [];
            this.setDefaultGraphConfigValues();
            var nodeCaption = this.graphConfigUiData.nodeCaptionChoice();
            this.updateSelectedNodeNeighbors(data.id, nodeCaption, sources, targets);
            var sData = {
                id: data.id,
                label: data.label,
                properties: props,
                sources: sources,
                targets: targets //<VertexBasicInfo[]>[]
            };
            // Update KO
            this.highlightedNode(sData);
            // Update list of sources and targets
            var possibleVertices = [];
            $.each(this.originalGraphData.vertices, function (index, v) {
                if (v.id === id) {
                    // skip self
                    return;
                }
                possibleVertices.push({
                    value: v.id,
                    caption: D3ForceGraph_1.D3ForceGraph.getNodePropValue(v, nodeCaption)
                });
            });
            this.possibleVertices(possibleVertices);
            // Update caption
            $.each(this.editedSources().currentNeighbors, function (index, s) {
                var v = _this.originalGraphData.id2NodeMap[s.id];
                s.name = v ? D3ForceGraph_1.D3ForceGraph.getNodePropValue(v, nodeCaption) : s.id;
            });
            this.editedSources.valueHasMutated();
            $.each(this.editedTargets().currentNeighbors, function (index, s) {
                var v = _this.originalGraphData.id2NodeMap[s.id];
                s.name = v ? D3ForceGraph_1.D3ForceGraph.getNodePropValue(v, nodeCaption) : s.id;
            });
            this.editedTargets.valueHasMutated();
        };
        /**
         * Retrieve property title based on the graph style preferences
         */
        GraphExplorerViewModel.prototype.getPropertyPaneTitle = function () {
            if (!this.highlightedNode()) {
                return '';
            }
            var nodeCaption = this.graphConfigUiData.nodeCaptionChoice();
            var node = this.originalGraphData.id2NodeMap[this.highlightedNode().id];
            return D3ForceGraph_1.D3ForceGraph.getNodePropValue(node, nodeCaption);
        };
        /**
         * Update graph icon
         * @param nodeProp to map to icon
         * @param iconSet _graph_icon_set field in document
         */
        GraphExplorerViewModel.prototype.updateNodeIcons = function (nodeProp, iconSet) {
            var _this = this;
            if (nodeProp === GraphExplorerViewModel.NONE_CHOICE) {
                this.d3ForceGraph.graphConfig.nodeIconKey(null);
                return;
            }
            if (!iconSet) {
                iconSet = this.collection.id();
            }
            // load icon set and update graph
            var newIconsMap = {};
            this.executeNonPagedDocDbQuery("SELECT c._graph_icon_property_value, c.format, c.icon FROM c WHERE c._graph_icon_set = \"" + iconSet + "\"")
                .then(function (documents) {
                console.log('# icons found', documents.length);
                $.each(documents, function (index, doc) {
                    newIconsMap[doc['_graph_icon_property_value']] = {
                        data: doc['icon'],
                        format: doc['format']
                    };
                });
                // Update graph configuration
                _this.d3ForceGraph.graphConfig.iconsMap(newIconsMap);
                _this.d3ForceGraph.graphConfig.nodeIconKey(nodeProp);
            });
        };
        /**
         * Create a new edge in docdb and update graph
         * @param e
         */
        GraphExplorerViewModel.prototype.createNewEdge = function (e) {
            var _this = this;
            // If nodeCaptionChoice is 'id', user can enter any id, even id of a node that is not loaded in the graph.
            // Otherwise, user must select from list of choices
            var q;
            if (this.graphConfigUiData.nodeCaptionChoice() === 'id') {
                q = "g.V('" + e.inputOutV() + "').addE('" + e.label() + "').To(g.V('" + e.inputInV() + "'))";
            }
            else {
                if (e.selectedOutV() === null || e.selectedInV() === null) {
                    console.error('Either outV or inV not selected', e.selectedOutV(), e.selectedInV());
                    return $.Deferred().promise();
                }
                q = "g.V('" + e.selectedOutV().value + "').addE('" + e.label() + "').To(g.V('" + e.selectedInV().value + "'))";
            }
            // TODO Add error handling
            return this.submitToBackend(q).then(function (data) {
                if (!data) {
                    console.error('No edge added');
                    return;
                }
                // update graph
                var edges = JSON.parse(data);
                if (edges.length < 1) {
                    console.error('No edge in response');
                    return;
                }
                /**
                 * Add inE edge to vertex
                 * @param v
                 * @param edge
                 */
                function addInE(v, edge) {
                    v['inE'] = v['inE'] || {};
                    v['inE'][edge.label] = v['inE'][edge.label] || [];
                    v['inE'][edge.label].push(edge);
                }
                ;
                /**
                 * Add outE edge to vertex
                 * @param v
                 * @param edge
                 */
                function addOutE(v, edge) {
                    v['outE'] = v['outE'] || {};
                    v['outE'][edge.label] = v['outE'][edge.label] || [];
                    v['outE'][edge.label].push(edge);
                }
                var edge = edges[0];
                var graphData = _this.originalGraphData;
                if (graphData.id2NodeMap.hasOwnProperty(edge.inV) && graphData.id2NodeMap.hasOwnProperty(edge.outV)) {
                    // manually add edges to vertex
                    addInE(graphData.id2NodeMap[edge.inV], edge);
                    addOutE(graphData.id2NodeMap[edge.outV], edge);
                    GraphExplorerViewModel.addEdgeToGraph(edge, graphData);
                    _this.updateGraphData(graphData);
                    return;
                }
                if (graphData.id2NodeMap.hasOwnProperty(edge.inV) && !graphData.id2NodeMap.hasOwnProperty(edge.outV)) {
                    // manually add edge to vertex
                    addInE(graphData.id2NodeMap[edge.inV], edge);
                    _this.updateGraphData(graphData);
                    return;
                }
                if (!graphData.id2NodeMap.hasOwnProperty(edge.inV) && graphData.id2NodeMap.hasOwnProperty(edge.outV)) {
                    // manually add edge to vertex
                    addOutE(graphData.id2NodeMap[edge.outV], edge);
                    _this.updateGraphData(graphData);
                    return;
                }
            });
        };
        /**
         * Helper function to remove a string element from an array of strings
         * @param id
         * @param map
         */
        GraphExplorerViewModel.removeFromArray = function (array, elt) {
            if (!array) {
                return;
            }
            var n = array.indexOf(elt);
            if (n > -1) {
                array.splice(n, 1);
            }
        };
        /**
         * Remove edge from graph data: remove from edge list, remove from any vertex edge list
         * Note: labels might end up with empty arrays
         * @param graphData
         * @param edgeId
         */
        GraphExplorerViewModel.removeEdgeFromGraph = function (graphData, edgeId) {
            // Remove from edges array
            for (var i = 0; i < graphData.edges.length; i++) {
                if (graphData.edges[i].id === edgeId) {
                    graphData.edges.splice(i, 1);
                    break;
                }
            }
            // Clean up each vertex
            $.each(graphData.vertices, function (index, v) {
                if (v.hasOwnProperty('inE')) {
                    for (var label in v.inE) {
                        for (var i = 0; i < v.inE[label].length; i++) {
                            var sourceEdge = v.inE[label][i];
                            if (sourceEdge.id === edgeId) {
                                // Remove edge reference from vertex
                                v.inE[label].splice(i, 1);
                                // Update maps
                                GraphExplorerViewModel.removeFromArray(graphData.sourcesMap[v.id], sourceEdge.outV);
                                GraphExplorerViewModel.removeFromArray(graphData.targetsMap[sourceEdge.outV], v.id);
                                break;
                            }
                        }
                    }
                }
                if (v.hasOwnProperty('outE')) {
                    for (var label in v.outE) {
                        for (var i = 0; i < v.outE[label].length; i++) {
                            var targetEdge = v.outE[label][i];
                            if (targetEdge.id === edgeId) {
                                // Remove edge reference from vertex
                                v.outE[label].splice(i, 1);
                                // Update maps
                                GraphExplorerViewModel.removeFromArray(graphData.targetsMap[v.id], targetEdge.outV);
                                GraphExplorerViewModel.removeFromArray(graphData.sourcesMap[targetEdge.outV], v.id);
                                break;
                            }
                        }
                    }
                }
            });
        };
        /**
         * This opposite of createNewEdge.
         * Manually update in-memory graph.
         * @param edgeId
         */
        GraphExplorerViewModel.prototype.removeEdge = function (edgeId) {
            var _this = this;
            return this.submitToBackend("g.E('" + edgeId + "').drop()").then(function () {
                var graphData = _this.originalGraphData;
                GraphExplorerViewModel.removeEdgeFromGraph(graphData, edgeId);
                _this.updateGraphData(graphData);
            });
        };
        /**
         * TODO Implement real validation
         * @param q query
         * @return
         */
        GraphExplorerViewModel.isValidQuery = function (q) {
            return q.lastIndexOf('g.') === 0 && q.charAt(q.length - 1) === ')';
        };
        /**
         * Clone object and keep the original untouched (by d3)
         */
        GraphExplorerViewModel.prototype.updateGraphData = function (graphData) {
            GraphExplorerViewModel.markNeighborlessNodes(graphData);
            this.originalGraphData = graphData;
            var gd = JSON.parse(JSON.stringify(this.originalGraphData));
            this.graphData(gd);
        };
        /**
         * Update neighbors array of this node by id
         * @param id
         * @param sources
         * @param target
         */
        GraphExplorerViewModel.prototype.updateSelectedNodeNeighbors = function (id, nodeCaption, sources, targets) {
            var _this = this;
            // update neighbors
            var gd = this.originalGraphData;
            var sourceIds = gd.sourcesMap[id];
            var v = gd.id2NodeMap[id];
            // Clear the array while keeping the references
            sources.length = 0;
            targets.length = 0;
            var possibleEdgeLabels = {}; // Collect all edge labels in a hashset
            $.each(sourceIds, function (index, id) {
                if (!gd.id2NodeMap.hasOwnProperty(id)) {
                    // If id not known, it must be an edge node whose neighbor hasn't been loaded into the graph, yet
                    return;
                }
                var caption = D3ForceGraph_1.D3ForceGraph.getNodePropValue(gd.id2NodeMap[id], nodeCaption);
                // --------- Find incoming edge id
                // TODO This should be precomputed and stored in sourcesMap and targetsMap.
                var edgeId = null;
                var edgeLabel = null;
                for (var p in v.inE) {
                    possibleEdgeLabels[p] = true;
                    if (!edgeId) {
                        for (var i = 0; i < v.inE[p].length; i++) {
                            if (id === v.inE[p][i].outV) {
                                edgeId = v.inE[p][i].id;
                                edgeLabel = p;
                                break;
                            }
                        }
                    }
                }
                // ------------------------------
                sources.push({ name: caption, id: id, edgeId: edgeId, edgeLabel: edgeLabel });
            });
            var targetIds = gd.targetsMap[id];
            $.each(targetIds, function (index, id) {
                if (!gd.id2NodeMap.hasOwnProperty(id)) {
                    // If id not known, it must be an edge node whose neighbor hasn't been loaded into the graph, yet
                    return;
                }
                var caption = D3ForceGraph_1.D3ForceGraph.getNodePropValue(gd.id2NodeMap[id], nodeCaption);
                // --------- Find incoming edge id
                // TODO This should be precomputed and stored in sourcesMap and targetsMap.
                var edgeId = null;
                var edgeLabel = null;
                for (var p in v.outE) {
                    possibleEdgeLabels[p] = true;
                    if (!edgeId) {
                        for (var i = 0; i < v.outE[p].length; i++) {
                            if (id === v.outE[p][i].inV) {
                                edgeId = v.outE[p][i].id;
                                edgeLabel = p;
                                break;
                            }
                        }
                    }
                }
                // ------------------------------
                targets.push({ name: caption, id: id, edgeId: edgeId, edgeLabel: edgeLabel });
                _this.possibleEdgeLabels(Object.keys(possibleEdgeLabels).map(function (value, index, array) {
                    return { caption: value, value: value };
                }));
            });
        };
        /**
         * Update list of possible root nodes from property key
         */
        GraphExplorerViewModel.prototype.updatePossibleRootNodes = function (key) {
            this.possibleRootNodes($.map(this.rootMap, function (value, index) {
                // TODO a bit awkward to call D3ForceGraph from here, but avoid code duplication
                var result = D3ForceGraph_1.D3ForceGraph.getNodePropValue(value, key);
                return {
                    caption: result ? result : value.id,
                    id: value.id
                };
            }));
        };
        /**
         * Check if these data is an array of vertices
         * @param data
         */
        GraphExplorerViewModel.isVerticesArray = function (data) {
            if (!(data instanceof Array)) {
                console.error('Query result not an array', data);
                return false;
            }
            var vertices = data;
            if (vertices.length > 0) {
                var v0 = vertices[0];
                if (!v0.hasOwnProperty('id') || !v0.hasOwnProperty('type') || v0.type !== 'vertex') {
                    return false;
                }
            }
            return true;
        };
        GraphExplorerViewModel.prototype.pushToLatestQueryFragments = function (q) {
            if (q.length === 0) {
                return;
            }
            var lq = this.latestPartialQueries();
            for (var i = 0; i < lq.length; i++) {
                if (lq[i].value === q) {
                    // no dupes
                    return;
                }
            }
            lq.unshift({ caption: q, value: q });
            lq = lq.slice(0, GraphExplorerViewModel.MAX_LATEST_QUERIES - 1);
            this.latestPartialQueries(lq);
        };
        GraphExplorerViewModel.prototype.onClearFilterClick = function () {
            this.query('');
        };
        /**
         * User executes query
         */
        GraphExplorerViewModel.prototype.submitQuery = function () {
            var _this = this;
            this.graphStatus(3 /* LOADING */);
            // Remember query
            this.pushToLatestQueryFragments(this.query());
            this.submitToBackend(this.query()).then(function (data) {
                var vertices = [];
                _this.graphStatus(1 /* NO_RESULT */);
                if (data === null) {
                    console.error('Query result is null');
                }
                else {
                    // Check if result is an array of vertices
                    var parsedData = JSON.parse(data);
                    if (!GraphExplorerViewModel.isVerticesArray(parsedData)) {
                        console.log('Query result not a valid array of vertices:' + data);
                        _this.enableShowGraph(false);
                    }
                    else {
                        vertices = parsedData;
                        _this.graphStatus(2 /* POPULATED */);
                        _this.enableShowGraph(true);
                    }
                }
                _this.rootMap = {};
                $.each(vertices, function (index, v) {
                    _this.rootMap[v.id] = v;
                });
                _this.updatePossibleRootNodes(_this.graphConfigUiData.nodeCaptionChoice());
                if (vertices.length === 0) {
                    // Clean graph
                    _this.updateGraphData({
                        vertices: vertices,
                        edges: [],
                        targetsMap: {},
                        sourcesMap: {},
                        id2NodeMap: {}
                    });
                    _this.highlightedNode(null);
                    console.info('Query result is empty');
                    return null;
                }
                // Select first node as root
                return vertices[0].id;
            }).then(this.selectRootNode.bind(this));
        };
        /**
         * Selecting a root node means
         * @param node
         */
        GraphExplorerViewModel.prototype.selectRootNode = function (id) {
            var _this = this;
            if (id === null) {
                return;
            }
            // Find the root node
            var root = this.rootMap[id];
            if (!root) {
                console.error('No known possible root for id', id);
                return;
            }
            // For ui purposes
            this.selectedRootId(id);
            // Mark as root so d3 can treat differently
            root[D3ForceGraph_1.D3ForceGraph.IS_ROOT_PROP_KEY] = true;
            this.collectNodeProperties(root);
            var graphData = {
                vertices: [],
                edges: [],
                targetsMap: {},
                sourcesMap: {},
                id2NodeMap: {}
            };
            // Add root node to list
            GraphExplorerViewModel.addNodeToGraph(root, graphData);
            // Load neighbors
            this.loadNeighbors(root, graphData, 0).then(function () {
                _this.updateGraphData(graphData);
            });
        };
        /**
         * Mark all nodes whose neighbors aren't part of the graph
         * @param graphData
         */
        GraphExplorerViewModel.markNeighborlessNodes = function (graphData) {
            $.each(graphData.vertices, function (index, v) {
                if (GraphExplorerViewModel.isMissingNeighbor(v, Object.keys(graphData.id2NodeMap))) {
                    v[D3ForceGraph_1.D3ForceGraph.NO_NEIGHBORS_PROP_KEY] = true;
                }
                else {
                    delete v[D3ForceGraph_1.D3ForceGraph.NO_NEIGHBORS_PROP_KEY];
                }
            });
        };
        /**
         * Check if all neighbors are present in the existing array
         * @param vertex
         * @param existingIds
         * @return false if all neighbors present, true otherwise
         */
        GraphExplorerViewModel.isMissingNeighbor = function (vertex, existingIds) {
            if (vertex.hasOwnProperty('outE')) {
                var outE = vertex.outE;
                for (var label in outE) {
                    for (var i = 0; i < outE[label].length; i++) {
                        var edge = outE[label][i];
                        if (existingIds.indexOf(edge.inV) == -1) {
                            return true;
                        }
                    }
                }
            }
            if (vertex.hasOwnProperty('inE')) {
                var inE = vertex.inE;
                for (var label in inE) {
                    for (var i = 0; i < inE[label].length; i++) {
                        var edge = inE[label][i];
                        if (existingIds.indexOf(edge.outV) == -1) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        /**
         * Update the maps when adding a node.
         * Find neighbors, too
         * @param vertex
         * @param graphData
         */
        GraphExplorerViewModel.addNodeToGraph = function (vertex, graphData) {
            if (Object.keys(graphData.id2NodeMap).indexOf(vertex.id) !== -1) {
                // Make sure vertex is not already in
                return;
            }
            graphData.vertices.push(vertex);
            graphData.id2NodeMap[vertex.id] = vertex;
        };
        /**
         * Update the maps when adding an edge
         * @param edge
         * @param graphData
         */
        GraphExplorerViewModel.addEdgeToGraph = function (edge, graphData) {
            // Check if edge is not already in
            for (var i = 0; i < graphData.edges.length; i++) {
                if (graphData.edges[i].inV === edge.inV &&
                    graphData.edges[i].outV === edge.outV) {
                    return;
                }
            }
            // Add edge only if both ends of the edge are in the graph
            if (graphData.id2NodeMap.hasOwnProperty(edge.inV) && graphData.id2NodeMap.hasOwnProperty(edge.outV)) {
                graphData.edges.push(edge);
            }
            GraphExplorerViewModel.addToMap(graphData.targetsMap, edge.outV, edge.inV);
            GraphExplorerViewModel.addToMap(graphData.sourcesMap, edge.inV, edge.outV);
        };
        /**
         * Collect all edges from this node
         * @param vertex
         * @param graphData
         * @param newNodes (optional) object describing new nodes encountered
         */
        GraphExplorerViewModel.createEdgesfromNode = function (vertex, graphData, newNodes) {
            if (vertex.hasOwnProperty('outE')) {
                var outE = vertex.outE;
                for (var label in outE) {
                    $.each(outE[label], function (index, edge) {
                        // We create our own edge. No need to fetch
                        var e = {
                            id: edge.id,
                            label: label,
                            inV: edge.inV,
                            outV: vertex.id
                        };
                        GraphExplorerViewModel.addEdgeToGraph(e, graphData);
                        if (newNodes) {
                            newNodes[edge.inV] = true;
                        }
                    });
                }
            }
            if (vertex.hasOwnProperty('inE')) {
                var inE = vertex.inE;
                for (var label in inE) {
                    $.each(inE[label], function (index, edge) {
                        // We create our own edge. No need to fetch
                        var e = {
                            id: edge.id,
                            label: label,
                            inV: vertex.id,
                            outV: edge.outV
                        };
                        GraphExplorerViewModel.addEdgeToGraph(e, graphData);
                        if (newNodes) {
                            newNodes[edge.outV] = true;
                        }
                    });
                }
            }
        };
        /**
         * Query neighbors using Gremlin
         *
         * @param vertex Vertex whose neighbors we want to load
         * @param graphData loaded vertices are stored in there
         * @param generation Generation of vertex parameter. This method is recursive, keep track of distance from root node. 0=root node
         * @param return promise: for caller to execute code when fetching is done
         */
        GraphExplorerViewModel.prototype.loadNeighbors = function (vertex, graphData, generation) {
            // TODO docdb query to fetch node properties
            // let q = `SELECT *  FROM Node N  WHERE (IS_DEFINED(N._gremlinVertex) = false AND (N["id"] = '${vertex.id}'))`;
            var idsToFetch = {}; // Id of vertices to load. Hashset.
            GraphExplorerViewModel.createEdgesfromNode(vertex, graphData, idsToFetch);
            var processResult = function (data) {
                var vertices = [];
                if (data === null) {
                    console.error('Query result is null');
                }
                // Check if result is an array of vertices
                var parsedData = JSON.parse(data);
                if (!GraphExplorerViewModel.isVerticesArray(parsedData)) {
                    console.error('Query result not a valid array of vertices:' + data);
                    return;
                }
                vertices = parsedData;
                $.each(vertices, function (index, v) {
                    GraphExplorerViewModel.addNodeToGraph(v, graphData);
                    GraphExplorerViewModel.createEdgesfromNode(v, graphData);
                });
            };
            // Fetch direct neighbors (targets, source)
            return this.submitToBackend("g.V(\"" + vertex.id + "\").both()")
                .then(processResult)
                .then(function () {
                // console.log('Returning graphData', graphData);
                return graphData;
            });
        };
        /**
         * Get node properties for styling purposes
         * Note: We're almost duplicating D3ForceGraph.getNodeProperties() here
         * @param item
         */
        GraphExplorerViewModel.prototype.collectNodeProperties = function (item) {
            var props = [];
            for (var p in item) {
                // DocDB: Exclude type because it's always 'vertex'
                if (p !== 'type' && (typeof (item[p]) === 'string' || typeof item[p] === 'number')) {
                    props.push(p);
                }
            }
            // Inpsect properties
            if (item.hasOwnProperty('properties')) {
                // TODO This is DocDB-graph specific
                // Assume each property value is [{value:... }]
                for (var f in item.properties) {
                    props.push(f);
                }
            }
            this.graphConfigUiData.nodeProperties(props);
            this.graphConfigUiData.nodePropertiesWithNone([GraphExplorerViewModel.NONE_CHOICE].concat(props));
        };
        /**
         * Add a new value to the key-values map
         * key <--> [ value1, value2, ... ]
         * @param kvmap
         * @param key
         * @param value
         */
        GraphExplorerViewModel.addToMap = function (kvmap, key, value) {
            var values = [];
            if (kvmap.hasOwnProperty(key)) {
                values = kvmap[key];
            }
            else {
                kvmap[key] = values;
            }
            if (values.indexOf(value) === -1) {
                values.push(value);
            }
        };
        /**
         * Submit graph query to Gremlin backend
         * @param cmd
         */
        GraphExplorerViewModel.prototype.submitToBackend = function (cmd) {
            var _this = this;
            var executeCounter = this.executeCounter;
            console.log('submit:', cmd);
            executeCounter(executeCounter() + 1);
            return $.ajax(this.graphBackendEndpoint, {
                type: 'POST',
                data: {
                    'resourceId': this.resourceId,
                    'endpoint': this.endpoint,
                    'databaseId': this.databaseId,
                    'collectionId': this.collection.id(),
                    'query': cmd,
                    'masterKey': this.masterKey
                },
                beforeSend: function (xhr) {
                    var authorization = DocumentDB.RequestHandler._authorizationToken && DocumentDB.RequestHandler._authorizationToken() || "";
                    xhr.setRequestHeader("authorization", authorization);
                    return true;
                },
                cache: false
            }).then(function (data) {
                // console.log(data);
                executeCounter(executeCounter() - 1);
                _this.queryRawData = data;
                if (_this.isShowJson()) {
                    _this.jsonEditorContent(_this.queryRawData);
                }
                return data;
            }, function (err) {
                executeCounter(executeCounter() - 1);
                console.error(err);
            });
        };
        /**
         * Called from ko binding
         * @param id
         */
        GraphExplorerViewModel.prototype.selectNode = function (id) {
            this.d3ForceGraph.idToSelect(id);
        };
        /**
         * Make sure graph config values are not null
         */
        GraphExplorerViewModel.prototype.setDefaultGraphConfigValues = function () {
            // Assign default values if null
            if (this.graphConfigUiData.nodeCaptionChoice() === null && this.graphConfigUiData.nodeProperties().length > 1) {
                this.graphConfigUiData.nodeCaptionChoice(this.graphConfigUiData.nodeProperties()[0]);
            }
            if (this.graphConfigUiData.nodeColorKeyChoice() === null && this.graphConfigUiData.nodePropertiesWithNone().length > 1) {
                this.graphConfigUiData.nodeColorKeyChoice(this.graphConfigUiData.nodePropertiesWithNone()[0]);
            }
            if (this.graphConfigUiData.nodeIconChoice() === null && this.graphConfigUiData.nodePropertiesWithNone().length > 1) {
                this.graphConfigUiData.nodeIconChoice(this.graphConfigUiData.nodePropertiesWithNone()[0]);
            }
        };
        GraphExplorerViewModel.prototype.openStyling = function () {
            this.setDefaultGraphConfigValues();
            // Update the styling pane with this instance
            this.stylingPane.setData(this.graphConfigUiData);
            this.stylingPane.open();
        };
        /**
         * Right-pane expand collapse
         */
        GraphExplorerViewModel.prototype.expandCollapseProperties = function () {
            // Do not collapse while editing
            if (this.rightPaneContent() === 1 /* PROPERTY_EDITOR */ && this.isPropertiesExpanded()) {
                return;
            }
            this.isPropertiesExpanded(!this.isPropertiesExpanded());
            if (this.isPropertiesExpanded()) {
                $("#propertiesContent").slideDown("fast", function () { });
            }
            else {
                $("#propertiesContent").slideUp("fast", function () { });
            }
        };
        GraphExplorerViewModel.prototype.expandCollapseSources = function () {
            // Do not collapse while editing
            if (this.rightPaneContent() === 3 /* EDIT_SOURCES */ && this.isSourcesExpanded()) {
                return;
            }
            this.isSourcesExpanded(!this.isSourcesExpanded());
            if (this.isSourcesExpanded()) {
                $("#sourcesContent").slideDown("fast", function () { });
            }
            else {
                $("#sourcesContent").slideUp("fast", function () { });
            }
        };
        GraphExplorerViewModel.prototype.expandCollapseTargets = function () {
            // Do not collapse while editing
            if (this.rightPaneContent() === 4 /* EDIT_TARGETS */ && this.isTargetsExpanded()) {
                return;
            }
            this.isTargetsExpanded(!this.isTargetsExpanded());
            if (this.isTargetsExpanded()) {
                $("#targetsContent").slideDown("fast", function () { });
            }
            else {
                $("#targetsContent").slideUp("fast", function () { });
            }
        };
        /**
         * Get type option. Limit to string, number or boolean
         * @param value
         */
        GraphExplorerViewModel.getTypeOption = function (value) {
            var type = typeof value;
            switch (type) {
                case 'number':
                case 'boolean':
                    return type;
                default:
                    return 'string';
            }
        };
        /* ****** Property editor *************** */
        GraphExplorerViewModel.prototype.showPropertyEditor = function () {
            this.rightPaneContent(1 /* PROPERTY_EDITOR */);
            // deep copy highlighted node
            var existingProps = [];
            if (this.highlightedNode().hasOwnProperty('properties')) {
                var hProps = this.highlightedNode()['properties'];
                for (var p in hProps) {
                    var value = hProps[p];
                    existingProps.push({
                        key: p,
                        value: value,
                        type: GraphExplorerViewModel.getTypeOption(value)
                    });
                }
            }
            this.editedProperties({
                id: this.highlightedNode().id,
                existingProperties: existingProps,
                addedProperties: [],
                droppedKeys: []
            });
        };
        GraphExplorerViewModel.prototype.addProperty = function () {
            var ap = this.editedProperties().addedProperties;
            var n = ap.length;
            ap.push({ key: '', value: '', type: GraphExplorerViewModel.DEFAULT_PROPERTY_TYPE });
            this.editedProperties.valueHasMutated();
        };
        GraphExplorerViewModel.prototype.removeAddedProperty = function (index) {
            var ap = this.editedProperties().addedProperties;
            ap.splice(index, 1);
            this.editedProperties.valueHasMutated();
        };
        GraphExplorerViewModel.prototype.removeExistingProperty = function (key) {
            // search for it
            for (var i = 0; i < this.editedProperties().existingProperties.length; i++) {
                var ip = this.editedProperties().existingProperties[i];
                if (ip.key === key) {
                    this.editedProperties().existingProperties.splice(i, 1);
                    this.editedProperties().droppedKeys.push(key);
                    break;
                }
            }
            this.editedProperties.valueHasMutated();
        };
        GraphExplorerViewModel.prototype.discardPropertyChanges = function () {
            this.rightPaneContent(0 /* READONLY_PROP */);
        };
        /**
         * Surround with double-quotes if val is a string.
         * @param val
         */
        GraphExplorerViewModel.getQuotedPropValue = function (ip) {
            switch (ip.type) {
                case 'number':
                case 'boolean':
                    return "" + ip.value;
                default:
                    return "\"" + ip.value + "\"";
            }
        };
        /**
         * Update in-memory graph
         * @param data from submitToBackend()
         */
        GraphExplorerViewModel.prototype.udpateInMemoryGraph = function (data) {
            if (!data) {
                console.error('No data', data);
                return;
            }
            var vertices = JSON.parse(data);
            if (vertices.length < 1) {
                console.error('No vertex in response');
                return;
            }
            var updatedVertex = vertices[0];
            if (this.originalGraphData.id2NodeMap.hasOwnProperty(updatedVertex.id)) {
                var currentVertex = this.originalGraphData.id2NodeMap[updatedVertex.id];
                // Copy updated properties
                for (var p in updatedVertex) {
                    currentVertex[p] = updatedVertex[p];
                }
            }
            // TODO This kind of assumes saveVertexProperty is done from property panes.
            var hn = this.highlightedNode();
            if (hn && hn.id === updatedVertex.id) {
                this.updatePropertiesPane(hn.id);
            }
        };
        GraphExplorerViewModel.prototype.updateVertexProperties = function () {
            var _this = this;
            // aggregate all the properties, remove dropped ones
            var finalProperties = this.editedProperties().existingProperties.concat(this.editedProperties().addedProperties);
            // Compose the query
            var id = this.editedProperties().id;
            var q = "g.V(\"" + id + "\")";
            // Only save the properties
            if (finalProperties.length === 0) {
                // TODO Error handling here
                console.log('No properties to save');
                return;
            }
            // for (let p in finalProperties) {
            $.each(finalProperties, function (index, p) {
                q += ".Property(\"" + p.key + "\", " + GraphExplorerViewModel.getQuotedPropValue(p) + ")";
            });
            var promise = null;
            // Compute dropped keys
            var droppedKeys = this.editedProperties().droppedKeys;
            if (droppedKeys.length > 0) {
                // TODO Wait for dropping to end. Can we drop all of them in a single query?
                // Must execute these drops sequentially to avoid a 500 "{"Message":"An error has occurred."}"
                promise = this.submitToBackend("g.V(\"" + id + "\").properties(\"" + droppedKeys[0] + "\").drop()");
                var _loop_1 = function (i) {
                    promise = promise.then(function () {
                        return _this.submitToBackend("g.V(\"" + id + "\").properties(\"" + droppedKeys[i] + "\").drop()");
                    });
                };
                for (var i = 1; i < droppedKeys.length; i++) {
                    _loop_1(i);
                }
            }
            // Now when drops are done, update remaining properties
            if (finalProperties.length > 0) {
                if (promise === null) {
                    promise = this.submitToBackend(q);
                }
                else {
                    promise = promise.then(function () {
                        return _this.submitToBackend(q);
                    });
                }
            }
            // Update in-memory graph and close editor
            if (promise === null) {
                this.hidePropertyEditor();
            }
            else {
                promise.then(function (data) {
                    _this.udpateInMemoryGraph(data);
                }).then(function () {
                    _this.hidePropertyEditor();
                });
            }
        };
        GraphExplorerViewModel.prototype.hidePropertyEditor = function () {
            this.rightPaneContent(0 /* READONLY_PROP */);
        };
        /* ****** New vertex editor *************** */
        GraphExplorerViewModel.prototype.showNewVertexEditor = function () {
            this.newVertexPane.open();
        };
        /**
        * Create a new vertex in the graph
        * TODO: take the update newVertexPane code out
        * @param v
        */
        GraphExplorerViewModel.prototype.addVertex = function (v) {
            var _this = this;
            if (!v) {
                return;
            }
            var q = "g.AddV('" + v.label + "')";
            $.each(v.properties, function (index, item) {
                q += ".Property('" + item.key + "', '" + item.value + "')";
            });
            this.submitToBackend(q).then(function (data) {
                if (!data) {
                    console.error('No data', data);
                    return;
                }
                var vertices = JSON.parse(data);
                if (vertices.length < 1) {
                    var err = 'No vertex in response';
                    console.error(err);
                    _this.newVertexPane.formErrors(err);
                    return;
                }
                var vertex = vertices[0];
                var graphData = _this.originalGraphData;
                GraphExplorerViewModel.addNodeToGraph(vertex, graphData);
                _this.updateGraphData(graphData);
                // Keep new vertex selected
                _this.updatePropertiesPane(vertex.id);
                // Once successful, reset new vertex and close pane
                _this.newVertexPane.cancel();
            }, function () {
                var err = 'Error creating new vertex';
                console.error(err);
                _this.newVertexPane.formErrors(err);
            });
        };
        /**
         * Execute DocDB query and get all results
         */
        GraphExplorerViewModel.prototype.executeNonPagedDocDbQuery = function (query) {
            var _this = this;
            return this.documentClientUtility.queryDocuments(this.collection, query, null /*options*/)
                .then(function (iterator) {
                var deferred = Q.defer();
                _this.documentClientUtility.nextIteratorItem(iterator, GraphExplorerViewModel.PAGE_ALL, [], deferred);
                return deferred.promise;
            });
        };
        /**
         * Remove node from in vertex list, lookup maps, and edge list
         * @param id
         * @param graphData
         */
        GraphExplorerViewModel.removeNodeFromGraph = function (id, graphData) {
            if (!graphData.id2NodeMap.hasOwnProperty(id)) {
                console.error('No vertex to delete found with id', id);
                return;
            }
            // Find all edges that touches this vertex and remove them
            var edgeIds = [];
            $.each(graphData.edges, function (index, edge) {
                if (edge.inV === id || edge.outV === id) {
                    edgeIds.push(edge.id);
                }
            });
            $.each(edgeIds, function (index, id) {
                GraphExplorerViewModel.removeEdgeFromGraph(graphData, id);
            });
            /**
             * Remove id from map
             * Note: map may end up with empty arrays
             * @param map
             * @param id2remove
             */
            var removeFromMap = function (map, id2remove) {
                // First remove entry if it exists
                if (map.hasOwnProperty(id2remove)) {
                    delete map[id2remove];
                }
                // Then remove element if it's in any array
                $.each(Object.values(map), function (index, idArray) {
                    var n = idArray.indexOf(id2remove);
                    if (n !== -1) {
                        idArray.splice(n, 1);
                    }
                });
            };
            removeFromMap(graphData.sourcesMap, id);
            removeFromMap(graphData.targetsMap, id);
            // Delete from vertex list
            var v = graphData.id2NodeMap[id];
            var n = graphData.vertices.indexOf(v);
            graphData.vertices.splice(n, 1);
            // Delete from the map
            delete graphData.id2NodeMap[id];
        };
        /**
         * TODO: better error handling
         */
        GraphExplorerViewModel.prototype.deleteHighlightedNode = function () {
            var _this = this;
            this.isDeleteConfirm(false);
            if (!this.highlightedNode()) {
                console.error('No highlighted node to delete');
                return;
            }
            this.submitToBackend("g.V(\"" + this.highlightedNode().id + "\").drop()").then(function (data) {
                var id = _this.highlightedNode().id;
                // Remove vertex from local cache
                var graphData = _this.originalGraphData;
                GraphExplorerViewModel.removeNodeFromGraph(id, graphData);
                _this.updateGraphData(graphData);
                _this.highlightedNode(null);
                // Remove from Result's list
                var prn = _this.possibleRootNodes();
                for (var i = 0; i < prn.length; i++) {
                    if (prn[i].id === id) {
                        prn.splice(i, 1);
                        _this.possibleRootNodes.valueHasMutated();
                        break;
                    }
                }
            });
        };
        /* ********* Edit sources ***************** */
        GraphExplorerViewModel.prototype.showSourcesEditor = function () {
            this.rightPaneContent(3 /* EDIT_SOURCES */);
            var hn = this.highlightedNode();
            this.editedSources({
                vertexId: hn.id,
                currentNeighbors: hn.sources.slice(),
                droppedIds: [],
                addedEdges: []
            });
            // Show empty text boxes by default if no sources for convenience
            if (this.editedSources().currentNeighbors.length === 0) {
                this.addNewEdgeToSource(this.editedSources().vertexId);
            }
        };
        GraphExplorerViewModel.prototype.updateVertexSources = function () {
            var _this = this;
            this.editGraphEdges(this.editedSources()).then(function () {
                _this.rightPaneContent(0 /* READONLY_PROP */);
            });
        };
        GraphExplorerViewModel.prototype.removeCurrentSourceEdge = function (index) {
            var sources = this.editedSources().currentNeighbors;
            var id = sources[index].edgeId;
            sources.splice(index, 1);
            var droppedIds = this.editedSources().droppedIds;
            droppedIds.push(id);
            this.editedSources.valueHasMutated();
        };
        GraphExplorerViewModel.prototype.removeAddedEdgeToSource = function (index) {
            this.editedSources().addedEdges.splice(index, 1);
            this.editedSources.valueHasMutated();
        };
        GraphExplorerViewModel.prototype.addNewEdgeToSource = function (inV) {
            this.editedSources().addedEdges.push({
                inputInV: ko.observable(inV),
                selectedInV: ko.observable({ caption: inV, value: inV }),
                inputOutV: ko.observable(null),
                selectedOutV: ko.observable(null),
                label: ko.observable(null)
            });
            this.editedSources.valueHasMutated();
        };
        /* ********* Edit targets ***************** */
        GraphExplorerViewModel.prototype.showTargetsEditor = function () {
            this.rightPaneContent(4 /* EDIT_TARGETS */);
            var hn = this.highlightedNode();
            this.editedTargets({
                vertexId: hn.id,
                currentNeighbors: hn.targets.slice(),
                droppedIds: [],
                addedEdges: []
            });
            // Show empty text boxes by default if no targets for convenience
            if (this.editedTargets().currentNeighbors.length === 0) {
                this.addNewEdgeToTarget(this.editedTargets().vertexId);
            }
        };
        GraphExplorerViewModel.prototype.updateVertexTargets = function () {
            var _this = this;
            this.editGraphEdges(this.editedTargets()).then(function () {
                // Update in-memory highlighted vertex
                _this.highlightedNode().targets = _this.editedTargets().currentNeighbors.slice();
                _this.rightPaneContent(0 /* READONLY_PROP */);
            });
        };
        GraphExplorerViewModel.prototype.removeCurrentTargetEdge = function (index) {
            var sources = this.editedTargets().currentNeighbors;
            var id = sources[index].edgeId;
            sources.splice(index, 1);
            var droppedIds = this.editedTargets().droppedIds;
            droppedIds.push(id);
            this.editedTargets.valueHasMutated();
        };
        GraphExplorerViewModel.prototype.removeAddedEdgeToTarget = function (index) {
            this.editedTargets().addedEdges.splice(index, 1);
            this.editedTargets.valueHasMutated();
        };
        GraphExplorerViewModel.prototype.addNewEdgeToTarget = function (outV) {
            this.editedTargets().addedEdges.push({
                inputInV: ko.observable(null),
                selectedInV: ko.observable(null),
                inputOutV: ko.observable(outV),
                selectedOutV: ko.observable({ caption: outV, value: outV }),
                label: ko.observable(null)
            });
            this.editedTargets.valueHasMutated();
        };
        /**
         * Perform gremlin commands to drop and add edges
         * @param droppedIds
         * @param addedEdges
         * @return promise when done
         */
        GraphExplorerViewModel.prototype.editGraphEdges = function (editedEdges) {
            var _this = this;
            var promises = [];
            // Drop edges
            for (var i = 0; i < editedEdges.droppedIds.length; i++) {
                var id = editedEdges.droppedIds[i];
                promises.push(this.removeEdge(id));
            }
            // Add edges
            for (var i = 0; i < editedEdges.addedEdges.length; i++) {
                var e = editedEdges.addedEdges[i];
                promises.push(this.createNewEdge(e));
            }
            return $.when.apply($, promises).then(function () {
                _this.updatePropertiesPane(_this.highlightedNode().id);
            });
        };
        /**
         * User hits enter on input
         * @param inputValue
         * @param selection
         */
        GraphExplorerViewModel.prototype.onInputTypeaheadSubmit = function (inputValue, selection) {
            if (!this.isValidQuery()) {
                return;
            }
            this.submitQuery();
        };
        GraphExplorerViewModel.prototype.toggleExpandGraph = function () {
            this.isTabsContentExpanded(!this.isTabsContentExpanded());
        };
        /* ************ Result display ************* */
        GraphExplorerViewModel.prototype.showGraph = function () {
            this.resultDisplay(0 /* GRAPH */);
        };
        GraphExplorerViewModel.prototype.showJson = function () {
            this.resultDisplay(1 /* JSON */);
            this.jsonEditorContent(this.queryRawData);
        };
        GraphExplorerViewModel.prototype.isShowGraph = function () {
            return this.resultDisplay() === 0 /* GRAPH */;
        };
        GraphExplorerViewModel.prototype.isShowJson = function () {
            return this.resultDisplay() === 1 /* JSON */;
        };
        return GraphExplorerViewModel;
    }());
    // Constants
    GraphExplorerViewModel.MAX_NODES = 200; // maximum number of nodes we show
    GraphExplorerViewModel.MAX_LOAD_GENERATION = 1; // load nodes up to this generation from root node (e.g. 2 = grandchidren)
    GraphExplorerViewModel.DEFAULT_QUERY = 'g.V()';
    GraphExplorerViewModel.MAX_LATEST_QUERIES = 10;
    GraphExplorerViewModel.PAGE_ALL = 1000;
    GraphExplorerViewModel.NONE_CHOICE = 'None';
    GraphExplorerViewModel.DEFAULT_PROPERTY_TYPE = 'string';
});
