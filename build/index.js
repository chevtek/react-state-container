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
var buildContainer = function (name, initialState, actionHandlers, helperFunction) {
    var ContainerContext = react_1.default.createContext(undefined);
    var reducer = function (state, _a) {
        var type = _a[0], payload = _a[1];
        var stateClone = (0, cloneDeep_1.default)(state);
        var newState = actionHandlers[type](stateClone, payload);
        if (!newState)
            return state;
        return __assign(__assign({}, stateClone), newState);
    };
    var ContainerProvider = function (_a) {
        var _b;
        var children = _a.children, defaultState = _a.defaultState;
        var _c = (0, react_1.useReducer)(reducer, defaultState !== null && defaultState !== void 0 ? defaultState : initialState), state = _c[0], reducerDispatch = _c[1];
        var dispatch = function (type) {
            var payload = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                payload[_i - 1] = arguments[_i];
            }
            return reducerDispatch([type, payload]);
        };
        var helpers = ((_b = helperFunction === null || helperFunction === void 0 ? void 0 : helperFunction(dispatch)) !== null && _b !== void 0 ? _b : {});
        return (react_1.default.createElement(ContainerContext.Provider, { value: { state: state, dispatch: dispatch, helpers: helpers } }, children));
    };
    var useStateContainer = function () {
        var context = (0, react_1.useContext)(ContainerContext);
        if (context === undefined) {
            throw new Error("use" + name + " must be used within a " + name + "Provider");
        }
        return context;
    };
    return [ContainerProvider, useStateContainer];
};
var createStateContainer = function (name) { return ({
    setState: function (initialState) { return ({
        setActions: function (actionHandlers) { return ({
            build: function () { return buildContainer(name, initialState, actionHandlers); },
            setHelpers: function (helperFunction) { return ({
                build: function () { return buildContainer(name, initialState, actionHandlers, helperFunction); }
            }); }
        }); }
    }); }
}); };
exports.default = createStateContainer;
// export default function createStateContainer<
//   S,
//   AH extends Record<string, GenericActionHandler<S, any>>,
//   H
// >({
//   name,
//   initialState,
//   actionHandlers,
//   helpers
// }: Config<S, AH, H>): StateContainer<S, AH, H> {
//   const Context = React.createContext<
//     | {
//         state: S;
//         dispatch: Dispatch<AH>;
//         helpers?: H
//       }
//     | undefined
//   >(undefined);
//   const reducer = (state: S, [type, payload]: TypePayloadPair<AH>) => {
//     const stateClone = _cloneDeep(state);
//     const newState = actionHandlers[type](stateClone, payload);
//     if (!newState) return state;
//     return { ...stateClone, ...newState };
//   }
//   const Provider = ({
//     children,
//     defaultState
//   }: {
//     children?: ReactNode;
//     defaultState?: S;
//   }) => {
//     const [state, reducerDispatch] = useReducer(
//       reducer,
//       defaultState ?? initialState
//     );
//     const dispatch: Dispatch<AH> = (type, payload) => reducerDispatch([type, payload]);
//     return (
//       <Context.Provider value={{ state, dispatch, helpers }}>
//         {children}
//       </Context.Provider>
//     );
//   }
//   function useStateContainer() {
//     const context = useContext(Context);
//     if (context === undefined) {
//       throw new Error(`use${name} must be used within a ${name}Provider`);
//     }
//     return context;
//   }
//   return {
//     Provider,
//     useStateContainer
//   };
// }
//# sourceMappingURL=index.js.map