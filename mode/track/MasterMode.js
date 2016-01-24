// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

MasterMode.PARAM_NAMES = 'Volume   Pan                                                        ';

function MasterMode (model, isTemporary)
{
    BaseMode.call (this, model);
    this.id = MODE_MASTER;
    this.isTemporary = isTemporary;
}
MasterMode.prototype = new BaseMode ();

MasterMode.prototype.onValueKnob = function (index, value)
{
    if (index == 0)
        this.model.getMasterTrack ().changeVolume (value, this.surface.getFractionValue ());
    else if (index == 1)
        this.model.getMasterTrack ().changePan (value, this.surface.getFractionValue ());
};

MasterMode.prototype.onValueKnobTouch = function (index, isTouched)
{
    this.isKnobTouched[index] = isTouched;
    
    if (isTouched)
    {
        if (this.surface.isDeletePressed ())
        {
            this.surface.setButtonConsumed (PUSH_BUTTON_DELETE);
            if (index == 0)
                this.model.getMasterTrack ().resetVolume ();
            else if (index == 1)
                this.model.getMasterTrack ().resetPan ();
            return;
        }

        if (index == 0)
            displayNotification ("Volume: " + this.model.getMasterTrack ().getVolumeString ());
        else if (index == 1)
            displayNotification ("Pan: " + this.model.getMasterTrack ().getPanString ());
    }
    
    if (index == 0)
        this.model.getMasterTrack ().touchVolume (isTouched);
    else if (index == 1)
        this.model.getMasterTrack ().touchPan (isTouched);
};

MasterMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    var master = this.model.getMasterTrack ();
    
    if (Config.isPush2)
    {
        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
        
        message.addByte (DisplayMessage.GRID_ELEMENT_CHANNEL_ALL);
        message.addString ("");
        message.addBoolean (false);
        
        // Channel info
        message.addString (master.getName ());
        message.addString ("master");
        message.addColor (AbstractTrackBankProxy.getColorEntry (master.color));
        message.addByte (master.selected ? 1 : 0);
        message.addInteger (master.volume);
        message.addString (this.isKnobTouched[0] ? master.getVolumeString () : "");
        message.addInteger (master.getPan ());
        message.addString (this.isKnobTouched[1] ? master.getPanString () : "");
        message.addInteger (this.surface.showVU ? master.getVU () : 0);
        message.addBoolean (master.isMute ());
        message.addBoolean (master.isSolo ());
        message.addBoolean (false);
        message.addByte (0);
        
        for (var i = 1; i < 8; i++)
        {
            message.addByte (DisplayMessage.GRID_ELEMENT_CHANNEL_SELECTION);
            message.addString ("");
            message.addBoolean (false);
            
            // Channel info
            message.addString ("");
            message.addString (0);
            message.addColor (0);
            message.addByte (0);
        }
        
        message.send ();
    }
    else
    {
        d.setRow (0, MasterMode.PARAM_NAMES)
         .setCell (1, 0, master.getVolumeString (), Display.FORMAT_RAW)
         .setCell (1, 1, master.getPanString (), Display.FORMAT_RAW)
         .clearCell (1, 2).clearCell (1, 3).clearCell (1, 4).clearCell (1, 5)
         .clearCell (1, 6).clearCell (1, 7).done (1)
        
         .setCell (2, 0, this.surface.showVU ? master.getVU () : master.getVolume (), Display.FORMAT_VALUE)
         .setCell (2, 1, master.getPan (), Display.FORMAT_PAN)
         .clearCell (2, 2).clearCell (2, 3).clearCell (2, 4).clearCell (2, 5)
         .clearCell (2, 6).clearCell (2, 7).done (2)
        
         .setCell (3, 0, master.getName (), Display.FORMAT_RAW)
         .clearCell (3, 1).clearCell (3, 2).clearCell (3, 3).clearCell (3, 4).clearCell (3, 5)
         .clearCell (3, 6).clearCell (3, 7).done (3);
    }
};

MasterMode.prototype.onSecondRow = function (index)
{
    if (Config.isPush2)
        return;
        
    if (index > 0)
        return;
    
    var master = this.model.getMasterTrack ();

    if (this.surface.isSelectPressed ())
    {
        master.toggleAutoMonitor ();
        return;
    }
    
    var tb = this.model.getCurrentTrackBank ();
    if (tb.isMuteState ())
        master.toggleMute (index);
    else
        master.toggleSolo (index);
};

MasterMode.prototype.updateSecondRow = function ()
{
    if (Config.isPush2)
    {
        for (var i = 0; i < 8; i++)
            this.surface.updateButton (102 + i, PUSH_COLOR_BLACK);
        return;    
    }
    
    var tb = this.model.getCurrentTrackBank ();
    var muteState = tb.isMuteState ();

    var master = this.model.getMasterTrack ();

    var color = PUSH_COLOR_BLACK;
    if (this.surface.isSelectPressed ())
        color = master.autoMonitor ? PUSH_COLOR2_GREEN_LO : PUSH_COLOR2_BLACK;
    else if (muteState)
    {
        if (!master.mute)
            color = PUSH_COLOR2_YELLOW_HI;
    }
    else
        color = master.solo ? PUSH_COLOR2_BLUE_HI : PUSH_COLOR2_GREY_LO;

    this.surface.updateButton (102, color);
    for (var i = 1; i < 8; i++)
        this.surface.updateButton (102 + i, PUSH_COLOR_BLACK);
};
