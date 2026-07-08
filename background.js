/*
  injects quickTest.js into all frames in all tabs (except chrome://... urls)
    quickTest.js simply attempts chrome.runtime.connect()
      if connection happens, log a success message
      if it doesn't connect within 2 seconds, assume its failed and log failure message 
        -> check console in tab to verify actual 'chrome.runtime.connect is not a function' error
*/

chrome.userScripts.configureWorld({
  messaging: true
});

let failureTimeouts = {};

function setFailureTimeout(tab, doc){
  let str = `${tab}/${doc}`;
  failureTimeouts[str] = setTimeout(function(){
    console.log(`quickTestInjection FAILED TAB: ${tab} / DOC: ${doc}`);
    delete failureTimeouts[str];
  }, 2000);
}

function clearFailureTimeout(str){
  clearTimeout(failureTimeouts[str])
  delete failureTimeouts[str];
}

chrome.runtime.onUserScriptConnect.addListener(async function(port){
  if (port.name === "quickTest"){
    console.log(`quickTestInjection SUCCESS for  TAB: ${port.sender.tab.id} / DOC: ${port.sender.documentId}`)
    clearFailureTimeout(`${port.sender.tab.id}/${port.sender.documentId}`);
  }
});

chrome.action.onClicked.addListener(function (tab) {
  quickTest();
});

function quickTest(){
  chrome.tabs.query({}, async (tabs) => {
    tabs.forEach(async (tab) => {
      let allFrames = await chrome.webNavigation.getAllFrames({tabId: tab.id});
      for (let i=0; i<allFrames.length; i++){
        let frameInfo = allFrames[i];
        if (/^chrome:\/\//.test(tab.url) === false){
          setFailureTimeout(tab.id, frameInfo.documentId);
          chrome.userScripts.execute({
            js: [{ file: './quickTest.js' }],
            injectImmediately: true,
            target: {
              tabId: tab.id,
              documentIds: [frameInfo.documentId]
            }
          });
        }
      }
    });
  });
}

quickTest();