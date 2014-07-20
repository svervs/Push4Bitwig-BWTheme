// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

VolumeMode.PARAM_NAMES = 'Volume   Volume  Volume   Volume  Volume   Volume  Volume   Volume  ';

function VolumeMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_VOLUME;
    this.hasSecondRowPriority = true;
}
VolumeMode.prototype = new AbstractTrackMode ();

VolumeMode.prototype.onValueKnob = function (index, value)
{
    this.model.getTrackBank ().changeVolume (index, value, this.push.getFractionValue ());
};

// VolumeMode.prototype.onFirstRow = function (index) {};

// VolumeMode.prototype.onSecondRow = function (index) {};

VolumeMode.prototype.updateDisplay = function ()
{
    var d = this.push.display;
    var tb = this.model.getTrackBank ();

    d.setRow (0, VolumeMode.PARAM_NAMES);

    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);
        d.setCell (1, i, t.volumeStr, Display.FORMAT_RAW)
         .setCell (2, i, this.push.showVU ? t.vu : t.volume, Display.FORMAT_VALUE);
    }
    d.done (1).done (2);

    this.drawRow4 ();
};

// VolumeMode.prototype.updateFirstRow = function () {};

// VolumeMode.prototype.updateSecondRow = function () {};
