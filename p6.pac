{
    //Nothing to bypass
    if (isInNet(host, "192.168.128.242", "255.255.255.255") ||
        isInNet(host, "192.168.128.999", "255.255.255.255") {
        return "DIRECT";
    }

    return "PROXY 192.168.128.243:50000";
}
