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
        tb.setVolume (selectedTrack.index, value);
    else if (index == 1)
        tb.setPan (selectedTrack.index, value);
    else
        tb.setSend (selectedTrack.index, index - 2, value);
};

TrackMode.prototype.updateDisplay = function ()
{
    this.drawTrackNames ();

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
