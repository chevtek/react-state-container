import React, { useContext, useReducer, ReactNode } from "react";
import _cloneDeep from "lodash/cloneDeep";

export default class StateContainer<State> {

  state?: State;

  constructor(private containerName: string) {}

  defaultState(state: State) {
    this.state = state;
  }
}