<template>
    <div class="parallax-container">
        <v-img
            class="background-image"
            :src="backgroundImage"
            :style="backgroundStyle"
        />

        <div class="red-character-container" :style="redImageStyle">
            <div class="red-content" style="transform: scaleX(-1)">
                <v-img
                    class="parallax-image red-image"
                    :src="redImage"
                    alt="Red Team"
                />
                <lightning-particle
                    :x="38"
                    :y="492"
                    :direction="-15"
                    :active="position > 0"
                    :position="position"
                />
            </div>
        </div>
        <v-img
            class="parallax-image blue-image"
            :src="blueImage"
            :style="blueImageStyle"
            alt="Blue Team"
        />
    </div>
</template>

<script setup>
import {computed} from 'vue';
import redImage from '../assets/red-image.png';
import blueImage from '../assets/blue-image.png';
import backgroundImage from '../assets/back-dashless.png';
import LightningParticle from './LightningParticle.vue';

const props = defineProps({
    position: {
        type: Number,
        required: true,
    },
});

const backgroundStyle = computed(() => ({
    transform: `scale(1.1) translateX(${(props.position / 200) * 30}px) rotateY(${(props.position / 100) * 5}deg)`,
    transition: "transform 0.2s ease"
}));

// Red (Jinx) transform variables
const redMinX = 200;     // Position when losing (position low)
const redMinY = -50;       // Position when losing (position low)
const redMinScale = 1.2;   // Scale when losing (position low)
const redMaxX = 600;     // Position when winning (position high)
const redMaxY = -200;    // Position when winning (position high)
const redMaxScale = 1.5; // Scale when winning (position high)

// Blue (Vi) transform variables
const blueMinX = -200;    // Position when losing (position high)
const blueMinY = 100;      // Position when losing (position high)
const blueMinScale = 1.2;  // Scale when losing (position high)
const blueMaxX = -600;    // Position when winning (position low)
const blueMaxY = 0;   // Position when winning (position low)
const blueMaxScale = 1.5;// Scale when winning (position low)

const redImageStyle = computed(() => ({
    transform: `translate3d(
        ${redMinX + (props.position / 100) * (redMaxX - redMinX)}px,
        ${redMinY + (props.position / 100) * (redMaxY - redMinY)}px,
        0)
        scale(${redMinScale + (props.position / 100) * (redMaxScale - redMinScale)})`,
    transition: "transform 0.2s ease"
}));

const blueImageStyle = computed(() => ({
    transform: `translate3d(
        ${blueMinX + (-props.position / 100) * (blueMaxX - blueMinX)}px,
        ${blueMinY + (-props.position / 100) * (blueMaxY - blueMinY)}px,
        0)
        scaleX(-1)
        scale(${blueMinScale + (-props.position / 100) * (blueMaxScale - blueMinScale)})`,
    transition: "transform 0.2s ease"
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

.red-content {
    position: relative;
    height: 100%;
    width: 100%;
}

.blue-image {
    position: absolute;
    right: 5%;
    height: 100%;
    width: 25%;
    z-index: 1;
}

/* Target v-img's internal structure */
.red-image :deep(.v-img__img) {
    object-fit: contain;
    object-position: bottom;
}

/* Add to your existing styles */
.particles-layer {
    position: absolute;
    inset: 0;
    z-index: 1;
}
</style>