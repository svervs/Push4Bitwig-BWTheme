// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

ViewSelectMode.VIEWS =
[
    { id: VIEW_PLAY, name: 'Play' },
    { id: VIEW_SEQUENCER, name: 'Squencr' },
    { id: VIEW_DRUM, name: 'Drum' },
    { id: VIEW_RAINDROPS, name: 'Raindrp' },
];

function ViewSelectMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_VIEW_SELECT;
}
ViewSelectMode.prototype = new BaseMode ();

ViewSelectMode.prototype.onFirstRow = function (index)
{
    if (index > 3)
        return;
    var view = ViewSelectMode.VIEWS[index].id;
    this.model.getCurrentTrackBank ().setPreferredView (view);
    this.surface.setActiveView (view);
    this.surface.setPendingMode (this.surface.getPreviousMode ());
};

ViewSelectMode.prototype.onSecondRow = function (index) {};

ViewSelectMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    d.clear ().setBlock (0, 0, 'Track input:');
    for (var i = 0; i < ViewSelectMode.VIEWS.length; i++)
        d.setCell (3, i, (this.surface.isActiveView (ViewSelectMode.VIEWS[i].id) ? Display.RIGHT_ARROW : ' ') + ViewSelectMode.VIEWS[i].name);
    d.allDone ();
};

ViewSelectMode.prototype.updateFirstRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (20 + i, i > 3 ? PUSH_COLOR_BLACK : (this.surface.isActiveView (ViewSelectMode.VIEWS[i].id) ? PUSH_COLOR_YELLOW_LO : PUSH_COLOR_GREEN_LO));
};

ViewSelectMode.prototype.updateSecondRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (102 + i, PUSH_COLOR2_BLACK);
};
