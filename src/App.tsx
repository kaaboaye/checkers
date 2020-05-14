import React from "react";
import { loadRust } from "./rust";

// import("./rust").finally(console.log);
loadRust();

export function App() {
  return (
    <div className="App">
      <header className="App-header">
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

        <span>ELKO</span>
      </header>
    </div>
  );
}
