/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout", "CloudExplorer/UI/Details/ActionDetailsViewModel", "Providers/CloudExplorer/Resources/CloudExplorerResources", "CloudExplorer/UI/Details/PropertyDetailsViewModel", "CloudExplorer/UI/ResizablePanels", "Common/Utilities"], function (require, exports, ko, ActionDetailsViewModel, CloudExplorerResources, PropertyDetailsViewModel, ResizablePanels, Utilities) {
    "use strict";
    /**
     * DetailsPanel view representation
     */
    var DetailsPanelViewModel = (function () {
        function DetailsPanelViewModel(environmentObservables, host) {
            var _this = this;
            this.environmentObservables = ko.observable();
            this.isExpanded = ko.observable(true);
            this.isVisible = ko.observable(true);
            this.detailsViews = ko.observableArray();
            this.selectedDetailView = ko.observable();
            this.heightPixels = ko.pureComputed(function () {
                return _this.environmentObservables() ? (_this.environmentObservables().footerHeight() - 39) + "px" : "";
            });
            this.hideActionsPropertiesText = ko.observable();
            this.showActionsPropertiesText = ko.observable();
            this.toggleActionsPropertiesText = ko.computed(function () {
                return _this.isExpanded() ? _this.hideActionsPropertiesText() : _this.showActionsPropertiesText();
            });
            this.selectDetailsView = function (view) {
                if (!!_this.selectedDetailView()) {
                    _this.selectedDetailView().active(false);
                }
                _this.selectedDetailView(view);
                view.active(true);
                _this.isExpanded(true);
                _this._updateResizeState();
                view.setFocus();
                // Telemetry to show selected pane
                var telemetryType = "CloudHub.currentPane";
                var telemetryProperties = {};
                telemetryProperties[telemetryType] = view.displayName();
                _this.telemetry.sendEvent("CloudHub.selectPane", telemetryProperties);
            };
            // This method is called when Enter key is pressed to select the view
            this.selectView = function (view) {
                _this.selectDetailsView(view[0]);
            };
            this.hide = function () {
                _this.isVisible(false);
                _this._updateResizeState();
            };
            this.show = function () {
                _this.isVisible(true);
                _this._updateResizeState();
            };
            this.toggle = function () {
                _this.isExpanded(!_this.isExpanded());
                _this._updateResizeState();
                // Telemetry show pane expand / contract
                var telemetryType = "Expanded";
                var telemetryProperties = {};
                telemetryProperties[telemetryType] = _this.isExpanded().toString();
                _this.telemetry.sendEvent("CloudHub.actionDetailPane", telemetryProperties);
            };
            this.isCollapsed = ko.pureComputed(function () {
                return _this.isExpanded() === false;
            });
            this.updateNode = function (node) {
                _this.detailsViews().forEach(function (detailsView) {
                    detailsView.node(node);
                });
            };
            this._handleResize = function () {
                // Once the user starts resizing, we want the panel to be expanded
                if (!_this.isExpanded()) {
                    _this.toggle();
                }
            };
            /**
             * Ensures that the resizing behavior is aware of the collapsed state of the details panel
             */
            this._updateResizeState = function () {
                // If the state is currently expanded, make sure that the resize relationship honors that
                if (_this.isExpanded() && _this.isVisible()) {
                    _this._resizeRelationship.expand();
                }
                else {
                    _this._resizeRelationship.collapse();
                }
            };
            this.telemetry = host.telemetry;
            this.environmentObservables(environmentObservables);
            var actionsViewModel = new ActionDetailsViewModel(host);
            var propertiesViewModel = new PropertyDetailsViewModel(host);
            this.detailsViews.push(actionsViewModel, propertiesViewModel);
            this.setResizeBehavior();
            if (Utilities.isRunningOnElectron()) {
                this.selectDetailsView(propertiesViewModel);
            }
            else {
                this.selectDetailsView(actionsViewModel);
            }
            host.resolveResources(CloudExplorerResources.namespace, ["CloudExplorer.ShowActionsProperties", "CloudExplorer.HideActionsProperties"])
                .then(function (values) {
                _this.showActionsPropertiesText(values["CloudExplorer.ShowActionsProperties"]);
                _this.hideActionsPropertiesText(values["CloudExplorer.HideActionsProperties"]);
            });
        }
        /**
         * Adding constraints and relationships between the panels to allow resizing
         */
        DetailsPanelViewModel.prototype.setResizeBehavior = function () {
            var $detailsContainer = $(".footer.strip");
            var $treeContainer = $(".content.strip");
            this._resizeRelationship = new ResizablePanels.Relationship($detailsContainer, [$treeContainer], ResizablePanels.EdgeDirection.Top, this._handleResize);
            ResizablePanels.setConstraints([this._resizeRelationship], [
                new ResizablePanels.MinSizeConstraint($detailsContainer, ResizablePanels.Dimension.Height, 45),
                new ResizablePanels.MinSizeConstraint($treeContainer, ResizablePanels.Dimension.Height, 100)
            ]);
        };
        return DetailsPanelViewModel;
    }());
    return DetailsPanelViewModel;
});
