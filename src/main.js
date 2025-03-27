import { createApp } from 'vue';
import App from './App.vue';
import 'vuetify/styles'; // Import Vuetify styles
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Create Vuetify instance
const vuetify = createVuetify({
    components,
    directives,
});

// Create Vue app
const app = createApp(App);
app.use(vuetify);
app.mount('#app');