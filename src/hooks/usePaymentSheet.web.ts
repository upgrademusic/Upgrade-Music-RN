export function usePaymentSheet() {
  const initPaymentSheet = async (_opts: any) => ({ error: null });
  const presentPaymentSheet = async () => ({ error: { message: 'Payments require the mobile app' } });
  return { initPaymentSheet, presentPaymentSheet };
}
