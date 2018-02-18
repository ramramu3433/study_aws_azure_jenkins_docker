define(["require", "exports", "knockout", "d3"], function (require, exports, ko, d3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** This is the custom Knockout handler for the d3 graph */
    var D3ForceGraph = (function () {
        function D3ForceGraph(graphData) {
            this.graphData = graphData;
            this.highlightedNode = ko.observable(null);
            this.idToSelect = ko.observable(null);
            this.errorMsgs = ko.observableArray([]);
            this.nodeToLoadNeighbors = ko.observable(null);
            // Default graph configuration
            this.graphConfig = {
                nodeColor: ko.observable(D3ForceGraph.NODE_COLOR),
                nodeColorKey: ko.observable(null),
                linkColor: ko.observable(D3ForceGraph.LINK_COLOR),
                showNeighborType: ko.observable(1 /* TARGETS_ONLY */),
                nodeCaption: ko.observable(null),
                nodeSize: ko.observable(D3ForceGraph.NODE_SIZE),
                linkWidth: ko.observable(D3ForceGraph.LINK_WIDTH),
                nodeIconKey: ko.observable(null),
                iconsMap: ko.observable({})
            };
            this.width = D3ForceGraph.GRAPH_WIDTH_PX;
            this.height = D3ForceGraph.GRAPH_HEIGHT_PX;
            this.rootVertex = null;
        }
        D3ForceGraph.prototype.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            //init logic
            //   console.log('d3forcegraph:init', element);
            this.initializeGraph(element);
        };
        ;
        D3ForceGraph.prototype.update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            //update logic
            //    console.log('d3forcegraph:update', ko.utils.unwrapObservable(valueAccessor().graphData));
        };
        /**
         * Construct the graph
         * @param graphData
         */
        D3ForceGraph.prototype.initializeGraph = function (element) {
            var _this = this;
            this.svg = d3.select(element) //d3.select("#maingraph")
                .attr("viewBox", "0 0 " + this.width + " " + this.height)
                .attr("preserveAspectRatio", "none");
            this.svg.append("rect")
                .attr("width", this.width)
                .attr("height", this.height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .call(d3.zoom()
                .scaleExtent([1 / 2, 4])
                .on("zoom", this.zoomed.bind(this)));
            // Arrow
            this.svg.select('defs').selectAll('marker')
                .data(['end'])
                .enter()
                .append('marker')
                .attr('id', 'triangle')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', /* 10 */ D3ForceGraph.MARKER_REFX) // Shift arrow so that we can see it.
                .attr('refY', 0)
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('orient', 'auto')
                .attr('markerUnits', 'userSpaceOnUse') // No auto-scaling with stroke width
                .attr('fill', this.graphConfig.linkColor()).attr('stroke', this.graphConfig.linkColor())
                .append('path')
                .attr('d', 'M0,-5L10,0L0,5');
            // document.getElementById('maingraph').addEventListener('click', (e) => {
            element.addEventListener('click', function (e) {
                if (!D3ForceGraph.closest(e.target, function (el) {
                    return !!el && el !== document && el.classList.contains('node');
                })) {
                    _this.deselectNode();
                }
            });
            this.g = this.svg.append("g");
            // Reset state variables
            this.highlightedNode(null);
            this.selectedNode = null;
            this.isDragging = false;
            // Watch for changes
            this.graphData.subscribe(function (newVal) {
                // console.log('Graphdata has changed', newVal);
                if (!newVal) {
                    return;
                }
                // d3 expects source and target properties for each link (edge)
                $.each(newVal.edges, function (i, e) {
                    e.target = e.inV;
                    e.source = e.outV;
                });
                _this.createSimulation(newVal);
            });
            this.idToSelect.subscribe(function (newVal) {
                if (!newVal) {
                    _this.deselectNode();
                    return;
                }
                var self = _this;
                // Select this node id
                d3.selectAll('.node').filter(function (d, i) { return d.id === newVal; }).each(function (d) {
                    self.onNodeClicked(this, d);
                });
            });
            // Redraw if any of these configs change
            this.graphConfig.nodeColor.subscribe(this.redrawGraph.bind(this));
            this.graphConfig.nodeColorKey.subscribe(function (key) {
                // Compute colormap
                _this.uniqueValues = [];
                for (var i = 0; i < _this.graphData().vertices.length; i++) {
                    var vertex = _this.graphData().vertices[i];
                    var props = D3ForceGraph.getNodeProperties(vertex);
                    if (props.indexOf(key) === -1) {
                        // Vertex doesn't have the property
                        continue;
                    }
                    var val = D3ForceGraph.getNodePropValue(vertex, key);
                    if (typeof val !== 'string' && typeof val !== 'number') {
                        // Not a type we can map
                        continue;
                    }
                    // Map this value if new
                    if (_this.uniqueValues.indexOf(val) === -1) {
                        _this.uniqueValues.push(val);
                    }
                    if (_this.uniqueValues.length === D3ForceGraph.MAX_COLOR_NB) {
                        _this.errorMsgs.push("Number of unique values for property " + key + " exceeds maximum (" + D3ForceGraph.MAX_COLOR_NB + ")");
                        // ignore rest of values
                        break;
                    }
                }
                _this.redrawGraph();
            });
            this.graphConfig.linkColor.subscribe(this.redrawGraph.bind(this));
            this.graphConfig.showNeighborType.subscribe(this.redrawGraph.bind(this));
            this.graphConfig.nodeCaption.subscribe(this.redrawGraph.bind(this));
            this.graphConfig.nodeSize.subscribe(this.redrawGraph.bind(this));
            this.graphConfig.linkWidth.subscribe(this.redrawGraph.bind(this));
            this.graphConfig.nodeIconKey.subscribe(this.redrawGraph.bind(this));
        }; // initialize
        /**
         * Retrieve all node properties
         * NOTE: This is DocDB specific. We expect to have 'id' and 'label' and a bunch of 'properties'
         * @param node
         */
        D3ForceGraph.getNodeProperties = function (node) {
            var props = ['id', 'label'];
            if (node.hasOwnProperty('properties')) {
                props = props.concat(Object.keys(node.properties));
            }
            return props;
        };
        /**
         * Retrieve node's property value
         * @param node
         * @param prop
         */
        D3ForceGraph.getNodePropValue = function (node, prop) {
            if (node.hasOwnProperty(prop)) {
                return node[prop];
            }
            // This is DocDB specific
            if (node.hasOwnProperty('properties') && node.properties.hasOwnProperty(prop)) {
                return node.properties[prop][0]['value'];
            }
            return undefined;
        };
        // Click on non-nodes deselects
        D3ForceGraph.closest = function (el, predicate) {
            do
                if (predicate(el))
                    return el;
            while (el = el && el.parentNode);
        };
        D3ForceGraph.prototype.zoomed = function () {
            this.g.attr("transform", d3.event.transform);
        };
        D3ForceGraph.prototype.instantiateSimulation = function () {
            this.simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(D3ForceGraph.LINK_DISTANCE))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                .force("collide", d3.forceCollide(D3ForceGraph.FORCE_COLLIDE));
        };
        ;
        D3ForceGraph.prototype.createSimulation = function (graph) {
            var _this = this;
            if (!graph) {
                return;
            }
            // Look for root node and make it fixed position in the center
            for (var i = 0; i < graph.vertices.length; i++) {
                var v = graph.vertices[i];
                if (v[D3ForceGraph.IS_ROOT_PROP_KEY]) {
                    v.fx = this.width / 2;
                    v.fy = this.height / 2;
                    this.rootVertex = v;
                    break;
                }
            }
            // By default set root as highlighted
            this.setRootAsHighlighted();
            // Clear selection
            this.selectedNode = null;
            // Cleanup first
            this.g.selectAll('.nodes').remove();
            this.g.selectAll('.links').remove();
            this.g.selectAll('.edgepaths').remove();
            this.g.selectAll('.edgelabels').remove();
            this.instantiateSimulation();
            var nodes = graph.vertices, nodeById = d3.map(nodes, function (d) { return d.id; }), links = graph.edges, bilinks = [];
            links.forEach(function (link) {
                var s = link.source = nodeById.get(link.source), t = link.target = nodeById.get(link.target), i = {}; // intermediate node
                nodes.push(i);
                links.push({ source: s, target: i }, { source: i, target: t });
                bilinks.push([s, i, t]);
            });
            var link = this.g.append("g")
                .attr("class", "links")
                .selectAll(".link")
                .data(bilinks)
                .enter().append("path")
                .attr('class', 'link')
                .attr('fill', 'none')
                .attr('stroke-width', this.graphConfig.linkWidth())
                .attr('stroke', this.graphConfig.linkColor())
                .attr('marker-end', 'url(#triangle)');
            var self = this;
            var node = this.g.append("g")
                .attr("class", "nodes")
                .selectAll(".node")
                .data(nodes.filter(function (d) { return d.id; }))
                .enter()
                .append('g')
                .attr('class', function (d) { return d.isRoot ? 'node root' : 'node'; })
                .call(d3.drag()
                .on("start", function (d) { return _this.dragstarted(d); })
                .on("drag", function (d) { return _this.dragged(d); })
                .on("end", function (d) { return _this.dragended(d); }))
                .on('mouseover', function (d) {
                if (_this.selectedNode || _this.isDragging) {
                    return;
                }
                _this.highlightNode(_this, d);
                _this.simulation.stop();
            })
                .on('mouseout', function (d) {
                if (_this.selectedNode || _this.isDragging) {
                    return;
                }
                _this.unhighlightNode();
                _this.simulation.restart();
            });
            node.append("circle")
                .attr('r', this.graphConfig.nodeSize())
                .attr("fill", this.getNodeColor.bind(this))
                .attr('class', 'main');
            var iconGroup = node.append('g').on('dblclick', function (d) {
                // this is the <g> element
                self.onNodeClicked(this.parentNode, d);
            })
                .on('click', function (d) {
                // this is the <g> element
                self.onNodeClicked(this.parentNode, d);
            });
            var nodeSize = this.graphConfig.nodeSize();
            var bgsize = nodeSize + 1;
            iconGroup.append('rect')
                .attr('x', -bgsize)
                .attr('y', -bgsize)
                .attr('width', bgsize * 2)
                .attr('height', bgsize * 2)
                .attr('fill-opacity', function (d) { return _this.graphConfig.nodeIconKey() ? 1 : 0; })
                .attr('class', 'icon-background');
            // Possible icon: if xlink:href is undefined, the image won't show
            iconGroup.append("svg:image")
                .attr("xlink:href", function (d) {
                return D3ForceGraph.computeImageData(d, _this.graphConfig);
            })
                .attr("x", -nodeSize)
                .attr("y", -nodeSize)
                .attr("height", nodeSize * 2)
                .attr("width", nodeSize * 2)
                .attr('class', 'icon');
            node.append('text')
                .attr('class', 'caption')
                .attr('dx', D3ForceGraph.TEXT_DX)
                .attr('dy', '.35em')
                .text(function (d) { return _this.retrieveNodeCaption(d); });
            // Visual element for nodes whose neighbors must be loaded
            var loadNeighborButton = node.filter(function (d) { return d[D3ForceGraph.NO_NEIGHBORS_PROP_KEY]; })
                .append('g')
                .attr('class', 'loadmore');
            // Arrow
            loadNeighborButton.append('use')
                .attr('xlink:href', '#loadMoreIcon')
                .attr("x", -15)
                .attr("y", nodeSize)
                .on('click', function (d) {
                self.loadNeighbors(d.id);
            })
                .on('dblclick', function (d) {
                self.loadNeighbors(d.id);
            });
            // Don't color icons indivually, just the definitions
            this.svg.selectAll('#loadMoreIcon ellipse').attr('fill', this.graphConfig.nodeColor());
            this.simulation
                .nodes(graph.vertices)
                .on("tick", ticked);
            this.simulation.force("link")
                .links(graph.edges);
            this.simulation.restart();
            function ticked() {
                link.attr("d", function (d) { return self.positionLink(d); });
                node.attr("transform", function (d) { return self.positionNode(d); });
            }
        }; // createSimulation
        /**
         * Load neighbors of this node
         */
        D3ForceGraph.prototype.loadNeighbors = function (id) {
            this.nodeToLoadNeighbors(id);
        };
        /**
         * If not mapped, return max Color
         * @param key
         */
        D3ForceGraph.prototype.lookupColorFromKey = function (key) {
            var index = this.uniqueValues.indexOf(key);
            if (index < 0 || index >= D3ForceGraph.MAX_COLOR_NB) {
                index = D3ForceGraph.MAX_COLOR_NB - 1;
            }
            return D3ForceGraph.COLOR_SCHEME_20(index.toString());
        };
        /**
         * Get node color
         * If nodeColorKey is defined, lookup the node color from uniqueStrings.
         * Otherwise use nodeColor.
         * @param d
         */
        D3ForceGraph.prototype.getNodeColor = function (d) {
            if (this.graphConfig.nodeColorKey()) {
                var val = D3ForceGraph.getNodePropValue(d, this.graphConfig.nodeColorKey());
                return this.lookupColorFromKey(val);
            }
            else {
                return this.graphConfig.nodeColor();
            }
        };
        D3ForceGraph.prototype.dragstarted = function (d) {
            this.isDragging = true;
            if (!d3.event.active)
                this.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        };
        D3ForceGraph.prototype.dragged = function (d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        };
        D3ForceGraph.prototype.dragended = function (d) {
            this.isDragging = false;
            if (!d3.event.active)
                this.simulation.alphaTarget(0);
            if (!d.isRoot) {
                d.fx = null;
                d.fy = null;
            }
            else {
                // Move center back to root
                this.simulation.force("center", d3.forceCenter(d.fx, d.fy));
            }
        };
        D3ForceGraph.prototype.highlightNode = function (g, d) {
            this.fadeNonNeighbors(d.id);
            this.highlightedNode({ g: g, id: d.id });
        };
        D3ForceGraph.prototype.unhighlightNode = function () {
            this.g.selectAll('.node').classed('inactive', false);
            this.g.selectAll('.link').classed('inactive', false);
            this.highlightedNode(null);
            this.setRootAsHighlighted();
        };
        /**
         * Set the root node as highlighted, but don't fade neighbors.
         * We use this to show the root properties
         */
        D3ForceGraph.prototype.setRootAsHighlighted = function () {
            if (!this.rootVertex) {
                return;
            }
            this.highlightedNode({ g: null, id: this.rootVertex.id });
        };
        D3ForceGraph.prototype.fadeNonNeighbors = function (nodeId) {
            var _this = this;
            this.g.selectAll('.node').classed('inactive', function (d) {
                var neighbors = (function (showNeighborType) {
                    switch (showNeighborType) {
                        case 0 /* SOURCES_ONLY */: return _this.graphData().sourcesMap[nodeId];
                        case 1 /* TARGETS_ONLY */: return _this.graphData().targetsMap[nodeId];
                        default:
                        case 2 /* BOTH */: return (_this.graphData().sourcesMap[nodeId] || []).concat(_this.graphData().targetsMap[nodeId]);
                    }
                })(_this.graphConfig.showNeighborType());
                return (!neighbors || neighbors.indexOf(d.id) === -1) && d.id !== nodeId;
            });
            this.g.selectAll('.link')
                .classed('inactive', function (d) {
                switch (_this.graphConfig.showNeighborType()) {
                    case 0 /* SOURCES_ONLY */: return d[2].id !== nodeId;
                    case 1 /* TARGETS_ONLY */: return d[0].id !== nodeId;
                    default:
                    case 2 /* BOTH */: return d[2].id !== nodeId && d[0].id !== nodeId;
                }
            });
        };
        D3ForceGraph.prototype.onNodeClicked = function (g, d) {
            if (g === this.selectedNode) {
                this.deselectNode();
                return;
            }
            // unselect old none
            d3.select(this.selectedNode).classed('selected', false);
            this.unhighlightNode();
            // select new one
            d3.select(g).classed('selected', true);
            this.selectedNode = g;
            this.highlightNode(g, d);
        };
        D3ForceGraph.prototype.deselectNode = function () {
            if (!this.selectedNode) {
                return;
            }
            // Unselect
            d3.select(this.selectedNode).classed('selected', false);
            this.selectedNode = null;
            this.unhighlightNode();
        };
        D3ForceGraph.prototype.retrieveNodeCaption = function (d) {
            var key = this.graphConfig.nodeCaption();
            var value = d.id || d.label;
            if (key) {
                value = D3ForceGraph.getNodePropValue(d, key) || '';
            }
            // Manually ellipsize
            if (value.length > D3ForceGraph.NODE_LABEL_MAX_CHAR_LENGTH) {
                value = value.substr(0, D3ForceGraph.NODE_LABEL_MAX_CHAR_LENGTH) + '\u2026';
            }
            return value;
        };
        D3ForceGraph.prototype.positionLink = function (d) {
            var radius = this.graphConfig.nodeSize() + 3;
            // Start
            var dx = d[1].x - d[0].x;
            var dy = d[1].y - d[0].y;
            var angle = Math.atan2(dy, dx);
            var tx = d[0].x + (Math.cos(angle) * radius);
            var ty = d[0].y + (Math.sin(angle) * radius);
            // End
            dx = d[2].x - d[1].x;
            dy = d[2].y - d[1].y;
            angle = Math.atan2(dy, dx);
            var ux = d[2].x - (Math.cos(angle) * radius);
            var uy = d[2].y - (Math.sin(angle) * radius);
            return "M" + tx + "," + ty
                + "S" + d[1].x + "," + d[1].y
                + " " + ux + "," + uy;
        };
        D3ForceGraph.prototype.positionNode = function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        };
        D3ForceGraph.prototype.redrawGraph = function () {
            if (!this.simulation) {
                return;
            }
            this.applyConfig(this.graphConfig);
        };
        D3ForceGraph.computeImageData = function (d, config) {
            var propValue = D3ForceGraph.getNodePropValue(d, config.nodeIconKey()) || '';
            // Trim leading and trailing spaces to make comparison more forgiving.
            var value = config.iconsMap()[propValue.trim()];
            if (!value) {
                return undefined;
            }
            return "data:image/" + value.format + ";base64," + value.data;
        };
        /**
         * Update graph according to configuration or use default
         */
        D3ForceGraph.prototype.applyConfig = function (config) {
            var _this = this;
            if (config.nodeIconKey()) {
                this.g.selectAll('.node .icon').attr("xlink:href", function (d) {
                    return D3ForceGraph.computeImageData(d, config);
                })
                    .attr("x", -config.nodeSize())
                    .attr("y", -config.nodeSize())
                    .attr("height", config.nodeSize() * 2)
                    .attr("width", config.nodeSize() * 2)
                    .attr('class', 'icon');
            }
            else {
                // clear icons
                this.g.selectAll('.node .icon').attr('xlink:href', undefined);
            }
            this.g.selectAll('.node .icon-background').attr('fill-opacity', function (d) { return config.nodeIconKey() ? 1 : 0; });
            this.g.selectAll('.node text.caption').text(function (d) { return _this.retrieveNodeCaption(d); });
            this.g.selectAll('.node circle.main').attr('r', config.nodeSize());
            this.g.selectAll('.node text.caption').attr('dx', config.nodeSize() + 2);
            // this.svg.select('#triangle').attr('refX', config.nodeSize() + 17);
            this.g.selectAll('.node circle').attr('fill', this.getNodeColor.bind(this));
            // Can't color nodes individually if using defs
            this.svg.selectAll('#loadMoreIcon ellipse').attr('fill', this.graphConfig.nodeColor());
            this.g.selectAll('.link').attr("stroke-width", config.linkWidth());
            this.g.selectAll('.link').attr("stroke", config.linkColor());
            this.svg.select('#triangle').attr('fill', config.linkColor()).attr('stroke', config.linkColor());
            // Reset highlight
            this.g.selectAll('.node circle').attr('opacity', null);
        };
        return D3ForceGraph;
    }());
    // Some constants
    D3ForceGraph.IS_ROOT_PROP_KEY = '_isRoot';
    D3ForceGraph.NO_NEIGHBORS_PROP_KEY = '_noNeighbors';
    D3ForceGraph.GRAPH_WIDTH_PX = 900;
    D3ForceGraph.GRAPH_HEIGHT_PX = 700;
    D3ForceGraph.LINK_COLOR = '#aaa';
    D3ForceGraph.NODE_SIZE = 10;
    D3ForceGraph.TEXT_DX = 12;
    D3ForceGraph.MARKER_REFX = 8; //27;
    D3ForceGraph.FORCE_COLLIDE = 40; //30
    D3ForceGraph.NODE_COLOR = 'orange';
    D3ForceGraph.LINK_WIDTH = 1;
    D3ForceGraph.NODE_LABEL_MAX_CHAR_LENGTH = 16;
    D3ForceGraph.LINK_DISTANCE = 50;
    // We limit the number of different colors to 20
    D3ForceGraph.COLOR_SCHEME_20 = d3.scaleOrdinal(d3.schemeCategory20);
    D3ForceGraph.MAX_COLOR_NB = 20;
    exports.D3ForceGraph = D3ForceGraph;
});
