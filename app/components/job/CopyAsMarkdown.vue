<script setup lang="ts">
/**
 * Copy a job listing as markdown.
 *
 * Uses the same serialiser as `/jobs/<slug>.md` and `/llms-jobs.txt`, so what a
 * reader pastes into a prompt is byte-identical to what an agent would fetch.
 * That matters more than it sounds: a hand-written "copy for AI" summary drifts
 * from the real listing within a week, and then the pasted text and the page
 * disagree.
 *
 * Serialising from the job already in memory rather than re-fetching keeps the
 * button instant and guarantees it copies what the reader is looking at.
 *
 * `navigator.clipboard` needs a secure context, so on a plain-HTTP host it is
 * simply absent. Rather than a dead button, the text is selected in a temporary
 * textarea so the browser's own copy behaviour still applies.
 */
const props = withDefaults(defineProps<{
  job: Job
  label?: string
}>(), {
  label: 'Copy as Markdown'
})

type CopyState = 'idle' | 'copied' | 'failed'

const state = ref<CopyState>('idle')
let timer: ReturnType<typeof setTimeout> | undefined

const buttonLabel = computed(() => {
  if (state.value === 'copied') return 'Copied'
  if (state.value === 'failed') return 'Press Ctrl+C to copy'
  return props.label
})

const icon = computed(() => {
  if (state.value === 'copied') return 'i-lucide-check'
  if (state.value === 'failed') return 'i-lucide-alert-triangle'
  return 'i-lucide-clipboard-copy'
})

function flash(next: CopyState) {
  state.value = next
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    state.value = 'idle'
  }, 2500)
}

/** Selection-based copy, for contexts without the async clipboard API. */
function selectFallback(text: string): void {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  // Off-screen rather than `display: none`, which would make it unselectable.
  area.style.position = 'fixed'
  area.style.top = '-1000px'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()

  try {
    document.execCommand('copy')
    flash('copied')
  } catch {
    // The selection is still in place, so the user can copy it themselves.
    flash('failed')
  } finally {
    document.body.removeChild(area)
  }
}

async function copy() {
  const text = jobToMarkdown(props.job, { origin: useRequestURL().origin, includeDescription: true })

  if (!import.meta.client || !navigator.clipboard?.writeText) {
    selectFallback(text)
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    flash('copied')
  } catch {
    selectFallback(text)
  }
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <UButton
    :label="buttonLabel"
    :icon="icon"
    color="neutral"
    variant="outline"
    block
    :aria-live="state === 'idle' ? undefined : 'polite'"
    @click="copy"
  />
</template>
