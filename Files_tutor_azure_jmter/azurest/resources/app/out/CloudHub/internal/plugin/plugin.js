/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function () {
    var cookie, param,
        pluginUrl = window.external && window.external.pluginUrl || (cookie = document.cookie.match(/(?:^|;)\s?pluginUrl=(.*?)(?:;|$)/)) && unescape(cookie[1])
                || (param = document.location.search.match(/[\?&]pluginUrl=(.*?)(?:&|#|$)/)) && unescape(param[1]) || "plugin.b.js";
    if (pluginUrl) {
        document.write('<script src="' + decodeURIComponent(pluginUrl) + '" type="text/javascript"></script>')
    }
})();
