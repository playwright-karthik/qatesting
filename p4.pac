function FindProxyForURL(url, host) {
    // Bypass proxy for domains
    if (shExpMatch(host, "web-assets.zendesk.com")) {
        return "DIRECT";
    }
    
    // Use proxy for all other requests
    return "PROXY 192.168.128.243:50000";
}
