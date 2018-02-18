define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CacheBase = (function () {
        function CacheBase() {
            this.data = null;
            this.sortOrder = null;
            this.serverCallInProgress = false;
        }
        Object.defineProperty(CacheBase.prototype, "length", {
            get: function () {
                return this.data ? this.data.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        CacheBase.prototype.clear = function () {
            this.preClear();
            this.data = null;
            this.sortOrder = null;
            this.serverCallInProgress = false;
        };
        return CacheBase;
    }());
    exports.default = CacheBase;
});
