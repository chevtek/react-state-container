import React from "react";
declare type GenericActionHandler<S, P> = (state: S, payload: P) => Partial<S> | void;
declare type Config<S, AH extends Record<string, GenericActionHandler<S, unknown>>> = {
    name: string;
    initialState: S;
    actionHandlers: AH;
};
declare type Actions<AH> = {
    [K in keyof AH]: AH[K] extends GenericActionHandler<any, infer P> ? unknown extends P ? never : P : never;
};
declare type Dispatch<AH> = <A extends Actions<AH>, T extends keyof AH, P extends A[T]>(type: T, ...payload: (P extends undefined ? [] : [P])) => void;
declare type StateContainer<S, AH> = {
    Provider: React.FC<{
        defaultState?: S;
    }>;
    useStateContainer: () => {
        state: S;
        dispatch: Dispatch<AH>;
    };
};
export default function createStateContainer<S, AH extends Record<string, GenericActionHandler<S, any>>>({ name, initialState, actionHandlers }: Config<S, AH>): StateContainer<S, AH>;
export {};
//# sourceMappingURL=index.d.ts.map