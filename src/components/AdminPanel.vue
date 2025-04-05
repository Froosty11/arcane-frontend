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
                <v-btn @click="adjustPosition(-10*1.8)">-18</v-btn>
                <v-btn @click="adjustPosition(-5*1.8)">-9</v-btn>
                <v-btn @click="adjustPosition(5)">+5</v-btn>
                <v-btn @click="adjustPosition(10)">+10</v-btn>
            </v-btn-group>
        </div>

        <div class="current-state">
            <h2>Current State</h2>
            <p>Position: {{ currentPosition }}</p>
            <p>Debug Mode: {{ showDebug ? 'On' : 'Off' }}</p>
            <p>MQTT Status: {{ connectionStatus }}</p>
        </div>

        <div v-if="messageLog.length > 0" class="message-log">
            <h2>Message Log</h2>
            <ul>
                <li v-for="(msg, index) in messageLog" :key="index">{{ msg }}</li>
            </ul>
        </div>
        <div class="killstreak-controls">
            <h2>Killstreak Controls</h2>
            <v-btn-group>
                <v-btn color="blue" @click="triggerKillstreak('QUADRAKILL', 'ITK')">Quadra ITK</v-btn>
                <v-btn color="blue" @click="triggerKillstreak('PENTAKILL', 'ITK')">Penta ITK</v-btn>
                <v-btn color="blue" @click="triggerKillstreak('HEXAKILL', 'ITK')">Hexa ITK</v-btn>
            </v-btn-group>

            <v-btn-group class="mt-2">
                <v-btn color="pink" @click="triggerKillstreak('QUADRAKILL', 'TMEIT')">Quadra TMEIT</v-btn>
                <v-btn color="pink" @click="triggerKillstreak('PENTAKILL', 'TMEIT')">Penta TMEIT</v-btn>
                <v-btn color="pink" @click="triggerKillstreak('HEXAKILL', 'TMEIT')">Hexa TMEIT</v-btn>
            </v-btn-group>
        </div>

        <div class="combo-controls">
            <h2>Combo Controls</h2>
            <v-btn-group>
                <v-btn color="blue" @click="resetCombo('ITK')">Reset ITK Combo</v-btn>
                <v-btn color="pink" @click="resetCombo('TMEIT')">Reset TMEIT Combo</v-btn>
            </v-btn-group>

            <div class="mt-2">
                <v-switch
                    v-model="combosEnabled"
                    label="Enable Combos"
                    @change="toggleCombos"
                ></v-switch>
            </div>
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


const combosEnabled = ref(true);

const triggerKillstreak = (type, team) => {
    if (client && client.connected) {
        client.publish('kistan/arcane/admin', JSON.stringify({
            action: 'killstreak',
            type,
            team
        }));
        addToMessageLog(`Triggered ${type} for ${team}`);
    }
};

const resetCombo = (team) => {
    if (client && client.connected) {
        client.publish('kistan/arcane/admin', JSON.stringify({
            action: 'resetCombo',
            team
        }));
        addToMessageLog(`Reset combo for ${team}`);
    }
};

const toggleCombos = () => {
    if (client && client.connected) {
        client.publish('kistan/arcane/admin', JSON.stringify({
            action: 'toggleCombos',
            enabled: combosEnabled.value
        }));
        addToMessageLog(`Combos ${combosEnabled.value ? 'enabled' : 'disabled'}`);
    }
};

const emit = defineEmits(['update:position', 'update:showDebug']);
const connectionStatus = ref('Disconnecting');
const messageLog = ref([]);
const currentPosition = ref(props.position);
const clientId = 'admin_client_' + Math.random().toString(16).substr(2, 8);
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
        clientId
    };

    addToMessageLog('Connecting to MQTT broker...');
    client = mqtt.connect('wss://mqtt.insektionen.se/mqtt', options);

    client.on('connect', () => {
        connectionStatus.value = 'Connected';
        addToMessageLog('Connected successfully');

        // Subscribe to arcanescore to get position updates
        client.subscribe(['kistan/arcanescore'], (err) => {
            if (err) {
                addToMessageLog('Subscribe error: ' + err.message);
            } else {
                addToMessageLog('Subscribed to kistan/arcanescore');
                // Request current position
                client.publish('kistan/arcane', 'admin:request_position');
            }
        });
    });

    client.on('message', (topic, message) => {
        const messageStr = message.toString();
        if (topic === 'kistan/arcanescore' && messageStr.startsWith('client:')) {
            const newPosition = parseFloat(messageStr.split(':')[1]);
            if (!isNaN(newPosition)) {
                currentPosition.value = newPosition;
                addToMessageLog(`Position updated to: ${newPosition}`);
            }
        }
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
        // Add retain: true to the publish options
        client.publish('kistan/arcane', `admin:${delta}`, { retain: true });
        addToMessageLog(`Published admin position change: ${delta}`);
    } else {
        addToMessageLog('Error: Not connected to MQTT broker');
    }
};

const resetPosition = () => {
    if (client && client.connected) {
        // Calculate delta needed to reset to 0
        const delta = -currentPosition.value;
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
.killstreak-controls, .combo-controls {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
}

.v-btn-group {
    margin: 5px 0;
}
</style>