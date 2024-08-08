function FindProxyForURL(url, host) {
    // Bypass proxy for domains matching using regex
    var regex = /^web-assets\.zendesk\.com$/;
    if (regex.test(host) {
        return "DIRECT";
    }
    
    // Use proxy for all other requests
    return "PROXY 192.168.128.243:50000";
}
