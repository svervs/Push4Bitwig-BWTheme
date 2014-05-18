// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

VolumeMode.PARAM_NAMES = 'Volume   Volume  Volume   Volume  Volume   Volume  Volume   Volume  ';


function VolumeMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_VOLUME;
}
VolumeMode.prototype = new BaseMode ();

VolumeMode.prototype.onValueKnob = function (index, value)
{
	this.model.getTrackBank ().setVolume (index, value);
};

VolumeMode.prototype.updateDisplay = function ()
{
	var d = this.push.display;
	for (var i = 0; i < 8; i++)
	{
		var t = this.model.getTrack (i);
		d.setCell (1, i, t.volumeStr, Display.FORMAT_RAW)
		 .setCell (2, i, this.push.showVU ? t.vu : t.volume, Display.FORMAT_VALUE);
	}
	d.setRow (0, VolumeMode.PARAM_NAMES).done (1).done (2);
};