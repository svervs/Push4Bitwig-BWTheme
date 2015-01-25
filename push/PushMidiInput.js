// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PushMidiInput ()
{
    MidiInput.call (this);
}

PushMidiInput.prototype = new MidiInput();

PushMidiInput.prototype.createNoteInput = function ()
{
    var noteInput = this.port.createNoteInput ("Ableton Push", 
                                               "80????",  // Note off
                                               "90????",  // Note on
                                               "A0????",  // Poly Aftertouch
                                               "B040??"); // Sustainpedal
    noteInput.setShouldConsumeEvents (false);
    return noteInput;
};
