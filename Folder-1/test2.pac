function FindProxyForURL(url, host) {

    // Rule-1: Zendesk traffic via port 3128 = NO auth
    if (
        shExpMatch(host, "web-assets.zendesk.com") ||
        isInNet(dnsResolve(host), "104.18.31.0", "255.255.255.0")
    ) {
        return "PROXY 172.21.61.107:3128";
    }

    // Rule-2: AirBnb traffic via port 50000 = needs auth creds
    if (
        shExpMatch(host, "a0.muscache.com") ||
        isInNet(dnsResolve(host), "23.216.6.108", "255.255.255.0")
    ) {
        return "PROXY 172.21.61.107:50000";
    }

    // Default: Direct connection (no proxy)
    return "DIRECT";
}
