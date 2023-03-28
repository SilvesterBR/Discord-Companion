const { TextInputComponent, Modal, SelectMenuComponent, showModal} = require('discord-modals');
const { Message, MessageEmbed, MessageButton, MessageActionRow} = require('discord.js');
const runes = require('runes');

const Types = require('./Page')

const DEFAULT_PAGE = {
    embeds: [],
    client: null,
    isSelectable: true,
    skip: true,
    timeout: 10000,
    hasPageNumber: true,
    start: 0
}

const DEFAULT_SEARCHPAGE_OPTIONS = {
    isCallback: false,
    max: 10,
    results: [],
    identifiers: ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','1️⃣1️⃣','1️⃣2️⃣','1️⃣3️⃣','1️⃣4️⃣','1️⃣5️⃣','1️⃣6️⃣','1️⃣7️⃣','1️⃣8️⃣','1️⃣9️⃣','2️⃣0️⃣'],
    undefinedResultValue: 'Unknown Result',
    useIdentifiers: true,
    innerPageOptions: DEFAULT_PAGE
}

const DEFAULT_SEARCHPAGE = Object.assign(DEFAULT_SEARCHPAGE_OPTIONS, DEFAULT_PAGE)

class PageEmbed{
    /**
     * 
     * @param {Message} message 
     * @param {Types.Options | Types.SearchOptions} options 
     */
    constructor(message, options){

        /**@type {Types.Options | Types.SearchOptions} */
        this.options = options;

        /**@type {Message} */
        this.message = message

        /**@type {MessageEmbed[]} */
        this.content = options.embeds;

        /**@type {Number} */
        this.index = options.start;

        if(this.options.hasPageNumber == true){
            this.content.map((content, i) => content.setFooter({text: `Page : ${i + 1} / ${this.content.length}`}))
        }
    }

    /**
     * Set the current page to a given embed
     * @param {MessageEmbed} embed 
     */
    setContent(embed){}


    /**
     * Create the navigation menu used to move between content
     * @returns {MessageActionRow}
     */
    generateNavigationButtons(){
        let navigation = [];
        if(this.options.skip == true){
            const first = new MessageButton().setCustomId('first').setLabel('First').setStyle('PRIMARY')
            const last = new MessageButton().setCustomId('last').setLabel('Last').setStyle('PRIMARY')
            navigation = [first, last]      
        }

        const previous = new MessageButton().setCustomId('previous').setLabel('Previous').setStyle('PRIMARY');
        const next = new MessageButton().setCustomId('next').setLabel('Next').setStyle('PRIMARY')
        const movables = [previous, next]

        if(this.options.isSelectable == true){
            const select = new MessageButton().setCustomId('select').setLabel('Select').setStyle('PRIMARY')
            movables.splice(1, 0, select);
        }

        navigation.splice(this.options.skip ? 1 : 0, 0, movables);
        return new MessageActionRow().addComponents(navigation);

    }

    /**
     * Set and return the first Page element
     * @returns {MessageEmbed}
     */
    first(){
        const first = 0;
        this.index = first;
        this.setContent(this.content[first]);
        return this.content[first];
    }

    /**
     * Set and return the last Page element
     * @returns {MessageEmbed}
     */
    last(){
        const last = this.content.length - 1;
        this.index = last;
        this.setContent(this.content[last]);
        return this.content[last];
    }

    /**
     * Set and return the next Page element
     * @returns {MessageEmbed}
     */
    next(){
        const amount = 1
        const next = (this.index + amount) % this.content.length;
        this.index = next;
        this.setContent(this.content[next]);
        return this.content[next];
    }

    /**
     * Set and return the previous Page element
     * @returns {MessageEmbed}
     */
    previous(){
        const amount = 1
        const previous = ((this.index - amount) + this.content.length * amount) % this.content.length        
        this.index = previous;
        this.setContent(this.content[previous]);
        return this.content[previous];
    }

    /**
     * Select a specific page by index. Returns undefined if nothing is at that index.
     * @param {number} index 
     */
    select(index){
        if(this.content[index] === undefined) return undefined;
        this.index = index
        this.setContent(index)
        return this.content[index]
    }

