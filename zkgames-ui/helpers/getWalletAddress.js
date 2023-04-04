import { isChrome } from './isChrome';
import { eventHandler, ICONEXResponse } from './eventHandler';

// const HANA_EXT_LINK = 'https://chrome.google.com/webstore/detail/hana/jfdlamikmbghhapbgfoogdffldioobgl';
// const ICONEX_EXT_LINK = 'https://chrome.google.com/webstore/detail/iconex/flpiciilemghbmfalicajoolhkkenfel?hl=en';

window.addEventListener('ICONEX_RELAY_RESPONSE', eventHandler);

export const customRequestAddress = new CustomEvent('ICONEX_RELAY_REQUEST', {
    detail: {
        type: 'REQUEST_ADDRESS',
        id: 1234,
    },
});

export const customRequestHasAccount = new CustomEvent('ICONEX_RELAY_REQUEST', {
    detail: {
        type: 'REQUEST_HAS_ACCOUNT',
    },
});

export const getWalletAddress = () => {
    return new Promise((resolve, reject) => {
        if (isChrome()) {
            ICONEXResponse.setWalletAddress(null);
            window.dispatchEvent(customRequestHasAccount);
            window.dispatchEvent(customRequestAddress);

            let interval = setInterval(() => {
                if (ICONEXResponse.getWalletAddress()) {
                    clearInterval(interval);
                    resolve(ICONEXResponse.getWalletAddress());
                }
                if (!ICONEXResponse.getHasAccount()) {
                    reject('No ICON wallet detected !');
                    clearInterval(interval);
                }
            }, 1000);
        } else {
            reject('Please use chrome or chromium browser');
        }
    });
};
