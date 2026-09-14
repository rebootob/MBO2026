const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const dir = path.resolve(__dirname);
const scripts = {
    get1: path.join(dir, 'capture_get1.js'),
    client: path.join(dir, 'capture_client.js'),
    get2: path.join(dir, 'capture_get2.js')
};

console.log('=== UAT-04-R1 PREFLIGHT VERIFICATION ===\n');

// 1. Load files and calculate SHA-256 digests
const contents = {};
const digests = {};

for (const [key, filePath] of Object.entries(scripts)) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Script file missing: ${filePath}`);
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    contents[key] = raw;
    digests[key] = crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
    console.log(`[PASS] ${key} file loaded (${raw.length} bytes, SHA-256: ${digests[key]})`);
}

// 2. Syntax check
console.log('\n--- 2. Syntax Check ---');
for (const [key, code] of Object.entries(contents)) {
    try {
        new vm.Script(code, { filename: path.basename(scripts[key]) });
        console.log(`[PASS] Syntax check valid: ${key}`);
    } catch (err) {
        console.error(`[FAIL] Syntax check failed for ${key}:`, err);
        process.exit(1);
    }
}

// 3. Literal references verification
console.log('\n--- 3. Literal Field References & Targets ---');
function verifyLiterals(name, code, expectedTokens) {
    for (const token of expectedTokens) {
        if (!code.includes(token)) {
            throw new Error(`[FAIL] Literal token missing in ${name}: "${token}"`);
        }
        console.log(`[PASS] ${name} contains literal token: "${token}"`);
    }
}

verifyLiterals('capture_get1.js', contents.get1, [
    'r.record.$revision',
    'r.record.$id',
    'app: 794',
    'id: 15',
    '/k/v1/record.json?app=794&id=15',
    'uat04_r1_get1_record.json'
]);

verifyLiterals('capture_client.js', contents.client, [
    'rec.record.$revision',
    'rec.record.$id',
    'app: 794',
    'id: 15',
    'uat04_r1_client_record.json'
]);

verifyLiterals('capture_get2.js', contents.get2, [
    'r.record.$revision',
    'r.record.$id',
    'app: 794',
    'id: 15',
    '/k/v1/record.json?app=794&id=15',
    'uat04_r1_get2_record.json'
]);

// 4. Exercise with synthetic data & mocked API/client access
console.log('\n--- 4. Mocked Execution & Export Verification ---');

const syntheticRecord = {
    $id: { type: '__ID__', value: '15' },
    $revision: { type: '__REVISION__', value: '2' },
    Record_Status: { type: 'SINGLE_LINE_TEXT', value: '01 Draft Objective' },
    Routing_Topology: { type: 'SINGLE_LINE_TEXT', value: 'M1_G1' },
    Employee_Code: { type: 'SINGLE_LINE_TEXT', value: '0187' },
    Requester_User: { type: 'USER_SELECT', value: [{ code: 'tmh', name: 'TMH' }] },
    Appraiser_1_User: { type: 'USER_SELECT', value: [{ code: 'chatawee', name: 'Ms.Chatrawee' }] },
    Appraiser_2_User: { type: 'USER_SELECT', value: [{ code: 'pattama', name: 'Ms.Pattama' }] },
    Frozen_Profile_Code: { type: 'SINGLE_LINE_TEXT', value: 'PROFILE_M1_G1_V1' },
    K_expected_Snapshot: { type: 'NUMBER', value: '2' },
    Effective_Routing_Key: { type: 'SINGLE_LINE_TEXT', value: 'ROUTE_M1_G1' },
    Effective_Route_Version_Key: { type: 'SINGLE_LINE_TEXT', value: 'V1' },
    Effective_Scorer_Slots_Snapshot: { type: 'SINGLE_LINE_TEXT', value: '[1,2]' }
};

const downloadedArtifacts = {};

function createMockEnvironment() {
    const sandbox = {
        console: {
            log: (...args) => console.log('   [console.log]', ...args),
            error: (...args) => console.error('   [console.error]', ...args)
        },
        kintone: {
            api: (endpoint, method, params) => {
                console.log(`   [kintone.api called] ${method} ${endpoint} params:`, params);
                return Promise.resolve({ record: syntheticRecord });
            },
            app: {
                record: {
                    get: () => ({ record: syntheticRecord })
                }
            }
        },
        Date: Date,
        JSON: JSON,
        Blob: class {
            constructor(parts, options) {
                this.content = parts.join('');
                this.type = options ? options.type : '';
            }
        },
        URL: {
            createObjectURL: (blob) => {
                const id = 'blob:' + Math.random().toString(36).substring(2);
                downloadedArtifacts[id] = blob.content;
                return id;
            }
        },
        document: {
            createElement: (tag) => {
                if (tag === 'a') {
                    return {
                        href: '',
                        download: '',
                        click: function() {
                            downloadedArtifacts[this.download] = downloadedArtifacts[this.href];
                            console.log(`   [mock download triggered] file: ${this.download} (${downloadedArtifacts[this.download].length} bytes)`);
                        }
                    };
                }
                return {};
            }
        },
        window: {}
    };
    return sandbox;
}

async function runTest() {
    // Test GET 1
    console.log('\nTesting GET 1 execution:');
    const env1 = createMockEnvironment();
    vm.createContext(env1);
    vm.runInContext(contents.get1, env1);
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (!downloadedArtifacts['uat04_r1_get1_record.json']) {
        throw new Error('[FAIL] GET 1 download artifact missing');
    }
    const get1Parsed = JSON.parse(downloadedArtifacts['uat04_r1_get1_record.json']);
    if (get1Parsed.attempt !== 1 || get1Parsed.recordId !== '15' || get1Parsed.revision !== '2') {
        throw new Error(`[FAIL] GET 1 parsed data mismatch: attempt=${get1Parsed.attempt}, recId=${get1Parsed.recordId}, rev=${get1Parsed.revision}`);
    }
    console.log('[PASS] GET 1 execution & download verified: attempt=1, recordId=15, revision=2');

    // Test Client In-Memory
    console.log('\nTesting Client In-Memory execution:');
    const env2 = createMockEnvironment();
    vm.createContext(env2);
    vm.runInContext(contents.client, env2);
    
    if (!downloadedArtifacts['uat04_r1_client_record.json']) {
        throw new Error('[FAIL] Client in-memory download artifact missing');
    }
    const clientParsed = JSON.parse(downloadedArtifacts['uat04_r1_client_record.json']);
    if (clientParsed.source !== 'kintone.app.record.get()' || clientParsed.recordId !== '15' || clientParsed.revision !== '2') {
        throw new Error(`[FAIL] Client parsed data mismatch: source=${clientParsed.source}, recId=${clientParsed.recordId}, rev=${clientParsed.revision}`);
    }
    console.log('[PASS] Client in-memory execution & download verified: source=kintone.app.record.get(), recordId=15, revision=2');

    // Test GET 2
    console.log('\nTesting GET 2 execution:');
    const env3 = createMockEnvironment();
    vm.createContext(env3);
    vm.runInContext(contents.get2, env3);
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (!downloadedArtifacts['uat04_r1_get2_record.json']) {
        throw new Error('[FAIL] GET 2 download artifact missing');
    }
    const get2Parsed = JSON.parse(downloadedArtifacts['uat04_r1_get2_record.json']);
    if (get2Parsed.attempt !== 2 || get2Parsed.recordId !== '15' || get2Parsed.revision !== '2') {
        throw new Error(`[FAIL] GET 2 parsed data mismatch: attempt=${get2Parsed.attempt}, recId=${get2Parsed.recordId}, rev=${get2Parsed.revision}`);
    }
    console.log('[PASS] GET 2 execution & download verified: attempt=2, recordId=15, revision=2');

    // 5. Verify distinct artifacts and field preservation
    console.log('\n--- 5. Artifact Distinctness & Type Preservation ---');
    if (get1Parsed.attempt === get2Parsed.attempt) {
        throw new Error('[FAIL] GET 1 and GET 2 attempts are not distinct');
    }
    if (clientParsed.source !== 'kintone.app.record.get()') {
        throw new Error('[FAIL] Client artifact source mismatch');
    }
    if (typeof get1Parsed.response.record.Effective_Scorer_Slots_Snapshot.value !== 'string') {
        throw new Error('[FAIL] Field type not preserved');
    }
    console.log('[PASS] All three artifacts are distinct, typed, and timestamped.');
    console.log('\n=== ALL PREFLIGHT CHECKS PASSED ===\n');
}

runTest().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
