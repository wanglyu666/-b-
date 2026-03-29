<template>
  <div class="management-halo-root" aria-hidden="true">
    <div ref="haloA" class="halo halo-a" />
    <div ref="haloB" class="halo halo-b" />
    <div ref="haloC" class="halo halo-c" />
    <div ref="haloD" class="halo halo-d" />
    <!-- 与页面底色 #f1f3f0 自下而上柔化，避免中段出现一条「硬切」断层 -->
    <div class="halo-bottom-fade" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const haloA = ref<HTMLElement | null>(null);
const haloB = ref<HTMLElement | null>(null);
const haloC = ref<HTMLElement | null>(null);
const haloD = ref<HTMLElement | null>(null);

const running = ref<Animation[]>([]);

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** 闭合随机路径：多段位移，首尾相同，在视口比例内飘动 */
function buildLoopKeyframes(isYellow: boolean): Keyframe[] {
  const seg = 7 + Math.floor(Math.random() * 4);
  const points: {
    x: number;
    y: number;
    scale: number;
    opacity: number;
    blur: number;
  }[] = [];

  const opMin = isYellow ? 0.68 : 0.58;
  const opMax = isYellow ? 0.99 : 0.96;

  for (let i = 0; i < seg; i++) {
    points.push({
      x: rand(-46, 46),
      y: rand(-42, 42),
      scale: rand(0.88, 1.58),
      opacity: rand(opMin, opMax),
      blur: rand(52, 128)
    });
  }
  points.push({ ...points[0]! });

  return points.map((p, i) => ({
    transform: `translate(${p.x}vw, ${p.y}vh) scale(${p.scale})`,
    opacity: p.opacity,
    filter: `blur(${p.blur}px)`,
    offset: i / (points.length - 1)
  }));
}

function startHalo(el: HTMLElement | null, isYellow: boolean) {
  if (!el) return;
  const duration = 24000 + Math.random() * 18000;
  const anim = el.animate(buildLoopKeyframes(isYellow), {
    duration,
    iterations: Infinity,
    easing: 'linear'
  });
  running.value.push(anim);
}

onMounted(() => {
  running.value = [];
  startHalo(haloA.value, false);
  startHalo(haloB.value, false);
  startHalo(haloC.value, false);
  startHalo(haloD.value, true);
});

onUnmounted(() => {
  running.value.forEach((a) => a.cancel());
  running.value = [];
});
</script>

<style scoped>
.management-halo-root {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.halo-bottom-fade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 38%,
    rgba(241, 243, 240, 0.35) 72%,
    #f1f3f0 100%
  );
}

.halo {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  will-change: transform, opacity, filter;
  /* 径向光晕：中心 #A1D573，提高中心与过渡区不透明度 */
  background: radial-gradient(
    circle closest-side,
    rgba(161, 213, 115, 0.78) 0%,
    rgba(161, 213, 115, 0.38) 38%,
    rgba(161, 213, 115, 0.14) 62%,
    rgba(161, 213, 115, 0.04) 76%,
    transparent 88%
  );
  filter: blur(68px);
}

.halo-a {
  width: min(82vw, 1020px);
  height: min(82vw, 1020px);
  left: -14%;
  top: -18%;
}

.halo-b {
  width: min(72vw, 900px);
  height: min(72vw, 900px);
  right: -12%;
  top: 4%;
}

.halo-c {
  width: min(62vw, 760px);
  height: min(62vw, 760px);
  left: 22%;
  top: 18%;
}

/* 黄色光斑 #FFEB69 — 更强、略大 */
.halo-d {
  width: min(58vw, 700px);
  height: min(58vw, 700px);
  right: 4%;
  bottom: 4%;
  background: radial-gradient(
    circle closest-side,
    rgba(255, 235, 105, 0.82) 0%,
    rgba(255, 235, 105, 0.42) 36%,
    rgba(255, 235, 105, 0.16) 60%,
    rgba(255, 235, 105, 0.05) 74%,
    transparent 88%
  );
  filter: blur(64px);
}
</style>
