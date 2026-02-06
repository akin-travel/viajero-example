'use client';

import { useRouter } from 'next/navigation';
import {
  useAkinAuth,
  useI18n,
  LoyaltyCard,
  SimpleTierCards,
  UpcomingStays,
  PreviousStays,
  PERK_PREFERENCES,
  VIBE_PREFERENCES,
  LOCATION_PREFERENCES,
} from '@akin-travel/partner-sdk';
import { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Square, CheckSquare, CheckCircle } from 'lucide-react';

// QR Code Styling type for dynamic import
type QRCodeStylingType = typeof import('qr-code-styling').default;

// shadcn components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============================================================================
// Barcode Component (Code 128 pattern)
// ============================================================================
const BARCODE_PATTERNS: Record<string, string> = {
  '0': '212222', '1': '222122', '2': '222221', '3': '121223', '4': '121322',
  '5': '131222', '6': '122213', '7': '122312', '8': '132212', '9': '221213',
};

function generateBarcode(value: string): string[] {
  const bars: string[] = ['211214']; // Start pattern
  for (const char of value.replace(/\D/g, '')) {
    if (BARCODE_PATTERNS[char]) bars.push(BARCODE_PATTERNS[char]);
  }
  bars.push('2331112'); // Stop pattern
  return bars;
}

function Barcode({ value, height = 48, barColor = '#382108' }: { value: string; height?: number; barColor?: string }) {
  const bars = useMemo(() => generateBarcode(value), [value]);
  const svgBars: React.ReactNode[] = [];
  let x = 0;

  bars.forEach((pattern, pi) => {
    for (let i = 0; i < pattern.length; i++) {
      const width = parseInt(pattern[i]);
      if (i % 2 === 0) {
        svgBars.push(<rect key={`${pi}-${i}`} x={x} y={0} width={width} height={height} fill={barColor} />);
      }
      x += width;
    }
  });

  return (
    <svg width={x} height={height} viewBox={`0 0 ${x} ${height}`} className="w-full max-w-[180px]" preserveAspectRatio="xMidYMid meet">
      {svgBars}
    </svg>
  );
}

