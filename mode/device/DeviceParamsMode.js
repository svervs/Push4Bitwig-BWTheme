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
    return this.model.getDevice ().hasPreviousParameterPage ();
};

DeviceParamsMode.prototype.hasNextPage = function ()
{
    return this.model.getDevice ().hasNextParameterPage ();
};

DeviceParamsMode.prototype.previousPage = function ()
{
    this.model.getDevice ().previousParameterPage ();
};

DeviceParamsMode.prototype.nextPage = function ()
{
    this.model.getDevice ().nextParameterPage ();
};

DeviceParamsMode.prototype.previousPageBank = function ()
{
    var cd = this.model.getDevice ();
    cd.setSelectedParameterPage (Math.max (cd.getSelectedParameterPage () - 8, 0));
};

DeviceParamsMode.prototype.nextPageBank = function ()
{
    var cd = this.model.getDevice ();
    cd.setSelectedParameterPage (Math.min (cd.getSelectedParameterPage () + 8, cd.getParameterPageNames ().length - 1));
};

DeviceParamsMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    this.isKnobTouched[index] = isTouched;
    
    var cd = this.model.getDevice ();
    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
            cd.resetParameter (index);
            return;
        }

        var param = cd.getFXParam (index);
        displayNotification (param.name + ": " + param.valueStr);
    }
    cd.getParameter (index).touch (isTouched);
};

DeviceParamsMode.prototype.onValueKnob = function (index, value)
{
    var cd = this.model.getDevice ();
    var param = cd.getFXParam (index);
    param.value = this.surface.changeValue (value, param.value);
    cd.setParameter (index, param.value);
};

DeviceParamsMode.prototype.onFirstRowBank = function (index)
{
    var bank = this.calcBank ();
    if (bank != null)
        this.model.getDevice ().setSelectedParameterPage (bank.offset + index);
};

DeviceParamsMode.prototype.updateFirstRowBank = function ()
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
        this.surface.setButton (20 + p, index < bank.pages.length ? (index == bank.page ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO) : PUSH_COLOR_BLACK);
    }
};

DeviceParamsMode.prototype.updateParameters = function (d)
{
    var cd = this.model.getDevice ();
    for (var i = 0; i < 8; i++)
    {
        var param = cd.getFXParam (i);
        d.setCell (0, i, param.name, Display.FORMAT_RAW)
         .setCell (1, i, param.valueStr, Display.FORMAT_RAW);
    }
};

DeviceParamsMode.prototype.calcBank = function ()
{
    var device = this.model.getDevice ();
    var pages = device.getParameterPageNames ();
    var page = device.getSelectedParameterPage ();
    if (pages.length == 0)
        return null;
    if (page >= pages.length || page < 0)
        page = 0;
    return { pages: pages, page: page, offset: Math.floor (page / 8) * 8 };
};

// Push 2
DeviceParamsMode.prototype.getParameterAttributes = function (index)
{
    return this.model.getDevice ().getFXParam (index);
};
