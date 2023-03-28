export interface BungieResponse{
    Response: Object,
    ErrorCode: number,
    ThrottleSeconds: number,
    ErrorStatus: string,
    Message: string,
    MessageData: string,
    DetailedErrorTrace?: string
}

export interface DestinyManifest{
    version: string,
    mobileAssetContentPath: string,
    mobileGearAssetDataBases: {version: number,path: string}[],
    mobileWorldContentPaths: {en:string},
    jsonWorldContentPaths: Object,
    jsonWorldComponentContentPaths: Object,
    mobileClanBannerDatabasePath: string,
    mobileGearCDN: object,
    iconImagePyramidInfo: {name:string,factor:number}[]
}

export interface DestinyActivityModifierDefinition{
    displayProperties:DisplayPropertiesDefinition,
    hash:number,
    index:number,
    redacted:boolean,
    blacklisted:boolean
}

export interface DestinyPublicMilestone{

    [hash:number]:{
        milestoneHash:number,
        activities:[
            {
                activityHash: number,
                challengeObjectiveHashes:[],
                modifierHashes:number[],
                booleanActivityOptions:{}
            }
        ],
        startDate:Date,
        endDate:Date,
        order:number
    }
}

export interface AccessTokenRequest{
    access_token: string,
    token_type:string,
    expires_in:number,
    refresh_token:string,
    refresh_expires_in: number
    membership_id:number
}

export interface InventoryItemDefinition{
    displayProperties:DisplayPropertiesDefinition,
    tooltipNotifications:Object[],
    collectibleHash:Object[],
    iconWatermark:string,
    iconWatermarkShelved:string,
    secondaryIcon:string,
    secondaryOverlay:string,
    secondarySpecial:string,
    backgroundColor:Object,
    screenshot:string,
    itemTypeDisplayName:string,
    flavorText:string,
    uiItemDisplayStyle:string,
    itemTypeAndTierDisplayName:string,
    displaySource:string,
    tooltipStyle:string,
    action:object,
    inventory:object,
    setData:object,
    stats:object,
    emblemObjectiveHash:number,
    equippingBlock:object,
    translationBlock:object,
    preview:object,
    quality:object,
    value:DestinyItemQuantity,
    loreHash:number,
    summaryItemHash:number,
    animations:object[],
    allowActions:boolean,
    links:object[],
    doesPostmasterPullHaveSideEffects:boolean,
    nonTransferrable:boolean,
    itemCategoryHashes:number,
    specialItemType:number,
    itemType:number,
    itemSubType:number,
    classType:number,
    breakerType:number,
    breakerTypeHash:number,
    equippable:boolean,
    damageTypeHashes:number[],
    damageTypes:number[],
    defaultDamageType:number,
    defaultDamageTypeHash:number,
    seasonHash:number,
    isWrapper:boolean,
    traitIds:string[],
    traitHashes:number[],
    hash:number,
    index:number,
    redacted:boolean
}

export interface DestinyItemValueBlockDefinition{
    itemHash:string,
    itemInstanceId:string,
    quantity:number,
    hasConditionalVisibility:boolean
}

export interface DestinyItemQuantity{
    itemValue:DestinyItemValueBlockDefinition[],
    valueDescription:string
}

export interface DestinyActivityDefinition{
    displayProperties:DisplayPropertiesDefinition,
    originalDisplayProperties:DisplayPropertiesDefinition,
    selectionScreenDisplayProperties:DisplayPropertiesDefinition,
    releaseIcon:string,
    releaseTime:number,
    activityLightLevel:number,
    destinationHash:number,
    placeHash:number,
    activityTypeHash:number,
    tier:number,
    pgcrImage:string,
    rewards:Object[],
    modifiers:[{activityModifierHash:number}],
    challenges:[
        {
            rewardSiteHash:number,
            inhibitRewardsUnlockHash:number,
            objectiveHash:number,
            dummyRewards:[
                {
                    itemHash:number,
                    quantity:number,
                    hasConditionalVisibility:boolean
                }
            ]
        }
    ],
    optionalUnlockstrings:[],
    inheritFromFreeRoam:boolean,
    suppressOtherRewards:boolean,
    playlistItems:[],
    matchmaking:{
        isMatchmade:boolean,
        minParty:number,
        maxParty:number,
        maxPlayers:number,
        requiresGuardianOath:boolean
    }
    directActivityModeHash:number,
    directActivityModeType:number,
    loadouts:[],
    activityModeHashes:number[],
    activityModeTypes:number[],
    isPvP:boolean,
    insertionPoints:number[],
    activityLocationMappings:[],
    hash:number,
    index:number,
    redacted:boolean,
    blacklisted:boolean
}

