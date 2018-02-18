/*!
    Cascading Configuration Sheets (selectors module)
    Copyright (c) Microsoft Corporation. All rights reserved.

    The syntax for CCS selectors is a strict subset of the CSS3 syntax for
    selectors, taken from http://www.w3.org/TR/css3-selectors/#w3cselgrammar.
    
    Only two aspects of CSS3 selectors are not supported: namespace prefixes
    and functional pseudos, with the exception of the negation pseudo-class.
*/
var ccs;
(function (ccs) {
    //
    // Character classification functions
    //
    function isWhitespace(c) {
        // [ \t\r\n\f]
        return c === ' ' || c === '\t' ||
            c === '\r' || c === '\n' || c === '\f';
    }
    function isIdentifierStart(code) {
        // nmstart [A-Z_a-z]
        return (code >= 65 && code <= 90) ||
            code === 95 || (code >= 97 && code <= 122);
    }
    function isIdentifierChar(code) {
        // nmchar [-0-9A-Z_a-z]
        return code === 45 ||
            (code >= 48 && code <= 57) ||
            isIdentifierStart(code);
    }
    //
    // Token reading functions
    //
    var input, index = -1;
    function readWhitespace() {
        // w [ \t\r\n\f]*
        // [ \t\r\n\f]+ return S;
        var result = false;
        while (isWhitespace(input[index])) {
            result = true;
            index++;
        }
        return result;
    }
    function readComma() {
        // {w}"," return COMMA;
        var startIndex = index;
        readWhitespace();
        if (input[index] !== ',') {
            index = startIndex;
            return false;
        }
        index++;
        return true;
    }
    function readNmChars(startIndex) {
        while (input[++index]) {
            if (!isIdentifierChar(input.charCodeAt(index))) {
                break;
            }
        }
        return input.substring(startIndex, index);
    }
    function readName() {
        // name {nmchar}+
        var startIndex = index;
        if (!isIdentifierChar(input.charCodeAt(index))) {
            return null;
        }
        return readNmChars(startIndex);
    }
    function readIdentifier() {
        // ident [-]?{nmstart}{nmchar}*
        // {ident} return IDENT;
        var startIndex = index;
        if (input[index] === '-') {
            index++;
        }
        if (!isIdentifierStart(input.charCodeAt(index))) {
            index = startIndex;
            return null;
        }
        return readNmChars(startIndex);
    }
    /**
        The last error that occurred while parsing a group of selectors.
    */
    ccs.lastParseError;
    function setLastError(message) {
        var error;
        if (!ccs.lastParseError) {
            error = ccs.lastParseError = new Error();
        }
        else {
            error = ccs.lastParseError;
            while (error.subsequent) {
                error = error.subsequent;
            }
            error = error.subsequent = new Error();
        }
        error.name = "CcsParseError";
        error.input = input;
        error.index = index;
        error.message = message;
    }
    //
    // Simple selector parsing
    //
    function readIdSelector(selector, negation) {
        // "#"{name} return HASH;
        var value;
        if (input[index] !== '#') {
            return false;
        }
        if (!negation && selector.pseudoElement) {
            // Additional selectors are not allowed after a pseudo-element
            setLastError("Unexpected ID selector.");
            return false;
        }
        index++;
        if (!(value = readName())) {
            setLastError("Invalid character in identifier.");
            index--;
            setLastError("Invalid ID selector.");
            return false;
        }
        if (!negation) {
            (selector.ids = selector.ids || []).push(value);
        }
        else {
            negation.id = value;
        }
        selector.specificity += 1000000;
        return true;
    }
    function readClassSelector(selector, negation) {
        //
        // class
        //   : '.' IDENT
        //   ;
        //
        var value;
        if (input[index] !== '.') {
            return false;
        }
        if (!negation && selector.pseudoElement) {
            // Additional selectors are not allowed after a pseudo-element
            setLastError("Unexpected class selector.");
            return false;
        }
        index++;
        if (!(value = readIdentifier())) {
            setLastError("Invalid character in class name.");
            index--;
            setLastError("Invalid class selector.");
            return false;
        }
        if (!negation) {
            (selector.classes = selector.classes || []).push(value);
        }
        else {
            negation.class = value;
        }
        selector.specificity += 1000;
        return true;
    }
    function readString() {
        // <a quoted string whose quote can be escaped> return STRING;
        var c = input[index], startIndex = index, quoteChar;
        if (c !== "'" && c !== '"') {
            return null;
        }
        quoteChar = c;
        while ((c = input[++index]) !== quoteChar) {
            if (!c) {
                setLastError("Missing string termination.");
                index = startIndex;
                setLastError("Invalid string.");
                return null;
            }
            if (c === '\\' && (c = input[++index]) !== quoteChar) {
                index--;
                setLastError("Unsupported escape character in string.");
                index = startIndex;
                setLastError("Invalid string.");
                return null;
            }
        }
        return input.substring(startIndex + 1, index++)
            .replace('\\' + quoteChar, quoteChar);
    }
    function readIdentifierOrString() {
        var c = input[index];
        if (c !== "'" && c !== '"') {
            return readIdentifier();
        }
        else {
            return readString();
        }
    }
    function readAttributeSelector(selector, negation) {
        //
        // /* namespace_prefix is not supported */
        // attrib
        //   : '[' S* IDENT S*
        //         [ [ PREFIXMATCH |
        //             SUFFIXMATCH |
        //             SUBSTRINGMATCH |
        //             '=' |
        //             INCLUDES |
        //             DASHMATCH ] S* [ IDENT | STRING ] S*
        //         ]? ']'
        //   ;
        //
        // "~=" return INCLUDES;
        // "|=" return DASHMATCH;
        // "^=" return PREFIXMATCH;
        // "$=" return SUFFIXMATCH;
        // "*=" return SUBSTRINGMATCH;
        //
        var startIndex, name, match, value, result;
        if (input[index] !== '[') {
            return false;
        }
        if (!negation && selector.pseudoElement) {
            // Additional selectors are not allowed after a pseudo-element
            setLastError("Unexpected attribute selector.");
            return false;
        }
        startIndex = index++;
        readWhitespace();
        if (!(name = readIdentifier())) {
            setLastError("Invalid character in attribute name.");
            index = startIndex;
            setLastError("Invalid attribute selector.");
            return false;
        }
        readWhitespace();
        match = input[index];
        switch (match) {
            case ']':
                match = null;
                break;
            case '=':
                break;
            case '~': // 'Includes' match
            case '^': // 'Prefix' match
            case '$': // 'Suffix' match
            case '*':
                if (input[++index] === '=') {
                    match += '=';
                    break;
                }
                index--;
            default:
                if (index === input.length) {
                    setLastError("Missing attribute selector termination.");
                }
                else {
                    setLastError("Unknown attribute match.");
                }
                index = startIndex;
                setLastError("Invalid attribute selector.");
                return false;
        }
        if (match) {
            index++;
            readWhitespace();
            if (typeof (value = readIdentifierOrString()) !== "string") {
                if (index === input.length) {
                    setLastError("Missing identifier or string.");
                }
                else {
                    setLastError("Invalid identifier or string.");
                }
                index = startIndex;
                setLastError("Invalid attribute selector.");
                return false;
            }
            readWhitespace();
        }
        if (input[index] !== ']') {
            setLastError("Missing attribute selector termination.");
            index = startIndex;
            setLastError("Invalid attribute selector.");
            return false;
        }
        index++;
        result = !match ? { name: name } :
            { name: name, match: match, value: value };
        if (!negation) {
            (selector.attributes = selector.attributes || []).push(result);
        }
        else {
            negation.attribute = result;
        }
        selector.specificity += 1000;
        return true;
    }
    function readNegation(selector) {
        //
        // negation
        //   : NOT S* negation_arg S* ')'
        //   ;
        //
        // negation_arg
        //   : type_selector | universal | HASH | class | attrib | pseudo
        //   ;
        //
        // ":"{N}{O}{T}"("  return NOT;
        //
        var negation, startIndex = index, type, currentIndex;
        if (input.substr(index, 4).toLowerCase() !== "not(") {
            return false;
        }
        index += 4;
        negation = {
            name: "not"
        };
        readWhitespace();
        if (input[index] === '*') {
            negation.universal = true;
            index++;
        }
        else if (type = readIdentifier()) {
            negation.type = type;
            selector.specificity++;
        }
        else {
            currentIndex = index;
            if ((!readIdSelector(selector, negation) && ccs.lastParseError) ||
                (!readClassSelector(selector, negation) && ccs.lastParseError) ||
                (!readAttributeSelector(selector, negation) && ccs.lastParseError) ||
                (!readPseudoClassOrElement(selector, negation) && ccs.lastParseError) ||
                index === currentIndex) {
                setLastError("Missing negation pseudo-class argument.");
                index = startIndex;
                setLastError("Invalid negation pseudo-class.");
                return false;
            }
        }
        readWhitespace();
        if (input[index] !== ')') {
            setLastError("Missing negation pseudo-class termination.");
            index = startIndex;
            setLastError("Invalid negation pseudo-class.");
            return false;
        }
        index++;
        (selector.pseudoClasses = selector.pseudoClasses || []).push(negation);
        return true;
    }
    function readPseudoClassOrElement(selector, negation) {
        //
        // /* functional_pseudo is not supported */
        // pseudo
        //   /* ':' starts a pseudo-class, '::' a pseudo-element */
        //   /* Note that pseudo-elements are restricted to one per selector */
        //   /* and occur only in the last simple_selector_sequence. */
        //   : ':' ':'? IDENT
        //   ;
        //
        var value;
        if (input[index] !== ':') {
            return false;
        }
        if (selector.pseudoElement) {
            // Additional selectors are not allowed after a pseudo-element
            setLastError("Unexpected pseudo-class or element.");
            return false;
        }
        index++;
        if (input[index] !== ':') {
            // If this read is occurring inside a negation pseudo-class,
            // or if no negation was read, proceed to read an identifier.
            if (negation || (!readNegation(selector) && !ccs.lastParseError)) {
                if (!(value = readIdentifier())) {
                    setLastError("Invalid character in pseudo-class name.");
                    index--;
                    setLastError("Invalid pseudo-class selector.");
                    return false;
                }
                if (value === "not") {
                    // Either there was no negation because it was missing
                    // its argument, or there was a prohibited double negation.
                    if (!negation) {
                        setLastError("Missing negation pseudo-class argument.");
                        index -= 3;
                        setLastError("Invalid negation pseudo-class.");
                        index--;
                        setLastError("Invalid pseudo-class selector.");
                    }
                    else {
                        index -= 4;
                        setLastError("Duplicate negation pseudo-class.");
                    }
                    return false;
                }
                if (!negation) {
                    (selector.pseudoClasses = selector.pseudoClasses || [])
                        .push({ name: value });
                }
                else {
                    negation.pseudoClass = { name: value };
                }
                selector.specificity += 1000;
            }
            else if (ccs.lastParseError) {
                // There was a negation, but reading it produced an error
                index--;
                setLastError("Invalid pseudo-class selector.");
                return false;
            }
        }
        else {
            index++;
            if (!(value = readIdentifier())) {
                setLastError("Invalid character in pseudo-element name.");
                index -= 2;
                setLastError("Invalid pseudo-element.");
                return false;
            }
            selector.pseudoElement = value;
            selector.specificity++;
        }
        return true;
    }
    //
    // Simple selector sequence parsing
    //
    function readSimpleSelectorSequence(selector) {
        //
        // simple_selector_sequence
        //   : [ type_selector | universal ]
        //     [ HASH | class | attrib | pseudo | negation ]*
        //   | [ HASH | class | attrib | pseudo | negation ]+
        //   ;
        //
        // /* namespace_prefix is not supported */
        // type_selector
        //   : element_name
        //   ;
        //
        // element_name
        //  : IDENT
        //  ;
        //
        // /* namespace_prefix is not supported */
        // universal
        //   : '*'
        //   ;
        //
        var c = input[index], startIndex = index, type, currentIndex;
        if (c === '*') {
            selector.universal = true;
            index++;
        }
        else if (type = readIdentifier()) {
            selector.type = type;
            selector.specificity++;
        }
        while (c = input[index]) {
            currentIndex = index;
            if ((!readIdSelector(selector) && ccs.lastParseError) ||
                (!readClassSelector(selector) && ccs.lastParseError) ||
                (!readAttributeSelector(selector) && ccs.lastParseError) ||
                (!readPseudoClassOrElement(selector) && ccs.lastParseError)) {
                index = startIndex;
                setLastError("Invalid simple selector sequence.");
                return false;
            }
            if (index === currentIndex) {
                break;
            }
        }
        return index > startIndex;
    }
    //
    // Combinator reading function
    //
    function readCombinator() {
        //
        // combinator
        //   /* combinators can be surrounded by whitespace */
        //   : PLUS S* | GREATER S* | TILDE S* | S+
        //   ;
        //
        //  {w}"+" return PLUS;
        //  {w}">" return GREATER;
        //  {w}"~" return TILDE;
        //
        var c, startIndex = index, hasWhitespace = readWhitespace();
        c = input[index];
        if (c != '+' && c != '>' && c != '~') {
            if (!hasWhitespace) {
                index = startIndex;
                c = null;
            }
            else {
                c = ' ';
            }
        }
        else {
            index++;
            readWhitespace();
        }
        return c;
    }
    //
    // Simple selector comparison functions
    //
    function compareAttributeSelectors(a, b) {
        var v1 = a.name, v2 = b.name;
        if (v1 != v2) {
            return v1 < v2 ? -1 : 1;
        }
        else if ((v1 = (a.match || "")) != (v2 = (b.match || ""))) {
            if (v1.length != v2.length) {
                return v1.length < v2.length ? -1 : 1;
            }
            return v1 < v2 ? -1 : 1;
        }
        else if ((v1 = (a.value || "")) != (v2 = (b.value || ""))) {
            return v1 < v2 ? -1 : 1;
        }
        return 0;
    }
    function comparePseudoClasses(a, b) {
        var v1 = a.name, v2 = b.name;
        if (v1 != v2) {
            return v1 < v2 ? -1 : 1;
        }
        else if (v1 === "not") {
            return negationToString(a) < negationToString(b) ? -1 : 1;
        }
        return 0;
    }
    //
    // Selector to string representation functions
    //
    function idSelectorToString(name) {
        return '#' + name;
    }
    function classSelectorToString(className) {
        return '.' + className;
    }
    function attributeSelectorToString(selector) {
        var result = '[' + selector.name;
        if (selector.match) {
            result += selector.match;
            result += "'" + selector.value.replace("'", "\\'") + "'";
        }
        result += ']';
        return result;
    }
    function negationToString(negation) {
        var result = "not(";
        if (negation.universal) {
            result += '*';
        }
        else if (negation.type) {
            result += negation.type;
        }
        else if (negation.id) {
            result += idSelectorToString(negation.id);
        }
        else if (negation.class) {
            result += classSelectorToString(negation.class);
        }
        else if (negation.attribute) {
            result += attributeSelectorToString(negation.attribute);
        }
        else if (negation.pseudoClass) {
            result += pseudoClassToString(negation.pseudoClass);
        }
        result += ')';
        return result;
    }
    function pseudoClassToString(pseudo) {
        var result = ':';
        if (pseudo.name !== "not") {
            result += pseudo.name;
        }
        else {
            result += negationToString(pseudo);
        }
        return result;
    }
    function pseudoElementToString(pseudo) {
        return "::" + pseudo;
    }
    function selectorToStringCore(selector) {
        var result = "", i, len;
        if (selector.universal) {
            // Only add the universal selector if there are no others
            if (!selector.classes && !selector.attributes &&
                !selector.pseudoClasses && !selector.pseudoElement) {
                result += '*';
            }
        }
        else if (selector.type) {
            result += selector.type;
        }
        if (selector.ids) {
            for (i = 0, len = selector.ids.length; i < len; i++) {
                result += idSelectorToString(selector.ids[i]);
            }
        }
        if (selector.classes) {
            for (i = 0, len = selector.classes.length; i < len; i++) {
                result += classSelectorToString(selector.classes[i]);
            }
        }
        if (selector.attributes) {
            for (i = 0, len = selector.attributes.length; i < len; i++) {
                result += attributeSelectorToString(selector.attributes[i]);
            }
        }
        if (selector.pseudoClasses) {
            for (i = 0, len = selector.pseudoClasses.length; i < len; i++) {
                result += pseudoClassToString(selector.pseudoClasses[i]);
            }
        }
        if (selector.pseudoElement) {
            result += pseudoElementToString(selector.pseudoElement);
        }
        return result;
    }
    var nextId = 0, cache = { selector: null };
    //
    // Selector parsing
    //
    function readSelector(scope, combinator) {
        //
        // selector
        //   : simple_selector_sequence [ combinator simple_selector_sequence ]*
        //   ;
        //
        var selector, startIndex = index, combinator, currentCache;
        if (!scope) {
            selector = {
                id: nextId,
                specificity: 0
            };
            currentCache = cache;
        }
        else {
            selector = scope.selector;
            combinator = combinator || ' ';
            currentCache = scope;
        }
        do {
            if (combinator) {
                // Create the selector using the next ID, but do not
                // increment the ID unless it is placed in the cache.
                selector = {
                    id: nextId,
                    previous: selector,
                    combinator: combinator,
                    specificity: selector.specificity
                };
            }
            if (!readSimpleSelectorSequence(selector)) {
                if (!combinator || ccs.lastParseError) {
                    // If there is no combinator yet, then there are
                    // no simple selector sequences in the selector.
                    if (!combinator && index === input.length) {
                        setLastError("Missing simple selector sequence.");
                    }
                    index = startIndex;
                    setLastError("Invalid selector.");
                    return null;
                }
                // When there is a combinator and no simple selector sequence
                // is present, then simply revert to the previous selector, as
                // this represents the last simple selector in the sequence.
                selector = selector.previous;
                break;
            }
            // Sort the components of the simple selector sequence so that
            // a string representation produced is a canonical representation.
            // This ensures that functionally equivalent selectors become the
            // same selectors for the purpose of lookup in the selector cache.
            if (selector.ids) {
                selector.ids.sort();
            }
            if (selector.classes) {
                selector.classes.sort();
            }
            if (selector.pseudoClasses) {
                selector.pseudoClasses.sort(comparePseudoClasses);
            }
            if (selector.attributes) {
                selector.attributes.sort(compareAttributeSelectors);
            }
            // Identify if the selector is already cached, and if so,
            // throw away the selector just parsed and use the cached one.
            var nodes = currentCache.children = currentCache.children || {};
            var key = selectorToStringCore(selector);
            if (combinator) {
                // The cache key includes the combinator
                key = combinator.trim() + ' ' + key;
            }
            if (!nodes[key]) {
                // Add the new, unique selector to the cache, and increment
                // the next ID so it is ready for the next unique selector.
                nodes[key] = {
                    selector: selector
                };
                nextId++;
            }
            else {
                // Replace the selector just parsed with the cached one
                selector = nodes[key].selector;
            }
            // Update the current cache so it is scoped appropriately
            currentCache = nodes[key];
        } while (combinator = readCombinator());
        return selector;
    }
    //
    // Selectors group parsing
    //
    function readSelectorsGroup(scope, combinator) {
        //
        // selectors_group
        //   : selector [ COMMA S* selector ]*
        //   ;
        //
        var selectorsGroup = [], startIndex = index, selector;
        do {
            if (!(selector = readSelector(scope, combinator))) {
                index = startIndex;
                setLastError("Invalid selectors group.");
                return null;
            }
            selectorsGroup.push(selector);
        } while (readComma() && (readWhitespace() || true));
        return selectorsGroup;
    }
    /**
        Parses a group of selectors.
    */
    function parseSelectors(selectors, scope, combinator) {
        input = selectors;
        index = 0;
        ccs.lastParseError = null;
        try {
            var selectorsGroup;
            readWhitespace();
            if (!(selectorsGroup = readSelectorsGroup(scope, combinator))) {
                return null;
            }
            readWhitespace();
            if (!ccs.lastParseError && index < input.length) {
                setLastError("Unexpected character.");
                return null;
            }
            return selectorsGroup;
        }
        finally {
            index = -1;
            input = null;
        }
    }
    ccs.parseSelectors = parseSelectors;
    /**
        Gets a string representation of a selector.
    */
    function selectorToString(selector) {
        var result = "";
        if (selector.previous) {
            result += selectorToString(selector.previous);
            if (selector.combinator === ' ') {
                result += selector.combinator;
            }
            else {
                result += ' ' + selector.combinator + ' ';
            }
        }
        result += selectorToStringCore(selector);
        return result;
    }
    ccs.selectorToString = selectorToString;
    /**
        Gets a string representation of a group of selectors.
    */
    function selectorsToString(selectors) {
        return selectors.map(selectorToString).join(", ");
    }
    ccs.selectorsToString = selectorsToString;
    /**
        Gets the scope from a previously parsed selector.
    */
    function getSelectorScope(selector) {
        var node, key;
        if (!selector.previous) {
            node = cache;
            key = selectorToString(selector);
        }
        else {
            node = getSelectorScope(selector.previous);
            if (!node) {
                return null;
            }
            key = selector.combinator.trim() +
                ' ' + selectorToStringCore(selector);
        }
        return node.children[key];
    }
    ccs.getSelectorScope = getSelectorScope;
})(ccs || (ccs = {}));
/*!
    Cascading Configuration Sheets (sheets module)
    Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="0.selectors.ts" />
var ccs;
(function (ccs) {
    var name, input, rawObject, errorLog;
    function logError(message, inner) {
        if (!errorLog) {
            return;
        }
        var error = new Error();
        error.name = "CcsSheetError";
        error.sheetName = name;
        error.message = message;
        if (inner) {
            error.inner = inner;
        }
        errorLog.push(error);
    }
    function parseSheetJSON(reviver) {
        try {
            rawObject = JSON.parse(input, reviver);
        }
        catch (error) {
            var syntaxError = error;
            logError("Syntax error parsing JSON.", syntaxError);
            return false;
        }
        return true;
    }
    var identifierRegExp = /^[A-Z_a-z][-0-9A-Z_a-z]*$/;
    function readNamespace() {
        var namespace, trimmed;
        if (!("$namespace" in rawObject) ||
            (namespace = rawObject.$namespace) === null) {
            logError("Missing namespace.");
            return null;
        }
        if (typeof namespace !== "string") {
            logError("Namespace must be a string.");
            return null;
        }
        trimmed = namespace.trim();
        if (!trimmed) {
            logError("Missing namespace.");
            return null;
        }
        if (!trimmed.split('.').every(function (part) { return identifierRegExp.test(part); })) {
            logError("Invalid namespace \"" + namespace + "\".");
            return null;
        }
        return trimmed;
    }
    function readScope() {
        var scope = rawObject.$scope, scopeSelectors, lastError;
        if (scope === undefined) {
            return undefined;
        }
        if (typeof scope !== "string") {
            logError("Scope must be a string.");
            return null;
        }
        scopeSelectors = ccs.parseSelectors(scope);
        if (lastError = ccs.lastParseError) {
            logError("Invalid scope \"" + scope + "\" at index " +
                lastError.index + ": " + lastError.message, lastError);
            return null;
        }
        if (scopeSelectors.length !== 1) {
            logError("Invalid scope \"" + scope +
                "\": cannot specify multiple selectors.");
            return null;
        }
        return ccs.getSelectorScope(scopeSelectors[0]);
    }
    function readCombinator() {
        var combinator = rawObject.$combinator;
        if (combinator === undefined) {
            return undefined;
        }
        if (typeof combinator !== "string") {
            logError("Combinator must be a string.");
            return null;
        }
        if (combinator = combinator.trim()) {
            switch (combinator) {
                default:
                    logError("Invalid combinator \"" + combinator + "\".");
                    return null;
                case '>':
                case '~':
                case '+':
                    return combinator;
            }
        }
        return undefined;
    }
    function readSheet(sheetName, sheetInput, errors) {
        var namespace, scope, combinator, directives, variables, rules, unresolvedValues;
        name = sheetName;
        input = sheetInput;
        errorLog = errors;
        try {
            // Parse JSON, and use the reviver to identify all the property
            // values that will need namespace or variable expansion later.
            if (!parseSheetJSON(function (key, value) {
                if (typeof (value) === "string") {
                    var c;
                    if (value.indexOf(c = ':') === 0 ||
                        value.indexOf(c = '@') === 0) {
                        if (value.indexOf(c, 1) === 1) {
                            // Value was escaped; unescape it
                            return value.substr(1);
                        }
                        else {
                            unresolvedValues = unresolvedValues || [];
                            unresolvedValues.push({
                                object: this,
                                property: key
                            });
                        }
                    }
                }
                return value;
            })) {
                return null;
            }
            // Read and validate supported directives
            if (!(namespace = readNamespace()) ||
                (scope = readScope()) === null ||
                (combinator = readCombinator()) === null) {
                return null;
            }
            // Read all directives, variables and rules
            directives = {};
            variables = {};
            rules = [];
            Object.keys(rawObject).forEach(function (key) {
                var trimmed = key.trim(), selectorsGroup, lastError;
                if (trimmed.indexOf('$') === 0) {
                    directives[trimmed.substr(1)] = rawObject[key];
                }
                else if (trimmed.indexOf('@') === 0) {
                    variables[trimmed.substr(1)] = rawObject[key];
                }
                else {
                    selectorsGroup = ccs.parseSelectors(key, scope, combinator);
                    if (lastError = ccs.lastParseError) {
                        logError("Invalid rule \"" + key + "\" at index " +
                            lastError.index + ": " + lastError.message, lastError);
                        return;
                    }
                    if (!rawObject[key] || typeof rawObject[key] !== "object") {
                        logError("Rule \"" + key + "\" " +
                            "configuration must specify an object.");
                        return;
                    }
                    selectorsGroup.forEach(function (selector) {
                        rules.push({
                            selector: selector,
                            config: rawObject[key]
                        });
                    });
                }
            });
            return {
                name: name,
                directives: directives,
                variables: variables,
                rules: rules,
                unresolvedValues: unresolvedValues
            };
        }
        finally {
            rawObject = null;
            errorLog = null;
            input = null;
            name = null;
        }
    }
    /**
        Parses a sheet.
    */
    function parseSheet(name, sheet, errors) {
        // Remove C-style comments; these are really useful in sheets due to
        // their potential complexity, but are not officially allowed in JSON
        sheet = sheet.replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, "");
        return readSheet(name, sheet, errors);
    }
    ccs.parseSheet = parseSheet;
})(ccs || (ccs = {}));
/*!
    Cascading Configuration Sheets (sheet sets module)
    Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="1.sheets.ts" />
var ccs;
(function (ccs) {
    function logError(set, sheet, message, errors) {
        if (!errors) {
            return;
        }
        var error = new Error();
        error.name = "CcsCompositionError";
        error.set = set;
        error.sheet = sheet;
        error.message = message;
        errors.push(error);
    }
    function logDuplication(set, sheet, variable, errors) {
        if (!errors) {
            return;
        }
        var error = new Error();
        error.name = "CcsDuplicationError";
        error.set = set;
        error.sheet = sheet;
        error.variable = variable;
        error.message = "Duplicate variable \"" + variable + "\".";
        errors.push(error);
    }
    function logUnresolved(set, sheet, unresolved, errors) {
        if (!errors) {
            return;
        }
        var error = new Error();
        error.name = "CcsResolutionError";
        error.set = set;
        error.sheet = sheet;
        error.unresolved = unresolved;
        error.message = "Could not resolve variable \"" +
            unresolved.object[unresolved.property] + "\".";
        errors.push(error);
    }
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function addToSet(sheetOrSheets, errors) {
        var set = this, allVariables = set.allVariables, sheets, result = true;
        if (!Array.isArray(sheetOrSheets)) {
            sheets = [sheetOrSheets];
        }
        else {
            sheets = sheetOrSheets;
        }
        // Add all the sheets
        set.sheets.push.apply(set.sheets, sheets);
        // Add all the variables defined across all the sheets
        sheets.forEach(function (sheet) {
            var namespace = sheet.directives.namespace;
            Object.keys(sheet.variables).forEach(function (name) {
                // The key is the fully-qualified variable name
                var key = namespace + '.' + name;
                if (hasOwnProperty.call(allVariables, key)) {
                    // Duplication is not considered a critical error;
                    // composition continues but ultimately returns false.
                    logDuplication(set, sheet, key, errors);
                    result = false;
                }
                else {
                    allVariables[key] = sheet.variables[name];
                }
            });
        });
        // Resolve all unresolved values in each sheet
        sheets.forEach(function (sheet) {
            var namespace = sheet.directives.namespace, unresolved, object, property, value;
            if (!sheet.unresolvedValues) {
                return;
            }
            while (unresolved = sheet.unresolvedValues.shift()) {
                object = unresolved.object;
                property = unresolved.property;
                value = object[property];
                if (value.indexOf(':') === 0) {
                    if (value.length === 1) {
                        // Special case: replace ':' with the namespace
                        object[property] = namespace;
                    }
                    else {
                        // Otherwise, namespace is a prefix separated by '.'
                        object[property] = namespace + '.' + value.substr(1);
                    }
                }
                else if (value.indexOf('@') === 0) {
                    value = value.substr(1);
                    if (hasOwnProperty.call(sheet.variables, value)) {
                        // Variable was present in the current sheet. This
                        // overrides the set of all registered variables so
                        // that in the case of duplicate variable definitions,
                        // the right resolution is more likely to happen.
                        object[property] = sheet.variables[value];
                    }
                    else {
                        // Qualify the value with the namespace. For references
                        // that are already qualified, this produces a double
                        // qualification, such as "a.b.c.a.b.c.name", which
                        // *conceivably* would exist as a different variable,
                        // but is not considered likely. This case typically
                        // succeeds when qualifying "name" as "a.b.c.name".
                        value = namespace + '.' + value;
                        if (hasOwnProperty.call(allVariables, value)) {
                            object[property] = allVariables[value];
                        }
                        else {
                            // Revert the namespace qualification, leaving
                            // the original value, which at this point must
                            // be fully-qualified in order to be resolved.
                            value = value.substr(namespace.length + 1);
                            if (hasOwnProperty.call(allVariables, value)) {
                                object[property] = allVariables[value];
                            }
                            else {
                                // None of the above three cases succeeded in
                                // resolving the variable. This error is not
                                // considered critical; composition continues
                                // but ultimately returns false.
                                logUnresolved(set, sheet, unresolved, errors);
                                result = false;
                            }
                        }
                    }
                }
            }
        });
        // Add all the rules defined across all the sheets, then re-order them
        // according to their specificity. By sorting them at this time, it
        // becomes unnecessary for the runtime to ever sort rules when it is
        // determining the set of rules that currently match an element.
        set.allRules = Array.prototype
            .concat.apply(set.allRules, sheets.map(function (sheet) { return sheet.rules; }))
            .sort(function (a, b) {
            var aSpecificity = a.selector.specificity, bSpecificity = b.selector.specificity;
            if (aSpecificity != bSpecificity) {
                return aSpecificity < bSpecificity ? -1 : 1;
            }
            return 0;
        });
        return result;
    }
    function removeFromSet(sheet) {
        var set = this, index = set.sheets.indexOf(sheet);
        if (index >= 0) {
            set.sheets.splice(index, 1);
            return true;
        }
        return false;
    }
    function clearSet() {
        var set = this;
        set.allRules = [];
        set.allVariables = {};
        set.sheets = [];
    }
    /**
        Creates a sheet set.
    */
    function createSheetSet() {
        return {
            sheets: [],
            allVariables: {},
            allRules: [],
            add: addToSet,
            remove: removeFromSet,
            clear: clearSet
        };
    }
    ccs.createSheetSet = createSheetSet;
})(ccs || (ccs = {}));
/*!
    Cascading Configuration Sheets (runtime module)
    Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="2.sheetsets.ts" />
var ccs;
(function (ccs) {
    function matchesPrevious(selector, element, adapter) {
        var result = false, previous = selector.previous, combinator = selector.combinator;
        if (!previous) {
            return true;
        }
        if (!combinator) {
            return false;
        }
        switch (combinator) {
            case '+':
                // Adjacent sibling combinator
                result = !!(element = adapter.previousSibling(element)) &&
                    adapter.selectorMatches(previous, element);
                break;
            case '~':
                // General sibling combinator
                while ((element = adapter.previousSibling(element))) {
                    if (adapter.selectorMatches(previous, element)) {
                        result = true;
                        break;
                    }
                }
                break;
            case '>':
                // Child combinator
                result = !!(element = adapter.parent(element)) &&
                    adapter.selectorMatches(previous, element);
                break;
            case ' ':
                // Descendant combinator
                while ((element = adapter.parent(element))) {
                    if (adapter.selectorMatches(previous, element)) {
                        result = true;
                        break;
                    }
                }
                break;
        }
        return result;
    }
    function matchesType(type, element, adapter) {
        return !type || adapter.type(element) === type;
    }
    function matchesIds(ids, element, adapter) {
        if (!ids) {
            return true;
        }
        var elementId = adapter.id(element);
        for (var i = 0, len = ids.length; i < len; i++) {
            if (elementId !== ids[i]) {
                return false;
            }
        }
        return true;
    }
    function matchesClasses(classes, element, adapter) {
        if (!classes) {
            return true;
        }
        var elementClasses = ' ' + adapter.classes(element) + ' ';
        for (var i = 0, len = classes.length; i < len; i++) {
            if (elementClasses.indexOf(' ' + classes[i] + ' ') < 0) {
                return false;
            }
        }
        return true;
    }
    function matchesAttributes(attributes, element, adapter) {
        if (!attributes) {
            return true;
        }
        var elementAttributes = ' ' + adapter.attributes(element) + ' ', attribute, name, elementValue, value;
        for (var i = 0, len = attributes.length; i < len; i++) {
            attribute = attributes[i];
            name = attribute.name;
            if (elementAttributes.indexOf(' ' + name + ' ') < 0) {
                return false;
            }
            elementValue = adapter.attribute(element, name);
            if (elementValue === undefined ||
                elementValue === null) {
                elementValue = "";
            }
            else {
                elementValue = elementValue.toString();
            }
            value = attribute.value;
            switch (attribute.match) {
                case '=':
                    if (elementValue !== value) {
                        return false;
                    }
                    break;
                case "^=":
                    if (elementValue.indexOf(value) !== 0) {
                        return false;
                    }
                    break;
                case "$=":
                    if (elementValue.length < value.length ||
                        elementValue.lastIndexOf(value) !==
                            elementValue.length - value.length) {
                        return false;
                    }
                    break;
                case "~=":
                    elementValue = ' ' + elementValue + ' ';
                    value = ' ' + value + ' ';
                case "*=":
                    if (elementValue.indexOf(value) < 0) {
                        return false;
                    }
                    break;
            }
        }
        return true;
    }
    function matchesPseudoClasses(classes, element, adapter) {
        if (!classes) {
            return true;
        }
        var elementClasses = ' ' + adapter.pseudoClasses(element) + ' ';
        for (var i = 0, len = classes.length; i < len; i++) {
            if (classes[i].name !== "not") {
                if (elementClasses.indexOf(' ' + classes[i].name + ' ') < 0) {
                    return false;
                }
                continue;
            }
            var negation = classes[i];
            if (matchesType(negation.type, element, adapter) &&
                matchesIds(negation.id &&
                    [negation.id], element, adapter) &&
                matchesClasses(negation.class &&
                    [negation.class], element, adapter) &&
                matchesAttributes(negation.attribute &&
                    [negation.attribute], element, adapter) &&
                matchesPseudoClasses(negation.pseudoClass &&
                    [negation.pseudoClass], element, adapter)) {
                return false;
            }
        }
        return true;
    }
    function singleSelectorMatches(selector, element, adapter) {
        return matchesPrevious(selector, element, adapter) &&
            matchesType(selector.type, element, adapter) &&
            matchesIds(selector.ids, element, adapter) &&
            matchesClasses(selector.classes, element, adapter) &&
            matchesAttributes(selector.attributes, element, adapter) &&
            matchesPseudoClasses(selector.pseudoClasses, element, adapter);
    }
    function selectorMatches(selectorsOrSelector, element, adapter) {
        if (typeof selectorsOrSelector === "string") {
            selectorsOrSelector = ccs.parseSelectors(selectorsOrSelector);
            if (!selectorsOrSelector) {
                return false;
            }
        }
        if (Array.isArray(selectorsOrSelector)) {
            var selectors = selectorsOrSelector;
            for (var i = 0, len = selectors.length; i < len; i++) {
                if (singleSelectorMatches(selectors[i], element, adapter)) {
                    return true;
                }
            }
            return false;
        }
        return singleSelectorMatches(selectorsOrSelector, element, adapter);
    }
    ccs.selectorMatches = selectorMatches;
    /**
        Gets the rules in a sheet set that match an element.
    */
    function getMatchingRules(element, set, adapter) {
        return set.allRules.filter(function (rule) {
            return adapter.selectorMatches(rule.selector, element);
        });
    }
    ccs.getMatchingRules = getMatchingRules;
    var derivation, currentRule, inlineStep;
    function getValueType(value) {
        var type = typeof value;
        switch (type) {
            default:
                return type;
            case "object":
                if (!Array.isArray(value)) {
                    return type;
                }
                else {
                    return "array";
                }
        }
    }
    function mergeValue(currentValue, newValue) {
        var currentType = getValueType(currentValue);
        if (currentType === "undefined") {
            // No value has been provided yet; base type on provided value
            currentType = getValueType(newValue);
            if (currentType === "undefined") {
                // Still no value was provided
                return currentValue;
            }
        }
        else if (getValueType(newValue) !== currentType) {
            // Value is the wrong type; ignore it
            return currentValue;
        }
        switch (currentType) {
            default:
                // Replace the current primitive value
                currentValue = newValue;
                break;
            case "object":
                // Recursively merge values with current object
                if (!currentValue) {
                    currentValue = {};
                }
                Object.keys(newValue).forEach(function (key) {
                    var savedDerivation = derivation;
                    derivation = null;
                    currentValue[key] = mergeValue(currentValue[key], newValue[key]);
                    derivation = savedDerivation;
                });
                break;
            case "array":
                if (!currentValue) {
                    // Create a copy of the original array
                    currentValue = newValue.slice();
                }
                else {
                    // Concatenate to the end of the current array
                    currentValue.push.apply(currentValue, newValue);
                }
                break;
        }
        if (derivation) {
            // Take a snapshot of the current value as the new value
            newValue = JSON.parse(JSON.stringify(currentValue));
            if (!currentRule && !inlineStep) {
                // The value came from the default configuration
                derivation.push({ default: true, value: newValue });
            }
            else if (!inlineStep) {
                // The value came from the currently processing rule
                derivation.push({ rule: currentRule, value: newValue });
            }
            else {
                // The value came from the element's inline configuration
                derivation.push({ inline: true, value: newValue });
            }
        }
        return currentValue;
    }
    /**
        Gets the value of a configuration property for an element.
    */
    function getValue(element, property, adapter) {
        var result = mergeValue(undefined, adapter.getDefaultValue(element, property)), rules = adapter.getMatchingRules(element);
        for (var i = 0, len = rules.length; i < len; i++) {
            if (derivation) {
                currentRule = rules[i];
            }
            result = mergeValue(result, rules[i].config[property]);
        }
        currentRule = null;
        return mergeValue(result, adapter.getInlineValue(element, property));
    }
    ccs.getValue = getValue;
    /**
        Gets the derivation of a configuration property for an element.
    */
    function getDerivation(element, property, adapter) {
        derivation = [];
        currentRule = null;
        inlineStep = false;
        try {
            getValue(element, property, adapter);
            return derivation;
        }
        finally {
            inlineStep = false;
            currentRule = null;
            derivation = null;
        }
    }
    ccs.getDerivation = getDerivation;
    function createTreeIterator(rootElement, adapter) {
        var current = null;
        return {
            next: function () {
                if (!current) {
                    current = rootElement;
                }
                else {
                    var firstChild = adapter.firstChild(current);
                    if (firstChild) {
                        current = firstChild;
                    }
                    else if (current === rootElement) {
                        current = null;
                    }
                    else {
                        var nextSibling = null;
                        do {
                            if (nextSibling = adapter.nextSibling(current)) {
                                current = nextSibling;
                                break;
                            }
                            current = adapter.parent(current);
                        } while (current !== rootElement);
                        if (current === rootElement) {
                            current = null;
                        }
                    }
                }
                return current;
            }
        };
    }
    function createArrayIterator(elements) {
        var index = -1, length = elements.length;
        return {
            next: function () {
                index++;
                if (index < length) {
                    return elements[index];
                }
                return null;
            }
        };
    }
    function select(selectorsOrSelector, rootElementOrElements, adapter) {
        if (typeof selectorsOrSelector === "string") {
            var selectors = ccs.parseSelectors(selectorsOrSelector);
            if (!selectors) {
                return [];
            }
            return select(selectors, rootElementOrElements, adapter);
        }
        var results = [], iterator, filterElement, current;
        if (Array.isArray(selectorsOrSelector)) {
            var selectors = selectorsOrSelector;
            filterElement = function (element) {
                for (var i = 0, len = selectors.length; i < len; i++) {
                    if (adapter.selectorMatches(selectors[i], element)) {
                        return true;
                    }
                }
                return false;
            };
        }
        else {
            filterElement = function (element) {
                return adapter.selectorMatches(selectorsOrSelector, element);
            };
        }
        if (!Array.isArray(rootElementOrElements)) {
            iterator = createTreeIterator(rootElementOrElements, adapter);
        }
        else {
            iterator = createArrayIterator(rootElementOrElements);
        }
        while (current = iterator.next()) {
            if (filterElement(current)) {
                results.push(current);
            }
        }
        return results;
    }
    ccs.select = select;
})(ccs || (ccs = {}));
/*!
    Cascading Configuration Sheets (require module)
    Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="3.runtime.ts" />
var ccs;
(function (ccs) {
    // When RequireJS or CommonJS is present, define the CCS library as a
    // module that exports the main object (ccs). Note that due to the way
    // TypeScript generates internal modules, it is not possible to avoid
    // defining the ccs object globally. Yet, because CCS accepts adapter
    // plugins, and these may or may not handle RequireJS or CommonJS
    // scenarios, it is anyway best to leave the global object in place.
    if (typeof define === "function" && define.amd) {
        define(function () { return ccs; });
    }
    else if (typeof module !== "undefined" && module.exports) {
        module.exports = ccs;
    }
})(ccs || (ccs = {}));
//# sourceMappingURL=ccs-0.1.0.js.map