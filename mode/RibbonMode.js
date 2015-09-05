// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

RibbonMode.MIDI_CCS = [ 1, 11, 7, 64 ];

function RibbonMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_RIBBON;
}
RibbonMode.prototype = new BaseMode ();

RibbonMode.prototype.onFirstRow = function (index)
{
    if (index <= 4)
        Config.setRibbonMode (index);
    else if (index > 5)
        Config.setRibbonModeCC (RibbonMode.MIDI_CCS[index - 6]);
    else
        this.surface.setPendingMode (this.surface.getPreviousMode ());
};

RibbonMode.prototype.onSecondRow = function (index)
{
    if (index > 5)
        Config.setRibbonModeCC (RibbonMode.MIDI_CCS[index - 4]);
    else
        this.surface.setPendingMode (this.surface.getPreviousMode ());
};

RibbonMode.prototype.onValueKnob = function (index, value)
{
    if (index == 6)
        Config.setRibbonModeCC (changeValue (value, Config.ribbonModeCCVal, 1, 127));
};

RibbonMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    d.clear ()
     .setCell (0, 6, 'Midi CC')
     .setCell (1, 6, Config.ribbonModeCCVal.toString ())
     .setCell (2, 6, 'Modulatn')
     .setCell (2, 7, 'Expressn')
     .setCell (3, 0, (Config.ribbonMode == Config.RIBBON_MODE_PITCH ? Display.RIGHT_ARROW : '') + 'Pitchbd')
     .setCell (3, 1, (Config.ribbonMode == Config.RIBBON_MODE_CC ? Display.RIGHT_ARROW : '') + 'CC')
     .setCell (3, 2, (Config.ribbonMode == Config.RIBBON_MODE_CC_PB ? Display.RIGHT_ARROW : '') + 'CC/Pitch')
     .setCell (3, 3, (Config.ribbonMode == Config.RIBBON_MODE_PB_CC ? Display.RIGHT_ARROW : '') + 'Pitch/CC')
     .setCell (3, 4, (Config.ribbonMode == Config.RIBBON_MODE_FADER ? Display.RIGHT_ARROW : '') + 'Fader')
     .setCell (3, 6, 'Volume')
     .setCell (3, 7, 'Sustain')
     .allDone ();
};

RibbonMode.prototype.updateFirstRow = function ()
{
    for (var i = 0; i < 5; i++)
        this.surface.setButton (20 + i, Config.ribbonMode == Config.RIBBON_MODE_PITCH + i ? PUSH_COLOR_YELLOW_LO : PUSH_COLOR_GREEN_LO);
    this.surface.setButton (25, PUSH_COLOR_BLACK);
    for (var i = 6; i < 8; i++)
        this.surface.setButton (20 + i, PUSH_COLOR_YELLOW_LO);
};

RibbonMode.prototype.updateSecondRow = function ()
{
    for (var i = 0; i < 6; i++)
        this.surface.setButton (102 + i, PUSH_COLOR2_BLACK);
    for (var i = 6; i < 8; i++)
        this.surface.setButton (102 + i, PUSH_COLOR2_YELLOW_LO);
};
