// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractView.BUTTON_REPEAT_INTERVAL = 75;

AbstractView.prototype.stopPressed = false;
AbstractView.prototype.automationPressed = false;
AbstractView.prototype.quitAccentMode = false;
AbstractView.prototype.quitAutomationMode = false;
AbstractView.prototype.quitMasterMode = false;
AbstractView.prototype.selectedTrackBeforeMasterMode = -1;
AbstractView.prototype.showDevices = true;
AbstractView.prototype.pitchValue = 0;
AbstractView.prototype.lastAbstractDeviceMode = 20; // MODE_DEVICE_PARAMS;

AbstractView.prototype.onPitchbend = function (data1, data2)
{
    if (this.surface.isShiftPressed ())
    {
        if (this.surface.getCurrentMode () != MODE_RIBBON)
            this.surface.setPendingMode (MODE_RIBBON);
        return;
    }

    switch (Config.ribbonMode)
    {
        case Config.RIBBON_MODE_PITCH:
            this.surface.sendMidiEvent (0xE0, data1, data2);
            break;

        case Config.RIBBON_MODE_CC:
            this.surface.sendMidiEvent (0xB0, Config.ribbonModeCCVal, data2);
            this.pitchValue = data2;
            break;

        case Config.RIBBON_MODE_CC_PB:
            if (data2 > 64)
                this.surface.sendMidiEvent (0xE0, data1, data2);
            else if (data2 < 64)
                this.surface.sendMidiEvent (0xB0, Config.ribbonModeCCVal, 127 - data2 * 2);
            else
            {
                this.surface.sendMidiEvent (0xE0, data1, data2);
                this.surface.sendMidiEvent (0xB0, Config.ribbonModeCCVal, 0);
            }
            break;

        case Config.RIBBON_MODE_PB_CC:
            if (data2 > 64)
                this.surface.sendMidiEvent (0xB0, Config.ribbonModeCCVal, (data2 - 64) * 2);
            else if (data2 < 64)
                this.surface.sendMidiEvent (0xE0, data1, data2);
            else
            {
                this.surface.sendMidiEvent (0xE0, data1, data2);
                this.surface.sendMidiEvent (0xB0, Config.ribbonModeCCVal, 0);
            }
            break;
            
        case Config.RIBBON_MODE_FADER:
            var tb = this.model.getCurrentTrackBank ();
            var selTrack = tb.getSelectedTrack ();
            if (selTrack != null)
                tb.setVolume (selTrack.index, Config.toDAWValue (data2));
            return;
    }

    this.surface.output.sendPitchbend (data1, data2);
};

AbstractView.prototype.updateRibbonMode = function ()
{
    // Reset current value
    this.surface.setRibbonValue (0);
    
    switch (Config.ribbonMode)
    {
        case Config.RIBBON_MODE_CC:
            this.surface.setRibbonMode (PUSH_RIBBON_VOLUME);
            this.surface.setRibbonValue (this.pitchValue);
            break;

        case Config.RIBBON_MODE_FADER:
            this.surface.setRibbonMode (PUSH_RIBBON_VOLUME);
            var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
            this.surface.setRibbonValue (t == null ? 0 : Config.toMidiValue (this.surface.showVU ? t.vu : t.volume));
            break;

        default:
            this.surface.setRibbonMode (PUSH_RIBBON_PITCHBEND);
            this.surface.setRibbonValue (64);
            break;
    }
};

//--------------------------------------
// Group 1
//--------------------------------------

AbstractView.prototype.onPlay = function (event)
{
    if (!event.isDown ())
        return;

    var transport = this.model.getTransport ();
    if (this.surface.isShiftPressed ())
    {
        if (this.surface.isSelectPressed ())
            transport.togglePunchOut ();
        else
            transport.toggleLoop ();
        return;
    }
    
    if (this.surface.isSelectPressed ())
    {
        transport.togglePunchIn ();
        return;
    }
    
    if (this.restartFlag)
    {
        transport.stopAndRewind ();
        this.restartFlag = false;
    }
    else
    {
        if (Config.gotoZeroOnStop)
        {
            if (transport.isPlaying)
                transport.stopAndRewind ();
            else
                transport.play ();
        }
        else
        {
            transport.play ();
            this.doubleClickTest ();
        }
    }
};

AbstractView.prototype.onRecord = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.isShiftPressed ())
        this.model.getTransport ().toggleLauncherOverdub ();
    else
        this.model.getTransport ().record ();
};

AbstractView.prototype.onNew = function (event)
{
    if (!event.isDown ())
        return;
    var tb = this.model.getCurrentTrackBank ();
    var track = tb.getSelectedTrack ();
    if (track == null)
    {
        displayNotification ("Please select an Instrument track first.");
        return;
    }
        
    var selectedSlot = tb.getSelectedSlot (track.index);
    var slotIndex = selectedSlot == null ? 0 : selectedSlot.index;
    var slot = tb.getEmptySlot (track.index, slotIndex);
    if (slot == null)
    {
        displayNotification ("In the current selected grid view there is no empty slot. Please scroll down.");
        return;
    }
    
    tb.createClip (track.index, slot.index, this.model.getQuartersPerMeasure ());
    var slots = tb.getClipLauncherSlots (track.index);
    if (slotIndex != slot.index)
        slots.select (slot.index);
    slots.launch (slot.index);
    this.model.getTransport ().setLauncherOverdub (true);
};

