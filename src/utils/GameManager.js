// src/utils/GameManager.js

import {el} from "vuetify/locale";

const COMBO_TIMEOUT = 30 * 1000; // 30 seconds timeout between purchases

const productConfig = {
    'Pepsi': { baseScore: 10, combo: true},
    'Zingo': { baseScore: -10, combo: true},
    'Cola': { baseScore: 8, combo: true},
    'Fanta': { baseScore: -8,combo: true},
    'Din mamma': { baseScore: -15, combo: true},
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

            let items = [];
            for (const item of receiptData.sold) {
                for (let i = 0; i < item.count; i++) {
                    items.push(item.name);
                }
            }

            console.log("SOLD ITEMS NEW ORDER: ")
            console.log(items);

            // Calculate base scores
            items.forEach(itemName => {
                if (productConfig[itemName]) {
                    totalScore += productConfig[itemName].baseScore * currentMultiplier;
                }
            });

            let commonItems = [];
            if(team === 'TMEIT') {
                commonItems = items.filter(value => this.comboTMEIT.includes(value) && items.includes(value));
            } else {
                commonItems = items.filter(value => this.comboITK.includes(value) && items.includes(value));
            }



            let newComboItems = [];
            if(team === 'TMEIT') {
                newComboItems = this.comboTMEIT.filter(value => commonItems.includes(value) && this.comboTMEIT.includes(value));
            } else {
                newComboItems = this.comboITK.filter(value => commonItems.includes(value) && this.comboITK.includes(value));
            }



            // Update combo arrays
            if (team === 'TMEIT') {
                this.comboTMEIT = [...items, ...newComboItems];  // This will keep duplicates
            } else {
                this.comboITK = [...items, ...newComboItems];  // This will keep duplicates
            }


            // now for each item in comboitems we need to add points based on the item and the amount of items in the combo
            // if theres 4 of one item in the combo, we need to add the points for 4 items times 1.2 (QUADRAKILL).
            // if theres 5 of one item in the combo, we need to add the points for 5 items times 1.4 (PENTAKILL).
            // if theres 6 of one item in the combo, we need to add the points for 6 items times 1.6 (HEXAKILL).

            let points = 0;
            const comboArray = team === 'TMEIT' ? this.comboTMEIT : this.comboITK;
            const itemCounts = this.getItemCounts(comboArray);

            Object.entries(itemCounts).forEach(([item, count]) => {
                if (count >= 4 && productConfig[item]) {
                    if (count === 4) {
                        points += productConfig[item].baseScore * 1.2;
                    } else if (count === 5) {
                        points += productConfig[item].baseScore * 1.4;
                    } else if (count >= 6) {
                        points += productConfig[item].baseScore * 1.6;
                    }
                }
            });



            console.log("COMMON ITEMS: ");
            console.log(commonItems);

            console.log("TMEIT COMBO ITEMS: ");
            console.log(this.comboTMEIT);


            console.log("POINTS ADDED FOR COMBO: ");
            totalScore = points*currentMultiplier;
            console.log(totalScore);

            //append

            return {
                scoreChange: Math.round(totalScore),
                messages,
                purchases: items
            };
        } catch (error) {
            return {
                error: 'Invalid receipt format: ' + error.message,
                scoreChange: 0,
                messages: [],
                purchases: []
            };
        }
    }
}

export default new GameManager();