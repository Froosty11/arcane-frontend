<template>
    <v-app>
        <v-container className="pa-0 ga-0 ma-0">
            <parallax-effect :position="position"/>
            <tug-of-war-slider v-if="showDebug" v-model:position="position"/>
            <mqtt-service v-model:position="position" :debug="showDebug"/>
        </v-container>
    </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ParallaxEffect from "@/components/ParallaxEffect.vue";
import TugOfWarSlider from "@/components/TugOfWarSlider.vue";
import MqttService from "@/components/MqttService.vue";

const position = ref(0);
const showDebug = ref(true);

const handleKeyPress = (event) => {
    if (event.code === 'Space') {
        showDebug.value = !showDebug.value;
        event.preventDefault();
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress);
});
</script>