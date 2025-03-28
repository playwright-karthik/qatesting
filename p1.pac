function FindProxyForURL(url, host)
{
    //use DNS resolver example:8.8.8.8/127.0.0.0 in Third condition to bypass
    if (isInNet(host, "192.168.128.242", "255.255.255.255") ||
        isInNet(host, "192.168.128.111", "255.255.255.255") ||
        isInNet(dnsResolve(host), "8.8.8.8", "255.0.0.0")) {
        return "DIRECT";
    }

    return "PROXY 192.168.128.243:50000";
}
