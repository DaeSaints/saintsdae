"use client";
import React from 'react';
import ReactivePolygon from '../components/reactivepolygon';

export default function Page() {
  return (
    <div>
      <ReactivePolygon sides={5} size={50} color="red" />
    </div>
  );
}
