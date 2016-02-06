// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function AbstractTrackMode (model)
{
    BaseMode.call (this, model);
    this.hasSecondRowPriority = false;
    this.isTemporary = false;
    
    this.menu = [ "Volume", "Pan", "Crossfader", "Sends 1-4", "Send 1", "Send 2", "Send 3", "Send 4" ];
}
AbstractTrackMode.prototype = new BaseMode ();

AbstractTrackMode.prototype.onFirstRow = function (index)
{
    var tb = this.model.getCurrentTrackBank ();
    
    if (this.surface.isSelectPressed ())
    {
        if (this.surface.isShiftPressed ())
            tb.toggleIsActivated (index);
        else
            tb.toggleMonitor (index);
        return;
    }
    
    var selTrack = tb.getSelectedTrack ();
    if ((selTrack != null && selTrack.index == index) || this.surface.isShiftPressed ())
        tb.toggleArm (index);
    else
        tb.select (index);
};

AbstractTrackMode.prototype.onSecondRow = function (index)
{
    if (!Config.isPush2 || Config.wasMuteLongPressed || Config.wasSoloLongPressed || Config.isMuteSoloLocked)
    {
        var tb = this.model.getCurrentTrackBank ();

        if (this.surface.isSelectPressed ())
        {
            tb.toggleAutoMonitor (index);
            return;
        }
        
        if (tb.isMuteState ())
            tb.toggleMute (index);
        else
            tb.toggleSolo (index);
        return;
    }
    
    switch (index)
    {
        case 0:
            if (this.surface.isActiveMode (MODE_VOLUME))
                this.surface.setPendingMode (MODE_TRACK);
            else
                this.surface.setPendingMode (MODE_VOLUME);
            break;

        case 1:
            if (this.surface.isActiveMode (MODE_PAN))
                this.surface.setPendingMode (MODE_TRACK);
            else
                this.surface.setPendingMode (MODE_PAN);
            break;

        case 2:
            if (this.surface.isActiveMode (MODE_CROSSFADER))
                this.surface.setPendingMode (MODE_TRACK);
            else
                this.surface.setPendingMode (MODE_CROSSFADER);
            break;
            
        case 3:
            if (!this.model.isEffectTrackBankActive ())
            {
                // Check if there are more than 4 FX channels
                if (!Config.sendsAreToggled)
                {
                    var fxTrackBank = this.model.getEffectTrackBank ();
                    if (fxTrackBank == null || !fxTrackBank.getTrack (4).exists)
                        return;
                }
                Config.sendsAreToggled = !Config.sendsAreToggled;
    
                if (!this.surface.isActiveMode (MODE_TRACK))
                    this.surface.setPendingMode (MODE_SEND1 + (Config.sendsAreToggled ? 4 : 0));
            }
            break;
            
        default:
            if (!this.model.isEffectTrackBankActive ())
            {
                var sendOffset = Config.sendsAreToggled ? 0 : 4;
                var sendIndex = index - sendOffset;
                var fxTrackBank = this.model.getEffectTrackBank ();
                if (fxTrackBank != null && fxTrackBank.getTrack (sendIndex).exists)
                {
                    var si = MODE_SEND1 + sendIndex;
                    if (this.surface.isActiveMode (si))
                        this.surface.setPendingMode (MODE_TRACK);
                    else
                        this.surface.setPendingMode (si);
                }
            }
            break;
    }
};

AbstractTrackMode.prototype.updateFirstRow = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
    {
        // Light up selection and record buttons
        this.surface.updateButton (20 + i, this.getTrackButtonColor (tb.getTrack (i)));
    }
};

