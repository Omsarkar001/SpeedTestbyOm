const ethernetPort = document.getElementById('ethernetPort');
const maleConnector = document.getElementById('maleConnector');
const greenLed = document.getElementById('greenLed');
const orangeLed = document.getElementById('orangeLed');
const status = document.getElementById('status');
const speedResults = document.getElementById('speedResults');
const pingResult = document.getElementById('pingResult');
const cable = document.getElementById('cable');

let isConnected = false;
let isTestingPing = false;
let isDownloading = false;
let isUploading = false;
let downloadSpeed = null;
let uploadSpeed = null;
let pingTime = null;
let testCompleted = false;

function updateStatus() {
    status.textContent = isConnected ? 'Connected' : 'Disconnected';
    status.className = isConnected ? 'connected' : 'disconnected';
}

function updateLeds() {
    greenLed.classList.toggle('blinking', isTestingPing || isDownloading);
    orangeLed.classList.toggle('blinking', isUploading);
}

function updateMaleConnector() {
    maleConnector.style.display = testCompleted ? 'flex' : 'none';
    cable.style.display = testCompleted ? 'block' : 'none';
    if (testCompleted) {
        maleConnector.classList.add('plug-in');
    } else {
        maleConnector.classList.remove('plug-in');
    }
}

function updateSpeedResults() {
    if (testCompleted) {
        speedResults.innerHTML = `
            <div>Download: ${downloadSpeed.toFixed(2)} Mbps</div>
            <div>Upload: ${uploadSpeed.toFixed(2)} Mbps</div>
        `;
        speedResults.classList.add('fade-in');
    } else {
        speedResults.innerHTML = '';
        speedResults.classList.remove('fade-in');
    }
}

function updatePingResult() {
    if (pingTime !== null) {
        pingResult.innerHTML = `<div>Ping: ${pingTime.toFixed(2)} ms</div>`;
        pingResult.classList.add('fade-in');
    } else {
        pingResult.innerHTML = '';
        pingResult.classList.remove('fade-in');
    }
}

function checkConnection() {
    isConnected = navigator.onLine;
    updateStatus();
}

async function simulateSpeedTest(type) {
    return new Promise((resolve) => {
        const testDuration = 3000; // 3 seconds
        const startTime = performance.now();
        
        const simulateProgress = () => {
            const elapsedTime = performance.now() - startTime;
            if (elapsedTime < testDuration) {
                requestAnimationFrame(simulateProgress);
            } else {
                // Generate a random speed between 10 and 100 Mbps
                const speed = Math.random() * 90 + 10;
                resolve(speed);
            }
        };
        
        simulateProgress();
    });
}

async function simulatePing() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate a random ping between 10 and 100 ms
            const ping = Math.random() * 90 + 10;
            resolve(ping);
        }, 1000);
    });
}

async function startSpeedTest() {
    if (!isConnected) return;

    testCompleted = false;
    downloadSpeed = null;
    uploadSpeed = null;
    pingTime = null;
    updateMaleConnector();
    updateSpeedResults();
    updatePingResult();

    try {
        // Measure ping
        isTestingPing = true;
        updateLeds();
        pingTime = await simulatePing();
        isTestingPing = false;
        updatePingResult();

        // Start download test
        isDownloading = true;
        updateLeds();
        downloadSpeed = await simulateSpeedTest('download');
        isDownloading = false;

        // Start upload test
        isUploading = true;
        updateLeds();
        uploadSpeed = await simulateSpeedTest('upload');
        isUploading = false;

        testCompleted = true;
        updateMaleConnector();
        updateSpeedResults();
    } catch (error) {
        console.error('Speed test failed:', error);
    } finally {
        isTestingPing = false;
        isDownloading = false;
        isUploading = false;
        updateLeds();
    }
}

// Event listeners
window.addEventListener('online', checkConnection);
window.addEventListener('offline', checkConnection);
ethernetPort.addEventListener('click', startSpeedTest);

// Initial setup
checkConnection();
updateLeds();
updateMaleConnector();
updateSpeedResults();
updatePingResult();
