import type { ImgHTMLAttributes } from "react";
import { fallbackEditorialImageFor } from "@/features/editorial/images";

type EditorialImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  slug: string;
};

/** Keeps the original artwork when it loads and swaps to a local fallback if it does not. */
export function EditorialImage({ src, slug, onError, ...props }: EditorialImageProps) {
  return (
    <img
      {...props}
      src={src}
      data-editorial-image="true"
      onError={(event) => {
        onError?.(event);
        if (event.defaultPrevented) return;

        const image = event.currentTarget;
        if (image.dataset.fallbackApplied === "true") {
          image.hidden = true;
          return;
        }

        image.dataset.fallbackApplied = "true";
        image.src = fallbackEditorialImageFor(slug);
      }}
    />
  );
}
