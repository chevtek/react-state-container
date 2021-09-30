import React, { useReducer, useContext, ReactNode } from "react"
import _cloneDeep from "lodash/cloneDeep"

type GenericActionHandler<State, Payload> = (state: State, payload: Payload) => Partial<State> | void;

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

const buildContainer = <
  State extends {},
  ActionHandlers extends Record<string, GenericActionHandler<State, any>>,
  HelperFunc extends (dispatch: GenericDispatch<ActionHandlers>) => Record<string, GenericHelper<any>>
>(name: string, initialState: State, actionHandlers: ActionHandlers, helperFunction?: HelperFunc): StateContainer<State, ActionHandlers, ReturnType<HelperFunc>> => {

  const ContainerContext = React.createContext<{
    state: State,
    dispatch: GenericDispatch<ActionHandlers>,
    helpers: ReturnType<HelperFunc>
  } | undefined>(undefined);

  const reducer = (state: State, [type, payload]: TypePayloadPair<ActionHandlers>) => {
    const stateClone = _cloneDeep(state);
    const newState = actionHandlers[type](stateClone, payload);
    if (!newState) return state;
    return { ...stateClone, ...newState };
  };

  const ContainerProvider = ({ children, defaultState }: { children?: ReactNode, defaultState?: State }) => {
    const [state, reducerDispatch] = useReducer(reducer, defaultState ?? initialState);
    const dispatch: GenericDispatch<ActionHandlers> = (type, ...payload) => reducerDispatch([type, payload]);
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

  setState: <State extends {}>(initialState: State) => ({

    setActions: <ActionHandlers extends Record<string, GenericActionHandler<State, any>>>(actionHandlers: ActionHandlers) => ({

      build: () => buildContainer(name, initialState, actionHandlers),

      setHelpers: <HelperFunc extends (dispatch: GenericDispatch<ActionHandlers>) => Record<string, GenericHelper<any>>>(helperFunction: HelperFunc) => ({

        build: () => buildContainer(name, initialState, actionHandlers, helperFunction)

      })

    })

  })

});

export default createStateContainer;