// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceLayerMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_DEVICE_LAYER;
    this.isTemporary = false;
    
    this.menu = [ "Volume", "Pan", "", "Sends 1-4", "Send 1", "Send 2", "Send 3", "Send 4" ];
}
DeviceLayerMode.prototype = new BaseMode ();

DeviceLayerMode.prototype.onValueKnob = function (index, value)
{
    var cd = this.model.getDevice ();
    var selectedDeviceLayer = cd.getSelectedLayerOrDrumPad ();
    if (selectedDeviceLayer == null)
        return;
    switch (index)
    {
        case 0:
            cd.changeLayerOrDrumPadVolume (selectedDeviceLayer.index, value, this.surface.getFractionValue ());
            break;
        case 1:
            cd.changeLayerOrDrumPadPan (selectedDeviceLayer.index, value, this.surface.getFractionValue ());
            break;
        default:
            if (Config.isPush2 && index < 4)
                break;
            var sendIndex = index - (Config.isPush2 ? (Config.sendsAreToggled ? 0 : 4) : 2);
            cd.changeLayerOrDrumPadSend (selectedDeviceLayer.index, sendIndex, value, this.surface.getFractionValue ());
            break;
    }
};

DeviceLayerMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    var cd = this.model.getDevice ();
    var l = cd.getSelectedLayerOrDrumPad ();
        
    this.isKnobTouched[index] = isTouched;
    
    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
            switch (index)
            {
                case 0:
                    cd.resetLayerOrDrumPadVolume (l.index);
                    break;
                case 1:
                    cd.resetLayerOrDrumPadPan (l.index);
                    break;
                default:
                    if (Config.isPush2 && index < 4)
                        break;
                    var sendIndex = index - (Config.isPush2 ? (Config.sendsAreToggled ? 0 : 4) : 2);
                    cd.resetLayerSend (l.index, sendIndex);
                    break;
            }
            return;
        }

        switch (index)
        {
            case 0:
                displayNotification ("Volume: " + l.volumeStr);
                break;
            case 1:
                displayNotification ("Pan: " + l.panStr);
                break;
            default:
                if (Config.isPush2 && index < 4)
                    break;
                var sendIndex = index - (Config.isPush2 ? (Config.sendsAreToggled ? 0 : 4) : 2);
                var fxTrackBank = this.model.getEffectTrackBank ();
                var name = (fxTrackBank == null ? l.sends[sendIndex].name : fxTrackBank.getTrack (sendIndex).name);
                if (name.length > 0)
                    displayNotification ("Send " + name + ": " + l.sends[sendIndex].volumeStr);
                break;
        }
    }
    
    switch (index)
    {
        case 0:
            cd.touchLayerOrDrumPadVolume (l.index, isTouched);
            break;
        case 1:
            cd.touchLayerOrDrumPadPan (l.index, isTouched);
            break;
        default:
            if (Config.isPush2 && index < 4)
                break;
            var sendIndex = index - (Config.isPush2 ? (Config.sendsAreToggled ? 0 : 4) : 2);
            cd.touchLayerOrDrumPadSend (l.index, sendIndex, isTouched);
            break;
    }
};

DeviceLayerMode.prototype.onFirstRow = function (index)
{
    var cd = this.model.getDevice ();
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    var layer = cd.getLayerOrDrumPad (offset + index);
    if (layer.exists)
        cd.selectLayerOrDrumPad (layer.index);
};

