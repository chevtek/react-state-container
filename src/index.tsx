import React, { useReducer, useContext, useEffect, ReactNode } from "react";
import produce, { Draft, Immutable } from "immer";
export * from "immer";

type GenericActionHandler<State, Payload> = (state: Draft<State>, payload: Payload) => Draft<State> | void;

type GenericHelper<Payload> = (payload: Payload) => Promise<void> | void;

type Actions<ActionHandlers> = {
  [Key in keyof ActionHandlers]: ActionHandlers[Key] extends GenericActionHandler<any, infer Payload>
    ? unknown extends Payload
      ? never : Payload
    : never;
};

type TypePayloadPair<ActionHandlers> = {
  [Key in keyof ActionHandlers]: Actions<ActionHandlers>[Key] extends null | undefined
    ? [Key, undefined]
    : [Key, Actions<ActionHandlers>[Key]];
}[keyof ActionHandlers];

type GenericDispatch<ActionHandlers> = <
  Action extends Actions<ActionHandlers>,
  Key extends keyof ActionHandlers,
  Payload extends Action[Key]
>(type: Key, ...payload: (Payload extends undefined ? [] : [Payload])) => void;

type StateContainer<State, ActionHandlers, Helpers> = [
  ContainerProvider: React.FC<{ defaultState?: State }>,
  useStateContainer: () => {
    state: State,
    dispatch: GenericDispatch<ActionHandlers>,
    helpers: Helpers
  }
];

type GenericHelperFunc<ActionHandlers> = (dispatch: GenericDispatch<ActionHandlers>) => Record<string, GenericHelper<any>>;

type GenericDefaultStateChangedFunc<State> = (currentState: Draft<State>, newDefaultState: State) => Draft<State> | void;

const buildContainer = <
  State extends Immutable<object>,
  ActionHandlers extends Record<string, GenericActionHandler<State, any>>,
  HelperFunc extends GenericHelperFunc<ActionHandlers>,
  DefaultStateFunc extends GenericDefaultStateChangedFunc<State>
>(name: string, initialState: State, actionHandlers: ActionHandlers, helperFunction?: HelperFunc, defaultStateChangedFunction?: DefaultStateFunc): StateContainer<State, ActionHandlers, ReturnType<HelperFunc>> => {

  const ContainerContext = React.createContext<{
    state: State,
    dispatch: GenericDispatch<ActionHandlers>,
    helpers: ReturnType<HelperFunc>
  } | undefined>(undefined);

  const reducer = (
    state: State,
    [type, payload]: TypePayloadPair<ActionHandlers>
  ) => {
    switch (type) {
      case "_OVERRIDE_STATE": 
        if (defaultStateChangedFunction) {
          return produce(state, draft => defaultStateChangedFunction(draft, payload!));
        }
        return payload!;
      default:
        return produce(state, draft => actionHandlers[type](draft, payload));
    }
  };

  const ContainerProvider = ({ children, defaultState }: { children?: ReactNode, defaultState?: State }) => {
    let [state, reducerDispatch] = useReducer(reducer, defaultState ?? initialState);
    useEffect(() => {
      if (!defaultState) return;
      reducerDispatch(["_OVERRIDE_STATE", defaultState] as any);
    }, [defaultState]);
    const dispatch: GenericDispatch<ActionHandlers> = (type, payload) => reducerDispatch([type, payload]);
    const helpers = (helperFunction?.(dispatch) ?? {}) as ReturnType<HelperFunc>;
    return (
      <ContainerContext.Provider value={{ state, dispatch, helpers }}>
        {children}
      </ContainerContext.Provider>
    );
  };

  const useStateContainer = () => {
    const context = useContext(ContainerContext);
    if (context === undefined) {
      throw new Error(`use${name} must be used within a ${name}Provider`);
    }
    return context;
  }

  return [ContainerProvider, useStateContainer];
};


const createStateContainer = (name: string) => ({

  setState: <State extends Immutable<object>>(initialState: State) => ({

    setActions: <ActionHandlers extends Record<string, GenericActionHandler<State, any>>>(actionHandlers: ActionHandlers) => {

      let defaultStateChangedFunction: GenericDefaultStateChangedFunc<State>;
      let helperFunction: GenericHelperFunc<ActionHandlers>; 
      const build = () => buildContainer(name, initialState, actionHandlers, helperFunction, defaultStateChangedFunction);

      function setHelpers (func: GenericHelperFunc<ActionHandlers>) {
        helperFunction = func;
        return {
          build,
          onDefaultStateChanged
        };
      }

      function onDefaultStateChanged (func: GenericDefaultStateChangedFunc<State>) {
        defaultStateChangedFunction = func;
        return {
          build,
          setHelpers
        };
      }

      return {
        build,
        onDefaultStateChanged,
        setHelpers
      };

    }

  })

});

export default createStateContainer;