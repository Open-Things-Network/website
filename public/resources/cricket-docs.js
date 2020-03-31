(function (window) {
// You can enable the strict mode commenting the following line  
// 'use strict';

    function cricketDocs() {
        var _myLibraryObject = {};
        // We will add functions to our library here !
        _myLibraryObject.cmsMode = false;

        _myLibraryObject.setCmsMode = function (newMode) {
            this.cmsMode = newMode;
            return newMode;
        }
        _myLibraryObject.isCmsMode = function () {
            return this.cmsMode;
        }
        _myLibraryObject.getJsonFile = async function (fileLocation) {
            if (this.cmsMode) {
                return '';
            }
            const res = await fetch(fileLocation);
            return await res.json();
        }
        _myLibraryObject.getTextFile = async function (fileLocation) {
            if (this.cmsMode) {
                return '';
            }
            const res = await fetch(fileLocation);
            return await res.text();
        }

        return _myLibraryObject;
    }

    if (typeof (window.cricketDocs) === 'undefined') {
        window.cricketDocs = cricketDocs();
    }
})(window);