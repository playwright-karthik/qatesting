function FindProxyForURL(url, host) {
    // Bypass proxy for the specific domain or IP
    if (shExpMatch(host, "web-assets.zendesk.com") || 
        isInNet(host, "104.18.31.99", "255.255.255.255")) {
        return "DIRECT";
    }
    
    // Use proxy for all other requests
    return "PROXY 192.168.128.241:3128";
}
