<<template>
    <div class="parallax-container">
        <v-img
            class="background-image"
            :src="backgroundImage"
            :style="backgroundStyle"
        />

        <v-img
            class="parallax-image blue-image"
            :src="blueImage"
            :style="blueImageStyle"
            alt="Blue Team"
        />

        <v-img
            class="parallax-image red-image"
            :src="redImage"
            :style="redImageStyle"
            alt="Red Team"
        />
    </div>
</template>

<script setup>
import {computed} from 'vue';
import redImage from '../assets/red-image.png';
import blueImage from '../assets/blue-image.png';
import backgroundImage from '../assets/fortnite.jpg';

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

const redImageStyle = computed(() => ({
    transform: `scaleX(-1) translateX(${-100 - (props.position / 100) * 100}px) scale(${1 + (props.position / 100) * 0.3})`,
    transition: "transform 0.2s ease"
}));

const blueImageStyle = computed(() => ({
    transform: `scaleX(-1) translateX(${100 - (props.position / 100) * 100}px) scale(${1 - (props.position / 100) * 0.3})`,
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
    position: absolute;
    height: 100%;
    width: 25%;
    object-fit: contain;
    object-position: bottom;
    bottom: 0;
}

.red-image {
    left: 5%;
    z-index: 2;
}

.blue-image {
    right: 5%;
    z-index: 1;
}
</style>