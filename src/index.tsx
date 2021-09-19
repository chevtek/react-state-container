import React, { useContext, useReducer, ReactNode } from "react";
import _cloneDeep from "lodash/cloneDeep";

export default <
  State,
  ActionHandlers extends {
    [K: string]: (state: State, data?: any) => Partial<State>
  }
>(
  hookName: string,
  defaultState: State,
  actionHandlers: ActionHandlers
) => {

  type Actions = {
    [K in keyof ActionHandlers]: Parameters<ActionHandlers[K]>[1]
  }
  type ActionsMap = {
    [K in keyof Actions]: Actions[K] extends undefined ? { type: K, data?: undefined } : { type: K, data: Actions[K] }
  };
  type Action = ActionsMap[keyof ActionsMap];
  type Dispatch = <T extends keyof Actions, D extends Actions[T]>(type: T, ...data: (D extends undefined ? [] : [D])) => void;

  const Context = React.createContext<
    {
        state: State;
        dispatch: Dispatch
    } | undefined
  >(undefined);


  const reducer = (state: State, action: Action) => {
      const stateClone = _cloneDeep(state);
      const newState = actionHandlers[action.type](stateClone, action.data);
      if (!newState) return state;
      return { ...stateClone, ...newState };
  };

  const Provider = ({children, stateOverride}: {children: ReactNode, stateOverride?: State}) => {
      const [state, reducerDispatch] = useReducer(reducer, stateOverride ?? defaultState);
      const dispatch: Dispatch = (type, data) => reducerDispatch({type, data} as Action);
      return (
          <Context.Provider value={{ state, dispatch }}>
              {children}
          </Context.Provider>
      );
  };

  const hook = () => {
      const context = useContext(Context);
      if (context === undefined) {
          throw new Error(`use${hookName} must be used within a ${hookName}Provider`);
      }
      return context;
  }

  return { hook, Provider };
};
