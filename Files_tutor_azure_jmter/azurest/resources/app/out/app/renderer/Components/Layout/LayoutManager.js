"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
/**
 * Sets the constraints and relationships for panels. This will setup the listeners to listen for
 *   window mouse movement and dragging.
 */
var LayoutManager = (function () {
    function LayoutManager() {
        var _this = this;
        this._relationships = [];
        this._$window = $(window);
        this._$dragSurfaces = $(".drag-surface");
        this._isMouseDown = false;
        /**
         * Handles when the user is dragging a divider between
         */
        this._handleDrag = function (x, y) {
            // Figure out the state based on the mouse x and y values
            var newState = _this._activeRelationship.getState(x, y);
            // Figure out the state for the dependent elements (which is the remaining space in the window)
            newState = _this._activeRelationship.applyConstraints(newState);
            if (!_this._activeRelationship.isExpanded()) {
                _this._activeRelationship.expand(newState);
            }
            else {
                _this._activeRelationship.applyState(newState);
            }
        };
        /**
         * Handles when the window itself resizes, and tells each child to go re-apply their
         *   CSS changes and make sure that we don't only cover part of the window
         */
        this._handleWindowResize = function () {
            for (var i = 0; i < _this._relationships.length; i++) {
                _this._relationships[i].applyLastState();
            }
        };
        // Whenever the mouse moves, first check if we are currently dragging. If so, handle the
        // event based on the mouse position
        this._$window.mousemove(function (eventObject) {
            if (_this._isMouseDown && eventObject.which === 1) {
                _this._handleDrag(Math.max(0, eventObject.pageX), Math.max(0, eventObject.pageY));
                if (_this._activeRelationship.resizeStartHandler) {
                    _this._activeRelationship.resizeStartHandler();
                }
            }
            else {
                _this._$dragSurfaces.hide();
            }
        }).mouseup(function (eventObject) {
            _this._isMouseDown = false;
            _this._activeRelationship = null;
            _this._$dragSurfaces.hide();
        });
        // Listen for window resize events
        this._$window.resize(this._handleWindowResize);
    }
    LayoutManager.prototype.addRelationship = function (relationship) {
        var _this = this;
        relationship.$divider.mousedown(function (eventObject) {
            _this._isMouseDown = true;
            _this._activeRelationship = relationship;
            // Since each panel contains an iframe, they capture mouse events and prevent
            // us from handling the mousemove events. Once the user clicks on the dividers,
            // we show elements that appear over iframes. This also has the benefit of preventing
            // accidental mouse events inside each iframe during a panel resize.
            _this._$dragSurfaces.show();
        });
        this._relationships.push(relationship);
    };
    return LayoutManager;
}());
var instance = new LayoutManager();
exports.default = instance;
