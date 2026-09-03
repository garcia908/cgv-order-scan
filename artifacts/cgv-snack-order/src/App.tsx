import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useAuth, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Redirect, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/landing";
import Menu from "@/pages/menu";
import Cart from "@/pages/cart";
import Payment from "@/pages/payment";
import Success from "@/pages/success";
import Staff from "@/pages/staff";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in environment");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#e31e24",
    colorForeground: "#171717",
    colorMutedForeground: "#737373",
    colorDanger: "#dc2626",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorInputForeground: "#171717",
    colorNeutral: "#e5e5e5",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-neutral-900",
    headerSubtitle: "text-neutral-600",
    socialButtonsBlockButtonText: "text-neutral-800",
    formFieldLabel: "text-neutral-800",
    footerActionLink: "text-red-600",
    footerActionText: "text-neutral-600",
    dividerText: "text-neutral-500",
    identityPreviewEditButton: "text-red-600",
    formFieldSuccessText: "text-green-700",
    alertText: "text-red-700",
    logoBox: "h-12",
    logoImage: "max-h-12",
    socialButtonsBlockButton: "border-neutral-200 bg-white hover:bg-neutral-50",
    formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white",
    formFieldInput: "border-neutral-200 bg-white text-neutral-900",
    footerAction: "text-neutral-600",
    dividerLine: "bg-neutral-200",
    alert: "border-red-200 bg-red-50",
    otpCodeFieldInput: "border-neutral-200 bg-white text-neutral-900",
    formFieldRow: "text-neutral-900",
    main: "bg-white",
  },
};

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function AuthLoading() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 text-sm text-muted-foreground">
      Memeriksa akses staff...
    </div>
  );
}

function StaffRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoading />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <Staff />;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 py-8">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 py-8">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (previousUserId.current !== undefined && previousUserId.current !== userId) {
        queryClient.clear();
      }
      previousUserId.current = userId;
    });
    return unsubscribe;
  }, [addListener]);

  return null;
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Masuk sebagai staff",
            subtitle: "Kelola pesanan dan pembayaran pelanggan",
          },
        },
        signUp: {
          start: {
            title: "Buat akun staff",
            subtitle: "Siapkan akses untuk dashboard CGV Snack Bar",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkQueryClientCacheInvalidator />
      <Switch>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/staff" component={StaffRoute} />
        <Route path="/" component={Landing} />
        <Route path="/menu" component={Menu} />
        <Route path="/cart" component={Cart} />
        <Route path="/payment" component={Payment} />
        <Route path="/success" component={Success} />
        <Route component={NotFound} />
      </Switch>
    </ClerkProvider>
  );
}

function Router() {
  return <ClerkRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
