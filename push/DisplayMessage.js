DisplayMessage.GRID_ELEMENT_CHANNEL_SELECTION  = 0;
DisplayMessage.GRID_ELEMENT_CHANNEL_VOLUME     = 1;
DisplayMessage.GRID_ELEMENT_CHANNEL_PAN        = 2;
DisplayMessage.GRID_ELEMENT_CHANNEL_CROSSFADER = 3;
DisplayMessage.GRID_ELEMENT_CHANNEL_SENDS      = 4;
DisplayMessage.GRID_ELEMENT_CHANNEL_ALL        = 5;
DisplayMessage.GRID_ELEMENT_PARAMETERS         = 6;
DisplayMessage.GRID_ELEMENT_OPTIONS            = 7;
DisplayMessage.GRID_ELEMENT_LIST               = 8;

DisplayMessage.DISPLAY_COMMAND_SHUTDOWN = -1;
DisplayMessage.DISPLAY_COMMAND_GRID     = 10;


// command: See DISPLAY_COMMAND_* above
function DisplayMessage (command)
{
    this.command = command;
    this.array = [];
}

DisplayMessage.prototype.send = function ()
{
    // Workaround for Linux bug: All config values are set to 0 when closing a song
    if (Config.sendPort < 1)
        return;
    
    var data = [ -16, this.command ];    // -16 = 0xF0
    data = data.concat (this.array);
    data = data.concat ([ -9 ]);    // -9  = 0xF7
    this.sendToDisplay (data);
};

DisplayMessage.prototype.sendToDisplay = function (data)
{
    host.sendDatagramPacket ("127.0.0.1", Config.sendPort, data);
};

DisplayMessage.sendMessage = function (column, text)
{
    var message = new DisplayMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
    for (var i = 0; i < 8; i++)
        message.addOptionElement (column == i ? text : "", "", false, "", "", false);
    message.send ();
};

DisplayMessage.prototype.addOptionElement = function (headerTopName, menuTopName, isMenuTopSelected, headerBottomName, menuBottomName, isMenuBottomSelected, useSmallTopMenu)
{
    this.addByte (DisplayMessage.GRID_ELEMENT_OPTIONS);
    this.addString (headerTopName);
    this.addString (menuTopName);
    this.addBoolean (isMenuTopSelected);
    this.addString (headerBottomName);
    this.addString (menuBottomName);
    this.addBoolean (isMenuBottomSelected);
    this.addBoolean (useSmallTopMenu);
};

DisplayMessage.prototype.addString = function (text)
{
    if (text)
    {
        for (var i = 0; i < text.length; i++)
        {
            var character = text.charCodeAt(i);
            if (character < 128)
                this.array.push (character);
            else
            {
                // Split up non-ASII characters into 3 bytes
                this.array.push (-1);
                this.addInteger (character);
            }
        }
    }
    this.array.push (0);
};

DisplayMessage.prototype.addInteger = function (value)
{
    this.array.push (value & 0x7F);
    this.array.push ((value >> 7) & 0x7F);
};

DisplayMessage.prototype.addBoolean = function (value)
{
    this.array.push (value ? 1 : 0);
};

DisplayMessage.prototype.addColor = function (color)
{
    if (color)
    {
        this.addInteger (Math.round (color[0] * 255));
        this.addInteger (Math.round (color[1] * 255));
        this.addInteger (Math.round (color[2] * 255));
    }
    else
    {
        this.array.push (0);
        this.array.push (0);
        this.array.push (0);
        this.array.push (0);
        this.array.push (0);
        this.array.push (0);
    }
};

DisplayMessage.prototype.addByte = function (value)
{
    this.array.push (value);
};
