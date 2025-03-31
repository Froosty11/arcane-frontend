<template>
    <div v-if="debug" class="mqtt-debug">
        <div>Connection Status: {{ connectionStatus }}</div>
        <div>Position: {{ position }}</div>
        <div class="message-log">
            <ul>
                <li v-for="(message, index) in messageLog" :key="index">{{ message }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import mqtt from 'mqtt';
import { GameManager } from '@/utils/GameManager';

const props = defineProps({
    debug: {
        type: Boolean,
        default: true
    },
    position: {
        type: Number,
        required: true
    }
});

const emit = defineEmits(['update:position']);

const connectionStatus = ref('Disconnecting');
const messageLog = ref([]);
let client = null;
const gameManager = new GameManager();

const addToMessageLog = (message) => {
    messageLog.value.unshift(message);
    if (messageLog.value.length > 100) {
        messageLog.value.pop();
    }
};

const publishLog = (type, message) => {
    if (client && client.connected) {
        const logMessage = {
            type: type,
            message: message,
            timestamp: Date.now()
        };
        client.publish('kistan/arcane/log', JSON.stringify(logMessage));
    }
};

const interpretReceipt = (receipt) => {
    console.log('Processing receipt:', receipt);
    try {
        const receiptData = JSON.parse(receipt);
        console.log('Parsed receipt:', receiptData);

        const result = gameManager.processReceipt(receiptData);
        console.log('Process result:', result);

        for (const msg of result.messages) {
            addToMessageLog(msg.message);
            publishLog(msg.type, msg.message);
        }

        if (result.scoreChange !== 0) {
            const newPosition = Math.min(100, Math.max(-100, props.position + result.scoreChange));
            emit('update:position', newPosition);

            const positionMessage = `Position changed by ${result.scoreChange} to ${newPosition}`;
            publishLog('position', positionMessage);
            addToMessageLog(positionMessage);

            // Publish the new position to MQTT
            client.publish('kistan/arcane', newPosition.toString());
        }
    } catch (e) {
        console.error('Receipt processing error:', e);
        const errorMessage = `Error processing receipt: ${e.message}`;
        addToMessageLog(errorMessage);
        publishLog('error', errorMessage);
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
        const messageStr = message.toString();
        addToMessageLog(`${topic}: ${messageStr}`);

        if (topic === 'kistan/kvitto') {
            interpretReceipt(messageStr);
        } else if (topic === 'kistan/arcane') {
            const newPosition = parseFloat(messageStr);
            if (!isNaN(newPosition)) {
                emit('update:position', Math.min(100, Math.max(-100, newPosition)));
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