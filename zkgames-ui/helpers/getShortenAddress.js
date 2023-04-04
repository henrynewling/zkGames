export function getShortenAddress(address, char = 10) {
    if (!address) {
        return null;
    }
    return address ? `${address.slice(0, char)}${'.'.repeat(3)}${address.slice(-char + 2)}` : '';
}
