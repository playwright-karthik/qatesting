/*
This PAC (Proxy Auto-Configuration) file controls how traffic is routed through the proxy server 172.21.61.107.

- The proxy has multiple ports (3128, 50000, 50001, 50002), and specific traffic is routed to specific ports.
- Rule-1: Requests to Zendesk domain (web-assets.zendesk.com) or its IP range are sent through port 3128 (non-auth proxy).
- Rule-2: Requests to Google (www.google.com) or its IP range are sent through port 50000 (auth proxy).
- For all other traffic, the connection is made directly (no proxy).

The PAC file evaluates rules from top to bottom, and the first matching rule is applied.
*/

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
