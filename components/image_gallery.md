You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
image-gallery.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useInView } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export function ImageGallery() {
	return (
		<div className="relative flex min-h-screen w-full flex-col items-center justify-center py-10 px-4">
			<div className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
				
				{Array.from({ length: 3 }).map((_, col) => (
					<div key={col} className="grid gap-6">
						{Array.from({ length: 10 }).map((_, index) => {
							const isPortrait = Math.random() > 0.5;
							const width = isPortrait ? 1080 : 1920;
							const height = isPortrait ? 1920 : 1080;
							const ratio = isPortrait ? 9 / 16 : 16 / 9;

							return (
								<AnimatedImage
									key={`${col}-${index}`}
									alt={`Image ${col}-${index}`}
									src={`https://picsum.photos/seed/${col}-${index}/${width}/${height}`}
									ratio={ratio}
									placeholder={`https://placehold.co/${width}x${height}/`}
								/>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
}

interface AnimatedImageProps {
	alt: string;
	src: string;
	className?: string;
	placeholder?: string;
	ratio: number;
}

function AnimatedImage({ alt, src, ratio, placeholder }: AnimatedImageProps) {
	const ref = React.useRef(null);
	const isInView = useInView(ref, { once: true });
	const [isLoading, setIsLoading] = React.useState(true);

	const [imgSrc, setImgSrc] = React.useState(src);

	const handleError = () => {
		if (placeholder) {
			setImgSrc(placeholder);
		}
	};

	return (
		<AspectRatio
			ref={ref}
			ratio={ratio}
			className="bg-accent relative size-full rounded-lg border"
		>
			<img
				alt={alt}
				src={imgSrc}
				className={cn(
					'size-full rounded-lg object-cover opacity-0 transition-all duration-1000 ease-in-out',
					{
						'opacity-100': isInView && !isLoading,
					},
				)}
				onLoad={() => setIsLoading(false)}
				loading="lazy"
				onError={handleError}
			/>
		</AspectRatio>
	);
}


demo.tsx
import { ImageGallery } from "@/components/ui/image-gallery";

export default function DemoOne() {
  return <ImageGallery />;
}

```

Copy-paste these files for dependencies:
```tsx
shadcn/aspect-ratio
"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }

```

Install NPM dependencies:
```bash
framer-motion, @radix-ui/react-aspect-ratio
```
