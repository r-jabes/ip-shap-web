import { ArchFrame } from "@/components/ui/ArchFrame";
import type { RangePhoto } from "@/lib/range-media";

/**
 * Product photo in the brand arch with two tight offset frames behind it
 * (dashed orange nearer, solid charcoal further) and a sticker accent. The
 * photo overlaps the frames on the top/left — it is not boxed inside them.
 */
export function ProductArchStage({
  photo,
  priority = false,
  sizes,
  position = "50% 40%",
  className = "",
  imageClassName = "",
}: {
  photo: RangePhoto;
  priority?: boolean;
  sizes: string;
  /** CSS object-position inside the arch. */
  position?: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={`product-arch-stage relative w-full ${className}`}>
      <div
        aria-hidden="true"
        className="product-arch-stage__frame pointer-events-none absolute"
      />
      <div
        aria-hidden="true"
        className="product-arch-stage__ring pointer-events-none absolute"
      />
      <div
        aria-hidden="true"
        className="product-arch-stage__sticker pointer-events-none absolute -top-2 right-1 z-[2] h-12 w-12 sm:-top-3 sm:right-0 sm:h-14 sm:w-14 lg:h-16 lg:w-16"
      />
      <ArchFrame
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        priority={priority}
        position={position}
        className="relative z-[1] w-full"
        imageClassName={imageClassName}
      />
    </div>
  );
}
