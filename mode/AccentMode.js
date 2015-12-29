// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function AccentMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_ACCENT;
}
AccentMode.prototype = new BaseMode ();

AccentMode.prototype.onValueKnob = function (index, value)
{
    // Will never need fine increments on accent velocity since they are integers
    var accent = Math.max (1, changeValue (value, Config.fixedAccentValue, 1, 128));
    Config.setAccentValue (accent);
};

AccentMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    this.isKnobTouched[index] = isTouched;
};

AccentMode.prototype.updateDisplay = function () 
{
    var d = this.surface.getDisplay ();

    if (Config.isPush2)
    {
        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
        for (var i = 0; i < 8; i++)
        {
            message.addByte (DisplayMessage.GRID_ELEMENT_PARAMETERS);
            
            // The menu item
            message.addString ("");
            message.addBoolean (false);

            message.addString ("");
            message.addString ("");
            message.addColor (0);
            message.addBoolean (false);

            message.addString (i == 7 ? "Accent" : "");
            message.addInteger (i == 7 ? Config.toDAWValue (Config.fixedAccentValue) : 0);
            message.addString (i == 7 ? "" + Config.fixedAccentValue : "");
            message.addBoolean (this.isKnobTouched[i]);
        }
        message.send ();
    }
    else
    {
       d.clear ()
        .setCell (0, 7, "Accent", Display.FORMAT_RAW)
        .setCell (1, 7, Config.fixedAccentValue, Display.FORMAT_RAW)
        .setCell (2, 7, Config.toDAWValue (Config.fixedAccentValue), Display.FORMAT_VALUE)
        .allDone ();
    }
};
