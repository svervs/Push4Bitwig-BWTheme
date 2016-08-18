// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PanMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_PAN;
}
PanMode.prototype = new AbstractTrackMode ();

PanMode.prototype.onValueKnob = function (index, value)
{
    this.model.getCurrentTrackBank ().changePan (index, value, this.surface.getFractionValue ());
};

PanMode.prototype.onValueKnobTouch = function (index, isTouched)
{
    this.isKnobTouched[index] = isTouched;
    
    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.model.getCurrentTrackBank ().resetPan (index);
            return;
        }

        var t = this.model.getCurrentTrackBank ().getTrack (index);
        if (t.exists)
            displayNotification ("Pan: " + t.panStr);
    }    

    this.model.getCurrentTrackBank ().touchPan (index, isTouched);
    this.checkStopAutomationOnKnobRelease (isTouched);
};

PanMode.prototype.updateDisplay = function ()
{
    if (Config.isPush2)
    {
        this.updateChannelDisplay (DisplayMessage.GRID_ELEMENT_CHANNEL_PAN, false, true);
        return;
    }
    
    var d = this.surface.getDisplay ();
    var tb = this.model.getCurrentTrackBank ();

    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);
        d.setCell (0, i, t.exists ? "Pan" : "", Display.FORMAT_RAW)
         .setCell (1, i, t.panStr, Display.FORMAT_RAW)
         .setCell (2, i, t.exists ? t.pan : "", t.exists ? Display.FORMAT_PAN : Display.FORMAT_RAW);
    }
    d.done (0).done (1).done (2);

    this.drawRow4 ();
};
