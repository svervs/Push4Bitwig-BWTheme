// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

PanMode.PARAM_NAMES = 'Pan      Pan     Pan      Pan     Pan      Pan     Pan      Pan     ';

function PanMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_PAN;
}
PanMode.prototype = new AbstractTrackMode ();

PanMode.prototype.onValueKnob = function (index, value)
{
    this.model.getTrackBank ().changePan (index, value, this.surface.getFractionValue ());
};

// PanMode.prototype.onFirstRow = function (index) {};

// PanMode.prototype.onSecondRow = function (index) {};

PanMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    var tb = this.model.getTrackBank ();

    d.setRow (0, PanMode.PARAM_NAMES);

    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);
        d.setCell (1, i, t.panStr, Display.FORMAT_RAW)
         .setCell (2, i, t.pan, Display.FORMAT_PAN);
    }
    d.done (1).done (2);

    this.drawRow4 ();
};

// PanMode.prototype.updateFirstRow = function () {};

// PanMode.prototype.updateSecondRow = function () {};