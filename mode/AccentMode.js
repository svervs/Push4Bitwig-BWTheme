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

AccentMode.prototype.updateDisplay = function () 
{
    this.surface.getDisplay ().clear ()
        .setCell (0, 7, "Accent", Display.FORMAT_RAW)
        .setCell (1, 7, Config.fixedAccentValue, Display.FORMAT_RAW)
        .setCell (2, 7, Config.toDAWValue (Config.fixedAccentValue), Display.FORMAT_VALUE)
        .allDone ();
};
