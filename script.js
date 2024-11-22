const ethernetPort = document.getElementById('ethernetPort');
const maleConnector = document.getElementById('maleConnector');
const greenLed = document.getElementById('greenLed');
const orangeLed = document.getElementById('orangeLed');
const status = document.getElementById('status');
const speedResults = document.getElementById('speedResults');
const pingResult = document.getElementById('pingResult');
const cable = document.getElementById('cable');

let isConnected = false;
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
    greenLed.classList.toggle('blinking', isDownloading);
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

async function measureSpeed(type) {
    const testDuration = 5000; // 5 seconds
    const testSize = 5 * 1024 * 1024; // 5 MB
    const startTime = Date.now();
    let bytesTransferred = 0;

    while (Date.now() - startTime < testDuration) {
        if (type === 'download') {
            await fetch('/api/speedtest-download');
        } else {
            await fetch('/api/speedtest-upload', {
                method: 'POST',
                body: new ArrayBuffer(testSize),
            });
        }
        bytesTransferred += testSize;
    }

    const durationInSeconds = (Date.now() - startTime) / 1000;
    return (bytesTransferred * 8) / (1000000 * durationInSeconds);
}

async function measurePing() {
    const startTime = Date.now();
    await fetch('/api/ping');
    return Date.now() - startTime;
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
        pingTime = await measurePing();
        updatePingResult();

        // Start download test
        isDownloading = true;
        updateLeds();
        downloadSpeed = await measureSpeed('download');
        isDownloading = false;

        // Start upload test
        isUploading = true;
        updateLeds();
        uploadSpeed = await measureSpeed('upload');
        isUploading = false;

        testCompleted = true;
        updateMaleConnector();
        updateSpeedResults();
    } catch (error) {
        console.error('Speed test failed:', error);
    } finally {
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

