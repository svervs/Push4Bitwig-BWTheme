// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function Model (push)
{
	this.push = push;

	this.application = host.createApplication ();

	this.transport = new TransportProxy (push);
	this.groove = new GrooveProxy (push);
	this.masterTrack = new MasterTrackProxy (push);
	this.trackBank = new TrackBankProxy (push);

	this.userControlBank = new UserControlBankProxy (push);
	this.cursorDevice = new CursorDeviceProxy (push);

	this.noteInput = this.push.input.getPort().createNoteInput ("Ableton Push", "80????", "90????", "E0????", "B040??" /* Sustainpedal */);
	this.noteInput.setShouldConsumeEvents (false);

	this.scales = new Scales ();

	this.selectedDevice =
	{
		name: 'None',
		hasPreviousDevice: false,
		hasNextDevice: false
	};
}

Model.prototype.setKeyTranslationTable = function (table)
{
	this.noteInput.setKeyTranslationTable (table);
};

/**
 * @returns {Scales}
 */
Model.prototype.getScales = function ()
{
	return this.scales;
};

// TODO Move to TrackBankProxy
/**
 * @returns {Track}
 */
Model.prototype.getSelectedTrack = function ()
{
	return this.getTrackBank ().getSelectedTrack ();
};

Model.prototype.hasSelectedDevice = function ()
{
	return this.selectedDevice.name != 'None';
};

Model.prototype.getSelectedDevice = function ()
{
	return this.selectedDevice;
};

/**
 * @returns {TransportProxy|
 */
Model.prototype.getTransport = function () { return this.transport; };

/**
 * @returns {GrooveProxy}
 */
Model.prototype.getGroove = function () { return this.groove; };

/**
 * @returns {MasterTrackProxy}
 */
Model.prototype.getMasterTrack = function () { return this.masterTrack; };

/**
 * @returns {TrackBankProxy}
 */
Model.prototype.getTrackBank = function () { return this.trackBank; };

/**
 * @returns {CursorDeviceProxy}
 */
Model.prototype.getCursorDevice = function () { return this.cursorDevice; };

/**
 * @returns {UserControlBankProxy}
 */
Model.prototype.getUserControlBank = function () { return this.userControlBank; };


Model.prototype.getApplication = function ()
{
	return this.application;
};
