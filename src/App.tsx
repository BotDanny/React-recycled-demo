import React from 'react';
import logo from './logo.svg';
import './App.css';
import FixedList from './FixedList';

function App() {
  const data = Array(50).fill(null).map((_, index) => index)
  return (
    <div className="App">
      <FixedList
        height={350}
        data={data}
        rowHeight={100}
      />
    </div>
  );
}

export default App;
