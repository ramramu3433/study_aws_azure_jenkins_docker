//----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
//----------------------------------------------------------------------------

'use strict';

(function () {

    var root = this;

    var DocumentDB = {};

    DocumentDB.createClient = function (urlConnection, auth, connectionPolicy, consistencyLevel) {
        return new DocumentClient(urlConnection, auth, connectionPolicy, consistencyLevel);
    };

    root.DocumentDB = DocumentDB;

    var assert = {
        deepEqual: function () { },
        deepStrictEqual: function () { },
        doesNotThrow: function () { },
        equal: function () { },
        fail: function () { },
        ifError: function () { },
        notDeepEqual: function () { },
        notDeepStrictEqual: function () { },
        notEqual: function () { },
        notStrictEqual: function () { },
        ok: function () { },
        strictEqual: function () { },
        throws: function () { }
    }
    var util = {
        // Like C sprintf, currently only works for %s and %%.
        format: function (format) {
            var args = arguments;
            var i = 1;
            return format.replace(/%((%)|s)/g, function (matchStr, subMatch1, subMatch2) {
                // In case of %% subMatch2 would be '%'.
                return subMatch2 || args[i++];
            });
        }
    }
    "use strict"

    function compileSearch(funcName, predicate, reversed, extraArgs, earlyOut) {
        var code = [
            "function ", funcName, "(a,l,h,", extraArgs.join(","), "){",
            earlyOut ? "" : "var i=", (reversed ? "l-1" : "h+1"),
            ";while(l<=h){\
var m=(l+h)>>>1,x=a[m]"]
        if (earlyOut) {
            if (predicate.indexOf("c") < 0) {
                code.push(";if(x===y){return m}else if(x<=y){")
            } else {
                code.push(";var p=c(x,y);if(p===0){return m}else if(p<=0){")
            }
        } else {
            code.push(";if(", predicate, "){i=m;")
        }
        if (reversed) {
            code.push("l=m+1}else{h=m-1}")
        } else {
            code.push("h=m-1}else{l=m+1}")
        }
        code.push("}")
        if (earlyOut) {
            code.push("return -1};")
        } else {
            code.push("return i};")
        }
        return code.join("")
    }

    function compileBoundsSearch(predicate, reversed, suffix, earlyOut) {
        var result = new Function([
            compileSearch("A", "x" + predicate + "y", reversed, ["y"], earlyOut),
            compileSearch("P", "c(x,y)" + predicate + "0", reversed, ["y", "c"], earlyOut),
            "function dispatchBsearch", suffix, "(a,y,c,l,h){\
if(typeof(c)==='function'){\
return P(a,(l===void 0)?0:l|0,(h===void 0)?a.length-1:h|0,y,c)\
}else{\
return A(a,(c===void 0)?0:c|0,(l===void 0)?a.length-1:l|0,y)\
}}\
return dispatchBsearch", suffix].join(""))
        return result()
    }

    var bs = {
        ge: compileBoundsSearch(">=", false, "GE"),
        gt: compileBoundsSearch(">", false, "GT"),
        lt: compileBoundsSearch("<", true, "LT"),
        le: compileBoundsSearch("<=", true, "LE"),
        eq: compileBoundsSearch("-", true, "EQ", true)
    }

        //     Underscore.js 1.8.3
        //     http://underscorejs.org
        //     (c) 2009-2017 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
        //     Underscore may be freely distributed under the MIT license.

        ; (function () {

            // Baseline setup
            // --------------

            // Establish the root object, `window` (`self`) in the browser, `global`
            // on the server, or `this` in some virtual machines. We use `self`
            // instead of `window` for `WebWorker` support.
            var root = typeof self == 'object' && self.self === self && self ||
                typeof global == 'object' && global.global === global && global ||
                this ||
                {};

            // Save the previous value of the `_` variable.
            var previousUnderscore = root._;

            // Save bytes in the minified (but not gzipped) version:
            var ArrayProto = Array.prototype, ObjProto = Object.prototype;
            var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

            // Create quick reference variables for speed access to core prototypes.
            var push = ArrayProto.push,
                slice = ArrayProto.slice,
                toString = ObjProto.toString,
                hasOwnProperty = ObjProto.hasOwnProperty;

            // All **ECMAScript 5** native function implementations that we hope to use
            // are declared here.
            var nativeIsArray = Array.isArray,
                nativeKeys = Object.keys,
                nativeCreate = Object.create;

            // Naked function reference for surrogate-prototype-swapping.
            var Ctor = function () { };

            // Create a safe reference to the Underscore object for use below.
            var _ = function (obj) {
                if (obj instanceof _) return obj;
                if (!(this instanceof _)) return new _(obj);
                this._wrapped = obj;
            };

            // Export the Underscore object for **Node.js**, with
            // backwards-compatibility for their old module API. If we're in
            // the browser, add `_` as a global object.
            // (`nodeType` is checked to ensure that `module`
            // and `exports` are not HTML elements.)
            if (typeof exports != 'undefined' && !exports.nodeType) {
                if (typeof module != 'undefined' && !module.nodeType && module.exports) {
                    exports = module.exports = _;
                }
                exports._ = _;
            } else {
                root._ = _;
            }

            // Current version.
            _.VERSION = '1.8.3';

            // Internal function that returns an efficient (for current engines) version
            // of the passed-in callback, to be repeatedly applied in other Underscore
            // functions.
            var optimizeCb = function (func, context, argCount) {
                if (context === void 0) return func;
                switch (argCount) {
                    case 1: return function (value) {
                        return func.call(context, value);
                    };
                    // The 2-parameter case has been omitted only because no current consumers
                    // made use of it.
                    case null:
                    case 3: return function (value, index, collection) {
                        return func.call(context, value, index, collection);
                    };
                    case 4: return function (accumulator, value, index, collection) {
                        return func.call(context, accumulator, value, index, collection);
                    };
                }
                return function () {
                    return func.apply(context, arguments);
                };
            };

            var builtinIteratee;

            // An internal function to generate callbacks that can be applied to each
            // element in a collection, returning the desired result â€” either `identity`,
            // an arbitrary callback, a property matcher, or a property accessor.
            var cb = function (value, context, argCount) {
                if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
                if (value == null) return _.identity;
                if (_.isFunction(value)) return optimizeCb(value, context, argCount);
                if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
                return _.property(value);
            };

            // External wrapper for our callback generator. Users may customize
            // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
            // This abstraction hides the internal-only argCount argument.
            _.iteratee = builtinIteratee = function (value, context) {
                return cb(value, context, Infinity);
            };

            // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
            // This accumulates the arguments passed into an array, after a given index.
            var restArgs = function (func, startIndex) {
                startIndex = startIndex == null ? func.length - 1 : +startIndex;
                return function () {
                    var length = Math.max(arguments.length - startIndex, 0),
                        rest = Array(length),
                        index = 0;
                    for (; index < length; index++) {
                        rest[index] = arguments[index + startIndex];
                    }
                    switch (startIndex) {
                        case 0: return func.call(this, rest);
                        case 1: return func.call(this, arguments[0], rest);
                        case 2: return func.call(this, arguments[0], arguments[1], rest);
                    }
                    var args = Array(startIndex + 1);
                    for (index = 0; index < startIndex; index++) {
                        args[index] = arguments[index];
                    }
                    args[startIndex] = rest;
                    return func.apply(this, args);
                };
            };

            // An internal function for creating a new object that inherits from another.
            var baseCreate = function (prototype) {
                if (!_.isObject(prototype)) return {};
                if (nativeCreate) return nativeCreate(prototype);
                Ctor.prototype = prototype;
                var result = new Ctor;
                Ctor.prototype = null;
                return result;
            };

            var shallowProperty = function (key) {
                return function (obj) {
                    return obj == null ? void 0 : obj[key];
                };
            };

            var deepGet = function (obj, path) {
                var length = path.length;
                for (var i = 0; i < length; i++) {
                    if (obj == null) return void 0;
                    obj = obj[path[i]];
                }
                return length ? obj : void 0;
            };

            // Helper for collection methods to determine whether a collection
            // should be iterated as an array or as an object.
            // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
            // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
            var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
            var getLength = shallowProperty('length');
            var isArrayLike = function (collection) {
                var length = getLength(collection);
                return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
            };

            // Collection Functions
            // --------------------

            // The cornerstone, an `each` implementation, aka `forEach`.
            // Handles raw objects in addition to array-likes. Treats all
            // sparse array-likes as if they were dense.
            _.each = _.forEach = function (obj, iteratee, context) {
                iteratee = optimizeCb(iteratee, context);
                var i, length;
                if (isArrayLike(obj)) {
                    for (i = 0, length = obj.length; i < length; i++) {
                        iteratee(obj[i], i, obj);
                    }
                } else {
                    var keys = _.keys(obj);
                    for (i = 0, length = keys.length; i < length; i++) {
                        iteratee(obj[keys[i]], keys[i], obj);
                    }
                }
                return obj;
            };

            // Return the results of applying the iteratee to each element.
            _.map = _.collect = function (obj, iteratee, context) {
                iteratee = cb(iteratee, context);
                var keys = !isArrayLike(obj) && _.keys(obj),
                    length = (keys || obj).length,
                    results = Array(length);
                for (var index = 0; index < length; index++) {
                    var currentKey = keys ? keys[index] : index;
                    results[index] = iteratee(obj[currentKey], currentKey, obj);
                }
                return results;
            };

            // Create a reducing function iterating left or right.
            var createReduce = function (dir) {
                // Wrap code that reassigns argument variables in a separate function than
                // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
                var reducer = function (obj, iteratee, memo, initial) {
                    var keys = !isArrayLike(obj) && _.keys(obj),
                        length = (keys || obj).length,
                        index = dir > 0 ? 0 : length - 1;
                    if (!initial) {
                        memo = obj[keys ? keys[index] : index];
                        index += dir;
                    }
                    for (; index >= 0 && index < length; index += dir) {
                        var currentKey = keys ? keys[index] : index;
                        memo = iteratee(memo, obj[currentKey], currentKey, obj);
                    }
                    return memo;
                };

                return function (obj, iteratee, memo, context) {
                    var initial = arguments.length >= 3;
                    return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
                };
            };

            // **Reduce** builds up a single result from a list of values, aka `inject`,
            // or `foldl`.
            _.reduce = _.foldl = _.inject = createReduce(1);

            // The right-associative version of reduce, also known as `foldr`.
            _.reduceRight = _.foldr = createReduce(-1);

            // Return the first value which passes a truth test. Aliased as `detect`.
            _.find = _.detect = function (obj, predicate, context) {
                var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
                var key = keyFinder(obj, predicate, context);
                if (key !== void 0 && key !== -1) return obj[key];
            };

            // Return all the elements that pass a truth test.
            // Aliased as `select`.
            _.filter = _.select = function (obj, predicate, context) {
                var results = [];
                predicate = cb(predicate, context);
                _.each(obj, function (value, index, list) {
                    if (predicate(value, index, list)) results.push(value);
                });
                return results;
            };

            // Return all the elements for which a truth test fails.
            _.reject = function (obj, predicate, context) {
                return _.filter(obj, _.negate(cb(predicate)), context);
            };

            // Determine whether all of the elements match a truth test.
            // Aliased as `all`.
            _.every = _.all = function (obj, predicate, context) {
                predicate = cb(predicate, context);
                var keys = !isArrayLike(obj) && _.keys(obj),
                    length = (keys || obj).length;
                for (var index = 0; index < length; index++) {
                    var currentKey = keys ? keys[index] : index;
                    if (!predicate(obj[currentKey], currentKey, obj)) return false;
                }
                return true;
            };

            // Determine if at least one element in the object matches a truth test.
            // Aliased as `any`.
            _.some = _.any = function (obj, predicate, context) {
                predicate = cb(predicate, context);
                var keys = !isArrayLike(obj) && _.keys(obj),
                    length = (keys || obj).length;
                for (var index = 0; index < length; index++) {
                    var currentKey = keys ? keys[index] : index;
                    if (predicate(obj[currentKey], currentKey, obj)) return true;
                }
                return false;
            };

            // Determine if the array or object contains a given item (using `===`).
            // Aliased as `includes` and `include`.
            _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
                if (!isArrayLike(obj)) obj = _.values(obj);
                if (typeof fromIndex != 'number' || guard) fromIndex = 0;
                return _.indexOf(obj, item, fromIndex) >= 0;
            };

            // Invoke a method (with arguments) on every item in a collection.
            _.invoke = restArgs(function (obj, path, args) {
                var contextPath, func;
                if (_.isFunction(path)) {
                    func = path;
                } else if (_.isArray(path)) {
                    contextPath = path.slice(0, -1);
                    path = path[path.length - 1];
                }
                return _.map(obj, function (context) {
                    var method = func;
                    if (!method) {
                        if (contextPath && contextPath.length) {
                            context = deepGet(context, contextPath);
                        }
                        if (context == null) return void 0;
                        method = context[path];
                    }
                    return method == null ? method : method.apply(context, args);
                });
            });

            // Convenience version of a common use case of `map`: fetching a property.
            _.pluck = function (obj, key) {
                return _.map(obj, _.property(key));
            };

            // Convenience version of a common use case of `filter`: selecting only objects
            // containing specific `key:value` pairs.
            _.where = function (obj, attrs) {
                return _.filter(obj, _.matcher(attrs));
            };

            // Convenience version of a common use case of `find`: getting the first object
            // containing specific `key:value` pairs.
            _.findWhere = function (obj, attrs) {
                return _.find(obj, _.matcher(attrs));
            };

            // Return the maximum element (or element-based computation).
            _.max = function (obj, iteratee, context) {
                var result = -Infinity, lastComputed = -Infinity,
                    value, computed;
                if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
                    obj = isArrayLike(obj) ? obj : _.values(obj);
                    for (var i = 0, length = obj.length; i < length; i++) {
                        value = obj[i];
                        if (value != null && value > result) {
                            result = value;
                        }
                    }
                } else {
                    iteratee = cb(iteratee, context);
                    _.each(obj, function (v, index, list) {
                        computed = iteratee(v, index, list);
                        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                            result = v;
                            lastComputed = computed;
                        }
                    });
                }
                return result;
            };

            // Return the minimum element (or element-based computation).
            _.min = function (obj, iteratee, context) {
                var result = Infinity, lastComputed = Infinity,
                    value, computed;
                if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
                    obj = isArrayLike(obj) ? obj : _.values(obj);
                    for (var i = 0, length = obj.length; i < length; i++) {
                        value = obj[i];
                        if (value != null && value < result) {
                            result = value;
                        }
                    }
                } else {
                    iteratee = cb(iteratee, context);
                    _.each(obj, function (v, index, list) {
                        computed = iteratee(v, index, list);
                        if (computed < lastComputed || computed === Infinity && result === Infinity) {
                            result = v;
                            lastComputed = computed;
                        }
                    });
                }
                return result;
            };

            // Shuffle a collection.
            _.shuffle = function (obj) {
                return _.sample(obj, Infinity);
            };

            // Sample **n** random values from a collection using the modern version of the
            // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisherâ€“Yates_shuffle).
            // If **n** is not specified, returns a single random element.
            // The internal `guard` argument allows it to work with `map`.
            _.sample = function (obj, n, guard) {
                if (n == null || guard) {
                    if (!isArrayLike(obj)) obj = _.values(obj);
                    return obj[_.random(obj.length - 1)];
                }
                var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
                var length = getLength(sample);
                n = Math.max(Math.min(n, length), 0);
                var last = length - 1;
                for (var index = 0; index < n; index++) {
                    var rand = _.random(index, last);
                    var temp = sample[index];
                    sample[index] = sample[rand];
                    sample[rand] = temp;
                }
                return sample.slice(0, n);
            };

            // Sort the object's values by a criterion produced by an iteratee.
            _.sortBy = function (obj, iteratee, context) {
                var index = 0;
                iteratee = cb(iteratee, context);
                return _.pluck(_.map(obj, function (value, key, list) {
                    return {
                        value: value,
                        index: index++,
                        criteria: iteratee(value, key, list)
                    };
                }).sort(function (left, right) {
                    var a = left.criteria;
                    var b = right.criteria;
                    if (a !== b) {
                        if (a > b || a === void 0) return 1;
                        if (a < b || b === void 0) return -1;
                    }
                    return left.index - right.index;
                }), 'value');
            };

            // An internal function used for aggregate "group by" operations.
            var group = function (behavior, partition) {
                return function (obj, iteratee, context) {
                    var result = partition ? [[], []] : {};
                    iteratee = cb(iteratee, context);
                    _.each(obj, function (value, index) {
                        var key = iteratee(value, index, obj);
                        behavior(result, value, key);
                    });
                    return result;
                };
            };

            // Groups the object's values by a criterion. Pass either a string attribute
            // to group by, or a function that returns the criterion.
            _.groupBy = group(function (result, value, key) {
                if (_.has(result, key)) result[key].push(value); else result[key] = [value];
            });

            // Indexes the object's values by a criterion, similar to `groupBy`, but for
            // when you know that your index values will be unique.
            _.indexBy = group(function (result, value, key) {
                result[key] = value;
            });

            // Counts instances of an object that group by a certain criterion. Pass
            // either a string attribute to count by, or a function that returns the
            // criterion.
            _.countBy = group(function (result, value, key) {
                if (_.has(result, key)) result[key]++; else result[key] = 1;
            });

            var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
            // Safely create a real, live array from anything iterable.
            _.toArray = function (obj) {
                if (!obj) return [];
                if (_.isArray(obj)) return slice.call(obj);
                if (_.isString(obj)) {
                    // Keep surrogate pair characters together
                    return obj.match(reStrSymbol);
                }
                if (isArrayLike(obj)) return _.map(obj, _.identity);
                return _.values(obj);
            };

            // Return the number of elements in an object.
            _.size = function (obj) {
                if (obj == null) return 0;
                return isArrayLike(obj) ? obj.length : _.keys(obj).length;
            };

            // Split a collection into two arrays: one whose elements all satisfy the given
            // predicate, and one whose elements all do not satisfy the predicate.
            _.partition = group(function (result, value, pass) {
                result[pass ? 0 : 1].push(value);
            }, true);

            // Array Functions
            // ---------------

            // Get the first element of an array. Passing **n** will return the first N
            // values in the array. Aliased as `head` and `take`. The **guard** check
            // allows it to work with `_.map`.
            _.first = _.head = _.take = function (array, n, guard) {
                if (array == null || array.length < 1) return void 0;
                if (n == null || guard) return array[0];
                return _.initial(array, array.length - n);
            };

            // Returns everything but the last entry of the array. Especially useful on
            // the arguments object. Passing **n** will return all the values in
            // the array, excluding the last N.
            _.initial = function (array, n, guard) {
                return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
            };

            // Get the last element of an array. Passing **n** will return the last N
            // values in the array.
            _.last = function (array, n, guard) {
                if (array == null || array.length < 1) return void 0;
                if (n == null || guard) return array[array.length - 1];
                return _.rest(array, Math.max(0, array.length - n));
            };

            // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
            // Especially useful on the arguments object. Passing an **n** will return
            // the rest N values in the array.
            _.rest = _.tail = _.drop = function (array, n, guard) {
                return slice.call(array, n == null || guard ? 1 : n);
            };

            // Trim out all falsy values from an array.
            _.compact = function (array) {
                return _.filter(array, Boolean);
            };

            // Internal implementation of a recursive `flatten` function.
            var flatten = function (input, shallow, strict, output) {
                output = output || [];
                var idx = output.length;
                for (var i = 0, length = getLength(input); i < length; i++) {
                    var value = input[i];
                    if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                        // Flatten current level of array or arguments object.
                        if (shallow) {
                            var j = 0, len = value.length;
                            while (j < len) output[idx++] = value[j++];
                        } else {
                            flatten(value, shallow, strict, output);
                            idx = output.length;
                        }
                    } else if (!strict) {
                        output[idx++] = value;
                    }
                }
                return output;
            };

            // Flatten out an array, either recursively (by default), or just one level.
            _.flatten = function (array, shallow) {
                return flatten(array, shallow, false);
            };

            // Return a version of the array that does not contain the specified value(s).
            _.without = restArgs(function (array, otherArrays) {
                return _.difference(array, otherArrays);
            });

            // Produce a duplicate-free version of the array. If the array has already
            // been sorted, you have the option of using a faster algorithm.
            // Aliased as `unique`.
            _.uniq = _.unique = function (array, isSorted, iteratee, context) {
                if (!_.isBoolean(isSorted)) {
                    context = iteratee;
                    iteratee = isSorted;
                    isSorted = false;
                }
                if (iteratee != null) iteratee = cb(iteratee, context);
                var result = [];
                var seen = [];
                for (var i = 0, length = getLength(array); i < length; i++) {
                    var value = array[i],
                        computed = iteratee ? iteratee(value, i, array) : value;
                    if (isSorted) {
                        if (!i || seen !== computed) result.push(value);
                        seen = computed;
                    } else if (iteratee) {
                        if (!_.contains(seen, computed)) {
                            seen.push(computed);
                            result.push(value);
                        }
                    } else if (!_.contains(result, value)) {
                        result.push(value);
                    }
                }
                return result;
            };

            // Produce an array that contains the union: each distinct element from all of
            // the passed-in arrays.
            _.union = restArgs(function (arrays) {
                return _.uniq(flatten(arrays, true, true));
            });

            // Produce an array that contains every item shared between all the
            // passed-in arrays.
            _.intersection = function (array) {
                var result = [];
                var argsLength = arguments.length;
                for (var i = 0, length = getLength(array); i < length; i++) {
                    var item = array[i];
                    if (_.contains(result, item)) continue;
                    var j;
                    for (j = 1; j < argsLength; j++) {
                        if (!_.contains(arguments[j], item)) break;
                    }
                    if (j === argsLength) result.push(item);
                }
                return result;
            };

            // Take the difference between one array and a number of other arrays.
            // Only the elements present in just the first array will remain.
            _.difference = restArgs(function (array, rest) {
                rest = flatten(rest, true, true);
                return _.filter(array, function (value) {
                    return !_.contains(rest, value);
                });
            });

            // Complement of _.zip. Unzip accepts an array of arrays and groups
            // each array's elements on shared indices.
            _.unzip = function (array) {
                var length = array && _.max(array, getLength).length || 0;
                var result = Array(length);

                for (var index = 0; index < length; index++) {
                    result[index] = _.pluck(array, index);
                }
                return result;
            };

            // Zip together multiple lists into a single array -- elements that share
            // an index go together.
            _.zip = restArgs(_.unzip);

            // Converts lists into objects. Pass either a single array of `[key, value]`
            // pairs, or two parallel arrays of the same length -- one of keys, and one of
            // the corresponding values. Passing by pairs is the reverse of _.pairs.
            _.object = function (list, values) {
                var result = {};
                for (var i = 0, length = getLength(list); i < length; i++) {
                    if (values) {
                        result[list[i]] = values[i];
                    } else {
                        result[list[i][0]] = list[i][1];
                    }
                }
                return result;
            };

            // Generator function to create the findIndex and findLastIndex functions.
            var createPredicateIndexFinder = function (dir) {
                return function (array, predicate, context) {
                    predicate = cb(predicate, context);
                    var length = getLength(array);
                    var index = dir > 0 ? 0 : length - 1;
                    for (; index >= 0 && index < length; index += dir) {
                        if (predicate(array[index], index, array)) return index;
                    }
                    return -1;
                };
            };

            // Returns the first index on an array-like that passes a predicate test.
            _.findIndex = createPredicateIndexFinder(1);
            _.findLastIndex = createPredicateIndexFinder(-1);

            // Use a comparator function to figure out the smallest index at which
            // an object should be inserted so as to maintain order. Uses binary search.
            _.sortedIndex = function (array, obj, iteratee, context) {
                iteratee = cb(iteratee, context, 1);
                var value = iteratee(obj);
                var low = 0, high = getLength(array);
                while (low < high) {
                    var mid = Math.floor((low + high) / 2);
                    if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
                }
                return low;
            };

            // Generator function to create the indexOf and lastIndexOf functions.
            var createIndexFinder = function (dir, predicateFind, sortedIndex) {
                return function (array, item, idx) {
                    var i = 0, length = getLength(array);
                    if (typeof idx == 'number') {
                        if (dir > 0) {
                            i = idx >= 0 ? idx : Math.max(idx + length, i);
                        } else {
                            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
                        }
                    } else if (sortedIndex && idx && length) {
                        idx = sortedIndex(array, item);
                        return array[idx] === item ? idx : -1;
                    }
                    if (item !== item) {
                        idx = predicateFind(slice.call(array, i, length), _.isNaN);
                        return idx >= 0 ? idx + i : -1;
                    }
                    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
                        if (array[idx] === item) return idx;
                    }
                    return -1;
                };
            };

            // Return the position of the first occurrence of an item in an array,
            // or -1 if the item is not included in the array.
            // If the array is large and already in sort order, pass `true`
            // for **isSorted** to use binary search.
            _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
            _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

            // Generate an integer Array containing an arithmetic progression. A port of
            // the native Python `range()` function. See
            // [the Python documentation](http://docs.python.org/library/functions.html#range).
            _.range = function (start, stop, step) {
                if (stop == null) {
                    stop = start || 0;
                    start = 0;
                }
                if (!step) {
                    step = stop < start ? -1 : 1;
                }

                var length = Math.max(Math.ceil((stop - start) / step), 0);
                var range = Array(length);

                for (var idx = 0; idx < length; idx++ , start += step) {
                    range[idx] = start;
                }

                return range;
            };

            // Split an **array** into several arrays containing **count** or less elements
            // of initial array.
            _.chunk = function (array, count) {
                if (count == null || count < 1) return [];

                var result = [];
                var i = 0, length = array.length;
                while (i < length) {
                    result.push(slice.call(array, i, i += count));
                }
                return result;
            };

            // Function (ahem) Functions
            // ------------------

            // Determines whether to execute a function as a constructor
            // or a normal function with the provided arguments.
            var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
                if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
                var self = baseCreate(sourceFunc.prototype);
                var result = sourceFunc.apply(self, args);
                if (_.isObject(result)) return result;
                return self;
            };

            // Create a function bound to a given object (assigning `this`, and arguments,
            // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
            // available.
            _.bind = restArgs(function (func, context, args) {
                if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
                var bound = restArgs(function (callArgs) {
                    return executeBound(func, bound, context, this, args.concat(callArgs));
                });
                return bound;
            });

            // Partially apply a function by creating a version that has had some of its
            // arguments pre-filled, without changing its dynamic `this` context. _ acts
            // as a placeholder by default, allowing any combination of arguments to be
            // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
            _.partial = restArgs(function (func, boundArgs) {
                var placeholder = _.partial.placeholder;
                var bound = function () {
                    var position = 0, length = boundArgs.length;
                    var args = Array(length);
                    for (var i = 0; i < length; i++) {
                        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
                    }
                    while (position < arguments.length) args.push(arguments[position++]);
                    return executeBound(func, bound, this, this, args);
                };
                return bound;
            });

            _.partial.placeholder = _;

            // Bind a number of an object's methods to that object. Remaining arguments
            // are the method names to be bound. Useful for ensuring that all callbacks
            // defined on an object belong to it.
            _.bindAll = restArgs(function (obj, keys) {
                keys = flatten(keys, false, false);
                var index = keys.length;
                if (index < 1) throw new Error('bindAll must be passed function names');
                while (index--) {
                    var key = keys[index];
                    obj[key] = _.bind(obj[key], obj);
                }
            });

            // Memoize an expensive function by storing its results.
            _.memoize = function (func, hasher) {
                var memoize = function (key) {
                    var cache = memoize.cache;
                    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
                    if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
                    return cache[address];
                };
                memoize.cache = {};
                return memoize;
            };

            // Delays a function for the given number of milliseconds, and then calls
            // it with the arguments supplied.
            _.delay = restArgs(function (func, wait, args) {
                return setTimeout(function () {
                    return func.apply(null, args);
                }, wait);
            });

            // Defers a function, scheduling it to run after the current call stack has
            // cleared.
            _.defer = _.partial(_.delay, _, 1);

            // Returns a function, that, when invoked, will only be triggered at most once
            // during a given window of time. Normally, the throttled function will run
            // as much as it can, without ever going more than once per `wait` duration;
            // but if you'd like to disable the execution on the leading edge, pass
            // `{leading: false}`. To disable execution on the trailing edge, ditto.
            _.throttle = function (func, wait, options) {
                var timeout, context, args, result;
                var previous = 0;
                if (!options) options = {};

                var later = function () {
                    previous = options.leading === false ? 0 : _.now();
                    timeout = null;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                };

                var throttled = function () {
                    var now = _.now();
                    if (!previous && options.leading === false) previous = now;
                    var remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0 || remaining > wait) {
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = null;
                        }
                        previous = now;
                        result = func.apply(context, args);
                        if (!timeout) context = args = null;
                    } else if (!timeout && options.trailing !== false) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };

                throttled.cancel = function () {
                    clearTimeout(timeout);
                    previous = 0;
                    timeout = context = args = null;
                };

                return throttled;
            };

            // Returns a function, that, as long as it continues to be invoked, will not
            // be triggered. The function will be called after it stops being called for
            // N milliseconds. If `immediate` is passed, trigger the function on the
            // leading edge, instead of the trailing.
            _.debounce = function (func, wait, immediate) {
                var timeout, result;

                var later = function (context, args) {
                    timeout = null;
                    if (args) result = func.apply(context, args);
                };

                var debounced = restArgs(function (args) {
                    if (timeout) clearTimeout(timeout);
                    if (immediate) {
                        var callNow = !timeout;
                        timeout = setTimeout(later, wait);
                        if (callNow) result = func.apply(this, args);
                    } else {
                        timeout = _.delay(later, wait, this, args);
                    }

                    return result;
                });

                debounced.cancel = function () {
                    clearTimeout(timeout);
                    timeout = null;
                };

                return debounced;
            };

            // Returns the first function passed as an argument to the second,
            // allowing you to adjust arguments, run code before and after, and
            // conditionally execute the original function.
            _.wrap = function (func, wrapper) {
                return _.partial(wrapper, func);
            };

            // Returns a negated version of the passed-in predicate.
            _.negate = function (predicate) {
                return function () {
                    return !predicate.apply(this, arguments);
                };
            };

            // Returns a function that is the composition of a list of functions, each
            // consuming the return value of the function that follows.
            _.compose = function () {
                var args = arguments;
                var start = args.length - 1;
                return function () {
                    var i = start;
                    var result = args[start].apply(this, arguments);
                    while (i--) result = args[i].call(this, result);
                    return result;
                };
            };

            // Returns a function that will only be executed on and after the Nth call.
            _.after = function (times, func) {
                return function () {
                    if (--times < 1) {
                        return func.apply(this, arguments);
                    }
                };
            };

            // Returns a function that will only be executed up to (but not including) the Nth call.
            _.before = function (times, func) {
                var memo;
                return function () {
                    if (--times > 0) {
                        memo = func.apply(this, arguments);
                    }
                    if (times <= 1) func = null;
                    return memo;
                };
            };

            // Returns a function that will be executed at most one time, no matter how
            // often you call it. Useful for lazy initialization.
            _.once = _.partial(_.before, 2);

            _.restArgs = restArgs;

            // Object Functions
            // ----------------

            // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
            var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
            var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

            var collectNonEnumProps = function (obj, keys) {
                var nonEnumIdx = nonEnumerableProps.length;
                var constructor = obj.constructor;
                var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

                // Constructor is a special case.
                var prop = 'constructor';
                if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

                while (nonEnumIdx--) {
                    prop = nonEnumerableProps[nonEnumIdx];
                    if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                        keys.push(prop);
                    }
                }
            };

            // Retrieve the names of an object's own properties.
            // Delegates to **ECMAScript 5**'s native `Object.keys`.
            _.keys = function (obj) {
                if (!_.isObject(obj)) return [];
                if (nativeKeys) return nativeKeys(obj);
                var keys = [];
                for (var key in obj) if (_.has(obj, key)) keys.push(key);
                // Ahem, IE < 9.
                if (hasEnumBug) collectNonEnumProps(obj, keys);
                return keys;
            };

            // Retrieve all the property names of an object.
            _.allKeys = function (obj) {
                if (!_.isObject(obj)) return [];
                var keys = [];
                for (var key in obj) keys.push(key);
                // Ahem, IE < 9.
                if (hasEnumBug) collectNonEnumProps(obj, keys);
                return keys;
            };

            // Retrieve the values of an object's properties.
            _.values = function (obj) {
                var keys = _.keys(obj);
                var length = keys.length;
                var values = Array(length);
                for (var i = 0; i < length; i++) {
                    values[i] = obj[keys[i]];
                }
                return values;
            };

            // Returns the results of applying the iteratee to each element of the object.
            // In contrast to _.map it returns an object.
            _.mapObject = function (obj, iteratee, context) {
                iteratee = cb(iteratee, context);
                var keys = _.keys(obj),
                    length = keys.length,
                    results = {};
                for (var index = 0; index < length; index++) {
                    var currentKey = keys[index];
                    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
                }
                return results;
            };

            // Convert an object into a list of `[key, value]` pairs.
            // The opposite of _.object.
            _.pairs = function (obj) {
                var keys = _.keys(obj);
                var length = keys.length;
                var pairs = Array(length);
                for (var i = 0; i < length; i++) {
                    pairs[i] = [keys[i], obj[keys[i]]];
                }
                return pairs;
            };

            // Invert the keys and values of an object. The values must be serializable.
            _.invert = function (obj) {
                var result = {};
                var keys = _.keys(obj);
                for (var i = 0, length = keys.length; i < length; i++) {
                    result[obj[keys[i]]] = keys[i];
                }
                return result;
            };

            // Return a sorted list of the function names available on the object.
            // Aliased as `methods`.
            _.functions = _.methods = function (obj) {
                var names = [];
                for (var key in obj) {
                    if (_.isFunction(obj[key])) names.push(key);
                }
                return names.sort();
            };

            // An internal function for creating assigner functions.
            var createAssigner = function (keysFunc, defaults) {
                return function (obj) {
                    var length = arguments.length;
                    if (defaults) obj = Object(obj);
                    if (length < 2 || obj == null) return obj;
                    for (var index = 1; index < length; index++) {
                        var source = arguments[index],
                            keys = keysFunc(source),
                            l = keys.length;
                        for (var i = 0; i < l; i++) {
                            var key = keys[i];
                            if (!defaults || obj[key] === void 0) obj[key] = source[key];
                        }
                    }
                    return obj;
                };
            };

            // Extend a given object with all the properties in passed-in object(s).
            _.extend = createAssigner(_.allKeys);

            // Assigns a given object with all the own properties in the passed-in object(s).
            // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
            _.extendOwn = _.assign = createAssigner(_.keys);

            // Returns the first key on an object that passes a predicate test.
            _.findKey = function (obj, predicate, context) {
                predicate = cb(predicate, context);
                var keys = _.keys(obj), key;
                for (var i = 0, length = keys.length; i < length; i++) {
                    key = keys[i];
                    if (predicate(obj[key], key, obj)) return key;
                }
            };

            // Internal pick helper function to determine if `obj` has key `key`.
            var keyInObj = function (value, key, obj) {
                return key in obj;
            };

            // Return a copy of the object only containing the whitelisted properties.
            _.pick = restArgs(function (obj, keys) {
                var result = {}, iteratee = keys[0];
                if (obj == null) return result;
                if (_.isFunction(iteratee)) {
                    if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
                    keys = _.allKeys(obj);
                } else {
                    iteratee = keyInObj;
                    keys = flatten(keys, false, false);
                    obj = Object(obj);
                }
                for (var i = 0, length = keys.length; i < length; i++) {
                    var key = keys[i];
                    var value = obj[key];
                    if (iteratee(value, key, obj)) result[key] = value;
                }
                return result;
            });

            // Return a copy of the object without the blacklisted properties.
            _.omit = restArgs(function (obj, keys) {
                var iteratee = keys[0], context;
                if (_.isFunction(iteratee)) {
                    iteratee = _.negate(iteratee);
                    if (keys.length > 1) context = keys[1];
                } else {
                    keys = _.map(flatten(keys, false, false), String);
                    iteratee = function (value, key) {
                        return !_.contains(keys, key);
                    };
                }
                return _.pick(obj, iteratee, context);
            });

            // Fill in a given object with default properties.
            _.defaults = createAssigner(_.allKeys, true);

            // Creates an object that inherits from the given prototype object.
            // If additional properties are provided then they will be added to the
            // created object.
            _.create = function (prototype, props) {
                var result = baseCreate(prototype);
                if (props) _.extendOwn(result, props);
                return result;
            };

            // Create a (shallow-cloned) duplicate of an object.
            _.clone = function (obj) {
                if (!_.isObject(obj)) return obj;
                return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
            };

            // Invokes interceptor with the obj, and then returns obj.
            // The primary purpose of this method is to "tap into" a method chain, in
            // order to perform operations on intermediate results within the chain.
            _.tap = function (obj, interceptor) {
                interceptor(obj);
                return obj;
            };

            // Returns whether an object has a given set of `key:value` pairs.
            _.isMatch = function (object, attrs) {
                var keys = _.keys(attrs), length = keys.length;
                if (object == null) return !length;
                var obj = Object(object);
                for (var i = 0; i < length; i++) {
                    var key = keys[i];
                    if (attrs[key] !== obj[key] || !(key in obj)) return false;
                }
                return true;
            };


            // Internal recursive comparison function for `isEqual`.
            var eq, deepEq;
            eq = function (a, b, aStack, bStack) {
                // Identical objects are equal. `0 === -0`, but they aren't identical.
                // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
                if (a === b) return a !== 0 || 1 / a === 1 / b;
                // `null` or `undefined` only equal to itself (strict comparison).
                if (a == null || b == null) return false;
                // `NaN`s are equivalent, but non-reflexive.
                if (a !== a) return b !== b;
                // Exhaust primitive checks
                var type = typeof a;
                if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
                return deepEq(a, b, aStack, bStack);
            };

            // Internal recursive comparison function for `isEqual`.
            deepEq = function (a, b, aStack, bStack) {
                // Unwrap any wrapped objects.
                if (a instanceof _) a = a._wrapped;
                if (b instanceof _) b = b._wrapped;
                // Compare `[[Class]]` names.
                var className = toString.call(a);
                if (className !== toString.call(b)) return false;
                switch (className) {
                    // Strings, numbers, regular expressions, dates, and booleans are compared by value.
                    case '[object RegExp]':
                    // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
                    case '[object String]':
                        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                        // equivalent to `new String("5")`.
                        return '' + a === '' + b;
                    case '[object Number]':
                        // `NaN`s are equivalent, but non-reflexive.
                        // Object(NaN) is equivalent to NaN.
                        if (+a !== +a) return +b !== +b;
                        // An `egal` comparison is performed for other numeric values.
                        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
                    case '[object Date]':
                    case '[object Boolean]':
                        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                        // millisecond representations. Note that invalid dates with millisecond representations
                        // of `NaN` are not equivalent.
                        return +a === +b;
                    case '[object Symbol]':
                        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
                }

                var areArrays = className === '[object Array]';
                if (!areArrays) {
                    if (typeof a != 'object' || typeof b != 'object') return false;

                    // Objects with different constructors are not equivalent, but `Object`s or `Array`s
                    // from different frames are.
                    var aCtor = a.constructor, bCtor = b.constructor;
                    if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                        _.isFunction(bCtor) && bCtor instanceof bCtor)
                        && ('constructor' in a && 'constructor' in b)) {
                        return false;
                    }
                }
                // Assume equality for cyclic structures. The algorithm for detecting cyclic
                // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

                // Initializing stack of traversed objects.
                // It's done here since we only need them for objects and arrays comparison.
                aStack = aStack || [];
                bStack = bStack || [];
                var length = aStack.length;
                while (length--) {
                    // Linear search. Performance is inversely proportional to the number of
                    // unique nested structures.
                    if (aStack[length] === a) return bStack[length] === b;
                }

                // Add the first object to the stack of traversed objects.
                aStack.push(a);
                bStack.push(b);

                // Recursively compare objects and arrays.
                if (areArrays) {
                    // Compare array lengths to determine if a deep comparison is necessary.
                    length = a.length;
                    if (length !== b.length) return false;
                    // Deep compare the contents, ignoring non-numeric properties.
                    while (length--) {
                        if (!eq(a[length], b[length], aStack, bStack)) return false;
                    }
                } else {
                    // Deep compare objects.
                    var keys = _.keys(a), key;
                    length = keys.length;
                    // Ensure that both objects contain the same number of properties before comparing deep equality.
                    if (_.keys(b).length !== length) return false;
                    while (length--) {
                        // Deep compare each member
                        key = keys[length];
                        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
                    }
                }
                // Remove the first object from the stack of traversed objects.
                aStack.pop();
                bStack.pop();
                return true;
            };

            // Perform a deep comparison to check if two objects are equal.
            _.isEqual = function (a, b) {
                return eq(a, b);
            };

            // Is a given array, string, or object empty?
            // An "empty" object has no enumerable own-properties.
            _.isEmpty = function (obj) {
                if (obj == null) return true;
                if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
                return _.keys(obj).length === 0;
            };

            // Is a given value a DOM element?
            _.isElement = function (obj) {
                return !!(obj && obj.nodeType === 1);
            };

            // Is a given value an array?
            // Delegates to ECMA5's native Array.isArray
            _.isArray = nativeIsArray || function (obj) {
                return toString.call(obj) === '[object Array]';
            };

            // Is a given variable an object?
            _.isObject = function (obj) {
                var type = typeof obj;
                return type === 'function' || type === 'object' && !!obj;
            };

            // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
            _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function (name) {
                _['is' + name] = function (obj) {
                    return toString.call(obj) === '[object ' + name + ']';
                };
            });

            // Define a fallback version of the method in browsers (ahem, IE < 9), where
            // there isn't any inspectable "Arguments" type.
            if (!_.isArguments(arguments)) {
                _.isArguments = function (obj) {
                    return _.has(obj, 'callee');
                };
            }

            // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
            // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
            var nodelist = root.document && root.document.childNodes;
            if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
                _.isFunction = function (obj) {
                    return typeof obj == 'function' || false;
                };
            }

            // Is a given object a finite number?
            _.isFinite = function (obj) {
                return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
            };

            // Is the given value `NaN`?
            _.isNaN = function (obj) {
                return _.isNumber(obj) && isNaN(obj);
            };

            // Is a given value a boolean?
            _.isBoolean = function (obj) {
                return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
            };

            // Is a given value equal to null?
            _.isNull = function (obj) {
                return obj === null;
            };

            // Is a given variable undefined?
            _.isUndefined = function (obj) {
                return obj === void 0;
            };

            // Shortcut function for checking if an object has a given property directly
            // on itself (in other words, not on a prototype).
            _.has = function (obj, path) {
                if (!_.isArray(path)) {
                    return obj != null && hasOwnProperty.call(obj, path);
                }
                var length = path.length;
                for (var i = 0; i < length; i++) {
                    var key = path[i];
                    if (obj == null || !hasOwnProperty.call(obj, key)) {
                        return false;
                    }
                    obj = obj[key];
                }
                return !!length;
            };

            // Utility Functions
            // -----------------

            // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
            // previous owner. Returns a reference to the Underscore object.
            _.noConflict = function () {
                root._ = previousUnderscore;
                return this;
            };

            // Keep the identity function around for default iteratees.
            _.identity = function (value) {
                return value;
            };

            // Predicate-generating functions. Often useful outside of Underscore.
            _.constant = function (value) {
                return function () {
                    return value;
                };
            };

            _.noop = function () { };

            _.property = function (path) {
                if (!_.isArray(path)) {
                    return shallowProperty(path);
                }
                return function (obj) {
                    return deepGet(obj, path);
                };
            };

            // Generates a function for a given object that returns a given property.
            _.propertyOf = function (obj) {
                if (obj == null) {
                    return function () { };
                }
                return function (path) {
                    return !_.isArray(path) ? obj[path] : deepGet(obj, path);
                };
            };

            // Returns a predicate for checking whether an object has a given set of
            // `key:value` pairs.
            _.matcher = _.matches = function (attrs) {
                attrs = _.extendOwn({}, attrs);
                return function (obj) {
                    return _.isMatch(obj, attrs);
                };
            };

            // Run a function **n** times.
            _.times = function (n, iteratee, context) {
                var accum = Array(Math.max(0, n));
                iteratee = optimizeCb(iteratee, context, 1);
                for (var i = 0; i < n; i++) accum[i] = iteratee(i);
                return accum;
            };

            // Return a random integer between min and max (inclusive).
            _.random = function (min, max) {
                if (max == null) {
                    max = min;
                    min = 0;
                }
                return min + Math.floor(Math.random() * (max - min + 1));
            };

            // A (possibly faster) way to get the current timestamp as an integer.
            _.now = Date.now || function () {
                return new Date().getTime();
            };

            // List of HTML entities for escaping.
            var escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '`': '&#x60;'
            };
            var unescapeMap = _.invert(escapeMap);

            // Functions for escaping and unescaping strings to/from HTML interpolation.
            var createEscaper = function (map) {
                var escaper = function (match) {
                    return map[match];
                };
                // Regexes for identifying a key that needs to be escaped.
                var source = '(?:' + _.keys(map).join('|') + ')';
                var testRegexp = RegExp(source);
                var replaceRegexp = RegExp(source, 'g');
                return function (string) {
                    string = string == null ? '' : '' + string;
                    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
                };
            };
            _.escape = createEscaper(escapeMap);
            _.unescape = createEscaper(unescapeMap);

            // Traverses the children of `obj` along `path`. If a child is a function, it
            // is invoked with its parent as context. Returns the value of the final
            // child, or `fallback` if any child is undefined.
            _.result = function (obj, path, fallback) {
                if (!_.isArray(path)) path = [path];
                var length = path.length;
                if (!length) {
                    return _.isFunction(fallback) ? fallback.call(obj) : fallback;
                }
                for (var i = 0; i < length; i++) {
                    var prop = obj == null ? void 0 : obj[path[i]];
                    if (prop === void 0) {
                        prop = fallback;
                        i = length; // Ensure we don't continue iterating.
                    }
                    obj = _.isFunction(prop) ? prop.call(obj) : prop;
                }
                return obj;
            };

            // Generate a unique integer id (unique within the entire client session).
            // Useful for temporary DOM ids.
            var idCounter = 0;
            _.uniqueId = function (prefix) {
                var id = ++idCounter + '';
                return prefix ? prefix + id : id;
            };

            // By default, Underscore uses ERB-style template delimiters, change the
            // following template settings to use alternative delimiters.
            _.templateSettings = {
                evaluate: /<%([\s\S]+?)%>/g,
                interpolate: /<%=([\s\S]+?)%>/g,
                escape: /<%-([\s\S]+?)%>/g
            };

            // When customizing `templateSettings`, if you don't want to define an
            // interpolation, evaluation or escaping regex, we need one that is
            // guaranteed not to match.
            var noMatch = /(.)^/;

            // Certain characters need to be escaped so that they can be put into a
            // string literal.
            var escapes = {
                "'": "'",
                '\\': '\\',
                '\r': 'r',
                '\n': 'n',
                '\u2028': 'u2028',
                '\u2029': 'u2029'
            };

            var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

            var escapeChar = function (match) {
                return '\\' + escapes[match];
            };

            // JavaScript micro-templating, similar to John Resig's implementation.
            // Underscore templating handles arbitrary delimiters, preserves whitespace,
            // and correctly escapes quotes within interpolated code.
            // NB: `oldSettings` only exists for backwards compatibility.
            _.template = function (text, settings, oldSettings) {
                if (!settings && oldSettings) settings = oldSettings;
                settings = _.defaults({}, settings, _.templateSettings);

                // Combine delimiters into one regular expression via alternation.
                var matcher = RegExp([
                    (settings.escape || noMatch).source,
                    (settings.interpolate || noMatch).source,
                    (settings.evaluate || noMatch).source
                ].join('|') + '|$', 'g');

                // Compile the template source, escaping string literals appropriately.
                var index = 0;
                var source = "__p+='";
                text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
                    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
                    index = offset + match.length;

                    if (escape) {
                        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
                    } else if (interpolate) {
                        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
                    } else if (evaluate) {
                        source += "';\n" + evaluate + "\n__p+='";
                    }

                    // Adobe VMs need the match returned to produce the correct offset.
                    return match;
                });
                source += "';\n";

                // If a variable is not specified, place data values in local scope.
                if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

                source = "var __t,__p='',__j=Array.prototype.join," +
                    "print=function(){__p+=__j.call(arguments,'');};\n" +
                    source + 'return __p;\n';

                var render;
                try {
                    render = new Function(settings.variable || 'obj', '_', source);
                } catch (e) {
                    e.source = source;
                    throw e;
                }

                var template = function (data) {
                    return render.call(this, data, _);
                };

                // Provide the compiled source as a convenience for precompilation.
                var argument = settings.variable || 'obj';
                template.source = 'function(' + argument + '){\n' + source + '}';

                return template;
            };

            // Add a "chain" function. Start chaining a wrapped Underscore object.
            _.chain = function (obj) {
                var instance = _(obj);
                instance._chain = true;
                return instance;
            };

            // OOP
            // ---------------
            // If Underscore is called as a function, it returns a wrapped object that
            // can be used OO-style. This wrapper holds altered versions of all the
            // underscore functions. Wrapped objects may be chained.

            // Helper function to continue chaining intermediate results.
            var chainResult = function (instance, obj) {
                return instance._chain ? _(obj).chain() : obj;
            };

            // Add your own custom functions to the Underscore object.
            _.mixin = function (obj) {
                _.each(_.functions(obj), function (name) {
                    var func = _[name] = obj[name];
                    _.prototype[name] = function () {
                        var args = [this._wrapped];
                        push.apply(args, arguments);
                        return chainResult(this, func.apply(_, args));
                    };
                });
                return _;
            };

            // Add all of the Underscore functions to the wrapper object.
            _.mixin(_);

            // Add all mutator Array functions to the wrapper.
            _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
                var method = ArrayProto[name];
                _.prototype[name] = function () {
                    var obj = this._wrapped;
                    method.apply(obj, arguments);
                    if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
                    return chainResult(this, obj);
                };
            });

            // Add all accessor Array functions to the wrapper.
            _.each(['concat', 'join', 'slice'], function (name) {
                var method = ArrayProto[name];
                _.prototype[name] = function () {
                    return chainResult(this, method.apply(this._wrapped, arguments));
                };
            });

            // Extracts the result from a wrapped and chained object.
            _.prototype.value = function () {
                return this._wrapped;
            };

            // Provide unwrapping proxy for some methods used in engine operations
            // such as arithmetic and JSON stringification.
            _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

            _.prototype.toString = function () {
                return String(this._wrapped);
            };

            // AMD registration happens at the end for compatibility with AMD loaders
            // that may not enforce next-turn semantics on modules. Even though general
            // practice for AMD registration is to be anonymous, underscore registers
            // as a named module because, like jQuery, it is a base library that is
            // popular enough to be bundled in a third party lib, but not be part of
            // an AMD load request. Those cases could generate an error when an
            // anonymous define() is called outside of a loader request.
            if (typeof define == 'function' && define.amd) {
                define('underscore', [], function () {
                    return _;
                });
            }
        }());
    ; (function (global) {

        'use strict';

        var nextTick = function (fn) { setTimeout(fn, 0); }
        if (typeof process != 'undefined' && process && typeof process.nextTick == 'function') {
            // node.js and the like
            nextTick = process.nextTick;
        }

        function semaphore(capacity) {
            var semaphore = {
                capacity: capacity || 1,
                current: 0,
                queue: [],
                firstHere: false,

                take: function () {
                    if (semaphore.firstHere === false) {
                        semaphore.current++;
                        semaphore.firstHere = true;
                        var isFirst = 1;
                    } else {
                        var isFirst = 0;
                    }
                    var item = { n: 1 };

                    if (typeof arguments[0] == 'function') {
                        item.task = arguments[0];
                    } else {
                        item.n = arguments[0];
                    }

                    if (arguments.length >= 2) {
                        if (typeof arguments[1] == 'function') item.task = arguments[1];
                        else item.n = arguments[1];
                    }

                    var task = item.task;
                    item.task = function () { task(semaphore.leave); };

                    if (semaphore.current + item.n - isFirst > semaphore.capacity) {
                        if (isFirst === 1) {
                            semaphore.current--;
                            semaphore.firstHere = false;
                        }
                        return semaphore.queue.push(item);
                    }

                    semaphore.current += item.n - isFirst;
                    item.task(semaphore.leave);
                    if (isFirst === 1) semaphore.firstHere = false;
                },

                leave: function (n) {
                    n = n || 1;

                    semaphore.current -= n;

                    if (!semaphore.queue.length) {
                        if (semaphore.current < 0) {
                            throw new Error('leave called too many times.');
                        }

                        return;
                    }

                    var item = semaphore.queue[0];

                    if (item.n + semaphore.current > semaphore.capacity) {
                        return;
                    }

                    semaphore.queue.shift();
                    semaphore.current += item.n;

                    nextTick(item.task);
                }
            };

            return semaphore;
        };

        if (typeof exports === 'object') {
            // node export
            module.exports = semaphore;
        } else if (typeof define === 'function' && define.amd) {
            // amd export
            define(function () {
                return semaphore;
            });
        } else {
            // browser global
            global.semaphore = semaphore;
        }
    }(this));
    "use strict";
    var PriorityQueue = (function () {
        function PriorityQueue(comparator) {
            this._comparator = comparator || PriorityQueue.DEFAULT_COMPARATOR;
            this._elements = [];
        }

        PriorityQueue.DEFAULT_COMPARATOR = function (a, b) {
            if (typeof a === 'number' && typeof b === 'number') {
                return a - b;
            } else {
                a = a.toString();
                b = b.toString();

                if (a == b) return 0;

                return (a > b) ? 1 : -1;
            }
        };

        PriorityQueue.prototype.isEmpty = function () {
            return this.size() === 0;
        };

        PriorityQueue.prototype.peek = function () {
            if (this.isEmpty()) throw new Error('PriorityQueue is empty');

            return this._elements[0];
        };

        PriorityQueue.prototype.deq = function () {
            var first = this.peek();
            var last = this._elements.pop();
            var size = this.size();

            if (size === 0) return first;

            this._elements[0] = last;
            var current = 0;

            while (current < size) {
                var largest = current;
                var left = (2 * current) + 1;
                var right = (2 * current) + 2;

                if (left < size && this._compare(left, largest) >= 0) {
                    largest = left;
                }

                if (right < size && this._compare(right, largest) >= 0) {
                    largest = right;
                }

                if (largest === current) break;

                this._swap(largest, current);
                current = largest;
            }

            return first;
        };

        PriorityQueue.prototype.enq = function (element) {
            var size = this._elements.push(element);
            var current = size - 1;

            while (current > 0) {
                var parent = Math.floor((current - 1) / 2);

                if (this._compare(current, parent) <= 0) break;

                this._swap(parent, current);
                current = parent;
            }

            return size;
        };

        PriorityQueue.prototype.size = function () {
            return this._elements.length;
        };

        PriorityQueue.prototype.forEach = function (fn) {
            return this._elements.forEach(fn);
        };

        PriorityQueue.prototype._compare = function (a, b) {
            return this._comparator(this._elements[a], this._elements[b]);
        };

        PriorityQueue.prototype._swap = function (a, b) {
            var aux = this._elements[a];
            this._elements[a] = this._elements[b];
            this._elements[b] = aux;
        };

        return PriorityQueue;
    }());
    function initializeProperties(target, members, prefix) {
        var keys = Object.keys(members);
        var properties;
        var i, len;
        for (i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            var enumerable = key.charCodeAt(0) !== /*_*/ 95;
            var member = members[key];
            if (member && typeof member === "object") {
                if (member.value !== undefined || typeof member.get === "function" || typeof member.set === "function") {
                    if (member.enumerable === undefined) {
                        member.enumerable = enumerable;
                    }
                    if (prefix && member.setName && typeof member.setName === "function") {
                        member.setName(prefix + "." + key);
                    }
                    properties = properties || {};
                    properties[key] = member;
                    continue;
                }
            }
            if (!enumerable) {
                properties = properties || {};
                properties[key] = { value: member, enumerable: enumerable, configurable: true, writable: true };
                continue;
            }
            target[key] = member;
        }
        if (properties) {
            Object.defineProperties(target, properties);
        }
    }

    /**
    *  Defines a new namespace with the specified name under the specified parent namespace.
    * @param {Object} parentNamespace - The parent namespace.
    * @param {String} name - The name of the new namespace.
    * @param {Object} members - The members of the new namespace.
    * @returns {Function} - The newly-defined namespace.
    */
    function defineWithParent(parentNamespace, name, members) {
        var currentNamespace = parentNamespace || {};

        if (name) {
            var namespaceFragments = name.split(".");
            for (var i = 0, len = namespaceFragments.length; i < len; i++) {
                var namespaceName = namespaceFragments[i];
                if (!currentNamespace[namespaceName]) {
                    Object.defineProperty(currentNamespace, namespaceName,
                        { value: {}, writable: false, enumerable: true, configurable: true }
                    );
                }
                currentNamespace = currentNamespace[namespaceName];
            }
        }

        if (members) {
            initializeProperties(currentNamespace, members, name || "<ANONYMOUS>");
        }

        return currentNamespace;
    }

    /**
    *  Defines a new namespace with the specified name.
    * @param {String} name - The name of the namespace. This could be a dot-separated name for nested namespaces.
    * @param {Object} members - The members of the new namespace.
    * @returns {Function} - The newly-defined namespace.
    */
    function define(name, members) {
        return defineWithParent(undefined, name, members);
    }

    /**
    *  Defines a class using the given constructor and the specified instance members.
    * @param {Function} constructor - A constructor function that is used to instantiate this class.
    * @param {Object} instanceMembers - The set of instance fields, properties, and methods to be made available on the class.
    * @param {Object} staticMembers - The set of static fields, properties, and methods to be made available on the class.
    * @returns {Function} - The newly-defined class.
    */
    function defineClass(constructor, instanceMembers, staticMembers) {
        constructor = constructor || function () { };
        if (instanceMembers) {
            initializeProperties(constructor.prototype, instanceMembers);
        }
        if (staticMembers) {
            initializeProperties(constructor, staticMembers);
        }
        return constructor;
    }

    /**
    *  Creates a sub-class based on the supplied baseClass parameter, using prototypal inheritance.
    * @param {Function} baseClass - The class to inherit from.
    * @param {Function} constructor - A constructor function that is used to instantiate this class.
    * @param {Object} instanceMembers - The set of instance fields, properties, and methods to be made available on the class.
    * @param {Object} staticMembers - The set of static fields, properties, and methods to be made available on the class.
    * @returns {Function} - The newly-defined class.
    */
    function derive(baseClass, constructor, instanceMembers, staticMembers) {
        if (baseClass) {
            constructor = constructor || function () { };
            var basePrototype = baseClass.prototype;
            constructor.prototype = Object.create(basePrototype);
            Object.defineProperty(constructor.prototype, "constructor", { value: constructor, writable: true, configurable: true, enumerable: true });
            if (instanceMembers) {
                initializeProperties(constructor.prototype, instanceMembers);
            }
            if (staticMembers) {
                initializeProperties(constructor, staticMembers);
            }
            return constructor;
        } else {
            return defineClass(constructor, instanceMembers, staticMembers);
        }
    }

    /**
    *  Defines a class using the given constructor and the union of the set of instance members
    *   specified by all the mixin objects. The mixin parameter list is of variable length.
    * @param {object} constructor - A constructor function that is used to instantiate this class.
    * @returns {Function} - The newly-defined class.
    */
    function mix(constructor) {
        constructor = constructor || function () { };
        var i, len;
        for (i = 1, len = arguments.length; i < len; i++) {
            initializeProperties(constructor.prototype, arguments[i]);
        }
        return constructor;
    }

    var Base = {
        NotImplementedException: "NotImplementedException",

        defineWithParent: defineWithParent,

        define: define,

        defineClass: defineClass,

        derive: derive,

        mix: mix,

        extend: function (obj, extent) {
            for (var property in extent) {
                if (typeof extent[property] !== "function") {
                    obj[property] = extent[property];
                }
            }
            return obj;
        },

        map: function (list, fn) {
            var result = [];
            for (var i = 0, n = list.length; i < n; i++) {
                result.push(fn(list[i]));
            }

            return result;
        },

        getHeaders: function (documentClient, defaultHeaders, verb, path, resourceId, resourceType, options, partitionKeyRangeId) {
            return new Promise(function (resolve, reject) {
                var headers = Base.extend({}, defaultHeaders);
                options = options || {};

                if (options.continuation) {
                    headers[Constants.HttpHeaders.Continuation] = options.continuation;
                }

                if (options.preTriggerInclude) {
                    headers[Constants.HttpHeaders.PreTriggerInclude] = options.preTriggerInclude.constructor === Array ? options.preTriggerInclude.join(",") : options.preTriggerInclude;
                }

                if (options.postTriggerInclude) {
                    headers[Constants.HttpHeaders.PostTriggerInclude] = options.postTriggerInclude.constructor === Array ? options.postTriggerInclude.join(",") : options.postTriggerInclude;
                }

                if (options.offerType) {
                    headers[Constants.HttpHeaders.OfferType] = options.offerType;
                }

                if (options.offerThroughput) {
                    headers[Constants.HttpHeaders.OfferThroughput] = options.offerThroughput;
                }

                if (options.maxItemCount) {
                    headers[Constants.HttpHeaders.PageSize] = options.maxItemCount;
                }

                if (options.accessCondition) {
                    if (options.accessCondition.type === "IfMatch") {
                        headers[Constants.HttpHeaders.IfMatch] = options.accessCondition.condition;
                    } else {
                        headers[Constants.HttpHeaders.IfNoneMatch] = options.accessCondition.condition;
                    }
                }

                if (options.indexingDirective) {
                    headers[Constants.HttpHeaders.IndexingDirective] = options.indexingDirective;
                }

                // TODO: add consistency level validation.
                if (options.consistencyLevel) {
                    headers[Constants.HttpHeaders.ConsistencyLevel] = options.consistencyLevel;
                }

                if (options.resourceTokenExpirySeconds) {
                    headers[Constants.HttpHeaders.ResourceTokenExpiry] = options.resourceTokenExpirySeconds;
                }

                // TODO: add session token automatic handling in case of session consistency.
                if (options.sessionToken) {
                    headers[Constants.HttpHeaders.SessionToken] = options.sessionToken;
                }

                if (options.enableScanInQuery) {
                    headers[Constants.HttpHeaders.EnableScanInQuery] = options.enableScanInQuery;
                }

                if (options.enableCrossPartitionQuery) {
                    headers[Constants.HttpHeaders.EnableCrossPartitionQuery] = options.enableCrossPartitionQuery;
                }

                if (options.maxDegreeOfParallelism) {
                    headers[Constants.HttpHeaders.ParallelizeCrossPartitionQuery] = true;
                }

                if (options.populateQuotaInfo) {
                    headers[Constants.HttpHeaders.PopulateQuotaInfo] = true;
                }

                // If the user is not using partition resolver, we add options.partitonKey to the header for elastic collections
                if (documentClient.partitionResolver === undefined || documentClient.partitionResolver === null) {
                    if (options.partitionKey !== undefined) {
                        var partitionKey = options.partitionKey;
                        if (partitionKey === null || partitionKey.constructor !== Array) {
                            partitionKey = [partitionKey];
                        }

                        headers[Constants.HttpHeaders.PartitionKey] = JSON.stringify(partitionKey);
                    }
                }

                if (documentClient.masterKey) {
                    headers[Constants.HttpHeaders.XDate] = new Date().toUTCString();
                }

                if (verb === "post" || verb === "put") {
                    if (!headers[Constants.HttpHeaders.ContentType]) {
                        headers[Constants.HttpHeaders.ContentType] = Constants.MediaTypes.Json;
                    }
                }

                if (!headers[Constants.HttpHeaders.Accept]) {
                    headers[Constants.HttpHeaders.Accept] = Constants.MediaTypes.Json;
                }

                if (partitionKeyRangeId !== undefined) {
                    headers[Constants.HttpHeaders.PartitionKeyRangeID] = partitionKeyRangeId;
                }

                if (options.enableScriptLogging) {
                    headers[Constants.HttpHeaders.EnableScriptLogging] = options.enableScriptLogging;
                }

                if (options.offerEnableRUPerMinuteThroughput) {
                    headers[Constants.HttpHeaders.OfferIsRUPerMinuteThroughputEnabled] = true;
                }

                if (options.disableRUPerMinuteUsage) {
                    headers[Constants.HttpHeaders.DisableRUPerMinuteUsage] = true;
                }

                if (documentClient.masterKey || documentClient.resourceTokens) {
                    AuthHandler.getAuthorizationHeader(documentClient, verb, path, resourceId, resourceType, headers).then(
                        function (token) {
                            headers[Constants.HttpHeaders.Authorization] = token;
                            resolve(headers);
                        },
                        function (error) {
                            reject(error);
                        }
                    );
                } else {
                    resolve(headers);
                }
            });
        },

        /** @ignore */
        parseLink: function (resourcePath) {
            if (resourcePath.length === 0) {
                /* for DatabaseAccount case, both type and objectBody will be undefined. */
                return {
                    type: undefined,
                    objectBody: undefined
                };
            }

            if (resourcePath[resourcePath.length - 1] !== "/") {
                resourcePath = resourcePath + "/";
            }

            if (resourcePath[0] !== "/") {
                resourcePath = "/" + resourcePath;
            }

            /*
            / The path will be in the form of /[resourceType]/[resourceId]/ .... /[resourceType]//[resourceType]/[resourceId]/ .... /[resourceType]/[resourceId]/
            / or /[resourceType]/[resourceId]/ .... /[resourceType]/[resourceId]/[resourceType]/[resourceId]/ .... /[resourceType]/[resourceId]/
            / The result of split will be in the form of [[[resourceType], [resourceId] ... ,[resourceType], [resourceId], ""]
            / In the first case, to extract the resourceId it will the element before last ( at length -2 ) and the the type will before it ( at length -3 )
            / In the second case, to extract the resource type it will the element before last ( at length -2 )
            */
            var pathParts = resourcePath.split("/");
            var id, type;
            if (pathParts.length % 2 === 0) {
                // request in form /[resourceType]/[resourceId]/ .... /[resourceType]/[resourceId].
                id = pathParts[pathParts.length - 2];
                type = pathParts[pathParts.length - 3];
            } else {
                // request in form /[resourceType]/[resourceId]/ .... /[resourceType]/.
                id = pathParts[pathParts.length - 3];
                type = pathParts[pathParts.length - 2];
            }

            var result = {
                type: type,
                objectBody: {
                    id: id,
                    self: resourcePath
                }
            };

            return result;
        },

        /** @ignore */
        parsePath: function (path) {
            var pathParts = [];
            var currentIndex = 0;

            var throwError = function () {
                throw new Error("Path " + path + " is invalid at index " + currentIndex);
            };

            var getEscapedToken = function () {
                var quote = path[currentIndex];
                var newIndex = ++currentIndex;

                while (true) {
                    newIndex = path.indexOf(quote, newIndex);
                    if (newIndex == -1) {
                        throwError();
                    }

                    if (path[newIndex - 1] !== '\\') break;

                    ++newIndex;
                }

                var token = path.substr(currentIndex, newIndex - currentIndex);
                currentIndex = newIndex + 1;
                return token;
            };

            var getToken = function () {
                var newIndex = path.indexOf('/', currentIndex);
                var token = null;
                if (newIndex == -1) {
                    token = path.substr(currentIndex);
                    currentIndex = path.length;
                }
                else {
                    token = path.substr(currentIndex, newIndex - currentIndex);
                    currentIndex = newIndex;
                }

                token = token.trim();
                return token;
            };

            while (currentIndex < path.length) {
                if (path[currentIndex] !== '/') {
                    throwError();
                }

                if (++currentIndex == path.length) break;

                if (path[currentIndex] === '\"' || path[currentIndex] === '\'') {
                    pathParts.push(getEscapedToken());
                }
                else {
                    pathParts.push(getToken());
                }
            }

            return pathParts;
        },

        /** @ignore */
        getDatabaseLink: function (link) {
            return link.split('/').slice(0, 2).join('/');
        },

        /** @ignore */
        getCollectionLink: function (link) {
            return link.split('/').slice(0, 4).join('/');
        },

        /** @ignore */
        getAttachmentIdFromMediaId: function (mediaId) {
            // Replace - with / on the incoming mediaId.  This will preserve the / so that we can revert it later.
            var buffer = new Buffer(mediaId.replace(/-/g, "/"), "base64");
            var ResoureIdLength = 20;
            var attachmentId = "";
            if (buffer.length > ResoureIdLength) {
                // After the base64 conversion, change the / back to a - to get the proper attachmentId
                attachmentId = buffer.toString("base64", 0, ResoureIdLength).replace(/\//g, "-");
            } else {
                attachmentId = mediaId;
            }

            return attachmentId;
        },

        /** @ignore */
        getHexaDigit: function () {
            return Math.floor(Math.random() * 16).toString(16);
        },

        /** @ignore */
        generateGuidId: function () {
            var id = "";

            for (var i = 0; i < 8; i++) {
                id += Base.getHexaDigit();
            }

            id += "-";

            for (var i = 0; i < 4; i++) {
                id += Base.getHexaDigit();
            }

            id += "-";

            for (var i = 0; i < 4; i++) {
                id += Base.getHexaDigit();
            }

            id += "-";

            for (var i = 0; i < 4; i++) {
                id += Base.getHexaDigit();
            }

            id += "-";

            for (var i = 0; i < 12; i++) {
                id += Base.getHexaDigit();
            }

            return id;
        },

        isLinkNameBased: function (link) {
            var parts = link.split("/");
            var firstId = "";
            var count = 0;
            // Get the first id from path.
            for (var i = 0; i < parts.length; ++i) {
                if (!parts[i]) {
                    // Skip empty string.
                    continue;
                }
                ++count;
                if (count === 1 && parts[i].toLowerCase() !== "dbs") {
                    return false;
                }
                if (count === 2) {
                    firstId = parts[i];
                    break;
                }
            }
            if (!firstId) return false;
            if (firstId.length !== 8) return true;
            var decodedDataLength = Platform.getDecodedDataLength(firstId);
            if (decodedDataLength !== 4) return true;
            return false;
        },
        /** @ignore */
        _trimSlashes: function (source) {
            return source.replace(Constants.RegularExpressions.TrimLeftSlashes, "")
                .replace(Constants.RegularExpressions.TrimRightSlashes, "");
        },

        /** @ignore */
        _isValidCollectionLink: function (link) {
            if (typeof link !== "string") {
                return false;
            }

            var parts = Base._trimSlashes(link).split("/");

            if (parts && parts.length !== 4) {
                return false;
            }

            if (parts[0] !== "dbs") {
                return false;
            }

            if (parts[2] !== "colls") {
                return false;
            }

            return true;
        },
    };

    var Constants = {
        MediaTypes: {
            Any: "*/*",
            ImageJpeg: "image/jpeg",
            ImagePng: "image/png",
            Javascript: "application/x-javascript",
            Json: "application/json",
            OctetStream: "application/octet-stream",
            QueryJson: "application/query+json",
            SQL: "application/sql",
            TextHtml: "text/html",
            TextPlain: "text/plain",
            Xml: "application/xml"
        },

        HttpMethods: {
            Get: "GET",
            Post: "POST",
            Put: "PUT",
            Delete: "DELETE",
            Head: "HEAD",
            Options: "OPTIONS"
        },

        HttpHeaders: {
            Authorization: "authorization",
            ETag: "etag",
            MethodOverride: "X-HTTP-Method",
            Slug: "Slug",
            ContentType: "Content-Type",
            LastModified: "Last-Modified",
            ContentEncoding: "Content-Encoding",
            CharacterSet: "CharacterSet",
            UserAgent: "User-Agent",
            IfModifiedSince: "If-Modified-Since",
            IfMatch: "If-Match",
            IfNoneMatch: "If-None-Match",
            ContentLength: "Content-Length",
            AcceptEncoding: "Accept-Encoding",
            KeepAlive: "Keep-Alive",
            CacheControl: "Cache-Control",
            TransferEncoding: "Transfer-Encoding",
            ContentLanguage: "Content-Language",
            ContentLocation: "Content-Location",
            ContentMd5: "Content-Md5",
            ContentRange: "Content-Range",
            Accept: "Accept",
            AcceptCharset: "Accept-Charset",
            AcceptLanguage: "Accept-Language",
            IfRange: "If-Range",
            IfUnmodifiedSince: "If-Unmodified-Since",
            MaxForwards: "Max-Forwards",
            ProxyAuthorization: "Proxy-Authorization",
            AcceptRanges: "Accept-Ranges",
            ProxyAuthenticate: "Proxy-Authenticate",
            RetryAfter: "Retry-After",
            SetCookie: "Set-Cookie",
            WwwAuthenticate: "Www-Authenticate",
            Origin: "Origin",
            Host: "Host",
            AccessControlAllowOrigin: "Access-Control-Allow-Origin",
            AccessControlAllowHeaders: "Access-Control-Allow-Headers",
            KeyValueEncodingFormat: "application/x-www-form-urlencoded",
            WrapAssertionFormat: "wrap_assertion_format",
            WrapAssertion: "wrap_assertion",
            WrapScope: "wrap_scope",
            SimpleToken: "SWT",
            HttpDate: "date",
            Prefer: "Prefer",
            Location: "Location",
            Referer: "referer",

            // Query
            Query: "x-ms-documentdb-query",
            IsQuery: "x-ms-documentdb-isquery",

            // Our custom DocumentDB headers
            Continuation: "x-ms-continuation",
            PageSize: "x-ms-max-item-count",

            // Request sender generated. Simply echoed by backend.
            ActivityId: "x-ms-activity-id",
            PreTriggerInclude: "x-ms-documentdb-pre-trigger-include",
            PreTriggerExclude: "x-ms-documentdb-pre-trigger-exclude",
            PostTriggerInclude: "x-ms-documentdb-post-trigger-include",
            PostTriggerExclude: "x-ms-documentdb-post-trigger-exclude",
            IndexingDirective: "x-ms-indexing-directive",
            SessionToken: "x-ms-session-token",
            ConsistencyLevel: "x-ms-consistency-level",
            XDate: "x-ms-date",
            CollectionPartitionInfo: "x-ms-collection-partition-info",
            CollectionServiceInfo: "x-ms-collection-service-info",
            RetryAfterInMilliseconds: "x-ms-retry-after-ms",
            IsFeedUnfiltered: "x-ms-is-feed-unfiltered",
            ResourceTokenExpiry: "x-ms-documentdb-expiry-seconds",
            EnableScanInQuery: "x-ms-documentdb-query-enable-scan",
            EmitVerboseTracesInQuery: "x-ms-documentdb-query-emit-traces",
            EnableCrossPartitionQuery: "x-ms-documentdb-query-enablecrosspartition",
            ParallelizeCrossPartitionQuery: "x-ms-documentdb-query-parallelizecrosspartitionquery",

            // Version headers and values
            Version: "x-ms-version",

            // Partition Key
            PartitionKey: "x-ms-documentdb-partitionkey",
            PartitionKeyRangeID: 'x-ms-documentdb-partitionkeyrangeid',

            //Quota Info
            MaxEntityCount: "x-ms-root-entity-max-count",
            CurrentEntityCount: "x-ms-root-entity-current-count",
            CollectionQuotaInMb: "x-ms-collection-quota-mb",
            CollectionCurrentUsageInMb: "x-ms-collection-usage-mb",
            MaxMediaStorageUsageInMB: "x-ms-max-media-storage-usage-mb",
            CurrentMediaStorageUsageInMB: "x-ms-media-storage-usage-mb",
            RequestCharge: "x-ms-request-charge",
            PopulateQuotaInfo: "x-ms-documentdb-populatequotainfo",
            MaxResourceQuota: "x-ms-resource-quota",

            // Offer header
            OfferType: "x-ms-offer-type",
            OfferThroughput: "x-ms-offer-throughput",

            // Custom RUs/minute headers
            DisableRUPerMinuteUsage: "x-ms-documentdb-disable-ru-per-minute-usage",
            IsRUPerMinuteUsed: "x-ms-documentdb-is-ru-per-minute-used",
            OfferIsRUPerMinuteThroughputEnabled: "x-ms-offer-is-ru-per-minute-throughput-enabled",

            // Index progress headers
            IndexTransformationProgress: "x-ms-documentdb-collection-index-transformation-progress",
            LazyIndexingProgress: "x-ms-documentdb-collection-lazy-indexing-progress",

            // Upsert header
            IsUpsert: "x-ms-documentdb-is-upsert",

            // Sub status of the error
            SubStatus: "x-ms-substatus",

            // StoredProcedure related headers
            EnableScriptLogging: "x-ms-documentdb-script-enable-logging",
            ScriptLogResults: "x-ms-documentdb-script-log-results"
        },

        // GlobalDB related constants
        WritableLocations: 'writableLocations',
        ReadableLocations: 'readableLocations',
        Name: 'name',
        DatabaseAccountEndpoint: 'databaseAccountEndpoint',

        // Client generated retry count response header
        ThrottleRetryCount: "x-ms-throttle-retry-count",
        ThrottleRetryWaitTimeInMs: "x-ms-throttle-retry-wait-time-ms",

        CurrentVersion: "2017-01-19",

        SDKName: "documentdb-nodejs-sdk",
        SDKVersion: "1.12.0",

        DefaultPrecisions: {
            DefaultNumberHashPrecision: 3,
            DefaultNumberRangePrecision: -1,
            DefaultStringHashPrecision: 3,
            DefaultStringRangePrecision: -1
        },

        ConsistentHashRing: {
            DefaultVirtualNodesPerCollection: 128
        },

        RegularExpressions: {
            TrimLeftSlashes: new RegExp("^[/]+"),
            TrimRightSlashes: new RegExp("[/]+$"),
            IllegalResourceIdCharacters: new RegExp("[/\\\\?#]")
        },

        Quota: {
            CollectionSize: "collectionSize"
        },

        Path: {
            DatabasesPathSegment: "dbs",
            CollectionsPathSegment: "colls",
            UsersPathSegment: "users",
            DocumentsPathSegment: "docs",
            PermissionsPathSegment: "permissions",
            StoredProceduresPathSegment: "sprocs",
            TriggersPathSegment: "triggers",
            UserDefinedFunctionsPathSegment: "udfs",
            ConflictsPathSegment: "conflicts",
            AttachmentsPathSegment: "attachments",
            PartitionKeyRangesPathSegment: "pkranges",
            SchemasPathSegment: "schemas"
        }
    };

    var Platform = {
        getPlatformDefaultHeaders: function () {
            return {};
        },

        getDecodedDataLength: function (encodedData) {
            var replacedEncodedData = encodedData.replace(/-/g, "/");
            var decodedData = "";

            try {
                decodedData = atob(replacedEncodedData);
            }
            catch (e1) {
            }

            return decodedData.length;
        },

        getUserAgent: function () {
            //this method is not used in javascript(client side), however, its
            //presence is needed as DocumentClient constructor depends on it
            return "";
        },
    }
    var QueryIterator = Base.defineClass(
        /**
        * Represents a QueryIterator Object, an implmenetation of feed or query response that enables traversal and iterating over the response
        * in the Azure DocumentDB database service.
        * @class QueryIterator
        * @param {object} documentclient                - The documentclient object.
        * @param {SqlQuerySpec | string} query          - A SQL query.
        * @param {FeedOptions} options                  - Represents the feed options.
        * @param {callback | callback[]} fetchFunctions - A function to retrieve each page of data. An array of functions may be used to query more than one partition.
        * @param {string} [resourceLink]                - An optional parameter that represents the resourceLink (will be used in orderby/top/parallel query)
        */
        function (documentclient, query, options, fetchFunctions, resourceLink) {

            this.documentclient = documentclient;
            this.query = query;
            this.fetchFunctions = fetchFunctions;
            this.options = options;
            this.resourceLink = resourceLink;
            this.queryExecutionContext = this._createQueryExecutionContext();

            //this block is for javascript sdk, when browser doesn't support setImmediate
            if (typeof setImmediate !== "function") {
                window["setImmediate"] = setTimeout;
            }
        },
        {
            /**
             * Execute a provided function once per feed element.
             * @memberof QueryIterator
             * @instance
             * @param {callback} callback - Function to execute for each element. the function takes two parameters error, element.
             * Note: the last element the callback will be called on will be undefined.
             * If the callback explicitly returned false, the loop gets stopped.
             */
            forEach: function (callback) {
                this.reset();
                this._forEachImplementation(callback);
            },

            /**
            * Execute a provided function on the next element in the QueryIterator.
            * @memberof QueryIterator
            * @instance
            * @param {callback} callback - Function to execute for each element. the function takes two parameters error, element.
            */
            nextItem: function (callback) {
                this.queryExecutionContext.nextItem(callback);
            },

            /**
             * Retrieve the current element on the QueryIterator.
             * @memberof QueryIterator
             * @instance
             * @param {callback} callback - Function to execute for the current element. the function takes two parameters error, element.
             */
            current: function (callback) {
                this.queryExecutionContext.current(callback);
            },

            /**
             * @deprecated Instead check if callback(undefined, undefined) is invoked by nextItem(callback) or current(callback)
             *
             * Determine if there are still remaining resources to processs based on the value of the continuation token or the elements remaining on the current batch in the QueryIterator.
             * @memberof QueryIterator
             * @instance
             * @returns {Boolean} true if there is other elements to process in the QueryIterator.
             */
            hasMoreResults: function () {
                return this.queryExecutionContext.hasMoreResults();
            },

            /**
             * Retrieve all the elements of the feed and pass them as an array to a function
             * @memberof QueryIterator
             * @instance
             * @param {callback} callback - Function execute on the feed response, takes two parameters error, resourcesList
             */
            toArray: function (callback) {
                this.reset();
                this.toArrayTempResources = [];
                this._toArrayImplementation(callback);
            },

            /**
             * Retrieve the next batch of the feed and pass them as an array to a function
             * @memberof QueryIterator
             * @instance
             * @param {callback} callback - Function execute on the feed response, takes two parameters error, resourcesList
             */
            executeNext: function (callback) {
                this.queryExecutionContext.fetchMore(function (err, resources, responseHeaders) {
                    if (err) {
                        return callback(err, undefined, responseHeaders);
                    }

                    callback(undefined, resources, responseHeaders);
                });
            },

            /**
             * Reset the QueryIterator to the beginning and clear all the resources inside it
             * @memberof QueryIterator
             * @instance
             */
            reset: function () {
                this.queryExecutionContext = this._createQueryExecutionContext();
            },

            /** @ignore */
            _toArrayImplementation: function (callback) {
                var that = this;

                this.queryExecutionContext.nextItem(function (err, resource, headers) {

                    if (err) {
                        return callback(err, undefined, headers);
                    }
                    // concatinate the results and fetch more
                    that.toArrayLastResHeaders = headers;

                    if (resource === undefined) {

                        // no more results
                        return callback(undefined, that.toArrayTempResources, that.toArrayLastResHeaders);
                    }

                    that.toArrayTempResources.push(resource);

                    setImmediate(function () {
                        that._toArrayImplementation(callback);
                    });
                });
            },

            /** @ignore */
            _forEachImplementation: function (callback) {
                var that = this;
                this.queryExecutionContext.nextItem(function (err, resource, headers) {
                    if (err) {
                        return callback(err, undefined, headers);
                    }

                    if (resource === undefined) {
                        // no more results. This is last iteration
                        return callback(undefined, undefined, headers);
                    }

                    if (callback(undefined, resource, headers) === false) {
                        // callback instructed to stop further iteration
                        return;
                    }

                    // recursively call itself to iterate to the remaining elements
                    setImmediate(function () {
                        that._forEachImplementation(callback);
                    });
                });
            },

            /** @ignore */
            _createQueryExecutionContext: function () {
                return new ProxyQueryExecutionContext(this.documentclient, this.query, this.options, this.fetchFunctions, this.resourceLink);
            }
        }
    );

    var AzureDocuments = Base.defineClass(null, null,
        {
            /**
              * Represents a DatabaseAccount in the Azure DocumentDB database service. A DatabaseAccount is the container for databases.
              * @global
              * @property {string} DatabasesLink                                     -  The self-link for Databases in the databaseAccount.
              * @property {string} MediaLink                                         -  The self-link for Media in the databaseAccount.
              * @property {number} MaxMediaStorageUsageInMB                          -  Attachment content (media) storage quota in MBs ( Retrieved from gateway ).
              * @property {number} CurrentMediaStorageUsageInMB                      -  <p> Current attachment content (media) usage in MBs (Retrieved from gateway )<br>
                                                                                         Value is returned from cached information updated periodically and is not guaranteed to be real time. </p>
              * @property {object} ConsistencyPolicy                                 -  Gets the UserConsistencyPolicy settings.
              * @property {string} ConsistencyPolicy.defaultConsistencyLevel         -  The default consistency level and it's of type {@link ConsistencyLevel}.
              * @property {number} ConsistencyPolicy.maxStalenessPrefix              -  In bounded staleness consistency, the maximum allowed staleness in terms difference in sequence numbers (aka version).
              * @property {number} ConsistencyPolicy.maxStalenessIntervalInSeconds   -  In bounded staleness consistency, the maximum allowed staleness in terms time interval.
              
              * @property {Array}  WritableLocations                                 -  The list of writable locations for a geo-replicated database account.
              * @property {Array}  ReadableLocations                                 -  The list of readable locations for a geo-replicated database account.
              */
            DatabaseAccount: Base.defineClass(function () {
                this._writableLocations = [];
                this._readableLocations = [];

                Object.defineProperty(this, "DatabasesLink", {
                    value: "",
                    writable: true,
                    configurable: true,
                    enumerable: true
                });

                Object.defineProperty(this, "MediaLink", {
                    value: "",
                    writable: true,
                    configurable: true,
                    enumerable: true
                });

                Object.defineProperty(this, "MaxMediaStorageUsageInMB", {
                    value: 0,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });

                Object.defineProperty(this, "CurrentMediaStorageUsageInMB", {
                    value: 0,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });

                Object.defineProperty(this, "ConsumedDocumentStorageInMB", {
                    value: 0,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });

                Object.defineProperty(this, "ReservedDocumentStorageInMB", {
                    value: 0,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });

                Object.defineProperty(this, "ProvisionedDocumentStorageInMB", {
                    value: 0,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });

                Object.defineProperty(this, "ConsistencyPolicy", {
                    value: "",
                    writable: true,
                    configurable: true,
                    enumerable: true
                });

                Object.defineProperty(this, "WritableLocations", {
                    get: function () {
                        return this._writableLocations;
                    },
                    enumerable: true
                });

                Object.defineProperty(this, "ReadableLocations", {
                    get: function () {
                        return this._readableLocations;
                    },
                    enumerable: true
                });
            }),

            /**
             * <p>Represents the consistency levels supported for DocumentDB client operations.<br>
             * The requested ConsistencyLevel must match or be weaker than that provisioned for the database account. Consistency levels.<br>
             * Consistency levels by order of strength are Strong, BoundedStaleness, Session and Eventual.</p>
             * @readonly
             * @enum {string}
             * @property Strong           Strong Consistency guarantees that read operations always return the value that was last written.
             * @property BoundedStaleness Bounded Staleness guarantees that reads are not too out-of-date. This can be configured based on number of operations (MaxStalenessPrefix) or time (MaxStalenessIntervalInSeconds).
             * @property Session          Session Consistency guarantees monotonic reads (you never read old data, then new, then old again), monotonic writes (writes are ordered)
                                          and read your writes (your writes are immediately visible to your reads) within any single session.
             * @property Eventual         Eventual Consistency guarantees that reads will return a subset of writes. All writes
                                          will be eventually be available for reads.
             * @property ConsistentPrefix ConsistentPrefix Consistency guarantees that reads will return some prefix of all writes with no gaps.
                                          All writes will be eventually be available for reads.                          
             */
            ConsistencyLevel: Object.freeze({
                Strong: "Strong",
                BoundedStaleness: "BoundedStaleness",
                Session: "Session",
                Eventual: "Eventual",
                ConsistentPrefix: "ConsistentPrefix"
            }),


            /**
             * Specifies the supported indexing modes.
             * @readonly
             * @enum {string}
             * @property Consistent     <p>Index is updated synchronously with a create or update operation. <br>
                                        With consistent indexing, query behavior is the same as the default consistency level for the collection. The index is
                                        always kept up to date with the data. </p>
             * @property Lazy           <p>Index is updated asynchronously with respect to a create or update operation. <br>
                                        With lazy indexing, queries are eventually consistent. The index is updated when the collection is idle.</p>
             */
            IndexingMode: Object.freeze({
                Consistent: "consistent",
                Lazy: "lazy",
                None: "none"
            }),

            /**
             * Specifies the supported Index types.
             * @readonly
             * @enum {string}
             * @property Hash     This is supplied for a path which has no sorting requirement.
             *                    This kind of an index has better precision than corresponding range index.
             * @property Range    This is supplied for a path which requires sorting.
             * @property Spatial  This is supplied for a path which requires geospatial indexing.
             */

            IndexKind: Object.freeze({
                Hash: "Hash",
                Range: "Range",
                Spatial: "Spatial"
            }),

            DataType: Object.freeze({
                Number: "Number",
                String: "String",
                Point: "Point",
                LineString: "LineString",
                Polygon: "Polygon"
            }),

            PartitionKind: Object.freeze({
                Hash: "Hash"
            }),

            ConnectionMode: Object.freeze({
                Gateway: 0
            }),

            QueryCompatibilityMode: Object.freeze({
                Default: 0,
                Query: 1,
                SqlQuery: 2
            }),

            /**
             * Enum for media read mode values.
             * @readonly
             * @enum {sting}
             * @property Buffered Content is buffered at the client and not directly streamed from the content store.
                                  <p>Use Buffered to reduce the time taken to read and write media files.</p>
             * @property Streamed Content is directly streamed from the content store without any buffering at the client.
                                  <p>Use Streamed to reduce the client memory overhead of reading and writing media files. </p>
             */
            MediaReadMode: Object.freeze({
                Buffered: "Buffered",
                Streamed: "Streamed"
            }),

            /**
             * Enum for permission mode values.
             * @readonly
             * @enum {string}
             * @property None Permission not valid.
             * @property Read Permission applicable for read operations only.
             * @property All Permission applicable for all operations.
             */
            PermissionMode: Object.freeze({
                None: "none",
                Read: "read",
                All: "all"
            }),

            /**
             * Enum for trigger type values.
             * Specifies the type of the trigger.
             * @readonly
             * @enum {string}
             * @property Pre  Trigger should be executed before the associated operation(s).
             * @property Post Trigger should be executed after the associated operation(s).
             */
            TriggerType: Object.freeze({
                Pre: "pre",
                Post: "post"
            }),

            /**
             * Enum for trigger operation values.
             * specifies the operations on which a trigger should be executed.
             * @readonly
             * @enum {string}
             * @property All All operations.
             * @property Create Create operations only.
             * @property Update Update operations only.
             * @property Delete Delete operations only.
             * @property Replace Replace operations only.
             */
            TriggerOperation: Object.freeze({
                All: "all",
                Create: "create",
                Update: "update",
                Delete: "delete",
                Replace: "replace"
            }),

            /**
             * Enum for udf type values.
             * Specifies the types of user defined functions.
             * @readonly
             * @enum {string}
             * @property Javascript Javascript type.
             */
            UserDefinedFunctionType: Object.freeze({
                Javascript: "Javascript"
            }),

            /**
             * @global
             * Represents the Connection policy associated with a DocumentClient in the Azure DocumentDB database service.
             * @property {string} MediaReadMode                - Attachment content (aka media) download mode. Should be one of the values of {@link MediaReadMode}
             * @property {number} MediaRequestTimeout          - Time to wait for response from network peer for attachment content (aka media) operations. Represented in milliseconds.
             * @property {number} RequestTimeout               - Request timeout (time to wait for response from network peer). Represented in milliseconds.
             * @property {bool} EnableEndpointDiscovery        - Flag to enable/disable automatic redirecting of requests based on read/write operations.
             * @property {Array} PreferredLocations            - List of azure regions to be used as preferred locations for read requests.
             * @property {RetryOptions} RetryOptions           - RetryOptions instance which defines several configurable properties used during retry.
             * @property {bool} DisableSSLVerification         - Flag to disable SSL verification for the requests. SSL verification is enabled by default. Don't set this when targeting production endpoints.
             *                                                   This is intended to be used only when targeting emulator endpoint to avoid failing your requests with SSL related error.
            */
            ConnectionPolicy: Base.defineClass(function () {
                Object.defineProperty(this, "_defaultRequestTimeout", {
                    value: 60000,
                    writable: true,
                    configurable: true,
                    enumerable: false // this is the default value, so it could be excluded during JSON.stringify
                });

                // defaultMediaRequestTimeout is based upon the blob client timeout and the retry policy.
                Object.defineProperty(this, "_defaultMediaRequestTimeout", {
                    value: 300000,
                    writable: true,
                    configurable: true,
                    enumerable: false // this is the default value, so it could be excluded during JSON.stringify
                });

                this.ConnectionMode = AzureDocuments.ConnectionMode.Gateway;
                this.MediaReadMode = AzureDocuments.MediaReadMode.Buffered;
                this.MediaRequestTimeout = this._defaultMediaRequestTimeout;
                this.RequestTimeout = this._defaultRequestTimeout;
                this.EnableEndpointDiscovery = true;
                this.PreferredLocations = [];
                this.RetryOptions = new RetryOptions();
                this.DisableSSLVerification = false;
            })
        }
    );
    var RequestHandler = {
        _createXmlHttpRequest: function () {
            if (window.XMLHttpRequest) {
                return new window.XMLHttpRequest();
            }
            var exception;
            if (window.ActiveXObject) {
                try {
                    return new window.ActiveXObject("Msxml2.XMLHTTP.6.0");
                } catch (_) {
                    try {
                        return new window.ActiveXObject("Msxml2.XMLHTTP.3.0");
                    } catch (e) {
                        exception = e;
                    }
                }
            } else {
                exception = { message: "XMLHttpRequest not supported" };
            }
            throw exception;
        },

        _readResponseHeaders: function (xhr, headers) {
            var responseHeadersString = xhr.getAllResponseHeaders();
            if (responseHeadersString) {
                var responseHeaders = responseHeadersString.split(/\r?\n/);
                var i, len;
                for (i = 0, len = responseHeaders.length; i < len; i++) {
                    if (responseHeaders[i]) {
                        var header = responseHeaders[i].split(": ");
                        headers[header[0]] = header[1];
                    }
                }
            }
        },

        _addRequestHeaders: function (xhr, headers) {
            // Set the name/value pairs.
            if (headers) {
                for (var name in headers) {
                    if (name.toLowerCase() !== Constants.HttpHeaders.UserAgent.toLowerCase()) {
                        xhr.setRequestHeader(name, headers[name]);
                    }
                }
            }
        },

        _preProcessUrl: function (url, path, queryParams) {
            path = path || "";
            queryParams = queryParams || "";
            return url + path + "?" + queryParams;
        },

        request: function (globalEndpointManager, connectionPolicy, method, url, path, data, queryParams, requestHeaders, callback) {
            var requestObject = {};
            var xhr = null;
            url = this._preProcessUrl(url, path, queryParams);

            var isMedia = path.indexOf("//media") === 0;

            var done = false;

            requestObject.abort = function () {
                if (done) {
                    return;
                }

                done = true;
                if (xhr) {
                    xhr.abort();
                    xhr = null;
                }

                callback({ message: "Request aborted" });
            };

            var handleTimeout = function () {
                if (!done) {
                    done = true;
                    xhr = null;
                    callback({ message: "Request timed out" });
                }
            };

            var name;
            xhr = this._createXmlHttpRequest();
            var that = this;
            xhr.onreadystatechange = function () {
                if (done || xhr === null || xhr.readyState !== 4) {
                    return;
                }

                // Workaround for XHR behavior on IE.
                var statusText = xhr.statusText;
                var statusCode = xhr.status;
                if (statusCode === 1223) {
                    statusCode = 204;
                    statusText = "No Content";
                }

                var headers = {};
                that._readResponseHeaders(xhr, headers);
                var data = xhr.responseText;
                done = true;
                xhr = null;
                if (statusCode >= 400) {
                    var errorBody = {
                        code: statusCode,
                        body: data
                    };

                    if (Constants.HttpHeaders.ActivityId in headers) {
                        errorBody.activityId = headers[Constants.HttpHeaders.ActivityId];
                    }

                    if (Constants.HttpHeaders.SubStatus in headers) {
                        errorBody.substatus = parseInt(headers[Constants.HttpHeaders.SubStatus]);
                    }

                    if (Constants.HttpHeaders.RetryAfterInMilliseconds in headers) {
                        errorBody.retryAfterInMilliseconds = parseInt(headers[Constants.HttpHeaders.RetryAfterInMilliseconds]);
                    }

                    return callback(errorBody, undefined, headers);
                } else {
                    var result;
                    try {
                        if (isMedia) {
                            result = data;
                        } else {
                            result = data.length > 0 ? JSON.parse(data) : undefined;
                        }
                    } catch (exception) {
                        return callback(exception);
                    }

                    return callback(undefined, result, headers);
                }
            };

            xhr.open(method || "GET", url, true);
            this._addRequestHeaders(xhr, requestHeaders);

            // Set the timeout if available.
            if (isMedia) {
                xhr.timeout = connectionPolicy.MediaRequestTimeout;
            } else {
                xhr.timeout = connectionPolicy.RequestTimeout;
            }
            xhr.ontimeout = handleTimeout;

            if (typeof (data) === "object") {
                data = JSON.stringify(data);
            }
            xhr.send(data);

            return requestObject;
        }
    }
    var AuthHandler = {
        getAuthorizationHeader: function (documentClient, verb, path, resourceId, resourceType, headers) {
            var that = this;
            return new Promise(function (resolve, reject) {
                if (documentClient.resourceTokens) {
                    resolve(encodeURIComponent(that.getAuthorizationTokenUsingResourceTokens(documentClient.resourceTokens, path, resourceId)));
                } else if (documentClient.masterKey) {
                    that.getAuthorizationTokenUsingMasterKey(verb, resourceId, resourceType, headers, documentClient.masterKey).then(
                        function (token) {
                            resolve(encodeURIComponent(token));
                        },
                        function (error) {
                            reject(error);
                        });
                } else {
                    resolve("");
                }
            });
        },

        getAuthorizationTokenUsingMasterKey: function (verb, resourceId, resourceType, headers, masterKey) {
            return new Promise(function (resolve, reject) {
                reject("Authentication for javascript client doesn't currently support master key, please use resource tokens instead");
            });
        },

        getAuthorizationTokenUsingResourceTokens: function (resourceTokens, path, resourceId) {
            if (resourceTokens && Object.keys(resourceTokens).length > 0) {
                // For database account access(through getDatabaseAccount API), path and resourceId are "", 
                // so in this case we return the first token to be used for creating the auth header as the service will accept any token in this case
                if (!path && !resourceId) {
                    return resourceTokens[Object.keys(resourceTokens)[0]];
                }

                if (resourceId && resourceTokens[resourceId]) {
                    return resourceTokens[resourceId];
                }

                //minimum valid path /dbs
                if (!path || path.length < 4) {
                    return null;
                }

                //remove '/' from left and right of path
                path = path[0] == '/' ? path.substring(1) : path;
                path = path[path.length - 1] == '/' ? path.substring(0, path.length - 1) : path;

                var pathSegments = (path && path.split("/")) || [];

                //if it's an incomplete path like /dbs/db1/colls/, start from the paretn resource
                var index = pathSegments.length % 2 === 0 ? pathSegments.length - 1 : pathSegments.length - 2;
                for (; index > 0; index -= 2) {
                    var id = decodeURI(pathSegments[index]);
                    if (resourceTokens[id]) {
                        return resourceTokens[id];
                    }
                }
            }
            return null;
        }
    }
    var DocumentClient = Base.defineClass(
        /**
         * Provides a client-side logical representation of the Azure DocumentDB database account.
         * This client is used to configure and execute requests in the Azure DocumentDB database service.
         * @constructor DocumentClient
         * @param {string} urlConnection           - The service endpoint to use to create the client.
         * @param {object} auth                    - An object that is used for authenticating requests and must contains one of the options
         * @param {string} [auth.masterKey]        - The authorization master key to use to create the client.
         * @param {Object} [auth.resourceTokens]   - An object that contains resources tokens. Keys for the object are resource Ids and values are the resource tokens.
         * @param {Array}  [auth.permissionFeed]   - An array of {@link Permission} objects.
         * @param {object} [connectionPolicy]      - An instance of {@link ConnectionPolicy} class. This parameter is optional and the default connectionPolicy will be used if omitted.
         * @param {string} [consistencyLevel]      - An optional parameter that represents the consistency level. It can take any value from {@link ConsistencyLevel}.
        */
        function DocumentClient(urlConnection, auth, connectionPolicy, consistencyLevel) {
            this.urlConnection = urlConnection;
            if (auth !== undefined) {
                this.masterKey = auth.masterKey;
                this.resourceTokens = auth.resourceTokens;
                if (auth.permissionFeed) {
                    this.resourceTokens = {};
                    for (var i = 0; i < auth.permissionFeed.length; i++) {
                        var resourceId = Helper.getResourceIdFromPath(auth.permissionFeed[i].resource);
                        if (!resourceId) {
                            throw new Error("authorization error: " + resourceId + "is an invalid resourceId in permissionFeed");
                        }

                        this.resourceTokens[resourceId] = auth.permissionFeed[i]._token;
                    }
                }
            }

            this.connectionPolicy = connectionPolicy || new AzureDocuments.ConnectionPolicy();
            this.defaultHeaders = {};
            this.defaultHeaders[Constants.HttpHeaders.CacheControl] = "no-cache";
            this.defaultHeaders[Constants.HttpHeaders.Version] = Constants.CurrentVersion;
            if (consistencyLevel !== undefined) {
                this.defaultHeaders[Constants.HttpHeaders.ConsistencyLevel] = consistencyLevel;
            }

            var platformDefaultHeaders = Platform.getPlatformDefaultHeaders() || {};
            for (var platformDefaultHeader in platformDefaultHeaders) {
                this.defaultHeaders[platformDefaultHeader] = platformDefaultHeaders[platformDefaultHeader];
            }

            this.defaultHeaders[Constants.HttpHeaders.UserAgent] = Platform.getUserAgent();

            // overide this for default query params to be added to the url.
            this.defaultUrlParams = "";

            // Query compatibility mode.
            // Allows to specify compatibility mode used by client when making query requests. Should be removed when
            // application/sql is no longer supported.
            this.queryCompatibilityMode = AzureDocuments.QueryCompatibilityMode.Default;
            this.partitionResolvers = {};

            this.partitionKeyDefinitionCache = {};

            this._globalEndpointManager = new GlobalEndpointManager(this);
        },
        {
            /** Gets the curent write endpoint for a geo-replicated database account.
             * @memberof DocumentClient
             * @instance
             * @param {function} callback        - The callback function which takes endpoint(string) as an argument.
            */
            getWriteEndpoint: function (callback) {
                this._globalEndpointManager.getWriteEndpoint(function (writeEndpoint) {
                    callback(writeEndpoint);
                });
            },

            /** Gets the curent read endpoint for a geo-replicated database account.
             * @memberof DocumentClient
             * @instance
             * @param {function} callback        - The callback function which takes endpoint(string) as an argument.
            */
            getReadEndpoint: function (callback) {
                this._globalEndpointManager.getReadEndpoint(function (readEndpoint) {
                    callback(readEndpoint);
                });
            },

            /** Send a request for creating a database.
             * <p>
             *  A database manages users, permissions and a set of collections.  <br>
             *  Each Azure DocumentDB Database Account is able to support multiple independent named databases, with the database being the logical container for data. <br>
             *  Each Database consists of one or more collections, each of which in turn contain one or more documents. Since databases are an an administrative resource, the Service Master Key will be required in order to access and successfully complete any action using the User APIs. <br>
             * </p>
             * @memberof DocumentClient
             * @instance
             * @param {Object} body              - A json object that represents The database to be created.
             * @param {string} body.id           - The id of the database.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            createDatabase: function (body, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(body, err)) {
                    callback(err);
                    return;
                }

                var path = "/dbs";
                this.create(body, path, "dbs", undefined, undefined, options, callback);
            },

            /**
             * Creates a collection.
             * <p>
             * A collection is a named logical container for documents. <br>
             * A database may contain zero or more named collections and each collection consists of zero or more JSON documents. <br>
             * Being schema-free, the documents in a collection do not need to share the same structure or fields. <br>
             * Since collections are application resources, they can be authorized using either the master key or resource keys. <br>
             * </p>
             * @memberof DocumentClient
             * @instance
             * @param {string} databaseLink                  - The self-link of the database.
             * @param {object} body                          - Represents the body of the collection.
             * @param {string} body.id                       - The id of the collection.
             * @param {IndexingPolicy} body.indexingPolicy   - The indexing policy associated with the collection.
             * @param {number} body.defaultTtl               - The default time to live in seconds for documents in a collection.
             * @param {RequestOptions} [options]             - The request options.
             * @param {RequestCallback} callback             - The callback for the request.
             */
            createCollection: function (databaseLink, body, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(body, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(databaseLink);
                var path = this.getPathFromLink(databaseLink, "colls", isNameBased);
                var id = this.getIdFromLink(databaseLink, isNameBased);

                this.create(body, path, "colls", id, undefined, options, callback);
            },

            /**
             * Create a document.
             * <p>
             * There is no set schema for JSON documents. They may contain any number of custom properties as well as an optional list of attachments. <br>
             * A Document is an application resource and can be authorized using the master key or resource keys
             * </p>
             * @memberof DocumentClient
             * @instance
             * @param {string} documentsFeedOrDatabaseLink               - The collection link or database link if using a partition resolver
             * @param {object} body                                      - Represents the body of the document. Can contain any number of user defined properties.
             * @param {string} [body.id]                                 - The id of the document, MUST be unique for each document.
             * @param {number} body.ttl                                  - The time to live in seconds of the document.
             * @param {RequestOptions} [options]                         - The request options.
             * @param {boolean} [options.disableAutomaticIdGeneration]   - Disables the automatic id generation. If id is missing in the body and this option is true, an error will be returned.
             * @param {RequestCallback} callback                         - The callback for the request.
             */
            createDocument: function (documentsFeedOrDatabaseLink, body, options, callback) {
                var partitionResolver = this.partitionResolvers[documentsFeedOrDatabaseLink];

                var collectionLink;
                if (partitionResolver === undefined || partitionResolver === null) {
                    collectionLink = documentsFeedOrDatabaseLink;
                } else {
                    collectionLink = this.resolveCollectionLinkForCreate(partitionResolver, body);
                }

                this.createDocumentPrivate(collectionLink, body, options, callback);
            },

            /**
             * Create an attachment for the document object.
             * <p>
             * Each document may contain zero or more attachments. Attachments can be of any MIME type - text, image, binary data. <br>
             * These are stored externally in Azure Blob storage. Attachments are automatically deleted when the parent document is deleted.
             * </P>
             * @memberof DocumentClient
             * @instance
             * @param {string} documentLink         - The self-link of the document.
             * @param {Object} body                 - The metadata the defines the attachment media like media, contentType. It can include any other properties as part of the metedata.
             * @param {string} body.contentType     - The MIME contentType of the attachment.
             * @param {string} body.media           - Media link associated with the attachment content.
             * @param {RequestOptions} options      - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
            */
            createAttachment: function (documentLink, body, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(body, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(documentLink);
                var path = this.getPathFromLink(documentLink, "attachments", isNameBased);
                var id = this.getIdFromLink(documentLink, isNameBased);

                this.create(body, path, "attachments", id, undefined, options, callback);
            },

            /**
             * Create a database user.
             * @memberof DocumentClient
             * @instance
             * @param {string} databaseLink         - The self-link of the database.
             * @param {object} body                 - Represents the body of the user.
             * @param {string} body.id              - The id of the user.
             * @param {RequestOptions} [options]    - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
             */
            createUser: function (databaseLink, body, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(body, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(databaseLink);
                var path = this.getPathFromLink(databaseLink, "users", isNameBased);
                var id = this.getIdFromLink(databaseLink, isNameBased);

                this.create(body, path, "users", id, undefined, options, callback);
            },

            /**
             * Create a permission.
             * <p> A permission represents a per-User Permission to access a specific resource e.g. Document or Collection.  </p>
             * @memberof DocumentClient
             * @instance
             * @param {string} userLink             - The self-link of the user.
             * @param {object} body                 - Represents the body of the permission.
             * @param {string} body.id              - The id of the permission
             * @param {string} body.permissionMode  - The mode of the permission, must be a value of {@link PermissionMode}
             * @param {string} body.resource        - The link of the resource that the permission will be applied to.
             * @param {RequestOptions} [options]    - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
             */
            createPermission: function (userLink, body, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(body, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(userLink);
                var path = this.getPathFromLink(userLink, "permissions", isNameBased);
                var id = this.getIdFromLink(userLink, isNameBased);

                this.create(body, path, "permissions", id, undefined, options, callback);
            },

            /**
            * Create a trigger.
            * <p>
            * DocumentDB supports pre and post triggers defined in JavaScript to be executed on creates, updates and deletes. <br>
            * For additional details, refer to the server-side JavaScript API documentation.
            * </p>
            * @memberof DocumentClient
            * @instance
            * @param {string} collectionLink           - The self-link of the collection.
            * @param {object} trigger                  - Represents the body of the trigger.
            * @param {string} trigger.id             - The id of the trigger.
            * @param {string} trigger.triggerType      - The type of the trigger, should be one of the values of {@link TriggerType}.
            * @param {string} trigger.triggerOperation - The trigger operation, should be one of the values of {@link TriggerOperation}.
            * @param {function} trigger.serverScript   - The body of the trigger, it can be passed as stringified too.
            * @param {RequestOptions} [options]        - The request options.
            * @param {RequestCallback} callback        - The callback for the request.
            */
            createTrigger: function (collectionLink, trigger, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                if (trigger.serverScript) {
                    trigger.body = trigger.serverScript.toString();
                } else if (trigger.body) {
                    trigger.body = trigger.body.toString();
                }

                var err = {};
                if (!this.isResourceValid(trigger, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "triggers", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                this.create(trigger, path, "triggers", id, undefined, options, callback);
            },

            /**
             * Create a UserDefinedFunction.
             * <p>
             * DocumentDB supports JavaScript UDFs which can be used inside queries, stored procedures and triggers. <br>
             * For additional details, refer to the server-side JavaScript API documentation.
             * </p>
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink                - The self-link of the collection.
             * @param {object} udf                           - Represents the body of the userDefinedFunction.
             * @param {string} udf.id                      - The id of the udf.
             * @param {string} udf.userDefinedFunctionType   - The type of the udf, it should be one of the values of {@link UserDefinedFunctionType}
             * @param {function} udf.serverScript            - Represents the body of the udf, it can be passed as stringified too.
             * @param {RequestOptions} [options]             - The request options.
             * @param {RequestCallback} callback             - The callback for the request.
             */
            createUserDefinedFunction: function (collectionLink, udf, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                if (udf.serverScript) {
                    udf.body = udf.serverScript.toString();
                } else if (udf.body) {
                    udf.body = udf.body.toString();
                }

                var err = {};
                if (!this.isResourceValid(udf, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "udfs", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                this.create(udf, path, "udfs", id, undefined, options, callback);
            },

            /**
             * Create a StoredProcedure.
             * <p>
             * DocumentDB allows stored procedures to be executed in the storage tier, directly against a document collection. The script <br>
             * gets executed under ACID transactions on the primary storage partition of the specified collection. For additional details, <br>
             * refer to the server-side JavaScript API documentation.
             * </p>
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink       - The self-link of the collection.
             * @param {object} sproc                - Represents the body of the stored procedure.
             * @param {string} sproc.id           - The id of the stored procedure.
             * @param {function} sproc.serverScript - The body of the stored procedure, it can be passed as stringified too.
             * @param {RequestOptions} [options]    - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
             */
            createStoredProcedure: function (collectionLink, sproc, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                if (sproc.serverScript) {
                    sproc.body = sproc.serverScript.toString();
                } else if (sproc.body) {
                    sproc.body = sproc.body.toString();
                }

                var err = {};
                if (!this.isResourceValid(sproc, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "sprocs", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                this.create(sproc, path, "sprocs", id, undefined, options, callback);
            },

            /**
             * Create an attachment for the document object.
             * @memberof DocumentClient
             * @instance
             * @param {string} documentLink             - The self-link of the document.
             * @param {stream.Readable} readableStream  - the stream that represents the media itself that needs to be uploaded.
             * @param {MediaOptions} [options]          - The request options.
             * @param {RequestCallback} callback        - The callback for the request.
            */
            createAttachmentAndUploadMedia: function (documentLink, readableStream, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var initialHeaders = Base.extend({}, this.defaultHeaders);
                initialHeaders = Base.extend(initialHeaders, options && options.initialHeaders);

                // Add required headers slug and content-type.
                if (options.slug) {
                    initialHeaders[Constants.HttpHeaders.Slug] = options.slug;
                }

                if (options.contentType) {
                    initialHeaders[Constants.HttpHeaders.ContentType] = options.contentType;
                } else {
                    initialHeaders[Constants.HttpHeaders.ContentType] = Constants.MediaTypes.OctetStream;
                }

                var isNameBased = Base.isLinkNameBased(documentLink);
                var path = this.getPathFromLink(documentLink, "attachments", isNameBased);
                var id = this.getIdFromLink(documentLink, isNameBased);

                this.create(readableStream, path, "attachments", id, initialHeaders, options, callback);
            },

            /** Reads a database.
             * @memberof DocumentClient
             * @instance
             * @param {string} databaseLink         - The self-link of the database.
             * @param {RequestOptions} [options]    - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
            */
            readDatabase: function (databaseLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(databaseLink);
                var path = this.getPathFromLink(databaseLink, "", isNameBased);
                var id = this.getIdFromLink(databaseLink, isNameBased);

                this.read(path, "dbs", id, undefined, options, callback);
            },

            /**
             * Reads a collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink       - The self-link of the collection.
             * @param {RequestOptions} [options]    - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
             */
            readCollection: function (collectionLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                var that = this;
                this.read(path, "colls", id, undefined, options, function (err, collection, headers) {
                    if (err) return callback(err, collection, headers);
                    that.partitionKeyDefinitionCache[collectionLink] = collection.partitionKey;
                    callback(err, collection, headers);
                });
            },

            /**
             * Reads a document.
             * @memberof DocumentClient
             * @instance
             * @param {string} documentLink         - The self-link of the document.
             * @param {RequestOptions} [options]    - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
             */
            readDocument: function (documentLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(documentLink);
                var path = this.getPathFromLink(documentLink, "", isNameBased);
                var id = this.getIdFromLink(documentLink, isNameBased);

                this.read(path, "docs", id, undefined, options, callback);
            },

            /**
             * Reads an Attachment object.
             * @memberof DocumentClient
             * @instance
             * @param {string} attachmentLink    - The self-link of the attachment.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            readAttachment: function (attachmentLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(attachmentLink);
                var path = this.getPathFromLink(attachmentLink, "", isNameBased);
                var id = this.getIdFromLink(attachmentLink, isNameBased);

                this.read(path, "attachments", id, undefined, options, callback);
            },

            /**
             * Reads a user.
             * @memberof DocumentClient
             * @instance
             * @param {string} userLink          - The self-link of the user.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
             */
            readUser: function (userLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(userLink);
                var path = this.getPathFromLink(userLink, "", isNameBased);
                var id = this.getIdFromLink(userLink, isNameBased);

                this.read(path, "users", id, undefined, options, callback);
            },

            /**
             * Reads a permission.
             * @memberof DocumentClient
             * @instance
             * @param {string} permissionLink    - The self-link of the permission.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
             */
            readPermission: function (permissionLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(permissionLink);
                var path = this.getPathFromLink(permissionLink, "", isNameBased);
                var id = this.getIdFromLink(permissionLink, isNameBased);

                this.read(path, "permissions", id, undefined, options, callback);
            },

            /**
             * Reads a trigger object.
             * @memberof DocumentClient
             * @instance
             * @param {string} triggerLink       - The self-link of the trigger.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
             */
            readTrigger: function (triggerLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var resourceInfo = Base.parseLink(triggerLink);

                var isNameBased = Base.isLinkNameBased(triggerLink);
                var path = this.getPathFromLink(triggerLink, "", isNameBased);
                var id = this.getIdFromLink(triggerLink, isNameBased);

                this.read(path, "triggers", id, undefined, options, callback);
            },

            /**
             * Reads a udf object.
             * @memberof DocumentClient
             * @instance
             * @param {string} udfLink           - The self-link of the user defined function.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
             */
            readUserDefinedFunction: function (udfLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(udfLink);
                var path = this.getPathFromLink(udfLink, "", isNameBased);
                var id = this.getIdFromLink(udfLink, isNameBased);

                this.read(path, "udfs", id, undefined, options, callback);
            },

            /**
             * Reads a StoredProcedure object.
             * @memberof DocumentClient
             * @instance
             * @param {string} sprocLink         - The self-link of the stored procedure.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
             */
            readStoredProcedure: function (sprocLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(sprocLink);
                var path = this.getPathFromLink(sprocLink, "", isNameBased);
                var id = this.getIdFromLink(sprocLink, isNameBased);

                this.read(path, "sprocs", id, undefined, options, callback);
            },

            /**
             * Reads a conflict.
             * @memberof DocumentClient
             * @instance
             * @param {string} conflictLink      - The self-link of the conflict.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
             */
            readConflict: function (conflictLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(conflictLink);
                var path = this.getPathFromLink(conflictLink, "", isNameBased);
                var id = this.getIdFromLink(conflictLink, isNameBased);

                this.read(path, "conflicts", id, undefined, options, callback);
            },

            /** Lists all databases.
             * @memberof DocumentClient
             * @instance
             * @param {FeedOptions} [options] - The feed options.
             * @returns {QueryIterator}       - An instance of queryIterator to handle reading feed.
            */
            readDatabases: function (options) {
                return this.queryDatabases(undefined, options);
            },

            /**
             * Get all collections in this database.
             * @memberof DocumentClient
             * @instance
             * @param {string} databaseLink   - The self-link of the database.
             * @param {FeedOptions} [options] - The feed options.
             * @returns {QueryIterator}       - An instance of queryIterator to handle reading feed.
             */
            readCollections: function (databaseLink, options) {
                return this.queryCollections(databaseLink, undefined, options);
            },

            /**
             * Get all documents in this collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink - The self-link of the collection.
             * @param {FeedOptions} [options] - The feed options.
             * @returns {QueryIterator}       - An instance of queryIterator to handle reading feed.
             */
            readDocuments: function (collectionLink, options) {
                return this.queryDocuments(collectionLink, undefined, options);
            },

            /**
             * Get all Partition key Ranges in this collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink - The self-link of the collection.
             * @param {FeedOptions} [options] - The feed options.
             * @returns {QueryIterator}       - An instance of queryIterator to handle reading feed.
             * @ignore
             */
            readPartitionKeyRanges: function (collectionLink, options) {
                return this.queryPartitionKeyRanges(collectionLink, undefined, options);
            },

            /**
            * Get all attachments for this document.
            * @memberof DocumentClient
            * @instance
            * @param {string} documentLink   - The self-link of the document.
            * @param {FeedOptions} [options] - The feed options.
            * @returns {QueryIterator}       - An instance of queryIterator to handle reading feed.
           */
            readAttachments: function (documentLink, options) {
                return this.queryAttachments(documentLink, undefined, options);
            },

            /**
             * Get all users in this database.
             * @memberof DocumentClient
             * @instance
             * @param {string} databaseLink       - The self-link of the database.
             * @param {FeedOptions} [feedOptions] - The feed options.
             * @returns {QueryIterator}           - An instance of queryIterator to handle reading feed.
             */
            readUsers: function (databaseLink, options) {
                return this.queryUsers(databaseLink, undefined, options);
            },

            /**
             * Get all permissions for this user.
             * @memberof DocumentClient
             * @instance
             * @param {string} userLink           - The self-link of the user.
             * @param {FeedOptions} [feedOptions] - The feed options.
             * @returns {QueryIterator}           - An instance of queryIterator to handle reading feed.
             */
            readPermissions: function (userLink, options) {
                return this.queryPermissions(userLink, undefined, options);
            },

            /**
             * Get all triggers in this collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink   - The self-link of the collection.
             * @param {FeedOptions} [options]   - The feed options.
             * @returns {QueryIterator}         - An instance of queryIterator to handle reading feed.
             */
            readTriggers: function (collectionLink, options) {
                return this.queryTriggers(collectionLink, undefined, options);
            },

            /**
             * Get all UserDefinedFunctions in this collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink - The self-link of the collection.
             * @param {FeedOptions} [options] - The feed options.
             * @returns {QueryIterator}       - An instance of queryIterator to handle reading feed.
             */
            readUserDefinedFunctions: function (collectionLink, options) {
                return this.queryUserDefinedFunctions(collectionLink, undefined, options);
            },

            /**
             * Get all StoredProcedures in this collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink - The self-link of the collection.
             * @param {FeedOptions} [options] - The feed options.
             * @returns {QueryIterator}       - An instance of queryIterator to handle reading feed.
             */
            readStoredProcedures: function (collectionLink, options) {
                return this.queryStoredProcedures(collectionLink, undefined, options);
            },

            /**
             * Get all conflicts in this collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink - The self-link of the collection.
             * @param {FeedOptions} [options] - The feed options.
             * @returns {QueryIterator}       - An instance of QueryIterator to handle reading feed.
             */
            readConflicts: function (collectionLink, options) {
                return this.queryConflicts(collectionLink, undefined, options);
            },

            /** Lists all databases that satisfy a query.
             * @memberof DocumentClient
             * @instance
             * @param {SqlQuerySpec | string} query - A SQL query.
             * @param {FeedOptions} [options]       - The feed options.
             * @returns {QueryIterator}             - An instance of QueryIterator to handle reading feed.
            */
            queryDatabases: function (query, options) {
                var that = this;
                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        "/dbs",
                        "dbs",
                        "",
                        function (result) { return result.Databases; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },

            /**
             * Query the collections for the database.
             * @memberof DocumentClient
             * @instance
             * @param {string} databaseLink           - The self-link of the database.
             * @param {SqlQuerySpec | string} query   - A SQL query.
             * @param {FeedOptions} [options]         - Represents the feed options.
             * @returns {QueryIterator}               - An instance of queryIterator to handle reading feed.
             */
            queryCollections: function (databaseLink, query, options) {
                var that = this;

                var isNameBased = Base.isLinkNameBased(databaseLink);
                var path = this.getPathFromLink(databaseLink, "colls", isNameBased);
                var id = this.getIdFromLink(databaseLink, isNameBased);

                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        path,
                        "colls",
                        id,
                        function (result) { return result.DocumentCollections; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },

            /**
             * Query the documents for the collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} documentsFeedOrDatabaseLink          - The collection link or database link if using a partition resolver
             * @param {SqlQuerySpec | string} query                 - A SQL query.
             * @param {FeedOptions} [options]                       - Represents the feed options.
             * @param {object} [options.partitionKey]               - Optional partition key to be used with the partition resolver
             * @returns {QueryIterator}                             - An instance of queryIterator to handle reading feed.
             */
            queryDocuments: function (documentsFeedOrDatabaseLink, query, options) {
                var partitionResolver = this.partitionResolvers[documentsFeedOrDatabaseLink];
                var collectionLinks;
                if (partitionResolver === undefined || partitionResolver === null) {
                    collectionLinks = [documentsFeedOrDatabaseLink];
                } else {
                    collectionLinks = partitionResolver.resolveForRead(options && options.partitionKey);
                }

                return this.queryDocumentsPrivate(collectionLinks, query, options);
            },

            /**
             * Query the partition key ranges
             * @memberof DocumentClient
             * @instance
             * @param {string} databaseLink           - The self-link of the database.
             * @param {SqlQuerySpec | string} query   - A SQL query.
             * @param {FeedOptions} [options]         - Represents the feed options.
             * @returns {QueryIterator}               - An instance of queryIterator to handle reading feed.
             * @ignore
             */
            queryPartitionKeyRanges: function (collectionLink, query, options) {
                var that = this;

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "pkranges", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        path,
                        "pkranges",
                        id,
                        function (result) { return result.PartitionKeyRanges; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },


            /**
             * Query the attachments for the document.
             * @memberof DocumentClient
             * @instance
             * @param {string} documentLink           - The self-link of the document.
             * @param {SqlQuerySpec | string} query   - A SQL query.
             * @param {FeedOptions} [options]         - Represents the feed options.
             * @returns {QueryIterator}               - An instance of queryIterator to handle reading feed.
            */
            queryAttachments: function (documentLink, query, options) {
                var that = this;

                var isNameBased = Base.isLinkNameBased(documentLink);
                var path = this.getPathFromLink(documentLink, "attachments", isNameBased);
                var id = this.getIdFromLink(documentLink, isNameBased);

                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        path,
                        "attachments",
                        id,
                        function (result) { return result.Attachments; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },

            /**
             * Query the users for the database.
             * @memberof DocumentClient
             * @instance
             * @param {string} databaseLink           - The self-link of the database.
             * @param {SqlQuerySpec | string} query   - A SQL query.
             * @param {FeedOptions} [options]         - Represents the feed options.
             * @returns {QueryIterator}               - An instance of queryIterator to handle reading feed.
             */
            queryUsers: function (databaseLink, query, options) {
                var that = this;

                var isNameBased = Base.isLinkNameBased(databaseLink);
                var path = this.getPathFromLink(databaseLink, "users", isNameBased);
                var id = this.getIdFromLink(databaseLink, isNameBased);

                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        path,
                        "users",
                        id,
                        function (result) { return result.Users; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },

            /**
             * Query the permission for the user.
             * @memberof DocumentClient
             * @instance
             * @param {string} userLink               - The self-link of the user.
             * @param {SqlQuerySpec | string} query   - A SQL query.
             * @param {FeedOptions} [options]         - Represents the feed options.
             * @returns {QueryIterator}               - An instance of queryIterator to handle reading feed.
             */
            queryPermissions: function (userLink, query, options) {
                var that = this;

                var isNameBased = Base.isLinkNameBased(userLink);
                var path = this.getPathFromLink(userLink, "permissions", isNameBased);
                var id = this.getIdFromLink(userLink, isNameBased);

                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        path,
                        "permissions",
                        id,
                        function (result) { return result.Permissions; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },

            /**
             * Query the triggers for the collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink         - The self-link of the collection.
             * @param {SqlQuerySpec | string} query   - A SQL query.
             * @param {FeedOptions} [options]         - Represents the feed options.
             * @returns {QueryIterator}               - An instance of queryIterator to handle reading feed.
             */
            queryTriggers: function (collectionLink, query, options) {
                var that = this;

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "triggers", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        path,
                        "triggers",
                        id,
                        function (result) { return result.Triggers; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },

            /**
             * Query the user defined functions for the collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink         - The self-link of the collection.
             * @param {SqlQuerySpec | string} query   - A SQL query.
             * @param {FeedOptions} [options]         - Represents the feed options.
             * @returns {QueryIterator}               - An instance of queryIterator to handle reading feed.
             */
            queryUserDefinedFunctions: function (collectionLink, query, options) {
                var that = this;

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "udfs", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        path,
                        "udfs",
                        id,
                        function (result) { return result.UserDefinedFunctions; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },

            /**
             * Query the storedProcedures for the collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink         - The self-link of the collection.
             * @param {SqlQuerySpec | string} query   - A SQL query.
             * @param {FeedOptions} [options]         - Represents the feed options.
             * @returns {QueryIterator}               - An instance of queryIterator to handle reading feed.
             */
            queryStoredProcedures: function (collectionLink, query, options) {
                var that = this;

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "sprocs", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        path,
                        "sprocs",
                        id,
                        function (result) { return result.StoredProcedures; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },

            /**
             * Query the conflicts for the collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink         - The self-link of the collection.
             * @param {SqlQuerySpec | string} query   - A SQL query.
             * @param {FeedOptions} [options]         - Represents the feed options.
             * @returns {QueryIterator}               - An instance of queryIterator to handle reading feed.
             */
            queryConflicts: function (collectionLink, query, options) {
                var that = this;

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "conflicts", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        path,
                        "conflicts",
                        id,
                        function (result) { return result.Conflicts; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },

            /**
             * Delete the database object.
             * @memberof DocumentClient
             * @instance
             * @param {string} databaseLink         - The self-link of the database.
             * @param {RequestOptions} [options]    - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
            */
            deleteDatabase: function (databaseLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(databaseLink);
                var path = this.getPathFromLink(databaseLink, "", isNameBased);
                var id = this.getIdFromLink(databaseLink, isNameBased);
                this.deleteResource(path, "dbs", id, undefined, options, callback);
            },

            /**
             * Delete the collection object.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink    - The self-link of the collection.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            deleteCollection: function (collectionLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                this.deleteResource(path, "colls", id, undefined, options, callback);
            },

            /**
             * Delete the document object.
             * @memberof DocumentClient
             * @instance
             * @param {string} documentLink      - The self-link of the document.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            deleteDocument: function (documentLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(documentLink);
                var path = this.getPathFromLink(documentLink, "", isNameBased);
                var id = this.getIdFromLink(documentLink, isNameBased);

                this.deleteResource(path, "docs", id, undefined, options, callback);
            },

            /**
             * Delete the attachment object.
             * @memberof DocumentClient
             * @instance
             * @param {string} attachmentLink    - The self-link of the attachment.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
             */
            deleteAttachment: function (attachmentLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(attachmentLink);
                var path = this.getPathFromLink(attachmentLink, "", isNameBased);
                var id = this.getIdFromLink(attachmentLink, isNameBased);

                this.deleteResource(path, "attachments", id, undefined, options, callback);
            },

            /**
             * Delete the user object.
             * @memberof DocumentClient
             * @instance
             * @param {string} userLink          - The self-link of the user.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            deleteUser: function (userLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(userLink);
                var path = this.getPathFromLink(userLink, "", isNameBased);
                var id = this.getIdFromLink(userLink, isNameBased);

                this.deleteResource(path, "users", id, undefined, options, callback);
            },

            /**
             * Delete the permission object.
             * @memberof DocumentClient
             * @instance
             * @param {string} permissionLink    - The self-link of the permission.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            deletePermission: function (permissionLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(permissionLink);
                var path = this.getPathFromLink(permissionLink, "", isNameBased);
                var id = this.getIdFromLink(permissionLink, isNameBased);

                this.deleteResource(path, "permissions", id, undefined, options, callback);
            },

            /**
             * Delete the trigger object.
             * @memberof DocumentClient
             * @instance
             * @param {string} triggerLink       - The self-link of the trigger.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            deleteTrigger: function (triggerLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(triggerLink);
                var path = this.getPathFromLink(triggerLink, "", isNameBased);
                var id = this.getIdFromLink(triggerLink, isNameBased);

                this.deleteResource(path, "triggers", id, undefined, options, callback);
            },

            /**
             * Delete the UserDefinedFunction object.
             * @memberof DocumentClient
             * @instance
             * @param {string} udfLink           - The self-link of the user defined function.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            deleteUserDefinedFunction: function (udfLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(udfLink);
                var path = this.getPathFromLink(udfLink, "", isNameBased);
                var id = this.getIdFromLink(udfLink, isNameBased);

                this.deleteResource(path, "udfs", id, undefined, options, callback);
            },

            /**
             * Delete the StoredProcedure object.
             * @memberof DocumentClient
             * @instance
             * @param {string} sprocLink         - The self-link of the stored procedure.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            deleteStoredProcedure: function (sprocLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(sprocLink);
                var path = this.getPathFromLink(sprocLink, "", isNameBased);
                var id = this.getIdFromLink(sprocLink, isNameBased);

                this.deleteResource(path, "sprocs", id, undefined, options, callback);
            },

            /**
             * Delete the conflict object.
             * @memberof DocumentClient
             * @instance
             * @param {string} conflictLink      - The self-link of the conflict.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            deleteConflict: function (conflictLink, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var isNameBased = Base.isLinkNameBased(conflictLink);
                var path = this.getPathFromLink(conflictLink, "", isNameBased);
                var id = this.getIdFromLink(conflictLink, isNameBased);

                this.deleteResource(path, "conflicts", id, undefined, options, callback);
            },

            /**
             * Replace the document collection.
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink    - The self-link of the document collection.
             * @param {object} collection        - Represent the new document collection body.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            replaceCollection: function (collectionLink, collection, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(collection, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                this.replace(collection, path, "colls", id, undefined, options, callback);
            },

            /**
             * Replace the document object.
             * @memberof DocumentClient
             * @instance
             * @param {string} documentLink      - The self-link of the document.
             * @param {object} document          - Represent the new document body.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            replaceDocument: function (documentLink, newDocument, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var that = this;

                var task = function () {
                    var err = {};
                    if (!that.isResourceValid(newDocument, err)) {
                        callback(err);
                        return;
                    }

                    var isNameBased = Base.isLinkNameBased(documentLink);
                    var path = that.getPathFromLink(documentLink, "", isNameBased);
                    var id = that.getIdFromLink(documentLink, isNameBased);

                    that.replace(newDocument, path, "docs", id, undefined, options, callback);
                };

                if (options.partitionKey === undefined && options.skipGetPartitionKeyDefinition !== true) {
                    this.getPartitionKeyDefinition(Base.getCollectionLink(documentLink), function (err, partitionKeyDefinition, response, headers) {
                        if (err) return callback(err, response, headers);
                        options.partitionKey = that.extractPartitionKey(newDocument, partitionKeyDefinition);

                        task();
                    });
                }
                else {
                    task();
                }
            },

            /**
             * Replace the attachment object.
             * @memberof DocumentClient
             * @instance
             * @param {string} attachmentLink    - The self-link of the attachment.
             * @param {object} attachment        - Represent the new attachment body.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
             */
            replaceAttachment: function (attachmentLink, attachment, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(attachment, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(attachmentLink);
                var path = this.getPathFromLink(attachmentLink, "", isNameBased);
                var id = this.getIdFromLink(attachmentLink, isNameBased);

                this.replace(attachment, path, "attachments", id, undefined, options, callback);
            },

            /**
             * Replace the user object.
             * @memberof DocumentClient
             * @instance
             * @param {string} userLink          - The self-link of the user.
             * @param {object} user              - Represent the new user body.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            replaceUser: function (userLink, user, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(user, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(userLink);
                var path = this.getPathFromLink(userLink, "", isNameBased);
                var id = this.getIdFromLink(userLink, isNameBased);

                this.replace(user, path, "users", id, undefined, options, callback);
            },

            /**
             * Replace the permission object.
             * @memberof DocumentClient
             * @instance
             * @param {string} permissionLink    - The self-link of the permission.
             * @param {object} permission        - Represent the new permission body.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            replacePermission: function (permissionLink, permission, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(permission, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(permissionLink);
                var path = this.getPathFromLink(permissionLink, "", isNameBased);
                var id = this.getIdFromLink(permissionLink, isNameBased);

                this.replace(permission, path, "permissions", id, undefined, options, callback);
            },

            /**
             * Replace the trigger object.
             * @memberof DocumentClient
             * @instance
             * @param {string} triggerLink       - The self-link of the trigger.
             * @param {object} trigger           - Represent the new trigger body.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            replaceTrigger: function (triggerLink, trigger, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                if (trigger.serverScript) {
                    trigger.body = trigger.serverScript.toString();
                } else if (trigger.body) {
                    trigger.body = trigger.body.toString();
                }

                var err = {};
                if (!this.isResourceValid(trigger, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(triggerLink);
                var path = this.getPathFromLink(triggerLink, "", isNameBased);
                var id = this.getIdFromLink(triggerLink, isNameBased);

                this.replace(trigger, path, "triggers", id, undefined, options, callback);
            },

            /**
             * Replace the UserDefinedFunction object.
             * @memberof DocumentClient
             * @instance
             * @param {string} udfLink           - The self-link of the user defined function.
             * @param {object} udf               - Represent the new udf body.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            replaceUserDefinedFunction: function (udfLink, udf, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                if (udf.serverScript) {
                    udf.body = udf.serverScript.toString();
                } else if (udf.body) {
                    udf.body = udf.body.toString();
                }

                var err = {};
                if (!this.isResourceValid(udf, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(udfLink);
                var path = this.getPathFromLink(udfLink, "", isNameBased);
                var id = this.getIdFromLink(udfLink, isNameBased);

                this.replace(udf, path, "udfs", id, undefined, options, callback);
            },

            /**
             * Replace the StoredProcedure object.
             * @memberof DocumentClient
             * @instance
             * @param {string} sprocLink         - The self-link of the stored procedure.
             * @param {object} sproc             - Represent the new sproc body.
             * @param {RequestOptions} [options] - The request options.
             * @param {RequestCallback} callback - The callback for the request.
            */
            replaceStoredProcedure: function (sprocLink, sproc, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                if (sproc.serverScript) {
                    sproc.body = sproc.serverScript.toString();
                } else if (sproc.body) {
                    sproc.body = sproc.body.toString();
                }

                var err = {};
                if (!this.isResourceValid(sproc, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(sprocLink);
                var path = this.getPathFromLink(sprocLink, "", isNameBased);
                var id = this.getIdFromLink(sprocLink, isNameBased);

                this.replace(sproc, path, "sprocs", id, undefined, options, callback);
            },

            /**
             * Upsert a document.
             * <p>
             * There is no set schema for JSON documents. They may contain any number of custom properties as well as an optional list of attachments. <br>
             * A Document is an application resource and can be authorized using the master key or resource keys
             * </p>
             * @memberof DocumentClient
             * @instance
             * @param {string} documentsFeedOrDatabaseLink               - The collection link or database link if using a partition resolver
             * @param {object} body                                      - Represents the body of the document. Can contain any number of user defined properties.
             * @param {string} [body.id]                                 - The id of the document, MUST be unique for each document.
             * @param {number} body.ttl                                  - The time to live in seconds of the document.
             * @param {RequestOptions} [options]                         - The request options.
             * @param {boolean} [options.disableAutomaticIdGeneration]   - Disables the automatic id generation. If id is missing in the body and this option is true, an error will be returned.
             * @param {RequestCallback} callback                         - The callback for the request.
             */
            upsertDocument: function (documentsFeedOrDatabaseLink, body, options, callback) {
                var partitionResolver = this.partitionResolvers[documentsFeedOrDatabaseLink];

                var collectionLink;
                if (partitionResolver === undefined || partitionResolver === null) {
                    collectionLink = documentsFeedOrDatabaseLink;
                } else {
                    collectionLink = this.resolveCollectionLinkForCreate(partitionResolver, body);
                }

                this.upsertDocumentPrivate(collectionLink, body, options, callback);
            },

            /**
             * Upsert an attachment for the document object.
             * <p>
             * Each document may contain zero or more attachments. Attachments can be of any MIME type - text, image, binary data. <br>
             * These are stored externally in Azure Blob storage. Attachments are automatically deleted when the parent document is deleted.
             * </P>
             * @memberof DocumentClient
             * @instance
             * @param {string} documentLink         - The self-link of the document.
             * @param {Object} body                 - The metadata the defines the attachment media like media, contentType. It can include any other properties as part of the metedata.
             * @param {string} body.contentType     - The MIME contentType of the attachment.
             * @param {string} body.media           - Media link associated with the attachment content.
             * @param {RequestOptions} options      - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
            */
            upsertAttachment: function (documentLink, body, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(body, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(documentLink);
                var path = this.getPathFromLink(documentLink, "attachments", isNameBased);
                var id = this.getIdFromLink(documentLink, isNameBased);

                this.upsert(body, path, "attachments", id, undefined, options, callback);
            },

            /**
             * Upsert a database user.
             * @memberof DocumentClient
             * @instance
             * @param {string} databaseLink         - The self-link of the database.
             * @param {object} body                 - Represents the body of the user.
             * @param {string} body.id              - The id of the user.
             * @param {RequestOptions} [options]    - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
             */
            upsertUser: function (databaseLink, body, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(body, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(databaseLink);
                var path = this.getPathFromLink(databaseLink, "users", isNameBased);
                var id = this.getIdFromLink(databaseLink, isNameBased);

                this.upsert(body, path, "users", id, undefined, options, callback);
            },

            /**
             * Upsert a permission.
             * <p> A permission represents a per-User Permission to access a specific resource e.g. Document or Collection.  </p>
             * @memberof DocumentClient
             * @instance
             * @param {string} userLink             - The self-link of the user.
             * @param {object} body                 - Represents the body of the permission.
             * @param {string} body.id              - The id of the permission
             * @param {string} body.permissionMode  - The mode of the permission, must be a value of {@link PermissionMode}
             * @param {string} body.resource        - The link of the resource that the permission will be applied to.
             * @param {RequestOptions} [options]    - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
             */
            upsertPermission: function (userLink, body, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var err = {};
                if (!this.isResourceValid(body, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(userLink);
                var path = this.getPathFromLink(userLink, "permissions", isNameBased);
                var id = this.getIdFromLink(userLink, isNameBased);

                this.upsert(body, path, "permissions", id, undefined, options, callback);
            },

            /**
            * Upsert a trigger.
            * <p>
            * DocumentDB supports pre and post triggers defined in JavaScript to be executed on creates, updates and deletes. <br>
            * For additional details, refer to the server-side JavaScript API documentation.
            * </p>
            * @memberof DocumentClient
            * @instance
            * @param {string} collectionLink           - The self-link of the collection.
            * @param {object} trigger                  - Represents the body of the trigger.
            * @param {string} trigger.id             - The id of the trigger.
            * @param {string} trigger.triggerType      - The type of the trigger, should be one of the values of {@link TriggerType}.
            * @param {string} trigger.triggerOperation - The trigger operation, should be one of the values of {@link TriggerOperation}.
            * @param {function} trigger.serverScript   - The body of the trigger, it can be passed as stringified too.
            * @param {RequestOptions} [options]        - The request options.
            * @param {RequestCallback} callback        - The callback for the request.
            */
            upsertTrigger: function (collectionLink, trigger, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                if (trigger.serverScript) {
                    trigger.body = trigger.serverScript.toString();
                } else if (trigger.body) {
                    trigger.body = trigger.body.toString();
                }

                var err = {};
                if (!this.isResourceValid(trigger, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "triggers", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                this.upsert(trigger, path, "triggers", id, undefined, options, callback);
            },

            /**
             * Upsert a UserDefinedFunction.
             * <p>
             * DocumentDB supports JavaScript UDFs which can be used inside queries, stored procedures and triggers. <br>
             * For additional details, refer to the server-side JavaScript API documentation.
             * </p>
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink                - The self-link of the collection.
             * @param {object} udf                           - Represents the body of the userDefinedFunction.
             * @param {string} udf.id                      - The id of the udf.
             * @param {string} udf.userDefinedFunctionType   - The type of the udf, it should be one of the values of {@link UserDefinedFunctionType}
             * @param {function} udf.serverScript            - Represents the body of the udf, it can be passed as stringified too.
             * @param {RequestOptions} [options]             - The request options.
             * @param {RequestCallback} callback             - The callback for the request.
             */
            upsertUserDefinedFunction: function (collectionLink, udf, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                if (udf.serverScript) {
                    udf.body = udf.serverScript.toString();
                } else if (udf.body) {
                    udf.body = udf.body.toString();
                }

                var err = {};
                if (!this.isResourceValid(udf, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "udfs", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                this.upsert(udf, path, "udfs", id, undefined, options, callback);
            },

            /**
             * Upsert a StoredProcedure.
             * <p>
             * DocumentDB allows stored procedures to be executed in the storage tier, directly against a document collection. The script <br>
             * gets executed under ACID transactions on the primary storage partition of the specified collection. For additional details, <br>
             * refer to the server-side JavaScript API documentation.
             * </p>
             * @memberof DocumentClient
             * @instance
             * @param {string} collectionLink       - The self-link of the collection.
             * @param {object} sproc                - Represents the body of the stored procedure.
             * @param {string} sproc.id           - The id of the stored procedure.
             * @param {function} sproc.serverScript - The body of the stored procedure, it can be passed as stringified too.
             * @param {RequestOptions} [options]    - The request options.
             * @param {RequestCallback} callback    - The callback for the request.
             */
            upsertStoredProcedure: function (collectionLink, sproc, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                if (sproc.serverScript) {
                    sproc.body = sproc.serverScript.toString();
                } else if (sproc.body) {
                    sproc.body = sproc.body.toString();
                }

                var err = {};
                if (!this.isResourceValid(sproc, err)) {
                    callback(err);
                    return;
                }

                var isNameBased = Base.isLinkNameBased(collectionLink);
                var path = this.getPathFromLink(collectionLink, "sprocs", isNameBased);
                var id = this.getIdFromLink(collectionLink, isNameBased);

                this.upsert(sproc, path, "sprocs", id, undefined, options, callback);
            },

            /**
             * Upsert an attachment for the document object.
             * @memberof DocumentClient
             * @instance
             * @param {string} documentLink             - The self-link of the document.
             * @param {stream.Readable} readableStream  - the stream that represents the media itself that needs to be uploaded.
             * @param {MediaOptions} [options]          - The request options.
             * @param {RequestCallback} callback        - The callback for the request.
            */
            upsertAttachmentAndUploadMedia: function (documentLink, readableStream, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var initialHeaders = Base.extend({}, this.defaultHeaders);
                initialHeaders = Base.extend(initialHeaders, options && options.initialHeaders);

                // Add required headers slug and content-type.
                if (options.slug) {
                    initialHeaders[Constants.HttpHeaders.Slug] = options.slug;
                }

                if (options.contentType) {
                    initialHeaders[Constants.HttpHeaders.ContentType] = options.contentType;
                } else {
                    initialHeaders[Constants.HttpHeaders.ContentType] = Constants.MediaTypes.OctetStream;
                }

                var isNameBased = Base.isLinkNameBased(documentLink);
                var path = this.getPathFromLink(documentLink, "attachments", isNameBased);
                var id = this.getIdFromLink(documentLink, isNameBased);

                this.upsert(readableStream, path, "attachments", id, initialHeaders, options, callback);
            },

            /**
              * Read the media for the attachment object.
              * @memberof DocumentClient
              * @instance
              * @param {string} mediaLink         - The media link of the media in the attachment.
              * @param {RequestCallback} callback - The callback for the request, the result parameter can be a buffer or a stream
              *                                     depending on the value of {@link MediaReadMode}.
              */
            readMedia: function (mediaLink, callback) {
                var resourceInfo = Base.parseLink(mediaLink);
                var path = "/" + mediaLink;
                var initialHeaders = Base.extend({}, this.defaultHeaders);
                initialHeaders[Constants.HttpHeaders.Accept] = Constants.MediaTypes.Any;
                var attachmentId = Base.getAttachmentIdFromMediaId(resourceInfo.objectBody.id).toLowerCase();

                var that = this;
                Base.getHeaders(this, initialHeaders, "get", path, attachmentId, "media", {}).then(function (headers) {
                    // readMedia will always use WriteEndpoint since it's not replicated in readable Geo regions
                    that._globalEndpointManager.getWriteEndpoint(function (writeEndpoint) {
                        that.get(writeEndpoint, path, headers, callback);
                    });
                });
            },

            /**
             * Update media for the attachment
             * @memberof DocumentClient
             * @instance
             * @param {string} mediaLink                - The media link of the media in the attachment.
             * @param {stream.Readable} readableStream  - The stream that represents the media itself that needs to be uploaded.
             * @param {MediaOptions} [options]          - options for the media
             * @param {RequestCallback} callback        - The callback for the request.
             */
            updateMedia: function (mediaLink, readableStream, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var defaultHeaders = this.defaultHeaders;
                var initialHeaders = Base.extend({}, defaultHeaders);
                initialHeaders = Base.extend(initialHeaders, options && options.initialHeaders);

                // Add required headers slug and content-type in case the body is a stream
                if (options.slug) {
                    initialHeaders[Constants.HttpHeaders.Slug] = options.slug;
                }

                if (options.contentType) {
                    initialHeaders[Constants.HttpHeaders.ContentType] = options.contentType;
                } else {
                    initialHeaders[Constants.HttpHeaders.ContentType] = Constants.MediaTypes.OctetStream;
                }

                initialHeaders[Constants.HttpHeaders.Accept] = Constants.MediaTypes.Any;

                var resourceInfo = Base.parseLink(mediaLink);
                var path = "/" + mediaLink;
                var attachmentId = Base.getAttachmentIdFromMediaId(resourceInfo.objectBody.id).toLowerCase();

                var that = this;
                Base.getHeaders(this, initialHeaders, "put", path, attachmentId, "media", options).then(function (headers) {
                    // updateMedia will use WriteEndpoint since it uses PUT operation
                    that._globalEndpointManager.getWriteEndpoint(function (writeEndpoint) {
                        that.put(writeEndpoint, path, readableStream, headers, callback);
                    });
                });
            },

            /**
             * Execute the StoredProcedure represented by the object with partition key.
             * @memberof DocumentClient
             * @instance
             * @param {string} sprocLink            - The self-link of the stored procedure.
             * @param {Array} [params]              - represent the parameters of the stored procedure.
             * @param {Object} [options]            - partition key
             * @param {RequestCallback} callback    - The callback for the request.
            */
            executeStoredProcedure: function (sprocLink, params, options, callback) {
                if (!callback && !options) {
                    callback = params;
                    params = null;
                    options = {}
                }
                else if (!callback) {
                    callback = options;
                    options = {};
                }

                var defaultHeaders = this.defaultHeaders;
                var initialHeaders = {};
                initialHeaders = Base.extend(initialHeaders, defaultHeaders);
                initialHeaders = Base.extend(initialHeaders, options && options.initialHeaders);

                // Accept a single parameter or an array of parameters.
                if (params !== null && params !== undefined && params.constructor !== Array) {
                    params = [params];
                }

                var isNameBased = Base.isLinkNameBased(sprocLink);
                var path = this.getPathFromLink(sprocLink, "", isNameBased);
                var id = this.getIdFromLink(sprocLink, isNameBased);

                var that = this;
                Base.getHeaders(this, initialHeaders, "post", path, id, "sprocs", options).then(function (headers) {
                    // executeStoredProcedure will use WriteEndpoint since it uses POST operation
                    that._globalEndpointManager.getWriteEndpoint(function (writeEndpoint) {
                        that.post(writeEndpoint, path, params, headers, callback);
                    });
                });
            },

            /**
             * Replace the offer object.
             * @memberof DocumentClient
             * @instance
             * @param {string} offerLink         - The self-link of the offer.
             * @param {object} offer             - Represent the new offer body.
             * @param {RequestCallback} callback - The callback for the request.
             */
            replaceOffer: function (offerLink, offer, callback) {
                var err = {};
                if (!this.isResourceValid(offer, err)) {
                    callback(err);
                    return;
                }

                var path = "/" + offerLink;
                var id = Base.parseLink(offerLink).objectBody.id.toLowerCase();
                this.replace(offer, path, "offers", id, undefined, {}, callback);
            },

            /** Reads an offer.
             * @memberof DocumentClient
             * @instance
             * @param {string} offerLink         - The self-link of the offer.
             * @param {RequestCallback} callback    - The callback for the request.
            */
            readOffer: function (offerLink, callback) {
                var path = "/" + offerLink;
                var id = Base.parseLink(offerLink).objectBody.id.toLowerCase();
                this.read(path, "offers", id, undefined, {}, callback);
            },

            /** Lists all offers.
             * @memberof DocumentClient
             * @instance
             * @param {FeedOptions} [options] - The feed options.
             * @returns {QueryIterator}       - An instance of queryIterator to handle reading feed.
            */
            readOffers: function (options) {
                return this.queryOffers(undefined, options);
            },

            /** Lists all offers that satisfy a query.
             * @memberof DocumentClient
             * @instance
             * @param {SqlQuerySpec | string} query - A SQL query.
             * @param {FeedOptions} [options]       - The feed options.
             * @returns {QueryIterator}             - An instance of QueryIterator to handle reading feed.
            */
            queryOffers: function (query, options) {
                var that = this;
                return new QueryIterator(this, query, options, function (options, callback) {
                    that.queryFeed.call(that,
                        that,
                        "/offers",
                        "offers",
                        "",
                        function (result) { return result.Offers; },
                        function (parent, body) { return body; },
                        query,
                        options,
                        callback);
                });
            },

            /** Gets the Database account information.
           * @memberof DocumentClient
           * @instance
           * @param {string} [options.urlConnection]   - The endpoint url whose database account needs to be retrieved. If not present, current client's url will be used.
           * @param {RequestCallback} callback         - The callback for the request. The second parameter of the callback will be of type {@link DatabaseAccount}.
           */
            getDatabaseAccount: function (options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var urlConnection = options.urlConnection || this.urlConnection;

                Base.getHeaders(this, this.defaultHeaders, "get", "", "", "", {}).then(function (headers) {
                    this.get(urlConnection, "", headers, function (err, result, headers) {
                        if (err) return callback(err);
                        var databaseAccount = new AzureDocuments.DatabaseAccount();
                        databaseAccount.DatabasesLink = "/dbs/";
                        databaseAccount.MediaLink = "/media/";
                        databaseAccount.MaxMediaStorageUsageInMB = headers[Constants.HttpHeaders.MaxMediaStorageUsageInMB];
                        databaseAccount.CurrentMediaStorageUsageInMB = headers[Constants.HttpHeaders.CurrentMediaStorageUsageInMB];
                        databaseAccount.ConsistencyPolicy = result.userConsistencyPolicy;

                        // WritableLocations and ReadableLocations properties will be available only for geo-replicated database accounts
                        if (Constants.WritableLocations in result) {
                            databaseAccount._writableLocations = result[Constants.WritableLocations];
                        }
                        if (Constants.ReadableLocations in result) {
                            databaseAccount._readableLocations = result[Constants.ReadableLocations];
                        }

                        callback(undefined, databaseAccount, headers);
                    });
                });
            },

            /** @ignore */
            createDocumentPrivate: function (collectionLink, body, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var that = this;

                var task = function () {
                    // Generate random document id if the id is missing in the payload and options.disableAutomaticIdGeneration != true
                    if ((body.id === undefined || body.id === "") && !options.disableAutomaticIdGeneration) {
                        body.id = Base.generateGuidId();
                    }

                    var err = {};
                    if (!that.isResourceValid(body, err)) {
                        callback(err);
                        return;
                    }

                    var isNameBased = Base.isLinkNameBased(collectionLink);
                    var path = that.getPathFromLink(collectionLink, "docs", isNameBased);
                    var id = that.getIdFromLink(collectionLink, isNameBased);

                    that.create(body, path, "docs", id, undefined, options, callback);
                };

                if (options.partitionKey === undefined && options.skipGetPartitionKeyDefinition !== true) {
                    this.getPartitionKeyDefinition(collectionLink, function (err, partitionKeyDefinition, response, headers) {
                        if (err) return callback(err, response, headers);
                        options.partitionKey = that.extractPartitionKey(body, partitionKeyDefinition);

                        task();
                    });
                }
                else {
                    task();
                }
            },

            /** @ignore */
            upsertDocumentPrivate: function (collectionLink, body, options, callback) {
                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var that = this;

                var task = function () {
                    // Generate random document id if the id is missing in the payload and options.disableAutomaticIdGeneration != true
                    if ((body.id === undefined || body.id === "") && !options.disableAutomaticIdGeneration) {
                        body.id = Base.generateGuidId();
                    }

                    var err = {};
                    if (!that.isResourceValid(body, err)) {
                        callback(err);
                        return;
                    }

                    var isNameBased = Base.isLinkNameBased(collectionLink);
                    var path = that.getPathFromLink(collectionLink, "docs", isNameBased);
                    var id = that.getIdFromLink(collectionLink, isNameBased);

                    that.upsert(body, path, "docs", id, undefined, options, callback);
                };

                if (options.partitionKey === undefined && options.skipGetPartitionKeyDefinition !== true) {
                    this.getPartitionKeyDefinition(collectionLink, function (err, partitionKeyDefinition, response, headers) {
                        if (err) return callback(err, response, headers);
                        options.partitionKey = that.extractPartitionKey(body, partitionKeyDefinition);

                        task();
                    });
                }
                else {
                    task();
                }
            },

            /** @ignore */
            queryDocumentsPrivate: function (collectionLinks, query, options) {
                var that = this;

                var fetchFunctions = Base.map(collectionLinks, function (collectionLink) {
                    var isNameBased = Base.isLinkNameBased(collectionLink);
                    var path = that.getPathFromLink(collectionLink, "docs", isNameBased);
                    var id = that.getIdFromLink(collectionLink, isNameBased);

                    return function (options, callback) {
                        that.queryFeed.call(that,
                            that,
                            path,
                            "docs",
                            id,
                            function (result) { return result.Documents; },
                            function (parent, body) { return body; },
                            query,
                            options,
                            callback);
                    };
                });

                return new QueryIterator(this, query, options, fetchFunctions, collectionLinks);
            },

            /** @ignore */
            create: function (body, path, type, id, initialHeaders, options, callback) {
                initialHeaders = initialHeaders || Base.extend({}, this.defaultHeaders);
                initialHeaders = Base.extend(initialHeaders, options && options.initialHeaders);

                var that = this;
                Base.getHeaders(this, initialHeaders, "post", path, id, type, options).then(function (headers) {
                    // create will use WriteEndpoint since it uses POST operation
                    that._globalEndpointManager.getWriteEndpoint(function (writeEndpoint) {
                        that.post(writeEndpoint, path, body, headers, callback);
                    });
                });
            },

            /** @ignore */
            upsert: function (body, path, type, id, initialHeaders, options, callback) {
                initialHeaders = initialHeaders || Base.extend({}, this.defaultHeaders);
                initialHeaders = Base.extend(initialHeaders, options && options.initialHeaders);

                var that = this;
                Base.getHeaders(this, initialHeaders, "post", path, id, type, options).then(function (headers) {
                    that.setIsUpsertHeader(headers);
                    // upsert will use WriteEndpoint since it uses POST operation
                    that._globalEndpointManager.getWriteEndpoint(function (writeEndpoint) {
                        that.post(writeEndpoint, path, body, headers, callback);
                    });
                });
            },

            /** @ignore */
            replace: function (resource, path, type, id, initialHeaders, options, callback) {
                initialHeaders = initialHeaders || Base.extend({}, this.defaultHeaders);
                initialHeaders = Base.extend(initialHeaders, options && options.initialHeaders);

                var that = this;
                Base.getHeaders(this, initialHeaders, "put", path, id, type, options).then(function (headers) {

                    // replace will use WriteEndpoint since it uses PUT operation
                    that._globalEndpointManager.getWriteEndpoint(function (writeEndpoint) {
                        that.put(writeEndpoint, path, resource, headers, callback);
                    });
                });
            },

            /** @ignore */
            read: function (path, type, id, initialHeaders, options, callback) {
                initialHeaders = initialHeaders || Base.extend({}, this.defaultHeaders);
                initialHeaders = Base.extend(initialHeaders, options && options.initialHeaders);

                var that = this;
                Base.getHeaders(this, initialHeaders, "get", path, id, type, options).then(function (headers) {

                    // read will use ReadEndpoint since it uses GET operation
                    that._globalEndpointManager.getReadEndpoint(function (readEndpoint) {
                        that.get(readEndpoint, path, headers, callback);
                    });
                });
            },

            /** @ignore */
            deleteResource: function (path, type, id, initialHeaders, options, callback) {
                initialHeaders = initialHeaders || Base.extend({}, this.defaultHeaders);
                initialHeaders = Base.extend(initialHeaders, options && options.initialHeaders);

                var that = this;
                Base.getHeaders(this, initialHeaders, "delete", path, id, type, options).then(function (headers) {

                    // deleteResource will use WriteEndpoint since it uses DELETE operation
                    that._globalEndpointManager.getWriteEndpoint(function (writeEndpoint) {
                        that.delete(writeEndpoint, path, headers, callback);
                    });
                });
            },

            /** @ignore */
            get: function (url, path, headers, callback) {
                return RequestHandler.request(this._globalEndpointManager, this.connectionPolicy, "GET", url, path, undefined, this.defaultUrlParams, headers, callback);
            },

            /** @ignore */
            post: function (url, path, body, headers, callback) {
                return RequestHandler.request(this._globalEndpointManager, this.connectionPolicy, "POST", url, path, body, this.defaultUrlParams, headers, callback);
            },

            /** @ignore */
            put: function (url, path, body, headers, callback) {
                return RequestHandler.request(this._globalEndpointManager, this.connectionPolicy, "PUT", url, path, body, this.defaultUrlParams, headers, callback);
            },

            /** @ignore */
            head: function (url, path, headers, callback) {
                return RequestHandler.request(this._globalEndpointManager, this.connectionPolicy, "HEAD", url, path, undefined, this.defaultUrlParams, headers, callback);
            },

            /** @ignore */
            delete: function (url, path, headers, callback) {
                return RequestHandler.request(this._globalEndpointManager, this.connectionPolicy, "DELETE", url, path, undefined, this.defaultUrlParams, headers, callback);
            },

            /** Gets the partition key definition first by looking into the cache otherwise by reading the collection.
            * @ignore
            * @param {string} collectionLink   - Link to the collection whose partition key needs to be extracted.
            * @param {function} callback       - The arguments to the callback are(in order): error, partitionKeyDefinition, response object and response headers
            */
            getPartitionKeyDefinition: function (collectionLink, callback) {
                // $ISSUE-felixfan-2016-03-17: Make name based path and link based path use the same key
                // $ISSUE-felixfan-2016-03-17: Refresh partitionKeyDefinitionCache when necessary
                if (collectionLink in this.partitionKeyDefinitionCache) {
                    return callback(undefined, this.partitionKeyDefinitionCache[collectionLink]);
                }

                var that = this;

                this.readCollection(collectionLink, function (err, collection, headers) {
                    if (err) return callback(err, undefined, collection, headers);
                    callback(err, that.partitionKeyDefinitionCache[collectionLink], collection, headers);
                });
            },

            extractPartitionKey: function (document, partitionKeyDefinition) {
                if (partitionKeyDefinition && partitionKeyDefinition.paths && partitionKeyDefinition.paths.length > 0) {
                    var partitionKey = [];
                    partitionKeyDefinition.paths.forEach(function (path) {
                        var pathParts = Base.parsePath(path);

                        var obj = document;
                        for (var i = 0; i < pathParts.length; ++i) {
                            if (!(pathParts[i] in obj)) {
                                obj = {};
                                break;
                            }

                            obj = obj[pathParts[i]];
                        }

                        partitionKey.push(obj);
                    });

                    return partitionKey;
                }

                return undefined;
            },

            /** @ignore */
            queryFeed: function (documentclient, path, type, id, resultFn, createFn, query, options, callback, partitionKeyRangeId) {
                var that = this;

                var optionsCallbackTuple = this.validateOptionsAndCallback(options, callback);
                options = optionsCallbackTuple.options;
                callback = optionsCallbackTuple.callback;

                var successCallback = function (err, result, responseHeaders) {
                    if (err) return callback(err, undefined, responseHeaders);
                    var bodies;
                    if (query) {
                        bodies = resultFn(result);
                    }
                    else {
                        bodies = Base.map(resultFn(result), function (body) {
                            return createFn(that, body);
                        });
                    }

                    callback(undefined, bodies, responseHeaders);
                };

                // Query operations will use ReadEndpoint even though it uses GET(for queryFeed) and POST(for regular query operations)
                this._globalEndpointManager.getReadEndpoint(function (readEndpoint) {
                    var initialHeaders = Base.extend({}, documentclient.defaultHeaders);
                    initialHeaders = Base.extend(initialHeaders, options && options.initialHeaders);
                    if (query === undefined) {
                        Base.getHeaders(documentclient, initialHeaders, "get", path, id, type, options, partitionKeyRangeId).then(function (headers) {
                            documentclient.get(readEndpoint, path, headers, successCallback);
                        });
                    } else {
                        initialHeaders[Constants.HttpHeaders.IsQuery] = "true";
                        switch (that.queryCompatibilityMode) {
                            case AzureDocuments.QueryCompatibilityMode.SqlQuery:
                                initialHeaders[Constants.HttpHeaders.ContentType] = Constants.MediaTypes.SQL;
                                break;
                            case AzureDocuments.QueryCompatibilityMode.Query:
                            case AzureDocuments.QueryCompatibilityMode.Default:
                            default:
                                if (typeof query === "string") {
                                    query = { query: query };  // Converts query text to query object.
                                }
                                initialHeaders[Constants.HttpHeaders.ContentType] = Constants.MediaTypes.QueryJson;
                                break;
                        }

                        Base.getHeaders(documentclient, initialHeaders, "post", path, id, type, options, partitionKeyRangeId).then(function (headers) {
                            documentclient.post(readEndpoint, path, query, headers, successCallback);
                        });
                    }
                });
            },

            /** @ignore */
            isResourceValid: function (resource, err) {
                if (resource.id) {
                    if (typeof resource.id !== "string") {
                        err.message = "Id must be a string.";
                        return false;
                    }

                    if (resource.id.indexOf("/") !== -1 || resource.id.indexOf("\\") !== -1 || resource.id.indexOf("?") !== -1 || resource.id.indexOf("#") !== -1) {
                        err.message = "Id contains illegal chars.";
                        return false;
                    }
                    if (resource.id[resource.id.length - 1] === " ") {
                        err.message = "Id ends with a space.";
                        return false;
                    }
                }
                return true;
            },

            /** @ignore */
            resolveCollectionLinkForCreate: function (partitionResolver, document) {
                var validation = this.isPartitionResolverValid(partitionResolver);
                if (!validation.valid) {
                    throw validation.error;
                }

                var partitionKey = partitionResolver.getPartitionKey(document);
                return partitionResolver.resolveForCreate(partitionKey);
            },

            /** @ignore */
            isPartitionResolverValid: function (partionResolver) {
                if (partionResolver === null || partionResolver === undefined) {
                    return {
                        valid: false,
                        error: new Error("The partition resolver is null or undefined")
                    };
                }

                var validation = this.isPartitionResolveFunctionDefined(partionResolver, "getPartitionKey");
                if (!validation.valid) {
                    return validation;
                }
                validation = this.isPartitionResolveFunctionDefined(partionResolver, "resolveForCreate");
                if (!validation.valid) {
                    return validation;
                }
                validation = this.isPartitionResolveFunctionDefined(partionResolver, "resolveForRead");
                return validation;
            },

            /** @ignore */
            isPartitionResolveFunctionDefined: function (partionResolver, functionName) {
                if (partionResolver === null || partionResolver === undefined) {
                    return {
                        valid: false,
                        error: new Error("The partition resolver is null or undefined")
                    };
                }

                if (typeof partionResolver[functionName] === "function") {
                    return {
                        valid: true
                    };
                } else {
                    return {
                        valid: false,
                        error: new Error(util.format("The partition resolver does not implement method %s. The type of %s is \"%s\"", functionName, functionName, typeof partionResolver[functionName]))
                    };
                }
            },

            /** @ignore */
            getIdFromLink: function (resourceLink, isNameBased) {
                if (isNameBased) {
                    return resourceLink;
                } else {
                    return Base.parseLink(resourceLink).objectBody.id.toLowerCase();
                }
            },

            /** @ignore */
            getPathFromLink: function (resourceLink, resourceType, isNameBased) {
                if (isNameBased) {
                    if (resourceType) {
                        return "/" + encodeURI(resourceLink) + "/" + resourceType;
                    } else {
                        return "/" + encodeURI(resourceLink);
                    }
                } else {
                    if (resourceType) {
                        return "/" + resourceLink + resourceType + "/";
                    } else {
                        return "/" + resourceLink;
                    }
                }
            },

            /** @ignore */
            setIsUpsertHeader: function (headers) {
                if (headers === undefined || headers === null) {
                    throw new Error('The "headers" parameter must not be null or undefined');
                }

                if (!(headers instanceof Object)) {
                    throw new Error(util.format('The "headers" parameter must be an instance of "Object". Actual type is: "%s".', typeof headers));
                }

                headers[Constants.HttpHeaders.IsUpsert] = true;
            },

            /** @ignore */
            validateOptionsAndCallback: function (optionsIn, callbackIn) {
                var options, callback;

                // options
                if (optionsIn === undefined) {
                    options = new Object();
                } else if (callbackIn === undefined && typeof optionsIn === 'function') {
                    callback = optionsIn;
                    options = new Object();
                } else if (typeof optionsIn !== 'object') {
                    throw new Error(util.format('The "options" parameter must be of type "object". Actual type is: "%s".', typeof optionsIn));
                } else {
                    options = optionsIn;
                }

                // callback
                if (callbackIn !== undefined && typeof callbackIn !== 'function') {
                    throw new Error(util.format('The "callback" parameter must be of type "function". Actual type is: "%s".', typeof callbackIn));
                } else if (typeof callbackIn === 'function') {
                    callback = callbackIn
                }

                return { options: options, callback: callback };
            }
        }
    );
    /**
         * This class implements the retry policy for endpoint discovery.
         * @property {int} _maxRetryAttemptCount                           - Max number of retry attempts to perform.
         * @property {int} currentRetryAttemptCount                        - Current retry attempt count.
         * @property {object} globalEndpointManager                        - The GlobalEndpointManager instance.
         * @property {int} retryAfterInMilliseconds                        - Retry interval in milliseconds.
    */
    var EndpointDiscoveryRetryPolicy = Base.defineClass(
        /**
         * @constructor EndpointDiscoveryRetryPolicy
         * @param {object} globalEndpointManager                           - The GlobalEndpointManager instance.
        */
        function (globalEndpointManager) {
            this._maxRetryAttemptCount = EndpointDiscoveryRetryPolicy.maxRetryAttemptCount;
            this.currentRetryAttemptCount = 0;
            this.globalEndpointManager = globalEndpointManager;
            this.retryAfterInMilliseconds = EndpointDiscoveryRetryPolicy.retryAfterInMilliseconds;
        },
        {
            /**
             * Determines whether the request should be retried or not.
             * @param {object} err - Error returned by the request.
             * @param {function} callback - The callback function which takes bool argument which specifies whether the request will be retried or not.
            */
            shouldRetry: function (err, callback) {
                if (err) {
                    if (this.currentRetryAttemptCount < this._maxRetryAttemptCount && this.globalEndpointManager.enableEndpointDiscovery) {
                        this.currentRetryAttemptCount++;
                        console.log("Write region was changed, refreshing the regions list from database account and will retry the request.");
                        var that = this;
                        this.globalEndpointManager.refreshEndpointList(function (writeEndpoint, readEndpoint) {
                            that.globalEndpointManager.setWriteEndpoint(writeEndpoint);
                            that.globalEndpointManager.setReadEndpoint(readEndpoint);
                            callback(true);
                        });
                        return;
                    }
                }
                return callback(false);
            }
        },
        {
            maxRetryAttemptCount: 120,
            retryAfterInMilliseconds: 1000,
            FORBIDDEN_STATUS_CODE: 403,
            WRITE_FORBIDDEN_SUB_STATUS_CODE: 3
        }
    );
    /**
         * This internal class implements the logic for endpoint management for geo-replicated
           database accounts.
         * @property {object} client                       - The document client instance.
         * @property {string} defaultEndpoint              - The endpoint used to create the client instance.
         * @property {bool} enableEndpointDiscovery        - Flag to enable/disable automatic redirecting of requests based on read/write operations.
         * @property {Array} preferredLocations            - List of azure regions to be used as preferred locations for read requests.
         * @property {bool} isEndpointCacheInitialized     - Flag to determine whether the endpoint cache is initialized or not.
    */
    var GlobalEndpointManager = Base.defineClass(
        /**
         * @constructor GlobalEndpointManager
         * @param {object} client                          - The document client instance.
        */
        function (client) {
            this.client = client;
            this.defaultEndpoint = client.urlConnection;
            this._readEndpoint = client.urlConnection;
            this._writeEndpoint = client.urlConnection;
            this.enableEndpointDiscovery = client.connectionPolicy.EnableEndpointDiscovery;
            this.preferredLocations = client.connectionPolicy.PreferredLocations;
            this.isEndpointCacheInitialized = false;
        },
        {
            /** Gets the current read endpoint from the endpoint cache.
             * @memberof GlobalEndpointManager
             * @instance
             * @param {function} callback        - The callback function which takes readEndpoint(string) as an argument.
            */
            getReadEndpoint: function (callback) {
                if (!this.isEndpointCacheInitialized) {
                    this.refreshEndpointList(function (writeEndpoint, readEndpoint) {
                        callback(readEndpoint);
                    });
                } else {
                    callback(this._readEndpoint);
                }
            },

            /** Sets the current read endpoint.
             * @memberof GlobalEndpointManager
             * @instance
             * @param {string} readEndpoint        - The endpoint to be set as readEndpoint.
            */
            setReadEndpoint: function (readEndpoint) {
                this._readEndpoint = readEndpoint;
            },

            /** Gets the current write endpoint from the endpoint cache.
             * @memberof GlobalEndpointManager
             * @instance
             * @param {function} callback        - The callback function which takes writeEndpoint(string) as an argument.
            */
            getWriteEndpoint: function (callback) {
                if (!this.isEndpointCacheInitialized) {
                    this.refreshEndpointList(function (writeEndpoint, readEndpoint) {
                        callback(writeEndpoint);
                    });
                } else {
                    callback(this._writeEndpoint);
                }
            },

            /** Sets the current write endpoint.
             * @memberof GlobalEndpointManager
             * @instance
             * @param {string} writeEndpoint        - The endpoint to be set as writeEndpoint.
            */
            setWriteEndpoint: function (writeEndpoint) {
                this._writeEndpoint = writeEndpoint;
            },

            /** Refreshes the endpoint list by retrieving the writable and readable locations
                from the geo-replicated database account and then updating the locations cache.
                We skip the refreshing if EnableEndpointDiscovery is set to False
             * @memberof GlobalEndpointManager
             * @instance
             * @param {function} callback        - The callback function which takes writeEndpoint(string) and readEndpoint(string) as arguments.
            */
            refreshEndpointList: function (callback) {
                var writableLocations = [];
                var readableLocations = [];
                var databaseAccount;

                var that = this;
                if (this.enableEndpointDiscovery) {
                    this._getDatabaseAccount(function (databaseAccount) {
                        if (databaseAccount) {
                            writableLocations = databaseAccount.WritableLocations;
                            readableLocations = databaseAccount.ReadableLocations;
                        }

                        // Read and Write endpoints will be initialized to default endpoint if we were not able to get the database account info
                        that._updateLocationsCache(writableLocations, readableLocations, function (endpoints) {
                            that._writeEndpoint = endpoints[0];
                            that._readEndpoint = endpoints[1];
                            that.isEndpointCacheInitialized = true;
                            callback(that._writeEndpoint, that._readEndpoint);
                        });
                    });
                } else {
                    callback(that._writeEndpoint, that._readEndpoint);
                }
            },

            /** Gets the database account first by using the default endpoint, and if that doesn't returns
               use the endpoints for the preferred locations in the order they are specified to get 
               the database account.
             * @memberof GlobalEndpointManager
             * @instance
             * @param {function} callback        - The callback function which takes databaseAccount(object) as an argument.
            */
            _getDatabaseAccount: function (callback) {
                var that = this;
                var options = { urlConnection: this.defaultEndpoint };
                this.client.getDatabaseAccount(options, function (err, databaseAccount) {
                    // If for any reason(non - globaldb related), we are not able to get the database account from the above call to getDatabaseAccount,
                    // we would try to get this information from any of the preferred locations that the user might have specified(by creating a locational endpoint)
                    // and keeping eating the exception until we get the database account and return None at the end, if we are not able to get that info from any endpoints

                    if (err) {
                        var func = function (defaultEndpoint, preferredLocations, index) {
                            if (index < preferredLocations.length) {
                                var locationalEndpoint = that._getLocationalEndpoint(defaultEndpoint, preferredLocations[index]);
                                var options = { urlConnection: locationalEndpoint };
                                that.client.getDatabaseAccount(options, function (err, databaseAccount) {
                                    if (err) {
                                        func(defaultEndpoint, preferredLocations, index + 1);
                                    } else {
                                        return callback(databaseAccount);
                                    }
                                });
                            } else {
                                return callback(null);
                            }
                        }
                        func(that.defaultEndpoint, that.preferredLocations, 0);

                    } else {
                        return callback(databaseAccount);
                    }
                });
            },

            /** Gets the locational endpoint using the location name passed to it using the default endpoint.
             * @memberof GlobalEndpointManager
             * @instance
             * @param {string} defaultEndpoint - The default endpoint to use for teh endpoint.
             * @param {string} locationName    - The location name for the azure region like "East US".
            */
            _getLocationalEndpoint: function (defaultEndpoint, locationName) {
                // For defaultEndpoint like 'https://contoso.documents.azure.com:443/' parse it to generate URL format
                // This defaultEndpoint should be global endpoint(and cannot be a locational endpoint) and we agreed to document that
                var endpointUrl = url.parse(defaultEndpoint, true, true);

                // hostname attribute in endpointUrl will return 'contoso.documents.azure.com'
                if (endpointUrl.hostname) {
                    var hostnameParts = (endpointUrl.hostname).toString().toLowerCase().split(".");
                    if (hostnameParts) {
                        // globalDatabaseAccountName will return 'contoso'
                        var globalDatabaseAccountName = hostnameParts[0];

                        // Prepare the locationalDatabaseAccountName as contoso-EastUS for location_name 'East US'
                        var locationalDatabaseAccountName = globalDatabaseAccountName + "-" + locationName.replace(" ", "");

                        // Replace 'contoso' with 'contoso-EastUS' and return locationalEndpoint as https://contoso-EastUS.documents.azure.com:443/
                        var locationalEndpoint = defaultEndpoint.toLowerCase().replace(globalDatabaseAccountName, locationalDatabaseAccountName);
                        return locationalEndpoint;
                    }
                }

                return null;
            },

            /** Updates the read and write endpoints from the passed-in readable and writable locations.
             * @memberof GlobalEndpointManager
             * @instance
             * @param {Array} writableLocations     - The list of writable locations for the geo-enabled database account.
             * @param {Array} readableLocations     - The list of readable locations for the geo-enabled database account.
             * @param {function} callback           - The function to be called as callback after executing this method.
            */
            _updateLocationsCache: function (writableLocations, readableLocations, callback) {
                var writeEndpoint;
                var readEndpoint;
                // Use the default endpoint as Read and Write endpoints if EnableEndpointDiscovery
                // is set to False.
                if (!this.enableEndpointDiscovery) {
                    writeEndpoint = this.defaultEndpoint;
                    readEndpoint = this.defaultEndpoint;
                    return callback([writeEndpoint, readEndpoint]);
                }

                // Use the default endpoint as Write endpoint if there are no writable locations, or
                // first writable location as Write endpoint if there are writable locations
                if (writableLocations.length === 0) {
                    writeEndpoint = this.defaultEndpoint;
                } else {
                    writeEndpoint = writableLocations[0][Constants.DatabaseAccountEndpoint];
                }

                // Use the Write endpoint as Read endpoint if there are no readable locations
                if (readableLocations.length === 0) {
                    readEndpoint = writeEndpoint;
                    return callback([writeEndpoint, readEndpoint]);
                } else {
                    // Use the writable location as Read endpoint if there are no preferred locations or
                    // none of the preferred locations are in read or write locations
                    readEndpoint = writeEndpoint;

                    if (!this.preferredLocations) {
                        return callback([writeEndpoint, readEndpoint]);
                    }

                    for (var i = 0; i < this.preferredLocations.length; i++) {
                        var preferredLocation = this.preferredLocations[i];
                        // Use the first readable location as Read endpoint from the preferred locations
                        for (var j = 0; j < readableLocations.length; j++) {
                            var readLocation = readableLocations[j];
                            if (readLocation[Constants.Name] === preferredLocation) {
                                readEndpoint = readLocation[Constants.DatabaseAccountEndpoint];
                                return callback([writeEndpoint, readEndpoint]);
                            }
                        }
                        // Else, use the first writable location as Read endpoint from the preferred locations
                        for (var k = 0; k < writableLocations.length; k++) {
                            var writeLocation = writableLocations[k];
                            if (writeLocation[Constants.Name] === preferredLocation) {
                                readEndpoint = writeLocation[Constants.DatabaseAccountEndpoint];
                                return callback([writeEndpoint, readEndpoint]);
                            }
                        }
                    }

                    return callback([writeEndpoint, readEndpoint]);
                }
            }
        });
    /**
         * This class implements the resource throttle retry policy for requests.
         * @property {int} _maxRetryAttemptCount              - Max number of retries to be performed for a request.
         * @property {int} _fixedRetryIntervalInMilliseconds  - Fixed retry interval in milliseconds to wait between each retry ignoring the retryAfter returned as part of the response. 
         * @property {int} _maxWaitTimeInMilliseconds         - Max wait time in milliseconds to wait for a request while the retries are happening.
         * @property {int} currentRetryAttemptCount           - Current retry attempt count.
         * @property {int} cummulativeWaitTimeinMilliseconds  - Cummulative wait time in milliseconds for a request while the retries are happening.
    */
    var ResourceThrottleRetryPolicy = Base.defineClass(
        /**
         * @constructor ResourceThrottleRetryPolicy
         * @param {int} maxRetryAttemptCount               - Max number of retries to be performed for a request.
         * @param {int} fixedRetryIntervalInMilliseconds   - Fixed retry interval in milliseconds to wait between each retry ignoring the retryAfter returned as part of the response.
         * @param {int} maxWaitTimeInSeconds               - Max wait time in seconds to wait for a request while the retries are happening.
        */
        function (maxRetryAttemptCount, fixedRetryIntervalInMilliseconds, maxWaitTimeInSeconds) {
            this._maxRetryAttemptCount = maxRetryAttemptCount;
            this._fixedRetryIntervalInMilliseconds = fixedRetryIntervalInMilliseconds;
            this._maxWaitTimeInMilliseconds = maxWaitTimeInSeconds * 1000;
            this.currentRetryAttemptCount = 0;
            this.cummulativeWaitTimeinMilliseconds = 0;
        },
        {
            /**
             * Determines whether the request should be retried or not.
             * @param {object} err - Error returned by the request.
             * @param {function} callback - The callback function which takes bool argument which specifies whether the request will be retried or not.
            */
            shouldRetry: function (err, callback) {
                if (err) {
                    if (this.currentRetryAttemptCount < this._maxRetryAttemptCount) {
                        this.currentRetryAttemptCount++;
                        this.retryAfterInMilliseconds = 0;

                        if (this._fixedRetryIntervalInMilliseconds) {
                            this.retryAfterInMilliseconds = this._fixedRetryIntervalInMilliseconds;
                        } else if (err.retryAfterInMilliseconds) {
                            this.retryAfterInMilliseconds = err.retryAfterInMilliseconds;
                        }

                        if (this.cummulativeWaitTimeinMilliseconds < this._maxWaitTimeInMilliseconds) {
                            this.cummulativeWaitTimeinMilliseconds += this.retryAfterInMilliseconds;
                            return callback(true);
                        }
                    }
                }
                return callback(false);
            }
        },
        {
            THROTTLE_STATUS_CODE: 429
        }
    );
    /**
    * Represents the Retry policy assocated with throttled requests in the Azure DocumentDB database service.
    * @property {int} [MaxRetryAttemptCount]               - Max number of retries to be performed for a request. Default value 9.
    * @property {int} [FixedRetryIntervalInMilliseconds]   - Fixed retry interval in milliseconds to wait between each retry ignoring the retryAfter returned as part of the response.
    * @property {int} [MaxWaitTimeInSeconds]               - Max wait time in seconds to wait for a request while the retries are happening. Default value 30 seconds.
    */
    var RetryOptions = Base.defineClass(
        function RetryOptions(maxRetryAttemptCount, fixedRetryIntervalInMilliseconds, maxWaitTimeInSeconds) {
            this._maxRetryAttemptCount = maxRetryAttemptCount || 9;
            this._fixedRetryIntervalInMilliseconds = fixedRetryIntervalInMilliseconds;
            this._maxWaitTimeInSeconds = maxWaitTimeInSeconds || 30;

            Object.defineProperty(this, "MaxRetryAttemptCount", {
                get: function () {
                    return this._maxRetryAttemptCount;
                },
                enumerable: true
            });

            Object.defineProperty(this, "FixedRetryIntervalInMilliseconds", {
                get: function () {
                    return this._fixedRetryIntervalInMilliseconds;
                },
                enumerable: true
            });

            Object.defineProperty(this, "MaxWaitTimeInSeconds", {
                get: function () {
                    return this._maxWaitTimeInSeconds;
                },
                enumerable: true
            });
        })
    var RetryUtility = {
        /**
        * Executes the retry policy for the created request object.
        * @param {object} globalEndpointManager - an instance of GlobalEndpointManager class.
        * @param {object} body - a dictionary containing 'buffer' and 'stream' keys to hold corresponding buffer or stream body, null otherwise.
        * @param {function} createRequestObjectStub - stub function that creates the request object.
        * @param {object} connectionPolicy - an instance of ConnectionPolicy that has the connection configs.
        * @param {RequestOptions} requestOptions - The request options.
        * @param {function} callback - the callback that will be called when the request is finished executing.
        */
        execute: function (globalEndpointManager, body, createRequestObjectFunc, connectionPolicy, requestOptions, callback) {
            var endpointDiscoveryRetryPolicy = new EndpointDiscoveryRetryPolicy(globalEndpointManager);
            var resourceThrottleRetryPolicy = new ResourceThrottleRetryPolicy(connectionPolicy.RetryOptions.MaxRetryAttemptCount,
                connectionPolicy.RetryOptions.FixedRetryIntervalInMilliseconds,
                connectionPolicy.RetryOptions.MaxWaitTimeInSeconds);

            this.apply(body, createRequestObjectFunc, connectionPolicy, requestOptions, endpointDiscoveryRetryPolicy, resourceThrottleRetryPolicy, callback);
        },

        /**
        * Applies the retry policy for the created request object.
        * @param {object} body - a dictionary containing 'buffer' and 'stream' keys to hold corresponding buffer or stream body, null otherwise.
        * @param {function} createRequestObjectFunc - function that creates the request object.
        * @param {object} connectionPolicy - an instance of ConnectionPolicy that has the connection configs.
        * @param {RequestOptions} requestOptions - The request options.
        * @param {EndpointDiscoveryRetryPolicy} endpointDiscoveryRetryPolicy - The endpoint discovery retry policy instance.
        * @param {ResourceThrottleRetryPolicy} resourceThrottleRetryPolicy - The resource throttle retry policy instance.
        * @param {function} callback - the callback that will be called when the response is retrieved and processed.
        */
        apply: function (body, createRequestObjectFunc, connectionPolicy, requestOptions, endpointDiscoveryRetryPolicy, resourceThrottleRetryPolicy, callback) {
            var that = this;
            var httpsRequest = createRequestObjectFunc(connectionPolicy, requestOptions, function (err, response, headers) {
                if (err) {
                    var retryPolicy = null;
                    headers = headers || {};
                    if (err.code === EndpointDiscoveryRetryPolicy.FORBIDDEN_STATUS_CODE && err.substatus === EndpointDiscoveryRetryPolicy.WRITE_FORBIDDEN_SUB_STATUS_CODE) {
                        retryPolicy = endpointDiscoveryRetryPolicy;
                    } else if (err.code === ResourceThrottleRetryPolicy.THROTTLE_STATUS_CODE) {
                        retryPolicy = resourceThrottleRetryPolicy;
                    }
                    if (retryPolicy) {
                        retryPolicy.shouldRetry(err, function (shouldRetry) {
                            if (!shouldRetry) {
                                headers[Constants.ThrottleRetryCount] = resourceThrottleRetryPolicy.currentRetryAttemptCount;
                                headers[Constants.ThrottleRetryWaitTimeInMs] = resourceThrottleRetryPolicy.cummulativeWaitTimeinMilliseconds;
                                return callback(err, response, headers);
                            } else {
                                setTimeout(function () {
                                    that.apply(body, createRequestObjectFunc, connectionPolicy, requestOptions, endpointDiscoveryRetryPolicy, resourceThrottleRetryPolicy, callback);
                                }, retryPolicy.retryAfterInMilliseconds);
                                return;
                            }
                        });
                        return;
                    }
                }
                headers[Constants.ThrottleRetryCount] = resourceThrottleRetryPolicy.currentRetryAttemptCount;
                headers[Constants.ThrottleRetryWaitTimeInMs] = resourceThrottleRetryPolicy.cummulativeWaitTimeinMilliseconds;
                return callback(err, response, headers);
            });

            if (httpsRequest) {
                if (body["stream"] !== null) {
                    body["stream"].pipe(httpsRequest);
                } else if (body["buffer"] !== null) {
                    httpsRequest.write(body["buffer"]);
                    httpsRequest.end();
                } else {
                    httpsRequest.end();
                }
            }
        }
    }
    var Range = Base.defineClass(
        /**
         * Represents a range object used by the RangePartitionResolver in the Azure DocumentDB database service.
         * @class Range
         * @param {object} options                   - The Range constructor options.
         * @param {any} options.low                  - The low value in the range.
         * @param {any} options.high                 - The high value in the range.
         **/
        function (options) {
            if (options === undefined) {
                options = {};
            }
            if (options === null) {
                throw new Error("Invalid argument: 'options' is null");
            }
            if (typeof options !== "object") {
                throw new Error("Invalid argument: 'options' is not an object");
            }
            if (options.high === undefined) {
                options.high = options.low;
            }
            this.low = options.low;
            this.high = options.high;
            Object.freeze(this);
        },
        {
            /** @ignore */
            _compare: function (x, y, compareFunction) {
                // Same semantics as Array.sort
                // http://www.ecma-international.org/ecma-262/6.0/#sec-sortcompare
                if (x === undefined && y === undefined)
                    return 0;
                if (x === undefined)
                    return 1;
                if (y === undefined)
                    return -1;
                if (compareFunction !== undefined) {
                    var v = Number(compareFunction(x, y));
                    if (v === NaN)
                        return 0;
                    return v;
                }
                var xString = String(x);
                var yString = String(y);
                if (xString < yString)
                    return -1;
                if (xString > yString)
                    return 1;
                return 0;
            },

            /** @ignore */
            _contains: function (other, compareFunction) {
                if (Range._isRange(other)) {
                    return this._containsRange(other, compareFunction);
                }
                else {
                    return this._containsPoint(other, compareFunction);
                }
            },

            /** @ignore */
            _containsPoint: function (point, compareFunction) {
                if (this._compare(point, this.low, compareFunction) >= 0 && this._compare(point, this.high, compareFunction) <= 0) {
                    return true;
                }
                return false;
            },

            /** @ignore */
            _containsRange: function (other, compareFunction) {
                if (this._compare(other.low, this.low, compareFunction) >= 0 && this._compare(other.high, this.high, compareFunction) <= 0) {
                    return true;
                }
                return false;
            },

            /** @ignore */
            _intersect: function (other, compareFunction) {
                if (other === undefined || other === null) {
                    throw new Error("Invalid Argument: 'other' is undefined or null");
                }
                var maxLow = this._compare(this.low, other.low, compareFunction) >= 0 ? this.low : other.low;
                var minHigh = this._compare(this.high, other.high, compareFunction) <= 0 ? this.high : other.high;
                if (this._compare(maxLow, minHigh, compareFunction) <= 0) {
                    return true;
                }
                return false;
            },

            /** @ignore */
            _toString: function () {
                return String(this.low) + "," + String(this.high);
            }
        },
        {
            /** @ignore */
            _isRange: function (pointOrRange) {
                if (pointOrRange === undefined) {
                    return false;
                }
                if (pointOrRange === null) {
                    return false;
                }
                if (typeof pointOrRange !== "object") {
                    return false;
                }
                return ("low" in pointOrRange && "high" in pointOrRange);
            }
        }
    );

    var RangePartitionResolver = Base.defineClass(
        /**
         * RangePartitionResolver implements partitioning using a partition map of ranges of values to a collection link in the Azure DocumentDB database service.
         * @class RangePartitionResolver
         * @param {string | function} partitionKeyExtractor   - If partitionKeyExtractor is a string, it should be the name of the property in the document to execute the hashing on.
         *                                                      If partitionKeyExtractor is a function, it should be a function to extract the partition key from an object.
         * @param {Array} partitionKeyMap                     - The map from Range to collection link that is used for partitioning requests.
         * @param {function} compareFunction                  - Optional function that accepts two arguments x and y and returns a negative value if x < y, zero if x = y, or a positive value if x > y.
         **/
        function (partitionKeyExtractor, partitionKeyMap, compareFunction) {
            if (partitionKeyExtractor === undefined || partitionKeyExtractor === null) {
                throw new Error("partitionKeyExtractor cannot be null or undefined");
            }
            if (typeof partitionKeyExtractor !== "string" && typeof partitionKeyExtractor !== "function") {
                throw new Error("partitionKeyExtractor must be either a 'string' or a 'function'");
            }
            if (partitionKeyMap === undefined || partitionKeyMap === null) {
                throw new Error("partitionKeyMap cannot be null or undefined");
            }
            if (!(Array.isArray(partitionKeyMap))) {
                throw new Error("partitionKeyMap has to be an Array");
            }
            var allMapEntriesAreValid = partitionKeyMap.every(function (mapEntry) {
                if ((mapEntry === undefined) || mapEntry === null) {
                    return false;
                }
                if (mapEntry.range === undefined) {
                    return false;
                }
                if (!(mapEntry.range instanceof Range)) {
                    return false;
                }
                if (mapEntry.link === undefined) {
                    return false;
                }
                if (typeof mapEntry.link !== "string") {
                    return false;
                }
                return true;
            });
            if (!allMapEntriesAreValid) {
                throw new Error("All partitionKeyMap entries have to be a tuple {range: Range, link: string }");
            }
            if (compareFunction !== undefined && typeof compareFunction !== "function") {
                throw new Error("Invalid argument: 'compareFunction' is not a function");
            }

            this.partitionKeyExtractor = partitionKeyExtractor;
            this.partitionKeyMap = partitionKeyMap;
            this.compareFunction = compareFunction;
        }, {
            /**
             * Extracts the partition key from the specified document using the partitionKeyExtractor
             * @memberof RangePartitionResolver
             * @instance
             * @param {object} document - The document from which to extract the partition key.
             * @returns {}
             **/
            getPartitionKey: function (document) {
                if (typeof this.partitionKeyExtractor === "string") {
                    return document[this.partitionKeyExtractor];
                }
                if (typeof this.partitionKeyExtractor === "function") {
                    return this.partitionKeyExtractor(document);
                }
                throw new Error("Unable to extract partition key from document. Ensure PartitionKeyExtractor is a valid function or property name.");
            },

            /**
             * Given a partition key, returns the correct collection link for creating a document using the range partition map.
             * @memberof RangePartitionResolver
             * @instance
             * @param {any} partitionKey - The partition key used to determine the target collection for create
             * @returns {string}         - The target collection link that will be used for document creation.
             **/
            resolveForCreate: function (partitionKey) {
                var range = new Range({ low: partitionKey });
                var mapEntry = this._getFirstContainingMapEntryOrNull(range);
                if (mapEntry !== undefined && mapEntry !== null) {
                    return mapEntry.link;
                }
                throw new Error("Invalid operation: A containing range for '" + range._toString() + "' doesn't exist in the partition map.");
            },

            /**
             * Given a partition key, returns a list of collection links to read from using the range partition map.
             * @memberof RangePartitionResolver
             * @instance
             * @param {any} partitionKey - The partition key used to determine the target collection for query
             * @returns {string[]}         - The list of target collection links.
             **/
            resolveForRead: function (partitionKey) {
                if (partitionKey === undefined || partitionKey === null) {
                    return this.partitionKeyMap.map(function (i) { return i.link; });
                }
                else {
                    return this._getIntersectingMapEntries(partitionKey).map(function (i) { return i.link; });
                }
            },

            /** @ignore */
            _getFirstContainingMapEntryOrNull: function (point) {
                var _this = this;
                var containingMapEntries = this.partitionKeyMap.filter(function (p) { return p.range !== undefined && p.range._contains(point, _this.compareFunction); });
                if (containingMapEntries && containingMapEntries.length > 0) {
                    return containingMapEntries[0];
                }
                return null;
            },

            /** @ignore */
            _getIntersectingMapEntries: function (partitionKey) {
                var _this = this;
                var partitionKeys = (partitionKey instanceof Array) ? partitionKey : [partitionKey];
                var ranges = partitionKeys.map(function (p) { return Range._isRange(p) ? p : new Range({ low: p }); });
                var result = new Array();
                ranges.forEach(function (range) {
                    result = result.concat(_this.partitionKeyMap.filter(function (entry) {
                        return entry.range._intersect(range, _this.compareFunction);
                    }));
                });
                return result;
            }
        }
    );
    var ConsistentHashRing = Base.defineClass(
        /**
         * Initializes a new instance of the ConsistentHashRing
         * @param {string[]} nodes - Array of collection links
         * @param {object} options - Options to initialize the ConsistentHashRing
         * @param {function} options.computeHash - Function to compute the hash for a given link or partition key
         * @param {function} options.numberOfVirtualNodesPerCollection - Number of points in the ring to assign to each collection link
         */
        function (nodes, options) {
            ConsistentHashRing._throwIfInvalidNodes(nodes);

            options = options || {};
            options.numberOfVirtualNodesPerCollection = options.numberOfVirtualNodesPerCollection || 128;
            options.computeHash = options.computeHash || MurmurHash.hash;

            this._computeHash = options.computeHash;
            this._partitions = ConsistentHashRing._constructPartitions(nodes, options.numberOfVirtualNodesPerCollection, options.computeHash);
        }, {
            getNode: function (key) {
                var hash = this._computeHash(key);
                var partition = ConsistentHashRing._search(this._partitions, hash);
                return this._partitions[partition].node;
            }
        }, {
            /** @ignore */
            _constructPartitions: function (nodes, partitionsPerNode, computeHashFunction) {
                var partitions = new Array();
                nodes.forEach(function (node) {
                    var hashValue = computeHashFunction(node);
                    for (var j = 0; j < partitionsPerNode; j++) {
                        partitions.push({
                            hashValue: hashValue,
                            node: node
                        });

                        hashValue = computeHashFunction(hashValue);
                    }
                });

                partitions.sort(function (x, y) {
                    return ConsistentHashRing._compareHashes(x.hashValue, y.hashValue);
                });
                return partitions;
            },
            /** @ignore */
            _compareHashes: function (x, y) {
                if (x < y) return -1;
                if (x > y) return 1;
                return 0;
            },
            /** @ignore */
            _search: function (partitions, hashValue) {
                for (var i = 0; i < partitions.length - 1; i++) {
                    if (hashValue >= partitions[i].hashValue && hashValue < partitions[i + 1].hashValue) {
                        return i;
                    }
                }

                return partitions.length - 1;
            },
            /** @ignore */
            _throwIfInvalidNodes: function (nodes) {
                if (Array.isArray(nodes)) {
                    return;
                }

                throw new Error("Invalid argument: 'nodes' has to be an array.");
            }
        }

    );

    var HashPartitionResolver = Base.defineClass(
        /**
         * HashPartitionResolver implements partitioning based on the value of a hash function, 
         * allowing you to evenly distribute requests and data across a number of partitions for
         * the Azure DocumentDB database service.
         * @class HashPartitionResolver
         * @param {string | function} partitionKeyExtractor   - If partitionKeyExtractor is a string, it should be the name of the property in the document to execute the hashing on.
         *                                                      If partitionKeyExtractor is a function, it should be a function to extract the partition key from an object.
         **/
        function (partitionKeyExtractor, collectionLinks, options) {
            HashPartitionResolver._throwIfInvalidPartitionKeyExtractor(partitionKeyExtractor);
            HashPartitionResolver._throwIfInvalidCollectionLinks(collectionLinks);
            this.partitionKeyExtractor = partitionKeyExtractor;

            options = options || {};
            this.consistentHashRing = new ConsistentHashRing(collectionLinks, options);
            this.collectionLinks = collectionLinks;
        }, {
            /**
             * Extracts the partition key from the specified document using the partitionKeyExtractor
             * @memberof HashPartitionResolver
             * @instance
             * @param {object} document - The document from which to extract the partition key.
             * @returns {object} 
             **/
            getPartitionKey: function (document) {
                return (typeof this.partitionKeyExtractor === "string")
                    ? document[this.partitionKeyExtractor]
                    : this.partitionKeyExtractor(document);
            },
            /**
             * Given a partition key, returns a list of collection links to read from.
             * @memberof HashPartitionResolver
             * @instance
             * @param {any} partitionKey - The partition key used to determine the target collection for query
             **/
            resolveForRead: function (partitionKey) {
                if (partitionKey === undefined || partitionKey === null) {
                    return this.collectionLinks;
                }

                return [this._resolve(partitionKey)];
            },
            /**
             * Given a partition key, returns the correct collection link for creating a document.
             * @memberof HashPartitionResolver
             * @instance
             * @param {any} partitionKey - The partition key used to determine the target collection for create
             * @returns {string}         - The target collection link that will be used for document creation.
             **/
            resolveForCreate: function (partitionKey) {
                return this._resolve(partitionKey);
            },
            /** @ignore */
            _resolve: function (partitionKey) {
                HashPartitionResolver._throwIfInvalidPartitionKey(partitionKey);
                return this.consistentHashRing.getNode(partitionKey);
            }
        }, {
            /** @ignore */
            _throwIfInvalidPartitionKeyExtractor: function (partitionKeyExtractor) {
                if (partitionKeyExtractor === undefined || partitionKeyExtractor === null) {
                    throw new Error("partitionKeyExtractor cannot be null or undefined");
                }

                if (typeof partitionKeyExtractor !== "string" && typeof partitionKeyExtractor !== "function") {
                    throw new Error("partitionKeyExtractor must be either a 'string' or a 'function'");
                }
            },
            /** @ignore */
            _throwIfInvalidPartitionKey: function (partitionKey) {
                var partitionKeyType = typeof partitionKey;
                if (partitionKeyType !== "string") {
                    throw new Error("partitionKey must be a 'string'");
                }
            },
            /** @ignore */
            _throwIfInvalidCollectionLinks: function (collectionLinks) {
                if (!Array.isArray(collectionLinks)) {
                    throw new Error("collectionLinks must be an array.");
                }

                if (collectionLinks.some(function (collectionLink) { return !Base._isValidCollectionLink(collectionLink); })) {
                    throw new Error("All elements of collectionLinks must be collection links.");
                }
            }
        });

    var MurmurHash = Base.defineClass(
        undefined,
        undefined,
        {
            /**
             * Hashes a string, a unsigned 32-bit integer, or a Buffer into a new unsigned 32-bit integer that represents the output hash.
             * @param {string, number of Buffer} key  - The preimage of the hash
             * @param {number} seed                   - Optional value used to initialize the hash generator
             * @returns {} 
             */
            hash: function (key, seed) {
                key = key || '';
                seed = seed || 0;

                MurmurHash._throwIfInvalidKey(key);
                MurmurHash._throwIfInvalidSeed(seed);

                var buffer;
                if (typeof key === "string") {
                    buffer = MurmurHash._getBufferFromString(key);
                }
                else if (typeof key === "number") {
                    buffer = MurmurHash._getBufferFromNumber(key);
                }
                else {
                    buffer = key;
                }

                return MurmurHash._hashBytes(buffer, seed);
            },
            /** @ignore */
            _throwIfInvalidKey: function (key) {
                if (key instanceof Buffer) {
                    return;
                }

                if (typeof key === "string") {
                    return;
                }

                if (typeof key === "number") {
                    return;
                }

                throw new Error("Invalid argument: 'key' has to be a Buffer, string, or number.");
            },
            /** @ignore */
            _throwIfInvalidSeed: function (seed) {
                if (isNaN(seed)) {
                    throw new Error("Invalid argument: 'seed' is not and cannot be converted to a number.");
                }
            },
            /** @ignore */
            _getBufferFromString: function (key) {
                var buffer = new Buffer(key);
                return buffer;
            },
            /** @ignore */
            _getBufferFromNumber: function (i) {
                i = i >>> 0;

                var buffer = new Uint8Array([
                    i >>> 0,
                    i >>> 8,
                    i >>> 16,
                    i >>> 24
                ]);

                return buffer;
            },
            /** @ignore */
            _hashBytes: function (bytes, seed) {
                var c1 = 0xcc9e2d51;
                var c2 = 0x1b873593;

                var h1 = seed;
                var reader = new Uint32Array(bytes);
                {
                    for (var i = 0; i < bytes.length - 3; i += 4) {
                        var k1 = MurmurHash._readUInt32(reader, i);

                        k1 = MurmurHash._multiply(k1, c1);
                        k1 = MurmurHash._rotateLeft(k1, 15);
                        k1 = MurmurHash._multiply(k1, c2);

                        h1 ^= k1;
                        h1 = MurmurHash._rotateLeft(h1, 13);
                        h1 = MurmurHash._multiply(h1, 5) + 0xe6546b64;
                    }
                }

                var k = 0;
                switch (bytes.length & 3) {
                    case 3:
                        k ^= reader[i + 2] << 16;
                        k ^= reader[i + 1] << 8;
                        k ^= reader[i];
                        break;

                    case 2:
                        k ^= reader[i + 1] << 8;
                        k ^= reader[i];
                        break;

                    case 1:
                        k ^= reader[i];
                        break;
                }

                k = MurmurHash._multiply(k, c1);
                k = MurmurHash._rotateLeft(k, 15);
                k = MurmurHash._multiply(k, c2);

                h1 ^= k;
                h1 ^= bytes.length;
                h1 ^= h1 >>> 16;
                h1 = MurmurHash._multiply(h1, 0x85ebca6b);
                h1 ^= h1 >>> 13;
                h1 = MurmurHash._multiply(h1, 0xc2b2ae35);
                h1 ^= h1 >>> 16;

                return h1 >>> 0;
            },
            /** @ignore */
            _rotateLeft: function (n, numBits) {
                return (n << numBits) | (n >>> (32 - numBits));
            },
            /** @ignore */
            _multiply: function (m, n) {
                return ((m & 0xffff) * n) + ((((m >>> 16) * n) & 0xffff) << 16);
            },
            /** @ignore */
            _readUInt32: function (uintArray, i) {
                return (uintArray[i]) | (uintArray[i + 1] << 8) | (uintArray[i + 2] << 16) | (uintArray[i + 3] << 24) >>> 0;
            }
        });


    var AverageAggregator = Base.defineClass(

        /**
         * Represents an aggregator for AVG operator.
         * @constructor AverageAggregator
         * @ignore
         */
        function () {
        },
        {
            /**
            * Add the provided item to aggregation result.
            * @memberof AverageAggregator
            * @instance
            * @param other
            */
            aggregate: function (other) {
                if (other == null || other.sum == null) {
                    return;
                }
                if (this.sum == null) {
                    this.sum = 0.0;
                    this.count = 0;
                }
                this.sum += other.sum;
                this.count += other.count;
            },

            /**
            * Get the aggregation result.
            * @memberof AverageAggregator
            * @instance
            */
            getResult: function () {
                if (this.sum == null || this.count <= 0) {
                    return undefined;
                }
                return this.sum / this.count;
            }

        }
    );

    var CountAggregator = Base.defineClass(

        /**
         * Represents an aggregator for COUNT operator.
         * @constructor CountAggregator
         * @ignore
         */
        function () {
            this.value = 0;
        },
        {
            /**
            * Add the provided item to aggregation result.
            * @memberof CountAggregator
            * @instance
            * @param other
            */
            aggregate: function (other) {
                this.value += other;
            },

            /**
            * Get the aggregation result.
            * @memberof CountAggregator
            * @instance
            */
            getResult: function () {
                return this.value;
            }

        }
    );

    var MinAggregator = Base.defineClass(

        /**
         * Represents an aggregator for MIN operator.
         * @constructor MinAggregator
         * @ignore
         */
        function () {
            this.value = undefined;
            this.comparer = new OrderByDocumentProducerComparator("Ascending");
        },
        {
            /**
            * Add the provided item to aggregation result.
            * @memberof MinAggregator
            * @instance
            * @param other
            */
            aggregate: function (other) {
                if (this.value == undefined) {
                    this.value = other;
                }
                else {
                    var otherType = other == null ? 'NoValue' : typeof (other);
                    if (this.comparer.compareValue(other, otherType, this.value, typeof (this.value)) < 0) {
                        this.value = other;
                    }
                }
            },

            /**
            * Get the aggregation result.
            * @memberof MinAggregator
            * @instance
            */
            getResult: function () {
                return this.value;
            }

        }
    );

    var MaxAggregator = Base.defineClass(

        /**
         * Represents an aggregator for MAX operator.
         * @constructor MaxAggregator
         * @ignore
         */
        function () {
            this.value = undefined;
            this.comparer = new OrderByDocumentProducerComparator("Ascending");
        },
        {
            /**
            * Add the provided item to aggregation result.
            * @memberof MaxAggregator
            * @instance
            * @param other
            */
            aggregate: function (other) {
                if (this.value == undefined) {
                    this.value = other;
                }
                else if (this.comparer.compareValue(other, typeof (other), this.value, typeof (this.value)) > 0) {
                    this.value = other;
                }
            },

            /**
            * Get the aggregation result.
            * @memberof MaxAggregator
            * @instance
            */
            getResult: function () {
                return this.value;
            }

        }
    );

    var SumAggregator = Base.defineClass(

        /**
         * Represents an aggregator for SUM operator.
         * @constructor SumAggregator
         * @ignore
         */
        function () {
        },
        {
            /**
            * Add the provided item to aggregation result.
            * @memberof SumAggregator
            * @instance
            * @param other
            */
            aggregate: function (other) {
                if (other == undefined) {
                    return;
                }
                if (this.sum == undefined) {
                    this.sum = other;
                }
                else {
                    this.sum += other;
                }
            },

            /**
            * Get the aggregation result.
            * @memberof SumAggregator
            * @instance
            */
            getResult: function () {
                return this.sum;
            }

        }
    );
    var DefaultQueryExecutionContext = Base.defineClass(
        /**
         * Provides the basic Query Execution Context. This wraps the internal logic query execution using provided fetch functions
         * @constructor DefaultQueryExecutionContext
         * @param {DocumentClient} documentclient        - The service endpoint to use to create the client.
         * @param {SqlQuerySpec | string} query          - A SQL query.
         * @param {FeedOptions} [options]                - Represents the feed options.
         * @param {callback | callback[]} fetchFunctions - A function to retrieve each page of data. An array of functions may be used to query more than one partition.
         * @ignore
         */
        function (documentclient, query, options, fetchFunctions) {
            this.documentclient = documentclient;
            this.query = query;
            this.resources = [];
            this.currentIndex = 0;
            this.currentPartitionIndex = 0;
            this.fetchFunctions = (Array.isArray(fetchFunctions)) ? fetchFunctions : [fetchFunctions];
            this.options = options || {};
            this.continuation = this.options.continuation || null;
            this.state = DefaultQueryExecutionContext.STATES.start;
        },
        {
            /**
             * Execute a provided callback on the next element in the execution context.
             * @memberof DefaultQueryExecutionContext
             * @instance
             * @param {callback} callback - Function to execute for each element. the function takes two parameters error, element.
             */
            nextItem: function (callback) {
                var that = this;
                this.current(function (err, resources, headers) {
                    ++that.currentIndex;
                    callback(err, resources, headers);
                });
            },

            /**
             * Retrieve the current element on the execution context.
             * @memberof DefaultQueryExecutionContext
             * @instance
             * @param {callback} callback - Function to execute for the current element. the function takes two parameters error, element.
             */
            current: function (callback) {
                var that = this;
                if (this.currentIndex < this.resources.length) {
                    return callback(undefined, this.resources[this.currentIndex], undefined);
                }

                if (this._canFetchMore()) {
                    this.fetchMore(function (err, resources, headers) {
                        if (err) {
                            return callback(err, undefined, headers);
                        }
                        that.resources = resources;
                        if (that.resources.length === 0) {
                            if (!that.continuation && that.currentPartitionIndex >= that.fetchFunctions.length) {
                                that.state = DefaultQueryExecutionContext.STATES.ended;
                                callback(undefined, undefined, headers);
                            } else {
                                that.current(callback);
                            }
                            return undefined;
                        }
                        callback(undefined, that.resources[that.currentIndex], headers);
                    });
                } else {
                    this.state = DefaultQueryExecutionContext.STATES.ended;
                    callback(undefined, undefined, undefined);
                }
            },

            /**
             * Determine if there are still remaining resources to processs based on the value of the continuation token or the elements remaining on the current batch in the execution context.
             * @memberof DefaultQueryExecutionContext
             * @instance
             * @returns {Boolean} true if there is other elements to process in the DefaultQueryExecutionContext.
             */
            hasMoreResults: function () {
                return this.state === DefaultQueryExecutionContext.STATES.start || this.continuation !== undefined || this.currentIndex < this.resources.length || this.currentPartitionIndex < this.fetchFunctions.length;
            },

            /**
             * Fetches the next batch of the feed and pass them as an array to a callback
             * @memberof DefaultQueryExecutionContext
             * @instance
             * @param {callback} callback - Function execute on the feed response, takes two parameters error, resourcesList
             */
            fetchMore: function (callback) {
                if (this.currentPartitionIndex >= this.fetchFunctions.length) {
                    return callback(undefined, undefined, undefined);
                }
                var that = this;
                // Keep to the original continuation and to restore the value after fetchFunction call
                var originalContinuation = this.options.continuation;
                this.options.continuation = this.continuation;

                // Return undefined if there is no more results
                if (this.currentPartitionIndex >= that.fetchFunctions.length) {
                    return callback(undefined, undefined, undefined);
                }

                var fetchFunction = this.fetchFunctions[this.currentPartitionIndex];
                fetchFunction(this.options, function (err, resources, responseHeaders) {
                    if (err) {
                        that.state = DefaultQueryExecutionContext.STATES.ended;
                        return callback(err, undefined, responseHeaders);
                    }

                    that.continuation = responseHeaders[Constants.HttpHeaders.Continuation];
                    if (!that.continuation) {
                        ++that.currentPartitionIndex;
                    }

                    that.state = DefaultQueryExecutionContext.STATES.inProgress;
                    that.currentIndex = 0;
                    that.options.continuation = originalContinuation;
                    callback(undefined, resources, responseHeaders);
                });
            },

            _canFetchMore: function () {
                var res = (this.state === DefaultQueryExecutionContext.STATES.start
                    || (this.continuation && this.state === DefaultQueryExecutionContext.STATES.inProgress)
                    || (this.currentPartitionIndex < this.fetchFunctions.length
                        && this.state === DefaultQueryExecutionContext.STATES.inProgress));
                return res;
            }
        }, {

            STATES: Object.freeze({ start: "start", inProgress: "inProgress", ended: "ended" })
        }
    );

    var DocumentProducer = Base.defineClass(
        /**
         * Provides the Target Partition Range Query Execution Context.
         * @constructor DocumentProducer
         * @param {DocumentClient} documentclient        - The service endpoint to use to create the client.
         * @param {String} collectionLink                - Represents collection link
         * @param {SqlQuerySpec | string} query          - A SQL query.
         * @param {object} targetPartitionKeyRange       - Query Target Partition key Range
         * @ignore
         */
        function (documentclient, collectionLink, query, targetPartitionKeyRange, options) {
            this.documentclient = documentclient;
            this.collectionLink = collectionLink;
            this.query = query;
            this.targetPartitionKeyRange = targetPartitionKeyRange;
            this.itemsBuffer = [];

            this.allFetched = false;
            this.err = undefined;

            this.previousContinuationToken = undefined;
            this.continuationToken = undefined;
            this._respHeaders = HeaderUtils.getInitialHeader();

            var isNameBased = Base.isLinkNameBased(collectionLink);
            var path = this.documentclient.getPathFromLink(collectionLink, "docs", isNameBased);
            var id = this.documentclient.getIdFromLink(collectionLink, isNameBased);

            var that = this;
            var fetchFunction = function (options, callback) {
                that.documentclient.queryFeed.call(documentclient,
                    documentclient,
                    path,
                    "docs",
                    id,
                    function (result) { return result.Documents; },
                    function (parent, body) { return body; },
                    query,
                    options,
                    callback,
                    that.targetPartitionKeyRange["id"]);
            };
            this.internalExecutionContext = new DefaultQueryExecutionContext(documentclient, query, options, fetchFunction);
        },
        {
            /**
             * Synchronously gives the buffered items if any
             * @returns {Object}       - buffered current items if any
             * @ignore
             */
            peekBufferedItems: function () {
                return this.itemsBuffer;
            },

            /**
             * Synchronously gives the buffered items if any and moves inner indices.
             * @returns {Object}       - buffered current items if any
             * @ignore
             */
            consumeBufferedItems: function () {
                var res = this.itemsBuffer;
                this.itemsBuffer = [];
                this._updateStates(undefined, this.continuationToken === null || this.continuationToken === undefined);
                return res;
            },

            _getAndResetActiveResponseHeaders: function () {
                var ret = this._respHeaders;
                this._respHeaders = HeaderUtils.getInitialHeader();
                return ret;
            },

            _updateStates: function (err, allFetched) {
                if (err) {
                    this.err = err
                    return;
                }
                if (allFetched) {
                    this.allFetched = true;
                }
                if (this.internalExecutionContext.continuation === this.continuationToken) {
                    // nothing changed
                    return;
                }
                this.previousContinuationToken = this.continuationToken;
                this.continuationToken = this.internalExecutionContext.continuation;
            },

            /**
             * Fetches and bufferes the next page of results and executes the given callback
             * @memberof DocumentProducer
             * @instance
             * @param {callback} callback - Function to execute for next page of result.
             *                              the function takes three parameters error, resources, headerResponse.
            */
            bufferMore: function (callback) {
                var that = this;
                if (that.err) {
                    return callback(that.err);
                }

                this.internalExecutionContext.fetchMore(function (err, resources, headerResponse) {
                    that._updateStates(err, resources === undefined);
                    if (err) {
                        return callback(err, undefined, headerResponse);
                    }

                    if (resources != undefined) {
                        // some more results
                        that.itemsBuffer = that.itemsBuffer.concat(resources);
                    }
                    return callback(undefined, resources, headerResponse);
                });
            },

            /**
             * Synchronously gives the bufferend current item if any
             * @returns {Object}       - buffered current item if any
             * @ignore
             */
            getTargetParitionKeyRange: function () {
                return this.targetPartitionKeyRange;
            },

            /**
            * Execute a provided function on the next element in the DocumentProducer.
            * @memberof DocumentProducer
            * @instance
            * @param {callback} callback - Function to execute for each element. the function takes two parameters error, element.
            */
            nextItem: function (callback) {
                var that = this;
                if (that.err) {
                    return callback(that.err);
                }
                this.current(function (err, item, headers) {
                    if (err) {
                        return callback(err, undefined, headers);
                    }

                    var extracted = that.itemsBuffer.shift();
                    assert.equal(extracted, item);
                    callback(undefined, item, headers);
                });
            },

            /**
             * Retrieve the current element on the DocumentProducer.
             * @memberof DocumentProducer
             * @instance
             * @param {callback} callback - Function to execute for the current element. the function takes two parameters error, element.
             */
            current: function (callback) {
                if (this.itemsBuffer.length > 0) {
                    return callback(undefined, this.itemsBuffer[0], this._getAndResetActiveResponseHeaders());
                }

                if (this.allFetched) {
                    return callback(undefined, undefined, this._getAndResetActiveResponseHeaders());
                }

                var that = this;
                this.bufferMore(function (err, items, headers) {
                    if (err) {
                        return callback(err, undefined, headers);
                    }

                    if (items === undefined) {
                        return callback(undefined, undefined, headers);
                    }
                    HeaderUtils.mergeHeaders(that._respHeaders, headers);

                    that.current(callback);
                });
            },
        },

        {

            /**
             * Provides a Comparator for document producers using the min value of the corresponding target partition.
             * @returns {object}        - Comparator Function
             * @ignore
             */
            createTargetPartitionKeyRangeComparator: function () {
                return function (docProd1, docProd2) {
                    var a = docProd1.getTargetParitionKeyRange()['minInclusive'];
                    var b = docProd2.getTargetParitionKeyRange()['minInclusive'];
                    return (a == b ? 0 : (a > b ? 1 : -1));
                };
            },

            /**
             * Provides a Comparator for document producers which respects orderby sort order.
             * @returns {object}        - Comparator Function
             * @ignore
             */
            createOrderByComparator: function (sortOrder) {
                var comparator = new OrderByDocumentProducerComparator(sortOrder);
                return function (docProd1, docProd2) {
                    return comparator.compare(docProd1, docProd2);
                };
            }
        }
    );

    var OrderByDocumentProducerComparator = Base.defineClass(

        function (sortOrder) {
            this.sortOrder = sortOrder;
            this.targetPartitionKeyRangeDocProdComparator = DocumentProducer.createTargetPartitionKeyRangeComparator();

            this._typeOrdComparator = Object.freeze({
                NoValue: {
                    ord: 0
                },
                undefined: {
                    ord: 1
                },
                boolean: {
                    ord: 2,
                    compFunc: function (a, b) {
                        return (a == b ? 0 : (a > b ? 1 : -1));
                    }
                },
                number: {
                    ord: 4,
                    compFunc: function (a, b) {
                        return (a == b ? 0 : (a > b ? 1 : -1));
                    }
                },
                string: {
                    ord: 5,
                    compFunc: function (a, b) {
                        return (a == b ? 0 : (a > b ? 1 : -1));
                    }
                }
            });
        },
        {
            compare: function (docProd1, docProd2) {
                var orderByItemsRes1 = this.getOrderByItems(docProd1.peekBufferedItems()[0]);
                var orderByItemsRes2 = this.getOrderByItems(docProd2.peekBufferedItems()[0]);

                // validate order by items and types
                // TODO: once V1 order by on different types is fixed this need to change
                this.validateOrderByItems(orderByItemsRes1, orderByItemsRes2);

                // no async call in the for loop
                for (var i = 0; i < orderByItemsRes1.length; i++) {
                    // compares the orderby items one by one
                    var compRes = this.compareOrderByItem(orderByItemsRes1[i], orderByItemsRes2[i]);
                    if (compRes !== 0) {
                        if (this.sortOrder[i] === 'Ascending') {
                            return compRes;
                        } else if (this.sortOrder[i] === 'Descending') {
                            return -compRes;
                        }
                    }
                }

                return this.targetPartitionKeyRangeDocProdComparator(docProd1, docProd2);
            },

            compareValue: function (item1, type1, item2, type2) {
                var type1Ord = this._typeOrdComparator[type1].ord;
                var type2Ord = this._typeOrdComparator[type2].ord;
                var typeCmp = type1Ord - type2Ord;

                if (typeCmp !== 0) {
                    // if the types are different, use type ordinal
                    return typeCmp;
                }

                // both are of the same type 
                if ((type1Ord === this._typeOrdComparator['undefined'].ord) || (type1Ord === this._typeOrdComparator['NoValue'].ord)) {
                    // if both types are undefined or Null they are equal
                    return 0;
                }

                var compFunc = this._typeOrdComparator[type1].compFunc;
                assert.notEqual(compFunc, undefined, "cannot find the comparison function");
                // same type and type is defined compare the items
                return compFunc(item1, item2);
            },

            compareOrderByItem: function (orderByItem1, orderByItem2) {
                var type1 = this.getType(orderByItem1);
                var type2 = this.getType(orderByItem2);
                return this.compareValue(orderByItem1['item'], type1, orderByItem2['item'], type2);
            },

            validateOrderByItems: function (res1, res2) {
                this._throwIf(res1.length != res2.length, util.format("Expected %s, but got %s.", type1, type2));
                this._throwIf(res1.length != this.sortOrder.length, 'orderByItems cannot have a different size than sort orders.');

                for (var i = 0; i < this.sortOrder.length; i++) {
                    var type1 = this.getType(res1[i]);
                    var type2 = this.getType(res2[i]);
                    this._throwIf(type1 !== type2, util.format("Expected %s, but got %s.", type1, type2));
                }
            },

            getType: function (orderByItem) {
                if (!'item' in orderByItem) {
                    return 'NoValue';
                }
                var type = typeof (orderByItem['item']);
                this._throwIf(!type in this._typeOrdComparator, util.format("unrecognizable type %s", type));
                return type;
            },

            getOrderByItems: function (res) {
                return res['orderByItems'];
            },

            _throwIf: function (condition, msg) {
                if (condition) {
                    throw Error(msg);
                }
            }
        }
    );
    var OrderByEndpointComponent = Base.defineClass(

        /**
         * Represents an endpoint in handling an order by query. For each processed orderby result it returns 'payload' item of the result
         * @constructor OrderByEndpointComponent
         * @param {object} executionContext              - Underlying Execution Context
         * @ignore
         */
        function (executionContext) {
            this.executionContext = executionContext;
        },
        {
            /**
            * Execute a provided function on the next element in the OrderByEndpointComponent.
            * @memberof OrderByEndpointComponent
            * @instance
            * @param {callback} callback - Function to execute for each element. the function takes two parameters error, element.
            */
            nextItem: function (callback) {
                this.executionContext.nextItem(function (err, item, headers) {
                    if (err) {
                        return callback(err, undefined, headers);
                    }
                    if (item === undefined) {
                        return callback(undefined, undefined, headers);
                    }
                    callback(undefined, item["payload"], headers);
                });
            },

            /**
             * Retrieve the current element on the OrderByEndpointComponent.
             * @memberof OrderByEndpointComponent
             * @instance
             * @param {callback} callback - Function to execute for the current element. the function takes two parameters error, element.
             */
            current: function (callback) {
                this.executionContext.current(function (err, item, headers) {
                    if (err) {
                        return callback(err, undefined, headers);
                    }
                    if (item === undefined) {
                        return callback(undefined, undefined, headers);
                    }
                    callback(undefined, item["payload"], headers);
                });
            },

            /**
             * Determine if there are still remaining resources to processs.
             * @memberof OrderByEndpointComponent
             * @instance
             * @returns {Boolean} true if there is other elements to process in the OrderByEndpointComponent.
             */
            hasMoreResults: function () {
                return this.executionContext.hasMoreResults();
            },
        }
    );

    var TopEndpointComponent = Base.defineClass(
        /**
         * Represents an endpoint in handling top query. It only returns as many results as top arg specified.
         * @constructor TopEndpointComponent
         * @param { object } executionContext - Underlying Execution Context
         * @ignore
         */
        function (executionContext, topCount) {
            this.executionContext = executionContext;
            this.topCount = topCount;
        },
        {

            /**
            * Execute a provided function on the next element in the TopEndpointComponent.
            * @memberof TopEndpointComponent
            * @instance
            * @param {callback} callback - Function to execute for each element. the function takes two parameters error, element.
            */
            nextItem: function (callback) {
                if (this.topCount <= 0) {
                    return callback(undefined, undefined, undefined);
                }
                this.topCount--;
                this.executionContext.nextItem(function (err, item, headers) {
                    callback(err, item, headers);
                });
            },

            /**
             * Retrieve the current element on the TopEndpointComponent.
             * @memberof TopEndpointComponent
             * @instance
             * @param {callback} callback - Function to execute for the current element. the function takes two parameters error, element.
             */
            current: function (callback) {
                if (this.topCount <= 0) {
                    return callback(undefined, undefined);
                }
                this.executionContext.current(function (err, item, headers) {
                    return callback(err, item, headers);
                });
            },

            /**
             * Determine if there are still remaining resources to processs.
             * @memberof TopEndpointComponent
             * @instance
             * @returns {Boolean} true if there is other elements to process in the TopEndpointComponent.
             */
            hasMoreResults: function () {
                return (this.topCount > 0 && this.executionContext.hasMoreResults());
            },
        }
    );

    var AggregateEndpointComponent = Base.defineClass(
        /**
         * Represents an endpoint in handling aggregate queries.
         * @constructor AggregateEndpointComponent
         * @param { object } executionContext - Underlying Execution Context
         * @ignore
         */
        function (executionContext, aggregateOperators) {
            this.executionContext = executionContext;
            this.localAggregators = [];
            var that = this;
            aggregateOperators.forEach(function (aggregateOperator) {
                switch (aggregateOperator) {
                    case 'Average':
                        that.localAggregators.push(new AverageAggregator());
                        break;
                    case 'Count':
                        that.localAggregators.push(new CountAggregator());
                        break;
                    case 'Max':
                        that.localAggregators.push(new MaxAggregator());
                        break;
                    case 'Min':
                        that.localAggregators.push(new MinAggregator());
                        break;
                    case 'Sum':
                        that.localAggregators.push(new SumAggregator());
                        break;
                }
            });
        },
        {
            /**
            * Populate the aggregated values
            * @ignore 
            */
            _getAggregateResult: function (callback) {
                this.toArrayTempResources = [];
                this.aggregateValues = [];
                this.aggregateValuesIndex = -1;
                var that = this;

                this._getQueryResults(function (err, resources) {
                    if (err) {
                        return callback(err, undefined);
                    }

                    resources.forEach(function (resource) {
                        that.localAggregators.forEach(function (aggregator) {
                            var itemValue = undefined;
                            // Get the value of the first property if it exists
                            if (resource && Object.keys(resource).length > 0) {
                                var key = Object.keys(resource)[0];
                                itemValue = resource[key];
                            }
                            aggregator.aggregate(itemValue);
                        });
                    });

                    // Get the aggregated results
                    that.localAggregators.forEach(function (aggregator) {
                        that.aggregateValues.push(aggregator.getResult());
                    });

                    return callback(undefined, that.aggregateValues);
                });
            },

            /**
            * Get the results of queries from all partitions
            * @ignore 
            */
            _getQueryResults: function (callback) {
                var that = this;

                this.executionContext.nextItem(function (err, item) {
                    if (err) {
                        return callback(err, undefined);
                    }

                    if (item === undefined) {
                        // no more results
                        return callback(undefined, that.toArrayTempResources);
                    }

                    that.toArrayTempResources = that.toArrayTempResources.concat(item);
                    return that._getQueryResults(callback);
                });

            },

            /**
            * Execute a provided function on the next element in the AggregateEndpointComponent.
            * @memberof AggregateEndpointComponent
            * @instance
            * @param {callback} callback - Function to execute for each element. the function takes two parameters error, element.
            */
            nextItem: function (callback) {
                var that = this;
                var _nextItem = function (err, resources) {
                    if (err || that.aggregateValues.length <= 0) {
                        return callback(undefined, undefined);
                    }

                    var resource = that.aggregateValuesIndex < that.aggregateValues.length
                        ? that.aggregateValues[++that.aggregateValuesIndex]
                        : undefined;

                    return callback(undefined, resource);
                };

                if (that.aggregateValues == undefined) {
                    that._getAggregateResult(function (err, resources) {
                        return _nextItem(err, resources);
                    });
                }
                else {
                    return _nextItem(undefined, that.aggregateValues);
                }
            },

            /**
             * Retrieve the current element on the AggregateEndpointComponent.
             * @memberof AggregateEndpointComponent
             * @instance
             * @param {callback} callback - Function to execute for the current element. the function takes two parameters error, element.
             */
            current: function (callback) {
                var that = this;
                if (that.aggregateValues == undefined) {
                    that._getAggregateResult(function (err, resources) {
                        return callback(undefined, that.aggregateValues[that.aggregateValuesIndex]);
                    });
                }
                else {
                    return callback(undefined, that.aggregateValues[that.aggregateValuesIndex]);
                }
            },

            /**
             * Determine if there are still remaining resources to processs.
             * @memberof AggregateEndpointComponent
             * @instance
             * @returns {Boolean} true if there is other elements to process in the AggregateEndpointComponent.
             */
            hasMoreResults: function () {
                return this.aggregateValues != null && this.aggregateValuesIndex < this.aggregateValues.length - 1;
            }
        }
    );
    var HeaderUtils = Base.defineClass(
        undefined, undefined,
        {
            getRequestChargeIfAny: function (headers) {
                if (typeof (headers) == 'number') {
                    return headers;
                } else if (typeof (headers) == 'string') {
                    return parseFloat(headers);
                }

                if (headers) {
                    var rc = headers[Constants.HttpHeaders.RequestCharge];
                    if (rc) {
                        return parseFloat(rc);
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
            },

            getInitialHeader: function () {
                var headers = {};
                headers[Constants.HttpHeaders.RequestCharge] = 0;
                return headers;
            },

            mergeHeaders: function (headers, toBeMergedHeaders) {
                if (headers[Constants.HttpHeaders.RequestCharge] == undefined) {
                    headers[Constants.HttpHeaders.RequestCharge] = 0;
                }
                if (!toBeMergedHeaders) {
                    return;
                }
                headers[Constants.HttpHeaders.RequestCharge] += this.getRequestChargeIfAny(toBeMergedHeaders);
                if (toBeMergedHeaders[Constants.HttpHeaders.IsRUPerMinuteUsed]) {
                    headers[Constants.HttpHeaders.IsRUPerMinuteUsed] = toBeMergedHeaders[Constants.HttpHeaders.IsRUPerMinuteUsed];
                }
            }
        }
    );
    var PartitionedQueryContants = {
        QueryInfoPath: 'queryInfo',
        TopPath: ['queryInfo', 'top'],
        OrderByPath: ['queryInfo', 'orderBy'],
        AggregatePath: ['queryInfo', 'aggregates'],
        QueryRangesPath: 'queryRanges',
        RewrittenQueryPath: ['queryInfo', 'rewrittenQuery']
    };

    var PartitionedQueryExecutionContextInfoParser = Base.defineClass(
        undefined, undefined,
        {
            parseRewrittenQuery: function (partitionedQueryExecutionInfo) {
                return this._extract(partitionedQueryExecutionInfo, PartitionedQueryContants.RewrittenQueryPath);
            },
            parseQueryRanges: function (partitionedQueryExecutionInfo) {
                return this._extract(partitionedQueryExecutionInfo, PartitionedQueryContants.QueryRangesPath);
            },
            parseOrderBy: function (partitionedQueryExecutionInfo) {
                return this._extract(partitionedQueryExecutionInfo, PartitionedQueryContants.OrderByPath);
            },
            parseAggregates: function (partitionedQueryExecutionInfo) {
                return this._extract(partitionedQueryExecutionInfo, PartitionedQueryContants.AggregatePath);
            },
            parseTop: function (partitionedQueryExecutionInfo) {
                return this._extract(partitionedQueryExecutionInfo, PartitionedQueryContants.TopPath);
            },
            _extract: function (partitionedQueryExecutionInfo, path) {
                var item = partitionedQueryExecutionInfo;
                if (typeof (path) === 'string') {
                    return item[path];
                }
                assert.ok(Array.isArray(path),
                    util.format("%s is expected to be an array", JSON.stringify(path)));
                for (var index = 0; index < path.length; index++) {
                    item = item[path[index]];
                    if (item === undefined) {
                        return undefined;
                    }
                }
                return item;
            }
        }
    );
    var PipelinedQueryExecutionContext = Base.defineClass(
        /**
         * Provides the PipelinedQueryExecutionContext. It piplelines top and orderby execution context if necessary
         * @constructor PipelinedQueryExecutionContext
         * @param {DocumentClient} documentclient        - The service endpoint to use to create the client.
         * @param {FeedOptions} [options]                - Represents the feed options.
         * @param {object} partitionedQueryExecutionInfo  - PartitionedQueryExecutionInfo
         * @ignore
         */
        function (documentclient, options, executionContext, partitionedQueryExecutionInfo) {
            this.documentclient = documentclient;
            this.options = options;
            this.partitionedQueryExecutionInfo = partitionedQueryExecutionInfo;
            this.endpoint = executionContext;
            this.pageSize = options["maxItemCount"];
            if (this.pageSize === undefined) {
                this.pageSize = PipelinedQueryExecutionContext.DEFAULT_PAGE_SIZE;
            }
            var orderBy = PartitionedQueryExecutionContextInfoParser.parseOrderBy(partitionedQueryExecutionInfo);
            if (Array.isArray(orderBy) && orderBy.length > 0) {
                this.endpoint = new OrderByEndpointComponent(this.endpoint);
            }

            var aggregates = PartitionedQueryExecutionContextInfoParser.parseAggregates(partitionedQueryExecutionInfo);
            if (Array.isArray(aggregates) && aggregates.length > 0) {
                this.endpoint = new AggregateEndpointComponent(this.endpoint, aggregates);
            }

            var top = PartitionedQueryExecutionContextInfoParser.parseTop(partitionedQueryExecutionInfo);
            if (typeof (top) === 'number') {
                this.endpoint = new TopEndpointComponent(this.endpoint, top);
            }
        },
        {
            nextItem: function (callback) {
                return this.endpoint.nextItem(callback);
            },

            current: function (callback) {
                return this.endpoint.current(callback);
            },

            hasMoreResults: function (callback) {
                return this.endpoint.hasMoreResults(callback);
            },

            fetchMore: function (callback) {

                // if the wrapped endpoint has different implementation for fetchMore use that
                // otherwise use the default implementation
                if (typeof this.endpoint.fetchMore === 'function') {
                    this.endpoint.fetchMore(callback);
                } else {
                    this._fetchMoreTempBufferedResults = [];
                    this._fetchMoreRespHeaders = HeaderUtils.getInitialHeader();
                    this._fetchMoreImplementation(callback);
                }
            },

            _fetchMoreImplementation: function (callback) {
                var that = this;

                this.endpoint.nextItem(function (err, resources, headers) {

                    HeaderUtils.mergeHeaders(that._fetchMoreRespHeaders, headers);

                    if (err) {
                        return callback(err, undefined, that._fetchMoreRespHeaders);
                    }
                    // concatinate the results and fetch more
                    that._fetchMoreLastResHeaders = headers;
                    if (resources === undefined) {
                        // no more results
                        if (that._fetchMoreTempBufferedResults.length === 0) {
                            return callback(undefined, undefined, that._fetchMoreRespHeaders);
                        }

                        var temp = that._fetchMoreTempBufferedResults;
                        that._fetchMoreTempBufferedResults = [];
                        return callback(undefined, temp, that._fetchMoreRespHeaders);
                    }

                    that._fetchMoreTempBufferedResults = that._fetchMoreTempBufferedResults.concat(resources);

                    if (that.pageSize <= that._fetchMoreTempBufferedResults.length) {
                        // fetched enough results
                        var temp = that._fetchMoreTempBufferedResults;
                        that._fetchMoreTempBufferedResults = [];

                        return callback(undefined, temp, that._fetchMoreRespHeaders);
                    }

                    that._fetchMoreImplementation(callback);
                });
            },
        },
        {
            DEFAULT_PAGE_SIZE: 10
        }
    );
    var ProxyQueryExecutionContext = Base.defineClass(
        /**
         * Represents a ProxyQueryExecutionContext Object. If the query is a partitioned query which can be parallelized it switches the execution context.
         * @constructor ProxyQueryExecutionContext
         * @param {object} documentclient                - The documentclient object.
         * @param {SqlQuerySpec | string} query          - A SQL query.
         * @param {FeedOptions} options                  - Represents the feed options.
         * @param {callback | callback[]} fetchFunctions - A function to retrieve each page of data. An array of functions may be used to query more than one partition.
         * @param {string} [resourceLink]                - collectionLink for parallelized query execution.
         * @ignore
        */
        function (documentclient, query, options, fetchFunctions, resourceLink) {
            this.documentclient = documentclient;
            this.query = query;
            this.fetchFunctions = fetchFunctions;
            // clone options
            this.options = JSON.parse(JSON.stringify(options || {}));
            this.resourceLink = resourceLink;
            this.queryExecutionContext = new DefaultQueryExecutionContext(this.documentclient, this.query, this.options, this.fetchFunctions);
        },
        {

            /**
             * Execute a provided function on the next element in the ProxyQueryExecutionContext.
             * @memberof ProxyQueryExecutionContext
             * @instance
             * @param {callback} callback - Function to execute for each element. the function takes two parameters error, element.
             */
            nextItem: function (callback) {
                var that = this;
                this.queryExecutionContext.nextItem(function (err, resources, headers) {

                    if (err) {
                        if (that._hasPartitionedExecutionInfo(err)) {
                            // if that's a partitioned execution info switches the execution context
                            var partitionedExecutionInfo = that._getParitionedExecutionInfo(err);
                            that.queryExecutionContext = that._createPipelinedExecutionContext(partitionedExecutionInfo);
                            return that.nextItem(callback);
                        } else {
                            return callback(err, undefined, headers);
                        }
                    } else {
                        callback(undefined, resources, headers);
                    }
                });
            },

            _createPipelinedExecutionContext: function (partitionedExecutionInfo) {

                assert.notStrictEqual(this.resourceLink, undefined, "for top/orderby resourceLink is required.");

                assert.ok(!Array.isArray(this.resourceLink) || this.resourceLink.length === 1,
                    "for top/orderby exactly one collectionLink is required");

                var collectionLink = undefined;
                if (Array.isArray(this.resourceLink)) {
                    collectionLink = this.resourceLink[0];
                } else {
                    collectionLink = this.resourceLink;
                }

                var parallelQueryExecutionContext = new ParallelQueryExecutionContext(this.documentclient,
                    Array.isArray(this.resourceLink) ? this.resourceLink[0] : this.resourceLink, this.query,
                    this.options, partitionedExecutionInfo);
                return new PipelinedQueryExecutionContext(this.client, this.options,
                    parallelQueryExecutionContext, partitionedExecutionInfo);
            },

            /**
             * Retrieve the current element on the ProxyQueryExecutionContext.
             * @memberof ProxyQueryExecutionContext
             * @instance
             * @param {callback} callback - Function to execute for the current element. the function takes two parameters error, element.
             */
            current: function (callback) {
                var that = this;
                this.queryExecutionContext.current(function (err, resources, headers) {

                    if (err) {
                        if (that._hasPartitionedExecutionInfo(err)) {
                            // if that's a partitioned execution info switches the execution context
                            var partitionedExecutionInfo = that._getParitionedExecutionInfo(err);
                            that.queryExecutionContext = that._createPipelinedExecutionContext(partitionedExecutionInfo);
                            return that.current(callback);
                        } else {
                            return callback(err, undefined, headers);
                        }
                    } else {
                        callback(undefined, resources, headers);
                    }
                });
            },

            /**
             * Determine if there are still remaining resources to process.
             * @memberof ProxyQueryExecutionContext
             * @instance
             * @returns {Boolean} true if there is other elements to process in the ProxyQueryExecutionContext.
             */
            hasMoreResults: function () {
                return this.queryExecutionContext.hasMoreResults();
            },

            fetchMore: function (callback) {
                var that = this;

                this.queryExecutionContext.fetchMore(function (err, resources, headers) {
                    if (err) {
                        if (that._hasPartitionedExecutionInfo(err)) {
                            // if that's a partitioned execution info switches the execution context
                            var partitionedExecutionInfo = that._getParitionedExecutionInfo(err);
                            that.queryExecutionContext = that._createPipelinedExecutionContext(partitionedExecutionInfo);
                            return that.queryExecutionContext.fetchMore(callback);
                        } else {
                            return callback(err, undefined, headers);
                        }
                    } else {
                        callback(undefined, resources, headers);
                    }
                });
            },

            _hasPartitionedExecutionInfo: function (error) {
                return (error.code === 400) && ('substatus' in error) && (error['substatus'] === 1004);
            },

            _getParitionedExecutionInfo: function (error) {

                return JSON.parse(JSON.parse(error.body).additionalErrorInfo);
            },
        }
    );
    var _PartitionKeyRange = {
        //Partition Key Range Constants
        MinInclusive: "minInclusive",
        MaxExclusive: "maxExclusive",
        Id: "id"
    };

    var _QueryRangeConstants = {
        //Partition Key Range Constants
        MinInclusive: "minInclusive",
        MaxExclusive: "maxExclusive",
        min: "min"
    };

    var _Constants = {
        MinimumInclusiveEffectivePartitionKey: "",
        MaximumExclusiveEffectivePartitionKey: "FF",
    };

    var QueryRange = Base.defineClass(
        /**
         * Represents a QueryRange. 
         * @constructor QueryRange
         * @param {string} rangeMin                - min
         * @param {string} rangeMin                - max
         * @param {boolean} isMinInclusive         - isMinInclusive
         * @param {boolean} isMaxInclusive         - isMaxInclusive
         * @ignore
         */
        function (rangeMin, rangeMax, isMinInclusive, isMaxInclusive) {
            this.min = rangeMin;
            this.max = rangeMax;
            this.isMinInclusive = isMinInclusive;
            this.isMaxInclusive = isMaxInclusive;
        },
        {
            overlaps: function (other) {
                var range1 = this;
                var range2 = other;
                if (range1 === undefined || range2 === undefined) return false;
                if (range1.isEmpty() || range2.isEmpty()) return false;

                if (range1.min <= range2.max || range2.min <= range1.max) {
                    if ((range1.min === range2.max && !(range1.isMinInclusive && range2.isMaxInclusive))
                        || (range2.min === range1.max && !(range2.isMinInclusive && range1.isMaxInclusive))) {
                        return false;
                    }
                    return true;
                }
                return false;
            },

            isEmpty: function () {
                return (!(this.isMinInclusive && this.isMaxInclusive)) && this.min === this.max;
            }
        },
        {
            /**
             * Parse a QueryRange from a partitionKeyRange
             * @returns QueryRange
             * @ignore
             */
            parsePartitionKeyRange: function (partitionKeyRange) {
                return new QueryRange(partitionKeyRange[_PartitionKeyRange.MinInclusive], partitionKeyRange[_PartitionKeyRange.MaxExclusive],
                    true, false);
            },
            /**
             * Parse a QueryRange from a dictionary
             * @returns QueryRange
             * @ignore
             */
            parseFromDict: function (queryRangeDict) {
                return new QueryRange(queryRangeDict.min, queryRangeDict.max, queryRangeDict.isMinInclusive, queryRangeDict.isMaxInclusive);
            }
        }
    );

    var InMemoryCollectionRoutingMap = Base.defineClass(
        /**
         * Represents a InMemoryCollectionRoutingMap Object, Stores partition key ranges in an efficient way with some additional information and provides
         * convenience methods for working with set of ranges.
         */
        function (rangeById, rangeByInfo, orderedPartitionKeyRanges, orderedPartitionInfo, collectionUniqueId) {
            this._rangeById = rangeById;
            this._rangeByInfo = rangeByInfo;
            this._orderedPartitionKeyRanges = orderedPartitionKeyRanges;
            this._orderedRanges = orderedPartitionKeyRanges.map(
                function (pkr) {
                    return new QueryRange(
                        pkr[_PartitionKeyRange.MinInclusive], pkr[_PartitionKeyRange.MaxExclusive], true, false);
                });
            this._orderedPartitionInfo = orderedPartitionInfo;
            this._collectionUniqueId = collectionUniqueId;
        },
        {

            getOrderedParitionKeyRanges: function () {
                return this._orderedPartitionKeyRanges;
            },

            getRangeByEffectivePartitionKey: function (effectivePartitionKeyValue) {

                if (_Constants.MinimumInclusiveEffectivePartitionKey === effectivePartitionKeyValue) {
                    return this._orderedPartitionKeyRanges[0];
                }

                if (_Constants.MaximumExclusiveEffectivePartitionKey === effectivePartitionKeyValue) {
                    return undefined;
                }

                var sortedLow = this._orderedRanges.map(
                    function (r) {
                        return { v: r.min, b: !r.isMinInclusive };
                    });

                var index = bs.le(sortedLow, { v: effectivePartitionKeyValue, b: true }, this._vbCompareFunction);
                // that's an error
                assert.ok(index >= 0, "error in collection routing map, queried partition key is less than the start range.");

                return this._orderedPartitionKeyRanges[index];
            },

            _vbCompareFunction: function (x, y) {
                if (x.v > y.v) return 1;
                if (x.v < y.v) return -1;
                if (x.b > y.b) return 1;
                if (x.b < y.b) return -1;
                return 0;
            },

            getRangeByPartitionKeyRangeId: function (partitionKeyRangeId) {

                var t = this._rangeById[partitionKeyRangeId];

                if (t === undefined) {
                    return undefined;
                }
                return t[0];
            },

            getOverlappingRanges: function (providedQueryRanges) {

                if (!_.isArray(providedQueryRanges)) {
                    return this.getOverlappingRanges([providedQueryRanges]);
                }

                var minToPartitionRange = {};
                var sortedLow = this._orderedRanges.map(
                    function (r) {
                        return { v: r.min, b: !r.isMinInclusive };
                    });
                var sortedHigh = this._orderedRanges.map(
                    function (r) {
                        return { v: r.max, b: r.isMaxInclusive };
                    });

                // this for loop doesn't invoke any async callback
                for (var i = 0; i < providedQueryRanges.length; i++) {
                    var queryRange = providedQueryRanges[i];
                    if (queryRange.isEmpty()) {
                        continue;
                    }
                    var minIndex = bs.le(sortedLow, { v: queryRange.min, b: !queryRange.isMinInclusive }, this._vbCompareFunction);
                    assert.ok(minIndex >= 0, "error in collection routing map, queried value is less than the start range.");

                    var maxIndex = bs.ge(sortedHigh, { v: queryRange.max, b: queryRange.isMaxInclusive }, this._vbCompareFunction);
                    assert.ok(maxIndex < sortedHigh.length, "error in collection routing map, queried value is greater than the end range.");

                    // the for loop doesn't invoke any async callback
                    for (var j = minIndex; j < maxIndex + 1; j++) {
                        if (queryRange.overlaps(this._orderedRanges[j])) {
                            minToPartitionRange[this._orderedPartitionKeyRanges[j][_PartitionKeyRange.MinInclusive]] = this._orderedPartitionKeyRanges[j];
                        }
                    }
                }

                var overlappingPartitionKeyRanges = _.values(minToPartitionRange);

                var getKey = function (r) {
                    return r[_PartitionKeyRange.MinInclusive];
                };
                return _.sortBy(overlappingPartitionKeyRanges, getKey);
            }
        }
    );

    var CollectionRoutingMapFactory = Base.defineClass(undefined, undefined,
        {
            createCompleteRoutingMap: function (partitionKeyRangeInfoTuppleList, collectionUniqueId) {
                var rangeById = {};
                var rangeByInfo = {};

                var sortedRanges = [];

                // the for loop doesn't invoke any async callback
                for (var index = 0; index < partitionKeyRangeInfoTuppleList.length; index++) {
                    var r = partitionKeyRangeInfoTuppleList[index];
                    rangeById[r[0][_PartitionKeyRange.Id]] = r;
                    rangeByInfo[r[1]] = r[0];
                    sortedRanges.push(r);
                }

                sortedRanges = _.sortBy(sortedRanges,
                    function (r) {
                        return r[0][_PartitionKeyRange.MinInclusive];
                    });
                var partitionKeyOrderedRange = sortedRanges.map(function (r) { return r[0]; });
                var orderedPartitionInfo = sortedRanges.map(function (r) { return r[1]; });

                if (!this._isCompleteSetOfRange(partitionKeyOrderedRange)) return undefined;
                return new InMemoryCollectionRoutingMap(rangeById, rangeByInfo, partitionKeyOrderedRange, orderedPartitionInfo, collectionUniqueId);
            },

            _isCompleteSetOfRange: function (partitionKeyOrderedRange) {
                var isComplete = false;
                if (partitionKeyOrderedRange.length > 0) {
                    var firstRange = partitionKeyOrderedRange[0];
                    var lastRange = partitionKeyOrderedRange[partitionKeyOrderedRange.length - 1];
                    isComplete = (firstRange[_PartitionKeyRange.MinInclusive] === _Constants.MinimumInclusiveEffectivePartitionKey);
                    isComplete &= (lastRange[_PartitionKeyRange.MaxExclusive] === _Constants.MaximumExclusiveEffectivePartitionKey);

                    for (var i = 1; i < partitionKeyOrderedRange.length; i++) {
                        var previousRange = partitionKeyOrderedRange[i - 1];
                        var currentRange = partitionKeyOrderedRange[i];
                        isComplete &= (previousRange[_PartitionKeyRange.MaxExclusive] == currentRange[_PartitionKeyRange.MinInclusive]);

                        if (!isComplete) {
                            if (previousRange[_PartitionKeyRange.MaxExclusive] > currentRange[_PartitionKeyRange.MinInclusive]) {
                                throw Error("Ranges overlap");
                            }
                            break;
                        }
                    }
                }
                return isComplete;
            }
        }
    );
    var PartitionKeyRangeCache = Base.defineClass(

        /**
         * Represents a PartitionKeyRangeCache. PartitionKeyRangeCache provides list of effective partition key ranges for a collection.
         * This implementation loads and caches the collection routing map per collection on demand.
         * @constructor PartitionKeyRangeCache
         * @param {object} documentclient                - The documentclient object.
         * @ignore
         */
        function (documentclient) {
            this.documentclient = documentclient;
            this.collectionRoutingMapByCollectionId = {};
            this.sem = semaphore(1);
        },
        {
            /**
             * Finds or Instantiates the requested Collection Routing Map and invokes callback
             * @param {callback} callback                - Function to execute for the collection routing map. the function takes two parameters error, collectionRoutingMap.
             * @param {string} collectionLink            - Requested collectionLink
             * @ignore
             */
            _onCollectionRoutingMap: function (callback, collectionLink) {
                var isNameBased = Base.isLinkNameBased(collectionLink);
                var collectionId = this.documentclient.getIdFromLink(collectionLink, isNameBased);

                var collectionRoutingMap = this.collectionRoutingMapByCollectionId[collectionId];
                if (collectionRoutingMap === undefined) {
                    // attempt to consturct collection routing map
                    var that = this;
                    var semaphorizedFuncCollectionMapInstantiator = function () {
                        var collectionRoutingMap = that.collectionRoutingMapByCollectionId[collectionId];
                        if (collectionRoutingMap === undefined) {
                            var partitionKeyRangesIterator = that.documentclient.readPartitionKeyRanges(collectionLink);
                            partitionKeyRangesIterator.toArray(function (err, resources) {
                                if (err) {
                                    return callback(err, undefined);
                                }

                                collectionRoutingMap = CollectionRoutingMapFactory.createCompleteRoutingMap(
                                    resources.map(function (r) { return [r, true]; }),
                                    collectionId);

                                that.collectionRoutingMapByCollectionId[collectionId] = collectionRoutingMap;
                                that.sem.leave();
                                return callback(undefined, collectionRoutingMap);
                            });

                        } else {
                            // sanity gaurd 
                            that.sem.leave();
                            return callback(undefined, collectionRoutingMap.getOverlappingRanges(partitionKeyRanges));
                        }
                    };

                    // We want only one attempt to construct collectionRoutingMap so we pass the consturction in the semaphore take
                    this.sem.take(semaphorizedFuncCollectionMapInstantiator);

                } else {
                    callback(undefined, collectionRoutingMap);
                }
            },

            /**
             * Given the query ranges and a collection, invokes the callback on the list of overlapping partition key ranges
             * @param {callback} callback - Function execute on the overlapping partition key ranges result, takes two parameters error, partition key ranges
             * @param collectionLink
             * @param queryRanges
             * @ignore
             */
            getOverlappingRanges: function (callback, collectionLink, queryRanges) {
                this._onCollectionRoutingMap(function (err, collectionRoutingMap) {
                    if (err) {
                        return callback(err, undefined);
                    }
                    return callback(undefined, collectionRoutingMap.getOverlappingRanges(queryRanges));
                }, collectionLink);
            }
        }
    );
    var SmartRoutingMapProvider = Base.defineClass(

        /**
        * Represents a SmartRoutingMapProvider Object,  Efficiently uses PartitionKeyRangeCache and minimizes the unnecessary
        * invocation of PartitionKeyRangeCache.getOverlappingRanges()
        * @constructor SmartRoutingMapProvider
        * @param {object} documentclient                - The documentclient object.
        * @ignore
        */
        function (documentclient) {
            this._partitionKeyRangeCache = new PartitionKeyRangeCache(documentclient);
        },
        {
            _secondRangeIsAfterFirstRange: function (range1, range2) {
                assert.notEqual(range1.max, undefined, "invalid arg");
                assert.notEqual(range2.min, undefined, "invalid arg");

                if (range1.max > range2.min) {
                    // r.min < #previous_r.max
                    return false;
                } else {
                    if (range1.max === range2.min && range1.isMaxInclusive && range2.isMinInclusive) {
                        // the inclusive ending endpoint of previous_r is the same as the inclusive beginning endpoint of r
                        // they share a point
                        return false;
                    }
                    return true;
                }
            },

            _isSortedAndNonOverlapping: function (ranges) {
                for (var idx = 1; idx < ranges.length; idx++) {
                    var previousR = ranges[idx - 1];
                    var r = ranges[idx];
                    if (!this._secondRangeIsAfterFirstRange(previousR, r)) {
                        return false;
                    }
                }
                return true;
            },

            _stringMax: function (a, b) {
                return (a >= b ? a : b);
            },

            _stringCompare: function (a, b) {
                return (a == b ? 0 : (a > b ? 1 : -1));
            },

            _subtractRange: function (r, partitionKeyRange) {
                var left = this._stringMax(partitionKeyRange[_PartitionKeyRange.MaxExclusive], r.min);
                var leftInclusive;
                if (this._stringCompare(left, r.min) === 0) {
                    leftInclusive = r.isMinInclusive;
                } else {
                    leftInclusive = false;
                }
                return new QueryRange(left, r.max, leftInclusive,
                    r.isMaxInclusive);
            },

            /**
             * Given the sorted ranges and a collection, invokes the callback on the list of overlapping partition key ranges
             * @param {callback} callback - Function execute on the overlapping partition key ranges result, takes two parameters error, partition key ranges
             * @param collectionLink
             * @param sortedRanges
             * @ignore
             */
            getOverlappingRanges: function (callback, collectionLink, sortedRanges) {
                // validate if the list is non- overlapping and sorted
                if (!this._isSortedAndNonOverlapping(sortedRanges)) {
                    return callback(new Error("the list of ranges is not a non-overlapping sorted ranges"), undefined);
                }

                var partitionKeyRanges = [];

                if (sortedRanges.length === 0) {
                    return callback(undefined, partitionKeyRanges);
                }

                var that = this;
                this._partitionKeyRangeCache._onCollectionRoutingMap(function (err, collectionRoutingMap) {
                    if (err) {
                        return callback(err, undefined);
                    }

                    var index = 0;
                    var currentProvidedRange = sortedRanges[index];
                    while (true) {
                        if (currentProvidedRange.isEmpty()) {
                            // skip and go to the next item
                            if (++index >= sortedRanges.length) {
                                return callback(undefined, partitionKeyRanges);
                            }
                            currentProvidedRange = sortedRanges[index];
                            continue;
                        }

                        var queryRange;
                        if (partitionKeyRanges.length > 0) {
                            queryRange = that._subtractRange(
                                currentProvidedRange, partitionKeyRanges[partitionKeyRanges.length - 1]);
                        } else {
                            queryRange = currentProvidedRange;
                        }

                        var overlappingRanges = collectionRoutingMap.getOverlappingRanges(queryRange);
                        assert.ok(overlappingRanges.length > 0, util.format("error: returned overlapping ranges for queryRange %s is empty", queryRange));
                        partitionKeyRanges = partitionKeyRanges.concat(overlappingRanges);

                        var lastKnownTargetRange = QueryRange.parsePartitionKeyRange(partitionKeyRanges[partitionKeyRanges.length - 1]);
                        assert.notEqual(lastKnownTargetRange, undefined);
                        // the overlapping ranges must contain the requested range
                        assert.ok(that._stringCompare(currentProvidedRange.max, lastKnownTargetRange.max) <= 0,
                            util.format("error: returned overlapping ranges %s does not contain the requested range %s", overlappingRanges, queryRange));

                        // the current range is contained in partitionKeyRanges just move forward
                        if (++index >= sortedRanges.length) {
                            return callback(undefined, partitionKeyRanges);
                        }
                        currentProvidedRange = sortedRanges[index];

                        while (that._stringCompare(currentProvidedRange.max, lastKnownTargetRange.max) <= 0) {
                            // the current range is covered too.just move forward
                            if (++index >= sortedRanges.length) {
                                return callback(undefined, partitionKeyRanges);
                            }
                            currentProvidedRange = sortedRanges[index];
                        }
                    }
                }, collectionLink);
            }
        }
    );

    var FormatPlaceHolder = "{documentdb-formattableorderbyquery-filter}";
    var ParallelQueryExecutionContext = Base.defineClass(
        /**
         * Provides the ParallelQueryExecutionContext.
         * This class is capable of handling parallelized queries.
         *
         * When handling a parallelized (e.g., orderby) query, it instantiates one instance of
         * DocumentProcuder per target partition key range and aggregates the result of each.
         *
         * @constructor ParallelQueryExecutionContext
         * @param {DocumentClient} documentclient        - The service endpoint to use to create the client.
         * @param {string} collectionLink                - The Collection Link
         * @param {FeedOptions} [options]                - Represents the feed options.
         * @param {object} partitionedQueryExecutionInfo - PartitionedQueryExecutionInfo
         * @ignore
         */
        function (documentclient, collectionLink, query, options, partitionedQueryExecutionInfo) {
            this.documentclient = documentclient;
            this.collectionLink = collectionLink;
            this.query = query;
            this.options = options;
            this.paritionedQueryExecutionInfo = partitionedQueryExecutionInfo;
            this.err = undefined;
            this.state = ParallelQueryExecutionContext.STATES.start;
            this.routingProvider = new SmartRoutingMapProvider(this.documentclient);
            this.sortOrders = PartitionedQueryExecutionContextInfoParser.parseOrderBy(this.paritionedQueryExecutionInfo);

            if (Array.isArray(this.sortOrders) && this.sortOrders.length > 0) {
                this.documentProducerComparator = DocumentProducer.createOrderByComparator(this.sortOrders);
            } else {
                this.documentProducerComparator = DocumentProducer.createTargetPartitionKeyRangeComparator();
            }

            this.pageSize = options["maxItemCount"];
            if (this.pageSize === undefined) {
                this.pageSize = ParallelQueryExecutionContext.DEFAULT_PAGE_SIZE;
                this.options["maxItemCount"] = this.pageSize;
            }

            // this is a max priority queue
            this.orderByPQ = new PriorityQueue(function (a, b) { return that.documentProducerComparator(b, a); });

            this.state = ParallelQueryExecutionContext.STATES.started;
            this.sem = new semaphore(1);

            this.requestContinuation = options ? options.continuation : null;

            // response headers of undergoing operation
            this._respHeaders = HeaderUtils.getInitialHeader();
            var that = this;
            var createDocumentProducersAndFillUpPriorityQueueFunc = function () {
                // ensure the lock is released after finishing up
                that._onTargetPartitionRanges(function (err, targetPartitionRanges) {
                    if (err) {
                        that.err = err;
                        // relase the lock
                        that.sem.leave();
                        return;
                    }

                    that.waitingForInternalExcecutionContexts = targetPartitionRanges.length;
                    var maxDegreeOfParallelism = options.maxDegreeOfParallelism || 1;

                    if (maxDegreeOfParallelism > 0) {
                        maxDegreeOfParallelism = Math.min(maxDegreeOfParallelism, targetPartitionRanges.length);
                    } else {
                        maxDegreeOfParallelism = targetPartitionRanges.length;
                    }

                    var parallelismSem = semaphore(Math.max(maxDegreeOfParallelism, 1));

                    var targetPartitionQueryExecutionContextList = [];

                    var filteredPartitionKeyRanges = [];

                    if (that.requestContinuation) {
                        try {
                            var suppliedCompositeContinuationToken = JSON.parse(that.requestContinuation);
                            filteredPartitionKeyRanges = that.getPartitionKeyRangesForContinuation(
                                suppliedCompositeContinuationToken, targetPartitionRanges);

                            if (filteredPartitionKeyRanges.length > 0) {
                                targetPartitionQueryExecutionContextList.push(
                                    that._createTargetPartitionQueryExecutionContext(
                                        filteredPartitionKeyRanges[0], suppliedCompositeContinuationToken.token));
                            }

                            filteredPartitionKeyRanges = filteredPartitionKeyRanges.slice(1);

                        } catch (e) {
                            that.err = e;
                            that.sem.leave();
                            return;
                        }

                    } else {
                        filteredPartitionKeyRanges = targetPartitionRanges;
                    }


                    filteredPartitionKeyRanges.forEach(
                        function (partitionTargetRange) {
                            // no async callback
                            targetPartitionQueryExecutionContextList.push(
                                that._createTargetPartitionQueryExecutionContext(partitionTargetRange));
                        }
                    );

                    targetPartitionQueryExecutionContextList.forEach(
                        function (targetQueryExContext) {

                            // has async callback
                            var throttledFunc = function () {
                                targetQueryExContext.current(function (err, document, headers) {
                                    try {
                                        that._mergeWithActiveResponseHeaders(headers);
                                        if (err) {
                                            that.err = err;
                                            return;
                                        }

                                        if (document == undefined) {
                                            // no results on this one
                                            return;
                                        }
                                        // if there are matching results in the target ex range add it to the priority queue
                                        try {
                                            that.orderByPQ.enq(targetQueryExContext);
                                        } catch (e) {
                                            that.err = e;
                                        }
                                    } finally {
                                        parallelismSem.leave();
                                        that._decrementInitiationLock();
                                    }
                                });
                            }
                            parallelismSem.take(throttledFunc);
                        });
                });
            };
            this.sem.take(createDocumentProducersAndFillUpPriorityQueueFunc);
        },
        {
            getPartitionKeyRangesForContinuation: function (suppliedCompositeContinuationToken,
                partitionKeyRanges) {

                var startRange = {};
                startRange[_PartitionKeyRange.MinInclusive] = suppliedCompositeContinuationToken.range.min;
                startRange[_PartitionKeyRange.MaxExclusive] = suppliedCompositeContinuationToken.range.max;

                var vbCompareFunction = function (x, y) {
                    if (x[_PartitionKeyRange.MinInclusive] > y[_PartitionKeyRange.MinInclusive]) return 1;
                    if (x[_PartitionKeyRange.MinInclusive] < y[_PartitionKeyRange.MinInclusive]) return -1;

                    return 0;
                }

                var minIndex = bs.le(partitionKeyRanges, startRange, vbCompareFunction);
                // that's an error

                if (minIndex > 0) {
                    throw new Error("BadRequestException: InvalidContinuationToken");
                }

                // return slice of the partition key ranges
                return partitionKeyRanges.slice(minIndex, partitionKeyRanges.length - minIndex);
            },

            _decrementInitiationLock: function () {
                // decrements waitingForInternalExcecutionContexts
                // if waitingForInternalExcecutionContexts reaches 0 releases the semaphore and changes the state
                this.waitingForInternalExcecutionContexts = this.waitingForInternalExcecutionContexts - 1;
                if (this.waitingForInternalExcecutionContexts === 0) {
                    this.sem.leave();
                    if (this.orderByPQ.size() === 0) {
                        this.state = ParallelQueryExecutionContext.STATES.inProgress;
                    }
                }
            },

            _mergeWithActiveResponseHeaders: function (headers) {
                HeaderUtils.mergeHeaders(this._respHeaders, headers);
            },

            _getAndResetActiveResponseHeaders: function () {
                var ret = this._respHeaders;
                this._respHeaders = HeaderUtils.getInitialHeader();
                return ret;
            },

            /**
            * Execute a provided function on the next element in the ParallelQueryExecutionContext.
            * @memberof ParallelQueryExecutionContext
            * @instance
            * @param {callback} callback - Function to execute for each element. the function takes two parameters error, element.
            */
            nextItem: function (callback) {
                if (this.err) {
                    // if there is a prior error return error
                    return callback(this.err, undefined);
                }
                var that = this;
                this.sem.take(function () {
                    // NOTE: lock must be released before invoking quitting
                    if (that.err) {
                        // release the lock before invoking callback
                        that.sem.leave();
                        // if there is a prior error return error
                        return callback(that.err, undefined, that._getAndResetActiveResponseHeaders());
                    }

                    if (that.orderByPQ.size() === 0) {
                        // there is no more results
                        that.state = ParallelQueryExecutionContext.STATES.ended;
                        // release the lock before invoking callback
                        that.sem.leave();
                        return callback(undefined, undefined, that._getAndResetActiveResponseHeaders());
                    }
                    try {
                        var targetPartitionRangeDocumentProducer = that.orderByPQ.deq();
                    } catch (e) {
                        // if comparing elements of the priority queue throws exception
                        // set that error and return error
                        that.err = e;
                        // release the lock before invoking callback
                        that.sem.leave();
                        return callback(that.err, undefined, that._getAndResetActiveResponseHeaders());
                    }

                    targetPartitionRangeDocumentProducer.nextItem(function (err, item, headers) {
                        that._mergeWithActiveResponseHeaders(headers);
                        if (err) {
                            // this should never happen
                            // because the documentProducer already has buffered an item
                            // assert err === undefined
                            that.err =
                                new Error(
                                    util.format(
                                        "Extracted DocumentProducer from the priority queue fails to get the buffered item. Due to %s",
                                        JSON.stringify(err)));
                            // release the lock before invoking callback
                            that.sem.leave();
                            return callback(that.err, undefined, that._getAndResetActiveResponseHeaders());
                        }
                        if (item === undefined) {
                            // this should never happen
                            // because the documentProducer already has buffered an item
                            // assert item !== undefined
                            that.err =
                                new Error(
                                    util.format(
                                        "Extracted DocumentProducer from the priority queue doesn't have any buffered item!"));
                            // release the lock before invoking callback
                            that.sem.leave();
                            return callback(that.err, undefined, that._getAndResetActiveResponseHeaders());
                        }

                        // we need to put back the document producer to the queue if it has more elements.
                        // the lock will be released after we know document producer must be put back in the queue or not
                        targetPartitionRangeDocumentProducer.current(function (err, afterItem, headers) {
                            try {
                                that._mergeWithActiveResponseHeaders(headers);
                                if (err) {
                                    that.err = err;
                                    return;
                                }
                                if (afterItem === undefined) {
                                    // no more results is left in this document producer
                                    return;
                                }
                                try {
                                    var headItem = targetPartitionRangeDocumentProducer.peekBufferedItems()[0];
                                    assert.notStrictEqual(headItem, undefined,
                                        'Extracted DocumentProducer from PQ is invalid state with no result!');
                                    that.orderByPQ.enq(targetPartitionRangeDocumentProducer);
                                } catch (e) {
                                    // if comparing elements in priority queue throws exception
                                    // set error
                                    that.err = e;
                                }
                                return;
                            } finally {
                                // release the lock before returning
                                that.sem.leave();
                            }
                        });

                        // invoke the callback on the item
                        callback(undefined, item, that._getAndResetActiveResponseHeaders());
                    });
                });
            },

            /**
             * Retrieve the current element on the ParallelQueryExecutionContext.
             * @memberof ParallelQueryExecutionContext
             * @instance
             * @param {callback} callback - Function to execute for the current element. the function takes two parameters error, element.
             */
            current: function (callback) {
                if (this.err) {
                    return callback(this.err, undefined, that._getAndResetActiveResponseHeaders());
                }
                var that = this;
                this.sem.take(function () {
                    try {
                        if (that.err) {
                            return callback(that.err, undefined, that._getAndResetActiveResponseHeaders());
                        }

                        if (that.orderByPQ.size() === 0) {
                            return callback(undefined, undefined, that._getAndResetActiveResponseHeaders());
                        }
                        var targetPartitionRangeDocumentProducer = that.orderByPQ.peek();
                        targetPartitionRangeDocumentProducer.current(callback);
                    } finally {
                        that.sem.leave();
                    }
                });
            },

            /**
             * Determine if there are still remaining resources to processs based on the value of the continuation token or the elements remaining on the current batch in the QueryIterator.
             * @memberof ParallelQueryExecutionContext
             * @instance
             * @returns {Boolean} true if there is other elements to process in the ParallelQueryExecutionContext.
             */
            hasMoreResults: function () {
                return !(this.state === ParallelQueryExecutionContext.STATES.ended || this.err !== undefined);
            },

            fetchMore: function (callback) {

                if (this.err) {
                    return callback(this.err, undefined, that._getAndResetActiveResponseHeaders());
                }

                var that = this;
                this.sem.take(function () {
                    try {
                        if (that.err) {
                            return callback(that.err, undefined, that._getAndResetActiveResponseHeaders());
                        }

                        if (Array.isArray(that.sortOrders) && that.sortOrders.length > 0) {

                            that._fetchMoreTempBufferedResults = [];
                            that._fetchMoreImplementation(callback);

                        } else {

                            that._fetchMoreTempBufferedResults = [];
                            that._fetchMoreBasicParallel(callback);
                        }
                    } finally {
                        that.sem.leave();
                    }
                });
            },

            _fetchMoreBasicParallel: function (callback) {

                if (this.orderByPQ.size() === 0) {
                    if (this._fetchMoreTempBufferedResults.length > 0) {

                        return callback(undefined, this._fetchMoreTempBufferedResults, this._getAndResetActiveResponseHeaders());
                    } else {
                        this.state = ParallelQueryExecutionContext.STATES.ended;
                        return callback(undefined, undefined, undefined);
                    }
                }

                var targetPartitionRangeDocumentProducer = this.orderByPQ.deq();
                var continuation = targetPartitionRangeDocumentProducer.internalExecutionContext.continuation;

                var that = this;

                this._recursiveDrain(this.options["maxItemCount"] - this._fetchMoreTempBufferedResults.length,
                    targetPartitionRangeDocumentProducer, function (err, res) {
                        if (err) {
                            return callback(err, undefined, that._getAndResetActiveResponseHeaders());
                        }

                        that._fetchMoreTempBufferedResults = that._fetchMoreTempBufferedResults.concat(res);

                        if (!targetPartitionRangeDocumentProducer.allFetched) {
                            // assert res.length + targetPartitionRangeDocumentProducer.peekBufferedItems().length > that.options["maxItemCount"]

                            // put doc producer back in the queue
                            that.orderByPQ.enq(targetPartitionRangeDocumentProducer);

                            that._respHeaders[Constants.HttpHeaders.Continuation] =
                                JSON.stringify(that._buildContinuationTokenFrom(targetPartitionRangeDocumentProducer));

                            // assert that._fetchMoreTempBufferedResults.lenght <= that.options["maxItemCount"]

                            return callback(undefined, that._fetchMoreTempBufferedResults, that._getAndResetActiveResponseHeaders());
                        } else {

                            // assert targetPartitionRangeDocumentProducer.peekBufferedItems().length === 0
                            that._fetchMoreBasicParallel(callback);
                        }
                    });
            },

            _buildContinuationTokenFrom: function (documentProducer) {
                // given the document producer constructs the continu
                if (documentProducer.allFetched && documentProducer.peekBufferedItems().length == 0) {
                    return undefined;
                }


                var min = documentProducer.targetPartitionKeyRange[_PartitionKeyRange.MinInclusive];
                var max = documentProducer.targetPartitionKeyRange[_PartitionKeyRange.MaxExclusive];
                var range = {
                    'min': min,
                    'max': max,
                    'id': documentProducer.targetPartitionKeyRange.id
                };

                var withNullDefault = function (token) {
                    if (token) {
                        return token;
                    } else if (token === null || token === undefined) {
                        return null;
                    }
                }

                var documentProducerContinuationToken = undefined;

                if (documentProducer.peekBufferedItems().length > 0) {
                    documentProducerContinuationToken = documentProducer.previousContinuationToken;
                } else {
                    documentProducerContinuationToken = documentProducer.continuationToken;
                }
                // has unused buffered item so use the previous continuation token
                return {
                    'token': withNullDefault(documentProducerContinuationToken),
                    'range': range
                };
            },

            _recursiveDrain: function (maxElements, documentProducer, callback) {
                var buffer = [];
                var that = this;
                var implFunc = function () {

                    // enough data is buffered
                    if (maxElements <= buffer.length) {
                        return callback(undefined, buffer);
                    }

                    if (maxElements < buffer.length + documentProducer.peekBufferedItems().length) {
                        return callback(undefined, buffer);
                    }

                    if (documentProducer.peekBufferedItems().length > 0) {
                        buffer = buffer.concat(documentProducer.consumeBufferedItems());
                        return implFunc();
                    }

                    if (documentProducer.allFetched) {
                        return callback(undefined, buffer);
                    }

                    documentProducer.bufferMore(function (err, resources, respHeaders) {
                        that._mergeWithActiveResponseHeaders(respHeaders);
                        if (err) {
                            that.err = documentProducer.err;
                            return callback(that.err, undefined);
                        }
                        return implFunc()
                    });
                };

                implFunc();
            },

            _fetchMoreImplementation: function (callback) {
                var that = this;
                this.endpoint.nextItem(function (err, resources, headers) {

                    that._mergeWithActiveResponseHeaders(headers);

                    if (err) {
                        return callback(err, undefined, that._getAndResetActiveResponseHeaders());
                    }
                    // concatinate the results and fetch more

                    if (resources === undefined) {
                        // no more results
                        if (that._fetchMoreTempBufferedResults.length === 0) {
                            return callback(undefined, undefined, that._getAndResetActiveResponseHeaders());
                        }

                        var temp = that._fetchMoreTempBufferedResults;
                        that._fetchMoreTempBufferedResults = [];
                        return callback(undefined, temp, that._getAndResetActiveResponseHeaders());
                    }

                    that._fetchMoreTempBufferedResults = that._fetchMoreTempBufferedResults.concat(resources);

                    if (that.pageSize <= that._fetchMoreTempBufferedResults.length) {
                        // fetched enough results
                        var temp = that._fetchMoreTempBufferedResults;
                        that._fetchMoreTempBufferedResults = [];

                        return callback(undefined, temp, that._getAndResetActiveResponseHeaders());
                    }

                    that._fetchMoreImplementation(callback);
                });
            },

            _createTargetPartitionQueryExecutionContext: function (partitionKeyTargetRange, continuationToken) {
                // creates target partition range Query Execution Context
                var rewrittenQuery = PartitionedQueryExecutionContextInfoParser.parseRewrittenQuery(this.paritionedQueryExecutionInfo);
                var query = this.query;
                if (typeof (query) === 'string') {
                    query = { 'query': query };
                }
                if (rewrittenQuery) {
                    query = JSON.parse(JSON.stringify(query));
                    // We hardcode the formattable filter to true for now
                    rewrittenQuery = rewrittenQuery.replace(FormatPlaceHolder, "true");
                    query['query'] = rewrittenQuery;
                }

                var options = JSON.parse(JSON.stringify(this.options));
                if (continuationToken) {
                    options.continuation = continuationToken;
                } else {
                    options.continuation = undefined;
                }

                return new DocumentProducer(this.documentclient, this.collectionLink, query, partitionKeyTargetRange, options);
            },

            _onTargetPartitionRanges: function (callback) {
                // invokes the callback when the target partition ranges are ready
                var parsedRanges = PartitionedQueryExecutionContextInfoParser.parseQueryRanges(this.paritionedQueryExecutionInfo);
                var queryRanges = parsedRanges.map(function (item) { return QueryRange.parseFromDict(item); });
                return this.routingProvider.getOverlappingRanges(callback, this.collectionLink, queryRanges);
            },
        },
        {
            STATES: Object.freeze({ started: "started", inProgress: "inProgress", ended: "ended" }),
            DEFAULT_PAGE_SIZE: 10

        }
    );


    Base.getAttachmentIdFromMediaId = function (mediaId) {
        var buffer = atob(mediaId);
        var ResoureIdLength = 20;
        var attachmentId = "";
        if (buffer.length > ResoureIdLength) {
            attachmentId = btoa(buffer.substring(0, ResoureIdLength));
        }
        else {
            attachmentId = mediaId;
        }

        return attachmentId;
    }

    Constants.UserAgent = null;
    DocumentDB.DocumentBase = AzureDocuments;
    DocumentDB.RequestHandler = RequestHandler;
    DocumentDB.AuthHandler = AuthHandler;
    DocumentDB._parsePath = Base.parsePath;

    return DocumentDB;
}.call(this));