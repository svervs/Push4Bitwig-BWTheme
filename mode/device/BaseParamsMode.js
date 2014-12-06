// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

BaseParamsMode.FIXED_BANKS_NAMES = [ 'Common', 'Envelope', 'Modulate', 'Macro', 'User' ];
BaseParamsMode.FIXED_BANKS = [ MODE_BANK_COMMON, MODE_BANK_ENVELOPE, MODE_BANK_MODULATE, MODE_BANK_MACRO, MODE_BANK_USER ];


function BaseParamsMode (model, mode)
{
    DeviceMode.call (this, model);
    this.id = mode;
    this.page = -1;
    for (var i = 0; i < BaseParamsMode.FIXED_BANKS.length; i++)
    {
        if (mode == BaseParamsMode.FIXED_BANKS[i])
        {
            this.page = i;
            break;
        }
    }
}
BaseParamsMode.prototype = new DeviceMode ();

BaseParamsMode.prototype.getParameterValues = function (index) {};
BaseParamsMode.prototype.getParameter= function (index) {};

BaseParamsMode.prototype.onValueKnob = function (index, value)
{
    var v = this.surface.changeValue (value, this.getParameterValues (index).value);
    this.getParameter (index).set (v, Config.maxParameterValue);
};

BaseParamsMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    if (isTouched && this.surface.isDeletePressed ())
    {
        this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
        this.getParameter (index).reset ();
    }
};

BaseParamsMode.prototype.onFirstRow = function (index)
{
    this.surface.setPendingMode (BaseParamsMode.FIXED_BANKS[index]);
};

BaseParamsMode.prototype.updateFirstRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (20 + i, i < BaseParamsMode.FIXED_BANKS_NAMES.length ? (this.page == i ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO) : PUSH_COLOR_BLACK);
};

BaseParamsMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    if (this.hasParams ())
    {
        for (var i = 0; i < 8; i++)
        {
            var values = this.getParameterValues (i);
            if (values.name.length == 0)
                d.clearCell (0, i).clearCell (1, i).clearCell (2, i);
            else
            {
                d.setCell (0, i, values.name, Display.FORMAT_RAW)
                 .setCell (1, i, values.valueStr, Display.FORMAT_RAW);
            }
        }
    }
    else
    {
        d.clearRow (0).clearRow (1);
        if (this.model.hasSelectedDevice ())
            d.setBlock (0, 1, d.padLeft ('No ' + BaseParamsMode.FIXED_BANKS_NAMES[this.page], 17, ' ')).setCell (0, 4, 'Assigned');
        else
            d.setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ');
    }
    if (this.model.hasSelectedDevice ())
    {
        d.setBlock (2, 0, 'Selected Device: ', Display.FORMAT_RAW)
         .setBlock (2, 1, this.model.getSelectedDevice ().name)
         .clearBlock (2, 2)
         .clearBlock (2, 3);
    }
    else
        d.clearRow (2);

    d.clearRow (3);
    for (var i = 0; i < BaseParamsMode.FIXED_BANKS_NAMES.length; i++)
        d.setCell (3, i, (this.page == i ? Display.RIGHT_ARROW : "") + BaseParamsMode.FIXED_BANKS_NAMES[i]);

    d.allDone ();
};

BaseParamsMode.prototype.hasParams = function ()
{
    for (var i = 0; i < 8; i++)
    {
        if (this.getParameterValues (i).name.length != 0)
            return true;
    }
    return false;
};
