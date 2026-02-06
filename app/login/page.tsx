'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoginForm, useAkinAuth, useI18n } from '@akin-travel/partner-sdk';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAkinAuth();
  const { t } = useI18n();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/loyalty');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{t('auth.login.title')}</h1>
            <p className="text-center text-gray-600 mb-6">{t('login.subtitle')}</p>

            <LoginForm
              onSuccess={() => router.push('/loyalty')}
              onError={(error) => console.error('Login error:', error)}
            >
              {({
                mode,
                setMode,
                email,
                setEmail,
                isLoading,
                error,
                passkeySupported,
                handlePasskeyLogin,
                handleMagicLink,
                handleResendMagicLink,
                clearError,
              }) => (
                <div className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
                      {error}
                    </div>
                  )}

                  {/* Passkey Mode */}
                  {mode === 'passkey' && (
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={handlePasskeyLogin}
                        disabled={!passkeySupported || isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          t('common.loading')
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                            {t('auth.login.continueWithPasskey')}
                          </>
                        )}
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">{t('auth.login.or')}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          clearError();
                          setMode('magic-link');
                        }}
                        className="w-full bg-white text-gray-700 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {t('auth.login.continueWithEmail')}
                      </button>
                    </div>
                  )}

                  {/* Magic Link Mode */}
                  {mode === 'magic-link' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('auth.login.email')}
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearError();
                          }}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleMagicLink}
                        disabled={isLoading || !email}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? t('common.loading') : t('auth.login.sendMagicLink')}
                      </button>

                      {passkeySupported && (
                        <button
                          type="button"
                          onClick={() => {
                            clearError();
                            setMode('passkey');
                          }}
                          className="w-full text-sm text-blue-600 hover:underline"
                        >
                          {t('auth.login.tryAnotherMethod')}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Magic Link Sent Mode */}
                  {mode === 'magic-link-sent' && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{t('auth.login.magicLinkSent')}</h2>
                        <p className="text-gray-600 mt-1">
                          {t('auth.login.magicLinkSentDescription', { email })}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleResendMagicLink}
                        disabled={isLoading}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {isLoading ? t('common.loading') : t('auth.login.resendLink')}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          clearError();
                          setMode('magic-link');
                        }}
                        className="block w-full text-sm text-gray-600 hover:underline"
                      >
                        {t('auth.login.tryAnotherMethod')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </LoginForm>

            <p className="text-center text-sm text-gray-600 mt-6">
              {t('auth.login.noAccount')}{' '}
              <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                {t('auth.login.signUp')}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
