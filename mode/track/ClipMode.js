// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ClipMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_CLIP;
}
ClipMode.prototype = new AbstractTrackMode ();

ClipMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    this.isKnobTouched[index] = isTouched;
};

ClipMode.prototype.onValueKnob = function (index, value)
{
    var clip = this.surface.getView (VIEW_DRUM).clip;
    var fractionValue = this.surface.isShiftPressed () ? 0.25 : 1;
    switch (index)
    {
        case 0:
            clip.changePlayStart (value, fractionValue);
            break;
        case 1:
            clip.changePlayEnd (value, fractionValue);
            break;
        case 2:
            clip.changeLoopStart (value, fractionValue);
            break;
        case 3:
            clip.changeLoopLength (value, fractionValue);
            break;
        case 4:
            clip.setLoopEnabled (value <= 61);
            break;
        case 6:
            clip.setShuffleEnabled (value <= 61);
            break;
        case 7:
            clip.changeAccent (value, fractionValue);
            break;
    }
};

ClipMode.prototype.updateDisplay = function ()
{
    var clip = this.surface.getView (VIEW_DRUM).clip;
    var d = this.surface.getDisplay ();
    
    if (Config.isPush2)
    {
        var tb = this.model.getCurrentTrackBank ();
        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
        for (var i = 0; i < 8; i++)
        {
            var t = tb.getTrack (i);

            message.addByte (DisplayMessage.GRID_ELEMENT_PARAMETERS);
            message.addString ("");
            message.addBoolean (false);
            
            // Channel info
            message.addString (t.name);
            message.addString (t.type);
            message.addColor (tb.getTrackColorEntry (i));
            message.addByte (t.selected ? 1 : 0);
            
            switch (i)
            {
                case 0:
                    message.addString ("Play Start");
                    message.addInteger (-1);
                    message.addString (this.formatMeasures (clip.getPlayStart ()));
                    message.addBoolean (this.isKnobTouched[i]);
                    break;
                case 1:
                    message.addString ("Play End");
                    message.addInteger (-1);
                    message.addString (this.formatMeasures (clip.getPlayEnd ()));
                    message.addBoolean (this.isKnobTouched[i]);
                    break;
                case 2:
                    message.addString ("Loop Start");
                    message.addInteger (-1);
                    message.addString (this.formatMeasures (clip.getLoopStart ()));
                    message.addBoolean (this.isKnobTouched[i]);
                    break;
                case 3:
                    message.addString ("Loop Lngth");
                    message.addInteger (-1);
                    message.addString (this.formatMeasures (clip.getLoopLength ()));
                    message.addBoolean (this.isKnobTouched[i]);
                    break;
                case 4:
                    message.addString ("Loop");
                    message.addInteger (-1);
                    message.addString (clip.isLoopEnabled () ? "On" : "Off");
                    message.addBoolean (this.isKnobTouched[i]);
                    break;
                case 6:
                    message.addString ("Shuffle");
                    message.addInteger (-1);
                    message.addString (clip.isShuffleEnabled () ? "On" : "Off");
                    message.addBoolean (this.isKnobTouched[i]);
                    break;
                case 7:
                    message.addString ("Accent");
                    message.addInteger (-1);
                    message.addString (clip.getAccent ());
                    message.addBoolean (this.isKnobTouched[i]);
                    break;
                default:
                    message.addString ("");
                    message.addInteger (-1);
                    message.addString ("");
                    message.addBoolean (false);
                    break;
            }
        }
        
        message.send ();
    }
    else
    {
        d.setCell (0, 0, "PlayStrt", Display.FORMAT_RAW)
         .setCell (1, 0, this.formatMeasures (clip.getPlayStart ()), Display.FORMAT_RAW)
         .setCell (0, 1, "Play End", Display.FORMAT_RAW)
         .setCell (1, 1, this.formatMeasures (clip.getPlayEnd ()), Display.FORMAT_RAW)
         .setCell (0, 2, "LoopStrt", Display.FORMAT_RAW)
         .setCell (1, 2, this.formatMeasures (clip.getLoopStart ()), Display.FORMAT_RAW)
         .setCell (0, 3, "LopLngth", Display.FORMAT_RAW)
         .setCell (1, 3, this.formatMeasures (clip.getLoopLength ()), Display.FORMAT_RAW)
         .setCell (0, 4, "Loop", Display.FORMAT_RAW)
         .setCell (1, 4, clip.isLoopEnabled () ? "On" : "Off", Display.FORMAT_RAW)
         .clearCell (0, 5)
         .clearCell (1, 5)
         .setCell (0, 6, "Shuffle", Display.FORMAT_RAW)
         .setCell (1, 6, clip.isShuffleEnabled () ? "On" : "Off", Display.FORMAT_RAW)
         .setCell (0, 7, "Accent", Display.FORMAT_RAW)
         .setCell (1, 7, clip.getAccent (), Display.FORMAT_RAW)
         .done (0).done (1).clearRow (2).done (2);

        this.drawRow4 ();
    }
};

ClipMode.prototype.formatMeasures = function (time)
{
    var quartersPerMeasure = this.model.getQuartersPerMeasure ();
    var measure = Math.floor (time / quartersPerMeasure);
    time = time - measure * quartersPerMeasure;
    var quarters = Math.floor (time);   // :1
    time = time - quarters; // *1
    var eights = Math.floor (time / 0.25);
    return measure + "." + quarters + "." + eights;
};