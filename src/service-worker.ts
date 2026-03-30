chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'OPEN_TABS') return false;

  const urls: string[] = Array.isArray(message.urls)
    ? message.urls.filter((u: unknown): u is string => typeof u === 'string')
    : [];

  const promises = urls.map(
    (url, i) =>
      new Promise<void>((resolve) =>
        setTimeout(() => {
          chrome.tabs.create({ url, active: false }).then(() => resolve());
        }, i * 50),
      ),
  );

  Promise.all(promises).then(() => sendResponse({ opened: urls.length }));
  return true; // keeps channel open until Promise.all resolves
});
