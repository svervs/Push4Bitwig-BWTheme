// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function AbstractSequencerView (model, rows, cols)
{
    if (!model) // Called on first prototype creation
        return;

    AbstractView.call (this, model);

    this.resolutions = [ 1, 2/3, 1/2, 1/3, 1/4, 1/6, 1/8, 1/12 ];
    this.selectedIndex = 4;
    this.scales = this.model.getScales ();

    this.offsetX = 0;
    this.offsetY = 0;

    this.clip = this.model.createCursorClip (cols, rows);
    this.clip.setStepLength (this.resolutions[this.selectedIndex]);
}
AbstractSequencerView.prototype = new AbstractView ();

AbstractSequencerView.prototype.onActivate = function ()
{
    AbstractView.prototype.onActivate.call (this);

    this.surface.updateButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_HI);
    this.surface.updateButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_ON);
    this.surface.updateButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.model.getCurrentTrackBank ().setIndication (false);
    this.drawSceneButtons ();

    this.updateRibbonMode ();
};

AbstractSequencerView.prototype.scrollLeft = function (event)
{
    var newOffset = this.offsetX - this.clip.getStepSize ();
    if (newOffset < 0)
        this.offsetX = 0;
    else
    {
        this.offsetX = newOffset;
        this.clip.scrollStepsPageBackwards ();
    }
};

AbstractSequencerView.prototype.scrollRight = function (event)
{
    this.offsetX = this.offsetX + this.clip.getStepSize ();
    this.clip.scrollStepsPageForward ();
};

AbstractSequencerView.prototype.onScene = function (index)
{
    this.selectedIndex = 7 - index;
    this.clip.setStepLength (this.resolutions[this.selectedIndex]);
    this.drawSceneButtons ();
};

AbstractSequencerView.prototype.drawSceneButtons = function ()
{
    if (this.model.canSelectedTrackHoldNotes ())
    {
        for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
            this.surface.updateButton (i, i == PUSH_BUTTON_SCENE1 + this.selectedIndex ? PUSH_COLOR_SCENE_ORANGE_HI : PUSH_COLOR_SCENE_YELLOW); // BWS Color Theme
    }
    else
    {
        for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
            this.surface.updateButton (i, PUSH_BUTTON_STATE_OFF);
    }
};

AbstractSequencerView.prototype.isInXRange = function (x)
{
    return x >= this.offsetX && x < this.offsetX + this.clip.getStepSize ();
};
