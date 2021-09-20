"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMyState = exports.MyStateProvider = void 0;
var _1 = __importDefault(require("."));
exports.MyStateProvider = (_a = (0, _1.default)({
    name: "MyState",
    initialState: {
        nums: []
    },
    actionHandlers: {
        RESET_NUMS: function () { return ({ nums: [] }); },
        ADD_NUM: function (_a, num) {
            var nums = _a.nums;
            nums.push(num);
            return { nums: nums };
        },
        SET_NUMS: function (_a, nums) { return ({ nums: nums }); }
    }
}), _a.Provider), exports.useMyState = _a.useStateContainer;
//# sourceMappingURL=demo.js.map