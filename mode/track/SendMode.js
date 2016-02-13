// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function SendMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_SEND;
}
SendMode.prototype = new AbstractTrackMode ();

SendMode.prototype.onValueKnob = function (index, value)
{
    var sendIndex = this.getCurrentSendIndex ();
    this.model.getCurrentTrackBank ().changeSend (index, sendIndex, value, this.surface.getFractionValue ());
};

SendMode.prototype.onValueKnobTouch = function (index, isTouched)
{
    var sendIndex = this.getCurrentSendIndex ();
        
    this.isKnobTouched[index] = isTouched;
    
    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.model.getCurrentTrackBank ().resetSend (index, sendIndex);
            return;
        }

        var fxTrackBank = this.model.getEffectTrackBank ();
        var t = this.model.getCurrentTrackBank ().getTrack (index);
        if (t.exists)
            displayNotification ("Send " + (fxTrackBank == null ? t.sends[sendIndex].name : fxTrackBank.getTrack (sendIndex).name) + ": " + t.sends[sendIndex].volumeStr);
    }
    
    this.model.getCurrentTrackBank ().touchSend (index, sendIndex, isTouched);
};

SendMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    var sendIndex = this.getCurrentSendIndex ();
    var tb = this.model.getCurrentTrackBank ();
    var fxTrackBank = this.model.getEffectTrackBank ();

    if (Config.isPush2)
    {
        this.updateTrackMenu ();

        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);

        var sendOffset = Config.sendsAreToggled ? 4 : 0;
        for (var i = 0; i < 8; i++)
        {
            var t = tb.getTrack (i);

            message.addByte (DisplayMessage.GRID_ELEMENT_CHANNEL_SENDS);
            
            // The menu item
            if (Config.wasMuteLongPressed || (Config.isMuteSoloLocked && tb.isMuteState ()))
            {
                message.addString (t.exists ? "Mute" : "");
                message.addBoolean (t.mute);
            }
            else if (Config.wasSoloLongPressed || (Config.isMuteSoloLocked && tb.isSoloState ()))
            {
                message.addString ( t.exists ? "Solo" : "");
                message.addBoolean (t.solo);
            }
            else
            {
                message.addString (this.menu[i]);
                message.addBoolean (i > 3 && i - 4 + sendOffset == sendIndex);
            }
            
            // Channel info
            message.addString (t.exists ? t.name : "");
            message.addString (t.type);
            message.addColor (tb.getTrackColorEntry (i));
            message.addByte (t.selected ? 1 : 0);

            for (var j = 0; j < 4; j++)
            {
                var sendPos = sendOffset + j;
                var send = t.sends[sendPos];
                message.addString (fxTrackBank == null ? send.name : fxTrackBank.getTrack (sendPos).name);
                message.addString (send && sendIndex == sendPos && this.isKnobTouched[i] ? send.volumeStr : "");
                message.addInteger(Config.toDisplayValue (send ? send.volume : ""));
                message.addByte (sendIndex == sendPos ? 1 : 0);
            }
            
            // Signal Track mode off
            message.addBoolean (false);
        }
        
        message.send ();
        return;
    }
    
    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);
        d.setCell (0, i, t.exists ? (fxTrackBank == null ? t.sends[sendIndex].name : fxTrackBank.getTrack (sendIndex).name) : "", Display.FORMAT_RAW)
         .setCell (1, i, t.sends[sendIndex].volumeStr, Display.FORMAT_RAW)
         .setCell (2, i, t.exists ? t.sends[sendIndex].volume : "", t.exists ? Display.FORMAT_VALUE : Display.FORMAT_RAW);
    }
    d.done (0).done (1).done (2);

    this.drawRow4 ();
};

SendMode.prototype.getCurrentSendIndex = function ()
{
    return this.surface.getCurrentMode () - MODE_SEND1;
};
