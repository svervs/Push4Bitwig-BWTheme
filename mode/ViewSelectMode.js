// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

ViewSelectMode.VIEWS =
[
    { id: VIEW_PLAY, name: 'Play' },
    { id: VIEW_PIANO, name: 'Piano' },
    { id: VIEW_SEQUENCER, name: 'Sequencer' },
    { id: VIEW_RAINDROPS, name: 'Raindrop' },
    { id: VIEW_DRUM, name: 'Drum' },
    { id: null, name: '' },
    { id: VIEW_CLIP, name: 'Clip' },
    { id: VIEW_PRG_CHANGE, name: 'PrgChnge' }
];

function ViewSelectMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_VIEW_SELECT;
}
ViewSelectMode.prototype = new BaseMode ();

ViewSelectMode.prototype.onFirstRow = function (index)
{
    var view = ViewSelectMode.VIEWS[index].id;
    if (view == null)
        return;
    this.model.getCurrentTrackBank ().setPreferredView (view);
    this.surface.setActiveView (view);
    this.surface.restoreMode ();
};

ViewSelectMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    
    if (Config.isPush2)
    {
        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
        for (var i = 0; i < ViewSelectMode.VIEWS.length; i++)
        {
            var view = ViewSelectMode.VIEWS[i];
            message.addOptionElement ("", "", false, i == 0 ? "Track input" : "",
                                      view.id == null ? "" : view.name, 
                                      view.id != null && this.surface.isActiveView (view.id));
        }
        message.send ();
    }
    else
    {
        d.clear ().setBlock (1, 0, 'Track input:');
        for (var i = 0; i < ViewSelectMode.VIEWS.length; i++)
            d.setCell (3, i, (ViewSelectMode.VIEWS[i].id != null && this.surface.isActiveView (ViewSelectMode.VIEWS[i].id) ? Display.RIGHT_ARROW : '') + ViewSelectMode.VIEWS[i].name);
        d.allDone ();
    }
};

ViewSelectMode.prototype.updateFirstRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.updateButton (20 + i, ViewSelectMode.VIEWS[i].id == null ? AbstractMode.BUTTON_COLOR_OFF : (this.surface.isActiveView (ViewSelectMode.VIEWS[i].id) ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON));
};
