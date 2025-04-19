function i18n(key) { return chrome.i18n.getMessage(key) || key; }

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = i18n(el.getAttribute('data-i18n'));
  });

  const btn = document.getElementById('download-btn');
  const start = document.getElementById('start-page');
  const end = document.getElementById('end-page');
  const bar = document.getElementById('progress-bar');
  const txt = document.getElementById('progress-text');
  const cont = document.getElementById('progress-container');

  btn.addEventListener('click', async () => {
    const s = parseInt(start.value,10), e = parseInt(end.value,10);
    if (isNaN(s)||isNaN(e)||s<1||e<s) {
      alert(i18n('invalidRange'));
      return;
    }
    btn.disabled=true; cont.hidden=false;
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    chrome.tabs.sendMessage(tab.id, {action:'download', start:s, end:e});
  });

  chrome.runtime.onMessage.addListener(msg => {
    if (msg.action==='progress') {
      const pct = Math.round(msg.page/msg.total*100);
      bar.value=pct; txt.textContent=`${msg.page}/${msg.total}`;
    } else if (msg.action==='done') {
      btn.disabled=false; txt.textContent=i18n('done');
    } else if (msg.action==='error') {
      alert(i18n('error')+': '+msg.message); btn.disabled=false;
    }
  });
});
