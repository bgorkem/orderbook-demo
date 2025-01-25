import OrderBook from "./components/OrderBook";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1>Crypto Order Book</h1>
      <OrderBook symbol="BTC-USD" />
    </div>
  );
}

export default App;