export interface DisplayPropertiesDefinition{
    description:string,
    name:string,
    icon:string,
    iconSequences:Object[],
    highResIcon:string,
    hasIcon:string
}

export interface DestinyItemStatsComponent{
    stats:DestinyStat
}

export interface DestinyStat{
    statHash:number,
    value:number
}

export interface UserSearchResponse{
    searchResults:UserSearchResponseDetail[],
    page:number
    hasMore:boolean
}

export interface UserSearchResponseDetail{
    bungieGlobalDisplayName:string,
    bungieGlobalDisplayNameCode:number,
    bungieNetMembershipId:number,
    destinyMemberships:UserInfoCard[]
}

export interface UserInfoCard{
    supplementalDisplayName:string,
    iconPath:string,
    crossSaveOverride:number,
    applicableMembershipTypes:number[],
    isPublic:boolean,
    membershipType:number,
    membershipId:number,
    displayName:string,
    bungieGlobalDisplayName:string,
    bungieGlobalDisplayNameCode:number
}

export interface DestinyHistoricalStatsAccountResult{
    mergedDeletedCharacters:{},
    mergedAllCharacters:{},
    characters:DestinyHistoricalStatsPerCharacter[]
}

export interface DestinyHistoricalStatsPerCharacter{
    characterId:number,
    deleted:boolean,
    results:{},
    merged:{}
}

export interface DestinyAggregateActivityResults{
    activities:DestinyAggregateActivityStats[]
}

export interface DestinyAggregateActivityStats{
    activityHash:number,
    values:{
        fastestCompletionMsForActivity:DestinyHistoricalStatsValue
        activityCompletions:DestinyHistoricalStatsValue
        activityDeaths:DestinyHistoricalStatsValue
        activityKills:DestinyHistoricalStatsValue
        activitySecondsPlayed:DestinyHistoricalStatsValue
        activityWins:DestinyHistoricalStatsValue
        activityGoalsMissed:DestinyHistoricalStatsValue
        activitySpecialActions:DestinyHistoricalStatsValue
        activityBestGoalsHit:DestinyHistoricalStatsValue
        activityGoalsHit:DestinyHistoricalStatsValue
        activitySpecialScore:DestinyHistoricalStatsValue
        activityBestSingleGameScore:DestinyHistoricalStatsValue
        activityKillsDeathsRatio:DestinyHistoricalStatsValue
        activityAssists:DestinyHistoricalStatsValue
        activityKillsDeathsAssists:DestinyHistoricalStatsValue
        activityPrecisionKills:DestinyHistoricalStatsValue        
    }
}

export interface DestinyHistoricalStatsValue{
    statId:number,
    basic:{
        value:number,
        displayValue:string

    }
    activityId:string

}

export interface DestinyProfileResponse{
    //Many...Many...Many More
    profile?:SingleComponentResponseOfDestinyProfileComponent,
    characters?:DictionaryComponentResponseOfint64AndDestinyCharacterComponent
    characterInventories?:DictionaryComponentResponseOfint64AndDestinyInventoryComponent
}

export interface DictionaryComponentResponseOfint64AndDestinyInventoryComponent{

    data:DestinyInventoryComponent,
    privacy:number,
    disabled:boolean
}

export interface DestinyInventoryComponent{
    [key:string]:{
        items:DestinyItemComponent[]
    }
}

export interface DestinyItemComponent{
    itemHash:string,
    itemInstanceId:string,
    quantity:number,
    bindStatus:number,
    location:number,
    bucketHash:number,
    transferStatus:number,
    lockable:boolean,
    state:number,
    overrideStyleItemHash:number,
    expirationDate:Date,
    isWrapper:boolean,
    tooltipNotificationIndexes:number[],
    metricHash:number,
    metricObjective:DestinyObjectiveProgress,
    versionNumber:number,
    itemValueVisibility:boolean[]
}

export interface DestinyObjectiveProgress{
    objectiveHash:number,
    destinationHash:number,
    activityHash:number,
    progress:number,
    completionValue:number,
    complete:boolean,
    visible:boolean
}

