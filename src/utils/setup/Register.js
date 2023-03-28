const discord = require('discord.js')
const fs = require('fs').promises;
const CommandStructure = require('../structures/BaseCommand')
const EventStructure = require('../structures/BaseEvent')
const path = require('path');

/** @param {discord.Client} client */
async function registerCommands(client, dir = '') {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for (const file of files) {
        const stat = await fs.lstat(path.join(filePath, file));
        if (stat.isDirectory()) registerCommands(client, path.join(dir, file));
        if (file.endsWith('.js')) {
            const Command = require(path.join(filePath, file));
            if (Command.prototype instanceof CommandStructure) {

                /**@type {CommandStructure}*/
                const cmd = new Command();

                if(cmd.info.name === "") {
                    console.log(`Command Error: Command '${cmd.constructor.name}' must have a name. This command has not been created`);
                    continue;
                }
                if(cmd.info.description === ""){
                    console.log(`Command Error: Command '${cmd.constructor.name}' must have a description. This command has not been created`);
                    continue;
                }

                client.commands.set(cmd.info.name, cmd);
                cmd.info.aliases.forEach((alias) => {
                    client.commands.set(alias, cmd);
                });

                if(cmd.info.isSlash){
                    client.guilds.cache.get('857573559189897256').commands.create({
                        name: cmd.info.name,
                        description : cmd.info.description,
                        options:cmd.info.slashOptions,
                    })
                }
                if(cmd.info.contextMenu.isUser){
                    client.guilds.cache.get('857573559189897256').commands.create({
                        name: cmd.info.name,
                        type: 2                        
                    })
                }
                if(cmd.info.contextMenu.isUser){
                    client.guilds.cache.get('857573559189897256').commands.create({
                        name: cmd.info.name,
                        type: 3                 
                    })
                }
            }
        }
    }
}

/** @param {discord.Client} client */
async function registerEvents(client, dir = '') {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for (const file of files) {
        const stat = await fs.lstat(path.join(filePath, file));
        if (stat.isDirectory()) registerEvents(client, path.join(dir, file));
        if (file.endsWith('.js')) {
            const Event = require(path.join(filePath, file));
            if (Event.prototype instanceof EventStructure) {
                const event = new Event();
                client.events.set(event.name, event);
                client.on(event.name, event.run.bind(event, client));
            }
        }
    }
}

// /** @param {discord.Client} client */
// async function registerSlashCommand(client, dir = ''){
//     const filePath = path.join(__dirname, dir);
//     const files = await fs.readdir(filePath);
//     for (const file of files) {
//         const stat = await fs.lstat(path.join(filePath, file));
//         if (stat.isDirectory()) registerCommands(client, path.join(dir, file));
//         if (file.endsWith('.js')) {
//             const Command = require(path.join(filePath, file));
//             if (Command.prototype instanceof CommandStructure) {
//                 /**@type {CommandConstructor}    */
//                 const cmd = new Command();
//                 //CAUTION: THIS WILL NEED TO BE CHANGED TO GLOBAL ONCE ALL COMMANDS IMPLEMENTED
//                 await client.guilds.cache.get('857573559189897256').commands.create({
//                     name: cmd.info.name,
//                     description : cmd.info.description
//                 });

//             }
//         }
//     }
// }
/** @param {discord.Client} client */
async function clearSlashCommands(client, dir = ''){
    client.application.commands.set([],'857573559189897256')
}

function CrashDetection(){
    process.on('uncaughtException')
}

module.exports = {
    registerCommands,
    registerEvents,
    clearSlashCommands
};