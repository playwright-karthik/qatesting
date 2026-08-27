function FindProxyForURL(url, host) {
    // Bypass specific domains/hosts
    if (host == "ftp.cpsqa.net" ||
        host == "www.cisco.com") {
        return "DIRECT";
    }
    // Everything else goes through proxy
    return "PROXY 192.168.128.115:3128";
}
