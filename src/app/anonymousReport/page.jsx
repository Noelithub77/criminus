'use client';
import "./App.css";
import SendMessage from "./SendMessage";

function App() {
  return (
    <>
      <div className="AppHeader">
        <h1>Anonymous Reporting</h1>
        <p>Report a message anonymously</p>
      </div>
      <SendMessage />
    </>
  );
}

export default App;
