import { AccessTokenRequest } from "./BungieTypes";

export interface RotatingActivity{
    [key: string]:[RotatingData]
}

export interface RotatingData{

    /**The activity type represented as a number in the BungieAPI */
    contentType?:number 

    /**Name of the activity */
    activityName:String, 

    /**The index of the challenge that we are using to get every challenge */
    challengeIndex:number, 

    /**The last date challengeIndex occured*/
    lastDate:Date,

    /** The total rotating data (challanges, weapons, etc) this activity has*/
    totalChallenges:number,

    /** Searchable term to locate this activty*/
    searchTerms:String[],

    /** Each challenge the raid has */
    challenge?:RaidChallenge[],

    /** Each weapon in the nightfall rotation */
    nightfallWeapons?:[[NightfallWeapons]],

    /**Image of the activity */
    defaultIcon?:String

}


export interface RaidChallenge{

    /**Name of the challenge */
    name:String,
    /**Array of the specific locations name.
     * 
     * Note: this will likely only be used on raid challenges 
     */
    location:String,
    /** Array of the rotating data (challanges, weapons, etc) this activity has*/
    guide:String,

    /** Hash value of the record in the Bungie API*/
    recordHash?:String

    /**Image of the challenge */
    challengeIcon?:String
        
}

export interface NightfallWeapons{

    /**Name of the weapons */
    name:String,
    /**Hash of the weapons for further details*/
    weaponHash:String,
    /**Hash of the adept version of the weapon*/
    adeptWeaponHash?:String
}

export interface TokenStorage{
    discordID:String,
    OauthData:AccessTokenRequest,
    expireTime:Date
}