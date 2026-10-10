'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/busgo/sw.js', { scope: '/busgo/' });
    }
  }, []);

  return null;
}
