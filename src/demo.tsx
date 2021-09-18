import StateContainer from "./index";

const myState = new StateContainer("MyState");

myState.defaultState({
  nums: [] as number[]
});

console.log(myState.state);

myState.actionHandler(
  "RESET_NUMS",
  () => ({ nums: [] })
);

myState.actionHandler(
  "ADD_NUM",
  ({ nums }, num: number) => ({ nums: [...nums, num] }) 
);

myState.actionHandler(
  "SET_NUMS",
  ({}, nums: number[]) => ({ nums })
);

const {
  Provider: MyStateProvider,
  useStateContainer: useMyState
} = myState;

export { MyStateProvider, useMyState };