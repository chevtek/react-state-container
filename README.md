# React State Container by Chevtek

If you're looking to steer away from Redux in favor of React's `useReducer` and `useContext` then you might appreciate this package. It provides what I've decided to call a ***React State Container*** which is not too dissimilar from Redux's `createSlice` functionality, though I have not explicitly used Redux to inform any of the patterns here. Rather, everything here is inspired by actual needs and use-cases I've encountered on the job.

Enjoy!

# Installation

```bash
$ npm install @chevtek/react-state-container
```

or

```bash
$ yarn install @chevtek/react-state-container
```

# Basic Usage

## Creating the container

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

## Setup the container provider

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

## Consuming the hook

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

# Advanced Usage

## What if I need more complexity in my state?

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

## What about async actions?

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

If you need to short-circuit an action simply return nothing without modifying the `state` object, as we did in the above example where we showed how to compare object references. By returning `void` you tell the state container that you wish to abort updating state.

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

> IMPORTANT NOTE: While both patterns of `state` manipulation are valid, you CANNOT do both simultaneously or it will throw an error. You must either manipulate properties of `state` ***OR*** return a complete state replacement from your action handler. Not both.

## Is there a way to override default state?

Yes! You can pass a `defaultState` prop to the container provider and that value will override any value you provided when you called `.setState` while defining the container. In addition to that you can provide a handler that will run whenever default state changes, allowing you complete control over how your container's internal state changes.

Confused? Don't worry. Let's walk through it. To start, take a look at this example:

```ts
// src/hooks/useUsers.ts

import createStateContainer, { original } from "@chevtek/react-state-container";

export type User = {
  username: string;
  admin: boolean;
};

export type State = {
  users: User[];
};

export const [
  UsersProvider,
  useUsers
] = createStateContainer("Users")
  .setState({
    users: []
  } as State)
  .setActions({
    // ...
  })
  .build();
```

```ts
// src/App.tsx

import React, { useEffect } from "react";
import axios from "axios";
import { State, UsersProvider } from "./hooks/useMyContainer";

const App = () => {
  let state: State = {
    users: []
  };

  useEffect(() => {
    const init = async () => {
      const { data: users } = axios.get("/api/users");
      state.users = users;
    };
  }, []);
  
  return (
    <UsersProvider defaultState={state}>
      /* rest of your app */
    </UsersProvider>
  )
};

export default App;
```

In this basic example we use a `useEffect` hook to fetch data **once** and then we pass that to the provider as the default state. This works great, but what if `users` changes based on data from higher up in our app? We can update our `useEffect` hook to re-fetch users when that happens.

```ts
// src/App.tsx

import React, { useEffect } from "react";
import axios from "axios";
import { State, UsersProvider } from "./hooks/useMyContainer";

const App = (props) => {
  const { groupId } = props;

  let state: State = {
    users: []
  };

  useEffect(() => {
    const init = async () => {
      const { data: users } = axios.get(`/api/group/${groupId}/users`);
      state.users = users;
    };
  }, [groupId]);
  
  return (
    <UsersProvider defaultState={state}>
      /* rest of your app */
    </UsersProvider>
  )
};

export default App;
```

This will still work great, but what you may notice is that any time the `groupId` changes and new users are fetched, the state in the state container will be overridden. This is probably fine in many scenarios, but what if you're using the container to wrap the incoming data and you don't want to blow away the state when the default state changes? You can define an `onDefaultStateChanged` handler function when you're building your state container.

Let's say for example that the `User` objects coming into your container don't have a `selected` property but you want to augment your container to include that metadata. You wouldn't want all your users' selected states to get reset to `undefined` when the users change. Maybe some users exist in multiple groups and you want to remember that the user selected them.

```ts
// src/hooks/useUsers.ts

export type User = {
  username: string;
  admin: boolean;
};

export type SelectableUser = User & { selected?: boolean };

export type State = {
  users: SelectableUser[];
};

export const [
  UsersProvider,
  useUsers
] = createStateContainer("Users")
  .setState({
    users: []
  } as State)
  .setActions({

    SELECT_USER: (state, userToSelect: SelectableUser) => {
      const user = state.users.find(user => user.username === userToSelect.username);
      user.selected = true;
    },

    DESELECT_USER: (state, userToDeselect: SelectableUser) => {
      const user = state.users.find(user => user.username === userToDeselect.username);
      user.selected = false;
    }

  })
  .onDefaultStateChanged((currentState, incomingState) => {

    // Filter out any users that no longer exist.
    const usernames = incomingState.users.map(user => user.username);
    currentState.users = currentState.users.filter(user => usernames.includes(user.username));

    // Add new users and update existing users.
    for (const userUpdate of incomingState.users) {
      const existingUser = currentState.users.find(user => user.username === userupdate.username);
      if (!existingUser) {
        currentState.users.push(userUpdate);
        continue;
      }
      Object.assign(existingUser, userUpdate);
    }

  })
  .build();
```

Notice that this handler works exactly like an action handler, except that the payload will always be a full state object. Just like with regular action handlers we update state by mutating it in place, hence why we call `Object.assign` and simply pass the existing user as the first argument.

> NOTE: For complex objects you might want to do a deep merge with something like [lodash's merge utility](https://lodash.com/docs/4.17.15#merge).
> 
> `_.merge(existingUser, userUpdate);`

The `userUpdate` objects won't have our optional `selected` property which means `selected` will be undefined on the incoming users array. This allows us to simply merge the updated user properties over the top of any existing users, while preserving any existing `selected` properties already in state.

Any time our array of users changes we now have total control over how those changes are applied to the internal state of our container.

## What if I don't want container state to update at all, even if the default state changes?

Simply handle the `onDefaultStateChanged` by returning nothing. A simple no-op function will do the trick.

```ts
  .onDefaultStateChanged(() => {})
```

---

### Powered by [Chevtek](https://chevtek.io)