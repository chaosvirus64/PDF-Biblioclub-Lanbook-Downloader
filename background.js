chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action==='keepAwake') chrome.power.requestKeepAwake('display');
  if (msg.action==='releaseAwake') chrome.power.releaseKeepAwake();
});
