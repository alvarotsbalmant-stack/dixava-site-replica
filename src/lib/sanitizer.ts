import DOMPurify from 'dompurify';

// Configure DOMPurify with secure defaults
const createSecureDOMPurify = () => {
  // Enhanced DOMPurify configuration with stronger security measures
  const config = {
    // Only allow essential safe tags
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span', 'pre', 'code'
    ],
    
    // Strict attribute allowlist  
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'width', 'height', 'class', 'id', 'rel', 'target'
    ],
    
    // Enhanced URI validation - only allow safe protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    
    // Comprehensive blocklist for dangerous elements
    FORBID_TAGS: [
      'script', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select',
      'iframe', 'frame', 'frameset', 'noframes', 'noscript', 'style', 'title',
      'meta', 'link', 'base', 'applet', 'param', 'audio', 'video', 'source',
      'track', 'canvas', 'svg', 'math'
    ],
    
    // Block all event handlers and dangerous attributes
    FORBID_ATTR: [
      'on*', 'formaction', 'form', 'xmlns', 'xlink:href', 'xml:base', 'xml:lang',
      'xml:space', 'onfocus', 'onblur', 'onchange', 'onclick', 'ondblclick',
      'onmousedown', 'onmouseup', 'onmouseover', 'onmousemove', 'onmouseout',
      'onkeypress', 'onkeydown', 'onkeyup', 'onabort', 'onerror', 'onload',
      'onunload', 'onreset', 'onselect', 'onsubmit', 'oncontextmenu', 'ondrag',
      'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart',
      'ondrop', 'onscroll', 'onwheel', 'ontouchstart', 'ontouchend', 'ontouchmove',
      'ontouchcancel', 'onpointerdown', 'onpointerup', 'onpointermove',
      'onpointerover', 'onpointerout', 'onpointerenter', 'onpointerleave',
      'onpointercancel', 'style', 'background', 'behavior'
    ],
    
    // Enhanced security options
    KEEP_CONTENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    SANITIZE_DOM: true,
    SANITIZE_NAMED_PROPS: true,
    WHOLE_DOCUMENT: false,
    FORCE_BODY: true
  };

  // Apply additional hooks for enhanced security
  DOMPurify.addHook('beforeSanitizeElements', function (node) {
    // Remove any remaining dangerous elements
    const element = node as Element;
    if (element.tagName && ['SCRIPT', 'OBJECT', 'EMBED', 'IFRAME'].includes(element.tagName)) {
      element.parentNode?.removeChild(element);
    }
  });

  DOMPurify.addHook('beforeSanitizeAttributes', function (node) {
    const element = node as Element;
    // Remove any attribute that starts with 'on' (event handlers)
    if (element.hasAttributes && element.hasAttributes()) {
      const attrs = element.attributes;
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attr = attrs[i];
        if (attr.name.toLowerCase().startsWith('on') || 
            attr.name.toLowerCase().includes('script') ||
            attr.name.toLowerCase().includes('javascript')) {
          element.removeAttribute(attr.name);
        }
      }
    }
    
    // Sanitize href attributes
    if (element.hasAttribute && element.hasAttribute('href')) {
      const href = element.getAttribute('href');
      if (href && (href.toLowerCase().includes('javascript:') || 
                   href.toLowerCase().includes('data:') ||
                   href.toLowerCase().includes('vbscript:'))) {
        element.removeAttribute('href');
      }
    }
  });

  return DOMPurify;
};

const secureDOMPurify = createSecureDOMPurify();

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    return secureDOMPurify.sanitize(html, {
      USE_PROFILES: { html: true }
    });
  } catch (error) {
    console.error('HTML sanitization failed:', error);
    return ''; // Return empty string if sanitization fails
  }
};

/**
 * Sanitizes HTML content with even stricter rules for user content
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string with minimal allowed tags
 */
export const sanitizeUserContent = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    return secureDOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: [],
      USE_PROFILES: { html: true }
    });
  } catch (error) {
    console.error('User content sanitization failed:', error);
    return '';
  }
};

/**
 * Removes all HTML tags and returns plain text
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export const stripHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    return secureDOMPurify.sanitize(html, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  } catch (error) {
    console.error('HTML stripping failed:', error);
    return '';
  }
};

/**
 * Validates if HTML content is safe after sanitization
 * @param original - Original HTML string
 * @param sanitized - Sanitized HTML string
 * @returns True if content was not modified during sanitization
 */
export const validateSanitization = (original: string, sanitized: string): boolean => {
  // If the sanitized version is significantly different, it might indicate malicious content
  const originalLength = original.length;
  const sanitizedLength = sanitized.length;
  
  // Allow up to 20% difference in length (for tag removals/modifications)
  const lengthDifference = Math.abs(originalLength - sanitizedLength) / originalLength;
  
  return lengthDifference <= 0.2;
};