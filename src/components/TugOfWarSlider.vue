<template>
    <div class="tug-of-war-slider">
        <v-slider
            v-model="localPosition"
            :min="-100"
            :max="100"
            label="Tug of War Slider"
            thumb-label
            color="red"
            track-color="blue"
            thumb-color="black"
        ></v-slider>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {  // Changed from position to modelValue
        type: Number,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);  // Changed from update:position

const localPosition = computed({
    get: () => props.modelValue,  // Changed from props.position
    set: (value) => emit('update:modelValue', value)  // Changed from update:position
});
</script>

<style>
.tug-of-war-slider .v-slider-track__fill {
    opacity: 1 !important;
}

.tug-of-war-slider .v-slider-track__background {
    opacity: 1 !important;
    height: 6px !important;
}

.tug-of-war-slider .v-slider-track {
    height: 6px !important;
}

.tug-of-war-slider .v-slider-thumb {
    cursor: pointer;
}
</style>