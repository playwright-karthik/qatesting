function FindProxyForURL(url, host) {
    // Bypass specific domains/hosts
    if (host == "ftp.cpsqa.net" ||
        host == "www.cisco.com") {
        return "DIRECT";
    }
    // Everything else goes through proxy
    return "PROXY 172.21.61.107:50000";
}
