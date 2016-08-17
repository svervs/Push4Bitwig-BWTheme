// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceLayerModePan (model)
{
    DeviceLayerMode.call (this, model);
    this.id = MODE_DEVICE_LAYER_PAN;
}
DeviceLayerModePan.prototype = new DeviceLayerMode ();

DeviceLayerModePan.prototype.onValueKnob = function (index, value)
{
    var cd = this.model.getDevice ();
    
    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;
    var layer = cd.getLayerOrDrumPad (offset + index);
    if (layer.exists)
        cd.changeLayerOrDrumPadPan (index, value, this.surface.getFractionValue ());
};

DeviceLayerModePan.prototype.onValueKnobTouch = function (index, isTouched) 
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
            cd.resetLayerOrDrumPadPan (index);
            return;
        }

        displayNotification ("Pan: " + layer.panStr);
    }
    
    cd.touchLayerOrDrumPadPan (layer.index, isTouched);
    this.checkStopAutomationOnKnobRelease (isTouched);
};

DeviceLayerModePan.prototype.updateDisplay1 = function () 
{
    var d = this.surface.getDisplay ();
    var cd = this.model.getDevice ();
    // Drum Pad Bank has size of 16, layers only 8
    var offset = cd.hasDrumPads () && cd.getSelectedDrumPad () != null && cd.getSelectedDrumPad ().index > 7 ? 8 : 0;

    for (var i = 0; i < 8; i++)
    {
        var layer = cd.getLayerOrDrumPad (offset + i);
        d.setCell (0, i, layer.exists ? "Pan" : "", Display.FORMAT_RAW)
         .setCell (1, i, layer.panStr, Display.FORMAT_RAW)
         .setCell (2, i, layer.exists ? layer.pan : "", layer.exists ? Display.FORMAT_VALUE : Display.FORMAT_RAW);
    }
    d.done (0).done (1).done (2);

    this.drawRow4 (d, cd);
};

DeviceLayerModePan.prototype.updateDisplayElements = function (cd, l)
{
    this.updateChannelDisplay (cd, l, DisplayMessage.GRID_ELEMENT_CHANNEL_PAN, false, true);
};
