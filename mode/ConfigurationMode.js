// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ConfigurationMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_CONFIGURATION;
}
ConfigurationMode.prototype = new BaseMode ();

ConfigurationMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    this.isKnobTouched[index] = isTouched;
};

ConfigurationMode.prototype.onValueKnob = function (index, value)
{
    var increase = value <= 61;
    if (index == 0 || index == 1)
        this.surface.changePadThreshold (increase);
    else if (index == 2 || index == 3)
        this.surface.changeVelocityCurve (increase);
};

ConfigurationMode.prototype.updateDisplay = function () 
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

            if (i == 0)
            {
                message.addString ("Pad Threshold");
                message.addInteger (-1);
                message.addString ( this.surface.getSelectedPadThreshold ());
            }
            else if (i == 2)
            {
                message.addString ("Velocity Curve");
                message.addInteger (-1);
                message.addString ( this.surface.getSelectedVelocityCurve ());
            }
            else
            {
                message.addString ("");
                message.addInteger (-1);
                message.addString ( "");
            }
            message.addBoolean (this.isKnobTouched[i]);
        }
        message.send ();
    }
    else
    {
        d.clear ()
         .setBlock (0, 0, "Pad Threshold", Display.FORMAT_RAW)
         .setBlock (1, 0, this.surface.getSelectedPadThreshold (), Display.FORMAT_RAW)
         .setBlock (0, 1, "Velocity Curve", Display.FORMAT_RAW)
         .setBlock (1, 1, this.surface.getSelectedVelocityCurve (), Display.FORMAT_RAW)
         .allDone ();
        if (Config.padThreshold < 20)
            d.setRow (3, PUSH_LOW_THRESHOLD_WARNING);
    }
};
