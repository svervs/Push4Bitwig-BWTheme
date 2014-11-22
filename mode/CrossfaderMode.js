// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function CrossfaderMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_CROSSFADER;
}
CrossfaderMode.prototype = new AbstractTrackMode ();

CrossfaderMode.prototype.onValueKnobTouch = function (index, isTouched)
{
    if (isTouched && this.surface.isDeletePressed ())
        this.model.getCurrentTrackBank ().setCrossfadeMode (index, 'AB');
};

CrossfaderMode.prototype.onValueKnob = function (index, value)
{
    var tb = this.model.getCurrentTrackBank ();
    tb.setCrossfadeModeAsNumber (index, changeValue (value, tb.getCrossfadeModeAsNumber (index), 1, 2));
};

CrossfaderMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    var tb = this.model.getCurrentTrackBank ();

    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);
        d.setCell (0, i, t.exists ? "Crossfdr" : "", Display.FORMAT_RAW)
         .setCell (1, i, t.exists ? (t.crossfadeMode == 'A' ? 'A' : (t.crossfadeMode == 'B' ? '       B' : '   <> ')) : "", Display.FORMAT_RAW)
         .setCell (2, i, t.exists ? (t.crossfadeMode == 'A' ? 0 : (t.crossfadeMode == 'B' ? 127 : 64)) : "", t.exists ? Display.FORMAT_PAN : Display.FORMAT_RAW);
    }
    d.done (0).done (1).done (2);

    this.drawRow4 ();
};
