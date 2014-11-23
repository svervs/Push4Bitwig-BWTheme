// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DirectParameterMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_BANK_DIRECT;
    
    this.emptyParameter = { name: '', valueStr: '', value: '' };
    this.currentPage = 0;
}
DirectParameterMode.prototype = new BaseMode ();

DirectParameterMode.prototype.onValueKnob = function (index, value)
{
    var cursorDevice = this.model.getCursorDevice ();
    var params = cursorDevice.getDirectParameters ();
    var pos = this.currentPage * 8 + index;
    if (pos < params.length)
        cursorDevice.changeDirectParameter (pos, value, this.surface.getFractionValue ());
};

DirectParameterMode.prototype.hasPreviousPage = function ()
{
    return this.model.getCursorDevice ().getDirectParameters ().length > 0 && this.currentPage > 0;
};

DirectParameterMode.prototype.hasNextPage = function ()
{
    var params = this.model.getCursorDevice ().getDirectParameters ();
    return params.length > 0 && this.currentPage < Math.floor (params.length / 8) + (params.length % 8 > 0 ? 1 : 0) - 1;
};

DirectParameterMode.prototype.previousPage = function ()
{
    var cursorDevice = this.model.getCursorDevice ();
    var params = cursorDevice.getDirectParameters ();
    if (params.length != 0)
        this.currentPage = Math.max (this.currentPage - 1, 0);
};

DirectParameterMode.prototype.nextPage = function ()
{
    var cursorDevice = this.model.getCursorDevice ();
    var params = cursorDevice.getDirectParameters ();
    if (params.length != 0)
        this.currentPage = Math.min (this.currentPage + 1, Math.floor (params.length / 8) + (params.length % 8 > 0 ? 1 : 0) - 1);
};

DirectParameterMode.prototype.previousPageBank = function ()
{
    var cursorDevice = this.model.getCursorDevice ();
    var params = cursorDevice.getDirectParameters ();
    if (params.length != 0)
        this.currentPage = Math.max (this.currentPage - 8, 0);
};

DirectParameterMode.prototype.nextPageBank = function ()
{
    var cursorDevice = this.model.getCursorDevice ();
    var params = cursorDevice.getDirectParameters ();
    if (params.length != 0)
        this.currentPage = Math.min (this.currentPage + 8, Math.floor (params.length / 8) + (params.length % 8 > 0 ? 1 : 0) - 1);
};

DirectParameterMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    if (isTouched && this.surface.isDeletePressed ())
    {
/* TODO Not possible?           
        this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
        this.model.getCursorDevice ().resetParameter (index);*/
    }
};

DirectParameterMode.prototype.onFirstRow = function (index)
{
    var bank = this.calcBank ();
    if (bank != null)
        this.currentPage = bank.offset + index;
};

DirectParameterMode.prototype.updateDisplay = function () 
{
    var d = this.surface.getDisplay ();
    var hasDevice = this.model.hasSelectedDevice ();

    if (hasDevice)
    {
        var cursorDevice = this.model.getCursorDevice ();
        var selectedDevice = this.model.getSelectedDevice ();
        
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
            var isEmpty = param.name.length == 0;
            d.setCell (0, i, param.name, Display.FORMAT_RAW)
             .setCell (1, i, param.valueStr, Display.FORMAT_RAW);
        }
        
        d.setBlock (2, 0, 'Selected Device: ', Display.FORMAT_RAW)
         .setBlock (2, 1, selectedDevice.name);
         
        var bank = this.calcBank ();
        if (bank == null)
            d.clearRow (3);
        else
        {
            for (var p = 0; p < 8; p++)
            {
                var index = bank.offset + p;
                d.setCell (3, p, index < bank.pages.length ? ((index == bank.page ? Display.RIGHT_ARROW : "") + bank.pages[index]) : "", Display.FORMAT_RAW);
            }
        }
    }
    else
        d.clear ().setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ').clearRow (3);

    d.allDone ();
};

DirectParameterMode.prototype.updateFirstRow = function ()
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

DirectParameterMode.prototype.calcBank = function ()
{
    var device = this.model.getCursorDevice ();
    var params = device.getDirectParameters ();
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
