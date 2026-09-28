<script setup lang="ts">
/**
 * Responsive remote image.
 *
 * Unsplash's CDN resizes on the query string, so a single photo id yields a
 * full `srcset` with no build-time image tooling (`@nuxt/image` is not a
 * dependency). `fm=webp` keeps the payload small, and the `q` curve steps down
 * for narrower viewports where the extra pixels would never be seen.
 *
 * `width`/`height` are always emitted so the browser can reserve space before
 * the bytes arrive. That reservation is most of the perceived-performance win:
 * an unsized hero image is what causes the layout shift that a Core Web Vitals
 * score punishes.
 */
const props = withDefaults(defineProps<{
  src: string
  alt: string
  /** Intrinsic width and height, used for aspect ratio and CLS. */
  width?: number
  height?: number
  sizes?: string
  loading?: 'lazy' | 'eager'
  /** Above-the-fold images should be `eager` with high fetch priority. */
  priority?: boolean
}>(), {
  width: 1600,
  height: 900,
  sizes: '100vw',
  loading: 'lazy',
  priority: false
})

/** Widths in the srcset. 320 covers a small phone, 1920 a large desktop. */
const WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600, 1920]

/**
 * Unsplash takes its transform parameters on the query string, and other hosts
 * do not. Passing `w`/`q` to an arbitrary URL would either be ignored or break
 * a signature, so non-Unsplash sources are used untouched.
 */
const isUnsplash = computed(() => props.src.includes('images.unsplash.com'))

const sources = computed(() =>
  WIDTHS.map(width => `${withParams(width)} ${width}w`).join(', ')
)

function withParams(width: number): string {
  if (!isUnsplash.value) return props.src
  const height = Math.round((width / props.width) * props.height)
  return `${props.src}?auto=format&fit=crop&w=${width}&h=${height}&q=${width > 1024 ? 72 : 60}`
}

const fallback = computed(() => withParams(props.width))
</script>

<!--
  `class` is deliberately not a prop: it falls through to the root <img> through
  Vue's normal attribute fallthrough, so callers can style the image with
  `class="..."` without the prop shadowing the attribute of the same name.
-->
<template>
  <img
    :src="fallback"
    :srcset="isUnsplash ? sources : undefined"
    :sizes="isUnsplash ? sizes : undefined"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="priority ? 'eager' : loading"
    :fetchpriority="priority ? 'high' : 'auto'"
    :decoding="priority ? 'sync' : 'async'"
  >
</template>
