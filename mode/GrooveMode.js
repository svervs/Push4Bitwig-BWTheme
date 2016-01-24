// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function GrooveMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_GROOVE;
}
GrooveMode.prototype = new BaseMode ();

GrooveMode.prototype.onValueKnob = function (index, value)
{
    if (index >= GrooveValue.Kind.values ().length)
        return;
    var v = this.model.getGroove ().getValue (index);
    v.value = this.surface.changeValue (value, v.value);
    this.model.getGroove ().getRangedValue (index).set (v.value, Config.maxParameterValue);
};

GrooveMode.prototype.onFirstRow = function (index)
{
    switch (index)
    {
        case 7:
            this.model.getGroove ().toggleEnabled ();
            break;
    }
};

GrooveMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    var groove = this.model.getGroove ();

    if (Config.isPush2)
    {
        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
        var length = GrooveValue.Kind.values ().length;
        for (var i = 0; i < length; i++)
        {
            message.addByte (DisplayMessage.GRID_ELEMENT_PARAMETERS);
            message.addString ("");
            message.addBoolean (false);
            message.addString ("");
            message.addString ("");
            message.addColor (0);
            message.addBoolean (false);
            
            var v = groove.getValue (i);
            message.addString (v.name);
            message.addInteger (v.value);
            message.addString (v.valueString);
            message.addBoolean (this.isKnobTouched[i]);
        }
        
        for (var i = length; i < 8; i++)
        {
            message.addOptionElement ("", "", false, i == 6 ? "Global Groove" : "", 
                                      i == 7 ? (groove.isEnabled () ? 'Enabled' : 'Disabled') : "", 
                                      i == 7 ? groove.isEnabled () : false);
        }
        
        message.send ();
    }
    else
    {
        d.clear ();
        for (var i = 0; i < GrooveValue.Kind.values ().length; i++)
        {
            var v = groove.getValue (i);
            d.setCell (0, i, v.name, Display.FORMAT_RAW)
             .setCell (1, i, v.valueString, Display.FORMAT_RAW)
             .setCell (2, i, v.value, Display.FORMAT_VALUE);
        }
        d.setBlock (2, 3, "Global Groove:")
         .setCell (3, 7, groove.isEnabled () ? 'Enabled' : 'Disabled')
         .allDone ();
    }
};

GrooveMode.prototype.updateFirstRow = function ()
{
    this.disableFirstRow ();

    var g = this.model.getGroove ();
    this.surface.updateButton (27, g.isEnabled () ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
};
