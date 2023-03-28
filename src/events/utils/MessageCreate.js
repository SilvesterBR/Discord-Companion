const Command = require('../../utils/types/Command');
const CommandRequirements = require('../../utils/setup/CommandRequirements');
const { Client, Message, User, Channel, Role } = require('discord.js');
const { ErrorMessageEmbed } = require('../../utils/structures/Embed');

const empty = ['#','~'];
const identifiers = {
	help: '--help'
}

module.exports = class RegisterCommand extends CommandRequirements {
	constructor() {
		super('messageCreate');
	}

	/**
	 * @param {Client} client 
	 * @param {Message} message 
	 */
	// async run(client, message) {
	// 	if (message.author.bot) return;
	// 	if (message.content.startsWith(client.prefix)) {			
	// 		const [cmdName, ...rawArgs] = message.content.slice(client.prefix.length).trim().split(/\s+/);
	// 		/**@type {Command}*/
	// 		const command = client.commands.get(cmdName);
	// 		if(!command) return;
	// 		if(isAuthorized(command, message) == true){

	// 			//const passedArgs = rawArgs
	// 			///#([\s\S]*?)(?=_)/g

	// 			//const test = rawArgs.join(' ').split(/(?=\[)(.*?)(?<=\] )/).filter(arg => arg.length >= 1)
	// 			const str = rawArgs.join(' ').replace(/\s*,\s*/g, ',').replace(/\[\s*/g, '[').replace(/\s*\]/g, ']');
	// 			const passedArgs = str.split(/\s+/).map(elem => {
	// 				return elem.charAt(0) == '[' ? elem.slice(1, -1).split(",") : elem;
	// 			})

	// 			if(passedArgs.length == 1 && passedArgs[0] == 'help'){
	// 				command.help(client, message).catch((error)=>{console.error(error);});
	// 				return;
	// 			}

	// 			//Assign arguments where the input is just the basic command without parameters
	// 			if(passedArgs.length < 1){
	// 				for (let i = 0; i < command.info.args.length; i++) {
	// 					passedArgs[i] = undefined;
	// 				}
	// 			}

	// 			//Convert each parameter to their respective type, specified in the called command	
	// 			const args = {};
	// 			for (let i = 0; i < command.info.args.length; i++) {
	// 				try {
	// 					args[command.info.args[i].name] = await convert(passedArgs[i], command.info.args[i], message);
	// 				} catch (error) {
	// 					//Catches an conversion error from the 'convert' function
	// 					error['allArgs'] = command.info.args;
	// 					command.error(client, message, error).catch(()=>{});
	// 					args[command.info.args[i].name] = undefined;
	// 					if(command.info.args[i].optional == false) return; //Exit method if invalid input recieved
	// 				}
	// 			}

	// 			//Add extra parameters the user has inputted
	// 			for (let i = command.info.args.length; i < passedArgs.length; i++) {
	// 				args[i - command.info.args.length] = passedArgs[i];
	// 			}
	// 			command.run(client, message, args).catch((err)=>{
	// 				//Clean the sack trace and remove any frames that are in the node_modules.
	// 				//Note: Errors that occur within packages will not show
	// 				console.log((err.stack).replace(/^.*[\\/]node_modules[\\/].*$/gm, '').replace(/\n+/g, '\n'))
	// 			});
	// 		}
	// 	}
	// }

	/**
	 * @param {Client} client 
	 * @param {Message} message 
	 */
	async run(client, message){
		if (message.author.bot == true) return;
		if (message.content.startsWith(client.prefix) == false) return;

		const [cmdName, ...rawArgs] = message.content.slice(client.prefix.length).trim().split(/\s+/);

		/**@type {Command.BaseCommandConstructor}*/
		const command = client.commands.get(cmdName);
		if(command == undefined) return;

		if(this.isAuthorized(command, message) == false) return;

		const parsedArguments = this.parseInputCommand(rawArgs.join(" "));
		if(parsedArguments[0] == identifiers.help){
			command.help(client, message).catch((error)=>{
				console.error(error);
			});
			return;
		}

		let cancel = false;
		const resolvedArguments = {};
		command.info.args.forEach((arg, i, options) => {
			if(parsedArguments.length <= 0){
				parsedArguments[i] = undefined;
				return;
			}
			
			try {
				resolvedArguments[arg.name] = this.parse(parsedArguments[i], arg, message)
			} catch (error) {
				if(error instanceof ParameterError){
					command.error(client, message, error.setOrigin(arg)).catch( error => {
						console.log(error);
					})
					if(command.info.args[i].optional == false) {
						cancel = true;
					}
				}
			}
		})

		if(cancel == true){
			return;
		}

		//Add extra parameters the user has inputted
		for (let i = command.info.args.length; i < parsedArguments.length; i++) {
			resolvedArguments[i - command.info.args.length] = parsedArguments[i];
		}

		command.run(client,message, resolvedArguments).catch((err)=>{
			console.error((err.stack).replace(/^.*[\\/]node_modules[\\/].*$/gm, '').replace(/\n+/g, '\n'))
			message.channel.send({
				embeds: [new ErrorMessageEmbed({name: 'Unexpected Error', message: 'An unexpected error occured, try again later.'})]
			});
		});

	}

	
	/**
	 * 
	 * @param {(string | string[])} arg 
	 * @param {Command.CommandArgument} options 
	 * @param {Message} message 
	 */
	parse(arg, options, message){
		if(empty.includes(arg)){ arg = undefined; }
		if(arg === undefined){
			if(options.optional == false){
				throw new ParameterError('Argument Required', 'You entered nothing for a non optional parameter, you must enter a value.')
			}
			return undefined
		}

		if(options.isArray == true){
			if((arg instanceof Array) == false){ arg = [arg]; }
			return arg.map(element => { return this.parseType(element, options, message); });
		}

		if((arg instanceof Array) == true){ throw new ParameterError('Unnecessary Array Given', 'An array was given where a single value was expected') }
		return this.parseType(arg, options, message);
		
	}

	/**
	 * 
	 * @param {(string | string[])} arg 
	 * @param {Command.CommandArgument} options 
	 * @param {Message} message 
	 */
	parseType(arg, options, message){
		switch (options.type) {
			case 'BOOLEAN':	
				return this.toBoolean(arg);
			case 'CHANNEL':
				return this.toChannel(arg, message);
			case 'NUMBER':
				return this.toNumber(arg, options);
			case 'ROLE':
				return this.toRole(arg, message);
			case 'USER':
				return this.toUser(arg, message);
			default:
				return arg;
		}
	}

	/**
	 * 
	 * @param {string} arg 
	 * @returns {Boolean}
	 */
	toBoolean(arg){
		return arg === 'true'
	}
	/**
	 * 
	 * @param {string} arg 
	 * @param {Message} message 
	 * @returns {Channel}
	 */
	toChannel(arg, message){
		const parse = message.client.channels.cache.get(arg.replace(/[\\<>@#&! ]/g, ""))
		if(!parse){
			throw new InvalidType('Channel');
		}
		return parse;
	}
	/**
	 * 
	 * @param {string} arg 
	 * @param {Command.CommandArgument} options
	 * @returns {number}
	 */
	toNumber(arg, options){
		const number = Number(arg)
		
		if(isNaN(number)){
			throw new InvalidType('Number');
		}

		const minimum = options.min == undefined ? Number.MIN_SAFE_INTEGER.toString() : options.min
		const maximum = options.max == undefined ? Number.MAX_SAFE_INTEGER.toString() : options.max

		if(number < options.min || number < Number.MIN_SAFE_INTEGER){
			throw new ParameterError('Range Error: Number too low.',`You have entered a value that exceeds the allowed range, enter a value greater than or equal to ${minimum}.`)
		}
		if(number > options.max || number > Number.MAX_SAFE_INTEGER){
			throw new ParameterError('Range Error: Number too High.',`You have entered a value that exceeds the allowed range, enter a value less than or equal to ${maximum}.`)
		}

		return number;

	}
	/**
	 * 
	 * @param {string} arg 
	 * @param {Message} message 
	 * @returns {Role}
	 */
	toRole(arg, message){
		const parse = message.guild.roles.cache.get(arg.replace(/[\\<>@#&! ]/g, ""))
		if(!parse){
			throw new InvalidType('Role');
		}
		return parse;
	}

	/**
	 * 
	 * @param {string} arg 
	 * @param {Message} message 
	 * @returns {User}
	 */
	toUser(arg, message){
		const parse = message.client.users.cache.get(arg.replace(/[\\<>@#&! ]/g, ""))
		if(!parse){
			throw new InvalidType('User');
		}
		return parse;
	}

	/**
	 * Parse arguments given by the user, converting a string in array format to a JS array. Nesting not allowed.
	 * @param {string} args 
	 */
	parseInputCommand(args){
		const str = args.replace(/\s*,\s*/g, ',').replace(/\[\s*/g, '[').replace(/\s*\]/g, ']');
		const passedArgs = str.split(/\s+/).map(elem => {
			return elem.charAt(0) == '[' && elem.charAt(elem.length - 1) == ']' ? elem.slice(1, -1).split(",") : elem;
		})
		return passedArgs.filter(arg => arg != '');
	}

}

class ParameterError extends Error{
	/**
	 * 
	 * @param {string} name 
	 * @param {string} message 
	 * @param {Command.CommandArgument} options 
	 */
	constructor(name, message, origin){
		super(message)
		this.name = name;
		this.message = message;
		this.origin = origin
	}

	/**
	 * @param {Command.CommandArgument-} argument 
	 */
	setOrigin(argument){
		this.origin = argument;
		return this;
	}
}

class InvalidType extends ParameterError{
	/**
	 * 
	 * @param {string} type 
	 * @param {Command.CommandArgument} options 
	 */
	constructor(type){
		super(`Invalid ${type}`, `You have entered an invalid __${type}__, where a parameter expects a valid __${type}__.`)
	}
}

//#region Past
const ARRAY_TYPES = ["STRING_ARRAY" , "NUMBER_ARRAY" , "BOOLEAN_ARRAY" , "USER_ARRAY" , "CHANNEL_ARRAY" , "ROLE_ARRAY"]

/**
 * Convert passed argument into the respective type, assigned by the called command
 * @param {String} param 
 * @param {Command.CommandArgument} cmdArg 
 * @param {Message} message
 * @returns {Promise<User> | Promise<Channel> | Promise<Role> | String | Number | Boolean}
 */
async function convert(param, cmdArg, message){

	if(empty.includes(param)) param = undefined;

	if(param == undefined){
		if(cmdArg.optional == false){ throw {error:'Parameter Required', description:'You entered nothing for a non optional parameter, you must enter a value.',invalidArg:cmdArg}; }
		return undefined;
	}

	if((param instanceof Array) == false && ARRAY_TYPES.includes(cmdArg.type)){
		throw {
			error:'Array Parameter Required', 
			description:'You have entered an argument that is not in an array format. An array starts with ``[`` ends with ``]`` and each element is seperated by a ``,``.\nExample: ``[1,4,9,16]``',
			invalidArg:cmdArg
		}; 
	}

	try {
		if((param instanceof Array) == true){
			switch (cmdArg.type) {
				case 'NUMBER_ARRAY':
					return param.map(elem => {return toNumber(elem, cmdArg)});
				case 'BOOLEAN_ARRAY':
					return param.map(elem => {return elem.toLowerCase() == 'true'});
				case 'USER_ARRAY':
					return param.map(elem => {return toUser(elem, cmdArg, message)});
				case 'CHANNEL_ARRAY':
					return param.map(elem => {return toChannel(elem, cmdArg, message)});
				case 'ROLE_ARRAY':
					return param.map(elem => {return toRole(elem, cmdArg, message)});
				default:
					//Return as string, aka the generic input by the user
					return param;
			}
		}

		switch (cmdArg.type) {
			case 'NUMBER':
				return toNumber(param,cmdArg);
			case 'BOOLEAN':
				return param.toLowerCase() == 'true';
			case 'USER':
				return toUser(param,cmdArg,message);
			case 'CHANNEL':
				return toChannel(param,cmdArg,message)
			case 'ROLE':
				return toRole(param,cmdArg,message)
			default:
				//Return as string, aka the generic input by the user
				return param;
		}
		
	} catch (error) {
		throw error;
	}
}


/**
 * Convert passed argument into the respective type, assigned by the called command
 * @param {String} param 
 * @param {Command.CommandArgument} cmdArg 
 * @param {Message} message
 * @returns {Number}
 */
function toNumber(param, cmdArg){
	const num = Number.parseFloat(param)
	if(!isNaN(num)){
		if(num < cmdArg.min || num < Number.MIN_SAFE_INTEGER){
			throw {
				error:'Invalid Number Value',
				description:`You have entered a value less than the allowed limit, enter a value greater than or equal to ${cmdArg.min == undefined ? Number.MIN_SAFE_INTEGER.toString() : cmdArg.min}.`, 
				invalidArg:cmdArg
			}
		}
		if(num > cmdArg.max || num > Number.MAX_SAFE_INTEGER){
			throw {
				error:'Invalid Number Value',
				description:`You have entered a value greater than the allowed limit, enter a value less than or equal to ${cmdArg.max == undefined ? Number.MAX_SAFE_INTEGER.toString() : cmdArg.max}.`, 
				invalidArg:cmdArg
			}
		}
		return num;
	}else{
		throw {
			error:'Invalid Number Value',
			description:'You have entered an invalid number for a parameter that expects a valid number.', 
			invalidArg:cmdArg
		}
	}
}
/**
 * Convert passed argument into the respective type, assigned by the called command
 * @param {String} param 
 * @param {Command.CommandArgument} cmdArg 
 * @param {Message} message
 * @returns {User}
 * @throws
 */
function toUser(param, cmdArg, message){
	const user = message.client.users.cache.get(param.replace(/[\\<>@#&! ]/g, ""))
	if(user) return user;
	throw {
		error:'Invalid User',
		description:'You have entered an invalid __user__, where a parameter expects a valid __user__.',
		invalidArg:cmdArg
	}
}

/**
 * Convert passed argument into the respective type, assigned by the called command
 * @param {String} param 
 * @param {Command.CommandArgument} cmdArg 
 * @param {Message} message
 * @returns {Channel}
 */
function toChannel(param, cmdArg, message){
	const channel = message.client.channels.cache.get(param.replace(/[\\<>@#&! ]/g, ""))
	if(channel) return channel;
	throw {
		error:'Invalid Channel',
		description:'You have entered an invalid __channel__, where a parameter expects a valid __channel__.', 
		invalidArg:cmdArg
	}
}
/**
 * Convert passed argument into the respective type, assigned by the called command
 * @param {String} param 
 * @param {Command.CommandArgument} cmdArg 
 * @param {Message} message
 * @returns {Role}
 */
function toRole(param, cmdArg, message){
	const role = message.guild.roles.cache.get(param.replace(/[\\<>@#&! ]/g, ""))
	if(role) return role;
	throw {
		error:'Invalid Role',
		description:'You have entered an invalid __role__, where a parameter expects a valid __role__.', 
		invalidArg:cmdArg
	}
}

//#endregion