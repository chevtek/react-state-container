import React from 'react';
import './App.css';
import { useMyState } from "./hooks/useMyState";
import random from "lodash/random";

const App: React.FC = () => {
  const { state, dispatch, helpers } = useMyState();
  return (
    <div className="App">
      <h1>Numbers</h1>
      <div>{state.nums.join(", ")}</div>
      <div>
        <button onClick={() => dispatch("RESET_NUMS")}>Reset</button>
        <button onClick={() => dispatch("ADD_NUM", random(10))}>
          Add Number
        </button>
        <button onClick={() => dispatch("SET_NUMS", [6, 6, 6])}>
          Set Numbers
        </button>
        <button onClick={() => { helpers?.addNumAsync(555); dispatch("ADD_NUM", 444); } }>TEST</button>
      </div>
    </div>
  );
}

export default App;