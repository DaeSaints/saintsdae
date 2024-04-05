"use client";
import React from 'react';

import DraggableBall from '../components/draggableball';

export default function Page() {
  return (
    <div style={{ position: 'relative', width: '90vw', height: '90vh' }}>
      <DraggableBall />
    </div>
  );
}
