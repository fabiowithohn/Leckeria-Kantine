"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { GalleryImage } from "@/lib/gallery-data";

export function ImageGallery({
  images,
  label = "Bild",
}: {
  images: GalleryImage[];
  label?: string;
}) {
  // Bilder gleichmäßig auf 3 Spalten verteilen (Masonry-Optik)
  const columns = 3;
  const cols: GalleryImage[][] = Array.from({ length: columns }, () => []);
  images.forEach((img, i) => cols[i % columns].push(img));

  return (
    <div className="mx-auto grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cols.map((col, ci) => (
        <div key={ci} className="grid h-fit gap-4">
          {col.map((img, ii) => (
            <AnimatedImage
              key={img.src}
              src={img.src}
              alt={`${label} ${ci * columns + ii + 1}`}
              ratio={img.width / img.height}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface AnimatedImageProps {
  alt: string;
  src: string;
  ratio: number;
}

export function AnimatedImage({ alt, src, ratio }: AnimatedImageProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <AspectRatio
      ref={ref}
      ratio={ratio}
      className="relative size-full overflow-hidden rounded-2xl bg-sand-100 ring-1 ring-sand-200"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        src={src}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        className={cn(
          "size-full rounded-2xl object-cover opacity-0 transition-all duration-1000 ease-in-out",
          { "opacity-100": isInView && !isLoading },
        )}
      />
    </AspectRatio>
  );
}
