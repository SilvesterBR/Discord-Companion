import { ButtonInteraction, Client, Message, MessageActionRow, MessageEmbed } from "discord.js";

//#region 
export interface Options{
    /**
     * The content displayed to the user
     */
    embeds: MessageEmbed[],
    /**
     * How long the page will last in milliseconds
     */
    timeout: number,
    /**
     * Allows user to skip to start and end
     */
    skip: boolean,
    /**
     * Allows user to select a specific embed to skip to
     */
    isSelectable: boolean,
    /**
     * Used to generate a modal, onyl used when isSelectable = true.
     */
    client: Client
    /**
     * Each content embed will display the current page
     */
    hasPageNumber: boolean,
    /**
     * Inticates which page will be displayed first
     */
    start: number,
}

export interface SearchOptions extends Options{
    /**
     * When true, instead of updating the content, the value selected by the user will be passed through a callback. Alternitively, the content will be updated automatically
     */
    isCallback: boolean,
    /**
     * Maximum number of results displayed on a single page/
     */
    max: number,
    /**
     * The search result value displayed to the user, if none are given the embed title will be taken instead
     */
    results: string[],
    /**
     * These identify which button corresponds with which result
     */
    identifiers: string[],
    /**
     * When an embed title cannot be found for the search result, this value will be used isntead
     */
    undefinedResultValue: string,
    /**
     * Switch between numbers and identifiers set
     */
    useIdentifiers: boolean,
    /**
     * This page is what holds all of the results.
     */
    innerPageOptions: Options,
}

//#endregion

export class PageEmbed{
    
    constructor(message: Message, options: Options)

    private options: Options | SearchOptions
    private content: MessageEmbed[]
    private message: Message
    private index: number

    /**
     * Create and send the page to the given channel.
     */
    public async create(): this

    private generateNavigationButtons() : [MessageActionRow[]]

    /**
     * Set what content is to be displayed.
     */
    public override setContent(embed: MessageEmbed) : void

    public first(): MessageEmbed

    public last(): MessageEmbed

    public next(): MessageEmbed

    public previous(): MessageEmbed

    public current() : MessageEmbed
    
    public select(index: number): MessageEmbed | undefined

    //Get Modal input from user [Text input or *DropwDownMenu*]
    private async input(interaction: ButtonInteraction) : Promise<number>
}

export class Page extends PageEmbed{

    constructor(message: Message, options: Options)

    private sent : Message

    public async create(): this

    public setContent(embed: MessageEmbed) : void

    /**
     * Get the message which holds the Page.
     */
    public getMessage() : Message

    /**
     * Set the message which holds the Page.
     */
    public setMessage(message: Message) : void
}

export class SearchPage extends PageEmbed{

    constructor(message: Message, options: SearchOptions)

    private page: Page

    public async create(callback?: (interaction: ButtonInteraction, value: number, embed: MessageEmbed | undefined) => void): this

    public setContent(embed: MessageEmbed) : void

    /**
     * Return back to the results page.
     */
    public back(): void

    
    /**
     * Get the page which hold all the results.
     */
    public getResultPage() : Page
    
    private generateSelectionButtons(index: number) : MessageActionRow[]

    private generateInput(index: number) :  MessageActionRow[]
    
    private generateResults() : SearchPage[]

}

export class SearchResult extends MessageEmbed{
    constructor(total: number, identifiers: string[], results: string[])
}



