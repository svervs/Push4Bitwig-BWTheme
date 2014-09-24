// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function Controller ()
{
    Config.init ();

    var output = new MidiOutput ();
    var input = new PushMidiInput ();
    input.init ();

    var scales = new Scales (36, 100, 8, 8);
    this.model = new Model (PUSH_KNOB1, scales);
    this.model.getTrackBank ().addTrackSelectionListener (doObject (this, function (index, isSelected)
    {
        if (isSelected && this.surface.isActiveMode (MODE_MASTER))
            this.surface.setPendingMode (MODE_TRACK);
        if (this.surface.isActiveView (VIEW_PLAY))
            this.surface.getActiveView ().updateNoteMapping ();
    }));
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
    this.surface.addMode (MODE_FRAME, new FrameMode (this.model));
    this.surface.addMode (MODE_SCALES, new ScalesMode (this.model));
    this.surface.addMode (MODE_SCALE_LAYOUT, new ScaleLayoutMode (this.model));
    this.surface.addMode (MODE_ACCENT, new AccentMode (this.model));
    this.surface.addMode (MODE_FIXED, new FixedMode (this.model));
    this.surface.addMode (MODE_RIBBON, new RibbonMode (this.model));
    this.surface.addMode (MODE_GROOVE, new GrooveMode (this.model));

    this.surface.addMode (MODE_PARAM_PAGE_SELECT, new ParamPageSelectMode (this.model));
    this.surface.addMode (MODE_BANK_DEVICE, new DeviceMode (this.model));
    this.surface.addMode (MODE_BANK_COMMON, new ParamPageMode (this.model, MODE_BANK_COMMON, 'Common'));
    this.surface.addMode (MODE_BANK_ENVELOPE, new ParamPageMode (this.model, MODE_BANK_ENVELOPE, 'Envelope'));
    this.surface.addMode (MODE_BANK_MODULATE, new ParamPageMode (this.model, MODE_BANK_MODULATE, 'Modulate'));
    this.surface.addMode (MODE_BANK_USER, new ParamPageMode (this.model, MODE_BANK_USER, 'User'));
    this.surface.addMode (MODE_BANK_MACRO, new ParamPageMode (this.model, MODE_BANK_MACRO, 'Macro'));
    this.surface.addMode (MODE_PRESET, new PresetMode (this.model));
    
    this.surface.addModeListener (doObject (this, function (oldMode, newMode)
    {
        this.updateMode (-1);
        this.updateMode (newMode);
    }));
    
    Config.addPropertyListener (Config.RIBBON_MODE, doObject (this, function ()
    {
        this.surface.getActiveView ().updateRibbonMode ();
    }));

    
    this.surface.addView (VIEW_PLAY, new PlayView (this.model));
    this.surface.addView (VIEW_SESSION, new SessionView (this.model));
    this.surface.addView (VIEW_SEQUENCER, new SequencerView (this.model));
    this.surface.addView (VIEW_DRUM, new DrumView (this.model));
    
    this.surface.setActiveView (VIEW_PLAY);
    this.surface.setActiveMode (MODE_TRACK);
}
Controller.prototype = new AbstractController ();

Controller.prototype.flush = function ()
{
    AbstractController.prototype.flush.call (this);
    
    var t = this.model.getTransport ();
    this.surface.setButton (PUSH_BUTTON_METRONOME, t.isClickOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_PLAY, t.isPlaying ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_RECORD, t.isRecording ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    
    // Send, Mute, Automation
    var track = this.model.getCurrentTrackBank ().getSelectedTrack ();
    if (track == null)
        this.surface.setButton (PUSH_BUTTON_AUTOMATION, PUSH_BUTTON_STATE_OFF);
    else
        this.surface.setButton (PUSH_BUTTON_AUTOMATION, track.autowrite ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

Controller.prototype.updateMode = function (mode)
{
    var isMaster       = mode == MODE_MASTER;
    var isTrack        = mode == MODE_TRACK;
    var isVolume       = mode == MODE_VOLUME;
    var isPan          = mode == MODE_PAN;
    var isScales       = mode == MODE_SCALES;
    var isFixed        = mode == MODE_FIXED;
    var isPreset       = mode == MODE_PRESET;
    var isFrame        = mode == MODE_FRAME;
    var isGroove       = mode == MODE_GROOVE;

    var isBankDevice   = mode == MODE_BANK_DEVICE;
    var isBankCommon   = mode == MODE_BANK_COMMON;
    var isBankEnvelope = mode == MODE_BANK_ENVELOPE;
    var isBankUser     = mode == MODE_BANK_USER;
    var isBankMacro    = mode == MODE_BANK_MACRO;

    this.updateIndication (mode);

    this.surface.setButton (PUSH_BUTTON_MASTER, isMaster || isFrame ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_TRACK, isTrack ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_VOLUME, isVolume ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_PAN_SEND, mode >= MODE_PAN && mode <= MODE_SEND6 ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_DEVICE, isBankDevice || isBankMacro ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_SCALES, isScales ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_FIXED_LENGTH, isFixed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_BROWSE, isPreset ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

Controller.prototype.updateIndication = function (mode)
{
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

        var cd = this.model.getCursorDevice ();
        cd.getParameter (i).setIndication (mode == MODE_BANK_DEVICE);
        cd.getCommonParameter (i).setIndication (mode == MODE_BANK_COMMON);
        cd.getEnvelopeParameter (i).setIndication (mode == MODE_BANK_ENVELOPE);
        cd.getMacro (i).getAmount ().setIndication (mode == MODE_BANK_MACRO);
        
        var uc = this.model.getUserControlBank ();
        uc.getControl (i).setIndication (mode == MODE_BANK_USER);
    
        var mt = this.model.getMasterTrack ();
        mt.setVolumeIndication (mode == MODE_MASTER);
        mt.setPanIndication (mode == MODE_MASTER);

        this.model.getGroove ().setIndication (mode == MODE_GROOVE);
    }
};
