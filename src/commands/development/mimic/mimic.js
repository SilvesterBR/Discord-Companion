const { showModal, Modal, TextInputComponent} = require('discord-modals');
const { Client, CommandInteraction, Message, User, Channel, Role, MessageEmbed, MessageActionRow, MessageButton, GuildBasedChannel, Guild} = require('discord.js');
const Command = require('../../../utils/structures/BaseCommand');

/**
 * @type {[{author: User, server: Guild, channel: GuildBasedChannel}]}
 */
let connections = [];

module.exports = class Mimic extends Command{
    constructor(){
        super({
            name: 'mimic',
            args: [
                {name:'channelid', description:'The channel you wish to send the message in', type:'STRING', optional: false},
                {name:'serverid', description:'The server you wish to send the message in', type:'STRING', optional: true}
            ],
            description: 'Act as the bot, sending messages in a specific channel of any server the bot has access to',
            devOnly: true
        })

        this.submitSet = false;
    }
    /**
     * Method executed when prefix command is called
     * @param {Client} client
     * @param {Message} message
     * @param {{[key:string]:User | Channel | Role | String | Number | Boolean}} args
     */
    async run(client, message, args){

        const server = args['serverid'] ? client.guilds.cache.get(args['serverid']) : message.guild
        if(server === undefined){
            message.channel.send(`\`\`\`diff\n-CONNECTION FAIL: Could not find the given server\`\`\``);
            return;
        }

        const channel = server.channels.cache.get(args['channelid'].replace(/[<#>]/g,""))
        if(channel === undefined){
            message.channel.send(`\`\`\`diff\n-CONNECTION FAIL: Could not find the given Channel\`\`\``);
            return;
        }

        const connection = {author: message.author.id, server: server.id, channel: channel.id}

        if(connections.find(instance => JSON.stringify(instance) === JSON.stringify(connection))){
            message.channel.send(`\`\`\`diff\n-CONNECTION FAIL: Existing connection still open \`\`\``);
            return
        }

        if(server.me.permissionsIn(channel).has(['SEND_MESSAGES']) == false){
            message.channel.send(`\`\`\`diff\n-CONNECTION FAIL: Missing permission 'SEND_MESSAGES'\`\`\``);
            return
        }

        const timeout = 5000

        const originFilter = (m) => m.author.id === message.author.id;
        const origin = message.channel.createMessageCollector({filter: originFilter, time: timeout});

        const endpointFilter = (m) => m.author.id !== client.application.id;
        const endpoint = channel.createMessageCollector({filter: endpointFilter, time: timeout});

        const UI = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('embed').setLabel('Send Embed').setStyle('SECONDARY'),
            new MessageButton().setCustomId('terminate').setLabel('TERMINATE').setStyle('DANGER'),
            new MessageButton().setCustomId('pause').setLabel('PAUSE').setStyle('DANGER')
        );

        const connected = await message.channel.send({content:`\`\`\`yaml\nCONNECTED\nServer: ${server.name} \nChannel: ${channel.name}\nTerminate: 'TERMINATE'\nStatus: Awaiting messages...\`\`\``,components:[ UI ]});
        connections.push(connection)

        const input = connected.createMessageComponentCollector({filter: (m) => m.user.id === message.author.id, time: timeout})

        let paused = false;
        const modal = new Modal()
        .setCustomId('mimic-embed')
        .setTitle('Send Embed')
        .addComponents(
            new TextInputComponent().setCustomId('title').setLabel(`SetTitle`).setStyle('SHORT').setRequired(true),
            new TextInputComponent().setCustomId('description').setLabel(`SetDescription`).setStyle('SHORT').setRequired(false),
            new TextInputComponent().setCustomId('fields').setLabel(`SetFields - (JSON object)`).setStyle('LONG').setRequired(false).setPlaceholder('{"name": "String","value": "String","inline": Boolean}'),
            new TextInputComponent().setCustomId('colour').setLabel(`SetColour`).setStyle('SHORT').setRequired(false),
            new TextInputComponent().setCustomId('image').setLabel(`SetImage`).setStyle('LONG').setRequired(false),
        )

        input.on('collect', interaction =>{

            origin.resetTimer({time: timeout});
            endpoint.resetTimer({time: timeout});

            switch (interaction.customId) {
                case 'embed':
                    showModal(modal, {client: client, interaction: interaction})
                    break;
                case 'pause':
                    paused = !paused;
                    const button = UI.components.find(button => button.customId == 'pause').setStyle(['DANGER','SUCCESS'][paused ? 1 : 0]).setLabel(['PAUSE','RESUME'][paused ? 1 : 0])
                    const index = UI.components.indexOf(button)
                    UI.components[index] = button
                    interaction.deferUpdate()
                    break
                case 'terminate':
                    origin.stop();
                    endpoint.stop();
                    interaction.deferUpdate()
                    break
            }
        })

        if(this.submitSet == false){
            this.submitSet = true
            
            client.on('modalSubmit', (modal)=>{
                switch (modal.customId) {
                    case 'mimic-embed':
                        const embed = new MessageEmbed().setTitle(modal.getTextInputValue('title'))
    
                        if(modal.getTextInputValue('description')){
                            embed.setDescription(modal.getTextInputValue('description'));
                        }
    
                        if(modal.getTextInputValue('image')){
                            try { embed.setImage(modal.getTextInputValue('image')); } catch (error) {
                                modal.reply({ephemeral: true, content: 'Error: Invalid image, please give a valid URL.'}); 
                                return; 
                            }
                        }
    
                        if(modal.getTextInputValue('fields')){
                            try { embed.setFields(JSON.parse(`{"fields":[${modal.getTextInputValue('fields')}]}`).fields); } catch (error) { 
                                modal.reply({ephemeral: true, content: 'Error: Invalid JSON field, message not sent.'}); 
                                return; 
                            }
                        }
    
                        if(modal.getTextInputValue('colour')){
                            try { embed.setColor(modal.getTextInputValue('colour')); } catch (error) {
                                modal.reply({ephemeral: true, content: 'Error: Invalid colour, message not sent.'}); 
                                return
                            }
                        }
    
                        channel.send({embeds: [embed]})
    
                        modal.deferReply().then(_ =>{
                            modal.deleteReply()
                        }).catch((error)=>{
                            console.log(error);
                        })
                        break;
                }
            })
        }

        endpoint.on('collect', other =>{
            if(paused == true){ return; }
            origin.resetTimer({time: timeout});
            endpoint.resetTimer({time: timeout});
            message.channel.send(`${other.author.username}: ${other.content}`)
        })

        origin.on('collect', received => {

            if(paused == true){ return; }

            origin.resetTimer({time: timeout});
            endpoint.resetTimer({time: timeout});

            channel.send(received.content).catch((error)=>{
                message.channel.send(`\`\`\`yaml\nDISRUPTION\nServer: ${server.name}\nChannel: ${channel.name}\nMessage: Error Occured '${error.message}'\nStatus: Connection Open\`\`\``);
            })   
        });

        origin.on('end', received => {
            connected.delete()
            connections = connections.filter(instance => JSON.stringify(connection) !== JSON.stringify(instance))
            message.channel.send(`\`\`\`yaml\nDISCONNECTED\nServer: ${server.name}\nChannel: ${channel.name}\nStatus: Connection closed\`\`\``);
        });
    }
    /**
     * Method executed when slash command is called
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async callback(client, interaction){

    }
}