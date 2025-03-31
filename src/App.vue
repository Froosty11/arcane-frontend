<template>
    <v-app>
        <v-container v-if="currentRoute === '/'" className="pa-0 ga-0 ma-0">
            <parallax-effect :position="position"/>
            <tug-of-war-slider v-if="showDebug" v-model="position"/>
            <mqtt-service v-model="position" :debug="showDebug"/>
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

const position = ref(0);
const showDebug = ref(true);
const currentRoute = ref(window.location.pathname);

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
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress);
    window.removeEventListener('popstate', handleRoute);
});
</script>