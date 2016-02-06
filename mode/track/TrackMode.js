// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function TrackMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_TRACK;
}
TrackMode.prototype = new AbstractTrackMode ();

TrackMode.prototype.onValueKnob = function (index, value)
{
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    if (selectedTrack == null)
        return;

    switch (index)
    {
        case 0:
            tb.changeVolume (selectedTrack.index, value, this.surface.getFractionValue ());
            return;
        case 1:
            tb.changePan (selectedTrack.index, value, this.surface.getFractionValue ());
            return;
    }
    
    if (Config.isPush2)
    {
        switch (index)
        {
            case 2:
                tb.setCrossfadeModeAsNumber (selectedTrack.index, changeValue (value, tb.getCrossfadeModeAsNumber (selectedTrack.index), 1, 3));
                break;
            case 3:
                break;
            default:
                var sendOffset = Config.sendsAreToggled ? 0 : 4;
                tb.changeSend (selectedTrack.index, index - sendOffset, value, this.surface.getFractionValue ());
                break;
        }
        return;
    }
    
    switch (index)
    {
        case 2:
            if (Config.displayCrossfader)
                tb.setCrossfadeModeAsNumber (selectedTrack.index, changeValue (value, tb.getCrossfadeModeAsNumber (selectedTrack.index), 1, 3));
            else
                tb.changeSend (selectedTrack.index, 0, value, this.surface.getFractionValue ());
            break;
        default:
            tb.changeSend (selectedTrack.index, index - (Config.displayCrossfader ? 3 : 2), value, this.surface.getFractionValue ());
            break;
    }
};

TrackMode.prototype.onValueKnobTouch = function (index, isTouched)
{
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    if (selectedTrack == null)
        return;
    
    this.isKnobTouched[index] = isTouched;
    
    if (Config.isPush2)
    {
        if (isTouched)
        {
            if (this.surface.isDeletePressed ())
            {
                this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
                switch (index)
                {
                    case 0:
                        tb.resetVolume (selectedTrack.index);
                        break;
                    case 1:
                        tb.resetPan (selectedTrack.index);
                        break;
                    case 2:
                        tb.setCrossfadeMode (selectedTrack.index, 'AB');
                        break;
                    case 3:
                        // Not used
                        break;
                    default:
                        tb.resetSend (selectedTrack.index, index - 4);
                        break;
                }
                return;
            }

            switch (index)
            {
                case 0:
                    displayNotification ("Volume: " + selectedTrack.volumeStr);
                    break;
                case 1:
                    displayNotification ("Pan: " + selectedTrack.panStr);
                    break;
                case 2:
                    displayNotification ("Crossfader: " + selectedTrack.crossfadeMode);
                    break;
                case 3:
                    // Not used
                    break;
                default:
                    var sendIndex = index - 4;
                    var fxTrackBank = this.model.getEffectTrackBank ();
                    var name = (fxTrackBank == null ? selectedTrack.sends[sendIndex].name : fxTrackBank.getTrack (sendIndex).name);
                    if (name.length > 0)
                        displayNotification ("Send " + name + ": " + selectedTrack.sends[sendIndex].volumeStr);
                    break;
            }
        }
        
        switch (index)
        {
            case 0:
                tb.touchVolume (selectedTrack.index, isTouched);
                break;
            case 1:
                tb.touchPan (selectedTrack.index, isTouched);
                break;
            case 2:
                break;
            case 3:
                // Not used
                break;
            default:
                var sendIndex = index - 4;
                tb.touchSend (selectedTrack.index, sendIndex, isTouched);
                break;
        }
        
        return;
    }
    

    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
            switch (index)
            {
                case 0:
                    tb.resetVolume (selectedTrack.index);
                    break;
                case 1:
                    tb.resetPan (selectedTrack.index);
                    break;
                case 2:
                    if (Config.displayCrossfader)
                        tb.setCrossfadeMode (selectedTrack.index, 'AB');
                    else
                        tb.resetSend (selectedTrack.index, 0);
                    break;
                default:
                    tb.resetSend (selectedTrack.index, index - (Config.displayCrossfader ? 3 : 2));
                    break;
            }
            return;
        }

        switch (index)
        {
            case 0:
                displayNotification ("Volume: " + selectedTrack.volumeStr);
                break;
            case 1:
                displayNotification ("Pan: " + selectedTrack.panStr);
                break;
            case 2:
                if (Config.displayCrossfader)
                    displayNotification ("Crossfader: " + selectedTrack.crossfadeMode);
                else
                {
                    var sendIndex = 0;
                    var fxTrackBank = this.model.getEffectTrackBank ();
                    var name = (fxTrackBank == null ? selectedTrack.sends[sendIndex].name : fxTrackBank.getTrack (sendIndex).name);
                    if (name.length > 0)
                        displayNotification ("Send " + name + ": " + selectedTrack.sends[sendIndex].volumeStr);
                }
                break;
            default:
                var sendIndex = index - (Config.displayCrossfader ? 3 : 2);
                var fxTrackBank = this.model.getEffectTrackBank ();
                var name = (fxTrackBank == null ? selectedTrack.sends[sendIndex].name : fxTrackBank.getTrack (sendIndex).name);
                if (name.length > 0)
                    displayNotification ("Send " + name + ": " + selectedTrack.sends[sendIndex].volumeStr);
                break;
        }
    }
    
    switch (index)
    {
        case 0:
            tb.touchVolume (selectedTrack.index, isTouched);
            break;
        case 1:
            tb.touchPan (selectedTrack.index, isTouched);
            break;
        case 2:
            if (!Config.displayCrossfader)
                tb.touchSend (selectedTrack.index, 0, isTouched);
            break;
        default:
            var sendIndex = index - (Config.displayCrossfader ? 3 : 2);
            tb.touchSend (selectedTrack.index, sendIndex, isTouched);
            break;
    }
};

