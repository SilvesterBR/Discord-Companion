import {PermissionString, ApplicationCommandOption, User, Channel, Role} from 'discord.js'

export interface BaseCommandConstructor{
    info:BaseCommandConstructor
}

export interface CommandConstructor{
    /**
     * @param enabled 
     * Indicates if a command can be used.
     */
    enabled: boolean 
    /**
     * @param name
     * @example 'test'
     * @description The name of the command that will be typed by the user
     */
    name: String;
    /**
     * @param aliases
     * @example ['Test','test','tst','t']
     * @description Alternate way to call a command
     */
    aliases?: String[];

    /**
     * @param arguments
     * @example [{name:'STRING', description:'Enter a STRING', type:'STRING', optional:false}]
     * @description Arugments set for input, given in the order they have been declared 
     */
    args?: CommandArgument[]
    /**
     * @param category
     * The category discord will sort this command
     */
    category?: String;
    /**
     * @param {PermissionString[]} botPermissions
     * @example ['ADMINISTRATOR','KICK_MEMBER']
     * @description The permissions the bot is needed to have to execute the function.
     */
    botPermissions?: PermissionString[];
    /**
     * @param {PermissionString[]} userPermissions
     * @example ['ADMINISTRATOR','KICK_MEMBER']
     * @description The permissions required to call this command
     */
    userPermissions?: PermissionString[];
    /**
     * @param {boolean} ownerOnly
     * @description Only the owner of the server can use this command
     */
    ownerOnly?: boolean;
    /**
     * @param {boolean} devOnly
     * @description Only certain members can use this command, e.g. the users programming the bot. List of users can be found in Users.json
     */
    devOnly?: boolean;
    /**
     * @param cooldown
     * @description How quick a user can call a command in succession.
     * @deprecated
     */
    cooldown?: number;
    /**
     * @param description
     * @description A description on what the command will do.
     */
    description: string;
    /**
     * @param slash
     * @description Indicates the command has a slash command feature, a feature included into the discord API
     */
    isSlash?: boolean;
    /**
     * @param {boolean} slashOptions
     * @description These are options that a user can input without having to manually type an input. These also indicate what the input should be, a feature included into the discord API
     */
    slashOptions?: ApplicationCommandOption[];
    /**
     * @param {contextMenu} contextMenu
     * @description Determines if a command can be called through a UI-based command, shown when you right click or tap on a component
     */
    contextMenu?: ContextMenu
}

export interface CommandArgument{
    /**
     * @param {String} name
     * @description Name of the argument, used to identify the data
     */
    name:String,
    /**
     * @param {String} description
     * @description Information of what the parameter requires
     */
    description:String,
    /**
     * @param {String} type
     * @description Type of data that will be stored
     */
    type: ArgumentTypeValue
    /**
     * @param {String} type
     * @description Argument is not required 
     */
    optional?: boolean,
    /**
     * @param {Number} min
     * @description The minimum allowed value for a number inputted by the user
     */
    min?:number,
    /**
     * @param {Number} max
     * @description The maximum allowed value for a number inputted by the user
     */
    max?:number
    /**
     * @param {Boolean} isArray
     * @description Determines wheather the required input should be a JS array.
     */
    isArray?:boolean
}

interface ContextMenu{
    /**
     * @param {boolean} isUser
     * @description Determines if a command can be called through a UI-based command, shown when you right click or tap on a user
     */
    isUser:boolean;
    /**
     * @param {boolean} isMessage
     * @description Determines if a command can be called through a UI-based command, shown when you right click or tap on a message
     */
    isMessage:boolean;
}

export type ArgumentType = User | Channel | Role | String | Number | Boolean | User[] | Channel[] | Role[] | String[] | Number[] | Boolean[]


export type Argument = { [key:string]:ArgumentType }

type ArgumentTypeValue ="STRING" | "NUMBER" | "BOOLEAN" | "USER" | "CHANNEL" | "ROLE"