AbstractView.prototype.onDuplicate = function (event)
{
    if (event.isDown ())
        this.model.getApplication ().duplicate ();
};

AbstractView.prototype.onAutomation = function (event)
{
    if (this.surface.isDeletePressed ())
    {
        this.surface.setButtonConsumed (this.surface.deleteButtonId);
        if (event.isDown ())
            this.model.getTransport ().resetAutomationOverrides ();
    }
    else if (this.surface.isShiftPressed ())
    {
        if (event.isDown ())
            this.model.getTransport ().toggleWriteClipLauncherAutomation ();
    }
    else
    {
        switch (event.getState ())
        {
            case ButtonEvent.DOWN:
                this.quitAutomationMode = false;
                break;
            case ButtonEvent.LONG:
                this.quitAutomationMode = true;
                this.surface.setPendingMode (MODE_AUTOMATION);
                break;
            case ButtonEvent.UP:
                if (this.quitAutomationMode)
                    this.surface.restoreMode ();
                else
                {
                    var selectedTrack = this.model.getCurrentTrackBank ().getSelectedTrack ();
                    if (selectedTrack != null)
                        this.model.getTransport ().toggleWriteArrangerAutomation ();
                }
                break;
        }
    }
};

AbstractView.prototype.onFixedLength = function (event)
{
    if (event.isDown ())
        this.surface.setPendingMode (this.surface.getCurrentMode () == MODE_FIXED ? this.surface.getPreviousMode () : MODE_FIXED);
};

//--------------------------------------
// Group 2
//--------------------------------------

AbstractView.prototype.onQuantize = function (event)
{
    if (!event.isDown ())
        return;

    if (this.surface.isShiftPressed ())
        this.surface.setPendingMode (MODE_GROOVE);
    else
        this.model.getApplication ().quantize ();
};

AbstractView.prototype.onDouble = function (event)
{
    if (event.isDown ())
        displayNotification ("Double: Function not supported (yet).");
};

AbstractView.prototype.onDelete = function (event)
{
    if (event.isUp ())
        this.model.getApplication ().deleteSelection ();
};

AbstractView.prototype.onUndo = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.isShiftPressed ())
        this.model.getApplication ().redo ();
    else
        this.model.getApplication ().undo ();
};

// Push 2 specific

AbstractView.prototype.onLayout = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.getCurrentMode () == MODE_TRACK)
        this.surface.setPendingMode (MODE_VOLUME);
    else
        this.surface.setPendingMode (MODE_TRACK);
};

//--------------------------------------
// Group 3
//--------------------------------------

AbstractView.prototype.onSmallKnob1 = function (increase)
{
    this.model.getTransport ().changeTempo (increase, this.surface.isShiftPressed ());
};

AbstractView.prototype.onSmallKnob1Touch = function (isTouched)
{
    this.model.getTransport ().setTempoIndication (isTouched);
    if (isTouched)
        this.surface.setPendingMode (MODE_TRANSPORT);
    else
        this.surface.restoreMode ();
};

// Change time (play position)
AbstractView.prototype.onSmallKnob2 = function (increase)
{
    this.model.getTransport ().changePosition (increase, this.surface.isShiftPressed ());
};

AbstractView.prototype.onSmallKnob2Touch = function (isTouched)
{
    if (isTouched)
        this.surface.setPendingMode (MODE_TRANSPORT);
    else
        this.surface.restoreMode ();
};

//--------------------------------------
// Group 4
//--------------------------------------

AbstractView.prototype.onMetronome = function (event)
{
    if (event.isDown ())
    {
        if (this.surface.isShiftPressed ())
            this.model.getTransport ().toggleMetronomeTicks ();
        else
            this.model.getTransport ().toggleClick ();
    }
};

AbstractView.prototype.onTapTempo = function (event)
{
    if (event.isDown ())
        this.model.getTransport ().tapTempo ();
};

//--------------------------------------
// Group 5
//--------------------------------------

AbstractView.prototype.onValueKnobTouch = function (knob, isTouched)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onValueKnobTouch (knob, isTouched);
};

AbstractView.prototype.onValueKnob9 = function (value)
{
    if (this.surface.isShiftPressed ())
        this.model.getTransport ().changeMetronomeVolume (value, Config.fractionValue);
    else
        this.model.getMasterTrack ().changeVolume (value, this.surface.getFractionValue ());
};

AbstractView.prototype.onValueKnob9Touch = function (isTouched)
{
    if (this.surface.isDeletePressed ())
    {
        this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
        this.model.getMasterTrack ().resetVolume ();
        return;
    }

    var isMasterMode = this.surface.getCurrentMode () == MODE_MASTER;
    if (isTouched && isMasterMode)
        return;

    if (isTouched)
        this.surface.setPendingMode (MODE_MASTER_TEMP);
    else if (!isMasterMode)
        this.surface.restoreMode ();
};

AbstractView.prototype.onFirstRow = function (index)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onFirstRow (index);
};

