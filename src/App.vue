<template>
    <v-app>
        <v-container class="pa-0 ga-0 ma-0">
            <parallax-effect :position="position" />
            <tug-of-war-slider v-model:position="position" />
        </v-container>
    </v-app>
</template>

<script setup>
import { ref } from 'vue';
import ParallaxEffect from "@/components/ParallaxEffect.vue";
import TugOfWarSlider from "@/components/TugOfWarSlider.vue";

const position = ref(0);
</script>