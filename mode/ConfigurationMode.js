// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ConfigurationMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_CONFIGURATION;
}
ConfigurationMode.prototype = new BaseMode ();

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
    d.clear ()
     .setBlock (0, 0, "Pad Threshold", Display.FORMAT_RAW)
     .setBlock (1, 0, this.surface.getSelectedPadThreshold (), Display.FORMAT_RAW)
     .setBlock (0, 1, "Velocity Curve", Display.FORMAT_RAW)
     .setBlock (1, 1, this.surface.getSelectedVelocityCurve (), Display.FORMAT_RAW)
     .allDone ();
    if (Config.padThreshold < 20)
        d.setRow (3, PUSH_LOW_THRESHOLD_WARNING);
};
