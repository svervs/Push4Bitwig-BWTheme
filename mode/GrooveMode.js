// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function GrooveMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_GROOVE;
}
GrooveMode.prototype = new BaseMode ();

GrooveMode.prototype.onValueKnob = function (index, value)
{
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

GrooveMode.prototype.onSecondRow = function (index) {};

GrooveMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    var g = this.model.getGroove ();;

    d.clear ();

    var kinds = GrooveValue.Kind.values ();
    for (var i = 0; i < kinds.length; i++)
    {
        var v = g.getValue (i);
        d.setCell (0, i, v.name, Display.FORMAT_RAW)
         .setCell (1, i, v.valueString, Display.FORMAT_RAW)
         .setCell (2, i, v.value, Display.FORMAT_VALUE);
    }

    d.setBlock (3, 0, "Global Groove:")
     .setCell (3, 7, g.isEnabled () ? 'Enabled' : 'Disabled')
     .allDone ();
};

GrooveMode.prototype.updateFirstRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (20 + i, PUSH_COLOR_BLACK);

    var g = this.model.getGroove ();
    this.surface.setButton (27, g.isEnabled () ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLACK);
};

GrooveMode.prototype.updateSecondRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (102 + i, PUSH_COLOR2_BLACK);
};