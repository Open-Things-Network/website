/**
 * Based on Showdown's Extension boilerplate
 * https://github.com/showdownjs/extension-boilerplate
 */
(function (extension) {
    'use strict';
  
    // UML - Universal Module Loader
    // This enables the extension to be loaded in different environments
    if (typeof showdown !== 'undefined') {
      // global (browser or nodejs global)
      extension(showdown);
    } else if (typeof define === 'function' && define.amd) {
      // AMD
      define(['showdown'], extension);
    } else if (typeof exports === 'object') {
      // Node, CommonJS-like
      module.exports = extension(require('showdown'));
    } else {
      // showdown was not found so we throw
      throw Error('Could not find showdown library');
    }
  
  }(function (showdown) {
    'use strict';
    showdown.extension('bootstrap', function() {
      'use strict';
  
      return {
        type: 'output',
        filter: (html) => {
            const regex = /<table>/g;
            return html.replace(regex, '<table class="table table-bordered">');
        }
      };
    });
  }));