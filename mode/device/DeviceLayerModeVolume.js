// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceLayerModeVolume (model)
{
    DeviceLayerMode.call (this, model);
    this.id = MODE_DEVICE_LAYER_VOLUME;
}
DeviceLayerModeVolume.prototype = new DeviceLayerMode ();

DeviceLayerModeVolume.prototype.onValueKnob = function (index, value)
{
    var cd = this.model.getDevice ();
    
    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    var layer = cd.getLayerOrDrumPad (offset + index);
    if (layer.exists)
        cd.changeLayerOrDrumPadVolume (index, value, this.surface.getFractionValue ());
};

DeviceLayerModeVolume.prototype.onValueKnobTouch = function (index, isTouched) 
{
    this.isKnobTouched[index] = isTouched;
    
    var cd = this.model.getDevice ();
        
    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    var layer = cd.getLayerOrDrumPad (offset + index);
    if (!layer.exists)
        return;
    
    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
            cd.resetLayerOrDrumPadVolume (index);
            return;
        }

        displayNotification ("Volume: " + layer.volumeStr);
    }
    
    cd.touchLayerOrDrumPadVolume (layer.index, isTouched);
};

DeviceLayerModeVolume.prototype.updateDisplay1 = function () 
{
    var d = this.surface.getDisplay ();
    var cd = this.model.getDevice ();
    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;

    for (var i = 0; i < 8; i++)
    {
        var layer = cd.getLayerOrDrumPad (offset + i);
        d.setCell (0, i, layer.exists ? "Volume" : "", Display.FORMAT_RAW)
         .setCell (1, i, layer.volumeStr, Display.FORMAT_RAW)
         .setCell (2, i, layer.exists ? (this.surface.showVU ? layer.vu : layer.volume) : "", layer.exists ? Display.FORMAT_VALUE : Display.FORMAT_RAW);
    }
    d.done (0).done (1).done (2);

    this.drawRow4 (d, cd);
};

DeviceLayerModeVolume.prototype.updateDisplayElements = function (cd, l)
{
    this.updateChannelDisplay (cd, l, DisplayMessage.GRID_ELEMENT_CHANNEL_VOLUME, true, false);
};
