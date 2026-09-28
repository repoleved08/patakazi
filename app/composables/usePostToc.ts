/**
 * Table of contents for a rendered article.
 *
 * Nuxt Content parses `h2`/`h3` into heading elements that carry a slug id, and
 * records the matching tree on the document at `body.toc.links`. This maps that
 * onto a flat list of items for the sidebar and keeps the highlighted entry in
 * sync with the section currently in view.
 *
 * The active section is derived from an IntersectionObserver rather than a
 * scroll handler so it costs nothing between events. Headings are observed with
 * a band across the upper third of the viewport: that is roughly where the eye
 * is when reading, and it avoids the flicker you get from a narrow root margin
 * as a long section scrolls in and out of it.
 */

export interface TocItem {
  /** Slug of the heading element in the rendered content. */
  id: string
  text: string
  /** `h2` = 2, `h3` = 3. */
  depth: number
}

/** Shape of the tree Nuxt Content stores on `body.toc`. */
interface ContentToc {
  links?: Array<{ id?: string, text?: string, depth?: number, children?: unknown }>
}

function flatten(links: NonNullable<ContentToc['links']>, depth: number): TocItem[] {
  const items: TocItem[] = []

  for (const link of links) {
    // A heading with no id cannot be linked to, so it is dropped rather than
    // rendered as a row that does nothing.
    if (typeof link.id === 'string' && link.id) {
      items.push({ id: link.id, text: link.text ?? '', depth: link.depth ?? depth })
    }

    if (Array.isArray(link.children)) {
      items.push(...flatten(link.children as NonNullable<ContentToc['links']>, (link.depth ?? depth) + 1))
    }
  }

  return items
}

/** Flattens `body.toc.links` into a renderable list, deepest heading last. */
export function postTocItems(body: unknown, maxDepth = 3): TocItem[] {
  const toc = (body as { toc?: ContentToc } | undefined)?.toc
  if (!toc?.links?.length) return []
  return flatten(toc.links, 2).filter(item => item.depth <= maxDepth)
}

/**
 * Index of the heading currently in view, or `null` before the first one is
 * reached.
 *
 * Exported as a composable so the observer is created and torn down with the
 * component that needs it.
 */
export function useTocSpy(ids: MaybeRefOrGetter<string[]>) {
  const active = ref<number | null>(null)
  let observer: IntersectionObserver | null = null
  const visible = new Set<string>()

  function onIntersect(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      const id = entry.target.id
      if (!id) continue
      if (entry.isIntersecting) visible.add(id)
      else visible.delete(id)
    }

    // Several headings can be in the band at once. The first one in document
    // order is the one being read, so pick the lowest index rather than
    // whichever entry the observer happened to report last.
    const list = toValue(ids)
    for (let i = 0; i < list.length; i++) {
      if (visible.has(list[i]!)) {
        active.value = i
        return
      }
    }
  }

  function observe() {
    observer?.disconnect()
    visible.clear()
    if (!import.meta.client) return

    observer = new IntersectionObserver(onIntersect, {
      // A band under the header rather than a single point, so a heading is
      // treated as current from the moment it reaches reading position.
      rootMargin: '-72px 0px -66% 0px',
      threshold: 0
    })

    for (const id of toValue(ids)) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  }

  watch(() => toValue(ids).join('|'), observe, { immediate: true })

  onBeforeUnmount(() => observer?.disconnect())

  return { active, observe }
}
