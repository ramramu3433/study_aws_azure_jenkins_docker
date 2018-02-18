/**
 * How to use this component:
 *
 * In your html markup, use:
 * <command-button params="{
 *                             iconSrc: '/icon/example/src/',
 *                             onCommandClick: () => { doSomething },
 *                             commandButtonLabel: 'Some Label'
 *                             disabled: true/false
 *                         }">
 * </command-button>
 *
 */
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
define(["require", "exports", "knockout", "../../WaitsForTemplateViewModel"], function (require, exports, ko, WaitsForTemplateViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Helper class for ko component registration
     */
    var CommandButtonComponent = (function () {
        function CommandButtonComponent() {
            return {
                viewModel: CommandButtonViewModel,
                template: { require: "text!command-button.html" }
            };
        }
        return CommandButtonComponent;
    }());
    exports.CommandButtonComponent = CommandButtonComponent;
    var CommandButtonViewModel = (function (_super) {
        __extends(CommandButtonViewModel, _super);
        function CommandButtonViewModel(options) {
            var _this = _super.call(this) || this;
            var props = options.buttonProps;
            _this.disabled = props.disabled || ko.observable(false);
            _this.visible = props.visible || ko.observable(true);
            _this.iconSrc = props.iconSrc;
            _this.commandButtonLabel = props.commandButtonLabel;
            _this.tooltipText = props.tooltipText || props.commandButtonLabel;
            _this.tabIndex = props.tabIndex || ko.observable(0);
            _super.prototype.onTemplateReady.call(_this, function (isTemplateReady) {
                if (isTemplateReady && props.onTemplateReady) {
                    props.onTemplateReady();
                }
            });
            _this.commandClickCallback = function () {
                if (_this.disabled()) {
                    return;
                }
                props.onCommandClick();
            };
            return _this;
        }
        CommandButtonViewModel.prototype.onKeyPress = function (source, event) {
            if (event.key === " " || event.key === "Enter") {
                this.commandClickCallback && this.commandClickCallback();
                event.stopPropagation();
            }
        };
        return CommandButtonViewModel;
    }(WaitsForTemplateViewModel_1.WaitsForTemplateViewModel));
    exports.CommandButtonViewModel = CommandButtonViewModel;
});
