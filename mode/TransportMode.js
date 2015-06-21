// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function TransportMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_TRANSPORT;
}
TransportMode.prototype = new BaseMode ();

TransportMode.prototype.onValueKnob = function (index, value)
{
    /* Deactivated knobs to prevent accidental changes when using the small knobs
    var increase = value <= 61;
    if (index == 0)
        this.model.getTransport ().changeTempo (increase, this.surface.isShiftPressed ());
    else if (index > 5)
        this.model.getTransport ().changePosition (increase, this.surface.isShiftPressed ());
    */
};

TransportMode.prototype.updateDisplay = function () 
{
    var transport = this.model.getTransport ();
    this.surface.getDisplay ().clear ()
        .setCell (0, 0, "Tempo", Display.FORMAT_RAW)
        .setCell (1, 0, transport.getTempo (), Display.FORMAT_RAW)
        .setCell (2, 0, this.formatTempo (transport.getTempo ()), Display.FORMAT_RAW)
        .setBlock (0, 3, "Play Position", Display.FORMAT_RAW)
        .setBlock (1, 3, transport.getPositionText (), Display.FORMAT_RAW)
        .allDone ();
};

TransportMode.prototype.formatTempo = function (value)
{
    value = value - 20;
    var noOfBars = Math.round (16 * value / 646);
    var n = '';
    for (var j = 0; j < Math.floor (noOfBars / 2); j++)
        n += Display.BARS_TWO;
    if (noOfBars % 2 == 1)
        n += Display.BARS_ONE;
    return this.surface.getDisplay ().pad (n, 8, Display.BARS_NON);
};
