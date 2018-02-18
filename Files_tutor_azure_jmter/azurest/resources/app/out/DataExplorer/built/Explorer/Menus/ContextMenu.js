define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var ContextMenu = (function () {
        function ContextMenu(container, rid) {
            this.container = container;
            this.visible = ko.observable(false);
            this.elementId = "contextMenu" + rid;
        }
        ContextMenu.prototype.show = function (source, event) {
            if (source && source.contextMenu && source.contextMenu.visible && source.contextMenu.visible()) {
                return;
            }
            var elementId = source.contextMenu.elementId;
            var htmlElement = document.getElementById(elementId);
            htmlElement.style.left = event.clientX + "px";
            htmlElement.style.top = event.clientY + "px";
            !!source.contextMenu && source.contextMenu.visible(true);
        };
        ContextMenu.prototype.hide = function (source, event) {
            if (!source || !source.contextMenu || !source.contextMenu.visible || !source.contextMenu.visible()) {
                return;
            }
            source.contextMenu.visible(false);
        };
        return ContextMenu;
    }());
    return ContextMenu;
});
