chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {        
    if (tab.url.indexOf("trade.taobao.com/trade/itemlist") > -1) {             
        chrome.pageAction.show(tabId);  
    }  
})

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if(message === 'stock'){
        // var pop = chrome.extension.getViews({type:'popup'})
        // pop[0].init()
        sendResponse('Hello from background script.');
        
    }
})