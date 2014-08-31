// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BaseView (model)
{
    AbstractView.call (this, model);

    this.stopPressed = false;
    // TODO can this be integrated into the event system so all long presses
    // record the mode at the start of the touch down event
    this.longPressPreviousMode = null;
}
BaseView.prototype = new AbstractView ();
BaseView.prototype.constructor = BaseView;

BaseView.lastNoteView = VIEW_PLAY;

BaseView.prototype.onPitchbend = function (data1, data2)
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
            if (data2 == 64)    // Overwrite automatic recentering on release
                data2 = 0;
            this.surface.sendMidiEvent (0xB0, Config.ribbonModeCCVal, data2);
            break;

        case Config.RIBBON_MODE_MIXED:
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
    }
};

//--------------------------------------
// Group 1
//--------------------------------------

BaseView.prototype.onPlay = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.isShiftPressed ())
        this.model.getTransport ().toggleLoop ();
    else
    {
        if (!this.restartFlag)
        {
            this.model.getTransport ().play ();
            this.doubleClickTest ();
        }
        else
        {
            this.model.getTransport ().stopAndRewind ();
            this.restartFlag = false;
        }
    }
};

BaseView.prototype.onRecord = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.isShiftPressed ())
        this.model.getTransport ().toggleLauncherOverdub ();
    else
        this.model.getTransport ().record ();
};

BaseView.prototype.onNew = function (event)
{
    if (!event.isDown ())
        return;
    var tb = this.model.getCurrentTrackBank ();
    var t = tb.getSelectedTrack ();
    if (t != null)
    {
        var slotIndex = this.getSelectedSlot (t);
        if (slotIndex == -1)
            slotIndex = 0;
            
        for (var i = 0; i < 8; i++)
        {
            var sIndex = (slotIndex + i) % 8;
            var s = t.slots[sIndex];
            if (!s.hasContent)
            {
                var slots = tb.getClipLauncherSlots (t.index);
                slots.createEmptyClip (sIndex, Math.pow (2, tb.getNewClipLength ()));
                if (slotIndex != sIndex)
                    slots.select (sIndex);
                slots.launch (sIndex);
                this.model.getTransport ().setLauncherOverdub (true);
                return;
            }
        }
    }
    displayNotification ("In the current selected grid view there is no empty slot. Please scroll down.");
};

BaseView.prototype.onDuplicate = function (event)
{
    if (event.isDown ())
        this.model.getApplication ().doubleClip ();
};

BaseView.prototype.onAutomation = function (event)
{
    if (!event.isDown ())
        return;
    var selectedTrack = this.model.getCurrentTrackBank ().getSelectedTrack ();
    if (selectedTrack != null)
        this.model.getTransport ().toggleWriteArrangerAutomation ();
};

BaseView.prototype.onFixedLength = function (event)
{
    if (!event.isLong ())
        this.surface.setPendingMode (event.isDown () ? MODE_FIXED : this.surface.getPreviousMode ());
};

//--------------------------------------
// Group 2
//--------------------------------------

BaseView.prototype.onQuantize = function (event)
{
    if (!event.isDown ())
        return;

    if (this.surface.isShiftPressed ())
        this.surface.setPendingMode (MODE_GROOVE);
    else
        this.model.getApplication ().quantize ();
};

BaseView.prototype.onDouble = function (event)
{
    if (event.isDown ())
        this.model.getApplication ().duplicate ();
};

BaseView.prototype.onDelete = function (event)
{
    if (event.isUp ())
        this.model.getApplication ().deleteSelection ();
};

BaseView.prototype.onUndo = function (event)
{
    if (!event.isDown ())
        return;
    if (this.surface.isShiftPressed ())
        this.model.getApplication ().redo ();
    else
        this.model.getApplication ().undo ();
};

//--------------------------------------
// Group 3
//--------------------------------------

BaseView.prototype.onSmallKnob1 = function (increase)
{
    this.model.getTransport ().changeTempo (increase);
};

BaseView.prototype.onSmallKnob1Touch = function (isTouched)
{
    this.model.getTransport ().setTempoIndication (isTouched);
};

// Change time (play position)
BaseView.prototype.onSmallKnob2 = function (increase)
{
    this.model.getTransport ().changePosition (increase, this.surface.isShiftPressed ());
};

BaseView.prototype.onSmallKnob2Touch = function (isTouched) {};

//--------------------------------------
// Group 4
//--------------------------------------

BaseView.prototype.onMetronome = function (event)
{
    if (event.isDown ())
        this.model.getTransport ().toggleClick ();
};

