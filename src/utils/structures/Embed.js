const { MessageEmbed, User } = require("discord.js");

const COLOUR_GENERIC = '#fca41c'
const COLOUR_ERROR = '#eb1c1c'

class GenericMessageEmbed extends MessageEmbed{
    /**
     * MessageEmbed designed for sending default information
     */
    constructor(){
        super();
		this.setColor(COLOUR_GENERIC)
		this.setTimestamp()
		this.setURL()
    }
}
class ErrorMessageEmbed extends GenericMessageEmbed{

    /**
     * MessageEmbed designed for displaying errors
     * @param {User} user 
     * @param {Error} error 
     */
    constructor(error){
        super();
        this.setTitle(error.name);
        this.setDescription(error.message);
		this.setColor(COLOUR_ERROR)
    }
}

module.exports = {GenericMessageEmbed, ErrorMessageEmbed}