export interface SingleComponentResponseOfDestinyProfileComponent{
    data:{
        userInfo:UserInfoCard,
        dateLastPlayed:Date,
        versionsOwned:number,
        characterIds:number,
        seasonHashes:number,
        currentSeasonHash:number,
        currentSeasonRewardPowerCap:number
    }
    privacy:number,
    disabled:boolean
}

export interface DestinyCharacterComponent{
    membershipId:number,
    membershipType:number,
    characterId:number,
    dateLastPlayed:Date,
    minutesPlayedThisSession:number,
    minutesPlayedTotal:number,
    light:number,
    stats:{},
    raceHash:{},
    genderHash:{},
    classHash:{},
    raceType:number,
    classType:number,
    genderType:number,
    emblemPath:string,
    emblemBackgroundPath:string,
    emblemHash:number,
    emblemColor:{},
    levelProgression:{},
    baseCharacterLevel:number,
    percentToNextLevel:number,
    titleRecordHash:number
}

export interface DictionaryComponentResponseOfint64AndDestinyCharacterComponent{
    data:DestinyCharacterComponent
    privacy:number,
    disabled:boolean
}

export interface UserMembershipData{
    destinyMemberships:GroupUserInfoCard[],
    primaryMembershipId:number
    bungieNetUser:GeneralUser
}

export interface GroupUserInfoCard{
    LastSeenDisplayName:String,
    LastSeenDisplayNameType:Number,
    supplementalDisplayName:String,
    iconPath:String,
    crossSaveOverride:Number,
    applicableMembershipTypes:Number[],
    isPublic:Boolean,
    membershipType:Number,
    membershipId:number,
    displayName:String,
    bungieGlobalDisplayName:String,
    bungieGlobalDisplayNameCode:number
}

export interface GeneralUser{
    membershipId:number,
    uniqueName:String,
    normalizedName:String,
    displayName:String,
    profilePicture:number,
    profileTheme:number,
    userTitle:number,
    successMessageFlags:number,
    isDeleted:boolean,
    about:String,
    firstAccess:Date,
    lastUpdate:Date,
    legacyPortalUID:number,
    context:Object,
    psnDisplayName:String,
    xboxDisplayName:String,
    fbDisplayName:string,
    showActivity:boolean,
    locale:string,
    localeInheritDefault:boolean,
    lastBanReportId:number,
    showGroupMessaging:boolean,
    profilePicturePath:String,
    profilePictureWidePath:string,
    profileThemeName:string,
    userTitleDisplay:string,
    statusText:string,
    statusDate:Date,
    profileBanExpire:Date,
    blizzardDisplayName:String,
    steamDisplayName:String,
    stadiaDisplayName:string,
    twitchDisplayName:String,
    cachedBungieGlobalDisplayName:String,
    cachedBungieGlobalDisplayNameCode:number
}

export interface DestinyLinkedProfilesResponse{
    profiles:DestinyProfileUserInfoCard[],
    bnetMembership:UserInfoCard,
    profilesWithErrors:{
        errorCode:number,
        infoCard:UserInfoCard[]
    }[],
}

export interface DestinyProfileUserInfoCard{
    datedateLastPlayed:Date,
    isOverridden:Boolean,
    isCrossSavePrimary:Boolean,
    platformSilver:Object,
    unpairedGameVersions:number, // None: 0// Destiny2: 1// DLC1: 2// DLC2: 4// Forsaken: 8// YearTwoAnnualPass: 16// Shadowkeep: 32// BeyondLight: 64// Anniversary30th: 128// TheWitchQueen: 256
    supplementalDisplayName:string,
    iconPath:string,
    crossSaveOverride:String,
    applicableMembershipTypes:number[],
    isPublic:boolean,
    membershipType:number,
    membershipId:number,
    displayName:string,
    bungieGlobalDisplayName:string,
    bungieGlobalDisplayNameCode:number
}

export interface DestinyActivityHistoryResults{
    activities:DestinyHistoricalStatsPeriodGroup[]
}

export interface DestinyHistoricalStatsPeriodGroup{
    period:Date,
    activityDetails:DestinyHistoricalStatsActivity,
    values:{[Key: string]: DestinyHistoricalStatsValue}
}
export interface DestinyHistoricalStatsActivity{
    referenceId:number,
    directorActivityHash:number,
    instanceId:number,
    mode:number,
    modes:number[],
    isPrivate:boolean,
    membershipType:number
}


