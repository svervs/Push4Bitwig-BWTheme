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

TransportMode.prototype.onFirstRow = function (index)
{
    if (index == 2)
        this.model.getTransport ().setPreroll (TransportProxy.PREROLL_NONE);
    else if (index == 3)
        this.model.getTransport ().setPreroll (TransportProxy.PREROLL_2_BARS);
    else if (index == 5)
        this.model.getTransport ().togglePrerollClick ();
};

TransportMode.prototype.onSecondRow = function (index)
{
    if (index == 2)
        this.model.getTransport ().setPreroll (TransportProxy.PREROLL_1_BAR);
    else if (index == 3)
        this.model.getTransport ().setPreroll (TransportProxy.PREROLL_4_BARS);
};

TransportMode.prototype.updateFirstRow = function ()
{
    var transport = this.model.getTransport ();
    var preroll = transport.getPreroll ();
    this.surface.setButton (20, PUSH_COLOR_BLACK);
    this.surface.setButton (21, PUSH_COLOR_BLACK);
    this.surface.setButton (22, preroll == TransportProxy.PREROLL_NONE ? PUSH_COLOR_YELLOW_LO : PUSH_COLOR_GREEN_LO);
    this.surface.setButton (23, preroll == TransportProxy.PREROLL_2_BARS ? PUSH_COLOR_YELLOW_LO : PUSH_COLOR_GREEN_LO);
    this.surface.setButton (24, PUSH_COLOR_BLACK);
    this.surface.setButton (25, transport.isPrerollClickEnabled () ? PUSH_COLOR_YELLOW_LO : PUSH_COLOR_GREEN_LO);
    this.surface.setButton (26, PUSH_COLOR_BLACK);
    this.surface.setButton (27, PUSH_COLOR_BLACK);
};

TransportMode.prototype.updateSecondRow = function ()
{
    var transport = this.model.getTransport ();
    var preroll = transport.getPreroll ();
    this.surface.setButton (102, PUSH_COLOR2_BLACK);
    this.surface.setButton (103, PUSH_COLOR2_BLACK);
    this.surface.setButton (104, preroll == TransportProxy.PREROLL_1_BAR ? PUSH_COLOR2_YELLOW_LO : PUSH_COLOR2_GREEN_LO);
    this.surface.setButton (105, preroll == TransportProxy.PREROLL_4_BARS ? PUSH_COLOR2_YELLOW_LO : PUSH_COLOR2_GREEN_LO);
    this.surface.setButton (106, PUSH_COLOR2_BLACK);
    this.surface.setButton (107, PUSH_COLOR2_BLACK);
    this.surface.setButton (108, PUSH_COLOR2_BLACK);
    this.surface.setButton (109, PUSH_COLOR2_BLACK);
};

TransportMode.prototype.updateDisplay = function () 
{
    var transport = this.model.getTransport ();
    var preroll = transport.getPreroll ();
    this.surface.getDisplay ().clear ()
        .setCell (0, 0, "Tempo", Display.FORMAT_RAW)
        .setCell (1, 0, transport.getTempo (), Display.FORMAT_RAW)
        .setCell (2, 0, this.formatTempo (transport.getTempo ()), Display.FORMAT_RAW)
        .setCell (0, 2, "Pre-Roll", Display.FORMAT_RAW)
        .setCell (2, 2, (preroll == TransportProxy.PREROLL_NONE ? Display.RIGHT_ARROW : " ") + "None", Display.FORMAT_RAW)
        .setCell (3, 2, (preroll == TransportProxy.PREROLL_1_BAR ? Display.RIGHT_ARROW : " ") + "1 Bar", Display.FORMAT_RAW)
        .setCell (2, 3, (preroll == TransportProxy.PREROLL_2_BARS ? Display.RIGHT_ARROW : " ") + "2 Bars", Display.FORMAT_RAW)
        .setCell (3, 3, (preroll == TransportProxy.PREROLL_4_BARS ? Display.RIGHT_ARROW : " ") + "4 Bars", Display.FORMAT_RAW)
        .setBlock (0, 2, "Play Metronome", Display.FORMAT_RAW)
        .setBlock (1, 2, "during Pre-Roll?", Display.FORMAT_RAW)
        .setCell (3, 5, transport.isPrerollClickEnabled () ? "  Yes" : "  No", Display.FORMAT_RAW)
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
