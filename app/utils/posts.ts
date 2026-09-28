/**
 * Helpers for rendering the `posts` collection.
 *
 * Shared by the blog index and the post page so reading time is computed
 * identically in both places.
 */

/** Average adult reading speed for technical prose, in words per minute. */
const WORDS_PER_MINUTE = 220

/**
 * A minimark node: a tag, its props, then any number of children.
 *
 * The children are where the text lives, and a child is either a plain string
 * or another node.
 */
type MinimarkNode = [string, Record<string, unknown>, ...unknown[]]

function isMinimarkNode(node: unknown[]): node is MinimarkNode {
  if (typeof node[0] !== 'string' || node.length < 2) {
    return false
  }

  const props = node[1]
  return typeof props === 'object' && props !== null && !Array.isArray(props)
}

function collectText(node: unknown, parts: string[]): void {
  if (typeof node === 'string') {
    parts.push(node)
    return
  }

  // `body` is minimark: nested arrays of [tag, props, ...children]. The tag and
  // props are skipped so they are not counted as words.
  if (Array.isArray(node)) {
    if (isMinimarkNode(node)) {
      for (const child of node.slice(2)) {
        collectText(child, parts)
      }
      return
    }

    for (const child of node) {
      collectText(child, parts)
    }
    return
  }

  if (node && typeof node === 'object') {
    const record = node as { type?: string, value?: unknown, children?: unknown }

    // The minimark root holds its node array under `value`, with the table of
    // contents as a sibling key that must not be walked.
    if (record.type === 'minimark') {
      collectText(record.value, parts)
      return
    }

    // Standard MDC/AST text node.
    if (record.type === 'text' && typeof record.value === 'string') {
      parts.push(record.value)
      return
    }

    collectText(record.children, parts)
  }
}

/**
 * Flattens a post `body` to plain text.
 *
 * Both minimark (what Nuxt Content v3 stores) and the standard AST shape are
 * handled. Stringifying the body instead would count every tag, prop and key
 * as a word, which inflated the estimate badly enough to be misleading.
 */
export function postBodyText(body: unknown): string {
  const parts: string[] = []
  collectText(body, parts)
  return parts.join(' ')
}

/** Number of words in a post body. */
export function postWordCount(body: unknown): number {
  return postBodyText(body).split(/\s+/).filter(Boolean).length
}

/** Estimated reading time in minutes, never less than one. */
export function postReadingTime(body: unknown): number {
  return Math.max(1, Math.round(postWordCount(body) / WORDS_PER_MINUTE))
}

/** Formats a post date for display, e.g. `4 Jul 2026`. */
export function postDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
