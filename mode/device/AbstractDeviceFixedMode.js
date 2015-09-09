// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractDeviceFixedMode.FIXED_BANKS_NAMES = [ 'Common', 'Envelope', 'Modulate', 'Macro', 'User' ];
AbstractDeviceFixedMode.FIXED_BANKS = [ MODE_DEVICE_COMMON, MODE_DEVICE_ENVELOPE, MODE_DEVICE_MODULATE, MODE_DEVICE_MACRO, MODE_DEVICE_USER ];


function AbstractDeviceFixedMode (model, mode)
{
    AbstractDeviceMode.call (this, model);
    this.id = mode;
    this.page = -1;
    for (var i = 0; i < AbstractDeviceFixedMode.FIXED_BANKS.length; i++)
    {
        if (mode == AbstractDeviceFixedMode.FIXED_BANKS[i])
        {
            this.page = i;
            break;
        }
    }
}
AbstractDeviceFixedMode.prototype = new AbstractDeviceMode ();

AbstractDeviceFixedMode.prototype.getParameterValues = function (index) {};
AbstractDeviceFixedMode.prototype.getParameter= function (index) {};

AbstractDeviceFixedMode.prototype.hasPreviousPage = function ()
{
    return this.page > 0;
};

AbstractDeviceFixedMode.prototype.hasNextPage = function ()
{
    return this.page < AbstractDeviceFixedMode.FIXED_BANKS.length - 1;
};
    
AbstractDeviceFixedMode.prototype.previousPage = function ()
{
    if (this.hasPreviousPage ())
        this.surface.setPendingMode (AbstractDeviceFixedMode.FIXED_BANKS[this.page - 1]);
};

AbstractDeviceFixedMode.prototype.nextPage = function ()
{
    if (this.hasNextPage ())
        this.surface.setPendingMode (AbstractDeviceFixedMode.FIXED_BANKS[this.page + 1]);
};

AbstractDeviceFixedMode.prototype.onValueKnob = function (index, value)
{
    var v = this.surface.changeValue (value, this.getParameterValues (index).value);
    this.getParameter (index).set (v, Config.maxParameterValue);
};

AbstractDeviceFixedMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
            this.getParameter (index).reset ();
            return;
        }

        var values = this.getParameterValues (index);
        if (values.name.length > 0)
            displayNotification (values.name + ": " + values.valueStr);
    }
    this.getParameter (index).touch (isTouched);
};

AbstractDeviceFixedMode.prototype.onFirstRowBank = function (index)
{
    var mode = AbstractDeviceFixedMode.FIXED_BANKS[index];
    if (mode != MODE_DEVICE_MODULATE)
        Config.setDefaultDeviceMode (mode);
    this.surface.setPendingMode (mode);
};

AbstractDeviceFixedMode.prototype.updateFirstRowBank = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (20 + i, i < AbstractDeviceFixedMode.FIXED_BANKS.length ? (this.page == i ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO) : PUSH_COLOR_BLACK);
};

AbstractDeviceFixedMode.prototype.updateParameters = function (d)
{
    for (var i = 0; i < 8; i++)
    {
        var values = this.getParameterValues (i);
        if (values.name.length > 0)
        {
            d.setCell (0, i, values.name, Display.FORMAT_RAW)
             .setCell (1, i, values.valueStr, Display.FORMAT_RAW);
        }
    }
};

AbstractDeviceFixedMode.prototype.updateBanks = function (d)
{
    for (var i = 0; i < AbstractDeviceFixedMode.FIXED_BANKS_NAMES.length; i++)
        d.setCell (3, i, (this.page == i ? Display.RIGHT_ARROW : "") + AbstractDeviceFixedMode.FIXED_BANKS_NAMES[i]);
};

AbstractDeviceFixedMode.prototype.calcBank = function ()
{
    return { pages: AbstractDeviceFixedMode.FIXED_BANKS_NAMES, page: this.page, offset: 0 };
};
