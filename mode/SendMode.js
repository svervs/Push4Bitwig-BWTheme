
function SendMode ()
{
	this.id = MODE_SEND;
}
SendMode.prototype = new BaseMode ();

SendMode.prototype.attachTo = function (aPush) 
{
};

SendMode.prototype.onValueKnob = function (index, value)
{
	var sendNo = currentMode - MODE_SEND1;
	var t = tracks[index];
	var send = t.sends[sendNo];
	send.volume = changeValue (value, send.volume);
	trackBank.getTrack (t.index).getSend (sendNo).set (send.volume, 128);
};

SendMode.prototype.updateDisplay = function ()
{
	var d = push.display;
	var sendNo = currentMode - MODE_SEND1;
	for (var i = 0; i < 8; i++)
	{
		d.setCell (1, i, tracks[i].sends[sendNo].volumeStr, PushDisplay.FORMAT_RAW)
		 .setCell (2, i, tracks[i].sends[sendNo].volume, PushDisplay.FORMAT_VALUE);
	}
	d.setRow (0, PARAM_NAMES_SEND[sendNo]).done (1).done (2);
};