const productConfig = {
    'Pepsi': { baseScore: 10, combo: true},
    'Zingo': { baseScore: 10, combo: true},
    'Cola': { baseScore: 8, combo: true},
    'Fanta': { baseScore: 8, combo: true},
    'Din mamma': { baseScore: 15, combo: true},
    'Is Vatten': { baseScore: 15, combo: true}
};

const killStreaks = {
    4: { name: 'QUADRAKILL', multiplier: 1.2 },
    5: { name: 'PENTAKILL', multiplier: 1.4 },
    6: { name: 'HEXAKILL', multiplier: 1.6 }
};

class GameManager {
    constructor() {
        this.comboTMEIT = [];
        this.comboITK = [];
        console.log('GameManager initialized');
    }

    getItemCounts(array) {
        const counts = {};
        array.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });
        return counts;
    }

    calculateReceipt(receipt) {
        try {
            const receiptData = JSON.parse(receipt);
            const team = receiptData.sold_by === 'TMEIT' ? 'TMEIT' : 'ITK';
            let currentMultiplier = team === 'ITK' ? -1 : 1;
            let totalScore = 0;
            let messages = [];
            let killStreak = null;

            // Convert receipt items to flat array
            let items = [];
            for (const item of receiptData.sold) {
                for (let i = 0; i < item.count; i++) {
                    items.push(item.name);
                }
            }

            // Update combo arrays with new items
            if (team === 'TMEIT') {
                this.comboTMEIT = [...this.comboTMEIT, ...items];
            } else {
                this.comboITK = [...this.comboITK, ...items];
            }

            // Calculate points based on current items but use multipliers from combo
            let points = 0;
            const currentItemCounts = this.getItemCounts(items);
            const comboItemCounts = this.getItemCounts(team === 'TMEIT' ? this.comboTMEIT : this.comboITK);

            Object.entries(currentItemCounts).forEach(([item, count]) => {
                if (!productConfig[item]) return;

                const comboCount = comboItemCounts[item] || 0;
                let basePoints = productConfig[item].baseScore * count;

                if (comboCount >= 6) {
                    points += basePoints * killStreaks[6].multiplier;
                    messages.push(`HEXAKILL multiplier! ${count}x ${item} for ${basePoints * killStreaks[6].multiplier} points`);
                    killStreak = killStreaks[6].name;
                } else if (comboCount === 5) {
                    points += basePoints * killStreaks[5].multiplier;
                    messages.push(`PENTAKILL multiplier! ${count}x ${item} for ${basePoints * killStreaks[5].multiplier} points`);
                    killStreak = killStreaks[5].name;
                } else if (comboCount === 4) {
                    points += basePoints * killStreaks[4].multiplier;
                    messages.push(`QUADRAKILL multiplier! ${count}x ${item} for ${basePoints * killStreaks[4].multiplier} points`);
                    killStreak = killStreaks[4].name;
                } else {
                    points += basePoints;
                    messages.push(`Base score: ${basePoints} points for ${count}x ${item}`);
                }
            });

            totalScore = points * currentMultiplier;

            // Clean up old combos after 30 seconds
            const currentTime = Date.now();
            if (team === 'TMEIT') {
                setTimeout(() => {
                    this.comboTMEIT = this.comboTMEIT.slice(items.length);
                }, 30000);
            } else {
                setTimeout(() => {
                    this.comboITK = this.comboITK.slice(items.length);
                }, 30000);
            }

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

    resetCombos() {
        this.comboTMEIT = [];
        this.comboITK = [];
    }
}

export default new GameManager();