import React, { useEffect } from 'react';
import { useLogto } from "@logto/react";

export default function Callback() {
  const { isLoading, handleSignInCallback, isAuthenticated } = useLogto();

  useEffect(() => {
    console.log('🔐 [Callback] Component mounted - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    
    const completeSignIn = async () => {
      try {
        console.log('🔐 [Callback] Calling handleSignInCallback...');
        await handleSignInCallback();
        console.log('✅ [Callback] handleSignInCallback completed successfully');
        
        // Add small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔐 [Callback] About to redirect to home');
        window.location.href = '/';
      } catch (error) {
        console.error('❌ [Callback] handleSignInCallback failed:', error);
        // Still redirect to home
        window.location.href = '/';
      }
    };

    if (!isLoading) {
      completeSignIn();
    }
  }, [isLoading, handleSignInCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f6f6f8]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#21c45d] mx-auto mb-4"></div>
        <p className="text-slate-600">Completing authentication...</p>
      </div>
    </div>
  );
}
