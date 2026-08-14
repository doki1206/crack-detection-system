<template>
  <div class="scroll-snap" :style="{ '--snap-gap': gap + 'px' }">
    <div ref="track" class="scroll-snap__track" @scroll.passive="update">
      <slot />
    </div>
    <button
      type="button"
      class="scroll-snap__nav scroll-snap__nav--prev"
      :disabled="!canPrev"
      @click="scrollByDir(-1)"
      aria-label="向前翻"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
    </button>
    <button
      type="button"
      class="scroll-snap__nav scroll-snap__nav--next"
      :disabled="!canNext"
      @click="scrollByDir(1)"
      aria-label="向后翻"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  gap: { type: Number, default: 24 }
})

const track = ref(null)
const canPrev = ref(false)
const canNext = ref(false)

function stepSize() {
  const el = track.value
  if (!el) return 400
  const first = el.firstElementChild
  if (first) return first.offsetWidth + props.gap
  return el.clientWidth * 0.8
}

function update() {
  const el = track.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  canPrev.value = el.scrollLeft > 2
  canNext.value = el.scrollLeft < max - 2
}

function scrollByDir(dir) {
  const el = track.value
  if (!el) return
  el.scrollBy({ left: stepSize() * dir, behavior: 'smooth' })
}

let ro = null
onMounted(() => {
  update()
  ro = new ResizeObserver(() => update())
  if (track.value) ro.observe(track.value)
})
onBeforeUnmount(() => {
  if (ro) ro.disconnect()
})
</script>

<style scoped>
.scroll-snap {
  position: relative;
}
.scroll-snap__track {
  display: flex;
  gap: var(--snap-gap, 24px);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 8px 4px 24px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  /* 两端渐隐，暗示可滑动 */
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
}
.scroll-snap__track::-webkit-scrollbar { display: none; }

.scroll-snap__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(22, 22, 26, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 8px 24px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.25s, border-color 0.25s, color 0.25s, opacity 0.25s;
}
.scroll-snap__nav svg { width: 22px; height: 22px; }
.scroll-snap__nav--prev { left: -10px; }
.scroll-snap__nav--next { right: -10px; }
.scroll-snap__nav:hover:not(:disabled) {
  background: rgba(200, 146, 75, 0.22);
  border-color: rgba(200, 146, 75, 0.55);
  color: var(--gold, #c8924b);
  transform: translateY(-50%) scale(1.08);
}
.scroll-snap__nav:active:not(:disabled) {
  transform: translateY(-50%) scale(0.94);
}
.scroll-snap__nav:disabled {
  opacity: 0.2;
  cursor: default;
  pointer-events: none;
}

@media (max-width: 768px) {
  .scroll-snap__nav {
    width: 38px;
    height: 38px;
  }
  .scroll-snap__nav svg { width: 18px; height: 18px; }
}
</style>
