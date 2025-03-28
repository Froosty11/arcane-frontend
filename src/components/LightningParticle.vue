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
                :style="lightningStyle"
            />
        </g>
    </svg>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';

const emit = defineEmits(['opacity-change']);

const props = defineProps({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    active: { type: Boolean, default: true },
    direction: { type: Number, default: 90 },
    position: { type: Number, default: 0 },
    color: { type: String, default: '#e2c4d2' },
    glowColor: { type: String, default: '#ff1493' }
});

const branches = ref([]);
const timestamp = ref(0);
const opacity = ref(1);
const lastUpdate = ref(0);
let animationFrame;

const generateBranch = (startX, startY, baseAngle, depth = 0) => {
    const intensity = (Math.max(0.2, Math.min(1, Math.abs(props.position) / 100)))*0.5;
    const segments = [];
    let currentX = startX;
    let currentY = startY;
    let currentAngle = baseAngle + (Math.random() - 0.5) * (20 + intensity * 10);

    const numSegments = Math.max(3, Math.floor(4 + intensity * 4));

    for (let i = 0; i < numSegments; i++) {
        const angleChange = (Math.random() - 0.5) * (20 + intensity * 10);
        currentAngle += angleChange;
        const radians = currentAngle * Math.PI / 180;
        const segmentLength = 20 + intensity * 15;

        const endX = currentX + Math.cos(radians) * segmentLength;
        const endY = currentY - Math.sin(radians) * segmentLength;

        segments.push({
            start: { x: currentX, y: currentY },
            end: { x: endX, y: endY }
        });

        if (depth < 2 && Math.random() < (0.25-0.1*depth + intensity * 0.3)) {
            const newBranch = generateBranch(
                currentX,
                currentY,
                currentAngle + (Math.random() * 40 - 10),
                depth + 1
            );
            branches.value.push({ segments: newBranch });
        }

        currentX = endX;
        currentY = endY;
    }

    return segments;
};

const updateLightning = () => {
    const currentTime = Date.now();
    const intensity = (Math.max(0.2, Math.min(1, Math.abs(props.position) / 100)))*0.3;
    const updateInterval = 100 + (1 - intensity) * 300;
    const fadeTime = 50 + (1 - intensity) * 150;

    if (currentTime - lastUpdate.value >= updateInterval) {
        branches.value = [];
        const branchCount = Math.max(1, Math.floor(1 + intensity * 2));

        for (let i = 0; i < branchCount; i++) {
            const spreadAngle = 10 + intensity * 5;
            const angleOffset = (Math.random() - 0.5) * spreadAngle;
            const startX = 50;
            const startY = 100;
            const branch = generateBranch(startX, startY, props.direction + angleOffset, 0);
            branches.value.push({ segments: branch });
        }

        lastUpdate.value = currentTime;
        opacity.value = 1;
        emit('opacity-change', 1);

        setTimeout(() => {
            opacity.value = 0;
            emit('opacity-change', 0);
        }, fadeTime);
    }

    timestamp.value = currentTime;
    if (props.active) {
        animationFrame = requestAnimationFrame(updateLightning);
    }
};

const containerStyle = computed(() => ({
    position: 'absolute',
    left: `${props.x}px`,
    top: `${props.y}px`,
    width: '600px',
    height: '600px',
    transform: 'translate(-50%, -50%)',
    opacity: props.active ? opacity.value : 0,
    transition: 'opacity 400ms ease-out'
}));

const lightningStyle = computed(() => ({
    stroke: props.color,
    filter: `drop-shadow(0 0 5px ${props.color}) drop-shadow(0 0 8px ${props.glowColor})`
}));

onMounted(() => {
    lastUpdate.value = Date.now();
    if (props.active) {
        animationFrame = requestAnimationFrame(updateLightning);
    }
});

watch(() => props.active, (newValue) => {
    if (newValue) {
        animationFrame = requestAnimationFrame(updateLightning);
    } else if (animationFrame) {
        cancelAnimationFrame(animationFrame);
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
    stroke-width: 2;
}
</style>