AbstractView.prototype.onSecondRow = function (index)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onSecondRow (index);
};

//--------------------------------------
// Group 6
//--------------------------------------

AbstractView.prototype.onMaster = function (event)
{
    switch (event.getState ())
    {
        case ButtonEvent.DOWN:
            this.quitMasterMode = false;
            break;

        case ButtonEvent.UP:
            if (this.quitMasterMode)
                this.surface.restoreMode ();
            else            
            {
                if (this.surface.getCurrentMode () == MODE_MASTER)
                    this.model.getCurrentTrackBank ().select (this.selectedTrackBeforeMasterMode);
                else
                {
                    this.surface.setPendingMode (MODE_MASTER);
                    this.model.getMasterTrack ().select ();
                    var track = this.model.getCurrentTrackBank ().getSelectedTrack ();
                    this.selectedTrackBeforeMasterMode = track == null ? -1 : track.index;
                }
            }
            break;

        case ButtonEvent.LONG:
            this.quitMasterMode = true;
            this.surface.setPendingMode (MODE_FRAME);
            break;
    }
};

AbstractView.prototype.onStop = function (event)
{
    if (this.surface.isShiftPressed ())
    {
        this.model.getCurrentTrackBank ().getClipLauncherScenes ().stop ();
        return;
    }
    this.stopPressed = !event.isUp ();
};

AbstractView.prototype.onScene = function (index) {};

//--------------------------------------
// Group 7
//--------------------------------------

AbstractView.prototype.onVolume = function (event)
{
    if (!event.isDown ())
        return;
    
    var currentMode = this.surface.getCurrentMode ();
    
    // Layer mode selection for Push 1
    if (!Config.isPush2 && this.surface.isSelectPressed ())
    {
        if (currentMode == MODE_DEVICE_LAYER || currentMode >= MODE_DEVICE_LAYER_VOLUME && currentMode <= MODE_DEVICE_LAYER_SEND6)
        {
            this.surface.setPendingMode (MODE_DEVICE_LAYER_VOLUME);
            return;
        }
    }    
    
    if (currentMode == MODE_VOLUME)
        this.surface.setPendingMode (MODE_CROSSFADER);
    else
        this.surface.setPendingMode (MODE_VOLUME);
};

AbstractView.prototype.onPanAndSend = function (event)
{
    if (!event.isDown ())
        return;

    var mode = -1;
    var fxTrackBank = this.model.getEffectTrackBank ();
    var currentMode = this.surface.getCurrentMode ();
    
    // Layer mode selection for Push 1
    if (!Config.isPush2 && this.surface.isSelectPressed ())
    {
        if (currentMode == MODE_DEVICE_LAYER || currentMode >= MODE_DEVICE_LAYER_VOLUME && currentMode <= MODE_DEVICE_LAYER_SEND6)
        {
            if (this.model.getCurrentTrackBank () === fxTrackBank)
            {
                // No Sends on FX tracks
                mode = MODE_DEVICE_LAYER_PAN;
            }
            else
            {
                mode = currentMode + 1;
                // Wrap
                if (mode < MODE_DEVICE_LAYER_PAN || mode > MODE_DEVICE_LAYER_SEND6)
                    mode = MODE_DEVICE_LAYER_PAN;
                // Check if Send channel exists
                if (mode >= MODE_DEVICE_LAYER_SEND1 && mode <= MODE_DEVICE_LAYER_SEND6 && (fxTrackBank != null && !fxTrackBank.getTrack (mode - MODE_DEVICE_LAYER_SEND1).exists))
                    mode = MODE_DEVICE_LAYER_PAN;
            }
            this.surface.setPendingMode (mode);
            return;
        }
    }    
    
    if (this.model.getCurrentTrackBank () === fxTrackBank)
    {
        // No Sends on FX tracks
        mode = MODE_PAN;
    }
    else
    {
        mode = currentMode + 1;
        // Wrap
        if (mode < MODE_PAN || mode > MODE_SEND6)
            mode = MODE_PAN;
        // Check if Send channel exists
        if (mode >= MODE_SEND1 && mode <= MODE_SEND6 && (fxTrackBank != null && !fxTrackBank.getTrack (mode - MODE_SEND1).exists))
            mode = MODE_PAN;
    }
    this.surface.setPendingMode (mode);
};

AbstractView.prototype.onTrack = function (event)
{
    if (!event.isDown ())
        return;
        
    if (this.surface.isShiftPressed ())
    {
        this.surface.toggleVU ();
        Config.setVUMetersEnabled (this.surface.showVU);
        return;
    }
        
    var currentMode = this.surface.getCurrentMode ();
    
    if (Config.isPush2)
    {
        if (currentMode == MODE_TRACK || currentMode == MODE_VOLUME || currentMode == MODE_CROSSFADER || currentMode == MODE_PAN)
        {
            this.model.toggleCurrentTrackBank ();
        }
        else if (currentMode >= MODE_SEND1 && currentMode <= MODE_SEND8)
        {
            this.surface.setPendingMode (MODE_TRACK);
            this.model.toggleCurrentTrackBank ();
        }
        else
            this.surface.setPendingMode (MODE_TRACK);
    }
    else
    {
        // Layer mode selection for Push 1
        if (this.surface.isSelectPressed ())
        {
            if (currentMode == MODE_DEVICE_LAYER || currentMode >= MODE_DEVICE_LAYER_VOLUME && currentMode <= MODE_DEVICE_LAYER_SEND6)
            {
                this.surface.setPendingMode (MODE_DEVICE_LAYER);
                return;
            }
        }    
        
        if (currentMode == MODE_TRACK)
            this.model.toggleCurrentTrackBank ();
        else
            this.surface.setPendingMode (MODE_TRACK);
    }
    
    var tb = this.model.getCurrentTrackBank ();
    var track = tb.getSelectedTrack ();
    if (track == null)
        tb.select (0);
};

