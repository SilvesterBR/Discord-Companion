const { Client, Message, User, Channel, Role, MessageActionRow, MessageSelectMenu} = require('discord.js');
const Command = require('../../../utils/structures/BaseCommand');
module.exports = class dropdown extends Command{
    constructor(){
        super({
            name: 'dropdown',
            description: 'Dropwdown command: Displays a dropdown menu.',
            devOnly:true
        })
    }
    /**
     * Method executed when prefix command is called
     * @param {Client} client 
     * @param {Message} message 
     * @param {{[key:string]:User | Channel | Role | String | Number | Boolean}} args 
     */
    async run(client, message, args){
        const row = new MessageActionRow();
        row.addComponents(
            new MessageSelectMenu()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions([
                {label: 'Selection 1',description: 'This is selction 1',value: 'selection1',},
                {label: 'Selection 2',description: 'This is selction 2',value: 'selection2',},
            ]),
        );
        const sentMessage = await message.channel.send({components:[row]})
        const collector = sentMessage.createMessageComponentCollector({time: 5000})
        collector.on('collect',(interaction)=>{
            interaction.reply({
                content:`You clicked ${interaction.values[0]}`,
            })
        })
        collector.on('end', (interaction)=>{
            sentMessage.delete().catch(()=>{console.log('caught');})
        })
    }
}