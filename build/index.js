"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
function createStateContainer(_a) {
    var name = _a.name, initialState = _a.initialState, actionHandlers = _a.actionHandlers;
    var Context = react_1.default.createContext(undefined);
    var reducer = function (state, _a) {
        var type = _a[0], payload = _a[1];
        var stateClone = (0, cloneDeep_1.default)(state);
        var newState = actionHandlers[type](stateClone, payload);
        if (!newState)
            return state;
        return __assign(__assign({}, stateClone), newState);
    };
    var Provider = function (_a) {
        var children = _a.children, defaultState = _a.defaultState;
        var _b = (0, react_1.useReducer)(reducer, defaultState !== null && defaultState !== void 0 ? defaultState : initialState), state = _b[0], reducerDispatch = _b[1];
        var dispatch = function (type, payload) { return reducerDispatch([type, payload]); };
        return (react_1.default.createElement(Context.Provider, { value: { state: state, dispatch: dispatch } }, children));
    };
    function useStateContainer() {
        var context = (0, react_1.useContext)(Context);
        if (context === undefined) {
            throw new Error("use" + name + " must be used within a " + name + "Provider");
        }
        return context;
    }
    return {
        Provider: Provider,
        useStateContainer: useStateContainer
    };
}
exports.default = createStateContainer;
//# sourceMappingURL=index.js.map