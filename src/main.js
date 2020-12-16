
import React from 'react';
import ReactDOM from 'react-dom';
import Lark from "./assets/test.png"

function Test() {
  return (
    <div>
      <img src={Lark}></img>
    </div>

  )
}

ReactDOM.render(<Test />,document.querySelector('#app'))