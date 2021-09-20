import React, { useReducer, useContext, ReactNode } from "react";
import _cloneDeep from "lodash/cloneDeep";

type GenericActionHandler<S, P> = (state: S, payload: P) => Partial<S> | void;

type Config<S, AH extends Record<string, GenericActionHandler<S, unknown>>> = {
  name: string;
  initialState: S;
  actionHandlers: AH;
};

type Actions<AH> = {
  [K in keyof AH]: AH[K] extends GenericActionHandler<any, infer P>
    ? unknown extends P
      ? never
      : P
    : never;
};

type TypePayloadPair<AH> = {
  [K in keyof AH]: Actions<AH>[K] extends null | undefined
    ? [K]
    : [K, Actions<AH>[K]];
}[keyof AH];

type Dispatch<AH> = <A extends Actions<AH>, T extends keyof AH, P extends A[T]>(type: T, ...payload: (P extends null | undefined ? [] : [P])) => void;

type StateContainer<S, AH> = {
  Provider: React.FC<{ defaultState?: S }>;
  useStateContainer: () => {
    state: S;
    dispatch: Dispatch<AH>;
  };
  dispatch: Dispatch<AH>
};


export default function createStateContainer<
  S,
  AH extends Record<string, GenericActionHandler<S, any>>
>({
  name,
  initialState,
  actionHandlers
}: Config<S, AH>): StateContainer<S, AH> {
  const Context = React.createContext<
    | {
        state: S;
        dispatch: Dispatch<AH>;
      }
    | undefined
  >(undefined);

  function reducer <T extends keyof AH, P = Actions<AH>[T]>(state: S, [type, payload]: [T, P]): S {
    const stateClone = _cloneDeep(state);
    const newState = actionHandlers[type](stateClone, payload);
    if (!newState) return state;
    return { ...stateClone, ...newState };
  }

  function Provider({
    children,
    defaultState
  }: {
    children?: ReactNode;
    defaultState?: S;
  }) {
    const [state, reducerDispatch] = useReducer(
      reducer,
      defaultState ?? initialState
    );
    const dispatch: Dispatch<AH> = (type, payload) => reducerDispatch([type, payload]);

    return (
      <Context.Provider value={{ state, dispatch }}>
        {children}
      </Context.Provider>
    );
  }

  function useStateContainer() {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`use${name} must be used within a ${name}Provider`);
    }
    return context;
  }

  return {
    Provider,
    useStateContainer,
    dispatch: (type, payload) => { console.log(type, payload); }
  };
}