AbstractView.prototype.onClip = function (event)
{
    if (event.isDown ())
        this.surface.setPendingMode (MODE_CLIP);
};

AbstractView.prototype.onDevice = function (event)
{
    if (!event.isDown ())
        return;
    var deviceMode = this.surface.getMode (MODE_DEVICE_MODE_SELECT).selectedMode;
    // Device mode selection for Push2 is directly available in the Device mode
    this.surface.setPendingMode (this.surface.getCurrentMode () == deviceMode && !Config.isPush2 ? MODE_DEVICE_MODE_SELECT : deviceMode);
};

AbstractView.prototype.onBrowse = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.isShiftPressed ())
    {
        this.model.getApplication ().toggleBrowserVisibility ();
        return;
    }

    var browser = this.model.getBrowser ();

    // Already browsing?
    if (this.surface.isActiveMode (MODE_DEVICE_PRESETS))
    {
        browser.stopBrowsing (!this.surface.isSelectPressed ());
        this.surface.restoreMode ();
        return;
    }
    
    // Browse for presets
    browser.browseForPresets ();
    this.surface.getMode (MODE_DEVICE_PRESETS).setSession (browser.getPresetSession ());
    this.surface.setPendingMode (MODE_DEVICE_PRESETS);
};

//--------------------------------------
// Group 8
//--------------------------------------

AbstractView.prototype.onDeviceLeft = function (event)
{
    if (!event.isDown ())
        return;

    var cm = this.surface.getCurrentMode ();

    // Group Navigation
    if (isTrackMode (cm))
    {
        var tb = this.model.getCurrentTrackBank ();
        var selTrack = tb.getSelectedTrack ();
        // If it is not a group jump into device mode, otherwise display child channels of group
        if (selTrack != null && !selTrack.isGroup)
            this.onDevice (event);
        else if (!this.model.isEffectTrackBankActive ())
            tb.selectChildren ();
        return;
    }

    // Layer / Device navigation
    var cd = this.model.getDevice ();
    if (!cd.hasSelectedDevice ())
        return;
        
    var isContainer = cd.hasLayers ();
    
    // Workaround for multi output VSTs
    if (this.surface.isShiftPressed () || (isContainer && cd.hasZeroLayers ()))
    {
        if (isContainer)
        {
            if (cd.hasZeroLayers ())
                this.setShowDevices (false);
            else
                this.setShowDevices (!this.showDevices);
        }
        return;
    }

    if (!isContainer)
    {
        if (this.showDevices)
            this.setShowDevices (false);
        return;
    }

    var isLayerMode = false;
    switch (cm)
    {
        case MODE_DEVICE_LAYER:
            isLayerMode = true;
            break;
        case MODE_DEVICE_PARAMS:
        case MODE_DEVICE_COMMON:
        case MODE_DEVICE_ENVELOPE:
        case MODE_DEVICE_MODULATE:
        case MODE_DEVICE_USER:
        case MODE_DEVICE_MACRO:
        case MODE_DEVICE_DIRECT:
            this.lastAbstractDeviceMode = cm;
            break;
        default:
            this.lastAbstractDeviceMode = MODE_DEVICE_PARAMS;
            break;
    }
    
    var dl = cd.getSelectedLayerOrDrumPad ();
    if (isLayerMode)
    {
        if (dl != null)
        {
            cd.enterLayerOrDrumPad (dl.index);
            cd.selectFirstDeviceInLayerOrDrumPad (dl.index);
        }
        this.surface.setPendingMode (this.lastAbstractDeviceMode);
        this.setShowDevices (true);
    }
    else
    {
        if (dl == null)
            cd.selectLayerOrDrumPad (0);
        this.surface.setPendingMode (MODE_DEVICE_LAYER);
    }
};

AbstractView.prototype.onDeviceRight = function (event)
{
    if (!event.isDown ())   
        return;

    var cm = this.surface.getCurrentMode ();

    // Group Navigation
    if (isTrackMode (cm))
    {
        if (!this.model.isEffectTrackBankActive ())
            this.model.getTrackBank ().selectParent ();
        return;
    }
    
    // Layer / Device navigation
    
    var cd = this.model.getDevice ();
    
    // There is no device on the track move upwards to the track view
    if (!cd.hasSelectedDevice ())
    {
        this.onTrack (event);
        return;
    }
        
    if (cm == MODE_DEVICE_LAYER)
    {
        this.surface.setPendingMode (this.lastAbstractDeviceMode);
        cd.selectChannel ();
        this.setShowDevices (true);
        return;
    }

    if (this.showDevices)
    {
        if (cd.isNested ())
        {
            cd.selectParent ();
            this.surface.setPendingMode (MODE_DEVICE_LAYER);
            this.setShowDevices (false);
            cd.selectChannel ();
        }
        else
        {
            // Move up to the track
            this.onTrack (event);
        }
    }
    else
        this.setShowDevices (true);
};

