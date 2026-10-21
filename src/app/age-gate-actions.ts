"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AGE_GATE_COOKIE,
  AGE_GATE_MAX_AGE_SEC,
} from "@/lib/age-gate";

export async function confirmAgeAction(formData: FormData) {
  const returnTo = String(formData.get("returnTo") ?? "/").trim() || "/";
  const safePath =
    returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";

  const jar = await cookies();
  jar.set(AGE_GATE_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AGE_GATE_MAX_AGE_SEC,
  });

  redirect(safePath);
}

export async function exitAgeGateAction() {
  redirect("https://www.google.com/");
}
