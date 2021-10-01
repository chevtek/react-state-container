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

    SIGN_IN: (state) => {
      state.user.authenticated = true;
    },

    SIGN_OUT: (state) => {
      state.user.authenticated = false;
    },

    /**
     * Note here that "uiTheme" is explicitly typed to "string"
     * in order to tell the container what type of data your
     * action expects when you dispatch the action later on.
     * 
     * If you're not using TypeScript then this is not necessary.
     * If you *are* using TypeScript with "noImplicitAny" then
     * TS will appropriately warn of implied "any" type here.
     */
    SET_THEME: (state, uiTheme: string) => {
      state.uiTheme = uiTheme;
    }

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
    username?: string;
    admin: boolean;
    authenticated: boolean;
    discombobulated: boolean;
  };
  uiTheme: "Light" | "Dark";
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
      state.activeThing = thing;
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

## What if I want to compare object references in my action handler?

Say you have a `state` with an object on it like so:

```ts
const state = {
  user: {
    username: "chev",
    favoriteColor: "green"
  }
};
```

This module utilizes the [immer](https://immerjs.github.io/immer/) utility to handle state immutability. Which can quickly get [complicated](https://reactjs.org/docs/update.html) to handle on our own. What this means is that the `state` object you are interacting with in your action handlers is not the actual state object. This can sometimes be a hurdle if you're trying to compare object references. For example:

```ts
// src/hooks/useMyContainer.ts

type State = {
  user: {
    username: string;
    favoriteColor: string;
  };
};

type User = State["user"];

// ...

  .setState({
    user: {
      username: "chev",
      favoriteColor: "green"
    }
  } as State)
  .setActions({

    SET_USER: (state, newUser: User) => {
      if (newUser === state.user) return; // state.user !== newUser here!!!
    }

  })

// src/components/Home.tsx

// ...

const { state, dispatch } = useMyContainer();
// Passing in the existing user to SET_USER
dispatch("SET_USER", state.user);
```

This is expected as `state` is supposed to be [immutable](https://en.wikipedia.org/wiki/Immutable_object#:~:text=In%20object%2Doriented%20and%20functional,modified%20after%20it%20is%20created.), but there is a way to get reference to the original `state` object if you really need to. The immer package comes with a utility function called `original` for exactly that purpose, and this module also re-exports all available utilities from immer :D

```ts
// src/hooks/useMyContainer.ts

import { original } from "@chevtek/react-state-container";

SET_USER: (state, newUser: User) => {
  if (newUser === original(state.user)) return; // Now this returns true as expected :)
}

// src/components/Home.tsx

const { state, dispatch } = useMyContainer();
// Passing in the existing user to SET_USER
dispatch("SET_USER", state.user);
```

For a list of all available immer utilities you visit their documentation [here](https://immerjs.github.io/immer/api).

## Wait, I can just edit the `state` variable directly in my action handlers? I thought you just said `state` was immutable?

Yep, the immer utility provides our action handlers with a [draft state](https://immerjs.github.io/immer/update-patterns) that acts as a proxy for the real `state`. You can modify it to your heart's content and it will not negatively effect `state` immutability. Yay!

If you need to short-circuit an action simply return nothing as we did in the above example where we showed how to compare object references. By returning `void` you tell the state container that you wish to abort updating state.

```ts
SET_USER_ROLE: (state, userRole: string) {
  if (state.user.roles.includes(userRole)) return; // User has role already, abort!
}
```

## What happens if I return data from an action handler instead of `void`?

If you return data from an action handler it is expected to be a replacement for the entire `state` object. If you're using TypeScript then the compiler will get upset if you are not returning a proper instance of your `state` object.

```ts
// src/hooks/useMyStateContainer.ts

type User = {
  username: string;
  age: number;
  favoriteColor: string;
  admin: boolean;
}

// ...

  .setState({
    user: {
      username: "chev",
      age: 34,
      favoriteColor: "green",
      admin: true
    }
  })
  .setActions({

    SWAP_USER: (state, newUser: User) => {
      return newUser; // ERROR: user is merely a property on state and we just tried to replace state with a user object.
      return { user: newUser }; // SUCCESS: This properly matches our state structure.
    }

  })
  .build();
```

> IMPORTANT NOTE: While both patterns of `state` manipulation are valid, you CANNOT do both simultaneously or it will throw an error. You must either manipulate properties of `state` ***OR*** return data from your action handler. Not both.

---

### Powered by [Chevtek](https://chevtek.io)