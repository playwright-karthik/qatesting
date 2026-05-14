function FindProxyForURL(url, host) {

    // Rule-1: Zendesk traffic via port 3128
    if (
        shExpMatch(host, "web-assets.zendesk.com") ||
        isInNet(dnsResolve(host), "104.18.31.0", "255.255.255.0")
    ) {
        return "PROXY 172.21.61.107:3128";
    }

    // Rule-2: Google traffic via port 50000
    if (
        shExpMatch(host, "www.google.com") ||
        isInNet(dnsResolve(host), "142.250.196.0", "255.255.255.0")
    ) {
        return "PROXY 172.21.61.107:50000";
    }

    // Default: Direct connection (no proxy)
    return "DIRECT";
}
