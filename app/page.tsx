'use client';

import Link from 'next/link';
import { useAkinAuth, useI18n } from '@akin-travel/partner-sdk';

export default function HomePage() {
  const { isAuthenticated, member, isLoading } = useAkinAuth();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {isAuthenticated ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.welcomeBack', { name: member?.firstName || '' })}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('home.youHavePoints', { points: (member?.spendableNetworkPoints ?? 0).toLocaleString() })}
            </p>
            <Link
              href="/loyalty"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              {t('home.viewRewards')}
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {t('home.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
              >
                {t('home.joinNow')}
              </Link>
              <Link
                href="/login"
                className="bg-white text-gray-700 px-6 py-3 rounded border hover:bg-gray-50"
              >
                {t('header.signIn')}
              </Link>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">{t('home.earnPoints')}</h3>
            <p className="text-gray-600 text-sm">
              {t('home.earnPointsDesc')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">{t('home.unlockPerks')}</h3>
            <p className="text-gray-600 text-sm">
              {t('home.unlockPerksDesc')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">{t('home.levelUp')}</h3>
            <p className="text-gray-600 text-sm">
              {t('home.levelUpDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