TrackMode.prototype.updateDisplay = function ()
{
    if (Config.isPush2)
    {
        this.updateDisplay2 ();
        return;
    }
    
    var currentTrackBank = this.model.getCurrentTrackBank ();
    var t = currentTrackBank.getSelectedTrack ();
    var d = this.surface.getDisplay ();
    
    if (t == null)
        d.setRow (1, "                     Please selecta track...                        ")
         .clearRow (0).clearRow (2).done (0).done (2);
    else
    {
        d.setCell (0, 0, "Volume", Display.FORMAT_RAW)
         .setCell (1, 0, t.volumeStr, Display.FORMAT_RAW)
         .setCell (2, 0, this.surface.showVU ? t.vu : t.volume, Display.FORMAT_VALUE)
         
         .setCell (0, 1, "Pan", Display.FORMAT_RAW)
         .setCell (1, 1, t.panStr, Display.FORMAT_RAW)
         .setCell (2, 1, t.pan, Display.FORMAT_PAN);

        var sendStart = 2;
        var sendCount = 6;
        if (Config.displayCrossfader)
        {
            sendStart = 3;
            sendCount = 5;
            d.setCell (0, 2, "Crossfdr", Display.FORMAT_RAW)
             .setCell (1, 2, t.crossfadeMode == 'A' ? 'A' : (t.crossfadeMode == 'B' ? '       B' : '   <> '), Display.FORMAT_RAW)
             .setCell (2, 2, t.crossfadeMode == 'A' ? 0 : (t.crossfadeMode == 'B' ? Config.maxParameterValue : (Config.maxParameterValue / 2)), Display.FORMAT_PAN);
        }
        
        var fxTrackBank = this.model.getEffectTrackBank ();
        if (fxTrackBank != null)
        {
            var isFX = currentTrackBank === fxTrackBank;
            for (var i = 0; i < sendCount; i++)
            {
                var fxTrack = fxTrackBank.getTrack (i);
                var isEmpty = isFX || !fxTrack.exists;
                var pos = sendStart + i;
                d.setCell (0, pos, isEmpty ? "" : fxTrack.name, Display.FORMAT_RAW)
                 .setCell (1, pos, isEmpty ? "" : t.sends[i].volumeStr, Display.FORMAT_RAW)
                 .setCell (2, pos, isEmpty ? "" : t.sends[i].volume, isEmpty ? Display.FORMAT_RAW : Display.FORMAT_VALUE);
            }
        }
        else
        {
            for (var i = 0; i < sendCount; i++)
            {
                var pos = sendStart + i;
                d.setCell (0, pos, t.sends[i].name, Display.FORMAT_RAW)
                 .setCell (1, pos, t.sends[i].volumeStr, Display.FORMAT_RAW)
                 .setCell (2, pos, t.sends[i].volume, Display.FORMAT_VALUE);
            }
        }
        
        d.done (0).done (1).done (2);
    }

    this.drawRow4 ();
};

TrackMode.prototype.updateDisplay2 = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    
    // Get the index at which to draw the Sends element
    var selectedIndex = selectedTrack == null ? -1 : selectedTrack.index;
    var sendsIndex = selectedTrack == null || this.model.isEffectTrackBankActive () ? -1 : selectedTrack.index + 1;
    if (sendsIndex == 8)
        sendsIndex = 6;
    
    var d = this.surface.getDisplay ();
    
    this.updateTrackMenu ();

    var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);

    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);

        if (sendsIndex == i)
            message.addByte (DisplayMessage.GRID_ELEMENT_CHANNEL_SENDS);
        else
            message.addByte (t.selected ? DisplayMessage.GRID_ELEMENT_CHANNEL_ALL : DisplayMessage.GRID_ELEMENT_CHANNEL_SELECTION);
        
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
            message.addBoolean (false);
        }        
        
        // Channel info
        message.addString (t.name);
        message.addString (t.type);
        message.addColor (AbstractTrackBankProxy.getColorEntry (t.color));
        message.addByte (t.selected ? 1 : 0);
        
        if (t.selected)
        {
            message.addInteger (Config.toDisplayValue (t.volume));
            message.addString (this.isKnobTouched[0] ? t.volumeStr : "");
            message.addInteger (Config.toDisplayValue (t.pan));
            message.addString (this.isKnobTouched[1] ? t.panStr : "");
            message.addInteger (Config.toDisplayValue (this.surface.showVU ? t.vu : 0));
            message.addBoolean (t.mute);
            message.addBoolean (t.solo);
            message.addBoolean (t.recarm);
            message.addByte (t.crossfadeMode == 'A' ? 0 : (t.crossfadeMode == 'B' ? 2 : 1));
        }
        else if (sendsIndex == i)
        {
            var fxTrackBank = this.model.getEffectTrackBank ();
            var selTrack = tb.getTrack (selectedIndex);
            for (var j = 0; j < 4; j++)
            {
                var sendOffset = Config.sendsAreToggled ? 4 : 0;
                var sendPos = sendOffset + j;
                var send = selTrack.sends[sendPos];
                message.addString (fxTrackBank == null ? send.name : fxTrackBank.getTrack (sendPos).name);
                message.addString (send && this.isKnobTouched[4 + j] ? send.volumeStr : "");
                message.addInteger(Config.toDisplayValue (send ? send.volume : 0));
                message.addByte (1);
            }
            // Signal Track mode
            message.addBoolean (true);
        }
    }
    
    message.send ();
};
