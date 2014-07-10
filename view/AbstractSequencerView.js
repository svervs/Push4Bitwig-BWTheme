// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function AbstractSequencerView (model, rows, cols)
{
    if (!model) // Called on first prototype creation
        return;
        
    BaseView.call (this, model);
        
    this.resolutions = [ 1, 2/3, 1/2, 1/3, 1/4, 1/6, 1/8, 1/12 ];
    this.selectedIndex = 4;
    this.scales = model.getScales ();
    this.rows = rows;
    this.cols = cols;

    this.offsetX = 0;
    this.offsetY = 0;
    this.step = -1;

    this.data = [];
    for (var y = 0; y < this.rows; y++)
        this.data[y] = initArray (false, this.cols);

    // TODO move to daw package
    this.clip = host.createCursorClip (this.cols, this.rows);
    this.clip.setStepSize (this.resolutions[this.selectedIndex]);

    this.clip.addPlayingStepObserver (doObject (this, function (step)
    {
        this.step = step;
    }));

    this.clip.addStepDataObserver (doObject (this, function (column, row, state)
    {
        this.data[column][row] = state;
    }));
}
AbstractSequencerView.prototype = new BaseView ();

AbstractSequencerView.prototype.onActivate = function ()
{
    BaseView.prototype.onActivate.call (this);

    this.push.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_HI);
    this.push.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_ON);
    this.push.setButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.model.getTrackBank ().setIndication (false);
    this.drawSceneButtons ();
};

AbstractSequencerView.prototype.onScene = function (index)
{
    this.selectedIndex = 7 - index;
    this.clip.setStepSize (this.resolutions[this.selectedIndex]);
    this.drawSceneButtons ();
};

AbstractSequencerView.prototype.drawSceneButtons = function ()
{
    var t = this.model.getTrackBank ().getSelectedTrack ();
    var isKeyboardEnabled = t != null && t.canHoldNotes;
    if (!isKeyboardEnabled)
    {
        for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
            this.push.setButton (i, PUSH_BUTTON_STATE_OFF);
        return;
    }

    for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
    {
        this.push.setButton (i, i == PUSH_BUTTON_SCENE1 + this.selectedIndex ? PUSH_COLOR_SCENE_YELLOW : PUSH_COLOR_SCENE_GREEN);
    }
};
