'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAkinAuth, useI18n } from '@akin-travel/partner-sdk';

type VerifyState = 'loading' | 'success' | 'error';

function AuthVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyMagicLink, isAuthenticated } = useAkinAuth();
  const { t } = useI18n();

  const [state, setState] = useState<VerifyState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError(t('verify.invalidLink'));
      setState('error');
      return;
    }

    const verify = async () => {
      const result = await verifyMagicLink(token);

      if (!result.success) {
        setError(result.error || t('verify.failed'));
        setState('error');
        return;
      }

      setState('success');
      // Redirect after a brief success state
      setTimeout(() => {
        router.push('/loyalty');
      }, 1500);
    };

    verify();
  }, [searchParams, verifyMagicLink, router, t]);

  // If already authenticated and state is success, redirect immediately
  useEffect(() => {
    if (isAuthenticated && state === 'success') {
      router.push('/loyalty');
    }
  }, [isAuthenticated, state, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
            {state === 'loading' && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.verify.title')}</h1>
                <p className="text-gray-600">
                  {t('verify.pleaseWait')}
                </p>
              </>
            )}

            {state === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.verify.success')}</h1>
                <p className="text-gray-600">
                  {t('verify.redirecting')}
                </p>
              </>
            )}

            {state === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.verify.error')}</h1>
                <p className="text-gray-600 mb-6">
                  {error}
                </p>
                <div className="space-y-3">
                  <Link
                    href="/signup"
                    className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                  >
                    {t('auth.verify.tryAgain')}
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
                  >
                    {t('signup.backToLogin')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthVerifyContent />
    </Suspense>
  );
}
