
import React from 'react';
import ReactDOM from 'react-dom';
import Lark from "./assets/demo.png"
import './main.css'

function Test() {
  return (
    <div className="main">
      <h1>Test Azure Blob Storage</h1>
      <img src={Lark}></img>
    </div>

  )
}

ReactDOM.render(<Test />,document.querySelector('#app'))