// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function Model (push)
{
	this.push = push;

	this.application = host.createApplication ();

	this.transport = new TransportProxy ();
	this.groove = new GrooveProxy ();
	this.masterTrack = new MasterTrackProxy ();
	this.trackBank = new TrackBankProxy ();

	this.userControlBank = new UserControlBankProxy ();
	this.cursorDevice = new CursorDeviceProxy ();

	this.noteInput = this.push.input.getPort ().createNoteInput ("Ableton Push", "80????", "90????", "E0????", "B040??" /* Sustainpedal */);
	this.noteInput.setShouldConsumeEvents (false);

	this.scales = new Scales ();
}

Model.prototype.setKeyTranslationTable = function (table)
{
	this.noteInput.setKeyTranslationTable (table);
};

Model.prototype.setVelocityTranslationTable = function (table)
{
	this.noteInput.setVelocityTranslationTable (table);
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
	return this.cursorDevice.getSelectedDevice ().name != 'None';
};

Model.prototype.getSelectedDevice = function ()
{
	return this.cursorDevice.getSelectedDevice ();
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

Model.prototype.updateIndication = function (mode)
{
	var isVolume = mode == MODE_VOLUME;
	var isPan    = mode == MODE_PAN;
    
    var tb = this.getTrackBank ();
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

        this.cursorDevice.getParameter (i).setIndication (mode == MODE_BANK_DEVICE);
        this.cursorDevice.getCommonParameter (i).setIndication (mode == MODE_BANK_COMMON);
        this.cursorDevice.getEnvelopeParameter (i).setIndication (mode == MODE_BANK_ENVELOPE);
        this.cursorDevice.getMacro (i).getAmount ().setIndication (mode == MODE_BANK_MACRO);
        
        this.userControlBank.getControl (i).setIndication (mode == MODE_BANK_USER);
	
		this.masterTrack.setVolumeIndication (mode == MODE_MASTER);
		this.masterTrack.setPanIndication (mode == MODE_MASTER);
	
		for (var g = 0; g < GrooveValue.Kind.values ().length; g++)
			this.groove.getRangedValue (g).setIndication (mode == MODE_GROOVE);
	}
};