    current(){
        return this.content[this.index]
    }

    /**@readonly*/
    MAX_COMPONENTS = 5;
    /**@readonly*/
    MAX_OPTIONS = 25;

    input(interaction){

        if(true){
            throw new Error('The API for generating modals is currently at a level where implementing this feature would require working around the API rather than with.\n As it stands, the discord-modal-api has some of the worst structures/components if have ever seen.\n Until someone with expereince writes an improved version, this feature will be left on hold. ');
        }

        if(this.options.embeds.length > this.MAX_COMPONENTS * this.MAX_OPTIONS){
            throw new RangeError(`Total embeds cannot exceed ${this.MAX_COMPONENTS * this.MAX_OPTIONS} total embeds. This is a limitation with discord.`)
        }

        const components = [];
        const results = this.options.embeds.map(embed => { return embed.title})
        let iterations = 0;
        for (let i = 0; i < results.length; i += this.MAX_OPTIONS) {
            const chunk = results.slice(i, i + this.MAX_OPTIONS);
            components.push(new SelectMenuComponent()
                .setCustomId(`Menu${(i + 1) / this.MAX_OPTIONS}`)
                .setPlaceholder(`Embeds: ${i + 1} to ${chunk.length + (iterations * this.MAX_OPTIONS)}`)
                .setOptions(chunk.map((embed, j) => { 
                    const value = (j + 1) + (iterations * this.MAX_OPTIONS);
                    return {
                        label: embed, description: `Page ${value}`, value: value.toString()
                    }
                }))
            )
            iterations++;
        }

        const modal = new Modal()
        .setCustomId('page')
        .setTitle('Page Number')
        .addComponents(components)

        showModal(modal, {client:this.options.client,interaction:interaction})
    }

}

class Page extends PageEmbed{

    constructor(message, options){
        super(message, Object.assign(DEFAULT_PAGE, options ? options : {}));

        /**@type {Message} */
        this.sent = null;
    }

    async create(){
        const navigation = this.generateNavigationButtons();
        this.sent = await this.message.channel.send({embeds: [this.content[this.index]], components: [navigation]})
        const collector = this.sent.createMessageComponentCollector({time: this.options.timeout})

        collector.on('collect',async(interaction)=>{
            collector.resetTimer({time: this.options.timeout});
            switch (interaction.customId) {
                case 'next':
                    this.next()
                    break;
                case 'previous':
                    this.previous()
                    break
                case 'first':
                    this.first()
                    break
                case 'last':
                    this.last()
                    break
            }

            interaction.deferUpdate();
        })

        collector.on('end', () =>{
            this.sent.delete().catch(()=>{})
        })

        return this
    }

    /**
     * Set the current page to a given embed
     * @param {MessageEmbed} embed 
     */
    setContent(embed){
        this.sent.edit({embeds: [embed], components: this.sent.components})
    }

    /**
     * Returns the message sent to create the Page
     * @returns {Message}
     */
    getMessage(){
        return this.sent;
    }

    /**
     * Set the message sent to create the Page
     * @returns {Page}
     */
    setMessage(message){
        this.sent = message;
        return this;
    }
}

class SearchPage extends PageEmbed{

    /**
     * 
     * @param {Message} message 
     * @param {Types.SearchOptions} options 
     */
    constructor(message, options){

        super(message, Object.assign(DEFAULT_SEARCHPAGE, options ? options : {}));

        this.options.embeds.forEach((embed, i) =>{
            if(this.options.results[i] === undefined){ this.options.results[i] = embed.title ? embed.title : `${this.options.undefinedResultValue} ${i}` }
        })

        this.options.innerPageOptions.embeds = this.generateResults();

        this.page = new Page(message, this.options.innerPageOptions)
    }