AbstractView.prototype.onMute = function (event)
{
    if (!Config.isPush2)
    {
        this.model.getCurrentTrackBank ().setTrackState (TrackState.MUTE);
        return;
    }

    // Toggle mute lock mode
    if (this.surface.isShiftPressed ())
    {
        if (event.isUp ())
            Config.isMuteSoloLocked = !Config.isMuteSoloLocked;
        return;
    }
    
    // Behaviour like Push 1
    if (Config.isMuteSoloLocked)
    {
        this.model.getCurrentTrackBank ().setTrackState (TrackState.MUTE);
        return;
    }
    
    if (event.isDown ())
    {
        Config.wasMuteLongPressed = false;
        return;
    }

    if (event.isLong ())
    {
        Config.wasMuteLongPressed = true;
        this.model.getCurrentTrackBank ().setTrackState (TrackState.MUTE);
        return;
    }
    
    if (!event.isUp () || Config.wasMuteLongPressed)
    {
        Config.wasMuteLongPressed = false;
        return;
    }
    
    switch (this.surface.activeModeId)
    {
        case MODE_TRACK:
        case MODE_VOLUME:
        case MODE_CROSSFADER:
        case MODE_PAN:
        case MODE_SEND1:
        case MODE_SEND2:
        case MODE_SEND3:
        case MODE_SEND4:
        case MODE_SEND5:
        case MODE_SEND6:
        case MODE_SEND7:
        case MODE_SEND8:
            var tb = this.model.getCurrentTrackBank ();
            var selTrack = tb.getSelectedTrack ();
            if (selTrack != null)
                tb.toggleMute (selTrack.index);
            break;
            
        case MODE_MASTER:
            this.model.getMasterTrack ().toggleMute ();
            break;
            
        case MODE_DEVICE_LAYER:
        case MODE_DEVICE_LAYER_VOLUME:
        case MODE_DEVICE_LAYER_PAN:
        case MODE_DEVICE_LAYER_SEND1:
        case MODE_DEVICE_LAYER_SEND2:
        case MODE_DEVICE_LAYER_SEND3:
        case MODE_DEVICE_LAYER_SEND4:
        case MODE_DEVICE_LAYER_SEND5:
        case MODE_DEVICE_LAYER_SEND6:
        case MODE_DEVICE_LAYER_SEND7:
        case MODE_DEVICE_LAYER_SEND8:
            var cd = this.model.getDevice ();
            var layer = cd.getSelectedLayerOrDrumPad ();
            if (layer != null)
                cd.toggleLayerOrDrumPadMute (layer.index);
            break;
    }
};

AbstractView.prototype.onSolo = function (event)
{
    if (!Config.isPush2)
    {
        this.model.getCurrentTrackBank ().setTrackState (TrackState.SOLO);
        return;
    }
    
    if (this.surface.isShiftPressed ())
    {
        if (event.isUp ())
            Config.isMuteSoloLocked = !Config.isMuteSoloLocked;
        return;
    }
    
    if (Config.isMuteSoloLocked)
    {
        this.model.getCurrentTrackBank ().setTrackState (TrackState.SOLO);
        return;
    }
    
    if (event.isDown ())
    {
        Config.wasSoloLongPressed = false;
        return;
    }

    if (event.isLong ())
    {
        Config.wasSoloLongPressed = true;
        this.model.getCurrentTrackBank ().setTrackState (TrackState.SOLO);
        return;
    }
    
    if (!event.isUp () || Config.wasSoloLongPressed)
    {
        Config.wasSoloLongPressed = false;
        return;
    }
    
    switch (this.surface.activeModeId)
    {
        case MODE_TRACK:
        case MODE_VOLUME:
        case MODE_CROSSFADER:
        case MODE_PAN:
        case MODE_SEND1:
        case MODE_SEND2:
        case MODE_SEND3:
        case MODE_SEND4:
        case MODE_SEND5:
        case MODE_SEND6:
        case MODE_SEND7:
        case MODE_SEND8:
            var tb = this.model.getCurrentTrackBank ();
            var selTrack = tb.getSelectedTrack ();
            if (selTrack != null)
                tb.toggleSolo (selTrack.index);
            break;
            
        case MODE_MASTER:
            this.model.getMasterTrack ().toggleSolo ();
            break;
            
        case MODE_DEVICE_LAYER:
        case MODE_DEVICE_LAYER_VOLUME:
        case MODE_DEVICE_LAYER_PAN:
        case MODE_DEVICE_LAYER_SEND1:
        case MODE_DEVICE_LAYER_SEND2:
        case MODE_DEVICE_LAYER_SEND3:
        case MODE_DEVICE_LAYER_SEND4:
        case MODE_DEVICE_LAYER_SEND5:
        case MODE_DEVICE_LAYER_SEND6:
        case MODE_DEVICE_LAYER_SEND7:
        case MODE_DEVICE_LAYER_SEND8:
            var cd = this.model.getDevice ();
            var layer = cd.getSelectedLayerOrDrumPad ();
            if (layer != null)
                cd.toggleLayerOrDrumPadSolo (layer.index);
            break;
    }
};

