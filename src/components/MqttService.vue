<template>
    <div class="mqtt-debug" v-if="props.debug">
        <p>MQTT Status: {{ connectionStatus }}</p>
        <p>Position: {{ modelValue }}</p>
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
    modelValue: {
        type: Number,
        required: true
    },
    debug: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue', 'kill-streak']);
const connectionStatus = ref('Disconnecting');
const messageLog = ref([]);
const clientId = 'vue_client_' + Math.random().toString(16).substr(2, 8);
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

    result.messages.forEach(msg => {
        addToMessageLog(msg);
    });

    result.purchases.forEach(purchase => {
        publishLog('purchase', `${purchase.item} x${purchase.count} for team ${purchase.team}`);
    });

    if (result.scoreChange !== 0) {
        const newPosition = Math.min(1000, Math.max(-1000, props.modelValue + result.scoreChange));
        emit('update:modelValue', newPosition);
        client.publish('kistan/arcanescore', `client:${newPosition}`, { retain: true });
        publishLog('position', `Position changed by ${result.scoreChange} to ${newPosition}`);
    }

    if (result.killStreak) {
        emit('kill-streak', result.killStreak);
        switch (result.killStreak) {
            case 'QUADRAKILL':
                client.publish('light_mixer/code/run', 'tmeit_kmr25vt_quadrakill:start()');
                break;
            case 'PENTAKILL':
                client.publish('light_mixer/code/run', 'tmeit_kmr25vt_pentakill:start()');
                break;
            case 'HEXAKILL':
                client.publish('light_mixer/code/run', 'tmeit_kmr25vt_hexakill:start()');
                break;
        }
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

        client.subscribe(['kistan/kvitto', 'kistan/arcane', 'kistan/arcanescore', 'kistan/arcane/admin'], (err) => {
            if (err) {
                addToMessageLog('Subscribe error: ' + err.message);
            } else {
                addToMessageLog('Subscribed to topics');
            }
        });
    });

    client.on('message', (topic, message) => {
        const messageStr = message.toString();
        addToMessageLog(`${topic}: ${messageStr}`);

        if (topic === 'kistan/kvitto') {
            interpretReceipt(messageStr);
        } else if (topic === 'kistan/arcane') {
            if (messageStr.startsWith('admin:')) {
                const delta = parseFloat(messageStr.split(':')[1]);
                if (!isNaN(delta)) {
                    const newPosition = Math.min(1000, Math.max(-1000, props.modelValue + delta));
                    emit('update:modelValue', newPosition);
                    client.publish('kistan/arcanescore', `client:${newPosition}`, { retain: true });
                }
            }
        } else if (topic === 'kistan/arcane/admin') {
            try {
                const adminCommand = JSON.parse(messageStr);
                switch (adminCommand.action) {
                    case 'killstreak':
                        emit('kill-streak', adminCommand.type);
                        publishLog('admin', `Forced ${adminCommand.type} for ${adminCommand.team}`);
                        switch (adminCommand.type) {
                            case 'QUADRAKILL':
                                client.publish('light_mixer/code/run', 'tmeit_kmr25vt_quadrakill:start()');
                                break;
                            case 'PENTAKILL':
                                client.publish('light_mixer/code/run', 'tmeit_kmr25vt_pentakill:start()');
                                break;
                            case 'HEXAKILL':
                                client.publish('light_mixer/code/run', 'tmeit_kmr25vt_hexakill:start()');
                                break;
                        }
                        break;
                    case 'resetCombo':
                        gameManager.resetCombo(adminCommand.team);
                        publishLog('admin', `Reset combo for ${adminCommand.team}`);
                        break;
                    case 'toggleCombos':
                        gameManager.setCombosEnabled(adminCommand.enabled);
                        publishLog('admin', `Combos ${adminCommand.enabled ? 'enabled' : 'disabled'}`);
                        break;
                }
            } catch (error) {
                addToMessageLog(`Error processing admin command: ${error.message}`);
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