var wrapper = function(opt){
    var opts = opt;

    function extend() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false,
            toString = Object.prototype.toString,
            hasOwn = Object.prototype.hasOwnProperty,
            push = Array.prototype.push,
            slice = Array.prototype.slice,
            trim = String.prototype.trim,
            indexOf = Array.prototype.indexOf,
            class2type = {
                "[object Boolean]": "boolean",
                "[object Number]": "number",
                "[object String]": "string",
                "[object Function]": "function",
                "[object Array]": "array",
                "[object Date]": "date",
                "[object RegExp]": "regexp",
                "[object Object]": "object"
            },
            jQuery = {
                isFunction: function(obj) {
                    return jQuery.type(obj) === "function"
                },
                isArray: Array.isArray ||
                    function(obj) {
                        return jQuery.type(obj) === "array"
                    },
                isWindow: function(obj) {
                    return obj != null && obj == obj.window
                },
                isNumeric: function(obj) {
                    return !isNaN(parseFloat(obj)) && isFinite(obj)
                },
                type: function(obj) {
                    return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
                },
                isPlainObject: function(obj) {
                    if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
                        return false
                    }
                    try {
                        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                            return false
                        }
                    } catch (e) {
                        return false
                    }
                    var key;
                    for (key in obj) {}
                    return key === undefined || hasOwn.call(obj, key)
                }
            };
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {}
        }
        if (length === i) {
            target = this;
            --i;
        }
        for (i; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue
                    }
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : []
                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }
                        // WARNING: RECURSION
                        target[name] = extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }

    var getTypeVal = function(arrval, type){
        if (!arrval || !arrval.length)
            return ""
        var retn;

        arrval.every(function(itm){
            if ((itm.types || []).indexOf(type) == -1) {
                return true;
            } else {
                retn = itm.long_name;
                return false;
            }
        });
        return retn;
    }

    var formatGoogleGeocodeResponse = function(jsonData){
        if (jsonData && jsonData.results && jsonData.results.length){
            return {
                fulladdress: jsonData.results[0].formatted_address,
                premise: getTypeVal(jsonData.results[0].address_components, 'premise'),
                sublocality: getTypeVal(jsonData.results[0].address_components, 'sublocality_level_1'),
                locality: getTypeVal(jsonData.results[0].address_components, 'locality'),
                city: getTypeVal(jsonData.results[0].address_components, 'administrative_area_level_2'),
                state: getTypeVal(jsonData.results[0].address_components, 'administrative_area_level_1'),
                country: getTypeVal(jsonData.results[0].address_components, 'country'),
                postalcode: getTypeVal(jsonData.results[0].address_components, 'postal_code')
            }

        } else {
            return {
                message: "No data found"
            }
        }
    }
    
    var GetAddressFromLatLong = function(obj) {
        var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+obj.latitude+","+obj.longitude+"&key=";
        var response = opts.syncRequest('GET', url);
        var jsonData = JSON.parse(response.body);
        //console.log(jsonData);
        return formatGoogleGeocodeResponse(jsonData);
    }

    return {
        extend: extend,
        getAddressFromLatLong: GetAddressFromLatLong
    }
}

module.exports.qutils = wrapper;