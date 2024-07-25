import NetworkSpeed from 'network-speed';

const testNetworkSpeed = new NetworkSpeed();

async function checkNetworkSpeed() {
    try {
        const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000';
        const fileSizeInBytes = 500000;
        const downloadSpeed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
        const uploadSpeed = await testNetworkSpeed.checkUploadSpeed(baseUrl, fileSizeInBytes);
        return {
            downloadSpeed: downloadSpeed.mbps,
            uploadSpeed: uploadSpeed.mbps
        };
    } catch (error) {
        console.error('Error checking network speed:', error);
        return {
            downloadSpeed: 0,
            uploadSpeed: 0
        };
    }
}

(async () => {
    const networkSpeed = await checkNetworkSpeed();
    console.log(`Download Speed: ${networkSpeed.downloadSpeed} Mbps`);
    console.log(`Upload Speed: ${networkSpeed.uploadSpeed} Mbps`);
})();
