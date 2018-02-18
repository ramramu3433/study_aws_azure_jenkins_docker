define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var Splitter = (function () {
        function Splitter(splitterId, leftId, rightId) {
            this.splitterId = splitterId;
            this.leftSideId = leftId;
            this.rightSideId = rightId;
            this._listening = false;
            this.isCollapsed = ko.observable(false);
            this.lastX = 240;
            this.initialize();
        }
        Splitter.prototype.initialize = function () {
            this.splitter = document.getElementById(this.splitterId);
            this.leftSide = document.getElementById(this.leftSideId);
            this.rightSide = document.getElementById(this.rightSideId);
            var leftWidth = (this.leftSide.clientWidth === 0) ? this.lastX : this.leftSide.clientWidth;
            this.splitter.style.marginLeft = leftWidth + "px";
            this.rightSide.style.marginLeft = (leftWidth + this.splitter.clientWidth) + "px";
            this.rightSide.style.width = (window.innerWidth - (leftWidth + this.splitter.clientWidth)) + "px";
            this.splitter.addEventListener("mousedown", this.onMouseDown.bind(this));
            window.addEventListener("mousemove", this.onMouseMove.bind(this));
            window.addEventListener("mouseup", this.onMouseUp.bind(this));
        };
        Splitter.prototype.onMouseDown = function (e) {
            if (this._listening) {
                return;
            }
            if (this.isCollapsed()) {
                return;
            }
            this.lastX = e.clientX;
            this._listening = true;
        };
        Splitter.prototype.onMouseUp = function (e) {
            if (!this._listening) {
                return;
            }
            if (this.isCollapsed()) {
                return;
            }
            this.resetPosition(this.lastX);
            this._listening = false;
        };
        Splitter.prototype.onMouseMove = function (e) {
            if (!this._listening) {
                return;
            }
            if (this.isCollapsed()) {
                return;
            }
            if (e.clientX < 240) {
                return;
            }
            if (e.clientX > 400) {
                return;
            }
            this.resetPosition(e.clientX);
        };
        Splitter.prototype.resetPosition = function (currentX) {
            var dx = currentX - this.lastX;
            this.lastX = currentX;
            var leftWidth = (this.leftSide.clientWidth === 0) ? this.lastX : this.leftSide.clientWidth;
            this.leftSide.style.width = (dx + leftWidth) + "px";
            this.splitter.style.marginLeft = (dx + leftWidth) + "px";
            this.rightSide.style.marginLeft = (dx + leftWidth + this.splitter.clientWidth) + "px";
            this.rightSide.style.width = "calc(100% - " + (dx + leftWidth + this.splitter.clientWidth) + "px)";
        };
        Splitter.prototype.collapseLeft = function () {
            this.setLeft(50);
            this.isCollapsed(true);
        };
        Splitter.prototype.expandLeft = function () {
            this.setLeft(this.lastX || 240);
            this.isCollapsed(false);
        };
        Splitter.prototype.setLeft = function (width) {
            var collapsedWithSplitterWidth = width + this.splitter.clientWidth;
            this.leftSide.style.width = width + "px";
            this.splitter.style.marginLeft = width + "px";
            this.rightSide.style.marginLeft = collapsedWithSplitterWidth + "px";
            this.rightSide.style.width = "calc(100% - " + collapsedWithSplitterWidth + "px)";
        };
        return Splitter;
    }());
    return Splitter;
});
