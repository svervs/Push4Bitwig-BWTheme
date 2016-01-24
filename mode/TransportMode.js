// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function TransportMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_TRANSPORT;
}
TransportMode.prototype = new BaseMode ();

TransportMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    this.isKnobTouched[index] = isTouched;
};

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
    this.surface.updateButton (20, PUSH_COLOR_BLACK);
    this.surface.updateButton (21, PUSH_COLOR_BLACK);
    this.surface.updateButton (22, preroll == TransportProxy.PREROLL_NONE ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    this.surface.updateButton (23, preroll == TransportProxy.PREROLL_2_BARS ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    this.surface.updateButton (24, PUSH_COLOR_BLACK);
    this.surface.updateButton (25, transport.isPrerollClickEnabled () ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    this.surface.updateButton (26, PUSH_COLOR_BLACK);
    this.surface.updateButton (27, PUSH_COLOR_BLACK);
};

TransportMode.prototype.updateSecondRow = function ()
{
    var transport = this.model.getTransport ();
    var preroll = transport.getPreroll ();
    this.surface.updateButton (102, PUSH_COLOR2_BLACK);
    this.surface.updateButton (103, PUSH_COLOR2_BLACK);
    this.surface.updateButton (104, preroll == TransportProxy.PREROLL_1_BAR ? AbstractMode.BUTTON_COLOR2_HI : AbstractMode.BUTTON_COLOR2_ON);
    this.surface.updateButton (105, preroll == TransportProxy.PREROLL_4_BARS ? AbstractMode.BUTTON_COLOR2_HI : AbstractMode.BUTTON_COLOR2_ON);
    this.surface.updateButton (106, PUSH_COLOR2_BLACK);
    this.surface.updateButton (107, PUSH_COLOR2_BLACK);
    this.surface.updateButton (108, PUSH_COLOR2_BLACK);
    this.surface.updateButton (109, PUSH_COLOR2_BLACK);
};

TransportMode.prototype.updateDisplay = function () 
{
    var transport = this.model.getTransport ();
    var preroll = transport.getPreroll ();
    var d = this.surface.getDisplay ();
    
    if (Config.isPush2)
    {
        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
        
        message.addByte (DisplayMessage.GRID_ELEMENT_PARAMETERS);
        message.addString ("");
        message.addBoolean (false);
        message.addString ("");
        message.addString ("");
        message.addColor (0);
        message.addBoolean (false);
        message.addString ("Tempo");
        var tempo = transport.getTempo ();
        message.addInteger (this.convertTempo (tempo));
        message.addString ( this.formatTempo (tempo));
        message.addBoolean (this.isKnobTouched[0]);

        message.addOptionElement ("", "", false, "", "", false); 
        message.addOptionElement ("Pre-", "1 Bar", preroll == TransportProxy.PREROLL_1_BAR, "Roll", "None", preroll == TransportProxy.PREROLL_NONE);
        message.addOptionElement ("", "4 Bars", preroll == TransportProxy.PREROLL_4_BARS, "", "2 Bars", preroll == TransportProxy.PREROLL_2_BARS);
        message.addOptionElement ("          Play Metronome", "", false, "          during Pre-Roll?", "", false);
        message.addOptionElement ("", "", false, "", transport.isPrerollClickEnabled () ? "Yes" : "No", transport.isPrerollClickEnabled ());
        message.addOptionElement ("        Play Position", "", false, "        " + transport.getPositionText (), "", false);
        message.addOptionElement ("", "", false, "", "", false); 
        
        message.send ();
    }
    else
    {
        d.clear ()
         .setCell (0, 0, "Tempo", Display.FORMAT_RAW)
         .setCell (1, 0, transport.getTempo (), Display.FORMAT_RAW)
         .setCell (2, 0, this.formatTempoBars (transport.getTempo ()), Display.FORMAT_RAW)
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
    }
};

TransportMode.prototype.formatTempoBars = function (value)
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

TransportMode.prototype.convertTempo = function (value)
{
    value = value - 20;
    return value * (Config.maxParameterValue - 1) / 646;
};

TransportMode.prototype.formatTempo = function (tempo)
{
    return "" + tempo.toFixed(2);
};
