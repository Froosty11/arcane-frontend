<template>
    <div class="admin-panel">
        <h1>Admin Panel</h1>
        <div class="controls">
            <v-btn color="error" @click="resetPosition">Reset Position</v-btn>
            <v-btn color="primary" @click="toggleDebug">Toggle Debug</v-btn>
        </div>

        <div class="manual-control">
            <h2>Manual Control</h2>
            <v-btn-group>
                <v-btn @click="adjustPosition(-10)">-10</v-btn>
                <v-btn @click="adjustPosition(-5)">-5</v-btn>
                <v-btn @click="adjustPosition(5)">+5</v-btn>
                <v-btn @click="adjustPosition(10)">+10</v-btn>
            </v-btn-group>
        </div>

        <div class="current-state">
            <h2>Current State</h2>
            <p>Position: {{ position }}</p>
            <p>Debug Mode: {{ showDebug ? 'On' : 'Off' }}</p>
            <p>MQTT Status: {{ connectionStatus }}</p>
        </div>

        <div v-if="messageLog.length > 0" class="message-log">
            <h2>Message Log</h2>
            <ul>
                <li v-for="(msg, index) in messageLog" :key="index">{{ msg }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import mqtt from 'mqtt';

const props = defineProps({
    position: {
        type: Number,
        required: true
    },
    showDebug: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['update:position', 'update:showDebug']);
const connectionStatus = ref('Disconnecting');
const messageLog = ref([]);
let client;

const addToMessageLog = (message) => {
    messageLog.value.unshift(new Date().toLocaleTimeString() + ': ' + message);
    if (messageLog.value.length > 10) {
        messageLog.value.pop();
    }
};

const connectMqtt = () => {
    const options = {
        protocol: 'wss',
        clientId: 'admin_client_' + Math.random().toString(16).substr(2, 8)
    };

    addToMessageLog('Connecting to MQTT broker...');
    client = mqtt.connect('wss://mqtt.insektionen.se/mqtt', options);

    client.on('connect', () => {
        connectionStatus.value = 'Connected';
        addToMessageLog('Connected successfully');
    });

    client.on('error', (error) => {
        addToMessageLog('Error: ' + error.message);
        connectionStatus.value = 'Error';
    });

    client.on('disconnect', () => {
        connectionStatus.value = 'Disconnected';
        addToMessageLog('Disconnected from broker');
    });

    client.on('reconnect', () => {
        connectionStatus.value = 'Reconnecting';
        addToMessageLog('Attempting to reconnect...');
    });
};

const publishPosition = (delta) => {
    if (client && client.connected) {
        client.publish('kistan/arcane', delta.toString());
        addToMessageLog(`Published position change: ${delta}`);
    } else {
        addToMessageLog('Error: Not connected to MQTT broker');
    }
};

const resetPosition = () => {
    if (client && client.connected) {
        // Calculate delta needed to reset to 0
        const delta = -props.position;
        publishPosition(delta);
    }
};

const toggleDebug = () => {
    emit('update:showDebug', !props.showDebug);
};

const adjustPosition = (delta) => {
    publishPosition(delta);
};

onMounted(() => {
    connectMqtt();
});

onUnmounted(() => {
    if (client) {
        client.end();
        connectionStatus.value = 'Disconnected';
    }
});
</script>

<style scoped>
.admin-panel {
    padding: 20px;
}

.controls, .manual-control, .current-state, .message-log {
    margin: 20px 0;
}

.v-btn {
    margin: 0 5px;
}

.message-log ul {
    list-style: none;
    padding-left: 0;
    margin: 5px 0;
    max-height: 200px;
    overflow-y: auto;
}

.message-log li {
    margin: 2px 0;
    word-break: break-all;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 2px 0;
}
</style>