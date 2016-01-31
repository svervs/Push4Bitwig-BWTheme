// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function Controller ()
{
    Config.init ();

    var output = new MidiOutput ();
    var input = new PushMidiInput ();

    this.scales = new Scales (36, 100, 8, 8);
    this.model = new Model (PUSH_KNOB1, this.scales,
                            8,                        // The number of track to monitor (per track bank)
                            8,                        // The number of scenes to monitor (per scene bank)
                            Config.isPush2 ? 8 : 6,   // The number of sends to monitor
                            6,                        // The number of filters columns in the browser to monitor
                            Config.isPush2 ? 48 : 16, // The number of entries in one filter column to monitor
                            Config.isPush2 ? 48 : 16, // The number of search results in the browser to monitor
                            false);                   // Don't navigate groups, all tracks are flat
    
    this.model.getTrackBank ().addTrackSelectionListener (doObject (this, Controller.prototype.handleTrackChange));
    this.model.getMasterTrack ().addTrackSelectionListener (doObject (this, function (isSelected)
    {
        this.surface.setPendingMode (isSelected ? MODE_MASTER : this.surface.getPreviousMode ());
    }));
    
    this.surface = new Push (output, input);
    this.surface.setDefaultMode (MODE_TRACK);

    this.surface.addMode (MODE_VOLUME, new VolumeMode (this.model));
    this.surface.addMode (MODE_PAN, new PanMode (this.model));
    this.surface.addMode (MODE_CROSSFADER, new CrossfaderMode (this.model));

    var modeSend = new SendMode (this.model);
    this.surface.addMode (MODE_SEND1, modeSend);
    this.surface.addMode (MODE_SEND2, modeSend);
    this.surface.addMode (MODE_SEND3, modeSend);
    this.surface.addMode (MODE_SEND4, modeSend);
    this.surface.addMode (MODE_SEND5, modeSend);
    this.surface.addMode (MODE_SEND6, modeSend);

    this.surface.addMode (MODE_MASTER, new MasterMode (this.model, false));
    this.surface.addMode (MODE_MASTER_TEMP, new MasterMode (this.model, true));    

    this.surface.addMode (MODE_TRACK, new TrackMode (this.model));
    this.surface.addMode (MODE_CLIP, new ClipMode (this.model));
    this.surface.addMode (MODE_FRAME, new FrameMode (this.model));
    this.surface.addMode (MODE_SCALES, new ScalesMode (this.model));
    this.surface.addMode (MODE_SCALE_LAYOUT, new ScaleLayoutMode (this.model));
    this.surface.addMode (MODE_ACCENT, new AccentMode (this.model));
    this.surface.addMode (MODE_FIXED, new FixedMode (this.model));
    this.surface.addMode (MODE_RIBBON, new RibbonMode (this.model));
    this.surface.addMode (MODE_GROOVE, new GrooveMode (this.model));
    this.surface.addMode (MODE_VIEW_SELECT, new ViewSelectMode (this.model));
    this.surface.addMode (MODE_AUTOMATION, new AutomationMode (this.model));
    this.surface.addMode (MODE_TRANSPORT, new TransportMode (this.model));

    this.surface.addMode (MODE_DEVICE_MODE_SELECT, new DeviceModeSelectMode (this.model));
    this.surface.addMode (MODE_DEVICE_PARAMS, new DeviceParamsMode (this.model));
    this.surface.addMode (MODE_DEVICE_LAYER, new DeviceLayerMode (this.model));
    
    this.surface.addMode (MODE_DEVICE_COMMON, new DeviceCommonMode (this.model));
    this.surface.addMode (MODE_DEVICE_ENVELOPE, new DeviceEnvelopeMode (this.model));
    this.surface.addMode (MODE_DEVICE_MACRO, new DeviceMacroMode (this.model));
    this.surface.addMode (MODE_DEVICE_MODULATE, new DeviceModulationMode (this.model));
    this.surface.addMode (MODE_DEVICE_USER, new DeviceUserMode (this.model));
    
    this.surface.addMode (MODE_DEVICE_DIRECT, new DeviceDirectMode (this.model, MODE_DEVICE_DIRECT, 'Direct'));
    this.surface.addMode (MODE_DEVICE_PRESETS, new DevicePresetsMode (this.model));
    
    this.surface.addMode (MODE_DEVICE_LAYER_VOLUME, new DeviceLayerModeVolume (this.model));
    this.surface.addMode (MODE_DEVICE_LAYER_PAN, new DeviceLayerModePan (this.model));
    var modeLayerSend = new DeviceLayerModeSend (this.model);
    this.surface.addMode (MODE_DEVICE_LAYER_SEND1, modeLayerSend);
    this.surface.addMode (MODE_DEVICE_LAYER_SEND2, modeLayerSend);
    this.surface.addMode (MODE_DEVICE_LAYER_SEND3, modeLayerSend);
    this.surface.addMode (MODE_DEVICE_LAYER_SEND4, modeLayerSend);
    this.surface.addMode (MODE_DEVICE_LAYER_SEND5, modeLayerSend);
    this.surface.addMode (MODE_DEVICE_LAYER_SEND6, modeLayerSend);
    
    if (Config.isPush2)
    {
        this.surface.addMode (MODE_SEND7, modeSend);
        this.surface.addMode (MODE_SEND8, modeSend);
        this.surface.addMode (MODE_DEVICE_LAYER_SEND7, modeLayerSend);
        this.surface.addMode (MODE_DEVICE_LAYER_SEND8, modeLayerSend);
        this.surface.addMode (MODE_SETUP, new SetupMode (this.model));
        this.surface.addMode (MODE_INFO, new InfoMode (this.model));
        
        Config.addPropertyListener (Config.DISPLAY_BRIGHTNESS, doObject (this, function ()
        {
            this.surface.sendDisplayBrightness ();
        }));
        Config.addPropertyListener (Config.LED_BRIGHTNESS, doObject (this, function ()
        {
            this.surface.sendLEDBrightness ();
        }));
        Config.addPropertyListener (Config.PAD_SENSITIVITY, doObject (this, function ()
        {
            this.surface.sendPadVelocityCurve ();
            this.surface.sendPadThreshold ();
        }));
        Config.addPropertyListener (Config.PAD_GAIN, doObject (this, function ()
        {
            this.surface.sendPadVelocityCurve ();
            this.surface.sendPadThreshold ();
        }));
        Config.addPropertyListener (Config.PAD_DYNAMICS, doObject (this, function ()
        {
            this.surface.sendPadVelocityCurve ();
            this.surface.sendPadThreshold ();
        }));
    }
    else
    {
        this.surface.addMode (MODE_CONFIGURATION, new ConfigurationMode (this.model));
        
        Config.addPropertyListener (Config.VELOCITY_CURVE, doObject (this, function ()
        {
            this.surface.sendPadSensitivity ();
        }));
        Config.addPropertyListener (Config.PAD_THRESHOLD, doObject (this, function ()
        {
            this.surface.sendPadSensitivity ();
        }));
    }
    
    this.surface.addModeListener (doObject (this, function (oldMode, newMode)
    {
        this.updateMode (-1);
        this.updateMode (newMode);
    }));
    
    Config.addPropertyListener (Config.RIBBON_MODE, doObject (this, function ()
    {
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateRibbonMode ();
    }));
    Config.addPropertyListener (Config.SCALES_SCALE, doObject (this, function ()
    {
        this.scales.setScaleByName (Config.scale);
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.SCALES_BASE, doObject (this, function ()
    {
        this.scales.setScaleOffsetByName (Config.scaleBase);
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.SCALES_IN_KEY, doObject (this, function ()
    {
        this.scales.setChromatic (!Config.scaleInKey);
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.SCALES_LAYOUT, doObject (this, function ()
    {
        this.scales.setScaleLayoutByName (Config.scaleLayout);
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.ENABLE_VU_METERS, doObject (this, function ()
    {
        this.surface.showVU = Config.enableVUMeters;
    }));
    Config.addPropertyListener (Config.DEFAULT_DEVICE_MODE, doObject (this, function ()
    {
        this.surface.getMode (MODE_DEVICE_MODE_SELECT).selectedMode = Config.defaultDeviceMode;
        var currentMode = this.surface.getCurrentMode();
        if (currentMode == null)
            return;
        // Only switch if the user is already in a device mode
        if (currentMode < Config.DEFAULT_DEVICE_MODE_VALUES.length && Config.DEFAULT_DEVICE_MODE_VALUES[currentMode])
            this.surface.setPendingMode (Config.defaultDeviceMode);
    }));
    Config.addPropertyListener (Config.FLIP_SESSION, doObject (this, function ()
    {
        var view = this.surface.getView (VIEW_SESSION);
        view.flip = Config.flipSession;
    }));
    
    this.surface.addView (VIEW_PLAY, new PlayView (this.model));
    this.surface.addView (VIEW_SESSION, new SessionView (this.model));
    this.surface.addView (VIEW_SEQUENCER, new SequencerView (this.model));
    this.surface.addView (VIEW_DRUM, new DrumView (this.model));
    this.surface.addView (VIEW_RAINDROPS, new RaindropsView (this.model));
    this.surface.addView (VIEW_PIANO, new PianoView (this.model));
    this.surface.addView (VIEW_PRG_CHANGE, new PrgChangeView (this.model));
    this.surface.addView (VIEW_CLIP, new ClipView (this.model));
    
    scheduleTask (doObject (this, function ()
    {
        this.surface.setActiveView (VIEW_PLAY);
        this.surface.setActiveMode (MODE_TRACK);
    }), null, 100);
}
Controller.prototype = new AbstractController ();

Controller.prototype.flush = function ()
{
    AbstractController.prototype.flush.call (this);
    
    var t = this.model.getTransport ();
    this.surface.updateButton (PUSH_BUTTON_METRONOME, t.isClickOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_PLAY, t.isPlaying ? PUSH_BUTTON_STATE_PLAY_HI : PUSH_BUTTON_STATE_PLAY_ON);
    this.surface.updateButton (PUSH_BUTTON_RECORD, t.isRecording ? PUSH_BUTTON_STATE_REC_HI : PUSH_BUTTON_STATE_REC_ON);
    var view = this.surface.getActiveView ();
    this.surface.updateButton (PUSH_BUTTON_STOP, view && view.stopPressed ? PUSH_BUTTON_STATE_STOP_HI : PUSH_BUTTON_STATE_STOP_ON);
    
    // Automation
    if (this.surface.isShiftPressed ())
        this.surface.updateButton (PUSH_BUTTON_AUTOMATION, t.isWritingClipLauncherAutomation ? PUSH_BUTTON_STATE_REC_HI : PUSH_BUTTON_STATE_REC_ON);
    else
        this.surface.updateButton (PUSH_BUTTON_AUTOMATION, t.isWritingArrangerAutomation ? PUSH_BUTTON_STATE_REC_HI : PUSH_BUTTON_STATE_REC_ON);

    this.updateMode (this.surface.getCurrentMode ());
};

Controller.prototype.updateMode = function (mode)
{
    this.updateIndication (mode);
    
    var isMasterOn = mode == MODE_MASTER || mode == MODE_FRAME;
    var isVolumeOn = mode == MODE_VOLUME || mode == MODE_CROSSFADER;  
    var isPanOn    = mode >= MODE_PAN && mode <= MODE_SEND8;
    var isDeviceOn = (mode >= MODE_DEVICE_PARAMS && mode <= MODE_DEVICE_LAYER) || (mode >= MODE_DEVICE_LAYER_VOLUME && mode <= MODE_DEVICE_LAYER_SEND);

    var isMixOn = mode == MODE_TRACK;
    if (Config.isPush2)
        isMixOn = isMixOn || isVolumeOn || isPanOn;

    this.surface.updateButton (PUSH_BUTTON_MASTER, isMasterOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_TRACK, isMixOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_VOLUME, isVolumeOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_PAN_SEND, isPanOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_DEVICE, isDeviceOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_SCALES, mode == MODE_SCALES ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_FIXED_LENGTH, mode == MODE_FIXED ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_BROWSE, mode == MODE_DEVICE_PRESETS ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_CLIP, mode == MODE_CLIP ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    
    if (Config.isPush2)
        this.surface.updateButton (PUSH_BUTTON_SETUP, mode == MODE_SETUP ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

Controller.prototype.updateIndication = function (mode)
{
    var mt = this.model.getMasterTrack ();
    mt.setVolumeIndication (mode == MODE_MASTER);
    mt.setPanIndication (mode == MODE_MASTER);

    this.model.getGroove ().setIndication (mode == MODE_GROOVE);

    var isVolume = mode == MODE_VOLUME;
    var isPan    = mode == MODE_PAN;
    
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    for (var i = 0; i < 8; i++)
    {
        var hasTrackSel = selectedTrack != null && selectedTrack.index == i && mode == MODE_TRACK;
        tb.setVolumeIndication (i, isVolume || hasTrackSel);
        tb.setPanIndication (i, isPan || hasTrackSel);
        for (var j = 0; j < 6; j++)
        {
            tb.setSendIndication (i, j,
                mode == MODE_SEND1 && j == 0 ||
                mode == MODE_SEND2 && j == 1 ||
                mode == MODE_SEND3 && j == 2 ||
                mode == MODE_SEND4 && j == 3 ||
                mode == MODE_SEND5 && j == 4 ||
                mode == MODE_SEND6 && j == 5 ||
                hasTrackSel
            );
        }

        var cd = this.model.getDevice ();
        cd.getParameter (i).setIndication (mode == MODE_DEVICE_PARAMS);
        cd.getCommonParameter (i).setIndication (mode == MODE_DEVICE_COMMON);
        cd.getEnvelopeParameter (i).setIndication (mode == MODE_DEVICE_ENVELOPE);
        cd.getMacro (i).getAmount ().setIndication (mode == MODE_DEVICE_MACRO);
        
        var uc = this.model.getUserControlBank ();
        uc.getControl (i).setIndication (mode == MODE_DEVICE_USER);
    }
};

Controller.prototype.handleTrackChange = function (index, isSelected)
{
    if (!isSelected)
        return;

    if (this.surface.isActiveMode (MODE_MASTER))
        this.surface.setPendingMode (MODE_TRACK);
        
    // Recall last used view (if we are not in session mode)
    if (!this.surface.isActiveView (VIEW_SESSION))
    {
        var tb = this.model.getCurrentTrackBank ();
        var viewID = tb.getPreferredView (index);
        if (viewID == null)
            viewID = tb.getTrack (index).canHoldNotes ? VIEW_PLAY : VIEW_CLIP;
        this.surface.setActiveView (viewID);
    }
    if (this.surface.isActiveView (VIEW_PLAY))
        this.surface.getActiveView ().updateNoteMapping ();
     
    // Reset drum octave because the drum pad bank is also reset
    this.scales.setDrumOctave (0);
    this.surface.getView (VIEW_DRUM).updateNoteMapping ();
};
