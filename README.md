# React State Container by Chevtek

If you're looking to steer away from Redux in favor of React's `useReducer` and `useContext` then you might appreciate this package. It provides what I've decided to call a ***React State Container*** which is not too dissimilar from Redux's `createSlice` functionality, though I have not explicitly used Redux to inform any of the patterns here. Rather, everything here is inspired by actual needs and use-cases I've encountered on the job.

Enjoy!

---

## Installation

```bash
$ npm install @chevtek/react-state-container
```

or

```bash
$ yarn install @chevtek/react-state-container
```

---

## Basic Usage

### Creating the container

```ts
// src/hooks/useMyContainer.ts

import createStateContainer from "@chevtek/react-state-container";

export const [
  MyContainerProvider,
  useMyContainer
] = createStateContainer("MyContainer")
  .setState({
    user: {
      username: "",
      admin: false,
      authenticated: false,
      discombobulated: true
    },
    uiTheme: "Light"
  })
  .setActions({

    SIGN_IN: (state) => ({
      user: {
        authenticated: true
      }
    }),

    SIGN_OUT: (state) => ({
      user: {
        authenticated: false
      }
    }),

    /**
     * Note here that "uiTheme" is explicitly typed to "string"
     * in order to tell the container what type of data your
     * action expects when you dispatch the action later on.
     * 
     * If you're not using TypeScript then this is not necessary.
     * If you *are* using TypeScript with "noImplicitAny" then
     * TS will appropriately warn of implied "any" type here.
     */
    SET_THEME: (state, uiTheme: string) => ({ uiTheme })

  })
  .build();
```

### Setup the container provider

```ts
// src/App.tsx

import React from "react";
import Home from "./components/Home";
import { MyContainerProvider } from "./hooks/useMyContainer";

export default function App () {
  return (
    <React.StrictMode>
      <MyContainerProvider>
        <Home/> // The rest of your app
      </MyContainerProvider>
    </React.StrictMode>
  );
}
```

### Consuming the hook

```ts
// src/components/Home.tsx

import React from "react";
import useStyles from "./hooks/useStyles";
import { useMyContainer } from "./hooks/useMyContainer";

export default function Home () {
  const { state, dispatch } = useMyContainer();
  const { user, uiTheme } = state;
  const classes = useStyles(uiTheme);

  const onAuthClick = () => {
    if (user.authenticated) {
      dispatch("SIGN_OUT");
    } else {
      dispatch("SIGN_IN");
    }
  }

  return (
    <div className={classes.homePage}>

      <h1>User is: {user.authenticated ? user.username : "not logged in"}</h1>

      <button onClick={onAuthClick}>{user.authenticated ? "Sign Out" : "Sign In"}</button>

      <button onClick={() => dispatch("SET_THEME", "Dark")}>Set theme to dark!</button>

    </div>
  )
}
```

---

## Advanced Usage

### What if I need more complexity in my state?

Maybe you don't want a default value for every potential property on your state object. Or maybe you want to constrain the potential values of a property. To accomplish this simply cast your state object to a pre-defined type :)

```ts
// src/hooks/useMyContainer.ts

type State = {
  user: {
    username?: string,
    admin: boolean,
    authenticated: boolean,
    discombobulated: boolean
  },
  uiTheme: "Light" | "Dark"
};

// ...

  .setState({
    user: {
      admin: false,
      authenticated: false,
      discombobulated: true
    },
    uiTheme: "Light"
  } as State)
```

You could also define your state separately and just pass it in.

```ts
const initialState: State = {
  user: {
    admin: false,
    authenticated: false,
    discombobulated: true
  },
  uiTheme: "Light"
};

// ...

  .setState(initialState)
```

> NOTE: While it's fine to define the `state` object ahead of time rather than inline, I recommend writing your action handlers inline if you're using TypeScript because intellisense will act as a guide as you craft your actions.

## What about async action helpers?

This module provides a clean way to define *helper functions*. If you're familiar with the action/reducer pattern then you probably know what a pain it can be when you want to perform the same asynchronous task over and over again. Maybe you need to fire a single action from many places in your app but each time you need to dispatch that action you have to provide it with the same data every time and that data has to be fetched asynchronously. You can make your life easier with helpers!

```ts
// src/hooks/useMyContainer.ts

// ...

  .setActions({

    SET_ACTIVE_THING: (state, thing: Thing) => {
      return { activeThing: thing };
    }

  })
  .setHelpers(dispatch => ({

    setActiveThingById: async (thingId: string) => {
      const thing = await axios.get(`/api/thing/${thingId}`);
      dispatch("SET_ACTIVE_THING", thing);
    }

  }))
```

Once you've set up a helper you can easily access your helpers the same way you access `dispatch`.

```ts
// src/components/Home.tsx

// ...

export default function Home ({ thingId }) {
  const { state, helpers } = useMyContainer();

  useEffect(() => {

    const initializeThings = async () => {
      await helpers.setActiveThingById(thingId);
    };

    initializeThings().catch(console.log);
    
  }, [thingId]);

  return (
    /* ... */
  )
}
```

Helpers don't *have* to be asynchronous but it is their most common usage by far. Feel free to get creative within the `.setHelpers(dispatch => { /*...*/ })` space!