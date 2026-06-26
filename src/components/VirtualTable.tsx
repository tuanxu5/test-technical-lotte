import React, { useState, useRef, useEffect, type UIEvent } from 'react';

interface VirtualTableProps<T> {
  data: T[];
  rowHeight: number;
  visibleHeight: number;
  className?: string;
  renderRow: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
}

export function VirtualTable<T>({
  data,
  rowHeight,
  visibleHeight,
  className = '',
  renderRow,
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position to top when data changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [data]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = data.length * rowHeight;
  
  // Calculate index range to render
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2); // 2 rows buffer before
  const endIndex = Math.min(
    data.length - 1,
    Math.floor((scrollTop + visibleHeight) / rowHeight) + 2 // 2 rows buffer after
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const item = data[i];
    if (item) {
      const style: React.CSSProperties = {
        position: 'absolute',
        top: i * rowHeight,
        left: 0,
        right: 0,
        height: rowHeight,
      };
      visibleItems.push({ item, index: i, style });
    }
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`virtual-scroll-container ${className}`}
      style={{
        position: 'relative',
        height: visibleHeight,
        overflowY: 'auto',
        width: '100%',
      }}
    >
      <div
        className="virtual-scroll-phantom"
        style={{
          height: totalHeight,
          width: '100%',
          pointerEvents: 'none',
        }}
      />
      <div
        className="virtual-scroll-content"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
        }}
      >
        {visibleItems.map(({ item, index, style }) => renderRow(item, index, style))}
      </div>
    </div>
  );
}
