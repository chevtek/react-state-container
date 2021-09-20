import createStateContainer from ".";

export const {
  Provider: MyStateProvider,
  useStateContainer: useMyState
} = createStateContainer({
  name: "MyState",
  initialState: {
    nums: [] as number[]
  },
  actionHandlers: {
    RESET_NUMS: () => ({ nums: [] }),
    ADD_NUM: ({ nums }, num: number) => {
      nums.push(num);
      return { nums };
    },
    SET_NUMS: ({}, nums: number[]) => ({ nums })
  }
});