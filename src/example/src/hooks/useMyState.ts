import createContainer from "@chevtek/react-state-container";

export const [MyStateProvider, useMyState] = createContainer("MyState")
  .setState({
    nums: [] as number[]
  })
  .setActions({
    RESET_NUMS: () => ({ nums: [] }),
    ADD_NUM: ({ nums }, num: number) => {
      nums.push(num);
      return { nums };
    },
    SET_NUMS: ({}, nums: number[]) => ({ nums })
  })
  .setHelpers(dispatch => ({
    addNumAsync: async (num: number) => {
      await Promise.resolve();
      dispatch("ADD_NUM", num);
    }
  }))
  .build();

// export const {
//   Provider: MyStateProvider,
//   useStateContainer: useMyState
// } = createStateContainer({
//   name: "MyState",
//   initialState: {
//     nums: [] as number[]
//   },
//   actionHandlers: {
//     RESET_NUMS: () => ({ nums: [] }),
//     ADD_NUM: ({ nums }, num: number) => {
//       nums.push(num);
//       return { nums };
//     },
//     SET_NUMS: ({}, nums: number[]) => ({ nums })
//   },
//   helpers: {
//     test: () => {
//       const { dispatch } = useMyState();
//       dispatch("RESET_NUMS");
//     }
//   }
// });