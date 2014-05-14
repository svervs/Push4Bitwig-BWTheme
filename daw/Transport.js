// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

Transport.INC_FRACTION_TIME      = 1.0;	    // 1 beat
Transport.INC_FRACTION_TIME_SLOW = 1.0 / 20;	// 1/20th of a beat
Transport.TEMPO_RESOLUTION       = 647;


function Transport (push)
{
	this.push = push;
	this.transport = host.createTransport ();
	this.isRecording = false;
	
	// Note: For real BPM add 20
	this.setInternalTempo (100);

	this.transport.addClickObserver (doObject (this, function (isOn)
	{
		this.push.setButton (PUSH_BUTTON_CLICK, isOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	}));
	// Play
	this.transport.addIsPlayingObserver (doObject (this, function (isPlaying)
	{
		this.push.setButton (PUSH_BUTTON_PLAY, isPlaying ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	}));
	// Record
	this.transport.addIsRecordingObserver (doObject (this, function (isRec)
	{
		this.isRecording = isRec;
		this.push.setButton (PUSH_BUTTON_RECORD, isRec ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	}));
	// Tempo
	this.transport.getTempo ().addValueObserver (Transport.TEMPO_RESOLUTION, doObject (this, function (value)
	{
		this.setInternalTempo (value);
	}));
}

Transport.prototype.play = function      ()
{
	this.transport.play ();
};

Transport.prototype.record = function      ()
{
	this.transport.record ();
};

Transport.prototype.toggleLoop = function ()
{
	this.transport.toggleLoop ();
};

Transport.prototype.toggleClick = function ()
{
	this.transport.toggleClick ();
};

Transport.prototype.toggleClipOverdub = function ()
{
	this.transport.toggleLauncherOverdub ();
};

Transport.prototype.toggleWriteArrangerAutomation = function ()
{
	this.transport.toggleWriteArrangerAutomation ();
};

Transport.prototype.changePosition = function (increase, slow)
{
	var frac = slow ? Transport.INC_FRACTION_TIME_SLOW : Transport.INC_FRACTION_TIME;
	this.transport.incPosition (increase ? frac : -frac, false);			
};

Transport.prototype.changeTempo = function (increase)
{
	this.tempo = increase ? Math.min (this.tempo + 1, Transport.TEMPO_RESOLUTION) : Math.max (0, this.tempo - 1);
	this.transport.getTempo ().set (this.tempo, Transport.TEMPO_RESOLUTION);
};

Transport.prototype.setTempo = function (bpm)
{
	this.transport.getTempo ().set (Math.min (Math.max (0, bpm - 20), Transport.TEMPO_RESOLUTION), Transport.TEMPO_RESOLUTION);
};

Transport.prototype.setTempoIndication = function (isTouched)
{
	this.transport.getTempo ().setIndication (isTouched);
};

Transport.prototype.setLauncherOverdub = function (on)
{
	// Note: This is a bug: On and off are switched
	this.transport.setLauncherOverdub (!on);
};

Transport.prototype.setInternalTempo = function (t)
{
	this.tempo = t;
	this.quarterNoteInMillis = 60000 / (t + 20);
}
