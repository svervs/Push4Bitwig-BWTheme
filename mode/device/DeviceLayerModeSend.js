// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceLayerModeSend (model)
{
    DeviceLayerMode.call (this, model);
    this.id = MODE_DEVICE_LAYER_SEND;
}
DeviceLayerModeSend.prototype = new DeviceLayerMode ();

DeviceLayerModeSend.prototype.onValueKnob = function (index, value)
{
    var cd = this.model.getDevice ();
    
    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    var layer = cd.getLayerOrDrumPad (offset + index);
    if (!layer.exists)
        return;
    var sendIndex = this.getCurrentSendIndex ();
    cd.changeLayerOrDrumPadSend (index, sendIndex, value, this.surface.getFractionValue ());
    
};

DeviceLayerModeSend.prototype.onValueKnobTouch = function (index, isTouched) 
{
    this.isKnobTouched[index] = isTouched;
    
    var cd = this.model.getDevice ();
        
    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    var layer = cd.getLayerOrDrumPad (offset + index);
    if (!layer.exists)
        return;
    
    var sendIndex = this.getCurrentSendIndex ();

    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
            cd.resetLayerSend (index, sendIndex);
            return;
        }

        var fxTrackBank = this.model.getEffectTrackBank ();
        var name = (fxTrackBank == null ? layer.sends[sendIndex].name : fxTrackBank.getTrack (sendIndex).name);
        if (name.length > 0)
            displayNotification ("Send " + name + ": " + layer.sends[sendIndex].volumeStr);
    }
    
    cd.touchLayerOrDrumPadSend (index, sendIndex, isTouched);
    this.checkStopAutomationOnKnobRelease (isTouched);
};

DeviceLayerModeSend.prototype.updateDisplayElements = function (cd, l)
{
    var d = this.surface.getDisplay ();
    var sendIndex = this.getCurrentSendIndex ();
    var tb = this.model.getCurrentTrackBank ();
    var fxTrackBank = this.model.getEffectTrackBank ();

    this.updateMenu ();

    var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);

    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    var sendOffset = Config.sendsAreToggled ? 4 : 0;
    for (var i = 0; i < 8; i++)
    {
        var layer = cd.getLayerOrDrumPad (offset + i);

        message.addByte (DisplayMessage.GRID_ELEMENT_CHANNEL_SENDS);
        
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
            message.addBoolean (i > 3 && i - 4 + sendOffset == sendIndex);
        }
        
        // Channel info
        message.addString (layer.name);
        message.addString ("layer");
        message.addColor (cd.getLayerOrDrumPadColorEntry (offset + i));
        message.addByte (layer.selected ? 1 : 0);

        for (var j = 0; j < 4; j++)
        {
            var sendPos = sendOffset + j;
            var send = layer.sends[sendPos];
            message.addString (fxTrackBank == null ? send.name : fxTrackBank.getTrack (sendPos).name);
            message.addString (send && sendIndex == sendPos && this.isKnobTouched[i] ? send.volumeStr : "");
            message.addInteger(send ? send.volume : "");
            message.addByte (sendIndex == sendPos ? 1 : 0);
        }
        
        // Signal Track mode off
        message.addBoolean (false);
    }
    
    message.send ();
};

DeviceLayerModeSend.prototype.updateDisplay1 = function () 
{
    var d = this.surface.getDisplay ();
    var cd = this.model.getDevice ();
    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    var sendIndex = this.getCurrentSendIndex ();

    for (var i = 0; i < 8; i++)
    {
        var layer = cd.getLayerOrDrumPad (offset + i);
        d.setCell (0, i, layer.exists ? layer.sends[sendIndex].name : "", Display.FORMAT_RAW)
         .setCell (1, i, layer.sends[sendIndex].volumeStr, Display.FORMAT_RAW)
         .setCell (2, i, layer.exists ? layer.sends[sendIndex].volume : "", layer.exists ? Display.FORMAT_VALUE : Display.FORMAT_RAW);
    }
    d.done (0).done (1).done (2);

    this.drawRow4 (d, cd);
};

DeviceLayerModeSend.prototype.getCurrentSendIndex = function ()
{
    return this.surface.getCurrentMode () - MODE_DEVICE_LAYER_SEND1;
};
