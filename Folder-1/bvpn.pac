function FindProxyForURL(url, host) {
    // [Rule-1] Use proxy for specific domain or matching IP
    if (
        shExpMatch(host, "web-assets.zendesk.com") ||
        isInNet(dnsResolve(host), "104.18.31.0", "255.255.255.0")
    ) {
        return "PROXY 192.168.128.115:3128";
    }
    
    // [Rule-2] Use proxy for another specific domain or IP range
    if (
        shExpMatch(host, "www.google.com") ||
        isInNet(dnsResolve(host), "142.250.196.0", "255.255.255.0")
    ) {
        return "PROXY 192.168.128.115:50000";
    }
  
    // [Default Rule - Option 1] Use this proxy for all other requests
    return "PROXY 192.168.128.97:3128";

    // [Default Rule - Option 2] Uncomment below to bypass proxy for all other requests
    // return "DIRECT";
}
