// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

FrameMode.ROW0          = 'Layouts:                  Panels:                                   ';
FrameMode.ROW1          = 'Arrange  Mix     Edit     Notes   Automate Device  Mixer    Inspectr';
FrameMode.ARRANGER_ROW2 = 'Arranger:                                                           ';
FrameMode.ARRANGER_ROW3 = 'ClpLnchr I/O     Markers  TimelineFXTracks Follow  TrckHght Full    ';
FrameMode.MIXER_ROW2    = 'Mixer:                                                              ';
FrameMode.MIXER_ROW3    = 'ClpLnchr I/O     CrossFde Device  Meters   Sends            Full    ';
FrameMode.EMPTY         = '                                                                    ';

FrameMode.BUTTON_COLOR_OFF  = PUSH_COLOR_GREEN_LO;
FrameMode.BUTTON_COLOR_ON   = PUSH_COLOR_YELLOW_MD;
FrameMode.BUTTON_COLOR2_OFF = PUSH_COLOR2_GREEN_LO;
FrameMode.BUTTON_COLOR2_ON  = PUSH_COLOR2_YELLOW_HI;


function FrameMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_FRAME;
    this.bottomItems = [];
}
FrameMode.prototype = new BaseMode ();

FrameMode.prototype.onFirstRow = function (index) 
{
    var app = this.model.getApplication ();
    switch (index)
    {
        case 0: app.setPanelLayout ('ARRANGE'); break;
        case 1: app.setPanelLayout ('MIX'); break;
        case 2: app.setPanelLayout ('EDIT'); break;
        case 3: app.toggleNoteEditor (); break;
        case 4: app.toggleAutomationEditor (); break;
        case 5: app.toggleDevices (); break;
        case 6: app.toggleMixer (); break;
        case 7: app.toggleInspector (); break;
    }
};

FrameMode.prototype.onSecondRow = function (index)
{
    var app = this.model.getApplication ();
    if (app.isArrangeLayout ())
    {
        var arrange = this.model.getArranger ();
        switch (index)
        {
            case 0: arrange.toggleClipLauncher (); break;
            case 1: arrange.toggleIoSection (); break;
            case 2: arrange.toggleCueMarkerVisibility (); break;
            case 3: arrange.toggleTimeLine (); break;
            case 4: arrange.toggleEffectTracks (); break;
            case 5: arrange.togglePlaybackFollow (); break;
            case 6: arrange.toggleTrackRowHeight (); break;
            case 7: app.toggleFullScreen (); break;
        }
    }
    else if (app.isMixerLayout ())
    {
        var mix = this.model.getMixer ();
        switch (index)
        {
            case 0: mix.toggleClipLauncherSectionVisibility (); break;
            case 1: mix.toggleIoSectionVisibility (); break;
            case 2: mix.toggleCrossFadeSectionVisibility (); break;
            case 3: mix.toggleDeviceSectionVisibility (); break;
            case 4: mix.toggleMeterSectionVisibility (); break;
            case 5: mix.toggleSendsSectionVisibility (); break;
            case 7: app.toggleFullScreen (); break;
        }
    }
};

FrameMode.prototype.updateDisplay = function () 
{
    var app = this.model.getApplication ();
    this.surface.getDisplay ()
        .setRow (0, FrameMode.ROW0)
        .setRow (1, FrameMode.ROW1)
        .setRow (2, app.isArrangeLayout () ? FrameMode.ARRANGER_ROW2 : (app.isMixerLayout () ? FrameMode.MIXER_ROW2 : FrameMode.EMPTY))
        .setRow (3, app.isArrangeLayout () ? FrameMode.ARRANGER_ROW3 : (app.isMixerLayout () ? FrameMode.MIXER_ROW3 : FrameMode.EMPTY));
};

FrameMode.prototype.updateFirstRow = function ()
{
    var app = this.model.getApplication ();
    this.surface.setButton (20, app.isArrangeLayout () ? FrameMode.BUTTON_COLOR_ON : FrameMode.BUTTON_COLOR_OFF);
    this.surface.setButton (21, app.isMixerLayout () ? FrameMode.BUTTON_COLOR_ON : FrameMode.BUTTON_COLOR_OFF);
    this.surface.setButton (22, app.isEditLayout () ? FrameMode.BUTTON_COLOR_ON : FrameMode.BUTTON_COLOR_OFF);
    this.surface.setButton (23, FrameMode.BUTTON_COLOR_OFF);
    this.surface.setButton (24, FrameMode.BUTTON_COLOR_OFF);
    this.surface.setButton (25, FrameMode.BUTTON_COLOR_OFF);
    this.surface.setButton (26, FrameMode.BUTTON_COLOR_OFF);
    this.surface.setButton (27, FrameMode.BUTTON_COLOR_OFF);
};

FrameMode.prototype.updateSecondRow = function ()
{
    var app = this.model.getApplication ();
    if (app.isArrangeLayout ())
    {
        var arrange = this.model.getArranger ();
        this.surface.setButton (102, arrange.isClipLauncherVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (103, arrange.isIoSectionVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (104, arrange.areEffectTracksVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (105, arrange.isTimelineVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (106, arrange.areEffectTracksVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (107, arrange.isPlaybackFollowEnabled () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (108, arrange.hasDoubleRowTrackHeight () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (109, FrameMode.BUTTON_COLOR2_OFF);
    }
    else if (app.isMixerLayout ())
    {
        var mix = this.model.getMixer ();
        this.surface.setButton (102, mix.isClipLauncherSectionVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (103, mix.isIoSectionVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (104, mix.isCrossFadeSectionVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (105, mix.isDeviceSectionVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (106, mix.isMeterSectionVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (107, mix.isSendSectionVisible () ? FrameMode.BUTTON_COLOR2_ON : FrameMode.BUTTON_COLOR2_OFF);
        this.surface.setButton (108, PUSH_COLOR_BLACK);
        this.surface.setButton (109, FrameMode.BUTTON_COLOR2_OFF);
    }
    else
    {
        for (var i = 0; i < 8; i++)
            this.surface.setButton (102 + i, PUSH_COLOR_BLACK);
    }
};