BaseView.prototype.onTapTempo = function (event)
{
    if (event.isDown ())
        this.model.getTransport ().tapTempo ();
};

//--------------------------------------
// Group 5
//--------------------------------------

BaseView.prototype.onValueKnobTouch = function (knob, isTouched)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onValueKnobTouch (knob, isTouched);
};

BaseView.prototype.onValueKnob9 = function (value)
{
    this.model.getMasterTrack ().changeVolume (value, this.surface.getFractionValue ());
};

BaseView.prototype.onValueKnob9Touch = function (isTouched)
{
    var isMasterMode = this.surface.getCurrentMode () == MODE_MASTER;
    if (isTouched && isMasterMode)
        return;

    if (isTouched)
        this.surface.setPendingMode (MODE_MASTER_TEMP);
    else if (!isMasterMode)
        this.surface.setPendingMode (this.surface.getPreviousMode ());
};

BaseView.prototype.onFirstRow = function (index)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onFirstRow (index);
};

BaseView.prototype.onSecondRow = function (index)
{
    var m = this.surface.getActiveMode ();
    if (m != null)
        m.onSecondRow (index);
};

//--------------------------------------
// Group 6
//--------------------------------------

BaseView.prototype.onMaster = function (event)
{
    switch (event.getState ())
    {
        case ButtonEvent.UP:
            var restoredMode = this.longPressPreviousMode != null ?
                this.longPressPreviousMode : this.surface.getPreviousMode ();

            if (this.surface.getCurrentMode () == MODE_FRAME)
                this.surface.setPendingMode (restoredMode);

            this.longPressPreviousMode = null;
            break;

        case ButtonEvent.DOWN:
            this.surface.setPendingMode (MODE_MASTER);
            this.model.getMasterTrack ().select ();
            break;

        case ButtonEvent.LONG:
            this.longPressPreviousMode = this.surface.getPreviousMode ();
            this.surface.setPendingMode (MODE_FRAME);
            break;
    }
};

BaseView.prototype.onStop = function (event)
{
    if (this.surface.isShiftPressed ())
    {
        this.model.getCurrentTrackBank ().getClipLauncherScenes ().stop ();
        return;
    }
    this.stopPressed = event.isDown ();
    this.surface.setButton (PUSH_BUTTON_STOP, this.stopPressed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

BaseView.prototype.onScene = function (index) {};

//--------------------------------------
// Group 7
//--------------------------------------

BaseView.prototype.onVolume = function (event)
{
    if (event.isDown ())
        this.surface.setPendingMode (MODE_VOLUME);
};

BaseView.prototype.onPanAndSend = function (event)
{
    if (!event.isDown ())
        return;
    var mode = this.surface.getCurrentMode () + 1;
    if (mode < MODE_PAN || mode > MODE_SEND6)
        mode = MODE_PAN;
    this.surface.setPendingMode (mode);
};

BaseView.prototype.onTrack = function (event)
{
    if (!event.isDown ())
        return;
        
    if (this.surface.isShiftPressed ())
    {
        this.surface.toggleVU ();
        return;
    }
        
    if (this.surface.isActiveMode (MODE_TRACK))
        this.model.toggleCurrentTrackBank ();
    else
        this.surface.setPendingMode (MODE_TRACK);
};

BaseView.prototype.onClip = function (event) {};

BaseView.prototype.onDevice = function (event)
{
    if (!event.isDown ())
        return;
    var selectMode = this.surface.getMode (MODE_PARAM_PAGE_SELECT);
    var cm = this.surface.getCurrentMode ();
    if (cm == MODE_PARAM_PAGE_SELECT || !selectMode.isPageMode (cm))
        this.surface.setPendingMode (selectMode.getCurrentMode ());
    else
        this.surface.setPendingMode (MODE_PARAM_PAGE_SELECT);
};

BaseView.prototype.onBrowse = function (event)
{
    if (!event.isDown ())
        return;

    if (this.surface.getCurrentMode () == MODE_BANK_DEVICE)
        this.surface.setPendingMode (MODE_PRESET);
    else
        this.model.getApplication ().toggleBrowserVisibility (); // Track
};

//--------------------------------------
// Group 8
//--------------------------------------

BaseView.prototype.onDeviceLeft = function (event)
{
    if (!event.isDown ())
        return;

    var tb = this.model.getCurrentTrackBank ();
    if (tb.canScrollTracksUp ())
    {
        tb.scrollTracksPageUp ();
        scheduleTask (doObject (this, this.selectTrack), [7], 100);
    }
};

BaseView.prototype.onDeviceRight = function (event)
{
    if (!event.isDown ())
        return;

    var tb = this.model.getCurrentTrackBank ();
    if (tb.canScrollTracksDown ())
    {
        tb.scrollTracksPageDown ();
        scheduleTask (doObject (this, this.selectTrack), [0], 100);
    }
};

BaseView.prototype.onMute = function (event)
{
    this.model.getCurrentTrackBank ().setTrackState (TrackState.MUTE);
};

BaseView.prototype.onSolo = function (event)
{
    this.model.getCurrentTrackBank ().setTrackState (TrackState.SOLO);
};

BaseView.prototype.onScales = function (event)
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
                this.surface.setPendingMode (this.surface.getPreviousMode ());
            break;
    }
};

