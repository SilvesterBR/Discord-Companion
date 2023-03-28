const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const ClientID = process.env.BUNGIE_CLIENT_ID;
const ClientSecret = process.env.BUNGIE_CLIENT_SECRET;
const APIToken = process.env.BUNGIE_KEY

const BungieDirectory = 'https://www.bungie.net';
const BungieTypes = require('../types/BungieTypes'); //
const {TokenStorage} = require('../types/CustomTypes'); //
const fs = require('fs');
const SZIP = require('node-stream-zip');
const request = require('request');

const Mongoose = require('mongoose');
const Account = require('../../../mongoose/schemas/Account');

const crypto = require('crypto-js');

/**
 * Cached access token data, used to avoid excess requests
 * @type {TokenStorage[]}
 */
const Tokens = [];


/**
 * /**
 * Get a Response from the Bungie API
 * @param {String} Endpoint - The endpoint in which a response will be sent from the Bungie API
 * @param {String} [DiscordID=undefined] - DiscordID used to find user and their refresh token
 * @param {String} [AccessToken=undefined] 
 * @returns {Promise<BungieTypes.BungieResponse>} The response Bungie has sent.
 */
async function Get(Endpoint, DiscordID, AccessToken){
    const xhr = new XMLHttpRequest();
    xhr.open("GET", BungieDirectory + Endpoint, true);
    xhr.setRequestHeader("X-API-Key", APIToken);
    
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if(this.status === 200){
                    resolve(JSON.parse(xhr.responseText));
                }else{
                    reject(HandleErrorReponse(xhr))
                }
            }
        };
        xhr.send();
    });
}

/**
 * Get a Response from the Bungie API
 * @param {String} Endpoint - The endpoint in which a response will be sent from the Bungie API
 * @param {String} [AccessToken=undefined] - Is an Oauth2 access token required to access the endpoint?
 * @param {String} PostBody - The body of the post request
 * @returns {Promise<BungieTypes.BungieResponse>} The response Bungie has sent.
 */
function Post(Endpoint, PostBody ,AccessToken){
    const xhr = new XMLHttpRequest();
    xhr.open("POST", BungieDirectory + Endpoint, true);
    xhr.setRequestHeader("X-API-Key", APIToken);
    
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if(this.status === 200){
                    resolve(JSON.parse(xhr.responseText));
                }else{
                    reject(HandleErrorReponse(xhr))
                }
            }
        };
        xhr.send(PostBody);
    });
}


/**
 * Obtain a users access data to the bungie API
 * @param {String} DiscordID - DiscordID used to obtain registered user
 * @returns {Promise<BungieTypes.AccessTokenRequest}
 */
function GetAuthorization(DiscordID){
    return new Promise((resolve, reject) => {
        
        //Check if we have a user already cached
        //Return that user if it has a valid access token
        const CachedUser = Tokens.find(users => users.discordID == discordID);
        if(CachedUser){
            if(new Date().getTime() < CachedUser.expireTime){
                resolve(CachedUser.OauthData);
            }
        }
        
        Mongoose.connect(process.env.MONGO_DB_CONNECTION, { useNewUrlParser: true,useUnifiedTopology: true},async(err) => {
            //Search for the user in our database
            const Accounts = await Account.find({DiscordID: DiscordID});
            if(Accounts.length > 0){
                
                //Obtain a valid access token by trading their refresh token
                TradeRefreshToken(crypto.AES.decrypt(Accounts[0].BungieRefreshToken, process.env.ENCRYPTION_KEY)).then(response=>{
                    //Get the users cached information
                    const PreviousDataIndex = Tokens.findIndex(users => users.discordID == DiscordID);
                    if(PreviousDataIndex != -1){
                        //User is already cached, update accordingly
                        Tokens[PreviousDataIndex].OauthData = response;
                        Tokens[PreviousDataIndex].expireTime = new Date().getTime() + response.expires_in;
                        
                    }else{
                        //User has not been cached, insert their data
                        Tokens.push({
                            discordID:DiscordID,
                            OauthData:response,
                            expireTime:new Date().getTime() + response.expires_in
                        });
                        
                    }
                    Account.updateOne({"DiscordID": DiscordID},{$set:{"BungieRefreshToken": crypto.AES.encrypt(response.refresh_token,process.env.ENCRYPTION_KEY)}})
                    resolve(response)
                    
                }).catch(error=>{
                    reject(error);
                })
            }else{
                reject('User not found');
            }
        });
        Mongoose.connection.close();
    });
}

