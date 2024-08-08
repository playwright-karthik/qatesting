function FindProxyForURL(url, host) {
    // Bypass proxy for specific domain or IP
    if (shExpMatch(host, "web-assets.zendesk.com") || 
        isInNet(host, "104.18.31.999", "255.255.255.255")) {
        return "PROXY 192.168.128.241:3128";
    }
    
    // Bypass proxy for another specific domain or another IP
    if (shExpMatch(host, "www.google.com") || 
        isInNet(host, "142.250.196.68", "255.255.255.0")) {
        return "PROXY 192.168.128.243:50000";
    }
  
    // Do not use proxy for all other requests
    return "DIRECT";
}