AbstractView.prototype.onScales = function (event)
{
    switch (event.getState ())
    {
        case ButtonEvent.DOWN:
            this.quitScalesMode = false;
            this.surface.setPendingMode (this.surface.getCurrentMode () == MODE_SCALES ? this.surface.getPreviousMode () : MODE_SCALES);
            break;
        case ButtonEvent.LONG:
            this.quitScalesMode = true;
            break;
        case ButtonEvent.UP:
            if (this.quitScalesMode)
                this.surface.restoreMode ();
            break;
    }
};

AbstractView.prototype.onConvert = function (event)
{
    if (!event.isDown ())
        return;

    
    var application = this.model.getApplication ();
    var action = application.getAction (this.surface.isShiftPressed () ? "slice_to_multi_sampler_track" : "slice_to_drum_track");
    if (action == null)
    {
        errorln ("Slice action not found.");
        return;
    }
    action.invoke ();
};

AbstractView.prototype.onSetup = function (event)
{
    if (!event.isDown ())
        return;
    
    if (this.surface.isActiveMode (MODE_SETUP))
        this.surface.restoreMode ();
    else
        this.surface.setPendingMode (MODE_SETUP);
};

AbstractView.prototype.onUser = function (event)
{
    if (event.isLong ())
    {
        if (!Config.isPush2)
            this.surface.setPendingMode (MODE_CONFIGURATION);
    }
    else if (event.isUp ())
        this.surface.restoreMode ();
};

AbstractView.prototype.onRepeat = function (event) {};

AbstractView.prototype.onAccent = function (event)
{
    switch (event.getState ())
    {
        case ButtonEvent.DOWN:
            this.quitAccentMode = false;
            break;
        case ButtonEvent.LONG:
            this.quitAccentMode = true;
            this.surface.setPendingMode (MODE_ACCENT);
            break;
        case ButtonEvent.UP:
            if (this.quitAccentMode)
                this.surface.restoreMode ();
            else
                Config.setAccentEnabled (!Config.accentActive);
            break;
    }
};

AbstractView.prototype.onOctaveDown = function (event) {};
AbstractView.prototype.onOctaveUp = function (event) {};

//--------------------------------------
// Group 9
//--------------------------------------

AbstractView.prototype.onAddEffect = function (event)
{
    // TODO API extension required
    //    if (!event.isDown ())
    //        return;
    //    
    //    var browser = this.model.getBrowser ();
    //    browser.browseForDevices ();
    //    this.surface.getMode (MODE_DEVICE_PRESETS).setSession (browser.getDeviceSession ());
    //    this.surface.setPendingMode (MODE_DEVICE_PRESETS);
};

AbstractView.prototype.onAddTrack = function (event)
{
    if (!event.isDown ())
        return;
    
    if (this.surface.isShiftPressed ())
        this.model.getApplication ().addEffectTrack ();
    else if (this.surface.isSelectPressed ())
        this.model.getApplication ().addAudioTrack ();
    else
        this.model.getApplication ().addInstrumentTrack ();
};

AbstractView.prototype.onNote = function (event)
{
    if (!event.isDown ())
        return;
        
    if (this.surface.isActiveView (VIEW_SESSION))
    {
        var tb = this.model.getCurrentTrackBank ();
        var sel = tb.getSelectedTrack ();
        var viewID = VIEW_PLAY;
        if (sel != null)
        {
            viewID = tb.getPreferredView (sel.index);
            if (viewID == null)
                viewID = VIEW_PLAY;
        }
        this.surface.setActiveView (viewID);
        return;
    }
    
    this.surface.setPendingMode (MODE_VIEW_SELECT);
};

AbstractView.prototype.onSession = function (event)
{
    if (event.isDown ())
        this.surface.setActiveView (VIEW_SESSION);
};

AbstractView.prototype.onSelect = function (event) {};

AbstractView.prototype.onShift = function (event)
{
    this.surface.updateButton (PUSH_BUTTON_SHIFT, event.isUp () ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_HI);
    
    var cm = this.surface.getCurrentMode ();
    if (event.isDown () && cm == MODE_SCALES)
        this.surface.setPendingMode (MODE_SCALE_LAYOUT);
    else if (event.isUp () && cm == MODE_SCALE_LAYOUT)
        this.surface.restoreMode ();
};

