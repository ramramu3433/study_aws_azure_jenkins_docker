define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Helper class for ko component registration
     */
    var CollapsiblePanelComponent = (function () {
        function CollapsiblePanelComponent() {
            return {
                viewModel: CollapsiblePanelViewModel,
                template: { require: "text!collapsible-panel-component.html" }
            };
        }
        return CollapsiblePanelComponent;
    }());
    exports.CollapsiblePanelComponent = CollapsiblePanelComponent;
    /**
     * Collapsible panel:
     *  Contains a header with [>] button to collapse and an title ("expandedTitle").
     *  Collapsing the panel:
     *   - shrinks width to narrow amount
     *   - hides children
     *   - shows [<]
     *   - shows vertical title ("collapsedTitle")
     *   - the default behavior is to collapse to the right (ie, place this component on the right or use "collapseToLeft" parameter)
     *
     * How to use in your markup:
     * <collapsible-panel params="{ collapsedTitle:'Properties', expandedTitle:'Expanded properties' }">
     *      <!-- add your markup here: the ko context is the same as outside of collapsible-panel (ie $data) -->
     * </collapsible-panel>
     *
     * Use the optional "isCollapsed" parameter to programmatically collapse/expand the pane from outside the component.
     * Use the optional "collapseToLeft" parameter to collapse to the left.
     */
    var CollapsiblePanelViewModel = (function () {
        function CollapsiblePanelViewModel(params) {
            this.params = params;
            this.isCollapsed = params.isCollapsed || ko.observable(false);
        }
        CollapsiblePanelViewModel.prototype.toggleCollapse = function () {
            this.isCollapsed(!this.isCollapsed());
        };
        return CollapsiblePanelViewModel;
    }());
});
