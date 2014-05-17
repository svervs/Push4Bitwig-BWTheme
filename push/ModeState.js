// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function ModeState (push, model)
{
	this.push = push;
	this.model = model;

	this.previousMode = MODE_TRACK;
	this.currentMode = MODE_TRACK;

	this.activeModeId = -1;
	this.modes = [];
}

ModeState.prototype.init = function ()
{
	this.addMode (MODE_VOLUME, new VolumeMode (this.model));
	this.addMode (MODE_PAN, new PanMode (this.model));
	var modeSend = new SendMode (this.model);
	this.addMode (MODE_SEND1, modeSend);
	this.addMode (MODE_SEND2, modeSend);
	this.addMode (MODE_SEND3, modeSend);
	this.addMode (MODE_SEND4, modeSend);
	this.addMode (MODE_SEND5, modeSend);
	this.addMode (MODE_SEND6, modeSend);
	this.addMode (MODE_MASTER, new MasterMode (this.model));
	this.addMode (MODE_TRACK, new TrackMode (this.model));
	this.addMode (MODE_FRAME, new FrameMode (this.model));
	this.addMode (MODE_SCALES, new ScalesMode (this.model));
	this.addMode (MODE_FIXED, new FixedMode (this.model));
	this.addMode (MODE_GROOVE, new GrooveMode (this.model));

	this.addMode (MODE_PARAM_PAGE_SELECT, new ParamPageSelectMode (this.model));
	this.addMode (MODE_BANK_DEVICE, new DeviceMode (this.model));
	this.addMode (MODE_BANK_COMMON, new ParamPageMode (this.model, MODE_BANK_COMMON, 'Common'));
	this.addMode (MODE_BANK_ENVELOPE, new ParamPageMode (this.model, MODE_BANK_ENVELOPE, 'Envelope'));
	//this.addMode (MODE_BANK_MODULATE, new ParamPageMode (this.model, MODE_BANK_MODULATE, 'Modulate'));
	this.addMode (MODE_BANK_USER, new ParamPageMode (this.model, MODE_BANK_USER, 'User'));
	this.addMode (MODE_BANK_MACRO, new ParamPageMode (this.model, MODE_BANK_MACRO, 'Macro'));
	this.addMode (MODE_PRESET, new PresetMode (this.model));
};

ModeState.prototype.getPreviousMode = function ()
{
	return this.previousMode;
}

ModeState.prototype.getCurrentMode = function ()
{
	return this.currentMode;
}

ModeState.prototype.setPendingMode = function (mode)
{
	if (mode == null)
		mode = MODE_TRACK;

	if (mode != this.currentMode)
	{
		if (this.currentMode != MODE_SCALES && this.currentMode != MODE_FIXED)
			this.previousMode = this.currentMode;
		this.currentMode = mode;
		this.setActiveMode (this.currentMode);
	}
	this.updateMode (-1);
	this.updateMode (this.currentMode);
}

ModeState.prototype.getActiveMode = function ()
{
	if (this.activeModeId < 0)
		return null;
	var mode = this.modes[this.activeModeId];
	return mode ? mode : null;
};

ModeState.prototype.setActiveMode = function (modeId)
{
	this.activeModeId = modeId;

	var mode = this.getActiveMode ();
	if (mode == null)
		return;

	mode.onActivate ();
};

ModeState.prototype.isActiveMode = function (modeId)
{
	return this.activeModeId == modeId;
};

ModeState.prototype.getMode = function (modeId)
{
	return this.modes[modeId];
};

ModeState.prototype.addMode = function (modeId, mode)
{
	mode.attachTo (this.push);
	this.modes[modeId] = mode;
};

ModeState.prototype.updateMode = function (mode)
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

	this.model.getMasterTrack ().updateIndications (isMaster);

	var selectedTrack = this.model.getSelectedTrack ();
	for (var i = 0; i < 8; i++)
	{
		var isEnabled = false;
		var t = trackBank.getTrack (i);
		var hasTrackSel = selectedTrack != null && selectedTrack.index == i && mode == MODE_TRACK;
		t.getVolume ().setIndication (isVolume || hasTrackSel);
		t.getPan ().setIndication (isPan || hasTrackSel);
		for (var j = 0; j < 6; j++)
		{
			isEnabled = mode == MODE_SEND1 && j == 0 ||
				mode == MODE_SEND2 && j == 1 ||
				mode == MODE_SEND3 && j == 2 ||
				mode == MODE_SEND4 && j == 3 ||
				mode == MODE_SEND5 && j == 4 ||
				mode == MODE_SEND6 && j == 5 ||
				hasTrackSel;
			t.getSend (j).setIndication (isEnabled);
		}

		this.push.cursorDevice.getParameter (i).setIndication (isBankDevice);
		this.push.cursorDevice.getCommonParameter (i).setIndication (isBankCommon);
		this.push.cursorDevice.getEnvelopeParameter (i).setIndication (isBankEnvelope);
		this.push.cursorDevice.getMacro (i).getAmount ().setIndication (isBankMacro);
		this.model.getUserControlBank().updateIndication (i, isBankUser);
		this.push.groove.updateIndications (isGroove);
	}

	this.push.setButton (PUSH_BUTTON_MASTER, isMaster || isFrame ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_TRACK, isTrack ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_VOLUME, isVolume ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_PAN_SEND, mode >= MODE_PAN && mode <= MODE_SEND6 ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_DEVICE, isBankDevice || isBankMacro ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_SCALES, isScales ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_FIXED_LENGTH, isFixed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_BROWSE, isPreset ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
}