AbstractView.prototype.scrollLeft = function (event)
{
    var cd = this.model.getDevice ();
    switch (this.surface.getCurrentMode ())
    {
        case MODE_DEVICE_PARAMS:
        case MODE_DEVICE_DIRECT:
        case MODE_DEVICE_COMMON:
        case MODE_DEVICE_ENVELOPE: 
        case MODE_DEVICE_MODULATE:
        case MODE_DEVICE_MACRO:
        case MODE_DEVICE_USER:
            if (this.surface.isShiftPressed ())
                this.surface.getActiveMode ().selectPreviousPageBank ();
            else
                this.surface.getActiveMode ().selectPreviousPage ();
            break;
        
        case MODE_DEVICE_PRESETS:
            break;
    
        case MODE_DEVICE_LAYER:
            if (this.surface.isShiftPressed ())
                cd.previousLayerOrDrumPadBank ();
            else
                cd.previousLayerOrDrumPad ();
            break;
            
        default:
            var tb = this.model.getCurrentTrackBank ();
            var sel = tb.getSelectedTrack ();
            var index = sel == null ? 0 : sel.index - 1;
            if (index == -1 || this.surface.isShiftPressed ())
            {
                if (!tb.canScrollTracksUp ())
                    return;
                tb.scrollTracksPageUp ();
                var newSel = index == -1 || sel == null ? 7 : sel.index;
                scheduleTask (doObject (this, this.selectTrack), [ newSel ], AbstractView.BUTTON_REPEAT_INTERVAL);
                return;
            }
            this.selectTrack (index);
            break;
    }
};

AbstractView.prototype.scrollRight = function (event)
{
    var cd = this.model.getDevice ();
    switch (this.surface.getCurrentMode ())
    {
        case MODE_DEVICE_PARAMS:
        case MODE_DEVICE_DIRECT:
        case MODE_DEVICE_COMMON:
        case MODE_DEVICE_ENVELOPE: 
        case MODE_DEVICE_MODULATE:
        case MODE_DEVICE_MACRO:
        case MODE_DEVICE_USER:
            if (this.surface.isShiftPressed ())
                this.surface.getActiveMode ().selectNextPageBank ();
            else
                this.surface.getActiveMode ().selectNextPage ();
            break;
        
        case MODE_DEVICE_PRESETS:
            break;
            
        case MODE_DEVICE_LAYER:
            if (this.surface.isShiftPressed ())
                cd.nextLayerOrDrumPadBank ();
            else
                cd.nextLayerOrDrumPad ();
            break;
            
        default:
            var tb = this.model.getCurrentTrackBank ();
            var sel = tb.getSelectedTrack ();
            var index = sel == null ? 0 : sel.index + 1;
            if (index == 8 || this.surface.isShiftPressed ())
            {
                if (!tb.canScrollTracksDown ())
                    return;
                tb.scrollTracksPageDown ();
                var newSel = index == 8 || sel == null ? 0 : sel.index;
                scheduleTask (doObject (this, this.selectTrack), [ newSel ], AbstractView.BUTTON_REPEAT_INTERVAL);
                return;
            }
            this.selectTrack (index);
            break;
    }
};

//--------------------------------------
// Group 11
//--------------------------------------

AbstractView.prototype.onFootswitch1 = function (value) {};

AbstractView.prototype.onFootswitch2 = function (value)
{
    var event = new ButtonEvent (value == 127 ? ButtonEvent.DOWN : ButtonEvent.UP);
    switch (Config.footswitch2)
    {
        case Config.FOOTSWITCH_2_TOGGLE_PLAY:
            this.onPlay (event);
            break;
            
        case Config.FOOTSWITCH_2_TOGGLE_RECORD:
            this.onRecord (event);
            break;
            
        case Config.FOOTSWITCH_2_STOP_ALL_CLIPS:
            if (event.isDown ())
                this.model.getCurrentTrackBank ().getClipLauncherScenes ().stop ();
            break;
            
        case Config.FOOTSWITCH_2_TOGGLE_CLIP_OVERDUB:
            if (event.isDown ())
                this.model.getTransport ().toggleLauncherOverdub ();
            break;
            
        case Config.FOOTSWITCH_2_UNDO:
            this.onUndo (event);
            break;
            
        case Config.FOOTSWITCH_2_TAP_TEMPO:
            this.onTapTempo (event);
            break;
            
        case Config.FOOTSWITCH_2_NEW_BUTTON:
            this.onNew (event);
            break;
            
        case Config.FOOTSWITCH_2_CLIP_BASED_LOOPER:
            var tb = this.model.getCurrentTrackBank ();
            var track = tb.getSelectedTrack ();
            if (track == null)
            {
                displayNotification ("Please select an Instrument track first.");
                return;
            }

            var selectedSlot = tb.getSelectedSlot (track.index);
            var slot = selectedSlot == null ? track.slots[0] : selectedSlot;
            var slots = tb.getClipLauncherSlots (track.index);
            if (event.isDown ())
            {
                if (slot.hasContent)
                {
                    // If there is a clip in the selected slot, enable (not toggle) LauncherOverdub. 
                    this.model.getTransport ().setLauncherOverdub (true);
                }
                else
                {
                    // If there is no clip in the selected slot, create a clip and begin record mode. 
                    // Releasing it ends record mode.
                    tb.createClip (track.index, slot.index, this.model.getQuartersPerMeasure ());
                    slots.select (slot.index);
                    this.model.getTransport ().setLauncherOverdub (true);
                }
            }
            else
            {
                // Releasing it would turn off LauncherOverdub.
                this.model.getTransport ().setLauncherOverdub (false);
            }
            // Start transport if not already playing
            slots.launch (slot.index);
            break;
    }
};


