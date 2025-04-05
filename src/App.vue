<template>
    <v-app>
        <v-container v-if="currentRoute === '/'" className="pa-0 ga-0 ma-0">
            <parallax-effect :position="position"/>
            <health-bar
                :position="position"
                :width="800"
                :bar-height="55"
                :x-offset="500"
                :up-offset="60"
                :down-offset="70"
            />
            <multikill-display
                v-if="currentKillStreak"
                :kill-type="currentKillStreak"
                :team="position >= 0 ? 'TMEIT' : 'ITK'"
            />
            <tug-of-war-slider v-if="showDebug" v-model="position"/>
            <mqtt-service
                v-model="position"
                :debug="showDebug"
                @kill-streak="handleKillStreak"
            />
        </v-container>
        <admin-panel
            v-else-if="currentRoute === '/bombaclat'"
            v-model:position="position"
            v-model:showDebug="showDebug"
        />
    </v-app>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue';
import ParallaxEffect from "@/components/ParallaxEffect.vue";
import TugOfWarSlider from "@/components/TugOfWarSlider.vue";
import MqttService from "@/components/MqttService.vue";
import AdminPanel from "@/components/AdminPanel.vue";
import HealthBar from "@/components/LeagueHealthbar.vue";
import MultikillDisplay from "@/components/MultikillDisplay.vue";

const position = ref(0);
const showDebug = ref(true);
const currentRoute = ref(window.location.pathname);

const currentKillStreak = ref(null);

const handleKillStreak = (type) => {
    currentKillStreak.value = type;
    setTimeout(() => {
        currentKillStreak.value = null;
    }, 4000);
};

const handleKeyPress = (event) => {
    if (event.code === 'Space') {
        showDebug.value = !showDebug.value;
        event.preventDefault();
    }
};

const handleRoute = () => {
    currentRoute.value = window.location.pathname;
};

onMounted(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('popstate', handleRoute);
    document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress);
    window.removeEventListener('popstate', handleRoute);
    document.body.style.overflow = 'auto';
});
</script>

<style>
html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
}

.v-application {
    overflow: hidden;
}

.v-container {
    max-width: 100% !important;
    padding: 0 !important;
}
</style>