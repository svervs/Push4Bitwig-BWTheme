// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function Controller ()
{
	var output = new MidiOutput ();
	var input = new MidiInput ();

	this.push = new Push (output, input);
	this.push.init ();
	this.push.setActiveView (VIEW_PLAY);
	this.push.setActiveMode (MODE_TRACK);
    
    // model must be moved from push to Controller
    this.push.getModel ().getTrackBank ().addTrackSelectionListener (doObject (this.push, function (index, isSelected)
    {
        if (isSelected && this.isActiveMode (MODE_MASTER))
            this.setPendingMode (MODE_TRACK);
        if (this.isActiveView (VIEW_PLAY))
            this.getActiveView ().updateNoteMapping ();
    }));
    
    this.push.model.getMasterTrack ().addTrackSelectionListener (doObject (this.push, function (isSelected)
    {
		this.setPendingMode (isSelected ? MODE_MASTER : this.getPreviousMode ());
    }));
}

Controller.prototype.shutdown = function ()
{
	this.push.turnOff ();
};

Controller.prototype.flush = function ()
{
	this.push.flush ();
    
    var t = this.push.getModel ().getTransport ();
    this.push.setButton (PUSH_BUTTON_CLICK, t.isClickOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.push.setButton (PUSH_BUTTON_PLAY, t.isPlaying ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.push.setButton (PUSH_BUTTON_RECORD, t.isRecording ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};