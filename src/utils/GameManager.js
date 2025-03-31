export const products = {
    'Pepsi': {
        baseScore: 10
    },
    'Zingo': {
        baseScore: 10
    },
    'Cola': {
        baseScore: 8
    },
    'Fanta': {
        baseScore: 10
    },
    'Din mamma': {
        baseScore: -5
    },
    'Is Vatten': {
        baseScore: 15
    },
    'Fulsprit (per cl)': {
        baseScore: 3
    }
};

export class GameManager {
    processReceipt(receipt) {
        let totalScore = 0;
        const messages = [];

        messages.push({
            type: 'debug',
            message: `Processing receipt: ${JSON.stringify(receipt)}`
        });

        if (!receipt.sold || !Array.isArray(receipt.sold)) {
            messages.push({ type: 'error', message: 'Invalid receipt format: missing or invalid sold array' });
            return { scoreChange: 0, messages };
        }

        receipt.sold.forEach(item => {
            if (!item.name || !item.count) {
                messages.push({ type: 'warning', message: `Skipping invalid item: ${JSON.stringify(item)}` });
                return;
            }

            const product = products[item.name];
            if (!product) {
                messages.push({ type: 'warning', message: `Unknown product: ${item.name}` });
                return;
            }

            const itemScore = product.baseScore * item.count;
            totalScore += itemScore;

            messages.push({
                type: 'info',
                message: `${item.name} x${item.count} = ${itemScore} points`
            });
        });

        const isINSektionen = receipt.sold_by === 'IN-Sektionen';
        const finalScore = isINSektionen ? -totalScore : totalScore;

        messages.push({
            type: 'info',
            message: `Sold by ${receipt.sold_by} (${isINSektionen ? 'Blue' : 'Pink'} team)`
        });

        messages.push({
            type: 'debug',
            message: `Final score: ${finalScore}`
        });

        return {
            scoreChange: finalScore,
            messages
        };
    }
}