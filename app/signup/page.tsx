'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignupForm, useAkinAuth, useI18n, PhoneInput } from '@akin-travel/partner-sdk';
import { useEffect, useState } from 'react';
import 'react-phone-number-input/style.css';

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated } = useAkinAuth();
  const { t } = useI18n();
  const [signupComplete, setSignupComplete] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/loyalty');
    }
  }, [isAuthenticated, router]);

  // Show success state after passwordless signup
  if (signupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.signup.success')}</h1>
              <p className="text-gray-600 mb-4">
                {t('signup.checkEmail', { email: submittedEmail })}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {t('signup.clickLink')}
              </p>
              <Link
                href="/login"
                className="text-blue-600 hover:underline text-sm"
              >
                {t('signup.backToLogin')}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Signup Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{t('signup.title')}</h1>
            <p className="text-center text-gray-600 mb-6">{t('signup.subtitle')}</p>

            <SignupForm
              passwordless
              onSuccess={() => {
                // Don't redirect - show success message instead
              }}
              onError={(error) => console.error('Signup error:', error)}
            >
              {({
                firstName,
                setFirstName,
                lastName,
                setLastName,
                email,
                setEmail,
                phone,
                setPhone,
                termsAccepted,
                setTermsAccepted,
                marketingOptIn,
                setMarketingOptIn,
                isLoading,
                error,
                handleSubmit,
                clearError,
              }) => (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmittedEmail(email);
                    await handleSubmit(e);
                    // Show success state if no error after submission
                    if (!error) {
                      setSignupComplete(true);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.signup.firstName')}
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          clearError();
                        }}
                        placeholder={t('auth.signup.firstName')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.signup.lastName')}
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          clearError();
                        }}
                        placeholder={t('auth.signup.lastName')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.signup.email')}
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

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.signup.phone')}
                    </label>
                    <PhoneInput
                      id="phone"
                      value={phone}
                      onChange={(value) => {
                        setPhone(value);
                        clearError();
                      }}
                      defaultCountry="AR"
                      placeholder={t('auth.signup.phone')}
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        {t('auth.signup.termsAccepted')}
                      </label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        id="marketing"
                        type="checkbox"
                        checked={marketingOptIn}
                        onChange={(e) => setMarketingOptIn(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="marketing" className="text-sm text-gray-600">
                        {t('auth.signup.marketingOptIn')}
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? t('common.loading') : t('auth.signup.submit')}
                  </button>
                </form>
              )}
            </SignupForm>

            <p className="text-center text-sm text-gray-600 mt-6">
              {t('auth.signup.hasAccount')}{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                {t('auth.signup.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
