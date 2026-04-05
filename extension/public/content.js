/**
 * content.js
 * This script is injected into the target job page to extract job details and autofill forms.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  // Feature 1: Extract job description from the webpage
  if (request.action === 'extractJD') {
    const title = document.title;
    const text = document.body.innerText; // Extract all plain text from the page
    sendResponse({ title, text: text.substring(0, 15000) }); // Limit character count to avoid oversized payload
  } 
  
  // Feature 2: Ultimate Auto-Fill Form
  else if (request.action === 'AUTO_FILL_FORM') {
    const data = request.data;
    let filledCount = 0;

    /**
     * THE REACT/SPA HACK (CRITICAL)
     * Modern SPA frameworks (React, Angular, Vue) override the default setter for HTML input values.
     * Simply doing `element.value = 'text'` only updates the DOM, but the framework's internal state 
     * remains unchanged, causing the submission to fail or clear out.
     * 
     * Solution: We fetch the original prototype descriptor (HTMLInputElement or HTMLTextAreaElement), 
     * bypass the framework's proxy, invoke the native setter, and manually dispatch bubbling Input/Change events.
     */
    const setNativeValue = (element, value) => {
      try { element.focus(); } catch(e) {}

      if (element.isContentEditable) {
        element.innerText = value;
        return;
      }

      const proto = element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
      const setter = descriptor ? descriptor.set : null;
      
      if (setter) {
        setter.call(element, value);
      } else {
        element.value = value;
      }
      
      // Dispatch events so React/Vue/Angular catches the change
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      try { element.blur(); } catch(e) {}

      // VISUAL FEEDBACK: Briefly change the background color to soft green (#e6ffed)
      const originalBg = element.style.backgroundColor;
      const originalTransition = element.style.transition;
      element.style.transition = 'background-color 0.5s ease';
      element.style.backgroundColor = '#e6ffed'; // Soft green confirmation
      setTimeout(() => {
        element.style.backgroundColor = originalBg;
        setTimeout(() => { element.style.transition = originalTransition; }, 500);
      }, 1000);
    };

    try {
      // Get all potential input target elements on screen
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]');

      inputs.forEach(el => {
        // Only fill empty fields to avoid overwriting user input
        if (el.value && el.value.trim() !== '') return;
        if (el.isContentEditable && el.innerText.trim() !== '') return;

        /**
         * HEURISTIC / FUZZY MATCHING (THE BRAINS)
         * We collect every possible identifying string from the element itself and its surrounding DOM.
         * This includes 'name', 'id', 'placeholder', 'aria-label', and actual text from <label> tags.
         */
        let labelText = '';
        if (el.id) {
          try {
            const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
            if (label) labelText += ' ' + label.innerText;
          } catch(e) {} // Catch SyntaxError for malformed IDs
        }
        if (el.closest('label')) labelText += ' ' + el.closest('label').innerText;
        
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        if (ariaLabelledBy) {
          ariaLabelledBy.split(' ').forEach(id => {
            try {
              const labelEl = document.getElementById(id);
              if (labelEl) labelText += ' ' + labelEl.innerText;
            } catch(e) {}
          });
        }
        if (el.parentElement) {
          labelText += ' ' + el.parentElement.innerText;
        }

        // Combine all extracted features into a single lowercase string for analysis
        const typeStr = (el.type || '').toLowerCase();
        const classStr = (el.getAttribute('class') || '').toLowerCase();
        const testIdStr = (el.getAttribute('data-testid') || el.getAttribute('data-automation-id') || el.getAttribute('data-qa') || '').toLowerCase();
        
        const identifyStr = `${el.name || ''} ${el.id || ''} ${el.placeholder || ''} ${el.getAttribute('aria-label') || ''} ${labelText} ${typeStr} ${classStr} ${testIdStr}`.toLowerCase();
        
        let valueToFill = null;

        // Fuzzy matching logic mapped strictly to the new JSON payload structure
        if (testIdStr.includes('firstname') || (identifyStr.includes('first') && identifyStr.includes('name'))) {
          valueToFill = data.firstName;
        } else if (testIdStr.includes('lastname') || ((identifyStr.includes('last') || identifyStr.includes('family') || identifyStr.includes('sur')) && identifyStr.includes('name'))) {
          valueToFill = data.lastName;
        } else if (testIdStr === 'email' || identifyStr.includes('email') || identifyStr.includes('e-mail')) {
          valueToFill = data.email;
        } else if (testIdStr.includes('linkedin') || identifyStr.includes('linkedin')) {
          valueToFill = data.linkedIn;
        } else if (identifyStr.includes('cover') || identifyStr.includes('letter')) {
          valueToFill = data.coverLetter;
        } else if (identifyStr.includes('resume') || identifyStr.includes('summary') || identifyStr.includes('profile')) {
          valueToFill = data.resumeSummary;
        }

        // Force write if matching data is found
        if (valueToFill) {
          setNativeValue(el, valueToFill);
          filledCount++;
        }
      });

      sendResponse({ success: true, filledCount });
    } catch (error) {
      console.error("Autofill error:", error);
      sendResponse({ error: error.message });
    }
  }
  
  return true; // Keep asynchronous channel open
});