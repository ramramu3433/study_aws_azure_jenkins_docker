var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "knockout", "../../Contracts/ViewModels", "./ContextualPaneBase"], function (require, exports, ko, ViewModels, ContextualPaneBase_1) {
    "use strict";
    var GraphStylingPane = (function (_super) {
        __extends(GraphStylingPane, _super);
        function GraphStylingPane(options) {
            var _this = _super.call(this, options) || this;
            _this.container = options.container;
            _this.resetData();
            _this.graphConfigUIData.nodeCaptionChoice.subscribe(function (val) {
                if (_this.remoteConfig) {
                    _this.remoteConfig.nodeCaptionChoice(val);
                }
            });
            _this.graphConfigUIData.nodeColorKeyChoice.subscribe(function (val) {
                if (_this.remoteConfig) {
                    _this.remoteConfig.nodeColorKeyChoice(val);
                }
            });
            _this.graphConfigUIData.nodeIconChoice.subscribe(function (val) {
                if (_this.remoteConfig) {
                    _this.remoteConfig.nodeIconChoice(val);
                }
            });
            _this.graphConfigUIData.nodeIconSet.subscribe(function (val) {
                if (_this.remoteConfig) {
                    _this.remoteConfig.nodeIconSet(val);
                }
            });
            return _this;
        }
        GraphStylingPane.prototype.setData = function (config) {
            // Update pane ko's with config's ko
            this.graphConfigUIData.nodeCaptionChoice(config.nodeCaptionChoice());
            this.graphConfigUIData.nodeColorKeyChoice(config.nodeColorKeyChoice());
            this.graphConfigUIData.nodeIconChoice(config.nodeIconChoice());
            this.graphConfigUIData.nodeIconSet(config.nodeIconSet());
            this.graphConfigUIData.nodeProperties(config.nodeProperties());
            this.graphConfigUIData.nodePropertiesWithNone(config.nodePropertiesWithNone());
            this.graphConfigUIData.showNeighborType(config.showNeighborType());
            this.remoteConfig = config;
        };
        GraphStylingPane.prototype.open = function () {
            $("#graphstylingpane").fadeIn().find(".contextual-pane-in").animate({ "right": 0 }, 10);
            _super.prototype.open.call(this);
        };
        GraphStylingPane.prototype.close = function () {
            this.remoteConfig = null;
            $("#graphstylingpane").fadeOut(10);
            _super.prototype.close.call(this);
        };
        GraphStylingPane.prototype.clickOutside = function () {
            this.close();
        };
        GraphStylingPane.prototype.submit = function () {
            this.formErrors("");
            this.close();
        };
        GraphStylingPane.prototype.resetData = function () {
            _super.prototype.resetData.call(this);
            this.graphConfigUIData = {
                showNeighborType: ko.observable(1 /* TARGETS_ONLY */),
                nodeProperties: ko.observableArray([]),
                nodePropertiesWithNone: ko.observableArray([]),
                nodeCaptionChoice: ko.observable(null),
                nodeColorKeyChoice: ko.observable(null),
                nodeIconChoice: ko.observable(null),
                nodeIconSet: ko.observable(null)
            };
        };
        return GraphStylingPane;
    }(ContextualPaneBase_1.ContextualPaneBase));
    return GraphStylingPane;
});
