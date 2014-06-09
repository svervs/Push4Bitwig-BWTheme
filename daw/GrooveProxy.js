// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function GrooveProxy ()
{
	this.groove = host.createGroove ();
	this.values = [];

	this.addValue (GrooveValue.Kind.SHUFFLE_RATE);
	this.addValue (GrooveValue.Kind.SHUFFLE_AMOUNT);
	this.addValue (GrooveValue.Kind.ACCENT_RATE);
	this.addValue (GrooveValue.Kind.ACCENT_AMOUNT);
	this.addValue (GrooveValue.Kind.ACCENT_PHASE);

	this.groove.getEnabled ().addValueObserver (128, doObject (this, function (enabled)
	{
		this.enabled = enabled == 127;
	}));
}

GrooveProxy.prototype.isEnabled = function (kind)
{
	return this.enabled;
};

GrooveProxy.prototype.toggleEnabled = function ()
{
	this.enabled = !this.enabled;
	this.groove.getEnabled ().set (this.enabled ? 127 : 0, 128);
};

GrooveProxy.prototype.addValue = function (kind)
{
	this.values[kind] = new GrooveValue (kind);

	var v = this.getRangedValue (kind);

	v.addNameObserver (8, '', doObject (this, function (name)
	{
		this.values[kind].name = name;
	}));

	v.addValueObserver (128, doObject (this, function (value)
	{
		this.values[kind].value = value;
	}));

	v.addValueDisplayObserver (8, '',  doObject (this, function (value)
	{
		this.values[kind].valueString = value;
	}));
};

GrooveProxy.prototype.getValue = function (kind)
{
	return this.values[kind];
};

GrooveProxy.prototype.getRangedValue = function (kind)
{
	switch (kind)
	{
		case GrooveValue.Kind.ACCENT_AMOUNT:
			return this.groove.getAccentAmount ();

		case GrooveValue.Kind.ACCENT_PHASE:
			return this.groove.getAccentPhase ();

		case GrooveValue.Kind.ACCENT_RATE:
			return this.groove.getAccentRate ();

		case GrooveValue.Kind.SHUFFLE_AMOUNT:
			return this.groove.getShuffleAmount ();

		case GrooveValue.Kind.SHUFFLE_RATE:
			return this.groove.getShuffleRate ();
	}
};

GrooveProxy.prototype.setIndication = function (enable)
{
	for (var g = 0; g < GrooveValue.Kind.values ().length; g++)
		this.getRangedValue (g).setIndication (enable);
};


function GrooveValue (kind)
{
	this.kind = kind;
	this.name = null;
	this.value = null;
	this.valueString = '';
}

GrooveValue.Kind =
{
	SHUFFLE_RATE:   0,
	SHUFFLE_AMOUNT: 1,
	ACCENT_RATE:    2,
	ACCENT_AMOUNT:  3,
	ACCENT_PHASE:   4
};

GrooveValue.Kind._enums =
[
	GrooveValue.Kind.SHUFFLE_RATE,
	GrooveValue.Kind.SHUFFLE_AMOUNT,
	GrooveValue.Kind.ACCENT_RATE,
	GrooveValue.Kind.ACCENT_AMOUNT,
	GrooveValue.Kind.ACCENT_PHASE
];

GrooveValue.Kind.values = function ()
{
	return GrooveValue.Kind._enums;
};
