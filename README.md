# Crypto Order Book Demo

A real-time cryptocurrency order book simulation with WebSocket updates and optimized rendering.

## Features

- Real-time order book updates (100ms intervals)
- Virtualized rendering for smooth performance with large datasets
- Visual depth indication for order sizes
- Clean, dark theme UI
- Spread calculation
- Optimized for minimal UI jank during rapid updates

## Technologies Used

- React + TypeScript
- Vite
- Socket.IO for WebSocket communication
- TanStack Virtual for virtualized rendering
- CSS Grid for layout

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the WebSocket server:

```bash
npm run server
```

3. In a new terminal, start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Performance Optimizations

- Uses virtualization to render only visible order book rows
- Memoized components to prevent unnecessary re-renders
- CSS transitions for smooth updates
- Efficient data structure for order book updates
- Background gradient rendering for depth visualization
