"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/lib/routes";

/** Anciens liens partagés `/#contact` (section retirée de l'accueil) : renvoi vers /contact. */
export function ContactHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash === "#contact") router.replace(ROUTES.contact);
  }, [router]);

  return null;
}
