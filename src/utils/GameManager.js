// src/utils/GameManager.js
class GameManager {
    constructor() {
        this.comboTMEIT = [];
        this.comboITK = [];
        this.combosEnabled = true;
        console.log('GameManager initialized');
    }

    standardizeItems(items) {
        return items.map(item => {
            if (item.toLowerCase().includes('fulsprit')) {
                return 'Fulsprit';
            }
            return item;
        });
    }

    getItemCounts(array) {
        const counts = {};
        array.forEach(item => {
            if (item === 'Fulsprit') {
                counts[item] = (counts[item] || 0) + 1/6; // Convert to "shots"
            } else {
                counts[item] = (counts[item] || 0) + 1;
            }
        });
        return counts;
    }

    calculateReceipt(receipt) {
        try {
            const receiptData = JSON.parse(receipt);
            let items = [];

            // Determine team based on Piltover/Zaun presence
            const hasPiltover = receiptData.sold.some(item => item.name === 'Piltover');
            const hasZaun = receiptData.sold.some(item => item.name === 'Zaun');

            if (!hasPiltover && !hasZaun) {
                return {
                    error: 'No team indicator (Piltover/Zaun) found in receipt',
                    scoreChange: 0,
                    messages: [],
                    purchases: [],
                    killStreak: null
                };
            }

            const team = hasPiltover ? 'TMEIT' : 'ITK';
            const currentMultiplier = hasPiltover ? -1.8 : 1;

            // Flatten and standardize items, excluding Piltover/Zaun
            for (const item of receiptData.sold) {
                if (item.name !== 'Piltover' && item.name !== 'Zaun') {
                    for (let i = 0; i < item.count; i++) {
                        items.push(item.name);
                    }
                }
            }

            items = this.standardizeItems(items);

            // If combos are disabled, return basic score
            if (!this.combosEnabled) {
                return {
                    scoreChange: Math.round(10 * currentMultiplier),
                    messages: [],
                    purchases: items.map(item => ({ item, count: 1, team })),
                    killStreak: null
                };
            }

            // Update combo arrays
            if (team === 'TMEIT') {
                this.comboTMEIT = [...this.comboTMEIT, ...items];
            } else {
                this.comboITK = [...this.comboITK, ...items];
            }

            let points = 10; // Base points for any purchase
            let messages = [];
            let killStreak = null;

            const comboItemCounts = this.getItemCounts(team === 'TMEIT' ? this.comboTMEIT : this.comboITK);

            // Check for combos
            Object.entries(comboItemCounts).forEach(([item, count]) => {
                if (Math.floor(count) >= 6) {
                    points *= 1.6;
                    messages.push(`HEXAKILL: ${item} combo x${Math.floor(count)}`);
                    killStreak = 'HEXAKILL';
                } else if (Math.floor(count) === 5) {
                    points *= 1.4;
                    messages.push(`PENTAKILL: ${item} combo x${count}`);
                    killStreak = 'PENTAKILL';
                } else if (Math.floor(count) === 4) {
                    points *= 1.2;
                    messages.push(`QUADRAKILL: ${item} combo x${count}`);
                    killStreak = 'QUADRAKILL';
                }
            });

            const totalScore = points * currentMultiplier;

            // Clean up old combos after 30 seconds
            const cleanup = () => {
                if (team === 'TMEIT') {
                    this.comboTMEIT = this.comboTMEIT.slice(items.length);
                } else {
                    this.comboITK = this.comboITK.slice(items.length);
                }
            };
            setTimeout(cleanup, 30000);

            return {
                scoreChange: Math.round(totalScore),
                messages,
                purchases: items.map(item => ({ item, count: 1, team })),
                killStreak
            };
        } catch (error) {
            console.error("ERROR IN CALCULATE RECEIPT: ", error);
            return {
                error: 'Invalid receipt format: ' + error.message,
                scoreChange: 0,
                messages: [],
                purchases: [],
                killStreak: null
            };
        }
    }

    resetCombo(team) {
        if (team === 'TMEIT') {
            this.comboTMEIT = [];
        } else if (team === 'ITK') {
            this.comboITK = [];
        }
    }

    setCombosEnabled(enabled) {
        this.combosEnabled = enabled;
        if (!enabled) {
            this.comboTMEIT = [];
            this.comboITK = [];
        }
    }

    resetCombos() {
        this.comboTMEIT = [];
        this.comboITK = [];
    }
}

export default new GameManager();