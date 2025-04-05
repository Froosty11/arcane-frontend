<template>
    <div class="parallax-container">
        <v-img
            class="background-image"
            :src="backgroundImage"
            :style="backgroundStyle"
        />

        <background-gradient :position="position" />

        <div class="red-character-container" :style="redImageStyle">
            <div class="red-content" style="transform: scaleX(-1)">
                <v-img
                    class="parallax-image red-image"
                    :src="redImage"
                    alt="Red Team"
                    :style="redLightingStyle"
                />
                <lightning-particle
                    ref="redLightning"
                    :x="290"
                    :y="990"
                    :direction="-15"
                    :active="position > 100"
                    :position="position"
                    color="#e2c4d2"
                    glow-color="#ff1493"
                    @opacity-change="redOpacity = $event"
                />
            </div>
        </div>

        <div class="blue-character-container" :style="blueImageStyle">
            <div class="blue-content">
                <v-img
                    class="parallax-image blue-image"
                    :src="blueImage"
                    alt="Blue Team"
                    :style="blueLightingStyle"
                />
                <lightning-particle
                    ref="blueLightning"
                    :x="450"
                    :y="600"
                    :direction="0"
                    :active="position < -100"
                    :position="position"
                    color="#a0e6ff"
                    glow-color="#00bfff"
                    @opacity-change="blueOpacity = $event"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import redImage from '../assets/JINX.png';
import blueImage from '../assets/VI.png';
import backgroundImage from '../assets/back-dashless.png';
import LightningParticle from './LightningParticle.vue';
import BackgroundGradient from "@/components/BackgroundGradient.vue";

const props = defineProps({
    position: {
        type: Number,
        required: true,
    },
});

const redOpacity = ref(0);
const blueOpacity = ref(0);

// ... existing imports and refs ...

const redMinX = 200;
const redMinY = -50;
const redMinScale = 1.2;
const redMaxX = 600;
const redMaxY = -200;
const redMaxScale = 1.5;

const blueMinX = -200;
const blueMinY = 100;
const blueMinScale = 1.2;
const blueMaxX = -600;
const blueMaxY = 0;
const blueMaxScale = 1.5;

const redImageStyle = computed(() => ({
    transform: `translate3d(
        ${redMinX + (props.position / 1000) * (redMaxX - redMinX)}px,
        ${redMinY + (props.position / 1000) * (redMaxY - redMinY)}px,
        0)
        scale(${redMinScale + (props.position / 1000) * (redMaxScale - redMinScale)})`,
    transition: "transform 0.2s ease"
}));

const blueImageStyle = computed(() => ({
    transform: `translate3d(
        ${blueMinX + (-props.position / 1000) * (blueMaxX - blueMinX)}px,
        ${blueMinY + (-props.position / 1000) * (blueMaxY - blueMinY)}px,
        0)
        scale(${blueMinScale + (-props.position / 1000) * (blueMaxScale - blueMinScale)})`,
    transition: "transform 0.2s ease"
}));

const backgroundStyle = computed(() => ({
    transform: `scale(1.1) translateX(${(props.position / 200) * 30}px) rotateY(${(props.position / 1000) * 5}deg)`,
    transition: "transform 0.2s ease"
}));
const redLightingStyle = computed(() => ({
    filter: `brightness(${1 + redOpacity.value * 0.3})`
}));

const blueLightingStyle = computed(() => ({
    filter: `brightness(${1 + blueOpacity.value * 0.3})`
}));
</script>

<style scoped>
.parallax-container {
    position: relative;
    height: 1123px;
    width: 100vw;
    overflow: hidden;
    perspective: 1000px;
    margin: 0;
    padding: 0;
}

.background-image {
    position: absolute;
    inset: 0;
    width: 120%;
    height: 120%;
    z-index: 0;
    overflow: hidden;
    transform-style: preserve-3d;
}

.parallax-image {
    position: relative;
    height: 100%;
    width: 100%;
}

.red-character-container {
    position: absolute;
    left: 5%;
    height: 100%;
    width: 25%;
    z-index: 2;
}

.blue-character-container {
    position: absolute;
    right: 5%;
    height: 100%;
    width: 25%;
    z-index: 1;
}

.red-content, .blue-content {
    position: relative;
    height: 100%;
    width: 100%;
}

.blue-image {
    transform: scaleX(1);
}
.red-image{
    transform: scaleX(-1);
}

.red-image :deep(.v-img__img) {
    object-fit: contain;
    object-position: bottom;
}

.particles-layer {
    position: absolute;
    inset: 0;
    z-index: 1;
}
</style>