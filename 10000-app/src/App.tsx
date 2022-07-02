import React from "react";
import "./App.css";
import { GameBoard } from "./components/GameBoard";

function App() {
  return (
    <div className="App">
      <header className="App-header"></header>
      <section>
        <GameBoard></GameBoard>
      </section>
    </div>
  );
}

export default App;
