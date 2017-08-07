browser.runtime.onMessage.addListener(request => {
  if (request.method == "getSelection") {
    return Promise.resolve({response: window.getSelection().toString()});
  } else {
    return Promise.resolve({});
  }
});
