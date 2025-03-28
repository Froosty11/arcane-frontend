<template>
    <div class="gradient-overlay" :style="gradientStyle"></div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    position: {
        type: Number,
        required: true,
    }
});

const gradientStyle = computed(() => {
    const absPosition = Math.abs(props.position);
    const intensity = Math.min(0.3, Math.max(0, (absPosition - 30) / 100));

    if (props.position > 0) {
        return {
            background: `linear-gradient(90deg,
                rgba(255, 20, 147, ${intensity}) 0%,
                rgba(255, 20, 147, 0) ${50 + props.position}%
            )`,
            opacity: 1,
            transition: 'background 0.4s ease'
        };
    } else if (props.position < 0) {
        return {
            background: `linear-gradient(270deg,
                rgba(0, 191, 255, ${intensity}) 0%,
                rgba(0, 191, 255, 0) ${50 - props.position}%
            )`,
            opacity: 1,
            transition: 'background 0.4s ease'
        };
    }

    return {
        opacity: 0,
        transition: 'background 0.4s ease'
    };
});
</script>

<style scoped>
.gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
}
</style>