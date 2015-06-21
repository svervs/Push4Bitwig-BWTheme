// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceParamsMode (model)
{
    AbstractDeviceMode.call (this, model);
    this.id = MODE_DEVICE_PARAMS;
    this.isTemporary = false;
}
DeviceParamsMode.prototype = new AbstractDeviceMode ();

DeviceParamsMode.prototype.hasPreviousPage = function ()
{
    return this.cursorDevice.hasPreviousParameterPage ();
};

DeviceParamsMode.prototype.hasNextPage = function ()
{
    return this.cursorDevice.hasNextParameterPage ();
};

DeviceParamsMode.prototype.previousPage = function ()
{
    this.cursorDevice.previousParameterPage ();
};

DeviceParamsMode.prototype.nextPage = function ()
{
    this.cursorDevice.nextParameterPage ();
};

DeviceParamsMode.prototype.previousPageBank = function ()
{
    this.cursorDevice.setSelectedParameterPage (Math.max (this.cursorDevice.getSelectedParameterPage () - 8, 0));
};

DeviceParamsMode.prototype.nextPageBank = function ()
{
    this.cursorDevice.setSelectedParameterPage (Math.min (this.cursorDevice.getSelectedParameterPage () + 8, this.cursorDevice.getParameterPageNames ().length - 1));
};

DeviceParamsMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
            this.cursorDevice.resetParameter (index);
        }
        else
        {
            var param = this.cursorDevice.getFXParam (index);
            displayNotification (param.name + ": " + param.valueStr);
        }
    }
};

AbstractDeviceMode.prototype.onValueKnob = function (index, value)
{
    var param = this.cursorDevice.getFXParam (index);
    param.value = this.surface.changeValue (value, param.value);
    this.cursorDevice.setParameter (index, param.value);
};

DeviceParamsMode.prototype.onFirstRowBank = function (index)
{
    var bank = this.calcBank ();
    if (bank != null)
        this.cursorDevice.setSelectedParameterPage (bank.offset + index);
};

DeviceParamsMode.prototype.updateFirstRowBank = function ()
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

DeviceParamsMode.prototype.updateParameters = function (d)
{
    for (var i = 0; i < 8; i++)
    {
        var param = this.cursorDevice.getFXParam (i);
        d.setCell (0, i, param.name, Display.FORMAT_RAW)
         .setCell (1, i, param.valueStr, Display.FORMAT_RAW);
    }
};

DeviceParamsMode.prototype.calcBank = function ()
{
    var device = this.cursorDevice;
    var pages = device.getParameterPageNames ();
    var page = device.getSelectedParameterPage ();
    if (pages.length == 0)
        return null;
    if (page >= pages.length || page < 0)
        page = 0;
    return { pages: pages, page: page, offset: Math.floor (page / 8) * 8 };
};
