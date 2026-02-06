# Viajero Rewards - SDK Example

Example implementation of a third-party rewards site using the Akin Partner SDK.

## What This Demonstrates

- **Provider Setup**: Wrapping the app with `AkinProvider` in `app/layout.tsx`
- **Auth Flow**: Login and signup using headless `LoginForm` and `SignupForm` components
- **Loyalty Display**: Showing points, tier, progress, and transaction history
- **Headless Components**: Custom UI with SDK-provided render props

## Pages

| Page | Description |
|------|-------------|
| `/` | Homepage with auth-aware content |
| `/login` | Sign in with email/password or Google |
| `/signup` | Create account form |
| `/loyalty` | Member dashboard with points, tier, and history |

## Running Locally

1. Install dependencies:
   ```bash
   cd docs/partner-sdk-examples/viajero
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3003

## Key Files

```
app/
├── layout.tsx      # AkinProvider setup
├── page.tsx        # Homepage
├── login/page.tsx  # LoginForm example
├── signup/page.tsx # SignupForm example
└── loyalty/page.tsx # LoyaltyCard, SimpleTierCards, UpcomingStays, PreviousStays examples
```

## SDK Usage Patterns

### Provider Setup

```tsx
// app/layout.tsx
<AkinProvider
  config={{
    partnerId: 'your-partner-id',
    apiKey: 'your-api-key',
    environment: 'development',
  }}
>
  {children}
</AkinProvider>
```

### Auth Hook

```tsx
const { member, isAuthenticated, signOut } = useAkinAuth();
```

### Headless Login Form

```tsx
<LoginForm onSuccess={() => router.push('/loyalty')}>
  {({ email, setEmail, password, setPassword, handleSubmit, isLoading, error }) => (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p>{error}</p>}
      <button type="submit">{isLoading ? 'Loading...' : 'Sign In'}</button>
    </form>
  )}
</LoginForm>
```

### Loyalty Components

```tsx
<PointsDisplay>
  {({ formattedPoints }) => <p>{formattedPoints} points</p>}
</PointsDisplay>

<TierCard>
  {({ displayName, tier }) => <p>Current tier: {displayName}</p>}
</TierCard>

<TierProgress>
  {({ percentage, pointsNeeded, nextTierName }) => (
    <div>
      <progress value={percentage} max={100} />
      <p>{pointsNeeded} to {nextTierName}</p>
    </div>
  )}
</TierProgress>

<TransactionList limit={10}>
  {({ transactions, loadMore, hasMore }) => (
    <ul>
      {transactions.map(tx => (
        <li key={tx.id}>{tx.reason}: {tx.pointsChange}</li>
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </ul>
  )}
</TransactionList>
```

## Notes

- This example uses Viajero's partner ID for testing
- In production, use environment variables for `apiKey`
- The API must be running locally on port 4000 for `development` environment
