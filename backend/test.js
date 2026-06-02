require('dotenv').config();
const http = require('http');

console.log('==================================================');
console.log('  FACTORY WHATSAPP AI BOT - MOCK TEST RUNNER');
console.log('==================================================');

const testPayloads = [
    {
        text: "Please send 5 pieces of Back Gauge PC. The machine is Turret Punch.",
        senderName: "Worker John (Mock)",
        isAudio: false
    },
    {
        text: "We need 12 standard oil filters from vendor ABC for the Turret Punch machine.",
        senderName: "Worker Bob (Mock)",
        isAudio: false
    }
];

// Helper to send HTTP request to backend simulator
function runSimulation(payload) {
    return new Promise((resolve) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/test/simulate-message',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const parsed = JSON.parse(body);
                    console.log(`\n[SUCCESS] Mock message processed successfully for: "${payload.senderName}"`);
                    console.log(`Extracted count: ${parsed.extractedCount}`);
                    parsed.results.forEach((r, idx) => {
                        console.log(`  Item #${idx+1}: "${r.item['Part Name'] || r.item.partName}" | Qty: ${r.item['Qty Required'] || r.item.qty} | Warning: ${r.item.stockWarning || 'None'}`);
                    });
                } else {
                    console.error(`\n[ERROR] Simulator returned status: ${res.statusCode}`);
                    console.error('Response:', body);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.error('\n[CONNECTION ERROR] Could not connect to the backend server on Port 5000.');
            console.error('Make sure the backend is active (npm run start:backend) before running this script.');
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function runAll() {
    console.log('Sending mock message triggers to http://localhost:5000/api/test/simulate-message...\n');
    for (const payload of testPayloads) {
        console.log(`- Sending mock text: "${payload.text}"`);
        await runSimulation(payload);
    }
    console.log('\n==================================================');
    console.log('  TEST RUN COMPLETED SUCCESSFULLY');
    console.log('==================================================');
}

runAll();
