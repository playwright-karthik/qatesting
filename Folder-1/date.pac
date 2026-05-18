function FindProxyForURL(url, host) {

    // Monday to Friday, 9 AM to 6 PM
    if (weekdayRange("MON") && timeRange(9, 18)) {
        return "PROXY 172.21.61.107:3128";
    }

    // Specific date range: 1st to 15th of any month
    if (dateRange(1, 15)) {
        return "PROXY 172.21.61.107:50000";
    }

    // Default: Direct connection
    return "DIRECT";
}
