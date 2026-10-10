'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/bus-go/sw.js', { scope: '/bus-go/' });
    }
  }, []);

  return null;
}