AbstractTrackMode.prototype.updateSecondRow = function ()
{
    if (Config.isPush2)
    {
        if (Config.wasMuteLongPressed || Config.wasSoloLongPressed || Config.isMuteSoloLocked)
        {
            var tb = this.model.getCurrentTrackBank ();
            var muteState = tb.isMuteState ();
            for (var i = 0; i < 8; i++)
            {
                var t = tb.getTrack (i);

                var color = PUSH_COLOR_BLACK;
                if (t.exists)
                {
                    if (this.surface.isSelectPressed ())
                        color = t.autoMonitor ? PUSH_COLOR2_GREEN_LO : PUSH_COLOR2_BLACK;
                    else if (muteState)
                    {
                        if (t.mute)
                            color = PUSH_COLOR2_AMBER_LO;
                    }
                    else if (t.solo)
                        color = PUSH_COLOR2_YELLOW_HI;
                }

                this.surface.updateButton (102 + i, color);
            }
            return;
        }
        
        this.surface.updateButton (102, this.surface.isActiveMode (MODE_VOLUME) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.updateButton (103, this.surface.isActiveMode (MODE_PAN) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.updateButton (104, this.surface.isActiveMode (MODE_CROSSFADER) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.updateButton (105, PUSH_COLOR_BLACK);
        this.surface.updateButton (106, this.surface.isActiveMode (Config.sendsAreToggled ? MODE_SEND5 : MODE_SEND1) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.updateButton (107, this.surface.isActiveMode (Config.sendsAreToggled ? MODE_SEND6 : MODE_SEND2) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.updateButton (108, this.surface.isActiveMode (Config.sendsAreToggled ? MODE_SEND7 : MODE_SEND3) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.updateButton (109, this.surface.isActiveMode (Config.sendsAreToggled ? MODE_SEND8 : MODE_SEND4) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        return;
    }
    
    var tb = this.model.getCurrentTrackBank ();
    var muteState = tb.isMuteState ();
    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);

        var color = PUSH_COLOR_BLACK;
        if (t.exists)
        {
            if (this.surface.isSelectPressed ())
                color = t.autoMonitor ? PUSH_COLOR2_GREEN_LO : PUSH_COLOR2_BLACK;
            else if (muteState)
            {
                if (!t.mute)
                    color = PUSH_COLOR2_YELLOW_HI;
            }
            else
                color = t.solo ? PUSH_COLOR2_BLUE_HI : PUSH_COLOR2_GREY_LO;
        }

        this.surface.updateButton (102 + i, color);
    }
};

AbstractTrackMode.prototype.drawRow4 = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var selTrack = tb.getSelectedTrack ();

    // Format track names
    var selIndex = selTrack == null ? -1 : selTrack.index;
    var d = this.surface.getDisplay ();
    for (var i = 0; i < 8; i++)
    {
        var isSel = i == selIndex;
        var t = tb.getTrack (i);
        var n = optimizeName (t.name, isSel ? 7 : 8);
        d.setCell (3, i, isSel ? Display.RIGHT_ARROW + n : n, Display.FORMAT_RAW);
    }
    d.done (3);
};

AbstractTrackMode.prototype.getTrackButtonColor = function (track)
{
    if (!track.exists)
        return PUSH_COLOR_BLACK;
    if (!track.activated)
        return PUSH_COLOR_BLACK;

    var tb = this.model.getCurrentTrackBank ();
    
    if (this.surface.isSelectPressed ())
        return track.monitor ? PUSH_COLOR_GREEN_HI : PUSH_COLOR_BLACK;
        
    var selTrack = tb.getSelectedTrack ();
    var selIndex = selTrack == null ? -1 : selTrack.index;
    var isSel = track.index == selIndex;

    if (track.recarm)
        return isSel ? PUSH_COLOR_RED_HI : PUSH_COLOR_RED_LO;

    return isSel ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO;
};

// Push 2

// Called from sub-classes
AbstractTrackMode.prototype.updateChannelDisplay = function (selectedMenu, isVolume, isPan)
{
    var d = this.surface.getDisplay ();
    var tb = this.model.getCurrentTrackBank ();

    this.updateTrackMenu ();
    
    var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);

    for (var i = 0; i < 8; i++)
    {
        var t = tb.getTrack (i);

        message.addByte (selectedMenu);
        
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
            message.addBoolean (i == selectedMenu - 1);
        }
        
        // Channel info
        message.addString (t.name);
        message.addString (t.type);
        message.addColor ( AbstractTrackBankProxy.getColorEntry (t.color));
        message.addByte (t.selected ? 1 : 0);
        message.addInteger (Config.toDisplayValue (t.volume));
        message.addString (isVolume && this.isKnobTouched[i] ? t.volumeStr : "");
        message.addInteger (Config.toDisplayValue (t.pan));
        message.addString (isPan && this.isKnobTouched[i] ? t.panStr : "");
        message.addInteger (Config.toDisplayValue (this.surface.showVU ? t.vu : 0));
        message.addBoolean (t.mute);
        message.addBoolean (t.solo);
        message.addBoolean (t.recarm);
        message.addByte (t.crossfadeMode == 'A' ? 0 : (t.crossfadeMode == 'B' ? 2 : 1));
    }
    
    message.send ();
};

AbstractTrackMode.prototype.updateTrackMenu = function ()
{
    var fxTrackBank = this.model.getEffectTrackBank ();
    var sendOffset = Config.sendsAreToggled ? 4 : 0;
    if (this.model.isEffectTrackBankActive ())
    {
        // No sends for FX tracks
        for (var i = 3; i < 8; i++)
            this.menu[i] = ""; 
    }
    else
    {
        if (fxTrackBank == null)
        {
            var selTrack = this.model.getTrackBank ().getSelectedTrack ();
            for (var i = 0; i < 4; i++)
                this.menu[4 + i] = selTrack == null ? "Send " + (sendOffset + i) : selTrack.sends[sendOffset + i].name;
        }
        else
        {
            for (var i = 0; i < 4; i++)
                this.menu[4 + i] = fxTrackBank.getTrack (sendOffset + i).name;
        }
        
        this.menu[3] = Config.sendsAreToggled ? "Sends 5-8" : "Sends 1-4";
    }
};