//--------------------------------------
// Protected API
//--------------------------------------

AbstractView.prototype.updateButtons = function ()
{
    this.surface.updateButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);

    if (Config.isPush2)
    {
        if (this.surface.isActiveMode (MODE_DEVICE_LAYER))
        {
            var cd = this.model.getDevice ();
            var layer = cd.getSelectedLayerOrDrumPad ();
            this.surface.updateButton (PUSH_BUTTON_MUTE, layer != null && layer.mute ? PUSH_BUTTON_STATE_MUTE_HI : PUSH_BUTTON_STATE_MUTE_ON);
            this.surface.updateButton (PUSH_BUTTON_SOLO, layer != null && layer.solo ? PUSH_BUTTON_STATE_SOLO_HI : PUSH_BUTTON_STATE_SOLO_ON);
        }
        else
        {
            var tb = this.model.getCurrentTrackBank ();
            var selTrack = this.surface.isActiveMode (MODE_MASTER) ? this.model.getMasterTrack () : tb.getSelectedTrack ();
            this.surface.updateButton (PUSH_BUTTON_MUTE, selTrack != null && selTrack.mute ? PUSH_BUTTON_STATE_MUTE_HI : PUSH_BUTTON_STATE_MUTE_ON);
            this.surface.updateButton (PUSH_BUTTON_SOLO, selTrack != null && selTrack.solo ? PUSH_BUTTON_STATE_SOLO_HI : PUSH_BUTTON_STATE_SOLO_ON);
        }
        
        this.surface.updateButton (PUSH_BUTTON_CONVERT,  this.canConvertAudio () ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_OFF);
        return;
    }
    
    var tb = this.model.getCurrentTrackBank ();
    var isMuteState = tb.isMuteState ();
    this.surface.updateButton (PUSH_BUTTON_MUTE, isMuteState ? PUSH_BUTTON_STATE_MUTE_HI : PUSH_BUTTON_STATE_MUTE_ON);
    this.surface.updateButton (PUSH_BUTTON_SOLO, !isMuteState ? PUSH_BUTTON_STATE_SOLO_HI : PUSH_BUTTON_STATE_SOLO_ON);
};

AbstractView.prototype.canConvertAudio = function ()
{
    // TODO Uncomment the printlns to test https://github.com/teotigraphix/Framework4Bitwig/issues/109
    
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    if (selectedTrack == null || !selectedTrack.canHoldAudioData)
    {
        // println("No track");        
        return false;
    }
    var slots = tb.getSelectedSlots (selectedTrack.index);
    if (slots.length == 0)
    {
        // println("No selected slots on: " + selectedTrack.index);        
        return false;
    }
    for (var i = 0; i < slots.length; i++)
    {
        if (slots[0].hasContent)
            return true;
    }

    // println("No slot with content");        
    return false;
};

AbstractView.prototype.updateArrowStates = function ()
{
    switch (this.surface.getCurrentMode ())
    {
        case MODE_DEVICE_PARAMS:
        case MODE_DEVICE_DIRECT:
        case MODE_DEVICE_COMMON:
        case MODE_DEVICE_ENVELOPE: 
        case MODE_DEVICE_MODULATE:
        case MODE_DEVICE_MACRO:
        case MODE_DEVICE_USER:
            var mode = this.surface.getActiveMode ();
            this.canScrollLeft = mode.canSelectPreviousPage ();
            this.canScrollRight = mode.canSelectNextPage ();
            break;
        
        case MODE_DEVICE_PRESETS:
            this.canScrollLeft = false;
            this.canScrollRight = false;
            break;
    
        case MODE_DEVICE_LAYER:
            var cd = this.model.getDevice ();
            this.canScrollLeft = cd.canScrollLayersUp ();
            this.canScrollRight = cd.canScrollLayersDown ();
            break;
            
        default:
            var tb = this.model.getCurrentTrackBank ();
            var sel = tb.getSelectedTrack ();
            this.canScrollLeft = sel != null && sel.index > 0 || tb.canScrollTracksUp ();
            this.canScrollRight = sel != null && (sel.index < 7 && tb.getTrack (sel.index + 1).exists) || tb.canScrollTracksDown ();
            break;
    }
};

AbstractView.prototype.updateArrows = function ()
{
    this.updateArrowStates ();
    this.surface.updateButton (PUSH_BUTTON_LEFT, this.canScrollLeft ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
    this.surface.updateButton (PUSH_BUTTON_RIGHT, this.canScrollRight ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
    this.surface.updateButton (PUSH_BUTTON_UP, this.canScrollUp ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
    this.surface.updateButton (PUSH_BUTTON_DOWN, this.canScrollDown ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
};

AbstractView.prototype.canSelectedTrackHoldNotes = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    return t != null && t.canHoldNotes;
};

AbstractView.prototype.setShowDevices = function (enable)
{
    this.showDevices = enable;
    for (var i = 0; i < DEVICE_MODES.length; i++)
        this.surface.getMode (DEVICE_MODES[i]).setShowDevices (enable);
};
