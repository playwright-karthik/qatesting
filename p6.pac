function FindProxyForURL(url, host)
{
    //Nothing to bypass
    if (isInNet(dnsResolve(host),"127.0.0.0","255.0.0.0")) return "DIRECT";

    return "PROXY 192.168.128.243:50000";
}