    async create(callback){

        if(this.options.embeds.length <= 0 && this.options.results.length <= 0) {
            throw new SyntaxError('SearchPage requires embeds or results to have a length greater than 0.');
        }

        const message = await this.message.channel.send({components:this.generateInput(this.index), embeds: [this.page.current()]})
        this.page.setMessage(message);

        const collector =  message.createMessageComponentCollector({time:this.options.timeout})
        collector.on('collect', (interaction) => {
            collector.resetTimer({time: this.options.timeout});

            const amount = 1

            switch (interaction.customId) {
                case 'next':
                    this.page.getMessage().components = this.generateInput((this.page.index + amount) % this.page.content.length)
                    this.page.next()
                    break;
                case 'previous':
                    this.page.getMessage().components = this.generateInput(((this.page.index - amount) + this.page.content.length * amount) % this.page.content.length)
                    this.page.previous()
                    break
                case 'first':
                    this.page.getMessage().components = this.generateInput(0)
                    this.page.first()
                    break
                case 'last':
                    this.page.getMessage().components = this.generateInput(this.page.content.length - 1)
                    this.page.last()
                    break
                case 'back':
                    this.back()
                    break
                // case 'select':
                //     this.input(interaction)
                //     return this;
                default:
                    const value = Number.parseInt(interaction.customId) + this.options.max * this.page.index
                    if(this.options.isCallback == true){
                        callback(interaction, value, this.content[value])
                    }else{
                        if((this.content[value] instanceof MessageEmbed) == false) break
                        this.setContent(this.content[value])
                    }
                    break
            }

            interaction.deferUpdate();
            return this;
        })

        collector.on('end', () =>{
            this.page.getMessage().delete().catch(()=>{})
        })
    }

    back(){
        const current = this.page.current();
        this.page.getMessage().edit({embeds: [current], components: this.generateInput(this.page.index)})
    }
    
    setContent(embed){
        if((embed instanceof MessageEmbed) == false){ throw new TypeError('embed must be of type MessageEmbed') }
        const back = new MessageActionRow().addComponents(new MessageButton().setCustomId('back').setLabel('Back').setStyle('DANGER'))
        this.page.getMessage().edit({embeds: [embed], components: [back]})
    }

    getResultPage(){
        return this.page;
    }
    
    MAX_BUTTON_IN_ROW = 5
    /**
     * Generate buttons that allow the user to select a specific piece of content
     * @returns {MessageActionRow[]}
     */
    generateSelectionButtons(index){
        const total = this.options.results.slice(index * this.options.max, index * this.options.max + this.options.max);
        const buttons = []
        
        let sum = 0
        for (let i = 0; i < total.length; i+= this.MAX_BUTTON_IN_ROW) {
            const chunk =  total.slice(i, i + this.MAX_BUTTON_IN_ROW).length
            const row = new MessageActionRow();

            for (let j = 0; j < chunk; j++) {
                const emoji_regex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+$/;
                const emoji = this.options.identifiers[sum] 
                const isSingleEmoji = emoji_regex.test(emoji) && runes(emoji).length == 1
                const button = new MessageButton().setCustomId(sum.toString()).setStyle('SECONDARY');
                
                if(isSingleEmoji == true)button.setEmoji(this.options.identifiers[sum])
                else button.setLabel(`${this.options.useIdentifiers == true? this.options.identifiers[sum] : sum +  1}`)
                
                row.addComponents(button)
                sum++
            }
            buttons.push(row)
        }
        return buttons;
    }

    generateInput(index){
        return [this.generateNavigationButtons()].concat(this.generateSelectionButtons(index))
    }

    generateResults(){
        const pages = [];
        for (let i = 0; i < this.options.results.length; i+= this.options.max) {
            const chunk = this.options.results.slice(i, i + this.options.max)
            pages.push(new SearchResult(this.content.length > 0 ? this.content.length : this.options.results.length, this.options.identifiers, chunk));
        }
        return pages;
    }
}

class SearchResult extends MessageEmbed{

    /**
     * @param {number} total 
     * @param {string[]} identifiers 
     * @param {string[]} results 
     */
    constructor(total, identifiers, results){
        super();
        this.setTitle('Searched Results');
        this.setDescription('Select the result you wish to view using the buttons below.')
        this.setColor('#55acee');
        this.addField('Total Results', total.toString());

        let display = "";
        results.forEach((result, i) => {
            display += `${identifiers[i]} ${result} \n`

        });
        this.addField('Results', display)
    }
}

module.exports = {Page, SearchPage}