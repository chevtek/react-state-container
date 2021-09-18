// Set this accordingly.
const hookName = "MyState";

// Default state values. Make sure your values have explicit types set.
const initialState = {
  nums: [] as Number[]
};

// Available actions and the data they require. Specify "null" if action requires no data.
type Actions = {
  RESET_NUMS: null,
  ADD_NUM: Number,
  SET_NUMS: Number[]
};

// Action handler methods. There must be a handler for each action listed above.
const actionHandlers: ActionHandlers = {
  RESET_NUMS: () => ({ nums: [] }),
  ADD_NUM: ({ nums }, num) => {
    nums.push(num);
    return { nums };
  },
  SET_NUMS: ({}, nums) => ({ nums })
};

// Rename these exports accordingly.
export const MyStateProvider = Provider;
export const useMyState = useContextState;





/**************************************************
 *                                                *
 * You do not need to modify anything below this. *
 *                                                *
 **************************************************/

/* Context Hook Boilerplate */

import React, { useReducer, useContext, ReactNode } from "react";
import _cloneDeep from "lodash/cloneDeep";

const Context = React.createContext<
    {
        state: State;
        dispatch: Dispatch
    } | undefined
>(undefined);

function reducer(state: State, action: Action): State {
    const stateClone = _cloneDeep(state);
    const newState = actionHandlers[action.type](stateClone, action.data as any);
    if (!newState) return state;
    return { ...stateClone, ...newState };
}

function Provider({children, defaultState}: {children: ReactNode, defaultState?: State}) {
    const [state, reducerDispatch] = useReducer(reducer, defaultState ?? initialState);
    const dispatch: Dispatch = (type, data) => reducerDispatch({type, data} as Action);
    return (
        <Context.Provider value={{ state, dispatch }}>
            {children}
        </Context.Provider>
    );
}

function useContextState() {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error(`use${hookName} must be used within a ${hookName}Provider`);
    }
    return context;
}

/* TypeScript Boilerplate */

type Dispatch = <A extends Actions, T extends keyof A, D extends A[T]>(type: T, ...data: (D extends null ? [] : [D])) => void
type State = typeof initialState;
type ActionsMap = {
  [K in keyof Actions]: Actions[K] extends null ? { type: K, data?: undefined } : { type: K, data: Actions[K] }
};
type Action = ActionsMap[keyof Actions];
type ActionHandlers = {
    [K in keyof Actions]: Actions[K] extends null ? (state: State) => Partial<State> | void : (state: State, data: Actions[K]) => Partial<State> | void;
};