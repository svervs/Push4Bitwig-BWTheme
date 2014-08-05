// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

TrackMode.PARAM_NAMES = 'Volume   Pan     Send 1   Send 2  Send 3   Send 4  Send 5   Send 6  ';


function TrackMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_TRACK;
}
TrackMode.prototype = new AbstractTrackMode ();

TrackMode.prototype.onValueKnob = function (index, value)
{
    var tb = this.model.getTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    if (selectedTrack == null)
        return;
    if (index == 0)
        tb.changeVolume (selectedTrack.index, value, this.surface.getFractionValue ());
    else if (index == 1)
        tb.changePan (selectedTrack.index, value, this.surface.getFractionValue ());
    else
        tb.changeSend (selectedTrack.index, index - 2, value, this.surface.getFractionValue ());
};

// TrackMode.prototype.onFirstRow = function (index) {};

// TrackMode.prototype.onSecondRow = function (index) {};

TrackMode.prototype.updateDisplay = function ()
{
    var t = this.model.getTrackBank ().getSelectedTrack ();
    var d = this.surface.display;
    
    d.setRow (0, TrackMode.PARAM_NAMES);

    if (t == null)
        d.clearRow (1).clearRow (2);
    else
    {
        // Note: The Sends name is not send (always "Send")
        
        //d.setCell (0, 0, "Volume", Display.FORMAT_RAW)
        d.setCell (1, 0, t.volumeStr, Display.FORMAT_RAW)
         .setCell (2, 0, this.surface.showVU ? t.vu : t.volume, Display.FORMAT_VALUE)
        // .setCell (0, 1, "Pan", Display.FORMAT_RAW)
         .setCell (1, 1, t.panStr, Display.FORMAT_RAW)
         .setCell (2, 1, t.pan, Display.FORMAT_PAN);
         
        for (var i = 0; i < 6; i++)
        {
            //d.setCell (0, 2 + i, t.sends[i].name, Display.FORMAT_RAW)
            d.setCell (1, 2 + i, t.sends[i].volumeStr, Display.FORMAT_RAW)
             .setCell (2, 2 + i, t.sends[i].volume, Display.FORMAT_VALUE);
        }
    }
    d.done (1).done (2);

    this.drawRow4 ();
};

// TrackMode.prototype.updateFirstRow = function () {};

// TrackMode.prototype.updateSecondRow = function () {};
