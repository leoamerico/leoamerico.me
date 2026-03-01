"use client";

import { useState, useEffect } from "react";
import type { BrandKey, GoveviaPersona } from "./brand-context";
import { BRAND_COOKIE, PERSONA_COOKIE } from "./brand-context";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

export function useBrand() {
  const [brand, setBrand] = useState<BrandKey>("personal");
  const [refBrand, setRefBrand] = useState<BrandKey | null>(null);
  const [persona, setPersonaState] = useState<GoveviaPersona | null>(null);

  useEffect(() => {
    const b = getCookie(BRAND_COOKIE) as BrandKey | null;
    if (b) setBrand(b);

    const ref = getCookie("ref-brand") as BrandKey | null;
    if (ref) setRefBrand(ref);

    const p = getCookie(PERSONA_COOKIE) as GoveviaPersona | null;
    if (p) setPersonaState(p);
  }, []);

  function setPersona(p: GoveviaPersona | null) {
    setPersonaState(p);
    if (p) {
      setCookie(PERSONA_COOKIE, p);
    } else {
      document.cookie = `${PERSONA_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }

  return { brand, refBrand, persona, setPersona };
}
