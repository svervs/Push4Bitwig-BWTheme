// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

RibbonMode.MIDI_CCS = [ 1, 11, 7, 64 ];

function RibbonMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_RIBBON;
}
RibbonMode.prototype = new BaseMode ();

RibbonMode.prototype.onFirstRow = function (index)
{
    if (index < 3)
        Config.ribbonMode = index;
    else if (index > 3)
        Config.ribbonModeCCVal = RibbonMode.MIDI_CCS[index - 4];
    else
        this.surface.setPendingMode (this.surface.getPreviousMode ());
};

RibbonMode.prototype.onValueKnob = function (index, value)
{
    if (index == 4)
        Config.ribbonModeCCVal = changeValue (value, Config.ribbonModeCCVal, 1, 128);
};

RibbonMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    d.clearRow (0).clearRow (1).clearRow (2)
     .setCell (0, 4, 'Midi CC')
     .setCell (1, 4, Config.ribbonModeCCVal)
     .setCell (3, 0, (Config.ribbonMode == Config.RIBBON_MODE_PITCH ? Display.RIGHT_ARROW : ' ') + 'Pitchbd')
     .setCell (3, 1, (Config.ribbonMode == Config.RIBBON_MODE_CC ? Display.RIGHT_ARROW : ' ') + 'CC')
     .setCell (3, 2, (Config.ribbonMode == Config.RIBBON_MODE_MIXED ? Display.RIGHT_ARROW : ' ') + 'Mixed')
     .setCell (3, 3, ' Close')
     .setCell (3, 4, 'Modulatn').setCell (3, 5, 'Expressn').setCell (3, 6, 'Volume').setCell (3, 7, 'Sustain')
     .allDone ();
};

RibbonMode.prototype.updateFirstRow = function ()
{
    for (var i = 0; i < 3; i++)
        this.surface.setButton (20 + i, PUSH_COLOR_ORANGE_LO);
    this.surface.setButton (23, PUSH_COLOR_RED_LO);
    for (var i = 4; i < 8; i++)
        this.surface.setButton (20 + i, PUSH_COLOR_GREEN_LO);
};

RibbonMode.prototype.updateSecondRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (102 + i, PUSH_COLOR2_BLACK);
};
