<script setup lang="ts">
/**
 * LineSidebar — from Vue Bits (https://vue-bits.dev), TypeScript + Tailwind.
 *
 * A list of labels whose colour and horizontal offset shift toward an accent
 * colour as the pointer approaches them, with leading marker lines that grow by
 * the same amount.
 *
 * Adapted from the original for use as a table of contents:
 *
 * - `itemIds` turns each row into a real `<a href="#id">`. The original binds a
 *   click handler to the `<li>`, which is unreachable by keyboard, invisible to
 *   crawlers, and does nothing without JavaScript. The anchor keeps the exact
 *   same visuals and fixes all three.
 * - `defaultActive` is watched, not just read on mount. The original seeds
 *   `activeIndex` from it once, so a parent running a scroll-spy could never
 *   move the highlight afterwards.
 * - Transitions collapse to zero under `prefers-reduced-motion`.
 *
 * The rAF loop only runs while something is moving, so an idle page costs
 * nothing, and pointer proximity never fires on touch input.
 */
import { computed, onUnmounted, ref, watch, type CSSProperties, type ComponentPublicInstance } from 'vue'

export type Falloff = 'linear' | 'smooth' | 'sharp'

interface LineSidebarProps {
  items?: string[]
  /** Heading ids, index-aligned with `items`. Renders each row as an anchor. */
  itemIds?: string[]
  accentColor?: string
  textColor?: string
  markerColor?: string
  showIndex?: boolean
  showMarker?: boolean
  proximityRadius?: number
  maxShift?: number
  falloff?: Falloff
  markerLength?: number
  markerGap?: number
  tickScale?: number
  scaleTick?: boolean
  itemGap?: number
  fontSize?: number
  smoothing?: number
  defaultActive?: number | null
}

const FALLOFF_CURVES: Record<Falloff, (p: number) => number> = {
  linear: p => p,
  smooth: p => p * p * (3 - 2 * p),
  sharp: p => p * p * p
}

const props = withDefaults(defineProps<LineSidebarProps>(), {
  items: () => [
    'Overview',
    'Components',
    'Animations',
    'Backgrounds',
    'Showcase',
    'Playground',
    'Templates',
    'Changelog',
    'Community',
    'Resources',
    'Documentation',
    'Support'
  ],
  itemIds: () => [],
  accentColor: '#A855F7',
  textColor: '#c4c4c4',
  markerColor: '#6c6c6c',
  showIndex: true,
  showMarker: true,
  proximityRadius: 100,
  maxShift: 30,
  falloff: 'smooth',
  markerLength: 60,
  markerGap: 0,
  tickScale: 0.5,
  scaleTick: true,
  itemGap: 20,
  fontSize: 1.1,
  smoothing: 100,
  defaultActive: null
})

const emit = defineEmits<{
  itemClick: [index: number, label: string]
}>()

const listRef = ref<HTMLUListElement | null>(null)
const itemRefs = ref<(HTMLLIElement | null)[]>([])
/** Hover proximity, one target per item. Not reactive: read in the rAF loop. */
let targets: number[] = []
/** Current animated value per item. Also not reactive. */
const current: number[] = []
let rafId: number | null = null
let last = 0

const activeIndex = ref<number | null>(props.defaultActive)

/** Honour a reduced-motion preference by dropping the easing time to zero. */
const reducedMotion = ref(false)
if (import.meta.client) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = query.matches
  query.addEventListener('change', (event) => {
    reducedMotion.value = event.matches
  })
}

const easing = computed(() => (reducedMotion.value ? 0 : props.smoothing))

const setItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  itemRefs.value[index] = el as HTMLLIElement | null
}

/**
 * Ref callback factory.
 *
 * Declared in the script rather than as an inline arrow in the template: a
 * `:ref="el => ..."` expression loses its contextual type, so `el` is implicitly
 * `any` under `vue-tsc`. Returning an already-typed function avoids that.
 */
function itemRef(index: number) {
  return (el: Element | ComponentPublicInstance | null) => setItemRef(el, index)
}

const runFrame = (now: number) => {
  const dt = Math.min((now - last) / 1000, 0.05)
  last = now
  const tau = Math.max(easing.value, 1) / 1000
  const k = 1 - Math.exp(-dt / tau)

  let moving = false
  const els = itemRefs.value
  for (let i = 0; i < els.length; i++) {
    const el = els[i]
    if (!el) continue
    const target = Math.max(targets[i] || 0, activeIndex.value === i ? 1 : 0)
    const cur = current[i] || 0
    const next = cur + (target - cur) * k
    const settled = Math.abs(target - next) < 0.0015
    const value = settled ? target : next
    current[i] = value
    el.style.setProperty('--effect', value.toFixed(4))
    if (!settled) moving = true
  }

  rafId = moving ? requestAnimationFrame(runFrame) : null
}

