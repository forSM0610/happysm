import { useEffect, useRef, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HomePage, DashboardPage, HealthProfilePage, SchedulePage, AppShell } from '@/pages/app-pages';
import NotFound from '@/pages/not-found';
import { Route, Switch, Redirect, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');

const appearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#315b4d',
    colorForeground: '#29433b',
    colorMutedForeground: '#73847a',
    colorDanger: '#a74b3e',
    colorBackground: '#faf8f1',
    colorInput: '#f5f1e7',
    colorInputForeground: '#29433b',
    colorNeutral: '#d9d5c9',
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#faf8f1] rounded-[24px] w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#29433b] font-semibold',
    headerSubtitle: 'text-[#73847a]',
    socialButtonsBlockButtonText: 'text-[#29433b]',
    formFieldLabel: 'text-[#29433b]',
    footerActionLink: 'text-[#315b4d]',
    footerActionText: 'text-[#73847a]',
    dividerText: 'text-[#73847a]',
    identityPreviewEditButton: 'text-[#315b4d]',
    formFieldSuccessText: 'text-[#315b4d]',
    alertText: 'text-[#29433b]',
    logoBox: 'mb-2',
    logoImage: 'max-h-10',
    socialButtonsBlockButton: 'border-[#d9d5c9] bg-[#f5f1e7]',
    formButtonPrimary: 'bg-[#315b4d] hover:bg-[#264a3e]',
    formFieldInput: 'bg-[#f5f1e7] border-[#d9d5c9] text-[#29433b]',
    footerAction: 'text-[#73847a]',
    dividerLine: 'bg-[#d9d5c9]',
    alert: 'bg-[#f5f1e7] border-[#d9d5c9]',
    otpCodeFieldInput: 'border-[#d9d5c9] bg-[#f5f1e7]',
    formFieldRow: 'mb-4',
    main: 'gap-5',
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => {
    const userId = user?.id ?? null;
    if (previous.current !== undefined && previous.current !== userId) client.clear();
    previous.current = userId;
  }), [addListener, client]);
  return null;
}

function HomeRedirect() {
  return <><Show when="signed-in"><Redirect to="/dashboard" /></Show><Show when="signed-out"><HomePage /></Show></>;
}

function Protected({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <div className="auth-wait"><span className="pulse-dot" /> Opening your space…</div>;
  return isSignedIn ? <AppShell>{children}</AppShell> : <Redirect to="/" />;
}

function DashboardRoute() {
  return <Protected><DashboardPage /></Protected>;
}
function ProfileRoute() {
  return <Protected><HealthProfilePage /></Protected>;
}
function ScheduleRoute() {
  return <Protected><SchedulePage /></Protected>;
}

function SignInPage() {
  return <div className="auth-frame"><div className="auth-art"><a href={basePath || '/'} className="brand" data-testid="link-sign-in-brand-home"><span className="brand-mark">h</span> happysm</a><p className="eyebrow">A softer way to check in</p><h1>Your life, at your pace.</h1><p>Small notes about your everyday habits. A little more room to listen to yourself.</p><div className="orbit-art" aria-hidden="true"><span /><i /><b /></div></div><div className="auth-form"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div></div>;
}
function SignUpPage() {
  return <div className="auth-frame"><div className="auth-art"><a href={basePath || '/'} className="brand" data-testid="link-sign-up-brand-home"><span className="brand-mark">h</span> happysm</a><p className="eyebrow">A private place for you</p><h1>Begin with what feels doable.</h1><p>There is no perfect routine. Just the one that fits your life today.</p><div className="orbit-art" aria-hidden="true"><span /><i /><b /></div></div><div className="auth-form"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div></div>;
}

function Router() {
  const [, setLocation] = useLocation();
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={appearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    localization={{
      signIn: { start: { title: 'Welcome back', subtitle: 'A little space for your everyday wellbeing.' } },
      signUp: { start: { title: 'Make this space yours', subtitle: 'A private place to notice the little things.' } },
    }}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  >
    <ClerkQueryClientCacheInvalidator />
    <ErrorBoundary resetKey={window.location.pathname}>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/dashboard" component={DashboardRoute} />
        <Route path="/health-profile" component={ProfileRoute} />
        <Route path="/schedule" component={ScheduleRoute} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  </ClerkProvider>;
}

function App() {
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WouterRouter base={basePath}><Router /></WouterRouter>
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>;
}

export default App;
