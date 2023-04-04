export class ICONEXResponse {
    static walletAddress;
    static TxnHash;
    static iconSigningResult;
    static hasAccount;

    static getWalletAddress() {
        return this.walletAddress;
    }

    static setWalletAddress(walletAddress) {
        this.walletAddress = walletAddress;
    }
    static getHasAccount() {
        return this.hasAccount;
    }

    static setHasAccount(hasAccount) {
        this.hasAccount = hasAccount;
    }

    static getIconSigningResult() {
        return this.iconSigningResult;
    }

    static setIconSigningResult(iconSigningResult) {
        this.iconSigningResult = iconSigningResult;
    }

    static getTxnHash() {
        return this.TxnHash;
    }

    static setTxnHash(txnHash) {
        this.TxnHash = txnHash;
    }
}

export const eventHandler = (event) => {
    const { type, payload } = event.detail;

    switch (type) {
        case 'RESPONSE_ADDRESS':
            ICONEXResponse.setWalletAddress(payload);
            break;

        case 'RESPONSE_HAS_ACCOUNT':
            ICONEXResponse.setHasAccount(payload.hasAccount);
            break;

        case 'RESPONSE_SIGNING':
            ICONEXResponse.setIconSigningResult(payload);
            break;
        case 'CANCEL_SIGNING':
            ICONEXResponse.setIconSigningResult(null);
            break;

        case 'RESPONSE_JSON-RPC':
            if (payload?.code) {
                console.log(`Transaction Failed : ${payload.message}`);
                //TODO: use of Snackbar to show failed message however it don't seem to occur.
            }

            switch (payload.id) {
                case 6639:
                    ICONEXResponse.setTxnHash(payload.result);
                    break;
                default:
                    break;
            }
            break;

        case 'CANCEL_JSON-RPC':
            ICONEXResponse.setTxnHash(-1);
            break;

        default:
            return;
    }
};