/**
 * Trade an authorization code to obtain Oauth2 information.
 * @param {String} RefreshToken - A long term code used to trade for an access token.
 * @returns {Promise<BungieTypes.AccessTokenRequest>} The response Bungie has sent.
 */
function TradeRefreshToken(RefreshToken){
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://www.bungie.net/platform/app/oauth/token/", true);
    xhr.setRequestHeader("X-API-Key", APIToken);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("client_id="+ ClientID + "&client_secret=" + ClientSecret + "&grant_type=refresh_token&refresh_token=" + RefreshToken);
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if(this.status === 200){
                    resolve(JSON.parse(xhr.responseText));
                }else{
                    reject(HandleErrorReponse(xhr))
                }
            }
        };
    });
}

/**
 * Trade an authorization code to obtain Oauth2 information.
 * @param {String} AuthorizationCode - Temporary code a user will trade for an access token
 * @returns {Promise<BungieTypes.AccessTokenRequest>} The response Bungie has sent.
 */
function TradeAuthorizationCode(AuthorizationCode){
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://www.bungie.net/platform/app/oauth/token/", true);
    xhr.setRequestHeader("X-API-Key", APIToken);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("client_id="+ ClientID + "&client_secret=" + ClientSecret + "&grant_type=authorization_code&code=" + AuthorizationCode);
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if(this.status === 200){
                    resolve(JSON.parse(xhr.responseText));
                }else{
                    reject(HandleErrorReponse(xhr))
                }
            }
        };
    });
}

/**
 * Return a JSON response of what bungie has returned in case of an error
 * @param {XMLHttpRequest} Response - The reponse that bungie has sent that caused and error
 * @returns {BungieTypes.BungieResponse} Formatted Error Message from Bungie response
 */
function HandleErrorReponse(Response){
    try {

        return JSON.parse(Response.responseText);
    } catch (error) {
        return {
            ErrorStatus: "Unexpected Error",
            Message: Response.status + " - " + HTTPStatus[Response.status],
            MessageData: ""
        }
        
    }
}



var CurrentVersion = undefined;

/**
 * Stores the Destiny manifest in a location, the destiny manifest is a series of JSON objects stored in an SQLLite database
 * @param {string} ManifestStoreLocation- The path where the Manifest data will be stored
 */
function GetManifest(ManifestStoreLocation='./game/destiny/manifest/'){

    Get('/Platform/Destiny2/Manifest/').then((ResponseText) =>{

        /** @type {BungieTypes.DestinyManifest}*/
        const Response = ResponseText.Response;

        let options = {
            url: 'https://www.bungie.net/' + Response.mobileWorldContentPaths.en,
            method: 'GET',
            encoding: null,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.BUNGIETOKEN
            }
        };

        let outStream = fs.createWriteStream(ManifestStoreLocation+ 'manifest.zip');
        var paths = (Response.mobileWorldContentPaths.en).split('/')
        var en_path = paths[paths.length - 1]

        request(options).on('response', function(res, body){}).pipe(outStream).on('finish', async function(){

            let zip = new SZIP({
                file: ManifestStoreLocation + 'manifest.zip',
                storeEntries: true
            }); 

            console.log('Unzipping manifest...')

            zip.on('ready', async function(){
                zip.extract(en_path, ManifestStoreLocation+ 'manifest.content', async function(err,count){
                    if(err) {
                        console.log(err);
                    }else{
                        console.log('Manifest Successfully downloaded')
                    }
                    fs.unlink(ManifestStoreLocation + 'manifest.zip',function(){});  
                });
            });

        });

    }).catch((error) =>{
        console.log(error)
    });
}

module.exports = {Get, Post, GetAuthorization, TradeAuthorizationCode, GetManifest}