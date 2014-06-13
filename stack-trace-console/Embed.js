//
// Embed script before DOM is built so that it has access to the global object
//

var script = document.createElement('script');
script.src = chrome.extension.getURL("Logging.js");

script.addEventListener('load', function() {
    this.parentNode.removeChild(this);
});

(document.head || document.documentElement).appendChild(script);
