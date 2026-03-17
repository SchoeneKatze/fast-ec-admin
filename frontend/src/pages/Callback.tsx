import { useEffect } from "react";
import { useLogto, useHandleSignInCallback } from "@logto/react"; // 引入新的 Hook

export default function Callback() {
  const { isAuthenticated } = useLogto();

  const { isLoading } = useHandleSignInCallback(() => {
    console.log("[Callback] handleSignInCallback completed");
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("[Callback] Authenticated, redirecting to home");
      window.location.href = "/";
    }
  }, [isLoading, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f6f6f8]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#21c45d] mx-auto mb-4"></div>
        <p className="text-slate-600">Completing authentication...</p>
      </div>
    </div>
  );
}
