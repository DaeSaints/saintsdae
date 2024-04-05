import React, { useRef, useEffect, useState } from 'react';

const ReactivePolygon = ({ sides, size, color }) => {
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    setCanvasReady(true);
  }, []);

  useEffect(() => {
    if (!canvasReady) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const drawPolygon = (x, y) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate coordinates for polygon points relative to cursor position
      const centerX = x;
      const centerY = y;
      const angle = (Math.PI * 2) / sides;
      ctx.beginPath();
      ctx.moveTo(centerX + size * Math.cos(0), centerY + size * Math.sin(0));
      for (let i = 1; i <= sides; i++) {
        ctx.lineTo(centerX + size * Math.cos(angle * i), centerY + size * Math.sin(angle * i));
      }
      ctx.closePath();
      
      // Fill and stroke the polygon
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      drawPolygon(x, y);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sides, size, color, canvasReady]);

  if (!canvasReady) return null;

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />;
};

export default ReactivePolygon;
