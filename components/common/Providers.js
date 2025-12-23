'use client';

import { UserDataProvider } from '@/contexts/UserDataContext';

export function Providers({ children }) {
  return (
    <UserDataProvider>
      {children}
    </UserDataProvider>
  );
}