DeviceLayerMode.prototype.onSecondRow = function (index)
{
    if (!Config.isPush2 || Config.wasMuteLongPressed || Config.wasSoloLongPressed || Config.isMuteSoloLocked)
    {
        var cd = this.model.getDevice ();
        var offset = cd.hasDrumPads () && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
        if (this.model.getCurrentTrackBank ().isMuteState ())
            cd.toggleLayerOrDrumPadMute (offset + index);
        else
            cd.toggleLayerOrDrumPadSolo (offset + index);
        return;
    }
        
    switch (index)
    {
        case 0:
            if (this.surface.isActiveMode (MODE_DEVICE_LAYER_VOLUME))
                this.surface.setPendingMode (MODE_DEVICE_LAYER);
            else
                this.surface.setPendingMode (MODE_DEVICE_LAYER_VOLUME);
            break;

        case 1:
            if (this.surface.isActiveMode (MODE_DEVICE_LAYER_PAN))
                this.surface.setPendingMode (MODE_DEVICE_LAYER);
            else
                this.surface.setPendingMode (MODE_DEVICE_LAYER_PAN);
            break;

        case 2:
            // Not used
            break;
            
        case 3:
            if (!this.model.isEffectTrackBankActive ())
            {
                // Check if there are more than 4 FX channels
                if (!Config.sendsAreToggled)
                {
                    var fxTrackBank = this.model.getEffectTrackBank ();
                    if (!fxTrackBank.getTrack (4).exists)
                        return;
                }
                Config.sendsAreToggled = !Config.sendsAreToggled;
    
                if (!this.surface.isActiveMode (MODE_DEVICE_LAYER))
                    this.surface.setPendingMode (MODE_DEVICE_LAYER_SEND1 + (Config.sendsAreToggled ? 4 : 0));
            }
            break;
            
        default:
            if (!this.model.isEffectTrackBankActive ())
            {
                var sendOffset = Config.sendsAreToggled ? 0 : 4;
                var sendIndex = index - sendOffset;
                var fxTrackBank = this.model.getEffectTrackBank ();
                if (fxTrackBank.getTrack (sendIndex).exists)
                {
                    var si = MODE_DEVICE_LAYER_SEND1 + sendIndex;
                    if (this.surface.isActiveMode (si))
                        this.surface.setPendingMode (MODE_DEVICE_LAYER);
                    else
                        this.surface.setPendingMode (si);
                }
            }
            break;
    }
};

DeviceLayerMode.prototype.updateDisplay = function () 
{
    if (!this.model.getDevice ().hasSelectedDevice ())
    {
        if (Config.isPush2)
            DisplayMessage.sendMessage (3, 'Please select a device...');
        else
            this.surface.getDisplay ().clear ().setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ').clearRow (3).allDone ();
        return;
    }
    
    if (Config.isPush2)
        this.updateDisplay2 ();
    else
        this.updateDisplay1 ();
};

DeviceLayerMode.prototype.updateDisplay1 = function () 
{
    var d = this.surface.getDisplay ();
    d.clear ();

    var cd = this.model.getDevice ();
    var l = cd.getSelectedLayerOrDrumPad ();
    if (l == null)
    {
        d.setBlock (1, 1, '    Please select')
         .setBlock (1, 2, cd.hasDrumPads () ? 'a Drum Pad...' : 'a Device Layer...');
    }
    else
    {
        d.setCell (0, 0, "Volume", Display.FORMAT_RAW)
         .setCell (1, 0, l.volumeStr, Display.FORMAT_RAW)
         .setCell (2, 0, this.surface.showVU ? l.vu : l.volume, Display.FORMAT_VALUE)
         
         .setCell (0, 1, "Pan", Display.FORMAT_RAW)
         .setCell (1, 1, l.panStr, Display.FORMAT_RAW)
         .setCell (2, 1, l.pan, Display.FORMAT_PAN);
     
        var fxTrackBank = this.model.getEffectTrackBank ();
        if (fxTrackBank != null)
        {
            var isFX = this.model.isEffectTrackBankActive ();
            for (var i = 0; i < 6; i++)
            {
                var fxTrack = fxTrackBank.getTrack (i);
                var isEmpty = isFX || !fxTrack.exists;
                var pos = 2 + i;
                d.setCell (0, pos, isEmpty ? "" : fxTrack.name, Display.FORMAT_RAW)
                 .setCell (1, pos, isEmpty ? "" : l.sends[i].volumeStr, Display.FORMAT_RAW)
                 .setCell (2, pos, isEmpty ? "" : l.sends[i].volume, isEmpty ? Display.FORMAT_RAW : Display.FORMAT_VALUE);
            }
        }
        else
        {
            for (var i = 0; i < 6; i++)
            {
                var pos = 2 + i;
                d.setCell (0, pos, l.sends[i].name, Display.FORMAT_RAW)
                 .setCell (1, pos, l.sends[i].volumeStr, Display.FORMAT_RAW)
                 .setCell (2, pos, l.sends[i].volume, Display.FORMAT_VALUE);
            }
        }
    }
    
    this.drawRow4 (d, cd);
};

DeviceLayerMode.prototype.drawRow4 = function (d, cd) 
{
    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    for (var i = 0; i < 8; i++)
    {
        var layer = cd.getLayerOrDrumPad (offset + i);
        var n = optimizeName (layer.name, layer.selected ? 7 : 8);
        d.setCell (3, i, layer.selected ? Display.RIGHT_ARROW + n : n, Display.FORMAT_RAW);
    }
    d.allDone ();
};

