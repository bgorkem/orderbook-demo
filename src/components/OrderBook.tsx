import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { io } from "socket.io-client";
import "./OrderBook.css";

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface OrderBookProps {
  symbol: string;
}

const OrderBookRow = memo(
  ({
    entry,
    side,
    maxTotal,
  }: {
    entry: OrderBookEntry;
    side: "buy" | "sell";
    maxTotal: number;
  }) => {
    const percentage = (entry.total / maxTotal) * 100;
    const bgStyle = {
      background: `linear-gradient(${side === "sell" ? "to left" : "to right"}, 
      ${side === "sell" ? "#ff444422" : "#00ff0022"} ${percentage}%, 
      transparent ${percentage}%)`,
    };

    return (
      <div className={`order-book-row ${side}`} style={bgStyle}>
        <span className="price">{entry.price.toFixed(2)}</span>
        <span className="size">{entry.size.toFixed(4)}</span>
        <span className="total">{entry.total.toFixed(4)}</span>
      </div>
    );
  }
);

const OrderBook = ({ symbol }: OrderBookProps) => {
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  const askVirtualizer = useVirtualizer<Element, Element>({
    count: asks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 25,
    overscan: 5,
  });

  const bidVirtualizer = useVirtualizer<Element, Element>({
    count: bids.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 25,
    overscan: 5,
  });

  const maxTotal = Math.max(
    asks.length > 0 ? asks[asks.length - 1].total : 0,
    bids.length > 0 ? bids[bids.length - 1].total : 0
  );

  useEffect(() => {
    const socket = io("ws://localhost:3001");

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
      socket.emit("subscribe", symbol);
    });

    socket.on(
      "orderbook",
      (data: { bids: [number, number][]; asks: [number, number][] }) => {
        const processOrders = (orders: [number, number][]) => {
          return orders.reduce<OrderBookEntry[]>((acc, [price, size]) => {
            const total = (acc[acc.length - 1]?.total || 0) + size;
            acc.push({ price, size, total });
            return acc;
          }, []);
        };

        setAsks(processOrders(data.asks));
        setBids(processOrders(data.bids));
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [symbol]);

  const renderVirtualList = useCallback(
    (
      virtualizer: ReturnType<typeof useVirtualizer>,
      items: OrderBookEntry[],
      side: "buy" | "sell"
    ) => {
      return (
        <div
          className={`virtual-list ${side}`}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <OrderBookRow
                entry={items[virtualRow.index]}
                side={side}
                maxTotal={maxTotal}
              />
            </div>
          ))}
        </div>
      );
    },
    [maxTotal]
  );

  return (
    <div className="order-book-container" ref={parentRef}>
      <div className="header">
        <span>Price</span>
        <span>Size</span>
        <span>Total</span>
      </div>
      <div className="asks">
        {renderVirtualList(askVirtualizer, asks, "sell")}
      </div>
      <div className="spread">
        Spread:{" "}
        {asks[0] && bids[0] ? (asks[0].price - bids[0].price).toFixed(2) : "-"}
      </div>
      <div className="bids">
        {renderVirtualList(bidVirtualizer, bids, "buy")}
      </div>
    </div>
  );
};

export default OrderBook;
