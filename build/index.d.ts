import React from "react";
declare type GenericActionHandler<State, Payload> = (state: State, payload: Payload) => Partial<State> | void;
declare type GenericHelper<Payload> = (payload: Payload) => Promise<void> | void;
declare type Actions<ActionHandlers> = {
    [Key in keyof ActionHandlers]: ActionHandlers[Key] extends GenericActionHandler<any, infer Payload> ? unknown extends Payload ? never : Payload : never;
};
declare type GenericDispatch<ActionHandlers> = <Action extends Actions<ActionHandlers>, Key extends keyof ActionHandlers, Payload extends Action[Key]>(type: Key, ...payload: (Payload extends undefined ? [] : [Payload])) => void;
declare type StateContainer<State, ActionHandlers, Helpers> = [
    ContainerProvider: React.FC<{
        defaultState?: State;
    }>,
    useStateContainer: () => {
        state: State;
        dispatch: GenericDispatch<ActionHandlers>;
        helpers: Helpers;
    }
];
declare const createStateContainer: (name: string) => {
    setState: <State extends {}>(initialState: State) => {
        setActions: <ActionHandlers extends Record<string, GenericActionHandler<State, any>>>(actionHandlers: ActionHandlers) => {
            build: () => StateContainer<State, ActionHandlers, Record<string, GenericHelper<any>>>;
            setHelpers: <HelperFunc extends (dispatch: GenericDispatch<ActionHandlers>) => Record<string, GenericHelper<any>>>(helperFunction: HelperFunc) => {
                build: () => StateContainer<State, ActionHandlers, ReturnType<HelperFunc>>;
            };
        };
    };
};
export default createStateContainer;
//# sourceMappingURL=index.d.ts.map