// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BrowserProxy (device)
{
    this.numResults = 16; // TODO
    this.textLength = GlobalConfig.CURSOR_DEVICE_TEXT_LENGTH;
    
    this.browser = device.createDeviceBrowser (this.numResults);
    
    this.browser.addIsBrowserWindowShownObserver (doObject (this, BrowserProxy.prototype.handleIsBrowserWindowShown));
    this.browser.addIsBrowsingObserver (doObject (this, BrowserProxy.prototype.handleIsBrowsing));

    this.deviceSession = this.browser.getDeviceSession ();
    this.deviceResults = this.deviceSession.getResults ();
    
    /*
    for (var i = 0; i < this.numResults; i++)
    {
        var item = this.deviceResults.getItem (i);
        item.addValueObserver (doObjectIndex (this, i, BrowserProxy.prototype.handleItemValue), this.textLength, '');
    }
    */
}

BrowserProxy.prototype.browseDevices = function ()
{
    println("Browse");
    
    this.deviceSession.activate ();
    this.browser.startBrowsing ();
    this.browser.showBrowserWindow ();
};



BrowserProxy.prototype.handleIsBrowserWindowShown = function (isShown)
{
    println("isShown: "+isShown);
};

BrowserProxy.prototype.handleIsBrowsing = function (isBrowsing)
{
    println("isBrowsing: "+isBrowsing);
};

BrowserProxy.prototype.handleItemValue = function (index, value)
{
    println("Item: "+index+":"+value);
};
