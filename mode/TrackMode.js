// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

TrackMode.PARAM_NAMES = 'Volume   Pan     Send 1   Send 2  Send 3   Send 4  Send 5   Send 6  ';
TrackMode.COLORS =
[
	[ 0.3294117748737335 , 0.3294117748737335 , 0.3294117748737335 , 1],	// Dark Gray
	[ 0.47843137383461   , 0.47843137383461   , 0.47843137383461   , 2],	// Gray
	[ 0.7882353067398071 , 0.7882353067398071 , 0.7882353067398071 , 3],	// Light Gray
	[ 0.5254902243614197 , 0.5372549295425415 , 0.6745098233222961 , 40], 	// Silver
	[ 0.6392157077789307 , 0.4745098054409027 , 0.26274511218070984, 11],	// Dark Brown
	[ 0.7764706015586853 , 0.6235294342041016 , 0.43921568989753723, 12],	// Brown
	[ 0.34117648005485535, 0.3803921639919281 , 0.7764706015586853 , 42],	// Dark Blue
	[ 0.5176470875740051 , 0.5411764979362488 , 0.8784313797950745 , 44],	// Light Blue
	[ 0.5843137502670288 , 0.2862745225429535 , 0.7960784435272217 , 58],	// Purple
	[ 0.8509804010391235 , 0.21960784494876862, 0.4431372582912445 , 57],	// Pink
	[ 0.8509804010391235 , 0.18039216101169586, 0.1411764770746231 , 6],	// Red
	[ 1                  , 0.34117648005485535, 0.0235294122248888 , 60],	// Orange
	[ 0.8509804010391235 , 0.615686297416687  , 0.062745101749897  , 62],	// Light Orange
	[ 0.45098039507865906, 0.5960784554481506 , 0.0784313753247261 , 18],	// Green
	[ 0                  , 0.615686297416687  , 0.27843138575553894, 26],	// Cold Green
	[ 0                  , 0.6509804129600525 , 0.5803921818733215 , 30],	// Bluish Green
	[ 0                  , 0.6000000238418579 , 0.8509804010391235 , 37],	// Light Blue
	[ 0.7372549176216125 , 0.4627451002597809 , 0.9411764740943909 , 48],	// Light Purple
	[ 0.8823529481887817 , 0.4000000059604645 , 0.5686274766921997 , 56],	// Light Pink
	[ 0.9254902005195618 , 0.3803921639919281 , 0.34117648005485535, 4],	// Skin
	[ 1                  , 0.5137255191802979 , 0.24313725531101227, 10],	// Redish Brown
	[ 0.8941176533699036 , 0.7176470756530762 , 0.30588236451148987, 61],	// Light Brown
	[ 0.6274510025978088 , 0.7529411911964417 , 0.2980392277240753 , 18],	// Light Green
	[ 0.24313725531101227, 0.7333333492279053 , 0.3843137323856354 , 25],	// Bluish Green
	[ 0.26274511218070984, 0.8235294222831726 , 0.7254902124404907 , 32],	// Light Blue
	[ 0.2666666805744171 , 0.7843137383460999 , 1                  , 41]	// Blue
];


function TrackMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_TRACK;
}
TrackMode.prototype = new BaseMode ();

TrackMode.prototype.attachTo = function (push) 
{
	BaseMode.prototype.attachTo.call (this, push);
};

TrackMode.prototype.onValueKnob = function (index, value)
{
	var selectedTrack = this.model.getTrackBank ().getSelectedTrack ();
	if (selectedTrack == null)
		return;
	// TODO FIX trackBank
	var t = this.model.getTrackBank ().trackBank.getTrack (selectedTrack.index);
	if (index == 0)
	{
		// Volume
		selectedTrack.volume = this.changeValue (value, selectedTrack.volume);
		t.getVolume ().set (selectedTrack.volume, 128);
	}
	else if (index == 1)
	{
		// Pan
		selectedTrack.pan = this.changeValue (value, selectedTrack.pan);
		t.getPan ().set (selectedTrack.pan, 128);
	}
	else
	{
		// Send 1-6 Volume
		var sel = index - 2;
		var send = selectedTrack.sends[sel];
		send.volume = this.changeValue (value, send.volume);
		t.getSend (send.index).set (send.volume, 128);
	}
};

TrackMode.prototype.updateDisplay = function ()
{
	var t = this.model.getTrackBank ().getSelectedTrack ();
	var d = this.push.display;
	
	d.setRow (0, TrackMode.PARAM_NAMES);
	if (t == null)
		d.clearRow (1).done (1).clearRow (2).done (2);
	else
	{
		d.setCell (1, 0, t.volumeStr, Display.FORMAT_RAW)
		 .setCell (1, 1, t.panStr, Display.FORMAT_RAW)
		 .setCell (1, 2, t.sends[0].volumeStr, Display.FORMAT_RAW)
		 .setCell (1, 3, t.sends[1].volumeStr, Display.FORMAT_RAW)
		 .setCell (1, 4, t.sends[2].volumeStr, Display.FORMAT_RAW)
		 .setCell (1, 5, t.sends[3].volumeStr, Display.FORMAT_RAW)
		 .setCell (1, 6, t.sends[4].volumeStr, Display.FORMAT_RAW)
		 .setCell (1, 7, t.sends[5].volumeStr, Display.FORMAT_RAW)
		 .done (1)
		
		 .setCell (2, 0, this.push.showVU ? t.vu : t.volume, Display.FORMAT_VALUE)
		 .setCell (2, 1, t.pan, Display.FORMAT_PAN)
		 .setCell (2, 2, t.sends[0].volume, Display.FORMAT_VALUE)
		 .setCell (2, 3, t.sends[1].volume, Display.FORMAT_VALUE)
		 .setCell (2, 4, t.sends[2].volume, Display.FORMAT_VALUE)
		 .setCell (2, 5, t.sends[3].volume, Display.FORMAT_VALUE)
		 .setCell (2, 6, t.sends[4].volume, Display.FORMAT_VALUE)
		 .setCell (2, 7, t.sends[5].volume, Display.FORMAT_VALUE)
		 .done (2);
	}
};

function getColorIndex (red, green, blue)
{
	for (var i = 0; i < TrackMode.COLORS.length; i++)
	{
		var color = TrackMode.COLORS[i];
		if (Math.abs (color[0] - red ) < 0.0001 &&
			Math.abs (color[1] - green) < 0.0001 &&
			Math.abs (color[2] - blue) < 0.0001)
			return color[3];
	}
	return null;
}
