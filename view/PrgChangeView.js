// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

PrgChangeView.GREENS = [ PUSH_COLOR2_GREEN_HI, PUSH_COLOR2_GREEN, PUSH_COLOR2_GREEN_LO, PUSH_COLOR2_GREEN_SPRING, PUSH_COLOR2_GREEN_HI, PUSH_COLOR2_GREEN, PUSH_COLOR2_GREEN_LO, PUSH_COLOR2_GREEN_SPRING ];
PrgChangeView.YELLOWS = [ PUSH_COLOR2_YELLOW_HI, PUSH_COLOR2_YELLOW, PUSH_COLOR2_YELLOW_LO, PUSH_COLOR2_YELLOW_LIME, PUSH_COLOR2_YELLOW_HI, PUSH_COLOR2_YELLOW, PUSH_COLOR2_YELLOW_LO, PUSH_COLOR2_YELLOW_LIME ];


function PrgChangeView (model)
{
    if (model == null)
        return;
    
    AbstractView.call (this, model);

    this.bankNumber = 0;
    this.programNumber = -1;
    this.isToggled = false;
}
PrgChangeView.prototype = new AbstractView ();

PrgChangeView.prototype.onActivate = function ()
{
    AbstractView.prototype.onActivate.call (this);

    this.noteMap = this.model.getScales ().getEmptyMatrix ();
    this.surface.setKeyTranslationTable (this.noteMap);
    
    this.surface.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_HI);
    this.surface.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    
    this.drawSceneButtons ();
};

PrgChangeView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case PUSH_BUTTON_REPEAT:
        case PUSH_BUTTON_OCTAVE_UP:
        case PUSH_BUTTON_OCTAVE_DOWN:
            return false;
    }
    return true;
};

PrgChangeView.prototype.onScene = function (index)
{
    var newBank = index;
    if (newBank == this.bankNumber)
        this.isToggled = !this.isToggled;
    else
    {
        this.bankNumber = newBank;
        this.isToggled = false;
        this.surface.sendMidiEvent (0xB0, 32, this.bankNumber);
        // Forces the bank change
        if (this.programNumber != -1)
            this.surface.sendMidiEvent (0xC0, this.programNumber, 0);
    }
    this.drawSceneButtons ();
};

PrgChangeView.prototype.drawSceneButtons = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (PUSH_BUTTON_SCENE1 + i, this.bankNumber == (7 - i) ? (this.isToggled ? PUSH_COLOR_SCENE_YELLOW : PUSH_COLOR_SCENE_GREEN) : PUSH_COLOR_BLACK);
};

PrgChangeView.prototype.onPitchbend = function (data1, data2)
{
    // Not used
};

PrgChangeView.prototype.drawGrid = function ()
{
    var colors = this.isToggled ? PrgChangeView.YELLOWS : PrgChangeView.GREENS;
    var selPad = this.isToggled ? (this.programNumber >= 64 ? this.programNumber - 64 : -1) :
                                  (this.programNumber < 64 ? this.programNumber : -1);
    for (var i = 36; i < 100; i++)
    {
        var pad = i - 36;
        var row = Math.floor (pad / 8);
        this.surface.pads.light (i, selPad == pad ? PUSH_COLOR2_RED : colors[row], null, false);
    }
};

PrgChangeView.prototype.onGridNote = function (note, velocity)
{
    this.programNumber = note - 36 + (this.isToggled ? 64 : 0);
    this.surface.sendMidiEvent (0xC0, this.programNumber, 0);
};

PrgChangeView.prototype.scrollUp = function (event)
{
    this.isToggled = false;
    this.drawSceneButtons ();
};

PrgChangeView.prototype.scrollDown = function (event)
{
    this.isToggled = true;
    this.drawSceneButtons ();
};
