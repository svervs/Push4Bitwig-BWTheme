// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function VolumeMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_VOLUME;
}
VolumeMode.prototype = new AbstractTrackMode ();

VolumeMode.prototype.onValueKnob = function (index, value)
{
    this.model.getCurrentTrackBank ().changeVolume (index, value, this.surface.getFractionValue ());
};

VolumeMode.prototype.onValueKnobTouch = function (index, isTouched)
{
    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.model.getCurrentTrackBank ().resetVolume (index);
            return;
        }

        var t = this.model.getCurrentTrackBank ().getTrack (index);
        if (t.exists)
            displayNotification("Volume: " + t.volumeStr);
    }

    this.model.getCurrentTrackBank ().touchVolume (index, isTouched);
};

VolumeMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    var tb = this.model.getCurrentTrackBank ();

    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);
        d.setCell (0, i, t.exists ? "Volume" : "", Display.FORMAT_RAW)
         .setCell (1, i, t.volumeStr, Display.FORMAT_RAW)
         .setCell (2, i, t.exists ? (this.surface.showVU ? t.vu : t.volume) : "", t.exists ? Display.FORMAT_VALUE : Display.FORMAT_RAW);
    }
    d.done (0).done (1).done (2);

    this.drawRow4 ();
};