function formatLoyaltyNumber(num: string): string {
  const digits = num.replace(/\D/g, '');
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

// ============================================================================
// Helper Functions
// ============================================================================
function isLightColor(color: string): boolean {
  if (!color || !color.startsWith('#')) return false;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

// ============================================================================
// QR Code Component (using qr-code-styling)
// ============================================================================
function ReferralQRCode({ referralCode, size = 180 }: { referralCode: string; size?: number }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<InstanceType<QRCodeStylingType> | null>(null);
  const [QRCodeStyling, setQRCodeStyling] = useState<QRCodeStylingType | null>(null);

  // Dynamic import for SSR safety
  useEffect(() => {
    import('qr-code-styling')
      .then((module) => setQRCodeStyling(() => module.default))
      .catch((err) => console.error('Failed to load qr-code-styling', err));
  }, []);

  useEffect(() => {
    if (!QRCodeStyling || !qrRef.current || !referralCode) return;

    // Clear existing
    if (qrCodeRef.current) qrCodeRef.current = null;
    qrRef.current.innerHTML = '';

    const referralUrl = `https://viajero.akintravel.com/signup?ref=${referralCode}`;

    try {
      const qrCode = new QRCodeStyling({
        width: size,
        height: size,
        type: 'svg',
        data: referralUrl,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H',
        },
        dotsOptions: {
          color: '#382108',
          type: 'rounded',
          roundSize: true,
        },
        backgroundOptions: {
          color: '#FFFFFF',
        },
        cornersSquareOptions: {
          color: '#382108',
          type: 'extra-rounded',
        },
        cornersDotOptions: {
          color: '#382108',
          type: 'dot',
        },
      });

      qrCodeRef.current = qrCode;
      qrCode.append(qrRef.current);
    } catch (err) {
      console.error('Failed to create QR code', err);
    }

    return () => {
      if (qrRef.current) qrRef.current.innerHTML = '';
      qrCodeRef.current = null;
    };
  }, [QRCodeStyling, referralCode, size]);

  if (!referralCode) return null;

  return (
    <div
      ref={qrRef}
      className="flex items-center justify-center"
      style={{ minWidth: size, minHeight: size }}
    >
      {!QRCodeStyling && (
        <div className="animate-pulse bg-muted rounded" style={{ width: size, height: size }} />
      )}
    </div>
  );
}

// ============================================================================
// Preferences Step Form (3-step stepper matching website)
// ============================================================================
type PreferencesStep = 'perks' | 'placeTypes' | 'vibe';

function PreferencesStepForm({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState<PreferencesStep>('perks');
  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
  const [selectedPlaceTypes, setSelectedPlaceTypes] = useState<string[]>([]);
  const [vibePreference, setVibePreference] = useState<string>('');

  const isCompleted = (s: PreferencesStep) => {
    if (s === 'perks') return selectedPerks.length > 0;
    if (s === 'placeTypes') return selectedPlaceTypes.length > 0;
    if (s === 'vibe') return vibePreference !== '';
    return false;
  };

  const togglePerk = (id: string) => {
    setSelectedPerks((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const togglePlaceType = (id: string) => {
    setSelectedPlaceTypes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 'perks') setStep('placeTypes');
    else if (step === 'placeTypes') setStep('vibe');
    else if (step === 'vibe') {
      // Save preferences here (API call would go here)
      console.log('Saving preferences:', { selectedPerks, selectedPlaceTypes, vibePreference });
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      {/* Step Navigation */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setStep('perks')}
          className={`w-full text-left flex items-center gap-2 py-2 text-sm ${
            step === 'perks' ? 'text-primary font-semibold' : 'text-muted-foreground'
          }`}
        >
          {isCompleted('perks') && <CheckCircle className="w-4 h-4 text-primary" />}
          {t('loyalty.preferences.step1')}
        </button>
        <button
          type="button"
          onClick={() => setStep('placeTypes')}
          className={`w-full text-left flex items-center gap-2 py-2 text-sm ${
            step === 'placeTypes' ? 'text-primary font-semibold' : 'text-muted-foreground'
          }`}
        >
          {isCompleted('placeTypes') && <CheckCircle className="w-4 h-4 text-primary" />}
          {t('loyalty.preferences.step2')}
        </button>
        <button
          type="button"
          onClick={() => setStep('vibe')}
          className={`w-full text-left flex items-center gap-2 py-2 text-sm ${
            step === 'vibe' ? 'text-primary font-semibold' : 'text-muted-foreground'
          }`}
        >
          {isCompleted('vibe') && <CheckCircle className="w-4 h-4 text-primary" />}
          {t('loyalty.preferences.step3')}
        </button>
      </div>

      {/* Step 1: Perks */}
      {step === 'perks' && (
        <div className="grid grid-cols-2 gap-2">
          {PERK_PREFERENCES.map((perk) => {
            const isSelected = selectedPerks.includes(perk.id);
            const selectedIndex = selectedPerks.indexOf(perk.id);
            return (
              <Card
                key={perk.id}
                className={`border-2 border-dashed cursor-pointer transition-all rounded-xl ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => togglePerk(perk.id)}
              >
                <CardContent className="p-3">
                  <div className="flex flex-col gap-2 items-center text-center">
                    <div className="relative w-full flex items-center justify-center">
                      {isSelected ? (
                        <div className="absolute top-0 left-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-primary-foreground bg-primary">
                          {selectedIndex + 1}
                        </div>
                      ) : (
                        <Square className="absolute top-0 left-0 w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="text-2xl">{perk.icon}</span>
                    </div>
                    <p className="text-xs font-medium leading-tight">{perk.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Step 2: Place Types */}
      {step === 'placeTypes' && (
        <div className="grid grid-cols-2 gap-2">
          {LOCATION_PREFERENCES.map((place) => {
            const isSelected = selectedPlaceTypes.includes(place.id);
            return (
              <Card
                key={place.id}
                className={`border-2 border-dashed cursor-pointer transition-all rounded-xl ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => togglePlaceType(place.id)}
              >
                <CardContent className="p-3">
                  <div className="flex flex-col gap-2 items-center text-center">
                    <div className="relative w-full flex items-center justify-center">
                      {isSelected ? (
                        <CheckSquare className="absolute top-0 left-0 w-5 h-5 text-primary" />
                      ) : (
                        <Square className="absolute top-0 left-0 w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="text-2xl">{place.icon}</span>
                    </div>
                    <p className="text-xs font-medium leading-tight">{place.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Step 3: Vibe */}
      {step === 'vibe' && (
        <div className="space-y-2">
          {VIBE_PREFERENCES.map((vibe) => {
            const isSelected = vibePreference === vibe.id;
            return (
              <Card
                key={vibe.id}
                className={`border-2 border-dashed cursor-pointer transition-all rounded-xl ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setVibePreference(vibe.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 flex-shrink-0 text-primary mt-0.5" />
                    ) : (
                      <Square className="w-5 h-5 flex-shrink-0 text-muted-foreground mt-0.5" />
                    )}
                    <span className="text-2xl">{vibe.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{vibe.label}</p>
                      <p className="text-xs text-muted-foreground">{vibe.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Next Button */}
      <Button
        onClick={handleNext}
        disabled={!isCompleted(step)}
        className="w-full"
      >
        {step === 'vibe' ? t('loyalty.drawer.savePreferences') : t('common.next')}
      </Button>
    </div>
  );
}

// ============================================================================
// Drawer Tab Type
// ============================================================================
type DrawerTab = 'add-stay' | 'refer-friend' | 'preferences';

// ============================================================================
// Main Component
// ============================================================================
export default function LoyaltyPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, member } = useAkinAuth();
  const { t, locale } = useI18n();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('add-stay');

  // Action handlers
  const handleBookNow = () => window.open(`https://viajerohostels.com/${locale || 'en'}`, '_blank');

  const handleAddPastStay = () => {
    setDrawerTab('add-stay');
    setDrawerOpen(true);
  };

  const handleReferFriend = () => {
    setDrawerTab('refer-friend');
    setDrawerOpen(true);
  };

  const handleSetPreferences = () => {
    setDrawerTab('preferences');
    setDrawerOpen(true);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* 1. Loyalty Card */}
        <LoyaltyCard
          onBookNow={handleBookNow}
          onAddPastStay={handleAddPastStay}
          onReferFriend={handleReferFriend}
          onSetPreferences={handleSetPreferences}
        >
          {({
            firstName,
            loyaltyNumber,
            tierDisplayName,
            tierColor,
            memberSince,
            membershipYearEnd,
            membershipYearStats,
            lifetimeStats,
            isLoading,
            onBookNow,
            onAddPastStay,
            onReferFriend,
            onSetPreferences,
          }) => {
            const bgColor = tierColor || '#382108';
            const textColor = isLightColor(bgColor) ? '#382108' : '#FFFFFF';

            return (
              <Card
                className="rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl border-0"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-48" style={{ backgroundColor: `${textColor}20` }} />
                    <Skeleton className="h-6 w-32" style={{ backgroundColor: `${textColor}20` }} />
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:w-[30%] flex flex-col space-y-4">
                      <h1 className="text-2xl md:text-3xl font-bold">
                        {t('loyalty.tierCard.hey')} {firstName}
                      </h1>

                      <div>
                        <p className="text-sm opacity-70 mb-1">
                          {t('loyalty.tierCard.yourTier')}
                        </p>
                        <div className="text-5xl md:text-6xl font-bold">
                          {tierDisplayName || '–'}
                        </div>
                      </div>

                      <p className="text-lg font-medium opacity-90">
                        {t('loyalty.tierCard.earnYourStatus')}
                      </p>

                      <div className="flex flex-col gap-2">
                        {onBookNow && (
                          <Button
                            variant="outline"
                            onClick={onBookNow}
                            className="w-full justify-center border-2 border-dashed bg-transparent hover:bg-white/10"
                            style={{ borderColor: textColor, color: textColor }}
                          >
                            {t('loyalty.tierCard.bookNow')}
                          </Button>
                        )}
                        {onAddPastStay && (
                          <Button
                            variant="outline"
                            onClick={onAddPastStay}
                            className="w-full justify-center border-2 border-dashed bg-transparent hover:bg-white/10"
                            style={{ borderColor: textColor, color: textColor }}
                          >
                            {t('loyalty.tierCard.addPastStay')}
                          </Button>
                        )}
                        {onReferFriend && (
                          <Button
                            variant="outline"
                            onClick={onReferFriend}
                            className="w-full justify-center border-2 border-dashed bg-transparent hover:bg-white/10"
                            style={{ borderColor: textColor, color: textColor }}
                          >
                            {t('loyalty.tierCard.referFriend')}
                          </Button>
                        )}
                        {onSetPreferences && (
                          <Button
                            variant="outline"
                            onClick={onSetPreferences}
                            className="w-full justify-center border-2 border-dashed bg-transparent hover:bg-white/10"
                            style={{ borderColor: textColor, color: textColor }}
                          >
                            {t('loyalty.tierCard.setPreferences')}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* DIVIDER */}
                    <div
                      className="hidden lg:block w-px border-l-2 border-dashed opacity-30"
                      style={{ borderColor: textColor }}
                    />

                    {/* RIGHT COLUMN */}
                    <div className="lg:w-[70%] flex flex-col space-y-6">
                      {/* This Membership Year */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold">
                            {t('loyalty.tierCard.thisMembershipYear')}
                          </h3>
                          <Badge className="text-xs" style={{ backgroundColor: textColor, color: bgColor }}>
                            {t('loyalty.tierCard.by')} {membershipYearEnd.toLocaleDateString(locale || 'en', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </Badge>
                        </div>

                        <div className="flex justify-center gap-8 mb-4">
                          {/* Stays Progress */}
                          <div className="text-center">
                            <div className="relative w-28 h-28">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke={textColor} strokeOpacity="0.2" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke={textColor} strokeWidth="8" strokeLinecap="round"
                                  strokeDasharray={`${Math.min((membershipYearStats.totalStays / 3) * 264, 264)} 264`} />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-bold">{t('loyalty.progress.staysOf', { current: membershipYearStats.totalStays, target: 3 })}</span>
                              </div>
                            </div>
                            <p className="text-sm opacity-70 mt-2">{t('loyalty.progress.originHostels')}</p>
                          </div>

                          {/* Nights Progress */}
                          <div className="text-center">
                            <div className="relative w-28 h-28">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke={textColor} strokeOpacity="0.2" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke={textColor} strokeWidth="8" strokeLinecap="round"
                                  strokeDasharray={`${Math.min((membershipYearStats.totalNights / 7) * 264, 264)} 264`} />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-bold">{t('loyalty.progress.staysOf', { current: membershipYearStats.totalNights, target: 7 })}</span>
                              </div>
                            </div>
                            <p className="text-sm opacity-70 mt-2">{t('loyalty.progress.originNights')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Lifetime Stats */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold">
                            {t('loyalty.tierCard.lifetime')}
                          </h3>
                          {memberSince && (
                            <Badge className="text-xs" style={{ backgroundColor: textColor, color: bgColor }}>
                              {t('loyalty.tierCard.since')} {memberSince.toLocaleDateString(locale || 'en', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </Badge>
                          )}
                        </div>
                        <div className="border-t-2 border-dashed pt-4 opacity-30" style={{ borderColor: textColor }} />
                        <div className="grid grid-cols-2 gap-8 text-center pt-4">
                          <div>
                            <p className="text-xs opacity-70 mb-1">{t('loyalty.progress.originHostels')}</p>
                            <p className="text-2xl font-semibold">{lifetimeStats.totalStays}</p>
                          </div>
                          <div>
                            <p className="text-xs opacity-70 mb-1">{t('loyalty.progress.originNights')}</p>
                            <p className="text-2xl font-semibold">{lifetimeStats.totalNights}</p>
                          </div>
                        </div>
                      </div>

                      {/* Barcode & Loyalty Number */}
                      {loyaltyNumber && (
                        <div className="flex justify-center sm:justify-end pt-4">
                          <div className="flex flex-col items-center space-y-2">
                            <Barcode value={loyaltyNumber} height={48} barColor={textColor} />
                            <span className="text-sm font-medium tracking-wider">
                              {formatLoyaltyNumber(loyaltyNumber)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          }}
        </LoyaltyCard>

        {/* 2. Tier Cards Carousel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t('loyalty.tierCards.title')}</CardTitle>
            <CardDescription>{t('loyalty.tierCards.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleTierCards partnerName="Viajero">
              {({ tierConfigs, formatRequirement, getTextColor, isLoading }) => (
                isLoading ? (
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="flex-shrink-0 w-48 h-56 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="px-12">
                    <Carousel opts={{ align: 'start', loop: false }} className="w-full">
                      <CarouselContent className="-ml-4">
                        {tierConfigs.map((tier) => {
                          const bgColor = tier.tierColor || '#382108';
                          const textColor = getTextColor(bgColor);

                          return (
                            <CarouselItem key={tier.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                              <Card
                                className="rounded-xl p-5 text-center shadow-sm flex flex-col h-full border-0"
                                style={{ backgroundColor: bgColor, color: textColor }}
                              >
                                {tier.tierIcon && (
                                  <div className="mb-3 flex justify-center h-16">
                                    <Image
                                      src={tier.tierIcon}
                                      alt={tier.displayName}
                                      width={64}
                                      height={64}
                                      className="object-contain"
                                      style={{ height: '64px', width: 'auto' }}
                                    />
                                  </div>
                                )}
                                <div className="text-3xl font-bold mb-1">{tier.displayName}</div>
                                {tier.tierByline && (
                                  <p className="text-xs opacity-70 mb-3">{tier.tierByline}</p>
                                )}
                                <div className="text-sm opacity-80 mt-auto">
                                  {tier.maxPerksAllowed} {t('loyalty.tierCards.rewardsPerStay')}
                                </div>
                                {tier.requirements?.filter((r) => r.active).length ? (
                                  <div className="space-y-1 text-xs opacity-70 border-t pt-3 mt-3" style={{ borderColor: `${textColor}33` }}>
                                    {tier.requirements.filter((r) => r.active).map((req) => (
                                      <div key={req.id}>{formatRequirement(req)}</div>
                                    ))}
                                  </div>
                                ) : null}
                              </Card>
                            </CarouselItem>
                          );
                        })}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                )
              )}
            </SimpleTierCards>
          </CardContent>
        </Card>

        {/* 3. Upcoming Stays */}
        <UpcomingStays limit={5}>
          {({ stays, isEmpty, isLoading }) => (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{t('loyalty.upcomingStays.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded" />)}
                  </div>
                ) : isEmpty ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-muted-foreground">{t('loyalty.upcomingStays.empty')}</p>
                    <Button variant="outline" onClick={handleAddPastStay}>
                      {t('loyalty.tierCard.addPastStay')}
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('loyalty.upcomingStays.checkIn')}</TableHead>
                        <TableHead className="text-center">{t('loyalty.upcomingStays.nights')}</TableHead>
                        <TableHead>{t('loyalty.upcomingStays.property')}</TableHead>
                        <TableHead className="text-center">{t('loyalty.upcomingStays.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stays.map((stay) => (
                        <TableRow key={stay.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(stay.checkIn).toLocaleDateString(locale || 'en', { month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-lg font-bold">{stay.nights}</span>
                          </TableCell>
                          <TableCell className="font-medium">{stay.propertyName}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={stay.status === 'CONFIRMED' ? 'default' : 'secondary'}
                              className={stay.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {stay.status === 'CONFIRMED' ? 'Confirmed' : stay.status === 'PENDING' ? 'Pending' : stay.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </UpcomingStays>

        {/* 4. Activity Statement */}
        <PreviousStays limit={10}>
          {({ stays, isEmpty, isLoading }) => (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{t('loyalty.activityStatement.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded" />)}
                  </div>
                ) : isEmpty ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-muted-foreground">{t('loyalty.activityStatement.empty')}</p>
                    <Button variant="outline" onClick={handleAddPastStay}>
                      {t('loyalty.tierCard.addPastStay')}
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('loyalty.activityStatement.type')}</TableHead>
                        <TableHead>{t('loyalty.activityStatement.date')}</TableHead>
                        <TableHead>{t('loyalty.activityStatement.property')}</TableHead>
                        <TableHead className="text-center">{t('loyalty.activityStatement.nights')}</TableHead>
                        <TableHead className="text-center">{t('loyalty.activityStatement.points')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stays.map((stay) => (
                        <TableRow key={stay.id}>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              {t('loyalty.activityStatement.earned')}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(stay.checkOut).toLocaleDateString(locale || 'en', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell>{stay.propertyName}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-lg font-bold">{stay.nights}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {stay.pointsEarned ? `+${stay.pointsEarned}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </PreviousStays>
      </main>

      {/* Onboarding Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-6">
          <SheetHeader>
            <SheetTitle>{t('loyalty.drawer.title')}</SheetTitle>
            <SheetDescription>{t('loyalty.drawer.subtitle')}</SheetDescription>
          </SheetHeader>

          <Tabs value={drawerTab} onValueChange={(v) => setDrawerTab(v as DrawerTab)} className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="add-stay">{t('loyalty.drawer.addStay')}</TabsTrigger>
              <TabsTrigger value="refer-friend">{t('loyalty.drawer.refer')}</TabsTrigger>
              <TabsTrigger value="preferences">{t('loyalty.drawer.preferences')}</TabsTrigger>
            </TabsList>

            <TabsContent value="add-stay" className="mt-6 space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('loyalty.drawer.addStayDesc')}
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('loyalty.drawer.confirmationNumber')}</label>
                  <input
                    type="text"
                    placeholder={t('loyalty.drawer.confirmationPlaceholder')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('loyalty.drawer.lastName')}</label>
                  <input
                    type="text"
                    placeholder={t('loyalty.drawer.lastNamePlaceholder')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button className="w-full">{t('loyalty.drawer.submitStay')}</Button>
              </div>
            </TabsContent>

            <TabsContent value="refer-friend" className="mt-6 space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('loyalty.drawer.referDesc')}
                </p>

                {/* QR Code */}
                <div className="flex justify-center py-4">
                  <ReferralQRCode referralCode={member?.loyaltyNumber || ''} size={180} />
                </div>

                {/* Referral Link */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">{t('loyalty.drawer.yourReferralLink')}</p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={`https://viajero.akintravel.com/signup?ref=${member?.loyaltyNumber || ''}`}
                      className="flex-1 text-sm bg-background p-2 rounded border truncate"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://viajero.akintravel.com/signup?ref=${member?.loyaltyNumber || ''}`);
                      }}
                    >
                      {t('loyalty.drawer.copy')}
                    </Button>
                  </div>
                </div>

                <Button onClick={() => setDrawerOpen(false)} className="w-full">
                  {t('common.done')}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <PreferencesStepForm onComplete={() => setDrawerOpen(false)} />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
