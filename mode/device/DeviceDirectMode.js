// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceDirectMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_DEVICE_DIRECT;
    
    this.emptyParameter = { name: '', valueStr: '', value: '' };
    this.currentPage = 0;
}
DeviceDirectMode.prototype = new AbstractDeviceMode ();

DeviceDirectMode.prototype.onValueKnob = function (index, value)
{
    var cursorDevice = this.model.getCursorDevice ();
    var params = cursorDevice.getDirectParameters ();
    var pos = this.currentPage * 8 + index;
    if (pos < params.length)
        cursorDevice.changeDirectParameter (pos, value, this.surface.getFractionValue ());
};

DeviceDirectMode.prototype.hasPreviousPage = function ()
{
    return this.model.getCursorDevice ().getDirectParameters ().length > 0 && this.currentPage > 0;
};

DeviceDirectMode.prototype.hasNextPage = function ()
{
    var params = this.model.getCursorDevice ().getDirectParameters ();
    return params.length > 0 && this.currentPage < Math.floor (params.length / 8) + (params.length % 8 > 0 ? 1 : 0) - 1;
};

DeviceDirectMode.prototype.previousPage = function ()
{
    var cursorDevice = this.model.getCursorDevice ();
    var params = cursorDevice.getDirectParameters ();
    if (params.length != 0)
        this.currentPage = Math.max (this.currentPage - 1, 0);
};

DeviceDirectMode.prototype.nextPage = function ()
{
    var cursorDevice = this.model.getCursorDevice ();
    var params = cursorDevice.getDirectParameters ();
    if (params.length != 0)
        this.currentPage = Math.min (this.currentPage + 1, Math.floor (params.length / 8) + (params.length % 8 > 0 ? 1 : 0) - 1);
};

DeviceDirectMode.prototype.previousPageBank = function ()
{
    var cursorDevice = this.model.getCursorDevice ();
    var params = cursorDevice.getDirectParameters ();
    if (params.length != 0)
        this.currentPage = Math.max (this.currentPage - 8, 0);
};

DeviceDirectMode.prototype.nextPageBank = function ()
{
    var cursorDevice = this.model.getCursorDevice ();
    var params = cursorDevice.getDirectParameters ();
    if (params.length != 0)
        this.currentPage = Math.min (this.currentPage + 8, Math.floor (params.length / 8) + (params.length % 8 > 0 ? 1 : 0) - 1);
};

DeviceDirectMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    if (isTouched && this.surface.isDeletePressed ())
    {
/* TODO Not possible?           
        this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
        this.model.getCursorDevice ().resetParameter (index);*/
    }
};

DeviceDirectMode.prototype.onFirstRowBank = function (index)
{
    var bank = this.calcBank ();
    if (bank != null)
        this.currentPage = bank.offset + index;
};

DeviceDirectMode.prototype.updateFirstRowBank = function ()
{
    if (!this.model.hasSelectedDevice ())
    {
        this.disableFirstRow ();
        return;
    }
    
    var bank = this.calcBank ();
    if (bank == null)
    {
        this.disableFirstRow ();
        return;
    }
        
    for (var p = 0; p < 8; p++)
    {
        var index = bank.offset + p;
        this.surface.setButton (20 + p, index < bank.pages.length ? (index == bank.page ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO) : PUSH_COLOR_BLACK);
    }
};

DeviceDirectMode.prototype.updateParameters = function (d)
{
    var cursorDevice = this.model.getCursorDevice ();
    
    var params = cursorDevice.getDirectParameters ();
    var pageOffset = this.currentPage * 8;
    if (pageOffset >= params.length)
    {
        pageOffset = 0;
        this.currentPage = 0;
    }
    
    d.clearRow (2);
    for (var i = 0; i < 8; i++)
    {
        var param = pageOffset + i >= params.length ? this.emptyParameter : params[pageOffset + i];
        d.setCell (0, i, param.name, Display.FORMAT_RAW)
         .setCell (1, i, param.valueStr, Display.FORMAT_RAW);
    }
};

DeviceDirectMode.prototype.calcBank = function ()
{
    var params = this.model.getCursorDevice ().getDirectParameters ();
    if (params.length == 0)
        return null;
        
    var numPages = Math.floor (params.length / 8) + (params.length % 8 > 0 ? 1 : 0);
    var pages = [];
    for (var i = 0; i < numPages; i++)
        pages.push ("Page " + (i + 1));
        
    if (this.currentPage >= pages.length || this.currentPage < 0)
        this.currentPage = 0;
    return { pages: pages, page: this.currentPage, offset: Math.floor (this.currentPage / 8) * 8 };
};
