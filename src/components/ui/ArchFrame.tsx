import Image from "next/image";

/**
 * Signature product window: tall arch (rounded top) that crops shop clutter and
 * gives every photograph the same silhouette. Never recolours the image.
 * `position` controls which part of the photograph stays in frame.
 */
export function ArchFrame({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  position = "center",
  className = "",
  imageClassName = "",
  tone = "paper",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  /** CSS object-position, e.g. "50% 40%". */
  position?: string;
  className?: string;
  imageClassName?: string;
  tone?: "paper" | "ink";
}) {
  return (
    <div
      className={`arch relative aspect-[4/5] ${
        tone === "ink" ? "bg-brand-dark-neutral" : "bg-paper-2"
      } ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        style={{ objectPosition: position }}
        className={`h-full w-full object-cover ${imageClassName}`}
      />
    </div>
  );
}
