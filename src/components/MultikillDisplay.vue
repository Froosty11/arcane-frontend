<template>
    <transition name="fade">
        <div v-if="isVisible" className="multikill-container">
            <img :src="getKillStreakImage" :alt="props.killType" class="multikill-image">
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
const audio = ref(null);

const killStreakConfig = {
    QUADRAKILL: {
        TMEIT: {
            image: new URL('@/assets/blue-quadrakill.png', import.meta.url).href,
            sound: new URL('@/assets/quadrakill.ogg', import.meta.url).href,
            duration: 3000
        },
        ITK: {
            image: new URL('@/assets/blue-quadrakill.png', import.meta.url).href,
            sound: new URL('@/assets/quadrakill.ogg', import.meta.url).href,
            duration: 3000
        }
    },
    PENTAKILL: {
        TMEIT: {
            image: new URL('@/assets/blue-pentakill.png', import.meta.url).href,
            sound: new URL('@/assets/pentakill.ogg', import.meta.url).href,
            duration: 3500
        },
        ITK: {
            image: new URL('@/assets/blue-pentakill.png', import.meta.url).href,
            sound: new URL('@/assets/pentakill.ogg', import.meta.url).href,
            duration: 3500
        }
    },
    HEXAKILL: {
        TMEIT: {
            image: new URL('@/assets/blue-hexakill.png', import.meta.url).href,
            sound: new URL('@/assets/hexakill.ogg', import.meta.url).href,
            duration: 4000
        },
        ITK: {
            image: new URL('@/assets/blue-hexakill.png', import.meta.url).href,
            sound: new URL('@/assets/hexakill.ogg', import.meta.url).href,
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
    audio.value = new Audio(getKillStreakConfig.value.sound);
    showKillStreak();
});

const showKillStreak = () => {
    isVisible.value = true;
    audio.value.play();

    setTimeout(() => {
        isVisible.value = false;
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


.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>