<template>
    <div class="parallax-container">
        <div
            class="background-image"
            :style="backgroundStyle"
        ></div>

        <img
            class="parallax-image red-image"
            :style="redImageStyle"
            :src="redImage"
            alt="Red Team"
        />

        <img
            class="parallax-image blue-image"
            :style="blueImageStyle"
            :src="blueImage"
            alt="Blue Team"
        />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import redImage from '@/assets/red-image.png';
import blueImage from '@/assets/blue-image.png';
import backgroundImage from '@/assets/background-image.png';

const props = defineProps({
    position: {
        type: Number,
        required: true,
    },
});

const backgroundStyle = computed(() => ({
    transform: `scale(${1 - Math.abs(props.position / 200)}) translateX(${(props.position / 200) * 50}px)`,
    transition: "transform 0.2s ease",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: "100%",
    height: "100%"
}));

const redImageStyle = computed(() => ({
    transform: `scale(${1 + (props.position / 100) * 0.5}) translateX(${(props.position / 100) * 50}px)`,
    transition: "transform 0.2s ease"
}));

const blueImageStyle = computed(() => ({
    transform: `scale(${1 - (props.position / 100) * 0.5}) translateX(${(props.position / 100) * -50}px)`,
    transition: "transform 0.2s ease"
}));
</script>

<style scoped>
.parallax-container {
    position: relative;
    height: 300px;
    width: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

.background-image {
    position: absolute;
    inset: 0;
    z-index: -1;
}

.parallax-image {
    position: absolute;
    height: 100%;
    width: auto;
}

.red-image {
    left: 0;
    z-index: 1;
}

.blue-image {
    right: 0;
    z-index: 0;
}
</style>