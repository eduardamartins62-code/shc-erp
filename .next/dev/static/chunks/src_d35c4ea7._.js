(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/services/receivingApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLocations",
    ()=>getLocations,
    "getPurchaseOrders",
    ()=>getPurchaseOrders,
    "submitReceipt",
    ()=>submitReceipt
]);
// Mock POs
let mockPOs = [
    {
        id: 'PO-2024-0041',
        supplier: 'NutriLife Supplements',
        expectedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'overdue',
        items: [
            {
                id: 'poi-1',
                sku: 'NL-WHEY-CHOC',
                name: 'Whey Protein - Chocolate',
                expectedQty: 100,
                unit: 'ea',
                lotTracked: true
            },
            {
                id: 'poi-2',
                sku: 'NL-CREA-500',
                name: 'Creatine Monohydrate 500g',
                expectedQty: 50,
                unit: 'ea',
                lotTracked: true
            },
            {
                id: 'poi-3',
                sku: 'NL-SHAKER',
                name: 'NutriLife Shaker Bottle',
                expectedQty: 200,
                unit: 'ea',
                lotTracked: false
            }
        ]
    },
    {
        id: 'PO-2024-0045',
        supplier: 'Global Health Co.',
        expectedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        items: [
            {
                id: 'poi-4',
                sku: 'GH-VITA-C',
                name: 'Vitamin C 1000mg',
                expectedQty: 300,
                unit: 'btl',
                lotTracked: true
            },
            {
                id: 'poi-5',
                sku: 'GH-OMEGA-3',
                name: 'Omega 3 Fish Oil',
                expectedQty: 150,
                unit: 'btl',
                lotTracked: true
            }
        ]
    },
    {
        id: 'PO-2024-0048',
        supplier: 'EcoPack Solutions',
        expectedDate: new Date().toISOString(),
        status: 'partial',
        items: [
            {
                id: 'poi-6',
                sku: 'PKG-BOX-M',
                name: 'Shipping Box - Medium',
                expectedQty: 500,
                unit: 'box',
                lotTracked: false
            },
            {
                id: 'poi-7',
                sku: 'PKG-TAPE',
                name: 'Packing Tape 3"',
                expectedQty: 100,
                unit: 'roll',
                lotTracked: false
            }
        ]
    }
];
const mockLocations = [
    'Dock A',
    'Dock B',
    'Dock C',
    'Bay 1-A',
    'Bay 1-B',
    'Bay 2-A',
    'Bay 2-B',
    'Staging Area'
];
const getPurchaseOrders = async ()=>{
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve([
                ...mockPOs
            ]);
        }, 400);
    });
};
const getLocations = async ()=>{
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve([
                ...mockLocations
            ]);
        }, 200);
    });
};
const submitReceipt = async (session, lines, discrepancies)=>{
    return new Promise((resolve)=>{
        setTimeout(()=>{
            // Mock update PO status if PO linked
            if (session.mode === 'po' && session.poId) {
                const poIndex = mockPOs.findIndex((p)=>p.id === session.poId);
                if (poIndex !== -1) {
                    const po = mockPOs[poIndex];
                    // Check if fully received
                    let allFullyReceived = true;
                    for (const item of po.items){
                        const matchingLine = lines.find((l)=>l.itemId === item.id);
                        if (!matchingLine || !matchingLine.receivedQty || parseInt(matchingLine.receivedQty) < item.expectedQty) {
                            allFullyReceived = false;
                            break;
                        }
                    }
                    const newStatus = allFullyReceived ? 'received' : 'partial';
                    mockPOs[poIndex] = {
                        ...po,
                        status: newStatus
                    };
                    resolve({
                        success: true,
                        poid: po.id,
                        newStatus
                    });
                    return;
                }
            }
            resolve({
                success: true
            });
        }, 800);
    });
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/SlideOverPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SlideOverPanel",
    ()=>SlideOverPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature();
;
;
const SlideOverPanel = ({ isOpen, onClose, title, children, actions, hideHeader })=>{
    _s();
    // Close on escape key
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SlideOverPanel.useEffect": ()=>{
            const handleEscape = {
                "SlideOverPanel.useEffect.handleEscape": (e)=>{
                    if (e.key === 'Escape') onClose();
                }
            }["SlideOverPanel.useEffect.handleEscape"];
            if (isOpen) {
                window.addEventListener('keydown', handleEscape);
                document.body.style.overflow = 'hidden';
            }
            return ({
                "SlideOverPanel.useEffect": ()=>{
                    window.removeEventListener('keydown', handleEscape);
                    document.body.style.overflow = 'unset';
                }
            })["SlideOverPanel.useEffect"];
        }
    }["SlideOverPanel.useEffect"], [
        isOpen,
        onClose
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(30, 30, 30, 0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
            transition: 'opacity 0.3s ease-in-out'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    inset: 0
                },
                onClick: onClose,
                "aria-label": "Close slide over"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
                lineNumber: 43,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    backgroundColor: 'var(--color-white)',
                    width: '100%',
                    maxWidth: '600px',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    animation: 'slideInRight 0.3s ease-out'
                },
                children: [
                    !hideHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '1.5rem',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'var(--color-primary-dark)',
                            color: 'var(--color-white)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    margin: 0,
                                    fontSize: '1.25rem',
                                    color: 'var(--color-white)',
                                    fontWeight: 600
                                },
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
                                lineNumber: 74,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                },
                                children: [
                                    actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            gap: '0.5rem'
                                        },
                                        children: actions
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
                                        lineNumber: 79,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onClose,
                                        style: {
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--color-white)',
                                            opacity: 0.8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.25rem',
                                            borderRadius: '4px'
                                        },
                                        onMouseOver: (e)=>e.currentTarget.style.opacity = '1',
                                        onMouseOut: (e)=>e.currentTarget.style.opacity = '0.8',
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 24
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
                                            lineNumber: 99,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
                                        lineNumber: 83,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
                                lineNumber: 77,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
                        lineNumber: 65,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.5rem',
                            backgroundColor: 'var(--color-bg-light)'
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
                        lineNumber: 106,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
                lineNumber: 52,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
                    @keyframes slideInRight {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `
            }, void 0, false, {
                fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
                lineNumber: 116,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/SlideOverPanel.tsx",
        lineNumber: 34,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(SlideOverPanel, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = SlideOverPanel;
var _c;
__turbopack_context__.k.register(_c, "SlideOverPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/receiving/ReceivingList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/printer.js [app-client] (ecmascript) <export default as Printer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$SlideOverPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/SlideOverPanel.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const getStatusBadge = (status)=>{
    switch(status){
        case 'pending':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "badge badge-amber",
                children: "PENDING"
            }, void 0, false, {
                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                lineNumber: 23,
                columnNumber: 20
            }, ("TURBOPACK compile-time value", void 0));
        case 'partial':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "badge badge-amber",
                children: "PARTIAL"
            }, void 0, false, {
                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                lineNumber: 25,
                columnNumber: 20
            }, ("TURBOPACK compile-time value", void 0));
        case 'overdue':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "badge badge-red",
                children: "OVERDUE"
            }, void 0, false, {
                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                lineNumber: 27,
                columnNumber: 20
            }, ("TURBOPACK compile-time value", void 0));
        case 'received':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "badge badge-green",
                children: "RECEIVED"
            }, void 0, false, {
                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                lineNumber: 29,
                columnNumber: 20
            }, ("TURBOPACK compile-time value", void 0));
    }
};
const ReceivingList = ({ pos, loading, onStartPO, onStartManual, onStartBulk, selectedPOIds, setSelectedPOIds, drawerPO, setDrawerPO, onPrintSingle, onPrintMultiple })=>{
    _s();
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ReceivingList.useMemo[stats]": ()=>{
            return {
                open: pos.filter({
                    "ReceivingList.useMemo[stats]": (p)=>p.status === 'pending'
                }["ReceivingList.useMemo[stats]"]).length,
                overdue: pos.filter({
                    "ReceivingList.useMemo[stats]": (p)=>p.status === 'overdue'
                }["ReceivingList.useMemo[stats]"]).length,
                partial: pos.filter({
                    "ReceivingList.useMemo[stats]": (p)=>p.status === 'partial'
                }["ReceivingList.useMemo[stats]"]).length,
                total: pos.length
            };
        }
    }["ReceivingList.useMemo[stats]"], [
        pos
    ]);
    const filteredPOs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ReceivingList.useMemo[filteredPOs]": ()=>{
            if (!searchTerm) return pos;
            const lower = searchTerm.toLowerCase();
            return pos.filter({
                "ReceivingList.useMemo[filteredPOs]": (p)=>p.id.toLowerCase().includes(lower) || p.supplier.toLowerCase().includes(lower)
            }["ReceivingList.useMemo[filteredPOs]"]);
        }
    }["ReceivingList.useMemo[filteredPOs]"], [
        pos,
        searchTerm
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '24px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: 'var(--color-text-muted)',
                                    letterSpacing: '0.06em',
                                    marginBottom: '4px'
                                },
                                children: "Warehouse Operations"
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 60,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    letterSpacing: '-0.02em',
                                    color: 'var(--color-text-main)',
                                    margin: '0 0 4px 0'
                                },
                                children: "Receiving"
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 63,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: 'var(--color-text-muted)',
                                    fontSize: '14px',
                                    margin: 0
                                },
                                children: "Process inbound shipments against purchase orders or manually."
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 66,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 59,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn-primary",
                        onClick: onStartManual,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 74,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            "Manual Receiving"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 70,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                lineNumber: 58,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px'
                },
                children: [
                    {
                        label: 'Open POs',
                        value: stats.open,
                        color: 'var(--color-status-reserved)'
                    },
                    {
                        label: 'Overdue',
                        value: stats.overdue,
                        color: 'var(--color-status-expired)'
                    },
                    {
                        label: 'Partial',
                        value: stats.partial,
                        color: 'var(--color-status-reserved)'
                    },
                    {
                        label: 'Total POs',
                        value: stats.total,
                        color: 'var(--color-text-main)'
                    }
                ].map((stat, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: 'var(--color-text-muted)',
                                    letterSpacing: '0.06em',
                                    marginBottom: '8px'
                                },
                                children: stat.label
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 88,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: stat.color
                                },
                                children: stat.value
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 91,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, i, true, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 87,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                lineNumber: 80,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "table-container",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--color-border)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: 'var(--color-text-main)',
                                    margin: 0
                                },
                                children: "Purchase Orders"
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 101,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: 'relative',
                                    width: '280px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 16,
                                        color: "var(--color-text-muted)",
                                        style: {
                                            position: 'absolute',
                                            left: '12px',
                                            top: '10px'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                        lineNumber: 105,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search PO number or supplier...",
                                        value: searchTerm,
                                        onChange: (e)=>setSearchTerm(e.target.value),
                                        className: "form-control",
                                        style: {
                                            paddingLeft: '36px'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                        lineNumber: 106,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 104,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 100,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '60px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            size: 32,
                            color: "var(--color-shc-red)",
                            className: "animate-spin"
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                            lineNumber: 119,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 118,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        style: {
                            width: '100%',
                            borderCollapse: 'collapse'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                width: '40px',
                                                textAlign: 'center'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: filteredPOs.length > 0 && selectedPOIds.size === filteredPOs.length,
                                                ref: (input)=>{
                                                    if (input) {
                                                        input.indeterminate = selectedPOIds.size > 0 && selectedPOIds.size < filteredPOs.length;
                                                    }
                                                },
                                                onChange: (e)=>{
                                                    if (e.target.checked) {
                                                        setSelectedPOIds(new Set(filteredPOs.map((p)=>p.id)));
                                                    } else {
                                                        setSelectedPOIds(new Set());
                                                    }
                                                },
                                                style: {
                                                    accentColor: '#3B82F6',
                                                    width: '16px',
                                                    height: '16px',
                                                    cursor: 'pointer'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                lineNumber: 127,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 126,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "PO Number"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 145,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Supplier"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 146,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Expected"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 147,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Items"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 148,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Status"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 149,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'right'
                                            },
                                            children: "Action"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 150,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                    lineNumber: 125,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 124,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: filteredPOs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        colSpan: 6,
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: "No purchase orders found."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                        lineNumber: 158,
                                        columnNumber: 37
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                    lineNumber: 157,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0)) : filteredPOs.map((po)=>{
                                    const isSelected = selectedPOIds.has(po.id);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "po-row",
                                        style: isSelected ? {
                                            backgroundColor: 'rgba(59, 130, 246, 0.06)',
                                            borderLeft: '3px solid #3B82F6'
                                        } : {},
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'center'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: isSelected,
                                                    onChange: (e)=>{
                                                        const newSet = new Set(selectedPOIds);
                                                        if (e.target.checked) newSet.add(po.id);
                                                        else newSet.delete(po.id);
                                                        setSelectedPOIds(newSet);
                                                    },
                                                    style: {
                                                        accentColor: '#3B82F6',
                                                        width: '16px',
                                                        height: '16px',
                                                        cursor: 'pointer'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                    lineNumber: 171,
                                                    columnNumber: 49
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                lineNumber: 170,
                                                columnNumber: 45
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    fontFamily: "'DM Mono', 'Courier New', monospace"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: '#60A5FA',
                                                        textDecoration: 'underline',
                                                        textDecorationStyle: 'dotted',
                                                        cursor: 'pointer'
                                                    },
                                                    onClick: (e)=>{
                                                        e.stopPropagation();
                                                        setDrawerPO(po);
                                                    },
                                                    onMouseOver: (e)=>e.currentTarget.style.color = '#93C5FD',
                                                    onMouseOut: (e)=>e.currentTarget.style.color = '#60A5FA',
                                                    children: po.id
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                    lineNumber: 184,
                                                    columnNumber: 49
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                lineNumber: 183,
                                                columnNumber: 45
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    color: 'var(--color-text-main)',
                                                    fontWeight: 500
                                                },
                                                children: po.supplier
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                lineNumber: 193,
                                                columnNumber: 45
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: new Date(po.expectedDate).toLocaleDateString()
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                lineNumber: 194,
                                                columnNumber: 45
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: po.items.length
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                lineNumber: 195,
                                                columnNumber: 45
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: getStatusBadge(po.status)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                lineNumber: 196,
                                                columnNumber: 45
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "btn-secondary",
                                                    onClick: ()=>onStartPO(po),
                                                    children: "Receive"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                    lineNumber: 198,
                                                    columnNumber: 49
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                lineNumber: 197,
                                                columnNumber: 45
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, po.id, true, {
                                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                        lineNumber: 166,
                                        columnNumber: 41
                                    }, ("TURBOPACK compile-time value", void 0));
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 155,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 122,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                lineNumber: 99,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            selectedPOIds.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    bottom: '28px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#0D1117',
                    border: '1px solid #1F2937',
                    borderRadius: '14px',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    minWidth: '480px',
                    zIndex: 40,
                    animation: 'slideUp 0.2s ease-out'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                        children: `
                        @keyframes slideUp {
                            from { transform: translate(-50%, 12px); opacity: 0; }
                            to { transform: translate(-50%, 0); opacity: 1; }
                        }
                        `
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 233,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: '#3B82F6',
                            borderRadius: '8px',
                            padding: '4px 12px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'white'
                        },
                        children: [
                            selectedPOIds.size,
                            " PO",
                            selectedPOIds.size === 1 ? '' : 's',
                            " selected"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 241,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: '1px',
                            height: '20px',
                            background: '#1F2937'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 252,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        style: {
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        },
                        onClick: onStartBulk,
                        children: "Receive Selected →"
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 254,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        style: {
                            background: 'transparent',
                            color: '#D1D5DB',
                            border: 'none',
                            padding: '6px 12px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        },
                        onClick: ()=>onPrintMultiple(selectedPOIds),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__["Printer"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 273,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            " Print Selected"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 265,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: '1px',
                            height: '20px',
                            background: '#1F2937'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 276,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        style: {
                            background: 'transparent',
                            color: '#6B7280',
                            border: 'none',
                            padding: '6px 12px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        },
                        onClick: ()=>setSelectedPOIds(new Set()),
                        onMouseOver: (e)=>e.currentTarget.style.color = '#F9FAFB',
                        onMouseOut: (e)=>e.currentTarget.style.color = '#6B7280',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                lineNumber: 288,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            " Clear"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                        lineNumber: 278,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                lineNumber: 216,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$SlideOverPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SlideOverPanel"], {
                isOpen: !!drawerPO,
                onClose: ()=>setDrawerPO(null),
                title: "",
                hideHeader: true,
                children: drawerPO && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        paddingBottom: '24px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '18px',
                                                fontWeight: 700,
                                                fontFamily: "'DM Mono', 'Courier New', monospace",
                                                color: '#60A5FA'
                                            },
                                            children: drawerPO.id
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 305,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setDrawerPO(null),
                                            style: {
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#6B7280',
                                                cursor: 'pointer'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                size: 20
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                lineNumber: 312,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 308,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                    lineNumber: 304,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '4px'
                                    },
                                    children: [
                                        getStatusBadge(drawerPO.status),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: 'var(--color-text-main)',
                                                fontWeight: 500
                                            },
                                            children: drawerPO.supplier
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 317,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                    lineNumber: 315,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: '13px',
                                        color: 'var(--color-text-muted)'
                                    },
                                    children: [
                                        "Expected: ",
                                        new Date(drawerPO.expectedDate).toLocaleDateString()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                    lineNumber: 319,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                            lineNumber: 303,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'minmax(0, 1fr)',
                                gap: '12px'
                            },
                            children: [
                                {
                                    label: 'Supplier',
                                    value: drawerPO.supplier
                                },
                                {
                                    label: 'Expected Date',
                                    value: new Date(drawerPO.expectedDate).toLocaleDateString()
                                },
                                {
                                    label: 'PO Status',
                                    value: getStatusBadge(drawerPO.status)
                                },
                                {
                                    label: 'Total Items',
                                    value: drawerPO.items.length
                                },
                                {
                                    label: 'Total Units Expected',
                                    value: drawerPO.items.reduce((s, i)=>s + i.expectedQty, 0)
                                },
                                {
                                    label: 'Created',
                                    value: new Date(drawerPO.expectedDate).toLocaleDateString()
                                } // Mock
                            ].map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingBottom: '8px',
                                        borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: 'var(--color-text-muted)',
                                                fontSize: '11px',
                                                textTransform: 'uppercase'
                                            },
                                            children: row.label
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 335,
                                            columnNumber: 37
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: 'var(--color-text-main)',
                                                fontSize: '13px',
                                                fontWeight: 500
                                            },
                                            children: row.value
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 336,
                                            columnNumber: 37
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, i, true, {
                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                    lineNumber: 334,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0)))
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                            lineNumber: 325,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        color: 'var(--color-text-muted)',
                                        marginBottom: '12px',
                                        letterSpacing: '0.05em'
                                    },
                                    children: "Line Items"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                    lineNumber: 343,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    style: {
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '13px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            textAlign: 'left',
                                                            paddingBottom: '8px',
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: '10px',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 600
                                                        },
                                                        children: "SKU"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                        lineNumber: 349,
                                                        columnNumber: 41
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            textAlign: 'left',
                                                            paddingBottom: '8px',
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: '10px',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 600
                                                        },
                                                        children: "Product"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                        lineNumber: 350,
                                                        columnNumber: 41
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            textAlign: 'right',
                                                            paddingBottom: '8px',
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: '10px',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 600
                                                        },
                                                        children: "Qty"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                        lineNumber: 351,
                                                        columnNumber: 41
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            textAlign: 'center',
                                                            paddingBottom: '8px',
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: '10px',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 600
                                                        },
                                                        children: "Unit"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                        lineNumber: 352,
                                                        columnNumber: 41
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            textAlign: 'center',
                                                            paddingBottom: '8px',
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: '10px',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 600
                                                        },
                                                        children: "Lot Tracked"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                        lineNumber: 353,
                                                        columnNumber: 41
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                lineNumber: 348,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 347,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: drawerPO.items.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    style: {
                                                        borderBottom: '1px solid var(--color-border)'
                                                    },
                                                    onMouseOver: (e)=>e.currentTarget.style.backgroundColor = 'var(--color-bg-light)',
                                                    onMouseOut: (e)=>e.currentTarget.style.backgroundColor = 'transparent',
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '8px 0',
                                                                fontFamily: 'monospace',
                                                                color: 'var(--color-primary-dark)'
                                                            },
                                                            children: item.sku
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                            lineNumber: 359,
                                                            columnNumber: 45
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '8px 0',
                                                                color: 'var(--color-text-main)'
                                                            },
                                                            children: item.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                            lineNumber: 360,
                                                            columnNumber: 45
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '8px 0',
                                                                color: 'var(--color-text-dark)',
                                                                fontWeight: 600,
                                                                textAlign: 'right'
                                                            },
                                                            children: item.expectedQty
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                            lineNumber: 361,
                                                            columnNumber: 45
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '8px 0',
                                                                color: 'var(--color-text-muted)',
                                                                textAlign: 'center'
                                                            },
                                                            children: item.unit
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                            lineNumber: 362,
                                                            columnNumber: 45
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '8px 0',
                                                                textAlign: 'center'
                                                            },
                                                            children: item.lotTracked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    background: 'rgba(168, 85, 247, 0.1)',
                                                                    color: '#7c3aed',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '10px',
                                                                    fontWeight: 700
                                                                },
                                                                children: "YES"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                                lineNumber: 365,
                                                                columnNumber: 53
                                                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    color: 'var(--color-text-muted)'
                                                                },
                                                                children: "—"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                                lineNumber: 366,
                                                                columnNumber: 53
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                            lineNumber: 363,
                                                            columnNumber: 45
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, idx, true, {
                                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                                    lineNumber: 358,
                                                    columnNumber: 41
                                                }, ("TURBOPACK compile-time value", void 0)))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 356,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                    lineNumber: 346,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                            lineNumber: 342,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                paddingTop: '24px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    style: {
                                        width: '100%',
                                        background: '#3B82F6',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    },
                                    onClick: ()=>{
                                        setDrawerPO(null);
                                        onStartPO(drawerPO);
                                    },
                                    children: "Receive This PO →"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                    lineNumber: 376,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    style: {
                                        width: '100%',
                                        background: 'transparent',
                                        color: 'var(--color-text-main)',
                                        border: '1px solid var(--color-border)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    },
                                    onClick: ()=>onPrintSingle(drawerPO),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__["Printer"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                            lineNumber: 396,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        " Print PO"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                                    lineNumber: 388,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                            lineNumber: 375,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                    lineNumber: 301,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/receiving/ReceivingList.tsx",
                lineNumber: 294,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/receiving/ReceivingList.tsx",
        lineNumber: 56,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ReceivingList, "J9I1vmZmIpNQjNTf4x0iERDnlKQ=");
_c = ReceivingList;
const __TURBOPACK__default__export__ = ReceivingList;
var _c;
__turbopack_context__.k.register(_c, "ReceivingList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/receiving/LineItemRow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-client] (ecmascript) <export default as GitBranch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
;
;
const LineItemRow = ({ line, mode, index, locations, sessionLocation, onChange, onRemove })=>{
    const parsedQty = parseInt(line.receivedQty) || 0;
    const isValidQty = !isNaN(parseInt(line.receivedQty));
    const hasDiscrepancy = (mode === 'po' || mode === 'bulk') && line.expectedQty !== null && line.receivedQty !== '' && isValidQty && parsedQty !== line.expectedQty;
    const delta = hasDiscrepancy && line.expectedQty !== null ? parsedQty - line.expectedQty : 0;
    const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
    const rowBorderLeft = hasDiscrepancy ? '3px solid var(--color-status-expired)' : '3px solid transparent';
    const colSpan = mode === 'manual' ? 8 : 7;
    const handleAddSplit = ()=>{
        const newSplit = {
            id: `split-${Date.now()}`,
            location: locations[0] || '',
            qty: ''
        };
        onChange(index, 'locationSplits', [
            ...line.locationSplits,
            newSplit
        ]);
    };
    const handleRemoveSplit = (splitId)=>{
        const newSplits = line.locationSplits.filter((s)=>s.id !== splitId);
        onChange(index, 'locationSplits', newSplits);
    };
    const handleSplitChange = (splitId, field, value)=>{
        const newSplits = line.locationSplits.map((s)=>s.id === splitId ? {
                ...s,
                [field]: value
            } : s);
        onChange(index, 'locationSplits', newSplits);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                style: {
                    background: 'var(--color-bg-light)',
                    borderBottom: line.locationSplits.length > 0 ? 'none' : '1px solid var(--color-border)',
                    borderLeft: rowBorderLeft,
                    transition: 'background-color 0.15s ease'
                },
                onMouseOver: (e)=>e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)',
                onMouseOut: (e)=>e.currentTarget.style.backgroundColor = 'var(--color-bg-light)',
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                        style: {
                            padding: '8px 10px',
                            verticalAlign: 'middle',
                            overflow: 'hidden'
                        },
                        children: mode === 'manual' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "SKU...",
                            value: line.sku,
                            onChange: (e)=>onChange(index, 'sku', e.target.value),
                            style: {
                                width: '100%',
                                fontSize: '13px',
                                padding: '6px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 72,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: "'DM Mono', 'Courier New', monospace",
                                color: '#3b82f6',
                                fontSize: '12px',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                userSelect: 'all',
                                cursor: 'text'
                            },
                            children: line.sku || 'N/A'
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 80,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                        lineNumber: 70,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                        style: {
                            padding: '8px 10px',
                            verticalAlign: 'middle',
                            overflow: 'hidden'
                        },
                        children: mode === 'manual' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Product Name...",
                            value: line.name,
                            onChange: (e)=>onChange(index, 'name', e.target.value),
                            style: {
                                width: '100%',
                                fontSize: '13px',
                                padding: '6px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                fontWeight: 500
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 89,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontWeight: 600,
                                        color: 'var(--color-text-main)',
                                        fontSize: '13px'
                                    },
                                    children: line.name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                    lineNumber: 98,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                line.lotTracked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '10px',
                                        color: 'var(--color-text-muted)',
                                        fontWeight: 700,
                                        letterSpacing: '0.05em'
                                    },
                                    children: "LOT TRACKED"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                    lineNumber: 100,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 97,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                        lineNumber: 87,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                        style: {
                            padding: '8px 10px',
                            verticalAlign: 'middle'
                        },
                        children: (mode === 'po' || mode === 'bulk') && line.expectedQty !== null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: '13px',
                                color: 'var(--color-text-main)',
                                fontWeight: 500
                            },
                            children: [
                                line.expectedQty,
                                " ",
                                line.unit
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 109,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: 'var(--color-text-muted)',
                                fontSize: '13px'
                            },
                            children: "—"
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 113,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                        lineNumber: 107,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                        style: {
                            padding: '8px 10px',
                            verticalAlign: 'middle'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "number",
                            min: "0",
                            placeholder: "Qty",
                            value: line.receivedQty,
                            onChange: (e)=>{
                                const val = e.target.value;
                                onChange(index, 'receivedQty', val);
                                if ((mode === 'po' || mode === 'bulk') && line.expectedQty !== null) {
                                    const parsed = parseInt(val);
                                    if (val === '' || !isNaN(parsed) && parsed === line.expectedQty) {
                                        onChange(index, 'discrepancyAction', null);
                                        onChange(index, 'discrepancyNote', '');
                                    }
                                }
                            },
                            style: {
                                width: '100%',
                                minWidth: 0,
                                fontSize: '13px',
                                fontWeight: 600,
                                padding: '5px 4px',
                                border: hasDiscrepancy ? '2px solid var(--color-status-expired)' : '1px solid var(--color-border)',
                                borderRadius: '6px',
                                outline: 'none',
                                textAlign: 'center',
                                boxSizing: 'border-box'
                            },
                            onFocus: (e)=>e.target.style.borderColor = hasDiscrepancy ? 'var(--color-status-expired)' : 'var(--color-primary)',
                            onBlur: (e)=>e.target.style.borderColor = hasDiscrepancy ? 'var(--color-status-expired)' : 'var(--color-border)'
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 119,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                        lineNumber: 118,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                        style: {
                            padding: '8px 10px',
                            verticalAlign: 'middle'
                        },
                        children: line.lotTracked || mode === 'manual' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Lot #",
                            value: line.lot,
                            onChange: (e)=>onChange(index, 'lot', e.target.value),
                            style: {
                                width: '100%',
                                fontSize: '13px',
                                padding: '6px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                fontFamily: "'DM Mono', 'Courier New', monospace"
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 155,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: 'var(--color-text-muted)',
                                fontSize: '13px'
                            },
                            children: "—"
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 167,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                        lineNumber: 153,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                        style: {
                            padding: '8px 10px',
                            verticalAlign: 'middle'
                        },
                        children: line.lotTracked || mode === 'manual' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "date",
                            value: line.expDate,
                            onChange: (e)=>onChange(index, 'expDate', e.target.value),
                            style: {
                                width: '100%',
                                minWidth: 0,
                                fontSize: '12px',
                                padding: '5px 4px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 174,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: 'var(--color-text-muted)',
                                fontSize: '13px'
                            },
                            children: "—"
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 181,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                        lineNumber: 172,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                        style: {
                            padding: '8px 10px',
                            verticalAlign: 'middle'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: line.locationOverride || '',
                                onChange: (e)=>onChange(index, 'locationOverride', e.target.value || undefined),
                                style: {
                                    width: '100%',
                                    fontSize: '12px',
                                    padding: '5px 6px',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '4px',
                                    background: line.locationOverride ? 'var(--color-white)' : 'transparent',
                                    color: line.locationOverride ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                    outline: 'none',
                                    cursor: 'pointer'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: [
                                            "↳ ",
                                            sessionLocation || 'default'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                        lineNumber: 202,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    locations.map((loc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: loc,
                                            children: loc
                                        }, loc, false, {
                                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                            lineNumber: 204,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                lineNumber: 187,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleAddSplit,
                                style: {
                                    marginTop: '4px',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '11px',
                                    color: 'var(--color-text-muted)'
                                },
                                onMouseOver: (e)=>e.currentTarget.style.color = '#3B82F6',
                                onMouseOut: (e)=>{
                                    e.currentTarget.style.color = 'var(--color-text-muted)';
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__["GitBranch"], {
                                        size: 10
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                        lineNumber: 225,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    "Split"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                lineNumber: 208,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                        lineNumber: 186,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    mode === 'manual' && onRemove && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                        style: {
                            padding: '8px 4px',
                            verticalAlign: 'middle',
                            width: '36px'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>onRemove(index),
                            style: {
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            },
                            onMouseOver: (e)=>{
                                e.currentTarget.style.color = 'var(--color-status-expired)';
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            },
                            onMouseOut: (e)=>{
                                e.currentTarget.style.color = 'var(--color-text-muted)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                lineNumber: 246,
                                columnNumber: 29
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 233,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                        lineNumber: 232,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                lineNumber: 59,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            line.locationSplits.map((split, splitIdx)=>{
                const isLastSplit = splitIdx === line.locationSplits.length - 1;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                    style: {
                        background: 'rgba(59, 130, 246, 0.03)',
                        borderBottom: isLastSplit && !hasDiscrepancy ? '1px solid var(--color-border)' : 'none',
                        borderLeft: '3px solid #3B82F6'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: {
                                padding: '6px 10px',
                                textAlign: 'center',
                                color: '#93C5FD',
                                fontSize: '14px',
                                verticalAlign: 'middle'
                            },
                            children: "↳"
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 262,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {}, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 264,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {}, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 266,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: {
                                padding: '6px 10px',
                                verticalAlign: 'middle'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: "0",
                                placeholder: "Qty",
                                value: split.qty,
                                onChange: (e)=>handleSplitChange(split.id, 'qty', e.target.value === '' ? '' : Number(e.target.value)),
                                style: {
                                    width: '100%',
                                    minWidth: 0,
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    padding: '5px 4px',
                                    border: '1px solid #93C5FD',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                },
                                onFocus: (e)=>e.target.style.borderColor = '#3B82F6',
                                onBlur: (e)=>e.target.style.borderColor = '#93C5FD'
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                lineNumber: 269,
                                columnNumber: 29
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 268,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {}, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 292,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {}, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 294,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: {
                                padding: '6px 10px',
                                verticalAlign: 'middle'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: split.location,
                                        onChange: (e)=>handleSplitChange(split.id, 'location', e.target.value),
                                        style: {
                                            flex: 1,
                                            fontSize: '12px',
                                            padding: '5px 6px',
                                            border: '1px solid #93C5FD',
                                            borderRadius: '4px',
                                            background: 'var(--color-white)',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        },
                                        children: locations.map((loc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: loc,
                                                children: loc
                                            }, loc, false, {
                                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                                lineNumber: 313,
                                                columnNumber: 41
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                        lineNumber: 298,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleRemoveSplit(split.id),
                                        style: {
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#93C5FD',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexShrink: 0
                                        },
                                        onMouseOver: (e)=>{
                                            e.currentTarget.style.color = 'var(--color-status-expired)';
                                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                        },
                                        onMouseOut: (e)=>{
                                            e.currentTarget.style.color = '#93C5FD';
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                            lineNumber: 332,
                                            columnNumber: 37
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                        lineNumber: 316,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                lineNumber: 297,
                                columnNumber: 29
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 296,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        mode === 'manual' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {}, void 0, false, {
                            fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                            lineNumber: 337,
                            columnNumber: 47
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, split.id, true, {
                    fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                    lineNumber: 256,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0));
            }),
            hasDiscrepancy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                    colSpan: colSpan,
                    style: {
                        padding: 0,
                        border: 'none'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'rgba(239, 68, 68, 0.04)',
                            borderLeft: '3px solid var(--color-status-expired)',
                            borderBottom: '1px solid var(--color-border)',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: 'var(--color-status-expired)',
                                    fontWeight: 600,
                                    fontSize: '13px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                        lineNumber: 356,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    deltaStr,
                                    " units vs expected"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                lineNumber: 355,
                                columnNumber: 29
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '13px',
                                            cursor: 'pointer'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "radio",
                                                checked: line.discrepancyAction === 'accept',
                                                onChange: ()=>onChange(index, 'discrepancyAction', 'accept'),
                                                style: {
                                                    accentColor: 'var(--color-status-good)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                                lineNumber: 362,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Accept"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                        lineNumber: 361,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '13px',
                                            cursor: 'pointer'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "radio",
                                                checked: line.discrepancyAction === 'flag',
                                                onChange: ()=>onChange(index, 'discrepancyAction', 'flag'),
                                                style: {
                                                    accentColor: 'var(--color-status-reserved)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                                lineNumber: 366,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Flag"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                        lineNumber: 365,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '13px',
                                            cursor: 'pointer'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "radio",
                                                checked: line.discrepancyAction === 'reject',
                                                onChange: ()=>onChange(index, 'discrepancyAction', 'reject'),
                                                style: {
                                                    accentColor: 'var(--color-status-expired)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                                lineNumber: 370,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Reject"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                        lineNumber: 369,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                lineNumber: 360,
                                columnNumber: 29
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "Note regarding discrepancy...",
                                    value: line.discrepancyNote,
                                    onChange: (e)=>onChange(index, 'discrepancyNote', e.target.value),
                                    style: {
                                        width: '100%',
                                        fontSize: '13px',
                                        padding: '6px 8px',
                                        border: '1px solid var(--color-status-expired)',
                                        borderRadius: '4px',
                                        background: 'var(--color-white)',
                                        color: 'var(--color-text-main)',
                                        outlineColor: 'var(--color-status-expired)'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                    lineNumber: 376,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                                lineNumber: 375,
                                columnNumber: 29
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                        lineNumber: 346,
                        columnNumber: 25
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                    lineNumber: 345,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/receiving/LineItemRow.tsx",
                lineNumber: 344,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/receiving/LineItemRow.tsx",
        lineNumber: 57,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_c = LineItemRow;
const __TURBOPACK__default__export__ = LineItemRow;
var _c;
__turbopack_context__.k.register(_c, "LineItemRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/receiving/ReceivingSession.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$receiving$2f$LineItemRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/receiving/LineItemRow.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$receivingApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/receivingApi.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
const generateReceiptNumber = ()=>`RCV-${String(Date.now()).slice(-6)}`;
const ReceivingSession = ({ mode, selectedPO, selectedPOs, locations, onBack, onSuccess })=>{
    _s();
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        receiptNumber: generateReceiptNumber(),
        receivedDate: new Date().toISOString().split('T')[0],
        location: '',
        notes: '',
        mode,
        poId: selectedPO?.id || null
    });
    const [lines, setLines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ReceivingSession.useState": ()=>{
            if (mode === 'bulk' && selectedPOs) {
                return selectedPOs.flatMap({
                    "ReceivingSession.useState": (po)=>po.items.map({
                            "ReceivingSession.useState": (item)=>({
                                    itemId: `${po.id}-${item.id}`,
                                    sku: item.sku,
                                    name: item.name,
                                    expectedQty: item.expectedQty,
                                    receivedQty: '',
                                    unit: item.unit,
                                    lot: '',
                                    expDate: '',
                                    discrepancyAction: null,
                                    discrepancyNote: '',
                                    lotTracked: item.lotTracked,
                                    locationSplits: [],
                                    poId: po.id,
                                    supplierName: po.supplier
                                })
                        }["ReceivingSession.useState"])
                }["ReceivingSession.useState"]);
            } else if (mode === 'po' && selectedPO) {
                return selectedPO.items.map({
                    "ReceivingSession.useState": (item)=>({
                            itemId: item.id,
                            sku: item.sku,
                            name: item.name,
                            expectedQty: item.expectedQty,
                            receivedQty: '',
                            unit: item.unit,
                            lot: '',
                            expDate: '',
                            discrepancyAction: null,
                            discrepancyNote: '',
                            lotTracked: item.lotTracked,
                            locationSplits: [],
                            poId: selectedPO.id,
                            supplierName: selectedPO.supplier
                        })
                }["ReceivingSession.useState"]);
            } else {
                return [
                    {
                        itemId: `manual-${Date.now()}`,
                        sku: '',
                        name: '',
                        expectedQty: null,
                        receivedQty: '',
                        unit: 'ea',
                        lot: '',
                        expDate: '',
                        discrepancyAction: null,
                        discrepancyNote: '',
                        lotTracked: false,
                        locationSplits: [],
                        poId: null,
                        supplierName: null
                    }
                ];
            }
        }
    }["ReceivingSession.useState"]);
    const handleSessionChange = (field, value)=>{
        setSession((prev)=>({
                ...prev,
                [field]: value
            }));
    };
    const handleLineChange = (index, field, value)=>{
        setLines((prev)=>{
            const newLines = [
                ...prev
            ];
            newLines[index] = {
                ...newLines[index],
                [field]: value
            };
            return newLines;
        });
    };
    const handleAddLine = ()=>{
        setLines((prev)=>[
                ...prev,
                {
                    itemId: `manual-${Date.now()}`,
                    sku: '',
                    name: '',
                    expectedQty: null,
                    receivedQty: '',
                    unit: 'ea',
                    lot: '',
                    expDate: '',
                    discrepancyAction: null,
                    discrepancyNote: '',
                    lotTracked: false,
                    locationSplits: [],
                    poId: null,
                    supplierName: null
                }
            ]);
    };
    const handleRemoveLine = (index)=>{
        setLines((prev)=>prev.filter((_, i)=>i !== index));
    };
    const isDiscrepant = (line)=>{
        if (line.expectedQty === null || line.receivedQty === '') return false;
        const received = parseInt(line.receivedQty);
        if (isNaN(received)) return false;
        return received !== line.expectedQty;
    };
    const totalUnits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ReceivingSession.useMemo[totalUnits]": ()=>{
            return lines.reduce({
                "ReceivingSession.useMemo[totalUnits]": (sum, line)=>{
                    const qty = parseInt(line.receivedQty);
                    return sum + (isNaN(qty) ? 0 : qty);
                }
            }["ReceivingSession.useMemo[totalUnits]"], 0);
        }
    }["ReceivingSession.useMemo[totalUnits]"], [
        lines
    ]);
    const discrepantLines = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ReceivingSession.useMemo[discrepantLines]": ()=>{
            return lines.filter(isDiscrepant);
        }
    }["ReceivingSession.useMemo[discrepantLines]"], [
        lines
    ]);
    const hasUnresolvedDiscrepancies = discrepantLines.some((l)=>l.discrepancyAction === null);
    const hasEmptyQuantities = lines.some((l)=>l.receivedQty === '');
    const hasEmptyLocations = session.location === '';
    const isSubmitDisabled = hasEmptyQuantities || hasUnresolvedDiscrepancies || hasEmptyLocations || isSubmitting;
    const handleSubmit = async ()=>{
        if (isSubmitDisabled) return;
        setIsSubmitting(true);
        const discrepancies = discrepantLines.map((line)=>({
                receiptNumber: session.receiptNumber,
                poId: session.poId,
                sku: line.sku,
                productName: line.name,
                expectedQty: line.expectedQty,
                receivedQty: parseInt(line.receivedQty),
                delta: parseInt(line.receivedQty) - line.expectedQty,
                action: line.discrepancyAction,
                note: line.discrepancyNote,
                timestamp: new Date().toISOString()
            }));
        const generatedMovements = lines.map((line)=>({
                sku: line.sku,
                qty: parseInt(line.receivedQty) || 0,
                location: line.locationOverride || session.location,
                lot: line.lot,
                expDate: line.expDate
            }));
        console.log('--- GENERATED INVENTORY MOVEMENTS ---', generatedMovements);
        try {
            if (mode === 'bulk' && selectedPOs) {
                // Post individual receipt per PO
                let totalDiscrepancies = 0;
                for(let i = 0; i < selectedPOs.length; i++){
                    const po = selectedPOs[i];
                    const poLines = lines.filter((l)=>l.poId === po.id);
                    const poDiscrepantLines = poLines.filter(isDiscrepant);
                    const receiptNumber = `${session.receiptNumber}-${i + 1}`;
                    const poSession = {
                        ...session,
                        receiptNumber,
                        poId: po.id
                    };
                    const poDiscrepancies = poDiscrepantLines.map((line)=>({
                            receiptNumber,
                            poId: po.id,
                            sku: line.sku,
                            productName: line.name,
                            expectedQty: line.expectedQty,
                            receivedQty: parseInt(line.receivedQty),
                            delta: parseInt(line.receivedQty) - line.expectedQty,
                            action: line.discrepancyAction,
                            note: line.discrepancyNote,
                            timestamp: new Date().toISOString()
                        }));
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$receivingApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["submitReceipt"])(poSession, poLines, poDiscrepancies);
                    totalDiscrepancies += poDiscrepancies.length;
                }
                onSuccess(session.receiptNumber + " (Bulk)", totalDiscrepancies);
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$receivingApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["submitReceipt"])(session, lines, discrepancies);
                onSuccess(session.receiptNumber, discrepancies.length);
            }
        } catch (error) {
            console.error('Error submitting the receipt', error);
            setIsSubmitting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: '32px',
                    background: 'var(--color-bg-light)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '24px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onBack,
                        style: {
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            padding: '0',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            marginBottom: '20px',
                            transition: 'all 0.2s',
                            fontWeight: 500
                        },
                        onMouseOver: (e)=>{
                            e.currentTarget.style.color = 'var(--color-charcoal)';
                        },
                        onMouseOut: (e)=>{
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                lineNumber: 253,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            " Back"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                        lineNumber: 230,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '24px'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        color: 'var(--color-text-muted)',
                                        letterSpacing: '0.06em',
                                        marginBottom: '8px'
                                    },
                                    children: [
                                        mode === 'po' ? `PO RECEIVING — ${selectedPO?.id}` : mode === 'bulk' ? `BULK RECEIVING — ${selectedPOs?.length} POs` : 'MANUAL RECEIVING',
                                        mode === 'po' && selectedPO && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                marginLeft: '12px',
                                                color: 'var(--color-text-main)'
                                            },
                                            children: selectedPO.supplier
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                            lineNumber: 260,
                                            columnNumber: 61
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                    lineNumber: 258,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    style: {
                                        fontSize: '28px',
                                        fontWeight: 'bold',
                                        letterSpacing: '-0.02em',
                                        color: 'var(--color-text-main)',
                                        margin: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px'
                                    },
                                    children: [
                                        session.receiptNumber,
                                        mode === 'po' && selectedPO && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: selectedPO.status === 'overdue' ? 'var(--color-status-expired)' : selectedPO.status === 'pending' ? 'var(--color-status-reserved)' : '#3B82F6',
                                                backgroundColor: selectedPO.status === 'overdue' ? 'rgba(193, 39, 45, 0.1)' : selectedPO.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                padding: '4px 10px',
                                                borderRadius: '9999px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            },
                                            children: selectedPO.status
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                            lineNumber: 265,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                    lineNumber: 262,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                            lineNumber: 257,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                        lineNumber: 256,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1px',
                            background: 'var(--color-border)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--color-border)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'var(--color-white)',
                                    padding: '16px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            display: 'block',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-muted)',
                                            letterSpacing: '0.06em',
                                            marginBottom: '8px'
                                        },
                                        children: "RECEIVED DATE"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 284,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: session.receivedDate,
                                        onChange: (e)=>handleSessionChange('receivedDate', e.target.value),
                                        style: {
                                            width: '100%',
                                            border: 'none',
                                            background: 'transparent',
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            color: 'var(--color-text-main)',
                                            outline: 'none'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 287,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                lineNumber: 283,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'var(--color-white)',
                                    padding: '16px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            display: 'block',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-muted)',
                                            letterSpacing: '0.06em',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            "RECEIVING LOCATION ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: 'var(--color-shc-red)'
                                                },
                                                children: "*"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 296,
                                                columnNumber: 48
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 295,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: session.location,
                                        onChange: (e)=>handleSessionChange('location', e.target.value),
                                        style: {
                                            width: '100%',
                                            border: 'none',
                                            background: 'transparent',
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            color: session.location ? 'var(--color-text-main)' : 'var(--color-status-expired)',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                disabled: true,
                                                children: "Select location..."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 306,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            locations.map((loc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: loc,
                                                    children: loc
                                                }, loc, false, {
                                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                    lineNumber: 308,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 298,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                lineNumber: 294,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                        lineNumber: 282,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                lineNumber: 229,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    alignItems: 'flex-start'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: '1 1 500px',
                            minWidth: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginBottom: '24px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '16px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                style: {
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    color: 'var(--color-text-main)',
                                                    margin: 0
                                                },
                                                children: mode === 'po' && selectedPO ? `Line Items — ${selectedPO.supplier}` : 'Line Items'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 323,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            discrepantLines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    color: 'var(--color-status-expired)',
                                                    fontSize: '13px',
                                                    fontWeight: 500
                                                },
                                                children: [
                                                    "⚠ ",
                                                    discrepantLines.length,
                                                    " discrepanc",
                                                    discrepantLines.length === 1 ? 'y' : 'ies',
                                                    " require action"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 327,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 322,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: 'var(--color-bg-light)',
                                            borderRadius: '8px',
                                            border: '1px solid var(--color-border)',
                                            overflow: 'hidden'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                style: {
                                                    width: '100%',
                                                    borderCollapse: 'collapse',
                                                    tableLayout: 'fixed'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            style: {
                                                                background: 'var(--color-bg-subtle)'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '8px 10px',
                                                                        textAlign: 'left',
                                                                        fontSize: '10px',
                                                                        textTransform: 'uppercase',
                                                                        color: 'rgba(255,255,255,0.85)',
                                                                        letterSpacing: '0.07em',
                                                                        borderBottom: '1px solid rgba(255,255,255,0.15)',
                                                                        width: '12%'
                                                                    },
                                                                    children: "SKU"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                    lineNumber: 338,
                                                                    columnNumber: 41
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '8px 10px',
                                                                        textAlign: 'left',
                                                                        fontSize: '10px',
                                                                        textTransform: 'uppercase',
                                                                        color: 'rgba(255,255,255,0.85)',
                                                                        letterSpacing: '0.07em',
                                                                        borderBottom: '1px solid rgba(255,255,255,0.15)'
                                                                    },
                                                                    children: "Product"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                    lineNumber: 339,
                                                                    columnNumber: 41
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '8px 10px',
                                                                        textAlign: 'left',
                                                                        fontSize: '10px',
                                                                        textTransform: 'uppercase',
                                                                        color: 'rgba(255,255,255,0.85)',
                                                                        letterSpacing: '0.07em',
                                                                        borderBottom: '1px solid rgba(255,255,255,0.15)',
                                                                        width: '9%'
                                                                    },
                                                                    children: "Expected"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                    lineNumber: 340,
                                                                    columnNumber: 41
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '8px 10px',
                                                                        textAlign: 'left',
                                                                        fontSize: '10px',
                                                                        textTransform: 'uppercase',
                                                                        color: 'rgba(255,255,255,0.85)',
                                                                        letterSpacing: '0.07em',
                                                                        borderBottom: '1px solid rgba(255,255,255,0.15)',
                                                                        width: '10%'
                                                                    },
                                                                    children: "Received"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                    lineNumber: 341,
                                                                    columnNumber: 41
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '8px 10px',
                                                                        textAlign: 'left',
                                                                        fontSize: '10px',
                                                                        textTransform: 'uppercase',
                                                                        color: 'rgba(255,255,255,0.85)',
                                                                        letterSpacing: '0.07em',
                                                                        borderBottom: '1px solid rgba(255,255,255,0.15)',
                                                                        width: '9%'
                                                                    },
                                                                    children: "Lot #"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                    lineNumber: 342,
                                                                    columnNumber: 41
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '8px 10px',
                                                                        textAlign: 'left',
                                                                        fontSize: '10px',
                                                                        textTransform: 'uppercase',
                                                                        color: 'rgba(255,255,255,0.85)',
                                                                        letterSpacing: '0.07em',
                                                                        borderBottom: '1px solid rgba(255,255,255,0.15)',
                                                                        width: '16%'
                                                                    },
                                                                    children: "Exp Date"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                    lineNumber: 343,
                                                                    columnNumber: 41
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        padding: '8px 10px',
                                                                        textAlign: 'left',
                                                                        fontSize: '10px',
                                                                        textTransform: 'uppercase',
                                                                        color: 'rgba(255,255,255,0.85)',
                                                                        letterSpacing: '0.07em',
                                                                        borderBottom: '1px solid rgba(255,255,255,0.15)'
                                                                    },
                                                                    children: "Location"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                    lineNumber: 344,
                                                                    columnNumber: 41
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                mode === 'manual' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    style: {
                                                                        width: '36px',
                                                                        borderBottom: '1px solid rgba(255,255,255,0.15)'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                    lineNumber: 345,
                                                                    columnNumber: 63
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                            lineNumber: 337,
                                                            columnNumber: 37
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 336,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                        children: mode === 'bulk' && selectedPOs ? selectedPOs.map((po)=>{
                                                            const poLines = lines.map((l, i)=>({
                                                                    l,
                                                                    i
                                                                })).filter(({ l })=>l.poId === po.id);
                                                            if (poLines.length === 0) return null;
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                            colSpan: 7,
                                                                            style: {
                                                                                padding: '16px 16px 8px 16px',
                                                                                borderBottom: 'none'
                                                                            },
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    display: 'flex',
                                                                                    alignItems: 'center'
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        style: {
                                                                                            fontSize: '11px',
                                                                                            fontWeight: 700,
                                                                                            color: '#6B7280',
                                                                                            textTransform: 'uppercase',
                                                                                            letterSpacing: '0.08em',
                                                                                            whiteSpace: 'nowrap'
                                                                                        },
                                                                                        children: [
                                                                                            po.id,
                                                                                            " · ",
                                                                                            po.supplier
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                                        lineNumber: 358,
                                                                                        columnNumber: 65
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        style: {
                                                                                            flex: 1,
                                                                                            height: '1px',
                                                                                            backgroundColor: '#E5E7EB',
                                                                                            marginLeft: '16px'
                                                                                        }
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                                        lineNumber: 361,
                                                                                        columnNumber: 65
                                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                                lineNumber: 357,
                                                                                columnNumber: 61
                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                            lineNumber: 356,
                                                                            columnNumber: 57
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                        lineNumber: 355,
                                                                        columnNumber: 53
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    poLines.map(({ l, i })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$receiving$2f$LineItemRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                            line: l,
                                                                            mode: mode,
                                                                            index: i,
                                                                            locations: locations,
                                                                            sessionLocation: session.location,
                                                                            onChange: handleLineChange
                                                                        }, l.itemId, false, {
                                                                            fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                            lineNumber: 366,
                                                                            columnNumber: 57
                                                                        }, ("TURBOPACK compile-time value", void 0)))
                                                                ]
                                                            }, po.id, true, {
                                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                lineNumber: 354,
                                                                columnNumber: 49
                                                            }, ("TURBOPACK compile-time value", void 0));
                                                        }) : lines.map((line, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$receiving$2f$LineItemRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                line: line,
                                                                mode: mode,
                                                                index: index,
                                                                locations: locations,
                                                                sessionLocation: session.location,
                                                                onChange: handleLineChange,
                                                                onRemove: mode === 'manual' && lines.length > 1 ? handleRemoveLine : undefined
                                                            }, line.itemId, false, {
                                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                lineNumber: 381,
                                                                columnNumber: 45
                                                            }, ("TURBOPACK compile-time value", void 0)))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 348,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 335,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                            lineNumber: 334,
                                            columnNumber: 27
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 333,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    mode === 'manual' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleAddLine,
                                        style: {
                                            width: '100%',
                                            background: 'transparent',
                                            border: '1px dashed var(--color-border)',
                                            borderRadius: '10px',
                                            color: 'var(--color-text-muted)',
                                            padding: '16px',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            marginTop: '12px'
                                        },
                                        onMouseOver: (e)=>{
                                            e.currentTarget.style.borderColor = 'var(--color-charcoal)';
                                            e.currentTarget.style.color = 'var(--color-charcoal)';
                                        },
                                        onMouseOut: (e)=>{
                                            e.currentTarget.style.borderColor = 'var(--color-border)';
                                            e.currentTarget.style.color = 'var(--color-text-muted)';
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                size: 18
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 427,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            " Add Line Item"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 399,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                lineNumber: 321,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            display: 'block',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-muted)',
                                            letterSpacing: '0.06em',
                                            marginBottom: '8px'
                                        },
                                        children: "Shipment Notes"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 434,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        placeholder: "Any additional notes about this shipment...",
                                        value: session.notes,
                                        onChange: (e)=>handleSessionChange('notes', e.target.value),
                                        className: "form-control",
                                        style: {
                                            minHeight: '80px',
                                            resize: 'vertical'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 437,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                lineNumber: 433,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                        lineNumber: 318,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: '0 0 300px',
                            position: 'sticky',
                            top: '24px',
                            alignSelf: 'start'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card",
                                style: {
                                    marginBottom: discrepantLines.length > 0 ? '16px' : '24px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'var(--color-text-main)',
                                            margin: '0 0 16px 0'
                                        },
                                        children: "Receipt Summary"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 454,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            fontSize: '13px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: 'var(--color-text-muted)'
                                                        },
                                                        children: "Receipt #:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 460,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontFamily: "'DM Mono', 'Courier New', monospace",
                                                            color: 'var(--color-text-main)'
                                                        },
                                                        children: session.receiptNumber
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 461,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 459,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: 'var(--color-text-muted)'
                                                        },
                                                        children: "Mode:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 464,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: 'var(--color-text-main)'
                                                        },
                                                        children: mode === 'po' ? 'PO-Linked' : mode === 'bulk' ? 'Bulk (Multi-PO)' : 'Manual'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 465,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 463,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: 'var(--color-text-muted)'
                                                        },
                                                        children: "Line Items:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 468,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: 'var(--color-text-main)'
                                                        },
                                                        children: lines.length
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 469,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 467,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: 'var(--color-text-muted)'
                                                        },
                                                        children: "Total Units:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 472,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: 'var(--color-text-main)',
                                                            fontWeight: 600
                                                        },
                                                        children: totalUnits
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 473,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 471,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    height: '1px',
                                                    background: 'var(--color-border)',
                                                    margin: '4px 0'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 476,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: 'var(--color-text-muted)'
                                                        },
                                                        children: "Discrepancies:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 479,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: discrepantLines.length === 0 ? 'var(--color-status-good)' : 'var(--color-status-expired)',
                                                            fontWeight: 600
                                                        },
                                                        children: discrepantLines.length
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 480,
                                                        columnNumber: 33
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 478,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 458,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                lineNumber: 453,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            discrepantLines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'var(--color-bg-danger)',
                                    border: '1px solid var(--color-status-expired)',
                                    borderRadius: '10px',
                                    padding: '24px',
                                    marginBottom: '24px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: 'var(--color-status-expired)',
                                            margin: '0 0 16px 0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        },
                                        children: "⚠ Action Required"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 494,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        },
                                        children: discrepantLines.map((line)=>{
                                            const rQty = parseInt(line.receivedQty) || 0;
                                            const delta = line.expectedQty !== null ? rQty - line.expectedQty : 0;
                                            const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
                                            let actionColor = 'var(--color-status-expired)';
                                            let actionText = 'NO ACTION SET';
                                            if (line.discrepancyAction === 'accept') {
                                                actionColor = 'var(--color-status-good)';
                                                actionText = 'Accept';
                                            }
                                            if (line.discrepancyAction === 'flag') {
                                                actionColor = 'var(--color-status-reserved)';
                                                actionText = 'Flagged';
                                            }
                                            if (line.discrepancyAction === 'reject') {
                                                actionColor = 'var(--color-status-expired)';
                                                actionText = 'Rejected';
                                            }
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '13px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            color: 'var(--color-text-main)',
                                                            fontWeight: 600,
                                                            marginBottom: '2px',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        },
                                                        children: line.name || line.sku || 'Unknown Item'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 513,
                                                        columnNumber: 45
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    color: delta > 0 ? 'var(--color-status-good)' : 'var(--color-status-expired)',
                                                                    fontFamily: "'DM Mono', 'Courier New', monospace",
                                                                    fontSize: '12px'
                                                                },
                                                                children: [
                                                                    deltaStr,
                                                                    " units"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                lineNumber: 517,
                                                                columnNumber: 49
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    color: actionColor,
                                                                    fontSize: '11px',
                                                                    fontWeight: 700,
                                                                    textTransform: 'uppercase'
                                                                },
                                                                children: actionText
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                                lineNumber: 520,
                                                                columnNumber: 49
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                        lineNumber: 516,
                                                        columnNumber: 45
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, line.itemId, true, {
                                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                                lineNumber: 512,
                                                columnNumber: 41
                                            }, ("TURBOPACK compile-time value", void 0));
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                        lineNumber: 498,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                lineNumber: 493,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-primary",
                                onClick: handleSubmit,
                                disabled: isSubmitDisabled,
                                style: {
                                    width: '100%',
                                    fontSize: '14px'
                                },
                                children: isSubmitting ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    size: 18,
                                    className: "animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                    lineNumber: 541,
                                    columnNumber: 41
                                }, ("TURBOPACK compile-time value", void 0)) : 'Post Receipt →'
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                lineNumber: 532,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            hasUnresolvedDiscrepancies && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: 'var(--color-status-expired)',
                                    textAlign: 'center',
                                    fontSize: '12px',
                                    marginTop: '12px',
                                    fontWeight: 500
                                },
                                children: "Set an action for all discrepancies to continue"
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                lineNumber: 546,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            hasEmptyLocations && !hasUnresolvedDiscrepancies && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: 'var(--color-status-expired)',
                                    textAlign: 'center',
                                    fontSize: '12px',
                                    marginTop: '12px',
                                    fontWeight: 500
                                },
                                children: "Please select a Receiving Location"
                            }, void 0, false, {
                                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                                lineNumber: 551,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                        lineNumber: 450,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
                lineNumber: 316,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/receiving/ReceivingSession.tsx",
        lineNumber: 227,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ReceivingSession, "u0PJNtmrLWMzHknzwsTe+TGlMjk=");
_c = ReceivingSession;
const __TURBOPACK__default__export__ = ReceivingSession;
var _c;
__turbopack_context__.k.register(_c, "ReceivingSession");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/views/ReceivingPage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$receivingApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/receivingApi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$receiving$2f$ReceivingList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/receiving/ReceivingList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$receiving$2f$ReceivingSession$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/receiving/ReceivingSession.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
const ReceivingPage = ()=>{
    _s();
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('list');
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedPO, setSelectedPO] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedPOs, setSelectedPOs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [pos, setPOs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [locations, setLocations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // New State for Addendum Features
    const [drawerPO, setDrawerPO] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedPOIds, setSelectedPOIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [printTarget, setPrintTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Success state data
    const [successData, setSuccessData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchInitialData = async ()=>{
        setLoading(true);
        try {
            const [fetchedPOs, fetchedLocs] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$receivingApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPurchaseOrders"])(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$receivingApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocations"])()
            ]);
            setPOs(fetchedPOs);
            setLocations(fetchedLocs);
        } catch (error) {
            console.error('Failed to load receiving data', error);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReceivingPage.useEffect": ()=>{
            fetchInitialData();
        }
    }["ReceivingPage.useEffect"], []);
    // Print Side-effect
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReceivingPage.useEffect": ()=>{
            if (!printTarget) return;
            const style = document.createElement("style");
            style.id = "shc-print-styles";
            style.innerHTML = `
            @media print {
                body > * { display: none !important; }
                #print-template { display: block !important; }
            }
        `;
            document.head.appendChild(style);
            return ({
                "ReceivingPage.useEffect": ()=>{
                    document.getElementById("shc-print-styles")?.remove();
                }
            })["ReceivingPage.useEffect"];
        }
    }["ReceivingPage.useEffect"], [
        printTarget
    ]);
    const handleStartPO = (po)=>{
        setMode('po');
        setSelectedPO(po);
        setDrawerPO(null); // Close drawer if open
        setView('session');
    };
    const handleStartBulk = ()=>{
        setMode('bulk');
        const bulkPos = pos.filter((p)=>selectedPOIds.has(p.id));
        setSelectedPOs(bulkPos);
        setView('session');
    };
    const handleStartManual = ()=>{
        setMode('manual');
        setSelectedPO(null);
        setView('session');
    };
    const handleBackToList = ()=>{
        setMode(null);
        setSelectedPO(null);
        setSelectedPOs([]);
        setSelectedPOIds(new Set()); // Auto-clear selection
        setView('list');
    };
    const handleSuccess = (receiptNumber, deltaCount)=>{
        setSuccessData({
            receiptNumber,
            deltaCount
        });
        setView('success');
        // Re-fetch POs to get updated status natively
        fetchInitialData();
        // After 2.5s, return to list view
        setTimeout(()=>{
            handleBackToList();
            setSuccessData(null);
        }, 2500);
    };
    const handlePrintSingle = (po)=>{
        setPrintTarget(po);
        setTimeout(()=>window.print(), 10);
    };
    const handlePrintMultiple = (ids)=>{
        const toPrint = pos.filter((p)=>ids.has(p.id));
        setPrintTarget(toPrint);
        setTimeout(()=>window.print(), 10);
    };
    if (view === 'list') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$receiving$2f$ReceivingList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    pos: pos,
                    loading: loading,
                    onStartPO: handleStartPO,
                    onStartManual: handleStartManual,
                    onStartBulk: handleStartBulk,
                    selectedPOIds: selectedPOIds,
                    setSelectedPOIds: setSelectedPOIds,
                    drawerPO: drawerPO,
                    setDrawerPO: setDrawerPO,
                    onPrintSingle: handlePrintSingle,
                    onPrintMultiple: handlePrintMultiple
                }, void 0, false, {
                    fileName: "[project]/src/views/ReceivingPage.tsx",
                    lineNumber: 119,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PrintTemplate, {
                    target: printTarget
                }, void 0, false, {
                    fileName: "[project]/src/views/ReceivingPage.tsx",
                    lineNumber: 132,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true);
    }
    if (view === 'session') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$receiving$2f$ReceivingSession$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            mode: mode,
            selectedPO: selectedPO,
            selectedPOs: selectedPOs,
            locations: locations,
            onBack: handleBackToList,
            onSuccess: handleSuccess
        }, void 0, false, {
            fileName: "[project]/src/views/ReceivingPage.tsx",
            lineNumber: 139,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (view === 'success' && successData) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        border: '2px solid var(--color-status-good)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                        color: "var(--color-status-good)",
                        size: 36
                    }, void 0, false, {
                        fileName: "[project]/src/views/ReceivingPage.tsx",
                        lineNumber: 169,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/views/ReceivingPage.tsx",
                    lineNumber: 158,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    style: {
                        fontSize: '22px',
                        fontWeight: 'bold',
                        color: 'var(--color-text-main)',
                        margin: '0 0 8px 0'
                    },
                    children: "Receipt Posted"
                }, void 0, false, {
                    fileName: "[project]/src/views/ReceivingPage.tsx",
                    lineNumber: 172,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: 'var(--color-text-muted)',
                        fontSize: '14px',
                        margin: '0 0 24px 0'
                    },
                    children: [
                        successData.receiptNumber,
                        " — inventory updated"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/views/ReceivingPage.tsx",
                    lineNumber: 175,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                successData.deltaCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        color: 'var(--color-status-reserved)',
                        border: '1px solid var(--color-status-reserved)',
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        fontSize: '13px',
                        fontWeight: 500
                    },
                    children: [
                        successData.deltaCount,
                        " discrepanc",
                        successData.deltaCount === 1 ? 'y' : 'ies',
                        " logged for review"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/views/ReceivingPage.tsx",
                    lineNumber: 180,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/views/ReceivingPage.tsx",
            lineNumber: 152,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0));
    }
    return null;
};
_s(ReceivingPage, "egOmd+6DTcQ4bqbV0FSagcBGhps=");
_c = ReceivingPage;
// --- Print Template Component ---
const PrintTemplate = ({ target })=>{
    if (!target) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "print-template",
        style: {
            display: 'none'
        }
    }, void 0, false, {
        fileName: "[project]/src/views/ReceivingPage.tsx",
        lineNumber: 201,
        columnNumber: 25
    }, ("TURBOPACK compile-time value", void 0));
    const orders = Array.isArray(target) ? target : [
        target
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "print-template",
        style: {
            display: 'none'
        },
        children: [
            orders.map((po, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: idx < orders.length - 1 ? 'page-break' : '',
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "print-header",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        style: {
                                            margin: 0,
                                            fontSize: '24px',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase'
                                        },
                                        children: "SHC ERP"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/ReceivingPage.tsx",
                                        lineNumber: 211,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '14px',
                                            marginTop: '4px'
                                        },
                                        children: "Purchase Order"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/ReceivingPage.tsx",
                                        lineNumber: 212,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/ReceivingPage.tsx",
                                lineNumber: 210,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/views/ReceivingPage.tsx",
                            lineNumber: 209,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "print-meta-grid",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "print-meta-label",
                                    children: "PO Number:"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 216,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: po.id
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 216,
                                    columnNumber: 75
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "print-meta-label",
                                    children: "Supplier:"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 217,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: po.supplier
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 217,
                                    columnNumber: 74
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "print-meta-label",
                                    children: "Expected:"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 218,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: new Date(po.expectedDate).toLocaleDateString()
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 218,
                                    columnNumber: 74
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "print-meta-label",
                                    children: "Status:"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 219,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textTransform: 'uppercase'
                                    },
                                    children: po.status
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 219,
                                    columnNumber: 72
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "print-meta-label",
                                    children: "Printed:"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 220,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: new Date().toLocaleString()
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 220,
                                    columnNumber: 73
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/ReceivingPage.tsx",
                            lineNumber: 215,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontWeight: 'bold',
                                borderBottom: '1px solid #000',
                                paddingBottom: '4px',
                                marginBottom: '8px',
                                fontSize: '11px',
                                letterSpacing: '0.05em'
                            },
                            children: "LINE ITEMS"
                        }, void 0, false, {
                            fileName: "[project]/src/views/ReceivingPage.tsx",
                            lineNumber: 223,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "print-table",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "SKU"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/ReceivingPage.tsx",
                                                lineNumber: 227,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Product Name"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/ReceivingPage.tsx",
                                                lineNumber: 228,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Qty"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/ReceivingPage.tsx",
                                                lineNumber: 229,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Unit"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/ReceivingPage.tsx",
                                                lineNumber: 230,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/ReceivingPage.tsx",
                                        lineNumber: 226,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 225,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: po.items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        fontFamily: 'monospace'
                                                    },
                                                    children: item.sku
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                                    lineNumber: 236,
                                                    columnNumber: 37
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: item.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                                    lineNumber: 237,
                                                    columnNumber: 37
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: item.expectedQty
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                                    lineNumber: 238,
                                                    columnNumber: 37
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: item.unit
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                                    lineNumber: 239,
                                                    columnNumber: 37
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, item.id, true, {
                                            fileName: "[project]/src/views/ReceivingPage.tsx",
                                            lineNumber: 235,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)))
                                }, void 0, false, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 233,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/ReceivingPage.tsx",
                            lineNumber: 224,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontWeight: 600,
                                fontSize: '13px',
                                marginBottom: '32px'
                            },
                            children: [
                                "Total Units Expected: ",
                                po.items.reduce((s, i)=>s + i.expectedQty, 0)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/ReceivingPage.tsx",
                            lineNumber: 245,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: '24px'
                            },
                            children: "Receiving Notes: ________________________________________________________________"
                        }, void 0, false, {
                            fileName: "[project]/src/views/ReceivingPage.tsx",
                            lineNumber: 249,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: '16px'
                            },
                            children: "__________________________________________________________________________________"
                        }, void 0, false, {
                            fileName: "[project]/src/views/ReceivingPage.tsx",
                            lineNumber: 250,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: '16px'
                            },
                            children: "__________________________________________________________________________________"
                        }, void 0, false, {
                            fileName: "[project]/src/views/ReceivingPage.tsx",
                            lineNumber: 251,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "print-signature-section",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: "Received By:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/ReceivingPage.tsx",
                                            lineNumber: 255,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "print-signature-line"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/ReceivingPage.tsx",
                                            lineNumber: 256,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 254,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: "Date:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/ReceivingPage.tsx",
                                            lineNumber: 259,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "print-signature-line"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/ReceivingPage.tsx",
                                            lineNumber: 260,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 258,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        gridColumn: 'span 2',
                                        marginTop: '16px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: "Signature:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/ReceivingPage.tsx",
                                            lineNumber: 263,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "print-signature-line"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/ReceivingPage.tsx",
                                            lineNumber: 264,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/views/ReceivingPage.tsx",
                                    lineNumber: 262,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/ReceivingPage.tsx",
                            lineNumber: 253,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, po.id, true, {
                    fileName: "[project]/src/views/ReceivingPage.tsx",
                    lineNumber: 208,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                dangerouslySetInnerHTML: {
                    __html: `
                #print-template {
                    font-family: 'Arial', sans-serif;
                    font-size: 12px;
                    color: #000;
                    padding: 32px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .print-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #000;
                    padding-bottom: 16px;
                    margin-bottom: 20px;
                }
                .print-meta-grid {
                    display: grid;
                    grid-template-columns: 140px 1fr;
                    gap: 6px 12px;
                    margin-bottom: 24px;
                }
                .print-meta-label { font-weight: bold; }
                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 24px;
                }
                .print-table th {
                    border-bottom: 2px solid #000;
                    text-align: left;
                    padding: 6px 8px;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .print-table td {
                    border-bottom: 1px solid #ccc;
                    padding: 6px 8px;
                }
                .print-signature-section {
                    margin-top: 32px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .print-signature-line {
                    border-bottom: 1px solid #000;
                    margin-top: 24px;
                    margin-bottom: 4px;
                }
                .page-break { page-break-after: always; }
            `
                }
            }, void 0, false, {
                fileName: "[project]/src/views/ReceivingPage.tsx",
                lineNumber: 269,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/views/ReceivingPage.tsx",
        lineNumber: 206,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_c1 = PrintTemplate;
const __TURBOPACK__default__export__ = ReceivingPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "ReceivingPage");
__turbopack_context__.k.register(_c1, "PrintTemplate");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/receiving/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$ReceivingPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/ReceivingPage.tsx [app-client] (ecmascript)");
"use client";
;
;
function Page() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$ReceivingPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/receiving/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = Page;
var _c;
__turbopack_context__.k.register(_c, "Page");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_d35c4ea7._.js.map