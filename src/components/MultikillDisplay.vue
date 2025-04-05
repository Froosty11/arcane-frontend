<template>
    <transition name="fade">
        <div v-if="isVisible" className="multikill-container">
            <img :src="getKillStreakImage" :alt="props.killType" class="multikill-image" :class="{ 'fade-out': isFadingOut }">
        </div>
    </transition>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';

const props = defineProps({
    killType: {
        type: String,
        required: true
    },
    team: {
        type: String,
        required: true
    }
});

const isVisible = ref(false);
const isFadingOut = ref(false);

const killStreakConfig = {
    QUADRAKILL: {
        TMEIT: {
            image: new URL('@/assets/quadra-blue.png', import.meta.url).href,
            duration: 3000
        },
        ITK: {
            image: new URL('@/assets/quadra-pink.png', import.meta.url).href,
            duration: 3000
        }
    },
    PENTAKILL: {
        TMEIT: {
            image: new URL('@/assets/pentakill-blue', import.meta.url).href,
            duration: 3500
        },
        ITK: {
            image: new URL('@/assets/pentakill-pink.png', import.meta.url).href,
            duration: 3500
        }
    },
    HEXAKILL: {
        TMEIT: {
            image: new URL('@/assets/hexakill-blue.png', import.meta.url).href,
            duration: 4000
        },
        ITK: {
            image: new URL('@/assets/hexakill-pink.png', import.meta.url).href,
            duration: 4000
        }
    }
};

const getKillStreakImage = computed(() =>
    killStreakConfig[props.killType][props.team].image
);

const getKillStreakConfig = computed(() =>
    killStreakConfig[props.killType][props.team]
);

onMounted(() => {
    showKillStreak();
});

const showKillStreak = () => {
    isVisible.value = true;
    isFadingOut.value = false;

    const fadeOutTime = 1000; // 1 second fade out
    const displayDuration = getKillStreakConfig.value.duration - fadeOutTime;

    setTimeout(() => {
        isFadingOut.value = true;
    }, displayDuration);

    setTimeout(() => {
        isVisible.value = false;
        isFadingOut.value = false;
    }, getKillStreakConfig.value.duration);
};
</script>

<style scoped>
.multikill-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
}

.multikill-image {
    transition: opacity 1s ease-in-out;
    opacity: 1;
}

.multikill-image.fade-out {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>