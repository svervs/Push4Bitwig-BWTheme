// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

PanMode.PARAM_NAMES = 'Pan      Pan     Pan      Pan     Pan      Pan     Pan      Pan     ';


function PanMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_PAN;
}
PanMode.prototype = new AbstractTrackMode ();

PanMode.prototype.onValueKnob = function (index, value)
{
    this.model.getTrackBank ().setPan (index, value, this.push.getFractionValue ());
};

PanMode.prototype.updateDisplay = function ()
{
    this.drawTrackNames ();

    var d = this.push.display;
    var tb = this.model.getTrackBank ();
    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);
        d.setCell (1, i, t.panStr, Display.FORMAT_RAW)
         .setCell (2, i, t.pan, Display.FORMAT_PAN);
    }
    d.setRow (0, PanMode.PARAM_NAMES).done (1).done (2);
};
