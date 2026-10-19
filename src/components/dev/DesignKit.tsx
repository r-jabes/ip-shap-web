"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Checkbox, Field, Input, Select } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { Marquee } from "@/components/ui/Marquee";
import { Overlay } from "@/components/ui/Overlay";
import { PriceTag } from "@/components/ui/PriceTag";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ArrowRightIcon,
  BagIcon,
  CloseIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";

function Block({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={`${dark ? "on-ink bg-brand-charcoal text-brand-warm-white" : ""} px-6 py-10 sm:px-10`}
    >
      <p
        className={`mb-6 text-xs font-semibold tracking-[0.18em] uppercase ${dark ? "text-brand-burnt-orange" : "text-ink-muted"}`}
      >
        {title}
      </p>
      {children}
    </section>
  );
}

export function DesignKit() {
  const [quantity, setQuantity] = useState(1);
  const [chip, setChip] = useState("whisky");
  const [open, setOpen] = useState<null | "right" | "center">(null);

  return (
    <div className="divide-y divide-line">
      <Block title="Logo — on paper (charcoal + orange)">
        <BrandLogo tone="on-paper" href={null} height={56} />
      </Block>
      <Block title="Logo — on ink (reversed)" dark>
        <BrandLogo tone="on-ink" href={null} height={56} />
      </Block>
      <Block title="Logo — mark">
        <div className="flex items-center gap-6">
          <BrandLogo tone="on-paper" variant="mark" href={null} height={56} />
          <div className="on-ink rounded-2xl bg-brand-charcoal p-4">
            <BrandLogo tone="on-ink" variant="mark" href={null} height={56} />
          </div>
        </div>
      </Block>

      <Block title="Typography">
        <p className="font-display-hero">Hero display</p>
        <p
          className="font-display mt-4"
          style={{ fontSize: "var(--type-display)" }}
        >
          Display heading
        </p>
        <p className="font-display mt-4" style={{ fontSize: "var(--type-h2)" }}>
          Section heading
        </p>
        <p className="font-display mt-4 text-xl">Card title</p>
        <p className="mt-4 max-w-prose text-ink-muted">
          Body copy in DM Sans. Prices use tabular figures:{" "}
          <span className="tabular font-semibold text-brand-charcoal">
            RWF 68,000
          </span>
          .
        </p>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button iconRight={<ArrowRightIcon size={18} />}>With icon</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <IconButton label="Search">
            <SearchIcon size={20} />
          </IconButton>
          <IconButton label="Cart" tone="solid">
            <BagIcon size={20} />
          </IconButton>
          <IconButton label="Chat" tone="accent">
            <WhatsAppIcon size={20} />
          </IconButton>
        </div>
      </Block>
      <Block title="Buttons on ink" dark>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Primary</Button>
          <Button variant="on-dark">On dark</Button>
          <Button variant="link">Link</Button>
          <IconButton label="Close" tone="on-dark">
            <CloseIcon size={20} />
          </IconButton>
        </div>
      </Block>

      <Block title="Chips, badges, price">
        <div className="flex flex-wrap items-center gap-3">
          {["whisky", "vodka", "gin", "wine"].map((value) => (
            <Chip
              key={value}
              selected={chip === value}
              count={value.length}
              onClick={() => setChip(value)}
            >
              {value}
            </Chip>
          ))}
          <Chip removable selected onClick={() => undefined}>
            Under RWF 20,000
          </Chip>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Badge>Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="ink">Ink</Badge>
          <Badge tone="outline">Outline</Badge>
        </div>
        <div className="mt-6 flex flex-wrap items-baseline gap-8">
          <PriceTag price={{ amount: 12000, currency: "RWF" }} size="sm" />
          <PriceTag price={{ amount: 68000, currency: "RWF" }} />
          <PriceTag price={{ amount: 28000, currency: "RWF" }} from size="lg" />
        </div>
      </Block>

      <Block title="Form controls">
        <div className="grid max-w-xl gap-5">
          <Field
            id="kit-name"
            label="Name"
            hint="As it should appear on the order."
          >
            <Input id="kit-name" placeholder="Your name" />
          </Field>
          <Field id="kit-bad" label="Phone" error="Enter a valid phone number.">
            <Input id="kit-bad" aria-invalid="true" defaultValue="12" />
          </Field>
          <Field id="kit-sort" label="Sort">
            <Select id="kit-sort" defaultValue="name">
              <option value="name">Name A–Z</option>
              <option value="low">Price low–high</option>
            </Select>
          </Field>
          <Checkbox label="In stock only" count={14} />
          <div className="flex items-center gap-4">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              label="Quantity"
            />
            <QuantityStepper value={3} onChange={() => undefined} size="sm" />
          </div>
        </div>
      </Block>

      <Block title="Signature elements">
        <SectionHeading
          index="01"
          eyebrow="Shop by range"
          title="Six ranges, one shelf"
          intro="Numbered headings give every section a clear place."
          className="mb-10"
        />
        <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
          <ArchFrame
            src="/products/drink-60000.jpeg"
            alt="Bottle photographed on a plain background"
            width={800}
            height={1000}
            sizes="(min-width: 640px) 24rem, 100vw"
          />
          <div className="space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-40 w-full rounded-[var(--radius-frame)]" />
          </div>
        </div>
      </Block>
      <Block title="Marquee" dark>
        <Marquee items={["Whisky", "Vodka", "Gin", "Red wine", "Sparkling"]} />
      </Block>

      <Block title="Overlays">
        <div className="flex flex-wrap gap-4">
          <Button variant="ghost" onClick={() => setOpen("right")}>
            Open drawer
          </Button>
          <Button variant="ghost" onClick={() => setOpen("center")}>
            Open dialog
          </Button>
        </div>
        <Overlay
          open={open === "right"}
          onClose={() => setOpen(null)}
          side="right"
          label="Example drawer"
          panelClassName="flex h-dvh w-screen max-w-sm flex-col bg-brand-warm-white p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Drawer</h2>
            <IconButton label="Close" size="sm" onClick={() => setOpen(null)}>
              <CloseIcon size={18} />
            </IconButton>
          </div>
          <p className="mt-4 text-ink-muted">
            Focus is trapped, Escape closes it, and focus returns to the button.
          </p>
        </Overlay>
        <Overlay
          open={open === "center"}
          onClose={() => setOpen(null)}
          side="center"
          label="Example dialog"
          panelClassName="w-full max-w-md rounded-[var(--radius-panel)] bg-brand-warm-white p-6"
        >
          <h2 className="font-display text-2xl">Dialog</h2>
          <p className="mt-3 text-ink-muted">
            A centred panel for confirmations.
          </p>
          <Button className="mt-6" onClick={() => setOpen(null)}>
            Done
          </Button>
        </Overlay>
      </Block>
    </div>
  );
}
