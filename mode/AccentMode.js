// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function AccentMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_ACCENT;
}
AccentMode.prototype = new BaseMode ();

AccentMode.prototype.onValueKnob = function (index, value)
{
    var v = changeValue (value, Config.fixedAccentValue);
    Config.setAccentValue (v == 0 ? 1 : v);
};

AccentMode.prototype.updateDisplay = function () 
{
    this.push.display.clear ()
        .setCell (0, 7, "Accent", Display.FORMAT_RAW)
        .setCell (1, 7, Config.fixedAccentValue, Display.FORMAT_RAW)
        .setCell (2, 7, Config.fixedAccentValue, Display.FORMAT_VALUE)
        .allDone ();
};
