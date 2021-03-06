! function(root, factory) {
    "function" == typeof define && define.amd ? define([], factory) : root.ItemMirror = factory()
}(this, function() {
    var requirejs, require, define;
    return function(undef) {
        function hasProp(obj, prop) {
            return hasOwn.call(obj, prop)
        }

        function normalize(name, baseName) {
            var nameParts, nameSegment, mapValue, foundMap, lastIndex, foundI, foundStarMap, starI, i, j, part, baseParts = baseName && baseName.split("/"),
                map = config.map,
                starMap = map && map["*"] || {};
            if (name && "." === name.charAt(0))
                if (baseName) {
                    for (name = name.split("/"), lastIndex = name.length - 1, config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex]) && (name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, "")), name = baseParts.slice(0, baseParts.length - 1).concat(name), i = 0; i < name.length; i += 1)
                        if (part = name[i], "." === part) name.splice(i, 1), i -= 1;
                        else if (".." === part) {
                        if (1 === i && (".." === name[2] || ".." === name[0])) break;
                        i > 0 && (name.splice(i - 1, 2), i -= 2)
                    }
                    name = name.join("/")
                } else 0 === name.indexOf("./") && (name = name.substring(2));
            if ((baseParts || starMap) && map) {
                for (nameParts = name.split("/"), i = nameParts.length; i > 0; i -= 1) {
                    if (nameSegment = nameParts.slice(0, i).join("/"), baseParts)
                        for (j = baseParts.length; j > 0; j -= 1)
                            if (mapValue = map[baseParts.slice(0, j).join("/")], mapValue && (mapValue = mapValue[nameSegment])) {
                                foundMap = mapValue, foundI = i;
                                break
                            }
                    if (foundMap) break;
                    !foundStarMap && starMap && starMap[nameSegment] && (foundStarMap = starMap[nameSegment], starI = i)
                }!foundMap && foundStarMap && (foundMap = foundStarMap, foundI = starI), foundMap && (nameParts.splice(0, foundI, foundMap), name = nameParts.join("/"))
            }
            return name
        }

        function makeRequire(relName, forceSync) {
            return function() {
                var args = aps.call(arguments, 0);
                return "string" != typeof args[0] && 1 === args.length && args.push(null), req.apply(undef, args.concat([relName, forceSync]))
            }
        }

        function makeNormalize(relName) {
            return function(name) {
                return normalize(name, relName)
            }
        }

        function makeLoad(depName) {
            return function(value) {
                defined[depName] = value
            }
        }

        function callDep(name) {
            if (hasProp(waiting, name)) {
                var args = waiting[name];
                delete waiting[name], defining[name] = !0, main.apply(undef, args)
            }
            if (!hasProp(defined, name) && !hasProp(defining, name)) throw new Error("No " + name);
            return defined[name]
        }

        function splitPrefix(name) {
            var prefix, index = name ? name.indexOf("!") : -1;
            return index > -1 && (prefix = name.substring(0, index), name = name.substring(index + 1, name.length)), [prefix, name]
        }

        function makeConfig(name) {
            return function() {
                return config && config.config && config.config[name] || {}
            }
        }
        var main, req, makeMap, handlers, defined = {},
            waiting = {},
            config = {},
            defining = {},
            hasOwn = Object.prototype.hasOwnProperty,
            aps = [].slice,
            jsSuffixRegExp = /\.js$/;
        makeMap = function(name, relName) {
            var plugin, parts = splitPrefix(name),
                prefix = parts[0];
            return name = parts[1], prefix && (prefix = normalize(prefix, relName), plugin = callDep(prefix)), prefix ? name = plugin && plugin.normalize ? plugin.normalize(name, makeNormalize(relName)) : normalize(name, relName) : (name = normalize(name, relName), parts = splitPrefix(name), prefix = parts[0], name = parts[1], prefix && (plugin = callDep(prefix))), {
                f: prefix ? prefix + "!" + name : name,
                n: name,
                pr: prefix,
                p: plugin
            }
        }, handlers = {
            require: function(name) {
                return makeRequire(name)
            },
            exports: function(name) {
                var e = defined[name];
                return "undefined" != typeof e ? e : defined[name] = {}
            },
            module: function(name) {
                return {
                    id: name,
                    uri: "",
                    exports: defined[name],
                    config: makeConfig(name)
                }
            }
        }, main = function(name, deps, callback, relName) {
            var cjsModule, depName, ret, map, i, usingExports, args = [],
                callbackType = typeof callback;
            if (relName = relName || name, "undefined" === callbackType || "function" === callbackType) {
                for (deps = !deps.length && callback.length ? ["require", "exports", "module"] : deps, i = 0; i < deps.length; i += 1)
                    if (map = makeMap(deps[i], relName), depName = map.f, "require" === depName) args[i] = handlers.require(name);
                    else if ("exports" === depName) args[i] = handlers.exports(name), usingExports = !0;
                else if ("module" === depName) cjsModule = args[i] = handlers.module(name);
                else if (hasProp(defined, depName) || hasProp(waiting, depName) || hasProp(defining, depName)) args[i] = callDep(depName);
                else {
                    if (!map.p) throw new Error(name + " missing " + depName);
                    map.p.load(map.n, makeRequire(relName, !0), makeLoad(depName), {}), args[i] = defined[depName]
                }
                ret = callback ? callback.apply(defined[name], args) : void 0, name && (cjsModule && cjsModule.exports !== undef && cjsModule.exports !== defined[name] ? defined[name] = cjsModule.exports : ret === undef && usingExports || (defined[name] = ret))
            } else name && (defined[name] = callback)
        }, requirejs = require = req = function(deps, callback, relName, forceSync, alt) {
            if ("string" == typeof deps) return handlers[deps] ? handlers[deps](callback) : callDep(makeMap(deps, callback).f);
            if (!deps.splice) {
                if (config = deps, config.deps && req(config.deps, config.callback), !callback) return;
                callback.splice ? (deps = callback, callback = relName, relName = null) : deps = undef
            }
            return callback = callback || function() {}, "function" == typeof relName && (relName = forceSync, forceSync = alt), forceSync ? main(undef, deps, callback, relName) : setTimeout(function() {
                main(undef, deps, callback, relName)
            }, 4), req
        }, req.config = function(cfg) {
            return req(cfg)
        }, requirejs._defined = defined, define = function(name, deps, callback) {
            if ("string" != typeof name) throw new Error("See almond README: incorrect module build, no module name");
            deps.splice || (callback = deps, deps = []), hasProp(defined, name) || hasProp(waiting, name) || (waiting[name] = [name, deps, callback])
        }, define.amd = {
            jQuery: !0
        }
    }(), define("../node_modules/almond/almond", function() {}), define("XooMLExceptions", {
        notImplemented: "NotImplementedException",
        missingParameter: "MissingParameterException",
        nullArgument: "NullArgumentException",
        invalidType: "InvalidTypeException",
        invalidState: "InvalidStateArgument",
        xooMLUException: "XooMLUException",
        itemUException: "ItemUException",
        nonUpgradeableAssociationException: "NonUpgradeableAssociationException",
        invalidArgument: "InvalidOptionsException",
        itemAlreadyExists: "ItemAlreadyExistsException",
        itemMirrorNotCurrent: "ItemMirrorNotCurrent"
    }), define("XooMLConfig", {
        schemaVersion: "0.54",
        schemaLocation: "http://kftf.ischool.washington.edu/xmlns/xooml",
        xooMLFragmentFileName: "XooML2.xml",
        maxFileLength: 50,
        createAssociationSimple: {
            displayText: !0
        },
        createAssociationLinkNonGrouping: {
            displayText: !0,
            itemURI: !0,
            localItemRequested: !1
        },
        createAssociationLinkGrouping: {
            displayText: !0,
            groupingItemURI: !0,
            xooMLDriverURI: !0
        },
        createAssociationCreate: {
            displayText: !0,
            itemName: !0,
            isGroupingItem: !0
        }
    }), define("XooMLUtil", ["./XooMLExceptions", "./XooMLConfig"], function(XooMLExceptions, XooMLConfig) {
        "use strict";
        var _TYPES = {
                "[object Boolean]": "boolean",
                "[object Number]": "number",
                "[object String]": "string",
                "[object Function]": "function",
                "[object Array]": "array",
                "[object Date]": "date",
                "[object RegExp]": "regexp",
                "[object Object]": "object",
                "[object Error]": "error"
            },
            XooMLUtil = {
                hasOptions: function(checkedOptions, options) {
                    if (!checkedOptions || !options) throw XooMLExceptions.nullArgument;
                    if (!XooMLUtil.isObject(checkedOptions) || !XooMLUtil.isObject(options)) throw XooMLExceptions.invalidType;
                    var checkedOption, isRequiredOption, missingOptionalParamCount;
                    if (missingOptionalParamCount = 0, !(Object.keys(options).length <= Object.keys(checkedOptions).length)) return !1;
                    for (checkedOption in checkedOptions)
                        if (checkedOptions.hasOwnProperty(checkedOption) && (isRequiredOption = checkedOptions[checkedOption], !options.hasOwnProperty(checkedOption))) {
                            if (isRequiredOption) return !1;
                            missingOptionalParamCount += 1
                        }
                    return Object.keys(options).length <= Object.keys(checkedOptions).length - missingOptionalParamCount
                },
                checkCallback: function(callback) {
                    if (!callback) throw XooMLExceptions.nullArgument;
                    if (!XooMLUtil.isFunction(callback)) throw XooMLExceptions.invalidType
                },
                isGUID: function(GUID) {
                    return "string" === XooMLUtil.getType(GUID) ? !0 : !1
                },
                isArray: function(value) {
                    return "array" === XooMLUtil.getType(value)
                },
                isObject: function(value) {
                    return "object" === XooMLUtil.getType(value)
                },
                isFunction: function(value) {
                    return null !== value
                },
                isString: function(value) {
                    return "string" === XooMLUtil.getType(value)
                },
                isBoolean: function(value) {
                    return "boolean" === XooMLUtil.getType(value)
                },
                generateGUID: function() {
                    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                        var r = 16 * Math.random() | 0,
                            v = "x" == c ? r : 3 & r | 8;
                        return v.toString(16)
                    })
                },
                getType: function(obj) {
                    return null === obj ? String(obj) : "object" == typeof obj || "function" == typeof obj ? _TYPES[obj.toString()] || "object" : typeof obj
                },
                endsWith: function(string, suffix) {
                    return -1 !== string.indexOf(suffix, string.length - suffix.length)
                },
                clone: function(obj) {
                    var copy;
                    if (null === obj || "object" != typeof obj) return obj;
                    if (obj instanceof Date) return copy = new Date, copy.setTime(obj.getTime()), copy;
                    if (obj instanceof Array) {
                        copy = [];
                        for (var i = 0, len = obj.length; len > i; i++) copy[i] = XooMLUtil.clone(obj[i]);
                        return copy
                    }
                    if (obj instanceof Object) {
                        copy = {};
                        for (var attr in obj) obj.hasOwnProperty(attr) && (copy[attr] = XooMLUtil.clone(obj[attr]));
                        return copy
                    }
                    throw XooMLExceptions.invalidType
                }
            };
        return XooMLUtil
    }), define("PathDriver", ["./XooMLExceptions", "./XooMLConfig", "./XooMLUtil"], function(XooMLExceptions, XooMLConfig, XooMLUtil) {
        "use strict";

        function PathDriver() {}
        var self, _PATH_SEPARATOR = "/";
        return self = PathDriver.prototype, self.joinPath = function(rootPath, leafPath) {
            var self = this;
            return rootPath === _PATH_SEPARATOR ? leafPath : (rootPath = self._stripTrailingSlash(rootPath), leafPath = self._stripLeadingSlash(leafPath), rootPath + _PATH_SEPARATOR + leafPath)
        }, self.joinPathArray = function(rootPath, leafPath) {
            throw XooMLExceptions.notImplemented
        }, self.splitPath = function(path) {
            return path.split(_PATH_SEPARATOR)
        }, self.formatPath = function(path) {
            return self._stripTrailingSlash(path)
        }, self.isRoot = function(path) {
            return path === _PATH_SEPARATOR
        }, self.getPathSeparator = function() {
            return _PATH_SEPARATOR
        }, self._stripTrailingSlash = function(path) {
            var strippedPath;
            return path === _PATH_SEPARATOR ? path : (strippedPath = path, XooMLUtil.endsWith(strippedPath, _PATH_SEPARATOR) && (strippedPath = strippedPath.substring(0, strippedPath.length - 1)), strippedPath)
        }, self._stripLeadingSlash = function(path) {
            var strippedPath;
            return path === _PATH_SEPARATOR ? path : (strippedPath = path, 0 === path.indexOf(_PATH_SEPARATOR) && (strippedPath = strippedPath.substring(1)), strippedPath)
        }, new PathDriver
    }), define("AssociationEditor", ["./XooMLExceptions", "./XooMLUtil"], function(XooMLExceptions, XooMLUtil) {
        "use strict";

        function AssociationEditor(options) {
            var self = this;
            options.element ? _fromElement(options.element, self) : options.commonData ? _fromOptions(options.commonData, self) : console.log(XooMLExceptions.missingParameter)
        }

        function _fromElement(element, self) {
            var dataElems, i, uri, elem;
            for (self.commonData = {
                    ID: element.getAttribute(_ID_ATTR),
                    displayText: element.getAttribute(_DISPLAY_TEXT_ATTR),
                    associatedXooMLFragment: element.getAttribute(_ASSOCIATED_XOOML_FRAGMENT_ATTR),
                    associatedXooMLDriver: element.getAttribute(_ASSOCIATED_XOOML_DRIVER_ATTR),
                    associatedSyncDriver: element.getAttribute(_ASSOCIATED_SYNC_DRIVER_ATTR),
                    associatedItemDriver: element.getAttribute(_ASSOCIATED_ITEM_DRIVER_ATTR),
                    associatedItem: element.getAttribute(_ASSOCIATED_ITEM_ATTR),
                    localItem: element.getAttribute(_LOCAL_ITEM_ATTR),
                    isGrouping: JSON.parse(element.getAttribute(_IS_GROUPING_ATTR))
                }, self.namespace = {}, dataElems = element.getElementsByTagName(_NAMESPACE_ELEMENT_NAME), i = 0; i < dataElems.length; i += 1) {
                for (elem = dataElems[i], uri = elem.namespaceURI, self.namespace[uri] = {}, self.namespace[uri].attributes = {}, i = 0; i < elem.attributes.length; i += 1) "xmlns" !== elem.attributes[i].name && (self.namespace[uri].attributes[elem.attributes[i].localName] = elem.getAttributeNS(uri, elem.attributes[i].localName));
                self.namespace[uri].data = elem.textContent
            }
        }

        function _fromOptions(commonData, self) {
            if (!commonData) throw XooMLExceptions.nullArgument;
            self.commonData = {
                displayText: commonData.displayText || null,
                associatedXooMLFragment: commonData.associatedXooMLFragment || null,
                associatedXooMLDriver: commonData.associatedXooMLDriver || null,
                associatedSyncDriver: commonData.associatedSyncDriver || null,
                associatedItemDriver: commonData.associatedItemDriver || null,
                associatedItem: commonData.associatedItem || null,
                localItem: commonData.localItem || null,
                isGrouping: commonData.isGrouping || !1,
                ID: XooMLUtil.generateGUID()
            }, self.namespace = {}
        }
        var _ELEMENT_NAME = "association",
            _NAMESPACE_ELEMENT_NAME = "associationNamespaceElement",
            _ID_ATTR = "ID",
            _DISPLAY_TEXT_ATTR = "displayText",
            _ASSOCIATED_XOOML_FRAGMENT_ATTR = "associatedXooMLFragment",
            _ASSOCIATED_XOOML_DRIVER_ATTR = "associatedXooMLDriver",
            _ASSOCIATED_SYNC_DRIVER_ATTR = "associatedSyncDriver",
            _ASSOCIATED_ITEM_DRIVER_ATTR = "associatedItemDriver",
            _ASSOCIATED_ITEM_ATTR = "associatedItem",
            _LOCAL_ITEM_ATTR = "localItem",
            _IS_GROUPING_ATTR = "isGrouping";
        return AssociationEditor.prototype.toElement = function() {
            var self = this,
                associationElem = document.createElementNS(null, _ELEMENT_NAME);
            return Object.keys(self.commonData).forEach(function(key) {
                self.commonData[key] && associationElem.setAttribute(key, self.commonData[key])
            }), Object.keys(self.namespace).forEach(function(uri) {
                var nsElem = document.createElementNS(uri, _NAMESPACE_ELEMENT_NAME);
                Object.keys(self.namespace[uri].attributes).forEach(function(attrName) {
                    nsElem.setAttributeNS(uri, attrName, self.namespace[uri].attributes[attrName])
                }), nsElem.textContent = self.namespace[uri].data, associationElem.appendChild(nsElem)
            }), associationElem
        }, AssociationEditor
    }), define("ItemDriver", ["./XooMLExceptions", "./XooMLConfig", "./XooMLUtil", "./AssociationEditor"], function(XooMLExceptions, XooMLConfig, XooMLUtil, AssociationEditor) {
        "use strict";

        function ItemDriver(options, callback) {
            if (XooMLUtil.checkCallback(callback), !XooMLUtil.isObject(options)) return callback(XooMLExceptions.invalidType);
            if (!XooMLUtil.isFunction(callback)) return callback(XooMLExceptions.invalidType);
            if (!XooMLUtil.hasOptions(_CONSTRUCTOR__OPTIONS, options)) return callback(XooMLExceptions.missingParameter);
            var self = this;
            self._dropboxClient = options.dropboxClient, self._checkDropboxAuthenticated(self._dropboxClient) ? callback(!1, self) : self._dropboxClient.authenticate(function(error) {
                return error ? callback(XooMLExceptions.itemUException, null) : callback(!1, self)
            })
        }
        var self, _CONSTRUCTOR__OPTIONS = {
                driverURI: !0,
                dropboxClient: !0
            },
            _DIRECTORY_STAT = "inode/directory";
        return self = ItemDriver.prototype, self.moveGroupingItem = function(fromPath, newPath, callback) {
            var self = this;
            self._dropboxClient.move(fromPath, newPath, function(error, stat) {
                return callback(error ? error : !1)
            })
        }, self.isGroupingItem = function(path, callback) {
            var self = this;
            self._dropboxClient.stat(path, function(error, stat) {
                return error ? self._showDropboxError(error, callback) : callback(!1, stat.mimeType === _DIRECTORY_STAT)
            })
        }, self.createGroupingItem = function(path, callback) {
            var self = this;
            self._dropboxClient.mkdir(path, function(error, stat) {
                return error ? self._showDropboxError(error, callback) : callback(!1, stat)
            })
        }, self.createNonGroupingItem = function(path, file, callback) {
            var self = this;
            self._dropboxClient.writeFile(path, file, function(error, stat) {
                return error ? self._showDropboxError(error, callback) : callback(!1, stat)
            })
        }, self.deleteGroupingItem = function(path, callback) {
            var self = this;
            self._dropboxClient.remove(path, function(error, stat) {
                return error ? self._showDropboxError(error, callback) : callback(!1, stat)
            })
        }, self.deleteNonGroupingItem = function(path, callback) {
            var self = this;
            self._dropboxClient.remove(path, function(error, stat) {
                return error ? self._showDropboxError(error, callback) : callback(!1, stat)
            })
        }, self.copyItem = function(fromPath, toPath, callback) {
            var self = this;
            self._dropboxClient.copy(fromPath, toPath, function(error) {
                return error ? self._showDropboxError(error, callback) : callback(!1)
            })
        }, self.moveItem = function(fromPath, toPath, callback) {
            var self = this;
            self._dropboxClient.move(fromPath, toPath, function(error) {
                return error ? self._showDropboxError(error, callback) : callback(!1)
            })
        }, self.getURL = function(path, callback) {
            var self = this;
            self._dropboxClient.makeUrl(path, null, function(error, publicURL) {
                return error ? self._showDropboxError(error, callback) : callback(!1, publicURL.url)
            })
        }, self.listItems = function(path, callback) {
            var self = this;
            self._dropboxClient.readdir(path, function(error, list, stat, listStat) {
                if (error) return self._showDropboxError(error, callback);
                var i, output;
                for (output = [], i = 0; i < listStat.length; i += 1) listStat[i].name !== XooMLConfig.xooMLFragmentFileName && output.push(new AssociationEditor({
                    commonData: {
                        displayText: listStat[i].name,
                        isGrouping: listStat[i].isFolder,
                        localItem: listStat[i].name,
                        associatedItem: listStat[i].isFolder ? listStat[i].path : null
                    }
                }));
                return callback(!1, output)
            })
        }, self.checkExisted = function(path, callback) {
            var result, self = this;
            self._dropboxClient.stat(path, function(error, stat) {
                return error ? self._showDropboxError(error, callback) : (result = !(null !== error && 404 === error.status) || null === error && stat.isRemoved, callback(!1, result))
            })
        }, self._showDropboxError = function(error, callback) {
            return callback(error.status)
        }, self._checkDropboxAuthenticated = function(dropboxClient) {
            return 4 === dropboxClient.authState
        }, ItemDriver
    }), define("XooMLDriver", ["./XooMLExceptions", "./XooMLConfig", "./XooMLUtil"], function(XooMLExceptions, XooMLConfig, XooMLUtil) {
        "use strict";

        function XooMLDriver(options, callback) {
            if (XooMLUtil.checkCallback(callback), !XooMLUtil.hasOptions(_CONSTRUCTOR_OPTIONS, options)) return callback(XooMLExceptions.missingParameter);
            if (!XooMLUtil.isObject(options)) return callback(XooMLExceptions.invalidType);
            var self = this;
            return self._dropboxClient = options.dropboxClient, self._fragmentURI = options.fragmentURI, self._checkDropboxAuthenticated(self._dropboxClient) ? callback(!1, self) : void self._dropboxClient.authenticate(function(error, client) {
                return error ? callback(XooMLExceptions.xooMLUException, null) : callback(!1, self)
            })
        }
        var _CONSTRUCTOR_OPTIONS = {
            driverURI: !0,
            dropboxClient: !0,
            fragmentURI: !0
        };
        return XooMLDriver.prototype.getXooMLFragment = function(callback) {
            var self = this;
            self._dropboxClient.readFile(self._fragmentURI, function(error, content) {
                return error ? self._showDropboxError(error, callback) : void callback(!1, content)
            })
        }, XooMLDriver.prototype.setXooMLFragment = function(fragment, callback) {
            var self = this;
            fragment = fragment.replace(/\n/g, "&#10;"), self._dropboxClient.writeFile(self._fragmentURI, fragment, function(error, stat) {
                return error ? self._showDropboxError(error, callback) : callback(!1, stat)
            })
        }, XooMLDriver.prototype.checkExists = function(callback) {
            var result, self = this;
            self._dropboxClient.stat(self._fragmentURI, function(error, stat) {
                return error ? self._showDropboxError(error, callback) : (result = null !== error && 404 === error.status || null === error && stat.isRemoved === !0 ? !1 : !0, void callback(!1, result))
            })
        }, XooMLDriver.prototype._showDropboxError = function(error, callback) {
            return callback(error.status)
        }, XooMLDriver.prototype._checkDropboxAuthenticated = function(dropboxClient) {
            return 4 === dropboxClient.authState
        }, XooMLDriver
    }), define("FragmentEditor", ["./XooMLExceptions", "./XooMLConfig", "./XooMLUtil", "./PathDriver", "./AssociationEditor"], function(XooMLExceptions, XooMLConfig, XooMLUtil, PathDriver, AssociationEditor) {
        "use strict";

        function FragmentEditor(options) {
            var self = this;
            options.text ? _fromString(options.text, self) : options.element ? _fromElement(options.element, self) : options.commonData ? _fromOptions(options.commonData, options.associations, self) : console.log(XooMLExceptions.missingParameter)
        }

        function _fromOptions(commonData, associations, self) {
            if (!commonData) throw XooMLExceptions.nullArgument;
            self.commonData = {
                displayName: commonData.displayName || null,
                schemaLocation: commonData.schemaLocation || null,
                schemaVersion: commonData.schemaVersion || null,
                itemDriver: commonData.itemDriver || null,
                itemDescribed: commonData.itemDescribed || null,
                syncDriver: commonData.syncDriver || null,
                xooMLDriver: commonData.xooMLDriver || null,
                GUIDGeneratedOnLastWrite: XooMLUtil.generateGUID()
            }, self.associations = {}, associations.forEach(function(assoc) {
                var guid = assoc.commonData.ID;
                self.associations[guid] = assoc
            }), self.namespace = {}
        }

        function _fromString(text, namespace, self) {
            var parser = new DOMParser,
                doc = parser.parseFromString(text, "application/xml");
            _fromElement(doc.children[0], namespace, self)
        }

        function _fromElement(element, self) {
            var dataElems, i, associationElems, guid, elem, uri;
            for (self.commonData = {
                    fragmentNamespaceElement: element.getAttribute(_NAMESPACE_ELEMENT_NAME),
                    schemaVersion: element.getAttribute(_SCHEMA_VERSION_ATTR),
                    schemaLocation: element.getAttribute(_SCHEMA_LOCATION_ATTR),
                    itemDescribed: element.getAttribute(_ITEM_DESCRIBED_ATTR),
                    displayName: element.getAttribute(_DISPLAY_NAME_ATTR),
                    itemDriver: element.getAttribute(_ITEM_DRIVER_ATTR),
                    syncDriver: element.getAttribute(_SYNC_DRIVER_ATTR),
                    xooMLDriver: element.getAttribute(_XOOML_DRIVER_ATTR),
                    GUIDGeneratedOnLastWrite: element.getAttribute(_GUID_ATTR)
                }, self.namespace = {}, dataElems = element.getElementsByTagName(_NAMESPACE_ELEMENT_NAME), i = 0; i < dataElems.length; i += 1) {
                for (elem = dataElems[i], uri = elem.namespaceURI, self.namespace[uri] = {}, self.namespace[uri].attributes = {}, i = 0; i < elem.attributes.length; i += 1) "xmlns" !== elem.attributes[i].name && (self.namespace[uri].attributes[elem.attributes[i].localName] = elem.getAttributeNS(uri, elem.attributes[i].localName));
                self.namespace[uri].data = elem.textContent
            }
            for (self.associations = {}, associationElems = element.getElementsByTagName(_ASSOCIATION_ELEMENT_NAME), i = 0; i < associationElems.length; i += 1) guid = associationElems[i].getAttribute(_ASSOCIATION_ID_ATTR), self.associations[guid] = new AssociationEditor({
                element: associationElems[i]
            })
        }
        var _ELEMENT_NAME = "fragment",
            _ASSOCIATION_ELEMENT_NAME = "association",
            _ASSOCIATION_ID_ATTR = "ID",
            _NAMESPACE_ELEMENT_NAME = "fragmentNamespaceElement",
            _SCHEMA_VERSION_ATTR = "schemaVersion",
            _SCHEMA_LOCATION_ATTR = "schemaLocation",
            _ITEM_DESCRIBED_ATTR = "itemDescribed",
            _DISPLAY_NAME_ATTR = "displayName",
            _ITEM_DRIVER_ATTR = "itemDriver",
            _SYNC_DRIVER_ATTR = "syncDriver",
            _XOOML_DRIVER_ATTR = "xooMLDriver",
            _GUID_ATTR = "GUIDGeneratedOnLastWrite",
            _ITEM_MIRROR_NS = "http://kftf.ischool.washington.edu/xmlns/xooml";
        return FragmentEditor.prototype.updateID = function() {
            var guid;
            return guid = XooMLUtil.generateGUID(), this.commonData.GUIDGeneratedOnLastWrite = guid, guid
        }, FragmentEditor.prototype.toElement = function() {
            var self = this,
                fragmentElem = document.createElementNS(_ITEM_MIRROR_NS, _ELEMENT_NAME);
            return Object.keys(self.commonData).forEach(function(attrName) {
                var attrValue = self.commonData[attrName];
                attrValue && fragmentElem.setAttribute(attrName, attrValue)
            }), Object.keys(self.namespace).forEach(function(uri) {
                var nsElem = document.createElementNS(uri, _NAMESPACE_ELEMENT_NAME);
                Object.keys(self.namespace[uri].attributes).forEach(function(attrName) {
                    nsElem.setAttributeNS(uri, attrName, self.namespace[uri].attributes[attrName])
                }), nsElem.textContent = self.namespace[uri].data, fragmentElem.appendChild(nsElem)
            }), Object.keys(self.associations).forEach(function(id) {
                fragmentElem.appendChild(self.associations[id].toElement())
            }), fragmentElem
        }, FragmentEditor.prototype.toString = function() {
            var serializer = new XMLSerializer;
            return serializer.serializeToString(this.toElement())
        }, FragmentEditor
    }), define("SyncDriver", ["./XooMLDriver", "./XooMLExceptions", "./XooMLConfig", "./XooMLUtil", "./FragmentEditor", "./AssociationEditor"], function(XooMLDriver, XooMLExceptions, XooMLConfig, XooMLUtil, FragmentEditor, AssociationEditor) {
        "use strict";

        function SyncDriver(itemMirror) {
            var self = this;
            self._itemMirror = itemMirror, self._itemDriver = itemMirror._itemDriver, self._xooMLDriver = itemMirror._xooMLDriver
        }

        function _localItemCompare(a, b) {
            return a.commonData.localItem > b.commonData.localItem ? 1 : a.commonData.localItem < b.commonData.localItem ? -1 : 0
        }
        return SyncDriver.prototype.sync = function(callback) {
            function processItems(error, associations) {
                return error ? callback(error) : (itemAssociations = associations, void self._xooMLDriver.getXooMLFragment(processXooML))
            }

            function processXooML(error, xooMLContent) {
                if (404 === error) {
                    var fragmentString = self._itemMirror._fragment.toString();
                    return self._xooMLDriver.setXooMLFragment(fragmentString, function(error) {
                        callback(error ? error : !1)
                    })
                }
                if (error) return callback(error);
                var xooMLAssociations, xooMLIdx = 0,
                    synchronized = !0;
                self._fragmentEditor = new FragmentEditor({
                    text: xooMLContent
                }), xooMLAssociations = Object.keys(self._fragmentEditor.associations).map(function(guid) {
                    return self._fragmentEditor.associations[guid]
                }).filter(function(assoc) {
                    return null !== assoc.commonData.localItem
                }), itemAssociations.sort(_localItemCompare), xooMLAssociations.sort(_localItemCompare);
                var itemLocals = itemAssociations.map(function(assoc) {
                        return assoc.commonData.localItem
                    }),
                    xooMLLocals = xooMLAssociations.map(function(assoc) {
                        return assoc.commonData.localItem
                    });
                return itemLocals.forEach(function(localItem, itemIdx) {
                    var search = xooMLLocals.lastIndexOf(localItem, xooMLIdx);
                    if (-1 === search) {
                        synchronized = !1;
                        var association = itemAssociations[itemIdx];
                        self._fragmentEditor.associations[association.commonData.ID] = association
                    } else xooMLAssociations.slice(xooMLIdx, search).forEach(function(assoc) {
                        synchronized = !1, delete self._fragmentEditor.associations[assoc.guid]
                    }), xooMLIdx = search + 1
                }), xooMLAssociations.slice(xooMLIdx, xooMLLocals.length).forEach(function(assoc) {
                    synchronized = !1, delete self._fragmentEditor.associations[assoc.commonData.ID]
                }), synchronized ? callback(!1) : (self._fragmentEditor.updateID(), void self._xooMLDriver.setXooMLFragment(self._fragmentEditor.toString(), function(error) {
                    return callback(error ? error : !1)
                }))
            }
            var itemAssociations, self = this;
            self._itemDriver.listItems(self._itemMirror._groupingItemURI, processItems)
        }, SyncDriver
    }), define("ItemMirror", ["./XooMLExceptions", "./XooMLConfig", "./XooMLUtil", "./PathDriver", "./ItemDriver", "./XooMLDriver", "./SyncDriver", "./FragmentEditor", "./AssociationEditor"], function(XooMLExceptions, XooMLConfig, XooMLUtil, PathDriver, ItemDriver, XooMLDriver, SyncDriver, FragmentEditor, AssociationEditor) {
        "use strict";

        function ItemMirror(options, callback) {
            function loadXooMLDriver(error, driver) {
                return error ? callback(error) : (self._xooMLDriver = driver, void self._xooMLDriver.getXooMLFragment(processXooML))
            }

            function processXooML(error, fragmentString) {
                if (404 === error) new ItemDriver(options.itemDriver, createFromItemDriver);
                else {
                    if (error) return callback(error);
                    createFromXML(fragmentString)
                }
            }

            function createFromXML(fragmentString) {
                console.log("Constructing from XML"), self._fragment = new FragmentEditor({
                    text: fragmentString
                });
                self._fragment.commonData.syncDriver, self._fragment.commonData.itemDriver;
                new ItemDriver(options.itemDriver, function(error, driver) {
                    return error ? callback(error) : (self._itemDriver = driver, self._syncDriver = new SyncDriver(self), void self.refresh(function(error) {
                        return callback(!1, self)
                    }))
                })
            }

            function createFromItemDriver(error, driver) {
                self._itemDriver = driver, self._itemDriver.listItems(self._groupingItemURI, buildFragment)
            }

            function buildFragment(error, associations) {
                return error ? callback(error) : (self._fragment = new FragmentEditor({
                    commonData: {
                        itemDescribed: self._groupingItemURI,
                        displayName: displayName,
                        itemDriver: "dropboxItemDriver",
                        xooMLDriver: "dropboxXooMLDriver",
                        syncDriver: "itemMirrorSyncUtility"
                    },
                    associations: associations
                }), self._syncDriver = new SyncDriver(self), self._xooMLDriver.setXooMLFragment(self._fragment.toString(), function(error) {
                    error && console.log(error)
                }), callback(!1, self))
            }
            if (XooMLUtil.checkCallback(callback), !options) return callback(XooMLExceptions.nullArgument);
            if (!XooMLUtil.isObject(options)) return callback(XooMLExceptions.invalidType);
            var xooMLFragmentURI, displayName, self = this;
            self._xooMLDriver = null, self._itemDriver = null, self._syncDriver = null, self._creator = options.creator || null, self._groupingItemURI = PathDriver.formatPath(options.groupingItemURI), self._newItemMirrorOptions = options, PathDriver.isRoot(self._groupingItemURI) ? displayName = "Dropbox" : (displayName = PathDriver.formatPath(self._groupingItemURI), displayName = PathDriver.splitPath(displayName), displayName = displayName[displayName.length - 1]), xooMLFragmentURI = PathDriver.joinPath(self._groupingItemURI, XooMLConfig.xooMLFragmentFileName), options.xooMLDriver.fragmentURI = xooMLFragmentURI, new XooMLDriver(options.xooMLDriver, loadXooMLDriver)
        }
        var _UPGRADE_ASSOCIATION_OPTIONS = {
            GUID: !0,
            localItemURI: !1
        };
        return ItemMirror.prototype.getDisplayName = function() {
            return this._fragment.commonData.displayName
        }, ItemMirror.prototype.getPublicURL = function(GUID) {
            var self = this,
                item = self.getAssociationLocalItem(GUID),
                folder = self.getURIforItemDescribed();
            return "https://www.dropbox.com/home" + encodeURI(folder) + "?preview=" + encodeURIComponent(item)
        }, ItemMirror.prototype.setDisplayName = function(name) {
            this._fragment.commonData.displayName = name
        }, ItemMirror.prototype.getSchemaVersion = function(callback) {
            return this._fragment.commonData.schemaVersion
        }, ItemMirror.prototype.getSchemaLocation = function() {
            return this._fragment.commonData.schemaLocation
        }, ItemMirror.prototype.getURIforItemDescribed = function() {
            return this._fragment.commonData.itemDescribed
        }, ItemMirror.prototype.getAssociationDisplayText = function(GUID) {
            return this._fragment.associations[GUID].commonData.displayText
        }, ItemMirror.prototype.setAssociationDisplayText = function(GUID, displayText) {
            this._fragment.associations[GUID].commonData.displayText = displayText
        }, ItemMirror.prototype.getAssociationLocalItem = function(GUID) {
            return this._fragment.associations[GUID].commonData.localItem
        }, ItemMirror.prototype.getAssociationAssociatedItem = function(GUID) {
            return this._fragment.associations[GUID].commonData.associatedItem
        }, ItemMirror.prototype.getFragmentNamespaceAttribute = function(attributeName, uri) {
            var ns = this._fragment.namespace;
            return ns[uri] = ns[uri] || {}, ns[uri].attributes = ns[uri].attributes || {}, this._fragment.namespace[uri].attributes[attributeName]
        }, ItemMirror.prototype.setFragmentNamespaceAttribute = function(attributeName, attributeValue, uri) {
            var ns = this._fragment.namespace;
            ns[uri] = ns[uri] || {}, ns[uri].attributes = ns[uri].attributes || {}, this._fragment.namespace[uri].attributes[attributeName] = attributeValue
        }, ItemMirror.prototype.addFragmentNamespaceAttribute = function(attributeName, uri) {
            var ns = this._fragment.namespace;
            if (ns[uri] = ns[uri] || {}, ns[uri].attributes = ns[uri].attributes || {}, this._fragment.namespace[uri].attributes[attributeName]) throw XooMLExceptions.invalidState;
            this.setFragmentNamespaceAttribute(attributeName, uri)
        }, ItemMirror.prototype.removeFragmentNamespaceAttribute = function(attributeName, uri) {
            delete this._fragment.namespace[uri].attributes[attributeName]
        }, ItemMirror.prototype.hasFragmentNamespace = function(uri) {
            var namespace = this._fragment.namespace[uri];
            return namespace ? !0 : !1
        }, ItemMirror.prototype.listFragmentNamespaceAttributes = function(uri) {
            return Object.keys(this._fragment.namespace[uri].attributes)
        }, ItemMirror.prototype.getFragmentNamespaceData = function(uri) {
            return this._fragment.namespace[uri].data
        }, ItemMirror.prototype.setFragmentNamespaceData = function(data, uri) {
            var ns = this._fragment.namespace;
            ns[uri] = ns[uri] || {}, this._fragment.namespace[uri].data = data
        }, ItemMirror.prototype.createItemMirrorForAssociatedGroupingItem = function(GUID, callback) {
            var isGrouping, xooMLOptions, itemOptions, syncOptions, uri, self = this;
            return uri = PathDriver.joinPath(self.getAssociationAssociatedItem(GUID), "XooML2.xml"), itemOptions = {
                driverURI: "DropboxItemUtility",
                dropboxClient: self._xooMLDriver._dropboxClient
            }, xooMLOptions = {
                fragmentURI: uri,
                driverURI: "DropboxXooMLUtility",
                dropboxClient: self._xooMLDriver._dropboxClient
            }, syncOptions = {
                utilityURI: "MirrorSyncUtility"
            }, (isGrouping = self.isAssociationAssociatedItemGrouping(GUID)) ? void new ItemMirror({
                groupingItemURI: self.getAssociationAssociatedItem(GUID),
                xooMLDriver: xooMLOptions,
                itemDriver: itemOptions,
                syncDriver: syncOptions,
                creator: self
            }, function(error, itemMirror) {
                return console.log(error), callback(error, itemMirror)
            }) : callback("Association not grouping, cannot continue")
        }, ItemMirror.prototype.createAssociation = function(options, callback) {debugger;
            var association, path, saveOutFragment, self = this;
            if (saveOutFragment = function(association) {
                    var guid = association.commonData.ID;
                    self._fragment.associations[guid] = association, self.save(function(error) {
                        return callback(error, guid)
                    })
                }, !XooMLUtil.isFunction(callback)) throw XooMLExceptions.invalidType;
            return XooMLUtil.isObject(options) ? options.displayText && options.localItem && options.isGroupingItem ? (association = new AssociationEditor({
                commonData: {
                    displayText: options.displayText,
                    isGrouping: !0,
                    localItem: options.localItem,
                    associatedItem: PathDriver.joinPath(self.getURIforItemDescribed(), options.localItem)
                }
            }), path = PathDriver.joinPath(self._groupingItemURI, association.commonData.localItem), self._itemDriver.createGroupingItem(path, function(error) {
                return error ? callback(error) : saveOutFragment(association)
            }), void 0) : (options.displayText && options.itemURI ? association = new AssociationEditor({
                commonData: {
                    displayText: options.displayText,
                    associatedItem: options.itemURI,
                    isGrouping: !1
                }
            }) : options.displayText && (association = new AssociationEditor({
                commonData: {
                    displayText: options.displayText,
                    isGrouping: !1
                }
            })), saveOutFragment(association)) : callback(XooMLExceptions.invalidType)
        }, ItemMirror.prototype.isAssociationPhantom = function(guid) {
            var data = this._fragment.associations[guid].commonData;
            return !(data.isGrouping || data.localItem)
        }, ItemMirror.prototype.copyAssociation = function(GUID, ItemMirror, callback) {
            var self = this;
            return XooMLUtil.checkCallback(callback), GUID ? XooMLUtil.isGUID(GUID) ? void self.getAssociationLocalItem(GUID, function(error, localItem) {
                if (error) return callback(error);
                if (!localItem) {
                    var options = {};
                    return self.getAssociationDisplayText(GUID, function(error, displayText) {
                        return error ? callback(error) : (options.displayText = displayText, void self.getAssociationAssociatedItem(GUID, function(error, associatedItem) {
                            return error ? callback(error) : void(options.itemURI = associatedItem)
                        }))
                    }), ItemMirror.createAssociation(options, function(error, GUID) {
                        return error ? callback(error) : void 0
                    }), ItemMirror._save(callback)
                }
                self._handleDataWrapperCopyAssociation(GUID, localItem, ItemMirror, error, callback)
            }) : callback(XooMLExceptions.invalidType) : callback(XooMLExceptions.nullArgument)
        }, ItemMirror.prototype.moveAssociation = function(GUID, ItemMirror, callback) {
            var self = this;
            return XooMLUtil.checkCallback(callback), GUID ? XooMLUtil.isGUID(GUID) ? void self.getAssociationLocalItem(GUID, function(error, localItem) {
                if (error) return callback(error);
                if (!localItem) {
                    var options = {};
                    self.getAssociationDisplayText(GUID, function(error, displayText) {
                        return error ? callback(error) : (options.displayText = displayText, void self.getAssociationAssociatedItem(GUID, function(error, associatedItem) {
                            return error ? callback(error) : void(options.itemURI = associatedItem)
                        }))
                    }), ItemMirror.createAssociation(options, function(error, newGUID) {
                        return error ? callback(error) : (self._fragmentEditor.deleteAssociation(GUID, function(error) {
                            return error ? callback(error) : self._save(callback)
                        }), ItemMirror._save(callback))
                    })
                }
                self._handleDataWrapperMoveAssociation(GUID, localItem, ItemMirror, error, callback)
            }) : callback(XooMLExceptions.invalidType) : callback(XooMLExceptions.nullArgument)
        }, ItemMirror.prototype.deleteAssociation = function(GUID, callback) {
            function deleteContent(error) {
                if (error) return callback(error);
                var isPhantom = self.isAssociationPhantom(GUID);
                if (isPhantom) return delete self._fragment.associations[GUID], self._unsafeWrite(function(error) {
                    return error ? callback(error) : callback()
                });
                var isGrouping = self.isAssociationAssociatedItemGrouping(GUID),
                    localItem = self.getAssociationLocalItem(GUID),
                    path = PathDriver.joinPath(self._groupingItemURI, localItem);
                return delete self._fragment.associations[GUID], isGrouping ? self._itemDriver.deleteGroupingItem(path, postDelete) : self._itemDriver.deleteNonGroupingItem(path, postDelete)
            }

            function postDelete(error) {
                return error ? callback(error) : self.refresh(function(error) {
                    return callback(error ? error : error)
                })
            }
            var self = this;
            return XooMLUtil.checkCallback(callback), GUID ? XooMLUtil.isGUID(GUID) ? self.save(deleteContent) : callback(XooMLExceptions.invalidType) : callback(XooMLExceptions.nullArgument)
        }, ItemMirror.prototype.upgradeAssociation = function(options, callback) {
            var self = this;
            return XooMLUtil.checkCallback(callback), XooMLUtil.hasOptions(_UPGRADE_ASSOCIATION_OPTIONS, options) ? options.hasOwnProperty("localItemURI") && !XooMLUtil.isString(options.localItemURI) || !XooMLUtil.isGUID(options.GUID) ? callback(XooMLExceptions.invalidType) : void(options.hasOwnProperty("localItemURI") ? self._setSubGroupingItemURIFromDisplayText(options.GUID, options.localItemURI, callback) : self.getAssociationDisplayText(options.GUID, function(error, displayText) {
                return error ? callback(error) : void self._setSubGroupingItemURIFromDisplayText(options.GUID, displayText, callback)
            })) : callback(XooMLExceptions.missingParameter)
        }, ItemMirror.prototype.renameAssociationLocalItem = function(GUID, newName, callback) {
            function postSave(error) {
                if (error) return callback(error);
                var localItem = self.getAssociationLocalItem(GUID),
                    oldPath = PathDriver.joinPath(self._groupingItemURI, localItem),
                    newPath = PathDriver.joinPath(self._groupingItemURI, newName);
                self._itemDriver.moveItem(oldPath, newPath, postMove)
            }

            function postMove(error) {
                self._fragment.associations[GUID].commonData.localItem = newName, self._unsafeWrite(postWrite)
            }

            function postWrite(error) {
                return error ? callback(error) : void self.refresh(postRefresh)
            }

            function postRefresh(error) {
                return callback(error, self._fragment.associations[GUID].commonData.ID)
            }
            var self = this;
            return XooMLUtil.checkCallback(callback), GUID ? XooMLUtil.isGUID(GUID) ? void self.save(postSave) : callback(XooMLExceptions.invalidType) : callback(XooMLExceptions.nullArgument)
        }, ItemMirror.prototype._unsafeWrite = function(callback) {
            function afterXooML(error, content) {
                if (error) return callback(error);
                new FragmentEditor({
                    text: content
                });
                return self._fragment.updateID(), self._xooMLDriver.setXooMLFragment(self._fragment.toString(), function(error) {
                    return callback(error ? error : !1)
                })
            }
            var self = this;
            self._xooMLDriver.getXooMLFragment(afterXooML)
        }, ItemMirror.prototype.isAssociationAssociatedItemGrouping = function(GUID) {
            return this._fragment.associations[GUID].commonData.isGrouping
        }, ItemMirror.prototype.listAssociations = function() {
            return Object.keys(this._fragment.associations)
        }, ItemMirror.prototype.getAssociationNamespaceAttribute = function(attributeName, GUID, uri) {
            var ns = this._fragment.associations[GUID].namespace;
            return ns[uri] = ns[uri] || {}, ns[uri].attributes = ns[uri].attributes || {}, this._fragment.associations[GUID].namespace[uri].attributes[attributeName]
        }, ItemMirror.prototype.setAssociationNamespaceAttribute = function(attributeName, attributeValue, GUID, uri) {
            var ns = this._fragment.associations[GUID].namespace;
            ns[uri] = ns[uri] || {}, ns[uri].attributes = ns[uri].attributes || {}, this._fragment.associations[GUID].namespace[uri].attributes[attributeName] = attributeValue
        }, ItemMirror.prototype.addAssociationNamespaceAttribute = function(attributeName, attributeValue, GUID, uri) {
            var ns = this._fragment.associations[GUID].namespace;
            if (ns[uri] = ns[uri] || {}, ns[uri].attributes = ns[uri].attributes || {}, this._fragment.associations[GUID].namespace[uri].attributes[attributeName]) throw XooMLExceptions.invalidState;
            this.setAssociationNamespaceAttribute(attributeName, attributeValue, GUID, uri)
        }, ItemMirror.prototype.removeAssociationNamespaceAttribute = function(attributeName, GUID, uri) {
            delete this._fragment.associations[GUID].namespace[uri].attributes[attributeName]
        }, ItemMirror.prototype.hasAssociationNamespace = function(GUID, uri) {
            var namespace = this._fragment.associations[GUID].namespace[uri];
            return namespace ? !0 : !1
        }, ItemMirror.prototype.listAssociationNamespaceAttributes = function(GUID, uri) {
            var ns = this._fragment.associations[GUID].namespace;
            return ns[uri] = ns[uri] || {}, ns[uri].attributes = ns[uri].attributes || {}, Object.keys(this._fragment.associations[GUID].namespace[uri].attributes)
        }, self.getAssociationNamespaceData = function(GUID, uri) {
            var ns = this._fragment.associations[GUID].namespace;
            return ns[uri] = ns[uri] || {}, ns[uri].attributes = ns[uri].attributes || {}, this._fragment.associations[GUID].namespace[uri].data
        }, ItemMirror.prototype.setAssociationNamespaceData = function(data, GUID, uri) {
            var ns = this._fragment.associations[GUID].namespace;
            ns[uri] = ns[uri] || {}, ns[uri].attributes = ns[uri].attributes || {}, this._fragment.associations[GUID].namespace[uri].data = data
        }, ItemMirror.prototype._sync = function(callback) {
            var self = this;
            self._syncDriver.sync(callback)
        }, ItemMirror.prototype.refresh = function(callback) {
            function resetFragment(error, content) {
                return error ? callback(error) : (self._fragment = new FragmentEditor({
                    text: content
                }), callback(!1))
            }
            var self = this;
            self._sync(function(error) {
                error === XooMLExceptions.itemMirrorNotCurrent ? self._xooMLDriver.getXooMLFragment(resetFragment) : error ? callback(error) : self._xooMLDriver.getXooMLFragment(resetFragment)
            })
        }, ItemMirror.prototype.getCreator = function() {
            return this._creator
        }, ItemMirror.prototype.save = function(callback) {
            function postSync(error) {
                return error ? callback(error) : self._unsafeWrite(postWrite)
            }

            function postWrite(error) {
                return callback(error)
            }
            var self = this;
            self._sync(postSync)
        }, self._isURL = function(URL) {
            return /^http:\/\//.exec(URL)
        }, ItemMirror
    }), require("ItemMirror")
});