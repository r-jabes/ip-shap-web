"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { BrandAtmosphere } from "@/components/home/BrandAtmosphere";
import { ProductArchStage } from "@/components/home/ProductArchStage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IconButton } from "@/components/ui/IconButton";
import { PriceTag } from "@/components/ui/PriceTag";
import {
  FEATURED_INTERVAL_MS,
  type HomeFeaturedSlide,
} from "@/lib/home-featured";

/**
 * Scroll-snap featured carousel: swipe on touch, arrows and dots, and autoplay
 * every few seconds. Autoplay only runs while the section is on screen, has an
 * explicit pause/play button, pauses while a control has keyboard focus, and
 * is off under reduced motion. Hovering or clicking does NOT freeze it.
 */
export function HomeFeatured({ slides }: { slides: HomeFeaturedSlide[] }) {
  const labelId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const multi = slides.length > 1;
  const paused = userPaused || keyboardFocus;
  const autoplay = multi && inView && !reducedMotion;
  /** True only while the timer is actually counting down. */
  const running = autoplay && !paused;

  const goTo = useCallback(
    (next: number) => {
      const el = trackRef.current;
      if (!el) return;
      const i = (next + slides.length) % slides.length;
      el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
      setIndex(i);
    },
    [slides.length],
  );

  // Track which slide is centred while the user swipes or scrolls.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !multi) return;
    const onScroll = () => {
      const width = el.clientWidth || 1;
      setIndex(Math.round(el.scrollLeft / width));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [multi]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // One timeout per slide; restarts whenever the slide, hover or focus changes.
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => goTo(index + 1), FEATURED_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [running, index, goTo]);

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (!multi) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    }
  };

  if (slides.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-paper-2"
      aria-roledescription={multi ? "carousel" : undefined}
      aria-labelledby={labelId}
      onFocusCapture={(event) => {
        // Only keyboard focus pauses; a mouse click on a dot must not freeze it.
        if ((event.target as HTMLElement).matches(":focus-visible")) {
          setKeyboardFocus(true);
        }
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setKeyboardFocus(false);
        }
      }}
    >
      <BrandAtmosphere variant="featured" />

      <Container className="relative flex flex-col justify-center py-8 sm:py-10 lg:min-h-[min(calc(100dvh-var(--header-h)),38rem)] lg:py-12">
        <div className="mb-4 flex items-center justify-between text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase">
          <p className="flex items-center gap-3">
            <span className="tabular text-brand-charcoal">03</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-brand-charcoal/40"
            />
            Featured
          </p>
          {multi ? (
            <p className="tabular" aria-live="polite">
              <span className="text-brand-charcoal">
                {String(index + 1).padStart(2, "0")}
              </span>{" "}
              / {String(slides.length).padStart(2, "0")}
            </p>
          ) : null}
        </div>

        <div
          ref={trackRef}
          className="featured-track flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={multi ? 0 : undefined}
          onKeyDown={onKeyDown}
        >
          {slides.map((slide, slideIndex) => (
            <article
              key={slide.id}
              className="grid w-full shrink-0 snap-center grid-cols-1 items-center gap-6 pt-4 pr-2 pb-2 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12"
              role={multi ? "group" : undefined}
              aria-roledescription={multi ? "slide" : undefined}
              aria-label={
                multi ? `${slideIndex + 1} of ${slides.length}` : undefined
              }
              aria-hidden={multi && slideIndex !== index ? true : undefined}
            >
              <div className="mx-auto w-full max-w-[16.5rem] sm:max-w-[18.5rem] lg:mx-0 lg:max-w-[20rem]">
                <ProductArchStage
                  photo={slide.image}
                  position={slide.imagePosition}
                  sizes="(max-width: 1024px) 60vw, 20rem"
                />
              </div>

              <div className="min-w-0">
                <p className="inline-block rounded-full border-2 border-brand-charcoal bg-brand-burnt-orange px-3 py-1 text-xs font-semibold tracking-[0.14em] text-brand-charcoal uppercase">
                  {slide.eyebrow}
                </p>
                <h2
                  id={slideIndex === 0 ? labelId : undefined}
                  className="font-display mt-3 text-balance"
                  style={{
                    fontSize: "clamp(1.75rem, 1.2rem + 1.8vw, 2.75rem)",
                  }}
                >
                  {slide.title}
                </h2>
                <p className="mt-3 max-w-lg text-sm text-ink-muted sm:text-base">
                  {slide.intro}
                </p>

                <ul className="mt-5 space-y-2.5 sm:mt-6">
                  {slide.points.map((point, pointIndex) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm sm:text-[0.95rem]"
                    >
                      <span className="font-display text-brand-burnt-orange tabular">
                        0{pointIndex + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
                  <Button href={slide.href} variant="primary">
                    {slide.ctaLabel}
                  </Button>
                  <Button href={slide.secondaryHref} variant="ghost">
                    {slide.secondaryCtaLabel}
                  </Button>
                  {slide.fromPrice ? (
                    <PriceTag price={slide.fromPrice} from size="md" />
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        {multi ? (
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-8">
            <div className="flex items-center gap-2">
              <IconButton
                label="Previous featured"
                onClick={() => goTo(index - 1)}
                size="sm"
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                label="Next featured"
                onClick={() => goTo(index + 1)}
                size="sm"
              >
                <ChevronRight />
              </IconButton>
              {autoplay ? (
                <IconButton
                  label={userPaused ? "Play slideshow" : "Pause slideshow"}
                  onClick={() => setUserPaused((value) => !value)}
                  size="sm"
                >
                  {userPaused ? <PlayGlyph /> : <PauseGlyph />}
                </IconButton>
              ) : null}
            </div>

            <div
              className="flex min-w-0 flex-1 items-center gap-3"
              role="tablist"
            >
              {slides.map((item, dotIndex) => {
                const active = dotIndex === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Show featured ${dotIndex + 1}: ${item.title}`}
                    onClick={() => goTo(dotIndex)}
                    className="group flex h-8 items-center"
                  >
                    <span
                      className={`relative block h-1 overflow-hidden rounded-full transition-[width,background-color] duration-[var(--motion-editorial)] ease-[var(--ease-out)] ${
                        active
                          ? "w-14 bg-brand-charcoal/20"
                          : "w-6 bg-brand-charcoal/25 group-hover:bg-brand-charcoal/45"
                      }`}
                    >
                      {active ? (
                        <span
                          key={`${index}-${running}`}
                          className="featured-progress__bar absolute inset-0 rounded-full bg-brand-burnt-orange"
                          style={
                            running
                              ? ({
                                  "--featured-interval": `${FEATURED_INTERVAL_MS}ms`,
                                } as CSSProperties)
                              : { animation: "none" }
                          }
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button href="/shop" variant="secondary" size="sm">
              View all
            </Button>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

function PauseGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6 9 12l6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
