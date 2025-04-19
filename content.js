chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action !== 'download') return;
  chrome.runtime.sendMessage({action:'keepAwake'});

  const wait = ms => new Promise(r => setTimeout(r, ms));

  // find all page divs
  const pageDivs = Array.from(document.querySelectorAll('.page'));
  const total = Math.min(msg.end, pageDivs.length) - msg.start + 1;
  let count = 0;

  if (!window.PDFDocument || !window.blobStream) {
    chrome.runtime.sendMessage({action:'error', message:'Libraries not loaded'});
    return;
  }
  const PDFDocument = window.PDFDocument;
  const blobStream = window.blobStream;
  const doc = new PDFDocument({autoFirstPage:false});
  const stream = doc.pipe(blobStream());

  for (let i = msg.start - 1; i < msg.start - 1 + total; i++) {
    const pageDiv = pageDivs[i];
    pageDiv.scrollIntoView();
    // wait for canvas to render
    await wait(500);
    const canvasEl = pageDiv.querySelector('canvas');
    if (!canvasEl) {
      chrome.runtime.sendMessage({action:'error', message:'Canvas not found on page ' + (i+1)});
      break;
    }
    const src = canvasEl.toDataURL('image/png');
    const w = canvasEl.width;
    const h = canvasEl.height;
    doc.addPage({size: [w, h], margin: 0});
    doc.image(src, 0, 0, {width: w, height: h});
    count++;
    chrome.runtime.sendMessage({action: 'progress', page: count, total});
    await wait(200);
  }

  doc.end();
  stream.on('finish', () => {
    const blob = stream.toBlob('application/pdf');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `book_${count}pages.pdf`;
    a.click();
    chrome.runtime.sendMessage({action: 'done'});
    chrome.runtime.sendMessage({action: 'releaseAwake'});
  });
});