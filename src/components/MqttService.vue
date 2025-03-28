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

const COMBO_TIMEOUT = 30 * 1000; // 30 seconds timeout between purchases

const productConfig = {
    'Pepsi': {
        baseScore: 10,
        team: 'red'
    },
    'Zingo': {
        baseScore: -10,
        team: 'blue'
    },
    'Cola': {
        baseScore: 8,
        team: 'red'
    },
    'Fanta': {
        baseScore: -8,
        team: 'blue'
    },
    'Din mamma': {  // Zaun test item
        baseScore: -15,
        team: 'blue'
    },
    'Is Vatten': {  // Piltover test item
        baseScore: 15,
        team: 'red'
    }
};

// Kill streak configuration
const killStreaks = {
    4: { name: 'QUADRAKILL', multiplier: 1.2 },
    5: { name: 'PENTAKILL', multiplier: 1.4 },
    6: { name: 'HEXAKILL', multiplier: 1.6 }
};

const streakTracker = {
    purchases: [], // Array of { team: string, timestamp: number }
    currentStreak: 0,
    lastTeam: null
};

const calculateKillStreak = (team, timestamp) => {
    // Remove expired purchases
    streakTracker.purchases = streakTracker.purchases.filter(p =>
        timestamp - p.timestamp < COMBO_TIMEOUT
    );

    // Add new purchase
    streakTracker.purchases.push({ team, timestamp });

    // Count consecutive purchases for the same team
    let streak = 0;
    for (let i = streakTracker.purchases.length - 1; i >= 0; i--) {
        if (streakTracker.purchases[i].team === team) {
            streak++;
        } else {
            break;
        }
    }

    // Get kill streak bonus if applicable
    let multiplier = 1;
    for (const [count, data] of Object.entries(killStreaks)) {
        if (streak >= parseInt(count)) {
            multiplier = data.multiplier;
            addToMessageLog(`${data.name}! ${streak}x combo for team ${team}!`);
        }
    }

    return multiplier;
};

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
    try {
        let receiptData = JSON.parse(receipt);
        let scoreChange = 0;
        const timestamp = Date.now();

        if (receiptData.sold && Array.isArray(receiptData.sold)) {
            receiptData.sold.forEach(item => {
                if (item.name && productConfig[item.name]) {
                    const product = productConfig[item.name];
                    const count = item.count || 1;

                    // Calculate base score
                    let baseScore = product.baseScore * count;

                    // Apply kill streak multiplier
                    const multiplier = calculateKillStreak(product.team, timestamp);
                    const finalScore = baseScore * multiplier;

                    // Log purchase
                    publishLog('purchase', `${item.name} x${count} for team ${product.team}`);

                    // Log special messages for kill streaks
                    if (streakTracker.purchases.length >= 4) {
                        const streakCount = streakTracker.purchases.length;
                        let killMessage = '';

                        switch(streakCount) {
                            case 4:
                                killMessage = `QUADRAKILL! Team ${product.team} is on fire! (1.2x bonus)`;
                                break;
                            case 5:
                                killMessage = `PENTAKILL! Team ${product.team} is unstoppable! (1.4x bonus)`;
                                break;
                            case 6:
                                killMessage = `HEXAKILL! Team ${product.team} is legendary! (1.6x bonus)`;
                                break;
                        }

                        if (killMessage) {
                            publishLog('killstreak', killMessage);
                            addToMessageLog(killMessage);
                        }
                    }

                    scoreChange += finalScore;
                    addToMessageLog(`${item.name} x${count}: ${finalScore} points (${multiplier}x multiplier)`);
                }
            });
        }

        if (scoreChange !== 0) {
            const newPosition = Math.min(100, Math.max(-100, position.value + scoreChange));
            position.value = newPosition;
            emit('update:position', newPosition);

            // Log position change
            publishLog('position', `Position changed by ${scoreChange} to ${newPosition}`);
            addToMessageLog(`Total score change: ${scoreChange}. New position: ${newPosition}`);
        }
    } catch (e) {
        addToMessageLog(`Error parsing receipt: ${e.message}`);
        publishLog('error', `Error parsing receipt: ${e.message}`);
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