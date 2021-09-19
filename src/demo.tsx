import createStateContainer from "./index";

const state = {
  nums: [] as number[],
  msg: "Hello",
  thing: true
};

export const { hook: useMyState, Provider: MyStateProvider } = createStateContainer("MyState", state, {
  RESET_NUMS: () => ({ nums: [] }),

  ADD_NUM: ({ nums }, num: number) => {
    nums.push(num);
    return { nums };
  },

  SET_NUMS: ({}, nums: number[]) => ({ nums })
});