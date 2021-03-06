/**
 * background script
 * main function is fetch data
 */
import {POPENV} from './helpers/tools';

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let url = request.url;
    let type = request.type || 'text';
    let params = request.params || {};

    if (url) { // async
        fetch(url, params)
            .then(checkStatus)
            .then((response) => {
                switch (type) {
                    case 'text':
                        return response.text();
                    case 'json':
                        return response.json();
                    case 'arrayBuffer':
                        return response.arrayBuffer();
                }
            })
            .then((response) => {
                if(type === 'arrayBuffer') {
                    return JSON.stringify(Array.apply(null, new Uint8Array(response)));
                }
                return response;
            })
            .then((response) => { sendResponse(response) })
            .catch((error) => { sendResponse({error: error}) });
        return true;
    }
});

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

// when install or update new version fired
browser.runtime.onInstalled && browser.runtime.onInstalled.addListener((detail) => {
    if(detail.reason === 'update') {
        if(parseInt(detail.previousVersion.replace(/\./g, '')) < 213) { // 更新此版本(v2.1.3)需要清除用户设置
            browser.storage.local.clear();
        }
    }
});

// when update available
browser.runtime.onUpdateAvailable && browser.runtime.onUpdateAvailable.addListener((detail) => {
    console.log(`Have a new version:${detail.version}`);
    browser.runtime.reload();  // install new version soon
});