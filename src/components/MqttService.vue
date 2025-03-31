<template>
    <div class="mqtt-debug" v-if="props.debug">
        <p>MQTT Status: {{ connectionStatus }}</p>
        <p>Position: {{ position }}</p>
        <div class="message-log">
            <p>Last 10 messages:</p>
            <ul>
                <li v-for="(msg, index) in messageLog" :key="index">
                    {{ msg }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import mqtt from 'mqtt';
import gameManager from '@/utils/GameManager';

const props = defineProps({
    debug: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:position']);
const position = ref(0);
const connectionStatus = ref('Disconnecting');
const messageLog = ref([]);
let client;

const publishLog = (topic, message) => {
    if (client && client.connected) {
        client.publish('kistan/arcane/logs', JSON.stringify({
            timestamp: Date.now(),
            type: topic,
            message: message
        }));
    }
};

const addToMessageLog = (message) => {
    messageLog.value.unshift(new Date().toLocaleTimeString() + ': ' + message);
    if (messageLog.value.length > 10) {
        messageLog.value.pop();
    }
};

const interpretReceipt = (receipt) => {
    const result = gameManager.calculateReceipt(receipt);

    if (result.error) {
        addToMessageLog(`Error: ${result.error}`);
        publishLog('error', result.error);
        return;
    }

    // Log all messages
    result.messages.forEach(msg => {
        addToMessageLog(msg);
    });

    // Log purchases
    result.purchases.forEach(purchase => {
        publishLog('purchase', `${purchase.item} x${purchase.count} for team ${purchase.team}`);
    });

    // Update position if score changed
    if (result.scoreChange !== 0) {
        const newPosition = Math.min(100, Math.max(-100, position.value + result.scoreChange));
        position.value = newPosition;
        emit('update:position', newPosition);
        publishLog('position', `Position changed by ${result.scoreChange} to ${newPosition}`);
    }
};

const connectMqtt = () => {
    const options = {
        protocol: 'wss',
        clientId: 'vue_client_' + Math.random().toString(16).substr(2, 8)
    };

    addToMessageLog('Connecting to MQTT broker...');
    client = mqtt.connect('wss://mqtt.insektionen.se/mqtt', options);

    client.on('connect', () => {
        connectionStatus.value = 'Connected';
        addToMessageLog('Connected successfully');

        client.subscribe(['kistan/kvitto', 'kistan/arcane'], (err) => {
            if (err) {
                addToMessageLog('Subscribe error: ' + err.message);
            } else {
                addToMessageLog('Subscribed to kistan/kvitto and kistan/arcane');
            }
        });
    });

    client.on('message', (topic, message) => {
        const msg = `${topic}: ${message.toString()}`;
        addToMessageLog(msg);

        if (topic === 'kistan/kvitto') {
            interpretReceipt(message.toString());
        } else if (topic === 'kistan/arcane') {
            const newPosition = parseFloat(message.toString());
            if (!isNaN(newPosition)) {
                position.value = Math.min(100, Math.max(-100, newPosition));
                emit('update:position', position.value);
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
.mqtt-debug {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px;
    border-radius: 5px;
    z-index: 1000;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
}

.message-log {
    margin-top: 10px;
    font-size: 0.9em;
}

.message-log ul {
    list-style: none;
    padding-left: 0;
    margin: 5px 0;
}

.message-log li {
    margin: 2px 0;
    word-break: break-all;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 2px 0;
}
</style>