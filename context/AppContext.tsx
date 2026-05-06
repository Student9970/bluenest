"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, hasFirebaseConfig } from "@/lib/firebase-client";
import { MOCK_LISTINGS } from "@/lib/mock-listings";
import type { AuthUser, Listing, ListingType } from "@/lib/types";

type AppContextValue = {
  authUser: AuthUser | null;
  phone: string | null;
  isLoggedIn: boolean;
  hasPhone: boolean;
  userListing: Listing | null;
  allListings: Listing[];
  syncError: string | null;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  setPhoneNumber: (phone: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  createListing: (input: {
    title: string;
    area: string;
    price: number;
    type: ListingType;
    description: string;
    imageUrl: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  deleteListing: () => Promise<{ ok: boolean; error?: string }>;
};

const STORAGE_KEYS = {
  authUser: "bluenest_auth_user",
  phone: "bluenest_phone",
} as const;

const AppContext = createContext<AppContextValue | null>(null);

function loadStoredPhone(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.phone);
}

function loadStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.authUser);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [userListing, setUserListing] = useState<Listing | null>(null);
  const [allListings, setAllListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const applyListings = useCallback(
    (listings: Listing[], uid?: string) => {
      setAllListings(listings);
      if (!uid) {
        setUserListing(null);
        return;
      }
      setUserListing(listings.find((listing) => listing.isOwn) ?? null);
    },
    [],
  );

  const refreshListings = useCallback(
    async (uid?: string) => {
      try {
        const query = uid ? `?uid=${encodeURIComponent(uid)}` : "";
        const res = await fetch(`/api/listings${query}`, { cache: "no-store" });
        if (!res.ok) {
          setSyncError("Could not load latest listings from database.");
          return;
        }
        const data = (await res.json()) as { listings?: Listing[] };
        applyListings(data.listings ?? [], uid);
        setSyncError(null);
      } catch {
        setSyncError("Could not connect to the database.");
      }
    },
    [applyListings],
  );

  const refreshUserPhone = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(uid)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { phone?: string | null };
      const nextPhone = data.phone ?? null;
      setPhone(nextPhone);
      if (nextPhone) localStorage.setItem(STORAGE_KEYS.phone, nextPhone);
      else localStorage.removeItem(STORAGE_KEYS.phone);
    } catch {
      // Non-blocking: keep local phone fallback.
    }
  }, []);

  useEffect(() => {
    /* Load persisted MVP session once on mount; localStorage is unavailable during SSR. */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time client hydration
    setAuthUser(loadStoredAuthUser());
    setPhone(loadStoredPhone());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!authUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- DB sync after hydration
      refreshListings();
      return;
    }
    refreshUserPhone(authUser.uid);
    refreshListings(authUser.uid);
  }, [authUser, hydrated, refreshListings, refreshUserPhone]);

  const isLoggedIn = Boolean(authUser);
  const hasPhone = Boolean(phone);

  const setPhoneNumber = useCallback(async (nextPhone: string) => {
    if (!authUser) {
      return { ok: false, error: "Please sign in first." };
    }
    setPhone(nextPhone);
    localStorage.setItem(STORAGE_KEYS.phone, nextPhone);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(authUser.uid)}/phone`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: nextPhone }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        return { ok: false, error: data.error || "Could not save phone." };
      }
      await refreshListings(authUser.uid);
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not connect to database." };
    }
  }, [authUser, refreshListings]);

  const signInWithGoogle = useCallback(async () => {
    if (!hasFirebaseConfig || !auth) {
      return {
        ok: false,
        error:
          "Google auth is not configured. Add NEXT_PUBLIC_FIREBASE_* variables.",
      };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const nextUser: AuthUser = {
        uid: result.user.uid,
        name: result.user.displayName || "BlueNest User",
        email: result.user.email || "",
        photoUrl: result.user.photoURL,
      };
      setAuthUser(nextUser);
      localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(nextUser));
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextUser),
      }).catch(() => undefined);
      await refreshUserPhone(nextUser.uid);
      await refreshListings(nextUser.uid);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "Google sign-in was cancelled or failed. Please try again.",
      };
    }
  }, [refreshListings, refreshUserPhone]);

  const logout = useCallback(async () => {
    if (auth) {
      await signOut(auth).catch(() => undefined);
    }
    setAuthUser(null);
    setPhone(null);
    setUserListing(null);
    setAllListings([]);
    localStorage.removeItem(STORAGE_KEYS.authUser);
    localStorage.removeItem(STORAGE_KEYS.phone);
    await refreshListings();
  }, [refreshListings]);

  const createListing = useCallback(
    async (input: {
      title: string;
      area: string;
      price: number;
      type: ListingType;
      description: string;
      imageUrl: string;
    }) => {
      if (!authUser) {
        return { ok: false, error: "Please sign in first." };
      }
      if (!phone) {
        return { ok: false, error: "Please add your phone number first." };
      }
      if (userListing) {
        return {
          ok: false,
          error: "You already have an active listing.",
        };
      }
      try {
        const res = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: authUser.uid,
            title: input.title,
            area: input.area,
            price: input.price,
            type: input.type,
            description: input.description,
            imageUrl: input.imageUrl,
            ownerPhone: phone,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          return { ok: false, error: data.error || "Could not post listing." };
        }
        await refreshListings(authUser.uid);
        return { ok: true };
      } catch {
        return { ok: false, error: "Could not connect to database." };
      }
    },
    [authUser, phone, refreshListings, userListing],
  );

  const deleteListing = useCallback(async () => {
    if (!authUser || !userListing) {
      return { ok: false, error: "No active listing to delete." };
    }
    try {
      const res = await fetch(`/api/listings/${encodeURIComponent(userListing.id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authUser.uid }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        return { ok: false, error: data.error || "Could not delete listing." };
      }
      await refreshListings(authUser.uid);
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not connect to database." };
    }
  }, [authUser, refreshListings, userListing]);

  const value = useMemo<AppContextValue>(
    () => ({
      authUser,
      phone,
      isLoggedIn,
      hasPhone,
      userListing,
      allListings,
      syncError,
      signInWithGoogle,
      setPhoneNumber,
      logout,
      createListing,
      deleteListing,
    }),
    [
      authUser,
      phone,
      isLoggedIn,
      hasPhone,
      userListing,
      allListings,
      syncError,
      signInWithGoogle,
      setPhoneNumber,
      logout,
      createListing,
      deleteListing,
    ],
  );

  if (!hydrated) {
    return (
      <div className="bn-surface flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--bn-blue)]/20" />
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
