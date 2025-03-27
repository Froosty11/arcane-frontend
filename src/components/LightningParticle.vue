<template>
    <svg class="lightning-container" :style="containerStyle">
        <g v-for="(branch, index) in branches" :key="`${index}-${timestamp}`">
            <line
                v-for="(segment, segIndex) in branch.segments"
                :key="`${segIndex}-${timestamp}`"
                :x1="segment.start.x"
                :y1="segment.start.y"
                :x2="segment.end.x"
                :y2="segment.end.y"
                class="lightning-segment"
            />
        </g>
    </svg>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    active: { type: Boolean, default: true },
    direction: { type: Number, default: 90 } // Angle in degrees (90 = upward)
});

const config = {
    branchCount: 2,
    segmentsPerBranch: 4,
    maxAngleChange: 30,
    segmentLength: 20,
    branchChance: 0.4,
    spreadAngle: 30,
    updateInterval: 800,  // Time in ms between updates
    fadeTime: 400,       // Time in ms to fade out
    colors: {
        primary: '#ff69b4',
        glow: '#ff1493'
    }
};

const branches = ref([]);
const timestamp = ref(0);
let animationFrame;

const generateBranch = (startX, startY, baseAngle, depth = 0) => {
    const segments = [];
    let currentX = startX;
    let currentY = startY;
    let currentAngle = baseAngle + (Math.random() - 0.5) * config.spreadAngle;

    for (let i = 0; i < config.segmentsPerBranch; i++) {
        const angleChange = (Math.random() - 0.5) * config.maxAngleChange;
        currentAngle += angleChange;
        const radians = currentAngle * Math.PI / 180;

        const endX = currentX + Math.cos(radians) * config.segmentLength;
        const endY = currentY - Math.sin(radians) * config.segmentLength;

        segments.push({
            start: { x: currentX, y: currentY },
            end: { x: endX, y: endY }
        });

        if (depth < 2 && Math.random() < config.branchChance) {
            const newBranch = generateBranch(
                currentX,
                currentY,
                currentAngle + (Math.random() * 40 - 20),
                depth + 1
            );
            branches.value.push({ segments: newBranch });
        }

        currentX = endX;
        currentY = endY;
    }

    return segments;
};

const opacity = ref(1);
const lastUpdate = ref(0);

const containerStyle = computed(() => ({
    position: 'absolute',
    left: `${props.x}px`,
    top: `${props.y}px`,
    width: '1200px',
    height: '1200px',
    transform: 'translate(-50%, -50%)',
    opacity: props.active ? opacity.value : 0,
    transition: `opacity ${config.fadeTime}ms ease-out`
}));
const updateLightning = () => {
    const currentTime = Date.now();

    // Only update if enough time has passed
    if (currentTime - lastUpdate.value >= config.updateInterval) {
        branches.value = [];
        for (let i = 0; i < config.branchCount; i++) {
            const angleOffset = (Math.random() - 0.5) * config.spreadAngle;
            const branch = generateBranch(600, 900, props.direction + angleOffset);
            branches.value.push({ segments: branch });
        }
        lastUpdate.value = currentTime;
        opacity.value = 1;

        // Start fade out
        setTimeout(() => {
            opacity.value = 0;
        }, config.updateInterval - config.fadeTime);
    }

    timestamp.value = currentTime;
    animationFrame = requestAnimationFrame(updateLightning);
};

onMounted(() => {
    if (props.active) {
        animationFrame = requestAnimationFrame(updateLightning);
    }
});

onUnmounted(() => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
});
</script>

<style scoped>
.lightning-container {
    pointer-events: none;
    z-index: 10;
}

.lightning-segment {
    stroke: v-bind('config.colors.primary');
    stroke-width: 2;
    filter: drop-shadow(0 0 5px v-bind('config.colors.primary'))
    drop-shadow(0 0 8px v-bind('config.colors.glow'));
}
</style>