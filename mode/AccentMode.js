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
    // will never need fine increments on accent velocity since they are integers
    var v = changeValue (value, Config.fixedAccentValue, 1, Config.maxParameterValue);
    Config.setAccentValue (v == 0 ? 1 : v);
};

AccentMode.prototype.onFirstRow = function (index) {};

AccentMode.prototype.onSecondRow = function (index) {};

AccentMode.prototype.updateDisplay = function () 
{
    this.push.display.clear ()
        .setCell (0, 7, "Accent", Display.FORMAT_RAW)
        .setCell (1, 7, Config.fixedAccentValue, Display.FORMAT_RAW)
        .setCell (2, 7, Config.fixedAccentValue, Display.FORMAT_VALUE)
        .allDone ();
};

AccentMode.prototype.updateFirstRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.push.setButton (20 + i, PUSH_COLOR_BLACK);
};

AccentMode.prototype.updateSecondRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.push.setButton (102 + i, PUSH_COLOR2_BLACK);
};
