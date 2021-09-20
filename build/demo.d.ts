/// <reference types="react" />
export declare const MyStateProvider: import("react").FC<{
    defaultState?: {
        nums: number[];
    } | undefined;
}>, useMyState: () => {
    state: {
        nums: number[];
    };
    dispatch: <A extends {
        RESET_NUMS: never;
        ADD_NUM: number;
        SET_NUMS: number[];
    }, T extends "RESET_NUMS" | "ADD_NUM" | "SET_NUMS", P extends A[T]>(type: T, ...payload: P extends undefined ? [] : [P]) => void;
};
//# sourceMappingURL=demo.d.ts.map