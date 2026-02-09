'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  HeaderMenu,
  UserAvatar,
  LanguageAccordion,
  CurrencyAccordion,
  useI18n,
  useAkinAuth,
} from '@akin-travel/partner-sdk';

export function Header() {
  const { t } = useI18n();
  const { isAuthenticated, isLoading } = useAkinAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image
            src="https://storage.googleapis.com/dev-akin-images/partners/b8a131b2-c40d-42f3-8a23-604d74e99999/logo-1768787414812.png"
            alt="Viajero"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        {/* Right side: Auth buttons + Menu */}
        <div className="flex items-center gap-3">
          {/* Sign In / Join Free buttons - only shown when not authenticated and not loading */}
          {!isLoading && !isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900"
              >
                {t('header.signIn')}
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('header.joinFree')}
              </Link>
            </div>
          )}

          <HeaderMenu>
            {({ isOpen, toggle, isAuthenticated: isAuth, userInfo, signOut }) => (
              <div className="relative">
                <button
                  onClick={toggle}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <UserAvatar>
                    {({ initials, isAuthenticated: hasAuth }) =>
                      hasAuth ? (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                          {initials}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )
                    }
                  </UserAvatar>
                  <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  {isAuth && userInfo && (
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium">{userInfo.displayName}</p>
                      <p className="text-sm text-gray-500">{userInfo.email}</p>
                      {userInfo.points !== undefined && (
                        <p className="text-sm text-blue-600 mt-1">
                          {userInfo.points.toLocaleString()} points
                        </p>
                      )}
                    </div>
                  )}

                  <nav className="py-2">
                    {isAuth ? (
                      <>
                        <Link
                          href="/loyalty"
                          className="block px-4 py-2 hover:bg-gray-50"
                          onClick={toggle}
                        >
                          {t('header.rewards')}
                        </Link>
                        <Link
                          href="/account"
                          className="block px-4 py-2 hover:bg-gray-50"
                          onClick={toggle}
                        >
                          {t('header.account')}
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        className="block px-4 py-2 hover:bg-gray-50"
                        onClick={toggle}
                      >
                        {t('header.signIn')}
                      </Link>
                    )}

                    {/* Language Selector */}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <LanguageAccordion>
                        {({ currentLanguage, availableLocales, setLocale, isExpanded, toggle: toggleLang }) => (
                          <div>
                            <button
                              onClick={toggleLang}
                              className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50"
                            >
                              <span>{t('header.language')}</span>
                              <span className="text-gray-500">
                                {currentLanguage.nativeName}
                                <svg
                                  className={`inline w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </span>
                            </button>
                            {isExpanded && (
                              <div className="bg-gray-50 py-1">
                                {availableLocales.map((lang) => (
                                  <button
                                    key={lang.code}
                                    onClick={() => setLocale(lang.code)}
                                    className="w-full px-6 py-2 text-left hover:bg-gray-100"
                                  >
                                    {lang.nativeName}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </LanguageAccordion>

                      {/* Currency Selector */}
                      <CurrencyAccordion>
                        {({ currentCurrency, availableCurrencies, setCurrency, isExpanded, toggle: toggleCurr }) => (
                          <div>
                            <button
                              onClick={toggleCurr}
                              className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50"
                            >
                              <span>{t('header.currency')}</span>
                              <span className="text-gray-500">
                                {currentCurrency.symbol} {currentCurrency.code}
                                <svg
                                  className={`inline w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </span>
                            </button>
                            {isExpanded && (
                              <div className="bg-gray-50 py-1">
                                {availableCurrencies.map((curr) => (
                                  <button
                                    key={curr.code}
                                    onClick={() => setCurrency(curr.code)}
                                    className="w-full px-6 py-2 text-left hover:bg-gray-100"
                                  >
                                    {curr.symbol} {curr.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CurrencyAccordion>
                    </div>

                    {/* Sign Out */}
                    {isAuth && (
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={signOut}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50"
                        >
                          {t('header.signOut')}
                        </button>
                      </div>
                    )}
                  </nav>
                </div>
              )}
              </div>
            )}
          </HeaderMenu>
        </div>
      </div>
    </header>
  );
}
