var EmailsEditor;
EmailsEditor = function() {
    "use strict";
    var e = {
            352: function(e, t, n) {
                n(621);
                var i = n(130).renderEditorComponent,
                    r = n(141).addNewEmailEntry,
                    a = n(872),
                    d = a.handleEmailListEvents,
                    o = a.handleInputEnterEvents,
                    l = a.handleInputBlurEvents,
                    u = a.handleInputPasteEvents;
                e.exports = function(e) {
                    var t, n, a = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
                        s = [],
                        c = function() {
                            var r = i(e),
                                a = r.listDom,
                                d = r.inputDom;
                            v(t = a, n = d)
                        },
                        f = function(e) {
                            r(n, e, t, s, a)
                        },
                        m = function() {
                            return JSON.parse(JSON.stringify(s))
                        },
                        v = function(t, n) {
                            n.addEventListener("keydown", (function(e) {
                                return o(e, n, t, s, a)
                            })), n.addEventListener("blur", (function(e) {
                                return l(e, n, t, s, a)
                            })), n.addEventListener("paste", (function(e) {
                                return u(e, n, t, s, a)
                            })), t.addEventListener("click", (function(n) {
                                return d(n, e, t, s, a)
                            }))
                        };
                    return c(), {
                        add: f,
                        getEmails: m
                    }
                }
            },
            770: function(e, t, n) {
                n(621);
                var i = n(224).isValidEmail,
                    r = n(438).generateRandomId;
                e.exports = function(e) {
                    var t = r(),
                        n = {
                            value: e
                        };
                    return n.isValid = i(e), n.id = t, {
                        newEntryEmail: n,
                        newDomEmail: function(e, t) {
                            var n = document.createElement("div");
                            n.classList.add("emailsEditor__email"), n.dataset.emailId = t, e.isValid ? n.classList.add("emailsEditor__email--tag") : n.classList.add("emailsEditor__email--error"), n.innerText = e.value;
                            var i = document.createElement("div");
                            return i.innerHTML = "<img src='../media/close.png'>", i.classList.add("emailsEditor__delete-button"), i.dataset.deleteIdentifierEmailId = t, n.appendChild(i), n
                        }(n, t)
                    }
                }
            },
            141: function(e, t, n) {
                var i = n(770),
                    r = n(438).findEmailIndex;
                e.exports = {
                    removeEntryEmailById: function(e, t, n, i, a) {
                        var d = t.querySelector("[data-email-id='".concat(e, "']"));
                        d && (n.removeChild(d), function(e, t, n) {
                            var i = r(t, e);
                            t.splice(i, 1), n && n(t)
                        }(e, i, a))
                    },
                    addNewEmailEntry: function(e, t, n, r, a) {
                        t.trim().split(",").forEach((function(t) {
                            var d = r.some((function(e) {
                                return t === e.value
                            }));
                            if (t && !d) {
                                var o = i(t, n),
                                    l = o.newDomEmail;
                                ! function(e, t, n) {
                                    t.push(e), n && n(t)
                                }(o.newEntryEmail, r, a), n.insertBefore(l, e)
                            }
                        })), e.value = ""
                    }
                }
            },
            872: function(e, t, n) {
                var i = n(141),
                    r = i.removeEntryEmailById,
                    a = i.addNewEmailEntry;
                e.exports = {
                    handleEmailListEvents: function(e, t, n, i, a) {
                        var d;
                        e.preventDefault();
                        var o = e.target,
                            l = null == o || null === (d = o.dataset) || void 0 === d ? void 0 : d.deleteIdentifierEmailId;
                        l && r(l, t, n, i, a)
                    },
                    handleInputEnterEvents: function(e, t, n, i, r) {
                        var d = t.value;
                        if (!d) return !1;
                        13 !== e.keyCode && 32 !== e.keyCode && 188 !== e.keyCode || (e.preventDefault(), a(t, d, n, i, r))
                    },
                    handleInputBlurEvents: function(e, t, n, i, r) {
                        e.preventDefault();
                        var d = t.value;
                        if (!d) return !1;
                        a(t, d, n, i, r)
                    },
                    handleInputPasteEvents: function(e, t, n, i, r) {
                        var d = (e.clipboardData || window.clipboardData).getData("Text");
                        a(t, d, n, i, r), e.preventDefault()
                    }
                }
            },
            130: function(e, t, n) {
                n(621), e.exports = {
                    renderEditorComponent: function(e) {
                        e.classList.add("emailsEditor");
                        var t = document.createElement("div");
                        t.classList.add("emailsEditor__list");
                        var n = document.createElement("input");
                        return n.classList.add("emailsEditor__input"), n.setAttribute("type","email"), n.autofocus = !0, n.placeholder = "", t.appendChild(n), e.appendChild(t), {
                            listDom: t,
                            inputDom: n
                        }
                    }
                }
            },
            438: function(e, t) {
                Object.defineProperty(t, "__esModule", {
                    value: !0
                }), t.findEmailIndex = t.generateRandomId = void 0, t.generateRandomId = function() {
                    var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null;
                    return e ? e + "-" + Math.random().toString(20).substr(2, 5) : Math.random().toString(20).substr(2, 5)
                }, t.findEmailIndex = function(e, t) {
                    if ("function" != typeof e.findIndex) {
                        var n = -1;
                        e.some((function(e, i) {
                            if (e.id == t) return n = i, !0
                        }))
                    } else n = e.findIndex((function(e) {
                        return e.id === t
                    }));
                    return n
                }
            },
            224: function(e, t) {
                Object.defineProperty(t, "__esModule", {
                    value: !0
                }), t.isValidEmail = void 0;
                var n = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                t.isValidEmail = function(e) {
                    return n.test(e)
                }
            },
            621: function(e, t, n) {
                n.r(t)
            }
        },
        t = {};

    function n(i) {
        if (t[i]) return t[i].exports;
        var r = t[i] = {
            exports: {}
        };
        return e[i](r, r.exports, n), r.exports
    }
    return n.r = function(e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }, n(352)
}();
var inputContainerNode = document.querySelector('#emails-input');
var onChange = function (emails) {}
var inputEmails = EmailsEditor(inputContainerNode, onChange);