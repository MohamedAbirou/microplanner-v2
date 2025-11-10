// Extend Window interface for Clerk
declare global {
  interface Window {
    Clerk?: {
      session: Promise<{
        getToken: () => Promise<string>;
      } | null>;
    };
  }
}

export {};
