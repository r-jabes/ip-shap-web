"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { WhatsAppIcon } from "@/components/ui/icons";
import { SITE, whatsappLink } from "@/lib/site-config";

/**
 * Lightweight enquiry hand-off: opens WhatsApp when configured, otherwise mailto.
 * No server inbox yet — the message is composed for the customer’s own app.
 */
export function ContactEnquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const whatsapp = whatsappLink();
  const viaWhatsApp = Boolean(whatsapp);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) {
      setStatus("Add your name and a short message.");
      return;
    }

    const body = [
      `Hello — enquiry from the website.`,
      `Name: ${trimmedName}`,
      phone.trim() ? `Phone: ${phone.trim()}` : null,
      "",
      trimmedMessage,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const wa = whatsappLink(body);
    if (wa) {
      window.open(wa, "_blank", "noopener,noreferrer");
      setStatus("WhatsApp should open with your message ready to send.");
      return;
    }

    if (SITE.email) {
      window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
        `Enquiry from ${trimmedName}`,
      )}&body=${encodeURIComponent(body)}`;
      setStatus("Your email app should open with the message drafted.");
      return;
    }

    setStatus(
      "Contact details are not published yet. Browse the shop and we will follow up on your order.",
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-5 shadow-[6px_6px_0_0_var(--brand-charcoal)] sm:p-6"
    >
      <div>
        <h2 className="font-display text-2xl">Send a message</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {viaWhatsApp
            ? "We open WhatsApp with your note — nothing is stored on this page."
            : SITE.email
              ? "We open your email app with a draft — nothing is stored on this page."
              : "Tell us how to reach you. We will reply once contact details are live."}
        </p>
      </div>
      <Field id="enquiry-name" label="Your name">
        <Input
          id="enquiry-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </Field>
      <Field id="enquiry-phone" label="Phone (optional)">
        <Input
          id="enquiry-phone"
          name="phone"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+2507…"
        />
      </Field>
      <Field id="enquiry-message" label="Message">
        <Textarea
          id="enquiry-message"
          name="message"
          required
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        iconLeft={viaWhatsApp ? <WhatsAppIcon size={18} /> : undefined}
      >
        {viaWhatsApp ? "Continue on WhatsApp" : "Draft message"}
      </Button>
      {status ? (
        <p className="text-sm text-ink-muted" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