DeviceLayerMode.prototype.updateDisplay2 = function ()
{
    var cd = this.model.getDevice ();
    var l = cd.getSelectedLayerOrDrumPad ();
    if (l == null)
    {
        DisplayMessage.sendMessage (3, 'Please select a ' + (cd.hasDrumPads () ? 'Drum Pad...' : 'Device Layer...'));
        return;
    }
    
    this.updateMenu ();

    this.updateDisplayElements (cd, l);
};

DeviceLayerMode.prototype.updateDisplayElements = function (cd, l)
{
    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    
    // Get the index at which to draw the Sends element
    var sendsIndex = l == null ? -1 : l.index - offset + 1;
    if (sendsIndex == 8)
        sendsIndex = 6;
    
    var d = this.surface.getDisplay ();
    var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
    
    for (var i = 0; i < 8; i++)
    {
        var layer = cd.getLayerOrDrumPad (offset + i);
        
        if (sendsIndex == i)
            message.addByte (DisplayMessage.GRID_ELEMENT_CHANNEL_SENDS);
        else
            message.addByte (layer.selected ? DisplayMessage.GRID_ELEMENT_CHANNEL_ALL : DisplayMessage.GRID_ELEMENT_CHANNEL_SELECTION);

        // The menu
        if (Config.wasMuteLongPressed || (Config.isMuteSoloLocked && this.model.getCurrentTrackBank ().isMuteState ()))
        {
            message.addString (layer.exists ? "Mute" : "");
            message.addBoolean (layer.mute);
        }
        else if (Config.wasSoloLongPressed || (Config.isMuteSoloLocked && this.model.getCurrentTrackBank ().isSoloState ()))
        {
            message.addString (layer.exists ? "Solo" : "");
            message.addBoolean (layer.solo);
        }
        else
        {
            message.addString (this.menu[i]);
            message.addBoolean (false);
        }
        
        // Channel info
        message.addString (layer.name);
        message.addString ("layer");
        message.addColor (AbstractTrackBankProxy.getColorEntry (layer.color));
        message.addByte (layer.selected ? 1 : 0);
        
        if (layer.selected)
        {
            message.addInteger (layer.volume);
            message.addString (this.isKnobTouched[0] ? layer.volumeStr : "");
            message.addInteger (layer.pan);
            message.addString (this.isKnobTouched[1] ? layer.panStr : "");
            message.addInteger (this.surface.showVU ? layer.vu : 0);
            message.addBoolean (layer.mute);
            message.addBoolean (layer.solo);
            message.addBoolean (false);
            message.addByte (0);
        }
        else if (sendsIndex == i)
        {
            for (var j = 0; j < 4; j++)
            {
                var sendOffset = Config.sendsAreToggled ? 4 : 0;
                var sendPos = sendOffset + j;
                var send = l.sends[sendPos];
                message.addString (send.name);
                message.addString (this.isKnobTouched[4 + j] ? send.volumeStr : "");
                message.addInteger(send.volume);
                message.addByte (1);
            }
            // Signal Track mode
            message.addBoolean (true);
        }
    }
    
    message.send ();
};

//Called from sub-classes
DeviceLayerMode.prototype.updateChannelDisplay = function (cd, l, selectedMenu, isVolume, isPan)
{
    var d = this.surface.getDisplay ();

    this.updateMenu ();
    
    var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);

    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;

    for (var i = 0; i < 8; i++)
    {
        var layer = cd.getLayerOrDrumPad (offset + i);

        message.addByte (selectedMenu);
        
        // The menu item
        if (Config.wasMuteLongPressed || (Config.isMuteSoloLocked && tb.isMuteState ()))
        {
            message.addString (layer.exists ? "Mute" : "");
            message.addBoolean (layer.mute);
        }
        else if (Config.wasSoloLongPressed || (Config.isMuteSoloLocked && tb.isSoloState ()))
        {
            message.addString ( layer.exists ? "Solo" : "");
            message.addBoolean (layer.solo);
        }
        else
        {
            message.addString (this.menu[i]);
            message.addBoolean (i == selectedMenu - 1);
        }
        
        // Channel info
        message.addString (layer.name);
        message.addString ("layer");
        message.addColor ( AbstractTrackBankProxy.getColorEntry (layer.color));
        message.addByte (layer.selected ? 1 : 0);
        message.addInteger (layer.volume);
        message.addString (isVolume && this.isKnobTouched[i] ? layer.volumeStr : "");
        message.addInteger (layer.pan);
        message.addString (isPan && this.isKnobTouched[i] ? layer.panStr : "");
        message.addInteger (this.surface.showVU ? layer.vu : 0);
        message.addBoolean (layer.mute);
        message.addBoolean (layer.solo);
        message.addBoolean (false);
        message.addByte (0);
    }
    
    message.send ();
};

