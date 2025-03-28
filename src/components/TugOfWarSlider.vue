<template>
    <div>
        <v-slider
            class="tug-of-war-slider"
            v-model="position"
            :min="-100"
            :max="100"
            label="Tug of War Slider"
            thumb-label
            color="red"
            track-color="blue"
            thumb-color="black"
            @update:model-value="updatePosition"
        ></v-slider>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['update:position'])
const position = ref(0)

const updatePosition = (value) => {
    emit('update:position', value)
}
</script>

<style>
/* Remove scoped to ensure styles are applied globally */
.tug-of-war-slider .v-slider-track__fill {
    opacity: 1 !important;
}

.tug-of-war-slider .v-slider-track__background {
    opacity: 1 !important;
    height: var(--v-slider-track-size) !important;
}

.tug-of-war-slider .v-slider-track {
    height: var(--v-slider-track-size) !important;
}
</style>