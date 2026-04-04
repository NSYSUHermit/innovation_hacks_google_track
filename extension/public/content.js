chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJD') {
    const bodyText = document.body.innerText;
    const title = document.querySelector('h1')?.innerText || document.title;
    sendResponse({ title, text: bodyText.substring(0, 15000) }); 
  } else if (request.action === 'autofill') {
    const data = request.data;
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      const name = (input.name || input.id || input.placeholder || '').toLowerCase();
      if (name.includes('name') && data.fullName) input.value = data.fullName;
      else if (name.includes('email') && data.email) input.value = data.email;
      else if (name.includes('phone') && data.phone) input.value = data.phone;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    sendResponse({ success: true });
  }
});
