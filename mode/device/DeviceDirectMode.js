// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceDirectMode (model)
{
    AbstractDeviceMode.call (this, model);
    this.id = MODE_DEVICE_DIRECT;
    
    this.emptyParameter = { name: '', valueStr: '', value: '' };
}
DeviceDirectMode.prototype = new AbstractDeviceMode ();

DeviceDirectMode.prototype.onActivate = function ()
{
    this.model.getDevice ().enableDirectParameterObservation (true);
};

DeviceDirectMode.prototype.onDeactivate = function ()
{
    this.model.getDevice ().enableDirectParameterObservation (false);
};

DeviceDirectMode.prototype.onValueKnob = function (index, value)
{
    this.model.getDevice ().changeDirectPageParameter (index, value, this.surface.getFractionValue ());
};

DeviceDirectMode.prototype.hasPreviousPage = function ()
{
    return this.model.getDevice ().hasPreviousDirectParameterPage ();
};

DeviceDirectMode.prototype.hasNextPage = function ()
{
    return this.model.getDevice ().hasNextDirectParameterPage ();
};

DeviceDirectMode.prototype.previousPage = function ()
{
    this.model.getDevice ().previousDirectParameterPage ();
};

DeviceDirectMode.prototype.nextPage = function ()
{
    this.model.getDevice ().nextDirectParameterPage ();
};

DeviceDirectMode.prototype.previousPageBank = function ()
{
    this.model.getDevice ().previousDirectParameterPageBank ();
};

DeviceDirectMode.prototype.nextPageBank = function ()
{
    this.model.getDevice ().nextDirectParameterPageBank ();
};

DeviceDirectMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    this.isKnobTouched[index] = isTouched;
    
    if (isTouched)
    {
        var cd = this.model.getDevice ();
        
        if (this.surface.isDeletePressed ())
        {
            this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
            /* TODO API extension required
            cd.resetParameter (index);*/
            return;
        }

        var params = cd.getDirectParameters ();
        var pageOffset = cd.getSelectedDirectParameterPage () * 8;
        var param = pageOffset + index >= params.length ? this.emptyParameter : params[pageOffset + index];
        if (param.name.length > 0)
            displayNotification (param.name + ": " + param.valueStr);
    }
    
    // Note: Direct parameters do not have parameter-objects and therefore cannot be
    // used for touch-automation (p.touch())
    
    this.checkStopAutomationOnKnobRelease (isTouched);
};

DeviceDirectMode.prototype.onFirstRowBank = function (index)
{
    var bank = this.calcBank ();
    if (bank != null)
        this.model.getDevice ().setSelectedDirectParameterPage (bank.offset + index);
};

DeviceDirectMode.prototype.updateFirstRowBank = function ()
{
    if (!this.model.getDevice ().hasSelectedDevice ())
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
        this.surface.updateButton (20 + p, index < bank.pages.length ? (index == bank.page ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO) : PUSH_COLOR_BLACK);
    }
};

DeviceDirectMode.prototype.updateParameters = function (d)
{
    var cd = this.model.getDevice ();
    var params = cd.getDirectParameters ();
    var pageOffset = cd.getSelectedDirectParameterPage () * 8;
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
    var cd = this.model.getDevice ();
    var params = cd.getDirectParameters ();
    if (params.length == 0)
        return null;
    var currentPage = cd.getSelectedDirectParameterPage ();
    return { pages: cd.directParameterPageNames, page: currentPage, offset: Math.floor (currentPage / 8) * 8 };
};

//Push 2
DeviceDirectMode.prototype.getParameterAttributes = function (index)
{
    var cd = this.model.getDevice ();
    var params = cd.getDirectParameters ();
    var pageOffset = cd.getSelectedDirectParameterPage () * 8;
    var param = pageOffset + index >= params.length ? this.emptyParameter : params[pageOffset + index];
    return { name: param.name, valueStr: param.valueStr, value: param.value * (Config.maxParameterValue - 1) };
};
