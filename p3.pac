function FindProxyForURL(url, host) {
    // Bypass proxy for domains beginning with *.*
    if (shExpMatch(host, "*.*")) {
        return "DIRECT";
    }
    
    // Use proxy for all other requests
    return "PROXY 192.168.128.243:50000";
}