DeviceLayerMode.prototype.updateMenu = function ()
{
    var fxTrackBank = this.model.getEffectTrackBank ();
    var sendOffset = Config.sendsAreToggled ? 4 : 0;
    for (var i = 0; i < 4; i++)
        this.menu[4 + i] = fxTrackBank.getTrack (sendOffset + i).name;
    this.menu[3] = Config.sendsAreToggled ? "Sends 5-8" : "Sends 1-4";
};

DeviceLayerMode.prototype.updateFirstRow = function ()
{
    var cd = this.model.getDevice ();
    if (cd == null || !cd.hasLayers ())
    {
        this.disableFirstRow ();
        return;
    }
    
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    for (var i = 0; i < 8; i++)
    {
        var dl = cd.getLayerOrDrumPad (offset + i);
        this.surface.setButton (20 + i, dl.exists && dl.activated ? (dl.selected ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO) : PUSH_COLOR_BLACK);
    }
};

DeviceLayerMode.prototype.updateSecondRow = function ()
{
    var cd = this.model.getDevice ();
    
    if (Config.isPush2)
    {
        if (Config.wasMuteLongPressed || Config.wasSoloLongPressed || Config.isMuteSoloLocked)
        {
            // Drum Pad Bank has size of 16, layers only 8
            var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
            
            var tb = this.model.getCurrentTrackBank ();
            var muteState = tb.isMuteState ();
            
            for (var i = 0; i < 8; i++)
            {
                var layer = cd.getLayerOrDrumPad (offset + i);

                var color = PUSH_COLOR_BLACK;
                if (layer.exists)
                {
                    if (muteState)
                    {
                        if (layer.mute)
                            color = PUSH_COLOR2_AMBER_LO;
                    }
                    else if (layer.solo)
                        color = PUSH_COLOR2_YELLOW_HI;
                }

                this.surface.setButton (102 + i, color);
            }
            return;
        }
        
        this.surface.setButton (102, this.surface.isActiveMode (MODE_DEVICE_LAYER_VOLUME) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.setButton (103, this.surface.isActiveMode (MODE_DEVICE_LAYER_PAN) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.setButton (104, PUSH_COLOR_BLACK);
        this.surface.setButton (105, PUSH_COLOR_BLACK);
        this.surface.setButton (106, this.surface.isActiveMode (Config.sendsAreToggled ? MODE_DEVICE_LAYER_SEND5 : MODE_DEVICE_LAYER_SEND1) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.setButton (107, this.surface.isActiveMode (Config.sendsAreToggled ? MODE_DEVICE_LAYER_SEND6 : MODE_DEVICE_LAYER_SEND2) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.setButton (108, this.surface.isActiveMode (Config.sendsAreToggled ? MODE_DEVICE_LAYER_SEND7 : MODE_DEVICE_LAYER_SEND3) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        this.surface.setButton (109, this.surface.isActiveMode (Config.sendsAreToggled ? MODE_DEVICE_LAYER_SEND8 : MODE_DEVICE_LAYER_SEND4) ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
        return;
    }
        
    if (cd == null || !cd.hasLayers ())
    {
        this.disableSecondRow ();
        return;
    }
    
    var muteState = this.model.getCurrentTrackBank ().isMuteState ();
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    for (var i = 0; i < 8; i++)
    {
        var dl = cd.getLayerOrDrumPad (offset + i);
        var color = PUSH_COLOR_BLACK;
        if (dl.exists)
        {
            if (muteState)
            {
                if (!dl.mute)
                    color = PUSH_COLOR2_YELLOW_HI;
            }
            else
                color = dl.solo ? PUSH_COLOR2_BLUE_HI : PUSH_COLOR2_GREY_LO;
        }
        this.surface.setButton (102 + i, color);
    }
};
