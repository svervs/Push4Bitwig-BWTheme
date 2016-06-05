// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PianoView (model)
{
    PlayView.call (this, model);
}
PianoView.prototype = new PlayView ();

PianoView.prototype.drawGrid = function ()
{
    // Also update the value of the ribbon
    this.updateRibbonMode ();
    
    if (!this.model.canSelectedTrackHoldNotes ())
    {
        this.surface.pads.turnOff ();
        return;
    }
    
    var isRecording = this.model.hasRecordingState ();
    for (var i = 0; i < 8; i++)
    {
        if (i % 2 == 0)
        {
            for (var j = 0; j < 8; j++)
            {
                var n = 36 + 8 * i + j;
                this.surface.pads.light (n, this.pressedKeys[n] > 0 ? (isRecording ? PUSH_COLOR2_RED_HI : PUSH_COLOR2_GREEN_HI) : PUSH_COLOR2_WHITE);
            }
        }
        else
        {
            for (var j = 0; j < 8; j++)
            {
                var n = 36 + 8 * i + j;
                if (j == 0 || j == 3 || j == 7)
                    this.surface.pads.light (n, PUSH_COLOR2_BLACK);
                else
                    this.surface.pads.light (n, this.pressedKeys[n] > 0 ? (isRecording ? PUSH_COLOR2_RED_HI : PUSH_COLOR2_GREEN_HI) : PUSH_COLOR2_GREY_LO);
            }
        }
    }
};

PianoView.prototype.onGridNote = function (note, velocity)
{
    if (!this.model.canSelectedTrackHoldNotes () || this.noteMap[note] == -1)
        return;

    // Mark selected notes
    for (var i = 0; i < 128; i++)
    {
        if (this.noteMap[note] == this.noteMap[i])
            this.pressedKeys[i] = velocity;
    }
};

PianoView.prototype.onOctaveDown = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.decPianoOctave ();
    this.updateNoteMapping ();
    this.surface.getDisplay ().showNotification ('        ' + this.scales.getPianoRangeText ());
};

PianoView.prototype.onOctaveUp = function (event)
{
    if (!event.isDown ())
        return;
    this.clearPressedKeys ();
    this.scales.incPianoOctave ();
    this.updateNoteMapping ();
    this.surface.getDisplay ().showNotification ('        ' + this.scales.getPianoRangeText ());
};

PianoView.prototype.updateNoteMapping = function ()
{
    // Workaround: https://github.com/git-moss/Push4Bitwig/issues/7
    scheduleTask (doObject (this, PianoView.prototype.delayedUpdateNoteMapping), null, 100);
};

PianoView.prototype.delayedUpdateNoteMapping = function ()
{
    this.noteMap = this.model.canSelectedTrackHoldNotes () ? this.scales.getPianoMatrix () : this.scales.getEmptyMatrix ();
    this.surface.setKeyTranslationTable (this.noteMap);
};
