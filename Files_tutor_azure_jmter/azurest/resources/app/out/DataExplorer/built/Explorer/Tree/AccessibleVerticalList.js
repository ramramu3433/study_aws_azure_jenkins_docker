define(["require", "exports", "underscore", "knockout"], function (require, exports, _, ko) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ScrollPosition;
    (function (ScrollPosition) {
        ScrollPosition[ScrollPosition["Top"] = 0] = "Top";
        ScrollPosition[ScrollPosition["Bottom"] = 1] = "Bottom";
    })(ScrollPosition || (ScrollPosition = {}));
    var AccessibleVerticalList = (function () {
        function AccessibleVerticalList(initialSetOfItems) {
            var _this = this;
            this.items = [];
            this.onKeyDown = function (source, event) {
                var targetContainer = event.target;
                if (_this.items == null || _this.items.length === 0) {
                    return true;
                }
                if (event.keyCode === 32 || event.keyCode === 13) {
                    _this.onSelect && _this.onSelect(_this.currentItem());
                    event.stopPropagation();
                    return false;
                }
                if (event.keyCode === 38) {
                    event.preventDefault();
                    _this.selectPreviousItem();
                    var targetElement = targetContainer.getElementsByClassName('accessibleListElement').item(_this.currentItemIndex());
                    _this.scrollElementIntoContainerViewIfNeeded(targetElement, targetContainer, ScrollPosition.Top);
                    return false;
                }
                if (event.keyCode === 40) {
                    event.preventDefault();
                    _this.selectNextItem();
                    var targetElement = targetContainer.getElementsByClassName('accessibleListElement').item(_this.currentItemIndex());
                    _this.scrollElementIntoContainerViewIfNeeded(targetElement, targetContainer, ScrollPosition.Bottom);
                    return false;
                }
                return true;
            };
            this.items = initialSetOfItems;
            this.currentItemIndex = ((this.items != null) && (this.items.length > 0)) ? ko.observable(0) : ko.observable(-1);
            this.currentItem = ko.computed(function () { return _this.items[_this.currentItemIndex()]; });
        }
        AccessibleVerticalList.prototype.setOnSelect = function (onSelect) {
            this.onSelect = onSelect;
        };
        AccessibleVerticalList.prototype.updateItemList = function (newItemList) {
            if (newItemList == null || newItemList.length === 0) {
                this.currentItemIndex(-1);
                this.items = [];
                return;
            }
            else if (this.currentItemIndex() < 0) {
                this.currentItemIndex(0);
            }
            this.items = newItemList;
        };
        AccessibleVerticalList.prototype.updateCurrentItem = function (item) {
            var updatedIndex = this.isItemListEmpty() ? -1 : _.indexOf(this.items, item);
            this.currentItemIndex(updatedIndex);
        };
        AccessibleVerticalList.prototype.isElementVisibleInContainer = function (element, container) {
            var elementTop = element.getBoundingClientRect().top;
            var elementBottom = element.getBoundingClientRect().bottom;
            var containerTop = container.getBoundingClientRect().top;
            var containerBottom = container.getBoundingClientRect().bottom;
            return (elementTop >= containerTop) && (elementBottom <= containerBottom);
        };
        AccessibleVerticalList.prototype.scrollElementIntoContainerViewIfNeeded = function (element, container, scrollPosition) {
            if (!this.isElementVisibleInContainer(element, container)) {
                this.scrollElementToView(element, scrollPosition);
            }
        };
        AccessibleVerticalList.prototype.scrollElementToView = function (element, position) {
            if (position === ScrollPosition.Top) {
                element.scrollIntoView();
            }
            else {
                element.scrollIntoView(false);
            }
        };
        AccessibleVerticalList.prototype.selectPreviousItem = function () {
            if (this.currentItemIndex() <= 0 || this.isItemListEmpty()) {
                return;
            }
            this.currentItemIndex(this.currentItemIndex() - 1);
        };
        AccessibleVerticalList.prototype.selectNextItem = function () {
            if (this.isItemListEmpty() || this.currentItemIndex() === this.items.length - 1) {
                return;
            }
            this.currentItemIndex(this.currentItemIndex() + 1);
        };
        AccessibleVerticalList.prototype.isItemListEmpty = function () {
            return this.items == null || this.items.length === 0;
        };
        return AccessibleVerticalList;
    }());
    exports.AccessibleVerticalList = AccessibleVerticalList;
});
