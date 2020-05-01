import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { createCheckers } from "./checkers";

const checkers = createCheckers();

const elko = () => checkers.helloWorld().then(console.log);

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <span onClick={elko}>ELKO</span>
      </header>
    </div>
  );
}

export default App;
