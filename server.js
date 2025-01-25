import { Server } from "socket.io";

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

function generateOrderBook() {
  const midPrice = 40000 + Math.random() * 1000;
  const asks = [];
  const bids = [];

  // Generate 100 asks above mid price
  for (let i = 0; i < 100; i++) {
    const price = midPrice + i * 2 + Math.random();
    const size = Math.random() * 2;
    asks.push([price, size]);
  }

  // Generate 100 bids below mid price
  for (let i = 0; i < 100; i++) {
    const price = midPrice - i * 2 - Math.random();
    const size = Math.random() * 2;
    bids.push([price, size]);
  }

  // Sort asks ascending and bids descending
  asks.sort((a, b) => a[0] - b[0]);
  bids.sort((a, b) => b[0] - a[0]);

  return { asks, bids };
}

io.on("connection", (socket) => {
  console.log("Client connected");
  let interval;

  socket.on("subscribe", (symbol) => {
    console.log(`Subscribed to ${symbol}`);

    // Send initial order book
    socket.emit("orderbook", generateOrderBook());

    // Update every 100ms
    interval = setInterval(() => {
      socket.emit("orderbook", generateOrderBook());
    }, 100);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    if (interval) {
      clearInterval(interval);
    }
  });
});

console.log("WebSocket server running on port 3001");
