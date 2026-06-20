import type { ReactNode } from 'react';

export function StripeProvider({ children }: { children: ReactNode; publishableKey: string }) {
  return <>{children}</>;
}