const startLoop = () => {
  // Added for SSR. The `immediate` watcher below runs during server render, and
  // the original assumes a browser, so this throws `requestAnimationFrame is not
  // defined` on every request. There is nothing to animate before hydration, so
  // the loop simply does not start.
  if (!import.meta.client) return
  if (rafId != null) return
  last = performance.now()
  rafId = requestAnimationFrame(runFrame)
}

const handlePointerMove = (e: PointerEvent) => {
  const list = listRef.value
  if (!list) return
  const rect = list.getBoundingClientRect()
  const pointerY = e.clientY - rect.top
  const ease = FALLOFF_CURVES[props.falloff] ?? FALLOFF_CURVES.linear
  const els = itemRefs.value
  for (let i = 0; i < els.length; i++) {
    const el = els[i]
    if (!el) continue
    const center = el.offsetTop + el.offsetHeight / 2
    const distance = Math.abs(pointerY - center)
    targets[i] = ease(Math.max(0, 1 - distance / props.proximityRadius))
  }
  startLoop()
}

const handlePointerLeave = () => {
  targets = targets.map(() => 0)
  startLoop()
}

const handleClick = (index: number, label: string) => {
  activeIndex.value = index
  emit('itemClick', index, label)
}

const tickClass = (): string =>
  props.showMarker
    ? `after:absolute after:left-[calc(-1*var(--marker-length)-var(--marker-gap))] after:top-[calc(100%+var(--item-gap)/2)] after:h-px after:opacity-50 after:content-[''] last:after:content-none after:[background-color:var(--marker-color)] after:w-[calc(var(--marker-length)*var(--tick-scale))] ${
      props.scaleTick
        ? 'after:origin-left after:[transform:translateY(-50%)_scaleX(calc(0.7+var(--effect,0)*0.6))]'
        : 'after:-translate-y-1/2'
    }`
    : ''

watch(activeIndex, () => startLoop(), { immediate: true })

// Added for the TOC: let a parent scroll-spy drive the highlight.
watch(() => props.defaultActive, (value) => {
  activeIndex.value = value
})

onUnmounted(() => {
  if (import.meta.client && rafId != null) cancelAnimationFrame(rafId)
})
</script>

<template>
  <nav
    class="relative flex justify-start"
    :class="{ 'pl-[calc(var(--marker-length)+var(--marker-gap))]': showMarker }"
    :aria-label="'On this page'"
    :style="
      {
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--marker-color': markerColor,
        '--marker-length': `${markerLength}px`,
        '--marker-gap': `${markerGap}px`,
        '--tick-scale': tickScale,
        '--max-shift': `${maxShift}px`,
        '--item-gap': `${itemGap}px`,
        '--font-size': `${fontSize}rem`,
        '--smoothing': `${easing}ms`
      } as CSSProperties
    "
  >
    <ul
      ref="listRef"
      class="m-0 flex list-none flex-col py-4 gap-(--item-gap)"
      @pointermove="handlePointerMove"
      @pointerleave="handlePointerLeave"
    >
      <li
        v-for="(label, index) in items"
        :key="`${label}-${index}`"
        :ref="itemRef(index)"
        :aria-current="activeIndex === index ? 'true' : undefined"
        :class="`relative before:absolute before:-inset-x-12 before:-inset-y-1.5 before:content-[''] ${tickClass()}`"
      >
        <span
          v-if="showMarker"
          aria-hidden="true"
          class="absolute top-1/2 left-[calc(-1*var(--marker-length)-var(--marker-gap))] h-px w-(--marker-length) origin-left bg-[color-mix(in_srgb,var(--accent-color)_calc(var(--effect,0)*100%),var(--marker-color))] transform-[translateY(-50%)_scaleX(calc(0.7+var(--effect,0)*0.5))]"
        />
        <component
          :is="itemIds[index] ? 'a' : 'span'"
          :href="itemIds[index] ? `#${itemIds[index]}` : undefined"
          :class="itemIds[index] ? 'block cursor-pointer' : ''"
          @click="handleClick(index, label)"
        >
          <span
            class="relative inline-flex items-baseline [font-size:var(--font-size)] leading-[1.2] transform-[translateX(calc(var(--effect,0)*var(--max-shift)))] text-[color-mix(in_srgb,var(--accent-color)_calc(var(--effect,0)*100%),var(--text-color))]"
          >
            <span
              v-if="showIndex"
              class="mr-[0.6rem] font-mono text-[0.85em] opacity-[calc(0.55+var(--effect,0)*0.45)]"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <span>{{ label }}</span>
          </span>
        </component>
      </li>
    </ul>
  </nav>
</template>
