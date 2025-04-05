<template>
    <div class="health-bar-container" :style="containerStyle">
        <v-progress-linear
            :model-value="health"
            :height="barHeight"
            :color="gradientColor"
            bg-color="grey-darken-4"
            :rounded="false"
            class="health-progress"
        >
            <template v-slot:default="{ value }">
            </template>
        </v-progress-linear>
        <div class="vertical-divider" :style="dividerStyle"></div>
        <div class="border-overlay" :style="borderStyle"/>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    position: {
        type: Number,
        required: true
    },
    width: {
        type: Number,
        default: 300
    },
    barHeight: {
        type: Number,
        default: 25
    },
    xOffset: {
        type: Number,
        default: 20
    },
    upOffset: {
        type: Number,
        default: 10
    },
    downOffset: {
        type: Number,
        default: 10
    }
});

const health = computed(() => {
    const normalizedPosition = (props.position + 1000) / 20;
    return Math.max(0, Math.min(100, normalizedPosition));
});

const gradientColor = computed(() => {
    return props.position < 0 ? 'blue' : 'pink';
});

const containerStyle = computed(() => ({
    width: `${props.width}px`,
    height: `${props.barHeight}px`,
    top: '10vh',
    left: '50%',
    transform: 'translateX(-50%)'
}));

const borderStyle = computed(() => ({
    width: `${props.width + (props.xOffset * 2)}px`,
    height: `${props.barHeight + props.upOffset + props.downOffset}px`,
    left: `-${props.xOffset}px`,
    top: `-${props.upOffset}px`,
    transform: `scale(1)`
}));
const dividerStyle = computed(() => ({
    left: `${health.value}%`
}));
</script>

<style scoped>
.health-bar-container {
    position: fixed;
    z-index: 100;
}

.health-progress {
    width: 100%;
    height: 100%;
    z-index: 1;
}

.border-overlay {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    background-image: url('@/assets/healthbar-border.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    transform-origin: center;
}

.health-text {
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    z-index: 3;
    position: relative;
}

:deep(.v-progress-linear__background) {
    background: linear-gradient(to bottom, #93a6ff, #15188d) !important;
    opacity: 1 !important;
}

:deep(.v-progress-linear__determinate) {
    background: linear-gradient(to bottom, #ffa2ee, #640854) !important;
    transition: width 0.3s ease-out;
}

.vertical-divider {
    position: absolute;
    top: 0;
    height: 100%;
    width: 5px;
    background-color: black;
    z-index: 2;
    transition: left 0.3s ease-out;
}
</style>