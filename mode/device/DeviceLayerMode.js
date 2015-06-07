// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceLayerMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_DEVICE_LAYER;
}
DeviceLayerMode.prototype = new BaseMode ();

DeviceLayerMode.prototype.onValueKnob = function (index, value)
{
    var cd = this.model.getCursorDevice ();
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
            cd.changeLayerOrDrumPadSend (selectedDeviceLayer.index, index - 2, value, this.surface.getFractionValue ());
            break;
    }
};

DeviceLayerMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    if (isTouched && this.surface.isDeletePressed ())
    {
        this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
        this.model.getCursorDevice ().resetParameter (index);
    }
};

DeviceLayerMode.prototype.onFirstRow = function (index)
{
    var cd = this.model.getCursorDevice ();
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    var layer = cd.getLayerOrDrumPad (offset + index);
    if (layer.exists)
        cd.selectLayerOrDrumPad (layer.index);
};

DeviceLayerMode.prototype.onSecondRow = function (index)
{
    var cd = this.model.getCursorDevice ();
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    if (this.model.getCurrentTrackBank ().isMuteState ())
        cd.toggleLayerOrDrumPadMute (offset + index);
    else
        cd.toggleLayerOrDrumPadSolo (offset + index);
};

DeviceLayerMode.prototype.updateDisplay = function () 
{
    var d = this.surface.getDisplay ();
    if (this.model.hasSelectedDevice ())
    {
        var cd = this.model.getCursorDevice ();
        var l = cd.getSelectedLayerOrDrumPad ();
        d.clear ();
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
        
        var selIndex = l == null ? -1 : l.index;
        // Drum Pad Bank has size of 16, layers only 8
        var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
        for (var i = 0; i < 8; i++)
        {
            var layer = cd.getLayerOrDrumPad (offset + i);
            var isSel = offset + i == selIndex;
            var n = optimizeName (layer.name, isSel ? 7 : 8);
            d.setCell (3, i, isSel ? Display.RIGHT_ARROW + n : n, Display.FORMAT_RAW);
        }
    }
    else
        d.setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ').clearRow (3);
    d.allDone ();
};

DeviceLayerMode.prototype.updateFirstRow = function ()
{
    if (!this.model.hasSelectedDevice () || !this.model.getCursorDevice ().hasLayers ())
    {
        this.disableFirstRow ();
        return;
    }
    
    var cd = this.model.getCursorDevice ();
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    for (var i = 0; i < 8; i++)
    {
        var dl = cd.getLayerOrDrumPad (offset + i);
        this.surface.setButton (20 + i, dl.exists && dl.activated ? (dl.selected ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO) : PUSH_COLOR_BLACK);
    }
};

DeviceLayerMode.prototype.updateSecondRow = function ()
{
    if (!this.model.hasSelectedDevice () || !this.model.getCursorDevice ().hasLayers ())
    {
        this.disableSecondRow ();
        return;
    }
    
    var cd = this.model.getCursorDevice ();
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