BaseView.prototype.onUser = function (event) 
{
    var tb = this.model.getCurrentTrackBank ();
    tb.trackBank.scrollToTrack (15);
};

BaseView.prototype.onRepeat = function (event) {};

BaseView.prototype.onAccent = function (event)
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
                this.surface.setPendingMode (this.surface.getPreviousMode ());
            else
            {
                Config.accentActive = !Config.accentActive;
                this.surface.setButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
            }
            break;
    }
};

BaseView.prototype.onOctaveDown = function (event) {};
BaseView.prototype.onOctaveUp = function (event) {};

//--------------------------------------
// Group 9
//--------------------------------------

BaseView.prototype.onAddEffect = function (event)
{
    if (event.isDown ())
        this.model.getApplication ().addEffect ();
};

BaseView.prototype.onAddTrack = function (event)
{
    if (event.isDown ())
        this.model.getApplication ().addTrack ();
};

BaseView.prototype.onNote = function (event)
{
    if (!event.isDown ())
        return;
    BaseView.lastNoteView = this.surface.isActiveView (VIEW_SESSION) ? BaseView.lastNoteView :
                                (this.surface.isShiftPressed () ? VIEW_DRUM : (this.surface.isActiveView (VIEW_PLAY) ? VIEW_SEQUENCER : VIEW_PLAY));
    this.surface.setActiveView (BaseView.lastNoteView);
};

BaseView.prototype.onSession = function (event)
{
    if (!event.isDown ())
        return;
    BaseView.lastNoteView = this.surface.isActiveView (VIEW_PLAY) ? VIEW_PLAY : (this.surface.isActiveView (VIEW_DRUM) ? VIEW_DRUM : VIEW_SEQUENCER);
    this.surface.setActiveView (VIEW_SESSION);
};

BaseView.prototype.onSelect = function (event) {};

BaseView.prototype.onShift = function (event)
{
    this.surface.setButton (PUSH_BUTTON_SHIFT, event.isUp () ? PUSH_BUTTON_STATE_ON : PUSH_BUTTON_STATE_HI);
    
    var cm = this.surface.getCurrentMode ();
    if (event.isDown () && cm == MODE_SCALES)
        this.surface.setPendingMode (MODE_SCALE_LAYOUT);
    else if (event.isUp () && cm == MODE_SCALE_LAYOUT)
        this.surface.setPendingMode (MODE_SCALES);
};

//--------------------------------------
// Group 11
//--------------------------------------

BaseView.prototype.onFootswitch1 = function (value) {};

BaseView.prototype.onFootswitch2 = function (value)
{
    this.onNew (new ButtonEvent (value == 127 ? ButtonEvent.DOWN : ButtonEvent.UP));
};


//--------------------------------------
// Protected API
//--------------------------------------

BaseView.prototype.updateButtons = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var isMuteState = tb.isMuteState ();
    this.surface.setButton (PUSH_BUTTON_MUTE, isMuteState ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_SOLO, !isMuteState ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};

BaseView.prototype.updateArrows = function ()
{
    this.surface.setButton (PUSH_BUTTON_LEFT, this.canScrollLeft ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
    this.surface.setButton (PUSH_BUTTON_RIGHT, this.canScrollRight ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
    this.surface.setButton (PUSH_BUTTON_UP, this.canScrollUp ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
    this.surface.setButton (PUSH_BUTTON_DOWN, this.canScrollDown ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_OFF);
};

BaseView.prototype.turnOffBlink = function ()
{
    for (var i = 36; i < 100; i++)
        this.surface.pads.blink (i, PUSH_COLOR_BLACK);
};

BaseView.prototype.getSelectedSlot = function (track)
{
    for (var i = 0; i < track.slots.length; i++)
        if (track.slots[i].isSelected)
            return i;
    return -1;
};
