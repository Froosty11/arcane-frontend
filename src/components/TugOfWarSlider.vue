<template>
    <div>
        <v-slider
            class="tug-of-war-slider"
            :model-value="position"
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
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
    position: {
        type: Number,
        required: true
    }
});

const emit = defineEmits(['update:position']);

const updatePosition = (value) => {
    emit('update:position', value);
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
</style>