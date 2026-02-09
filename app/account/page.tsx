'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAkinAuth,
  useI18n,
  RequireAuth,
  AccountInfoSection,
  NotificationPreferencesSection,
  PasskeySection,
} from '@akin-travel/partner-sdk';

export default function AccountPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAkinAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <RequireAuth fallback={null}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">{t('account.title')}</h1>

          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <AccountInfoSection>
              {({
                member,
                isEditing,
                setIsEditing,
                formData,
                setFormField,
                handleSubmit,
                handleCancel,
                isLoading: isSaving,
                error,
                success,
              }) => (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{t('account.profile.title')}</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        {t('account.profile.edit')}
                      </button>
                    )}
                  </div>

                  {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
                      {success}
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {isEditing ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('account.profile.firstName')}
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormField('firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('account.profile.lastName')}
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormField('lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('account.profile.email')}
                        </label>
                        <input
                          type="email"
                          value={member?.email ?? ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('account.profile.phone')}
                        </label>
                        <input
                          type="tel"
                          value={formData.phone ?? ''}
                          onChange={(e) => setFormField('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSaving ? t('common.loading') : t('account.profile.save')}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          {t('account.profile.cancel')}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">{t('account.profile.firstName')}</p>
                        <p className="text-base">{member?.firstName ?? '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('account.profile.lastName')}</p>
                        <p className="text-base">{member?.lastName ?? '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('account.profile.email')}</p>
                        <p className="text-base">{member?.email ?? '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('account.profile.phone')}</p>
                        <p className="text-base">{member?.phone ?? '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AccountInfoSection>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <NotificationPreferencesSection>
              {({ preferences, setPreference, handleSave, isLoading: isSaving, isDirty, success, error }) => (
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">{t('account.notifications.title')}</h2>

                  {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
                      {success}
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={preferences.marketingOptIn}
                        onChange={(e) => setPreference('marketingOptIn', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>{t('account.notifications.marketing')}</span>
                    </label>
                  </div>

                  {isDirty && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? t('common.loading') : t('common.save')}
                    </button>
                  )}
                </div>
              )}
            </NotificationPreferencesSection>
          </div>

          {/* Passkeys */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <PasskeySection>
              {({ passkeys, isSupported, registerPasskey, removePasskey, isLoading: isPending, success, error }) => (
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-2">{t('account.passkeys.title')}</h2>
                  <p className="text-sm text-gray-500 mb-4">{t('account.passkeys.description')}</p>

                  {!isSupported && (
                    <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                      Passkeys are not supported in this browser
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
                      {success}
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {passkeys.length > 0 ? (
                    <ul className="space-y-2 mb-4">
                      {passkeys.map((pk) => (
                        <li key={pk.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{pk.name}</p>
                            <p className="text-xs text-gray-500">
                              Added {pk.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => removePasskey(pk.id)}
                            disabled={isPending}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            {t('account.passkeys.remove')}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">{t('account.passkeys.noPasskeys')}</p>
                  )}

                  <button
                    onClick={registerPasskey}
                    disabled={!isSupported || isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? t('common.loading') : t('account.passkeys.add')}
                  </button>
                </div>
              )}
            </PasskeySection>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
