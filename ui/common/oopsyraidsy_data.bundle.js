(self["webpackChunkcactbot"] = self["webpackChunkcactbot"] || []).push([[727],{

/***/ 9514:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ oopsy_manifest)
});

// EXTERNAL MODULE: ./resources/netregexes.ts
var netregexes = __webpack_require__(7849);
// EXTERNAL MODULE: ./resources/zone_id.ts
var zone_id = __webpack_require__(2324);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/buffs.ts


// Abilities seem instant.
const abilityCollectSeconds = 0.5;
// Observation: up to ~1.2 seconds for a buff to roll through the party.
const effectCollectSeconds = 2.0;
const isInPartyConditionFunc = (data, matches) => {
    const sourceId = matches.sourceId.toUpperCase();
    if (data.party.partyIds.includes(sourceId))
        return true;
    if (data.petIdToOwnerId) {
        const ownerId = data.petIdToOwnerId[sourceId];
        if (ownerId && data.party.partyIds.includes(ownerId))
            return true;
    }
    return false;
};
const missedFunc = (args) => [
    {
        // Sure, not all of these are "buffs" per se, but they're all in the buffs file.
        id: `Buff ${args.triggerId} Collect`,
        type: args.regexType,
        netRegex: args.netRegex,
        condition: isInPartyConditionFunc,
        run: (data, matches) => {
            var _a, _b;
            var _c, _d;
            (_a = data.generalBuffCollection) !== null && _a !== void 0 ? _a : (data.generalBuffCollection = {});
            const arr = (_b = (_c = data.generalBuffCollection)[_d = args.triggerId]) !== null && _b !== void 0 ? _b : (_c[_d] = []);
            arr.push(matches);
        },
    },
    {
        id: `Buff ${args.triggerId}`,
        type: args.regexType,
        netRegex: args.netRegex,
        condition: isInPartyConditionFunc,
        delaySeconds: args.collectSeconds,
        suppressSeconds: args.collectSeconds,
        mistake: (data) => {
            var _a;
            const allMatches = (_a = data.generalBuffCollection) === null || _a === void 0 ? void 0 : _a[args.triggerId];
            const firstMatch = allMatches === null || allMatches === void 0 ? void 0 : allMatches[0];
            const thingName = firstMatch === null || firstMatch === void 0 ? void 0 : firstMatch[args.field];
            if (!allMatches || !firstMatch || !thingName)
                return;
            const partyNames = data.party.partyNames;
            // TODO: consider dead people somehow
            const gotBuffMap = {};
            for (const name of partyNames)
                gotBuffMap[name] = false;
            let sourceName = firstMatch.source;
            // Blame pet mistakes on owners.
            if (data.petIdToOwnerId) {
                const petId = firstMatch.sourceId.toUpperCase();
                const ownerId = data.petIdToOwnerId[petId];
                if (ownerId) {
                    const ownerName = data.party.nameFromId(ownerId);
                    if (ownerName)
                        sourceName = ownerName;
                    else
                        console.error(`Couldn't find name for ${ownerId} from pet ${petId}`);
                }
            }
            if (args.ignoreSelf)
                gotBuffMap[sourceName] = true;
            for (const matches of allMatches) {
                // In case you have multiple party members who hit the same cooldown at the same
                // time (lol?), then ignore anybody who wasn't the first.
                if (matches.source !== firstMatch.source)
                    continue;
                gotBuffMap[matches.target] = true;
            }
            const missed = Object.keys(gotBuffMap).filter((x) => !gotBuffMap[x]);
            if (missed.length === 0)
                return;
            // TODO: oopsy could really use mouseover popups for details.
            // TODO: alternatively, if we have a death report, it'd be good to
            // explicitly call out that other people got a heal this person didn't.
            if (missed.length < 4) {
                return {
                    type: args.type,
                    blame: sourceName,
                    text: {
                        en: `${thingName} missed ${missed.map((x) => data.ShortName(x)).join(', ')}`,
                        de: `${thingName} verfehlt ${missed.map((x) => data.ShortName(x)).join(', ')}`,
                        fr: `${thingName} manqué(e) sur ${missed.map((x) => data.ShortName(x)).join(', ')}`,
                        ja: `(${missed.map((x) => data.ShortName(x)).join(', ')}) が${thingName}を受けなかった`,
                        cn: `${missed.map((x) => data.ShortName(x)).join(', ')} 没受到 ${thingName}`,
                        ko: `${thingName} ${missed.map((x) => data.ShortName(x)).join(', ')}에게 적용안됨`,
                    },
                };
            }
            // If there's too many people, just list the number of people missed.
            // TODO: we could also list everybody on separate lines?
            return {
                type: args.type,
                blame: sourceName,
                text: {
                    en: `${thingName} missed ${missed.length} people`,
                    de: `${thingName} verfehlte ${missed.length} Personen`,
                    fr: `${thingName} manqué(e) sur ${missed.length} personnes`,
                    ja: `${missed.length}人が${thingName}を受けなかった`,
                    cn: `有${missed.length}人没受到 ${thingName}`,
                    ko: `${thingName} ${missed.length}명에게 적용안됨`,
                },
            };
        },
        run: (data) => {
            if (data.generalBuffCollection)
                delete data.generalBuffCollection[args.triggerId];
        },
    },
];
const missedMitigationBuff = (args) => {
    if (!args.effectId)
        console.error('Missing effectId: ' + JSON.stringify(args));
    return missedFunc({
        triggerId: args.id,
        netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: args.effectId }),
        regexType: 'GainsEffect',
        field: 'effect',
        type: 'heal',
        ignoreSelf: args.ignoreSelf,
        collectSeconds: args.collectSeconds ? args.collectSeconds : effectCollectSeconds,
    });
};
const missedDamageAbility = (args) => {
    if (!args.abilityId)
        console.error('Missing abilityId: ' + JSON.stringify(args));
    return missedFunc({
        triggerId: args.id,
        netRegex: netregexes/* default.ability */.Z.ability({ id: args.abilityId }),
        regexType: 'Ability',
        field: 'ability',
        type: 'damage',
        ignoreSelf: args.ignoreSelf,
        collectSeconds: args.collectSeconds ? args.collectSeconds : abilityCollectSeconds,
    });
};
const missedHeal = (args) => {
    if (!args.abilityId)
        console.error('Missing abilityId: ' + JSON.stringify(args));
    return missedFunc({
        triggerId: args.id,
        netRegex: netregexes/* default.ability */.Z.ability({ id: args.abilityId }),
        regexType: 'Ability',
        field: 'ability',
        type: 'heal',
        collectSeconds: args.collectSeconds ? args.collectSeconds : abilityCollectSeconds,
    });
};
const missedMitigationAbility = missedHeal;
const triggerSet = {
    zoneId: zone_id/* default.MatchAll */.Z.MatchAll,
    triggers: [
        {
            id: 'Buff Pet To Owner Mapper',
            type: 'AddedCombatant',
            netRegex: netregexes/* default.addedCombatantFull */.Z.addedCombatantFull(),
            run: (data, matches) => {
                var _a;
                if (matches.ownerId === '0')
                    return;
                (_a = data.petIdToOwnerId) !== null && _a !== void 0 ? _a : (data.petIdToOwnerId = {});
                // Fix any lowercase ids.
                data.petIdToOwnerId[matches.id.toUpperCase()] = matches.ownerId.toUpperCase();
            },
        },
        {
            id: 'Buff Pet To Owner Clearer',
            type: 'ChangeZone',
            netRegex: netregexes/* default.changeZone */.Z.changeZone(),
            run: (data) => {
                // Clear this hash periodically so it doesn't have false positives.
                data.petIdToOwnerId = {};
            },
        },
        // Prefer abilities to effects, as effects take longer to roll through the party.
        // However, some things are only effects and so there is no choice.
        // For things you can step in or out of, give a longer timer?  This isn't perfect.
        // TODO: include soil here??
        ...missedMitigationBuff({ id: 'Collective Unconscious', effectId: '351', collectSeconds: 10 }),
        // Arms Up = 498 (others), Passage Of Arms = 497 (you).  Use both in case everybody is missed.
        ...missedMitigationBuff({ id: 'Passage of Arms', effectId: '49[78]', ignoreSelf: true, collectSeconds: 10 }),
        ...missedMitigationBuff({ id: 'Divine Veil', effectId: '2D7', ignoreSelf: true }),
        ...missedMitigationAbility({ id: 'Heart Of Light', abilityId: '3F20' }),
        ...missedMitigationAbility({ id: 'Dark Missionary', abilityId: '4057' }),
        ...missedMitigationAbility({ id: 'Shake It Off', abilityId: '1CDC' }),
        // 3F44 is the correct Quadruple Technical Finish, others are Dinky Technical Finish.
        ...missedDamageAbility({ id: 'Technical Finish', abilityId: '3F4[1-4]' }),
        ...missedDamageAbility({ id: 'Divination', abilityId: '40A8' }),
        ...missedDamageAbility({ id: 'Brotherhood', abilityId: '1CE4' }),
        ...missedDamageAbility({ id: 'Battle Litany', abilityId: 'DE5' }),
        ...missedDamageAbility({ id: 'Embolden', abilityId: '1D60' }),
        ...missedDamageAbility({ id: 'Battle Voice', abilityId: '76', ignoreSelf: true }),
        // Too noisy (procs every three seconds, and bards often off doing mechanics).
        // missedDamageBuff({ id: 'Wanderer\'s Minuet', effectId: '8A8', ignoreSelf: true }),
        // missedDamageBuff({ id: 'Mage\'s Ballad', effectId: '8A9', ignoreSelf: true }),
        // missedDamageBuff({ id: 'Army\'s Paeon', effectId: '8AA', ignoreSelf: true }),
        ...missedMitigationAbility({ id: 'Troubadour', abilityId: '1CED' }),
        ...missedMitigationAbility({ id: 'Tactician', abilityId: '41F9' }),
        ...missedMitigationAbility({ id: 'Shield Samba', abilityId: '3E8C' }),
        ...missedMitigationAbility({ id: 'Mantra', abilityId: '41' }),
        ...missedDamageAbility({ id: 'Devotion', abilityId: '1D1A' }),
        // Maybe using a healer LB1/LB2 should be an error for the healer. O:)
        // ...missedHeal({ id: 'Healing Wind', abilityId: 'CE' }),
        // ...missedHeal({ id: 'Breath of the Earth', abilityId: 'CF' }),
        ...missedHeal({ id: 'Medica', abilityId: '7C' }),
        ...missedHeal({ id: 'Medica II', abilityId: '85' }),
        ...missedHeal({ id: 'Afflatus Rapture', abilityId: '4096' }),
        ...missedHeal({ id: 'Temperance', abilityId: '751' }),
        ...missedHeal({ id: 'Plenary Indulgence', abilityId: '1D09' }),
        ...missedHeal({ id: 'Pulse of Life', abilityId: 'D0' }),
        ...missedHeal({ id: 'Succor', abilityId: 'BA' }),
        ...missedHeal({ id: 'Indomitability', abilityId: 'DFF' }),
        ...missedHeal({ id: 'Deployment Tactics', abilityId: 'E01' }),
        ...missedHeal({ id: 'Whispering Dawn', abilityId: '323' }),
        ...missedHeal({ id: 'Fey Blessing', abilityId: '40A0' }),
        ...missedHeal({ id: 'Consolation', abilityId: '40A3' }),
        ...missedHeal({ id: 'Angel\'s Whisper', abilityId: '40A6' }),
        ...missedMitigationAbility({ id: 'Fey Illumination', abilityId: '325' }),
        ...missedMitigationAbility({ id: 'Seraphic Illumination', abilityId: '40A7' }),
        ...missedHeal({ id: 'Angel Feathers', abilityId: '1097' }),
        ...missedHeal({ id: 'Helios', abilityId: 'E10' }),
        ...missedHeal({ id: 'Aspected Helios', abilityId: 'E11' }),
        ...missedHeal({ id: 'Aspected Helios', abilityId: '3200' }),
        ...missedHeal({ id: 'Celestial Opposition', abilityId: '40A9' }),
        ...missedHeal({ id: 'Astral Stasis', abilityId: '1098' }),
        ...missedHeal({ id: 'White Wind', abilityId: '2C8E' }),
        ...missedHeal({ id: 'Gobskin', abilityId: '4780' }),
        // TODO: export all of these missed functions into their own helper
        // and then add this to the Delubrum Reginae files directly.
        ...missedMitigationAbility({ id: 'Lost Aethershield', abilityId: '5753' }),
    ],
};
/* harmony default export */ const buffs = (triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/general.ts


// General mistakes; these apply everywhere.
const general_triggerSet = {
    zoneId: zone_id/* default.MatchAll */.Z.MatchAll,
    triggers: [
        {
            // Trigger id for internally generated early pull warning.
            id: 'General Early Pull',
        },
        {
            id: 'General Food Buff',
            type: 'LosesEffect',
            // Well Fed
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '48' }),
            condition: (_data, matches) => {
                // Prevent "Eos loses the effect of Well Fed from Critlo Mcgee"
                return matches.target === matches.source;
            },
            mistake: (data, matches) => {
                var _a;
                (_a = data.lostFood) !== null && _a !== void 0 ? _a : (data.lostFood = {});
                // Well Fed buff happens repeatedly when it falls off (WHY),
                // so suppress multiple occurrences.
                if (!data.inCombat || data.lostFood[matches.target])
                    return;
                data.lostFood[matches.target] = true;
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'lost food buff',
                        de: 'Nahrungsbuff verloren',
                        fr: 'Buff nourriture terminée',
                        ja: '飯効果が失った',
                        cn: '失去食物BUFF',
                        ko: '음식 버프 해제',
                    },
                };
            },
        },
        {
            id: 'General Well Fed',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '48' }),
            run: (data, matches) => {
                if (!data.lostFood)
                    return;
                delete data.lostFood[matches.target];
            },
        },
        {
            id: 'General Rabbit Medium',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '8E0' }),
            condition: (data, matches) => data.IsPlayerId(matches.sourceId),
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.source,
                    text: {
                        en: 'bunny',
                        de: 'Hase',
                        fr: 'lapin',
                        ja: 'うさぎ',
                        cn: '兔子',
                        ko: '토끼',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const general = (general_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/00-misc/test.ts


// Test mistake triggers.
const test_triggerSet = {
    zoneId: zone_id/* default.MiddleLaNoscea */.Z.MiddleLaNoscea,
    triggers: [
        {
            id: 'Test Bow',
            type: 'GameLog',
            netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'You bow courteously to the striking dummy.*?' }),
            netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'Vous vous inclinez devant le mannequin d\'entraînement.*?' }),
            netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*は木人にお辞儀した.*?' }),
            netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*恭敬地对木人行礼.*?' }),
            netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*나무인형에게 공손하게 인사합니다.*?' }),
            mistake: (data) => {
                return {
                    type: 'pull',
                    blame: data.me,
                    text: {
                        en: 'Bow',
                        de: 'Bogen',
                        fr: 'Saluer',
                        ja: 'お辞儀',
                        cn: '鞠躬',
                        ko: '인사',
                    },
                };
            },
        },
        {
            id: 'Test Wipe',
            type: 'GameLog',
            netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'You bid farewell to the striking dummy.*?' }),
            netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'Vous faites vos adieux au mannequin d\'entraînement.*?' }),
            netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*は木人に別れの挨拶をした.*?' }),
            netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*向木人告别.*?' }),
            netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*나무인형에게 작별 인사를 합니다.*?' }),
            mistake: (data) => {
                return {
                    type: 'wipe',
                    blame: data.me,
                    text: {
                        en: 'Party Wipe',
                        de: 'Gruppenwipe',
                        fr: 'Party Wipe',
                        ja: 'ワイプ',
                        cn: '团灭',
                        ko: '파티 전멸',
                    },
                };
            },
        },
        {
            id: 'Test Bootshine',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '35' }),
            condition: (data, matches) => {
                if (matches.source !== data.me)
                    return false;
                const strikingDummyByLocale = {
                    en: 'Striking Dummy',
                    de: 'Trainingspuppe',
                    fr: 'Mannequin d\'entraînement',
                    ja: '木人',
                    cn: '木人',
                    ko: '나무인형',
                };
                const strikingDummyNames = Object.values(strikingDummyByLocale);
                return strikingDummyNames.includes(matches.target);
            },
            mistake: (data, matches) => {
                var _a;
                (_a = data.bootCount) !== null && _a !== void 0 ? _a : (data.bootCount = 0);
                data.bootCount++;
                const text = `${matches.ability} (${data.bootCount}): ${data.DamageFromMatches(matches)}`;
                return { type: 'warn', blame: data.me, text: text };
            },
        },
        {
            id: 'Test Leaden Fist',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '745' }),
            condition: (data, matches) => matches.source === data.me,
            mistake: (data, matches) => {
                return { type: 'good', blame: data.me, text: matches.effect };
            },
        },
        {
            id: 'Test Oops',
            type: 'GameLog',
            netRegex: netregexes/* default.echo */.Z.echo({ line: '.*oops.*' }),
            suppressSeconds: 10,
            mistake: (data, matches) => {
                return { type: 'fail', blame: data.me, text: matches.line };
            },
        },
        {
            id: 'Test Poke Collect',
            type: 'GameLog',
            netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'You poke the striking dummy.*?' }),
            netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'Vous touchez légèrement le mannequin d\'entraînement du doigt.*?' }),
            netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*は木人をつついた.*?' }),
            netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*用手指戳向木人.*?' }),
            netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*나무인형을 쿡쿡 찌릅니다.*?' }),
            run: (data) => {
                var _a;
                data.pokeCount = ((_a = data.pokeCount) !== null && _a !== void 0 ? _a : 0) + 1;
            },
        },
        {
            id: 'Test Poke',
            type: 'GameLog',
            netRegex: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'You poke the striking dummy.*?' }),
            netRegexFr: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: 'Vous touchez légèrement le mannequin d\'entraînement du doigt.*?' }),
            netRegexJa: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*は木人をつついた.*?' }),
            netRegexCn: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*用手指戳向木人.*?' }),
            netRegexKo: netregexes/* default.gameNameLog */.Z.gameNameLog({ line: '.*나무인형을 쿡쿡 찌릅니다.*?' }),
            delaySeconds: 5,
            mistake: (data) => {
                // 1 poke at a time is fine, but more than one in 5 seconds is (OBVIOUSLY) a mistake.
                if (!data.pokeCount || data.pokeCount <= 1)
                    return;
                return {
                    type: 'fail',
                    blame: data.me,
                    text: {
                        en: `Too many pokes (${data.pokeCount})`,
                        de: `Zu viele Piekser (${data.pokeCount})`,
                        fr: `Trop de touches (${data.pokeCount})`,
                        ja: `いっぱいつついた (${data.pokeCount})`,
                        cn: `戳太多下啦 (${data.pokeCount})`,
                        ko: `너무 많이 찌름 (${data.pokeCount}번)`,
                    },
                };
            },
            run: (data) => delete data.pokeCount,
        },
    ],
};
/* harmony default export */ const test = (test_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/ifrit-nm.ts

// Ifrit Story Mode
const ifrit_nm_triggerSet = {
    zoneId: zone_id/* default.TheBowlOfEmbers */.Z.TheBowlOfEmbers,
    damageWarn: {
        'IfritNm Radiant Plume': '2DE',
    },
    shareWarn: {
        'IfritNm Incinerate': '1C5',
        'IfritNm Eruption': '2DD',
    },
};
/* harmony default export */ const ifrit_nm = (ifrit_nm_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-nm.ts

// Titan Story Mode
const titan_nm_triggerSet = {
    zoneId: zone_id/* default.TheNavel */.Z.TheNavel,
    damageWarn: {
        'TitanNm Weight Of The Land': '3CD',
    },
    damageFail: {
        'TitanNm Landslide': '28A',
    },
    shareWarn: {
        'TitanNm Rock Buster': '281',
    },
};
/* harmony default export */ const titan_nm = (titan_nm_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/levi-ex.ts


// It's hard to capture the reflection abilities from Leviathan's Head and Tail if you use
// ranged physical attacks / magic attacks respectively, as the ability names are the
// ability you used and don't appear to show up in the log as normal "ability" lines.
// That said, dots still tick independently on both so it's likely that people will atack
// them anyway.
// TODO: Figure out why Dread Tide / Waterspout appear like shares (i.e. 0x16 id).
// Dread Tide = 823/824/825, Waterspout = 829
// Leviathan Extreme
const levi_ex_triggerSet = {
    zoneId: zone_id/* default.TheWhorleaterExtreme */.Z.TheWhorleaterExtreme,
    damageWarn: {
        'LeviEx Grand Fall': '82F',
        'LeviEx Hydro Shot': '748',
        'LeviEx Dreadstorm': '749',
    },
    damageFail: {
        'LeviEx Body Slam': '82A',
        'LeviEx Spinning Dive 1': '88A',
        'LeviEx Spinning Dive 2': '88B',
        'LeviEx Spinning Dive 3': '82C',
    },
    gainsEffectWarn: {
        'LeviEx Dropsy': '110',
    },
    gainsEffectFail: {
        'LeviEx Hysteria': '128',
    },
    triggers: [
        {
            id: 'LeviEx Body Slam Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '82A' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const levi_ex = (levi_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/shiva-hm.ts


// Shiva Hard
const shiva_hm_triggerSet = {
    zoneId: zone_id/* default.TheAkhAfahAmphitheatreHard */.Z.TheAkhAfahAmphitheatreHard,
    damageWarn: {
        // Large white circles.
        'ShivaHm Icicle Impact': '993',
        // Avoidable tank stun.
        'ShivaHm Glacier Bash': '9A1',
    },
    shareWarn: {
        // Knockback tank cleave.
        'ShivaHm Heavenly Strike': '9A0',
        // Hailstorm spread marker.
        'ShivaHm Hailstorm': '998',
    },
    shareFail: {
        // Tankbuster.  This is Shiva Hard mode, not Shiva Extreme.  Please!
        'ShivaHm Icebrand': '996',
    },
    triggers: [
        {
            id: 'ShivaHm Diamond Dust',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '98A' }),
            run: (data) => {
                data.seenDiamondDust = true;
            },
        },
        {
            id: 'ShivaHm Deep Freeze',
            type: 'GainsEffect',
            // Shiva also uses ability 9A3 on you, but it has the untranslated name
            // 透明：シヴァ：凍結レクト：ノックバック用. So, use the effect instead for free translation.
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '1E7' }),
            condition: (data) => {
                // The intermission also gets this effect, so only a mistake after that.
                // Unlike extreme, this has the same 20 second duration as the intermission.
                return data.seenDiamondDust;
            },
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const shiva_hm = (shiva_hm_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/shiva-ex.ts


// Shiva Extreme
const shiva_ex_triggerSet = {
    zoneId: zone_id/* default.TheAkhAfahAmphitheatreExtreme */.Z.TheAkhAfahAmphitheatreExtreme,
    damageWarn: {
        // Large white circles.
        'ShivaEx Icicle Impact': 'BEB',
        // "get in" aoe
        'ShivaEx Whiteout': 'BEC',
        // Avoidable tank stun.
        'ShivaEx Glacier Bash': 'BE9',
    },
    damageFail: {
        // 270 degree attack.
        'ShivaEx Glass Dance': 'BDF',
    },
    shareWarn: {
        // Hailstorm spread marker.
        'ShivaEx Hailstorm': 'BE2',
    },
    shareFail: {
        // Laser.  TODO: maybe blame the person it's on??
        'ShivaEx Avalanche': 'BE0',
    },
    soloWarn: {
        // Party shared tankbuster
        'ShivaEx Icebrand': 'BE1',
    },
    triggers: [
        {
            id: 'ShivaEx Deep Freeze',
            type: 'GainsEffect',
            // Shiva also uses ability C8A on you, but it has the untranslated name
            // 透明：シヴァ：凍結レクト：ノックバック用/ヒロイック. So, use the effect instead for free translation.
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '1E7' }),
            condition: (_data, matches) => {
                // The intermission also gets this effect, but for a shorter duration.
                return parseFloat(matches.duration) > 20;
            },
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const shiva_ex = (shiva_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-hm.ts

// Titan Hard
const titan_hm_triggerSet = {
    zoneId: zone_id/* default.TheNavelHard */.Z.TheNavelHard,
    damageWarn: {
        'TitanHm Weight Of The Land': '553',
        'TitanHm Burst': '41C',
    },
    damageFail: {
        'TitanHm Landslide': '554',
    },
    shareWarn: {
        'TitanHm Rock Buster': '550',
    },
    shareFail: {
        'TitanHm Mountain Buster': '283',
    },
};
/* harmony default export */ const titan_hm = (titan_hm_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/02-arr/trial/titan-ex.ts

// Titan Extreme
const titan_ex_triggerSet = {
    zoneId: zone_id/* default.TheNavelExtreme */.Z.TheNavelExtreme,
    damageWarn: {
        'TitanEx Weight Of The Land': '5BE',
        'TitanEx Burst': '5BF',
    },
    damageFail: {
        'TitanEx Landslide': '5BB',
        'TitanEx Gaoler Landslide': '5C3',
    },
    shareWarn: {
        'TitanEx Rock Buster': '5B7',
    },
    shareFail: {
        'TitanEx Mountain Buster': '5B8',
    },
};
/* harmony default export */ const titan_ex = (titan_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/alliance/weeping_city.ts


const weeping_city_triggerSet = {
    zoneId: zone_id/* default.TheWeepingCityOfMhach */.Z.TheWeepingCityOfMhach,
    damageWarn: {
        'Weeping Critical Bite': '1848',
        'Weeping Realm Shaker': '183E',
        'Weeping Silkscreen': '183C',
        'Weeping Silken Spray': '1824',
        'Weeping Tremblor 1': '1837',
        'Weeping Tremblor 2': '1836',
        'Weeping Tremblor 3': '1835',
        'Weeping Spider Thread': '1839',
        'Weeping Fire II': '184E',
        'Weeping Necropurge': '17D7',
        'Weeping Rotten Breath': '17D0',
        'Weeping Mow': '17D2',
        'Weeping Dark Eruption': '17C3',
        // 1806 is also Flare Star, but if you get by 1805 you also get hit by 1806?
        'Weeping Flare Star': '1805',
        'Weeping Execration': '1829',
        'Weeping Haircut 1': '180B',
        'Weeping Haircut 2': '180F',
        'Weeping Entanglement': '181D',
        'Weeping Evil Curl': '1816',
        'Weeping Evil Tress': '1817',
        'Weeping Depth Charge': '1820',
        'Weeping Feint Particle Beam': '1928',
        'Weeping Evil Switch': '1815',
    },
    gainsEffectWarn: {
        'Weeping Hysteria': '128',
        'Weeping Zombification': '173',
        'Weeping Toad': '1B7',
        'Weeping Doom': '38E',
        'Weeping Assimilation': '42C',
        'Weeping Stun': '95',
    },
    shareWarn: {
        'Weeping Arachne Web': '185E',
        'Weeping Earth Aether': '1841',
        'Weeping Epigraph': '1852',
        // This is too noisy.  Better to pop the balloons than worry about friends.
        // 'Weeping Explosion': '1807', // Ozmasphere Cube orb explosion
        'Weeping Split End 1': '180C',
        'Weeping Split End 2': '1810',
        'Weeping Bloodied Nail': '181F',
    },
    triggers: [
        {
            id: 'Weeping Forgall Gradual Zombification Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '415' }),
            run: (data, matches) => {
                var _a;
                (_a = data.zombie) !== null && _a !== void 0 ? _a : (data.zombie = {});
                data.zombie[matches.target] = true;
            },
        },
        {
            id: 'Weeping Forgall Gradual Zombification Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '415' }),
            run: (data, matches) => {
                data.zombie = data.zombie || {};
                data.zombie[matches.target] = false;
            },
        },
        {
            id: 'Weeping Forgall Mega Death',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '17CA' }),
            condition: (data, matches) => data.zombie && !data.zombie[matches.target],
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'Weeping Headstone Shield Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '15E' }),
            run: (data, matches) => {
                var _a;
                (_a = data.shield) !== null && _a !== void 0 ? _a : (data.shield = {});
                data.shield[matches.target] = true;
            },
        },
        {
            id: 'Weeping Headstone Shield Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '15E' }),
            run: (data, matches) => {
                data.shield = data.shield || {};
                data.shield[matches.target] = false;
            },
        },
        {
            id: 'Weeping Flaring Epigraph',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '1856' }),
            condition: (data, matches) => data.shield && !data.shield[matches.target],
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            // This ability name is helpfully called "Attack" so name it something else.
            id: 'Weeping Ozma Tank Laser',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ type: '22', id: '1831' }),
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'Tank Laser',
                        de: 'Tank Laser',
                        fr: 'Tank Laser',
                        ja: 'タンクレザー',
                        cn: '坦克激光',
                        ko: '탱커 레이저',
                    },
                };
            },
        },
        {
            id: 'Weeping Ozma Holy',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '182E' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Slid off!',
                        de: 'ist runtergerutscht!',
                        fr: 'A glissé(e) !',
                        ja: 'ノックバック',
                        cn: '击退！',
                        ko: '넉백됨!',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const weeping_city = (weeping_city_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/aetherochemical_research_facility.ts


// Aetherochemical Research Facility
const aetherochemical_research_facility_triggerSet = {
    zoneId: zone_id/* default.TheAetherochemicalResearchFacility */.Z.TheAetherochemicalResearchFacility,
    damageWarn: {
        'ARF Grand Sword': '216',
        'ARF Cermet Drill': '20E',
        'ARF Magitek Slug': '10DB',
        'ARF Aetherochemical Grenado': '10E2',
        'ARF Magitek Spread': '10DC',
        'ARF Eerie Soundwave': '1170',
        'ARF Tail Slap': '125F',
        'ARF Calcifying Mist': '123A',
        'ARF Puncture': '1171',
        'ARF Sideswipe': '11A7',
        'ARF Gust': '395',
        'ARF Marrow Drain': 'D0E',
        'ARF Riddle Of The Sphinx': '10E4',
        'ARF Ka': '106E',
        'ARF Rotoswipe': '11CC',
        'ARF Auto-cannons': '12D9',
        'ARF Death\'s Door': '4EC',
        'ARF Spellsword': '4EB',
        'ARF End Of Days': '10FD',
        'ARF Blizzard Burst': '10FE',
        'ARF Fire Burst': '10FF',
        'ARF Sea Of Pitch': '12DE',
        'ARF Dark Blizzard II': '10F3',
        'ARF Dark Fire II': '10F8',
        'ARF Ancient Eruption': '1104',
        'ARF Entropic Flame': '1108',
    },
    shareWarn: {
        'ARF Chthonic Hush': '10E7',
        'ARF Height Of Chaos': '1101',
        'ARF Ancient Circle': '1102',
    },
    triggers: [
        {
            id: 'ARF Petrifaction',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '01' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const aetherochemical_research_facility = (aetherochemical_research_facility_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/fractal_continuum.ts

// Fractal Continuum
const fractal_continuum_triggerSet = {
    zoneId: zone_id/* default.TheFractalContinuum */.Z.TheFractalContinuum,
    damageWarn: {
        'Fractal Double Sever': 'F7D',
        'Fractal Aetheric Compression': 'F80',
        'Fractal 11-Tonze Swipe': 'F81',
        'Fractal 10-Tonze Slash': 'F83',
        'Fractal 111-Tonze Swing': 'F87',
        'Fractal Broken Glass': 'F8E',
        'Fractal Mines': 'F90',
        'Fractal Seed of the Rivers': 'F91',
    },
    shareWarn: {
        'Fractal Sanctification': 'F89',
    },
};
/* harmony default export */ const fractal_continuum = (fractal_continuum_triggerSet);

// EXTERNAL MODULE: ./ui/oopsyraidsy/oopsy_common.ts
var oopsy_common = __webpack_require__(8545);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/gubal_library_hard.ts



const gubal_library_hard_triggerSet = {
    zoneId: zone_id/* default.TheGreatGubalLibraryHard */.Z.TheGreatGubalLibraryHard,
    damageWarn: {
        'GubalHm Terror Eye': '930',
        'GubalHm Batter': '198A',
        'GubalHm Condemnation': '390',
        'GubalHm Discontinue 1': '1943',
        'GubalHm Discontinue 2': '1940',
        'GubalHm Discontinue 3': '1942',
        'GubalHm Frightful Roar': '193B',
        'GubalHm Issue 1': '193D',
        'GubalHm Issue 2': '193F',
        'GubalHm Issue 3': '1941',
        'GubalHm Desolation': '198C',
        'GubalHm Double Smash': '26A',
        'GubalHm Darkness': '3A0',
        'GubalHm Firewater': '3BA',
        'GubalHm Elbow Drop': 'CBA',
        'GubalHm Dark': '19DF',
        'GubalHm Seals': '194A',
        'GubalHm Water III': '1C67',
        'GubalHm Raging Axe': '1703',
        'GubalHm Magic Hammer': '1990',
        'GubalHm Properties Of Gravity': '1950',
        'GubalHm Properties Of Levitation': '194F',
        'GubalHm Comet': '1969',
    },
    damageFail: {
        'GubalHm Ecliptic Meteor': '195C',
    },
    shareWarn: {
        'GubalHm Searing Wind': '1944',
        'GubalHm Thunder': '19[AB]',
    },
    triggers: [
        {
            // Fire gate in hallway to boss 2, magnet failure on boss 2
            id: 'GubalHm Burns',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '10B' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            // Helper for Thunder 3 failures
            id: 'GubalHm Imp Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '46E' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasImp) !== null && _a !== void 0 ? _a : (data.hasImp = {});
                data.hasImp[matches.target] = true;
            },
        },
        {
            id: 'GubalHm Imp Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '46E' }),
            run: (data, matches) => {
                data.hasImp = data.hasImp || {};
                data.hasImp[matches.target] = false;
            },
        },
        {
            // Targets with Imp when Thunder III resolves receive a vulnerability stack and brief stun
            id: 'GubalHm Imp Thunder',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '195[AB]', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => { var _a; return (_a = data.hasImp) === null || _a === void 0 ? void 0 : _a[matches.target]; },
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'Shocked Imp',
                        de: 'Schockierter Imp',
                        ja: 'カッパを解除しなかった',
                        cn: '河童状态吃了暴雷',
                    },
                };
            },
        },
        {
            id: 'GubalHm Quake',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '1956', ...oopsy_common/* playerDamageFields */.np }),
            // Always hits target, but if correctly resolved will deal 0 damage
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'GubalHm Tornado',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '195[78]', ...oopsy_common/* playerDamageFields */.np }),
            // Always hits target, but if correctly resolved will deal 0 damage
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const gubal_library_hard = (gubal_library_hard_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/dungeon/sohm_al_hard.ts


const sohm_al_hard_triggerSet = {
    zoneId: zone_id/* default.SohmAlHard */.Z.SohmAlHard,
    damageWarn: {
        'SohmAlHm Deadly Vapor': '1DC9',
        'SohmAlHm Deeproot': '1CDA',
        'SohmAlHm Odious Air': '1CDB',
        'SohmAlHm Glorious Blaze': '1C33',
        'SohmAlHm Foul Waters': '118A',
        'SohmAlHm Plain Pound': '1187',
        'SohmAlHm Palsynyxis': '1161',
        'SohmAlHm Surface Breach': '1E80',
        'SohmAlHm Freshwater Cannon': '119F',
        'SohmAlHm Tail Smash': '1C35',
        'SohmAlHm Tail Swing': '1C36',
        'SohmAlHm Ripper Claw': '1C37',
        'SohmAlHm Wind Slash': '1C38',
        'SohmAlHm Wild Charge': '1C39',
        'SohmAlHm Hot Charge': '1C3A',
        'SohmAlHm Fireball': '1C3B',
        'SohmAlHm Lava Flow': '1C3C',
        'SohmAlHm Wild Horn': '1507',
        'SohmAlHm Lava Breath': '1C4D',
        'SohmAlHm Ring of Fire': '1C4C',
        'SohmAlHm Molten Silk 1': '1C43',
        'SohmAlHm Molten Silk 2': '1C44',
        'SohmAlHm Molten Silk 3': '1C42',
        'SohmAlHm Realm Shaker': '1C41',
    },
    triggers: [
        {
            // Warns if players step into the lava puddles. There is unfortunately no direct damage event.
            id: 'SohmAlHm Burns',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '11C' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const sohm_al_hard = (sohm_al_hard_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/03-hw/raid/a12n.ts



const a12n_triggerSet = {
    zoneId: zone_id/* default.AlexanderTheSoulOfTheCreator */.Z.AlexanderTheSoulOfTheCreator,
    damageWarn: {
        'A12N Sacrament': '1AE6',
        'A12N Gravitational Anomaly': '1AEB',
    },
    shareWarn: {
        'A12N Divine Spear': '1AE3',
        'A12N Blazing Scourge': '1AE9',
        'A12N Plaint Of Severity': '1AF1',
        'A12N Communion': '1AFC',
    },
    triggers: [
        {
            id: 'A12N Assault Collect',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '461' }),
            run: (data, matches) => {
                var _a;
                (_a = data.assault) !== null && _a !== void 0 ? _a : (data.assault = []);
                data.assault.push(matches.target);
            },
        },
        {
            // It is a failure for a Severity marker to stack with the Solidarity group.
            id: 'A12N Assault Failure',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '1AF2', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => { var _a; return (_a = data.assault) === null || _a === void 0 ? void 0 : _a.includes(matches.target); },
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: 'Didn\'t Spread!',
                        de: 'Nicht verteilt!',
                        fr: 'Ne s\'est pas dispersé(e) !',
                        ja: '散開しなかった!',
                        cn: '没有散开!',
                    },
                };
            },
        },
        {
            id: 'A12N Assault Cleanup',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '461' }),
            delaySeconds: 20,
            suppressSeconds: 5,
            run: (data) => {
                delete data.assault;
            },
        },
    ],
};
/* harmony default export */ const a12n = (a12n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/ala_mhigo.ts


const ala_mhigo_triggerSet = {
    zoneId: zone_id/* default.AlaMhigo */.Z.AlaMhigo,
    damageWarn: {
        'Ala Mhigo Magitek Ray': '24CE',
        'Ala Mhigo Lock On': '2047',
        'Ala Mhigo Tail Laser 1': '2049',
        'Ala Mhigo Tail Laser 2': '204B',
        'Ala Mhigo Tail Laser 3': '204C',
        'Ala Mhigo Shoulder Cannon': '24D0',
        'Ala Mhigo Cannonfire': '23ED',
        'Ala Mhigo Aetherochemical Grenado': '205A',
        'Ala Mhigo Integrated Aetheromodulator': '205B',
        'Ala Mhigo Circle Of Death': '24D4',
        'Ala Mhigo Exhaust': '24D3',
        'Ala Mhigo Grand Sword': '24D2',
        'Ala Mhigo Art Of The Storm 1': '2066',
        'Ala Mhigo Art Of The Storm 2': '2587',
        'Ala Mhigo Vein Splitter 1': '24B6',
        'Ala Mhigo Vein Splitter 2': '206C',
        'Ala Mhigo Lightless Spark': '206B',
    },
    shareWarn: {
        'Ala Mhigo Demimagicks': '205E',
        'Ala Mhigo Unmoving Troika': '2060',
        'Ala Mhigo Art Of The Sword 1': '2069',
        'Ala Mhigo Art Of The Sword 2': '2589',
    },
    triggers: [
        {
            // It's possible players might just wander into the bad on the outside,
            // but normally people get pushed into it.
            id: 'Ala Mhigo Art Of The Swell',
            type: 'GainsEffect',
            // Damage Down
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '2B8' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const ala_mhigo = (ala_mhigo_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/bardams_mettle.ts


// For reasons not completely understood at the time this was merged,
// but likely related to the fact that no nameplates are visible during the encounter,
// and that nothing in the encounter actually does damage,
// we can't use damageWarn or gainsEffect helpers on the Bardam fight.
// Instead, we use this helper function to look for failure flags.
// If the flag is present,a full trigger object is returned that drops in seamlessly.
const abilityWarn = (args) => {
    if (!args.abilityId)
        console.error('Missing ability ' + JSON.stringify(args));
    const trigger = {
        id: args.id,
        type: 'Ability',
        netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: args.abilityId }),
        condition: (_data, matches) => matches.flags.substr(-2) === '0E',
        mistake: (_data, matches) => {
            return { type: 'warn', blame: matches.target, text: matches.ability };
        },
    };
    return trigger;
};
const bardams_mettle_triggerSet = {
    zoneId: zone_id/* default.BardamsMettle */.Z.BardamsMettle,
    damageWarn: {
        'Bardam Dirty Claw': '21A8',
        'Bardam Epigraph': '23AF',
        'Bardam The Dusk Star': '2187',
        'Bardam The Dawn Star': '2186',
        'Bardam Crumbling Crust': '1F13',
        'Bardam Ram Rush': '1EFC',
        'Bardam Lullaby': '24B2',
        'Bardam Heave': '1EF7',
        'Bardam Wide Blaster': '24B3',
        'Bardam Double Smash': '26A',
        'Bardam Transonic Blast': '1262',
        'Bardam Wild Horn': '2208',
        'Bardam Heavy Strike 1': '2578',
        'Bardam Heavy Strike 2': '2579',
        'Bardam Heavy Strike 3': '257A',
        'Bardam Tremblor 1': '257B',
        'Bardam Tremblor 2': '257C',
        'Bardam Throwing Spear': '257F',
        'Bardam Bardam\'s Ring': '2581',
        'Bardam Comet': '257D',
        'Bardam Comet Impact': '2580',
        'Bardam Iron Sphere Attack': '16B6',
        'Bardam Tornado': '247E',
        'Bardam Pinion': '1F11',
        'Bardam Feather Squall': '1F0E',
        'Bardam Flutterfall Untargeted': '1F12',
    },
    gainsEffectWarn: {
        'Bardam Confused': '0B',
    },
    gainsEffectFail: {
        'Bardam Fetters': '56F',
    },
    shareWarn: {
        'Bardam Garula Rush': '1EF9',
        'Bardam Flutterfall Targeted': '1F0C',
        'Bardam Wingbeat': '1F0F',
    },
    triggers: [
        // 1 of 3 270-degree ring AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Heavy Strike 1', abilityId: '2578' }),
        // 2 of 3 270-degree ring AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Heavy Strike 2', abilityId: '2579' }),
        // 3 of 3 270-degree ring AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Heavy Strike 3', abilityId: '257A' }),
        // 1 of 2 concentric ring AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Tremblor 1', abilityId: '257B' }),
        // 2 of 2 concentric ring AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Tremblor 2', abilityId: '257C' }),
        // Checkerboard AoE, Throwing Spear, second boss
        abilityWarn({ id: 'Bardam Throwing Spear', abilityId: '257F' }),
        // Gaze attack, Warrior of Bardam, second boss
        abilityWarn({ id: 'Bardam Empty Gaze', abilityId: '1F04' }),
        // Donut AoE headmarkers, Bardam, second boss
        abilityWarn({ id: 'Bardam\'s Ring', abilityId: '2581' }),
        // Targeted circle AoEs, Bardam, second boss
        abilityWarn({ id: 'Bardam Comet', abilityId: '257D' }),
        // Circle AoEs, Star Shard, second boss
        abilityWarn({ id: 'Bardam Comet Impact', abilityId: '2580' }),
    ],
};
/* harmony default export */ const bardams_mettle = (bardams_mettle_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/drowned_city_of_skalla.ts

const drowned_city_of_skalla_triggerSet = {
    zoneId: zone_id/* default.TheDrownedCityOfSkalla */.Z.TheDrownedCityOfSkalla,
    damageWarn: {
        'Hydrocannon': '2697',
        'Stagnant Spray': '2699',
        'Bubble Burst': '261B',
        'Plain Pound': '269A',
        'Boulder Toss': '269B',
        'Landslip': '269C',
        'Mystic Light': '2657',
        'Mystic Flame': '2659',
        'Dark II': '110E',
        'Implosive Curse': '269E',
        'Undying FIre': '269F',
        'Fire II': '26A0',
        'Rusting Claw': '2661',
        'Words Of Woe': '2662',
        'Tail Drive': '2663',
        'Ring Of Chaos': '2667',
    },
    damageFail: {
        'Self-Detonate': '265C',
    },
    gainsEffectWarn: {
        'Dropsy': '11B',
        'Confused': '0B',
    },
    shareWarn: {
        'Bloody Puddle': '2655',
        'Cross Of Chaos': '2668',
        'Circle Of Chaos': '2669',
    },
};
/* harmony default export */ const drowned_city_of_skalla = (drowned_city_of_skalla_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/kugane_castle.ts


const kugane_castle_triggerSet = {
    zoneId: zone_id/* default.KuganeCastle */.Z.KuganeCastle,
    damageWarn: {
        'Kugane Castle Tenka Gokken': '2329',
        'Kugane Castle Kenki Release Trash': '2330',
        'Kugane Castle Clearout': '1E92',
        'Kugane Castle Hara-Kiri 1': '1E96',
        'Kugane Castle Hara-Kiri 2': '24F9',
        'Kugane Castle Juji Shuriken 1': '232D',
        'Kugane Castle 1000 Barbs': '2198',
        'Kugane Castle Juji Shuriken 2': '1E98',
        'Kugane Castle Tatami-Gaeshi': '1E9D',
        'Kugane Castle Juji Shuriken 3': '1EA0',
        'Kugane Castle Auto Crossbow': '2333',
        'Kugane Castle Harakiri 3': '23C9',
        'Kugane Castle Iai-Giri': '1EA2',
        'Kugane Castle Fragility': '1EAA',
        'Kugane Castle Dragonfire': '1EAB',
    },
    shareWarn: {
        'Kugane Castle Issen': '1E97',
        'Kugane Castle Clockwork Raiton': '1E9B',
    },
    triggers: [
        {
            // Stack marker, Zuiko Maru, boss 1
            id: 'Kugane Castle Helm Crack',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '1E94' }),
            condition: (_data, matches) => matches.type === '21',
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: `${matches.ability} (alone)`,
                        de: `${matches.ability} (allein)`,
                        fr: `${matches.ability} (seul(e))`,
                        ja: `${matches.ability} (一人)`,
                        cn: `${matches.ability} (单吃)`,
                        ko: `${matches.ability} (혼자 맞음)`,
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const kugane_castle = (kugane_castle_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/st_mocianne_hard.ts

const st_mocianne_hard_triggerSet = {
    zoneId: zone_id/* default.SaintMociannesArboretumHard */.Z.SaintMociannesArboretumHard,
    damageWarn: {
        'St Mocianne Hard Mudstream': '30D9',
        'St Mocianne Hard Silken Spray': '3385',
        'St Mocianne Hard Muddy Puddles': '30DA',
        'St Mocianne Hard Odious Air': '2E49',
        'St Mocianne Hard SLudge Bomb': '2E4E',
        'St Mocianne Hard Odious Atmosphere': '2E51',
        'St Mocianne Hard Creeping Ivy': '31A5',
        'St Mocianne Hard Rockslide': '3134',
        'St Mocianne Hard Earthquake Inner': '312E',
        'St Mocianne Hard Earthquake Outer': '312F',
        'St Mocianne Hard Embalming Earth': '31A6',
        'St Mocianne Hard Quickmire': '3136',
        'St Mocianne Hard Quagmire Platforms': '3139',
        'St Mocianne Hard Feculent Flood': '313C',
        'St Mocianne Hard Corrupture': '33A0',
    },
    gainsEffectWarn: {
        'St Mocianne Hard Seduced': '3DF',
        'St Mocianne Hard Pollen': '13',
        'St Mocianne Hard Transfiguration': '648',
        'St Mocianne Hard Hysteria': '128',
        'St Mocianne Hard Stab Wound': '45D',
    },
    shareWarn: {
        'St Mocianne Hard Taproot': '2E4C',
        'St Mocianne Hard Earth Shaker': '3131',
    },
    soloFail: {
        'St Mocianne Hard Fault Warren': '2E4A',
    },
};
/* harmony default export */ const st_mocianne_hard = (st_mocianne_hard_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/swallows_compass.ts


const swallows_compass_triggerSet = {
    zoneId: zone_id/* default.TheSwallowsCompass */.Z.TheSwallowsCompass,
    damageWarn: {
        'Swallows Compass Ivy Fetters': '2C04',
        'Swallows Compass Wildswind 1': '2C05',
        'Swallows Compass Yama-Kagura': '2B96',
        'Swallows Compass Flames Of Hate': '2B98',
        'Swallows Compass Conflagrate': '2B99',
        'Swallows Compass Upwell': '2C06',
        'Swallows Compass Bad Breath': '2C07',
        'Swallows Compass Greater Palm 1': '2B9D',
        'Swallows Compass Greater Palm 2': '2B9E',
        'Swallows Compass Tributary': '2BA0',
        'Swallows Compass Wildswind 2': '2C06',
        'Swallows Compass Wildswind 3': '2C07',
        'Swallows Compass Filoplumes': '2C76',
        'Swallows Compass Both Ends 1': '2BA8',
        'Swallows Compass Both Ends 2': '2BA9',
        'Swallows Compass Both Ends 3': '2BAE',
        'Swallows Compass Both Ends 4': '2BAF',
        'Swallows Compass Equal Of Heaven': '2BB4',
    },
    gainsEffectWarn: {
        'Swallows Compass Hysteria': '128',
        'Swallows Compass Bleeding': '112F',
    },
    shareWarn: {
        'Swallows Compass Mirage': '2BA2',
        'Swallows Compass Mountain Falls': '2BA5',
        'Swallows Compass The Long End': '2BA7',
        'Swallows Compass The Long End 2': '2BAD',
    },
    triggers: [
        {
            // Standing in the lake, Diadarabotchi, boss 2
            id: 'Swallows Compass Six Fulms Under',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '237' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: matches.effect,
                };
            },
        },
        {
            // Stack marker, boss 3
            id: 'Swallows Compass Five Fingered Punishment',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['2BAB', '2BB0'], source: ['Qitian Dasheng', 'Shadow Of The Sage'] }),
            condition: (_data, matches) => matches.type === '21',
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: `${matches.ability} (alone)`,
                        de: `${matches.ability} (allein)`,
                        fr: `${matches.ability} (seul(e))`,
                        ja: `${matches.ability} (一人)`,
                        cn: `${matches.ability} (单吃)`,
                        ko: `${matches.ability} (혼자 맞음)`,
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const swallows_compass = (swallows_compass_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/temple_of_the_fist.ts

const temple_of_the_fist_triggerSet = {
    zoneId: zone_id/* default.TheTempleOfTheFist */.Z.TheTempleOfTheFist,
    damageWarn: {
        'Temple Fire Break': '21ED',
        'Temple Radial Blaster': '1FD3',
        'Temple Wide Blaster': '1FD4',
        'Temple Crippling Blow': '2016',
        'Temple Broken Earth': '236E',
        'Temple Shear': '1FDD',
        'Temple Counter Parry': '1FE0',
        'Temple Tapas': '',
        'Temple Hellseal': '200F',
        'Temple Pure Will': '2017',
        'Temple Megablaster': '163',
        'Temple Windburn': '1FE8',
        'Temple Hurricane Kick': '1FE5',
        'Temple Silent Roar': '1FEB',
        'Temple Mighty Blow': '1FEA',
    },
    shareWarn: {
        'Temple Heat Lightning': '1FD7',
    },
};
/* harmony default export */ const temple_of_the_fist = (temple_of_the_fist_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/dungeon/the_burn.ts

const the_burn_triggerSet = {
    zoneId: zone_id/* default.TheBurn */.Z.TheBurn,
    damageWarn: {
        'The Burn Falling Rock': '31A3',
        'The Burn Aetherial Blast': '328B',
        'The Burn Mole-a-whack': '328D',
        'The Burn Head Butt': '328E',
        'The Burn Shardfall': '3191',
        'The Burn Dissonance': '3192',
        'The Burn Crystalline Fracture': '3197',
        'The Burn Resonant Frequency': '3198',
        'The Burn Rotoswipe': '3291',
        'The Burn Wrecking Ball': '3292',
        'The Burn Shatter': '3294',
        'The Burn Auto-Cannons': '3295',
        'The Burn Self-Detonate': '3296',
        'The Burn Full Throttle': '2D75',
        'The Burn Throttle': '2D76',
        'The Burn Adit Driver': '2D78',
        'The Burn Tremblor': '3297',
        'The Burn Desert Spice': '3298',
        'The Burn Toxic Spray': '329A',
        'The Burn Venom Spray': '329B',
        'The Burn White Death': '3143',
        'The Burn Fog Plume 1': '3145',
        'The Burn Fog Plume 2': '3146',
        'The Burn Cauterize': '3148',
    },
    damageFail: {
        'The Burn Cold Fog': '3142',
    },
    gainsEffectWarn: {
        'The Burn Leaden': '43',
        'The Burn Puddle Frostbite': '11D',
    },
    shareWarn: {
        'The Burn Hailfire': '3194',
        'The Burn Shardstrike': '3195',
        'The Burn Chilling Aspiration': '314D',
        'The Burn Frost Breath': '314C',
    },
};
/* harmony default export */ const the_burn = (the_burn_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o1n.ts

// O1N - Deltascape 1.0 Normal
const o1n_triggerSet = {
    zoneId: zone_id/* default.DeltascapeV10 */.Z.DeltascapeV10,
    damageWarn: {
        'O1N Burn': '23D5',
        'O1N Clamp': '23E2',
    },
    shareWarn: {
        'O1N Levinbolt': '23DA',
    },
};
/* harmony default export */ const o1n = (o1n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o2n.ts



// O2N - Deltascape 2.0 Normal
const o2n_triggerSet = {
    zoneId: zone_id/* default.DeltascapeV20 */.Z.DeltascapeV20,
    damageWarn: {
        'O2N Main Quake': '24A5',
        'O2N Erosion': '2590',
    },
    shareWarn: {
        'O2N Paranormal Wave': '250E',
    },
    triggers: [
        {
            // We could try to separate out the mistake that led to the player being petrified.
            // However, it's Normal mode, why overthink it?
            id: 'O2N Petrification',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '262' }),
            // The user might get hit by another petrifying ability before the effect ends.
            // There's no point in notifying for that.
            suppressSeconds: 10,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'O2N Earthquake',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '2515', ...oopsy_common/* playerDamageFields */.np }),
            // This deals damage only to non-floating targets.
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const o2n = (o2n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o3n.ts


// O3N - Deltascape 3.0 Normal
const o3n_triggerSet = {
    zoneId: zone_id/* default.DeltascapeV30 */.Z.DeltascapeV30,
    damageWarn: {
        'O3N Spellblade Fire III': '2460',
        'O3N Spellblade Blizzard III': '2461',
        'O3N Spellblade Thunder III': '2462',
        'O3N Cross Reaper': '246B',
        'O3N Gusting Gouge': '246C',
        'O3N Sword Dance': '2470',
        'O3N Uplift': '2473',
    },
    damageFail: {
        'O3N Ultimum': '2477',
    },
    shareWarn: {
        'O3N Holy Blur': '2463',
    },
    triggers: [
        {
            id: 'O3N Phase Tracker',
            type: 'StartsUsing',
            netRegex: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: 'Halicarnassus', capture: false }),
            netRegexDe: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: 'Halikarnassos', capture: false }),
            netRegexFr: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: 'Halicarnasse', capture: false }),
            netRegexJa: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: 'ハリカルナッソス', capture: false }),
            netRegexCn: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: '哈利卡纳苏斯', capture: false }),
            netRegexKo: netregexes/* default.startsUsing */.Z.startsUsing({ id: '2304', source: '할리카르나소스', capture: false }),
            run: (data) => { var _a; return data.phaseNumber = ((_a = data.phaseNumber) !== null && _a !== void 0 ? _a : 0) + 1; },
        },
        {
            // There's a lot to track, and in order to make it all clean, it's safest just to
            // initialize it all up front instead of trying to guard against undefined comparisons.
            id: 'O3N Initializing',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '367', source: 'Halicarnassus', capture: false }),
            netRegexDe: netregexes/* default.ability */.Z.ability({ id: '367', source: 'Halikarnassos', capture: false }),
            netRegexFr: netregexes/* default.ability */.Z.ability({ id: '367', source: 'Halicarnasse', capture: false }),
            netRegexJa: netregexes/* default.ability */.Z.ability({ id: '367', source: 'ハリカルナッソス', capture: false }),
            netRegexCn: netregexes/* default.ability */.Z.ability({ id: '367', source: '哈利卡纳苏斯', capture: false }),
            netRegexKo: netregexes/* default.ability */.Z.ability({ id: '367', source: '할리카르나소스', capture: false }),
            condition: (data) => !data.initialized,
            run: (data) => {
                data.gameCount = 0;
                // Indexing phases at 1 so as to make phases match what humans expect.
                // 1: We start here.
                // 2: Cave phase with Uplifts.
                // 3: Post-intermission, with good and bad frogs.
                data.phaseNumber = 1;
                data.initialized = true;
            },
        },
        {
            id: 'O3N Ribbit',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '2466' }),
            condition: (data, matches) => {
                var _a;
                // We DO want to be hit by Toad/Ribbit if the next cast of The Game
                // is 4x toad panels.
                const gameCount = (_a = data.gameCount) !== null && _a !== void 0 ? _a : 0;
                return !(data.phaseNumber === 3 && gameCount % 2 === 0) && matches.targetId !== 'E0000000';
            },
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            // There's a lot we could do to track exactly how the player failed The Game.
            // Why overthink Normal mode, however?
            id: 'O3N The Game',
            type: 'Ability',
            // Guess what you just lost?
            netRegex: netregexes/* default.ability */.Z.ability({ id: '246D' }),
            // If the player takes no damage, they did the mechanic correctly.
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
            run: (data) => { var _a; return data.gameCount = ((_a = data.gameCount) !== null && _a !== void 0 ? _a : 0) + 1; },
        },
    ],
};
/* harmony default export */ const o3n = (o3n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o4n.ts



// O4N - Deltascape 4.0 Normal
const o4n_triggerSet = {
    zoneId: zone_id/* default.DeltascapeV40 */.Z.DeltascapeV40,
    damageWarn: {
        'O4N Blizzard III': '24BC',
        'O4N Empowered Thunder III': '24C1',
        'O4N Zombie Breath': '24CB',
        'O4N Clearout': '24CC',
        'O4N Black Spark': '24C9',
    },
    shareWarn: {
        // Empowered Fire III inflicts the Pyretic debuff, which deals damage if the player
        // moves or acts before the debuff falls. Unfortunately it doesn't look like there's
        // currently a log line for this, so the only way to check for this is to collect
        // the debuffs and then warn if a player takes an action during that time. Not worth it
        // for Normal.
        'O4N Standard Fire': '24BA',
        'O4N Buster Thunder': '24BE',
    },
    triggers: [
        {
            // Kills target if not cleansed
            id: 'O4N Doom',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '38E' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Cleansers missed Doom!',
                        de: 'Doom-Reinigung vergessen!',
                        fr: 'N\'a pas été dissipé(e) du Glas !',
                        ja: '死の宣告',
                        cn: '没解死宣',
                    },
                };
            },
        },
        {
            // Short knockback from Exdeath
            id: 'O4N Vacuum Wave',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '24B8', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Pushed off!',
                        de: 'Runter geschubst!',
                        fr: 'A été poussé(e) !',
                        ja: '落ちた',
                        cn: '击退坠落',
                    },
                };
            },
        },
        {
            // Room-wide AoE, freezes non-moving targets
            id: 'O4N Empowered Blizzard',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '4E6' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const o4n = (o4n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o4s.ts



// O4S - Deltascape 4.0 Savage
const o4s_triggerSet = {
    zoneId: zone_id/* default.DeltascapeV40Savage */.Z.DeltascapeV40Savage,
    damageWarn: {
        'O4S2 Neo Vacuum Wave': '241D',
        'O4S2 Acceleration Bomb': '2431',
        'O4S2 Emptiness': '2422',
    },
    damageFail: {
        'O4S2 Double Laser': '2415',
    },
    triggers: [
        {
            id: 'O4S2 Decisive Battle',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '2408', capture: false }),
            run: (data) => {
                data.isDecisiveBattleElement = true;
            },
        },
        {
            id: 'O4S1 Vacuum Wave',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '23FE', capture: false }),
            run: (data) => {
                data.isDecisiveBattleElement = false;
            },
        },
        {
            id: 'O4S2 Almagest',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '2417', capture: false }),
            run: (data) => {
                data.isNeoExdeath = true;
            },
        },
        {
            id: 'O4S2 Blizzard III',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '23F8', ...oopsy_common/* playerDamageFields */.np }),
            // Ignore unavoidable raid aoe Blizzard III.
            condition: (data) => !data.isDecisiveBattleElement,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'O4S2 Thunder III',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '23FD', ...oopsy_common/* playerDamageFields */.np }),
            // Only consider this during random mechanic after decisive battle.
            condition: (data) => data.isDecisiveBattleElement,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'O4S2 Petrified',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '262' }),
            mistake: (data, matches) => {
                // On Neo, being petrified is because you looked at Shriek, so your fault.
                if (data.isNeoExdeath)
                    return { type: 'fail', blame: matches.target, text: matches.effect };
                // On normal ExDeath, this is due to White Hole.
                return { type: 'warn', name: matches.target, text: matches.effect };
            },
        },
        {
            id: 'O4S2 Forked Lightning',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '242E', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'O4S2 Beyond Death Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '566' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasBeyondDeath) !== null && _a !== void 0 ? _a : (data.hasBeyondDeath = {});
                data.hasBeyondDeath[matches.target] = true;
            },
        },
        {
            id: 'O4S2 Beyond Death Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '566' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasBeyondDeath) !== null && _a !== void 0 ? _a : (data.hasBeyondDeath = {});
                data.hasBeyondDeath[matches.target] = false;
            },
        },
        {
            id: 'O4S2 Beyond Death',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '566' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (data, matches) => {
                if (!data.hasBeyondDeath)
                    return;
                if (!data.hasBeyondDeath[matches.target])
                    return;
                return {
                    name: matches.target,
                    text: matches.effect,
                };
            },
        },
        {
            id: 'O4S2 Double Attack Collect',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '241C', ...oopsy_common/* playerDamageFields */.np }),
            run: (data, matches) => {
                data.doubleAttackMatches = data.doubleAttackMatches || [];
                data.doubleAttackMatches.push(matches);
            },
        },
        {
            id: 'O4S2 Double Attack',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '241C', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (data) => {
                var _a, _b;
                const arr = data.doubleAttackMatches;
                if (!arr)
                    return;
                if (arr.length <= 2)
                    return;
                // Hard to know who should be in this and who shouldn't, but
                // it should never hit 3 people.
                return { type: 'fail', text: `${(_b = (_a = arr[0]) === null || _a === void 0 ? void 0 : _a.ability) !== null && _b !== void 0 ? _b : ''} x ${arr.length}` };
            },
            run: (data) => delete data.doubleAttackMatches,
        },
    ],
};
/* harmony default export */ const o4s = (o4s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o7s.ts


// TODO: missing many abilities here
// O7S - Sigmascape 3.0 Savage
const o7s_triggerSet = {
    zoneId: zone_id/* default.SigmascapeV30Savage */.Z.SigmascapeV30Savage,
    damageWarn: {
        'O7S Searing Wind': '2777',
    },
    damageFail: {
        'O7S Missile': '2782',
        'O7S Chain Cannon': '278F',
    },
    triggers: [
        {
            id: 'O7S Stoneskin',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '2AB5' }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.source, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const o7s = (o7s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/raid/o12s.ts



// TODO: could add Patch warnings for double/unbroken tethers
// TODO: Hello World could have any warnings (sorry)
const o12s_triggerSet = {
    zoneId: zone_id/* default.AlphascapeV40Savage */.Z.AlphascapeV40Savage,
    damageWarn: {
        'O12S1 Superliminal Motion 1': '3334',
        'O12S1 Efficient Bladework 1': '3329',
        'O12S1 Efficient Bladework 2': '332A',
        'O12S1 Beyond Strength': '3328',
        'O12S1 Superliminal Steel 1': '3330',
        'O12S1 Superliminal Steel 2': '3331',
        'O12S1 Optimized Blizzard III': '3332',
        'O12S2 Diffuse Wave Cannon': '3369',
        'O12S2 Right Arm Unit Hyper Pulse 1': '335A',
        'O12S2 Right Arm Unit Hyper Pulse 2': '335B',
        'O12S2 Right Arm Unit Colossal Blow': '335F',
        'O12S2 Left Arm Unit Colossal Blow': '3360',
    },
    damageFail: {
        'O12S1 Optical Laser': '3347',
        'O12S1 Advanced Optical Laser': '334A',
        'O12S2 Rear Power Unit Rear Lasers 1': '3361',
        'O12S2 Rear Power Unit Rear Lasers 2': '3362',
    },
    shareWarn: {
        'O12S1 Optimized Fire III': '3337',
        'O12S2 Hyper Pulse Tether': '335C',
        'O12S2 Wave Cannon': '336B',
        'O12S2 Optimized Fire III': '3379',
    },
    shareFail: {
        'O12S1 Optimized Sagittarius Arrow': '334D',
        'O12S2 Oversampled Wave Cannon': '3366',
        'O12S2 Savage Wave Cannon': '336D',
    },
    triggers: [
        {
            id: 'O12S1 Discharger Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '3327' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
        {
            id: 'O12S1 Magic Vulnerability Up Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '472' }),
            run: (data, matches) => {
                var _a;
                (_a = data.vuln) !== null && _a !== void 0 ? _a : (data.vuln = {});
                data.vuln[matches.target] = true;
            },
        },
        {
            id: 'O12S1 Magic Vulnerability Up Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '472' }),
            run: (data, matches) => {
                data.vuln = data.vuln || {};
                data.vuln[matches.target] = false;
            },
        },
        {
            id: 'O12S1 Magic Vulnerability Damage',
            type: 'Ability',
            // 332E = Pile Pitch stack
            // 333E = Electric Slide (Omega-M square 1-4 dashes)
            // 333F = Electric Slide (Omega-F triangle 1-4 dashes)
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['332E', '333E', '333F'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.vuln && data.vuln[matches.target],
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: `${matches.ability} (with vuln)`,
                        de: `${matches.ability} (mit Verwundbarkeit)`,
                        ja: `${matches.ability} (被ダメージ上昇)`,
                        cn: `${matches.ability} (带易伤)`,
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const o12s = (o12s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/byakko-ex.ts



// Byakko Extreme
const byakko_ex_triggerSet = {
    zoneId: zone_id/* default.TheJadeStoaExtreme */.Z.TheJadeStoaExtreme,
    damageWarn: {
        // Popping Unrelenting Anguish bubbles
        'ByaEx Aratama': '27F6',
        // Stepping in growing orb
        'ByaEx Vacuum Claw': '27E9',
        // Lightning Puddles
        'ByaEx Hunderfold Havoc 1': '27E5',
        'ByaEx Hunderfold Havoc 2': '27E6',
    },
    damageFail: {
        'ByaEx Sweep The Leg': '27DB',
        'ByaEx Fire and Lightning': '27DE',
        'ByaEx Distant Clap': '27DD',
        // Midphase line attack
        'ByaEx Imperial Guard': '27F1',
    },
    triggers: [
        {
            // Pink bubble collision
            id: 'ByaEx Ominous Wind',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '27EC', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'bubble collision',
                        de: 'Blasen sind zusammengestoßen',
                        fr: 'collision de bulles',
                        ja: '衝突',
                        cn: '相撞',
                        ko: '장판 겹쳐서 터짐',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const byakko_ex = (byakko_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/shinryu.ts



// Shinryu Normal
const shinryu_triggerSet = {
    zoneId: zone_id/* default.TheRoyalMenagerie */.Z.TheRoyalMenagerie,
    damageWarn: {
        'Shinryu Akh Rhai': '1FA6',
        'Shinryu Blazing Trail': '221A',
        'Shinryu Collapse': '2218',
        'Shinryu Dragonfist': '24F0',
        'Shinryu Earth Breath': '1F9D',
        'Shinryu Gyre Charge': '1FA8',
        'Shinryu Spikesicle': '1FA`',
        'Shinryu Tail Slap': '1F93',
    },
    shareWarn: {
        'Shinryu Levinbolt': '1F9C',
    },
    triggers: [
        {
            // Icy floor attack.
            id: 'Shinryu Diamond Dust',
            type: 'GainsEffect',
            // Thin Ice
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '38F' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Slid off!',
                        de: 'Runter gerutscht!',
                        fr: 'A glissé(e) !',
                        ja: '滑った',
                        cn: '滑落',
                    },
                };
            },
        },
        {
            id: 'Shinryu Tidal Wave',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '1F8B', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Pushed off!',
                        de: 'Runter geschubst!',
                        fr: 'A été poussé(e) !',
                        ja: '落ちた',
                        cn: '击退坠落',
                    },
                };
            },
        },
        {
            // Knockback from center.
            id: 'Shinryu Aerial Blast',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '1F90', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Pushed off!',
                        de: 'Runter geschubst!',
                        fr: 'A été pousser !',
                        ja: '落ちた',
                        cn: '击退坠落',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const shinryu = (shinryu_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/susano-ex.ts

// Susano Extreme
const susano_ex_triggerSet = {
    zoneId: zone_id/* default.ThePoolOfTributeExtreme */.Z.ThePoolOfTributeExtreme,
    damageWarn: {
        'SusEx Churning': '203F',
    },
    damageFail: {
        'SusEx Rasen Kaikyo': '202E',
    },
};
/* harmony default export */ const susano_ex = (susano_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/trial/suzaku.ts



// Suzaku Normal
const suzaku_triggerSet = {
    zoneId: zone_id/* default.HellsKier */.Z.HellsKier,
    damageWarn: {
        'Ashes To Ashes': '321F',
        'Fleeting Summer': '3223',
        'Wing And A Prayer': '3225',
        'Phantom Half': '3233',
        'Well Of Flame': '3236',
        'Hotspot': '3238',
        'Swoop': '323B',
        'Burn': '323D',
    },
    shareWarn: {
        'Rekindle': '3235',
    },
    triggers: [
        {
            id: 'Suzaku Normal Ruthless Refrain',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '3230', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Pushed off!',
                        de: 'Runter geschubst!',
                        fr: 'A été poussé(e) !',
                        ja: '落ちた',
                        cn: '击退坠落',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const suzaku = (suzaku_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/ultimate/ultima_weapon_ultimate.ts



// Ultima Weapon Ultimate
const ultima_weapon_ultimate_triggerSet = {
    zoneId: zone_id/* default.TheWeaponsRefrainUltimate */.Z.TheWeaponsRefrainUltimate,
    damageWarn: {
        'UWU Searing Wind': '2B5C',
        'UWU Eruption': '2B5A',
        'UWU Weight': '2B65',
        'UWU Landslide1': '2B70',
        'UWU Landslide2': '2B71',
    },
    damageFail: {
        'UWU Great Whirlwind': '2B41',
        'UWU Slipstream': '2B53',
        'UWU Wicked Wheel': '2B4E',
        'UWU Wicked Tornado': '2B4F',
    },
    triggers: [
        {
            id: 'UWU Windburn',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: 'EB' }),
            suppressSeconds: 2,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            // Featherlance explosion.  It seems like the person who pops it is the
            // first person listed damage-wise, so they are likely the culprit.
            id: 'UWU Featherlance',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '2B43', ...oopsy_common/* playerDamageFields */.np }),
            suppressSeconds: 5,
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.source };
            },
        },
    ],
};
/* harmony default export */ const ultima_weapon_ultimate = (ultima_weapon_ultimate_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/04-sb/ultimate/unending_coil_ultimate.ts



// UCU - The Unending Coil Of Bahamut (Ultimate)
const unending_coil_ultimate_triggerSet = {
    zoneId: zone_id/* default.TheUnendingCoilOfBahamutUltimate */.Z.TheUnendingCoilOfBahamutUltimate,
    damageFail: {
        'UCU Lunar Dynamo': '26BC',
        'UCU Iron Chariot': '26BB',
        'UCU Exaflare': '26EF',
        'UCU Wings Of Salvation': '26CA',
    },
    triggers: [
        {
            id: 'UCU Twister Death',
            type: 'Ability',
            // Instant death has a special flag value, differentiating
            // from the explosion damage you take when somebody else
            // pops one.
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '26AB', ...oopsy_common/* playerDamageFields */.np, flags: oopsy_common/* kFlagInstantDeath */.hm }),
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: 'Twister Pop',
                        de: 'Wirbelsturm berührt',
                        fr: 'Apparition des tornades',
                        ja: 'ツイスター',
                        cn: '旋风',
                        ko: '회오리 밟음',
                    },
                };
            },
        },
        {
            id: 'UCU Thermionic Burst',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '26B9', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: 'Pizza Slice',
                        de: 'Pizzastück',
                        fr: 'Parts de pizza',
                        ja: 'サーミオニックバースト',
                        cn: '天崩地裂',
                        ko: '장판에 맞음',
                    },
                };
            },
        },
        {
            id: 'UCU Chain Lightning',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '26C8', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                // It's hard to assign blame for lightning.  The debuffs
                // go out and then explode in order, but the attacker is
                // the dragon and not the player.
                return {
                    type: 'warn',
                    name: matches.target,
                    text: {
                        en: 'hit by lightning',
                        de: 'vom Blitz getroffen',
                        fr: 'frappé(e) par la foudre',
                        ja: 'チェインライトニング',
                        cn: '雷光链',
                        ko: '번개 맞음',
                    },
                };
            },
        },
        {
            id: 'UCU Burns',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: 'FA' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'UCU Sludge',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '11F' }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'UCU Doom Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: 'D2' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasDoom) !== null && _a !== void 0 ? _a : (data.hasDoom = {});
                data.hasDoom[matches.target] = true;
            },
        },
        {
            id: 'UCU Doom Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: 'D2' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasDoom) !== null && _a !== void 0 ? _a : (data.hasDoom = {});
                data.hasDoom[matches.target] = false;
            },
        },
        {
            // There is no callout for "you forgot to clear doom".  The logs look
            // something like this:
            //   [20:02:30.564] 1A:Okonomi Yaki gains the effect of Doom from  for 6.00 Seconds.
            //   [20:02:36.443] 1E:Okonomi Yaki loses the effect of Protect from Tako Yaki.
            //   [20:02:36.443] 1E:Okonomi Yaki loses the effect of Doom from .
            //   [20:02:38.525] 19:Okonomi Yaki was defeated by Firehorn.
            // In other words, doom effect is removed +/- network latency, but can't
            // tell until later that it was a death.  Arguably, this could have been a
            // close-but-successful clearing of doom as well.  It looks the same.
            // Strategy: if you haven't cleared doom with 1 second to go then you probably
            // died to doom.  You can get non-fatally iceballed or auto'd in between,
            // but what can you do.
            id: 'UCU Doom Death',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: 'D2' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 1,
            deathReason: (data, matches) => {
                if (!data.hasDoom || !data.hasDoom[matches.target])
                    return;
                let text;
                const duration = parseFloat(matches.duration);
                if (duration < 9)
                    text = matches.effect + ' #1';
                else if (duration < 14)
                    text = matches.effect + ' #2';
                else
                    text = matches.effect + ' #3';
                return { name: matches.target, text: text };
            },
        },
    ],
};
/* harmony default export */ const unending_coil_ultimate = (unending_coil_ultimate_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/alliance/the_copied_factory.ts

// The Copied Factory
const the_copied_factory_triggerSet = {
    zoneId: zone_id/* default.TheCopiedFactory */.Z.TheCopiedFactory,
    damageWarn: {
        'Copied Serial Energy Bomb': '48B4',
        // Make sure enemies are ignored on these
        'Copied Serial Energy Bombardment': '48B8',
        'Copied Serial Energy Assault': '48B6',
        'Copied Serial High-Powered Laser': '48C5',
        'Copied Serial Sidestriking Spin Spin 1': '48CB',
        'Copied Serial Sidestriking Spin 2': '48CC',
        'Copied Serial Centrifugal Spin': '48C9',
        'Copied Serial Air-To-Surface Energy': '48BA',
        'Copied Serial High-Caliber Laser': '48FA',
        'Copied Serial Energy Ring 1': '48BC',
        'Copied Serial Energy Ring 2': '48BD',
        'Copied Serial Energy Ring 3': '48BE',
        'Copied Serial Energy Ring 4': '48C0',
        'Copied Serial Energy Ring 5': '48C1',
        'Copied Serial Energy Ring 6': '48C2',
        'Copied Trash Energy Bomb': '491D',
        'Copied Trash Frontal Somersault': '491B',
        'Copied Trash High-Frequency Laser': '491E',
        'Copied Hobbes Shocking Discharge': '480B',
        'Copied Hobbes Variable Combat Test 1': '49C5',
        'Copied Hobbes Variable Combat Test 2': '49C6',
        'Copied Hobbes Variable Combat Test 3': '49C7',
        'Copied Hobbes Variable Combat Test 4': '480F',
        'Copied Hobbes Variable Combat Test 5': '4810',
        'Copied Hobbes Variable Combat Test 6': '4811',
        'Copied Hobbes Ring Laser 1': '4802',
        'Copied Hobbes Ring Laser 2': '4803',
        'Copied Hobbes Ring Laser 3': '4804',
        'Copied Hobbes Towerfall': '4813',
        'Copied Hobbes Fire-Reistance Test 1': '4816',
        'Copied Hobbes Fire-Reistance Test 2': '4817',
        'Copied Hobbes Fire-Reistance Test 3': '4818',
        'Copied Hobbes Oil Well': '481B',
        'Copied Hobbes Electromagnetic Pulse': '4819',
        // TODO: what's the electrified floor with conveyor belts?
        'Copied Goliath Energy Ring 1': '4937',
        'Copied Goliath Energy Ring 2': '4938',
        'Copied Goliath Energy Ring 3': '4939',
        'Copied Goliath Energy Ring 4': '493A',
        'Copied Goliath Energy Ring 5': '4937',
        'Copied Goliath Laser Turret': '48E6',
        'Copied Flight Unit Area Bombing': '4943',
        'Copied Flight Unit Lightfast Blade': '4940',
        'Copied Engels Marx Smash 1': '4729',
        'Copied Engels Marx Smash 2': '4728',
        'Copied Engels Marx Smash 3': '472F',
        'Copied Engels Marx Smash 4': '4731',
        'Copied Engels Marx Smash 5': '472B',
        'Copied Engels Marx Smash 6': '472D',
        'Copied Engels Marx Smash 7': '4732',
        'Copied Engels Incendiary Bombing': '4739',
        'Copied Engels Guided Missile': '4736',
        'Copied Engels Surface Missile': '4734',
        'Copied Engels Laser Sight': '473B',
        'Copied Engels Frack': '474D',
        'Copied Engels Marx Crush': '48FC',
        'Copied Engels Crushing Wheel': '474B',
        'Copied Engels Marx Thrust': '48FC',
        'Copied 9S Laser Suppression': '48E0',
        'Copied 9S Ballistic Impact 1': '4974',
        'Copied 9S Ballistic Impact 2': '48DC',
        'Copied 9S Ballistic Impact 3': '48E4',
        'Copied 9S Ballistic Impact 4': '48E0',
        'Copied 9S Marx Impact': '48D4',
        'Copied 9S Tank Destruction 1': '48E8',
        'Copied 9S Tank Destruction 2': '48E9',
        'Copied 9S Serial Spin 1': '48A5',
        'Copied 9S Serial Spin 2': '48A7',
    },
    shareWarn: {
        'Copied Hobbes Short-Range Missile': '4815',
    },
};
/* harmony default export */ const the_copied_factory = (the_copied_factory_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/alliance/the_puppets_bunker.ts

// TODO: 5093 taking High-Powered Laser with a vuln (because of taking two)
// TODO: 4FB5 taking High-Powered Laser with a vuln (because of taking two)
// TODO: 50D3 Aerial Support: Bombardment going off from add
// TODO: 5211 Maneuver: Volt Array not getting interrupted
// TODO: 4FF4/4FF5 One of these is failing chemical conflagration
// TODO: standing in wrong teleporter?? maybe 5363?
const the_puppets_bunker_triggerSet = {
    zoneId: zone_id/* default.ThePuppetsBunker */.Z.ThePuppetsBunker,
    damageWarn: {
        'Puppet Aegis Beam Cannons 1': '5074',
        'Puppet Aegis Beam Cannons 2': '5075',
        'Puppet Aegis Beam Cannons 3': '5076',
        'Puppet Aegis Collider Cannons': '507E',
        'Puppet Aegis Surface Laser 1': '5091',
        'Puppet Aegis Surface Laser 2': '5092',
        'Puppet Aegis Flight Path': '508C',
        'Puppet Aegis Refraction Cannons 1': '5081',
        'Puppet Aegis Life\'s Last Song': '53B3',
        'Puppet Light Long-Barreled Laser': '5212',
        'Puppet Light Surface Missile Impact': '520F',
        'Puppet Superior Incendiary Bombing': '4FB9',
        'Puppet Superior Sharp Turn': '506D',
        'Puppet Superior Standard Surface Missile 1': '4FB1',
        'Puppet Superior Standard Surface Missile 2': '4FB2',
        'Puppet Superior Standard Surface Missile 3': '4FB3',
        'Puppet Superior Sliding Swipe 1': '506F',
        'Puppet Superior Sliding Swipe 2': '5070',
        'Puppet Superior Guided Missile': '4FB8',
        'Puppet Superior High-Order Explosive Blast 1': '4FC0',
        'Puppet Superior High-Order Explosive Blast 2': '4FC1',
        'Puppet Heavy Energy Bombardment': '4FFC',
        'Puppet Heavy Revolving Laser': '5000',
        'Puppet Heavy Energy Bomb': '4FFA',
        'Puppet Heavy R010 Laser': '4FF0',
        'Puppet Heavy R030 Hammer': '4FF1',
        'Puppet Hallway High-Powered Laser': '50B1',
        'Puppet Hallway Energy Bomb': '50B2',
        'Puppet Compound Mechanical Dissection': '51B3',
        'Puppet Compound Mechanical Decapitation': '51B4',
        'Puppet Compound Mechnical Contusion Untargeted': '51B7',
        'Puppet Compound 2P Relentless Spiral 1': '51AA',
        'Puppet Compound 2P Relentless Spiral 2': '51CB',
        'Puppet Compound 2P Prime Blade Out 1': '541F',
        'Puppet Compound 2P Prime Blade Out 2': '5198',
        'Puppet Compound 2P Prime Blade Behind 1': '5420',
        'Puppet Compound 2P Prime Blade Behind 2': '5199',
        'Puppet Compound 2P Prime Blade In 1': '5421',
        'Puppet Compound 2P Prime Blade In 2': '519A',
        'Puppet Compound 2P R012 Laser Ground': '51AE',
    },
    damageFail: {
        'Puppet Heavy Upper Laser 1': '5087',
        'Puppet Heavy Upper Laser 2': '4FF7',
        'Puppet Heavy Lower Laser 1': '5086',
        'Puppet Heavy Lower Laser 2': '4FF6',
        'Puppet Heavy Lower Laser 3': '5088',
        'Puppet Heavy Lower Laser 4': '4FF8',
        'Puppet Heavy Lower Laser 5': '5089',
        'Puppet Heavy Lower Laser 6': '4FF9',
        'Puppet Compound Incongruous Spin': '51B2',
    },
    gainsEffectWarn: {
        'Puppet Burns': '10B',
    },
    shareWarn: {
        // This is pretty large and getting hit by initial without burns seems fine.
        // 'Puppet Light Homing Missile Impact': '5210', // targeted fire aoe from No Restrictions
        'Puppet Heavy Unconventional Voltage': '5004',
        // Pretty noisy.
        'Puppet Maneuver High-Powered Laser': '5002',
        'Puppet Compound Mechnical Contusion Targeted': '51B6',
        'Puppet Compound 2P R012 Laser Tank': '51AE',
    },
    shareFail: {
        'Puppet Aegis Anti-Personnel Laser': '5090',
        'Puppet Superior Precision-Guided Missile': '4FC5',
        'Puppet Compound 2P R012 Laser Tank': '51AD',
    },
};
/* harmony default export */ const the_puppets_bunker = (the_puppets_bunker_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/alliance/the_tower_at_paradigms_breach.ts


// TODO: missing Shock Black 2?
// TODO: White/Black Dissonance damage is maybe when flags end in 03?
const the_tower_at_paradigms_breach_triggerSet = {
    zoneId: zone_id/* default.TheTowerAtParadigmsBreach */.Z.TheTowerAtParadigmsBreach,
    damageWarn: {
        'Tower Knave Colossal Impact Center 1': '5EA7',
        'Tower Knave Colossal Impact Center 2': '60C8',
        'Tower Knave Colossal Impact Side 1': '5EA5',
        'Tower Knave Colossal Impact Side 2': '5EA6',
        'Tower Knave Colossal Impact Side 3': '60C6',
        'Tower Knave Colossal Impact Side 4': '60C7',
        'Tower Knave Burst': '5ED4',
        'Tower Knave Magic Barrage': '5EAC',
        'Tower Hansel Repay': '5C70',
        'Tower Hansel Explosion': '5C67',
        'Tower Hansel Impact': '5C5C',
        'Tower Hansel Bloody Sweep 1': '5C6C',
        'Tower Hansel Bloody Sweep 2': '5C6D',
        'Tower Hansel Bloody Sweep 3': '5C6E',
        'Tower Hansel Bloody Sweep 4': '5C6F',
        'Tower Hansel Passing Lance': '5C66',
        'Tower Hansel Breaththrough 1': '55B3',
        'Tower Hansel Breaththrough 2': '5C5D',
        'Tower Hansel Breaththrough 3': '5C5E',
        'Tower Hansel Hungry Lance 1': '5C71',
        'Tower Hansel Hungry Lance 2': '5C72',
        'Tower Flight Unit Lightfast Blade': '5BFE',
        'Tower Flight Unit Standard Laser': '5BFF',
        'Tower 2P Whirling Assault': '5BFB',
        'Tower 2P Balanced Edge': '5BFA',
        'Tower Red Girl Generate Barrier 1': '6006',
        'Tower Red Girl Generate Barrier 2': '6007',
        'Tower Red Girl Generate Barrier 3': '6008',
        'Tower Red Girl Generate Barrier 4': '6009',
        'Tower Red Girl Generate Barrier 5': '6310',
        'Tower Red Girl Generate Barrier 6': '6311',
        'Tower Red Girl Generate Barrier 7': '6312',
        'Tower Red Girl Generate Barrier 8': '6313',
        'Tower Red Girl Shock White 1': '600F',
        'Tower Red Girl Shock White 2': '6010',
        'Tower Red Girl Shock Black 1': '6011',
        'Tower Red Girl Point White 1': '601F',
        'Tower Red Girl Point White 2': '6021',
        'Tower Red Girl Point Black 1': '6020',
        'Tower Red Girl Point Black 2': '6022',
        'Tower Red Girl Wipe White': '600C',
        'Tower Red Girl Wipe Black': '600D',
        'Tower Red Girl Diffuse Energy': '6056',
        'Tower Red Girl Pylon Big Explosion': '6027',
        'Tower Red Girl Pylon Explosion': '6026',
        'Tower Philosopher Deploy Armaments Middle': '5C02',
        'Tower Philosopher Deploy Armaments Sides': '5C05',
        'Tower Philosopher Deploy Armaments 3': '6078',
        'Tower Philosopher Deploy Armaments 4': '6079',
        'Tower Philosopher Energy Bomb': '5C05',
        'Tower False Idol Made Magic Right': '5BD7',
        'Tower False Idol Made Magic Left': '5BD6',
        'Tower False Idol Lighter Note': '5BDA',
        'Tower False Idol Magical Interference': '5BD5',
        'Tower False Idol Scattered Magic': '5BDF',
        'Tower Her Inflorescence Uneven Fotting': '5BE2',
        'Tower Her Inflorescence Crash': '5BE5',
        'Tower Her Inflorescence Heavy Arms 1': '5BED',
        'Tower Her Inflorescence Heavy Arms 2': '5BEF',
        'Tower Her Inflorescence Energy Scattered Magic': '5BE8',
    },
    damageFail: {
        'Tower Her Inflorescence Place Of Power': '5C0D',
    },
    shareWarn: {
        'Tower Knave Magic Artillery Alpha': '5EAB',
        'Tower Hansel Seed Of Magic Alpha': '5C61',
    },
    shareFail: {
        'Tower Knave Magic Artillery Beta': '5EB3',
        'Tower Red Girl Manipulate Energy': '601A',
        'Tower False Idol Darker Note': '5BDC',
    },
    triggers: [
        {
            id: 'Tower Knocked Off',
            type: 'Ability',
            // 5EB1 = Knave Lunge
            // 5BF2 = Her Infloresence Shockwave
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['5EB1', '5BF2'] }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const the_tower_at_paradigms_breach = (the_tower_at_paradigms_breach_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/akadaemia_anyder.ts

const akadaemia_anyder_triggerSet = {
    zoneId: zone_id/* default.AkadaemiaAnyder */.Z.AkadaemiaAnyder,
    damageWarn: {
        'Anyder Acrid Stream': '4304',
        'Anyder Waterspout': '4306',
        'Anyder Raging Waters': '4302',
        'Anyder Violent Breach': '4305',
        'Anyder Tidal Guillotine 1': '3E08',
        'Anyder Tidal Guillotine 2': '3E0A',
        'Anyder Pelagic Cleaver 1': '3E09',
        'Anyder Pelagic Cleaver 2': '3E0B',
        'Anyder Aquatic Lance': '3E05',
        'Anyder Syrup Spout': '4308',
        'Anyder Needle Storm': '4309',
        'Anyder Extensible Tendrils 1': '3E10',
        'Anyder Extensible Tendrils 2': '3E11',
        'Anyder Putrid Breath': '3E12',
        'Anyder Detonator': '430F',
        'Anyder Dominion Slash': '430D',
        'Anyder Quasar': '430B',
        'Anyder Dark Arrivisme': '430E',
        'Anyder Thunderstorm': '3E1C',
        'Anyder Winding Current': '3E1F',
    },
};
/* harmony default export */ const akadaemia_anyder = (akadaemia_anyder_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/amaurot.ts

const amaurot_triggerSet = {
    zoneId: zone_id/* default.Amaurot */.Z.Amaurot,
    damageWarn: {
        'Amaurot Burning Sky': '354A',
        'Amaurot Whack': '353C',
        'Amaurot Aetherspike': '353B',
        'Amaurot Venemous Breath': '3CCE',
        'Amaurot Cosmic Shrapnel': '4D26',
        'Amaurot Earthquake': '3CCD',
        'Amaurot Meteor Rain': '3CC6',
        'Amaurot Final Sky': '3CCB',
        'Amaurot Malevolence': '3541',
        'Amaurot Turnabout': '3542',
        'Amaurot Sickly Inferno': '3DE3',
        'Amaurot Disquieting Gleam': '3546',
        'Amaurot Black Death': '3543',
        'Amaurot Force of Loathing': '3544',
        'Amaurot Damning Ray 1': '3E00',
        'Amaurot Damning Ray 2': '3E01',
        'Amaurot Deadly Tentacles': '3547',
        'Amaurot Misfortune': '3CE2',
    },
    damageFail: {
        'Amaurot Apokalypsis': '3CD7',
    },
};
/* harmony default export */ const amaurot = (amaurot_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/anamnesis_anyder.ts

const anamnesis_anyder_triggerSet = {
    zoneId: zone_id/* default.AnamnesisAnyder */.Z.AnamnesisAnyder,
    damageWarn: {
        'Anamnesis Trench Phuabo Spine Lash': '4D1A',
        'Anamnesis Trench Anemone Falling Rock': '4E37',
        'Anamnesis Trench Dagonite Sewer Water': '4D1C',
        'Anamnesis Trench Yovra Rock Hard': '4D21',
        'Anamnesis Trench Yovra Torrential Torment': '4D21',
        'Anamnesis Unknown Luminous Ray': '4E27',
        'Anamnesis Unknown Sinster Bubble Explosion': '4B6E',
        'Anamnesis Unknown Reflection': '4B6F',
        'Anamnesis Unknown Clearout 1': '4B74',
        'Anamnesis Unknown Clearout 2': '4B6B',
        'Anamnesis Unknown Setback 1': '4B75',
        'Anamnesis Unknown Setback 2': '5B6C',
        'Anamnesis Anyder Clionid Acrid Stream': '4D24',
        'Anamnesis Anyder Diviner Dreadstorm': '4D28',
        'Anamnesis Kyklops 2000-Mina Swing': '4B55',
        'Anamnesis Kyklops Terrible Hammer': '4B5D',
        'Anamnesis Kyklops Terrible Blade': '4B5E',
        'Anamnesis Kyklops Raging Glower': '4B56',
        'Anamnesis Kyklops Eye Of The Cyclone': '4B57',
        'Anamnesis Anyder Harpooner Hydroball': '4D26',
        'Anamnesis Rukshs Swift Shift': '4B83',
        'Anamnesis Rukshs Depth Grip Wavebreaker': '33D4',
        'Anamnesis Rukshs Rising Tide': '4B8B',
        'Anamnesis Rukshs Command Current': '4B82',
    },
    shareWarn: {
        'Anamnesis Trench Xzomit Mantle Drill': '4D19',
        'Anamnesis Io Ousia Barreling Smash': '4E24',
        'Anamnesis Kyklops Wanderer\'s Pyre': '4B5F',
    },
};
/* harmony default export */ const anamnesis_anyder = (anamnesis_anyder_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/dohn_mheg.ts


// TODO: Missing Growing tethers on boss 2.
// (Maybe gather party member names on the previous TIIIIMBEEEEEER cast for comparison?)
// TODO: Failing to interrupt Dohnfaust Fuath on Watering Wheel casts?
// (15:........:Dohnfast Fuath:3DAA:Watering Wheel:........:(\y{Name}):)
const dohn_mheg_triggerSet = {
    zoneId: zone_id/* default.DohnMheg */.Z.DohnMheg,
    damageWarn: {
        'Dohn Mheg Geyser': '2260',
        'Dohn Mheg Hydrofall': '22BD',
        'Dohn Mheg Laughing Leap': '2294',
        'Dohn Mheg Swinge': '22CA',
        'Dohn Mheg Canopy': '3DB0',
        'Dohn Mheg Pinecone Bomb': '3DB1',
        'Dohn Mheg Bile Bombardment': '34EE',
        'Dohn Mheg Corrosive Bile': '34EC',
        'Dohn Mheg Flailing Tentacles': '3681',
    },
    triggers: [
        {
            id: 'Dohn Mheg Imp Choir',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '46E' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'Dohn Mheg Toad Choir',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '1B7' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'Dohn Mheg Fool\'s Tumble',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '183' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const dohn_mheg = (dohn_mheg_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/heroes_gauntlet.ts



// TODO: Berserker 2nd/3rd wild anguish should be shared with just a rock
const heroes_gauntlet_triggerSet = {
    zoneId: zone_id/* default.TheHeroesGauntlet */.Z.TheHeroesGauntlet,
    damageWarn: {
        'THG Blade\'s Benison': '5228',
        'THG Absolute Holy': '524B',
        'THG Hissatsu: Goka': '523D',
        'THG Whole Self': '522D',
        'THG Randgrith': '5232',
        'THG Vacuum Blade 1': '5061',
        'THG Vacuum Blade 2': '5062',
        'THG Coward\'s Cunning': '4FD7',
        'THG Papercutter 1': '4FD1',
        'THG Papercutter 2': '4FD2',
        'THG Ring of Death': '5236',
        'THG Lunar Eclipse': '5227',
        'THG Absolute Gravity': '5248',
        'THG Rain of Light': '5242',
        'THG Dooming Force': '5239',
        'THG Absolute Dark II': '4F61',
        'THG Burst': '53B7',
        'THG Pain Mire': '4FA4',
        'THG Dark Deluge': '4F5D',
        'THG Tekka Gojin': '523E',
        'THG Raging Slice 1': '520A',
        'THG Raging Slice 2': '520B',
        'THG Wild Rage': '5203',
    },
    gainsEffectWarn: {
        'THG Bleeding': '828',
    },
    gainsEffectFail: {
        'THG Truly Berserk': '906',
    },
    shareWarn: {
        'THG Absolute Thunder IV': '5245',
        'THG Moondiver': '5233',
        'THG Spectral Gust': '53CF',
    },
    shareFail: {
        'THG Falling Rock': '5205',
    },
    soloWarn: {
        // This should always be shared.  On all times but the 2nd and 3rd, it's a party share.
        // TODO: on the 2nd and 3rd time this should only be shared with a rock.
        // TODO: alternatively warn on taking one of these with a 472 Magic Vulnerability Up effect
        'THG Wild Anguish': '5209',
    },
    triggers: [
        {
            id: 'THG Wild Rampage',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '5207', ...oopsy_common/* playerDamageFields */.np }),
            // This is zero damage if you are in the crater.
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const heroes_gauntlet = (heroes_gauntlet_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/holminster_switch.ts

const holminster_switch_triggerSet = {
    zoneId: zone_id/* default.HolminsterSwitch */.Z.HolminsterSwitch,
    damageWarn: {
        'Holminster Thumbscrew': '3DC6',
        'Holminster Wooden horse': '3DC7',
        'Holminster Light Shot': '3DC8',
        'Holminster Heretic\'s Fork': '3DCE',
        'Holminster Holy Water': '3DD4',
        'Holminster Fierce Beating 1': '3DDD',
        'Holminster Fierce Beating 2': '3DDE',
        'Holminster Fierce Beating 3': '3DDF',
        'Holminster Cat O\' Nine Tails': '3DE1',
        'Holminster Right Knout': '3DE6',
        'Holminster Left Knout': '3DE7',
    },
    damageFail: {
        'Holminster Aethersup': '3DE9',
    },
    shareWarn: {
        'Holminster Flagellation': '3DD6',
    },
    shareFail: {
        'Holminster Taphephobia': '4181',
    },
};
/* harmony default export */ const holminster_switch = (holminster_switch_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/malikahs_well.ts

const malikahs_well_triggerSet = {
    zoneId: zone_id/* default.MalikahsWell */.Z.MalikahsWell,
    damageWarn: {
        'Malikah Falling Rock': '3CEA',
        'Malikah Wellbore': '3CED',
        'Malikah Geyser Eruption': '3CEE',
        'Malikah Swift Spill': '3CF0',
        'Malikah Breaking Wheel 1': '3CF5',
        'Malikah Crystal Nail': '3CF7',
        'Malikah Heretic\'s Fork 1': '3CF9',
        'Malikah Breaking Wheel 2': '3CFA',
        'Malikah Heretic\'s Fork 2': '3E0E',
        'Malikah Earthshake': '3E39',
    },
};
/* harmony default export */ const malikahs_well = (malikahs_well_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/matoyas_relict.ts

// TODO: could include 5484 Mudman Rocky Roll as a shareWarn, but it's low damage and common.
const matoyas_relict_triggerSet = {
    zoneId: zone_id/* default.MatoyasRelict */.Z.MatoyasRelict,
    damageWarn: {
        'Matoya Relict Werewood Ovation': '5518',
        'Matoya Cave Tarantula Hawk Apitoxin': '5519',
        'Matoya Spriggan Stonebearer Romp': '551A',
        'Matoya Sonny Of Ziggy Jittering Glare': '551C',
        'Matoya Mudman Quagmire': '5481',
        'Matoya Mudman Brittle Breccia 1': '548E',
        'Matoya Mudman Brittle Breccia 2': '548F',
        'Matoya Mudman Brittle Breccia 3': '5490',
        'Matoya Mudman Mud Bubble': '5487',
        'Matoya Cave Pugil Screwdriver': '551E',
        'Matoya Nixie Gurgle': '5992',
        'Matoya Relict Molten Phoebad Pyroclastic Shot': '57EB',
        'Matoya Relict Flan Flood': '5523',
        'Matoya Pyroduct Eldthurs Mash': '5527',
        'Matyoa Pyroduct Eldthurs Spin': '5528',
        'Matoya Relict Bavarois Thunder III': '5525',
        'Matoya Relict Marshmallow Ancient Aero': '5524',
        'Matoya Relict Pudding Fire II': '5522',
        'Matoya Relict Molten Phoebad Hot Lava': '57E9',
        'Matoya Relict Molten Phoebad Volcanic Drop': '57E8',
        'Matoya Mother Porxie Medium Rear': '591D',
        'Matoya Mother Porxie Barbeque Line': '5917',
        'Matoya Mother Porxie Barbeque Circle': '5918',
        'Matoya Mother Porxie To A Crisp': '5925',
        'Matoya Mother Proxie Buffet': '5926',
    },
    damageFail: {
        'Matoya Nixie Sea Shanty': '598C',
    },
    shareWarn: {
        'Matoya Nixie Crack': '5990',
        'Matoya Nixie Sputter': '5993',
    },
};
/* harmony default export */ const matoyas_relict = (matoyas_relict_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/mt_gulg.ts

const mt_gulg_triggerSet = {
    zoneId: zone_id/* default.MtGulg */.Z.MtGulg,
    damageWarn: {
        'Gulg Immolation': '41AA',
        'Gulg Tail Smash': '41AB',
        'Gulg Heavenslash': '41A9',
        'Gulg Typhoon Wing 1': '3D00',
        'Gulg Typhoon Wing 2': '3D01',
        'Gulg Hurricane Wing': '3D03',
        'Gulg Earth Shaker': '37F5',
        'Gulg Sanctification': '41AE',
        'Gulg Exegesis': '3D07',
        'Gulg Perfect Contrition': '3D0E',
        'Gulg Sanctified Aero': '41AD',
        'Gulg Divine Diminuendo 1': '3D16',
        'Gulg Divine Diminuendo 2': '3D18',
        'Gulg Divine Diminuendo 3': '4669',
        'Gulg Divine Diminuendo 4': '3D19',
        'Gulg Divine Diminuendo 5': '3D21',
        'Gulg Conviction Marcato 1': '3D1A',
        'Gulg Conviction Marcato 2': '3D1B',
        'Gulg Conviction Marcato 3': '3D20',
        'Gulg Vena Amoris': '3D27',
    },
    damageFail: {
        'Gulg Lumen Infinitum': '41B2',
        'Gulg Right Palm': '37F8',
        'Gulg Left Palm': '37FA',
    },
};
/* harmony default export */ const mt_gulg = (mt_gulg_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/paglthan.ts

// TODO: What to do about Kahn Rai 5B50?
// It seems impossible for the marked person to avoid entirely.
const paglthan_triggerSet = {
    zoneId: zone_id/* default.Paglthan */.Z.Paglthan,
    damageWarn: {
        'Paglthan Telovouivre Plague Swipe': '60FC',
        'Paglthan Lesser Telodragon Engulfing Flames': '60F5',
        'Paglthan Amhuluk Lightning Bolt': '5C4C',
        'Paglthan Amhuluk Ball Of Levin Shock': '5C52',
        'Paglthan Amhuluk Supercharged Ball Of Levin Shock': '5C53',
        'Paglthan Amhuluk Wide Blaster': '60C5',
        'Paglthan Telobrobinyak Fall Of Man': '6148',
        'Paglthan Telotek Reaper Magitek Cannon': '6121',
        'Paglthan Telodragon Sheet of Ice': '60F8',
        'Paglthan Telodragon Frost Breath': '60F7',
        'Paglthan Magitek Core Stable Cannon': '5C94',
        'Paglthan Magitek Core 2-Tonze Magitek Missile': '5C95',
        'Paglthan Telotek Sky Armor Aethershot': '5C9C',
        'Paglthan Mark II Telotek Colossus Exhaust': '5C99',
        'Paglthan Magitek Missile Explosive Force': '5C98',
        'Paglthan Tiamat Flamisphere': '610F',
        'Paglthan Armored Telodragon Tortoise Stomp': '614B',
        'Paglthan Telodragon Thunderous Breath': '6149',
        'Paglthan Lunar Bahamut Lunar Nail Upburst': '605B',
        'Paglthan Lunar Bahamut Lunar Nail Big Burst': '5B48',
        'Paglthan Lunar Bahamut Perigean Breath': '5B59',
        'Paglthan Lunar Bahamut Megaflare': '5B4E',
        'Paglthan Lunar Bahamut Megaflare Dive': '5B52',
        'Paglthan Lunar Bahamut Lunar Flare': '5B4A',
    },
    shareWarn: {
        'Paglthan Lunar Bahamut Megaflare': '5B4D',
    },
};
/* harmony default export */ const paglthan = (paglthan_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/qitana_ravel.ts

const qitana_ravel_triggerSet = {
    zoneId: zone_id/* default.TheQitanaRavel */.Z.TheQitanaRavel,
    damageWarn: {
        'Qitana Sun Toss': '3C8A',
        'Qitana Ronkan Light 1': '3C8C',
        'Qitana Lozatl\'s Fury 1': '3C8F',
        'Qitana Lozatl\'s Fury 2': '3C90',
        'Qitana Falling Rock': '3C96',
        'Qitana Falling Boulder': '3C97',
        'Qitana Towerfall': '3C98',
        'Qitana Viper Poison 2': '3C9E',
        'Qitana Confession of Faith 1': '3CA2',
        'Qitana Confession of Faith 3': '3CA6',
        'Qitana Confession of Faith 4': '3CA7',
        'Qitana Ronkan Light 2': '3D6D',
        'Qitana Wrath of the Ronka': '3E2C',
        'Qitana Sinspitter': '3E36',
        'Qitana Hound out of Heaven': '42B8',
        'Qitana Ronkan Abyss': '43EB',
    },
    shareWarn: {
        'Qitana Viper Poison 1': '3C9D',
        'Qitana Confession of Faith 2': '3CA3',
    },
};
/* harmony default export */ const qitana_ravel = (qitana_ravel_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/the_grand_cosmos.ts

// The Grand Cosmos
const the_grand_cosmos_triggerSet = {
    zoneId: zone_id/* default.TheGrandCosmos */.Z.TheGrandCosmos,
    damageWarn: {
        'Cosmos Iron Justice': '491F',
        'Cosmos Smite Of Rage': '4921',
        'Cosmos Tribulation': '49A4',
        'Cosmos Dark Shock': '476F',
        'Cosmos Sweep': '4770',
        'Cosmos Deep Clean': '4771',
        'Cosmos Shadow Burst': '4924',
        'Cosmos Bloody Caress': '4927',
        'Cosmos Nepenthic Plunge': '4928',
        'Cosmos Brewing Storm': '4929',
        'Cosmos Ode To Fallen Petals': '4950',
        'Cosmos Far Wind Ground': '4273',
        'Cosmos Fire Breath': '492B',
        'Cosmos Ronkan Freeze': '492E',
        'Cosmos Overpower': '492D',
        'Cosmos Scorching Left': '4763',
        'Cosmos Scorching Right': '4762',
        'Cosmos Otherwordly Heat': '475C',
        'Cosmos Fire\'s Ire': '4761',
        'Cosmos Plummet': '4767',
        'Cosmos Fire\'s Domain Tether': '475F',
    },
    shareWarn: {
        'Cosmos Dark Well': '476D',
        'Cosmos Far Wind Spread': '4724',
        'Cosmos Black Flame': '475D',
        'Cosmos Fire\'s Domain': '4760',
    },
};
/* harmony default export */ const the_grand_cosmos = (the_grand_cosmos_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/dungeon/twinning.ts

const twinning_triggerSet = {
    zoneId: zone_id/* default.TheTwinning */.Z.TheTwinning,
    damageWarn: {
        'Twinning Auto Cannons': '43A9',
        'Twinning Heave': '3DB9',
        'Twinning 32 Tonze Swipe': '3DBB',
        'Twinning Sideswipe': '3DBF',
        'Twinning Wind Spout': '3DBE',
        'Twinning Shock': '3DF1',
        'Twinning Laserblade': '3DEC',
        'Twinning Vorpal Blade': '3DC2',
        'Twinning Thrown Flames': '3DC3',
        'Twinning Magitek Ray': '3DF3',
        'Twinning High Gravity': '3DFA',
    },
    damageFail: {
        'Twinning 128 Tonze Swipe': '3DBA',
    },
};
/* harmony default export */ const twinning = (twinning_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/eureka/delubrum_reginae.ts



// TODO: Dead Iron 5AB0 (earthshakers, but only if you take two?)
const delubrum_reginae_triggerSet = {
    zoneId: zone_id/* default.DelubrumReginae */.Z.DelubrumReginae,
    damageWarn: {
        'Delubrum Seeker Mercy Fourfold': '5B34',
        'Delubrum Seeker Baleful Swathe': '5AB4',
        'Delubrum Seeker Baleful Blade': '5B28',
        'Delubrum Seeker Iron Splitter Blue 1': '5AA4',
        'Delubrum Seeker Iron Splitter Blue 2': '5AA5',
        'Delubrum Seeker Iron Splitter Blue 3': '5AA6',
        'Delubrum Seeker Iron Splitter White 1': '5AA7',
        'Delubrum Seeker Iron Splitter White 2': '5AA8',
        'Delubrum Seeker Iron Splitter White 3': '5AA9',
        'Delubrum Seeker Scorching Shackle': '5AAE',
        'Delubrum Seeker Merciful Breeze': '5AAB',
        'Delubrum Seeker Merciful Blooms': '5AAD',
        'Delubrum Dahu Right-Sided Shockwave': '5761',
        'Delubrum Dahu Left-Sided Shockwave': '5762',
        'Delubrum Dahu Firebreathe': '5765',
        'Delubrum Dahu Firebreathe Rotating': '575A',
        'Delubrum Dahu Head Down': '5756',
        'Delubrum Dahu Hunter\'s Claw': '5757',
        'Delubrum Dahu Falling Rock': '575C',
        'Delubrum Dahu Hot Charge': '5764',
        'Delubrum Dahu Ripper Claw': '575D',
        'Delubrum Dahu Tail Swing': '575F',
        'Delubrum Guard Pawn Off': '5806',
        'Delubrum Guard Turret\'s Tour 1': '580D',
        'Delubrum Guard Turret\'s Tour 2': '580E',
        'Delubrum Guard Turret\'s Tour 3': '580F',
        'Delubrum Guard Optimal Play Shield': '57F3',
        'Delubrum Guard Optimal Play Sword': '57F2',
        'Delubrum Guard Counterplay': '57F6',
        'Delubrum Phantom Swirling Miasma 1': '57A9',
        'Delubrum Phantom Swirling Miasma 2': '57AA',
        'Delubrum Phantom Creeping Miasma': '57A5',
        'Delubrum Phantom Vile Wave': '57B1',
        'Delubrum Avowed Fury Of Bozja': '5973',
        'Delubrum Avowed Flashvane': '5972',
        'Delubrum Avowed Infernal Slash': '5971',
        'Delubrum Avowed Flames Of Bozja': '5968',
        'Delubrum Avowed Gleaming Arrow': '5974',
        'Delubrum Queen The Means 1': '59BB',
        'Delubrum Queen The Means 2': '59BD',
        'Delubrum Queen The End 1': '59BA',
        'Delubrum Queen The End 2': '59BC',
        'Delubrum Queen Northswain\'s Glow': '59C4',
        'Delubrum Queen Judgment Blade Left': '5B83',
        'Delubrum Queen Judgment Blade Right': '5B83',
        'Delubrum Queen Queen\'s Justice': '59BF',
        'Delubrum Queen Turret\'s Tour 1': '59E0',
        'Delubrum Queen Turret\'s Tour 2': '59E1',
        'Delubrum Queen Turret\'s Tour 3': '59E2',
        'Delubrum Queen Pawn Off': '59DA',
        'Delubrum Queen Optimal Play Shield': '59CE',
        'Delubrum Queen Optimal Play Sword': '59CC',
    },
    damageFail: {
        'Delubrum Hidden Trap Massive Explosion': '5A6E',
        'Delubrum Hidden Trap Poison Trap': '5A6F',
        'Delubrum Avowed Heat Shock': '595E',
        'Delubrum Avowed Cold Shock': '595F',
    },
    gainsEffectWarn: {
        'Delubrum Seeker Merciful Moon': '262',
    },
    shareFail: {
        'Delubrum Dahu Heat Breath': '5766',
        'Delubrum Avowed Wrath Of Bozja': '5975',
    },
    triggers: [
        {
            // At least during The Queen, these ability ids can be ordered differently,
            // and the first explosion "hits" everyone, although with "1B" flags.
            id: 'Delubrum Lots Cast',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['565A', '565B', '57FD', '57FE', '5B86', '5B87', '59D2', '5D93'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (_data, matches) => matches.flags.slice(-2) === '03',
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const delubrum_reginae = (delubrum_reginae_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/eureka/delubrum_reginae_savage.ts



// TODO: Dahu 5776 Spit Flame should always hit a Marchosias
// TODO: hitting phantom with ice spikes with anything but dispel?
// TODO: failing icy/fiery portent (guard and queen)
//       `18:Pyretic DoT Tick on ${name} for ${damage} damage.`
// TODO: Winds Of Fate / Weight Of Fortune?
// TODO: Turret's Tour?
// general traps: explosion: 5A71, poison trap: 5A72, mini: 5A73
// duel traps: mini: 57A1, ice: 579F, toad: 57A0
// TODO: taking mana flame without reflect
// TODO: taking Maelstrom's Bolt without lightning buff
const delubrum_reginae_savage_triggerSet = {
    zoneId: zone_id/* default.DelubrumReginaeSavage */.Z.DelubrumReginaeSavage,
    damageWarn: {
        'DelubrumSav Seeker Slimes Hellish Slash': '57EA',
        'DelubrumSav Seeker Slimes Viscous Rupture': '5016',
        'DelubrumSav Seeker Golems Demolish': '5880',
        'DelubrumSav Seeker Baleful Swathe': '5AD1',
        'DelubrumSav Seeker Baleful Blade': '5B2A',
        'DelubrumSav Seeker Scorching Shackle': '5ACB',
        'DelubrumSav Seeker Mercy Fourfold 1': '5B94',
        'DelubrumSav Seeker Mercy Fourfold 2': '5AB9',
        'DelubrumSav Seeker Mercy Fourfold 3': '5ABA',
        'DelubrumSav Seeker Mercy Fourfold 4': '5ABB',
        'DelubrumSav Seeker Mercy Fourfold 5': '5ABC',
        'DelubrumSav Seeker Merciful Breeze': '5AC8',
        'DelubrumSav Seeker Baleful Comet': '5AD7',
        'DelubrumSav Seeker Baleful Firestorm': '5AD8',
        'DelubrumSav Seeker Iron Rose': '5AD9',
        'DelubrumSav Seeker Iron Splitter Blue 1': '5AC1',
        'DelubrumSav Seeker Iron Splitter Blue 2': '5AC2',
        'DelubrumSav Seeker Iron Splitter Blue 3': '5AC3',
        'DelubrumSav Seeker Iron Splitter White 1': '5AC4',
        'DelubrumSav Seeker Iron Splitter White 2': '5AC5',
        'DelubrumSav Seeker Iron Splitter White 3': '5AC6',
        'DelubrumSav Seeker Act Of Mercy': '5ACF',
        'DelubrumSav Dahu Right-Sided Shockwave 1': '5770',
        'DelubrumSav Dahu Right-Sided Shockwave 2': '5772',
        'DelubrumSav Dahu Left-Sided Shockwave 1': '576F',
        'DelubrumSav Dahu Left-Sided Shockwave 2': '5771',
        'DelubrumSav Dahu Firebreathe': '5774',
        'DelubrumSav Dahu Firebreathe Rotating': '576C',
        'DelubrumSav Dahu Head Down': '5768',
        'DelubrumSav Dahu Hunter\'s Claw': '5769',
        'DelubrumSav Dahu Falling Rock': '576E',
        'DelubrumSav Dahu Hot Charge': '5773',
        'DelubrumSav Duel Massive Explosion': '579E',
        'DelubrumSav Duel Vicious Swipe': '5797',
        'DelubrumSav Duel Focused Tremor 1': '578F',
        'DelubrumSav Duel Focused Tremor 2': '5791',
        'DelubrumSav Duel Devour': '5789',
        'DelubrumSav Duel Flailing Strike 1': '578C',
        'DelubrumSav Duel Flailing Strike 2': '578D',
        'DelubrumSav Guard Optimal Offensive Sword': '5819',
        'DelubrumSav Guard Optimal Offensive Shield': '581A',
        'DelubrumSav Guard Optimal Play Sword': '5816',
        'DelubrumSav Guard Optimal Play Shield': '5817',
        'DelubrumSav Guard Optimal Play Cleave': '5818',
        'DelubrumSav Guard Unlucky Lot': '581D',
        'DelubrumSav Guard Burn 1': '583D',
        'DelubrumSav Guard Burn 2': '583E',
        'DelubrumSav Guard Pawn Off': '583A',
        'DelubrumSav Guard Turret\'s Tour Normal 1': '5847',
        'DelubrumSav Guard Turret\'s Tour Normal 2': '5848',
        'DelubrumSav Guard Turret\'s Tour Normal 3': '5849',
        'DelubrumSav Guard Counterplay': '58F5',
        'DelubrumSav Phantom Swirling Miasma 1': '57B8',
        'DelubrumSav Phantom Swirling Miasma 2': '57B9',
        'DelubrumSav Phantom Creeping Miasma 1': '57B4',
        'DelubrumSav Phantom Creeping Miasma 2': '57B5',
        'DelubrumSav Phantom Lingering Miasma 1': '57B6',
        'DelubrumSav Phantom Lingering Miasma 2': '57B7',
        'DelubrumSav Phantom Vile Wave': '57BF',
        'DelubrumSav Avowed Fury Of Bozja': '594C',
        'DelubrumSav Avowed Flashvane': '594B',
        'DelubrumSav Avowed Infernal Slash': '594A',
        'DelubrumSav Avowed Flames Of Bozja': '5939',
        'DelubrumSav Avowed Gleaming Arrow': '594D',
        'DelubrumSav Lord Whack': '57D0',
        'DelubrumSav Lord Devastating Bolt 1': '57C5',
        'DelubrumSav Lord Devastating Bolt 2': '57C6',
        'DelubrumSav Lord Electrocution': '57CC',
        'DelubrumSav Lord Rapid Bolts': '57C3',
        'DelubrumSav Lord 1111-Tonze Swing': '57D8',
        'DelubrumSav Lord Monk Attack': '55A6',
        'DelubrumSav Queen Northswain\'s Glow': '59F4',
        'DelubrumSav Queen The Means 1': '59E7',
        'DelubrumSav Queen The Means 2': '59EA',
        'DelubrumSav Queen The End 1': '59E8',
        'DelubrumSav Queen The End 2': '59E9',
        'DelubrumSav Queen Optimal Offensive Sword': '5A02',
        'DelubrumSav Queen Optimal Offensive Shield': '5A03',
        'DelubrumSav Queen Judgment Blade Left 1': '59F2',
        'DelubrumSav Queen Judgment Blade Left 2': '5B85',
        'DelubrumSav Queen Judgment Blade Right 1': '59F1',
        'DelubrumSav Queen Judgment Blade Right 2': '5B84',
        'DelubrumSav Queen Pawn Off': '5A1D',
        'DelubrumSav Queen Optimal Play Sword': '59FF',
        'DelubrumSav Queen Optimal Play Shield': '5A00',
        'DelubrumSav Queen Optimal Play Cleave': '5A01',
        'DelubrumSav Queen Turret\'s Tour Normal 1': '5A28',
        'DelubrumSav Queen Turret\'s Tour Normal 2': '5A2A',
        'DelubrumSav Queen Turret\'s Tour Normal 3': '5A29',
    },
    damageFail: {
        'DelubrumSav Avowed Heat Shock': '5927',
        'DelubrumSav Avowed Cold Shock': '5928',
        'DelubrumSav Queen Queen\'s Justice': '59EB',
        'DelubrumSav Queen Gunnhildr\'s Blades': '5B22',
        'DelubrumSav Queen Unlucky Lot': '55B6',
    },
    gainsEffectWarn: {
        'DelubrumSav Seeker Merciful Moon': '262',
    },
    shareWarn: {
        'DelubrumSav Seeker Phantom Baleful Onslaught': '5AD6',
        'DelubrumSav Lord Foe Splitter': '57D7',
    },
    triggers: [
        {
            // These ability ids can be ordered differently and "hit" people when levitating.
            id: 'DelubrumSav Guard Lots Cast',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['5827', '5828', '5B6C', '5B6D', '5BB6', '5BB7', '5B88', '5B89'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (_data, matches) => matches.flags.slice(-2) === '03',
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'DelubrumSav Golem Compaction',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '5746' }),
            mistake: (_data, matches) => {
                return { type: 'fail', text: `${matches.source}: ${matches.ability}` };
            },
        },
        {
            id: 'DelubrumSav Slime Sanguine Fusion',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '554D' }),
            mistake: (_data, matches) => {
                return { type: 'fail', text: `${matches.source}: ${matches.ability}` };
            },
        },
    ],
};
/* harmony default export */ const delubrum_reginae_savage = (delubrum_reginae_savage_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e1n.ts

const e1n_triggerSet = {
    zoneId: zone_id/* default.EdensGateResurrection */.Z.EdensGateResurrection,
    damageWarn: {
        'E1N Eden\'s Thunder III': '44ED',
        'E1N Eden\'s Blizzard III': '44EC',
        'E1N Pure Beam': '3D9E',
        'E1N Paradise Lost': '3DA0',
    },
    damageFail: {
        'E1N Eden\'s Flare': '3D97',
        'E1N Pure Light': '3DA3',
    },
    shareFail: {
        'E1N Fire III': '44EB',
        'E1N Vice Of Vanity': '44E7',
        'E1N Vice Of Apathy': '44E8',
    },
};
/* harmony default export */ const e1n = (e1n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e1s.ts

// TODO: failing to interrupt Mana Boost (3D8D)
// TODO: failing to pass healer debuff?
// TODO: what happens if you don't kill a meteor during four orbs?
const e1s_triggerSet = {
    zoneId: zone_id/* default.EdensGateResurrectionSavage */.Z.EdensGateResurrectionSavage,
    damageWarn: {
        'E1S Eden\'s Thunder III': '44F7',
        'E1S Eden\'s Blizzard III': '44F6',
        'E1S Eden\'s Regained Blizzard III': '44FA',
        'E1S Pure Beam Trident 1': '3D83',
        'E1S Pure Beam Trident 2': '3D84',
        'E1S Paradise Lost': '3D87',
    },
    damageFail: {
        'E1S Eden\'s Flare': '3D73',
        'E1S Pure Light': '3D8A',
    },
    shareFail: {
        'E1S Fire/Thunder III': '44FB',
        'E1S Pure Beam Single': '3D81',
        'E1S Vice Of Vanity': '44F1',
        'E1S Vice of Apathy': '44F2',
    },
};
/* harmony default export */ const e1s = (e1s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e2n.ts



// TODO: shadoweye failure (top line fail, bottom line success, effect there too)
// [16:17:35.966] 16:400110FE:Voidwalker:40B7:Shadoweye:10612345:Tini Poutini:F:10000:100190F:
// [16:17:35.966] 16:400110FE:Voidwalker:40B7:Shadoweye:1067890A:Potato Chippy:1:0:1C:8000:
// gains the effect of Petrification from Voidwalker for 10.00 Seconds.
// TODO: puddle failure?
const e2n_triggerSet = {
    zoneId: zone_id/* default.EdensGateDescent */.Z.EdensGateDescent,
    damageWarn: {
        'E2N Doomvoid Slicer': '3E3C',
        'E2N Doomvoid Guillotine': '3E3B',
    },
    triggers: [
        {
            id: 'E2N Nyx',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '3E3D', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'Booped',
                        de: 'Nyx berührt',
                        fr: 'Malus de dégâts',
                        ja: matches.ability,
                        cn: matches.ability,
                        ko: '닉스',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e2n = (e2n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e2s.ts



// TODO: shadoweye failure
// TODO: Empty Hate (3E59/3E5A) hits everybody, so hard to tell about knockback
// TODO: maybe mark hell wind people who got clipped by stack?
// TODO: missing puddles?
// TODO: missing light/dark circle stack
const e2s_triggerSet = {
    zoneId: zone_id/* default.EdensGateDescentSavage */.Z.EdensGateDescentSavage,
    damageWarn: {
        'E2S Doomvoid Slicer': '3E50',
        'E3S Empty Rage': '3E6C',
        'E3S Doomvoid Guillotine': '3E4F',
    },
    shareWarn: {
        'E2S Doomvoid Cleaver': '3E64',
    },
    triggers: [
        {
            id: 'E2S Shadoweye',
            type: 'GainsEffect',
            // Stone Curse
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '589' }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'E2S Nyx',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '3E51', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (_data, matches) => {
                return {
                    type: 'warn',
                    blame: matches.target,
                    text: {
                        en: 'Booped',
                        de: 'Nyx berührt',
                        fr: 'Malus de dégâts',
                        ja: matches.ability,
                        cn: matches.ability,
                        ko: '닉스',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e2s = (e2s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e3n.ts

const e3n_triggerSet = {
    zoneId: zone_id/* default.EdensGateInundation */.Z.EdensGateInundation,
    damageWarn: {
        'E3N Monster Wave 1': '3FCA',
        'E3N Monster Wave 2': '3FE9',
        'E3N Maelstrom': '3FD9',
        'E3N Swirling Tsunami': '3FD5',
    },
    damageFail: {
        'E3N Temporary Current 1': '3FCE',
        'E3N Temporary Current 2': '3FCD',
        'E3N Spinning Dive': '3FDB',
    },
    shareFail: {
        'E3N Rip Current': '3FC7',
    },
};
/* harmony default export */ const e3n = (e3n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e3s.ts

// TODO: Scouring Tsunami (3CE0) on somebody other than target
// TODO: Sweeping Tsunami (3FF5) on somebody other than tanks
// TODO: Rip Current (3FE0, 3FE1) on somebody other than target/tanks
// TODO: Boiled Alive (4006) is failing puddles???
// TODO: failing to cleanse Splashing Waters
// TODO: does getting hit by undersea quake cause an ability?
const e3s_triggerSet = {
    zoneId: zone_id/* default.EdensGateInundationSavage */.Z.EdensGateInundationSavage,
    damageWarn: {
        'E3S Monster Wave 1': '3FE5',
        'E3S Monster Wave 2': '3FE9',
        'E3S Maelstrom': '3FFB',
        'E3S Swirling Tsunami': '3FF4',
    },
    damageFail: {
        'E3S Temporary Current 1': '3FEA',
        'E3S Temporary Current 2': '3FEB',
        'E3S Temporary Current 3': '3FEC',
        'E3S Temporary Current 4': '3FED',
        'E3S Spinning Dive': '3FFD',
    },
};
/* harmony default export */ const e3s = (e3s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e4n.ts

const e4n_triggerSet = {
    zoneId: zone_id/* default.EdensGateSepulture */.Z.EdensGateSepulture,
    damageWarn: {
        'E4N Weight of the Land': '40EB',
        'E4N Evil Earth': '40EF',
        'E4N Aftershock 1': '41B4',
        'E4N Aftershock 2': '40F0',
        'E4N Explosion 1': '40ED',
        'E4N Explosion 2': '40F5',
        'E4N Landslide': '411B',
        'E4N Rightward Landslide': '4100',
        'E4N Leftward Landslide': '40FF',
        'E4N Massive Landslide': '40FC',
        'E4N Seismic Wave': '40F3',
        'E4N Fault Line': '4101',
    },
};
/* harmony default export */ const e4n = (e4n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e4s.ts



// TODO: could track people get hitting by markers they shouldn't
// TODO: could track non-tanks getting hit by tankbusters, megaliths
// TODO: could track non-target getting hit by tankbuster
const e4s_triggerSet = {
    zoneId: zone_id/* default.EdensGateSepultureSavage */.Z.EdensGateSepultureSavage,
    damageWarn: {
        'E4S Weight of the Land': '4108',
        'E4S Evil Earth': '410C',
        'E4S Aftershock 1': '41B5',
        'E4S Aftershock 2': '410D',
        'E4S Explosion': '410A',
        'E4S Landslide': '411B',
        'E4S Rightward Landslide': '411D',
        'E4S Leftward Landslide': '411C',
        'E4S Massive Landslide 1': '4118',
        'E4S Massive Landslide 2': '4119',
        'E4S Seismic Wave': '4110',
    },
    damageFail: {
        'E4S Dual Earthen Fists 1': '4135',
        'E4S Dual Earthen Fists 2': '4687',
        'E4S Plate Fracture': '43EA',
        'E4S Earthen Fist 1': '43CA',
        'E4S Earthen Fist 2': '43C9',
    },
    triggers: [
        {
            id: 'E4S Fault Line Collect',
            type: 'StartsUsing',
            netRegex: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: 'Titan' }),
            netRegexDe: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: 'Titan' }),
            netRegexFr: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: 'Titan' }),
            netRegexJa: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: 'タイタン' }),
            netRegexCn: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: '泰坦' }),
            netRegexKo: netregexes/* default.startsUsing */.Z.startsUsing({ id: '411E', source: '타이탄' }),
            run: (data, matches) => {
                data.faultLineTarget = matches.target;
            },
        },
        {
            id: 'E4S Fault Line',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '411E', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.faultLineTarget !== matches.target,
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: 'Run Over',
                        de: 'Wurde überfahren',
                        fr: 'A été écrasé(e)',
                        ja: matches.ability,
                        cn: matches.ability,
                        ko: matches.ability,
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e4s = (e4s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e5n.ts



const e5n_triggerSet = {
    zoneId: zone_id/* default.EdensVerseFulmination */.Z.EdensVerseFulmination,
    damageWarn: {
        'E5N Impact': '4E3A',
        'E5N Lightning Bolt': '4B9C',
        'E5N Gallop': '4B97',
        'E5N Shock Strike': '4BA1',
        'E5N Volt Strike': '4CF2',
    },
    damageFail: {
        'E5N Judgment Jolt': '4B8F',
    },
    triggers: [
        {
            // This happens when a player gets 4+ stacks of orbs. Don't be greedy!
            id: 'E5N Static Condensation',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8B5' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            // Helper for orb pickup failures
            id: 'E5N Orb Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8B4' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasOrb) !== null && _a !== void 0 ? _a : (data.hasOrb = {});
                data.hasOrb[matches.target] = true;
            },
        },
        {
            id: 'E5N Orb Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8B4' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasOrb) !== null && _a !== void 0 ? _a : (data.hasOrb = {});
                data.hasOrb[matches.target] = false;
            },
        },
        {
            id: 'E5N Divine Judgement Volts',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4B9A', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: `${matches.ability} (no orb)`,
                        de: `${matches.ability} (kein Orb)`,
                        fr: `${matches.ability} (pas d'orbe)`,
                        ja: `${matches.ability} (雷玉無し)`,
                        cn: `${matches.ability} (没吃球)`,
                    },
                };
            },
        },
        {
            id: 'E5N Stormcloud Target Tracking',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({ id: '006E' }),
            run: (data, matches) => {
                var _a;
                (_a = data.cloudMarkers) !== null && _a !== void 0 ? _a : (data.cloudMarkers = []);
                data.cloudMarkers.push(matches.target);
            },
        },
        {
            // This ability is seen only if players stacked the clouds instead of spreading them.
            id: 'E5N The Parting Clouds',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4B9D', ...oopsy_common/* playerDamageFields */.np }),
            suppressSeconds: 30,
            mistake: (data, matches) => {
                var _a;
                for (const name of (_a = data.cloudMarkers) !== null && _a !== void 0 ? _a : []) {
                    return {
                        type: 'fail',
                        blame: name,
                        text: {
                            en: `${matches.ability} (clouds too close)`,
                            de: `${matches.ability} (Wolken zu nahe)`,
                            fr: `${matches.ability} (nuages trop proches)`,
                            ja: `${matches.ability} (雲近すぎ)`,
                            cn: `${matches.ability} (雷云重叠)`,
                        },
                    };
                }
            },
        },
        {
            id: 'E5N Stormcloud cleanup',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({ id: '006E' }),
            delaySeconds: 30,
            run: (data) => {
                delete data.cloudMarkers;
            },
        },
    ],
};
/* harmony default export */ const e5n = (e5n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e5s.ts



// TODO: is there a different ability if the shield duty action isn't used properly?
// TODO: is there an ability from Raiden (the bird) if you get eaten?
// TODO: maybe chain lightning warning if you get hit while you have system shock (8B8)
const noOrb = (str) => {
    return {
        en: str + ' (no orb)',
        de: str + ' (kein Orb)',
        fr: str + ' (pas d\'orbe)',
        ja: str + ' (雷玉無し)',
        cn: str + ' (没吃球)',
        ko: str + ' (구슬 없음)',
    };
};
const e5s_triggerSet = {
    zoneId: zone_id/* default.EdensVerseFulminationSavage */.Z.EdensVerseFulminationSavage,
    damageWarn: {
        'E5S Impact': '4E3B',
        'E5S Gallop': '4BB4',
        'E5S Shock Strike': '4BC1',
        'E5S Stepped Leader Twister': '4BC7',
        'E5S Stepped Leader Donut': '4BC8',
        'E5S Shock': '4E3D',
    },
    damageFail: {
        'E5S Judgment Jolt': '4BA7',
    },
    shareWarn: {
        'E5S Volt Strike Double': '4BC3',
        'E5S Crippling Blow': '4BCA',
        'E5S Chain Lightning Double': '4BC5',
    },
    triggers: [
        {
            // Helper for orb pickup failures
            id: 'E5S Orb Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8B4' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasOrb) !== null && _a !== void 0 ? _a : (data.hasOrb = {});
                data.hasOrb[matches.target] = true;
            },
        },
        {
            id: 'E5S Orb Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8B4' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasOrb) !== null && _a !== void 0 ? _a : (data.hasOrb = {});
                data.hasOrb[matches.target] = false;
            },
        },
        {
            id: 'E5S Divine Judgement Volts',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4BB7', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: noOrb(matches.ability) };
            },
        },
        {
            id: 'E5S Volt Strike Orb',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4BC3', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: noOrb(matches.ability) };
            },
        },
        {
            id: 'E5S Deadly Discharge Big Knockback',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4BB2', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => !data.hasOrb || !data.hasOrb[matches.target],
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: noOrb(matches.ability) };
            },
        },
        {
            id: 'E5S Lightning Bolt',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4BB9', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => {
                // Having a non-idempotent condition function is a bit <_<
                // Only consider lightning bolt damage if you have a debuff to clear.
                if (!data.hated || !data.hated[matches.target])
                    return true;
                delete data.hated[matches.target];
                return false;
            },
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'E5S Hated of Levin',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({ id: '00D2' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hated) !== null && _a !== void 0 ? _a : (data.hated = {});
                data.hated[matches.target] = true;
            },
        },
        {
            id: 'E5S Stormcloud Target Tracking',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({ id: '006E' }),
            run: (data, matches) => {
                var _a;
                (_a = data.cloudMarkers) !== null && _a !== void 0 ? _a : (data.cloudMarkers = []);
                data.cloudMarkers.push(matches.target);
            },
        },
        {
            // This ability is seen only if players stacked the clouds instead of spreading them.
            id: 'E5S The Parting Clouds',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4BBA', ...oopsy_common/* playerDamageFields */.np }),
            suppressSeconds: 30,
            mistake: (data, matches) => {
                var _a;
                for (const name of (_a = data.cloudMarkers) !== null && _a !== void 0 ? _a : []) {
                    return {
                        type: 'fail',
                        blame: name,
                        text: {
                            en: `${matches.ability} (clouds too close)`,
                            de: `${matches.ability} (Wolken zu nahe)`,
                            fr: `${matches.ability} (nuages trop proches)`,
                            ja: `${matches.ability} (雲近すぎ)`,
                            cn: `${matches.ability} (雷云重叠)`,
                        },
                    };
                }
            },
        },
        {
            id: 'E5S Stormcloud cleanup',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({ id: '006E' }),
            // Stormclouds resolve well before this.
            delaySeconds: 30,
            run: (data) => {
                delete data.cloudMarkers;
                delete data.hated;
            },
        },
    ],
};
/* harmony default export */ const e5s = (e5s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e6n.ts

const e6n_triggerSet = {
    zoneId: zone_id/* default.EdensVerseFuror */.Z.EdensVerseFuror,
    damageWarn: {
        'E6N Thorns': '4BDA',
        'E6N Ferostorm 1': '4BDD',
        'E6N Ferostorm 2': '4BE5',
        'E6N Storm Of Fury 1': '4BE0',
        'E6N Storm Of Fury 2': '4BE6',
        'E6N Explosion': '4BE2',
        'E6N Heat Burst': '4BEC',
        'E6N Conflag Strike': '4BEE',
        'E6N Spike Of Flame': '4BF0',
        'E6N Radiant Plume': '4BF2',
        'E6N Eruption': '4BF4',
    },
    damageFail: {
        'E6N Vacuum Slice': '4BD5',
        'E6N Downburst': '4BDB',
    },
    shareFail: {
        // Kills non-tanks who get hit by it.
        'E6N Instant Incineration': '4BED',
    },
};
/* harmony default export */ const e6n = (e6n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e6s.ts

// TODO: check tethers being cut (when they shouldn't)
// TODO: check for concussed debuff
// TODO: check for taking tankbuster with lightheaded
// TODO: check for one person taking multiple Storm Of Fury Tethers (4C01/4C08)
const e6s_triggerSet = {
    zoneId: zone_id/* default.EdensVerseFurorSavage */.Z.EdensVerseFurorSavage,
    damageWarn: {
        // It's common to just ignore futbol mechanics, so don't warn on Strike Spark.
        // 'Spike Of Flame': '4C13', // Orb explosions after Strike Spark
        'E6S Thorns': '4BFA',
        'E6S Ferostorm 1': '4BFD',
        'E6S Ferostorm 2': '4C06',
        'E6S Storm Of Fury 1': '4C00',
        'E6S Storm Of Fury 2': '4C07',
        'E6S Explosion': '4C03',
        'E6S Heat Burst': '4C1F',
        'E6S Conflag Strike': '4C10',
        'E6S Radiant Plume': '4C15',
        'E6S Eruption': '4C17',
        'E6S Wind Cutter': '4C02',
    },
    damageFail: {
        'E6S Vacuum Slice': '4BF5',
        'E6S Downburst 1': '4BFB',
        'E6S Downburst 2': '4BFC',
        'E6S Meteor Strike': '4C0F',
    },
    shareWarn: {
        'E6S Hands of Hell': '4C0[BC]',
        'E6S Hands of Flame': '4C0A',
        'E6S Instant Incineration': '4C0E',
        'E6S Blaze': '4C1B',
    },
    soloFail: {
        'E6S Air Bump': '4BF9',
    },
};
/* harmony default export */ const e6s = (e6s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e7n.ts



const wrongBuff = (str) => {
    return {
        en: str + ' (wrong buff)',
        de: str + ' (falscher Buff)',
        fr: str + ' (mauvais buff)',
        ja: str + ' (不適切なバフ)',
        cn: str + ' (Buff错了)',
        ko: str + ' (버프 틀림)',
    };
};
const noBuff = (str) => {
    return {
        en: str + ' (no buff)',
        de: str + ' (kein Buff)',
        fr: str + ' (pas de buff)',
        ja: str + ' (バフ無し)',
        cn: str + ' (没有Buff)',
        ko: str + '(버프 없음)',
    };
};
const e7n_triggerSet = {
    zoneId: zone_id/* default.EdensVerseIconoclasm */.Z.EdensVerseIconoclasm,
    damageWarn: {
        'E7N Stygian Sword': '4C55',
        'E7N Strength In Numbers Donut': '4C4C',
        'E7N Strength In Numbers 2': '4C4D',
    },
    shareWarn: {
        'E7N Stygian Stake': '4C33',
        'E5N Silver Shot': '4E7D',
    },
    triggers: [
        {
            id: 'E7N Astral Effect Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8BE' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasAstral) !== null && _a !== void 0 ? _a : (data.hasAstral = {});
                data.hasAstral[matches.target] = true;
            },
        },
        {
            id: 'E7N Astral Effect Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8BE' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasAstral) !== null && _a !== void 0 ? _a : (data.hasAstral = {});
                data.hasAstral[matches.target] = false;
            },
        },
        {
            id: 'E7N Umbral Effect Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8BF' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasUmbral) !== null && _a !== void 0 ? _a : (data.hasUmbral = {});
                data.hasUmbral[matches.target] = true;
            },
        },
        {
            id: 'E7N Umbral Effect Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8BF' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasUmbral) !== null && _a !== void 0 ? _a : (data.hasUmbral = {});
                data.hasUmbral[matches.target] = false;
            },
        },
        {
            id: 'E7N Light\'s Course',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['4C3E', '4C40', '4C22', '4C3C', '4E63'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => {
                return !data.hasUmbral || !data.hasUmbral[matches.target];
            },
            mistake: (data, matches) => {
                if (data.hasAstral && data.hasAstral[matches.target])
                    return { type: 'fail', blame: matches.target, text: wrongBuff(matches.ability) };
                return { type: 'warn', blame: matches.target, text: noBuff(matches.ability) };
            },
        },
        {
            id: 'E7N Darks\'s Course',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['4C3D', '4C23', '4C41', '4C43'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => {
                return !data.hasAstral || !data.hasAstral[matches.target];
            },
            mistake: (data, matches) => {
                if (data.hasUmbral && data.hasUmbral[matches.target])
                    return { type: 'fail', blame: matches.target, text: wrongBuff(matches.ability) };
                // This case is probably impossible, as the debuff ticks after death,
                // but leaving it here in case there's some rez or disconnect timing
                // that could lead to this.
                return { type: 'warn', blame: matches.target, text: noBuff(matches.ability) };
            },
        },
    ],
};
/* harmony default export */ const e7n = (e7n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e7s.ts



// TODO: missing an orb during tornado phase
// TODO: jumping in the tornado damage??
// TODO: taking sungrace(4C80) or moongrace(4C82) with wrong debuff
// TODO: stygian spear/silver spear with the wrong debuff
// TODO: taking explosion from the wrong Chiaro/Scuro orb
// TODO: handle 4C89 Silver Stake tankbuster 2nd hit, as it's ok to have two in.
const e7s_wrongBuff = (str) => {
    return {
        en: str + ' (wrong buff)',
        de: str + ' (falscher Buff)',
        fr: str + ' (mauvais buff)',
        ja: str + ' (不適切なバフ)',
        cn: str + ' (Buff错了)',
        ko: str + ' (버프 틀림)',
    };
};
const e7s_noBuff = (str) => {
    return {
        en: str + ' (no buff)',
        de: str + ' (kein Buff)',
        fr: str + ' (pas de buff)',
        ja: str + ' (バフ無し)',
        cn: str + ' (没有Buff)',
        ko: str + ' (버프 없음)',
    };
};
const e7s_triggerSet = {
    zoneId: zone_id/* default.EdensVerseIconoclasmSavage */.Z.EdensVerseIconoclasmSavage,
    damageWarn: {
        'E7S Silver Sword': '4C8E',
        'E7S Overwhelming Force': '4C73',
        'E7S Strength in Numbers 1': '4C70',
        'E7S Strength in Numbers 2': '4C71',
        'E7S Paper Cut': '4C7D',
        'E7S Buffet': '4C77',
    },
    damageFail: {
        'E7S Betwixt Worlds': '4C6B',
        'E7S Crusade': '4C58',
        'E7S Explosion': '4C6F',
    },
    shareWarn: {
        'E7S Stygian Stake': '4C34',
        'E7S Silver Shot': '4C92',
        'E7S Silver Scourge': '4C93',
        'E7S Chiaro Scuro Explosion 1': '4D14',
        'E7S Chiaro Scuro Explosion 2': '4D15',
    },
    triggers: [
        {
            // Interrupt
            id: 'E7S Advent Of Light',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '4C6E' }),
            mistake: (_data, matches) => {
                // TODO: is this blame correct? does this have a target?
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'E7S Astral Effect Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8BE' }),
            run: (data, matches) => {
                data.hasAstral = data.hasAstral || {};
                data.hasAstral[matches.target] = true;
            },
        },
        {
            id: 'E7S Astral Effect Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8BE' }),
            run: (data, matches) => {
                data.hasAstral = data.hasAstral || {};
                data.hasAstral[matches.target] = false;
            },
        },
        {
            id: 'E7S Umbral Effect Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8BF' }),
            run: (data, matches) => {
                data.hasUmbral = data.hasUmbral || {};
                data.hasUmbral[matches.target] = true;
            },
        },
        {
            id: 'E7S Umbral Effect Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '8BF' }),
            run: (data, matches) => {
                data.hasUmbral = data.hasUmbral || {};
                data.hasUmbral[matches.target] = false;
            },
        },
        {
            id: 'E7S Light\'s Course',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['4C62', '4C63', '4C64', '4C5B', '4C5F'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => {
                return !data.hasUmbral || !data.hasUmbral[matches.target];
            },
            mistake: (data, matches) => {
                if (data.hasAstral && data.hasAstral[matches.target])
                    return { type: 'fail', blame: matches.target, text: e7s_wrongBuff(matches.ability) };
                return { type: 'warn', blame: matches.target, text: e7s_noBuff(matches.ability) };
            },
        },
        {
            id: 'E7S Darks\'s Course',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['4C65', '4C66', '4C67', '4C5A', '4C60'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => {
                return !data.hasAstral || !data.hasAstral[matches.target];
            },
            mistake: (data, matches) => {
                if (data.hasUmbral && data.hasUmbral[matches.target])
                    return { type: 'fail', blame: matches.target, text: e7s_wrongBuff(matches.ability) };
                // This case is probably impossible, as the debuff ticks after death,
                // but leaving it here in case there's some rez or disconnect timing
                // that could lead to this.
                return { type: 'warn', blame: matches.target, text: e7s_noBuff(matches.ability) };
            },
        },
        {
            id: 'E7S Crusade Knockback',
            type: 'Ability',
            // 4C76 is the knockback damage, 4C58 is the damage for standing on the puck.
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4C76', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e7s = (e7s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e8n.ts



const e8n_triggerSet = {
    zoneId: zone_id/* default.EdensVerseRefulgence */.Z.EdensVerseRefulgence,
    damageWarn: {
        'E8N Biting Frost': '4DDB',
        'E8N Driving Frost': '4DDC',
        'E8N Frigid Stone': '4E66',
        'E8N Reflected Axe Kick': '4E00',
        'E8N Reflected Scythe Kick': '4E01',
        'E8N Frigid Eruption': '4E09',
        'E8N Icicle Impact': '4E0A',
        'E8N Axe Kick': '4DE2',
        'E8N Scythe Kick': '4DE3',
        'E8N Reflected Biting Frost': '4DFE',
        'E8N Reflected Driving Frost': '4DFF',
    },
    damageFail: {},
    triggers: [
        {
            id: 'E8N Shining Armor',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '95' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'E8N Heavenly Strike',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4DD8', ...oopsy_common/* playerDamageFields */.np }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Pushed off!',
                        de: 'Runter gestoßen!',
                        fr: 'A été poussé(e) !',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백됨!',
                    },
                };
            },
        },
        {
            id: 'E8N Frost Armor',
            type: 'GainsEffect',
            // Thin Ice
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '38F' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Slid off!',
                        de: 'runtergerutscht!',
                        fr: 'A glissé(e) !',
                        ja: '滑った',
                        cn: '滑落',
                        ko: '미끄러짐!',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e8n = (e8n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e8s.ts


// TODO: rush hitting the crystal
// TODO: adds not being killed
// TODO: taking the rush twice (when you have debuff)
// TODO: not hitting the dragon four times during wyrm's lament
// TODO: death reasons for not picking up puddle
// TODO: not being in the tower when you should
// TODO: picking up too many stacks
// Note: Banish III (4DA8) and Banish Iii Divided (4DA9) both are type=0x16 lines.
// The same is true for Banish (4DA6) and Banish Divided (4DA7).
// I'm not sure this makes any sense? But can't tell if the spread was a mistake or not.
// Maybe we could check for "Magic Vulnerability Up"?
const e8s_triggerSet = {
    zoneId: zone_id/* default.EdensVerseRefulgenceSavage */.Z.EdensVerseRefulgenceSavage,
    damageWarn: {
        'E8S Biting Frost': '4D66',
        'E8S Driving Frost': '4D67',
        'E8S Axe Kick': '4D6D',
        'E8S Scythe Kick': '4D6E',
        'E8S Reflected Axe Kick': '4DB9',
        'E8S Reflected Scythe Kick': '4DBA',
        'E8S Frigid Eruption': '4D9F',
        'E8S Frigid Needle': '4D9D',
        'E8S Icicle Impact': '4DA0',
        'E8S Reflected Biting Frost 1': '4DB7',
        'E8S Reflected Biting Frost 2': '4DC3',
        'E8S Reflected Driving Frost 1': '4DB8',
        'E8S Reflected Driving Frost 2': '4DC4',
        'E8S Hallowed Wings 1': '4D75',
        'E8S Hallowed Wings 2': '4D76',
        'E8S Hallowed Wings 3': '4D77',
        'E8S Reflected Hallowed Wings 1': '4D90',
        'E8S Reflected Hallowed Wings 2': '4DBB',
        'E8S Reflected Hallowed Wings 3': '4DC7',
        'E8S Reflected Hallowed Wings 4': '4D91',
        'E8S Twin Stillness 1': '4D68',
        'E8S Twin Stillness 2': '4D6B',
        'E8S Twin Silence 1': '4D69',
        'E8S Twin Silence 2': '4D6A',
        'E8S Akh Rhai': '4D99',
        'E8S Embittered Dance 1': '4D70',
        'E8S Embittered Dance 2': '4D71',
        'E8S Spiteful Dance 1': '4D6F',
        'E8S Spiteful Dance 2': '4D72',
    },
    damageFail: {
        // Broken tether.
        'E8S Refulgent Fate': '4DA4',
        // Shared orb, correct is Bright Pulse (4D95)
        'E8S Blinding Pulse': '4D96',
    },
    shareFail: {
        'E8S Path of Light': '4DA1',
    },
    triggers: [
        {
            id: 'E8S Shining Armor',
            type: 'GainsEffect',
            // Stun
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '95' }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
        {
            // Interrupt
            id: 'E8S Stoneskin',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '4D85' }),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const e8s = (e8s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e9n.ts

const e9n_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseUmbra */.Z.EdensPromiseUmbra,
    damageWarn: {
        'E9N The Art Of Darkness 1': '5223',
        'E9N The Art Of Darkness 2': '5224',
        'E9N Wide-Angle Particle Beam': '5AFF',
        'E9N Wide-Angle Phaser': '55E1',
        'E9N Bad Vibrations': '55E6',
        'E9N Earth-Shattering Particle Beam': '5225',
        'E9N Anti-Air Particle Beam': '55DC',
        'E9N Zero-Form Particle Beam 2': '55DB',
    },
    damageFail: {
        'E9N Withdraw': '5534',
        'E9N Aetherosynthesis': '5535',
    },
    shareWarn: {
        'E9N Zero-Form Particle Beam 1': '55EB',
    },
};
/* harmony default export */ const e9n = (e9n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e9s.ts



// TODO: 561D Evil Seed hits everyone, hard to know if there's a double tap
// TODO: falling through panel just does damage with no ability name, like a death wall
// TODO: what happens if you jump in seed thorns?
const e9s_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseUmbraSavage */.Z.EdensPromiseUmbraSavage,
    damageWarn: {
        'E9S Bad Vibrations': '561C',
        'E9S Wide-Angle Particle Beam': '5B00',
        'E9S Wide-Angle Phaser Unlimited': '560E',
        'E9S Anti-Air Particle Beam': '5B01',
        'E9S The Second Art Of Darkness 1': '5601',
        'E9S The Second Art Of Darkness 2': '5602',
        'E9S The Art Of Darkness 1': '5A95',
        'E9S The Art Of Darkness 2': '5A96',
        'E9S The Art Of Darkness Clone 1': '561E',
        'E9S The Art Of Darkness Clone 2': '561F',
        'E9S The Third Art Of Darkness 1': '5603',
        'E9S The Third Art Of Darkness 2': '5604',
        'E9S Art Of Darkness': '5606',
        'E9S Full-Perimiter Particle Beam': '5629',
        'E9S Dark Chains': '5FAC',
    },
    damageFail: {
        'E9S Withdraw': '561A',
        'E9S Aetherosynthesis': '561B',
    },
    gainsEffectWarn: {
        'E9S Stygian Tendrils': '952',
    },
    shareWarn: {
        'E9S Hyper-Focused Particle Beam': '55FD',
    },
    shareFail: {
        'E9S Condensed Wide-Angle Particle Beam': '5610',
    },
    soloWarn: {
        'E9S Multi-Pronged Particle Beam': '5600',
    },
    triggers: [
        {
            // Anti-air "tank spread".  This can be stacked by two tanks invulning.
            // Note: this will still show something for holmgang/living, but
            // arguably a healer might need to do something about that, so maybe
            // it's ok to still show as a warning??
            id: 'E9S Condensed Anti-Air Particle Beam',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ type: '22', id: '5615', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            // Anti-air "out".  This can be invulned by a tank along with the spread above.
            id: 'E9S Anti-Air Phaser Unlimited',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '5612', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const e9s = (e9s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e10n.ts

const e10n_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseLitany */.Z.EdensPromiseLitany,
    damageWarn: {
        'E10N Forward Implosion': '56B4',
        'E10N Forward Shadow Implosion': '56B5',
        'E10N Backward Implosion': '56B7',
        'E10N Backward Shadow Implosion': '56B8',
        'E10N Barbs Of Agony 1': '56D9',
        'E10N Barbs Of Agony 2': '5B26',
        'E10N Cloak Of Shadows': '5B11',
        'E10N Throne Of Shadow': '56C7',
        'E10N Right Giga Slash': '56AE',
        'E10N Right Shadow Slash': '56AF',
        'E10N Left Giga Slash': '56B1',
        'E10N Left Shadow Slash': '56BD',
        'E10N Shadowy Eruption': '56E1',
    },
    shareWarn: {
        'E10N Shadow\'s Edge': '56DB',
    },
};
/* harmony default export */ const e10n = (e10n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e10s.ts



// TODO: hitting shadow of the hero with abilities can cause you to take damage, list those?
//       e.g. picking up your first pitch bog puddle will cause you to die to the damage
//       your shadow takes from Deepshadow Nova or Distant Scream.
// TODO: 573B Blighting Blitz issues during limit cut numbers
const e10s_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseLitanySavage */.Z.EdensPromiseLitanySavage,
    damageWarn: {
        'E10S Implosion Single 1': '56F2',
        'E10S Implosion Single 2': '56EF',
        'E10S Implosion Quadruple 1': '56EF',
        'E10S Implosion Quadruple 2': '56F2',
        'E10S Giga Slash Single 1': '56EC',
        'E10S Giga Slash Single 2': '56ED',
        'E10S Giga Slash Box 1': '5709',
        'E10S Giga Slash Box 2': '570D',
        'E10S Giga Slash Quadruple 1': '56EC',
        'E10S Giga Slash Quadruple 2': '56E9',
        'E10S Cloak Of Shadows 1': '5B13',
        'E10S Cloak Of Shadows 2': '5B14',
        'E10S Throne Of Shadow': '5717',
        'E10S Shadowy Eruption': '5738',
    },
    damageFail: {
        'E10S Swath Of Silence 1': '571A',
        'E10S Swath Of Silence 2': '5BBF',
    },
    shareWarn: {
        'E10S Shadefire': '5732',
        'E10S Pitch Bog': '5722',
    },
    shareFail: {
        'E10S Shadow\'s Edge': '5725',
    },
    triggers: [
        {
            id: 'E10S Damage Down Orbs',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Flameshadow', effectId: '82C' }),
            netRegexDe: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Schattenflamme', effectId: '82C' }),
            netRegexFr: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Flamme ombrale', effectId: '82C' }),
            netRegexJa: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'シャドウフレイム', effectId: '82C' }),
            mistake: (_data, matches) => {
                return { type: 'damage', blame: matches.target, text: `${matches.effect} (partial stack)` };
            },
        },
        {
            id: 'E10S Damage Down Boss',
            type: 'GainsEffect',
            // Shackles being messed up appear to just give the Damage Down, with nothing else.
            // Messing up towers is the Thrice-Come Ruin effect (9E2), but also Damage Down.
            // TODO: some of these will be duplicated with others, like `E10S Throne Of Shadow`.
            // Maybe it'd be nice to figure out how to put the damage marker on that?
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Shadowkeeper', effectId: '82C' }),
            netRegexDe: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Schattenkönig', effectId: '82C' }),
            netRegexFr: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: 'Roi De L\'Ombre', effectId: '82C' }),
            netRegexJa: netregexes/* default.gainsEffect */.Z.gainsEffect({ source: '影の王', effectId: '82C' }),
            mistake: (_data, matches) => {
                return { type: 'damage', blame: matches.target, text: `${matches.effect}` };
            },
        },
        {
            // Shadow Warrior 4 dog room cleave
            // This can be mitigated by the whole group, so add a damage condition.
            id: 'E10S Barbs Of Agony',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: ['572A', '5B27'], ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const e10s = (e10s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e11n.ts


const e11n_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseAnamorphosis */.Z.EdensPromiseAnamorphosis,
    damageWarn: {
        'E11N Burnt Strike Lightning': '562E',
        'E11N Burnt Strike Fire': '562C',
        'E11N Burnt Strike Holy': '5630',
        'E11N Burnout': '562F',
        'E11N Shining Blade': '5631',
        'E11N Halo Of Flame Brightfire': '563B',
        'E11N Halo Of Levin Brightfire': '563C',
        'E11N Resounding Crack': '564D',
        'E11N Image Burnt Strike Lightning': '5645',
        'E11N Image Burnt Strike Fire': '5643',
        'E11N Image Burnout': '5646',
    },
    damageFail: {
        'E11N Blasting Zone': '563E',
    },
    shareWarn: {
        'E11N Burn Mark': '564F',
    },
    triggers: [
        {
            id: 'E11N Blastburn Knocked Off',
            type: 'Ability',
            // 562D = Burnt Strike fire followup during most of the fight
            // 5644 = same thing, but from Fatebreaker's Image
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['562D', '5644'] }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e11n = (e11n_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e11s.ts


// 565A/568D Sinsmoke Bound Of Faith share
// 565E/5699 Bowshock hits target of 565D (twice) and two others
const e11s_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseAnamorphosisSavage */.Z.EdensPromiseAnamorphosisSavage,
    damageWarn: {
        'E11S Burnt Strike Fire': '5652',
        'E11S Burnt Strike Lightning': '5654',
        'E11S Burnt Strike Holy': '5656',
        'E11S Shining Blade': '5657',
        'E11S Burnt Strike Cycle Fire': '568E',
        'E11S Burnt Strike Cycle Lightning': '5695',
        'E11S Burnt Strike Cycle Holy': '569D',
        'E11S Shining Blade Cycle': '569E',
        'E11S Halo Of Flame Brightfire': '566D',
        'E11S Halo Of Levin Brightfire': '566C',
        'E11S Portal Of Flame Bright Pulse': '5671',
        'E11S Portal Of Levin Bright Pulse': '5670',
        'E11S Resonant Winds': '5689',
        'E11S Resounding Crack': '5688',
        'E11S Image Burnt Strike Lightning': '567B',
        'E11N Image Burnout': '567C',
        'E11N Image Burnt Strike Fire': '5679',
        'E11N Image Burnt Strike Holy': '567B',
        'E11N Image Shining Blade': '567E',
    },
    damageFail: {
        'E11S Burnout': '5655',
        'E11S Burnout Cycle': '5696',
        'E11S Blasting Zone': '5674',
    },
    shareWarn: {
        'E11S Elemental Break': '5664',
        'E11S Elemental Break Cycle': '568C',
        'E11S Sinsmite': '5667',
        'E11S Sinsmite Cycle': '5694',
    },
    shareFail: {
        'E11S Burn Mark': '56A3',
        'E11S Sinsight 1': '5661',
        'E11S Sinsight 2': '5BC7',
        'E11S Sinsight 3': '56A0',
    },
    soloFail: {
        'E11S Holy Sinsight Group Share': '5669',
    },
    triggers: [
        {
            id: 'E11S Blastburn Knocked Off',
            type: 'Ability',
            // 5653 = Burnt Strike fire followup during most of the fight
            // 567A = same thing, but from Fatebreaker's Image
            // 568F = same thing, but during Cycle of Faith
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['5653', '567A', '568F'] }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const e11s = (e11s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e12n.ts

const e12n_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseEternity */.Z.EdensPromiseEternity,
    damageWarn: {
        'E12N Judgment Jolt Single': '585F',
        'E12N Judgment Jolt': '4E30',
        'E12N Temporary Current Single': '585C',
        'E12N Temporary Current': '4E2D',
        'E12N Conflag Strike Single': '585D',
        'E12N Conflag Strike': '4E2E',
        'E12N Ferostorm Single': '585E',
        'E12N Ferostorm': '4E2F',
        'E12N Rapturous Reach 1': '5878',
        'E12N Rapturous Reach 2': '5877',
        'E12N Bomb Explosion': '586D',
        'E12N Titanic Bomb Explosion': '586F',
    },
    shareWarn: {
        'E12N Earthshaker': '5885',
        'E12N Promise Frigid Stone 1': '5867',
        'E12N Promise Frigid Stone 2': '5869',
    },
};
/* harmony default export */ const e12n = (e12n_triggerSet);

// EXTERNAL MODULE: ./resources/not_reached.ts
var not_reached = __webpack_require__(5670);
// EXTERNAL MODULE: ./resources/outputs.ts
var outputs = __webpack_require__(1898);
;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/raid/e12s.ts





// TODO: add separate damageWarn-esque icon for damage downs?
// TODO: 58A6 Under The Weight / 58B2 Classical Sculpture missing somebody in party warning?
// TODO: 58CA Dark Water III / 58C5 Shell Crusher should hit everyone in party
// TODO: Dark Aero III 58D4 should not be a share except on advanced relativity for double aero.
// (for gains effect, single aero = ~23 seconds, double aero = ~31 seconds duration)
// Due to changes introduced in patch 5.2, overhead markers now have a random offset
// added to their ID. This offset currently appears to be set per instance, so
// we can determine what it is from the first overhead marker we see.
// The first 1B marker in the encounter is the formless tankbuster, ID 004F.
const firstHeadmarker = parseInt('00DA', 16);
const getHeadmarkerId = (data, matches) => {
    // If we naively just check !data.decOffset and leave it, it breaks if the first marker is 00DA.
    // (This makes the offset 0, and !0 is true.)
    if (typeof data.decOffset === 'undefined')
        data.decOffset = parseInt(matches.id, 16) - firstHeadmarker;
    // The leading zeroes are stripped when converting back to string, so we re-add them here.
    // Fortunately, we don't have to worry about whether or not this is robust,
    // since we know all the IDs that will be present in the encounter.
    return (parseInt(matches.id, 16) - data.decOffset).toString(16).toUpperCase().padStart(4, '0');
};
const e12s_triggerSet = {
    zoneId: zone_id/* default.EdensPromiseEternitySavage */.Z.EdensPromiseEternitySavage,
    damageWarn: {
        'E12S Promise Rapturous Reach Left': '58AD',
        'E12S Promise Rapturous Reach Right': '58AE',
        'E12S Promise Temporary Current': '4E44',
        'E12S Promise Conflag Strike': '4E45',
        'E12S Promise Ferostorm': '4E46',
        'E12S Promise Judgment Jolt': '4E47',
        'E12S Promise Shatter': '589C',
        'E12S Promise Impact': '58A1',
        'E12S Oracle Dark Blizzard III': '58D3',
        'E12S Oracle Apocalypse': '58E6',
    },
    damageFail: {
        'E12S Oracle Maelstrom': '58DA',
    },
    gainsEffectFail: {
        'E12S Oracle Doom': '9D4',
    },
    shareWarn: {
        'E12S Promise Frigid Stone': '589E',
        'E12S Oracle Darkest Dance': '4E33',
        'E12S Oracle Dark Current': '58D8',
        'E12S Oracle Spirit Taker': '58C6',
        'E12S Oracle Somber Dance 1': '58BF',
        'E12S Oracle Somber Dance 2': '58C0',
    },
    shareFail: {
        'E12S Promise Weight Of The World': '58A5',
        'E12S Promise Pulse Of The Land': '58A3',
        'E12S Oracle Dark Eruption 1': '58CE',
        'E12S Oracle Dark Eruption 2': '58CD',
        'E12S Oracle Black Halo': '58C7',
    },
    soloWarn: {
        'E12S Promise Force Of The Land': '58A4',
    },
    triggers: [
        {
            // Big circle ground aoes during Shiva junction.
            // This can be shielded through as long as that person doesn't stack.
            id: 'E12S Icicle Impact',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4E5A', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'E12S Headmarker',
            type: 'HeadMarker',
            netRegex: netregexes/* default.headMarker */.Z.headMarker({}),
            run: (data, matches) => {
                var _a;
                const id = getHeadmarkerId(data, matches);
                const firstLaserMarker = '0091';
                const lastLaserMarker = '0098';
                if (id >= firstLaserMarker && id <= lastLaserMarker) {
                    // ids are sequential: #1 square, #2 square, #3 square, #4 square, #1 triangle etc
                    const decOffset = parseInt(id, 16) - parseInt(firstLaserMarker, 16);
                    // decOffset is 0-7, so map 0-3 to 1-4 and 4-7 to 1-4.
                    (_a = data.laserNameToNum) !== null && _a !== void 0 ? _a : (data.laserNameToNum = {});
                    data.laserNameToNum[matches.target] = decOffset % 4 + 1;
                }
            },
        },
        {
            // These sculptures are added at the start of the fight, so we need to check where they
            // use the "Classical Sculpture" ability and end up on the arena for real.
            id: 'E12S Promise Chiseled Sculpture Classical Sculpture',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ source: 'Chiseled Sculpture', id: '58B2' }),
            run: (data, matches) => {
                var _a;
                // This will run per person that gets hit by the same sculpture, but that's fine.
                // Record the y position of each sculpture so we can use it for better text later.
                (_a = data.sculptureYPositions) !== null && _a !== void 0 ? _a : (data.sculptureYPositions = {});
                data.sculptureYPositions[matches.sourceId.toUpperCase()] = parseFloat(matches.y);
            },
        },
        {
            // The source of the tether is the player, the target is the sculpture.
            id: 'E12S Promise Chiseled Sculpture Tether',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ target: 'Chiseled Sculpture', id: '0011' }),
            run: (data, matches) => {
                var _a;
                (_a = data.sculptureTetherNameToId) !== null && _a !== void 0 ? _a : (data.sculptureTetherNameToId = {});
                data.sculptureTetherNameToId[matches.source] = matches.targetId.toUpperCase();
            },
        },
        {
            id: 'E12S Promise Blade Of Flame Counter',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ source: 'Chiseled Sculpture', id: '58B3' }),
            delaySeconds: 1,
            suppressSeconds: 1,
            run: (data) => {
                data.bladeOfFlameCount = data.bladeOfFlameCount || 0;
                data.bladeOfFlameCount++;
            },
        },
        {
            // This is the Chiseled Sculpture laser with the limit cut dots.
            id: 'E12S Promise Blade Of Flame',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ type: '22', source: 'Chiseled Sculpture', id: '58B3' }),
            mistake: (data, matches) => {
                if (!data.laserNameToNum || !data.sculptureTetherNameToId || !data.sculptureYPositions)
                    return;
                // Find the person who has this laser number and is tethered to this statue.
                const number = (data.bladeOfFlameCount || 0) + 1;
                const sourceId = matches.sourceId.toUpperCase();
                const names = Object.keys(data.laserNameToNum);
                const withNum = names.filter((name) => { var _a; return ((_a = data.laserNameToNum) === null || _a === void 0 ? void 0 : _a[name]) === number; });
                const owners = withNum.filter((name) => { var _a; return ((_a = data.sculptureTetherNameToId) === null || _a === void 0 ? void 0 : _a[name]) === sourceId; });
                // if some logic error, just abort.
                if (owners.length !== 1)
                    return;
                // The owner hitting themselves isn't a mistake...technically.
                if (owners[0] === matches.target)
                    return;
                // Now try to figure out which statue is which.
                // People can put these wherever.  They could go sideways, or diagonal, or whatever.
                // It seems mooooost people put these north / south (on the south edge of the arena).
                // Let's say a minimum of 2 yalms apart in the y direction to consider them "north/south".
                const minimumYalmsForStatues = 2;
                let isStatuePositionKnown = false;
                let isStatueNorth = false;
                const sculptureIds = Object.keys(data.sculptureYPositions);
                if (sculptureIds.length === 2 && sculptureIds.includes(sourceId)) {
                    const otherId = sculptureIds[0] === sourceId ? sculptureIds[1] : sculptureIds[0];
                    const sourceY = data.sculptureYPositions[sourceId];
                    const otherY = data.sculptureYPositions[otherId !== null && otherId !== void 0 ? otherId : ''];
                    if (sourceY === undefined || otherY === undefined || otherId === undefined)
                        throw new not_reached/* UnreachableCode */.$();
                    const yDiff = Math.abs(sourceY - otherY);
                    if (yDiff > minimumYalmsForStatues) {
                        isStatuePositionKnown = true;
                        isStatueNorth = sourceY < otherY;
                    }
                }
                const owner = owners[0];
                const ownerNick = data.ShortName(owner);
                let text = {
                    en: `${matches.ability} (from ${ownerNick}, #${number})`,
                    de: `${matches.ability} (von ${ownerNick}, #${number})`,
                    ja: `${matches.ability} (${ownerNick}から、#${number})`,
                    cn: `${matches.ability} (来自${ownerNick}，#${number})`,
                    ko: `${matches.ability} (대상자 "${ownerNick}", ${number}번)`,
                };
                if (isStatuePositionKnown && isStatueNorth) {
                    text = {
                        en: `${matches.ability} (from ${ownerNick}, #${number} north)`,
                        de: `${matches.ability} (von ${ownerNick}, #${number} norden)`,
                        ja: `${matches.ability} (北の${ownerNick}から、#${number})`,
                        cn: `${matches.ability} (来自北方${ownerNick}，#${number})`,
                        ko: `${matches.ability} (대상자 "${ownerNick}", ${number}번 북쪽)`,
                    };
                }
                else if (isStatuePositionKnown && !isStatueNorth) {
                    text = {
                        en: `${matches.ability} (from ${ownerNick}, #${number} south)`,
                        de: `${matches.ability} (von ${ownerNick}, #${number} Süden)`,
                        ja: `${matches.ability} (南の${ownerNick}から、#${number})`,
                        cn: `${matches.ability} (来自南方${ownerNick}，#${number})`,
                        ko: `${matches.ability} (대상자 "${ownerNick}", ${number}번 남쪽)`,
                    };
                }
                return {
                    type: 'fail',
                    name: matches.target,
                    blame: owner,
                    text: text,
                };
            },
        },
        {
            id: 'E12S Promise Ice Pillar Tracker',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ source: 'Ice Pillar', id: ['0001', '0039'] }),
            run: (data, matches) => {
                var _a;
                (_a = data.pillarIdToOwner) !== null && _a !== void 0 ? _a : (data.pillarIdToOwner = {});
                data.pillarIdToOwner[matches.sourceId] = matches.target;
            },
        },
        {
            id: 'E12S Promise Ice Pillar Mistake',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ source: 'Ice Pillar', id: '589B' }),
            condition: (data, matches) => {
                if (!data.pillarIdToOwner)
                    return false;
                return matches.target !== data.pillarIdToOwner[matches.sourceId];
            },
            mistake: (data, matches) => {
                var _a;
                const pillarOwner = data.ShortName((_a = data.pillarIdToOwner) === null || _a === void 0 ? void 0 : _a[matches.sourceId]);
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: `${matches.ability} (from ${pillarOwner})`,
                        de: `${matches.ability} (von ${pillarOwner})`,
                        fr: `${matches.ability} (de ${pillarOwner})`,
                        ja: `${matches.ability} (${pillarOwner}から)`,
                        cn: `${matches.ability} (来自${pillarOwner})`,
                        ko: `${matches.ability} (대상자 "${pillarOwner}")`,
                    },
                };
            },
        },
        {
            id: 'E12S Promise Gain Fire Resistance Down II',
            type: 'GainsEffect',
            // The Beastly Sculpture gives a 3 second debuff, the Regal Sculpture gives a 14s one.
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '832' }),
            run: (data, matches) => {
                var _a;
                (_a = data.fire) !== null && _a !== void 0 ? _a : (data.fire = {});
                data.fire[matches.target] = true;
            },
        },
        {
            id: 'E12S Promise Lose Fire Resistance Down II',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '832' }),
            run: (data, matches) => {
                var _a;
                (_a = data.fire) !== null && _a !== void 0 ? _a : (data.fire = {});
                data.fire[matches.target] = false;
            },
        },
        {
            id: 'E12S Promise Small Lion Tether',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ source: 'Beastly Sculpture', id: '0011' }),
            netRegexDe: netregexes/* default.tether */.Z.tether({ source: 'Abbild Eines Löwen', id: '0011' }),
            netRegexFr: netregexes/* default.tether */.Z.tether({ source: 'Création Léonine', id: '0011' }),
            netRegexJa: netregexes/* default.tether */.Z.tether({ source: '創られた獅子', id: '0011' }),
            run: (data, matches) => {
                var _a, _b;
                (_a = data.smallLionIdToOwner) !== null && _a !== void 0 ? _a : (data.smallLionIdToOwner = {});
                data.smallLionIdToOwner[matches.sourceId.toUpperCase()] = matches.target;
                (_b = data.smallLionOwners) !== null && _b !== void 0 ? _b : (data.smallLionOwners = []);
                data.smallLionOwners.push(matches.target);
            },
        },
        {
            id: 'E12S Promise Small Lion Lionsblaze',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ source: 'Beastly Sculpture', id: '58B9' }),
            netRegexDe: netregexes/* default.abilityFull */.Z.abilityFull({ source: 'Abbild Eines Löwen', id: '58B9' }),
            netRegexFr: netregexes/* default.abilityFull */.Z.abilityFull({ source: 'Création Léonine', id: '58B9' }),
            netRegexJa: netregexes/* default.abilityFull */.Z.abilityFull({ source: '創られた獅子', id: '58B9' }),
            mistake: (data, matches) => {
                var _a;
                // Folks baiting the big lion second can take the first small lion hit,
                // so it's not sufficient to check only the owner.
                if (!data.smallLionOwners)
                    return;
                const owner = (_a = data.smallLionIdToOwner) === null || _a === void 0 ? void 0 : _a[matches.sourceId.toUpperCase()];
                if (!owner)
                    return;
                if (matches.target === owner)
                    return;
                // If the target also has a small lion tether, that is always a mistake.
                // Otherwise, it's only a mistake if the target has a fire debuff.
                const hasSmallLion = data.smallLionOwners.includes(matches.target);
                const hasFireDebuff = data.fire && data.fire[matches.target];
                if (hasSmallLion || hasFireDebuff) {
                    const ownerNick = data.ShortName(owner);
                    const centerY = -75;
                    const x = parseFloat(matches.x);
                    const y = parseFloat(matches.y);
                    let dirObj = null;
                    if (y < centerY) {
                        if (x > 0)
                            dirObj = outputs/* default.dirNE */.Z.dirNE;
                        else
                            dirObj = outputs/* default.dirNW */.Z.dirNW;
                    }
                    else {
                        if (x > 0)
                            dirObj = outputs/* default.dirSE */.Z.dirSE;
                        else
                            dirObj = outputs/* default.dirSW */.Z.dirSW;
                    }
                    return {
                        type: 'fail',
                        blame: owner,
                        name: matches.target,
                        text: {
                            en: `${matches.ability} (from ${ownerNick}, ${dirObj['en']})`,
                            de: `${matches.ability} (von ${ownerNick}, ${dirObj['de']})`,
                            fr: `${matches.ability} (de ${ownerNick}, ${dirObj['fr']})`,
                            ja: `${matches.ability} (${ownerNick}から, ${dirObj['ja']})`,
                            cn: `${matches.ability} (来自${ownerNick}, ${dirObj['cn']}`,
                            ko: `${matches.ability} (대상자 "${ownerNick}", ${dirObj['ko']})`,
                        },
                    };
                }
            },
        },
        {
            id: 'E12S Promise North Big Lion',
            type: 'AddedCombatant',
            netRegex: netregexes/* default.addedCombatantFull */.Z.addedCombatantFull({ name: 'Regal Sculpture' }),
            run: (data, matches) => {
                const y = parseFloat(matches.y);
                const centerY = -75;
                if (y < centerY)
                    data.northBigLion = matches.id.toUpperCase();
            },
        },
        {
            id: 'E12S Promise Big Lion Kingsblaze',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ source: 'Regal Sculpture', id: '4F9E' }),
            netRegexDe: netregexes/* default.ability */.Z.ability({ source: 'Abbild eines großen Löwen', id: '4F9E' }),
            netRegexFr: netregexes/* default.ability */.Z.ability({ source: 'création léonine royale', id: '4F9E' }),
            netRegexJa: netregexes/* default.ability */.Z.ability({ source: '創られた獅子王', id: '4F9E' }),
            mistake: (data, matches) => {
                var _a, _b, _c, _d;
                const singleTarget = matches.type === '21';
                const hasFireDebuff = data.fire && data.fire[matches.target];
                // Success if only one person takes it and they have no fire debuff.
                if (singleTarget && !hasFireDebuff)
                    return;
                const northBigLion = {
                    en: 'north big lion',
                    de: 'Nordem, großer Löwe',
                    ja: '大ライオン(北)',
                    cn: '北方大狮子',
                    ko: '북쪽 큰 사자',
                };
                const southBigLion = {
                    en: 'south big lion',
                    de: 'Süden, großer Löwe',
                    ja: '大ライオン(南)',
                    cn: '南方大狮子',
                    ko: '남쪽 큰 사자',
                };
                const shared = {
                    en: 'shared',
                    de: 'geteilt',
                    ja: '重ねた',
                    cn: '重叠',
                    ko: '같이 맞음',
                };
                const fireDebuff = {
                    en: 'had fire',
                    de: 'hatte Feuer',
                    ja: '炎付き',
                    cn: '火Debuff',
                    ko: '화염 디버프 받음',
                };
                const labels = [];
                const lang = data.options.ParserLanguage;
                if (data.northBigLion) {
                    if (data.northBigLion === matches.sourceId)
                        labels.push((_a = northBigLion[lang]) !== null && _a !== void 0 ? _a : northBigLion['en']);
                    else
                        labels.push((_b = southBigLion[lang]) !== null && _b !== void 0 ? _b : southBigLion['en']);
                }
                if (!singleTarget)
                    labels.push((_c = shared[lang]) !== null && _c !== void 0 ? _c : shared['en']);
                if (hasFireDebuff)
                    labels.push((_d = fireDebuff[lang]) !== null && _d !== void 0 ? _d : fireDebuff['en']);
                return {
                    type: 'fail',
                    name: matches.target,
                    text: `${matches.ability} (${labels.join(', ')})`,
                };
            },
        },
        {
            id: 'E12S Knocked Off',
            type: 'Ability',
            // 589A = Ice Pillar (promise shiva phase)
            // 58B6 = Palm Of Temperance (promise statue hand)
            // 58B7 = Laser Eye (promise lion phase)
            // 58C1 = Darkest Dance (oracle tank jump + knockback in beginning and triple apoc)
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['589A', '58B6', '58B7', '58C1'] }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
        {
            id: 'E12S Oracle Shadoweye',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '58D2', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const e12s = (e12s_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/diamond_weapon-ex.ts


// TODO: warning for taking Diamond Flash (5FA1) stack on your own?
// Diamond Weapon Extreme
const diamond_weapon_ex_triggerSet = {
    zoneId: zone_id/* default.TheCloudDeckExtreme */.Z.TheCloudDeckExtreme,
    damageWarn: {
        'DiamondEx Auri Arts 1': '5FAF',
        'DiamondEx Auri Arts 2': '5FB2',
        'DiamondEx Auri Arts 3': '5FCD',
        'DiamondEx Auri Arts 4': '5FCE',
        'DiamondEx Auri Arts 5': '5FCF',
        'DiamondEx Auri Arts 6': '5FF8',
        'DiamondEx Auri Arts 7': '6159',
        'DiamondEx Articulated Bit Aetherial Bullet': '5FAB',
        'DiamondEx Diamond Shrapnel 1': '5FCB',
        'DiamondEx Diamond Shrapnel 2': '5FCC',
    },
    damageFail: {
        'DiamondEx Claw Swipe Left': '5FC2',
        'DiamondEx Claw Swipe Right': '5FC3',
        'DiamondEx Auri Cyclone 1': '5FD1',
        'DiamondEx Auri Cyclone 2': '5FD2',
        'DiamondEx Airship\'s Bane 1': '5FFE',
        'DiamondEx Airship\'s Bane 2': '5FD3',
    },
    shareWarn: {
        'DiamondEx Tank Lasers': '5FC8',
        'DiamondEx Homing Laser': '5FC4',
    },
    shareFail: {
        'DiamondEx Flood Ray': '5FC7',
    },
    triggers: [
        {
            id: 'DiamondEx Vertical Cleave Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '5FD0' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const diamond_weapon_ex = (diamond_weapon_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/diamond_weapon.ts


// Diamond Weapon Normal
const diamond_weapon_triggerSet = {
    zoneId: zone_id/* default.TheCloudDeck */.Z.TheCloudDeck,
    damageWarn: {
        'Diamond Weapon Auri Arts': '5FE3',
        'Diamond Weapon Diamond Shrapnel Initial': '5FE1',
        'Diamond Weapon Diamond Shrapnel Chasing': '5FE2',
        'Diamond Weapon Aetherial Bullet': '5FD5',
    },
    damageFail: {
        'Diamond Weapon Claw Swipe Left': '5FD9',
        'Diamond Weapon Claw Swipe Right': '5FDA',
        'Diamond Weapon Auri Cyclone 1': '5FE6',
        'Diamond Weapon Auri Cyclone 2': '5FE7',
        'Diamond Weapon Airship\'s Bane 1': '5FE8',
        'Diamond Weapon Airship\'s Bane 2': '5FFE',
    },
    shareWarn: {
        'Diamond Weapon Homing Laser': '5FDB',
    },
    triggers: [
        {
            id: 'Diamond Weapon Vertical Cleave Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '5FE5' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const diamond_weapon = (diamond_weapon_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/emerald_weapon-ex.ts

const emerald_weapon_ex_triggerSet = {
    zoneId: zone_id/* default.CastrumMarinumExtreme */.Z.CastrumMarinumExtreme,
    damageWarn: {
        'EmeraldEx Heat Ray': '5BD3',
        'EmeraldEx Photon Laser 1': '557B',
        'EmeraldEx Photon Laser 2': '557D',
        'EmeraldEx Heat Ray 1': '557A',
        'EmeraldEx Heat Ray 2': '5579',
        'EmeraldEx Explosion': '5596',
        'EmeraldEx Tertius Terminus Est Initial': '55CD',
        'EmeraldEx Tertius Terminus Est Explosion': '55CE',
        'EmeraldEx Airborne Explosion': '55BD',
        'EmeraldEx Sidescathe 1': '55D4',
        'EmeraldEx Sidescathe 2': '55D5',
        'EmeraldEx Shots Fired': '55B7',
        'EmeraldEx Secundus Terminus Est': '55CB',
        'EmeraldEx Expire': '55D1',
        'EmeraldEx Aire Tam Storm': '55D0',
    },
    shareWarn: {
        'EmeraldEx Divide Et Impera': '55D9',
        'EmeraldEx Primus Terminus Est 1': '55C4',
        'EmeraldEx Primus Terminus Est 2': '55C5',
        'EmeraldEx Primus Terminus Est 3': '55C6',
        'EmeraldEx Primus Terminus Est 4': '55C7',
    },
};
/* harmony default export */ const emerald_weapon_ex = (emerald_weapon_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/emerald_weapon.ts


const emerald_weapon_triggerSet = {
    zoneId: zone_id/* default.CastrumMarinum */.Z.CastrumMarinum,
    damageWarn: {
        'Emerald Weapon Heat Ray': '4F9D',
        'Emerald Weapon Photon Laser 1': '5534',
        'Emerald Weapon Photon Laser 2': '5536',
        'Emerald Weapon Photon Laser 3': '5538',
        'Emerald Weapon Heat Ray 1': '5532',
        'Emerald Weapon Heat Ray 2': '5533',
        'Emerald Weapon Magnetic Mine Explosion': '5B04',
        'Emerald Weapon Sidescathe 1': '553F',
        'Emerald Weapon Sidescathe 2': '5540',
        'Emerald Weapon Sidescathe 3': '5541',
        'Emerald Weapon Sidescathe 4': '5542',
        'Emerald Weapon Bit Storm': '554A',
        'Emerald Weapon Emerald Crusher': '553C',
        'Emerald Weapon Pulse Laser': '5548',
        'Emerald Weapon Energy Aetheroplasm': '5551',
        'Emerald Weapon Divide Et Impera Ground': '556F',
        'Emerald Weapon Primus Terminus Est': '4B3E',
        'Emerald Weapon Secundus Terminus Est': '556A',
        'Emerald Weapon Tertius Terminus Est': '556D',
        'Emerald Weapon Shots Fired': '555F',
    },
    shareWarn: {
        'Emerald Weapon Divide Et Impera P1': '554E',
        'Emerald Weapon Divide Et Impera P2': '5570',
    },
    triggers: [
        {
            id: 'Emerald Weapon Emerald Crusher Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '553E' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
        {
            // Getting knocked into a wall from the arrow headmarker.
            id: 'Emerald Weapon Primus Terminus Est Wall',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['5563', '5564'] }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Pushed into wall',
                        de: 'Rückstoß in die Wand',
                        ja: '壁へノックバック',
                        cn: '击退至墙',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const emerald_weapon = (emerald_weapon_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/hades-ex.ts



// Hades Ex
const hades_ex_triggerSet = {
    zoneId: zone_id/* default.TheMinstrelsBalladHadessElegy */.Z.TheMinstrelsBalladHadessElegy,
    damageWarn: {
        'HadesEx Shadow Spread 2': '47AA',
        'HadesEx Shadow Spread 3': '47E4',
        'HadesEx Shadow Spread 4': '47E5',
        // Everybody stacks in good faith for Bad Faith, so don't call it a mistake.
        // 'HadesEx Bad Faith 1': '47AD',
        // 'HadesEx Bad Faith 2': '47B0',
        // 'HadesEx Bad Faith 3': '47AE',
        // 'HadesEx Bad Faith 4': '47AF',
        'HadesEx Broken Faith': '47B2',
        'HadesEx Magic Spear': '47B6',
        'HadesEx Magic Chakram': '47B5',
        'HadesEx Forked Lightning': '47C9',
        'HadesEx Dark Current 1': '47F1',
        'HadesEx Dark Current 2': '47F2',
    },
    damageFail: {
        'HadesEx Comet': '47B9',
        'HadesEx Ancient Eruption': '47D3',
        'HadesEx Purgation 1': '47EC',
        'HadesEx Purgation 2': '47ED',
        'HadesEx Shadow Stream': '47EA',
        'HadesEx Dead Space': '47EE',
    },
    shareWarn: {
        'HadesEx Shadow Spread Initial': '47A9',
        'HadesEx Ravenous Assault': '(?:47A6|47A7)',
        'HadesEx Dark Flame 1': '47C6',
        'HadesEx Dark Freeze 1': '47C4',
        'HadesEx Dark Freeze 2': '47DF',
    },
    triggers: [
        {
            id: 'HadesEx Dark II Tether',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ source: 'Shadow of the Ancients', id: '0011' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasDark) !== null && _a !== void 0 ? _a : (data.hasDark = []);
                data.hasDark.push(matches.target);
            },
        },
        {
            id: 'HadesEx Dark II',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ type: '22', id: '47BA', ...oopsy_common/* playerDamageFields */.np }),
            // Don't blame people who don't have tethers.
            condition: (data, matches) => data.hasDark && data.hasDark.includes(matches.target),
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'HadesEx Boss Tether',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ source: ['Igeyorhm\'s Shade', 'Lahabrea\'s Shade'], id: '000E', capture: false }),
            mistake: {
                type: 'warn',
                text: {
                    en: 'Bosses Too Close',
                    de: 'Bosses zu Nahe',
                    fr: 'Boss trop proches',
                    ja: 'ボス近すぎる',
                    cn: 'BOSS靠太近了',
                    ko: '쫄들이 너무 가까움',
                },
            },
        },
        {
            id: 'HadesEx Death Shriek',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '47CB', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => data.DamageFromMatches(matches) > 0,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
        {
            id: 'HadesEx Beyond Death Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '566' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasBeyondDeath) !== null && _a !== void 0 ? _a : (data.hasBeyondDeath = {});
                data.hasBeyondDeath[matches.target] = true;
            },
        },
        {
            id: 'HadesEx Beyond Death Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '566' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasBeyondDeath) !== null && _a !== void 0 ? _a : (data.hasBeyondDeath = {});
                data.hasBeyondDeath[matches.target] = false;
            },
        },
        {
            id: 'HadesEx Beyond Death',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '566' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (data, matches) => {
                if (!data.hasBeyondDeath)
                    return;
                if (!data.hasBeyondDeath[matches.target])
                    return;
                return {
                    name: matches.target,
                    text: matches.effect,
                };
            },
        },
        {
            id: 'HadesEx Doom Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '6E9' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasDoom) !== null && _a !== void 0 ? _a : (data.hasDoom = {});
                data.hasDoom[matches.target] = true;
            },
        },
        {
            id: 'HadesEx Doom Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '6E9' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasDoom) !== null && _a !== void 0 ? _a : (data.hasDoom = {});
                data.hasDoom[matches.target] = false;
            },
        },
        {
            id: 'HadesEx Doom',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '6E9' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (data, matches) => {
                if (!data.hasDoom)
                    return;
                if (!data.hasDoom[matches.target])
                    return;
                return {
                    name: matches.target,
                    text: matches.effect,
                };
            },
        },
    ],
};
/* harmony default export */ const hades_ex = (hades_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/hades.ts

// Hades Normal
const hades_triggerSet = {
    zoneId: zone_id/* default.TheDyingGasp */.Z.TheDyingGasp,
    damageWarn: {
        'Hades Bad Faith 1': '414B',
        'Hades Bad Faith 2': '414C',
        'Hades Dark Eruption': '4152',
        'Hades Shadow Spread 1': '4156',
        'Hades Shadow Spread 2': '4157',
        'Hades Broken Faith': '414E',
        'Hades Hellborn Yawp': '416F',
        'Hades Purgation': '4172',
        'Hades Shadow Stream': '415C',
        'Hades Aero': '4595',
        'Hades Echo 1': '4163',
        'Hades Echo 2': '4164',
    },
    shareFail: {
        'Hades Nether Blast': '4163',
        'Hades Ravenous Assault': '4158',
        'Hades Ancient Darkness': '4593',
        'Hades Dual Strike': '4162',
    },
};
/* harmony default export */ const hades = (hades_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/innocence-ex.ts

// Innocence Extreme
const innocence_ex_triggerSet = {
    zoneId: zone_id/* default.TheCrownOfTheImmaculateExtreme */.Z.TheCrownOfTheImmaculateExtreme,
    damageWarn: {
        'InnoEx Duel Descent': '3ED2',
        'InnoEx Reprobation 1': '3EE0',
        'InnoEx Reprobation 2': '3ECC',
        'InnoEx Sword of Condemnation 1': '3EDE',
        'InnoEx Sword of Condemnation 2': '3EDF',
        'InnoEx Dream of the Rood 1': '3ED3',
        'InnoEx Dream of the Rood 2': '3ED4',
        'InnoEx Dream of the Rood 3': '3ED5',
        'InnoEx Dream of the Rood 4': '3ED6',
        'InnoEx Dream of the Rood 5': '3EFB',
        'InnoEx Dream of the Rood 6': '3EFC',
        'InnoEx Dream of the Rood 7': '3EFD',
        'InnoEx Dream of the Rood 8': '3EFE',
        'InnoEx Holy Trinity': '3EDB',
        'InnoEx Soul and Body 1': '3ED7',
        'InnoEx Soul and Body 2': '3ED8',
        'InnoEx Soul and Body 3': '3ED9',
        'InnoEx Soul and Body 4': '3EDA',
        'InnoEx Soul and Body 5': '3EFF',
        'InnoEx Soul and Body 6': '3F00',
        'InnoEx Soul and Body 7': '3F01',
        'InnoEx Soul and Body 8': '3F02',
        'InnoEx God Ray 1': '3EE6',
        'InnoEx God Ray 2': '3EE7',
        'InnoEx God Ray 3': '3EE8',
        'InnoEx Explosion': '3EF0',
    },
};
/* harmony default export */ const innocence_ex = (innocence_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/innocence.ts

// Innocence Normal
const innocence_triggerSet = {
    zoneId: zone_id/* default.TheCrownOfTheImmaculate */.Z.TheCrownOfTheImmaculate,
    damageWarn: {
        'Inno Daybreak': '3E9D',
        'Inno Holy Trinity': '3EB3',
        'Inno Reprobation 1': '3EB6',
        'Inno Reprobation 2': '3EB8',
        'Inno Reprobation 3': '3ECB',
        'Inno Reprobation 4': '3EB7',
        'Inno Soul and Body 1': '3EB1',
        'Inno Soul and Body 2': '3EB2',
        'Inno Soul and Body 3': '3EF9',
        'Inno Soul and Body 4': '3EFA',
        'Inno God Ray 1': '3EBD',
        'Inno God Ray 2': '3EBE',
        'Inno God Ray 3': '3EBF',
        'Inno God Ray 4': '3EC0',
    },
};
/* harmony default export */ const innocence = (innocence_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/levi-un.ts


// It's hard to capture the reflection abilities from Leviathan's Head and Tail if you use
// ranged physical attacks / magic attacks respectively, as the ability names are the
// ability you used and don't appear to show up in the log as normal "ability" lines.
// That said, dots still tick independently on both so it's likely that people will atack
// them anyway.
// TODO: Figure out why Dread Tide / Waterspout appear like shares (i.e. 0x16 id).
// Dread Tide = 5CCA/5CCB/5CCC, Waterspout = 5CD1
// Leviathan Unreal
const levi_un_triggerSet = {
    zoneId: zone_id/* default.TheWhorleaterUnreal */.Z.TheWhorleaterUnreal,
    damageWarn: {
        'LeviUn Grand Fall': '5CDF',
        'LeviUn Hydroshot': '5CD5',
        'LeviUn Dreadstorm': '5CD6',
    },
    damageFail: {
        'LeviUn Body Slam': '5CD2',
        'LeviUn Spinning Dive 1': '5CDB',
        'LeviUn Spinning Dive 2': '5CE3',
        'LeviUn Spinning Dive 3': '5CE8',
        'LeviUn Spinning Dive 4': '5CE9',
    },
    gainsEffectWarn: {
        'LeviUn Dropsy': '110',
    },
    gainsEffectFail: {
        'LeviUn Hysteria': '128',
    },
    triggers: [
        {
            id: 'LeviUn Body Slam Knocked Off',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '5CD2' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked off',
                        de: 'Runtergefallen',
                        fr: 'A été assommé(e)',
                        ja: 'ノックバック',
                        cn: '击退坠落',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const levi_un = (levi_un_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/ruby_weapon-ex.ts


// TODO: taking two different High-Powered Homing Lasers (4AD8)
// TODO: could blame the tethered player for White Agony / White Fury failures?
// Ruby Weapon Extreme
const ruby_weapon_ex_triggerSet = {
    zoneId: zone_id/* default.CinderDriftExtreme */.Z.CinderDriftExtreme,
    damageWarn: {
        'RubyEx Ruby Bit Magitek Ray': '4AD2',
        'RubyEx Spike Of Flame 1': '4AD3',
        'RubyEx Spike Of Flame 2': '4B2F',
        'RubyEx Spike Of Flame 3': '4D04',
        'RubyEx Spike Of Flame 4': '4D05',
        'RubyEx Spike Of Flame 5': '4ACD',
        'RubyEx Spike Of Flame 6': '4ACE',
        'RubyEx Undermine': '4AD0',
        'RubyEx Ruby Ray': '4B02',
        'RubyEx Ravensflight 1': '4AD9',
        'RubyEx Ravensflight 2': '4ADA',
        'RubyEx Ravensflight 3': '4ADD',
        'RubyEx Ravensflight 4': '4ADE',
        'RubyEx Ravensflight 5': '4ADF',
        'RubyEx Ravensflight 6': '4AE0',
        'RubyEx Ravensflight 7': '4AE1',
        'RubyEx Ravensflight 8': '4AE2',
        'RubyEx Ravensflight 9': '4AE3',
        'RubyEx Ravensflight 10': '4AE4',
        'RubyEx Ravensflight 11': '4AE5',
        'RubyEx Ravensflight 12': '4AE6',
        'RubyEx Ravensflight 13': '4AE7',
        'RubyEx Ravensflight 14': '4AE8',
        'RubyEx Ravensflight 15': '4AE9',
        'RubyEx Ravensflight 16': '4AEA',
        'RubyEx Ravensflight 17': '4E6B',
        'RubyEx Ravensflight 18': '4E6C',
        'RubyEx Ravensflight 19': '4E6D',
        'RubyEx Ravensflight 20': '4E6E',
        'RubyEx Ravensflight 21': '4E6F',
        'RubyEx Ravensflight 22': '4E70',
        'RubyEx Cut And Run 1': '4B05',
        'RubyEx Cut And Run 2': '4B06',
        'RubyEx Cut And Run 3': '4B07',
        'RubyEx Cut And Run 4': '4B08',
        'RubyEx Cut And Run 5': '4DOD',
        'RubyEx Meteor Burst': '4AF2',
        'RubyEx Bradamante': '4E38',
        'RubyEx Comet Heavy Impact': '4AF6',
    },
    damageFail: {
        'RubyEx Ruby Sphere Burst': '4ACB',
        'RubyEx Lunar Dynamo': '4EB0',
        'RubyEx Iron Chariot': '4EB1',
        'RubyEx Heart In The Machine': '4AFA',
    },
    gainsEffectFail: {
        'RubyEx Hysteria': '128',
    },
    shareWarn: {
        'RubyEx Homing Lasers': '4AD6',
        'RubyEx Meteor Stream': '4E68',
    },
    triggers: [
        {
            id: 'RubyEx Screech',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '4AEE' }),
            deathReason: (_data, matches) => {
                return {
                    type: 'fail',
                    name: matches.target,
                    text: {
                        en: 'Knocked into wall',
                        de: 'Rückstoß in die Wand',
                        ja: '壁へノックバック',
                        cn: '击退至墙',
                        ko: '넉백',
                    },
                };
            },
        },
    ],
};
/* harmony default export */ const ruby_weapon_ex = (ruby_weapon_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/ruby_weapon.ts

// Ruby Normal
const ruby_weapon_triggerSet = {
    zoneId: zone_id/* default.CinderDrift */.Z.CinderDrift,
    damageWarn: {
        'Ruby Ravensclaw': '4A93',
        'Ruby Spike Of Flame 1': '4A9A',
        'Ruby Spike Of Flame 2': '4B2E',
        'Ruby Spike Of Flame 3': '4A94',
        'Ruby Spike Of Flame 4': '4A95',
        'Ruby Spike Of Flame 5': '4D02',
        'Ruby Spike Of Flame 6': '4D03',
        'Ruby Ruby Ray': '4AC6',
        'Ruby Undermine': '4A97',
        'Ruby Ravensflight 1': '4E69',
        'Ruby Ravensflight 2': '4E6A',
        'Ruby Ravensflight 3': '4AA1',
        'Ruby Ravensflight 4': '4AA2',
        'Ruby Ravensflight 5': '4AA3',
        'Ruby Ravensflight 6': '4AA4',
        'Ruby Ravensflight 7': '4AA5',
        'Ruby Ravensflight 8': '4AA6',
        'Ruby Ravensflight 9': '4AA7',
        'Ruby Ravensflight 10': '4C21',
        'Ruby Ravensflight 11': '4C2A',
        'Ruby Comet Burst': '4AB4',
        'Ruby Bradamante': '4ABC',
    },
    shareWarn: {
        'Ruby Homing Laser': '4AC5',
        'Ruby Meteor Stream': '4E67',
    },
};
/* harmony default export */ const ruby_weapon = (ruby_weapon_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/shiva-un.ts


// Shiva Unreal
const shiva_un_triggerSet = {
    zoneId: zone_id/* default.TheAkhAfahAmphitheatreUnreal */.Z.TheAkhAfahAmphitheatreUnreal,
    damageWarn: {
        // Large white circles.
        'ShivaEx Icicle Impact': '537B',
        // "get in" aoe
        'ShivaEx Whiteout': '5376',
        // Avoidable tank stun.
        'ShivaEx Glacier Bash': '5375',
    },
    damageFail: {
        // 270 degree attack.
        'ShivaEx Glass Dance': '5378',
    },
    shareWarn: {
        // Hailstorm spread marker.
        'ShivaEx Hailstorm': '536F',
    },
    shareFail: {
        // Laser.  TODO: maybe blame the person it's on??
        'ShivaEx Avalanche': '5379',
    },
    soloWarn: {
        // Party shared tank buster.
        'ShivaEx Icebrand': '5373',
    },
    triggers: [
        {
            id: 'ShivaEx Deep Freeze',
            type: 'GainsEffect',
            // Shiva also uses ability 537A on you, but it has an unknown name.
            // So, use the effect instead for free translation.
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '1E7' }),
            condition: (_data, matches) => {
                // The intermission also gets this effect, but for a shorter duration.
                return parseFloat(matches.duration) > 20;
            },
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const shiva_un = (shiva_un_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/titania.ts

const titania_triggerSet = {
    zoneId: zone_id/* default.TheDancingPlague */.Z.TheDancingPlague,
    damageWarn: {
        'Titania Wood\'s Embrace': '3D50',
        // 'Titania Frost Rune': '3D4E',
        'Titania Gentle Breeze': '3F83',
        'Titania Leafstorm 1': '3D55',
        'Titania Puck\'s Rebuke': '3D58',
        'Titania Leafstorm 2': '3E03',
    },
    damageFail: {
        'Titania Phantom Rune 1': '3D5D',
        'Titania Phantom Rune 2': '3D5E',
    },
    shareFail: {
        'Titania Divination Rune': '3D5B',
    },
};
/* harmony default export */ const titania = (titania_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/titania-ex.ts

const titania_ex_triggerSet = {
    zoneId: zone_id/* default.TheDancingPlagueExtreme */.Z.TheDancingPlagueExtreme,
    damageWarn: {
        'TitaniaEx Wood\'s Embrace': '3D2F',
        // 'TitaniaEx Frost Rune': '3D2B',
        'TitaniaEx Gentle Breeze': '3F82',
        'TitaniaEx Leafstorm 1': '3D39',
        'TitaniaEx Puck\'s Rebuke': '3D43',
        'TitaniaEx Wallop': '3D3B',
        'TitaniaEx Leafstorm 2': '3D49',
    },
    damageFail: {
        'TitaniaEx Phantom Rune 1': '3D4C',
        'TitaniaEx Phantom Rune 2': '3D4D',
    },
    shareFail: {
        // TODO: This could maybe blame the person with the tether?
        'TitaniaEx Thunder Rune': '3D29',
        'TitaniaEx Divination Rune': '3D4A',
    },
};
/* harmony default export */ const titania_ex = (titania_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/titan-un.ts

// Titan Unreal
const titan_un_triggerSet = {
    zoneId: zone_id/* default.TheNavelUnreal */.Z.TheNavelUnreal,
    damageWarn: {
        'TitanUn Weight Of The Land': '58FE',
        'TitanUn Burst': '5ADF',
    },
    damageFail: {
        'TitanUn Landslide': '5ADC',
        'TitanUn Gaoler Landslide': '5902',
    },
    shareWarn: {
        'TitanUn Rock Buster': '58F6',
    },
    shareFail: {
        'TitanUn Mountain Buster': '58F7',
    },
};
/* harmony default export */ const titan_un = (titan_un_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/varis-ex.ts



const varis_ex_triggerSet = {
    zoneId: zone_id/* default.MemoriaMiseraExtreme */.Z.MemoriaMiseraExtreme,
    damageWarn: {
        'VarisEx Alea Iacta Est 1': '4CD2',
        'VarisEx Alea Iacta Est 2': '4CD3',
        'VarisEx Alea Iacta Est 3': '4CD4',
        'VarisEx Alea Iacta Est 4': '4CD5',
        'VarisEx Alea Iacta Est 5': '4CD6',
        'VarisEx Ignis Est 1': '4CB5',
        'VarisEx Ignis Est 2': '4CC5',
        'VarisEx Ventus Est 1': '4CC7',
        'VarisEx Ventus Est 2': '4CC8',
        'VarisEx Assault Cannon': '4CE5',
        'VarisEx Fortius Rotating': '4CE9',
    },
    damageFail: {
        // Don't hit the shields!
        'VarisEx Repay': '4CDD',
    },
    shareWarn: {
        // This is the "protean" fortius.
        'VarisEx Fortius Protean': '4CE7',
    },
    shareFail: {
        'VarisEx Magitek Burst': '4CDF',
        'VarisEx Aetherochemical Grenado': '4CED',
    },
    triggers: [
        {
            id: 'VarisEx Terminus Est',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4CB4', ...oopsy_common/* playerDamageFields */.np }),
            suppressSeconds: 1,
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const varis_ex = (varis_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/wol.ts


// TODO: Radiant Braver is 4F16/4F17(x2), shouldn't get hit by both?
// TODO: Radiant Desperado is 4F18/4F19, shouldn't get hit by both?
// TODO: Radiant Meteor is 4F1A, and shouldn't get hit by more than 1?
// TODO: missing a tower?
// Note: Deliberately not including pyretic damage as an error.
// Note: It doesn't appear that there's any way to tell who failed the cutscene.
const wol_triggerSet = {
    zoneId: zone_id/* default.TheSeatOfSacrifice */.Z.TheSeatOfSacrifice,
    damageWarn: {
        'WOL Solemn Confiteor': '4F2A',
        'WOL Coruscant Saber In': '4F10',
        'WOL Coruscant Saber Out': '4F11',
        'WOL Imbued Corusance Out': '4F4B',
        'WOL Imbued Corusance In': '4F4C',
        'WOL Shining Wave': '4F26',
        'WOL Cauterize': '4F25',
        'WOL Brimstone Earth 1': '4F1E',
        'WOL Brimstone Earth 2': '4F1F',
        'WOL Flare Breath': '4F24',
        'WOL Decimation': '4F23',
    },
    gainsEffectWarn: {
        'WOL Deep Freeze': '4E6',
    },
    triggers: [
        {
            id: 'WOL True Walking Dead',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '38E' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (_data, matches) => {
                return { type: 'fail', name: matches.target, text: matches.effect };
            },
        },
    ],
};
/* harmony default export */ const wol = (wol_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/trial/wol-ex.ts


// TODO: Radiant Braver is 4EF7/4EF8(x2), shouldn't get hit by both?
// TODO: Radiant Desperado is 4EF9/4EFA, shouldn't get hit by both?
// TODO: Radiant Meteor is 4EFC, and shouldn't get hit by more than 1?
// TODO: Absolute Holy should be shared?
// TODO: intersecting brimstones?
const wol_ex_triggerSet = {
    zoneId: zone_id/* default.TheSeatOfSacrificeExtreme */.Z.TheSeatOfSacrificeExtreme,
    damageWarn: {
        'WOLEx Solemn Confiteor': '4F0C',
        'WOLEx Coruscant Saber In': '4EF2',
        'WOLEx Coruscant Saber Out': '4EF1',
        'WOLEx Imbued Corusance Out': '4F49',
        'WOLEx Imbued Corusance In': '4F4A',
        'WOLEx Shining Wave': '4F08',
        'WOLEx Cauterize': '4F07',
        'WOLEx Brimstone Earth': '4F00',
    },
    gainsEffectWarn: {
        'WOLEx Deep Freeze': '4E6',
        'WOLEx Damage Down': '274',
    },
    shareWarn: {
        'WOLEx Absolute Stone III': '4EEB',
        'WOLEx Flare Breath': '4F06',
        'WOLEx Perfect Decimation': '4F05',
    },
    soloWarn: {
        'WolEx Katon San Share': '4EFE',
    },
    triggers: [
        {
            id: 'WOLEx True Walking Dead',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '8FF' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (_data, matches) => {
                return { type: 'fail', name: matches.target, text: matches.effect };
            },
        },
        {
            id: 'WOLEx Tower',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '4F04', capture: false }),
            mistake: {
                type: 'fail',
                text: {
                    en: 'Missed Tower',
                    de: 'Turm verpasst',
                    fr: 'Tour manquée',
                    ja: '塔を踏まなかった',
                    cn: '没踩塔',
                    ko: '장판 실수',
                },
            },
        },
        {
            id: 'WOLEx True Hallowed Ground',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: '4F44' }),
            mistake: (_data, matches) => {
                return { type: 'fail', text: matches.ability };
            },
        },
        {
            // For Berserk and Deep Darkside
            id: 'WOLEx Missed Interrupt',
            type: 'Ability',
            netRegex: netregexes/* default.ability */.Z.ability({ id: ['5156', '5158'] }),
            mistake: (_data, matches) => {
                return { type: 'fail', text: matches.ability };
            },
        },
    ],
};
/* harmony default export */ const wol_ex = (wol_ex_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/05-shb/ultimate/the_epic_of_alexander.ts



// TODO: FIX luminous aetheroplasm warning not working
// TODO: FIX doll death not working
// TODO: failing hand of pain/parting (check for high damage?)
// TODO: make sure everybody takes exactly one protean (rather than watching double hits)
// TODO: thunder not hitting exactly 2?
// TODO: person with water/thunder debuff dying
// TODO: bad nisi pass
// TODO: failed gavel mechanic
// TODO: double rocket punch not hitting exactly 2? (or tanks)
// TODO: standing in sludge puddles before hidden mine?
// TODO: hidden mine failure?
// TODO: failures of ordained motion / stillness
// TODO: failures of plaint of severity (tethers)
// TODO: failures of plaint of solidarity (shared sentence)
// TODO: ordained capital punishment hitting non-tanks
const the_epic_of_alexander_triggerSet = {
    zoneId: zone_id/* default.TheEpicOfAlexanderUltimate */.Z.TheEpicOfAlexanderUltimate,
    damageWarn: {
        'TEA Sluice': '49B1',
        'TEA Protean Wave 1': '4824',
        'TEA Protean Wave 2': '49B5',
        'TEA Spin Crusher': '4A72',
        'TEA Sacrament': '485F',
        'TEA Radiant Sacrament': '4886',
        'TEA Almighty Judgment': '4890',
    },
    damageFail: {
        'TEA Hawk Blaster': '4830',
        'TEA Chakram': '4855',
        'TEA Enumeration': '4850',
        'TEA Apocalyptic Ray': '484C',
        'TEA Propeller Wind': '4832',
    },
    shareWarn: {
        'TEA Protean Wave Double 1': '49B6',
        'TEA Protean Wave Double 2': '4825',
        'TEA Fluid Swing': '49B0',
        'TEA Fluid Strike': '49B7',
        'TEA Hidden Mine': '4852',
        'TEA Alpha Sword': '486B',
        'TEA Flarethrower': '486B',
        'TEA Chastening Heat': '4A80',
        'TEA Divine Spear': '4A82',
        'TEA Ordained Punishment': '4891',
        // Optical Spread
        'TEA Individual Reprobation': '488C',
    },
    soloFail: {
        // Optical Stack
        'TEA Collective Reprobation': '488D',
    },
    triggers: [
        {
            // "too much luminous aetheroplasm"
            // When this happens, the target explodes, hitting nearby people
            // but also themselves.
            id: 'TEA Exhaust',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '481F', ...oopsy_common/* playerDamageFields */.np }),
            condition: (_data, matches) => matches.target === matches.source,
            mistake: (_data, matches) => {
                return {
                    type: 'fail',
                    blame: matches.target,
                    text: {
                        en: 'luminous aetheroplasm',
                        de: 'Luminiszentes Ätheroplasma',
                        fr: 'Éthéroplasma lumineux',
                        ja: '光性爆雷',
                        cn: '光性爆雷',
                    },
                };
            },
        },
        {
            id: 'TEA Dropsy',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '121' }),
            mistake: (_data, matches) => {
                return { type: 'warn', blame: matches.target, text: matches.effect };
            },
        },
        {
            id: 'TEA Tether Tracking',
            type: 'Tether',
            netRegex: netregexes/* default.tether */.Z.tether({ source: 'Jagd Doll', id: '0011' }),
            run: (data, matches) => {
                var _a;
                (_a = data.jagdTether) !== null && _a !== void 0 ? _a : (data.jagdTether = {});
                data.jagdTether[matches.sourceId] = matches.target;
            },
        },
        {
            id: 'TEA Reducible Complexity',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4821', ...oopsy_common/* playerDamageFields */.np }),
            mistake: (data, matches) => {
                return {
                    type: 'fail',
                    // This may be undefined, which is fine.
                    name: data.jagdTether ? data.jagdTether[matches.sourceId] : undefined,
                    text: {
                        en: 'Doll Death',
                        de: 'Puppe Tot',
                        fr: 'Poupée morte',
                        ja: 'ドールが死んだ',
                        cn: '浮士德死亡',
                    },
                };
            },
        },
        {
            id: 'TEA Drainage',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '4827', ...oopsy_common/* playerDamageFields */.np }),
            condition: (data, matches) => !data.party.isTank(matches.target),
            mistake: (_data, matches) => {
                return { type: 'fail', name: matches.target, text: matches.ability };
            },
        },
        {
            id: 'TEA Throttle Gain',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '2BC' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasThrottle) !== null && _a !== void 0 ? _a : (data.hasThrottle = {});
                data.hasThrottle[matches.target] = true;
            },
        },
        {
            id: 'TEA Throttle Lose',
            type: 'LosesEffect',
            netRegex: netregexes/* default.losesEffect */.Z.losesEffect({ effectId: '2BC' }),
            run: (data, matches) => {
                var _a;
                (_a = data.hasThrottle) !== null && _a !== void 0 ? _a : (data.hasThrottle = {});
                data.hasThrottle[matches.target] = false;
            },
        },
        {
            id: 'TEA Throttle',
            type: 'GainsEffect',
            netRegex: netregexes/* default.gainsEffect */.Z.gainsEffect({ effectId: '2BC' }),
            delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
            deathReason: (data, matches) => {
                if (!data.hasThrottle)
                    return;
                if (!data.hasThrottle[matches.target])
                    return;
                return {
                    name: matches.target,
                    text: matches.effect,
                };
            },
        },
        {
            // Balloon Popping.  It seems like the person who pops it is the
            // first person listed damage-wise, so they are likely the culprit.
            id: 'TEA Outburst',
            type: 'Ability',
            netRegex: netregexes/* default.abilityFull */.Z.abilityFull({ id: '482A', ...oopsy_common/* playerDamageFields */.np }),
            suppressSeconds: 5,
            mistake: (_data, matches) => {
                return { type: 'fail', blame: matches.target, text: matches.source };
            },
        },
    ],
};
/* harmony default export */ const the_epic_of_alexander = (the_epic_of_alexander_triggerSet);

;// CONCATENATED MODULE: ./ui/oopsyraidsy/data/oopsy_manifest.txt



































































































/* harmony default export */ const oopsy_manifest = ({'00-misc/buffs.ts': buffs,'00-misc/general.ts': general,'00-misc/test.ts': test,'02-arr/trial/ifrit-nm.ts': ifrit_nm,'02-arr/trial/titan-nm.ts': titan_nm,'02-arr/trial/levi-ex.ts': levi_ex,'02-arr/trial/shiva-hm.ts': shiva_hm,'02-arr/trial/shiva-ex.ts': shiva_ex,'02-arr/trial/titan-hm.ts': titan_hm,'02-arr/trial/titan-ex.ts': titan_ex,'03-hw/alliance/weeping_city.ts': weeping_city,'03-hw/dungeon/aetherochemical_research_facility.ts': aetherochemical_research_facility,'03-hw/dungeon/fractal_continuum.ts': fractal_continuum,'03-hw/dungeon/gubal_library_hard.ts': gubal_library_hard,'03-hw/dungeon/sohm_al_hard.ts': sohm_al_hard,'03-hw/raid/a12n.ts': a12n,'04-sb/dungeon/ala_mhigo.ts': ala_mhigo,'04-sb/dungeon/bardams_mettle.ts': bardams_mettle,'04-sb/dungeon/drowned_city_of_skalla.ts': drowned_city_of_skalla,'04-sb/dungeon/kugane_castle.ts': kugane_castle,'04-sb/dungeon/st_mocianne_hard.ts': st_mocianne_hard,'04-sb/dungeon/swallows_compass.ts': swallows_compass,'04-sb/dungeon/temple_of_the_fist.ts': temple_of_the_fist,'04-sb/dungeon/the_burn.ts': the_burn,'04-sb/raid/o1n.ts': o1n,'04-sb/raid/o2n.ts': o2n,'04-sb/raid/o3n.ts': o3n,'04-sb/raid/o4n.ts': o4n,'04-sb/raid/o4s.ts': o4s,'04-sb/raid/o7s.ts': o7s,'04-sb/raid/o12s.ts': o12s,'04-sb/trial/byakko-ex.ts': byakko_ex,'04-sb/trial/shinryu.ts': shinryu,'04-sb/trial/susano-ex.ts': susano_ex,'04-sb/trial/suzaku.ts': suzaku,'04-sb/ultimate/ultima_weapon_ultimate.ts': ultima_weapon_ultimate,'04-sb/ultimate/unending_coil_ultimate.ts': unending_coil_ultimate,'05-shb/alliance/the_copied_factory.ts': the_copied_factory,'05-shb/alliance/the_puppets_bunker.ts': the_puppets_bunker,'05-shb/alliance/the_tower_at_paradigms_breach.ts': the_tower_at_paradigms_breach,'05-shb/dungeon/akadaemia_anyder.ts': akadaemia_anyder,'05-shb/dungeon/amaurot.ts': amaurot,'05-shb/dungeon/anamnesis_anyder.ts': anamnesis_anyder,'05-shb/dungeon/dohn_mheg.ts': dohn_mheg,'05-shb/dungeon/heroes_gauntlet.ts': heroes_gauntlet,'05-shb/dungeon/holminster_switch.ts': holminster_switch,'05-shb/dungeon/malikahs_well.ts': malikahs_well,'05-shb/dungeon/matoyas_relict.ts': matoyas_relict,'05-shb/dungeon/mt_gulg.ts': mt_gulg,'05-shb/dungeon/paglthan.ts': paglthan,'05-shb/dungeon/qitana_ravel.ts': qitana_ravel,'05-shb/dungeon/the_grand_cosmos.ts': the_grand_cosmos,'05-shb/dungeon/twinning.ts': twinning,'05-shb/eureka/delubrum_reginae.ts': delubrum_reginae,'05-shb/eureka/delubrum_reginae_savage.ts': delubrum_reginae_savage,'05-shb/raid/e1n.ts': e1n,'05-shb/raid/e1s.ts': e1s,'05-shb/raid/e2n.ts': e2n,'05-shb/raid/e2s.ts': e2s,'05-shb/raid/e3n.ts': e3n,'05-shb/raid/e3s.ts': e3s,'05-shb/raid/e4n.ts': e4n,'05-shb/raid/e4s.ts': e4s,'05-shb/raid/e5n.ts': e5n,'05-shb/raid/e5s.ts': e5s,'05-shb/raid/e6n.ts': e6n,'05-shb/raid/e6s.ts': e6s,'05-shb/raid/e7n.ts': e7n,'05-shb/raid/e7s.ts': e7s,'05-shb/raid/e8n.ts': e8n,'05-shb/raid/e8s.ts': e8s,'05-shb/raid/e9n.ts': e9n,'05-shb/raid/e9s.ts': e9s,'05-shb/raid/e10n.ts': e10n,'05-shb/raid/e10s.ts': e10s,'05-shb/raid/e11n.ts': e11n,'05-shb/raid/e11s.ts': e11s,'05-shb/raid/e12n.ts': e12n,'05-shb/raid/e12s.ts': e12s,'05-shb/trial/diamond_weapon-ex.ts': diamond_weapon_ex,'05-shb/trial/diamond_weapon.ts': diamond_weapon,'05-shb/trial/emerald_weapon-ex.ts': emerald_weapon_ex,'05-shb/trial/emerald_weapon.ts': emerald_weapon,'05-shb/trial/hades-ex.ts': hades_ex,'05-shb/trial/hades.ts': hades,'05-shb/trial/innocence-ex.ts': innocence_ex,'05-shb/trial/innocence.ts': innocence,'05-shb/trial/levi-un.ts': levi_un,'05-shb/trial/ruby_weapon-ex.ts': ruby_weapon_ex,'05-shb/trial/ruby_weapon.ts': ruby_weapon,'05-shb/trial/shiva-un.ts': shiva_un,'05-shb/trial/titania.ts': titania,'05-shb/trial/titania-ex.ts': titania_ex,'05-shb/trial/titan-un.ts': titan_un,'05-shb/trial/varis-ex.ts': varis_ex,'05-shb/trial/wol.ts': wol,'05-shb/trial/wol-ex.ts': wol_ex,'05-shb/ultimate/the_epic_of_alexander.ts': the_epic_of_alexander,});

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL2J1ZmZzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAwLW1pc2MvZ2VuZXJhbC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMC1taXNjL3Rlc3QudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL2lmcml0LW5tLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1ubS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvbGV2aS1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvc2hpdmEtaG0udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDItYXJyL3RyaWFsL3NoaXZhLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAyLWFyci90cmlhbC90aXRhbi1obS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wMi1hcnIvdHJpYWwvdGl0YW4tZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzAzLWh3L2R1bmdlb24vZnJhY3RhbF9jb250aW51dW0udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDMtaHcvcmFpZC9hMTJuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9kcm93bmVkX2NpdHlfb2Zfc2thbGxhLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24va3VnYW5lX2Nhc3RsZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi9kdW5nZW9uL3N0X21vY2lhbm5lX2hhcmQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvZHVuZ2Vvbi9zd2FsbG93c19jb21wYXNzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL2R1bmdlb24vdGhlX2J1cm4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvcmFpZC9vMW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvcmFpZC9vMm4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvcmFpZC9vM24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvcmFpZC9vNG4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvcmFpZC9vNHMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvcmFpZC9vN3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvcmFpZC9vMTJzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL2J5YWtrby1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi90cmlhbC9zaGlucnl1LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA0LXNiL3RyaWFsL3N1c2Fuby1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi90cmlhbC9zdXpha3UudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDQtc2IvdWx0aW1hdGUvdWx0aW1hX3dlYXBvbl91bHRpbWF0ZS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNC1zYi91bHRpbWF0ZS91bmVuZGluZ19jb2lsX3VsdGltYXRlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9hbGxpYW5jZS90aGVfY29waWVkX2ZhY3RvcnkudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2FsbGlhbmNlL3RoZV9wdXBwZXRzX2J1bmtlci50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvYWxsaWFuY2UvdGhlX3Rvd2VyX2F0X3BhcmFkaWdtc19icmVhY2gudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vYWthZGFlbWlhX2FueWRlci50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9hbWF1cm90LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2FuYW1uZXNpc19hbnlkZXIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vZG9obl9taGVnLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL2hlcm9lc19nYXVudGxldC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9ob2xtaW5zdGVyX3N3aXRjaC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvZHVuZ2Vvbi9tYWxpa2Foc193ZWxsLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL21hdG95YXNfcmVsaWN0LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL210X2d1bGcudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vcGFnbHRoYW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vcWl0YW5hX3JhdmVsLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9kdW5nZW9uL3RoZV9ncmFuZF9jb3Ntb3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2R1bmdlb24vdHdpbm5pbmcudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZV9zYXZhZ2UudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTFuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uxcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMm4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTJzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2Uzbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lM3MudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTRuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U0cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTVzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U2bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lNnMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTduLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U3cy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOG4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZThzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2U5bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lOXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTEwbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTBzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMW4udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3JhaWQvZTExcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvcmFpZC9lMTJuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi9yYWlkL2UxMnMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24tZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9oYWRlcy1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaGFkZXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL2lubm9jZW5jZS1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvaW5ub2NlbmNlLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9sZXZpLXVuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi1leC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvcnVieV93ZWFwb24udHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3NoaXZhLXVuLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC90aXRhbmlhLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC90aXRhbmlhLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi90cmlhbC90aXRhbi11bi50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvdmFyaXMtZXgudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvMDUtc2hiL3RyaWFsL3dvbC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvb29wc3lyYWlkc3kvZGF0YS8wNS1zaGIvdHJpYWwvd29sLWV4LnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS9vb3BzeXJhaWRzeS9kYXRhLzA1LXNoYi91bHRpbWF0ZS90aGVfZXBpY19vZl9hbGV4YW5kZXIudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL29vcHN5cmFpZHN5L2RhdGEvb29wc3lfbWFuaWZlc3QudHh0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQTBEO0FBQ1A7QUFhbkQsMEJBQTBCO0FBQzFCLE1BQU0scUJBQXFCLEdBQUcsR0FBRyxDQUFDO0FBQ2xDLHdFQUF3RTtBQUN4RSxNQUFNLG9CQUFvQixHQUFHLEdBQUcsQ0FBQztBQUVqQyxNQUFNLHNCQUFzQixHQUFHLENBQUMsSUFBVSxFQUFFLE9BQW9CLEVBQUUsRUFBRTtJQUNsRSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ2hELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztRQUN4QyxPQUFPLElBQUksQ0FBQztJQUVkLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUN2QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FB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Z0JBQU0sK0JBQStCLFFBQU0sc0NBQXNDLGdCQUFNLDZDQUE2Qyx1QkFBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx1QkFBdUIsR0FBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSx3QkFBd0IsSUFBTSxzQ0FBc0MsaUJBQU0sbUNBQW1DLGNBQU0sc0NBQXNDLGlCQUFNLG1DQUFtQyxjQUFNLDZCQUE2QixRQUFNLDBCQUEwQixLQUFNLGlDQUFpQyxZQUFNLDhCQUE4QixTQUFNLDRCQUE0QixPQUFNLG1DQUFtQyxjQUFNLGdDQUFnQyxXQUFNLDZCQUE2QixRQUFNLDRCQUE0QixPQUFNLCtCQUErQixVQUFNLDZCQUE2QixRQUFNLDZCQUE2QixRQUFNLHdCQUF3QixHQUFNLDJCQUEyQixNQUFNLDZDQUE2QyxxQkFBTSxFQUFFLEUiLCJmaWxlIjoidWkvY29tbW9uL29vcHN5cmFpZHN5X2RhdGEuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE5ldE1hdGNoZXMgfSBmcm9tICcuLi8uLi8uLi8uLi90eXBlcy9uZXRfbWF0Y2hlcyc7XHJcbmltcG9ydCB7IENhY3Rib3RCYXNlUmVnRXhwIH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvbmV0X3RyaWdnZXInO1xyXG5pbXBvcnQgeyBPb3BzeU1pc3Rha2VUeXBlLCBPb3BzeVRyaWdnZXJHZW5lcmljLCBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG50eXBlIEJ1ZmZNYXRjaGVzID0gTmV0TWF0Y2hlc1snQWJpbGl0eSddIHwgTmV0TWF0Y2hlc1snR2FpbnNFZmZlY3QnXTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uPzogeyBbdHJpZ2dlcklkOiBzdHJpbmddOiBCdWZmTWF0Y2hlc1tdIH07XHJcbiAgcGV0SWRUb093bmVySWQ/OiB7IFtwZXRJZDogc3RyaW5nXTogc3RyaW5nIH07XHJcbn1cclxuXHJcbi8vIEFiaWxpdGllcyBzZWVtIGluc3RhbnQuXHJcbmNvbnN0IGFiaWxpdHlDb2xsZWN0U2Vjb25kcyA9IDAuNTtcclxuLy8gT2JzZXJ2YXRpb246IHVwIHRvIH4xLjIgc2Vjb25kcyBmb3IgYSBidWZmIHRvIHJvbGwgdGhyb3VnaCB0aGUgcGFydHkuXHJcbmNvbnN0IGVmZmVjdENvbGxlY3RTZWNvbmRzID0gMi4wO1xyXG5cclxuY29uc3QgaXNJblBhcnR5Q29uZGl0aW9uRnVuYyA9IChkYXRhOiBEYXRhLCBtYXRjaGVzOiBCdWZmTWF0Y2hlcykgPT4ge1xyXG4gIGNvbnN0IHNvdXJjZUlkID0gbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpO1xyXG4gIGlmIChkYXRhLnBhcnR5LnBhcnR5SWRzLmluY2x1ZGVzKHNvdXJjZUlkKSlcclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICBpZiAoZGF0YS5wZXRJZFRvT3duZXJJZCkge1xyXG4gICAgY29uc3Qgb3duZXJJZCA9IGRhdGEucGV0SWRUb093bmVySWRbc291cmNlSWRdO1xyXG4gICAgaWYgKG93bmVySWQgJiYgZGF0YS5wYXJ0eS5wYXJ0eUlkcy5pbmNsdWRlcyhvd25lcklkKSlcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5jb25zdCBtaXNzZWRGdW5jID0gPFQgZXh0ZW5kcyAnQWJpbGl0eScgfCAnR2FpbnNFZmZlY3QnPihhcmdzOiB7XHJcbiAgdHJpZ2dlcklkOiBzdHJpbmc7XHJcbiAgcmVnZXhUeXBlOiBUO1xyXG4gIG5ldFJlZ2V4OiBDYWN0Ym90QmFzZVJlZ0V4cDxUPjtcclxuICBmaWVsZDogc3RyaW5nO1xyXG4gIHR5cGU6IE9vcHN5TWlzdGFrZVR5cGU7XHJcbiAgaWdub3JlU2VsZj86IGJvb2xlYW47XHJcbiAgY29sbGVjdFNlY29uZHM6IG51bWJlcjtcclxufSk6IE9vcHN5VHJpZ2dlckdlbmVyaWM8RGF0YSwgVD5bXSA9PiBbXHJcbiAge1xyXG4gICAgLy8gU3VyZSwgbm90IGFsbCBvZiB0aGVzZSBhcmUgXCJidWZmc1wiIHBlciBzZSwgYnV0IHRoZXkncmUgYWxsIGluIHRoZSBidWZmcyBmaWxlLlxyXG4gICAgaWQ6IGBCdWZmICR7YXJncy50cmlnZ2VySWR9IENvbGxlY3RgLFxyXG4gICAgdHlwZTogYXJncy5yZWdleFR5cGUsXHJcbiAgICBuZXRSZWdleDogYXJncy5uZXRSZWdleCxcclxuICAgIGNvbmRpdGlvbjogaXNJblBhcnR5Q29uZGl0aW9uRnVuYyxcclxuICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb24gPz89IHt9O1xyXG4gICAgICBjb25zdCBhcnIgPSBkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvblthcmdzLnRyaWdnZXJJZF0gPz89IFtdO1xyXG4gICAgICBhcnIucHVzaChtYXRjaGVzKTtcclxuICAgIH0sXHJcbiAgfSxcclxuICB7XHJcbiAgICBpZDogYEJ1ZmYgJHthcmdzLnRyaWdnZXJJZH1gLFxyXG4gICAgdHlwZTogYXJncy5yZWdleFR5cGUsXHJcbiAgICBuZXRSZWdleDogYXJncy5uZXRSZWdleCxcclxuICAgIGNvbmRpdGlvbjogaXNJblBhcnR5Q29uZGl0aW9uRnVuYyxcclxuICAgIGRlbGF5U2Vjb25kczogYXJncy5jb2xsZWN0U2Vjb25kcyxcclxuICAgIHN1cHByZXNzU2Vjb25kczogYXJncy5jb2xsZWN0U2Vjb25kcyxcclxuICAgIG1pc3Rha2U6IChkYXRhKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFsbE1hdGNoZXMgPSBkYXRhLmdlbmVyYWxCdWZmQ29sbGVjdGlvbj8uW2FyZ3MudHJpZ2dlcklkXTtcclxuICAgICAgY29uc3QgZmlyc3RNYXRjaCA9IGFsbE1hdGNoZXM/LlswXTtcclxuICAgICAgY29uc3QgdGhpbmdOYW1lID0gZmlyc3RNYXRjaD8uW2FyZ3MuZmllbGRdO1xyXG4gICAgICBpZiAoIWFsbE1hdGNoZXMgfHwgIWZpcnN0TWF0Y2ggfHwgIXRoaW5nTmFtZSlcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBjb25zdCBwYXJ0eU5hbWVzID0gZGF0YS5wYXJ0eS5wYXJ0eU5hbWVzO1xyXG5cclxuICAgICAgLy8gVE9ETzogY29uc2lkZXIgZGVhZCBwZW9wbGUgc29tZWhvd1xyXG4gICAgICBjb25zdCBnb3RCdWZmTWFwOiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcclxuICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHBhcnR5TmFtZXMpXHJcbiAgICAgICAgZ290QnVmZk1hcFtuYW1lXSA9IGZhbHNlO1xyXG5cclxuICAgICAgbGV0IHNvdXJjZU5hbWUgPSBmaXJzdE1hdGNoLnNvdXJjZTtcclxuICAgICAgLy8gQmxhbWUgcGV0IG1pc3Rha2VzIG9uIG93bmVycy5cclxuICAgICAgaWYgKGRhdGEucGV0SWRUb093bmVySWQpIHtcclxuICAgICAgICBjb25zdCBwZXRJZCA9IGZpcnN0TWF0Y2guc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBvd25lcklkID0gZGF0YS5wZXRJZFRvT3duZXJJZFtwZXRJZF07XHJcbiAgICAgICAgaWYgKG93bmVySWQpIHtcclxuICAgICAgICAgIGNvbnN0IG93bmVyTmFtZSA9IGRhdGEucGFydHkubmFtZUZyb21JZChvd25lcklkKTtcclxuICAgICAgICAgIGlmIChvd25lck5hbWUpXHJcbiAgICAgICAgICAgIHNvdXJjZU5hbWUgPSBvd25lck5hbWU7XHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENvdWxkbid0IGZpbmQgbmFtZSBmb3IgJHtvd25lcklkfSBmcm9tIHBldCAke3BldElkfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFyZ3MuaWdub3JlU2VsZilcclxuICAgICAgICBnb3RCdWZmTWFwW3NvdXJjZU5hbWVdID0gdHJ1ZTtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgbWF0Y2hlcyBvZiBhbGxNYXRjaGVzKSB7XHJcbiAgICAgICAgLy8gSW4gY2FzZSB5b3UgaGF2ZSBtdWx0aXBsZSBwYXJ0eSBtZW1iZXJzIHdobyBoaXQgdGhlIHNhbWUgY29vbGRvd24gYXQgdGhlIHNhbWVcclxuICAgICAgICAvLyB0aW1lIChsb2w/KSwgdGhlbiBpZ25vcmUgYW55Ym9keSB3aG8gd2Fzbid0IHRoZSBmaXJzdC5cclxuICAgICAgICBpZiAobWF0Y2hlcy5zb3VyY2UgIT09IGZpcnN0TWF0Y2guc291cmNlKVxyXG4gICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgIGdvdEJ1ZmZNYXBbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbWlzc2VkID0gT2JqZWN0LmtleXMoZ290QnVmZk1hcCkuZmlsdGVyKCh4KSA9PiAhZ290QnVmZk1hcFt4XSk7XHJcbiAgICAgIGlmIChtaXNzZWQubGVuZ3RoID09PSAwKVxyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIC8vIFRPRE86IG9vcHN5IGNvdWxkIHJlYWxseSB1c2UgbW91c2VvdmVyIHBvcHVwcyBmb3IgZGV0YWlscy5cclxuICAgICAgLy8gVE9ETzogYWx0ZXJuYXRpdmVseSwgaWYgd2UgaGF2ZSBhIGRlYXRoIHJlcG9ydCwgaXQnZCBiZSBnb29kIHRvXHJcbiAgICAgIC8vIGV4cGxpY2l0bHkgY2FsbCBvdXQgdGhhdCBvdGhlciBwZW9wbGUgZ290IGEgaGVhbCB0aGlzIHBlcnNvbiBkaWRuJ3QuXHJcbiAgICAgIGlmIChtaXNzZWQubGVuZ3RoIDwgNCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiBhcmdzLnR5cGUsXHJcbiAgICAgICAgICBibGFtZTogc291cmNlTmFtZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke3RoaW5nTmFtZX0gbWlzc2VkICR7bWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJyl9YCxcclxuICAgICAgICAgICAgZGU6IGAke3RoaW5nTmFtZX0gdmVyZmVobHQgJHttaXNzZWQubWFwKCh4KSA9PiBkYXRhLlNob3J0TmFtZSh4KSkuam9pbignLCAnKX1gLFxyXG4gICAgICAgICAgICBmcjogYCR7dGhpbmdOYW1lfSBtYW5xdcOpKGUpIHN1ciAke21pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpfWAsXHJcbiAgICAgICAgICAgIGphOiBgKCR7bWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJyl9KSDjgYwke3RoaW5nTmFtZX3jgpLlj5fjgZHjgarjgYvjgaPjgZ9gLFxyXG4gICAgICAgICAgICBjbjogYCR7bWlzc2VkLm1hcCgoeCkgPT4gZGF0YS5TaG9ydE5hbWUoeCkpLmpvaW4oJywgJyl9IOayoeWPl+WIsCAke3RoaW5nTmFtZX1gLFxyXG4gICAgICAgICAgICBrbzogYCR7dGhpbmdOYW1lfSAke21pc3NlZC5tYXAoKHgpID0+IGRhdGEuU2hvcnROYW1lKHgpKS5qb2luKCcsICcpfeyXkOqyjCDsoIHsmqnslYjrkKhgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIC8vIElmIHRoZXJlJ3MgdG9vIG1hbnkgcGVvcGxlLCBqdXN0IGxpc3QgdGhlIG51bWJlciBvZiBwZW9wbGUgbWlzc2VkLlxyXG4gICAgICAvLyBUT0RPOiB3ZSBjb3VsZCBhbHNvIGxpc3QgZXZlcnlib2R5IG9uIHNlcGFyYXRlIGxpbmVzP1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHR5cGU6IGFyZ3MudHlwZSxcclxuICAgICAgICBibGFtZTogc291cmNlTmFtZSxcclxuICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICBlbjogYCR7dGhpbmdOYW1lfSBtaXNzZWQgJHttaXNzZWQubGVuZ3RofSBwZW9wbGVgLFxyXG4gICAgICAgICAgZGU6IGAke3RoaW5nTmFtZX0gdmVyZmVobHRlICR7bWlzc2VkLmxlbmd0aH0gUGVyc29uZW5gLFxyXG4gICAgICAgICAgZnI6IGAke3RoaW5nTmFtZX0gbWFucXXDqShlKSBzdXIgJHttaXNzZWQubGVuZ3RofSBwZXJzb25uZXNgLFxyXG4gICAgICAgICAgamE6IGAke21pc3NlZC5sZW5ndGh95Lq644GMJHt0aGluZ05hbWV944KS5Y+X44GR44Gq44GL44Gj44GfYCxcclxuICAgICAgICAgIGNuOiBg5pyJJHttaXNzZWQubGVuZ3RofeS6uuayoeWPl+WIsCAke3RoaW5nTmFtZX1gLFxyXG4gICAgICAgICAga286IGAke3RoaW5nTmFtZX0gJHttaXNzZWQubGVuZ3RofeuqheyXkOqyjCDsoIHsmqnslYjrkKhgLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICBpZiAoZGF0YS5nZW5lcmFsQnVmZkNvbGxlY3Rpb24pXHJcbiAgICAgICAgZGVsZXRlIGRhdGEuZ2VuZXJhbEJ1ZmZDb2xsZWN0aW9uW2FyZ3MudHJpZ2dlcklkXTtcclxuICAgIH0sXHJcbiAgfSxcclxuXTtcclxuXHJcbmNvbnN0IG1pc3NlZE1pdGlnYXRpb25CdWZmID0gKGFyZ3M6IHsgaWQ6IHN0cmluZzsgZWZmZWN0SWQ6IHN0cmluZztcclxuICBpZ25vcmVTZWxmPzogYm9vbGVhbjsgY29sbGVjdFNlY29uZHM/OiBudW1iZXI7IH0pID0+IHtcclxuICBpZiAoIWFyZ3MuZWZmZWN0SWQpXHJcbiAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGVmZmVjdElkOiAnICsgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gIHJldHVybiBtaXNzZWRGdW5jKHtcclxuICAgIHRyaWdnZXJJZDogYXJncy5pZCxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6IGFyZ3MuZWZmZWN0SWQgfSksXHJcbiAgICByZWdleFR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICBmaWVsZDogJ2VmZmVjdCcsXHJcbiAgICB0eXBlOiAnaGVhbCcsXHJcbiAgICBpZ25vcmVTZWxmOiBhcmdzLmlnbm9yZVNlbGYsXHJcbiAgICBjb2xsZWN0U2Vjb25kczogYXJncy5jb2xsZWN0U2Vjb25kcyA/IGFyZ3MuY29sbGVjdFNlY29uZHMgOiBlZmZlY3RDb2xsZWN0U2Vjb25kcyxcclxuICB9KTtcclxufTtcclxuXHJcbmNvbnN0IG1pc3NlZERhbWFnZUFiaWxpdHkgPSAoYXJnczogeyBpZDogc3RyaW5nOyBhYmlsaXR5SWQ6IHN0cmluZztcclxuICBpZ25vcmVTZWxmPzogYm9vbGVhbjsgY29sbGVjdFNlY29uZHM/OiBudW1iZXI7IH0pID0+IHtcclxuICBpZiAoIWFyZ3MuYWJpbGl0eUlkKVxyXG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBhYmlsaXR5SWQ6ICcgKyBKU09OLnN0cmluZ2lmeShhcmdzKSk7XHJcbiAgcmV0dXJuIG1pc3NlZEZ1bmMoe1xyXG4gICAgdHJpZ2dlcklkOiBhcmdzLmlkLFxyXG4gICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBhcmdzLmFiaWxpdHlJZCB9KSxcclxuICAgIHJlZ2V4VHlwZTogJ0FiaWxpdHknLFxyXG4gICAgZmllbGQ6ICdhYmlsaXR5JyxcclxuICAgIHR5cGU6ICdkYW1hZ2UnLFxyXG4gICAgaWdub3JlU2VsZjogYXJncy5pZ25vcmVTZWxmLFxyXG4gICAgY29sbGVjdFNlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMgPyBhcmdzLmNvbGxlY3RTZWNvbmRzIDogYWJpbGl0eUNvbGxlY3RTZWNvbmRzLFxyXG4gIH0pO1xyXG59O1xyXG5cclxuY29uc3QgbWlzc2VkSGVhbCA9IChhcmdzOiB7IGlkOiBzdHJpbmc7IGFiaWxpdHlJZDogc3RyaW5nO1xyXG4gIGlnbm9yZVNlbGY/OiBib29sZWFuOyBjb2xsZWN0U2Vjb25kcz86IG51bWJlcjsgfSkgPT4ge1xyXG4gIGlmICghYXJncy5hYmlsaXR5SWQpXHJcbiAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGFiaWxpdHlJZDogJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICByZXR1cm4gbWlzc2VkRnVuYyh7XHJcbiAgICB0cmlnZ2VySWQ6IGFyZ3MuaWQsXHJcbiAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IGFyZ3MuYWJpbGl0eUlkIH0pLFxyXG4gICAgcmVnZXhUeXBlOiAnQWJpbGl0eScsXHJcbiAgICBmaWVsZDogJ2FiaWxpdHknLFxyXG4gICAgdHlwZTogJ2hlYWwnLFxyXG4gICAgY29sbGVjdFNlY29uZHM6IGFyZ3MuY29sbGVjdFNlY29uZHMgPyBhcmdzLmNvbGxlY3RTZWNvbmRzIDogYWJpbGl0eUNvbGxlY3RTZWNvbmRzLFxyXG4gIH0pO1xyXG59O1xyXG5cclxuY29uc3QgbWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkgPSBtaXNzZWRIZWFsO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hdGNoQWxsLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQnVmZiBQZXQgVG8gT3duZXIgTWFwcGVyJyxcclxuICAgICAgdHlwZTogJ0FkZGVkQ29tYmF0YW50JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWRkZWRDb21iYXRhbnRGdWxsKCksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAobWF0Y2hlcy5vd25lcklkID09PSAnMCcpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGRhdGEucGV0SWRUb093bmVySWQgPz89IHt9O1xyXG4gICAgICAgIC8vIEZpeCBhbnkgbG93ZXJjYXNlIGlkcy5cclxuICAgICAgICBkYXRhLnBldElkVG9Pd25lcklkW21hdGNoZXMuaWQudG9VcHBlckNhc2UoKV0gPSBtYXRjaGVzLm93bmVySWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQnVmZiBQZXQgVG8gT3duZXIgQ2xlYXJlcicsXHJcbiAgICAgIHR5cGU6ICdDaGFuZ2Vab25lJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuY2hhbmdlWm9uZSgpLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgLy8gQ2xlYXIgdGhpcyBoYXNoIHBlcmlvZGljYWxseSBzbyBpdCBkb2Vzbid0IGhhdmUgZmFsc2UgcG9zaXRpdmVzLlxyXG4gICAgICAgIGRhdGEucGV0SWRUb093bmVySWQgPSB7fTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gUHJlZmVyIGFiaWxpdGllcyB0byBlZmZlY3RzLCBhcyBlZmZlY3RzIHRha2UgbG9uZ2VyIHRvIHJvbGwgdGhyb3VnaCB0aGUgcGFydHkuXHJcbiAgICAvLyBIb3dldmVyLCBzb21lIHRoaW5ncyBhcmUgb25seSBlZmZlY3RzIGFuZCBzbyB0aGVyZSBpcyBubyBjaG9pY2UuXHJcblxyXG4gICAgLy8gRm9yIHRoaW5ncyB5b3UgY2FuIHN0ZXAgaW4gb3Igb3V0IG9mLCBnaXZlIGEgbG9uZ2VyIHRpbWVyPyAgVGhpcyBpc24ndCBwZXJmZWN0LlxyXG4gICAgLy8gVE9ETzogaW5jbHVkZSBzb2lsIGhlcmU/P1xyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkJ1ZmYoeyBpZDogJ0NvbGxlY3RpdmUgVW5jb25zY2lvdXMnLCBlZmZlY3RJZDogJzM1MScsIGNvbGxlY3RTZWNvbmRzOiAxMCB9KSxcclxuICAgIC8vIEFybXMgVXAgPSA0OTggKG90aGVycyksIFBhc3NhZ2UgT2YgQXJtcyA9IDQ5NyAoeW91KS4gIFVzZSBib3RoIGluIGNhc2UgZXZlcnlib2R5IGlzIG1pc3NlZC5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25CdWZmKHsgaWQ6ICdQYXNzYWdlIG9mIEFybXMnLCBlZmZlY3RJZDogJzQ5Wzc4XScsIGlnbm9yZVNlbGY6IHRydWUsIGNvbGxlY3RTZWNvbmRzOiAxMCB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQnVmZih7IGlkOiAnRGl2aW5lIFZlaWwnLCBlZmZlY3RJZDogJzJENycsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ0hlYXJ0IE9mIExpZ2h0JywgYWJpbGl0eUlkOiAnM0YyMCcgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnRGFyayBNaXNzaW9uYXJ5JywgYWJpbGl0eUlkOiAnNDA1NycgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnU2hha2UgSXQgT2ZmJywgYWJpbGl0eUlkOiAnMUNEQycgfSksXHJcblxyXG4gICAgLy8gM0Y0NCBpcyB0aGUgY29ycmVjdCBRdWFkcnVwbGUgVGVjaG5pY2FsIEZpbmlzaCwgb3RoZXJzIGFyZSBEaW5reSBUZWNobmljYWwgRmluaXNoLlxyXG4gICAgLi4ubWlzc2VkRGFtYWdlQWJpbGl0eSh7IGlkOiAnVGVjaG5pY2FsIEZpbmlzaCcsIGFiaWxpdHlJZDogJzNGNFsxLTRdJyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0RpdmluYXRpb24nLCBhYmlsaXR5SWQ6ICc0MEE4JyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0Jyb3RoZXJob29kJywgYWJpbGl0eUlkOiAnMUNFNCcgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdCYXR0bGUgTGl0YW55JywgYWJpbGl0eUlkOiAnREU1JyB9KSxcclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0VtYm9sZGVuJywgYWJpbGl0eUlkOiAnMUQ2MCcgfSksXHJcbiAgICAuLi5taXNzZWREYW1hZ2VBYmlsaXR5KHsgaWQ6ICdCYXR0bGUgVm9pY2UnLCBhYmlsaXR5SWQ6ICc3NicsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcblxyXG4gICAgLy8gVG9vIG5vaXN5IChwcm9jcyBldmVyeSB0aHJlZSBzZWNvbmRzLCBhbmQgYmFyZHMgb2Z0ZW4gb2ZmIGRvaW5nIG1lY2hhbmljcykuXHJcbiAgICAvLyBtaXNzZWREYW1hZ2VCdWZmKHsgaWQ6ICdXYW5kZXJlclxcJ3MgTWludWV0JywgZWZmZWN0SWQ6ICc4QTgnLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG4gICAgLy8gbWlzc2VkRGFtYWdlQnVmZih7IGlkOiAnTWFnZVxcJ3MgQmFsbGFkJywgZWZmZWN0SWQ6ICc4QTknLCBpZ25vcmVTZWxmOiB0cnVlIH0pLFxyXG4gICAgLy8gbWlzc2VkRGFtYWdlQnVmZih7IGlkOiAnQXJteVxcJ3MgUGFlb24nLCBlZmZlY3RJZDogJzhBQScsIGlnbm9yZVNlbGY6IHRydWUgfSksXHJcblxyXG4gICAgLi4ubWlzc2VkTWl0aWdhdGlvbkFiaWxpdHkoeyBpZDogJ1Ryb3ViYWRvdXInLCBhYmlsaXR5SWQ6ICcxQ0VEJyB9KSxcclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdUYWN0aWNpYW4nLCBhYmlsaXR5SWQ6ICc0MUY5JyB9KSxcclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdTaGllbGQgU2FtYmEnLCBhYmlsaXR5SWQ6ICczRThDJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnTWFudHJhJywgYWJpbGl0eUlkOiAnNDEnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZERhbWFnZUFiaWxpdHkoeyBpZDogJ0Rldm90aW9uJywgYWJpbGl0eUlkOiAnMUQxQScgfSksXHJcblxyXG4gICAgLy8gTWF5YmUgdXNpbmcgYSBoZWFsZXIgTEIxL0xCMiBzaG91bGQgYmUgYW4gZXJyb3IgZm9yIHRoZSBoZWFsZXIuIE86KVxyXG4gICAgLy8gLi4ubWlzc2VkSGVhbCh7IGlkOiAnSGVhbGluZyBXaW5kJywgYWJpbGl0eUlkOiAnQ0UnIH0pLFxyXG4gICAgLy8gLi4ubWlzc2VkSGVhbCh7IGlkOiAnQnJlYXRoIG9mIHRoZSBFYXJ0aCcsIGFiaWxpdHlJZDogJ0NGJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdNZWRpY2EnLCBhYmlsaXR5SWQ6ICc3QycgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdNZWRpY2EgSUknLCBhYmlsaXR5SWQ6ICc4NScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBZmZsYXR1cyBSYXB0dXJlJywgYWJpbGl0eUlkOiAnNDA5NicgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdUZW1wZXJhbmNlJywgYWJpbGl0eUlkOiAnNzUxJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1BsZW5hcnkgSW5kdWxnZW5jZScsIGFiaWxpdHlJZDogJzFEMDknIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnUHVsc2Ugb2YgTGlmZScsIGFiaWxpdHlJZDogJ0QwJyB9KSxcclxuXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdTdWNjb3InLCBhYmlsaXR5SWQ6ICdCQScgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdJbmRvbWl0YWJpbGl0eScsIGFiaWxpdHlJZDogJ0RGRicgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdEZXBsb3ltZW50IFRhY3RpY3MnLCBhYmlsaXR5SWQ6ICdFMDEnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnV2hpc3BlcmluZyBEYXduJywgYWJpbGl0eUlkOiAnMzIzJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0ZleSBCbGVzc2luZycsIGFiaWxpdHlJZDogJzQwQTAnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQ29uc29sYXRpb24nLCBhYmlsaXR5SWQ6ICc0MEEzJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0FuZ2VsXFwncyBXaGlzcGVyJywgYWJpbGl0eUlkOiAnNDBBNicgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnRmV5IElsbHVtaW5hdGlvbicsIGFiaWxpdHlJZDogJzMyNScgfSksXHJcbiAgICAuLi5taXNzZWRNaXRpZ2F0aW9uQWJpbGl0eSh7IGlkOiAnU2VyYXBoaWMgSWxsdW1pbmF0aW9uJywgYWJpbGl0eUlkOiAnNDBBNycgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBbmdlbCBGZWF0aGVycycsIGFiaWxpdHlJZDogJzEwOTcnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0hlbGlvcycsIGFiaWxpdHlJZDogJ0UxMCcgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdBc3BlY3RlZCBIZWxpb3MnLCBhYmlsaXR5SWQ6ICdFMTEnIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQXNwZWN0ZWQgSGVsaW9zJywgYWJpbGl0eUlkOiAnMzIwMCcgfSksXHJcbiAgICAuLi5taXNzZWRIZWFsKHsgaWQ6ICdDZWxlc3RpYWwgT3Bwb3NpdGlvbicsIGFiaWxpdHlJZDogJzQwQTknIH0pLFxyXG4gICAgLi4ubWlzc2VkSGVhbCh7IGlkOiAnQXN0cmFsIFN0YXNpcycsIGFiaWxpdHlJZDogJzEwOTgnIH0pLFxyXG5cclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ1doaXRlIFdpbmQnLCBhYmlsaXR5SWQ6ICcyQzhFJyB9KSxcclxuICAgIC4uLm1pc3NlZEhlYWwoeyBpZDogJ0dvYnNraW4nLCBhYmlsaXR5SWQ6ICc0NzgwJyB9KSxcclxuXHJcbiAgICAvLyBUT0RPOiBleHBvcnQgYWxsIG9mIHRoZXNlIG1pc3NlZCBmdW5jdGlvbnMgaW50byB0aGVpciBvd24gaGVscGVyXHJcbiAgICAvLyBhbmQgdGhlbiBhZGQgdGhpcyB0byB0aGUgRGVsdWJydW0gUmVnaW5hZSBmaWxlcyBkaXJlY3RseS5cclxuICAgIC4uLm1pc3NlZE1pdGlnYXRpb25BYmlsaXR5KHsgaWQ6ICdMb3N0IEFldGhlcnNoaWVsZCcsIGFiaWxpdHlJZDogJzU3NTMnIH0pLFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBsb3N0Rm9vZD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuLy8gR2VuZXJhbCBtaXN0YWtlczsgdGhlc2UgYXBwbHkgZXZlcnl3aGVyZS5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hdGNoQWxsLFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIFRyaWdnZXIgaWQgZm9yIGludGVybmFsbHkgZ2VuZXJhdGVkIGVhcmx5IHB1bGwgd2FybmluZy5cclxuICAgICAgaWQ6ICdHZW5lcmFsIEVhcmx5IFB1bGwnLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIEZvb2QgQnVmZicsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIC8vIFdlbGwgRmVkXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gUHJldmVudCBcIkVvcyBsb3NlcyB0aGUgZWZmZWN0IG9mIFdlbGwgRmVkIGZyb20gQ3JpdGxvIE1jZ2VlXCJcclxuICAgICAgICByZXR1cm4gbWF0Y2hlcy50YXJnZXQgPT09IG1hdGNoZXMuc291cmNlO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEubG9zdEZvb2QgPz89IHt9O1xyXG4gICAgICAgIC8vIFdlbGwgRmVkIGJ1ZmYgaGFwcGVucyByZXBlYXRlZGx5IHdoZW4gaXQgZmFsbHMgb2ZmIChXSFkpLFxyXG4gICAgICAgIC8vIHNvIHN1cHByZXNzIG11bHRpcGxlIG9jY3VycmVuY2VzLlxyXG4gICAgICAgIGlmICghZGF0YS5pbkNvbWJhdCB8fCBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBkYXRhLmxvc3RGb29kW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdsb3N0IGZvb2QgYnVmZicsXHJcbiAgICAgICAgICAgIGRlOiAnTmFocnVuZ3NidWZmIHZlcmxvcmVuJyxcclxuICAgICAgICAgICAgZnI6ICdCdWZmIG5vdXJyaXR1cmUgdGVybWluw6llJyxcclxuICAgICAgICAgICAgamE6ICfpo6/lirnmnpzjgYzlpLHjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WkseWOu+mjn+eJqUJVRkYnLFxyXG4gICAgICAgICAgICBrbzogJ+ydjOyLnSDrsoTtlIQg7ZW07KCcJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnR2VuZXJhbCBXZWxsIEZlZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0OCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubG9zdEZvb2QpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZGVsZXRlIGRhdGEubG9zdEZvb2RbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHZW5lcmFsIFJhYmJpdCBNZWRpdW0nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzhFMCcgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuSXNQbGF5ZXJJZChtYXRjaGVzLnNvdXJjZUlkKSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnNvdXJjZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdidW5ueScsXHJcbiAgICAgICAgICAgIGRlOiAnSGFzZScsXHJcbiAgICAgICAgICAgIGZyOiAnbGFwaW4nLFxyXG4gICAgICAgICAgICBqYTogJ+OBhuOBleOBjicsXHJcbiAgICAgICAgICAgIGNuOiAn5YWU5a2QJyxcclxuICAgICAgICAgICAga286ICfthqDrgbwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgYm9vdENvdW50PzogbnVtYmVyO1xyXG4gIHBva2VDb3VudD86IG51bWJlcjtcclxufVxyXG5cclxuLy8gVGVzdCBtaXN0YWtlIHRyaWdnZXJzLlxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTWlkZGxlTGFOb3NjZWEsXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IEJvdycsXHJcbiAgICAgIHR5cGU6ICdHYW1lTG9nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IGJvdyBjb3VydGVvdXNseSB0byB0aGUgc3RyaWtpbmcgZHVtbXkuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1ZvdXMgdm91cyBpbmNsaW5leiBkZXZhbnQgbGUgbWFubmVxdWluIGRcXCdlbnRyYcOubmVtZW50Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuOBr+acqOS6uuOBq+OBiui+nuWEgOOBl+OBny4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirmga3mlazlnLDlr7nmnKjkurrooYznpLwuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEtvOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q64KY66y07J247ZiV7JeQ6rKMIOqzteyGkO2VmOqyjCDsnbjsgqztlanri4jri6QuKj8nIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAncHVsbCcsXHJcbiAgICAgICAgICBibGFtZTogZGF0YS5tZSxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb3cnLFxyXG4gICAgICAgICAgICBkZTogJ0JvZ2VuJyxcclxuICAgICAgICAgICAgZnI6ICdTYWx1ZXInLFxyXG4gICAgICAgICAgICBqYTogJ+OBiui+nuWEgCcsXHJcbiAgICAgICAgICAgIGNuOiAn6Z6g6LqsJyxcclxuICAgICAgICAgICAga286ICfsnbjsgqwnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdUZXN0IFdpcGUnLFxyXG4gICAgICB0eXBlOiAnR2FtZUxvZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBiaWQgZmFyZXdlbGwgdG8gdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIGZhaXRlcyB2b3MgYWRpZXV4IGF1IG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgavliKXjgozjga7mjKjmi7bjgpLjgZfjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q5ZCR5pyo5Lq65ZGK5YirLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleyXkOqyjCDsnpHrs4Qg7J247IKs66W8IO2VqeuLiOuLpC4qPycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3aXBlJyxcclxuICAgICAgICAgIGJsYW1lOiBkYXRhLm1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1BhcnR5IFdpcGUnLFxyXG4gICAgICAgICAgICBkZTogJ0dydXBwZW53aXBlJyxcclxuICAgICAgICAgICAgZnI6ICdQYXJ0eSBXaXBlJyxcclxuICAgICAgICAgICAgamE6ICfjg6/jgqTjg5cnLFxyXG4gICAgICAgICAgICBjbjogJ+WboueBrScsXHJcbiAgICAgICAgICAgIGtvOiAn7YyM7YuwIOyghOupuCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgQm9vdHNoaW5lJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMzUnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKG1hdGNoZXMuc291cmNlICE9PSBkYXRhLm1lKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHN0cmlraW5nRHVtbXlCeUxvY2FsZSA9IHtcclxuICAgICAgICAgIGVuOiAnU3RyaWtpbmcgRHVtbXknLFxyXG4gICAgICAgICAgZGU6ICdUcmFpbmluZ3NwdXBwZScsXHJcbiAgICAgICAgICBmcjogJ01hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudCcsXHJcbiAgICAgICAgICBqYTogJ+acqOS6uicsXHJcbiAgICAgICAgICBjbjogJ+acqOS6uicsXHJcbiAgICAgICAgICBrbzogJ+uCmOustOyduO2YlScsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzdHJpa2luZ0R1bW15TmFtZXMgPSBPYmplY3QudmFsdWVzKHN0cmlraW5nRHVtbXlCeUxvY2FsZSk7XHJcbiAgICAgICAgcmV0dXJuIHN0cmlraW5nRHVtbXlOYW1lcy5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5ib290Q291bnQgPz89IDA7XHJcbiAgICAgICAgZGF0YS5ib290Q291bnQrKztcclxuICAgICAgICBjb25zdCB0ZXh0ID0gYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtkYXRhLmJvb3RDb3VudH0pOiAke2RhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcyl9YDtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiB0ZXh0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgTGVhZGVuIEZpc3QnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNzQ1JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy5zb3VyY2UgPT09IGRhdGEubWUsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2dvb2QnLCBibGFtZTogZGF0YS5tZSwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBPb3BzJyxcclxuICAgICAgdHlwZTogJ0dhbWVMb2cnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJy4qb29wcy4qJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxMCxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBkYXRhLm1lLCB0ZXh0OiBtYXRjaGVzLmxpbmUgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVGVzdCBQb2tlIENvbGxlY3QnLFxyXG4gICAgICB0eXBlOiAnR2FtZUxvZycsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJ1lvdSBwb2tlIHRoZSBzdHJpa2luZyBkdW1teS4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnVm91cyB0b3VjaGV6IGzDqWfDqHJlbWVudCBsZSBtYW5uZXF1aW4gZFxcJ2VudHJhw65uZW1lbnQgZHUgZG9pZ3QuKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q44Gv5pyo5Lq644KS44Gk44Gk44GE44GfLio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhDbjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKueUqOaJi+aMh+aIs+WQkeacqOS6ui4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirrgpjrrLTsnbjtmJXsnYQg7L+h7L+hIOywjOumheuLiOuLpC4qPycgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnBva2VDb3VudCA9IChkYXRhLnBva2VDb3VudCA/PyAwKSArIDE7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1Rlc3QgUG9rZScsXHJcbiAgICAgIHR5cGU6ICdHYW1lTG9nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnWW91IHBva2UgdGhlIHN0cmlraW5nIGR1bW15Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICdWb3VzIHRvdWNoZXogbMOpZ8OocmVtZW50IGxlIG1hbm5lcXVpbiBkXFwnZW50cmHDrm5lbWVudCBkdSBkb2lndC4qPycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FtZU5hbWVMb2coeyBsaW5lOiAnLirjga/mnKjkurrjgpLjgaTjgaTjgYTjgZ8uKj8nIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLmdhbWVOYW1lTG9nKHsgbGluZTogJy4q55So5omL5oyH5oiz5ZCR5pyo5Lq6Lio/JyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5nYW1lTmFtZUxvZyh7IGxpbmU6ICcuKuuCmOustOyduO2YleydhCDsv6Hsv6Eg7LCM66aF64uI64ukLio/JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIDEgcG9rZSBhdCBhIHRpbWUgaXMgZmluZSwgYnV0IG1vcmUgdGhhbiBvbmUgaW4gNSBzZWNvbmRzIGlzIChPQlZJT1VTTFkpIGEgbWlzdGFrZS5cclxuICAgICAgICBpZiAoIWRhdGEucG9rZUNvdW50IHx8IGRhdGEucG9rZUNvdW50IDw9IDEpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBkYXRhLm1lLFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYFRvbyBtYW55IHBva2VzICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBkZTogYFp1IHZpZWxlIFBpZWtzZXIgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGZyOiBgVHJvcCBkZSB0b3VjaGVzICgke2RhdGEucG9rZUNvdW50fSlgLFxyXG4gICAgICAgICAgICBqYTogYOOBhOOBo+OBseOBhOOBpOOBpOOBhOOBnyAoJHtkYXRhLnBva2VDb3VudH0pYCxcclxuICAgICAgICAgICAgY246IGDmiLPlpKrlpJrkuIvllaYgKCR7ZGF0YS5wb2tlQ291bnR9KWAsXHJcbiAgICAgICAgICAgIGtvOiBg64SI66y0IOunjuydtCDssIzrpoQgKCR7ZGF0YS5wb2tlQ291bnR967KIKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IGRlbGV0ZSBkYXRhLnBva2VDb3VudCxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIElmcml0IFN0b3J5IE1vZGVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUJvd2xPZkVtYmVycyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnSWZyaXRObSBSYWRpYW50IFBsdW1lJzogJzJERScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdJZnJpdE5tIEluY2luZXJhdGUnOiAnMUM1JyxcclxuICAgICdJZnJpdE5tIEVydXB0aW9uJzogJzJERCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIFN0b3J5IE1vZGVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbk5tIFdlaWdodCBPZiBUaGUgTGFuZCc6ICczQ0QnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1RpdGFuTm0gTGFuZHNsaWRlJzogJzI4QScsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhbk5tIFJvY2sgQnVzdGVyJzogJzI4MScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSXQncyBoYXJkIHRvIGNhcHR1cmUgdGhlIHJlZmxlY3Rpb24gYWJpbGl0aWVzIGZyb20gTGV2aWF0aGFuJ3MgSGVhZCBhbmQgVGFpbCBpZiB5b3UgdXNlXHJcbi8vIHJhbmdlZCBwaHlzaWNhbCBhdHRhY2tzIC8gbWFnaWMgYXR0YWNrcyByZXNwZWN0aXZlbHksIGFzIHRoZSBhYmlsaXR5IG5hbWVzIGFyZSB0aGVcclxuLy8gYWJpbGl0eSB5b3UgdXNlZCBhbmQgZG9uJ3QgYXBwZWFyIHRvIHNob3cgdXAgaW4gdGhlIGxvZyBhcyBub3JtYWwgXCJhYmlsaXR5XCIgbGluZXMuXHJcbi8vIFRoYXQgc2FpZCwgZG90cyBzdGlsbCB0aWNrIGluZGVwZW5kZW50bHkgb24gYm90aCBzbyBpdCdzIGxpa2VseSB0aGF0IHBlb3BsZSB3aWxsIGF0YWNrXHJcbi8vIHRoZW0gYW55d2F5LlxyXG5cclxuLy8gVE9ETzogRmlndXJlIG91dCB3aHkgRHJlYWQgVGlkZSAvIFdhdGVyc3BvdXQgYXBwZWFyIGxpa2Ugc2hhcmVzIChpLmUuIDB4MTYgaWQpLlxyXG4vLyBEcmVhZCBUaWRlID0gODIzLzgyNC84MjUsIFdhdGVyc3BvdXQgPSA4MjlcclxuXHJcbi8vIExldmlhdGhhbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXaG9ybGVhdGVyRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTGV2aUV4IEdyYW5kIEZhbGwnOiAnODJGJywgLy8gdmVyeSBsYXJnZSBjaXJjdWxhciBhb2UgYmVmb3JlIHNwaW5ueSBkaXZlcywgYXBwbGllcyBoZWF2eVxyXG4gICAgJ0xldmlFeCBIeWRybyBTaG90JzogJzc0OCcsIC8vIFdhdmVzcGluZSBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIERyb3BzeSBlZmZlY3RcclxuICAgICdMZXZpRXggRHJlYWRzdG9ybSc6ICc3NDknLCAvLyBXYXZldG9vdGggU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBIeXN0ZXJpYSBlZmZlY3RcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdMZXZpRXggQm9keSBTbGFtJzogJzgyQScsIC8vIGxldmkgc2xhbSB0aGF0IHRpbHRzIHRoZSBib2F0XHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMSc6ICc4OEEnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMic6ICc4OEInLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aUV4IFNwaW5uaW5nIERpdmUgMyc6ICc4MkMnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdMZXZpRXggRHJvcHN5JzogJzExMCcsIC8vIHN0YW5kaW5nIGluIHRoZSBoeWRybyBzaG90IGZyb20gdGhlIFdhdmVzcGluZSBTYWhhZ2luXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdMZXZpRXggSHlzdGVyaWEnOiAnMTI4JywgLy8gc3RhbmRpbmcgaW4gdGhlIGRyZWFkc3Rvcm0gZnJvbSB0aGUgV2F2ZXRvb3RoIFNhaGFnaW5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTGV2aUV4IEJvZHkgU2xhbSBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnODJBJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgc2VlbkRpYW1vbmREdXN0PzogYm9vbGVhbjtcclxufVxyXG5cclxuLy8gU2hpdmEgSGFyZFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZUhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gTGFyZ2Ugd2hpdGUgY2lyY2xlcy5cclxuICAgICdTaGl2YUhtIEljaWNsZSBJbXBhY3QnOiAnOTkzJyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFIbSBHbGFjaWVyIEJhc2gnOiAnOUExJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgLy8gS25vY2tiYWNrIHRhbmsgY2xlYXZlLlxyXG4gICAgJ1NoaXZhSG0gSGVhdmVubHkgU3RyaWtlJzogJzlBMCcsXHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUhtIEhhaWxzdG9ybSc6ICc5OTgnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBUYW5rYnVzdGVyLiAgVGhpcyBpcyBTaGl2YSBIYXJkIG1vZGUsIG5vdCBTaGl2YSBFeHRyZW1lLiAgUGxlYXNlIVxyXG4gICAgJ1NoaXZhSG0gSWNlYnJhbmQnOiAnOTk2JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU2hpdmFIbSBEaWFtb25kIER1c3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzk4QScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEpID0+IHtcclxuICAgICAgICBkYXRhLnNlZW5EaWFtb25kRHVzdCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaXZhSG0gRGVlcCBGcmVlemUnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBTaGl2YSBhbHNvIHVzZXMgYWJpbGl0eSA5QTMgb24geW91LCBidXQgaXQgaGFzIHRoZSB1bnRyYW5zbGF0ZWQgbmFtZVxyXG4gICAgICAvLyDpgI/mmI7vvJrjgrfjg7TjgqHvvJrlh43ntZDjg6zjgq/jg4jvvJrjg47jg4Pjgq/jg5Djg4Pjgq/nlKguIFNvLCB1c2UgdGhlIGVmZmVjdCBpbnN0ZWFkIGZvciBmcmVlIHRyYW5zbGF0aW9uLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUU3JyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBzbyBvbmx5IGEgbWlzdGFrZSBhZnRlciB0aGF0LlxyXG4gICAgICAgIC8vIFVubGlrZSBleHRyZW1lLCB0aGlzIGhhcyB0aGUgc2FtZSAyMCBzZWNvbmQgZHVyYXRpb24gYXMgdGhlIGludGVybWlzc2lvbi5cclxuICAgICAgICByZXR1cm4gZGF0YS5zZWVuRGlhbW9uZER1c3Q7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTaGl2YSBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVBa2hBZmFoQW1waGl0aGVhdHJlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBMYXJnZSB3aGl0ZSBjaXJjbGVzLlxyXG4gICAgJ1NoaXZhRXggSWNpY2xlIEltcGFjdCc6ICdCRUInLFxyXG4gICAgLy8gXCJnZXQgaW5cIiBhb2VcclxuICAgICdTaGl2YUV4IFdoaXRlb3V0JzogJ0JFQycsXHJcbiAgICAvLyBBdm9pZGFibGUgdGFuayBzdHVuLlxyXG4gICAgJ1NoaXZhRXggR2xhY2llciBCYXNoJzogJ0JFOScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyAyNzAgZGVncmVlIGF0dGFjay5cclxuICAgICdTaGl2YUV4IEdsYXNzIERhbmNlJzogJ0JERicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgIC8vIEhhaWxzdG9ybSBzcHJlYWQgbWFya2VyLlxyXG4gICAgJ1NoaXZhRXggSGFpbHN0b3JtJzogJ0JFMicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgIC8vIExhc2VyLiAgVE9ETzogbWF5YmUgYmxhbWUgdGhlIHBlcnNvbiBpdCdzIG9uPz9cclxuICAgICdTaGl2YUV4IEF2YWxhbmNoZSc6ICdCRTAnLFxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFBhcnR5IHNoYXJlZCB0YW5rYnVzdGVyXHJcbiAgICAnU2hpdmFFeCBJY2VicmFuZCc6ICdCRTEnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUV4IERlZXAgRnJlZXplJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gU2hpdmEgYWxzbyB1c2VzIGFiaWxpdHkgQzhBIG9uIHlvdSwgYnV0IGl0IGhhcyB0aGUgdW50cmFuc2xhdGVkIG5hbWVcclxuICAgICAgLy8g6YCP5piO77ya44K344O044Kh77ya5YeN57WQ44Os44Kv44OI77ya44OO44OD44Kv44OQ44OD44Kv55SoL+ODkuODreOCpOODg+OCry4gU28sIHVzZSB0aGUgZWZmZWN0IGluc3RlYWQgZm9yIGZyZWUgdHJhbnNsYXRpb24uXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcxRTcnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBpbnRlcm1pc3Npb24gYWxzbyBnZXRzIHRoaXMgZWZmZWN0LCBidXQgZm9yIGEgc2hvcnRlciBkdXJhdGlvbi5cclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSA+IDIwO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIEhhcmRcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsSGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5IbSBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNTUzJyxcclxuICAgICdUaXRhbkhtIEJ1cnN0JzogJzQxQycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5IbSBMYW5kc2xpZGUnOiAnNTU0JyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuSG0gUm9jayBCdXN0ZXInOiAnNTUwJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuSG0gTW91bnRhaW4gQnVzdGVyJzogJzI4MycsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRpdGFuIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU5hdmVsRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5FeCBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNUJFJyxcclxuICAgICdUaXRhbkV4IEJ1cnN0JzogJzVCRicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGl0YW5FeCBMYW5kc2xpZGUnOiAnNUJCJyxcclxuICAgICdUaXRhbkV4IEdhb2xlciBMYW5kc2xpZGUnOiAnNUMzJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RpdGFuRXggUm9jayBCdXN0ZXInOiAnNUI3JyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ1RpdGFuRXggTW91bnRhaW4gQnVzdGVyJzogJzVCOCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIHpvbWJpZT86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBzaGllbGQ/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVXZWVwaW5nQ2l0eU9mTWhhY2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dlZXBpbmcgQ3JpdGljYWwgQml0ZSc6ICcxODQ4JywgLy8gU2Fyc3VjaHVzIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSZWFsbSBTaGFrZXInOiAnMTgzRScsIC8vIEZpcnN0IERhdWdodGVyIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIFNpbGtzY3JlZW4nOiAnMTgzQycsIC8vIEZpcnN0IERhdWdodGVyIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBTaWxrZW4gU3ByYXknOiAnMTgyNCcsIC8vIEFyYWNobmUgRXZlIHJlYXIgY29uYWwgYW9lXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAxJzogJzE4MzcnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAxXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAyJzogJzE4MzYnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAyXHJcbiAgICAnV2VlcGluZyBUcmVtYmxvciAzJzogJzE4MzUnLCAvLyBBcmFjaG5lIEV2ZSBkaXNhcHBlYXIgY2lyY2xlIGFvZSAzXHJcbiAgICAnV2VlcGluZyBTcGlkZXIgVGhyZWFkJzogJzE4MzknLCAvLyBBcmFjaG5lIEV2ZSBzcGlkZXIgbGluZSBhb2VcclxuICAgICdXZWVwaW5nIEZpcmUgSUknOiAnMTg0RScsIC8vIEJsYWNrIE1hZ2UgQ29ycHNlIGNpcmNsZSBhb2VcclxuICAgICdXZWVwaW5nIE5lY3JvcHVyZ2UnOiAnMTdENycsIC8vIEZvcmdhbGwgU2hyaXZlbGVkIFRhbG9uIGxpbmUgYW9lXHJcbiAgICAnV2VlcGluZyBSb3R0ZW4gQnJlYXRoJzogJzE3RDAnLCAvLyBGb3JnYWxsIERhaGFrIGNvbmUgYW9lXHJcbiAgICAnV2VlcGluZyBNb3cnOiAnMTdEMicsIC8vIEZvcmdhbGwgSGFhZ2VudGkgdW5tYXJrZWQgY2xlYXZlXHJcbiAgICAnV2VlcGluZyBEYXJrIEVydXB0aW9uJzogJzE3QzMnLCAvLyBGb3JnYWxsIHB1ZGRsZSBtYXJrZXJcclxuICAgIC8vIDE4MDYgaXMgYWxzbyBGbGFyZSBTdGFyLCBidXQgaWYgeW91IGdldCBieSAxODA1IHlvdSBhbHNvIGdldCBoaXQgYnkgMTgwNj9cclxuICAgICdXZWVwaW5nIEZsYXJlIFN0YXInOiAnMTgwNScsIC8vIE96bWEgY3ViZSBwaGFzZSBkb251dFxyXG4gICAgJ1dlZXBpbmcgRXhlY3JhdGlvbic6ICcxODI5JywgLy8gT3ptYSB0cmlhbmdsZSBsYXNlclxyXG4gICAgJ1dlZXBpbmcgSGFpcmN1dCAxJzogJzE4MEInLCAvLyBDYWxvZmlzdGVyaSAxODAgY2xlYXZlIDFcclxuICAgICdXZWVwaW5nIEhhaXJjdXQgMic6ICcxODBGJywgLy8gQ2Fsb2Zpc3RlcmkgMTgwIGNsZWF2ZSAyXHJcbiAgICAnV2VlcGluZyBFbnRhbmdsZW1lbnQnOiAnMTgxRCcsIC8vIENhbG9maXN0ZXJpIGxhbmRtaW5lIHB1ZGRsZSBwcm9jXHJcbiAgICAnV2VlcGluZyBFdmlsIEN1cmwnOiAnMTgxNicsIC8vIENhbG9maXN0ZXJpIGF4ZVxyXG4gICAgJ1dlZXBpbmcgRXZpbCBUcmVzcyc6ICcxODE3JywgLy8gQ2Fsb2Zpc3RlcmkgYnVsYlxyXG4gICAgJ1dlZXBpbmcgRGVwdGggQ2hhcmdlJzogJzE4MjAnLCAvLyBDYWxvZmlzdGVyaSBjaGFyZ2UgdG8gZWRnZVxyXG4gICAgJ1dlZXBpbmcgRmVpbnQgUGFydGljbGUgQmVhbSc6ICcxOTI4JywgLy8gQ2Fsb2Zpc3Rlcmkgc2t5IGxhc2VyXHJcbiAgICAnV2VlcGluZyBFdmlsIFN3aXRjaCc6ICcxODE1JywgLy8gQ2Fsb2Zpc3RlcmkgbGFzZXJzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdXZWVwaW5nIEh5c3RlcmlhJzogJzEyOCcsIC8vIEFyYWNobmUgRXZlIEZyb25kIEFmZmVhcmRcclxuICAgICdXZWVwaW5nIFpvbWJpZmljYXRpb24nOiAnMTczJywgLy8gRm9yZ2FsbCB0b28gbWFueSB6b21iaWUgcHVkZGxlc1xyXG4gICAgJ1dlZXBpbmcgVG9hZCc6ICcxQjcnLCAvLyBGb3JnYWxsIEJyYW5kIG9mIHRoZSBGYWxsZW4gZmFpbHVyZVxyXG4gICAgJ1dlZXBpbmcgRG9vbSc6ICczOEUnLCAvLyBGb3JnYWxsIEhhYWdlbnRpIE1vcnRhbCBSYXlcclxuICAgICdXZWVwaW5nIEFzc2ltaWxhdGlvbic6ICc0MkMnLCAvLyBPem1hc2hhZGUgQXNzaW1pbGF0aW9uIGxvb2stYXdheVxyXG4gICAgJ1dlZXBpbmcgU3R1bic6ICc5NScsIC8vIENhbG9maXN0ZXJpIFBlbmV0cmF0aW9uIGxvb2stYXdheVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnV2VlcGluZyBBcmFjaG5lIFdlYic6ICcxODVFJywgLy8gQXJhY2huZSBFdmUgaGVhZG1hcmtlciB3ZWIgYW9lXHJcbiAgICAnV2VlcGluZyBFYXJ0aCBBZXRoZXInOiAnMTg0MScsIC8vIEFyYWNobmUgRXZlIG9yYnNcclxuICAgICdXZWVwaW5nIEVwaWdyYXBoJzogJzE4NTInLCAvLyBIZWFkc3RvbmUgdW50ZWxlZ3JhcGhlZCBsYXNlciBsaW5lIHRhbmsgYXR0YWNrXHJcbiAgICAvLyBUaGlzIGlzIHRvbyBub2lzeS4gIEJldHRlciB0byBwb3AgdGhlIGJhbGxvb25zIHRoYW4gd29ycnkgYWJvdXQgZnJpZW5kcy5cclxuICAgIC8vICdXZWVwaW5nIEV4cGxvc2lvbic6ICcxODA3JywgLy8gT3ptYXNwaGVyZSBDdWJlIG9yYiBleHBsb3Npb25cclxuICAgICdXZWVwaW5nIFNwbGl0IEVuZCAxJzogJzE4MEMnLCAvLyBDYWxvZmlzdGVyaSB0YW5rIGNsZWF2ZSAxXHJcbiAgICAnV2VlcGluZyBTcGxpdCBFbmQgMic6ICcxODEwJywgLy8gQ2Fsb2Zpc3RlcmkgdGFuayBjbGVhdmUgMlxyXG4gICAgJ1dlZXBpbmcgQmxvb2RpZWQgTmFpbCc6ICcxODFGJywgLy8gQ2Fsb2Zpc3RlcmkgYXhlL2J1bGIgYXBwZWFyaW5nXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuem9tYmllW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRm9yZ2FsbCBHcmFkdWFsIFpvbWJpZmljYXRpb24gTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc0MTUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS56b21iaWUgPSBkYXRhLnpvbWJpZSB8fCB7fTtcclxuICAgICAgICBkYXRhLnpvbWJpZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBGb3JnYWxsIE1lZ2EgRGVhdGgnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzE3Q0EnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLnpvbWJpZSAmJiAhZGF0YS56b21iaWVbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgSGVhZHN0b25lIFNoaWVsZCBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzE1RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnNoaWVsZCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV2VlcGluZyBIZWFkc3RvbmUgU2hpZWxkIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnMTVFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2hpZWxkID0gZGF0YS5zaGllbGQgfHwge307XHJcbiAgICAgICAgZGF0YS5zaGllbGRbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgRmxhcmluZyBFcGlncmFwaCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMTg1NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuc2hpZWxkICYmICFkYXRhLnNoaWVsZFttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoaXMgYWJpbGl0eSBuYW1lIGlzIGhlbHBmdWxseSBjYWxsZWQgXCJBdHRhY2tcIiBzbyBuYW1lIGl0IHNvbWV0aGluZyBlbHNlLlxyXG4gICAgICBpZDogJ1dlZXBpbmcgT3ptYSBUYW5rIExhc2VyJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgdHlwZTogJzIyJywgaWQ6ICcxODMxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdUYW5rIExhc2VyJyxcclxuICAgICAgICAgICAgZGU6ICdUYW5rIExhc2VyJyxcclxuICAgICAgICAgICAgZnI6ICdUYW5rIExhc2VyJyxcclxuICAgICAgICAgICAgamE6ICfjgr/jg7Pjgq/jg6zjgrbjg7wnLFxyXG4gICAgICAgICAgICBjbjogJ+WdpuWFi+a/gOWFiScsXHJcbiAgICAgICAgICAgIGtvOiAn7YOx7LukIOugiOydtOyggCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dlZXBpbmcgT3ptYSBIb2x5JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICcxODJFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdTbGlkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ2lzdCBydW50ZXJnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDvvIEnLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwseuQqCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBBZXRoZXJvY2hlbWljYWwgUmVzZWFyY2ggRmFjaWxpdHlcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUFldGhlcm9jaGVtaWNhbFJlc2VhcmNoRmFjaWxpdHksXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FSRiBHcmFuZCBTd29yZCc6ICcyMTYnLCAvLyBDb25hbCBBb0UsIFNjcmFtYmxlZCBJcm9uIEdpYW50IHRyYXNoXHJcbiAgICAnQVJGIENlcm1ldCBEcmlsbCc6ICcyMEUnLCAvLyBMaW5lIEFvRSwgNnRoIExlZ2lvbiBNYWdpdGVrIFZhbmd1YXJkIHRyYXNoXHJcbiAgICAnQVJGIE1hZ2l0ZWsgU2x1Zyc6ICcxMERCJywgLy8gTGluZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBBZXRoZXJvY2hlbWljYWwgR3JlbmFkbyc6ICcxMEUyJywgLy8gTGFyZ2UgdGFyZ2V0ZWQgY2lyY2xlIEFvRSwgTWFnaXRlayBUdXJyZXQgSUksIGJvc3MgMVxyXG4gICAgJ0FSRiBNYWdpdGVrIFNwcmVhZCc6ICcxMERDJywgLy8gMjcwLWRlZ3JlZSByb29td2lkZSBBb0UsIGJvc3MgMVxyXG4gICAgJ0FSRiBFZXJpZSBTb3VuZHdhdmUnOiAnMTE3MCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEN1bHR1cmVkIEVtcHVzYSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FSRiBUYWlsIFNsYXAnOiAnMTI1RicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgRGFuY2VyIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIENhbGNpZnlpbmcgTWlzdCc6ICcxMjNBJywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBOYWdhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFB1bmN0dXJlJzogJzExNzEnLCAvLyBTaG9ydCBsaW5lIEFvRSwgQ3VsdHVyZWQgRW1wdXNhIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIFNpZGVzd2lwZSc6ICcxMUE3JywgLy8gQ29uYWwgQW9FLCBDdWx0dXJlZCBSZXB0b2lkIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIEd1c3QnOiAnMzk1JywgLy8gVGFyZ2V0ZWQgc21hbGwgY2lyY2xlIEFvRSwgQ3VsdHVyZWQgTWlycm9ya25pZ2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnQVJGIE1hcnJvdyBEcmFpbic6ICdEMEUnLCAvLyBDb25hbCBBb0UsIEN1bHR1cmVkIENoaW1lcmEgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdBUkYgUmlkZGxlIE9mIFRoZSBTcGhpbngnOiAnMTBFNCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIGJvc3MgMlxyXG4gICAgJ0FSRiBLYSc6ICcxMDZFJywgLy8gQ29uYWwgQW9FLCBib3NzIDJcclxuICAgICdBUkYgUm90b3N3aXBlJzogJzExQ0MnLCAvLyBDb25hbCBBb0UsIEZhY2lsaXR5IERyZWFkbm91Z2h0IHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEF1dG8tY2Fubm9ucyc6ICcxMkQ5JywgLy8gTGluZSBBb0UsIE1vbml0b3JpbmcgRHJvbmUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdBUkYgRGVhdGhcXCdzIERvb3InOiAnNEVDJywgLy8gTGluZSBBb0UsIEN1bHR1cmVkIFNoYWJ0aSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FSRiBTcGVsbHN3b3JkJzogJzRFQicsIC8vIENvbmFsIEFvRSwgQ3VsdHVyZWQgU2hhYnRpIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQVJGIEVuZCBPZiBEYXlzJzogJzEwRkQnLCAvLyBMaW5lIEFvRSwgYm9zcyAzXHJcbiAgICAnQVJGIEJsaXp6YXJkIEJ1cnN0JzogJzEwRkUnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgSWdleW9yaG0sIGJvc3MgM1xyXG4gICAgJ0FSRiBGaXJlIEJ1cnN0JzogJzEwRkYnLCAvLyBGaXhlZCBjaXJjbGUgQW9FcywgTGFoYWJyZWEsIGJvc3MgM1xyXG4gICAgJ0FSRiBTZWEgT2YgUGl0Y2gnOiAnMTJERScsIC8vIFRhcmdldGVkIHBlcnNpc3RlbnQgY2lyY2xlIEFvRXMsIGJvc3MgM1xyXG4gICAgJ0FSRiBEYXJrIEJsaXp6YXJkIElJJzogJzEwRjMnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIElnZXlvcmhtLCBib3NzIDNcclxuICAgICdBUkYgRGFyayBGaXJlIElJJzogJzEwRjgnLCAvLyBSYW5kb20gY2lyY2xlIEFvRXMsIExhaGFicmVhLCBib3NzIDNcclxuICAgICdBUkYgQW5jaWVudCBFcnVwdGlvbic6ICcxMTA0JywgLy8gU2VsZi10YXJnZXRlZCBjaXJjbGUgQW9FLCBib3NzIDRcclxuICAgICdBUkYgRW50cm9waWMgRmxhbWUnOiAnMTEwOCcsIC8vIExpbmUgQW9FcywgIGJvc3MgNFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQVJGIENodGhvbmljIEh1c2gnOiAnMTBFNycsIC8vIEluc3RhbnQgdGFuayBjbGVhdmUsIGJvc3MgMlxyXG4gICAgJ0FSRiBIZWlnaHQgT2YgQ2hhb3MnOiAnMTEwMScsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDRcclxuICAgICdBUkYgQW5jaWVudCBDaXJjbGUnOiAnMTEwMicsIC8vIFRhcmdldGVkIGRvbnV0IEFvRXMsIGJvc3MgNFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdBUkYgUGV0cmlmYWN0aW9uJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzAxJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBGcmFjdGFsIENvbnRpbnV1bVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlRnJhY3RhbENvbnRpbnV1bSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBEb3VibGUgU2V2ZXInOiAnRjdEJywgLy8gQ29uYWxzLCBib3NzIDFcclxuICAgICdGcmFjdGFsIEFldGhlcmljIENvbXByZXNzaW9uJzogJ0Y4MCcsIC8vIEdyb3VuZCBBb0UgY2lyY2xlcywgYm9zcyAxXHJcbiAgICAnRnJhY3RhbCAxMS1Ub256ZSBTd2lwZSc6ICdGODEnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0ZyYWN0YWwgMTAtVG9uemUgU2xhc2gnOiAnRjgzJywgLy8gRnJvbnRhbCBsaW5lLCBib3NzIDJcclxuICAgICdGcmFjdGFsIDExMS1Ub256ZSBTd2luZyc6ICdGODcnLCAvLyBHZXQtb3V0IEFvRSwgYm9zcyAyXHJcbiAgICAnRnJhY3RhbCBCcm9rZW4gR2xhc3MnOiAnRjhFJywgLy8gR2xvd2luZyBwYW5lbHMsIGJvc3MgM1xyXG4gICAgJ0ZyYWN0YWwgTWluZXMnOiAnRjkwJyxcclxuICAgICdGcmFjdGFsIFNlZWQgb2YgdGhlIFJpdmVycyc6ICdGOTEnLCAvLyBHcm91bmQgQW9FIGNpcmNsZXMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRnJhY3RhbCBTYW5jdGlmaWNhdGlvbic6ICdGODknLCAvLyBJbnN0YW50IGNvbmFsIGJ1c3RlciwgYm9zcyAzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc0ltcD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUdyZWF0R3ViYWxMaWJyYXJ5SGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBUZXJyb3IgRXllJzogJzkzMCcsIC8vIENpcmNsZSBBb0UsIFNwaW5lIEJyZWFrZXIgdHJhc2hcclxuICAgICdHdWJhbEhtIEJhdHRlcic6ICcxOThBJywgLy8gQ2lyY2xlIEFvRSwgdHJhc2ggYmVmb3JlIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gQ29uZGVtbmF0aW9uJzogJzM5MCcsIC8vIENvbmFsIEFvRSwgQmlibGlvdm9yZSB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMSc6ICcxOTQzJywgLy8gRmFsbGluZyBib29rIHNoYWRvdywgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBEaXNjb250aW51ZSAyJzogJzE5NDAnLCAvLyBSdXNoIEFvRSBmcm9tIGVuZHMsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGlzY29udGludWUgMyc6ICcxOTQyJywgLy8gUnVzaCBBb0UgYWNyb3NzLCBib3NzIDFcclxuICAgICdHdWJhbEhtIEZyaWdodGZ1bCBSb2FyJzogJzE5M0InLCAvLyBHZXQtT3V0IEFvRSwgYm9zcyAxXHJcbiAgICAnR3ViYWxIbSBJc3N1ZSAxJzogJzE5M0QnLCAvLyBJbml0aWFsIGVuZCBib29rIHdhcm5pbmcgQW9FLCBib3NzIDFcclxuICAgICdHdWJhbEhtIElzc3VlIDInOiAnMTkzRicsIC8vIEluaXRpYWwgZW5kIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gSXNzdWUgMyc6ICcxOTQxJywgLy8gSW5pdGlhbCBzaWRlIGJvb2sgd2FybmluZyBBb0UsIGJvc3MgMVxyXG4gICAgJ0d1YmFsSG0gRGVzb2xhdGlvbic6ICcxOThDJywgLy8gTGluZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBEb3VibGUgU21hc2gnOiAnMjZBJywgLy8gQ29uYWwgQW9FLCBCaWJsaW9jbGFzdCB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRGFya25lc3MnOiAnM0EwJywgLy8gQ29uYWwgQW9FLCBJbmtzdGFpbiB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gRmlyZXdhdGVyJzogJzNCQScsIC8vIENpcmNsZSBBb0UsIEJpYmxpb2NsYXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBFbGJvdyBEcm9wJzogJ0NCQScsIC8vIENvbmFsIEFvRSwgQmlibGlvY2xhc3QgdHJhc2hcclxuICAgICdHdWJhbEhtIERhcmsnOiAnMTlERicsIC8vIExhcmdlIGNpcmNsZSBBb0UsIElua3N0YWluIHRyYXNoXHJcbiAgICAnR3ViYWxIbSBTZWFscyc6ICcxOTRBJywgLy8gU3VuL01vb25zZWFsIGZhaWx1cmUsIGJvc3MgMlxyXG4gICAgJ0d1YmFsSG0gV2F0ZXIgSUlJJzogJzFDNjcnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBQb3JvZ28gUGVnaXN0IHRyYXNoXHJcbiAgICAnR3ViYWxIbSBSYWdpbmcgQXhlJzogJzE3MDMnLCAvLyBTbWFsbCBjb25hbCBBb0UsIE1lY2hhbm9zZXJ2aXRvciB0cmFzaFxyXG4gICAgJ0d1YmFsSG0gTWFnaWMgSGFtbWVyJzogJzE5OTAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBBcGFuZGEgbWluaS1ib3NzXHJcbiAgICAnR3ViYWxIbSBQcm9wZXJ0aWVzIE9mIEdyYXZpdHknOiAnMTk1MCcsIC8vIENpcmNsZSBBb0UgZnJvbSBncmF2aXR5IHB1ZGRsZXMsIGJvc3MgM1xyXG4gICAgJ0d1YmFsSG0gUHJvcGVydGllcyBPZiBMZXZpdGF0aW9uJzogJzE5NEYnLCAvLyBDaXJjbGUgQW9FIGZyb20gbGV2aXRhdGlvbiBwdWRkbGVzLCBib3NzIDNcclxuICAgICdHdWJhbEhtIENvbWV0JzogJzE5NjknLCAvLyBTbWFsbCBjaXJjbGUgQW9FLCBpbnRlcm1pc3Npb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0d1YmFsSG0gRWNsaXB0aWMgTWV0ZW9yJzogJzE5NUMnLCAvLyBMb1MgbWVjaGFuaWMsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnR3ViYWxIbSBTZWFyaW5nIFdpbmQnOiAnMTk0NCcsIC8vIFRhbmsgY2xlYXZlLCBib3NzIDJcclxuICAgICdHdWJhbEhtIFRodW5kZXInOiAnMTlbQUJdJywgLy8gU3ByZWFkIG1hcmtlciwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBGaXJlIGdhdGUgaW4gaGFsbHdheSB0byBib3NzIDIsIG1hZ25ldCBmYWlsdXJlIG9uIGJvc3MgMlxyXG4gICAgICBpZDogJ0d1YmFsSG0gQnVybnMnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTBCJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIFRodW5kZXIgMyBmYWlsdXJlc1xyXG4gICAgICBpZDogJ0d1YmFsSG0gSW1wIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDZFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzSW1wID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0ltcFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdHdWJhbEhtIEltcCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0ltcCA9IGRhdGEuaGFzSW1wIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzSW1wW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGFyZ2V0cyB3aXRoIEltcCB3aGVuIFRodW5kZXIgSUlJIHJlc29sdmVzIHJlY2VpdmUgYSB2dWxuZXJhYmlsaXR5IHN0YWNrIGFuZCBicmllZiBzdHVuXHJcbiAgICAgIGlkOiAnR3ViYWxIbSBJbXAgVGh1bmRlcicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NVtBQl0nLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuaGFzSW1wPy5bbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1Nob2NrZWQgSW1wJyxcclxuICAgICAgICAgICAgZGU6ICdTY2hvY2tpZXJ0ZXIgSW1wJyxcclxuICAgICAgICAgICAgamE6ICfjgqvjg4Pjg5HjgpLop6PpmaTjgZfjgarjgYvjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+ays+erpeeKtuaAgeWQg+S6huaatOmbtycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gUXVha2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcxOTU2JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBBbHdheXMgaGl0cyB0YXJnZXQsIGJ1dCBpZiBjb3JyZWN0bHkgcmVzb2x2ZWQgd2lsbCBkZWFsIDAgZGFtYWdlXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0d1YmFsSG0gVG9ybmFkbycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzE5NVs3OF0nLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIEFsd2F5cyBoaXRzIHRhcmdldCwgYnV0IGlmIGNvcnJlY3RseSByZXNvbHZlZCB3aWxsIGRlYWwgMCBkYW1hZ2VcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNvaG1BbEhhcmQsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NvaG1BbEhtIERlYWRseSBWYXBvcic6ICcxREM5JywgLy8gRW52aXJvbm1lbnRhbCBjaXJjbGUgQW9Fc1xyXG4gICAgJ1NvaG1BbEhtIERlZXByb290JzogJzFDREEnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBCbG9vbWluZyBDaGljaHUgdHJhc2hcclxuICAgICdTb2htQWxIbSBPZGlvdXMgQWlyJzogJzFDREInLCAvLyBDb25hbCBBb0UsIEJsb29taW5nIENoaWNodSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEdsb3Jpb3VzIEJsYXplJzogJzFDMzMnLCAvLyBDaXJjbGUgQW9FLCBTbWFsbCBTcG9yZSBTYWMsIGJvc3MgMVxyXG4gICAgJ1NvaG1BbEhtIEZvdWwgV2F0ZXJzJzogJzExOEEnLCAvLyBDb25hbCBBb0UsIE1vdW50YWludG9wIE9wa2VuIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUGxhaW4gUG91bmQnOiAnMTE4NycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIE1vdW50YWludG9wIEhyb3BrZW4gdHJhc2hcclxuICAgICdTb2htQWxIbSBQYWxzeW55eGlzJzogJzExNjEnLCAvLyBDb25hbCBBb0UsIE92ZXJncm93biBEaWZmbHVnaWEgdHJhc2hcclxuICAgICdTb2htQWxIbSBTdXJmYWNlIEJyZWFjaCc6ICcxRTgwJywgLy8gQ2lyY2xlIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIEZyZXNod2F0ZXIgQ2Fubm9uJzogJzExOUYnLCAvLyBMaW5lIEFvRSwgR2lhbnQgTmV0aGVyd29ybSB0cmFzaFxyXG4gICAgJ1NvaG1BbEhtIFRhaWwgU21hc2gnOiAnMUMzNScsIC8vIFVudGVsZWdyYXBoZWQgcmVhciBjb25hbCBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gVGFpbCBTd2luZyc6ICcxQzM2JywgLy8gVW50ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFJpcHBlciBDbGF3JzogJzFDMzcnLCAvLyBVbnRlbGVncmFwaGVkIGZyb250YWwgQW9FLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIFdpbmQgU2xhc2gnOiAnMUMzOCcsIC8vIENpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gV2lsZCBDaGFyZ2UnOiAnMUMzOScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEhvdCBDaGFyZ2UnOiAnMUMzQScsIC8vIERhc2ggYXR0YWNrLCBHb3dyb3csIGJvc3MgMlxyXG4gICAgJ1NvaG1BbEhtIEZpcmViYWxsJzogJzFDM0InLCAvLyBVbnRlbGVncmFwaGVkIHRhcmdldGVkIGNpcmNsZSBBb0UsIEdvd3JvdywgYm9zcyAyXHJcbiAgICAnU29obUFsSG0gTGF2YSBGbG93JzogJzFDM0MnLCAvLyBVbnRlbGVncmFwaGVkIGNvbmFsIEFvRSwgR293cm93LCBib3NzIDJcclxuICAgICdTb2htQWxIbSBXaWxkIEhvcm4nOiAnMTUwNycsIC8vIENvbmFsIEFvRSwgQWJhbGF0aGlhbiBDbGF5IEdvbGVtIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTGF2YSBCcmVhdGgnOiAnMUM0RCcsIC8vIENvbmFsIEFvRSwgTGF2YSBDcmFiIHRyYXNoXHJcbiAgICAnU29obUFsSG0gUmluZyBvZiBGaXJlJzogJzFDNEMnLCAvLyBUYXJnZXRlZCBjaXJjbGUgQW9FLCBWb2xjYW5vIEFuYWxhIHRyYXNoXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMSc6ICcxQzQzJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMic6ICcxQzQ0JywgLy8gMjcwLWRlZ3JlZSByZWFyIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgICAnU29obUFsSG0gTW9sdGVuIFNpbGsgMyc6ICcxQzQyJywgLy8gUmluZyBBb0UsIExhdmEgU2NvcnBpb24sIGJvc3MgM1xyXG4gICAgJ1NvaG1BbEhtIFJlYWxtIFNoYWtlcic6ICcxQzQxJywgLy8gQ2lyY2xlIEFvRSwgTGF2YSBTY29ycGlvbiwgYm9zcyAzXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXYXJucyBpZiBwbGF5ZXJzIHN0ZXAgaW50byB0aGUgbGF2YSBwdWRkbGVzLiBUaGVyZSBpcyB1bmZvcnR1bmF0ZWx5IG5vIGRpcmVjdCBkYW1hZ2UgZXZlbnQuXHJcbiAgICAgIGlkOiAnU29obUFsSG0gQnVybnMnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTFDJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBhc3NhdWx0Pzogc3RyaW5nW107XHJcbn1cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbGV4YW5kZXJUaGVTb3VsT2ZUaGVDcmVhdG9yLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdBMTJOIFNhY3JhbWVudCc6ICcxQUU2JywgLy8gQ3Jvc3MgTGFzZXJzXHJcbiAgICAnQTEyTiBHcmF2aXRhdGlvbmFsIEFub21hbHknOiAnMUFFQicsIC8vIEdyYXZpdHkgUHVkZGxlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQTEyTiBEaXZpbmUgU3BlYXInOiAnMUFFMycsIC8vIEluc3RhbnQgY29uYWwgdGFuayBjbGVhdmVcclxuICAgICdBMTJOIEJsYXppbmcgU2NvdXJnZSc6ICcxQUU5JywgLy8gT3JhbmdlIGhlYWQgbWFya2VyIHNwbGFzaCBkYW1hZ2VcclxuICAgICdBMTJOIFBsYWludCBPZiBTZXZlcml0eSc6ICcxQUYxJywgLy8gQWdncmF2YXRlZCBBc3NhdWx0IHNwbGFzaCBkYW1hZ2VcclxuICAgICdBMTJOIENvbW11bmlvbic6ICcxQUZDJywgLy8gVGV0aGVyIFB1ZGRsZXNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnQTEyTiBBc3NhdWx0IENvbGxlY3QnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNDYxJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuYXNzYXVsdCA/Pz0gW107XHJcbiAgICAgICAgZGF0YS5hc3NhdWx0LnB1c2gobWF0Y2hlcy50YXJnZXQpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gSXQgaXMgYSBmYWlsdXJlIGZvciBhIFNldmVyaXR5IG1hcmtlciB0byBzdGFjayB3aXRoIHRoZSBTb2xpZGFyaXR5IGdyb3VwLlxyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBGYWlsdXJlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUFGMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5hc3NhdWx0Py5pbmNsdWRlcyhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnRGlkblxcJ3QgU3ByZWFkIScsXHJcbiAgICAgICAgICAgIGRlOiAnTmljaHQgdmVydGVpbHQhJyxcclxuICAgICAgICAgICAgZnI6ICdOZSBzXFwnZXN0IHBhcyBkaXNwZXJzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5pWj6ZaL44GX44Gq44GL44Gj44GfIScsXHJcbiAgICAgICAgICAgIGNuOiAn5rKh5pyJ5pWj5byAIScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0ExMk4gQXNzYXVsdCBDbGVhbnVwJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ2MScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMjAsXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogNSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmFzc2F1bHQ7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5BbGFNaGlnbyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQWxhIE1oaWdvIE1hZ2l0ZWsgUmF5JzogJzI0Q0UnLCAvLyBMaW5lIEFvRSwgTGVnaW9uIFByZWRhdG9yIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnQWxhIE1oaWdvIExvY2sgT24nOiAnMjA0NycsIC8vIEhvbWluZyBjaXJjbGVzLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAxJzogJzIwNDknLCAvLyBGcm9udGFsIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAyJzogJzIwNEInLCAvLyBSZWFyIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gVGFpbCBMYXNlciAzJzogJzIwNEMnLCAvLyBSZWFyIGxpbmUgQW9FLCBib3NzIDFcclxuICAgICdBbGEgTWhpZ28gU2hvdWxkZXIgQ2Fubm9uJzogJzI0RDAnLCAvLyBDaXJjbGUgQW9FLCBMZWdpb24gQXZlbmdlciB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG4gICAgJ0FsYSBNaGlnbyBDYW5ub25maXJlJzogJzIzRUQnLCAvLyBFbnZpcm9ubWVudGFsIGNpcmNsZSBBb0UsIHBhdGggdG8gYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIEFldGhlcm9jaGVtaWNhbCBHcmVuYWRvJzogJzIwNUEnLCAvLyBDaXJjbGUgQW9FLCBib3NzIDJcclxuICAgICdBbGEgTWhpZ28gSW50ZWdyYXRlZCBBZXRoZXJvbW9kdWxhdG9yJzogJzIwNUInLCAvLyBSaW5nIEFvRSwgYm9zcyAyXHJcbiAgICAnQWxhIE1oaWdvIENpcmNsZSBPZiBEZWF0aCc6ICcyNEQ0JywgLy8gUHJveGltaXR5IGNpcmNsZSBBb0UsIEhleGFkcm9uZSB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBFeGhhdXN0JzogJzI0RDMnLCAvLyBMaW5lIEFvRSwgTGVnaW9uIENvbG9zc3VzIHRyYXNoLCBiZWZvcmUgYm9zcyAzXHJcbiAgICAnQWxhIE1oaWdvIEdyYW5kIFN3b3JkJzogJzI0RDInLCAvLyBDb25hbCBBb0UsIExlZ2lvbiBDb2xvc3N1cyB0cmFzaCwgYmVmb3JlIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBBcnQgT2YgVGhlIFN0b3JtIDEnOiAnMjA2NicsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBwcmUtaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTdG9ybSAyJzogJzI1ODcnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgaW50ZXJtaXNzaW9uLCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gVmVpbiBTcGxpdHRlciAxJzogJzI0QjYnLCAvLyBQcm94aW1pdHkgY2lyY2xlIEFvRSwgcHJpbWFyeSBlbnRpdHksIGJvc3MgM1xyXG4gICAgJ0FsYSBNaGlnbyBWZWluIFNwbGl0dGVyIDInOiAnMjA2QycsIC8vIFByb3hpbWl0eSBjaXJjbGUgQW9FLCBoZWxwZXIgZW50aXR5LCBib3NzIDNcclxuICAgICdBbGEgTWhpZ28gTGlnaHRsZXNzIFNwYXJrJzogJzIwNkInLCAvLyBDb25hbCBBb0UsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQWxhIE1oaWdvIERlbWltYWdpY2tzJzogJzIwNUUnLFxyXG4gICAgJ0FsYSBNaGlnbyBVbm1vdmluZyBUcm9pa2EnOiAnMjA2MCcsXHJcbiAgICAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dvcmQgMSc6ICcyMDY5JyxcclxuICAgICdBbGEgTWhpZ28gQXJ0IE9mIFRoZSBTd29yZCAyJzogJzI1ODknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSXQncyBwb3NzaWJsZSBwbGF5ZXJzIG1pZ2h0IGp1c3Qgd2FuZGVyIGludG8gdGhlIGJhZCBvbiB0aGUgb3V0c2lkZSxcclxuICAgICAgLy8gYnV0IG5vcm1hbGx5IHBlb3BsZSBnZXQgcHVzaGVkIGludG8gaXQuXHJcbiAgICAgIGlkOiAnQWxhIE1oaWdvIEFydCBPZiBUaGUgU3dlbGwnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICAvLyBEYW1hZ2UgRG93blxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMkI4JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyLCBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gRm9yIHJlYXNvbnMgbm90IGNvbXBsZXRlbHkgdW5kZXJzdG9vZCBhdCB0aGUgdGltZSB0aGlzIHdhcyBtZXJnZWQsXHJcbi8vIGJ1dCBsaWtlbHkgcmVsYXRlZCB0byB0aGUgZmFjdCB0aGF0IG5vIG5hbWVwbGF0ZXMgYXJlIHZpc2libGUgZHVyaW5nIHRoZSBlbmNvdW50ZXIsXHJcbi8vIGFuZCB0aGF0IG5vdGhpbmcgaW4gdGhlIGVuY291bnRlciBhY3R1YWxseSBkb2VzIGRhbWFnZSxcclxuLy8gd2UgY2FuJ3QgdXNlIGRhbWFnZVdhcm4gb3IgZ2FpbnNFZmZlY3QgaGVscGVycyBvbiB0aGUgQmFyZGFtIGZpZ2h0LlxyXG4vLyBJbnN0ZWFkLCB3ZSB1c2UgdGhpcyBoZWxwZXIgZnVuY3Rpb24gdG8gbG9vayBmb3IgZmFpbHVyZSBmbGFncy5cclxuLy8gSWYgdGhlIGZsYWcgaXMgcHJlc2VudCxhIGZ1bGwgdHJpZ2dlciBvYmplY3QgaXMgcmV0dXJuZWQgdGhhdCBkcm9wcyBpbiBzZWFtbGVzc2x5LlxyXG5jb25zdCBhYmlsaXR5V2FybiA9IChhcmdzOiB7IGFiaWxpdHlJZDogc3RyaW5nOyBpZDogc3RyaW5nIH0pOiBPb3BzeVRyaWdnZXI8RGF0YT4gPT4ge1xyXG4gIGlmICghYXJncy5hYmlsaXR5SWQpXHJcbiAgICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIGFiaWxpdHkgJyArIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcclxuICBjb25zdCB0cmlnZ2VyOiBPb3BzeVRyaWdnZXI8RGF0YT4gPSB7XHJcbiAgICBpZDogYXJncy5pZCxcclxuICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IGFyZ3MuYWJpbGl0eUlkIH0pLFxyXG4gICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMuZmxhZ3Muc3Vic3RyKC0yKSA9PT0gJzBFJyxcclxuICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICB9LFxyXG4gIH07XHJcbiAgcmV0dXJuIHRyaWdnZXI7XHJcbn07XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQmFyZGFtc01ldHRsZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQmFyZGFtIERpcnR5IENsYXcnOiAnMjFBOCcsIC8vIEZyb250YWwgY2xlYXZlLCBHdWxvIEd1bG8gdHJhc2hcclxuICAgICdCYXJkYW0gRXBpZ3JhcGgnOiAnMjNBRicsIC8vIExpbmUgQW9FLCBXYWxsIG9mIEJhcmRhbSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBUaGUgRHVzayBTdGFyJzogJzIxODcnLCAvLyBDaXJjbGUgQW9FLCBlbnZpcm9ubWVudCBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBUaGUgRGF3biBTdGFyJzogJzIxODYnLCAvLyBDaXJjbGUgQW9FLCBlbnZpcm9ubWVudCBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBDcnVtYmxpbmcgQ3J1c3QnOiAnMUYxMycsIC8vIENpcmNsZSBBb0VzLCBHYXJ1bGEsIGZpcnN0IGJvc3NcclxuICAgICdCYXJkYW0gUmFtIFJ1c2gnOiAnMUVGQycsIC8vIExpbmUgQW9FcywgU3RlcHBlIFlhbWFhLCBmaXJzdCBib3NzLlxyXG4gICAgJ0JhcmRhbSBMdWxsYWJ5JzogJzI0QjInLCAvLyBDaXJjbGUgQW9FcywgU3RlcHBlIFNoZWVwLCBmaXJzdCBib3NzLlxyXG4gICAgJ0JhcmRhbSBIZWF2ZSc6ICcxRUY3JywgLy8gRnJvbnRhbCBjbGVhdmUsIEdhcnVsYSwgZmlyc3QgYm9zc1xyXG4gICAgJ0JhcmRhbSBXaWRlIEJsYXN0ZXInOiAnMjRCMycsIC8vIEVub3Jtb3VzIGZyb250YWwgY2xlYXZlLCBTdGVwcGUgQ29ldXJsLCBmaXJzdCBib3NzXHJcbiAgICAnQmFyZGFtIERvdWJsZSBTbWFzaCc6ICcyNkEnLCAvLyBDaXJjbGUgQW9FLCBNZXR0bGluZyBEaGFyYSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBUcmFuc29uaWMgQmxhc3QnOiAnMTI2MicsIC8vIENpcmNsZSBBb0UsIFN0ZXBwZSBFYWdsZSB0cmFzaFxyXG4gICAgJ0JhcmRhbSBXaWxkIEhvcm4nOiAnMjIwOCcsIC8vIEZyb250YWwgY2xlYXZlLCBLaHVuIEd1cnZlbCB0cmFzaFxyXG4gICAgJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMSc6ICcyNTc4JywgLy8gMSBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAyJzogJzI1NzknLCAvLyAyIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gSGVhdnkgU3RyaWtlIDMnOiAnMjU3QScsIC8vIDMgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUcmVtYmxvciAxJzogJzI1N0InLCAvLyAxIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gVHJlbWJsb3IgMic6ICcyNTdDJywgLy8gMiBvZiAyIGNvbmNlbnRyaWMgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIFRocm93aW5nIFNwZWFyJzogJzI1N0YnLCAvLyBDaGVja2VyYm9hcmQgQW9FLCBUaHJvd2luZyBTcGVhciwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gQmFyZGFtXFwncyBSaW5nJzogJzI1ODEnLCAvLyBEb251dCBBb0UgaGVhZG1hcmtlcnMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgICdCYXJkYW0gQ29tZXQnOiAnMjU3RCcsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIENvbWV0IEltcGFjdCc6ICcyNTgwJywgLy8gQ2lyY2xlIEFvRXMsIFN0YXIgU2hhcmQsIHNlY29uZCBib3NzXHJcbiAgICAnQmFyZGFtIElyb24gU3BoZXJlIEF0dGFjayc6ICcxNkI2JywgLy8gQ29udGFjdCBkYW1hZ2UsIElyb24gU3BoZXJlIHRyYXNoLCBiZWZvcmUgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBUb3JuYWRvJzogJzI0N0UnLCAvLyBDaXJjbGUgQW9FLCBLaHVuIFNoYXZhcmEgdHJhc2hcclxuICAgICdCYXJkYW0gUGluaW9uJzogJzFGMTEnLCAvLyBMaW5lIEFvRSwgWW9sIEZlYXRoZXIsIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gRmVhdGhlciBTcXVhbGwnOiAnMUYwRScsIC8vIERhc2ggYXR0YWNrLCBZb2wsIHRoaXJkIGJvc3NcclxuICAgICdCYXJkYW0gRmx1dHRlcmZhbGwgVW50YXJnZXRlZCc6ICcxRjEyJywgLy8gUm90YXRpbmcgY2lyY2xlIEFvRXMsIFlvbCwgdGhpcmQgYm9zc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnQmFyZGFtIENvbmZ1c2VkJzogJzBCJywgLy8gRmFpbGVkIGdhemUgYXR0YWNrLCBZb2wsIHRoaXJkIGJvc3NcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0RmFpbDoge1xyXG4gICAgJ0JhcmRhbSBGZXR0ZXJzJzogJzU2RicsIC8vIEZhaWxpbmcgdHdvIG1lY2hhbmljcyBpbiBhbnkgb25lIHBoYXNlIG9uIEJhcmRhbSwgc2Vjb25kIGJvc3MuXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdCYXJkYW0gR2FydWxhIFJ1c2gnOiAnMUVGOScsIC8vIExpbmUgQW9FLCBHYXJ1bGEsIGZpcnN0IGJvc3MuXHJcbiAgICAnQmFyZGFtIEZsdXR0ZXJmYWxsIFRhcmdldGVkJzogJzFGMEMnLCAvLyBDaXJjbGUgQW9FIGhlYWRtYXJrZXIsIFlvbCwgdGhpcmQgYm9zc1xyXG4gICAgJ0JhcmRhbSBXaW5nYmVhdCc6ICcxRjBGJywgLy8gQ29uYWwgQW9FIGhlYWRtYXJrZXIsIFlvbCwgdGhpcmQgYm9zc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIC8vIDEgb2YgMyAyNzAtZGVncmVlIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBIZWF2eSBTdHJpa2UgMScsIGFiaWxpdHlJZDogJzI1NzgnIH0pLFxyXG4gICAgLy8gMiBvZiAzIDI3MC1kZWdyZWUgcmluZyBBb0VzLCBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEhlYXZ5IFN0cmlrZSAyJywgYWJpbGl0eUlkOiAnMjU3OScgfSksXHJcbiAgICAvLyAzIG9mIDMgMjcwLWRlZ3JlZSByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gSGVhdnkgU3RyaWtlIDMnLCBhYmlsaXR5SWQ6ICcyNTdBJyB9KSxcclxuICAgIC8vIDEgb2YgMiBjb25jZW50cmljIHJpbmcgQW9FcywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBUcmVtYmxvciAxJywgYWJpbGl0eUlkOiAnMjU3QicgfSksXHJcbiAgICAvLyAyIG9mIDIgY29uY2VudHJpYyByaW5nIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gVHJlbWJsb3IgMicsIGFiaWxpdHlJZDogJzI1N0MnIH0pLFxyXG4gICAgLy8gQ2hlY2tlcmJvYXJkIEFvRSwgVGhyb3dpbmcgU3BlYXIsIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIFRocm93aW5nIFNwZWFyJywgYWJpbGl0eUlkOiAnMjU3RicgfSksXHJcbiAgICAvLyBHYXplIGF0dGFjaywgV2FycmlvciBvZiBCYXJkYW0sIHNlY29uZCBib3NzXHJcbiAgICBhYmlsaXR5V2Fybih7IGlkOiAnQmFyZGFtIEVtcHR5IEdhemUnLCBhYmlsaXR5SWQ6ICcxRjA0JyB9KSxcclxuICAgIC8vIERvbnV0IEFvRSBoZWFkbWFya2VycywgQmFyZGFtLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbVxcJ3MgUmluZycsIGFiaWxpdHlJZDogJzI1ODEnIH0pLFxyXG4gICAgLy8gVGFyZ2V0ZWQgY2lyY2xlIEFvRXMsIEJhcmRhbSwgc2Vjb25kIGJvc3NcclxuICAgIGFiaWxpdHlXYXJuKHsgaWQ6ICdCYXJkYW0gQ29tZXQnLCBhYmlsaXR5SWQ6ICcyNTdEJyB9KSxcclxuICAgIC8vIENpcmNsZSBBb0VzLCBTdGFyIFNoYXJkLCBzZWNvbmQgYm9zc1xyXG4gICAgYWJpbGl0eVdhcm4oeyBpZDogJ0JhcmRhbSBDb21ldCBJbXBhY3QnLCBhYmlsaXR5SWQ6ICcyNTgwJyB9KSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZURyb3duZWRDaXR5T2ZTa2FsbGEsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0h5ZHJvY2Fubm9uJzogJzI2OTcnLCAvLyBMaW5lIEFvRSwgU2FsdCBTd2FsbG93IHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3RhZ25hbnQgU3ByYXknOiAnMjY5OScsIC8vIENvbmFsIEFvRSwgU2thbGxhIE5hbmthIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcblxyXG4gICAgJ0J1YmJsZSBCdXJzdCc6ICcyNjFCJywgLy8gQnViYmxlIGV4cGxvc2lvbiwgSHlkcm9zcGhlcmUsIGJvc3MgMVxyXG5cclxuICAgICdQbGFpbiBQb3VuZCc6ICcyNjlBJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgRGhhcmEgU2VudGluZWwgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdCb3VsZGVyIFRvc3MnOiAnMjY5QicsIC8vIFNtYWxsIGNpcmNsZSBBb0UsIFN0b25lIFBob2ViYWQgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdMYW5kc2xpcCc6ICcyNjlDJywgLy8gQ29uYWwgQW9FLCBTdG9uZSBQaG9lYmFkIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcblxyXG4gICAgJ015c3RpYyBMaWdodCc6ICcyNjU3JywgLy8gQ29uYWwgQW9FLCBUaGUgT2xkIE9uZSwgYm9zcyAyXHJcbiAgICAnTXlzdGljIEZsYW1lJzogJzI2NTknLCAvLyBMYXJnZSBjaXJjbGUgQW9FLCBUaGUgT2xkIE9uZSwgYm9zcyAyLiAyNjU4IGlzIHRoZSBjYXN0LXRpbWUgYWJpbGl0eS5cclxuXHJcbiAgICAnRGFyayBJSSc6ICcxMTBFJywgLy8gVGhpbiBjb25lIEFvRSwgTGlnaHRsZXNzIEhvbXVuY3VsdXMgdHJhc2gsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ0ltcGxvc2l2ZSBDdXJzZSc6ICcyNjlFJywgLy8gQ29uYWwgQW9FLCBaYW5nYmV0byB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnVW5keWluZyBGSXJlJzogJzI2OUYnLCAvLyBDaXJjbGUgQW9FLCBaYW5nYmV0byB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnRmlyZSBJSSc6ICcyNkEwJywgLy8gQ2lyY2xlIEFvRSwgQWNjdXJzZWQgSWRvbCB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcblxyXG4gICAgJ1J1c3RpbmcgQ2xhdyc6ICcyNjYxJywgLy8gRnJvbnRhbCBjbGVhdmUsIEhyb2RyaWMgUG9pc29udG9uZ3VlLCBib3NzIDNcclxuICAgICdXb3JkcyBPZiBXb2UnOiAnMjY2MicsIC8vIEV5ZSBsYXNlcnMsIEhyb2RyaWMgUG9pc29udG9uZ3VlLCBib3NzIDNcclxuICAgICdUYWlsIERyaXZlJzogJzI2NjMnLCAvLyBSZWFyIGNsZWF2ZSwgSHJvZHJpYyBQb2lzb250b25ndWUsIGJvc3MgM1xyXG4gICAgJ1JpbmcgT2YgQ2hhb3MnOiAnMjY2NycsIC8vIFJpbmcgaGVhZG1hcmtlciwgSHJvZHJpYyBQb2lzb250b25ndWUsIGJvc3MgM1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1NlbGYtRGV0b25hdGUnOiAnMjY1QycsIC8vIFJvb213aWRlIGV4cGxvc2lvbiwgU3Vic2VydmllbnQsIGJvc3MgMlxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRHJvcHN5JzogJzExQicsIC8vIFN0YW5kaW5nIGluIEJsb29keSBQdWRkbGVzLCBvciBiZWluZyBrbm9ja2VkIG91dHNpZGUgdGhlIGFyZW5hLCBib3NzIDFcclxuICAgICdDb25mdXNlZCc6ICcwQicsIC8vIEZhaWxpbmcgdGhlIGdhemUgYXR0YWNrLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0Jsb29keSBQdWRkbGUnOiAnMjY1NScsIC8vIExhcmdlIHdhdGVyeSBzcHJlYWQgY2lyY2xlcywgS2VscGllLCBib3NzIDFcclxuICAgICdDcm9zcyBPZiBDaGFvcyc6ICcyNjY4JywgLy8gQ3Jvc3MgaGVhZG1hcmtlciwgSHJvZHJpYyBQb2lzb250b25ndWUsIGJvc3MgM1xyXG4gICAgJ0NpcmNsZSBPZiBDaGFvcyc6ICcyNjY5JywgLy8gU3ByZWFkIGNpcmNsZSBoZWFkbWFya2VyLCBIcm9kcmljIFBvaXNvbnRvbmd1ZSwgYm9zcyAzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkt1Z2FuZUNhc3RsZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnS3VnYW5lIENhc3RsZSBUZW5rYSBHb2trZW4nOiAnMjMyOScsIC8vIEZyb250YWwgY29uZSBBb0UsICBKb2kgQmxhZGUgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdLdWdhbmUgQ2FzdGxlIEtlbmtpIFJlbGVhc2UgVHJhc2gnOiAnMjMzMCcsIC8vIENoYXJpb3QgQW9FLCBKb2kgS2l5b2Z1c2EgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBDbGVhcm91dCc6ICcxRTkyJywgLy8gRnJvbnRhbCBjb25lIEFvRSwgWnVpa28tTWFydSwgYm9zcyAxXHJcbiAgICAnS3VnYW5lIENhc3RsZSBIYXJhLUtpcmkgMSc6ICcxRTk2JywgLy8gR2lhbnQgY2lyY2xlIEFvRSwgSGFyYWtpcmkgS29zaG8sIGJvc3MgMVxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSGFyYS1LaXJpIDInOiAnMjRGOScsIC8vIEdpYW50IGNpcmNsZSBBb0UsIEhhcmFraXJpIEtvc2hvLCBib3NzIDFcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBKdWppIFNodXJpa2VuIDEnOiAnMjMyRCcsIC8vIExpbmUgQW9FLCBLYXJha3VyaSBPbm1pdHN1IHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSAxMDAwIEJhcmJzJzogJzIxOTgnLCAvLyBMaW5lIEFvRSwgSm9pIEtvamEgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuXHJcbiAgICAnS3VnYW5lIENhc3RsZSBKdWppIFNodXJpa2VuIDInOiAnMUU5OCcsIC8vIExpbmUgQW9FLCBEb2p1biBNYXJ1LCBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIFRhdGFtaS1HYWVzaGknOiAnMUU5RCcsIC8vIEZsb29yIHRpbGUgbGluZSBhdHRhY2ssIEVsa2l0ZSBPbm1pdHN1LCBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIEp1amkgU2h1cmlrZW4gMyc6ICcxRUEwJywgLy8gTGluZSBBb0UsIEVsaXRlIE9ubWl0c3UsIGJvc3MgMlxyXG5cclxuICAgICdLdWdhbmUgQ2FzdGxlIEF1dG8gQ3Jvc3Nib3cnOiAnMjMzMycsIC8vIEZyb250YWwgY29uZSBBb0UsIEthcmFrdXJpIEhhbnlhIHRyYXNoLCBhZnRlciBib3NzIDJcclxuICAgICdLdWdhbmUgQ2FzdGxlIEhhcmFraXJpIDMnOiAnMjNDOScsIC8vIEdpYW50IENpcmNsZSBBb0UsIEhhcmFraXJpICBIYW55YSB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcblxyXG4gICAgJ0t1Z2FuZSBDYXN0bGUgSWFpLUdpcmknOiAnMUVBMicsIC8vIENoYXJpb3QgQW9FLCBZb2ppbWJvLCBib3NzIDNcclxuICAgICdLdWdhbmUgQ2FzdGxlIEZyYWdpbGl0eSc6ICcxRUFBJywgLy8gQ2hhcmlvdCBBb0UsIElub3NoaWthY2hvLCBib3NzIDNcclxuICAgICdLdWdhbmUgQ2FzdGxlIERyYWdvbmZpcmUnOiAnMUVBQicsIC8vIExpbmUgQW9FLCBEcmFnb24gSGVhZCwgYm9zcyAzXHJcbiAgfSxcclxuXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnS3VnYW5lIENhc3RsZSBJc3Nlbic6ICcxRTk3JywgLy8gSW5zdGFudCBmcm9udGFsIGNsZWF2ZSwgRG9qdW4gTWFydSwgYm9zcyAyXHJcbiAgICAnS3VnYW5lIENhc3RsZSBDbG9ja3dvcmsgUmFpdG9uJzogJzFFOUInLCAvLyBMYXJnZSBsaWdodG5pbmcgc3ByZWFkIGNpcmNsZXMsIERvanVuIE1hcnUsIGJvc3MgMlxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gU3RhY2sgbWFya2VyLCBadWlrbyBNYXJ1LCBib3NzIDFcclxuICAgICAgaWQ6ICdLdWdhbmUgQ2FzdGxlIEhlbG0gQ3JhY2snLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzFFOTQnIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy50eXBlID09PSAnMjEnLCAvLyBUYWtpbmcgdGhlIHN0YWNrIHNvbG8gaXMgKnByb2JhYmx5KiBhIG1pc3Rha2UuXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbG9uZSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoYWxsZWluKWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChzZXVsKGUpKWAsXHJcbiAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjkuIDkuropYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNleWQgylgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo7Zi87J6QIOunnuydjClgLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNhaW50TW9jaWFubmVzQXJib3JldHVtSGFyZCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBNdWRzdHJlYW0nOiAnMzBEOScsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEltbWFjdWxhdGUgQXBhIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTaWxrZW4gU3ByYXknOiAnMzM4NScsIC8vIFJlYXIgY29uZSBBb0UsIFdpdGhlcmVkIEJlbGxhZG9ubmEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE11ZGR5IFB1ZGRsZXMnOiAnMzBEQScsIC8vIFNtYWxsIHRhcmdldGVkIGNpcmNsZSBBb0VzLCBEb3Jwb2trdXIgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE9kaW91cyBBaXInOiAnMkU0OScsIC8vIEZyb250YWwgY29uZSBBb0UsIE51bGxjaHUsIGJvc3MgMVxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU0x1ZGdlIEJvbWInOiAnMkU0RScsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIE9kaW91cyBBdG1vc3BoZXJlJzogJzJFNTEnLCAvLyBDaGFubmVsZWQgMy80IGFyZW5hIGNsZWF2ZSwgTnVsbGNodSwgYm9zcyAxXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBDcmVlcGluZyBJdnknOiAnMzFBNScsIC8vIEZyb250YWwgY29uZSBBb0UsIFdpdGhlcmVkIEt1bGFrIHRyYXNoLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBSb2Nrc2xpZGUnOiAnMzEzNCcsIC8vIExpbmUgQW9FLCBTaWx0IEdvbGVtLCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRocXVha2UgSW5uZXInOiAnMzEyRScsIC8vIENoYXJpb3QgQW9FLCBMYWtoYW11LCBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRocXVha2UgT3V0ZXInOiAnMzEyRicsIC8vIER5bmFtbyBBb0UsIExha2hhbXUsIGJvc3MgMlxyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgRW1iYWxtaW5nIEVhcnRoJzogJzMxQTYnLCAvLyBMYXJnZSBDaGFyaW90IEFvRSwgTXVkZHkgTWF0YSwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBRdWlja21pcmUnOiAnMzEzNicsIC8vIFNld2FnZSBzdXJnZSBhdm9pZGVkIG9uIHBsYXRmb3JtcywgVG9ra2FwY2hpLCBib3NzIDNcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFF1YWdtaXJlIFBsYXRmb3Jtcyc6ICczMTM5JywgLy8gUXVhZ21pcmUgZXhwbG9zaW9uIG9uIHBsYXRmb3JtcywgVG9ra2FwY2hpLCBib3NzIDNcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEZlY3VsZW50IEZsb29kJzogJzMxM0MnLCAvLyBUYXJnZXRlZCB0aGluIGNvbmUgQW9FLCBUb2trYXBjaGksIGJvc3MgM1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgQ29ycnVwdHVyZSc6ICczM0EwJywgLy8gTXVkIFNsaW1lIGV4cGxvc2lvbiwgYm9zcyAzLiAoTm8gZXhwbG9zaW9uIGlmIGRvbmUgY29ycmVjdGx5LilcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgU2VkdWNlZCc6ICczREYnLCAvLyBHYXplIGZhaWx1cmUsIFdpdGhlcmVkIEJlbGxhZG9ubmEgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFBvbGxlbic6ICcxMycsIC8vIFNsdWRnZSBwdWRkbGVzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIFRyYW5zZmlndXJhdGlvbic6ICc2NDgnLCAvLyBSb2x5LVBvbHkgQW9FIGNpcmNsZSBmYWlsdXJlLCBCTG9vbWluZyBCaWxva28gdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEh5c3RlcmlhJzogJzEyOCcsIC8vIEdhemUgZmFpbHVyZSwgTGFraGFtdSwgYm9zcyAyXHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBTdGFiIFdvdW5kJzogJzQ1RCcsIC8vIEFyZW5hIG91dGVyIHdhbGwgZWZmZWN0LCBib3NzIDJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1N0IE1vY2lhbm5lIEhhcmQgVGFwcm9vdCc6ICcyRTRDJywgLy8gTGFyZ2Ugb3JhbmdlIHNwcmVhZCBjaXJjbGVzLCBOdWxsY2h1LCBib3NzIDFcclxuICAgICdTdCBNb2NpYW5uZSBIYXJkIEVhcnRoIFNoYWtlcic6ICczMTMxJywgLy8gRWFydGggU2hha2VyLCBMYWtoYW11LCBib3NzIDJcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnU3QgTW9jaWFubmUgSGFyZCBGYXVsdCBXYXJyZW4nOiAnMkU0QScsIC8vIFN0YWNrIG1hcmtlciwgTnVsbGNodSwgYm9zcyAxXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVN3YWxsb3dzQ29tcGFzcyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBJdnkgRmV0dGVycyc6ICcyQzA0JywgLy8gQ2lyY2xlIGdyb3VuZCBBb0UsIFNhaSBUYWlzdWkgdHJhc2gsIGJlZm9yZSBib3NzIDFcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFdpbGRzd2luZCAxJzogJzJDMDUnLCAvLyBUb3JuYWRvIGdyb3VuZCBBb0UsIHBsYWNlZCBieSBTYWkgVGFpc3VpIHRyYXNoLCBiZWZvcmUgYm9zcyAxXHJcblxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgWWFtYS1LYWd1cmEnOiAnMkI5NicsIC8vIEZyb250YWwgbGluZSBBb0UsIE90ZW5ndSwgYm9zcyAxXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBGbGFtZXMgT2YgSGF0ZSc6ICcyQjk4JywgLy8gRmlyZSBvcmIgZXhwbG9zaW9ucywgYm9zcyAxXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBDb25mbGFncmF0ZSc6ICcyQjk5JywgLy8gQ29sbGlzaW9uIHdpdGggZmlyZSBvcmIsIGJvc3MgMVxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIFVwd2VsbCc6ICcyQzA2JywgLy8gVGFyZ2V0ZWQgY2lyY2xlIGdyb3VuZCBBb0UsIFNhaSBUYWlzdWkgdHJhc2gsIGJlZm9yZSBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJhZCBCcmVhdGgnOiAnMkMwNycsIC8vIEZyb250YWwgY2xlYXZlLCBKaW5tZW5qdSB0cmFzaCwgYmVmb3JlIGJvc3MgMlxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIEdyZWF0ZXIgUGFsbSAxJzogJzJCOUQnLCAvLyBIYWxmIGFyZW5hIHJpZ2h0IGNsZWF2ZSwgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBHcmVhdGVyIFBhbG0gMic6ICcyQjlFJywgLy8gSGFsZiBhcmVuYSBsZWZ0IGNsZWF2ZSwgRGFpZGFyYWJvdGNoaSwgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBUcmlidXRhcnknOiAnMkJBMCcsIC8vIFRhcmdldGVkIHRoaW4gY29uYWwgZ3JvdW5kIEFvRXMsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG5cclxuICAgICdTd2FsbG93cyBDb21wYXNzIFdpbGRzd2luZCAyJzogJzJDMDYnLCAvLyBDaXJjbGUgZ3JvdW5kIEFvRSwgZW52aXJvbm1lbnQsIGFmdGVyIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgV2lsZHN3aW5kIDMnOiAnMkMwNycsIC8vIENpcmNsZSBncm91bmQgQW9FLCBwbGFjZWQgYnkgU2FpIFRhaXN1aSB0cmFzaCwgYWZ0ZXIgYm9zcyAyXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBGaWxvcGx1bWVzJzogJzJDNzYnLCAvLyBGcm9udGFsIHJlY3RhbmdsZSBBb0UsIERyYWdvbiBCaSBGYW5nIHRyYXNoLCBhZnRlciBib3NzIDJcclxuXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCb3RoIEVuZHMgMSc6ICcyQkE4JywgLy8gQ2hhcmlvdCBBb0UsIFFpdGlhbiBEYXNoZW5nLCBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEJvdGggRW5kcyAyJzogJzJCQTknLCAvLyBEeW5hbW8gQW9FLCBRaXRpYW4gRGFzaGVuZywgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCb3RoIEVuZHMgMyc6ICcyQkFFJywgLy8gQ2hhcmlvdCBBb0UsIFNoYWRvdyBPZiBUaGUgU2FnZSwgYm9zcyAzXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCb3RoIEVuZHMgNCc6ICcyQkFGJywgLy8gRHluYW1vIEFvRSwgU2hhZG93IE9mIFRoZSBTYWdlLCBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEVxdWFsIE9mIEhlYXZlbic6ICcyQkI0JywgLy8gU21hbGwgY2lyY2xlIGdyb3VuZCBBb0VzLCBRaXRpYW4gRGFzaGVuZywgYm9zcyAzXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdTd2FsbG93cyBDb21wYXNzIEh5c3RlcmlhJzogJzEyOCcsIC8vIEdhemUgYXR0YWNrIGZhaWx1cmUsIE90ZW5ndSwgYm9zcyAxXHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBCbGVlZGluZyc6ICcxMTJGJywgLy8gU3RlcHBpbmcgb3V0c2lkZSB0aGUgYXJlbmEsIGJvc3MgM1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnU3dhbGxvd3MgQ29tcGFzcyBNaXJhZ2UnOiAnMkJBMicsIC8vIFByZXktY2hhc2luZyBwdWRkbGVzLCBEYWlkYXJhYm90Y2hpLCBib3NzIDJcclxuICAgICdTd2FsbG93cyBDb21wYXNzIE1vdW50YWluIEZhbGxzJzogJzJCQTUnLCAvLyBDaXJjbGUgc3ByZWFkIG1hcmtlcnMsIERhaWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgJ1N3YWxsb3dzIENvbXBhc3MgVGhlIExvbmcgRW5kJzogJzJCQTcnLCAvLyBMYXNlciB0ZXRoZXIsIFFpdGlhbiBEYXNoZW5nICBib3NzIDNcclxuICAgICdTd2FsbG93cyBDb21wYXNzIFRoZSBMb25nIEVuZCAyJzogJzJCQUQnLCAvLyBMYXNlciBUZXRoZXIsIFNoYWRvd3MgT2YgVGhlIFNhZ2UsIGJvc3MgM1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gU3RhbmRpbmcgaW4gdGhlIGxha2UsIERpYWRhcmFib3RjaGksIGJvc3MgMlxyXG4gICAgICBpZDogJ1N3YWxsb3dzIENvbXBhc3MgU2l4IEZ1bG1zIFVuZGVyJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzIzNycgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gU3RhY2sgbWFya2VyLCBib3NzIDNcclxuICAgICAgaWQ6ICdTd2FsbG93cyBDb21wYXNzIEZpdmUgRmluZ2VyZWQgUHVuaXNobWVudCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzJCQUInLCAnMkJCMCddLCBzb3VyY2U6IFsnUWl0aWFuIERhc2hlbmcnLCAnU2hhZG93IE9mIFRoZSBTYWdlJ10gfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiBtYXRjaGVzLnR5cGUgPT09ICcyMScsIC8vIFRha2luZyB0aGUgc3RhY2sgc29sbyBpcyAqcHJvYmFibHkqIGEgbWlzdGFrZS5cclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGFsb25lKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9IChhbGxlaW4pYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHNldWwoZSkpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOS4gOS6uilgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5Y2V5ZCDKWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjtmLzsnpAg66ee7J2MKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlVGVtcGxlT2ZUaGVGaXN0LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUZW1wbGUgRmlyZSBCcmVhayc6ICcyMUVEJywgLy8gQ29uYWwgQW9FLCBCbG9vZGdsaWRlciBNb25rIHRyYXNoXHJcbiAgICAnVGVtcGxlIFJhZGlhbCBCbGFzdGVyJzogJzFGRDMnLCAvLyBDaXJjbGUgQW9FLCBib3NzIDFcclxuICAgICdUZW1wbGUgV2lkZSBCbGFzdGVyJzogJzFGRDQnLCAvLyBDb25hbCBBb0UsIGJvc3MgMVxyXG4gICAgJ1RlbXBsZSBDcmlwcGxpbmcgQmxvdyc6ICcyMDE2JywgLy8gTGluZSBBb0VzLCBlbnZpcm9ubWVudGFsLCBiZWZvcmUgYm9zcyAyXHJcbiAgICAnVGVtcGxlIEJyb2tlbiBFYXJ0aCc6ICcyMzZFJywgLy8gQ2lyY2xlIEFvRSwgU2luZ2hhIHRyYXNoXHJcbiAgICAnVGVtcGxlIFNoZWFyJzogJzFGREQnLCAvLyBEdWFsIGNvbmFsIEFvRSwgYm9zcyAyXHJcbiAgICAnVGVtcGxlIENvdW50ZXIgUGFycnknOiAnMUZFMCcsIC8vIFJldGFsaWF0aW9uIGZvciBpbmNvcnJlY3QgZGlyZWN0aW9uIGFmdGVyIEtpbGxlciBJbnN0aW5jdCwgYm9zcyAyXHJcbiAgICAnVGVtcGxlIFRhcGFzJzogJycsIC8vIFRyYWNraW5nIGNpcmN1bGFyIGdyb3VuZCBBb0VzLCBib3NzIDJcclxuICAgICdUZW1wbGUgSGVsbHNlYWwnOiAnMjAwRicsIC8vIFJlZC9CbHVlIHN5bWJvbCBmYWlsdXJlLCBib3NzIDJcclxuICAgICdUZW1wbGUgUHVyZSBXaWxsJzogJzIwMTcnLCAvLyBDaXJjbGUgQW9FLCBTcGlyaXQgRmxhbWUgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdUZW1wbGUgTWVnYWJsYXN0ZXInOiAnMTYzJywgLy8gQ29uYWwgQW9FLCBDb2V1cmwgUHJhbmEgdHJhc2gsIGJlZm9yZSBib3NzIDNcclxuICAgICdUZW1wbGUgV2luZGJ1cm4nOiAnMUZFOCcsIC8vIENpcmNsZSBBb0UsIFR3aXN0ZXIgd2luZCwgYm9zcyAzXHJcbiAgICAnVGVtcGxlIEh1cnJpY2FuZSBLaWNrJzogJzFGRTUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBib3NzIDNcclxuICAgICdUZW1wbGUgU2lsZW50IFJvYXInOiAnMUZFQicsIC8vIEZyb250YWwgbGluZSBBb0UsIGJvc3MgM1xyXG4gICAgJ1RlbXBsZSBNaWdodHkgQmxvdyc6ICcxRkVBJywgLy8gQ29udGFjdCB3aXRoIGNvZXVybCBoZWFkLCBib3NzIDNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1RlbXBsZSBIZWF0IExpZ2h0bmluZyc6ICcxRkQ3JywgLy8gUHVycGxlIHNwcmVhZCBjaXJjbGVzLCBib3NzIDFcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUJ1cm4sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RoZSBCdXJuIEZhbGxpbmcgUm9jayc6ICczMUEzJywgLy8gRW52aXJvbm1lbnRhbCBsaW5lIEFvRVxyXG4gICAgJ1RoZSBCdXJuIEFldGhlcmlhbCBCbGFzdCc6ICczMjhCJywgLy8gTGluZSBBb0UsIEt1a3Vsa2FuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gTW9sZS1hLXdoYWNrJzogJzMyOEQnLCAvLyBDaXJjbGUgQW9FLCBEZXNlcnQgRGVzbWFuIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gSGVhZCBCdXR0JzogJzMyOEUnLCAvLyBTbWFsbCBjb25hbCBBb0UsIERlc2VydCBEZXNtYW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBTaGFyZGZhbGwnOiAnMzE5MScsIC8vIFJvb213aWRlIEFvRSwgTG9TIGZvciBzYWZldHksIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIERpc3NvbmFuY2UnOiAnMzE5MicsIC8vIERvbnV0IEFvRSwgSGVkZXRldCwgYm9zcyAxXHJcbiAgICAnVGhlIEJ1cm4gQ3J5c3RhbGxpbmUgRnJhY3R1cmUnOiAnMzE5NycsIC8vIENpcmNsZSBBb0UsIERpbSBDcnlzdGFsLCBib3NzIDFcclxuICAgICdUaGUgQnVybiBSZXNvbmFudCBGcmVxdWVuY3knOiAnMzE5OCcsIC8vIENpcmNsZSBBb0UsIERpbSBDcnlzdGFsLCBib3NzIDFcclxuICAgICdUaGUgQnVybiBSb3Rvc3dpcGUnOiAnMzI5MScsIC8vIEZyb250YWwgY29uZSBBb0UsIENoYXJyZWQgRHJlYWRuYXVnaHQgdHJhc2hcclxuICAgICdUaGUgQnVybiBXcmVja2luZyBCYWxsJzogJzMyOTInLCAvLyBDaXJjbGUgQW9FLCBDaGFycmVkIERyZWFkbmF1Z2h0IHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2hhdHRlcic6ICczMjk0JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgQ2hhcnJlZCBEb2JseW4gdHJhc2hcclxuICAgICdUaGUgQnVybiBBdXRvLUNhbm5vbnMnOiAnMzI5NScsIC8vIExpbmUgQW9FLCBDaGFycmVkIERyb25lIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gU2VsZi1EZXRvbmF0ZSc6ICczMjk2JywgLy8gQ2lyY2xlIEFvRSwgQ2hhcnJlZCBEcm9uZSB0cmFzaFxyXG4gICAgJ1RoZSBCdXJuIEZ1bGwgVGhyb3R0bGUnOiAnMkQ3NScsIC8vIExpbmUgQW9FLCBEZWZlY3RpdmUgRHJvbmUsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIFRocm90dGxlJzogJzJENzYnLCAvLyBMaW5lIEFvRSwgTWluaW5nIERyb25lIGFkZHMsIGJvc3MgMlxyXG4gICAgJ1RoZSBCdXJuIEFkaXQgRHJpdmVyJzogJzJENzgnLCAvLyBMaW5lIEFvRSwgUm9jayBCaXRlciBhZGRzLCBib3NzIDJcclxuICAgICdUaGUgQnVybiBUcmVtYmxvcic6ICczMjk3JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgVmVpbGVkIEdpZ2F3b3JtIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gRGVzZXJ0IFNwaWNlJzogJzMyOTgnLCAvLyBUaGUgZnJvbnRhbCBjbGVhdmVzIG11c3QgZmxvd1xyXG4gICAgJ1RoZSBCdXJuIFRveGljIFNwcmF5JzogJzMyOUEnLCAvLyBGcm9udGFsIGNvbmUgQW9FLCBHaWdhd29ybSBTdGFsa2VyIHRyYXNoXHJcbiAgICAnVGhlIEJ1cm4gVmVub20gU3ByYXknOiAnMzI5QicsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0UsIEdpZ2F3b3JtIFN0YWxrZXIgdHJhc2hcclxuICAgICdUaGUgQnVybiBXaGl0ZSBEZWF0aCc6ICczMTQzJywgLy8gUmVhY3RpdmUgZHVyaW5nIGludnVsbmVyYWJpbGl0eSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZvZyBQbHVtZSAxJzogJzMxNDUnLCAvLyBTdGFyIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZvZyBQbHVtZSAyJzogJzMxNDYnLCAvLyBMaW5lIEFvRXMgYWZ0ZXIgc3RhcnMsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICAgICdUaGUgQnVybiBDYXV0ZXJpemUnOiAnMzE0OCcsIC8vIExpbmUvU3dvb3AgQW9FLCBNaXN0IERyYWdvbiwgYm9zcyAzXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVGhlIEJ1cm4gQ29sZCBGb2cnOiAnMzE0MicsIC8vIEdyb3dpbmcgY2lyY2xlIEFvRSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gTGVhZGVuJzogJzQzJywgLy8gUHVkZGxlIGVmZmVjdCwgYm9zcyAyLiAoQWxzbyBpbmZsaWN0cyAxMUYsIFNsdWRnZS4pXHJcbiAgICAnVGhlIEJ1cm4gUHVkZGxlIEZyb3N0Yml0ZSc6ICcxMUQnLCAvLyBJY2UgcHVkZGxlIGVmZmVjdCwgYm9zcyAzLiAoTk9UIHRoZSBjb25hbC1pbmZsaWN0ZWQgb25lLCAxMEMuKVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVGhlIEJ1cm4gSGFpbGZpcmUnOiAnMzE5NCcsIC8vIEhlYWQgbWFya2VyIGxpbmUgQW9FLCBIZWRldGV0LCBib3NzIDFcclxuICAgICdUaGUgQnVybiBTaGFyZHN0cmlrZSc6ICczMTk1JywgLy8gT3JhbmdlIHNwcmVhZCBoZWFkIG1hcmtlcnMsIEhlZGV0ZXQsIGJvc3MgMVxyXG4gICAgJ1RoZSBCdXJuIENoaWxsaW5nIEFzcGlyYXRpb24nOiAnMzE0RCcsIC8vIEhlYWQgbWFya2VyIGNsZWF2ZSwgTWlzdCBEcmFnb24sIGJvc3MgM1xyXG4gICAgJ1RoZSBCdXJuIEZyb3N0IEJyZWF0aCc6ICczMTRDJywgLy8gVGFuayBjbGVhdmUsIE1pc3QgRHJhZ29uLCBib3NzIDNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gTzFOIC0gRGVsdGFzY2FwZSAxLjAgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjEwLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPMU4gQnVybic6ICcyM0Q1JywgLy8gRmlyZWJhbGwgZXhwbG9zaW9uIGNpcmNsZSBBb0VzXHJcbiAgICAnTzFOIENsYW1wJzogJzIzRTInLCAvLyBGcm9udGFsIHJlY3RhbmdsZSBrbm9ja2JhY2sgQW9FLCBBbHRlIFJvaXRlXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMU4gTGV2aW5ib2x0JzogJzIzREEnLCAvLyBzbWFsbCBzcHJlYWQgY2lyY2xlc1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIE8yTiAtIERlbHRhc2NhcGUgMi4wIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdGFzY2FwZVYyMCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTzJOIE1haW4gUXVha2UnOiAnMjRBNScsIC8vIE5vbi10ZWxlZ3JhcGhlZCBjaXJjbGUgQW9FLCBGbGVzaHkgTWVtYmVyXHJcbiAgICAnTzJOIEVyb3Npb24nOiAnMjU5MCcsIC8vIFNtYWxsIGNpcmNsZSBBb0VzLCBGbGVzaHkgTWVtYmVyXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPMk4gUGFyYW5vcm1hbCBXYXZlJzogJzI1MEUnLCAvLyBJbnN0YW50IHRhbmsgY2xlYXZlXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBXZSBjb3VsZCB0cnkgdG8gc2VwYXJhdGUgb3V0IHRoZSBtaXN0YWtlIHRoYXQgbGVkIHRvIHRoZSBwbGF5ZXIgYmVpbmcgcGV0cmlmaWVkLlxyXG4gICAgICAvLyBIb3dldmVyLCBpdCdzIE5vcm1hbCBtb2RlLCB3aHkgb3ZlcnRoaW5rIGl0P1xyXG4gICAgICBpZDogJ08yTiBQZXRyaWZpY2F0aW9uJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzI2MicgfSksXHJcbiAgICAgIC8vIFRoZSB1c2VyIG1pZ2h0IGdldCBoaXQgYnkgYW5vdGhlciBwZXRyaWZ5aW5nIGFiaWxpdHkgYmVmb3JlIHRoZSBlZmZlY3QgZW5kcy5cclxuICAgICAgLy8gVGhlcmUncyBubyBwb2ludCBpbiBub3RpZnlpbmcgZm9yIHRoYXQuXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMTAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMk4gRWFydGhxdWFrZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI1MTUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIFRoaXMgZGVhbHMgZGFtYWdlIG9ubHkgdG8gbm9uLWZsb2F0aW5nIHRhcmdldHMuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBpbml0aWFsaXplZD86IGJvb2xlYW47XHJcbiAgcGhhc2VOdW1iZXI/OiBudW1iZXI7XHJcbiAgZ2FtZUNvdW50PzogbnVtYmVyO1xyXG59XHJcblxyXG4vLyBPM04gLSBEZWx0YXNjYXBlIDMuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWMzAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08zTiBTcGVsbGJsYWRlIEZpcmUgSUlJJzogJzI0NjAnLCAvLyBEb251dCBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gU3BlbGxibGFkZSBCbGl6emFyZCBJSUknOiAnMjQ2MScsIC8vIENpcmNsZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gU3BlbGxibGFkZSBUaHVuZGVyIElJSSc6ICcyNDYyJywgLy8gTGluZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gQ3Jvc3MgUmVhcGVyJzogJzI0NkInLCAvLyBDaXJjbGUgQW9FLCBTb3VsIFJlYXBlclxyXG4gICAgJ08zTiBHdXN0aW5nIEdvdWdlJzogJzI0NkMnLCAvLyBHcmVlbiBsaW5lIEFvRSwgU291bCBSZWFwZXJcclxuICAgICdPM04gU3dvcmQgRGFuY2UnOiAnMjQ3MCcsIC8vIFRhcmdldGVkIHRoaW4gY29uZSBBb0UsIEhhbGljYXJuYXNzdXNcclxuICAgICdPM04gVXBsaWZ0JzogJzI0NzMnLCAvLyBHcm91bmQgc3BlYXJzLCBRdWVlbidzIFdhbHR6IGVmZmVjdCwgSGFsaWNhcm5hc3N1c1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ08zTiBVbHRpbXVtJzogJzI0NzcnLCAvLyBJbnN0YW50IGtpbGwuIFVzZWQgaWYgdGhlIHBsYXllciBkb2VzIG5vdCBleGl0IHRoZSBzYW5kIG1hemUgZmFzdCBlbm91Z2guXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdPM04gSG9seSBCbHVyJzogJzI0NjMnLCAvLyBTcHJlYWQgY2lyY2xlcy5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzNOIFBoYXNlIFRyYWNrZXInLFxyXG4gICAgICB0eXBlOiAnU3RhcnRzVXNpbmcnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGlrYXJuYXNzb3MnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ0hhbGljYXJuYXNzZScsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICcyMzA0Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzIzMDQnLCBzb3VyY2U6ICflk4jliKnljaHnurPoi4/mlq8nLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnMjMwNCcsIHNvdXJjZTogJ+2VoOumrOy5tOultOuCmOyGjOyKpCcsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiBkYXRhLnBoYXNlTnVtYmVyID0gKGRhdGEucGhhc2VOdW1iZXIgPz8gMCkgKyAxLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gVGhlcmUncyBhIGxvdCB0byB0cmFjaywgYW5kIGluIG9yZGVyIHRvIG1ha2UgaXQgYWxsIGNsZWFuLCBpdCdzIHNhZmVzdCBqdXN0IHRvXHJcbiAgICAgIC8vIGluaXRpYWxpemUgaXQgYWxsIHVwIGZyb250IGluc3RlYWQgb2YgdHJ5aW5nIHRvIGd1YXJkIGFnYWluc3QgdW5kZWZpbmVkIGNvbXBhcmlzb25zLlxyXG4gICAgICBpZDogJ08zTiBJbml0aWFsaXppbmcnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzM2NycsIHNvdXJjZTogJ0hhbGljYXJuYXNzdXMnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICczNjcnLCBzb3VyY2U6ICdIYWxpa2FybmFzc29zJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAnSGFsaWNhcm5hc3NlJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn44OP44Oq44Kr44Or44OK44OD44K944K5JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4Q246IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn5ZOI5Yip5Y2h57qz6IuP5pavJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG5ldFJlZ2V4S286IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzY3Jywgc291cmNlOiAn7ZWg66as7Lm066W064KY7IaM7IqkJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+ICFkYXRhLmluaXRpYWxpemVkLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5nYW1lQ291bnQgPSAwO1xyXG4gICAgICAgIC8vIEluZGV4aW5nIHBoYXNlcyBhdCAxIHNvIGFzIHRvIG1ha2UgcGhhc2VzIG1hdGNoIHdoYXQgaHVtYW5zIGV4cGVjdC5cclxuICAgICAgICAvLyAxOiBXZSBzdGFydCBoZXJlLlxyXG4gICAgICAgIC8vIDI6IENhdmUgcGhhc2Ugd2l0aCBVcGxpZnRzLlxyXG4gICAgICAgIC8vIDM6IFBvc3QtaW50ZXJtaXNzaW9uLCB3aXRoIGdvb2QgYW5kIGJhZCBmcm9ncy5cclxuICAgICAgICBkYXRhLnBoYXNlTnVtYmVyID0gMTtcclxuICAgICAgICBkYXRhLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzNOIFJpYmJpdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQ2NicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBXZSBETyB3YW50IHRvIGJlIGhpdCBieSBUb2FkL1JpYmJpdCBpZiB0aGUgbmV4dCBjYXN0IG9mIFRoZSBHYW1lXHJcbiAgICAgICAgLy8gaXMgNHggdG9hZCBwYW5lbHMuXHJcbiAgICAgICAgY29uc3QgZ2FtZUNvdW50ID0gZGF0YS5nYW1lQ291bnQgPz8gMDtcclxuICAgICAgICByZXR1cm4gIShkYXRhLnBoYXNlTnVtYmVyID09PSAzICYmIGdhbWVDb3VudCAlIDIgPT09IDApICYmIG1hdGNoZXMudGFyZ2V0SWQgIT09ICdFMDAwMDAwMCc7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXJlJ3MgYSBsb3Qgd2UgY291bGQgZG8gdG8gdHJhY2sgZXhhY3RseSBob3cgdGhlIHBsYXllciBmYWlsZWQgVGhlIEdhbWUuXHJcbiAgICAgIC8vIFdoeSBvdmVydGhpbmsgTm9ybWFsIG1vZGUsIGhvd2V2ZXI/XHJcbiAgICAgIGlkOiAnTzNOIFRoZSBHYW1lJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyBHdWVzcyB3aGF0IHlvdSBqdXN0IGxvc3Q/XHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzI0NkQnIH0pLFxyXG4gICAgICAvLyBJZiB0aGUgcGxheWVyIHRha2VzIG5vIGRhbWFnZSwgdGhleSBkaWQgdGhlIG1lY2hhbmljIGNvcnJlY3RseS5cclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGF0YS5nYW1lQ291bnQgPSAoZGF0YS5nYW1lQ291bnQgPz8gMCkgKyAxLFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBPNE4gLSBEZWx0YXNjYXBlIDQuMCBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHRhc2NhcGVWNDAsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ080TiBCbGl6emFyZCBJSUknOiAnMjRCQycsIC8vIFRhcmdldGVkIGNpcmNsZSBBb0VzLCBFeGRlYXRoXHJcbiAgICAnTzROIEVtcG93ZXJlZCBUaHVuZGVyIElJSSc6ICcyNEMxJywgLy8gVW50ZWxlZ3JhcGhlZCBsYXJnZSBjaXJjbGUgQW9FLCBFeGRlYXRoXHJcbiAgICAnTzROIFpvbWJpZSBCcmVhdGgnOiAnMjRDQicsIC8vIENvbmFsLCB0cmVlIGhlYWQgYWZ0ZXIgRGVjaXNpdmUgQmF0dGxlXHJcbiAgICAnTzROIENsZWFyb3V0JzogJzI0Q0MnLCAvLyBPdmVybGFwcGluZyBjb25lIEFvRXMsIERlYXRobHkgVmluZSAodGVudGFjbGVzIGFsb25nc2lkZSB0cmVlIGhlYWQpXHJcbiAgICAnTzROIEJsYWNrIFNwYXJrJzogJzI0QzknLCAvLyBFeHBsb2RpbmcgQmxhY2sgSG9sZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBFbXBvd2VyZWQgRmlyZSBJSUkgaW5mbGljdHMgdGhlIFB5cmV0aWMgZGVidWZmLCB3aGljaCBkZWFscyBkYW1hZ2UgaWYgdGhlIHBsYXllclxyXG4gICAgLy8gbW92ZXMgb3IgYWN0cyBiZWZvcmUgdGhlIGRlYnVmZiBmYWxscy4gVW5mb3J0dW5hdGVseSBpdCBkb2Vzbid0IGxvb2sgbGlrZSB0aGVyZSdzXHJcbiAgICAvLyBjdXJyZW50bHkgYSBsb2cgbGluZSBmb3IgdGhpcywgc28gdGhlIG9ubHkgd2F5IHRvIGNoZWNrIGZvciB0aGlzIGlzIHRvIGNvbGxlY3RcclxuICAgIC8vIHRoZSBkZWJ1ZmZzIGFuZCB0aGVuIHdhcm4gaWYgYSBwbGF5ZXIgdGFrZXMgYW4gYWN0aW9uIGR1cmluZyB0aGF0IHRpbWUuIE5vdCB3b3J0aCBpdFxyXG4gICAgLy8gZm9yIE5vcm1hbC5cclxuICAgICdPNE4gU3RhbmRhcmQgRmlyZSc6ICcyNEJBJyxcclxuICAgICdPNE4gQnVzdGVyIFRodW5kZXInOiAnMjRCRScsIC8vIEEgY2xlYXZpbmcgdGFuayBidXN0ZXJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEtpbGxzIHRhcmdldCBpZiBub3QgY2xlYW5zZWRcclxuICAgICAgaWQ6ICdPNE4gRG9vbScsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0NsZWFuc2VycyBtaXNzZWQgRG9vbSEnLFxyXG4gICAgICAgICAgICBkZTogJ0Rvb20tUmVpbmlndW5nIHZlcmdlc3NlbiEnLFxyXG4gICAgICAgICAgICBmcjogJ05cXCdhIHBhcyDDqXTDqSBkaXNzaXDDqShlKSBkdSBHbGFzICEnLFxyXG4gICAgICAgICAgICBqYTogJ+atu+OBruWuo+WRiicsXHJcbiAgICAgICAgICAgIGNuOiAn5rKh6Kej5q275a6jJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFNob3J0IGtub2NrYmFjayBmcm9tIEV4ZGVhdGhcclxuICAgICAgaWQ6ICdPNE4gVmFjdXVtIFdhdmUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNEI4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VzY2h1YnN0IScsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBwb3Vzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+iQveOBoeOBnycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFJvb20td2lkZSBBb0UsIGZyZWV6ZXMgbm9uLW1vdmluZyB0YXJnZXRzXHJcbiAgICAgIGlkOiAnTzROIEVtcG93ZXJlZCBCbGl6emFyZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0RTYnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBOZXRNYXRjaGVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvbmV0X21hdGNoZXMnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGlzRGVjaXNpdmVCYXR0bGVFbGVtZW50PzogYm9vbGVhbjtcclxuICBpc05lb0V4ZGVhdGg/OiBib29sZWFuO1xyXG4gIGhhc0JleW9uZERlYXRoPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG4gIGRvdWJsZUF0dGFja01hdGNoZXM/OiBOZXRNYXRjaGVzWydBYmlsaXR5J11bXTtcclxufVxyXG5cclxuLy8gTzRTIC0gRGVsdGFzY2FwZSA0LjAgU2F2YWdlXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5EZWx0YXNjYXBlVjQwU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdPNFMyIE5lbyBWYWN1dW0gV2F2ZSc6ICcyNDFEJyxcclxuICAgICdPNFMyIEFjY2VsZXJhdGlvbiBCb21iJzogJzI0MzEnLFxyXG4gICAgJ080UzIgRW1wdGluZXNzJzogJzI0MjInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ080UzIgRG91YmxlIExhc2VyJzogJzI0MTUnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIERlY2lzaXZlIEJhdHRsZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQwOCcsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc0RlY2lzaXZlQmF0dGxlRWxlbWVudCA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzEgVmFjdXVtIFdhdmUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzIzRkUnLCBjYXB0dXJlOiBmYWxzZSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQgPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBBbG1hZ2VzdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMjQxNycsIGNhcHR1cmU6IGZhbHNlIH0pLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5pc05lb0V4ZGVhdGggPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJsaXp6YXJkIElJSScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzIzRjgnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIC8vIElnbm9yZSB1bmF2b2lkYWJsZSByYWlkIGFvZSBCbGl6emFyZCBJSUkuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+ICFkYXRhLmlzRGVjaXNpdmVCYXR0bGVFbGVtZW50LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgVGh1bmRlciBJSUknLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyM0ZEJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBPbmx5IGNvbnNpZGVyIHRoaXMgZHVyaW5nIHJhbmRvbSBtZWNoYW5pYyBhZnRlciBkZWNpc2l2ZSBiYXR0bGUuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEpID0+IGRhdGEuaXNEZWNpc2l2ZUJhdHRsZUVsZW1lbnQsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBQZXRyaWZpZWQnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMjYyJyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBPbiBOZW8sIGJlaW5nIHBldHJpZmllZCBpcyBiZWNhdXNlIHlvdSBsb29rZWQgYXQgU2hyaWVrLCBzbyB5b3VyIGZhdWx0LlxyXG4gICAgICAgIGlmIChkYXRhLmlzTmVvRXhkZWF0aClcclxuICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICAgIC8vIE9uIG5vcm1hbCBFeERlYXRoLCB0aGlzIGlzIGR1ZSB0byBXaGl0ZSBIb2xlLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ080UzIgRm9ya2VkIExpZ2h0bmluZycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI0MkUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBCZXlvbmQgRGVhdGggR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aCA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJleW9uZCBEZWF0aCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIEJleW9uZCBEZWF0aCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc1NjYnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNCZXlvbmREZWF0aFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDogbWF0Y2hlcy5lZmZlY3QsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzRTMiBEb3VibGUgQXR0YWNrIENvbGxlY3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDFDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzID0gZGF0YS5kb3VibGVBdHRhY2tNYXRjaGVzIHx8IFtdO1xyXG4gICAgICAgIGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcy5wdXNoKG1hdGNoZXMpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPNFMyIERvdWJsZSBBdHRhY2snLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNDFDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGFyciA9IGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcztcclxuICAgICAgICBpZiAoIWFycilcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoYXJyLmxlbmd0aCA8PSAyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vIEhhcmQgdG8ga25vdyB3aG8gc2hvdWxkIGJlIGluIHRoaXMgYW5kIHdobyBzaG91bGRuJ3QsIGJ1dFxyXG4gICAgICAgIC8vIGl0IHNob3VsZCBuZXZlciBoaXQgMyBwZW9wbGUuXHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCB0ZXh0OiBgJHthcnJbMF0/LmFiaWxpdHkgPz8gJyd9IHggJHthcnIubGVuZ3RofWAgfTtcclxuICAgICAgfSxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4gZGVsZXRlIGRhdGEuZG91YmxlQXR0YWNrTWF0Y2hlcyxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogbWlzc2luZyBtYW55IGFiaWxpdGllcyBoZXJlXHJcblxyXG4vLyBPN1MgLSBTaWdtYXNjYXBlIDMuMCBTYXZhZ2VcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlNpZ21hc2NhcGVWMzBTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ083UyBTZWFyaW5nIFdpbmQnOiAnMjc3NycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnTzdTIE1pc3NpbGUnOiAnMjc4MicsXHJcbiAgICAnTzdTIENoYWluIENhbm5vbic6ICcyNzhGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzdTIFN0b25lc2tpbicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMkFCNScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMuc291cmNlLCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIHZ1bG4/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbi8vIFRPRE86IGNvdWxkIGFkZCBQYXRjaCB3YXJuaW5ncyBmb3IgZG91YmxlL3VuYnJva2VuIHRldGhlcnNcclxuLy8gVE9ETzogSGVsbG8gV29ybGQgY291bGQgaGF2ZSBhbnkgd2FybmluZ3MgKHNvcnJ5KVxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFscGhhc2NhcGVWNDBTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ08xMlMxIFN1cGVybGltaW5hbCBNb3Rpb24gMSc6ICczMzM0JywgLy8gMzAwKyBkZWdyZWUgY2xlYXZlIHdpdGggYmFjayBzYWZlIGFyZWFcclxuICAgICdPMTJTMSBFZmZpY2llbnQgQmxhZGV3b3JrIDEnOiAnMzMyOScsIC8vIE9tZWdhLU0gXCJnZXQgb3V0XCIgY2VudGVyZWQgYW9lIGFmdGVyIHNwbGl0XHJcbiAgICAnTzEyUzEgRWZmaWNpZW50IEJsYWRld29yayAyJzogJzMzMkEnLCAvLyBPbWVnYS1NIFwiZ2V0IG91dFwiIGNlbnRlcmVkIGFvZSBkdXJpbmcgYmxhZGVzXHJcbiAgICAnTzEyUzEgQmV5b25kIFN0cmVuZ3RoJzogJzMzMjgnLCAvLyBPbWVnYS1NIFwiZ2V0IGluXCIgY2VudGVyZWQgYW9lIGR1cmluZyBzaGllbGRcclxuICAgICdPMTJTMSBTdXBlcmxpbWluYWwgU3RlZWwgMSc6ICczMzMwJywgLy8gT21lZ2EtRiBcImdldCBmcm9udC9iYWNrXCIgYmxhZGVzIHBoYXNlXHJcbiAgICAnTzEyUzEgU3VwZXJsaW1pbmFsIFN0ZWVsIDInOiAnMzMzMScsIC8vIE9tZWdhLUYgXCJnZXQgZnJvbnQvYmFja1wiIGJsYWRlcyBwaGFzZVxyXG4gICAgJ08xMlMxIE9wdGltaXplZCBCbGl6emFyZCBJSUknOiAnMzMzMicsIC8vIE9tZWdhLUYgZ2lhbnQgY3Jvc3NcclxuICAgICdPMTJTMiBEaWZmdXNlIFdhdmUgQ2Fubm9uJzogJzMzNjknLCAvLyBiYWNrL3NpZGVzIGxhc2Vyc1xyXG4gICAgJ08xMlMyIFJpZ2h0IEFybSBVbml0IEh5cGVyIFB1bHNlIDEnOiAnMzM1QScsIC8vIFJvdGF0aW5nIEFyY2hpdmUgUGVyaXBoZXJhbCBsYXNlcnNcclxuICAgICdPMTJTMiBSaWdodCBBcm0gVW5pdCBIeXBlciBQdWxzZSAyJzogJzMzNUInLCAvLyBSb3RhdGluZyBBcmNoaXZlIFBlcmlwaGVyYWwgbGFzZXJzXHJcbiAgICAnTzEyUzIgUmlnaHQgQXJtIFVuaXQgQ29sb3NzYWwgQmxvdyc6ICczMzVGJywgLy8gRXhwbG9kaW5nIEFyY2hpdmUgQWxsIGhhbmRzXHJcbiAgICAnTzEyUzIgTGVmdCBBcm0gVW5pdCBDb2xvc3NhbCBCbG93JzogJzMzNjAnLCAvLyBFeHBsb2RpbmcgQXJjaGl2ZSBBbGwgaGFuZHNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdPMTJTMSBPcHRpY2FsIExhc2VyJzogJzMzNDcnLCAvLyBtaWRkbGUgbGFzZXIgZnJvbSBleWVcclxuICAgICdPMTJTMSBBZHZhbmNlZCBPcHRpY2FsIExhc2VyJzogJzMzNEEnLCAvLyBnaWFudCBjaXJjbGUgY2VudGVyZWQgb24gZXllXHJcbiAgICAnTzEyUzIgUmVhciBQb3dlciBVbml0IFJlYXIgTGFzZXJzIDEnOiAnMzM2MScsIC8vIEFyY2hpdmUgQWxsIGluaXRpYWwgbGFzZXJcclxuICAgICdPMTJTMiBSZWFyIFBvd2VyIFVuaXQgUmVhciBMYXNlcnMgMic6ICczMzYyJywgLy8gQXJjaGl2ZSBBbGwgcm90YXRpbmcgbGFzZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ08xMlMxIE9wdGltaXplZCBGaXJlIElJSSc6ICczMzM3JywgLy8gZmlyZSBzcHJlYWRcclxuICAgICdPMTJTMiBIeXBlciBQdWxzZSBUZXRoZXInOiAnMzM1QycsIC8vIEluZGV4IEFuZCBBcmNoaXZlIFBlcmlwaGVyYWwgdGV0aGVyc1xyXG4gICAgJ08xMlMyIFdhdmUgQ2Fubm9uJzogJzMzNkInLCAvLyBJbmRleCBBbmQgQXJjaGl2ZSBQZXJpcGhlcmFsIGJhaXRlZCBsYXNlcnNcclxuICAgICdPMTJTMiBPcHRpbWl6ZWQgRmlyZSBJSUknOiAnMzM3OScsIC8vIEFyY2hpdmUgQWxsIHNwcmVhZFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnTzEyUzEgT3B0aW1pemVkIFNhZ2l0dGFyaXVzIEFycm93JzogJzMzNEQnLCAvLyBPbWVnYS1NIGJhcmQgbGltaXQgYnJlYWtcclxuICAgICdPMTJTMiBPdmVyc2FtcGxlZCBXYXZlIENhbm5vbic6ICczMzY2JywgLy8gTW9uaXRvciB0YW5rIGJ1c3RlcnNcclxuICAgICdPMTJTMiBTYXZhZ2UgV2F2ZSBDYW5ub24nOiAnMzM2RCcsIC8vIFRhbmsgYnVzdGVyIHdpdGggdGhlIHZ1bG4gZmlyc3RcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgRGlzY2hhcmdlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiAnMzMyNycgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnTzEyUzEgTWFnaWMgVnVsbmVyYWJpbGl0eSBVcCBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzQ3MicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLnZ1bG4gPz89IHt9O1xyXG4gICAgICAgIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdPMTJTMSBNYWdpYyBWdWxuZXJhYmlsaXR5IFVwIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNDcyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEudnVsbiA9IGRhdGEudnVsbiB8fCB7fTtcclxuICAgICAgICBkYXRhLnZ1bG5bbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ08xMlMxIE1hZ2ljIFZ1bG5lcmFiaWxpdHkgRGFtYWdlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyAzMzJFID0gUGlsZSBQaXRjaCBzdGFja1xyXG4gICAgICAvLyAzMzNFID0gRWxlY3RyaWMgU2xpZGUgKE9tZWdhLU0gc3F1YXJlIDEtNCBkYXNoZXMpXHJcbiAgICAgIC8vIDMzM0YgPSBFbGVjdHJpYyBTbGlkZSAoT21lZ2EtRiB0cmlhbmdsZSAxLTQgZGFzaGVzKVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzMzMkUnLCAnMzMzRScsICczMzNGJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS52dWxuICYmIGRhdGEudnVsblttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBibGFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh3aXRoIHZ1bG4pYCxcclxuICAgICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKG1pdCBWZXJ3dW5kYmFya2VpdClgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6KKr44OA44Oh44O844K45LiK5piHKWAsXHJcbiAgICAgICAgICAgIGNuOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjluKbmmJPkvKQpYCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gQnlha2tvIEV4dHJlbWVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUphZGVTdG9hRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBQb3BwaW5nIFVucmVsZW50aW5nIEFuZ3Vpc2ggYnViYmxlc1xyXG4gICAgJ0J5YUV4IEFyYXRhbWEnOiAnMjdGNicsXHJcbiAgICAvLyBTdGVwcGluZyBpbiBncm93aW5nIG9yYlxyXG4gICAgJ0J5YUV4IFZhY3V1bSBDbGF3JzogJzI3RTknLFxyXG4gICAgLy8gTGlnaHRuaW5nIFB1ZGRsZXNcclxuICAgICdCeWFFeCBIdW5kZXJmb2xkIEhhdm9jIDEnOiAnMjdFNScsXHJcbiAgICAnQnlhRXggSHVuZGVyZm9sZCBIYXZvYyAyJzogJzI3RTYnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0J5YUV4IFN3ZWVwIFRoZSBMZWcnOiAnMjdEQicsXHJcbiAgICAnQnlhRXggRmlyZSBhbmQgTGlnaHRuaW5nJzogJzI3REUnLFxyXG4gICAgJ0J5YUV4IERpc3RhbnQgQ2xhcCc6ICcyN0REJyxcclxuICAgIC8vIE1pZHBoYXNlIGxpbmUgYXR0YWNrXHJcbiAgICAnQnlhRXggSW1wZXJpYWwgR3VhcmQnOiAnMjdGMScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBQaW5rIGJ1YmJsZSBjb2xsaXNpb25cclxuICAgICAgaWQ6ICdCeWFFeCBPbWlub3VzIFdpbmQnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyN0VDJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2J1YmJsZSBjb2xsaXNpb24nLFxyXG4gICAgICAgICAgICBkZTogJ0JsYXNlbiBzaW5kIHp1c2FtbWVuZ2VzdG/Dn2VuJyxcclxuICAgICAgICAgICAgZnI6ICdjb2xsaXNpb24gZGUgYnVsbGVzJyxcclxuICAgICAgICAgICAgamE6ICfooZ3nqoEnLFxyXG4gICAgICAgICAgICBjbjogJ+ebuOaSnicsXHJcbiAgICAgICAgICAgIGtvOiAn7J6l7YyQIOqyueyzkOyEnCDthLDsp5AnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTaGlucnl1IE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUm95YWxNZW5hZ2VyaWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1NoaW5yeXUgQWtoIFJoYWknOiAnMUZBNicsIC8vIFNreSBsYXNlcnMgYWxvbmdzaWRlIEFraCBNb3JuLlxyXG4gICAgJ1NoaW5yeXUgQmxhemluZyBUcmFpbCc6ICcyMjFBJywgLy8gUmVjdGFuZ2xlIEFvRXMsIGludGVybWlzc2lvbiBhZGRzLlxyXG4gICAgJ1NoaW5yeXUgQ29sbGFwc2UnOiAnMjIxOCcsIC8vIENpcmNsZSBBb0VzLCBpbnRlcm1pc3Npb24gYWRkc1xyXG4gICAgJ1NoaW5yeXUgRHJhZ29uZmlzdCc6ICcyNEYwJywgLy8gR2lhbnQgcHVuY2h5IGNpcmNsZSBpbiB0aGUgY2VudGVyLlxyXG4gICAgJ1NoaW5yeXUgRWFydGggQnJlYXRoJzogJzFGOUQnLCAvLyBDb25hbCBhdHRhY2tzIHRoYXQgYXJlbid0IGFjdHVhbGx5IEVhcnRoIFNoYWtlcnMuXHJcbiAgICAnU2hpbnJ5dSBHeXJlIENoYXJnZSc6ICcxRkE4JywgLy8gR3JlZW4gZGl2ZSBib21iIGF0dGFjay5cclxuICAgICdTaGlucnl1IFNwaWtlc2ljbGUnOiAnMUZBYCcsIC8vIEJsdWUtZ3JlZW4gbGluZSBhdHRhY2tzIGZyb20gYmVoaW5kLlxyXG4gICAgJ1NoaW5yeXUgVGFpbCBTbGFwJzogJzFGOTMnLCAvLyBSZWQgc3F1YXJlcyBpbmRpY2F0aW5nIHRoZSB0YWlsJ3MgbGFuZGluZyBzcG90cy5cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1NoaW5yeXUgTGV2aW5ib2x0JzogJzFGOUMnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gSWN5IGZsb29yIGF0dGFjay5cclxuICAgICAgaWQ6ICdTaGlucnl1IERpYW1vbmQgRHVzdCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFRoaW4gSWNlXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICczOEYnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1NsaWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlcnV0c2NodCEnLFxyXG4gICAgICAgICAgICBmcjogJ0EgZ2xpc3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfmu5HjgaPjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+a7keiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1NoaW5yeXUgVGlkYWwgV2F2ZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzFGOEInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIG9mZiEnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlciBnZXNjaHVic3QhJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIHBvdXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn6JC944Gh44GfJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gS25vY2tiYWNrIGZyb20gY2VudGVyLlxyXG4gICAgICBpZDogJ1NoaW5yeXUgQWVyaWFsIEJsYXN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMUY5MCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3NlciAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTdXNhbm8gRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlUG9vbE9mVHJpYnV0ZUV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1N1c0V4IENodXJuaW5nJzogJzIwM0YnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1N1c0V4IFJhc2VuIEthaWt5byc6ICcyMDJFJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBTdXpha3UgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5IZWxsc0tpZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FzaGVzIFRvIEFzaGVzJzogJzMyMUYnLCAvLyBTY2FybGV0IExhZHkgYWRkLCByYWlkd2lkZSBleHBsb3Npb24gaWYgbm90IGtpbGxlZCBpbiB0aW1lXHJcbiAgICAnRmxlZXRpbmcgU3VtbWVyJzogJzMyMjMnLCAvLyBDb25lIEFvRSAocmFuZG9tbHkgdGFyZ2V0ZWQpXHJcbiAgICAnV2luZyBBbmQgQSBQcmF5ZXInOiAnMzIyNScsIC8vIENpcmNsZSBBb0VzIGZyb20gdW5raWxsZWQgcGx1bWVzXHJcbiAgICAnUGhhbnRvbSBIYWxmJzogJzMyMzMnLCAvLyBHaWFudCBoYWxmLWFyZW5hIEFvRSBmb2xsb3ctdXAgYWZ0ZXIgdGFuayBidXN0ZXJcclxuICAgICdXZWxsIE9mIEZsYW1lJzogJzMyMzYnLCAvLyBMYXJnZSByZWN0YW5nbGUgQW9FIChyYW5kb21seSB0YXJnZXRlZClcclxuICAgICdIb3RzcG90JzogJzMyMzgnLCAvLyBQbGF0Zm9ybSBmaXJlIHdoZW4gdGhlIHJ1bmVzIGFyZSBhY3RpdmF0ZWRcclxuICAgICdTd29vcCc6ICczMjNCJywgLy8gU3RhciBjcm9zcyBsaW5lIEFvRXNcclxuICAgICdCdXJuJzogJzMyM0QnLCAvLyBUb3dlciBtZWNoYW5pYyBmYWlsdXJlIG9uIEluY2FuZGVzY2VudCBJbnRlcmx1ZGUgKHBhcnR5IGZhaWx1cmUsIG5vdCBwZXJzb25hbClcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1Jla2luZGxlJzogJzMyMzUnLCAvLyBQdXJwbGUgc3ByZWFkIGNpcmNsZXNcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnU3V6YWt1IE5vcm1hbCBSdXRobGVzcyBSZWZyYWluJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMzIzMCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdQdXNoZWQgb2ZmIScsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyIGdlc2NodWJzdCEnLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgcG91c3PDqShlKSAhJyxcclxuICAgICAgICAgICAgamE6ICfokL3jgaHjgZ8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFVsdGltYSBXZWFwb24gVWx0aW1hdGVcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVdlYXBvbnNSZWZyYWluVWx0aW1hdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1VXVSBTZWFyaW5nIFdpbmQnOiAnMkI1QycsXHJcbiAgICAnVVdVIEVydXB0aW9uJzogJzJCNUEnLFxyXG4gICAgJ1VXVSBXZWlnaHQnOiAnMkI2NScsXHJcbiAgICAnVVdVIExhbmRzbGlkZTEnOiAnMkI3MCcsXHJcbiAgICAnVVdVIExhbmRzbGlkZTInOiAnMkI3MScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVVdVIEdyZWF0IFdoaXJsd2luZCc6ICcyQjQxJyxcclxuICAgICdVV1UgU2xpcHN0cmVhbSc6ICcyQjUzJyxcclxuICAgICdVV1UgV2lja2VkIFdoZWVsJzogJzJCNEUnLFxyXG4gICAgJ1VXVSBXaWNrZWQgVG9ybmFkbyc6ICcyQjRGJyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVVdVIFdpbmRidXJuJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0VCJyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAyLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEZlYXRoZXJsYW5jZSBleHBsb3Npb24uICBJdCBzZWVtcyBsaWtlIHRoZSBwZXJzb24gd2hvIHBvcHMgaXQgaXMgdGhlXHJcbiAgICAgIC8vIGZpcnN0IHBlcnNvbiBsaXN0ZWQgZGFtYWdlLXdpc2UsIHNvIHRoZXkgYXJlIGxpa2VseSB0aGUgY3VscHJpdC5cclxuICAgICAgaWQ6ICdVV1UgRmVhdGhlcmxhbmNlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMkI0MycsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5zb3VyY2UgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcywga0ZsYWdJbnN0YW50RGVhdGggfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNEb29tPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG4vLyBVQ1UgLSBUaGUgVW5lbmRpbmcgQ29pbCBPZiBCYWhhbXV0IChVbHRpbWF0ZSlcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVVuZW5kaW5nQ29pbE9mQmFoYW11dFVsdGltYXRlLFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdVQ1UgTHVuYXIgRHluYW1vJzogJzI2QkMnLFxyXG4gICAgJ1VDVSBJcm9uIENoYXJpb3QnOiAnMjZCQicsXHJcbiAgICAnVUNVIEV4YWZsYXJlJzogJzI2RUYnLFxyXG4gICAgJ1VDVSBXaW5ncyBPZiBTYWx2YXRpb24nOiAnMjZDQScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBUd2lzdGVyIERlYXRoJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyBJbnN0YW50IGRlYXRoIGhhcyBhIHNwZWNpYWwgZmxhZyB2YWx1ZSwgZGlmZmVyZW50aWF0aW5nXHJcbiAgICAgIC8vIGZyb20gdGhlIGV4cGxvc2lvbiBkYW1hZ2UgeW91IHRha2Ugd2hlbiBzb21lYm9keSBlbHNlXHJcbiAgICAgIC8vIHBvcHMgb25lLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnMjZBQicsIC4uLnBsYXllckRhbWFnZUZpZWxkcywgZmxhZ3M6IGtGbGFnSW5zdGFudERlYXRoIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1R3aXN0ZXIgUG9wJyxcclxuICAgICAgICAgICAgZGU6ICdXaXJiZWxzdHVybSBiZXLDvGhydCcsXHJcbiAgICAgICAgICAgIGZyOiAnQXBwYXJpdGlvbiBkZXMgdG9ybmFkZXMnLFxyXG4gICAgICAgICAgICBqYTogJ+ODhOOCpOOCueOCv+ODvCcsXHJcbiAgICAgICAgICAgIGNuOiAn5peL6aOOJyxcclxuICAgICAgICAgICAga286ICftmozsmKTrpqwg67Cf7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIFRoZXJtaW9uaWMgQnVyc3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICcyNkI5JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1BpenphIFNsaWNlJyxcclxuICAgICAgICAgICAgZGU6ICdQaXp6YXN0w7xjaycsXHJcbiAgICAgICAgICAgIGZyOiAnUGFydHMgZGUgcGl6emEnLFxyXG4gICAgICAgICAgICBqYTogJ+OCteODvOODn+OCquODi+ODg+OCr+ODkOODvOOCueODiCcsXHJcbiAgICAgICAgICAgIGNuOiAn5aSp5bSp5Zyw6KOCJyxcclxuICAgICAgICAgICAga286ICfsnqXtjJDsl5Ag66ee7J2MJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVUNVIENoYWluIExpZ2h0bmluZycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzI2QzgnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIC8vIEl0J3MgaGFyZCB0byBhc3NpZ24gYmxhbWUgZm9yIGxpZ2h0bmluZy4gIFRoZSBkZWJ1ZmZzXHJcbiAgICAgICAgLy8gZ28gb3V0IGFuZCB0aGVuIGV4cGxvZGUgaW4gb3JkZXIsIGJ1dCB0aGUgYXR0YWNrZXIgaXNcclxuICAgICAgICAvLyB0aGUgZHJhZ29uIGFuZCBub3QgdGhlIHBsYXllci5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ3dhcm4nLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnaGl0IGJ5IGxpZ2h0bmluZycsXHJcbiAgICAgICAgICAgIGRlOiAndm9tIEJsaXR6IGdldHJvZmZlbicsXHJcbiAgICAgICAgICAgIGZyOiAnZnJhcHDDqShlKSBwYXIgbGEgZm91ZHJlJyxcclxuICAgICAgICAgICAgamE6ICfjg4HjgqfjgqTjg7Pjg6njgqTjg4jjg4vjg7PjgrAnLFxyXG4gICAgICAgICAgICBjbjogJ+mbt+WFiemTvicsXHJcbiAgICAgICAgICAgIGtvOiAn67KI6rCcIOunnuydjCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBCdXJucycsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICdGQScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgU2x1ZGdlJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzExRicgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdVQ1UgRG9vbSBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1VDVSBEb29tIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnRDInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGVyZSBpcyBubyBjYWxsb3V0IGZvciBcInlvdSBmb3Jnb3QgdG8gY2xlYXIgZG9vbVwiLiAgVGhlIGxvZ3MgbG9va1xyXG4gICAgICAvLyBzb21ldGhpbmcgbGlrZSB0aGlzOlxyXG4gICAgICAvLyAgIFsyMDowMjozMC41NjRdIDFBOk9rb25vbWkgWWFraSBnYWlucyB0aGUgZWZmZWN0IG9mIERvb20gZnJvbSAgZm9yIDYuMDAgU2Vjb25kcy5cclxuICAgICAgLy8gICBbMjA6MDI6MzYuNDQzXSAxRTpPa29ub21pIFlha2kgbG9zZXMgdGhlIGVmZmVjdCBvZiBQcm90ZWN0IGZyb20gVGFrbyBZYWtpLlxyXG4gICAgICAvLyAgIFsyMDowMjozNi40NDNdIDFFOk9rb25vbWkgWWFraSBsb3NlcyB0aGUgZWZmZWN0IG9mIERvb20gZnJvbSAuXHJcbiAgICAgIC8vICAgWzIwOjAyOjM4LjUyNV0gMTk6T2tvbm9taSBZYWtpIHdhcyBkZWZlYXRlZCBieSBGaXJlaG9ybi5cclxuICAgICAgLy8gSW4gb3RoZXIgd29yZHMsIGRvb20gZWZmZWN0IGlzIHJlbW92ZWQgKy8tIG5ldHdvcmsgbGF0ZW5jeSwgYnV0IGNhbid0XHJcbiAgICAgIC8vIHRlbGwgdW50aWwgbGF0ZXIgdGhhdCBpdCB3YXMgYSBkZWF0aC4gIEFyZ3VhYmx5LCB0aGlzIGNvdWxkIGhhdmUgYmVlbiBhXHJcbiAgICAgIC8vIGNsb3NlLWJ1dC1zdWNjZXNzZnVsIGNsZWFyaW5nIG9mIGRvb20gYXMgd2VsbC4gIEl0IGxvb2tzIHRoZSBzYW1lLlxyXG4gICAgICAvLyBTdHJhdGVneTogaWYgeW91IGhhdmVuJ3QgY2xlYXJlZCBkb29tIHdpdGggMSBzZWNvbmQgdG8gZ28gdGhlbiB5b3UgcHJvYmFibHlcclxuICAgICAgLy8gZGllZCB0byBkb29tLiAgWW91IGNhbiBnZXQgbm9uLWZhdGFsbHkgaWNlYmFsbGVkIG9yIGF1dG8nZCBpbiBiZXR3ZWVuLFxyXG4gICAgICAvLyBidXQgd2hhdCBjYW4geW91IGRvLlxyXG4gICAgICBpZDogJ1VDVSBEb29tIERlYXRoJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJ0QyJyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAxLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzRG9vbSB8fCAhZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBsZXQgdGV4dDtcclxuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbik7XHJcbiAgICAgICAgaWYgKGR1cmF0aW9uIDwgOSlcclxuICAgICAgICAgIHRleHQgPSBtYXRjaGVzLmVmZmVjdCArICcgIzEnO1xyXG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uIDwgMTQpXHJcbiAgICAgICAgICB0ZXh0ID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMyJztcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICB0ZXh0ID0gbWF0Y2hlcy5lZmZlY3QgKyAnICMzJztcclxuICAgICAgICByZXR1cm4geyBuYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogdGV4dCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVGhlIENvcGllZCBGYWN0b3J5XHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDb3BpZWRGYWN0b3J5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iJzogJzQ4QjQnLFxyXG4gICAgLy8gTWFrZSBzdXJlIGVuZW1pZXMgYXJlIGlnbm9yZWQgb24gdGhlc2VcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBCb21iYXJkbWVudCc6ICc0OEI4JyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBBc3NhdWx0JzogJzQ4QjYnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzQ4QzUnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gU3BpbiAxJzogJzQ4Q0InLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgU2lkZXN0cmlraW5nIFNwaW4gMic6ICc0OENDJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIENlbnRyaWZ1Z2FsIFNwaW4nOiAnNDhDOScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBBaXItVG8tU3VyZmFjZSBFbmVyZ3knOiAnNDhCQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBIaWdoLUNhbGliZXIgTGFzZXInOiAnNDhGQScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyAxJzogJzQ4QkMnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgMic6ICc0OEJEJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDMnOiAnNDhCRScsXHJcbiAgICAnQ29waWVkIFNlcmlhbCBFbmVyZ3kgUmluZyA0JzogJzQ4QzAnLFxyXG4gICAgJ0NvcGllZCBTZXJpYWwgRW5lcmd5IFJpbmcgNSc6ICc0OEMxJyxcclxuICAgICdDb3BpZWQgU2VyaWFsIEVuZXJneSBSaW5nIDYnOiAnNDhDMicsXHJcblxyXG4gICAgJ0NvcGllZCBUcmFzaCBFbmVyZ3kgQm9tYic6ICc0OTFEJyxcclxuICAgICdDb3BpZWQgVHJhc2ggRnJvbnRhbCBTb21lcnNhdWx0JzogJzQ5MUInLFxyXG4gICAgJ0NvcGllZCBUcmFzaCBIaWdoLUZyZXF1ZW5jeSBMYXNlcic6ICc0OTFFJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ja2luZyBEaXNjaGFyZ2UnOiAnNDgwQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCAxJzogJzQ5QzUnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgMic6ICc0OUM2JyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDMnOiAnNDlDNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBWYXJpYWJsZSBDb21iYXQgVGVzdCA0JzogJzQ4MEYnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgVmFyaWFibGUgQ29tYmF0IFRlc3QgNSc6ICc0ODEwJyxcclxuICAgICdDb3BpZWQgSG9iYmVzIFZhcmlhYmxlIENvbWJhdCBUZXN0IDYnOiAnNDgxMScsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAxJzogJzQ4MDInLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAyJzogJzQ4MDMnLFxyXG4gICAgJ0NvcGllZCBIb2JiZXMgUmluZyBMYXNlciAzJzogJzQ4MDQnLFxyXG5cclxuICAgICdDb3BpZWQgSG9iYmVzIFRvd2VyZmFsbCc6ICc0ODEzJyxcclxuXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDEnOiAnNDgxNicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDInOiAnNDgxNycsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBGaXJlLVJlaXN0YW5jZSBUZXN0IDMnOiAnNDgxOCcsXHJcblxyXG4gICAgJ0NvcGllZCBIb2JiZXMgT2lsIFdlbGwnOiAnNDgxQicsXHJcbiAgICAnQ29waWVkIEhvYmJlcyBFbGVjdHJvbWFnbmV0aWMgUHVsc2UnOiAnNDgxOScsXHJcbiAgICAvLyBUT0RPOiB3aGF0J3MgdGhlIGVsZWN0cmlmaWVkIGZsb29yIHdpdGggY29udmV5b3IgYmVsdHM/XHJcblxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDEnOiAnNDkzNycsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgMic6ICc0OTM4JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBFbmVyZ3kgUmluZyAzJzogJzQ5MzknLFxyXG4gICAgJ0NvcGllZCBHb2xpYXRoIEVuZXJneSBSaW5nIDQnOiAnNDkzQScsXHJcbiAgICAnQ29waWVkIEdvbGlhdGggRW5lcmd5IFJpbmcgNSc6ICc0OTM3JyxcclxuICAgICdDb3BpZWQgR29saWF0aCBMYXNlciBUdXJyZXQnOiAnNDhFNicsXHJcblxyXG4gICAgJ0NvcGllZCBGbGlnaHQgVW5pdCBBcmVhIEJvbWJpbmcnOiAnNDk0MycsXHJcbiAgICAnQ29waWVkIEZsaWdodCBVbml0IExpZ2h0ZmFzdCBCbGFkZSc6ICc0OTQwJyxcclxuXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDEnOiAnNDcyOScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDInOiAnNDcyOCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDMnOiAnNDcyRicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDQnOiAnNDczMScsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDUnOiAnNDcyQicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDYnOiAnNDcyRCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBNYXJ4IFNtYXNoIDcnOiAnNDczMicsXHJcblxyXG4gICAgJ0NvcGllZCBFbmdlbHMgSW5jZW5kaWFyeSBCb21iaW5nJzogJzQ3MzknLFxyXG4gICAgJ0NvcGllZCBFbmdlbHMgR3VpZGVkIE1pc3NpbGUnOiAnNDczNicsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBTdXJmYWNlIE1pc3NpbGUnOiAnNDczNCcsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBMYXNlciBTaWdodCc6ICc0NzNCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIEZyYWNrJzogJzQ3NEQnLFxyXG5cclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggQ3J1c2gnOiAnNDhGQycsXHJcbiAgICAnQ29waWVkIEVuZ2VscyBDcnVzaGluZyBXaGVlbCc6ICc0NzRCJyxcclxuICAgICdDb3BpZWQgRW5nZWxzIE1hcnggVGhydXN0JzogJzQ4RkMnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTGFzZXIgU3VwcHJlc3Npb24nOiAnNDhFMCcsIC8vIENhbm5vbnNcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCAxJzogJzQ5NzQnLFxyXG4gICAgJ0NvcGllZCA5UyBCYWxsaXN0aWMgSW1wYWN0IDInOiAnNDhEQycsXHJcbiAgICAnQ29waWVkIDlTIEJhbGxpc3RpYyBJbXBhY3QgMyc6ICc0OEU0JyxcclxuICAgICdDb3BpZWQgOVMgQmFsbGlzdGljIEltcGFjdCA0JzogJzQ4RTAnLFxyXG5cclxuICAgICdDb3BpZWQgOVMgTWFyeCBJbXBhY3QnOiAnNDhENCcsXHJcblxyXG4gICAgJ0NvcGllZCA5UyBUYW5rIERlc3RydWN0aW9uIDEnOiAnNDhFOCcsXHJcbiAgICAnQ29waWVkIDlTIFRhbmsgRGVzdHJ1Y3Rpb24gMic6ICc0OEU5JyxcclxuXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDEnOiAnNDhBNScsXHJcbiAgICAnQ29waWVkIDlTIFNlcmlhbCBTcGluIDInOiAnNDhBNycsXHJcblxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnQ29waWVkIEhvYmJlcyBTaG9ydC1SYW5nZSBNaXNzaWxlJzogJzQ4MTUnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiA1MDkzIHRha2luZyBIaWdoLVBvd2VyZWQgTGFzZXIgd2l0aCBhIHZ1bG4gKGJlY2F1c2Ugb2YgdGFraW5nIHR3bylcclxuLy8gVE9ETzogNEZCNSB0YWtpbmcgSGlnaC1Qb3dlcmVkIExhc2VyIHdpdGggYSB2dWxuIChiZWNhdXNlIG9mIHRha2luZyB0d28pXHJcbi8vIFRPRE86IDUwRDMgQWVyaWFsIFN1cHBvcnQ6IEJvbWJhcmRtZW50IGdvaW5nIG9mZiBmcm9tIGFkZFxyXG4vLyBUT0RPOiA1MjExIE1hbmV1dmVyOiBWb2x0IEFycmF5IG5vdCBnZXR0aW5nIGludGVycnVwdGVkXHJcbi8vIFRPRE86IDRGRjQvNEZGNSBPbmUgb2YgdGhlc2UgaXMgZmFpbGluZyBjaGVtaWNhbCBjb25mbGFncmF0aW9uXHJcbi8vIFRPRE86IHN0YW5kaW5nIGluIHdyb25nIHRlbGVwb3J0ZXI/PyBtYXliZSA1MzYzP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVB1cHBldHNCdW5rZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1B1cHBldCBBZWdpcyBCZWFtIENhbm5vbnMgMSc6ICc1MDc0JywgLy8gcm90YXRpbmcgc2VwYXJhdGluZyB3aGl0ZSBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IEFlZ2lzIEJlYW0gQ2Fubm9ucyAyJzogJzUwNzUnLCAvLyByb3RhdGluZyBzZXBhcmF0aW5nIHdoaXRlIGdyb3VuZCBhb2VcclxuICAgICdQdXBwZXQgQWVnaXMgQmVhbSBDYW5ub25zIDMnOiAnNTA3NicsIC8vIHJvdGF0aW5nIHNlcGFyYXRpbmcgd2hpdGUgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBBZWdpcyBDb2xsaWRlciBDYW5ub25zJzogJzUwN0UnLCAvLyByb3RhdGluZyByZWQgZ3JvdW5kIGFvZSBwaW53aGVlbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDEnOiAnNTA5MScsIC8vIGNoYXNpbmcgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBBZWdpcyBTdXJmYWNlIExhc2VyIDInOiAnNTA5MicsIC8vIGNoYXNpbmcgbGFzZXIgY2hhc2luZ1xyXG4gICAgJ1B1cHBldCBBZWdpcyBGbGlnaHQgUGF0aCc6ICc1MDhDJywgLy8gYmx1ZSBsaW5lIGFvZSBmcm9tIGZseWluZyB1bnRhcmdldGFibGUgYWRkc1xyXG4gICAgJ1B1cHBldCBBZWdpcyBSZWZyYWN0aW9uIENhbm5vbnMgMSc6ICc1MDgxJywgLy8gcmVmcmFjdGlvbiBjYW5ub25zIGJldHdlZW4gd2luZ3NcclxuICAgICdQdXBwZXQgQWVnaXMgTGlmZVxcJ3MgTGFzdCBTb25nJzogJzUzQjMnLCAvLyByaW5nIGFvZSB3aXRoIGdhcFxyXG4gICAgJ1B1cHBldCBMaWdodCBMb25nLUJhcnJlbGVkIExhc2VyJzogJzUyMTInLCAvLyBsaW5lIGFvZSBmcm9tIGFkZFxyXG4gICAgJ1B1cHBldCBMaWdodCBTdXJmYWNlIE1pc3NpbGUgSW1wYWN0JzogJzUyMEYnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgU3VwZXJpb3IgSW5jZW5kaWFyeSBCb21iaW5nJzogJzRGQjknLCAvLyBmaXJlIHB1ZGRsZSBpbml0aWFsXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNoYXJwIFR1cm4nOiAnNTA2RCcsIC8vIHNoYXJwIHR1cm4gZGFzaFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMSc6ICc0RkIxJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMic6ICc0RkIyJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTdGFuZGFyZCBTdXJmYWNlIE1pc3NpbGUgMyc6ICc0RkIzJywgLy8gTGV0aGFsIFJldm9sdXRpb24gY2lyY2xlc1xyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBTbGlkaW5nIFN3aXBlIDEnOiAnNTA2RicsIC8vIHJpZ2h0LWhhbmRlZCBzbGlkaW5nIHN3aXBlXHJcbiAgICAnUHVwcGV0IFN1cGVyaW9yIFNsaWRpbmcgU3dpcGUgMic6ICc1MDcwJywgLy8gbGVmdC1oYW5kZWQgc2xpZGluZyBzd2lwZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBHdWlkZWQgTWlzc2lsZSc6ICc0RkI4JywgLy8gZ3JvdW5kIGFvZSBkdXJpbmcgQXJlYSBCb21iYXJkbWVudFxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAxJzogJzRGQzAnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBIaWdoLU9yZGVyIEV4cGxvc2l2ZSBCbGFzdCAyJzogJzRGQzEnLCAvLyBzdGFyIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYmFyZG1lbnQnOiAnNEZGQycsIC8vIGNvbG9yZWQgbWFnaWMgaGFtbWVyLXkgZ3JvdW5kIGFvZVxyXG4gICAgJ1B1cHBldCBIZWF2eSBSZXZvbHZpbmcgTGFzZXInOiAnNTAwMCcsIC8vIGdldCB1bmRlciBsYXNlclxyXG4gICAgJ1B1cHBldCBIZWF2eSBFbmVyZ3kgQm9tYic6ICc0RkZBJywgLy8gZ2V0dGluZyBoaXQgYnkgYmFsbCBkdXJpbmcgQWN0aXZlIFN1cHByZXNzaXZlIFVuaXRcclxuICAgICdQdXBwZXQgSGVhdnkgUjAxMCBMYXNlcic6ICc0RkYwJywgLy8gbGFzZXIgcG9kXHJcbiAgICAnUHVwcGV0IEhlYXZ5IFIwMzAgSGFtbWVyJzogJzRGRjEnLCAvLyBjaXJjbGUgYW9lIHBvZFxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEhpZ2gtUG93ZXJlZCBMYXNlcic6ICc1MEIxJywgLy8gbG9uZyBhb2UgaW4gdGhlIGhhbGx3YXkgc2VjdGlvblxyXG4gICAgJ1B1cHBldCBIYWxsd2F5IEVuZXJneSBCb21iJzogJzUwQjInLCAvLyBydW5uaW5nIGludG8gYSBmbG9hdGluZyBvcmJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgTWVjaGFuaWNhbCBEaXNzZWN0aW9uJzogJzUxQjMnLCAvLyBzcGlubmluZyB2ZXJ0aWNhbCBsYXNlclxyXG4gICAgJ1B1cHBldCBDb21wb3VuZCBNZWNoYW5pY2FsIERlY2FwaXRhdGlvbic6ICc1MUI0JywgLy8gZ2V0IHVuZGVyIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVW50YXJnZXRlZCc6ICc1MUI3JywgLy8gdW50YXJnZXRlZCBncm91bmQgYW9lXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDEnOiAnNTFBQScsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFJlbGVudGxlc3MgU3BpcmFsIDInOiAnNTFDQicsIC8vIHRyaXBsZSB1bnRhcmdldGVkIGdyb3VuZCBhb2VzXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAxJzogJzU0MUYnLCAvLyAyUCBwcmltZSBibGFkZSBnZXQgb3V0XHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIE91dCAyJzogJzUxOTgnLCAvLyAyUC9wdXBwZXQgdGVsZXBvcnRpbmcvcmVwcm9kdWNlIHByaW1lIGJsYWRlIGdldCBvdXRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDEnOiAnNTQyMCcsIC8vIDJQIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgQmVoaW5kIDInOiAnNTE5OScsIC8vIDJQIHRlbGVwb3J0aW5nIHByaW1lIGJsYWRlIGdldCBiZWhpbmRcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUHJpbWUgQmxhZGUgSW4gMSc6ICc1NDIxJywgLy8gMlAgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFByaW1lIEJsYWRlIEluIDInOiAnNTE5QScsIC8vIDJQL3B1cHBldCB0ZWxlcG9ydGluZy9yZXByb2R1Y2UgcHJpbWUgYmxhZGUgZ2V0IGluXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgR3JvdW5kJzogJzUxQUUnLCAvLyB1bnRhcmdldGVkIGdyb3VuZCBjaXJjbGVcclxuICAgIC8vIFRoaXMgaXMuLi4gdG9vIG5vaXN5LlxyXG4gICAgLy8gJ1B1cHBldCBDb21wb3VuZCAyUCBGb3VyIFBhcnRzIFJlc29sdmUgMSc6ICc1MUEwJywgLy8gZm91ciBwYXJ0cyByZXNvbHZlIGp1bXBcclxuICAgIC8vICdQdXBwZXQgQ29tcG91bmQgMlAgRm91ciBQYXJ0cyBSZXNvbHZlIDInOiAnNTE5RicsIC8vIGZvdXIgcGFydHMgcmVzb2x2ZSBjbGVhdmVcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdQdXBwZXQgSGVhdnkgVXBwZXIgTGFzZXIgMSc6ICc1MDg3JywgLy8gdXBwZXIgbGFzZXIgaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBVcHBlciBMYXNlciAyJzogJzRGRjcnLCAvLyB1cHBlciBsYXNlciBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDEnOiAnNTA4NicsIC8vIGxvd2VyIGxhc2VyIGZpcnN0IHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciAyJzogJzRGRjYnLCAvLyBsb3dlciBsYXNlciBmaXJzdCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgSGVhdnkgTG93ZXIgTGFzZXIgMyc6ICc1MDg4JywgLy8gbG93ZXIgbGFzZXIgc2Vjb25kIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA0JzogJzRGRjgnLCAvLyBsb3dlciBsYXNlciBzZWNvbmQgc2VjdGlvbiBjb250aW51b3VzXHJcbiAgICAnUHVwcGV0IEhlYXZ5IExvd2VyIExhc2VyIDUnOiAnNTA4OScsIC8vIGxvd2VyIGxhc2VyIHRoaXJkIHNlY3Rpb24gaW5pdGlhbFxyXG4gICAgJ1B1cHBldCBIZWF2eSBMb3dlciBMYXNlciA2JzogJzRGRjknLCAvLyBsb3dlciBsYXNlciB0aGlyZCBzZWN0aW9uIGNvbnRpbnVvdXNcclxuICAgICdQdXBwZXQgQ29tcG91bmQgSW5jb25ncnVvdXMgU3Bpbic6ICc1MUIyJywgLy8gZmluZCB0aGUgc2FmZSBzcG90IGRvdWJsZSBkYXNoXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdQdXBwZXQgQnVybnMnOiAnMTBCJywgLy8gc3RhbmRpbmcgaW4gbWFueSB2YXJpb3VzIGZpcmUgYW9lc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBUaGlzIGlzIHByZXR0eSBsYXJnZSBhbmQgZ2V0dGluZyBoaXQgYnkgaW5pdGlhbCB3aXRob3V0IGJ1cm5zIHNlZW1zIGZpbmUuXHJcbiAgICAvLyAnUHVwcGV0IExpZ2h0IEhvbWluZyBNaXNzaWxlIEltcGFjdCc6ICc1MjEwJywgLy8gdGFyZ2V0ZWQgZmlyZSBhb2UgZnJvbSBObyBSZXN0cmljdGlvbnNcclxuICAgICdQdXBwZXQgSGVhdnkgVW5jb252ZW50aW9uYWwgVm9sdGFnZSc6ICc1MDA0JyxcclxuICAgIC8vIFByZXR0eSBub2lzeS5cclxuICAgICdQdXBwZXQgTWFuZXV2ZXIgSGlnaC1Qb3dlcmVkIExhc2VyJzogJzUwMDInLCAvLyB0YW5rIGxhc2VyXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIE1lY2huaWNhbCBDb250dXNpb24gVGFyZ2V0ZWQnOiAnNTFCNicsIC8vIHRhcmdldGVkIHNwcmVhZCBtYXJrZXJcclxuICAgICdQdXBwZXQgQ29tcG91bmQgMlAgUjAxMiBMYXNlciBUYW5rJzogJzUxQUUnLCAvLyB0YXJnZXRlZCBzcHJlYWQgcG9kIGxhc2VyIG9uIG5vbi10YW5rXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdQdXBwZXQgQWVnaXMgQW50aS1QZXJzb25uZWwgTGFzZXInOiAnNTA5MCcsIC8vIHRhbmsgYnVzdGVyIG1hcmtlclxyXG4gICAgJ1B1cHBldCBTdXBlcmlvciBQcmVjaXNpb24tR3VpZGVkIE1pc3NpbGUnOiAnNEZDNScsXHJcbiAgICAnUHVwcGV0IENvbXBvdW5kIDJQIFIwMTIgTGFzZXIgVGFuayc6ICc1MUFEJywgLy8gdGFyZ2V0ZWQgcG9kIGxhc2VyIG9uIHRhbmtcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBtaXNzaW5nIFNob2NrIEJsYWNrIDI/XHJcbi8vIFRPRE86IFdoaXRlL0JsYWNrIERpc3NvbmFuY2UgZGFtYWdlIGlzIG1heWJlIHdoZW4gZmxhZ3MgZW5kIGluIDAzP1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVRvd2VyQXRQYXJhZGlnbXNCcmVhY2gsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBDZW50ZXIgMSc6ICc1RUE3JywgLy8gQ2VudGVyIGFvZSBmcm9tIEtuYXZlIGFuZCBjbG9uZXNcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgQ2VudGVyIDInOiAnNjBDOCcsIC8vIENlbnRlciBhb2UgZnJvbSBLbmF2ZSBkdXJpbmcgbHVuZ2VcclxuICAgICdUb3dlciBLbmF2ZSBDb2xvc3NhbCBJbXBhY3QgU2lkZSAxJzogJzVFQTUnLCAvLyBTaWRlIGFvZXMgZnJvbSBLbmF2ZSBhbmQgY2xvbmVzXHJcbiAgICAnVG93ZXIgS25hdmUgQ29sb3NzYWwgSW1wYWN0IFNpZGUgMic6ICc1RUE2JywgLy8gU2lkZSBhb2VzIGZyb20gS25hdmUgYW5kIGNsb25lc1xyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDMnOiAnNjBDNicsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIENvbG9zc2FsIEltcGFjdCBTaWRlIDQnOiAnNjBDNycsIC8vIFNpZGUgYW9lcyBmcm9tIEtuYXZlIGR1cmluZyBsdW5nZVxyXG4gICAgJ1Rvd2VyIEtuYXZlIEJ1cnN0JzogJzVFRDQnLCAvLyBTcGhlcm9pZCBLbmF2aXNoIEJ1bGxldHMgY29sbGlzaW9uXHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQmFycmFnZSc6ICc1RUFDJywgLy8gU3BoZXJvaWQgbGluZSBhb2VzXHJcbiAgICAnVG93ZXIgSGFuc2VsIFJlcGF5JzogJzVDNzAnLCAvLyBTaGllbGQgZGFtYWdlXHJcbiAgICAnVG93ZXIgSGFuc2VsIEV4cGxvc2lvbic6ICc1QzY3JywgLy8gQmVpbmcgaGl0IGJ5IE1hZ2ljIEJ1bGxldCBkdXJpbmcgUGFzc2luZyBMYW5jZVxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBJbXBhY3QnOiAnNUM1QycsIC8vIEJlaW5nIGhpdCBieSBNYWdpY2FsIENvbmZsdWVuY2UgZHVyaW5nIFdhbmRlcmluZyBUcmFpbFxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgMSc6ICc1QzZDJywgLy8gRHVhbCBjbGVhdmVzIHdpdGhvdXQgdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIEJsb29keSBTd2VlcCAyJzogJzVDNkQnLCAvLyBEdWFsIGNsZWF2ZXMgd2l0aG91dCB0ZXRoZXJcclxuICAgICdUb3dlciBIYW5zZWwgQmxvb2R5IFN3ZWVwIDMnOiAnNUM2RScsIC8vIER1YWwgY2xlYXZlcyB3aXRoIHRldGhlclxyXG4gICAgJ1Rvd2VyIEhhbnNlbCBCbG9vZHkgU3dlZXAgNCc6ICc1QzZGJywgLy8gRHVhbCBjbGVhdmVzIHdpdGggdGV0aGVyXHJcbiAgICAnVG93ZXIgSGFuc2VsIFBhc3NpbmcgTGFuY2UnOiAnNUM2NicsIC8vIFRoZSBQYXNzaW5nIExhbmNlIGNoYXJnZSBpdHNlbGZcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAxJzogJzU1QjMnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAyJzogJzVDNUQnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgQnJlYXRodGhyb3VnaCAzJzogJzVDNUUnLCAvLyBoYWxmIHJvb20gY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgSHVuZ3J5IExhbmNlIDEnOiAnNUM3MScsIC8vIDJ4bGFyZ2UgY29uYWwgY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBIYW5zZWwgSHVuZ3J5IExhbmNlIDInOiAnNUM3MicsIC8vIDJ4bGFyZ2UgY29uYWwgY2xlYXZlIGR1cmluZyBXYW5kZXJpbmcgVHJhaWxcclxuICAgICdUb3dlciBGbGlnaHQgVW5pdCBMaWdodGZhc3QgQmxhZGUnOiAnNUJGRScsIC8vIGxhcmdlIHJvb20gY2xlYXZlXHJcbiAgICAnVG93ZXIgRmxpZ2h0IFVuaXQgU3RhbmRhcmQgTGFzZXInOiAnNUJGRicsIC8vIHRyYWNraW5nIGxhc2VyXHJcbiAgICAnVG93ZXIgMlAgV2hpcmxpbmcgQXNzYXVsdCc6ICc1QkZCJywgLy8gbGluZSBhb2UgZnJvbSAyUCBjbG9uZXNcclxuICAgICdUb3dlciAyUCBCYWxhbmNlZCBFZGdlJzogJzVCRkEnLCAvLyBjaXJjdWxhciBhb2Ugb24gMlAgY2xvbmVzXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAxJzogJzYwMDYnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAyJzogJzYwMDcnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciAzJzogJzYwMDgnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA0JzogJzYwMDknLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA1JzogJzYzMTAnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA2JzogJzYzMTEnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA3JzogJzYzMTInLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgR2VuZXJhdGUgQmFycmllciA4JzogJzYzMTMnLCAvLyBiZWluZyBoaXQgYnkgYmFycmllcnMgYXBwZWFyaW5nXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgU2hvY2sgV2hpdGUgMSc6ICc2MDBGJywgLy8gd2hpdGUgc2hvY2t3YXZlIGNpcmNsZSBub3QgZHJvcHBlZCBvbiBibGFja1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFNob2NrIFdoaXRlIDInOiAnNjAxMCcsIC8vIHdoaXRlIHNob2Nrd2F2ZSBjaXJjbGUgbm90IGRyb3BwZWQgb24gYmxhY2tcclxuICAgICdUb3dlciBSZWQgR2lybCBTaG9jayBCbGFjayAxJzogJzYwMTEnLCAvLyBibGFjayBzaG9ja3dhdmUgY2lyY2xlIG5vdCBkcm9wcGVkIG9uIHdoaXRlXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgV2hpdGUgMSc6ICc2MDFGJywgLy8gYmVpbmcgaGl0IGJ5IGEgd2hpdGUgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBQb2ludCBXaGl0ZSAyJzogJzYwMjEnLCAvLyBiZWluZyBoaXQgYnkgYSB3aGl0ZSBsYXNlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFBvaW50IEJsYWNrIDEnOiAnNjAyMCcsIC8vIGJlaW5nIGhpdCBieSBhIGJsYWNrIGxhc2VyXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgUG9pbnQgQmxhY2sgMic6ICc2MDIyJywgLy8gYmVpbmcgaGl0IGJ5IGEgYmxhY2sgbGFzZXJcclxuICAgICdUb3dlciBSZWQgR2lybCBXaXBlIFdoaXRlJzogJzYwMEMnLCAvLyBub3QgbGluZSBvZiBzaWdodGluZyB0aGUgd2hpdGUgbWV0ZW9yXHJcbiAgICAnVG93ZXIgUmVkIEdpcmwgV2lwZSBCbGFjayc6ICc2MDBEJywgLy8gbm90IGxpbmUgb2Ygc2lnaHRpbmcgdGhlIGJsYWNrIG1ldGVvclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIERpZmZ1c2UgRW5lcmd5JzogJzYwNTYnLCAvLyByb3RhdGluZyBjbG9uZSBidWJibGUgY2xlYXZlc1xyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIFB5bG9uIEJpZyBFeHBsb3Npb24nOiAnNjAyNycsIC8vIG5vdCBraWxsaW5nIGEgcHlsb24gZHVyaW5nIGhhY2tpbmcgcGhhc2VcclxuICAgICdUb3dlciBSZWQgR2lybCBQeWxvbiBFeHBsb3Npb24nOiAnNjAyNicsIC8vIHB5bG9uIGR1cmluZyBDaGlsZCdzIHBsYXlcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIE1pZGRsZSc6ICc1QzAyJywgLy8gbWlkZGxlIGxhc2VyXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyBTaWRlcyc6ICc1QzA1JywgLy8gc2lkZXMgbGFzZXJcclxuICAgICdUb3dlciBQaGlsb3NvcGhlciBEZXBsb3kgQXJtYW1lbnRzIDMnOiAnNjA3OCcsIC8vIGdvZXMgd2l0aCA1QzAxXHJcbiAgICAnVG93ZXIgUGhpbG9zb3BoZXIgRGVwbG95IEFybWFtZW50cyA0JzogJzYwNzknLCAvLyBnb2VzIHdpdGggNUMwNFxyXG4gICAgJ1Rvd2VyIFBoaWxvc29waGVyIEVuZXJneSBCb21iJzogJzVDMDUnLCAvLyBwaW5rIGJ1YmJsZVxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTWFkZSBNYWdpYyBSaWdodCc6ICc1QkQ3JywgLy8gcm90YXRpbmcgd2hlZWwgZ29pbmcgcmlnaHRcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZGUgTWFnaWMgTGVmdCc6ICc1QkQ2JywgLy8gcm90YXRpbmcgd2hlZWwgZ29pbmcgbGVmdFxyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgTGlnaHRlciBOb3RlJzogJzVCREEnLCAvLyBsaWdodGVyIG5vdGUgbW92aW5nIGFvZXNcclxuICAgICdUb3dlciBGYWxzZSBJZG9sIE1hZ2ljYWwgSW50ZXJmZXJlbmNlJzogJzVCRDUnLCAvLyBsYXNlcnMgZHVyaW5nIFJoeXRobSBSaW5nc1xyXG4gICAgJ1Rvd2VyIEZhbHNlIElkb2wgU2NhdHRlcmVkIE1hZ2ljJzogJzVCREYnLCAvLyBjaXJjbGUgYW9lcyBmcm9tIFNlZWQgT2YgTWFnaWNcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBVbmV2ZW4gRm90dGluZyc6ICc1QkUyJywgLy8gYnVpbGRpbmcgZnJvbSBSZWNyZWF0ZSBTdHJ1Y3R1cmVcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBDcmFzaCc6ICc1QkU1JywgLy8gdHJhaW5zIGZyb20gTWl4ZWQgU2lnbmFsc1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEhlYXZ5IEFybXMgMSc6ICc1QkVEJywgLy8gaGVhdnkgYXJtcyBmcm9udC9iYWNrIGF0dGFja1xyXG4gICAgJ1Rvd2VyIEhlciBJbmZsb3Jlc2NlbmNlIEhlYXZ5IEFybXMgMic6ICc1QkVGJywgLy8gaGVhdnkgYXJtcyBzaWRlcyBhdHRhY2tcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBFbmVyZ3kgU2NhdHRlcmVkIE1hZ2ljJzogJzVCRTgnLCAvLyBvcmJzIGZyb20gUmVkIEdpcmwgYnkgdHJhaW5cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUb3dlciBIZXIgSW5mbG9yZXNjZW5jZSBQbGFjZSBPZiBQb3dlcic6ICc1QzBEJywgLy8gaW5zdGFkZWF0aCBtaWRkbGUgY2lyY2xlIGJlZm9yZSBibGFjay93aGl0ZSByaW5nc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnVG93ZXIgS25hdmUgTWFnaWMgQXJ0aWxsZXJ5IEFscGhhJzogJzVFQUInLCAvLyBTcHJlYWRcclxuICAgICdUb3dlciBIYW5zZWwgU2VlZCBPZiBNYWdpYyBBbHBoYSc6ICc1QzYxJywgLy8gU3ByZWFkXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUb3dlciBLbmF2ZSBNYWdpYyBBcnRpbGxlcnkgQmV0YSc6ICc1RUIzJywgLy8gVGFua2J1c3RlclxyXG4gICAgJ1Rvd2VyIFJlZCBHaXJsIE1hbmlwdWxhdGUgRW5lcmd5JzogJzYwMUEnLCAvLyBUYW5rYnVzdGVyXHJcbiAgICAnVG93ZXIgRmFsc2UgSWRvbCBEYXJrZXIgTm90ZSc6ICc1QkRDJywgLy8gVGFua2J1c3RlclxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdUb3dlciBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gNUVCMSA9IEtuYXZlIEx1bmdlXHJcbiAgICAgIC8vIDVCRjIgPSBIZXIgSW5mbG9yZXNlbmNlIFNob2Nrd2F2ZVxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNUVCMScsICc1QkYyJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Ba2FkYWVtaWFBbnlkZXIsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FueWRlciBBY3JpZCBTdHJlYW0nOiAnNDMwNCcsXHJcbiAgICAnQW55ZGVyIFdhdGVyc3BvdXQnOiAnNDMwNicsXHJcbiAgICAnQW55ZGVyIFJhZ2luZyBXYXRlcnMnOiAnNDMwMicsXHJcbiAgICAnQW55ZGVyIFZpb2xlbnQgQnJlYWNoJzogJzQzMDUnLFxyXG4gICAgJ0FueWRlciBUaWRhbCBHdWlsbG90aW5lIDEnOiAnM0UwOCcsXHJcbiAgICAnQW55ZGVyIFRpZGFsIEd1aWxsb3RpbmUgMic6ICczRTBBJyxcclxuICAgICdBbnlkZXIgUGVsYWdpYyBDbGVhdmVyIDEnOiAnM0UwOScsXHJcbiAgICAnQW55ZGVyIFBlbGFnaWMgQ2xlYXZlciAyJzogJzNFMEInLFxyXG4gICAgJ0FueWRlciBBcXVhdGljIExhbmNlJzogJzNFMDUnLFxyXG4gICAgJ0FueWRlciBTeXJ1cCBTcG91dCc6ICc0MzA4JyxcclxuICAgICdBbnlkZXIgTmVlZGxlIFN0b3JtJzogJzQzMDknLFxyXG4gICAgJ0FueWRlciBFeHRlbnNpYmxlIFRlbmRyaWxzIDEnOiAnM0UxMCcsXHJcbiAgICAnQW55ZGVyIEV4dGVuc2libGUgVGVuZHJpbHMgMic6ICczRTExJyxcclxuICAgICdBbnlkZXIgUHV0cmlkIEJyZWF0aCc6ICczRTEyJyxcclxuICAgICdBbnlkZXIgRGV0b25hdG9yJzogJzQzMEYnLFxyXG4gICAgJ0FueWRlciBEb21pbmlvbiBTbGFzaCc6ICc0MzBEJyxcclxuICAgICdBbnlkZXIgUXVhc2FyJzogJzQzMEInLFxyXG4gICAgJ0FueWRlciBEYXJrIEFycml2aXNtZSc6ICc0MzBFJyxcclxuICAgICdBbnlkZXIgVGh1bmRlcnN0b3JtJzogJzNFMUMnLFxyXG4gICAgJ0FueWRlciBXaW5kaW5nIEN1cnJlbnQnOiAnM0UxRicsXHJcbiAgICAvLyAzRTIwIGlzIGJlaW5nIGhpdCBieSB0aGUgZ3Jvd2luZyBvcmJzLCBtYXliZT9cclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFtYXVyb3QsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0FtYXVyb3QgQnVybmluZyBTa3knOiAnMzU0QScsXHJcbiAgICAnQW1hdXJvdCBXaGFjayc6ICczNTNDJyxcclxuICAgICdBbWF1cm90IEFldGhlcnNwaWtlJzogJzM1M0InLFxyXG4gICAgJ0FtYXVyb3QgVmVuZW1vdXMgQnJlYXRoJzogJzNDQ0UnLFxyXG4gICAgJ0FtYXVyb3QgQ29zbWljIFNocmFwbmVsJzogJzREMjYnLFxyXG4gICAgJ0FtYXVyb3QgRWFydGhxdWFrZSc6ICczQ0NEJyxcclxuICAgICdBbWF1cm90IE1ldGVvciBSYWluJzogJzNDQzYnLFxyXG4gICAgJ0FtYXVyb3QgRmluYWwgU2t5JzogJzNDQ0InLFxyXG4gICAgJ0FtYXVyb3QgTWFsZXZvbGVuY2UnOiAnMzU0MScsXHJcbiAgICAnQW1hdXJvdCBUdXJuYWJvdXQnOiAnMzU0MicsXHJcbiAgICAnQW1hdXJvdCBTaWNrbHkgSW5mZXJubyc6ICczREUzJyxcclxuICAgICdBbWF1cm90IERpc3F1aWV0aW5nIEdsZWFtJzogJzM1NDYnLFxyXG4gICAgJ0FtYXVyb3QgQmxhY2sgRGVhdGgnOiAnMzU0MycsXHJcbiAgICAnQW1hdXJvdCBGb3JjZSBvZiBMb2F0aGluZyc6ICczNTQ0JyxcclxuICAgICdBbWF1cm90IERhbW5pbmcgUmF5IDEnOiAnM0UwMCcsXHJcbiAgICAnQW1hdXJvdCBEYW1uaW5nIFJheSAyJzogJzNFMDEnLFxyXG4gICAgJ0FtYXVyb3QgRGVhZGx5IFRlbnRhY2xlcyc6ICczNTQ3JyxcclxuICAgICdBbWF1cm90IE1pc2ZvcnR1bmUnOiAnM0NFMicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnQW1hdXJvdCBBcG9rYWx5cHNpcyc6ICczQ0Q3JyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkFuYW1uZXNpc0FueWRlcixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBQaHVhYm8gU3BpbmUgTGFzaCc6ICc0RDFBJywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggQW5lbW9uZSBGYWxsaW5nIFJvY2snOiAnNEUzNycsIC8vIGdyb3VuZCBjaXJjbGUgYW9lIGZyb20gVHJlbmNoIEFuZW1vbmUgc2hvd2luZyB1cFxyXG4gICAgJ0FuYW1uZXNpcyBUcmVuY2ggRGFnb25pdGUgU2V3ZXIgV2F0ZXInOiAnNEQxQycsIC8vIGZyb250YWwgY29uYWwgZnJvbSBUcmVuY2ggQW5lbW9uZSAoPyEpXHJcbiAgICAnQW5hbW5lc2lzIFRyZW5jaCBZb3ZyYSBSb2NrIEhhcmQnOiAnNEQyMScsIC8vIHRhcmdldGVkIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFlvdnJhIFRvcnJlbnRpYWwgVG9ybWVudCc6ICc0RDIxJywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIEx1bWlub3VzIFJheSc6ICc0RTI3JywgLy8gVW5rbm93biBsaW5lIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFNpbnN0ZXIgQnViYmxlIEV4cGxvc2lvbic6ICc0QjZFJywgLy8gVW5rbm93biBleHBsb3Npb25zIGR1cmluZyBTY3J1dGlueVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIFJlZmxlY3Rpb24nOiAnNEI2RicsIC8vIFVua25vd24gY29uYWwgYXR0YWNrIGR1cmluZyBTY3J1dGlueVxyXG4gICAgJ0FuYW1uZXNpcyBVbmtub3duIENsZWFyb3V0IDEnOiAnNEI3NCcsIC8vIFVua25vd24gZnJvbnRhbCBjb25lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gQ2xlYXJvdXQgMic6ICc0QjZCJywgLy8gVW5rbm93biBmcm9udGFsIGNvbmVcclxuICAgICdBbmFtbmVzaXMgVW5rbm93biBTZXRiYWNrIDEnOiAnNEI3NScsIC8vIFVua25vd24gcmVhciBjb25lXHJcbiAgICAnQW5hbW5lc2lzIFVua25vd24gU2V0YmFjayAyJzogJzVCNkMnLCAvLyBVbmtub3duIHJlYXIgY29uZVxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgQ2xpb25pZCBBY3JpZCBTdHJlYW0nOiAnNEQyNCcsIC8vIHRhcmdldGVkIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgQW55ZGVyIERpdmluZXIgRHJlYWRzdG9ybSc6ICc0RDI4JywgLy8gZ3JvdW5kIGNpcmNsZSBhb2VcclxuICAgICdBbmFtbmVzaXMgS3lrbG9wcyAyMDAwLU1pbmEgU3dpbmcnOiAnNEI1NScsIC8vIEt5a2xvcHMgZ2V0IG91dCBtZWNoYW5pY1xyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIFRlcnJpYmxlIEhhbW1lcic6ICc0QjVEJywgLy8gS3lrbG9wcyBIYW1tZXIvQmxhZGUgYWx0ZXJuYXRpbmcgc3F1YXJlc1xyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIFRlcnJpYmxlIEJsYWRlJzogJzRCNUUnLCAvLyBLeWtsb3BzIEhhbW1lci9CbGFkZSBhbHRlcm5hdGluZyBzcXVhcmVzXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgUmFnaW5nIEdsb3dlcic6ICc0QjU2JywgLy8gS3lrbG9wcyBsaW5lIGFvZVxyXG4gICAgJ0FuYW1uZXNpcyBLeWtsb3BzIEV5ZSBPZiBUaGUgQ3ljbG9uZSc6ICc0QjU3JywgLy8gS3lrbG9wcyBkb251dFxyXG4gICAgJ0FuYW1uZXNpcyBBbnlkZXIgSGFycG9vbmVyIEh5ZHJvYmFsbCc6ICc0RDI2JywgLy8gZnJvbnRhbCBjb25hbFxyXG4gICAgJ0FuYW1uZXNpcyBSdWtzaHMgU3dpZnQgU2hpZnQnOiAnNEI4MycsIC8vIFJ1a3NocyBEZWVtIHRlbGVwb3J0IE4vU1xyXG4gICAgJ0FuYW1uZXNpcyBSdWtzaHMgRGVwdGggR3JpcCBXYXZlYnJlYWtlcic6ICczM0Q0JywgLy8gUnVrc2hzIERlZW0gaGFuZCBhdHRhY2tzXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBSaXNpbmcgVGlkZSc6ICc0QjhCJywgLy8gUnVrc2hzIERlZW0gY3Jvc3MgYW9lXHJcbiAgICAnQW5hbW5lc2lzIFJ1a3NocyBDb21tYW5kIEN1cnJlbnQnOiAnNEI4MicsIC8vIFJ1a3NocyBEZWVtIHByb3RlYW4taXNoIGdyb3VuZCBhb2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdBbmFtbmVzaXMgVHJlbmNoIFh6b21pdCBNYW50bGUgRHJpbGwnOiAnNEQxOScsIC8vIGNoYXJnZSBhdHRhY2tcclxuICAgICdBbmFtbmVzaXMgSW8gT3VzaWEgQmFycmVsaW5nIFNtYXNoJzogJzRFMjQnLCAvLyBjaGFyZ2UgYXR0YWNrXHJcbiAgICAnQW5hbW5lc2lzIEt5a2xvcHMgV2FuZGVyZXJcXCdzIFB5cmUnOiAnNEI1RicsIC8vIEt5a2xvcHMgc3ByZWFkIGF0dGFja1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IE1pc3NpbmcgR3Jvd2luZyB0ZXRoZXJzIG9uIGJvc3MgMi5cclxuLy8gKE1heWJlIGdhdGhlciBwYXJ0eSBtZW1iZXIgbmFtZXMgb24gdGhlIHByZXZpb3VzIFRJSUlJTUJFRUVFRUVSIGNhc3QgZm9yIGNvbXBhcmlzb24/KVxyXG4vLyBUT0RPOiBGYWlsaW5nIHRvIGludGVycnVwdCBEb2huZmF1c3QgRnVhdGggb24gV2F0ZXJpbmcgV2hlZWwgY2FzdHM/XHJcbi8vICgxNTouLi4uLi4uLjpEb2huZmFzdCBGdWF0aDozREFBOldhdGVyaW5nIFdoZWVsOi4uLi4uLi4uOihcXHl7TmFtZX0pOilcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Eb2huTWhlZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRG9obiBNaGVnIEdleXNlcic6ICcyMjYwJywgLy8gV2F0ZXIgZXJ1cHRpb25zLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgSHlkcm9mYWxsJzogJzIyQkQnLCAvLyBHcm91bmQgQW9FIG1hcmtlciwgYm9zcyAxXHJcbiAgICAnRG9obiBNaGVnIExhdWdoaW5nIExlYXAnOiAnMjI5NCcsIC8vIEdyb3VuZCBBb0UgbWFya2VyLCBib3NzIDFcclxuICAgICdEb2huIE1oZWcgU3dpbmdlJzogJzIyQ0EnLCAvLyBGcm9udGFsIGNvbmUsIGJvc3MgMlxyXG4gICAgJ0RvaG4gTWhlZyBDYW5vcHknOiAnM0RCMCcsIC8vIEZyb250YWwgY29uZSwgRG9obmZhdXN0IFJvd2FucyB0aHJvdWdob3V0IGluc3RhbmNlXHJcbiAgICAnRG9obiBNaGVnIFBpbmVjb25lIEJvbWInOiAnM0RCMScsIC8vIENpcmN1bGFyIGdyb3VuZCBBb0UgbWFya2VyLCBEb2huZmF1c3QgUm93YW5zIHRocm91Z2hvdXQgaW5zdGFuY2VcclxuICAgICdEb2huIE1oZWcgQmlsZSBCb21iYXJkbWVudCc6ICczNEVFJywgLy8gR3JvdW5kIEFvRSBtYXJrZXIsIGJvc3MgM1xyXG4gICAgJ0RvaG4gTWhlZyBDb3Jyb3NpdmUgQmlsZSc6ICczNEVDJywgLy8gRnJvbnRhbCBjb25lLCBib3NzIDNcclxuICAgICdEb2huIE1oZWcgRmxhaWxpbmcgVGVudGFjbGVzJzogJzM2ODEnLFxyXG5cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIEltcCBDaG9pcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc0NkUnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRG9obiBNaGVnIFRvYWQgQ2hvaXInLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMUI3JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RvaG4gTWhlZyBGb29sXFwncyBUdW1ibGUnLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnMTgzJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IEJlcnNlcmtlciAybmQvM3JkIHdpbGQgYW5ndWlzaCBzaG91bGQgYmUgc2hhcmVkIHdpdGgganVzdCBhIHJvY2tcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVIZXJvZXNHYXVudGxldCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVEhHIEJsYWRlXFwncyBCZW5pc29uJzogJzUyMjgnLCAvLyBwbGQgY29uYWxcclxuICAgICdUSEcgQWJzb2x1dGUgSG9seSc6ICc1MjRCJywgLy8gd2htIHZlcnkgbGFyZ2UgYW9lXHJcbiAgICAnVEhHIEhpc3NhdHN1OiBHb2thJzogJzUyM0QnLCAvLyBzYW0gbGluZSBhb2VcclxuICAgICdUSEcgV2hvbGUgU2VsZic6ICc1MjJEJywgLy8gbW5rIHdpZGUgbGluZSBhb2VcclxuICAgICdUSEcgUmFuZGdyaXRoJzogJzUyMzInLCAvLyBkcmcgdmVyeSBiaWcgbGluZSBhb2VcclxuICAgICdUSEcgVmFjdXVtIEJsYWRlIDEnOiAnNTA2MScsIC8vIFNwZWN0cmFsIFRoaWVmIGNpcmN1bGFyIGdyb3VuZCBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgVmFjdXVtIEJsYWRlIDInOiAnNTA2MicsIC8vIFNwZWN0cmFsIFRoaWVmIGNpcmN1bGFyIGdyb3VuZCBhb2UgZnJvbSBtYXJrZXJcclxuICAgICdUSEcgQ293YXJkXFwncyBDdW5uaW5nJzogJzRGRDcnLCAvLyBTcGVjdHJhbCBUaGllZiBDaGlja2VuIEtuaWZlIGxhc2VyXHJcbiAgICAnVEhHIFBhcGVyY3V0dGVyIDEnOiAnNEZEMScsIC8vIFNwZWN0cmFsIFRoaWVmIGxpbmUgYW9lIGZyb20gbWFya2VyXHJcbiAgICAnVEhHIFBhcGVyY3V0dGVyIDInOiAnNEZEMicsIC8vIFNwZWN0cmFsIFRoaWVmIGxpbmUgYW9lIGZyb20gbWFya2VyXHJcbiAgICAnVEhHIFJpbmcgb2YgRGVhdGgnOiAnNTIzNicsIC8vIGRyZyBjaXJjdWxhciBhb2VcclxuICAgICdUSEcgTHVuYXIgRWNsaXBzZSc6ICc1MjI3JywgLy8gcGxkIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1RIRyBBYnNvbHV0ZSBHcmF2aXR5JzogJzUyNDgnLCAvLyBpbmsgbWFnZSBjaXJjdWxhclxyXG4gICAgJ1RIRyBSYWluIG9mIExpZ2h0JzogJzUyNDInLCAvLyBiYXJkIGxhcmdlIGNpcmN1bGUgYW9lXHJcbiAgICAnVEhHIERvb21pbmcgRm9yY2UnOiAnNTIzOScsIC8vIGRyZyBsaW5lIGFvZVxyXG4gICAgJ1RIRyBBYnNvbHV0ZSBEYXJrIElJJzogJzRGNjEnLCAvLyBOZWNyb21hbmNlciAxMjAgZGVncmVlIGNvbmFsXHJcbiAgICAnVEhHIEJ1cnN0JzogJzUzQjcnLCAvLyBOZWNyb21hbmNlciBuZWNyb2J1cnN0IHNtYWxsIHpvbWJpZSBleHBsb3Npb25cclxuICAgICdUSEcgUGFpbiBNaXJlJzogJzRGQTQnLCAvLyBOZWNyb21hbmNlciB2ZXJ5IGxhcmdlIGdyZWVuIGJsZWVkIHB1ZGRsZVxyXG4gICAgJ1RIRyBEYXJrIERlbHVnZSc6ICc0RjVEJywgLy8gTmVjcm9tYW5jZXIgZ3JvdW5kIGFvZVxyXG4gICAgJ1RIRyBUZWtrYSBHb2ppbic6ICc1MjNFJywgLy8gc2FtIDkwIGRlZ3JlZSBjb25hbFxyXG4gICAgJ1RIRyBSYWdpbmcgU2xpY2UgMSc6ICc1MjBBJywgLy8gQmVyc2Vya2VyIGxpbmUgY2xlYXZlXHJcbiAgICAnVEhHIFJhZ2luZyBTbGljZSAyJzogJzUyMEInLCAvLyBCZXJzZXJrZXIgbGluZSBjbGVhdmVcclxuICAgICdUSEcgV2lsZCBSYWdlJzogJzUyMDMnLCAvLyBCZXJzZXJrZXIgYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnVEhHIEJsZWVkaW5nJzogJzgyOCcsIC8vIFN0YW5kaW5nIGluIHRoZSBOZWNyb21hbmNlciBwdWRkbGUgb3Igb3V0c2lkZSB0aGUgQmVyc2Vya2VyIGFyZW5hXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdEZhaWw6IHtcclxuICAgICdUSEcgVHJ1bHkgQmVyc2Vyayc6ICc5MDYnLCAvLyBTdGFuZGluZyBpbiB0aGUgY3JhdGVyIHRvbyBsb25nXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUSEcgQWJzb2x1dGUgVGh1bmRlciBJVic6ICc1MjQ1JywgLy8gaGVhZG1hcmtlciBhb2UgZnJvbSBibG1cclxuICAgICdUSEcgTW9vbmRpdmVyJzogJzUyMzMnLCAvLyBoZWFkbWFya2VyIGFvZSBmcm9tIGRyZ1xyXG4gICAgJ1RIRyBTcGVjdHJhbCBHdXN0JzogJzUzQ0YnLCAvLyBTcGVjdHJhbCBUaGllZiBoZWFkbWFya2VyIGFvZVxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVEhHIEZhbGxpbmcgUm9jayc6ICc1MjA1JywgLy8gQmVyc2Vya2VyIGhlYWRtYXJrZXIgYW9lIHRoYXQgY3JlYXRlcyBydWJibGVcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAvLyBUaGlzIHNob3VsZCBhbHdheXMgYmUgc2hhcmVkLiAgT24gYWxsIHRpbWVzIGJ1dCB0aGUgMm5kIGFuZCAzcmQsIGl0J3MgYSBwYXJ0eSBzaGFyZS5cclxuICAgIC8vIFRPRE86IG9uIHRoZSAybmQgYW5kIDNyZCB0aW1lIHRoaXMgc2hvdWxkIG9ubHkgYmUgc2hhcmVkIHdpdGggYSByb2NrLlxyXG4gICAgLy8gVE9ETzogYWx0ZXJuYXRpdmVseSB3YXJuIG9uIHRha2luZyBvbmUgb2YgdGhlc2Ugd2l0aCBhIDQ3MiBNYWdpYyBWdWxuZXJhYmlsaXR5IFVwIGVmZmVjdFxyXG4gICAgJ1RIRyBXaWxkIEFuZ3Vpc2gnOiAnNTIwOScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1RIRyBXaWxkIFJhbXBhZ2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc1MjA3JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICAvLyBUaGlzIGlzIHplcm8gZGFtYWdlIGlmIHlvdSBhcmUgaW4gdGhlIGNyYXRlci5cclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5Ib2xtaW5zdGVyU3dpdGNoLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIb2xtaW5zdGVyIFRodW1ic2NyZXcnOiAnM0RDNicsXHJcbiAgICAnSG9sbWluc3RlciBXb29kZW4gaG9yc2UnOiAnM0RDNycsXHJcbiAgICAnSG9sbWluc3RlciBMaWdodCBTaG90JzogJzNEQzgnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgSGVyZXRpY1xcJ3MgRm9yayc6ICczRENFJyxcclxuICAgICdIb2xtaW5zdGVyIEhvbHkgV2F0ZXInOiAnM0RENCcsXHJcbiAgICAnSG9sbWluc3RlciBGaWVyY2UgQmVhdGluZyAxJzogJzNEREQnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgRmllcmNlIEJlYXRpbmcgMic6ICczRERFJyxcclxuICAgICdIb2xtaW5zdGVyIEZpZXJjZSBCZWF0aW5nIDMnOiAnM0RERicsXHJcbiAgICAnSG9sbWluc3RlciBDYXQgT1xcJyBOaW5lIFRhaWxzJzogJzNERTEnLFxyXG4gICAgJ0hvbG1pbnN0ZXIgUmlnaHQgS25vdXQnOiAnM0RFNicsXHJcbiAgICAnSG9sbWluc3RlciBMZWZ0IEtub3V0JzogJzNERTcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0hvbG1pbnN0ZXIgQWV0aGVyc3VwJzogJzNERTknLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSG9sbWluc3RlciBGbGFnZWxsYXRpb24nOiAnM0RENicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdIb2xtaW5zdGVyIFRhcGhlcGhvYmlhJzogJzQxODEnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuTWFsaWthaHNXZWxsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdNYWxpa2FoIEZhbGxpbmcgUm9jayc6ICczQ0VBJyxcclxuICAgICdNYWxpa2FoIFdlbGxib3JlJzogJzNDRUQnLFxyXG4gICAgJ01hbGlrYWggR2V5c2VyIEVydXB0aW9uJzogJzNDRUUnLFxyXG4gICAgJ01hbGlrYWggU3dpZnQgU3BpbGwnOiAnM0NGMCcsXHJcbiAgICAnTWFsaWthaCBCcmVha2luZyBXaGVlbCAxJzogJzNDRjUnLFxyXG4gICAgJ01hbGlrYWggQ3J5c3RhbCBOYWlsJzogJzNDRjcnLFxyXG4gICAgJ01hbGlrYWggSGVyZXRpY1xcJ3MgRm9yayAxJzogJzNDRjknLFxyXG4gICAgJ01hbGlrYWggQnJlYWtpbmcgV2hlZWwgMic6ICczQ0ZBJyxcclxuICAgICdNYWxpa2FoIEhlcmV0aWNcXCdzIEZvcmsgMic6ICczRTBFJyxcclxuICAgICdNYWxpa2FoIEVhcnRoc2hha2UnOiAnM0UzOScsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IGNvdWxkIGluY2x1ZGUgNTQ4NCBNdWRtYW4gUm9ja3kgUm9sbCBhcyBhIHNoYXJlV2FybiwgYnV0IGl0J3MgbG93IGRhbWFnZSBhbmQgY29tbW9uLlxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1hdG95YXNSZWxpY3QsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ01hdG95YSBSZWxpY3QgV2VyZXdvb2QgT3ZhdGlvbic6ICc1NTE4JywgLy8gbGluZSBhb2VcclxuICAgICdNYXRveWEgQ2F2ZSBUYXJhbnR1bGEgSGF3ayBBcGl0b3hpbic6ICc1NTE5JywgLy8gYmlnIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgU3ByaWdnYW4gU3RvbmViZWFyZXIgUm9tcCc6ICc1NTFBJywgLy8gY29uYWwgYW9lXHJcbiAgICAnTWF0b3lhIFNvbm55IE9mIFppZ2d5IEppdHRlcmluZyBHbGFyZSc6ICc1NTFDJywgLy8gbG9uZyBuYXJyb3cgY29uYWwgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBRdWFnbWlyZSc6ICc1NDgxJywgLy8gTXVkbWFuIGFvZSBwdWRkbGVzXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBCcml0dGxlIEJyZWNjaWEgMSc6ICc1NDhFJywgLy8gZXhwYW5kaW5nIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgTXVkbWFuIEJyaXR0bGUgQnJlY2NpYSAyJzogJzU0OEYnLCAvLyBleHBhbmRpbmcgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNdWRtYW4gQnJpdHRsZSBCcmVjY2lhIDMnOiAnNTQ5MCcsIC8vIGV4cGFuZGluZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE11ZG1hbiBNdWQgQnViYmxlJzogJzU0ODcnLCAvLyBzdGFuZGluZyBpbiBtdWQgcHVkZGxlP1xyXG4gICAgJ01hdG95YSBDYXZlIFB1Z2lsIFNjcmV3ZHJpdmVyJzogJzU1MUUnLCAvLyBjb25hbCBhb2VcclxuICAgICdNYXRveWEgTml4aWUgR3VyZ2xlJzogJzU5OTInLCAvLyBOaXhpZSB3YWxsIGZsdXNoXHJcbiAgICAnTWF0b3lhIFJlbGljdCBNb2x0ZW4gUGhvZWJhZCBQeXJvY2xhc3RpYyBTaG90JzogJzU3RUInLCAvLyB0aGUgbGluZSBhb2VzIGFzIHlvdSBydW4gdG8gdHJhc2hcclxuICAgICdNYXRveWEgUmVsaWN0IEZsYW4gRmxvb2QnOiAnNTUyMycsIC8vIGJpZyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFB5cm9kdWN0IEVsZHRodXJzIE1hc2gnOiAnNTUyNycsIC8vIGxpbmUgYW9lXHJcbiAgICAnTWF0eW9hIFB5cm9kdWN0IEVsZHRodXJzIFNwaW4nOiAnNTUyOCcsIC8vIHZlcnkgbGFyZ2UgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgQmF2YXJvaXMgVGh1bmRlciBJSUknOiAnNTUyNScsIC8vIGNpcmNsZSBhb2VcclxuICAgICdNYXRveWEgUmVsaWN0IE1hcnNobWFsbG93IEFuY2llbnQgQWVybyc6ICc1NTI0JywgLy8gdmVyeSBsYXJnZSBsaW5lIGdyb2FvZVxyXG4gICAgJ01hdG95YSBSZWxpY3QgUHVkZGluZyBGaXJlIElJJzogJzU1MjInLCAvLyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBNb2x0ZW4gUGhvZWJhZCBIb3QgTGF2YSc6ICc1N0U5JywgLy8gY29uYWwgYW9lXHJcbiAgICAnTWF0b3lhIFJlbGljdCBNb2x0ZW4gUGhvZWJhZCBWb2xjYW5pYyBEcm9wJzogJzU3RTgnLCAvLyBjaXJjbGUgYW9lXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQb3J4aWUgTWVkaXVtIFJlYXInOiAnNTkxRCcsIC8vIGtub2NrYmFjayBpbnRvIHNhZmUgY2lyY2xlIGFvZVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIEJhcmJlcXVlIExpbmUnOiAnNTkxNycsIC8vIGxpbmUgYW9lIGR1cmluZyBiYnFcclxuICAgICdNYXRveWEgTW90aGVyIFBvcnhpZSBCYXJiZXF1ZSBDaXJjbGUnOiAnNTkxOCcsIC8vIGNpcmNsZSBhb2UgZHVyaW5nIGJicVxyXG4gICAgJ01hdG95YSBNb3RoZXIgUG9yeGllIFRvIEEgQ3Jpc3AnOiAnNTkyNScsIC8vIGdldHRpbmcgdG8gY2xvc2UgdG8gYm9zcyBkdXJpbmcgYmJxXHJcbiAgICAnTWF0b3lhIE1vdGhlciBQcm94aWUgQnVmZmV0JzogJzU5MjYnLCAvLyBBZW9saWFuIENhdmUgU3ByaXRlIGxpbmUgYW9lIChpcyB0aGlzIGEgcHVuPylcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdNYXRveWEgTml4aWUgU2VhIFNoYW50eSc6ICc1OThDJywgLy8gTm90IHRha2luZyB0aGUgcHVkZGxlIHVwIHRvIHRoZSB0b3A/IEZhaWxpbmcgYWRkIGVucmFnZT9cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ01hdG95YSBOaXhpZSBDcmFjayc6ICc1OTkwJywgLy8gTml4aWUgQ3Jhc2gtU21hc2ggdGFuayB0ZXRoZXJzXHJcbiAgICAnTWF0b3lhIE5peGllIFNwdXR0ZXInOiAnNTk5MycsIC8vIE5peGllIHNwcmVhZCBtYXJrZXJcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk10R3VsZyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnR3VsZyBJbW1vbGF0aW9uJzogJzQxQUEnLFxyXG4gICAgJ0d1bGcgVGFpbCBTbWFzaCc6ICc0MUFCJyxcclxuICAgICdHdWxnIEhlYXZlbnNsYXNoJzogJzQxQTknLFxyXG4gICAgJ0d1bGcgVHlwaG9vbiBXaW5nIDEnOiAnM0QwMCcsXHJcbiAgICAnR3VsZyBUeXBob29uIFdpbmcgMic6ICczRDAxJyxcclxuICAgICdHdWxnIEh1cnJpY2FuZSBXaW5nJzogJzNEMDMnLFxyXG4gICAgJ0d1bGcgRWFydGggU2hha2VyJzogJzM3RjUnLFxyXG4gICAgJ0d1bGcgU2FuY3RpZmljYXRpb24nOiAnNDFBRScsXHJcbiAgICAnR3VsZyBFeGVnZXNpcyc6ICczRDA3JyxcclxuICAgICdHdWxnIFBlcmZlY3QgQ29udHJpdGlvbic6ICczRDBFJyxcclxuICAgICdHdWxnIFNhbmN0aWZpZWQgQWVybyc6ICc0MUFEJyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDEnOiAnM0QxNicsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyAyJzogJzNEMTgnLFxyXG4gICAgJ0d1bGcgRGl2aW5lIERpbWludWVuZG8gMyc6ICc0NjY5JyxcclxuICAgICdHdWxnIERpdmluZSBEaW1pbnVlbmRvIDQnOiAnM0QxOScsXHJcbiAgICAnR3VsZyBEaXZpbmUgRGltaW51ZW5kbyA1JzogJzNEMjEnLFxyXG4gICAgJ0d1bGcgQ29udmljdGlvbiBNYXJjYXRvIDEnOiAnM0QxQScsXHJcbiAgICAnR3VsZyBDb252aWN0aW9uIE1hcmNhdG8gMic6ICczRDFCJyxcclxuICAgICdHdWxnIENvbnZpY3Rpb24gTWFyY2F0byAzJzogJzNEMjAnLFxyXG4gICAgJ0d1bGcgVmVuYSBBbW9yaXMnOiAnM0QyNycsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnR3VsZyBMdW1lbiBJbmZpbml0dW0nOiAnNDFCMicsXHJcbiAgICAnR3VsZyBSaWdodCBQYWxtJzogJzM3RjgnLFxyXG4gICAgJ0d1bGcgTGVmdCBQYWxtJzogJzM3RkEnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBXaGF0IHRvIGRvIGFib3V0IEthaG4gUmFpIDVCNTA/XHJcbi8vIEl0IHNlZW1zIGltcG9zc2libGUgZm9yIHRoZSBtYXJrZWQgcGVyc29uIHRvIGF2b2lkIGVudGlyZWx5LlxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlBhZ2x0aGFuLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdQYWdsdGhhbiBUZWxvdm91aXZyZSBQbGFndWUgU3dpcGUnOiAnNjBGQycsIC8vIGZyb250YWwgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTGVzc2VyIFRlbG9kcmFnb24gRW5ndWxmaW5nIEZsYW1lcyc6ICc2MEY1JywgLy8gZnJvbnRhbCBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIExpZ2h0bmluZyBCb2x0JzogJzVDNEMnLCAvLyBjaXJjdWxhciBsaWdodG5pbmcgYW9lIChvbiBzZWxmIG9yIHBvc3QpXHJcbiAgICAnUGFnbHRoYW4gQW1odWx1ayBCYWxsIE9mIExldmluIFNob2NrJzogJzVDNTInLCAvLyBwdWxzaW5nIHNtYWxsIGNpcmN1bGFyIGFvZXNcclxuICAgICdQYWdsdGhhbiBBbWh1bHVrIFN1cGVyY2hhcmdlZCBCYWxsIE9mIExldmluIFNob2NrJzogJzVDNTMnLCAvLyBwdWxzaW5nIGxhcmdlIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIEFtaHVsdWsgV2lkZSBCbGFzdGVyJzogJzYwQzUnLCAvLyByZWFyIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG9icm9iaW55YWsgRmFsbCBPZiBNYW4nOiAnNjE0OCcsIC8vIGNpcmN1bGFyIGFvZVxyXG4gICAgJ1BhZ2x0aGFuIFRlbG90ZWsgUmVhcGVyIE1hZ2l0ZWsgQ2Fubm9uJzogJzYxMjEnLCAvLyBjaXJjdWxhciBhb2VcclxuICAgICdQYWdsdGhhbiBUZWxvZHJhZ29uIFNoZWV0IG9mIEljZSc6ICc2MEY4JywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb2RyYWdvbiBGcm9zdCBCcmVhdGgnOiAnNjBGNycsIC8vIHZlcnkgbGFyZ2UgY29uYWwgY2xlYXZlXHJcbiAgICAnUGFnbHRoYW4gTWFnaXRlayBDb3JlIFN0YWJsZSBDYW5ub24nOiAnNUM5NCcsIC8vIGxhcmdlIGxpbmUgYW9lc1xyXG4gICAgJ1BhZ2x0aGFuIE1hZ2l0ZWsgQ29yZSAyLVRvbnplIE1hZ2l0ZWsgTWlzc2lsZSc6ICc1Qzk1JywgLy8gbGFyZ2UgY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gVGVsb3RlayBTa3kgQXJtb3IgQWV0aGVyc2hvdCc6ICc1QzlDJywgLy8gY2lyY3VsYXIgYW9lXHJcbiAgICAnUGFnbHRoYW4gTWFyayBJSSBUZWxvdGVrIENvbG9zc3VzIEV4aGF1c3QnOiAnNUM5OScsIC8vIGxhcmdlIGxpbmUgYW9lXHJcbiAgICAnUGFnbHRoYW4gTWFnaXRlayBNaXNzaWxlIEV4cGxvc2l2ZSBGb3JjZSc6ICc1Qzk4JywgLy8gc2xvdyBtb3ZpbmcgaG9yaXpvbnRhbCBtaXNzaWxlc1xyXG4gICAgJ1BhZ2x0aGFuIFRpYW1hdCBGbGFtaXNwaGVyZSc6ICc2MTBGJywgLy8gdmVyeSBsb25nIGxpbmUgYW9lXHJcbiAgICAnUGFnbHRoYW4gQXJtb3JlZCBUZWxvZHJhZ29uIFRvcnRvaXNlIFN0b21wJzogJzYxNEInLCAvLyBsYXJnZSBjaXJjdWxhciBhb2UgZnJvbSB0dXJ0bGVcclxuICAgICdQYWdsdGhhbiBUZWxvZHJhZ29uIFRodW5kZXJvdXMgQnJlYXRoJzogJzYxNDknLCAvLyBsYXJnZSBjb25hbCBjbGVhdmVcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IEx1bmFyIE5haWwgVXBidXJzdCc6ICc2MDVCJywgLy8gc21hbGwgYW9lcyBiZWZvcmUgQmlnIEJ1cnN0XHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBMdW5hciBOYWlsIEJpZyBCdXJzdCc6ICc1QjQ4JywgLy8gbGFyZ2UgY2lyY3VsYXIgYW9lcyBmcm9tIG5haWxzXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBQZXJpZ2VhbiBCcmVhdGgnOiAnNUI1OScsIC8vIGxhcmdlIGNvbmFsIGNsZWF2ZVxyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTWVnYWZsYXJlJzogJzVCNEUnLCAvLyBtZWdhZmxhcmUgcGVwcGVyb25pXHJcbiAgICAnUGFnbHRoYW4gTHVuYXIgQmFoYW11dCBNZWdhZmxhcmUgRGl2ZSc6ICc1QjUyJywgLy8gbWVnYWZsYXJlIGxpbmUgYW9lIGFjcm9zcyB0aGUgYXJlbmFcclxuICAgICdQYWdsdGhhbiBMdW5hciBCYWhhbXV0IEx1bmFyIEZsYXJlJzogJzVCNEEnLCAvLyBsYXJnZSBwdXJwbGUgc2hyaW5raW5nIGNpcmNsZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ1BhZ2x0aGFuIEx1bmFyIEJhaGFtdXQgTWVnYWZsYXJlJzogJzVCNEQnLCAvLyBtZWdhZmxhcmUgc3ByZWFkIG1hcmtlcnNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVFpdGFuYVJhdmVsLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdRaXRhbmEgU3VuIFRvc3MnOiAnM0M4QScsIC8vIEdyb3VuZCBBb0UsIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIFJvbmthbiBMaWdodCAxJzogJzNDOEMnLCAvLyBTdGF0dWUgYXR0YWNrLCBib3NzIG9uZVxyXG4gICAgJ1FpdGFuYSBMb3phdGxcXCdzIEZ1cnkgMSc6ICczQzhGJywgLy8gU2VtaWNpcmNsZSBjbGVhdmUsIGJvc3Mgb25lXHJcbiAgICAnUWl0YW5hIExvemF0bFxcJ3MgRnVyeSAyJzogJzNDOTAnLCAvLyBTZW1pY2lyY2xlIGNsZWF2ZSwgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgRmFsbGluZyBSb2NrJzogJzNDOTYnLCAvLyBTbWFsbCBncm91bmQgQW9FLCBib3NzIHR3b1xyXG4gICAgJ1FpdGFuYSBGYWxsaW5nIEJvdWxkZXInOiAnM0M5NycsIC8vIExhcmdlIGdyb3VuZCBBb0UsIGJvc3MgdHdvXHJcbiAgICAnUWl0YW5hIFRvd2VyZmFsbCc6ICczQzk4JywgLy8gUGlsbGFyIGNvbGxhcHNlLCBib3NzIHR3b1xyXG4gICAgJ1FpdGFuYSBWaXBlciBQb2lzb24gMic6ICczQzlFJywgLy8gU3RhdGlvbmFyeSBwb2lzb24gcHVkZGxlcywgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDEnOiAnM0NBMicsIC8vIERhbmdlcm91cyBtaWRkbGUgZHVyaW5nIHNwcmVhZCBjaXJjbGVzLCBib3NzIHRocmVlXHJcbiAgICAnUWl0YW5hIENvbmZlc3Npb24gb2YgRmFpdGggMyc6ICczQ0E2JywgLy8gRGFuZ2Vyb3VzIHNpZGVzIGR1cmluZyBzdGFjayBtYXJrZXIsIGJvc3MgdGhyZWVcclxuICAgICdRaXRhbmEgQ29uZmVzc2lvbiBvZiBGYWl0aCA0JzogJzNDQTcnLCAvLyBEYW5nZXJvdXMgc2lkZXMgZHVyaW5nIHN0YWNrIG1hcmtlciwgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBSb25rYW4gTGlnaHQgMic6ICczRDZEJywgLy8gU3RhdHVlIGF0dGFjaywgYm9zcyBvbmVcclxuICAgICdRaXRhbmEgV3JhdGggb2YgdGhlIFJvbmthJzogJzNFMkMnLCAvLyBTdGF0dWUgbGluZSBhdHRhY2sgZnJvbSBtaW5pLWJvc3NlcyBiZWZvcmUgZmlyc3QgYm9zc1xyXG4gICAgJ1FpdGFuYSBTaW5zcGl0dGVyJzogJzNFMzYnLCAvLyBHb3JpbGxhIGJvdWxkZXIgdG9zcyBBb0UgYmVmb3JlIHRoaXJkIGJvc3NcclxuICAgICdRaXRhbmEgSG91bmQgb3V0IG9mIEhlYXZlbic6ICc0MkI4JywgLy8gVGV0aGVyIGV4dGVuc2lvbiBmYWlsdXJlLCBib3NzIHRocmVlOyA0MkI3IGlzIGNvcnJlY3QgZXhlY3V0aW9uXHJcbiAgICAnUWl0YW5hIFJvbmthbiBBYnlzcyc6ICc0M0VCJywgLy8gR3JvdW5kIEFvRSBmcm9tIG1pbmktYm9zc2VzIGJlZm9yZSBmaXJzdCBib3NzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdRaXRhbmEgVmlwZXIgUG9pc29uIDEnOiAnM0M5RCcsIC8vIEFvRSBmcm9tIHRoZSAwMEFCIHBvaXNvbiBoZWFkIG1hcmtlciwgYm9zcyB0aHJlZVxyXG4gICAgJ1FpdGFuYSBDb25mZXNzaW9uIG9mIEZhaXRoIDInOiAnM0NBMycsIC8vIE92ZXJsYXBwZWQgY2lyY2xlcyBmYWlsdXJlIG9uIHRoZSBzcHJlYWQgY2lyY2xlcyB2ZXJzaW9uIG9mIHRoZSBtZWNoYW5pY1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUaGUgR3JhbmQgQ29zbW9zXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVHcmFuZENvc21vcyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnQ29zbW9zIElyb24gSnVzdGljZSc6ICc0OTFGJyxcclxuICAgICdDb3Ntb3MgU21pdGUgT2YgUmFnZSc6ICc0OTIxJyxcclxuXHJcbiAgICAnQ29zbW9zIFRyaWJ1bGF0aW9uJzogJzQ5QTQnLFxyXG4gICAgJ0Nvc21vcyBEYXJrIFNob2NrJzogJzQ3NkYnLFxyXG4gICAgJ0Nvc21vcyBTd2VlcCc6ICc0NzcwJyxcclxuICAgICdDb3Ntb3MgRGVlcCBDbGVhbic6ICc0NzcxJyxcclxuXHJcbiAgICAnQ29zbW9zIFNoYWRvdyBCdXJzdCc6ICc0OTI0JyxcclxuICAgICdDb3Ntb3MgQmxvb2R5IENhcmVzcyc6ICc0OTI3JyxcclxuICAgICdDb3Ntb3MgTmVwZW50aGljIFBsdW5nZSc6ICc0OTI4JyxcclxuICAgICdDb3Ntb3MgQnJld2luZyBTdG9ybSc6ICc0OTI5JyxcclxuXHJcbiAgICAnQ29zbW9zIE9kZSBUbyBGYWxsZW4gUGV0YWxzJzogJzQ5NTAnLFxyXG4gICAgJ0Nvc21vcyBGYXIgV2luZCBHcm91bmQnOiAnNDI3MycsXHJcblxyXG4gICAgJ0Nvc21vcyBGaXJlIEJyZWF0aCc6ICc0OTJCJyxcclxuICAgICdDb3Ntb3MgUm9ua2FuIEZyZWV6ZSc6ICc0OTJFJyxcclxuICAgICdDb3Ntb3MgT3ZlcnBvd2VyJzogJzQ5MkQnLFxyXG5cclxuICAgICdDb3Ntb3MgU2NvcmNoaW5nIExlZnQnOiAnNDc2MycsXHJcbiAgICAnQ29zbW9zIFNjb3JjaGluZyBSaWdodCc6ICc0NzYyJyxcclxuICAgICdDb3Ntb3MgT3RoZXJ3b3JkbHkgSGVhdCc6ICc0NzVDJyxcclxuICAgICdDb3Ntb3MgRmlyZVxcJ3MgSXJlJzogJzQ3NjEnLFxyXG4gICAgJ0Nvc21vcyBQbHVtbWV0JzogJzQ3NjcnLFxyXG5cclxuICAgICdDb3Ntb3MgRmlyZVxcJ3MgRG9tYWluIFRldGhlcic6ICc0NzVGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0Nvc21vcyBEYXJrIFdlbGwnOiAnNDc2RCcsXHJcbiAgICAnQ29zbW9zIEZhciBXaW5kIFNwcmVhZCc6ICc0NzI0JyxcclxuICAgICdDb3Ntb3MgQmxhY2sgRmxhbWUnOiAnNDc1RCcsXHJcbiAgICAnQ29zbW9zIEZpcmVcXCdzIERvbWFpbic6ICc0NzYwJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZVR3aW5uaW5nLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUd2lubmluZyBBdXRvIENhbm5vbnMnOiAnNDNBOScsXHJcbiAgICAnVHdpbm5pbmcgSGVhdmUnOiAnM0RCOScsXHJcbiAgICAnVHdpbm5pbmcgMzIgVG9uemUgU3dpcGUnOiAnM0RCQicsXHJcbiAgICAnVHdpbm5pbmcgU2lkZXN3aXBlJzogJzNEQkYnLFxyXG4gICAgJ1R3aW5uaW5nIFdpbmQgU3BvdXQnOiAnM0RCRScsXHJcbiAgICAnVHdpbm5pbmcgU2hvY2snOiAnM0RGMScsXHJcbiAgICAnVHdpbm5pbmcgTGFzZXJibGFkZSc6ICczREVDJyxcclxuICAgICdUd2lubmluZyBWb3JwYWwgQmxhZGUnOiAnM0RDMicsXHJcbiAgICAnVHdpbm5pbmcgVGhyb3duIEZsYW1lcyc6ICczREMzJyxcclxuICAgICdUd2lubmluZyBNYWdpdGVrIFJheSc6ICczREYzJyxcclxuICAgICdUd2lubmluZyBIaWdoIEdyYXZpdHknOiAnM0RGQScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVHdpbm5pbmcgMTI4IFRvbnplIFN3aXBlJzogJzNEQkEnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IERlYWQgSXJvbiA1QUIwIChlYXJ0aHNoYWtlcnMsIGJ1dCBvbmx5IGlmIHlvdSB0YWtlIHR3bz8pXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRGVsdWJydW1SZWdpbmFlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY3kgRm91cmZvbGQnOiAnNUIzNCcsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBCYWxlZnVsIFN3YXRoZSc6ICc1QUI0JywgLy8gR3JvdW5kIGFvZSB0byBlaXRoZXIgc2lkZSBvZiBib3NzXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIEJhbGVmdWwgQmxhZGUnOiAnNUIyOCcsIC8vIEhpZGUgYmVoaW5kIHBpbGxhcnMgYXR0YWNrXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAxJzogJzVBQTQnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAyJzogJzVBQTUnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAzJzogJzVBQTYnLCAvLyBCbHVlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMSc6ICc1QUE3JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAyJzogJzVBQTgnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDMnOiAnNUFBOScsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW0gU2Vla2VyIFNjb3JjaGluZyBTaGFja2xlJzogJzVBQUUnLCAvLyBDaGFpbiBkYW1hZ2VcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY2lmdWwgQnJlZXplJzogJzVBQUInLCAvLyBXYWZmbGUgY3Jpc3MtY3Jvc3MgZmxvb3IgbWFya2Vyc1xyXG4gICAgJ0RlbHVicnVtIFNlZWtlciBNZXJjaWZ1bCBCbG9vbXMnOiAnNUFBRCcsIC8vIFB1cnBsZSBncm93aW5nIGNpcmNsZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgUmlnaHQtU2lkZWQgU2hvY2t3YXZlJzogJzU3NjEnLCAvLyBSaWdodCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBEYWh1IExlZnQtU2lkZWQgU2hvY2t3YXZlJzogJzU3NjInLCAvLyBMZWZ0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIERhaHUgRmlyZWJyZWF0aGUnOiAnNTc2NScsIC8vIENvbmFsIGJyZWF0aFxyXG4gICAgJ0RlbHVicnVtIERhaHUgRmlyZWJyZWF0aGUgUm90YXRpbmcnOiAnNTc1QScsIC8vIENvbmFsIGJyZWF0aCwgcm90YXRpbmdcclxuICAgICdEZWx1YnJ1bSBEYWh1IEhlYWQgRG93bic6ICc1NzU2JywgLy8gbGluZSBhb2UgY2hhcmdlIGZyb20gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bSBEYWh1IEh1bnRlclxcJ3MgQ2xhdyc6ICc1NzU3JywgLy8gY2lyY3VsYXIgZ3JvdW5kIGFvZSBjZW50ZXJlZCBvbiBNYXJjaG9zaWFzIGFkZFxyXG4gICAgJ0RlbHVicnVtIERhaHUgRmFsbGluZyBSb2NrJzogJzU3NUMnLCAvLyBncm91bmQgYW9lIGZyb20gUmV2ZXJiZXJhdGluZyBSb2FyXHJcbiAgICAnRGVsdWJydW0gRGFodSBIb3QgQ2hhcmdlJzogJzU3NjQnLCAvLyBkb3VibGUgY2hhcmdlXHJcbiAgICAnRGVsdWJydW0gRGFodSBSaXBwZXIgQ2xhdyc6ICc1NzVEJywgLy8gZnJvbnRhbCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBEYWh1IFRhaWwgU3dpbmcnOiAnNTc1RicsIC8vIHRhaWwgc3dpbmcgOylcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBQYXduIE9mZic6ICc1ODA2JywgLy8gUXVlZW4ncyBTb2xkaWVyIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lXHJcbiAgICAnRGVsdWJydW0gR3VhcmQgVHVycmV0XFwncyBUb3VyIDEnOiAnNTgwRCcsIC8vIFF1ZWVuJ3MgR3VubmVyIHJlZmxlY3RpdmUgdHVycmV0IHNob3RcclxuICAgICdEZWx1YnJ1bSBHdWFyZCBUdXJyZXRcXCdzIFRvdXIgMic6ICc1ODBFJywgLy8gUXVlZW4ncyBHdW5uZXIgcmVmbGVjdGl2ZSB0dXJyZXQgc2hvdFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIFR1cnJldFxcJ3MgVG91ciAzJzogJzU4MEYnLCAvLyBRdWVlbidzIEd1bm5lciByZWZsZWN0aXZlIHR1cnJldCBzaG90XHJcbiAgICAnRGVsdWJydW0gR3VhcmQgT3B0aW1hbCBQbGF5IFNoaWVsZCc6ICc1N0YzJywgLy8gUXVlZW4ncyBLbmlnaHQgc2hpZWxkIGdldCB1bmRlclxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIE9wdGltYWwgUGxheSBTd29yZCc6ICc1N0YyJywgLy8gUXVlZW4ncyBLbmlnaHQgc3dvcmQgZ2V0IG91dFxyXG4gICAgJ0RlbHVicnVtIEd1YXJkIENvdW50ZXJwbGF5JzogJzU3RjYnLCAvLyBIaXR0aW5nIGFldGhlcmlhbCB3YXJkIGRpcmVjdGlvbmFsIGJhcnJpZXJcclxuICAgICdEZWx1YnJ1bSBQaGFudG9tIFN3aXJsaW5nIE1pYXNtYSAxJzogJzU3QTknLCAvLyBJbml0aWFsIHBoYW50b20gZG9udXQgYW9lIGZyb20gY2lyY2xlXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMic6ICc1N0FBJywgLy8gTW92aW5nIHBoYW50b20gZG9udXQgYW9lcyBmcm9tIGNpcmNsZVxyXG4gICAgJ0RlbHVicnVtIFBoYW50b20gQ3JlZXBpbmcgTWlhc21hJzogJzU3QTUnLCAvLyBwaGFudG9tIGxpbmUgYW9lIGZyb20gc3F1YXJlXHJcbiAgICAnRGVsdWJydW0gUGhhbnRvbSBWaWxlIFdhdmUnOiAnNTdCMScsIC8vIHBoYW50b20gY29uYWwgYW9lXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIEZ1cnkgT2YgQm96amEnOiAnNTk3MycsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwib3V0XCJcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgRmxhc2h2YW5lJzogJzU5NzInLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBiZWhpbmRcIlxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBJbmZlcm5hbCBTbGFzaCc6ICc1OTcxJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgZnJvbnRcIlxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBGbGFtZXMgT2YgQm96amEnOiAnNTk2OCcsIC8vIDgwJSBmbG9vciBhb2UgYmVmb3JlIHNoaW1tZXJpbmcgc2hvdCBzd29yZHNcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgR2xlYW1pbmcgQXJyb3cnOiAnNTk3NCcsIC8vIFRyaW5pdHkgQXZhdGFyIGxpbmUgYW9lcyBmcm9tIG91dHNpZGVcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgTWVhbnMgMSc6ICc1OUJCJywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVGhlIE1lYW5zIDInOiAnNTlCRCcsIC8vIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFRoZSBFbmQgMSc6ICc1OUJBJywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBUaGUgRW5kIDInOiAnNTlCQycsIC8vIEFsc28gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gTm9ydGhzd2FpblxcJ3MgR2xvdyc6ICc1OUM0JywgLy8gZXhwYW5kaW5nIGxpbmVzIHdpdGggZXhwbG9zaW9uIGludGVyc2VjdGlvbnNcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBKdWRnbWVudCBCbGFkZSBMZWZ0JzogJzVCODMnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggbGVmdCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bSBRdWVlbiBKdWRnbWVudCBCbGFkZSBSaWdodCc6ICc1QjgzJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIHJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIFF1ZWVuXFwncyBKdXN0aWNlJzogJzU5QkYnLCAvLyBmYWlsaW5nIHRvIHdhbGsgdGhlIHJpZ2h0IG51bWJlciBvZiBzcXVhcmVzXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVHVycmV0XFwncyBUb3VyIDEnOiAnNTlFMCcsIC8vIHJlZmxlY3RpdmUgdHVycmV0IHNob3QgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVHVycmV0XFwncyBUb3VyIDInOiAnNTlFMScsIC8vIHJlZmxlY3RpdmUgdHVycmV0IHNob3QgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gVHVycmV0XFwncyBUb3VyIDMnOiAnNTlFMicsIC8vIHJlZmxlY3RpdmUgdHVycmV0IHNob3QgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gUGF3biBPZmYnOiAnNTlEQScsIC8vIFNlY3JldHMgUmV2ZWFsZWQgdGV0aGVyZWQgY2xvbmUgYW9lIGR1cmluZyBRdWVlblxyXG4gICAgJ0RlbHVicnVtIFF1ZWVuIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNTlDRScsIC8vIFF1ZWVuJ3MgS25pZ2h0IHNoaWVsZCBnZXQgdW5kZXIgZHVyaW5nIFF1ZWVuXHJcbiAgICAnRGVsdWJydW0gUXVlZW4gT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU5Q0MnLCAvLyBRdWVlbidzIEtuaWdodCBzd29yZCBnZXQgb3V0IGR1cmluZyBRdWVlblxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RlbHVicnVtIEhpZGRlbiBUcmFwIE1hc3NpdmUgRXhwbG9zaW9uJzogJzVBNkUnLCAvLyBleHBsb3Npb24gdHJhcFxyXG4gICAgJ0RlbHVicnVtIEhpZGRlbiBUcmFwIFBvaXNvbiBUcmFwJzogJzVBNkYnLCAvLyBwb2lzb24gdHJhcFxyXG4gICAgJ0RlbHVicnVtIEF2b3dlZCBIZWF0IFNob2NrJzogJzU5NUUnLCAvLyB0b28gbXVjaCBoZWF0IG9yIGZhaWxpbmcgdG8gcmVndWxhdGUgdGVtcGVyYXR1cmVcclxuICAgICdEZWx1YnJ1bSBBdm93ZWQgQ29sZCBTaG9jayc6ICc1OTVGJywgLy8gdG9vIG11Y2ggY29sZCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdEZWx1YnJ1bSBTZWVrZXIgTWVyY2lmdWwgTW9vbic6ICcyNjInLCAvLyBcIlBldHJpZmljYXRpb25cIiBmcm9tIEFldGhlcmlhbCBPcmIgbG9va2F3YXlcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0RlbHVicnVtIERhaHUgSGVhdCBCcmVhdGgnOiAnNTc2NicsIC8vIHRhbmsgY2xlYXZlXHJcbiAgICAnRGVsdWJydW0gQXZvd2VkIFdyYXRoIE9mIEJvemphJzogJzU5NzUnLCAvLyB0YW5rIGNsZWF2ZVxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gQXQgbGVhc3QgZHVyaW5nIFRoZSBRdWVlbiwgdGhlc2UgYWJpbGl0eSBpZHMgY2FuIGJlIG9yZGVyZWQgZGlmZmVyZW50bHksXHJcbiAgICAgIC8vIGFuZCB0aGUgZmlyc3QgZXhwbG9zaW9uIFwiaGl0c1wiIGV2ZXJ5b25lLCBhbHRob3VnaCB3aXRoIFwiMUJcIiBmbGFncy5cclxuICAgICAgaWQ6ICdEZWx1YnJ1bSBMb3RzIENhc3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNTY1QScsICc1NjVCJywgJzU3RkQnLCAnNTdGRScsICc1Qjg2JywgJzVCODcnLCAnNTlEMicsICc1RDkzJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMuZmxhZ3Muc2xpY2UoLTIpID09PSAnMDMnLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IERhaHUgNTc3NiBTcGl0IEZsYW1lIHNob3VsZCBhbHdheXMgaGl0IGEgTWFyY2hvc2lhc1xyXG4vLyBUT0RPOiBoaXR0aW5nIHBoYW50b20gd2l0aCBpY2Ugc3Bpa2VzIHdpdGggYW55dGhpbmcgYnV0IGRpc3BlbD9cclxuLy8gVE9ETzogZmFpbGluZyBpY3kvZmllcnkgcG9ydGVudCAoZ3VhcmQgYW5kIHF1ZWVuKVxyXG4vLyAgICAgICBgMTg6UHlyZXRpYyBEb1QgVGljayBvbiAke25hbWV9IGZvciAke2RhbWFnZX0gZGFtYWdlLmBcclxuLy8gVE9ETzogV2luZHMgT2YgRmF0ZSAvIFdlaWdodCBPZiBGb3J0dW5lP1xyXG4vLyBUT0RPOiBUdXJyZXQncyBUb3VyP1xyXG4vLyBnZW5lcmFsIHRyYXBzOiBleHBsb3Npb246IDVBNzEsIHBvaXNvbiB0cmFwOiA1QTcyLCBtaW5pOiA1QTczXHJcbi8vIGR1ZWwgdHJhcHM6IG1pbmk6IDU3QTEsIGljZTogNTc5RiwgdG9hZDogNTdBMFxyXG4vLyBUT0RPOiB0YWtpbmcgbWFuYSBmbGFtZSB3aXRob3V0IHJlZmxlY3RcclxuLy8gVE9ETzogdGFraW5nIE1hZWxzdHJvbSdzIEJvbHQgd2l0aG91dCBsaWdodG5pbmcgYnVmZlxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkRlbHVicnVtUmVnaW5hZVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIFNsaW1lcyBIZWxsaXNoIFNsYXNoJzogJzU3RUEnLCAvLyBCb3pqYW4gU29sZGllciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgU2xpbWVzIFZpc2NvdXMgUnVwdHVyZSc6ICc1MDE2JywgLy8gRnVsbHkgbWVyZ2VkIHZpc2NvdXMgc2xpbWUgYW9lXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBHb2xlbXMgRGVtb2xpc2gnOiAnNTg4MCcsIC8vIGludGVycnVwdGlibGUgUnVpbnMgR29sZW0gY2FzdFxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBTd2F0aGUnOiAnNUFEMScsIC8vIEdyb3VuZCBhb2UgdG8gZWl0aGVyIHNpZGUgb2YgYm9zc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBCYWxlZnVsIEJsYWRlJzogJzVCMkEnLCAvLyBIaWRlIGJlaGluZCBwaWxsYXJzIGF0dGFja1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBTY29yY2hpbmcgU2hhY2tsZSc6ICc1QUNCJywgLy8gQ2hhaW5zXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDEnOiAnNUI5NCcsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCAyJzogJzVBQjknLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY3kgRm91cmZvbGQgMyc6ICc1QUJBJywgLy8gRm91ciBnbG93aW5nIHN3b3JkIGhhbGYgcm9vbSBjbGVhdmVzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmN5IEZvdXJmb2xkIDQnOiAnNUFCQicsIC8vIEZvdXIgZ2xvd2luZyBzd29yZCBoYWxmIHJvb20gY2xlYXZlc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBNZXJjeSBGb3VyZm9sZCA1JzogJzVBQkMnLCAvLyBGb3VyIGdsb3dpbmcgc3dvcmQgaGFsZiByb29tIGNsZWF2ZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgTWVyY2lmdWwgQnJlZXplJzogJzVBQzgnLCAvLyBXYWZmbGUgY3Jpc3MtY3Jvc3MgZmxvb3IgbWFya2Vyc1xyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBCYWxlZnVsIENvbWV0JzogJzVBRDcnLCAvLyBDbG9uZSBtZXRlb3IgZHJvcHBpbmcgYmVmb3JlIGNoYXJnZXNcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgQmFsZWZ1bCBGaXJlc3Rvcm0nOiAnNUFEOCcsIC8vIENsb25lIGNoYXJnZSBhZnRlciBCYWxlZnVsIENvbWV0XHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gUm9zZSc6ICc1QUQ5JywgLy8gQ2xvbmUgbGluZSBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgQmx1ZSAxJzogJzVBQzEnLCAvLyBCbHVlIHJpbiBnIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMic6ICc1QUMyJywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIEJsdWUgMyc6ICc1QUMzJywgLy8gQmx1ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBJcm9uIFNwbGl0dGVyIFdoaXRlIDEnOiAnNUFDNCcsIC8vIFdoaXRlIHJpbmcgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIElyb24gU3BsaXR0ZXIgV2hpdGUgMic6ICc1QUM1JywgLy8gV2hpdGUgcmluZyBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgSXJvbiBTcGxpdHRlciBXaGl0ZSAzJzogJzVBQzYnLCAvLyBXaGl0ZSByaW5nIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFNlZWtlciBBY3QgT2YgTWVyY3knOiAnNUFDRicsIC8vIGNyb3NzLXNoYXBlZCBsaW5lIGFvZXNcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBSaWdodC1TaWRlZCBTaG9ja3dhdmUgMSc6ICc1NzcwJywgLy8gUmlnaHQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBSaWdodC1TaWRlZCBTaG9ja3dhdmUgMic6ICc1NzcyJywgLy8gUmlnaHQgY2lyY3VsYXIgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBMZWZ0LVNpZGVkIFNob2Nrd2F2ZSAxJzogJzU3NkYnLCAvLyBMZWZ0IGNpcmN1bGFyIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgTGVmdC1TaWRlZCBTaG9ja3dhdmUgMic6ICc1NzcxJywgLy8gTGVmdCBjaXJjdWxhciBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEZpcmVicmVhdGhlJzogJzU3NzQnLCAvLyBDb25hbCBicmVhdGhcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEZpcmVicmVhdGhlIFJvdGF0aW5nJzogJzU3NkMnLCAvLyBDb25hbCBicmVhdGgsIHJvdGF0aW5nXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBIZWFkIERvd24nOiAnNTc2OCcsIC8vIGxpbmUgYW9lIGNoYXJnZSBmcm9tIE1hcmNob3NpYXMgYWRkXHJcbiAgICAnRGVsdWJydW1TYXYgRGFodSBIdW50ZXJcXCdzIENsYXcnOiAnNTc2OScsIC8vIGNpcmN1bGFyIGdyb3VuZCBhb2UgY2VudGVyZWQgb24gTWFyY2hvc2lhcyBhZGRcclxuICAgICdEZWx1YnJ1bVNhdiBEYWh1IEZhbGxpbmcgUm9jayc6ICc1NzZFJywgLy8gZ3JvdW5kIGFvZSBmcm9tIFJldmVyYmVyYXRpbmcgUm9hclxyXG4gICAgJ0RlbHVicnVtU2F2IERhaHUgSG90IENoYXJnZSc6ICc1NzczJywgLy8gZG91YmxlIGNoYXJnZVxyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIE1hc3NpdmUgRXhwbG9zaW9uJzogJzU3OUUnLCAvLyBib21icyBiZWluZyBjbGVhcmVkXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBWaWNpb3VzIFN3aXBlJzogJzU3OTcnLCAvLyBjaXJjdWxhciBhb2UgYXJvdW5kIGJvc3NcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIEZvY3VzZWQgVHJlbW9yIDEnOiAnNTc4RicsIC8vIHNxdWFyZSBmbG9vciBhb2VzXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGb2N1c2VkIFRyZW1vciAyJzogJzU3OTEnLCAvLyBzcXVhcmUgZmxvb3IgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IER1ZWwgRGV2b3VyJzogJzU3ODknLCAvLyBjb25hbCBhb2UgYWZ0ZXIgd2l0aGVyaW5nIGN1cnNlXHJcbiAgICAnRGVsdWJydW1TYXYgRHVlbCBGbGFpbGluZyBTdHJpa2UgMSc6ICc1NzhDJywgLy8gaW5pdGlhbCByb3RhdGluZyBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBEdWVsIEZsYWlsaW5nIFN0cmlrZSAyJzogJzU3OEQnLCAvLyByb3RhdGluZyBjbGVhdmVzXHJcblxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIE9wdGltYWwgT2ZmZW5zaXZlIFN3b3JkJzogJzU4MTknLCAvLyBtaWRkbGUgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBPZmZlbnNpdmUgU2hpZWxkJzogJzU4MUEnLCAvLyBtaWRkbGUgZXhwbG9zaW9uXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgT3B0aW1hbCBQbGF5IFN3b3JkJzogJzU4MTYnLCAvLyBPcHRpbWFsIFBsYXkgU3dvcmQgXCJnZXQgb3V0XCJcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIFBsYXkgU2hpZWxkJzogJzU4MTcnLCAvLyBPcHRpbWFsIHBsYXkgc2hpZWxkIFwiZ2V0IGluXCJcclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBPcHRpbWFsIFBsYXkgQ2xlYXZlJzogJzU4MTgnLCAvLyBPcHRpbWFsIFBsYXkgY2xlYXZlcyBmb3Igc3dvcmQvc2hpZWxkXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgVW5sdWNreSBMb3QnOiAnNTgxRCcsIC8vIFF1ZWVuJ3MgS25pZ2h0IG9yYiBleHBsb3Npb25cclxuICAgICdEZWx1YnJ1bVNhdiBHdWFyZCBCdXJuIDEnOiAnNTgzRCcsIC8vIHNtYWxsIGZpcmUgYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIEJ1cm4gMic6ICc1ODNFJywgLy8gbGFyZ2UgZmlyZSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgR3VhcmQgUGF3biBPZmYnOiAnNTgzQScsIC8vIFF1ZWVuJ3MgU29sZGllciBTZWNyZXRzIFJldmVhbGVkIHRldGhlcmVkIGNsb25lIGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMSc6ICc1ODQ3JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIGluaXRpYWwgbGluZXMgMVxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMic6ICc1ODQ4JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIGluaXRpYWwgbGluZXMgMlxyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIFR1cnJldFxcJ3MgVG91ciBOb3JtYWwgMyc6ICc1ODQ5JywgLy8gXCJub3JtYWwgbW9kZVwiIHR1cnJldHMsIHNlY29uZCBsaW5lc1xyXG4gICAgJ0RlbHVicnVtU2F2IEd1YXJkIENvdW50ZXJwbGF5JzogJzU4RjUnLCAvLyBIaXR0aW5nIGFldGhlcmlhbCB3YXJkIGRpcmVjdGlvbmFsIGJhcnJpZXJcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBTd2lybGluZyBNaWFzbWEgMSc6ICc1N0I4JywgLy8gSW5pdGlhbCBwaGFudG9tIGRvbnV0IGFvZVxyXG4gICAgJ0RlbHVicnVtU2F2IFBoYW50b20gU3dpcmxpbmcgTWlhc21hIDInOiAnNTdCOScsIC8vIE1vdmluZyBwaGFudG9tIGRvbnV0IGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIENyZWVwaW5nIE1pYXNtYSAxJzogJzU3QjQnLCAvLyBJbml0aWFsIHBoYW50b20gbGluZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIENyZWVwaW5nIE1pYXNtYSAyJzogJzU3QjUnLCAvLyBMYXRlciBwaGFudG9tIGxpbmUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBMaW5nZXJpbmcgTWlhc21hIDEnOiAnNTdCNicsIC8vIEluaXRpYWwgcGhhbnRvbSBjaXJjbGUgYW9lXHJcbiAgICAnRGVsdWJydW1TYXYgUGhhbnRvbSBMaW5nZXJpbmcgTWlhc21hIDInOiAnNTdCNycsIC8vIE1vdmluZyBwaGFudG9tIGNpcmNsZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBQaGFudG9tIFZpbGUgV2F2ZSc6ICc1N0JGJywgLy8gcGhhbnRvbSBjb25hbCBhb2VcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIEZ1cnkgT2YgQm96amEnOiAnNTk0QycsIC8vIFRyaW5pdHkgQXZvd2VkIEFsbGVnaWFudCBBcnNlbmFsIFwib3V0XCJcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgRmxhc2h2YW5lJzogJzU5NEInLCAvLyBUcmluaXR5IEF2b3dlZCBBbGxlZ2lhbnQgQXJzZW5hbCBcImdldCBiZWhpbmRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBJbmZlcm5hbCBTbGFzaCc6ICc1OTRBJywgLy8gVHJpbml0eSBBdm93ZWQgQWxsZWdpYW50IEFyc2VuYWwgXCJnZXQgZnJvbnRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IEF2b3dlZCBGbGFtZXMgT2YgQm96amEnOiAnNTkzOScsIC8vIDgwJSBmbG9vciBhb2UgYmVmb3JlIHNoaW1tZXJpbmcgc2hvdCBzd29yZHNcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgR2xlYW1pbmcgQXJyb3cnOiAnNTk0RCcsIC8vIFRyaW5pdHkgQXZhdGFyIGxpbmUgYW9lcyBmcm9tIG91dHNpZGVcclxuXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBXaGFjayc6ICc1N0QwJywgLy8gY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgTG9yZCBEZXZhc3RhdGluZyBCb2x0IDEnOiAnNTdDNScsIC8vIGxpZ2h0bmluZyByaW5nc1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRGV2YXN0YXRpbmcgQm9sdCAyJzogJzU3QzYnLCAvLyBsaWdodG5pbmcgcmluZ3NcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIEVsZWN0cm9jdXRpb24nOiAnNTdDQycsIC8vIHJhbmRvbSBjaXJjbGUgYW9lc1xyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgUmFwaWQgQm9sdHMnOiAnNTdDMycsIC8vIGRyb3BwZWQgbGlnaHRuaW5nIGFvZXNcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIDExMTEtVG9uemUgU3dpbmcnOiAnNTdEOCcsIC8vIHZlcnkgbGFyZ2UgXCJnZXQgb3V0XCIgc3dpbmdcclxuICAgICdEZWx1YnJ1bVNhdiBMb3JkIE1vbmsgQXR0YWNrJzogJzU1QTYnLCAvLyBNb25rIGFkZCBhdXRvLWF0dGFja1xyXG5cclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBOb3J0aHN3YWluXFwncyBHbG93JzogJzU5RjQnLCAvLyBleHBhbmRpbmcgbGluZXMgd2l0aCBleHBsb3Npb24gaW50ZXJzZWN0aW9uc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBNZWFucyAxJzogJzU5RTcnLCAvLyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUaGUgTWVhbnMgMic6ICc1OUVBJywgLy8gVGhlIFF1ZWVuJ3MgQmVjayBhbmQgQ2FsbCBjcm9zcyBhb2UgZnJvbSBhZGRzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gVGhlIEVuZCAxJzogJzU5RTgnLCAvLyBBbHNvIFRoZSBRdWVlbidzIEJlY2sgYW5kIENhbGwgY3Jvc3MgYW9lIGZyb20gYWRkc1xyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFRoZSBFbmQgMic6ICc1OUU5JywgLy8gQWxzbyBUaGUgUXVlZW4ncyBCZWNrIGFuZCBDYWxsIGNyb3NzIGFvZSBmcm9tIGFkZHNcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIE9mZmVuc2l2ZSBTd29yZCc6ICc1QTAyJywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgT2ZmZW5zaXZlIFNoaWVsZCc6ICc1QTAzJywgLy8gbWlkZGxlIGV4cGxvc2lvblxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIEp1ZGdtZW50IEJsYWRlIExlZnQgMSc6ICc1OUYyJywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIGxlZnQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgTGVmdCAyJzogJzVCODUnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggbGVmdCBjbGVhdmVcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBKdWRnbWVudCBCbGFkZSBSaWdodCAxJzogJzU5RjEnLCAvLyBkYXNoIGFjcm9zcyByb29tIHdpdGggcmlnaHQgY2xlYXZlXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gSnVkZ21lbnQgQmxhZGUgUmlnaHQgMic6ICc1Qjg0JywgLy8gZGFzaCBhY3Jvc3Mgcm9vbSB3aXRoIHJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFBhd24gT2ZmJzogJzVBMUQnLCAvLyBRdWVlbidzIFNvbGRpZXIgU2VjcmV0cyBSZXZlYWxlZCB0ZXRoZXJlZCBjbG9uZSBhb2VcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBPcHRpbWFsIFBsYXkgU3dvcmQnOiAnNTlGRicsIC8vIE9wdGltYWwgUGxheSBTd29yZCBcImdldCBvdXRcIlxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgUGxheSBTaGllbGQnOiAnNUEwMCcsIC8vIE9wdGltYWwgcGxheSBzaGllbGQgXCJnZXQgaW5cIlxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIE9wdGltYWwgUGxheSBDbGVhdmUnOiAnNUEwMScsIC8vIE9wdGltYWwgUGxheSBjbGVhdmVzIGZvciBzd29yZC9zaGllbGRcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDEnOiAnNUEyOCcsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDFcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDInOiAnNUEyQScsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBpbml0aWFsIGxpbmVzIDJcclxuICAgICdEZWx1YnJ1bVNhdiBRdWVlbiBUdXJyZXRcXCdzIFRvdXIgTm9ybWFsIDMnOiAnNUEyOScsIC8vIFwibm9ybWFsIG1vZGVcIiB0dXJyZXRzLCBzZWNvbmQgbGluZXNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEZWx1YnJ1bVNhdiBBdm93ZWQgSGVhdCBTaG9jayc6ICc1OTI3JywgLy8gdG9vIG11Y2ggaGVhdCBvciBmYWlsaW5nIHRvIHJlZ3VsYXRlIHRlbXBlcmF0dXJlXHJcbiAgICAnRGVsdWJydW1TYXYgQXZvd2VkIENvbGQgU2hvY2snOiAnNTkyOCcsIC8vIHRvbyBtdWNoIGNvbGQgb3IgZmFpbGluZyB0byByZWd1bGF0ZSB0ZW1wZXJhdHVyZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFF1ZWVuXFwncyBKdXN0aWNlJzogJzU5RUInLCAvLyBmYWlsaW5nIHRvIHdhbGsgdGhlIHJpZ2h0IG51bWJlciBvZiBzcXVhcmVzXHJcbiAgICAnRGVsdWJydW1TYXYgUXVlZW4gR3VubmhpbGRyXFwncyBCbGFkZXMnOiAnNUIyMicsIC8vIG5vdCBiZWluZyBpbiB0aGUgY2hlc3MgYmx1ZSBzYWZlIHNxdWFyZVxyXG4gICAgJ0RlbHVicnVtU2F2IFF1ZWVuIFVubHVja3kgTG90JzogJzU1QjYnLCAvLyBsaWdodG5pbmcgb3JiIGF0dGFja1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnRGVsdWJydW1TYXYgU2Vla2VyIE1lcmNpZnVsIE1vb24nOiAnMjYyJywgLy8gXCJQZXRyaWZpY2F0aW9uXCIgZnJvbSBBZXRoZXJpYWwgT3JiIGxvb2thd2F5XHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdEZWx1YnJ1bVNhdiBTZWVrZXIgUGhhbnRvbSBCYWxlZnVsIE9uc2xhdWdodCc6ICc1QUQ2JywgLy8gc29sbyB0YW5rIGNsZWF2ZVxyXG4gICAgJ0RlbHVicnVtU2F2IExvcmQgRm9lIFNwbGl0dGVyJzogJzU3RDcnLCAvLyB0YW5rIGNsZWF2ZVxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gVGhlc2UgYWJpbGl0eSBpZHMgY2FuIGJlIG9yZGVyZWQgZGlmZmVyZW50bHkgYW5kIFwiaGl0XCIgcGVvcGxlIHdoZW4gbGV2aXRhdGluZy5cclxuICAgICAgaWQ6ICdEZWx1YnJ1bVNhdiBHdWFyZCBMb3RzIENhc3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNTgyNycsICc1ODI4JywgJzVCNkMnLCAnNUI2RCcsICc1QkI2JywgJzVCQjcnLCAnNUI4OCcsICc1Qjg5J10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoX2RhdGEsIG1hdGNoZXMpID0+IG1hdGNoZXMuZmxhZ3Muc2xpY2UoLTIpID09PSAnMDMnLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0RlbHVicnVtU2F2IEdvbGVtIENvbXBhY3Rpb24nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzU3NDYnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIHRleHQ6IGAke21hdGNoZXMuc291cmNlfTogJHttYXRjaGVzLmFiaWxpdHl9YCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdEZWx1YnJ1bVNhdiBTbGltZSBTYW5ndWluZSBGdXNpb24nLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzU1NEQnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIHRleHQ6IGAke21hdGNoZXMuc291cmNlfTogJHttYXRjaGVzLmFiaWxpdHl9YCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVJlc3VycmVjdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTFOIEVkZW5cXCdzIFRodW5kZXIgSUlJJzogJzQ0RUQnLFxyXG4gICAgJ0UxTiBFZGVuXFwncyBCbGl6emFyZCBJSUknOiAnNDRFQycsXHJcbiAgICAnRTFOIFB1cmUgQmVhbSc6ICczRDlFJyxcclxuICAgICdFMU4gUGFyYWRpc2UgTG9zdCc6ICczREEwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMU4gRWRlblxcJ3MgRmxhcmUnOiAnM0Q5NycsXHJcbiAgICAnRTFOIFB1cmUgTGlnaHQnOiAnM0RBMycsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMU4gRmlyZSBJSUknOiAnNDRFQicsXHJcbiAgICAnRTFOIFZpY2UgT2YgVmFuaXR5JzogJzQ0RTcnLCAvLyB0YW5rIGxhc2Vyc1xyXG4gICAgJ0UxTiBWaWNlIE9mIEFwYXRoeSc6ICc0NEU4JywgLy8gZHBzIHB1ZGRsZXNcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogZmFpbGluZyB0byBpbnRlcnJ1cHQgTWFuYSBCb29zdCAoM0Q4RClcclxuLy8gVE9ETzogZmFpbGluZyB0byBwYXNzIGhlYWxlciBkZWJ1ZmY/XHJcbi8vIFRPRE86IHdoYXQgaGFwcGVucyBpZiB5b3UgZG9uJ3Qga2lsbCBhIG1ldGVvciBkdXJpbmcgZm91ciBvcmJzP1xyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlUmVzdXJyZWN0aW9uU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMVMgRWRlblxcJ3MgVGh1bmRlciBJSUknOiAnNDRGNycsXHJcbiAgICAnRTFTIEVkZW5cXCdzIEJsaXp6YXJkIElJSSc6ICc0NEY2JyxcclxuICAgICdFMVMgRWRlblxcJ3MgUmVnYWluZWQgQmxpenphcmQgSUlJJzogJzQ0RkEnLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gVHJpZGVudCAxJzogJzNEODMnLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gVHJpZGVudCAyJzogJzNEODQnLFxyXG4gICAgJ0UxUyBQYXJhZGlzZSBMb3N0JzogJzNEODcnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxUyBFZGVuXFwncyBGbGFyZSc6ICczRDczJyxcclxuICAgICdFMVMgUHVyZSBMaWdodCc6ICczRDhBJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxUyBGaXJlL1RodW5kZXIgSUlJJzogJzQ0RkInLFxyXG4gICAgJ0UxUyBQdXJlIEJlYW0gU2luZ2xlJzogJzNEODEnLFxyXG4gICAgJ0UxUyBWaWNlIE9mIFZhbml0eSc6ICc0NEYxJywgLy8gdGFuayBsYXNlcnNcclxuICAgICdFMVMgVmljZSBvZiBBcGF0aHknOiAnNDRGMicsIC8vIGRwcyBwdWRkbGVzXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogc2hhZG93ZXllIGZhaWx1cmUgKHRvcCBsaW5lIGZhaWwsIGJvdHRvbSBsaW5lIHN1Y2Nlc3MsIGVmZmVjdCB0aGVyZSB0b28pXHJcbi8vIFsxNjoxNzozNS45NjZdIDE2OjQwMDExMEZFOlZvaWR3YWxrZXI6NDBCNzpTaGFkb3dleWU6MTA2MTIzNDU6VGluaSBQb3V0aW5pOkY6MTAwMDA6MTAwMTkwRjpcclxuLy8gWzE2OjE3OjM1Ljk2Nl0gMTY6NDAwMTEwRkU6Vm9pZHdhbGtlcjo0MEI3OlNoYWRvd2V5ZToxMDY3ODkwQTpQb3RhdG8gQ2hpcHB5OjE6MDoxQzo4MDAwOlxyXG4vLyBnYWlucyB0aGUgZWZmZWN0IG9mIFBldHJpZmljYXRpb24gZnJvbSBWb2lkd2Fsa2VyIGZvciAxMC4wMCBTZWNvbmRzLlxyXG4vLyBUT0RPOiBwdWRkbGUgZmFpbHVyZT9cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVEZXNjZW50LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMk4gRG9vbXZvaWQgU2xpY2VyJzogJzNFM0MnLFxyXG4gICAgJ0UyTiBEb29tdm9pZCBHdWlsbG90aW5lJzogJzNFM0InLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMk4gTnl4JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnM0UzRCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb29wZWQnLFxyXG4gICAgICAgICAgICBkZTogJ055eCBiZXLDvGhydCcsXHJcbiAgICAgICAgICAgIGZyOiAnTWFsdXMgZGUgZMOpZ8OidHMnLFxyXG4gICAgICAgICAgICBqYTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBjbjogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBrbzogJ+uLieyKpCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IHNoYWRvd2V5ZSBmYWlsdXJlXHJcbi8vIFRPRE86IEVtcHR5IEhhdGUgKDNFNTkvM0U1QSkgaGl0cyBldmVyeWJvZHksIHNvIGhhcmQgdG8gdGVsbCBhYm91dCBrbm9ja2JhY2tcclxuLy8gVE9ETzogbWF5YmUgbWFyayBoZWxsIHdpbmQgcGVvcGxlIHdobyBnb3QgY2xpcHBlZCBieSBzdGFjaz9cclxuLy8gVE9ETzogbWlzc2luZyBwdWRkbGVzP1xyXG4vLyBUT0RPOiBtaXNzaW5nIGxpZ2h0L2RhcmsgY2lyY2xlIHN0YWNrXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlRGVzY2VudFNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTJTIERvb212b2lkIFNsaWNlcic6ICczRTUwJyxcclxuICAgICdFM1MgRW1wdHkgUmFnZSc6ICczRTZDJyxcclxuICAgICdFM1MgRG9vbXZvaWQgR3VpbGxvdGluZSc6ICczRTRGJyxcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0UyUyBEb29tdm9pZCBDbGVhdmVyJzogJzNFNjQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgU2hhZG93ZXllJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gU3RvbmUgQ3Vyc2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU4OScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMlMgTnl4JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnM0U1MScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICd3YXJuJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdCb29wZWQnLFxyXG4gICAgICAgICAgICBkZTogJ055eCBiZXLDvGhydCcsXHJcbiAgICAgICAgICAgIGZyOiAnTWFsdXMgZGUgZMOpZ8OidHMnLFxyXG4gICAgICAgICAgICBqYTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBjbjogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBrbzogJ+uLieyKpCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNHYXRlSW51bmRhdGlvbixcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTNOIE1vbnN0ZXIgV2F2ZSAxJzogJzNGQ0EnLFxyXG4gICAgJ0UzTiBNb25zdGVyIFdhdmUgMic6ICczRkU5JyxcclxuICAgICdFM04gTWFlbHN0cm9tJzogJzNGRDknLFxyXG4gICAgJ0UzTiBTd2lybGluZyBUc3VuYW1pJzogJzNGRDUnLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UzTiBUZW1wb3JhcnkgQ3VycmVudCAxJzogJzNGQ0UnLFxyXG4gICAgJ0UzTiBUZW1wb3JhcnkgQ3VycmVudCAyJzogJzNGQ0QnLFxyXG4gICAgJ0UzTiBTcGlubmluZyBEaXZlJzogJzNGREInLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTNOIFJpcCBDdXJyZW50JzogJzNGQzcnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBTY291cmluZyBUc3VuYW1pICgzQ0UwKSBvbiBzb21lYm9keSBvdGhlciB0aGFuIHRhcmdldFxyXG4vLyBUT0RPOiBTd2VlcGluZyBUc3VuYW1pICgzRkY1KSBvbiBzb21lYm9keSBvdGhlciB0aGFuIHRhbmtzXHJcbi8vIFRPRE86IFJpcCBDdXJyZW50ICgzRkUwLCAzRkUxKSBvbiBzb21lYm9keSBvdGhlciB0aGFuIHRhcmdldC90YW5rc1xyXG4vLyBUT0RPOiBCb2lsZWQgQWxpdmUgKDQwMDYpIGlzIGZhaWxpbmcgcHVkZGxlcz8/P1xyXG4vLyBUT0RPOiBmYWlsaW5nIHRvIGNsZWFuc2UgU3BsYXNoaW5nIFdhdGVyc1xyXG4vLyBUT0RPOiBkb2VzIGdldHRpbmcgaGl0IGJ5IHVuZGVyc2VhIHF1YWtlIGNhdXNlIGFuIGFiaWxpdHk/XHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVJbnVuZGF0aW9uU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFM1MgTW9uc3RlciBXYXZlIDEnOiAnM0ZFNScsXHJcbiAgICAnRTNTIE1vbnN0ZXIgV2F2ZSAyJzogJzNGRTknLFxyXG4gICAgJ0UzUyBNYWVsc3Ryb20nOiAnM0ZGQicsXHJcbiAgICAnRTNTIFN3aXJsaW5nIFRzdW5hbWknOiAnM0ZGNCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDEnOiAnM0ZFQScsXHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDInOiAnM0ZFQicsXHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDMnOiAnM0ZFQycsXHJcbiAgICAnRTNTIFRlbXBvcmFyeSBDdXJyZW50IDQnOiAnM0ZFRCcsXHJcbiAgICAnRTNTIFNwaW5uaW5nIERpdmUnOiAnM0ZGRCcsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc0dhdGVTZXB1bHR1cmUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U0TiBXZWlnaHQgb2YgdGhlIExhbmQnOiAnNDBFQicsXHJcbiAgICAnRTROIEV2aWwgRWFydGgnOiAnNDBFRicsXHJcbiAgICAnRTROIEFmdGVyc2hvY2sgMSc6ICc0MUI0JyxcclxuICAgICdFNE4gQWZ0ZXJzaG9jayAyJzogJzQwRjAnLFxyXG4gICAgJ0U0TiBFeHBsb3Npb24gMSc6ICc0MEVEJyxcclxuICAgICdFNE4gRXhwbG9zaW9uIDInOiAnNDBGNScsXHJcbiAgICAnRTROIExhbmRzbGlkZSc6ICc0MTFCJyxcclxuICAgICdFNE4gUmlnaHR3YXJkIExhbmRzbGlkZSc6ICc0MTAwJyxcclxuICAgICdFNE4gTGVmdHdhcmQgTGFuZHNsaWRlJzogJzQwRkYnLFxyXG4gICAgJ0U0TiBNYXNzaXZlIExhbmRzbGlkZSc6ICc0MEZDJyxcclxuICAgICdFNE4gU2Vpc21pYyBXYXZlJzogJzQwRjMnLFxyXG4gICAgJ0U0TiBGYXVsdCBMaW5lJzogJzQxMDEnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBmYXVsdExpbmVUYXJnZXQ/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIHBlb3BsZSBnZXQgaGl0dGluZyBieSBtYXJrZXJzIHRoZXkgc2hvdWxkbid0XHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIG5vbi10YW5rcyBnZXR0aW5nIGhpdCBieSB0YW5rYnVzdGVycywgbWVnYWxpdGhzXHJcbi8vIFRPRE86IGNvdWxkIHRyYWNrIG5vbi10YXJnZXQgZ2V0dGluZyBoaXQgYnkgdGFua2J1c3RlclxyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zR2F0ZVNlcHVsdHVyZVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTRTIFdlaWdodCBvZiB0aGUgTGFuZCc6ICc0MTA4JyxcclxuICAgICdFNFMgRXZpbCBFYXJ0aCc6ICc0MTBDJyxcclxuICAgICdFNFMgQWZ0ZXJzaG9jayAxJzogJzQxQjUnLFxyXG4gICAgJ0U0UyBBZnRlcnNob2NrIDInOiAnNDEwRCcsXHJcbiAgICAnRTRTIEV4cGxvc2lvbic6ICc0MTBBJyxcclxuICAgICdFNFMgTGFuZHNsaWRlJzogJzQxMUInLFxyXG4gICAgJ0U0UyBSaWdodHdhcmQgTGFuZHNsaWRlJzogJzQxMUQnLFxyXG4gICAgJ0U0UyBMZWZ0d2FyZCBMYW5kc2xpZGUnOiAnNDExQycsXHJcbiAgICAnRTRTIE1hc3NpdmUgTGFuZHNsaWRlIDEnOiAnNDExOCcsXHJcbiAgICAnRTRTIE1hc3NpdmUgTGFuZHNsaWRlIDInOiAnNDExOScsXHJcbiAgICAnRTRTIFNlaXNtaWMgV2F2ZSc6ICc0MTEwJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFNFMgRHVhbCBFYXJ0aGVuIEZpc3RzIDEnOiAnNDEzNScsXHJcbiAgICAnRTRTIER1YWwgRWFydGhlbiBGaXN0cyAyJzogJzQ2ODcnLFxyXG4gICAgJ0U0UyBQbGF0ZSBGcmFjdHVyZSc6ICc0M0VBJyxcclxuICAgICdFNFMgRWFydGhlbiBGaXN0IDEnOiAnNDNDQScsXHJcbiAgICAnRTRTIEVhcnRoZW4gRmlzdCAyJzogJzQzQzknLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNFMgRmF1bHQgTGluZSBDb2xsZWN0JyxcclxuICAgICAgdHlwZTogJ1N0YXJ0c1VzaW5nJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICdUaXRhbicgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICdUaXRhbicgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICdUaXRhbicgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuc3RhcnRzVXNpbmcoeyBpZDogJzQxMUUnLCBzb3VyY2U6ICfjgr/jgqTjgr/jg7MnIH0pLFxyXG4gICAgICBuZXRSZWdleENuOiBOZXRSZWdleGVzLnN0YXJ0c1VzaW5nKHsgaWQ6ICc0MTFFJywgc291cmNlOiAn5rOw5Z2mJyB9KSxcclxuICAgICAgbmV0UmVnZXhLbzogTmV0UmVnZXhlcy5zdGFydHNVc2luZyh7IGlkOiAnNDExRScsIHNvdXJjZTogJ+2DgOydtO2DhCcgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZhdWx0TGluZVRhcmdldCA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNFMgRmF1bHQgTGluZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQxMUUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuZmF1bHRMaW5lVGFyZ2V0ICE9PSBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdSdW4gT3ZlcicsXHJcbiAgICAgICAgICAgIGRlOiAnV3VyZGUgw7xiZXJmYWhyZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgw6ljcmFzw6koZSknLFxyXG4gICAgICAgICAgICBqYTogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBjbjogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgICBrbzogbWF0Y2hlcy5hYmlsaXR5LCAvLyBGSVhNRVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaGFzT3JiPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG4gIGNsb3VkTWFya2Vycz86IHN0cmluZ1tdO1xyXG59XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNWZXJzZUZ1bG1pbmF0aW9uLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFNU4gSW1wYWN0JzogJzRFM0EnLCAvLyBTdHJhdG9zcGVhciBsYW5kaW5nIEFvRVxyXG4gICAgJ0U1TiBMaWdodG5pbmcgQm9sdCc6ICc0QjlDJywgLy8gU3Rvcm1jbG91ZCBzdGFuZGFyZCBhdHRhY2tcclxuICAgICdFNU4gR2FsbG9wJzogJzRCOTcnLCAvLyBTaWRld2F5cyBhZGQgY2hhcmdlXHJcbiAgICAnRTVOIFNob2NrIFN0cmlrZSc6ICc0QkExJywgLy8gU21hbGwgQW9FIGNpcmNsZXMgZHVyaW5nIFRodW5kZXJzdG9ybVxyXG4gICAgJ0U1TiBWb2x0IFN0cmlrZSc6ICc0Q0YyJywgLy8gTGFyZ2UgQW9FIGNpcmNsZXMgZHVyaW5nIFRodW5kZXJzdG9ybVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U1TiBKdWRnbWVudCBKb2x0JzogJzRCOEYnLCAvLyBTdHJhdG9zcGVhciBleHBsb3Npb25zXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGhhcHBlbnMgd2hlbiBhIHBsYXllciBnZXRzIDQrIHN0YWNrcyBvZiBvcmJzLiBEb24ndCBiZSBncmVlZHkhXHJcbiAgICAgIGlkOiAnRTVOIFN0YXRpYyBDb25kZW5zYXRpb24nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIG9yYiBwaWNrdXAgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdFNU4gT3JiIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNU4gT3JiIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIERpdmluZSBKdWRnZW1lbnQgVm9sdHMnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QjlBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiAhZGF0YS5oYXNPcmIgfHwgIWRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIGJsYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKG5vIG9yYilgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoa2VpbiBPcmIpYCxcclxuICAgICAgICAgICAgZnI6IGAke21hdGNoZXMuYWJpbGl0eX0gKHBhcyBkJ29yYmUpYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOmbt+eOieeEoeOBlylgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5rKh5ZCD55CDKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1TiBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2VycyA/Pz0gW107XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgaXMgc2VlbiBvbmx5IGlmIHBsYXllcnMgc3RhY2tlZCB0aGUgY2xvdWRzIGluc3RlYWQgb2Ygc3ByZWFkaW5nIHRoZW0uXHJcbiAgICAgIGlkOiAnRTVOIFRoZSBQYXJ0aW5nIENsb3VkcycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCOUQnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGRhdGEuY2xvdWRNYXJrZXJzID8/IFtdKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGNsb3VkcyB0b28gY2xvc2UpYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoV29sa2VuIHp1IG5haGUpYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAobnVhZ2VzIHRyb3AgcHJvY2hlcylgLFxyXG4gICAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7Lov5HjgZnjgY4pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zu35LqR6YeN5Y+gKWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVOIFN0b3JtY2xvdWQgY2xlYW51cCcsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMzAsIC8vIFN0b3JtY2xvdWRzIHJlc29sdmUgd2VsbCBiZWZvcmUgdGhpcy5cclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmNsb3VkTWFya2VycztcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc09yYj86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBoYXRlZD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBjbG91ZE1hcmtlcnM/OiBzdHJpbmdbXTtcclxufVxyXG5cclxuXHJcbi8vIFRPRE86IGlzIHRoZXJlIGEgZGlmZmVyZW50IGFiaWxpdHkgaWYgdGhlIHNoaWVsZCBkdXR5IGFjdGlvbiBpc24ndCB1c2VkIHByb3Blcmx5P1xyXG4vLyBUT0RPOiBpcyB0aGVyZSBhbiBhYmlsaXR5IGZyb20gUmFpZGVuICh0aGUgYmlyZCkgaWYgeW91IGdldCBlYXRlbj9cclxuLy8gVE9ETzogbWF5YmUgY2hhaW4gbGlnaHRuaW5nIHdhcm5pbmcgaWYgeW91IGdldCBoaXQgd2hpbGUgeW91IGhhdmUgc3lzdGVtIHNob2NrICg4QjgpXHJcblxyXG5jb25zdCBub09yYiA9IChzdHI6IHN0cmluZykgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBlbjogc3RyICsgJyAobm8gb3JiKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBPcmIpJyxcclxuICAgIGZyOiBzdHIgKyAnIChwYXMgZFxcJ29yYmUpJyxcclxuICAgIGphOiBzdHIgKyAnICjpm7fnjonnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHlkIPnkIMpJyxcclxuICAgIGtvOiBzdHIgKyAnICjqtazsiqwg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVsbWluYXRpb25TYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U1UyBJbXBhY3QnOiAnNEUzQicsIC8vIFN0cmF0b3NwZWFyIGxhbmRpbmcgQW9FXHJcbiAgICAnRTVTIEdhbGxvcCc6ICc0QkI0JywgLy8gU2lkZXdheXMgYWRkIGNoYXJnZVxyXG4gICAgJ0U1UyBTaG9jayBTdHJpa2UnOiAnNEJDMScsIC8vIFNtYWxsIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgU3RlcHBlZCBMZWFkZXIgVHdpc3Rlcic6ICc0QkM3JywgLy8gVHdpc3RlciBzdGVwcGVkIGxlYWRlclxyXG4gICAgJ0U1UyBTdGVwcGVkIExlYWRlciBEb251dCc6ICc0QkM4JywgLy8gRG9udXQgc3RlcHBlZCBsZWFkZXJcclxuICAgICdFNVMgU2hvY2snOiAnNEUzRCcsIC8vIEhhdGVkIG9mIExldmluIFN0b3JtY2xvdWQtY2xlYW5zYWJsZSBleHBsb2RpbmcgZGVidWZmXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTVTIEp1ZGdtZW50IEpvbHQnOiAnNEJBNycsIC8vIFN0cmF0b3NwZWFyIGV4cGxvc2lvbnNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U1UyBWb2x0IFN0cmlrZSBEb3VibGUnOiAnNEJDMycsIC8vIExhcmdlIEFvRSBjaXJjbGVzIGR1cmluZyBUaHVuZGVyc3Rvcm1cclxuICAgICdFNVMgQ3JpcHBsaW5nIEJsb3cnOiAnNEJDQScsXHJcbiAgICAnRTVTIENoYWluIExpZ2h0bmluZyBEb3VibGUnOiAnNEJDNScsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBIZWxwZXIgZm9yIG9yYiBwaWNrdXAgZmFpbHVyZXNcclxuICAgICAgaWQ6ICdFNVMgT3JiIEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgT3JiIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEI0JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzT3JiID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIERpdmluZSBKdWRnZW1lbnQgVm9sdHMnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0QkI3JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiAhZGF0YS5oYXNPcmIgfHwgIWRhdGEuaGFzT3JiW21hdGNoZXMudGFyZ2V0XSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vT3JiKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFZvbHQgU3RyaWtlIE9yYicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQzMnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLmhhc09yYiB8fCAhZGF0YS5oYXNPcmJbbWF0Y2hlcy50YXJnZXRdLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9PcmIobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFNVMgRGVhZGx5IERpc2NoYXJnZSBCaWcgS25vY2tiYWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEJCMicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gIWRhdGEuaGFzT3JiIHx8ICFkYXRhLmhhc09yYlttYXRjaGVzLnRhcmdldF0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub09yYihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBMaWdodG5pbmcgQm9sdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQjknLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBIYXZpbmcgYSBub24taWRlbXBvdGVudCBjb25kaXRpb24gZnVuY3Rpb24gaXMgYSBiaXQgPF88XHJcbiAgICAgICAgLy8gT25seSBjb25zaWRlciBsaWdodG5pbmcgYm9sdCBkYW1hZ2UgaWYgeW91IGhhdmUgYSBkZWJ1ZmYgdG8gY2xlYXIuXHJcbiAgICAgICAgaWYgKCFkYXRhLmhhdGVkIHx8ICFkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICBkZWxldGUgZGF0YS5oYXRlZFttYXRjaGVzLnRhcmdldF07XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBIYXRlZCBvZiBMZXZpbicsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDBEMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhdGVkID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhdGVkW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U1UyBTdG9ybWNsb3VkIFRhcmdldCBUcmFja2luZycsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmNsb3VkTWFya2VycyA/Pz0gW107XHJcbiAgICAgICAgZGF0YS5jbG91ZE1hcmtlcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGFiaWxpdHkgaXMgc2VlbiBvbmx5IGlmIHBsYXllcnMgc3RhY2tlZCB0aGUgY2xvdWRzIGluc3RlYWQgb2Ygc3ByZWFkaW5nIHRoZW0uXHJcbiAgICAgIGlkOiAnRTVTIFRoZSBQYXJ0aW5nIENsb3VkcycsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzRCQkEnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIHN1cHByZXNzU2Vjb25kczogMzAsXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGRhdGEuY2xvdWRNYXJrZXJzID8/IFtdKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGNsb3VkcyB0b28gY2xvc2UpYCxcclxuICAgICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoV29sa2VuIHp1IG5haGUpYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAobnVhZ2VzIHRyb3AgcHJvY2hlcylgLFxyXG4gICAgICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjpm7Lov5HjgZnjgY4pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo6Zu35LqR6YeN5Y+gKWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTVTIFN0b3JtY2xvdWQgY2xlYW51cCcsXHJcbiAgICAgIHR5cGU6ICdIZWFkTWFya2VyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuaGVhZE1hcmtlcih7IGlkOiAnMDA2RScgfSksXHJcbiAgICAgIC8vIFN0b3JtY2xvdWRzIHJlc29sdmUgd2VsbCBiZWZvcmUgdGhpcy5cclxuICAgICAgZGVsYXlTZWNvbmRzOiAzMCxcclxuICAgICAgcnVuOiAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGRlbGV0ZSBkYXRhLmNsb3VkTWFya2VycztcclxuICAgICAgICBkZWxldGUgZGF0YS5oYXRlZDtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3IsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0U2TiBUaG9ybnMnOiAnNEJEQScsIC8vIEFvRSBtYXJrZXJzIGFmdGVyIEVudW1lcmF0aW9uXHJcbiAgICAnRTZOIEZlcm9zdG9ybSAxJzogJzRCREQnLFxyXG4gICAgJ0U2TiBGZXJvc3Rvcm0gMic6ICc0QkU1JyxcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAxJzogJzRCRTAnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1HYXJ1ZGFcclxuICAgICdFNk4gU3Rvcm0gT2YgRnVyeSAyJzogJzRCRTYnLCAvLyBDaXJjbGUgQW9FIGR1cmluZyB0ZXRoZXJzLS1SYWt0YXBha3NhXHJcbiAgICAnRTZOIEV4cGxvc2lvbic6ICc0QkUyJywgLy8gQW9FIGNpcmNsZXMsIEdhcnVkYSBvcmJzXHJcbiAgICAnRTZOIEhlYXQgQnVyc3QnOiAnNEJFQycsXHJcbiAgICAnRTZOIENvbmZsYWcgU3RyaWtlJzogJzRCRUUnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FXHJcbiAgICAnRTZOIFNwaWtlIE9mIEZsYW1lJzogJzRCRjAnLCAvLyBPcmIgZXhwbG9zaW9ucyBhZnRlciBTdHJpa2UgU3BhcmtcclxuICAgICdFNk4gUmFkaWFudCBQbHVtZSc6ICc0QkYyJyxcclxuICAgICdFNk4gRXJ1cHRpb24nOiAnNEJGNCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZOIFZhY3V1bSBTbGljZSc6ICc0QkQ1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2TiBEb3duYnVyc3QnOiAnNEJEQicsIC8vIEJsdWUga25vY2tiYWNrIGNpcmNsZS4gQWN0dWFsIGtub2NrYmFjayBpcyB1bmtub3duIGFiaWxpdHkgNEMyMFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBLaWxscyBub24tdGFua3Mgd2hvIGdldCBoaXQgYnkgaXQuXHJcbiAgICAnRTZOIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRCRUQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgU2ltcGxlT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuLy8gVE9ETzogY2hlY2sgdGV0aGVycyBiZWluZyBjdXQgKHdoZW4gdGhleSBzaG91bGRuJ3QpXHJcbi8vIFRPRE86IGNoZWNrIGZvciBjb25jdXNzZWQgZGVidWZmXHJcbi8vIFRPRE86IGNoZWNrIGZvciB0YWtpbmcgdGFua2J1c3RlciB3aXRoIGxpZ2h0aGVhZGVkXHJcbi8vIFRPRE86IGNoZWNrIGZvciBvbmUgcGVyc29uIHRha2luZyBtdWx0aXBsZSBTdG9ybSBPZiBGdXJ5IFRldGhlcnMgKDRDMDEvNEMwOClcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IFNpbXBsZU9vcHN5VHJpZ2dlclNldCA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlRnVyb3JTYXZhZ2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgLy8gSXQncyBjb21tb24gdG8ganVzdCBpZ25vcmUgZnV0Ym9sIG1lY2hhbmljcywgc28gZG9uJ3Qgd2FybiBvbiBTdHJpa2UgU3BhcmsuXHJcbiAgICAvLyAnU3Bpa2UgT2YgRmxhbWUnOiAnNEMxMycsIC8vIE9yYiBleHBsb3Npb25zIGFmdGVyIFN0cmlrZSBTcGFya1xyXG5cclxuICAgICdFNlMgVGhvcm5zJzogJzRCRkEnLCAvLyBBb0UgbWFya2VycyBhZnRlciBFbnVtZXJhdGlvblxyXG4gICAgJ0U2UyBGZXJvc3Rvcm0gMSc6ICc0QkZEJyxcclxuICAgICdFNlMgRmVyb3N0b3JtIDInOiAnNEMwNicsXHJcbiAgICAnRTZTIFN0b3JtIE9mIEZ1cnkgMSc6ICc0QzAwJywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tR2FydWRhXHJcbiAgICAnRTZTIFN0b3JtIE9mIEZ1cnkgMic6ICc0QzA3JywgLy8gQ2lyY2xlIEFvRSBkdXJpbmcgdGV0aGVycy0tUmFrdGFwYWtzYVxyXG4gICAgJ0U2UyBFeHBsb3Npb24nOiAnNEMwMycsIC8vIEFvRSBjaXJjbGVzLCBHYXJ1ZGEgb3Jic1xyXG4gICAgJ0U2UyBIZWF0IEJ1cnN0JzogJzRDMUYnLFxyXG4gICAgJ0U2UyBDb25mbGFnIFN0cmlrZSc6ICc0QzEwJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRVxyXG4gICAgJ0U2UyBSYWRpYW50IFBsdW1lJzogJzRDMTUnLFxyXG4gICAgJ0U2UyBFcnVwdGlvbic6ICc0QzE3JyxcclxuICAgICdFNlMgV2luZCBDdXR0ZXInOiAnNEMwMicsIC8vIFRldGhlci1jdXR0aW5nIGxpbmUgYW9lXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTZTIFZhY3V1bSBTbGljZSc6ICc0QkY1JywgLy8gRGFyayBsaW5lIEFvRSBmcm9tIEdhcnVkYVxyXG4gICAgJ0U2UyBEb3duYnVyc3QgMSc6ICc0QkZCJywgLy8gQmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChHYXJ1ZGEpLlxyXG4gICAgJ0U2UyBEb3duYnVyc3QgMic6ICc0QkZDJywgLy8gQmx1ZSBrbm9ja2JhY2sgY2lyY2xlIChSYWt0YXBha3NhKS5cclxuICAgICdFNlMgTWV0ZW9yIFN0cmlrZSc6ICc0QzBGJywgLy8gRnJvbnRhbCBhdm9pZGFibGUgdGFuayBidXN0ZXJcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U2UyBIYW5kcyBvZiBIZWxsJzogJzRDMFtCQ10nLCAvLyBUZXRoZXIgY2hhcmdlXHJcbiAgICAnRTZTIEhhbmRzIG9mIEZsYW1lJzogJzRDMEEnLCAvLyBGaXJzdCBUYW5rYnVzdGVyXHJcbiAgICAnRTZTIEluc3RhbnQgSW5jaW5lcmF0aW9uJzogJzRDMEUnLCAvLyBTZWNvbmQgVGFua2J1c3RlclxyXG4gICAgJ0U2UyBCbGF6ZSc6ICc0QzFCJywgLy8gRmxhbWUgVG9ybmFkbyBDbGVhdmVcclxuICB9LFxyXG4gIHNvbG9GYWlsOiB7XHJcbiAgICAnRTZTIEFpciBCdW1wJzogJzRCRjknLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNBc3RyYWw/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgaGFzVW1icmFsPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG5jb25zdCB3cm9uZ0J1ZmYgPSAoc3RyOiBzdHJpbmcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKHdyb25nIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChmYWxzY2hlciBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAobWF1dmFpcyBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo5LiN6YGp5YiH44Gq44OQ44OVKScsXHJcbiAgICBjbjogc3RyICsgJyAoQnVmZumUmeS6hiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDti4DrprwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuY29uc3Qgbm9CdWZmID0gKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyjrsoTtlIQg7JeG7J2MKScsXHJcbiAgfTtcclxufTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdOIFN0eWdpYW4gU3dvcmQnOiAnNEM1NScsIC8vIENpcmNsZSBncm91bmQgQW9FcyBhZnRlciBGYWxzZSBUd2lsaWdodFxyXG4gICAgJ0U3TiBTdHJlbmd0aCBJbiBOdW1iZXJzIERvbnV0JzogJzRDNEMnLCAvLyBMYXJnZSBkb251dCBncm91bmQgQW9FcywgaW50ZXJtaXNzaW9uXHJcbiAgICAnRTdOIFN0cmVuZ3RoIEluIE51bWJlcnMgMic6ICc0QzREJywgLy8gTGFyZ2UgY2lyY2xlIGdyb3VuZCBBb0VzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U3TiBTdHlnaWFuIFN0YWtlJzogJzRDMzMnLCAvLyBMYXNlciB0YW5rIGJ1c3Rlciwgb3V0c2lkZSBpbnRlcm1pc3Npb24gcGhhc2VcclxuICAgICdFNU4gU2lsdmVyIFNob3QnOiAnNEU3RCcsIC8vIFNwcmVhZCBtYXJrZXJzLCBpbnRlcm1pc3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIEFzdHJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBBc3RyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIFVtYnJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBVbWJyYWwgRWZmZWN0IExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJGJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdOIExpZ2h0XFwncyBDb3Vyc2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEMzRScsICc0QzQwJywgJzRDMjInLCAnNEMzQycsICc0RTYzJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNVbWJyYWwgfHwgIWRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNBc3RyYWwgJiYgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG5vQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3TiBEYXJrc1xcJ3MgQ291cnNlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiBbJzRDM0QnLCAnNEMyMycsICc0QzQxJywgJzRDNDMnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc0FzdHJhbCB8fCAhZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc1VtYnJhbCAmJiBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICAvLyBUaGlzIGNhc2UgaXMgcHJvYmFibHkgaW1wb3NzaWJsZSwgYXMgdGhlIGRlYnVmZiB0aWNrcyBhZnRlciBkZWF0aCxcclxuICAgICAgICAvLyBidXQgbGVhdmluZyBpdCBoZXJlIGluIGNhc2UgdGhlcmUncyBzb21lIHJleiBvciBkaXNjb25uZWN0IHRpbWluZ1xyXG4gICAgICAgIC8vIHRoYXQgY291bGQgbGVhZCB0byB0aGlzLlxyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBub0J1ZmYobWF0Y2hlcy5hYmlsaXR5KSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbi8vIFRPRE86IG1pc3NpbmcgYW4gb3JiIGR1cmluZyB0b3JuYWRvIHBoYXNlXHJcbi8vIFRPRE86IGp1bXBpbmcgaW4gdGhlIHRvcm5hZG8gZGFtYWdlPz9cclxuLy8gVE9ETzogdGFraW5nIHN1bmdyYWNlKDRDODApIG9yIG1vb25ncmFjZSg0QzgyKSB3aXRoIHdyb25nIGRlYnVmZlxyXG4vLyBUT0RPOiBzdHlnaWFuIHNwZWFyL3NpbHZlciBzcGVhciB3aXRoIHRoZSB3cm9uZyBkZWJ1ZmZcclxuLy8gVE9ETzogdGFraW5nIGV4cGxvc2lvbiBmcm9tIHRoZSB3cm9uZyBDaGlhcm8vU2N1cm8gb3JiXHJcbi8vIFRPRE86IGhhbmRsZSA0Qzg5IFNpbHZlciBTdGFrZSB0YW5rYnVzdGVyIDJuZCBoaXQsIGFzIGl0J3Mgb2sgdG8gaGF2ZSB0d28gaW4uXHJcblxyXG5jb25zdCB3cm9uZ0J1ZmYgPSAoc3RyOiBzdHJpbmcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZW46IHN0ciArICcgKHdyb25nIGJ1ZmYpJyxcclxuICAgIGRlOiBzdHIgKyAnIChmYWxzY2hlciBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAobWF1dmFpcyBidWZmKScsXHJcbiAgICBqYTogc3RyICsgJyAo5LiN6YGp5YiH44Gq44OQ44OVKScsXHJcbiAgICBjbjogc3RyICsgJyAoQnVmZumUmeS6hiknLFxyXG4gICAga286IHN0ciArICcgKOuyhO2UhCDti4DrprwpJyxcclxuICB9O1xyXG59O1xyXG5cclxuY29uc3Qgbm9CdWZmID0gKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGVuOiBzdHIgKyAnIChubyBidWZmKScsXHJcbiAgICBkZTogc3RyICsgJyAoa2VpbiBCdWZmKScsXHJcbiAgICBmcjogc3RyICsgJyAocGFzIGRlIGJ1ZmYpJyxcclxuICAgIGphOiBzdHIgKyAnICjjg5Djg5XnhKHjgZcpJyxcclxuICAgIGNuOiBzdHIgKyAnICjmsqHmnIlCdWZmKScsXHJcbiAgICBrbzogc3RyICsgJyAo67KE7ZSEIOyXhuydjCknLFxyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGhhc0FzdHJhbD86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxuICBoYXNVbWJyYWw/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbn1cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlSWNvbm9jbGFzbVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTdTIFNpbHZlciBTd29yZCc6ICc0QzhFJywgLy8gZ3JvdW5kIGFvZVxyXG4gICAgJ0U3UyBPdmVyd2hlbG1pbmcgRm9yY2UnOiAnNEM3MycsIC8vIGFkZCBwaGFzZSBncm91bmQgYW9lXHJcbiAgICAnRTdTIFN0cmVuZ3RoIGluIE51bWJlcnMgMSc6ICc0QzcwJywgLy8gYWRkIGdldCB1bmRlclxyXG4gICAgJ0U3UyBTdHJlbmd0aCBpbiBOdW1iZXJzIDInOiAnNEM3MScsIC8vIGFkZCBnZXQgb3V0XHJcbiAgICAnRTdTIFBhcGVyIEN1dCc6ICc0QzdEJywgLy8gdG9ybmFkbyBncm91bmQgYW9lc1xyXG4gICAgJ0U3UyBCdWZmZXQnOiAnNEM3NycsIC8vIHRvcm5hZG8gZ3JvdW5kIGFvZXMgYWxzbz8/XHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTdTIEJldHdpeHQgV29ybGRzJzogJzRDNkInLCAvLyBwdXJwbGUgZ3JvdW5kIGxpbmUgYW9lc1xyXG4gICAgJ0U3UyBDcnVzYWRlJzogJzRDNTgnLCAvLyBibHVlIGtub2NrYmFjayBjaXJjbGUgKHN0YW5kaW5nIGluIGl0KVxyXG4gICAgJ0U3UyBFeHBsb3Npb24nOiAnNEM2RicsIC8vIGRpZG4ndCBraWxsIGFuIGFkZFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTdTIFN0eWdpYW4gU3Rha2UnOiAnNEMzNCcsIC8vIExhc2VyIHRhbmsgYnVzdGVyIDFcclxuICAgICdFN1MgU2lsdmVyIFNob3QnOiAnNEM5MicsIC8vIFNwcmVhZCBtYXJrZXJzXHJcbiAgICAnRTdTIFNpbHZlciBTY291cmdlJzogJzRDOTMnLCAvLyBJY2UgbWFya2Vyc1xyXG4gICAgJ0U3UyBDaGlhcm8gU2N1cm8gRXhwbG9zaW9uIDEnOiAnNEQxNCcsIC8vIG9yYiBleHBsb3Npb25cclxuICAgICdFN1MgQ2hpYXJvIFNjdXJvIEV4cGxvc2lvbiAyJzogJzREMTUnLCAvLyBvcmIgZXhwbG9zaW9uXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICAvLyBJbnRlcnJ1cHRcclxuICAgICAgaWQ6ICdFN1MgQWR2ZW50IE9mIExpZ2h0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0QzZFJyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVE9ETzogaXMgdGhpcyBibGFtZSBjb3JyZWN0PyBkb2VzIHRoaXMgaGF2ZSBhIHRhcmdldD9cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U3UyBBc3RyYWwgRWZmZWN0IEdhaW4nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnOEJFJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQXN0cmFsID0gZGF0YS5oYXNBc3RyYWwgfHwge307XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWxbbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIEFzdHJhbCBFZmZlY3QgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkUnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNBc3RyYWwgPSBkYXRhLmhhc0FzdHJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIFVtYnJhbCBFZmZlY3QgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4QkYnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNVbWJyYWwgPSBkYXRhLmhhc1VtYnJhbCB8fCB7fTtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbFttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgVW1icmFsIEVmZmVjdCBMb3NlJyxcclxuICAgICAgdHlwZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMubG9zZXNFZmZlY3QoeyBlZmZlY3RJZDogJzhCRicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc1VtYnJhbCA9IGRhdGEuaGFzVW1icmFsIHx8IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzVW1icmFsW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFN1MgTGlnaHRcXCdzIENvdXJzZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogWyc0QzYyJywgJzRDNjMnLCAnNEM2NCcsICc0QzVCJywgJzRDNUYnXSwgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuICFkYXRhLmhhc1VtYnJhbCB8fCAhZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdO1xyXG4gICAgICB9LFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhLmhhc0FzdHJhbCAmJiBkYXRhLmhhc0FzdHJhbFttYXRjaGVzLnRhcmdldF0pXHJcbiAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogd3JvbmdCdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIERhcmtzXFwncyBDb3Vyc2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNEM2NScsICc0QzY2JywgJzRDNjcnLCAnNEM1QScsICc0QzYwJ10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiAhZGF0YS5oYXNBc3RyYWwgfHwgIWRhdGEuaGFzQXN0cmFsW21hdGNoZXMudGFyZ2V0XTtcclxuICAgICAgfSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5oYXNVbWJyYWwgJiYgZGF0YS5oYXNVbWJyYWxbbWF0Y2hlcy50YXJnZXRdKVxyXG4gICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IHdyb25nQnVmZihtYXRjaGVzLmFiaWxpdHkpIH07XHJcbiAgICAgICAgLy8gVGhpcyBjYXNlIGlzIHByb2JhYmx5IGltcG9zc2libGUsIGFzIHRoZSBkZWJ1ZmYgdGlja3MgYWZ0ZXIgZGVhdGgsXHJcbiAgICAgICAgLy8gYnV0IGxlYXZpbmcgaXQgaGVyZSBpbiBjYXNlIHRoZXJlJ3Mgc29tZSByZXogb3IgZGlzY29ubmVjdCB0aW1pbmdcclxuICAgICAgICAvLyB0aGF0IGNvdWxkIGxlYWQgdG8gdGhpcy5cclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbm9CdWZmKG1hdGNoZXMuYWJpbGl0eSkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTdTIENydXNhZGUgS25vY2tiYWNrJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICAvLyA0Qzc2IGlzIHRoZSBrbm9ja2JhY2sgZGFtYWdlLCA0QzU4IGlzIHRoZSBkYW1hZ2UgZm9yIHN0YW5kaW5nIG9uIHRoZSBwdWNrLlxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNEM3NicsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zVmVyc2VSZWZ1bGdlbmNlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOE4gQml0aW5nIEZyb3N0JzogJzREREInLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBEcml2aW5nIEZyb3N0JzogJzREREMnLCAvLyBSZWFyIGNvbmUgQW9FLCBTaGl2YVxyXG4gICAgJ0U4TiBGcmlnaWQgU3RvbmUnOiAnNEU2NicsIC8vIFNtYWxsIHNwcmVhZCBjaXJjbGVzLCBwaGFzZSAxXHJcbiAgICAnRThOIFJlZmxlY3RlZCBBeGUgS2ljayc6ICc0RTAwJywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4TiBSZWZsZWN0ZWQgU2N5dGhlIEtpY2snOiAnNEUwMScsIC8vIERvbnV0IEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4TiBGcmlnaWQgRXJ1cHRpb24nOiAnNEUwOScsIC8vIFNtYWxsIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4TiBJY2ljbGUgSW1wYWN0JzogJzRFMEEnLCAvLyBMYXJnZSBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOE4gQXhlIEtpY2snOiAnNERFMicsIC8vIExhcmdlIGNpcmNsZSBBb0UsIFNoaXZhXHJcbiAgICAnRThOIFNjeXRoZSBLaWNrJzogJzRERTMnLCAvLyBEb251dCBBb0UsIFNoaXZhXHJcbiAgICAnRThOIFJlZmxlY3RlZCBCaXRpbmcgRnJvc3QnOiAnNERGRScsIC8vIDI3MC1kZWdyZWUgZnJvbnRhbCBBb0UsIEZyb3plbiBNaXJyb3JcclxuICAgICdFOE4gUmVmbGVjdGVkIERyaXZpbmcgRnJvc3QnOiAnNERGRicsIC8vIENvbmUgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBTaGluaW5nIEFybW9yJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzk1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0U4TiBIZWF2ZW5seSBTdHJpa2UnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0REQ4JywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ1B1c2hlZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXIgZ2VzdG/Dn2VuIScsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBwb3Vzc8OpKGUpICEnLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLHrkKghJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRThOIEZyb3N0IEFybW9yJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gVGhpbiBJY2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzM4RicgfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnU2xpZCBvZmYhJyxcclxuICAgICAgICAgICAgZGU6ICdydW50ZXJnZXJ1dHNjaHQhJyxcclxuICAgICAgICAgICAgZnI6ICdBIGdsaXNzw6koZSkgIScsXHJcbiAgICAgICAgICAgIGphOiAn5ruR44Gj44GfJyxcclxuICAgICAgICAgICAgY246ICfmu5HokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uvuOuBhOufrOynkCEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiBydXNoIGhpdHRpbmcgdGhlIGNyeXN0YWxcclxuLy8gVE9ETzogYWRkcyBub3QgYmVpbmcga2lsbGVkXHJcbi8vIFRPRE86IHRha2luZyB0aGUgcnVzaCB0d2ljZSAod2hlbiB5b3UgaGF2ZSBkZWJ1ZmYpXHJcbi8vIFRPRE86IG5vdCBoaXR0aW5nIHRoZSBkcmFnb24gZm91ciB0aW1lcyBkdXJpbmcgd3lybSdzIGxhbWVudFxyXG4vLyBUT0RPOiBkZWF0aCByZWFzb25zIGZvciBub3QgcGlja2luZyB1cCBwdWRkbGVcclxuLy8gVE9ETzogbm90IGJlaW5nIGluIHRoZSB0b3dlciB3aGVuIHlvdSBzaG91bGRcclxuLy8gVE9ETzogcGlja2luZyB1cCB0b28gbWFueSBzdGFja3NcclxuXHJcbi8vIE5vdGU6IEJhbmlzaCBJSUkgKDREQTgpIGFuZCBCYW5pc2ggSWlpIERpdmlkZWQgKDREQTkpIGJvdGggYXJlIHR5cGU9MHgxNiBsaW5lcy5cclxuLy8gVGhlIHNhbWUgaXMgdHJ1ZSBmb3IgQmFuaXNoICg0REE2KSBhbmQgQmFuaXNoIERpdmlkZWQgKDREQTcpLlxyXG4vLyBJJ20gbm90IHN1cmUgdGhpcyBtYWtlcyBhbnkgc2Vuc2U/IEJ1dCBjYW4ndCB0ZWxsIGlmIHRoZSBzcHJlYWQgd2FzIGEgbWlzdGFrZSBvciBub3QuXHJcbi8vIE1heWJlIHdlIGNvdWxkIGNoZWNrIGZvciBcIk1hZ2ljIFZ1bG5lcmFiaWxpdHkgVXBcIj9cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1ZlcnNlUmVmdWxnZW5jZVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRThTIEJpdGluZyBGcm9zdCc6ICc0RDY2JywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgU2hpdmFcclxuICAgICdFOFMgRHJpdmluZyBGcm9zdCc6ICc0RDY3JywgLy8gUmVhciBjb25lIEFvRSwgU2hpdmFcclxuICAgICdFOFMgQXhlIEtpY2snOiAnNEQ2RCcsIC8vIExhcmdlIGNpcmNsZSBBb0UsIFNoaXZhXHJcbiAgICAnRThTIFNjeXRoZSBLaWNrJzogJzRENkUnLCAvLyBEb251dCBBb0UsIFNoaXZhXHJcbiAgICAnRThTIFJlZmxlY3RlZCBBeGUgS2ljayc6ICc0REI5JywgLy8gTGFyZ2UgY2lyY2xlIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgU2N5dGhlIEtpY2snOiAnNERCQScsIC8vIERvbnV0IEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBGcmlnaWQgRXJ1cHRpb24nOiAnNEQ5RicsIC8vIFNtYWxsIGNpcmNsZSBBb0UgcHVkZGxlcywgcGhhc2UgMVxyXG4gICAgJ0U4UyBGcmlnaWQgTmVlZGxlJzogJzREOUQnLCAvLyA4LXdheSBcImZsb3dlclwiIGV4cGxvc2lvblxyXG4gICAgJ0U4UyBJY2ljbGUgSW1wYWN0JzogJzREQTAnLCAvLyBMYXJnZSBjaXJjbGUgQW9FIHB1ZGRsZXMsIHBoYXNlIDFcclxuICAgICdFOFMgUmVmbGVjdGVkIEJpdGluZyBGcm9zdCAxJzogJzREQjcnLCAvLyAyNzAtZGVncmVlIGZyb250YWwgQW9FLCBGcm96ZW4gTWlycm9yXHJcbiAgICAnRThTIFJlZmxlY3RlZCBCaXRpbmcgRnJvc3QgMic6ICc0REMzJywgLy8gMjcwLWRlZ3JlZSBmcm9udGFsIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCAxJzogJzREQjgnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgRHJpdmluZyBGcm9zdCAyJzogJzREQzQnLCAvLyBDb25lIEFvRSwgRnJvemVuIE1pcnJvclxyXG5cclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMSc6ICc0RDc1JywgLy8gTGVmdCBjbGVhdmVcclxuICAgICdFOFMgSGFsbG93ZWQgV2luZ3MgMic6ICc0RDc2JywgLy8gUmlnaHQgY2xlYXZlXHJcbiAgICAnRThTIEhhbGxvd2VkIFdpbmdzIDMnOiAnNEQ3NycsIC8vIEtub2NrYmFjayBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMSc6ICc0RDkwJywgLy8gUmVmbGVjdGVkIGxlZnQgMlxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMic6ICc0REJCJywgLy8gUmVmbGVjdGVkIGxlZnQgMVxyXG4gICAgJ0U4UyBSZWZsZWN0ZWQgSGFsbG93ZWQgV2luZ3MgMyc6ICc0REM3JywgLy8gUmVmbGVjdGVkIHJpZ2h0IDJcclxuICAgICdFOFMgUmVmbGVjdGVkIEhhbGxvd2VkIFdpbmdzIDQnOiAnNEQ5MScsIC8vIFJlZmxlY3RlZCByaWdodCAxXHJcbiAgICAnRThTIFR3aW4gU3RpbGxuZXNzIDEnOiAnNEQ2OCcsXHJcbiAgICAnRThTIFR3aW4gU3RpbGxuZXNzIDInOiAnNEQ2QicsXHJcbiAgICAnRThTIFR3aW4gU2lsZW5jZSAxJzogJzRENjknLFxyXG4gICAgJ0U4UyBUd2luIFNpbGVuY2UgMic6ICc0RDZBJyxcclxuICAgICdFOFMgQWtoIFJoYWknOiAnNEQ5OScsXHJcbiAgICAnRThTIEVtYml0dGVyZWQgRGFuY2UgMSc6ICc0RDcwJyxcclxuICAgICdFOFMgRW1iaXR0ZXJlZCBEYW5jZSAyJzogJzRENzEnLFxyXG4gICAgJ0U4UyBTcGl0ZWZ1bCBEYW5jZSAxJzogJzRENkYnLFxyXG4gICAgJ0U4UyBTcGl0ZWZ1bCBEYW5jZSAyJzogJzRENzInLFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgLy8gQnJva2VuIHRldGhlci5cclxuICAgICdFOFMgUmVmdWxnZW50IEZhdGUnOiAnNERBNCcsXHJcbiAgICAvLyBTaGFyZWQgb3JiLCBjb3JyZWN0IGlzIEJyaWdodCBQdWxzZSAoNEQ5NSlcclxuICAgICdFOFMgQmxpbmRpbmcgUHVsc2UnOiAnNEQ5NicsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOFMgUGF0aCBvZiBMaWdodCc6ICc0REExJywgLy8gUHJvdGVhblxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdFOFMgU2hpbmluZyBBcm1vcicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFN0dW5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzk1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBJbnRlcnJ1cHRcclxuICAgICAgaWQ6ICdFOFMgU3RvbmVza2luJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RDg1JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZVVtYnJhLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFOU4gVGhlIEFydCBPZiBEYXJrbmVzcyAxJzogJzUyMjMnLCAvLyBsZWZ0LXJpZ2h0IGNsZWF2ZVxyXG4gICAgJ0U5TiBUaGUgQXJ0IE9mIERhcmtuZXNzIDInOiAnNTIyNCcsIC8vIGxlZnQtcmlnaHQgY2xlYXZlXHJcbiAgICAnRTlOIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1QUZGJywgLy8gZnJvbnRhbCBjbGVhdmUgdHV0b3JpYWwgbWVjaGFuaWNcclxuICAgICdFOU4gV2lkZS1BbmdsZSBQaGFzZXInOiAnNTVFMScsIC8vIHdpZGUtYW5nbGUgXCJzaWRlc1wiXHJcbiAgICAnRTlOIEJhZCBWaWJyYXRpb25zJzogJzU1RTYnLCAvLyB0ZXRoZXJlZCBvdXRzaWRlIGdpYW50IHRyZWUgZ3JvdW5kIGFvZXNcclxuICAgICdFOU4gRWFydGgtU2hhdHRlcmluZyBQYXJ0aWNsZSBCZWFtJzogJzUyMjUnLCAvLyBtaXNzaW5nIHRvd2Vycz9cclxuICAgICdFOU4gQW50aS1BaXIgUGFydGljbGUgQmVhbSc6ICc1NURDJywgLy8gXCJnZXQgb3V0XCIgZHVyaW5nIHBhbmVsc1xyXG4gICAgJ0U5TiBaZXJvLUZvcm0gUGFydGljbGUgQmVhbSAyJzogJzU1REInLCAvLyBDbG9uZSBsaW5lIGFvZXMgdy8gQW50aS1BaXIgUGFydGljbGUgQmVhbVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0U5TiBXaXRoZHJhdyc6ICc1NTM0JywgLy8gU2xvdyB0byBicmVhayBzZWVkIGNoYWluLCBnZXQgc3Vja2VkIGJhY2sgaW4geWlrZXNcclxuICAgICdFOU4gQWV0aGVyb3N5bnRoZXNpcyc6ICc1NTM1JywgLy8gU3RhbmRpbmcgb24gc2VlZHMgZHVyaW5nIGV4cGxvc2lvbiAocG9zc2libHkgdmlhIFdpdGhkcmF3KVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTlOIFplcm8tRm9ybSBQYXJ0aWNsZSBCZWFtIDEnOiAnNTVFQicsIC8vIHRhbmsgbGFzZXIgd2l0aCBtYXJrZXJcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiA1NjFEIEV2aWwgU2VlZCBoaXRzIGV2ZXJ5b25lLCBoYXJkIHRvIGtub3cgaWYgdGhlcmUncyBhIGRvdWJsZSB0YXBcclxuLy8gVE9ETzogZmFsbGluZyB0aHJvdWdoIHBhbmVsIGp1c3QgZG9lcyBkYW1hZ2Ugd2l0aCBubyBhYmlsaXR5IG5hbWUsIGxpa2UgYSBkZWF0aCB3YWxsXHJcbi8vIFRPRE86IHdoYXQgaGFwcGVucyBpZiB5b3UganVtcCBpbiBzZWVkIHRob3Jucz9cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VVbWJyYVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTlTIEJhZCBWaWJyYXRpb25zJzogJzU2MUMnLCAvLyB0ZXRoZXJlZCBvdXRzaWRlIGdpYW50IHRyZWUgZ3JvdW5kIGFvZXNcclxuICAgICdFOVMgV2lkZS1BbmdsZSBQYXJ0aWNsZSBCZWFtJzogJzVCMDAnLCAvLyBhbnRpLWFpciBcInNpZGVzXCJcclxuICAgICdFOVMgV2lkZS1BbmdsZSBQaGFzZXIgVW5saW1pdGVkJzogJzU2MEUnLCAvLyB3aWRlLWFuZ2xlIFwic2lkZXNcIlxyXG4gICAgJ0U5UyBBbnRpLUFpciBQYXJ0aWNsZSBCZWFtJzogJzVCMDEnLCAvLyB3aWRlLWFuZ2xlIFwib3V0XCJcclxuICAgICdFOVMgVGhlIFNlY29uZCBBcnQgT2YgRGFya25lc3MgMSc6ICc1NjAxJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOVMgVGhlIFNlY29uZCBBcnQgT2YgRGFya25lc3MgMic6ICc1NjAyJywgLy8gbGVmdC1yaWdodCBjbGVhdmVcclxuICAgICdFOVMgVGhlIEFydCBPZiBEYXJrbmVzcyAxJzogJzVBOTUnLCAvLyBib3NzIGxlZnQtcmlnaHQgc3VtbW9uL3BhbmVsIGNsZWF2ZVxyXG4gICAgJ0U5UyBUaGUgQXJ0IE9mIERhcmtuZXNzIDInOiAnNUE5NicsIC8vIGJvc3MgbGVmdC1yaWdodCBzdW1tb24vcGFuZWwgY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgQ2xvbmUgMSc6ICc1NjFFJywgLy8gY2xvbmUgbGVmdC1yaWdodCBzdW1tb24gY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBBcnQgT2YgRGFya25lc3MgQ2xvbmUgMic6ICc1NjFGJywgLy8gY2xvbmUgbGVmdC1yaWdodCBzdW1tb24gY2xlYXZlXHJcbiAgICAnRTlTIFRoZSBUaGlyZCBBcnQgT2YgRGFya25lc3MgMSc6ICc1NjAzJywgLy8gdGhpcmQgYXJ0IGxlZnQtcmlnaHQgY2xlYXZlIGluaXRpYWxcclxuICAgICdFOVMgVGhlIFRoaXJkIEFydCBPZiBEYXJrbmVzcyAyJzogJzU2MDQnLCAvLyB0aGlyZCBhcnQgbGVmdC1yaWdodCBjbGVhdmUgaW5pdGlhbFxyXG4gICAgJ0U5UyBBcnQgT2YgRGFya25lc3MnOiAnNTYwNicsIC8vIHRoaXJkIGFydCBsZWZ0LXJpZ2h0IGNsZWF2ZSBmaW5hbFxyXG4gICAgJ0U5UyBGdWxsLVBlcmltaXRlciBQYXJ0aWNsZSBCZWFtJzogJzU2MjknLCAvLyBwYW5lbCBcImdldCBpblwiXHJcbiAgICAnRTlTIERhcmsgQ2hhaW5zJzogJzVGQUMnLCAvLyBTbG93IHRvIGJyZWFrIHBhcnRuZXIgY2hhaW5zXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTlTIFdpdGhkcmF3JzogJzU2MUEnLCAvLyBTbG93IHRvIGJyZWFrIHNlZWQgY2hhaW4sIGdldCBzdWNrZWQgYmFjayBpbiB5aWtlc1xyXG4gICAgJ0U5UyBBZXRoZXJvc3ludGhlc2lzJzogJzU2MUInLCAvLyBTdGFuZGluZyBvbiBzZWVkcyBkdXJpbmcgZXhwbG9zaW9uIChwb3NzaWJseSB2aWEgV2l0aGRyYXcpXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdFOVMgU3R5Z2lhbiBUZW5kcmlscyc6ICc5NTInLCAvLyBzdGFuZGluZyBpbiB0aGUgYnJhbWJsZXNcclxuICB9LFxyXG4gIHNoYXJlV2Fybjoge1xyXG4gICAgJ0U5UyBIeXBlci1Gb2N1c2VkIFBhcnRpY2xlIEJlYW0nOiAnNTVGRCcsIC8vIEFydCBPZiBEYXJrbmVzcyBwcm90ZWFuXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFOVMgQ29uZGVuc2VkIFdpZGUtQW5nbGUgUGFydGljbGUgQmVhbSc6ICc1NjEwJywgLy8gd2lkZS1hbmdsZSBcInRhbmsgbGFzZXJcIlxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgICdFOVMgTXVsdGktUHJvbmdlZCBQYXJ0aWNsZSBCZWFtJzogJzU2MDAnLCAvLyBBcnQgT2YgRGFya25lc3MgUGFydG5lciBTdGFja1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gQW50aS1haXIgXCJ0YW5rIHNwcmVhZFwiLiAgVGhpcyBjYW4gYmUgc3RhY2tlZCBieSB0d28gdGFua3MgaW52dWxuaW5nLlxyXG4gICAgICAvLyBOb3RlOiB0aGlzIHdpbGwgc3RpbGwgc2hvdyBzb21ldGhpbmcgZm9yIGhvbG1nYW5nL2xpdmluZywgYnV0XHJcbiAgICAgIC8vIGFyZ3VhYmx5IGEgaGVhbGVyIG1pZ2h0IG5lZWQgdG8gZG8gc29tZXRoaW5nIGFib3V0IHRoYXQsIHNvIG1heWJlXHJcbiAgICAgIC8vIGl0J3Mgb2sgdG8gc3RpbGwgc2hvdyBhcyBhIHdhcm5pbmc/P1xyXG4gICAgICBpZDogJ0U5UyBDb25kZW5zZWQgQW50aS1BaXIgUGFydGljbGUgQmVhbScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyB0eXBlOiAnMjInLCBpZDogJzU2MTUnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBBbnRpLWFpciBcIm91dFwiLiAgVGhpcyBjYW4gYmUgaW52dWxuZWQgYnkgYSB0YW5rIGFsb25nIHdpdGggdGhlIHNwcmVhZCBhYm92ZS5cclxuICAgICAgaWQ6ICdFOVMgQW50aS1BaXIgUGhhc2VyIFVubGltaXRlZCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzU2MTInLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuRGFtYWdlRnJvbU1hdGNoZXMobWF0Y2hlcykgPiAwLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlTGl0YW55LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTBOIEZvcndhcmQgSW1wbG9zaW9uJzogJzU2QjQnLCAvLyBob3dsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBGb3J3YXJkIFNoYWRvdyBJbXBsb3Npb24nOiAnNTZCNScsIC8vIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxME4gQmFja3dhcmQgSW1wbG9zaW9uJzogJzU2QjcnLCAvLyB0YWlsIGJvc3MgaW1wbG9zaW9uXHJcbiAgICAnRTEwTiBCYWNrd2FyZCBTaGFkb3cgSW1wbG9zaW9uJzogJzU2QjgnLCAvLyB0YWlsIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBOIEJhcmJzIE9mIEFnb255IDEnOiAnNTZEOScsIC8vIFNoYWRvdyBXYXJyaW9yIDMgZG9nIHJvb20gY2xlYXZlXHJcbiAgICAnRTEwTiBCYXJicyBPZiBBZ29ueSAyJzogJzVCMjYnLCAvLyBTaGFkb3cgV2FycmlvciAzIGRvZyByb29tIGNsZWF2ZVxyXG4gICAgJ0UxME4gQ2xvYWsgT2YgU2hhZG93cyc6ICc1QjExJywgLy8gbm9uLXNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxME4gVGhyb25lIE9mIFNoYWRvdyc6ICc1NkM3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxME4gUmlnaHQgR2lnYSBTbGFzaCc6ICc1NkFFJywgLy8gYm9zcyByaWdodCBnaWdhIHNsYXNoXHJcbiAgICAnRTEwTiBSaWdodCBTaGFkb3cgU2xhc2gnOiAnNTZBRicsIC8vIGdpZ2Egc2xhc2ggZnJvbSBzaGFkb3dcclxuICAgICdFMTBOIExlZnQgR2lnYSBTbGFzaCc6ICc1NkIxJywgLy8gYm9zcyBsZWZ0IGdpZ2Egc2xhc2hcclxuICAgICdFMTBOIExlZnQgU2hhZG93IFNsYXNoJzogJzU2QkQnLCAvLyBnaWdhIHNsYXNoIGZyb20gc2hhZG93XHJcbiAgICAnRTEwTiBTaGFkb3d5IEVydXB0aW9uJzogJzU2RTEnLCAvLyBiYWl0ZWQgZ3JvdW5kIGFvZSBtYXJrZXJzIHBhaXJlZCB3aXRoIGJhcmJzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTBOIFNoYWRvd1xcJ3MgRWRnZSc6ICc1NkRCJywgLy8gVGFua2J1c3RlciBzaW5nbGUgdGFyZ2V0IGZvbGxvd3VwXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogaGl0dGluZyBzaGFkb3cgb2YgdGhlIGhlcm8gd2l0aCBhYmlsaXRpZXMgY2FuIGNhdXNlIHlvdSB0byB0YWtlIGRhbWFnZSwgbGlzdCB0aG9zZT9cclxuLy8gICAgICAgZS5nLiBwaWNraW5nIHVwIHlvdXIgZmlyc3QgcGl0Y2ggYm9nIHB1ZGRsZSB3aWxsIGNhdXNlIHlvdSB0byBkaWUgdG8gdGhlIGRhbWFnZVxyXG4vLyAgICAgICB5b3VyIHNoYWRvdyB0YWtlcyBmcm9tIERlZXBzaGFkb3cgTm92YSBvciBEaXN0YW50IFNjcmVhbS5cclxuLy8gVE9ETzogNTczQiBCbGlnaHRpbmcgQmxpdHogaXNzdWVzIGR1cmluZyBsaW1pdCBjdXQgbnVtYmVyc1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUxpdGFueVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEwUyBJbXBsb3Npb24gU2luZ2xlIDEnOiAnNTZGMicsIC8vIHNpbmdsZSB0YWlsIHVwIHNoYWRvdyBpbXBsb3Npb25cclxuICAgICdFMTBTIEltcGxvc2lvbiBTaW5nbGUgMic6ICc1NkVGJywgLy8gc2luZ2xlIGhvd2wgc2hhZG93IGltcGxvc2lvblxyXG4gICAgJ0UxMFMgSW1wbG9zaW9uIFF1YWRydXBsZSAxJzogJzU2RUYnLCAvLyBxdWFkcnVwbGUgc2V0IG9mIHNoYWRvdyBpbXBsb3Npb25zXHJcbiAgICAnRTEwUyBJbXBsb3Npb24gUXVhZHJ1cGxlIDInOiAnNTZGMicsIC8vIHF1YWRydXBsZSBzZXQgb2Ygc2hhZG93IGltcGxvc2lvbnNcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggU2luZ2xlIDEnOiAnNTZFQycsIC8vIEdpZ2Egc2xhc2ggc2luZ2xlIGZyb20gc2hhZG93XHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFNpbmdsZSAyJzogJzU2RUQnLCAvLyBHaWdhIHNsYXNoIHNpbmdsZSBmcm9tIHNoYWRvd1xyXG4gICAgJ0UxMFMgR2lnYSBTbGFzaCBCb3ggMSc6ICc1NzA5JywgLy8gR2lnYSBzbGFzaCBib3ggZnJvbSBmb3VyIGdyb3VuZCBzaGFkb3dzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIEJveCAyJzogJzU3MEQnLCAvLyBHaWdhIHNsYXNoIGJveCBmcm9tIGZvdXIgZ3JvdW5kIHNoYWRvd3NcclxuICAgICdFMTBTIEdpZ2EgU2xhc2ggUXVhZHJ1cGxlIDEnOiAnNTZFQycsIC8vIHF1YWRydXBsZSBzZXQgb2YgZ2lnYSBzbGFzaCBjbGVhdmVzXHJcbiAgICAnRTEwUyBHaWdhIFNsYXNoIFF1YWRydXBsZSAyJzogJzU2RTknLCAvLyBxdWFkcnVwbGUgc2V0IG9mIGdpZ2Egc2xhc2ggY2xlYXZlc1xyXG4gICAgJ0UxMFMgQ2xvYWsgT2YgU2hhZG93cyAxJzogJzVCMTMnLCAvLyBpbml0aWFsIG5vbi1zcXVpZ2dseSBsaW5lIGV4cGxvc2lvbnNcclxuICAgICdFMTBTIENsb2FrIE9mIFNoYWRvd3MgMic6ICc1QjE0JywgLy8gc2Vjb25kIHNxdWlnZ2x5IGxpbmUgZXhwbG9zaW9uc1xyXG4gICAgJ0UxMFMgVGhyb25lIE9mIFNoYWRvdyc6ICc1NzE3JywgLy8gc3RhbmRpbmcgdXAgZ2V0IG91dFxyXG4gICAgJ0UxMFMgU2hhZG93eSBFcnVwdGlvbic6ICc1NzM4JywgLy8gYmFpdGVkIGdyb3VuZCBhb2UgZHVyaW5nIGFtcGxpZmllclxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMFMgU3dhdGggT2YgU2lsZW5jZSAxJzogJzU3MUEnLCAvLyBTaGFkb3cgY2xvbmUgY2xlYXZlICh0b28gY2xvc2UpXHJcbiAgICAnRTEwUyBTd2F0aCBPZiBTaWxlbmNlIDInOiAnNUJCRicsIC8vIFNoYWRvdyBjbG9uZSBjbGVhdmUgKHRpbWVkKVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTEwUyBTaGFkZWZpcmUnOiAnNTczMicsIC8vIHB1cnBsZSB0YW5rIHVtYnJhbCBvcmJzXHJcbiAgICAnRTEwUyBQaXRjaCBCb2cnOiAnNTcyMicsIC8vIG1hcmtlciBzcHJlYWQgdGhhdCBkcm9wcyBhIHNoYWRvdyBwdWRkbGVcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0UxMFMgU2hhZG93XFwncyBFZGdlJzogJzU3MjUnLCAvLyBUYW5rYnVzdGVyIHNpbmdsZSB0YXJnZXQgZm9sbG93dXBcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEwUyBEYW1hZ2UgRG93biBPcmJzJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdGbGFtZXNoYWRvdycsIGVmZmVjdElkOiAnODJDJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IHNvdXJjZTogJ1NjaGF0dGVuZmxhbW1lJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEZyOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnRmxhbW1lIG9tYnJhbGUnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICfjgrfjg6Pjg4njgqbjg5Xjg6zjgqTjg6AnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdkYW1hZ2UnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IGAke21hdGNoZXMuZWZmZWN0fSAocGFydGlhbCBzdGFjaylgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMFMgRGFtYWdlIERvd24gQm9zcycsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIC8vIFNoYWNrbGVzIGJlaW5nIG1lc3NlZCB1cCBhcHBlYXIgdG8ganVzdCBnaXZlIHRoZSBEYW1hZ2UgRG93biwgd2l0aCBub3RoaW5nIGVsc2UuXHJcbiAgICAgIC8vIE1lc3NpbmcgdXAgdG93ZXJzIGlzIHRoZSBUaHJpY2UtQ29tZSBSdWluIGVmZmVjdCAoOUUyKSwgYnV0IGFsc28gRGFtYWdlIERvd24uXHJcbiAgICAgIC8vIFRPRE86IHNvbWUgb2YgdGhlc2Ugd2lsbCBiZSBkdXBsaWNhdGVkIHdpdGggb3RoZXJzLCBsaWtlIGBFMTBTIFRocm9uZSBPZiBTaGFkb3dgLlxyXG4gICAgICAvLyBNYXliZSBpdCdkIGJlIG5pY2UgdG8gZmlndXJlIG91dCBob3cgdG8gcHV0IHRoZSBkYW1hZ2UgbWFya2VyIG9uIHRoYXQ/XHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2hhZG93a2VlcGVyJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAnU2NoYXR0ZW5rw7ZuaWcnLCBlZmZlY3RJZDogJzgyQycgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBzb3VyY2U6ICdSb2kgRGUgTFxcJ09tYnJlJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgc291cmNlOiAn5b2x44Gu546LJywgZWZmZWN0SWQ6ICc4MkMnIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZGFtYWdlJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBgJHttYXRjaGVzLmVmZmVjdH1gIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBTaGFkb3cgV2FycmlvciA0IGRvZyByb29tIGNsZWF2ZVxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBtaXRpZ2F0ZWQgYnkgdGhlIHdob2xlIGdyb3VwLCBzbyBhZGQgYSBkYW1hZ2UgY29uZGl0aW9uLlxyXG4gICAgICBpZDogJ0UxMFMgQmFyYnMgT2YgQWdvbnknLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6IFsnNTcyQScsICc1QjI3J10sIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgY29uZGl0aW9uOiAoZGF0YSwgbWF0Y2hlcykgPT4gZGF0YS5EYW1hZ2VGcm9tTWF0Y2hlcyhtYXRjaGVzKSA+IDAsXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLkVkZW5zUHJvbWlzZUFuYW1vcnBob3NpcyxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgTGlnaHRuaW5nJzogJzU2MkUnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gQnVybnQgU3RyaWtlIEZpcmUnOiAnNTYyQycsIC8vIExpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBCdXJudCBTdHJpa2UgSG9seSc6ICc1NjMwJywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFOIEJ1cm5vdXQnOiAnNTYyRicsIC8vIEJ1cm50IFN0cmlrZSBsaWdodG5pbmcgZXhwYW5zaW9uXHJcbiAgICAnRTExTiBTaGluaW5nIEJsYWRlJzogJzU2MzEnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uXHJcbiAgICAnRTExTiBIYWxvIE9mIEZsYW1lIEJyaWdodGZpcmUnOiAnNTYzQicsIC8vIFJlZCBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMU4gSGFsbyBPZiBMZXZpbiBCcmlnaHRmaXJlJzogJzU2M0MnLCAvLyBCbHVlIGNpcmNsZSBpbnRlcm1pc3Npb24gZXhwbG9zaW9uXHJcbiAgICAnRTExTiBSZXNvdW5kaW5nIENyYWNrJzogJzU2NEQnLCAvLyBEZW1pLUd1a3VtYXR6IDI3MCBkZWdyZWUgZnJvbnRhbCBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBMaWdodG5pbmcnOiAnNTY0NScsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBCdXJudCBTdHJpa2UgRmlyZSc6ICc1NjQzJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm5vdXQnOiAnNTY0NicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdFMTFOIEJsYXN0aW5nIFpvbmUnOiAnNTYzRScsIC8vIFByaXNtYXRpYyBEZWNlcHRpb24gY2hhcmdlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTExTiBCdXJuIE1hcmsnOiAnNTY0RicsIC8vIFBvd2RlciBNYXJrIGRlYnVmZiBleHBsb3Npb25cclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTExTiBCbGFzdGJ1cm4gS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIC8vIDU2MkQgPSBCdXJudCBTdHJpa2UgZmlyZSBmb2xsb3d1cCBkdXJpbmcgbW9zdCBvZiB0aGUgZmlnaHRcclxuICAgICAgLy8gNTY0NCA9IHNhbWUgdGhpbmcsIGJ1dCBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU2MkQnLCAnNTY0NCddIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIDU2NUEvNTY4RCBTaW5zbW9rZSBCb3VuZCBPZiBGYWl0aCBzaGFyZVxyXG4vLyA1NjVFLzU2OTkgQm93c2hvY2sgaGl0cyB0YXJnZXQgb2YgNTY1RCAodHdpY2UpIGFuZCB0d28gb3RoZXJzXHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuRWRlbnNQcm9taXNlQW5hbW9ycGhvc2lzU2F2YWdlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NTInLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjU0JywgLy8gTGluZSBjbGVhdmVcclxuICAgICdFMTFTIEJ1cm50IFN0cmlrZSBIb2x5JzogJzU2NTYnLCAvLyBMaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMVMgU2hpbmluZyBCbGFkZSc6ICc1NjU3JywgLy8gQmFpdGVkIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIEZpcmUnOiAnNTY4RScsIC8vIExpbmUgY2xlYXZlIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgQnVybnQgU3RyaWtlIEN5Y2xlIExpZ2h0bmluZyc6ICc1Njk1JywgLy8gTGluZSBjbGVhdmUgZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBCdXJudCBTdHJpa2UgQ3ljbGUgSG9seSc6ICc1NjlEJywgLy8gTGluZSBjbGVhdmUgZHVyaW5nIEN5Y2xlXHJcbiAgICAnRTExUyBTaGluaW5nIEJsYWRlIEN5Y2xlJzogJzU2OUUnLCAvLyBCYWl0ZWQgZXhwbG9zaW9uIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgSGFsbyBPZiBGbGFtZSBCcmlnaHRmaXJlJzogJzU2NkQnLCAvLyBSZWQgY2lyY2xlIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIEhhbG8gT2YgTGV2aW4gQnJpZ2h0ZmlyZSc6ICc1NjZDJywgLy8gQmx1ZSBjaXJjbGUgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgUG9ydGFsIE9mIEZsYW1lIEJyaWdodCBQdWxzZSc6ICc1NjcxJywgLy8gUmVkIGNhcmQgaW50ZXJtaXNzaW9uIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgUG9ydGFsIE9mIExldmluIEJyaWdodCBQdWxzZSc6ICc1NjcwJywgLy8gQmx1ZSBjYXJkIGludGVybWlzc2lvbiBleHBsb3Npb25cclxuICAgICdFMTFTIFJlc29uYW50IFdpbmRzJzogJzU2ODknLCAvLyBEZW1pLUd1a3VtYXR6IFwiZ2V0IGluXCJcclxuICAgICdFMTFTIFJlc291bmRpbmcgQ3JhY2snOiAnNTY4OCcsIC8vIERlbWktR3VrdW1hdHogMjcwIGRlZ3JlZSBmcm9udGFsIGNsZWF2ZVxyXG4gICAgJ0UxMVMgSW1hZ2UgQnVybnQgU3RyaWtlIExpZ2h0bmluZyc6ICc1NjdCJywgLy8gRmF0ZSBCcmVha2VyJ3MgSW1hZ2UgbGluZSBjbGVhdmVcclxuICAgICdFMTFOIEltYWdlIEJ1cm5vdXQnOiAnNTY3QycsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFOIEltYWdlIEJ1cm50IFN0cmlrZSBGaXJlJzogJzU2NzknLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBsaW5lIGNsZWF2ZVxyXG4gICAgJ0UxMU4gSW1hZ2UgQnVybnQgU3RyaWtlIEhvbHknOiAnNTY3QicsIC8vIEZhdGUgQnJlYWtlcidzIEltYWdlIGxpbmUgY2xlYXZlXHJcbiAgICAnRTExTiBJbWFnZSBTaGluaW5nIEJsYWRlJzogJzU2N0UnLCAvLyBGYXRlIEJyZWFrZXIncyBJbWFnZSBiYWl0ZWQgZXhwbG9zaW9uXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnRTExUyBCdXJub3V0JzogJzU2NTUnLCAvLyBCdXJudCBTdHJpa2UgbGlnaHRuaW5nIGV4cGFuc2lvblxyXG4gICAgJ0UxMVMgQnVybm91dCBDeWNsZSc6ICc1Njk2JywgLy8gQnVybnQgU3RyaWtlIGxpZ2h0bmluZyBleHBhbnNpb25cclxuICAgICdFMTFTIEJsYXN0aW5nIFpvbmUnOiAnNTY3NCcsIC8vIFByaXNtYXRpYyBEZWNlcHRpb24gY2hhcmdlc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRTExUyBFbGVtZW50YWwgQnJlYWsnOiAnNTY2NCcsIC8vIEVsZW1lbnRhbCBCcmVhayBwcm90ZWFuXHJcbiAgICAnRTExUyBFbGVtZW50YWwgQnJlYWsgQ3ljbGUnOiAnNTY4QycsIC8vIEVsZW1lbnRhbCBCcmVhayBwcm90ZWFuIGR1cmluZyBDeWNsZVxyXG4gICAgJ0UxMVMgU2luc21pdGUnOiAnNTY2NycsIC8vIExpZ2h0bmluZyBFbGVtZW50YWwgQnJlYWsgc3ByZWFkXHJcbiAgICAnRTExUyBTaW5zbWl0ZSBDeWNsZSc6ICc1Njk0JywgLy8gTGlnaHRuaW5nIEVsZW1lbnRhbCBCcmVhayBzcHJlYWQgZHVyaW5nIEN5Y2xlXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdFMTFTIEJ1cm4gTWFyayc6ICc1NkEzJywgLy8gUG93ZGVyIE1hcmsgZGVidWZmIGV4cGxvc2lvblxyXG4gICAgJ0UxMVMgU2luc2lnaHQgMSc6ICc1NjYxJywgLy8gSG9seSBCb3VuZCBPZiBGYWl0aCB0ZXRoZXJcclxuICAgICdFMTFTIFNpbnNpZ2h0IDInOiAnNUJDNycsIC8vIEhvbHkgQm91bmQgT2YgRmFpdGggdGV0aGVyIGZyb20gRmF0ZWJyZWFrZXIncyBJbWFnZVxyXG4gICAgJ0UxMVMgU2luc2lnaHQgMyc6ICc1NkEwJywgLy8gSG9seSBCb3VuZCBPZiBGYWl0aCB0ZXRoZXIgZHVyaW5nIEN5Y2xlXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgJ0UxMVMgSG9seSBTaW5zaWdodCBHcm91cCBTaGFyZSc6ICc1NjY5JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTExUyBCbGFzdGJ1cm4gS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIC8vIDU2NTMgPSBCdXJudCBTdHJpa2UgZmlyZSBmb2xsb3d1cCBkdXJpbmcgbW9zdCBvZiB0aGUgZmlnaHRcclxuICAgICAgLy8gNTY3QSA9IHNhbWUgdGhpbmcsIGJ1dCBmcm9tIEZhdGVicmVha2VyJ3MgSW1hZ2VcclxuICAgICAgLy8gNTY4RiA9IHNhbWUgdGhpbmcsIGJ1dCBkdXJpbmcgQ3ljbGUgb2YgRmFpdGhcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU2NTMnLCAnNTY3QScsICc1NjhGJ10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnS25vY2tlZCBvZmYnLFxyXG4gICAgICAgICAgICBkZTogJ1J1bnRlcmdlZmFsbGVuJyxcclxuICAgICAgICAgICAgZnI6ICdBIMOpdMOpIGFzc29tbcOpKGUpJyxcclxuICAgICAgICAgICAgamE6ICfjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOWdoOiQvScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VFdGVybml0eSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEyTiBKdWRnbWVudCBKb2x0IFNpbmdsZSc6ICc1ODVGJywgLy8gUmFtdWggZ2V0IG91dCBjYXN0XHJcbiAgICAnRTEyTiBKdWRnbWVudCBKb2x0JzogJzRFMzAnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3RcclxuICAgICdFMTJOIFRlbXBvcmFyeSBDdXJyZW50IFNpbmdsZSc6ICc1ODVDJywgLy8gTGV2aSBnZXQgdW5kZXIgY2FzdFxyXG4gICAgJ0UxMk4gVGVtcG9yYXJ5IEN1cnJlbnQnOiAnNEUyRCcsIC8vIExldmkgZ2V0IHVuZGVyIGNhc3RcclxuICAgICdFMTJOIENvbmZsYWcgU3RyaWtlIFNpbmdsZSc6ICc1ODVEJywgLy8gSWZyaXQgZ2V0IHNpZGVzIGNhc3RcclxuICAgICdFMTJOIENvbmZsYWcgU3RyaWtlJzogJzRFMkUnLCAvLyBJZnJpdCBnZXQgc2lkZXMgY2FzdFxyXG4gICAgJ0UxMk4gRmVyb3N0b3JtIFNpbmdsZSc6ICc1ODVFJywgLy8gR2FydWRhIGdldCBpbnRlcmNhcmRpbmFscyBjYXN0XHJcbiAgICAnRTEyTiBGZXJvc3Rvcm0nOiAnNEUyRicsIC8vIEdhcnVkYSBnZXQgaW50ZXJjYXJkaW5hbHMgY2FzdFxyXG4gICAgJ0UxMk4gUmFwdHVyb3VzIFJlYWNoIDEnOiAnNTg3OCcsIC8vIEhhaXJjdXRcclxuICAgICdFMTJOIFJhcHR1cm91cyBSZWFjaCAyJzogJzU4NzcnLCAvLyBIYWlyY3V0XHJcbiAgICAnRTEyTiBCb21iIEV4cGxvc2lvbic6ICc1ODZEJywgLy8gU21hbGwgYm9tYiBleHBsb3Npb25cclxuICAgICdFMTJOIFRpdGFuaWMgQm9tYiBFeHBsb3Npb24nOiAnNTg2RicsIC8vIExhcmdlIGJvbWIgZXhwbG9zaW9uXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTJOIEVhcnRoc2hha2VyJzogJzU4ODUnLCAvLyBFYXJ0aHNoYWtlciBvbiBmaXJzdCBwbGF0Zm9ybVxyXG4gICAgJ0UxMk4gUHJvbWlzZSBGcmlnaWQgU3RvbmUgMSc6ICc1ODY3JywgLy8gU2hpdmEgc3ByZWFkIHdpdGggc2xpZGluZ1xyXG4gICAgJ0UxMk4gUHJvbWlzZSBGcmlnaWQgU3RvbmUgMic6ICc1ODY5JywgLy8gU2hpdmEgc3ByZWFkIHdpdGggUmFwdHVyb3VzIFJlYWNoXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCB7IExhbmcgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbGFuZ3VhZ2VzJztcclxuaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgeyBVbnJlYWNoYWJsZUNvZGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbm90X3JlYWNoZWQnO1xyXG5pbXBvcnQgT3V0cHV0cyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvb3V0cHV0cyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgTmV0TWF0Y2hlcyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL25ldF9tYXRjaGVzJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBMb2NhbGVUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvdHJpZ2dlcic7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERhdGEgZXh0ZW5kcyBPb3BzeURhdGEge1xyXG4gIGRlY09mZnNldD86IG51bWJlcjtcclxuICBsYXNlck5hbWVUb051bT86IHsgW25hbWU6IHN0cmluZ106IG51bWJlciB9O1xyXG4gIHNjdWxwdHVyZVRldGhlck5hbWVUb0lkPzogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH07XHJcbiAgc2N1bHB0dXJlWVBvc2l0aW9ucz86IHsgW3NjdWxwdHVyZUlkOiBzdHJpbmddOiBudW1iZXIgfTtcclxuICBibGFkZU9mRmxhbWVDb3VudD86IG51bWJlcjtcclxuICBwaWxsYXJJZFRvT3duZXI/OiB7IFtwaWxsYXJJZDogc3RyaW5nXTogc3RyaW5nIH07XHJcbiAgc21hbGxMaW9uSWRUb093bmVyPzogeyBbcGlsbGFySWQ6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gIHNtYWxsTGlvbk93bmVycz86IHN0cmluZ1tdO1xyXG4gIG5vcnRoQmlnTGlvbj86IHN0cmluZztcclxuICBmaXJlPzogeyBbbmFtZTogc3RyaW5nXTogYm9vbGVhbiB9O1xyXG59XHJcblxyXG4vLyBUT0RPOiBhZGQgc2VwYXJhdGUgZGFtYWdlV2Fybi1lc3F1ZSBpY29uIGZvciBkYW1hZ2UgZG93bnM/XHJcbi8vIFRPRE86IDU4QTYgVW5kZXIgVGhlIFdlaWdodCAvIDU4QjIgQ2xhc3NpY2FsIFNjdWxwdHVyZSBtaXNzaW5nIHNvbWVib2R5IGluIHBhcnR5IHdhcm5pbmc/XHJcbi8vIFRPRE86IDU4Q0EgRGFyayBXYXRlciBJSUkgLyA1OEM1IFNoZWxsIENydXNoZXIgc2hvdWxkIGhpdCBldmVyeW9uZSBpbiBwYXJ0eVxyXG4vLyBUT0RPOiBEYXJrIEFlcm8gSUlJIDU4RDQgc2hvdWxkIG5vdCBiZSBhIHNoYXJlIGV4Y2VwdCBvbiBhZHZhbmNlZCByZWxhdGl2aXR5IGZvciBkb3VibGUgYWVyby5cclxuLy8gKGZvciBnYWlucyBlZmZlY3QsIHNpbmdsZSBhZXJvID0gfjIzIHNlY29uZHMsIGRvdWJsZSBhZXJvID0gfjMxIHNlY29uZHMgZHVyYXRpb24pXHJcblxyXG4vLyBEdWUgdG8gY2hhbmdlcyBpbnRyb2R1Y2VkIGluIHBhdGNoIDUuMiwgb3ZlcmhlYWQgbWFya2VycyBub3cgaGF2ZSBhIHJhbmRvbSBvZmZzZXRcclxuLy8gYWRkZWQgdG8gdGhlaXIgSUQuIFRoaXMgb2Zmc2V0IGN1cnJlbnRseSBhcHBlYXJzIHRvIGJlIHNldCBwZXIgaW5zdGFuY2UsIHNvXHJcbi8vIHdlIGNhbiBkZXRlcm1pbmUgd2hhdCBpdCBpcyBmcm9tIHRoZSBmaXJzdCBvdmVyaGVhZCBtYXJrZXIgd2Ugc2VlLlxyXG4vLyBUaGUgZmlyc3QgMUIgbWFya2VyIGluIHRoZSBlbmNvdW50ZXIgaXMgdGhlIGZvcm1sZXNzIHRhbmtidXN0ZXIsIElEIDAwNEYuXHJcbmNvbnN0IGZpcnN0SGVhZG1hcmtlciA9IHBhcnNlSW50KCcwMERBJywgMTYpO1xyXG5jb25zdCBnZXRIZWFkbWFya2VySWQgPSAoZGF0YTogRGF0YSwgbWF0Y2hlczogTmV0TWF0Y2hlc1snSGVhZE1hcmtlciddKSA9PiB7XHJcbiAgLy8gSWYgd2UgbmFpdmVseSBqdXN0IGNoZWNrICFkYXRhLmRlY09mZnNldCBhbmQgbGVhdmUgaXQsIGl0IGJyZWFrcyBpZiB0aGUgZmlyc3QgbWFya2VyIGlzIDAwREEuXHJcbiAgLy8gKFRoaXMgbWFrZXMgdGhlIG9mZnNldCAwLCBhbmQgITAgaXMgdHJ1ZS4pXHJcbiAgaWYgKHR5cGVvZiBkYXRhLmRlY09mZnNldCA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICBkYXRhLmRlY09mZnNldCA9IHBhcnNlSW50KG1hdGNoZXMuaWQsIDE2KSAtIGZpcnN0SGVhZG1hcmtlcjtcclxuICAvLyBUaGUgbGVhZGluZyB6ZXJvZXMgYXJlIHN0cmlwcGVkIHdoZW4gY29udmVydGluZyBiYWNrIHRvIHN0cmluZywgc28gd2UgcmUtYWRkIHRoZW0gaGVyZS5cclxuICAvLyBGb3J0dW5hdGVseSwgd2UgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCB3aGV0aGVyIG9yIG5vdCB0aGlzIGlzIHJvYnVzdCxcclxuICAvLyBzaW5jZSB3ZSBrbm93IGFsbCB0aGUgSURzIHRoYXQgd2lsbCBiZSBwcmVzZW50IGluIHRoZSBlbmNvdW50ZXIuXHJcbiAgcmV0dXJuIChwYXJzZUludChtYXRjaGVzLmlkLCAxNikgLSBkYXRhLmRlY09mZnNldCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkucGFkU3RhcnQoNCwgJzAnKTtcclxufTtcclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5FZGVuc1Byb21pc2VFdGVybml0eVNhdmFnZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIFJhcHR1cm91cyBSZWFjaCBMZWZ0JzogJzU4QUQnLCAvLyBIYWlyY3V0IHdpdGggbGVmdCBzYWZlIHNpZGVcclxuICAgICdFMTJTIFByb21pc2UgUmFwdHVyb3VzIFJlYWNoIFJpZ2h0JzogJzU4QUUnLCAvLyBIYWlyY3V0IHdpdGggcmlnaHQgc2FmZSBzaWRlXHJcbiAgICAnRTEyUyBQcm9taXNlIFRlbXBvcmFyeSBDdXJyZW50JzogJzRFNDQnLCAvLyBMZXZpIGdldCB1bmRlciBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgQ29uZmxhZyBTdHJpa2UnOiAnNEU0NScsIC8vIElmcml0IGdldCBzaWRlcyBjYXN0IChkYW1hZ2UgZG93bilcclxuICAgICdFMTJTIFByb21pc2UgRmVyb3N0b3JtJzogJzRFNDYnLCAvLyBHYXJ1ZGEgZ2V0IGludGVyY2FyZGluYWxzIGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBKdWRnbWVudCBKb2x0JzogJzRFNDcnLCAvLyBSYW11aCBnZXQgb3V0IGNhc3QgKGRhbWFnZSBkb3duKVxyXG4gICAgJ0UxMlMgUHJvbWlzZSBTaGF0dGVyJzogJzU4OUMnLCAvLyBJY2UgUGlsbGFyIGV4cGxvc2lvbiBpZiB0ZXRoZXIgbm90IGdvdHRlblxyXG4gICAgJ0UxMlMgUHJvbWlzZSBJbXBhY3QnOiAnNThBMScsIC8vIFRpdGFuIGJvbWIgZHJvcFxyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgQmxpenphcmQgSUlJJzogJzU4RDMnLCAvLyBSZWxhdGl2aXR5IGRvbnV0IG1lY2hhbmljXHJcbiAgICAnRTEyUyBPcmFjbGUgQXBvY2FseXBzZSc6ICc1OEU2JywgLy8gTGlnaHQgdXAgY2lyY2xlIGV4cGxvc2lvbnMgKGRhbWFnZSBkb3duKVxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0UxMlMgT3JhY2xlIE1hZWxzdHJvbSc6ICc1OERBJywgLy8gQWR2YW5jZWQgUmVsYXRpdml0eSB0cmFmZmljIGxpZ2h0IGFvZVxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnRTEyUyBPcmFjbGUgRG9vbSc6ICc5RDQnLCAvLyBSZWxhdGl2aXR5IHB1bmlzaG1lbnQgZm9yIG11bHRpcGxlIG1pc3Rha2VzXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFMTJTIFByb21pc2UgRnJpZ2lkIFN0b25lJzogJzU4OUUnLCAvLyBTaGl2YSBzcHJlYWRcclxuICAgICdFMTJTIE9yYWNsZSBEYXJrZXN0IERhbmNlJzogJzRFMzMnLCAvLyBGYXJ0aGVzdCB0YXJnZXQgYmFpdCArIGp1bXAgYmVmb3JlIGtub2NrYmFja1xyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgQ3VycmVudCc6ICc1OEQ4JywgLy8gQmFpdGVkIHRyYWZmaWMgbGlnaHQgbGFzZXJzXHJcbiAgICAnRTEyUyBPcmFjbGUgU3Bpcml0IFRha2VyJzogJzU4QzYnLCAvLyBSYW5kb20ganVtcCBzcHJlYWQgbWVjaGFuaWMgYWZ0ZXIgU2hlbGwgQ3J1c2hlclxyXG4gICAgJ0UxMlMgT3JhY2xlIFNvbWJlciBEYW5jZSAxJzogJzU4QkYnLCAvLyBGYXJ0aGVzdCB0YXJnZXQgYmFpdCBmb3IgRHVhbCBBcG9jYWx5cHNlXHJcbiAgICAnRTEyUyBPcmFjbGUgU29tYmVyIERhbmNlIDInOiAnNThDMCcsIC8vIFNlY29uZCBzb21iZXIgZGFuY2UganVtcFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnRTEyUyBQcm9taXNlIFdlaWdodCBPZiBUaGUgV29ybGQnOiAnNThBNScsIC8vIFRpdGFuIGJvbWIgYmx1ZSBtYXJrZXJcclxuICAgICdFMTJTIFByb21pc2UgUHVsc2UgT2YgVGhlIExhbmQnOiAnNThBMycsIC8vIFRpdGFuIGJvbWIgeWVsbG93IG1hcmtlclxyXG4gICAgJ0UxMlMgT3JhY2xlIERhcmsgRXJ1cHRpb24gMSc6ICc1OENFJywgLy8gSW5pdGlhbCB3YXJtdXAgc3ByZWFkIG1lY2hhbmljXHJcbiAgICAnRTEyUyBPcmFjbGUgRGFyayBFcnVwdGlvbiAyJzogJzU4Q0QnLCAvLyBSZWxhdGl2aXR5IHNwcmVhZCBtZWNoYW5pY1xyXG4gICAgJ0UxMlMgT3JhY2xlIEJsYWNrIEhhbG8nOiAnNThDNycsIC8vIFRhbmtidXN0ZXIgY2xlYXZlXHJcbiAgfSxcclxuICBzb2xvV2Fybjoge1xyXG4gICAgJ0UxMlMgUHJvbWlzZSBGb3JjZSBPZiBUaGUgTGFuZCc6ICc1OEE0JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIC8vIEJpZyBjaXJjbGUgZ3JvdW5kIGFvZXMgZHVyaW5nIFNoaXZhIGp1bmN0aW9uLlxyXG4gICAgICAvLyBUaGlzIGNhbiBiZSBzaGllbGRlZCB0aHJvdWdoIGFzIGxvbmcgYXMgdGhhdCBwZXJzb24gZG9lc24ndCBzdGFjay5cclxuICAgICAgaWQ6ICdFMTJTIEljaWNsZSBJbXBhY3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0RTVBJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIEhlYWRtYXJrZXInLFxyXG4gICAgICB0eXBlOiAnSGVhZE1hcmtlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmhlYWRNYXJrZXIoe30pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBnZXRIZWFkbWFya2VySWQoZGF0YSwgbWF0Y2hlcyk7XHJcbiAgICAgICAgY29uc3QgZmlyc3RMYXNlck1hcmtlciA9ICcwMDkxJztcclxuICAgICAgICBjb25zdCBsYXN0TGFzZXJNYXJrZXIgPSAnMDA5OCc7XHJcbiAgICAgICAgaWYgKGlkID49IGZpcnN0TGFzZXJNYXJrZXIgJiYgaWQgPD0gbGFzdExhc2VyTWFya2VyKSB7XHJcbiAgICAgICAgICAvLyBpZHMgYXJlIHNlcXVlbnRpYWw6ICMxIHNxdWFyZSwgIzIgc3F1YXJlLCAjMyBzcXVhcmUsICM0IHNxdWFyZSwgIzEgdHJpYW5nbGUgZXRjXHJcbiAgICAgICAgICBjb25zdCBkZWNPZmZzZXQgPSBwYXJzZUludChpZCwgMTYpIC0gcGFyc2VJbnQoZmlyc3RMYXNlck1hcmtlciwgMTYpO1xyXG5cclxuICAgICAgICAgIC8vIGRlY09mZnNldCBpcyAwLTcsIHNvIG1hcCAwLTMgdG8gMS00IGFuZCA0LTcgdG8gMS00LlxyXG4gICAgICAgICAgZGF0YS5sYXNlck5hbWVUb051bSA/Pz0ge307XHJcbiAgICAgICAgICBkYXRhLmxhc2VyTmFtZVRvTnVtW21hdGNoZXMudGFyZ2V0XSA9IGRlY09mZnNldCAlIDQgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZXNlIHNjdWxwdHVyZXMgYXJlIGFkZGVkIGF0IHRoZSBzdGFydCBvZiB0aGUgZmlnaHQsIHNvIHdlIG5lZWQgdG8gY2hlY2sgd2hlcmUgdGhleVxyXG4gICAgICAvLyB1c2UgdGhlIFwiQ2xhc3NpY2FsIFNjdWxwdHVyZVwiIGFiaWxpdHkgYW5kIGVuZCB1cCBvbiB0aGUgYXJlbmEgZm9yIHJlYWwuXHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIENoaXNlbGVkIFNjdWxwdHVyZSBDbGFzc2ljYWwgU2N1bHB0dXJlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBUaGlzIHdpbGwgcnVuIHBlciBwZXJzb24gdGhhdCBnZXRzIGhpdCBieSB0aGUgc2FtZSBzY3VscHR1cmUsIGJ1dCB0aGF0J3MgZmluZS5cclxuICAgICAgICAvLyBSZWNvcmQgdGhlIHkgcG9zaXRpb24gb2YgZWFjaCBzY3VscHR1cmUgc28gd2UgY2FuIHVzZSBpdCBmb3IgYmV0dGVyIHRleHQgbGF0ZXIuXHJcbiAgICAgICAgZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zID8/PSB7fTtcclxuICAgICAgICBkYXRhLnNjdWxwdHVyZVlQb3NpdGlvbnNbbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpXSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIFRoZSBzb3VyY2Ugb2YgdGhlIHRldGhlciBpcyB0aGUgcGxheWVyLCB0aGUgdGFyZ2V0IGlzIHRoZSBzY3VscHR1cmUuXHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIENoaXNlbGVkIFNjdWxwdHVyZSBUZXRoZXInLFxyXG4gICAgICB0eXBlOiAnVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgdGFyZ2V0OiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWRbbWF0Y2hlcy5zb3VyY2VdID0gbWF0Y2hlcy50YXJnZXRJZC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgQmxhZGUgT2YgRmxhbWUgQ291bnRlcicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ0NoaXNlbGVkIFNjdWxwdHVyZScsIGlkOiAnNThCMycgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogMSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxLFxyXG4gICAgICBydW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgZGF0YS5ibGFkZU9mRmxhbWVDb3VudCA9IGRhdGEuYmxhZGVPZkZsYW1lQ291bnQgfHwgMDtcclxuICAgICAgICBkYXRhLmJsYWRlT2ZGbGFtZUNvdW50Kys7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAvLyBUaGlzIGlzIHRoZSBDaGlzZWxlZCBTY3VscHR1cmUgbGFzZXIgd2l0aCB0aGUgbGltaXQgY3V0IGRvdHMuXHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIEJsYWRlIE9mIEZsYW1lJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgdHlwZTogJzIyJywgc291cmNlOiAnQ2hpc2VsZWQgU2N1bHB0dXJlJywgaWQ6ICc1OEIzJyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEubGFzZXJOYW1lVG9OdW0gfHwgIWRhdGEuc2N1bHB0dXJlVGV0aGVyTmFtZVRvSWQgfHwgIWRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucylcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gRmluZCB0aGUgcGVyc29uIHdobyBoYXMgdGhpcyBsYXNlciBudW1iZXIgYW5kIGlzIHRldGhlcmVkIHRvIHRoaXMgc3RhdHVlLlxyXG4gICAgICAgIGNvbnN0IG51bWJlciA9IChkYXRhLmJsYWRlT2ZGbGFtZUNvdW50IHx8IDApICsgMTtcclxuICAgICAgICBjb25zdCBzb3VyY2VJZCA9IG1hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBuYW1lcyA9IE9iamVjdC5rZXlzKGRhdGEubGFzZXJOYW1lVG9OdW0pO1xyXG4gICAgICAgIGNvbnN0IHdpdGhOdW0gPSBuYW1lcy5maWx0ZXIoKG5hbWUpID0+IGRhdGEubGFzZXJOYW1lVG9OdW0/LltuYW1lXSA9PT0gbnVtYmVyKTtcclxuICAgICAgICBjb25zdCBvd25lcnMgPSB3aXRoTnVtLmZpbHRlcigobmFtZSkgPT4gZGF0YS5zY3VscHR1cmVUZXRoZXJOYW1lVG9JZD8uW25hbWVdID09PSBzb3VyY2VJZCk7XHJcblxyXG4gICAgICAgIC8vIGlmIHNvbWUgbG9naWMgZXJyb3IsIGp1c3QgYWJvcnQuXHJcbiAgICAgICAgaWYgKG93bmVycy5sZW5ndGggIT09IDEpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFRoZSBvd25lciBoaXR0aW5nIHRoZW1zZWx2ZXMgaXNuJ3QgYSBtaXN0YWtlLi4udGVjaG5pY2FsbHkuXHJcbiAgICAgICAgaWYgKG93bmVyc1swXSA9PT0gbWF0Y2hlcy50YXJnZXQpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIE5vdyB0cnkgdG8gZmlndXJlIG91dCB3aGljaCBzdGF0dWUgaXMgd2hpY2guXHJcbiAgICAgICAgLy8gUGVvcGxlIGNhbiBwdXQgdGhlc2Ugd2hlcmV2ZXIuICBUaGV5IGNvdWxkIGdvIHNpZGV3YXlzLCBvciBkaWFnb25hbCwgb3Igd2hhdGV2ZXIuXHJcbiAgICAgICAgLy8gSXQgc2VlbXMgbW9vb29vc3QgcGVvcGxlIHB1dCB0aGVzZSBub3J0aCAvIHNvdXRoIChvbiB0aGUgc291dGggZWRnZSBvZiB0aGUgYXJlbmEpLlxyXG4gICAgICAgIC8vIExldCdzIHNheSBhIG1pbmltdW0gb2YgMiB5YWxtcyBhcGFydCBpbiB0aGUgeSBkaXJlY3Rpb24gdG8gY29uc2lkZXIgdGhlbSBcIm5vcnRoL3NvdXRoXCIuXHJcbiAgICAgICAgY29uc3QgbWluaW11bVlhbG1zRm9yU3RhdHVlcyA9IDI7XHJcblxyXG4gICAgICAgIGxldCBpc1N0YXR1ZVBvc2l0aW9uS25vd24gPSBmYWxzZTtcclxuICAgICAgICBsZXQgaXNTdGF0dWVOb3J0aCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHNjdWxwdHVyZUlkcyA9IE9iamVjdC5rZXlzKGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9ucyk7XHJcbiAgICAgICAgaWYgKHNjdWxwdHVyZUlkcy5sZW5ndGggPT09IDIgJiYgc2N1bHB0dXJlSWRzLmluY2x1ZGVzKHNvdXJjZUlkKSkge1xyXG4gICAgICAgICAgY29uc3Qgb3RoZXJJZCA9IHNjdWxwdHVyZUlkc1swXSA9PT0gc291cmNlSWQgPyBzY3VscHR1cmVJZHNbMV0gOiBzY3VscHR1cmVJZHNbMF07XHJcbiAgICAgICAgICBjb25zdCBzb3VyY2VZID0gZGF0YS5zY3VscHR1cmVZUG9zaXRpb25zW3NvdXJjZUlkXTtcclxuICAgICAgICAgIGNvbnN0IG90aGVyWSA9IGRhdGEuc2N1bHB0dXJlWVBvc2l0aW9uc1tvdGhlcklkID8/ICcnXTtcclxuICAgICAgICAgIGlmIChzb3VyY2VZID09PSB1bmRlZmluZWQgfHwgb3RoZXJZID09PSB1bmRlZmluZWQgfHwgb3RoZXJJZCA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVW5yZWFjaGFibGVDb2RlKCk7XHJcbiAgICAgICAgICBjb25zdCB5RGlmZiA9IE1hdGguYWJzKHNvdXJjZVkgLSBvdGhlclkpO1xyXG4gICAgICAgICAgaWYgKHlEaWZmID4gbWluaW11bVlhbG1zRm9yU3RhdHVlcykge1xyXG4gICAgICAgICAgICBpc1N0YXR1ZVBvc2l0aW9uS25vd24gPSB0cnVlO1xyXG4gICAgICAgICAgICBpc1N0YXR1ZU5vcnRoID0gc291cmNlWSA8IG90aGVyWTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG93bmVyID0gb3duZXJzWzBdO1xyXG4gICAgICAgIGNvbnN0IG93bmVyTmljayA9IGRhdGEuU2hvcnROYW1lKG93bmVyKTtcclxuICAgICAgICBsZXQgdGV4dCA9IHtcclxuICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgZGU6IGAke21hdGNoZXMuYWJpbGl0eX0gKHZvbiAke293bmVyTmlja30sICMke251bWJlcn0pYCxcclxuICAgICAgICAgIGphOiBgJHttYXRjaGVzLmFiaWxpdHl9ICgke293bmVyTmlja33jgYvjgonjgIEjJHtudW1iZXJ9KWAsXHJcbiAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6IeqJHtvd25lck5pY2t977yMIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogpYCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChpc1N0YXR1ZVBvc2l0aW9uS25vd24gJiYgaXNTdGF0dWVOb3J0aCkge1xyXG4gICAgICAgICAgdGV4dCA9IHtcclxuICAgICAgICAgICAgZW46IGAke21hdGNoZXMuYWJpbGl0eX0gKGZyb20gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9IG5vcnRoKWAsXHJcbiAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAjJHtudW1iZXJ9IG5vcmRlbilgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5YyX44GuJHtvd25lck5pY2t944GL44KJ44CBIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6Ieq5YyX5pa5JHtvd25lck5pY2t977yMIyR7bnVtYmVyfSlgLFxyXG4gICAgICAgICAgICBrbzogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo64yA7IOB7J6QIFwiJHtvd25lck5pY2t9XCIsICR7bnVtYmVyfeuyiCDrtoHsqr0pYCxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc1N0YXR1ZVBvc2l0aW9uS25vd24gJiYgIWlzU3RhdHVlTm9ydGgpIHtcclxuICAgICAgICAgIHRleHQgPSB7XHJcbiAgICAgICAgICAgIGVuOiBgJHttYXRjaGVzLmFiaWxpdHl9IChmcm9tICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBzb3V0aClgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7b3duZXJOaWNrfSwgIyR7bnVtYmVyfSBTw7xkZW4pYCxcclxuICAgICAgICAgICAgamE6IGAke21hdGNoZXMuYWJpbGl0eX0gKOWNl+OBriR7b3duZXJOaWNrfeOBi+OCieOAgSMke251bWJlcn0pYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHquWNl+aWuSR7b3duZXJOaWNrfe+8jCMke251bWJlcn0pYCxcclxuICAgICAgICAgICAga286IGAke21hdGNoZXMuYWJpbGl0eX0gKOuMgOyDgeyekCBcIiR7b3duZXJOaWNrfVwiLCAke251bWJlcn3rsogg64Ko7Kq9KWAsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgYmxhbWU6IG93bmVyLFxyXG4gICAgICAgICAgdGV4dDogdGV4dCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgSWNlIFBpbGxhciBUcmFja2VyJyxcclxuICAgICAgdHlwZTogJ1RldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0ljZSBQaWxsYXInLCBpZDogWycwMDAxJywgJzAwMzknXSB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEucGlsbGFySWRUb093bmVyID8/PSB7fTtcclxuICAgICAgICBkYXRhLnBpbGxhcklkVG9Pd25lclttYXRjaGVzLnNvdXJjZUlkXSA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgSWNlIFBpbGxhciBNaXN0YWtlJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnSWNlIFBpbGxhcicsIGlkOiAnNTg5QicgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEucGlsbGFySWRUb093bmVyKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBtYXRjaGVzLnRhcmdldCAhPT0gZGF0YS5waWxsYXJJZFRvT3duZXJbbWF0Y2hlcy5zb3VyY2VJZF07XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcGlsbGFyT3duZXIgPSBkYXRhLlNob3J0TmFtZShkYXRhLnBpbGxhcklkVG9Pd25lcj8uW21hdGNoZXMuc291cmNlSWRdKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBkZTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAodm9uICR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGZyOiBgJHttYXRjaGVzLmFiaWxpdHl9IChkZSAke3BpbGxhck93bmVyfSlgLFxyXG4gICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtwaWxsYXJPd25lcn3jgYvjgokpYCxcclxuICAgICAgICAgICAgY246IGAke21hdGNoZXMuYWJpbGl0eX0gKOadpeiHqiR7cGlsbGFyT3duZXJ9KWAsXHJcbiAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke3BpbGxhck93bmVyfVwiKWAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBHYWluIEZpcmUgUmVzaXN0YW5jZSBEb3duIElJJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gVGhlIEJlYXN0bHkgU2N1bHB0dXJlIGdpdmVzIGEgMyBzZWNvbmQgZGVidWZmLCB0aGUgUmVnYWwgU2N1bHB0dXJlIGdpdmVzIGEgMTRzIG9uZS5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzgzMicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmZpcmUgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIFByb21pc2UgTG9zZSBGaXJlIFJlc2lzdGFuY2UgRG93biBJSScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICc4MzInIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5maXJlID8/PSB7fTtcclxuICAgICAgICBkYXRhLmZpcmVbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBTbWFsbCBMaW9uIFRldGhlcicsXHJcbiAgICAgIHR5cGU6ICdUZXRoZXInLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICdCZWFzdGx5IFNjdWxwdHVyZScsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RGU6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQWJiaWxkIEVpbmVzIEzDtndlbicsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnQ3LDqWF0aW9uIEzDqW9uaW5lJywgaWQ6ICcwMDExJyB9KSxcclxuICAgICAgbmV0UmVnZXhKYTogTmV0UmVnZXhlcy50ZXRoZXIoeyBzb3VyY2U6ICflibXjgonjgozjgZ/njYXlrZAnLCBpZDogJzAwMTEnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25JZFRvT3duZXIgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuc21hbGxMaW9uSWRUb093bmVyW21hdGNoZXMuc291cmNlSWQudG9VcHBlckNhc2UoKV0gPSBtYXRjaGVzLnRhcmdldDtcclxuICAgICAgICBkYXRhLnNtYWxsTGlvbk93bmVycyA/Pz0gW107XHJcbiAgICAgICAgZGF0YS5zbWFsbExpb25Pd25lcnMucHVzaChtYXRjaGVzLnRhcmdldCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBTbWFsbCBMaW9uIExpb25zYmxhemUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQmVhc3RseSBTY3VscHR1cmUnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleERlOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAnQWJiaWxkIEVpbmVzIEzDtndlbicsIGlkOiAnNThCOScgfSksXHJcbiAgICAgIG5ldFJlZ2V4RnI6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBzb3VyY2U6ICdDcsOpYXRpb24gTMOpb25pbmUnLCBpZDogJzU4QjknIH0pLFxyXG4gICAgICBuZXRSZWdleEphOiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgc291cmNlOiAn5Ym144KJ44KM44Gf542F5a2QJywgaWQ6ICc1OEI5JyB9KSxcclxuICAgICAgbWlzdGFrZTogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICAvLyBGb2xrcyBiYWl0aW5nIHRoZSBiaWcgbGlvbiBzZWNvbmQgY2FuIHRha2UgdGhlIGZpcnN0IHNtYWxsIGxpb24gaGl0LFxyXG4gICAgICAgIC8vIHNvIGl0J3Mgbm90IHN1ZmZpY2llbnQgdG8gY2hlY2sgb25seSB0aGUgb3duZXIuXHJcbiAgICAgICAgaWYgKCFkYXRhLnNtYWxsTGlvbk93bmVycylcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zdCBvd25lciA9IGRhdGEuc21hbGxMaW9uSWRUb093bmVyPy5bbWF0Y2hlcy5zb3VyY2VJZC50b1VwcGVyQ2FzZSgpXTtcclxuICAgICAgICBpZiAoIW93bmVyKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmIChtYXRjaGVzLnRhcmdldCA9PT0gb3duZXIpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB0YXJnZXQgYWxzbyBoYXMgYSBzbWFsbCBsaW9uIHRldGhlciwgdGhhdCBpcyBhbHdheXMgYSBtaXN0YWtlLlxyXG4gICAgICAgIC8vIE90aGVyd2lzZSwgaXQncyBvbmx5IGEgbWlzdGFrZSBpZiB0aGUgdGFyZ2V0IGhhcyBhIGZpcmUgZGVidWZmLlxyXG4gICAgICAgIGNvbnN0IGhhc1NtYWxsTGlvbiA9IGRhdGEuc21hbGxMaW9uT3duZXJzLmluY2x1ZGVzKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgICBjb25zdCBoYXNGaXJlRGVidWZmID0gZGF0YS5maXJlICYmIGRhdGEuZmlyZVttYXRjaGVzLnRhcmdldF07XHJcblxyXG4gICAgICAgIGlmIChoYXNTbWFsbExpb24gfHwgaGFzRmlyZURlYnVmZikge1xyXG4gICAgICAgICAgY29uc3Qgb3duZXJOaWNrID0gZGF0YS5TaG9ydE5hbWUob3duZXIpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGNlbnRlclkgPSAtNzU7XHJcbiAgICAgICAgICBjb25zdCB4ID0gcGFyc2VGbG9hdChtYXRjaGVzLngpO1xyXG4gICAgICAgICAgY29uc3QgeSA9IHBhcnNlRmxvYXQobWF0Y2hlcy55KTtcclxuICAgICAgICAgIGxldCBkaXJPYmogPSBudWxsO1xyXG4gICAgICAgICAgaWYgKHkgPCBjZW50ZXJZKSB7XHJcbiAgICAgICAgICAgIGlmICh4ID4gMClcclxuICAgICAgICAgICAgICBkaXJPYmogPSBPdXRwdXRzLmRpck5FO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJOVztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh4ID4gMClcclxuICAgICAgICAgICAgICBkaXJPYmogPSBPdXRwdXRzLmRpclNFO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgZGlyT2JqID0gT3V0cHV0cy5kaXJTVztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAgIGJsYW1lOiBvd25lcixcclxuICAgICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgICBlbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZnJvbSAke293bmVyTmlja30sICR7ZGlyT2JqWydlbiddfSlgLFxyXG4gICAgICAgICAgICAgIGRlOiBgJHttYXRjaGVzLmFiaWxpdHl9ICh2b24gJHtvd25lck5pY2t9LCAke2Rpck9ialsnZGUnXX0pYCxcclxuICAgICAgICAgICAgICBmcjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoZGUgJHtvd25lck5pY2t9LCAke2Rpck9ialsnZnInXX0pYCxcclxuICAgICAgICAgICAgICBqYTogYCR7bWF0Y2hlcy5hYmlsaXR5fSAoJHtvd25lck5pY2t944GL44KJLCAke2Rpck9ialsnamEnXX0pYCxcclxuICAgICAgICAgICAgICBjbjogYCR7bWF0Y2hlcy5hYmlsaXR5fSAo5p2l6IeqJHtvd25lck5pY2t9LCAke2Rpck9ialsnY24nXX1gLFxyXG4gICAgICAgICAgICAgIGtvOiBgJHttYXRjaGVzLmFiaWxpdHl9ICjrjIDsg4HsnpAgXCIke293bmVyTmlja31cIiwgJHtkaXJPYmpbJ2tvJ119KWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBQcm9taXNlIE5vcnRoIEJpZyBMaW9uJyxcclxuICAgICAgdHlwZTogJ0FkZGVkQ29tYmF0YW50JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWRkZWRDb21iYXRhbnRGdWxsKHsgbmFtZTogJ1JlZ2FsIFNjdWxwdHVyZScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBjb25zdCB5ID0gcGFyc2VGbG9hdChtYXRjaGVzLnkpO1xyXG4gICAgICAgIGNvbnN0IGNlbnRlclkgPSAtNzU7XHJcbiAgICAgICAgaWYgKHkgPCBjZW50ZXJZKVxyXG4gICAgICAgICAgZGF0YS5ub3J0aEJpZ0xpb24gPSBtYXRjaGVzLmlkLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0UxMlMgUHJvbWlzZSBCaWcgTGlvbiBLaW5nc2JsYXplJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnUmVnYWwgU2N1bHB0dXJlJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbmV0UmVnZXhEZTogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnQWJiaWxkIGVpbmVzIGdyb8OfZW4gTMO2d2VuJywgaWQ6ICc0RjlFJyB9KSxcclxuICAgICAgbmV0UmVnZXhGcjogTmV0UmVnZXhlcy5hYmlsaXR5KHsgc291cmNlOiAnY3LDqWF0aW9uIGzDqW9uaW5lIHJveWFsZScsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG5ldFJlZ2V4SmE6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IHNvdXJjZTogJ+WJteOCieOCjOOBn+eNheWtkOeOiycsIGlkOiAnNEY5RScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2luZ2xlVGFyZ2V0ID0gbWF0Y2hlcy50eXBlID09PSAnMjEnO1xyXG4gICAgICAgIGNvbnN0IGhhc0ZpcmVEZWJ1ZmYgPSBkYXRhLmZpcmUgJiYgZGF0YS5maXJlW21hdGNoZXMudGFyZ2V0XTtcclxuXHJcbiAgICAgICAgLy8gU3VjY2VzcyBpZiBvbmx5IG9uZSBwZXJzb24gdGFrZXMgaXQgYW5kIHRoZXkgaGF2ZSBubyBmaXJlIGRlYnVmZi5cclxuICAgICAgICBpZiAoc2luZ2xlVGFyZ2V0ICYmICFoYXNGaXJlRGVidWZmKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBub3J0aEJpZ0xpb246IExvY2FsZVRleHQgPSB7XHJcbiAgICAgICAgICBlbjogJ25vcnRoIGJpZyBsaW9uJyxcclxuICAgICAgICAgIGRlOiAnTm9yZGVtLCBncm/Dn2VyIEzDtndlJyxcclxuICAgICAgICAgIGphOiAn5aSn44Op44Kk44Kq44OzKOWMlyknLFxyXG4gICAgICAgICAgY246ICfljJfmlrnlpKfni67lrZAnLFxyXG4gICAgICAgICAga286ICfrtoHsqr0g7YGwIOyCrOyekCcsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzb3V0aEJpZ0xpb246IExvY2FsZVRleHQgPSB7XHJcbiAgICAgICAgICBlbjogJ3NvdXRoIGJpZyBsaW9uJyxcclxuICAgICAgICAgIGRlOiAnU8O8ZGVuLCBncm/Dn2VyIEzDtndlJyxcclxuICAgICAgICAgIGphOiAn5aSn44Op44Kk44Kq44OzKOWNlyknLFxyXG4gICAgICAgICAgY246ICfljZfmlrnlpKfni67lrZAnLFxyXG4gICAgICAgICAga286ICfrgqjsqr0g7YGwIOyCrOyekCcsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBzaGFyZWQ6IExvY2FsZVRleHQgPSB7XHJcbiAgICAgICAgICBlbjogJ3NoYXJlZCcsXHJcbiAgICAgICAgICBkZTogJ2dldGVpbHQnLFxyXG4gICAgICAgICAgamE6ICfph43jga3jgZ8nLFxyXG4gICAgICAgICAgY246ICfph43lj6AnLFxyXG4gICAgICAgICAga286ICfqsJnsnbQg66ee7J2MJyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGZpcmVEZWJ1ZmY6IExvY2FsZVRleHQgPSB7XHJcbiAgICAgICAgICBlbjogJ2hhZCBmaXJlJyxcclxuICAgICAgICAgIGRlOiAnaGF0dGUgRmV1ZXInLFxyXG4gICAgICAgICAgamE6ICfngo7ku5jjgY0nLFxyXG4gICAgICAgICAgY246ICfngatEZWJ1ZmYnLFxyXG4gICAgICAgICAga286ICftmZTsl7wg65SU67KE7ZSEIOuwm+ydjCcsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgbGFiZWxzID0gW107XHJcbiAgICAgICAgY29uc3QgbGFuZzogTGFuZyA9IGRhdGEub3B0aW9ucy5QYXJzZXJMYW5ndWFnZTtcclxuXHJcbiAgICAgICAgaWYgKGRhdGEubm9ydGhCaWdMaW9uKSB7XHJcbiAgICAgICAgICBpZiAoZGF0YS5ub3J0aEJpZ0xpb24gPT09IG1hdGNoZXMuc291cmNlSWQpXHJcbiAgICAgICAgICAgIGxhYmVscy5wdXNoKG5vcnRoQmlnTGlvbltsYW5nXSA/PyBub3J0aEJpZ0xpb25bJ2VuJ10pO1xyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBsYWJlbHMucHVzaChzb3V0aEJpZ0xpb25bbGFuZ10gPz8gc291dGhCaWdMaW9uWydlbiddKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzaW5nbGVUYXJnZXQpXHJcbiAgICAgICAgICBsYWJlbHMucHVzaChzaGFyZWRbbGFuZ10gPz8gc2hhcmVkWydlbiddKTtcclxuICAgICAgICBpZiAoaGFzRmlyZURlYnVmZilcclxuICAgICAgICAgIGxhYmVscy5wdXNoKGZpcmVEZWJ1ZmZbbGFuZ10gPz8gZmlyZURlYnVmZlsnZW4nXSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IGAke21hdGNoZXMuYWJpbGl0eX0gKCR7bGFiZWxzLmpvaW4oJywgJyl9KWAsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRTEyUyBLbm9ja2VkIE9mZicsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgLy8gNTg5QSA9IEljZSBQaWxsYXIgKHByb21pc2Ugc2hpdmEgcGhhc2UpXHJcbiAgICAgIC8vIDU4QjYgPSBQYWxtIE9mIFRlbXBlcmFuY2UgKHByb21pc2Ugc3RhdHVlIGhhbmQpXHJcbiAgICAgIC8vIDU4QjcgPSBMYXNlciBFeWUgKHByb21pc2UgbGlvbiBwaGFzZSlcclxuICAgICAgLy8gNThDMSA9IERhcmtlc3QgRGFuY2UgKG9yYWNsZSB0YW5rIGp1bXAgKyBrbm9ja2JhY2sgaW4gYmVnaW5uaW5nIGFuZCB0cmlwbGUgYXBvYylcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzU4OUEnLCAnNThCNicsICc1OEI3JywgJzU4QzEnXSB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdFMTJTIE9yYWNsZSBTaGFkb3dleWUnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc1OEQyJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBUT0RPOiB3YXJuaW5nIGZvciB0YWtpbmcgRGlhbW9uZCBGbGFzaCAoNUZBMSkgc3RhY2sgb24geW91ciBvd24/XHJcblxyXG4vLyBEaWFtb25kIFdlYXBvbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVDbG91ZERlY2tFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDEnOiAnNUZBRicsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgMic6ICc1RkIyJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyAzJzogJzVGQ0QnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDQnOiAnNUZDRScsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEFydHMgNSc6ICc1RkNGJywgLy8gQXVyaSBBcnRzIGRhc2hlcy9leHBsb3Npb25zXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQXJ0cyA2JzogJzVGRjgnLCAvLyBBdXJpIEFydHMgZGFzaGVzL2V4cGxvc2lvbnNcclxuICAgICdEaWFtb25kRXggQXVyaSBBcnRzIDcnOiAnNjE1OScsIC8vIEF1cmkgQXJ0cyBkYXNoZXMvZXhwbG9zaW9uc1xyXG4gICAgJ0RpYW1vbmRFeCBBcnRpY3VsYXRlZCBCaXQgQWV0aGVyaWFsIEJ1bGxldCc6ICc1RkFCJywgLy8gYml0IGxhc2VycyBkdXJpbmcgYWxsIHBoYXNlc1xyXG4gICAgJ0RpYW1vbmRFeCBEaWFtb25kIFNocmFwbmVsIDEnOiAnNUZDQicsIC8vIGNoYXNpbmcgY2lyY2xlc1xyXG4gICAgJ0RpYW1vbmRFeCBEaWFtb25kIFNocmFwbmVsIDInOiAnNUZDQycsIC8vIGNoYXNpbmcgY2lyY2xlc1xyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0RpYW1vbmRFeCBDbGF3IFN3aXBlIExlZnQnOiAnNUZDMicsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZEV4IENsYXcgU3dpcGUgUmlnaHQnOiAnNUZDMycsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZEV4IEF1cmkgQ3ljbG9uZSAxJzogJzVGRDEnLCAvLyBzdGFuZGluZyBvbiB0aGUgYmx1ZSBrbm9ja2JhY2sgcHVja1xyXG4gICAgJ0RpYW1vbmRFeCBBdXJpIEN5Y2xvbmUgMic6ICc1RkQyJywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kRXggQWlyc2hpcFxcJ3MgQmFuZSAxJzogJzVGRkUnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gICAgJ0RpYW1vbmRFeCBBaXJzaGlwXFwncyBCYW5lIDInOiAnNUZEMycsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdEaWFtb25kRXggVGFuayBMYXNlcnMnOiAnNUZDOCcsIC8vIGNsZWF2aW5nIHllbGxvdyBsYXNlcnMgb24gdG9wIHR3byBlbm1pdHlcclxuICAgICdEaWFtb25kRXggSG9taW5nIExhc2VyJzogJzVGQzQnLCAvLyBBZGFtYW50ZSBQdXJnZSBzcHJlYWRcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgJ0RpYW1vbmRFeCBGbG9vZCBSYXknOiAnNUZDNycsIC8vIFwibGltaXQgY3V0XCIgY2xlYXZlc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEaWFtb25kRXggVmVydGljYWwgQ2xlYXZlIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1RkQwJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBEaWFtb25kIFdlYXBvbiBOb3JtYWxcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUNsb3VkRGVjayxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQXVyaSBBcnRzJzogJzVGRTMnLCAvLyBBdXJpIEFydHMgZGFzaGVzXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBJbml0aWFsJzogJzVGRTEnLCAvLyBpbml0aWFsIGNpcmNsZSBvZiBEaWFtb25kIFNocmFwbmVsXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gRGlhbW9uZCBTaHJhcG5lbCBDaGFzaW5nJzogJzVGRTInLCAvLyBmb2xsb3d1cCBjaXJjbGVzIGZyb20gRGlhbW9uZCBTaHJhcG5lbFxyXG4gICAgJ0RpYW1vbmQgV2VhcG9uIEFldGhlcmlhbCBCdWxsZXQnOiAnNUZENScsIC8vIGJpdCBsYXNlcnNcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdEaWFtb25kIFdlYXBvbiBDbGF3IFN3aXBlIExlZnQnOiAnNUZEOScsIC8vIEFkYW1hbnQgUHVyZ2UgcGxhdGZvcm0gY2xlYXZlXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQ2xhdyBTd2lwZSBSaWdodCc6ICc1RkRBJywgLy8gQWRhbWFudCBQdXJnZSBwbGF0Zm9ybSBjbGVhdmVcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMSc6ICc1RkU2JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBdXJpIEN5Y2xvbmUgMic6ICc1RkU3JywgLy8gc3RhbmRpbmcgb24gdGhlIGJsdWUga25vY2tiYWNrIHB1Y2tcclxuICAgICdEaWFtb25kIFdlYXBvbiBBaXJzaGlwXFwncyBCYW5lIDEnOiAnNUZFOCcsIC8vIGRlc3Ryb3lpbmcgb25lIG9mIHRoZSBwbGF0Zm9ybXMgYWZ0ZXIgQXVyaSBDeWNsb25lXHJcbiAgICAnRGlhbW9uZCBXZWFwb24gQWlyc2hpcFxcJ3MgQmFuZSAyJzogJzVGRkUnLCAvLyBkZXN0cm95aW5nIG9uZSBvZiB0aGUgcGxhdGZvcm1zIGFmdGVyIEF1cmkgQ3ljbG9uZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRGlhbW9uZCBXZWFwb24gSG9taW5nIExhc2VyJzogJzVGREInLCAvLyBzcHJlYWQgbWFya2Vyc1xyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdEaWFtb25kIFdlYXBvbiBWZXJ0aWNhbCBDbGVhdmUgS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzVGRTUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2FzdHJ1bU1hcmludW1FeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdFbWVyYWxkRXggSGVhdCBSYXknOiAnNUJEMycsIC8vIEVtZXJhbGQgQmVhbSBpbml0aWFsIGNvbmFsXHJcbiAgICAnRW1lcmFsZEV4IFBob3RvbiBMYXNlciAxJzogJzU1N0InLCAvLyBFbWVyYWxkIEJlYW0gaW5zaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGRFeCBQaG90b24gTGFzZXIgMic6ICc1NTdEJywgLy8gRW1lcmFsZCBCZWFtIG91dHNpZGUgY2lyY2xlXHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5IDEnOiAnNTU3QScsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZEV4IEhlYXQgUmF5IDInOiAnNTU3OScsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZEV4IEV4cGxvc2lvbic6ICc1NTk2JywgLy8gTWFnaXRlayBNaW5lIGV4cGxvc2lvblxyXG4gICAgJ0VtZXJhbGRFeCBUZXJ0aXVzIFRlcm1pbnVzIEVzdCBJbml0aWFsJzogJzU1Q0QnLCAvLyBzd29yZCBpbml0aWFsIHB1ZGRsZXNcclxuICAgICdFbWVyYWxkRXggVGVydGl1cyBUZXJtaW51cyBFc3QgRXhwbG9zaW9uJzogJzU1Q0UnLCAvLyBzd29yZCBleHBsb3Npb25zXHJcbiAgICAnRW1lcmFsZEV4IEFpcmJvcm5lIEV4cGxvc2lvbic6ICc1NUJEJywgLy8gZXhhZmxhcmVcclxuICAgICdFbWVyYWxkRXggU2lkZXNjYXRoZSAxJzogJzU1RDQnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGRFeCBTaWRlc2NhdGhlIDInOiAnNTVENScsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZEV4IFNob3RzIEZpcmVkJzogJzU1QjcnLCAvLyByYW5rIGFuZCBmaWxlIHNvbGRpZXJzXHJcbiAgICAnRW1lcmFsZEV4IFNlY3VuZHVzIFRlcm1pbnVzIEVzdCc6ICc1NUNCJywgLy8gZHJvcHBlZCArIGFuZCB4IGhlYWRtYXJrZXJzXHJcbiAgICAnRW1lcmFsZEV4IEV4cGlyZSc6ICc1NUQxJywgLy8gZ3JvdW5kIGFvZSBvbiBib3NzIFwiZ2V0IG91dFwiXHJcbiAgICAnRW1lcmFsZEV4IEFpcmUgVGFtIFN0b3JtJzogJzU1RDAnLCAvLyBleHBhbmRpbmcgcmVkIGFuZCBibGFjayBncm91bmQgYW9lXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdFbWVyYWxkRXggRGl2aWRlIEV0IEltcGVyYSc6ICc1NUQ5JywgLy8gbm9uLXRhbmsgcHJvdGVhbiBzcHJlYWRcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAxJzogJzU1QzQnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAyJzogJzU1QzUnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCAzJzogJzU1QzYnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICAgICdFbWVyYWxkRXggUHJpbXVzIFRlcm1pbnVzIEVzdCA0JzogJzU1QzcnLCAvLyBrbm9ja2JhY2sgYXJyb3dcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuQ2FzdHJ1bU1hcmludW0sXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5JzogJzRGOUQnLCAvLyBFbWVyYWxkIEJlYW0gaW5pdGlhbCBjb25hbFxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAxJzogJzU1MzQnLCAvLyBFbWVyYWxkIEJlYW0gaW5zaWRlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAyJzogJzU1MzYnLCAvLyBFbWVyYWxkIEJlYW0gbWlkZGxlIGNpcmNsZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFBob3RvbiBMYXNlciAzJzogJzU1MzgnLCAvLyBFbWVyYWxkIEJlYW0gb3V0c2lkZSBjaXJjbGVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBIZWF0IFJheSAxJzogJzU1MzInLCAvLyBFbWVyYWxkIEJlYW0gcm90YXRpbmcgcHVsc2luZyBsYXNlclxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIEhlYXQgUmF5IDInOiAnNTUzMycsIC8vIEVtZXJhbGQgQmVhbSByb3RhdGluZyBwdWxzaW5nIGxhc2VyXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gTWFnbmV0aWMgTWluZSBFeHBsb3Npb24nOiAnNUIwNCcsIC8vIHJlcHVsc2luZyBtaW5lIGV4cGxvc2lvbnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDEnOiAnNTUzRicsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gU2lkZXNjYXRoZSAyJzogJzU1NDAnLCAvLyBsZWZ0L3JpZ2h0IGNsZWF2ZVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNpZGVzY2F0aGUgMyc6ICc1NTQxJywgLy8gbGVmdC9yaWdodCBjbGVhdmVcclxuICAgICdFbWVyYWxkIFdlYXBvbiBTaWRlc2NhdGhlIDQnOiAnNTU0MicsIC8vIGxlZnQvcmlnaHQgY2xlYXZlXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gQml0IFN0b3JtJzogJzU1NEEnLCAvLyBcImdldCBpblwiXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRW1lcmFsZCBDcnVzaGVyJzogJzU1M0MnLCAvLyBibHVlIGtub2NrYmFjayBwdWNrXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gUHVsc2UgTGFzZXInOiAnNTU0OCcsIC8vIGxpbmUgYW9lXHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRW5lcmd5IEFldGhlcm9wbGFzbSc6ICc1NTUxJywgLy8gaGl0dGluZyBhIGdsb3d5IG9yYlxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgR3JvdW5kJzogJzU1NkYnLCAvLyBwYXJ0eSB0YXJnZXRlZCBncm91bmQgY29uZXNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBQcmltdXMgVGVybWludXMgRXN0JzogJzRCM0UnLCAvLyBncm91bmQgY2lyY2xlIGR1cmluZyBhcnJvdyBoZWFkbWFya2Vyc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNlY3VuZHVzIFRlcm1pbnVzIEVzdCc6ICc1NTZBJywgLy8gWCAvICsgaGVhZG1hcmtlcnNcclxuICAgICdFbWVyYWxkIFdlYXBvbiBUZXJ0aXVzIFRlcm1pbnVzIEVzdCc6ICc1NTZEJywgLy8gdHJpcGxlIHN3b3Jkc1xyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIFNob3RzIEZpcmVkJzogJzU1NUYnLCAvLyBsaW5lIGFvZXMgZnJvbSBzb2xkaWVyc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnRW1lcmFsZCBXZWFwb24gRGl2aWRlIEV0IEltcGVyYSBQMSc6ICc1NTRFJywgLy8gdGFua2J1c3RlciwgcHJvYmFibHkgY2xlYXZlcywgcGhhc2UgMVxyXG4gICAgJ0VtZXJhbGQgV2VhcG9uIERpdmlkZSBFdCBJbXBlcmEgUDInOiAnNTU3MCcsIC8vIHRhbmtidXN0ZXIsIHByb2JhYmx5IGNsZWF2ZXMsIHBoYXNlIDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnRW1lcmFsZCBXZWFwb24gRW1lcmFsZCBDcnVzaGVyIEtub2NrZWQgT2ZmJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc1NTNFJyB9KSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICBuYW1lOiBtYXRjaGVzLnRhcmdldCxcclxuICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgZW46ICdLbm9ja2VkIG9mZicsXHJcbiAgICAgICAgICAgIGRlOiAnUnVudGVyZ2VmYWxsZW4nLFxyXG4gICAgICAgICAgICBmcjogJ0Egw6l0w6kgYXNzb21tw6koZSknLFxyXG4gICAgICAgICAgICBqYTogJ+ODjuODg+OCr+ODkOODg+OCrycsXHJcbiAgICAgICAgICAgIGNuOiAn5Ye76YCA5Z2g6JC9JyxcclxuICAgICAgICAgICAga286ICfrhInrsLEnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gR2V0dGluZyBrbm9ja2VkIGludG8gYSB3YWxsIGZyb20gdGhlIGFycm93IGhlYWRtYXJrZXIuXHJcbiAgICAgIGlkOiAnRW1lcmFsZCBXZWFwb24gUHJpbXVzIFRlcm1pbnVzIEVzdCBXYWxsJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6IFsnNTU2MycsICc1NTY0J10gfSksXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnUHVzaGVkIGludG8gd2FsbCcsXHJcbiAgICAgICAgICAgIGRlOiAnUsO8Y2tzdG/DnyBpbiBkaWUgV2FuZCcsXHJcbiAgICAgICAgICAgIGphOiAn5aOB44G444OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDoh7PlopknLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5pbXBvcnQgeyBwbGF5ZXJEYW1hZ2VGaWVsZHMgfSBmcm9tICcuLi8uLi8uLi9vb3BzeV9jb21tb24nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEYXRhIGV4dGVuZHMgT29wc3lEYXRhIHtcclxuICBoYXNEYXJrPzogc3RyaW5nW107XHJcbiAgaGFzQmV5b25kRGVhdGg/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgaGFzRG9vbT86IHsgW25hbWU6IHN0cmluZ106IGJvb2xlYW4gfTtcclxufVxyXG5cclxuLy8gSGFkZXMgRXhcclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZU1pbnN0cmVsc0JhbGxhZEhhZGVzc0VsZWd5LFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgMic6ICc0N0FBJyxcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgMyc6ICc0N0U0JyxcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTcHJlYWQgNCc6ICc0N0U1JyxcclxuICAgIC8vIEV2ZXJ5Ym9keSBzdGFja3MgaW4gZ29vZCBmYWl0aCBmb3IgQmFkIEZhaXRoLCBzbyBkb24ndCBjYWxsIGl0IGEgbWlzdGFrZS5cclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCAxJzogJzQ3QUQnLFxyXG4gICAgLy8gJ0hhZGVzRXggQmFkIEZhaXRoIDInOiAnNDdCMCcsXHJcbiAgICAvLyAnSGFkZXNFeCBCYWQgRmFpdGggMyc6ICc0N0FFJyxcclxuICAgIC8vICdIYWRlc0V4IEJhZCBGYWl0aCA0JzogJzQ3QUYnLFxyXG4gICAgJ0hhZGVzRXggQnJva2VuIEZhaXRoJzogJzQ3QjInLFxyXG4gICAgJ0hhZGVzRXggTWFnaWMgU3BlYXInOiAnNDdCNicsXHJcbiAgICAnSGFkZXNFeCBNYWdpYyBDaGFrcmFtJzogJzQ3QjUnLFxyXG4gICAgJ0hhZGVzRXggRm9ya2VkIExpZ2h0bmluZyc6ICc0N0M5JyxcclxuICAgICdIYWRlc0V4IERhcmsgQ3VycmVudCAxJzogJzQ3RjEnLFxyXG4gICAgJ0hhZGVzRXggRGFyayBDdXJyZW50IDInOiAnNDdGMicsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnSGFkZXNFeCBDb21ldCc6ICc0N0I5JywgLy8gbWlzc2VkIHRvd2VyXHJcbiAgICAnSGFkZXNFeCBBbmNpZW50IEVydXB0aW9uJzogJzQ3RDMnLFxyXG4gICAgJ0hhZGVzRXggUHVyZ2F0aW9uIDEnOiAnNDdFQycsXHJcbiAgICAnSGFkZXNFeCBQdXJnYXRpb24gMic6ICc0N0VEJyxcclxuICAgICdIYWRlc0V4IFNoYWRvdyBTdHJlYW0nOiAnNDdFQScsXHJcbiAgICAnSGFkZXNFeCBEZWFkIFNwYWNlJzogJzQ3RUUnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnSGFkZXNFeCBTaGFkb3cgU3ByZWFkIEluaXRpYWwnOiAnNDdBOScsXHJcbiAgICAnSGFkZXNFeCBSYXZlbm91cyBBc3NhdWx0JzogJyg/OjQ3QTZ8NDdBNyknLFxyXG4gICAgJ0hhZGVzRXggRGFyayBGbGFtZSAxJzogJzQ3QzYnLFxyXG4gICAgJ0hhZGVzRXggRGFyayBGcmVlemUgMSc6ICc0N0M0JyxcclxuICAgICdIYWRlc0V4IERhcmsgRnJlZXplIDInOiAnNDdERicsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggRGFyayBJSSBUZXRoZXInLFxyXG4gICAgICB0eXBlOiAnVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiAnU2hhZG93IG9mIHRoZSBBbmNpZW50cycsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0RhcmsgPz89IFtdO1xyXG4gICAgICAgIGRhdGEuaGFzRGFyay5wdXNoKG1hdGNoZXMudGFyZ2V0KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEYXJrIElJJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IHR5cGU6ICcyMicsIGlkOiAnNDdCQScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgLy8gRG9uJ3QgYmxhbWUgcGVvcGxlIHdobyBkb24ndCBoYXZlIHRldGhlcnMuXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+IGRhdGEuaGFzRGFyayAmJiBkYXRhLmhhc0RhcmsuaW5jbHVkZXMobWF0Y2hlcy50YXJnZXQpLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQm9zcyBUZXRoZXInLFxyXG4gICAgICB0eXBlOiAnVGV0aGVyJyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMudGV0aGVyKHsgc291cmNlOiBbJ0lnZXlvcmhtXFwncyBTaGFkZScsICdMYWhhYnJlYVxcJ3MgU2hhZGUnXSwgaWQ6ICcwMDBFJywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG1pc3Rha2U6IHtcclxuICAgICAgICB0eXBlOiAnd2FybicsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46ICdCb3NzZXMgVG9vIENsb3NlJyxcclxuICAgICAgICAgIGRlOiAnQm9zc2VzIHp1IE5haGUnLFxyXG4gICAgICAgICAgZnI6ICdCb3NzIHRyb3AgcHJvY2hlcycsXHJcbiAgICAgICAgICBqYTogJ+ODnOOCuei/keOBmeOBjuOCiycsXHJcbiAgICAgICAgICBjbjogJ0JPU1PpnaDlpKrov5HkuoYnLFxyXG4gICAgICAgICAga286ICfsq4Trk6TsnbQg64SI66y0IOqwgOq5jOybgCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEZWF0aCBTaHJpZWsnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0N0NCJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChkYXRhLCBtYXRjaGVzKSA9PiBkYXRhLkRhbWFnZUZyb21NYXRjaGVzKG1hdGNoZXMpID4gMCxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3dhcm4nLCBibGFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IEJleW9uZCBEZWF0aCBHYWluJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSA9IHRydWU7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQmV5b25kIERlYXRoIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNTY2JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGggPz89IHt9O1xyXG4gICAgICAgIGRhdGEuaGFzQmV5b25kRGVhdGhbbWF0Y2hlcy50YXJnZXRdID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ0hhZGVzRXggQmV5b25kIERlYXRoJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzU2NicgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzQmV5b25kRGVhdGgpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc0JleW9uZERlYXRoW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20gR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc2RTknIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNEb29tID8/PSB7fTtcclxuICAgICAgICBkYXRhLmhhc0Rvb21bbWF0Y2hlcy50YXJnZXRdID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnSGFkZXNFeCBEb29tIExvc2UnLFxyXG4gICAgICB0eXBlOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5sb3Nlc0VmZmVjdCh7IGVmZmVjdElkOiAnNkU5JyB9KSxcclxuICAgICAgcnVuOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGRhdGEuaGFzRG9vbSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSA9IGZhbHNlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdIYWRlc0V4IERvb20nLFxyXG4gICAgICB0eXBlOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5nYWluc0VmZmVjdCh7IGVmZmVjdElkOiAnNkU5JyB9KSxcclxuICAgICAgZGVsYXlTZWNvbmRzOiAoX2RhdGEsIG1hdGNoZXMpID0+IHBhcnNlRmxvYXQobWF0Y2hlcy5kdXJhdGlvbikgLSAwLjUsXHJcbiAgICAgIGRlYXRoUmVhc29uOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNEb29tKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmICghZGF0YS5oYXNEb29tW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSGFkZXMgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVEeWluZ0dhc3AsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0hhZGVzIEJhZCBGYWl0aCAxJzogJzQxNEInLFxyXG4gICAgJ0hhZGVzIEJhZCBGYWl0aCAyJzogJzQxNEMnLFxyXG4gICAgJ0hhZGVzIERhcmsgRXJ1cHRpb24nOiAnNDE1MicsXHJcbiAgICAnSGFkZXMgU2hhZG93IFNwcmVhZCAxJzogJzQxNTYnLFxyXG4gICAgJ0hhZGVzIFNoYWRvdyBTcHJlYWQgMic6ICc0MTU3JyxcclxuICAgICdIYWRlcyBCcm9rZW4gRmFpdGgnOiAnNDE0RScsXHJcbiAgICAnSGFkZXMgSGVsbGJvcm4gWWF3cCc6ICc0MTZGJyxcclxuICAgICdIYWRlcyBQdXJnYXRpb24nOiAnNDE3MicsXHJcbiAgICAnSGFkZXMgU2hhZG93IFN0cmVhbSc6ICc0MTVDJyxcclxuICAgICdIYWRlcyBBZXJvJzogJzQ1OTUnLFxyXG4gICAgJ0hhZGVzIEVjaG8gMSc6ICc0MTYzJyxcclxuICAgICdIYWRlcyBFY2hvIDInOiAnNDE2NCcsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdIYWRlcyBOZXRoZXIgQmxhc3QnOiAnNDE2MycsXHJcbiAgICAnSGFkZXMgUmF2ZW5vdXMgQXNzYXVsdCc6ICc0MTU4JyxcclxuICAgICdIYWRlcyBBbmNpZW50IERhcmtuZXNzJzogJzQ1OTMnLFxyXG4gICAgJ0hhZGVzIER1YWwgU3RyaWtlJzogJzQxNjInLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuXHJcbmV4cG9ydCB0eXBlIERhdGEgPSBPb3BzeURhdGE7XHJcblxyXG4vLyBJbm5vY2VuY2UgRXh0cmVtZVxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ3Jvd25PZlRoZUltbWFjdWxhdGVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdJbm5vRXggRHVlbCBEZXNjZW50JzogJzNFRDInLFxyXG4gICAgJ0lubm9FeCBSZXByb2JhdGlvbiAxJzogJzNFRTAnLFxyXG4gICAgJ0lubm9FeCBSZXByb2JhdGlvbiAyJzogJzNFQ0MnLFxyXG4gICAgJ0lubm9FeCBTd29yZCBvZiBDb25kZW1uYXRpb24gMSc6ICczRURFJyxcclxuICAgICdJbm5vRXggU3dvcmQgb2YgQ29uZGVtbmF0aW9uIDInOiAnM0VERicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDEnOiAnM0VEMycsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDInOiAnM0VENCcsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDMnOiAnM0VENScsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDQnOiAnM0VENicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDUnOiAnM0VGQicsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDYnOiAnM0VGQycsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDcnOiAnM0VGRCcsXHJcbiAgICAnSW5ub0V4IERyZWFtIG9mIHRoZSBSb29kIDgnOiAnM0VGRScsXHJcbiAgICAnSW5ub0V4IEhvbHkgVHJpbml0eSc6ICczRURCJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSAxJzogJzNFRDcnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDInOiAnM0VEOCcsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgMyc6ICczRUQ5JyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA0JzogJzNFREEnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDUnOiAnM0VGRicsXHJcbiAgICAnSW5ub0V4IFNvdWwgYW5kIEJvZHkgNic6ICczRjAwJyxcclxuICAgICdJbm5vRXggU291bCBhbmQgQm9keSA3JzogJzNGMDEnLFxyXG4gICAgJ0lubm9FeCBTb3VsIGFuZCBCb2R5IDgnOiAnM0YwMicsXHJcbiAgICAnSW5ub0V4IEdvZCBSYXkgMSc6ICczRUU2JyxcclxuICAgICdJbm5vRXggR29kIFJheSAyJzogJzNFRTcnLFxyXG4gICAgJ0lubm9FeCBHb2QgUmF5IDMnOiAnM0VFOCcsXHJcbiAgICAnSW5ub0V4IEV4cGxvc2lvbic6ICczRUYwJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gSW5ub2NlbmNlIE5vcm1hbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQ3Jvd25PZlRoZUltbWFjdWxhdGUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ0lubm8gRGF5YnJlYWsnOiAnM0U5RCcsXHJcbiAgICAnSW5ubyBIb2x5IFRyaW5pdHknOiAnM0VCMycsXHJcblxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gMSc6ICczRUI2JyxcclxuICAgICdJbm5vIFJlcHJvYmF0aW9uIDInOiAnM0VCOCcsXHJcbiAgICAnSW5ubyBSZXByb2JhdGlvbiAzJzogJzNFQ0InLFxyXG4gICAgJ0lubm8gUmVwcm9iYXRpb24gNCc6ICczRUI3JyxcclxuXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDEnOiAnM0VCMScsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDInOiAnM0VCMicsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDMnOiAnM0VGOScsXHJcbiAgICAnSW5ubyBTb3VsIGFuZCBCb2R5IDQnOiAnM0VGQScsXHJcblxyXG4gICAgJ0lubm8gR29kIFJheSAxJzogJzNFQkQnLFxyXG4gICAgJ0lubm8gR29kIFJheSAyJzogJzNFQkUnLFxyXG4gICAgJ0lubm8gR29kIFJheSAzJzogJzNFQkYnLFxyXG4gICAgJ0lubm8gR29kIFJheSA0JzogJzNFQzAnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIEl0J3MgaGFyZCB0byBjYXB0dXJlIHRoZSByZWZsZWN0aW9uIGFiaWxpdGllcyBmcm9tIExldmlhdGhhbidzIEhlYWQgYW5kIFRhaWwgaWYgeW91IHVzZVxyXG4vLyByYW5nZWQgcGh5c2ljYWwgYXR0YWNrcyAvIG1hZ2ljIGF0dGFja3MgcmVzcGVjdGl2ZWx5LCBhcyB0aGUgYWJpbGl0eSBuYW1lcyBhcmUgdGhlXHJcbi8vIGFiaWxpdHkgeW91IHVzZWQgYW5kIGRvbid0IGFwcGVhciB0byBzaG93IHVwIGluIHRoZSBsb2cgYXMgbm9ybWFsIFwiYWJpbGl0eVwiIGxpbmVzLlxyXG4vLyBUaGF0IHNhaWQsIGRvdHMgc3RpbGwgdGljayBpbmRlcGVuZGVudGx5IG9uIGJvdGggc28gaXQncyBsaWtlbHkgdGhhdCBwZW9wbGUgd2lsbCBhdGFja1xyXG4vLyB0aGVtIGFueXdheS5cclxuXHJcbi8vIFRPRE86IEZpZ3VyZSBvdXQgd2h5IERyZWFkIFRpZGUgLyBXYXRlcnNwb3V0IGFwcGVhciBsaWtlIHNoYXJlcyAoaS5lLiAweDE2IGlkKS5cclxuLy8gRHJlYWQgVGlkZSA9IDVDQ0EvNUNDQi81Q0NDLCBXYXRlcnNwb3V0ID0gNUNEMVxyXG5cclxuLy8gTGV2aWF0aGFuIFVucmVhbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlV2hvcmxlYXRlclVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnTGV2aVVuIEdyYW5kIEZhbGwnOiAnNUNERicsIC8vIHZlcnkgbGFyZ2UgY2lyY3VsYXIgYW9lIGJlZm9yZSBzcGlubnkgZGl2ZXMsIGFwcGxpZXMgaGVhdnlcclxuICAgICdMZXZpVW4gSHlkcm9zaG90JzogJzVDRDUnLCAvLyBXYXZlc3BpbmUgU2FoYWdpbiBhb2UgdGhhdCBnaXZlcyBEcm9wc3kgZWZmZWN0XHJcbiAgICAnTGV2aVVuIERyZWFkc3Rvcm0nOiAnNUNENicsIC8vIFdhdmV0b290aCBTYWhhZ2luIGFvZSB0aGF0IGdpdmVzIEh5c3RlcmlhIGVmZmVjdFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ0xldmlVbiBCb2R5IFNsYW0nOiAnNUNEMicsIC8vIGxldmkgc2xhbSB0aGF0IHRpbHRzIHRoZSBib2F0XHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgMSc6ICc1Q0RCJywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gICAgJ0xldmlVbiBTcGlubmluZyBEaXZlIDInOiAnNUNFMycsIC8vIGxldmkgZGFzaCBhY3Jvc3MgdGhlIGJvYXQgd2l0aCBrbm9ja2JhY2tcclxuICAgICdMZXZpVW4gU3Bpbm5pbmcgRGl2ZSAzJzogJzVDRTgnLCAvLyBsZXZpIGRhc2ggYWNyb3NzIHRoZSBib2F0IHdpdGgga25vY2tiYWNrXHJcbiAgICAnTGV2aVVuIFNwaW5uaW5nIERpdmUgNCc6ICc1Q0U5JywgLy8gbGV2aSBkYXNoIGFjcm9zcyB0aGUgYm9hdCB3aXRoIGtub2NrYmFja1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RXYXJuOiB7XHJcbiAgICAnTGV2aVVuIERyb3BzeSc6ICcxMTAnLCAvLyBzdGFuZGluZyBpbiB0aGUgaHlkcm8gc2hvdCBmcm9tIHRoZSBXYXZlc3BpbmUgU2FoYWdpblxyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnTGV2aVVuIEh5c3RlcmlhJzogJzEyOCcsIC8vIHN0YW5kaW5nIGluIHRoZSBkcmVhZHN0b3JtIGZyb20gdGhlIFdhdmV0b290aCBTYWhhZ2luXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ0xldmlVbiBCb2R5IFNsYW0gS25vY2tlZCBPZmYnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzVDRDInIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgb2ZmJyxcclxuICAgICAgICAgICAgZGU6ICdSdW50ZXJnZWZhbGxlbicsXHJcbiAgICAgICAgICAgIGZyOiAnQSDDqXTDqSBhc3NvbW3DqShlKScsXHJcbiAgICAgICAgICAgIGphOiAn44OO44OD44Kv44OQ44OD44KvJyxcclxuICAgICAgICAgICAgY246ICflh7vpgIDlnaDokL0nLFxyXG4gICAgICAgICAgICBrbzogJ+uEieuwsScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IHRha2luZyB0d28gZGlmZmVyZW50IEhpZ2gtUG93ZXJlZCBIb21pbmcgTGFzZXJzICg0QUQ4KVxyXG4vLyBUT0RPOiBjb3VsZCBibGFtZSB0aGUgdGV0aGVyZWQgcGxheWVyIGZvciBXaGl0ZSBBZ29ueSAvIFdoaXRlIEZ1cnkgZmFpbHVyZXM/XHJcblxyXG4vLyBSdWJ5IFdlYXBvbiBFeHRyZW1lXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DaW5kZXJEcmlmdEV4dHJlbWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1J1YnlFeCBSdWJ5IEJpdCBNYWdpdGVrIFJheSc6ICc0QUQyJywgLy8gbGluZSBhb2VzIGR1cmluZyBoZWxpY29jbGF3XHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDEnOiAnNEFEMycsIC8vIGluaXRpYWwgZXhwbG9zaW9uIGR1cmluZyBoZWxpY29jbGF3XHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDInOiAnNEIyRicsIC8vIGZvbGxvd3VwIGhlbGljb2NsYXcgZXhwbG9zaW9uc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSAzJzogJzREMDQnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFNwaWtlIE9mIEZsYW1lIDQnOiAnNEQwNScsIC8vIHJhdmVuc2NsYXcgZXhwbG9zaW9uIGF0IGVuZHMgb2YgbGluZXNcclxuICAgICdSdWJ5RXggU3Bpa2UgT2YgRmxhbWUgNSc6ICc0QUNEJywgLy8gcmF2ZW5zY2xhdyBleHBsb3Npb24gYXQgZW5kcyBvZiBsaW5lc1xyXG4gICAgJ1J1YnlFeCBTcGlrZSBPZiBGbGFtZSA2JzogJzRBQ0UnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieUV4IFVuZGVybWluZSc6ICc0QUQwJywgLy8gZ3JvdW5kIGFvZXMgdW5kZXIgdGhlIHJhdmVuc2NsYXcgcGF0Y2hlc1xyXG4gICAgJ1J1YnlFeCBSdWJ5IFJheSc6ICc0QjAyJywgLy8gZnJvbnRhbCBsYXNlclxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMSc6ICc0QUQ5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCAyJzogJzRBREEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDMnOiAnNEFERCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNCc6ICc0QURFJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA1JzogJzRBREYnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDYnOiAnNEFFMCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgNyc6ICc0QUUxJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieUV4IFJhdmVuc2ZsaWdodCA4JzogJzRBRTInLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5RXggUmF2ZW5zZmxpZ2h0IDknOiAnNEFFMycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTAnOiAnNEFFNCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTEnOiAnNEFFNScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTInOiAnNEFFNicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTMnOiAnNEFFNycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTQnOiAnNEFFOCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTUnOiAnNEFFOScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTYnOiAnNEFFQScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTcnOiAnNEU2QicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTgnOiAnNEU2QycsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMTknOiAnNEU2RCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjAnOiAnNEU2RScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjEnOiAnNEU2RicsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBSYXZlbnNmbGlnaHQgMjInOiAnNEU3MCcsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biAxJzogJzRCMDUnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDInOiAnNEIwNicsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggQ3V0IEFuZCBSdW4gMyc6ICc0QjA3JywgLy8gc2xvdyBjaGFyZ2UgYWNyb3NzIGFyZW5hIGFmdGVyIHN0YWNrc1xyXG4gICAgJ1J1YnlFeCBDdXQgQW5kIFJ1biA0JzogJzRCMDgnLCAvLyBzbG93IGNoYXJnZSBhY3Jvc3MgYXJlbmEgYWZ0ZXIgc3RhY2tzXHJcbiAgICAnUnVieUV4IEN1dCBBbmQgUnVuIDUnOiAnNERPRCcsIC8vIHNsb3cgY2hhcmdlIGFjcm9zcyBhcmVuYSBhZnRlciBzdGFja3NcclxuICAgICdSdWJ5RXggTWV0ZW9yIEJ1cnN0JzogJzRBRjInLCAvLyBtZXRlb3IgZXhwbG9kaW5nXHJcbiAgICAnUnVieUV4IEJyYWRhbWFudGUnOiAnNEUzOCcsIC8vIGhlYWRtYXJrZXJzIHdpdGggbGluZSBhb2VzXHJcbiAgICAnUnVieUV4IENvbWV0IEhlYXZ5IEltcGFjdCc6ICc0QUY2JywgLy8gbGV0dGluZyBhIHRhbmsgY29tZXQgbGFuZFxyXG4gIH0sXHJcbiAgZGFtYWdlRmFpbDoge1xyXG4gICAgJ1J1YnlFeCBSdWJ5IFNwaGVyZSBCdXJzdCc6ICc0QUNCJywgLy8gZXhwbG9kaW5nIHRoZSByZWQgbWluZVxyXG4gICAgJ1J1YnlFeCBMdW5hciBEeW5hbW8nOiAnNEVCMCcsIC8vIFwiZ2V0IGluXCIgZnJvbSBSYXZlbidzIEltYWdlXHJcbiAgICAnUnVieUV4IElyb24gQ2hhcmlvdCc6ICc0RUIxJywgLy8gXCJnZXQgb3V0XCIgZnJvbSBSYXZlbidzIEltYWdlXHJcbiAgICAnUnVieUV4IEhlYXJ0IEluIFRoZSBNYWNoaW5lJzogJzRBRkEnLCAvLyBXaGl0ZSBBZ29ueS9GdXJ5IHNrdWxsIGhpdHRpbmcgcGxheWVyc1xyXG4gIH0sXHJcbiAgZ2FpbnNFZmZlY3RGYWlsOiB7XHJcbiAgICAnUnVieUV4IEh5c3RlcmlhJzogJzEyOCcsIC8vIE5lZ2F0aXZlIEF1cmEgbG9va2F3YXkgZmFpbHVyZVxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUnVieUV4IEhvbWluZyBMYXNlcnMnOiAnNEFENicsIC8vIHNwcmVhZCBtYXJrZXJzIGR1cmluZyBjdXQgYW5kIHJ1blxyXG4gICAgJ1J1YnlFeCBNZXRlb3IgU3RyZWFtJzogJzRFNjgnLCAvLyBzcHJlYWQgbWFya2VycyBkdXJpbmcgUDJcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnUnVieUV4IFNjcmVlY2gnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHkoeyBpZDogJzRBRUUnIH0pLFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdmYWlsJyxcclxuICAgICAgICAgIG5hbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ0tub2NrZWQgaW50byB3YWxsJyxcclxuICAgICAgICAgICAgZGU6ICdSw7xja3N0b8OfIGluIGRpZSBXYW5kJyxcclxuICAgICAgICAgICAgamE6ICflo4Hjgbjjg47jg4Pjgq/jg5Djg4Pjgq8nLFxyXG4gICAgICAgICAgICBjbjogJ+WHu+mAgOiHs+WimScsXHJcbiAgICAgICAgICAgIGtvOiAn64SJ67CxJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFJ1YnkgTm9ybWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5DaW5kZXJEcmlmdCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnUnVieSBSYXZlbnNjbGF3JzogJzRBOTMnLCAvLyBjZW50ZXJlZCBjaXJjbGUgYW9lIGZvciByYXZlbnNjbGF3XHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSAxJzogJzRBOUEnLCAvLyBpbml0aWFsIGV4cGxvc2lvbiBkdXJpbmcgaGVsaWNvY2xhd1xyXG4gICAgJ1J1YnkgU3Bpa2UgT2YgRmxhbWUgMic6ICc0QjJFJywgLy8gZm9sbG93dXAgaGVsaWNvY2xhdyBleHBsb3Npb25zXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSAzJzogJzRBOTQnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA0JzogJzRBOTUnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA1JzogJzREMDInLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBTcGlrZSBPZiBGbGFtZSA2JzogJzREMDMnLCAvLyByYXZlbnNjbGF3IGV4cGxvc2lvbiBhdCBlbmRzIG9mIGxpbmVzXHJcbiAgICAnUnVieSBSdWJ5IFJheSc6ICc0QUM2JywgLy8gZnJvbnRhbCBsYXNlclxyXG4gICAgJ1J1YnkgVW5kZXJtaW5lJzogJzRBOTcnLCAvLyBncm91bmQgYW9lcyB1bmRlciB0aGUgcmF2ZW5zY2xhdyBwYXRjaGVzXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMSc6ICc0RTY5JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMic6ICc0RTZBJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMyc6ICc0QUExJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNCc6ICc0QUEyJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNSc6ICc0QUEzJywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNic6ICc0QUE0JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgNyc6ICc0QUE1JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgOCc6ICc0QUE2JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgOSc6ICc0QUE3JywgLy8gZGFzaCBhcm91bmQgdGhlIGFyZW5hXHJcbiAgICAnUnVieSBSYXZlbnNmbGlnaHQgMTAnOiAnNEMyMScsIC8vIGRhc2ggYXJvdW5kIHRoZSBhcmVuYVxyXG4gICAgJ1J1YnkgUmF2ZW5zZmxpZ2h0IDExJzogJzRDMkEnLCAvLyBkYXNoIGFyb3VuZCB0aGUgYXJlbmFcclxuICAgICdSdWJ5IENvbWV0IEJ1cnN0JzogJzRBQjQnLCAvLyBtZXRlb3IgZXhwbG9kaW5nXHJcbiAgICAnUnVieSBCcmFkYW1hbnRlJzogJzRBQkMnLCAvLyBoZWFkbWFya2VycyB3aXRoIGxpbmUgYW9lc1xyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnUnVieSBIb21pbmcgTGFzZXInOiAnNEFDNScsIC8vIHNwcmVhZCBtYXJrZXJzIGluIFAxXHJcbiAgICAnUnVieSBNZXRlb3IgU3RyZWFtJzogJzRFNjcnLCAvLyBzcHJlYWQgbWFya2VycyBpbiBQMlxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFNoaXZhIFVucmVhbFxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlQWtoQWZhaEFtcGhpdGhlYXRyZVVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAvLyBMYXJnZSB3aGl0ZSBjaXJjbGVzLlxyXG4gICAgJ1NoaXZhRXggSWNpY2xlIEltcGFjdCc6ICc1MzdCJyxcclxuICAgIC8vIFwiZ2V0IGluXCIgYW9lXHJcbiAgICAnU2hpdmFFeCBXaGl0ZW91dCc6ICc1Mzc2JyxcclxuICAgIC8vIEF2b2lkYWJsZSB0YW5rIHN0dW4uXHJcbiAgICAnU2hpdmFFeCBHbGFjaWVyIEJhc2gnOiAnNTM3NScsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAvLyAyNzAgZGVncmVlIGF0dGFjay5cclxuICAgICdTaGl2YUV4IEdsYXNzIERhbmNlJzogJzUzNzgnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBIYWlsc3Rvcm0gc3ByZWFkIG1hcmtlci5cclxuICAgICdTaGl2YUV4IEhhaWxzdG9ybSc6ICc1MzZGJyxcclxuICB9LFxyXG4gIHNoYXJlRmFpbDoge1xyXG4gICAgLy8gTGFzZXIuICBUT0RPOiBtYXliZSBibGFtZSB0aGUgcGVyc29uIGl0J3Mgb24/P1xyXG4gICAgJ1NoaXZhRXggQXZhbGFuY2hlJzogJzUzNzknLFxyXG4gIH0sXHJcbiAgc29sb1dhcm46IHtcclxuICAgIC8vIFBhcnR5IHNoYXJlZCB0YW5rIGJ1c3Rlci5cclxuICAgICdTaGl2YUV4IEljZWJyYW5kJzogJzUzNzMnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdTaGl2YUV4IERlZXAgRnJlZXplJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgLy8gU2hpdmEgYWxzbyB1c2VzIGFiaWxpdHkgNTM3QSBvbiB5b3UsIGJ1dCBpdCBoYXMgYW4gdW5rbm93biBuYW1lLlxyXG4gICAgICAvLyBTbywgdXNlIHRoZSBlZmZlY3QgaW5zdGVhZCBmb3IgZnJlZSB0cmFuc2xhdGlvbi5cclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzFFNycgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgLy8gVGhlIGludGVybWlzc2lvbiBhbHNvIGdldHMgdGhpcyBlZmZlY3QsIGJ1dCBmb3IgYSBzaG9ydGVyIGR1cmF0aW9uLlxyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pID4gMjA7XHJcbiAgICAgIH0sXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZURhbmNpbmdQbGFndWUsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1RpdGFuaWEgV29vZFxcJ3MgRW1icmFjZSc6ICczRDUwJyxcclxuICAgIC8vICdUaXRhbmlhIEZyb3N0IFJ1bmUnOiAnM0Q0RScsXHJcbiAgICAnVGl0YW5pYSBHZW50bGUgQnJlZXplJzogJzNGODMnLFxyXG4gICAgJ1RpdGFuaWEgTGVhZnN0b3JtIDEnOiAnM0Q1NScsXHJcbiAgICAnVGl0YW5pYSBQdWNrXFwncyBSZWJ1a2UnOiAnM0Q1OCcsXHJcbiAgICAnVGl0YW5pYSBMZWFmc3Rvcm0gMic6ICczRTAzJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbmlhIFBoYW50b20gUnVuZSAxJzogJzNENUQnLFxyXG4gICAgJ1RpdGFuaWEgUGhhbnRvbSBSdW5lIDInOiAnM0Q1RScsXHJcbiAgfSxcclxuICBzaGFyZUZhaWw6IHtcclxuICAgICdUaXRhbmlhIERpdmluYXRpb24gUnVuZSc6ICczRDVCJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZURhbmNpbmdQbGFndWVFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdUaXRhbmlhRXggV29vZFxcJ3MgRW1icmFjZSc6ICczRDJGJyxcclxuICAgIC8vICdUaXRhbmlhRXggRnJvc3QgUnVuZSc6ICczRDJCJyxcclxuICAgICdUaXRhbmlhRXggR2VudGxlIEJyZWV6ZSc6ICczRjgyJyxcclxuICAgICdUaXRhbmlhRXggTGVhZnN0b3JtIDEnOiAnM0QzOScsXHJcbiAgICAnVGl0YW5pYUV4IFB1Y2tcXCdzIFJlYnVrZSc6ICczRDQzJyxcclxuICAgICdUaXRhbmlhRXggV2FsbG9wJzogJzNEM0InLFxyXG4gICAgJ1RpdGFuaWFFeCBMZWFmc3Rvcm0gMic6ICczRDQ5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhbmlhRXggUGhhbnRvbSBSdW5lIDEnOiAnM0Q0QycsXHJcbiAgICAnVGl0YW5pYUV4IFBoYW50b20gUnVuZSAyJzogJzNENEQnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAvLyBUT0RPOiBUaGlzIGNvdWxkIG1heWJlIGJsYW1lIHRoZSBwZXJzb24gd2l0aCB0aGUgdGV0aGVyP1xyXG4gICAgJ1RpdGFuaWFFeCBUaHVuZGVyIFJ1bmUnOiAnM0QyOScsXHJcbiAgICAnVGl0YW5pYUV4IERpdmluYXRpb24gUnVuZSc6ICczRDRBJyxcclxuICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVGl0YW4gVW5yZWFsXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVOYXZlbFVucmVhbCxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnVGl0YW5VbiBXZWlnaHQgT2YgVGhlIExhbmQnOiAnNThGRScsXHJcbiAgICAnVGl0YW5VbiBCdXJzdCc6ICc1QURGJyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgICdUaXRhblVuIExhbmRzbGlkZSc6ICc1QURDJyxcclxuICAgICdUaXRhblVuIEdhb2xlciBMYW5kc2xpZGUnOiAnNTkwMicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdUaXRhblVuIFJvY2sgQnVzdGVyJzogJzU4RjYnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVGl0YW5VbiBNb3VudGFpbiBCdXN0ZXInOiAnNThGNycsXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcbmltcG9ydCB7IHBsYXllckRhbWFnZUZpZWxkcyB9IGZyb20gJy4uLy4uLy4uL29vcHN5X2NvbW1vbic7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLk1lbW9yaWFNaXNlcmFFeHRyZW1lLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDEnOiAnNENEMicsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCAyJzogJzRDRDMnLFxyXG4gICAgJ1ZhcmlzRXggQWxlYSBJYWN0YSBFc3QgMyc6ICc0Q0Q0JyxcclxuICAgICdWYXJpc0V4IEFsZWEgSWFjdGEgRXN0IDQnOiAnNENENScsXHJcbiAgICAnVmFyaXNFeCBBbGVhIElhY3RhIEVzdCA1JzogJzRDRDYnLFxyXG4gICAgJ1ZhcmlzRXggSWduaXMgRXN0IDEnOiAnNENCNScsXHJcbiAgICAnVmFyaXNFeCBJZ25pcyBFc3QgMic6ICc0Q0M1JyxcclxuICAgICdWYXJpc0V4IFZlbnR1cyBFc3QgMSc6ICc0Q0M3JyxcclxuICAgICdWYXJpc0V4IFZlbnR1cyBFc3QgMic6ICc0Q0M4JyxcclxuICAgICdWYXJpc0V4IEFzc2F1bHQgQ2Fubm9uJzogJzRDRTUnLFxyXG4gICAgJ1ZhcmlzRXggRm9ydGl1cyBSb3RhdGluZyc6ICc0Q0U5JyxcclxuICB9LFxyXG4gIGRhbWFnZUZhaWw6IHtcclxuICAgIC8vIERvbid0IGhpdCB0aGUgc2hpZWxkcyFcclxuICAgICdWYXJpc0V4IFJlcGF5JzogJzRDREQnLFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAvLyBUaGlzIGlzIHRoZSBcInByb3RlYW5cIiBmb3J0aXVzLlxyXG4gICAgJ1ZhcmlzRXggRm9ydGl1cyBQcm90ZWFuJzogJzRDRTcnLFxyXG4gIH0sXHJcbiAgc2hhcmVGYWlsOiB7XHJcbiAgICAnVmFyaXNFeCBNYWdpdGVrIEJ1cnN0JzogJzRDREYnLFxyXG4gICAgJ1ZhcmlzRXggQWV0aGVyb2NoZW1pY2FsIEdyZW5hZG8nOiAnNENFRCcsXHJcbiAgfSxcclxuICB0cmlnZ2VyczogW1xyXG4gICAge1xyXG4gICAgICBpZDogJ1ZhcmlzRXggVGVybWludXMgRXN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNENCNCcsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiAxLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnd2FybicsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5hYmlsaXR5IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0cmlnZ2VyU2V0O1xyXG4iLCJpbXBvcnQgTmV0UmVnZXhlcyBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvbmV0cmVnZXhlcyc7XHJcbmltcG9ydCBab25lSWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL3pvbmVfaWQnO1xyXG5pbXBvcnQgeyBPb3BzeURhdGEgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9kYXRhJztcclxuaW1wb3J0IHsgT29wc3lUcmlnZ2VyU2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvb29wc3knO1xyXG5cclxuZXhwb3J0IHR5cGUgRGF0YSA9IE9vcHN5RGF0YTtcclxuXHJcbi8vIFRPRE86IFJhZGlhbnQgQnJhdmVyIGlzIDRGMTYvNEYxNyh4MiksIHNob3VsZG4ndCBnZXQgaGl0IGJ5IGJvdGg/XHJcbi8vIFRPRE86IFJhZGlhbnQgRGVzcGVyYWRvIGlzIDRGMTgvNEYxOSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBNZXRlb3IgaXMgNEYxQSwgYW5kIHNob3VsZG4ndCBnZXQgaGl0IGJ5IG1vcmUgdGhhbiAxP1xyXG4vLyBUT0RPOiBtaXNzaW5nIGEgdG93ZXI/XHJcblxyXG4vLyBOb3RlOiBEZWxpYmVyYXRlbHkgbm90IGluY2x1ZGluZyBweXJldGljIGRhbWFnZSBhcyBhbiBlcnJvci5cclxuLy8gTm90ZTogSXQgZG9lc24ndCBhcHBlYXIgdGhhdCB0aGVyZSdzIGFueSB3YXkgdG8gdGVsbCB3aG8gZmFpbGVkIHRoZSBjdXRzY2VuZS5cclxuXHJcbmNvbnN0IHRyaWdnZXJTZXQ6IE9vcHN5VHJpZ2dlclNldDxEYXRhPiA9IHtcclxuICB6b25lSWQ6IFpvbmVJZC5UaGVTZWF0T2ZTYWNyaWZpY2UsXHJcbiAgZGFtYWdlV2Fybjoge1xyXG4gICAgJ1dPTCBTb2xlbW4gQ29uZml0ZW9yJzogJzRGMkEnLCAvLyBncm91bmQgcHVkZGxlc1xyXG4gICAgJ1dPTCBDb3J1c2NhbnQgU2FiZXIgSW4nOiAnNEYxMCcsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MIENvcnVzY2FudCBTYWJlciBPdXQnOiAnNEYxMScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTCBJbWJ1ZWQgQ29ydXNhbmNlIE91dCc6ICc0RjRCJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MIEltYnVlZCBDb3J1c2FuY2UgSW4nOiAnNEY0QycsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MIFNoaW5pbmcgV2F2ZSc6ICc0RjI2JywgLy8gc3dvcmQgdHJpYW5nbGVcclxuICAgICdXT0wgQ2F1dGVyaXplJzogJzRGMjUnLFxyXG4gICAgJ1dPTCBCcmltc3RvbmUgRWFydGggMSc6ICc0RjFFJywgLy8gY29ybmVyIGdyb3dpbmcgY2lyY2xlcywgaW5pdGlhbFxyXG4gICAgJ1dPTCBCcmltc3RvbmUgRWFydGggMic6ICc0RjFGJywgLy8gY29ybmVyIGdyb3dpbmcgY2lyY2xlcywgZ3Jvd2luZ1xyXG4gICAgJ1dPTCBGbGFyZSBCcmVhdGgnOiAnNEYyNCcsXHJcbiAgICAnV09MIERlY2ltYXRpb24nOiAnNEYyMycsXHJcbiAgfSxcclxuICBnYWluc0VmZmVjdFdhcm46IHtcclxuICAgICdXT0wgRGVlcCBGcmVlemUnOiAnNEU2JyxcclxuICB9LFxyXG4gIHRyaWdnZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnV09MIFRydWUgV2Fsa2luZyBEZWFkJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzM4RScgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCBuYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5lZmZlY3QgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IFpvbmVJZCBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvem9uZV9pZCc7XHJcbmltcG9ydCB7IE9vcHN5RGF0YSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL2RhdGEnO1xyXG5pbXBvcnQgeyBPb3BzeVRyaWdnZXJTZXQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi90eXBlcy9vb3BzeSc7XHJcblxyXG5leHBvcnQgdHlwZSBEYXRhID0gT29wc3lEYXRhO1xyXG5cclxuLy8gVE9ETzogUmFkaWFudCBCcmF2ZXIgaXMgNEVGNy80RUY4KHgyKSwgc2hvdWxkbid0IGdldCBoaXQgYnkgYm90aD9cclxuLy8gVE9ETzogUmFkaWFudCBEZXNwZXJhZG8gaXMgNEVGOS80RUZBLCBzaG91bGRuJ3QgZ2V0IGhpdCBieSBib3RoP1xyXG4vLyBUT0RPOiBSYWRpYW50IE1ldGVvciBpcyA0RUZDLCBhbmQgc2hvdWxkbid0IGdldCBoaXQgYnkgbW9yZSB0aGFuIDE/XHJcbi8vIFRPRE86IEFic29sdXRlIEhvbHkgc2hvdWxkIGJlIHNoYXJlZD9cclxuLy8gVE9ETzogaW50ZXJzZWN0aW5nIGJyaW1zdG9uZXM/XHJcblxyXG5jb25zdCB0cmlnZ2VyU2V0OiBPb3BzeVRyaWdnZXJTZXQ8RGF0YT4gPSB7XHJcbiAgem9uZUlkOiBab25lSWQuVGhlU2VhdE9mU2FjcmlmaWNlRXh0cmVtZSxcclxuICBkYW1hZ2VXYXJuOiB7XHJcbiAgICAnV09MRXggU29sZW1uIENvbmZpdGVvcic6ICc0RjBDJywgLy8gZ3JvdW5kIHB1ZGRsZXNcclxuICAgICdXT0xFeCBDb3J1c2NhbnQgU2FiZXIgSW4nOiAnNEVGMicsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MRXggQ29ydXNjYW50IFNhYmVyIE91dCc6ICc0RUYxJywgLy8gc2FiZXIgb3V0XHJcbiAgICAnV09MRXggSW1idWVkIENvcnVzYW5jZSBPdXQnOiAnNEY0OScsIC8vIHNhYmVyIG91dFxyXG4gICAgJ1dPTEV4IEltYnVlZCBDb3J1c2FuY2UgSW4nOiAnNEY0QScsIC8vIHNhYmVyIGluXHJcbiAgICAnV09MRXggU2hpbmluZyBXYXZlJzogJzRGMDgnLCAvLyBzd29yZCB0cmlhbmdsZVxyXG4gICAgJ1dPTEV4IENhdXRlcml6ZSc6ICc0RjA3JyxcclxuICAgICdXT0xFeCBCcmltc3RvbmUgRWFydGgnOiAnNEYwMCcsIC8vIGNvcm5lciBncm93aW5nIGNpcmNsZXMsIGdyb3dpbmdcclxuICB9LFxyXG4gIGdhaW5zRWZmZWN0V2Fybjoge1xyXG4gICAgJ1dPTEV4IERlZXAgRnJlZXplJzogJzRFNicsIC8vIGZhaWxpbmcgQWJzb2x1dGUgQmxpenphcmQgSUlJXHJcbiAgICAnV09MRXggRGFtYWdlIERvd24nOiAnMjc0JywgLy8gZmFpbGluZyBBYnNvbHV0ZSBGbGFzaFxyXG4gIH0sXHJcbiAgc2hhcmVXYXJuOiB7XHJcbiAgICAnV09MRXggQWJzb2x1dGUgU3RvbmUgSUlJJzogJzRFRUInLCAvLyBwcm90ZWFuIHdhdmUgaW1idWVkIG1hZ2ljXHJcbiAgICAnV09MRXggRmxhcmUgQnJlYXRoJzogJzRGMDYnLCAvLyB0ZXRoZXIgZnJvbSBzdW1tb25lZCBiYWhhbXV0c1xyXG4gICAgJ1dPTEV4IFBlcmZlY3QgRGVjaW1hdGlvbic6ICc0RjA1JywgLy8gc21uL3dhciBwaGFzZSBtYXJrZXJcclxuICB9LFxyXG4gIHNvbG9XYXJuOiB7XHJcbiAgICAnV29sRXggS2F0b24gU2FuIFNoYXJlJzogJzRFRkUnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgaWQ6ICdXT0xFeCBUcnVlIFdhbGtpbmcgRGVhZCcsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICc4RkYnIH0pLFxyXG4gICAgICBkZWxheVNlY29uZHM6IChfZGF0YSwgbWF0Y2hlcykgPT4gcGFyc2VGbG9hdChtYXRjaGVzLmR1cmF0aW9uKSAtIDAuNSxcclxuICAgICAgZGVhdGhSZWFzb246IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuZWZmZWN0IH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRvd2VyJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RjA0JywgY2FwdHVyZTogZmFsc2UgfSksXHJcbiAgICAgIG1pc3Rha2U6IHtcclxuICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgZW46ICdNaXNzZWQgVG93ZXInLFxyXG4gICAgICAgICAgZGU6ICdUdXJtIHZlcnBhc3N0JyxcclxuICAgICAgICAgIGZyOiAnVG91ciBtYW5xdcOpZScsXHJcbiAgICAgICAgICBqYTogJ+WhlOOCkui4j+OBvuOBquOBi+OBo+OBnycsXHJcbiAgICAgICAgICBjbjogJ+ayoei4qeWhlCcsXHJcbiAgICAgICAgICBrbzogJ+yepe2MkCDsi6TsiJgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1dPTEV4IFRydWUgSGFsbG93ZWQgR3JvdW5kJyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5KHsgaWQ6ICc0RjQ0JyB9KSxcclxuICAgICAgbWlzdGFrZTogKF9kYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2ZhaWwnLCB0ZXh0OiBtYXRjaGVzLmFiaWxpdHkgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIC8vIEZvciBCZXJzZXJrIGFuZCBEZWVwIERhcmtzaWRlXHJcbiAgICAgIGlkOiAnV09MRXggTWlzc2VkIEludGVycnVwdCcsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eSh7IGlkOiBbJzUxNTYnLCAnNTE1OCddIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdHJpZ2dlclNldDtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgWm9uZUlkIGZyb20gJy4uLy4uLy4uLy4uLy4uL3Jlc291cmNlcy96b25lX2lkJztcclxuaW1wb3J0IHsgT29wc3lEYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHlwZXMvZGF0YSc7XHJcbmltcG9ydCB7IE9vcHN5VHJpZ2dlclNldCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3R5cGVzL29vcHN5JztcclxuaW1wb3J0IHsgcGxheWVyRGFtYWdlRmllbGRzIH0gZnJvbSAnLi4vLi4vLi4vb29wc3lfY29tbW9uJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGF0YSBleHRlbmRzIE9vcHN5RGF0YSB7XHJcbiAgaGFzVGhyb3R0bGU/OiB7IFtuYW1lOiBzdHJpbmddOiBib29sZWFuIH07XHJcbiAgamFnZFRldGhlcj86IHsgW3NvdXJjZUlkOiBzdHJpbmddOiBzdHJpbmcgfTtcclxufVxyXG5cclxuLy8gVE9ETzogRklYIGx1bWlub3VzIGFldGhlcm9wbGFzbSB3YXJuaW5nIG5vdCB3b3JraW5nXHJcbi8vIFRPRE86IEZJWCBkb2xsIGRlYXRoIG5vdCB3b3JraW5nXHJcbi8vIFRPRE86IGZhaWxpbmcgaGFuZCBvZiBwYWluL3BhcnRpbmcgKGNoZWNrIGZvciBoaWdoIGRhbWFnZT8pXHJcbi8vIFRPRE86IG1ha2Ugc3VyZSBldmVyeWJvZHkgdGFrZXMgZXhhY3RseSBvbmUgcHJvdGVhbiAocmF0aGVyIHRoYW4gd2F0Y2hpbmcgZG91YmxlIGhpdHMpXHJcbi8vIFRPRE86IHRodW5kZXIgbm90IGhpdHRpbmcgZXhhY3RseSAyP1xyXG4vLyBUT0RPOiBwZXJzb24gd2l0aCB3YXRlci90aHVuZGVyIGRlYnVmZiBkeWluZ1xyXG4vLyBUT0RPOiBiYWQgbmlzaSBwYXNzXHJcbi8vIFRPRE86IGZhaWxlZCBnYXZlbCBtZWNoYW5pY1xyXG4vLyBUT0RPOiBkb3VibGUgcm9ja2V0IHB1bmNoIG5vdCBoaXR0aW5nIGV4YWN0bHkgMj8gKG9yIHRhbmtzKVxyXG4vLyBUT0RPOiBzdGFuZGluZyBpbiBzbHVkZ2UgcHVkZGxlcyBiZWZvcmUgaGlkZGVuIG1pbmU/XHJcbi8vIFRPRE86IGhpZGRlbiBtaW5lIGZhaWx1cmU/XHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIG9yZGFpbmVkIG1vdGlvbiAvIHN0aWxsbmVzc1xyXG4vLyBUT0RPOiBmYWlsdXJlcyBvZiBwbGFpbnQgb2Ygc2V2ZXJpdHkgKHRldGhlcnMpXHJcbi8vIFRPRE86IGZhaWx1cmVzIG9mIHBsYWludCBvZiBzb2xpZGFyaXR5IChzaGFyZWQgc2VudGVuY2UpXHJcbi8vIFRPRE86IG9yZGFpbmVkIGNhcGl0YWwgcHVuaXNobWVudCBoaXR0aW5nIG5vbi10YW5rc1xyXG5cclxuY29uc3QgdHJpZ2dlclNldDogT29wc3lUcmlnZ2VyU2V0PERhdGE+ID0ge1xyXG4gIHpvbmVJZDogWm9uZUlkLlRoZUVwaWNPZkFsZXhhbmRlclVsdGltYXRlLFxyXG4gIGRhbWFnZVdhcm46IHtcclxuICAgICdURUEgU2x1aWNlJzogJzQ5QjEnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgMSc6ICc0ODI0JyxcclxuICAgICdURUEgUHJvdGVhbiBXYXZlIDInOiAnNDlCNScsXHJcbiAgICAnVEVBIFNwaW4gQ3J1c2hlcic6ICc0QTcyJyxcclxuICAgICdURUEgU2FjcmFtZW50JzogJzQ4NUYnLFxyXG4gICAgJ1RFQSBSYWRpYW50IFNhY3JhbWVudCc6ICc0ODg2JyxcclxuICAgICdURUEgQWxtaWdodHkgSnVkZ21lbnQnOiAnNDg5MCcsXHJcbiAgfSxcclxuICBkYW1hZ2VGYWlsOiB7XHJcbiAgICAnVEVBIEhhd2sgQmxhc3Rlcic6ICc0ODMwJyxcclxuICAgICdURUEgQ2hha3JhbSc6ICc0ODU1JyxcclxuICAgICdURUEgRW51bWVyYXRpb24nOiAnNDg1MCcsXHJcbiAgICAnVEVBIEFwb2NhbHlwdGljIFJheSc6ICc0ODRDJyxcclxuICAgICdURUEgUHJvcGVsbGVyIFdpbmQnOiAnNDgzMicsXHJcbiAgfSxcclxuICBzaGFyZVdhcm46IHtcclxuICAgICdURUEgUHJvdGVhbiBXYXZlIERvdWJsZSAxJzogJzQ5QjYnLFxyXG4gICAgJ1RFQSBQcm90ZWFuIFdhdmUgRG91YmxlIDInOiAnNDgyNScsXHJcbiAgICAnVEVBIEZsdWlkIFN3aW5nJzogJzQ5QjAnLFxyXG4gICAgJ1RFQSBGbHVpZCBTdHJpa2UnOiAnNDlCNycsXHJcbiAgICAnVEVBIEhpZGRlbiBNaW5lJzogJzQ4NTInLFxyXG4gICAgJ1RFQSBBbHBoYSBTd29yZCc6ICc0ODZCJyxcclxuICAgICdURUEgRmxhcmV0aHJvd2VyJzogJzQ4NkInLFxyXG4gICAgJ1RFQSBDaGFzdGVuaW5nIEhlYXQnOiAnNEE4MCcsXHJcbiAgICAnVEVBIERpdmluZSBTcGVhcic6ICc0QTgyJyxcclxuICAgICdURUEgT3JkYWluZWQgUHVuaXNobWVudCc6ICc0ODkxJyxcclxuICAgIC8vIE9wdGljYWwgU3ByZWFkXHJcbiAgICAnVEVBIEluZGl2aWR1YWwgUmVwcm9iYXRpb24nOiAnNDg4QycsXHJcbiAgfSxcclxuICBzb2xvRmFpbDoge1xyXG4gICAgLy8gT3B0aWNhbCBTdGFja1xyXG4gICAgJ1RFQSBDb2xsZWN0aXZlIFJlcHJvYmF0aW9uJzogJzQ4OEQnLFxyXG4gIH0sXHJcbiAgdHJpZ2dlcnM6IFtcclxuICAgIHtcclxuICAgICAgLy8gXCJ0b28gbXVjaCBsdW1pbm91cyBhZXRoZXJvcGxhc21cIlxyXG4gICAgICAvLyBXaGVuIHRoaXMgaGFwcGVucywgdGhlIHRhcmdldCBleHBsb2RlcywgaGl0dGluZyBuZWFyYnkgcGVvcGxlXHJcbiAgICAgIC8vIGJ1dCBhbHNvIHRoZW1zZWx2ZXMuXHJcbiAgICAgIGlkOiAnVEVBIEV4aGF1c3QnLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODFGJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBjb25kaXRpb246IChfZGF0YSwgbWF0Y2hlcykgPT4gbWF0Y2hlcy50YXJnZXQgPT09IG1hdGNoZXMuc291cmNlLFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdHlwZTogJ2ZhaWwnLFxyXG4gICAgICAgICAgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LFxyXG4gICAgICAgICAgdGV4dDoge1xyXG4gICAgICAgICAgICBlbjogJ2x1bWlub3VzIGFldGhlcm9wbGFzbScsXHJcbiAgICAgICAgICAgIGRlOiAnTHVtaW5pc3plbnRlcyDDhHRoZXJvcGxhc21hJyxcclxuICAgICAgICAgICAgZnI6ICfDiXRow6lyb3BsYXNtYSBsdW1pbmV1eCcsXHJcbiAgICAgICAgICAgIGphOiAn5YWJ5oCn54iG6Zu3JyxcclxuICAgICAgICAgICAgY246ICflhYnmgKfniIbpm7cnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgRHJvcHN5JyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzEyMScgfSksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICd3YXJuJywgYmxhbWU6IG1hdGNoZXMudGFyZ2V0LCB0ZXh0OiBtYXRjaGVzLmVmZmVjdCB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGV0aGVyIFRyYWNraW5nJyxcclxuICAgICAgdHlwZTogJ1RldGhlcicsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLnRldGhlcih7IHNvdXJjZTogJ0phZ2QgRG9sbCcsIGlkOiAnMDAxMScgfSksXHJcbiAgICAgIHJ1bjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBkYXRhLmphZ2RUZXRoZXIgPz89IHt9O1xyXG4gICAgICAgIGRhdGEuamFnZFRldGhlclttYXRjaGVzLnNvdXJjZUlkXSA9IG1hdGNoZXMudGFyZ2V0O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgUmVkdWNpYmxlIENvbXBsZXhpdHknLFxyXG4gICAgICB0eXBlOiAnQWJpbGl0eScsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmFiaWxpdHlGdWxsKHsgaWQ6ICc0ODIxJywgLi4ucGxheWVyRGFtYWdlRmllbGRzIH0pLFxyXG4gICAgICBtaXN0YWtlOiAoZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAnZmFpbCcsXHJcbiAgICAgICAgICAvLyBUaGlzIG1heSBiZSB1bmRlZmluZWQsIHdoaWNoIGlzIGZpbmUuXHJcbiAgICAgICAgICBuYW1lOiBkYXRhLmphZ2RUZXRoZXIgPyBkYXRhLmphZ2RUZXRoZXJbbWF0Y2hlcy5zb3VyY2VJZF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICB0ZXh0OiB7XHJcbiAgICAgICAgICAgIGVuOiAnRG9sbCBEZWF0aCcsXHJcbiAgICAgICAgICAgIGRlOiAnUHVwcGUgVG90JyxcclxuICAgICAgICAgICAgZnI6ICdQb3Vww6llIG1vcnRlJyxcclxuICAgICAgICAgICAgamE6ICfjg4njg7zjg6vjgYzmrbvjgpPjgaAnLFxyXG4gICAgICAgICAgICBjbjogJ+a1ruWjq+W+t+atu+S6oScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpZDogJ1RFQSBEcmFpbmFnZScsXHJcbiAgICAgIHR5cGU6ICdBYmlsaXR5JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuYWJpbGl0eUZ1bGwoeyBpZDogJzQ4MjcnLCAuLi5wbGF5ZXJEYW1hZ2VGaWVsZHMgfSksXHJcbiAgICAgIGNvbmRpdGlvbjogKGRhdGEsIG1hdGNoZXMpID0+ICFkYXRhLnBhcnR5LmlzVGFuayhtYXRjaGVzLnRhcmdldCksXHJcbiAgICAgIG1pc3Rha2U6IChfZGF0YSwgbWF0Y2hlcykgPT4ge1xyXG4gICAgICAgIHJldHVybiB7IHR5cGU6ICdmYWlsJywgbmFtZTogbWF0Y2hlcy50YXJnZXQsIHRleHQ6IG1hdGNoZXMuYWJpbGl0eSB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUgR2FpbicsXHJcbiAgICAgIHR5cGU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmdhaW5zRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWQ6ICdURUEgVGhyb3R0bGUgTG9zZScsXHJcbiAgICAgIHR5cGU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICAgIG5ldFJlZ2V4OiBOZXRSZWdleGVzLmxvc2VzRWZmZWN0KHsgZWZmZWN0SWQ6ICcyQkMnIH0pLFxyXG4gICAgICBydW46IChkYXRhLCBtYXRjaGVzKSA9PiB7XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZSA/Pz0ge307XHJcbiAgICAgICAgZGF0YS5oYXNUaHJvdHRsZVttYXRjaGVzLnRhcmdldF0gPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnVEVBIFRocm90dGxlJyxcclxuICAgICAgdHlwZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgICAgbmV0UmVnZXg6IE5ldFJlZ2V4ZXMuZ2FpbnNFZmZlY3QoeyBlZmZlY3RJZDogJzJCQycgfSksXHJcbiAgICAgIGRlbGF5U2Vjb25kczogKF9kYXRhLCBtYXRjaGVzKSA9PiBwYXJzZUZsb2F0KG1hdGNoZXMuZHVyYXRpb24pIC0gMC41LFxyXG4gICAgICBkZWF0aFJlYXNvbjogKGRhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuaGFzVGhyb3R0bGUpXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKCFkYXRhLmhhc1Rocm90dGxlW21hdGNoZXMudGFyZ2V0XSlcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogbWF0Y2hlcy50YXJnZXQsXHJcbiAgICAgICAgICB0ZXh0OiBtYXRjaGVzLmVmZmVjdCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgLy8gQmFsbG9vbiBQb3BwaW5nLiAgSXQgc2VlbXMgbGlrZSB0aGUgcGVyc29uIHdobyBwb3BzIGl0IGlzIHRoZVxyXG4gICAgICAvLyBmaXJzdCBwZXJzb24gbGlzdGVkIGRhbWFnZS13aXNlLCBzbyB0aGV5IGFyZSBsaWtlbHkgdGhlIGN1bHByaXQuXHJcbiAgICAgIGlkOiAnVEVBIE91dGJ1cnN0JyxcclxuICAgICAgdHlwZTogJ0FiaWxpdHknLFxyXG4gICAgICBuZXRSZWdleDogTmV0UmVnZXhlcy5hYmlsaXR5RnVsbCh7IGlkOiAnNDgyQScsIC4uLnBsYXllckRhbWFnZUZpZWxkcyB9KSxcclxuICAgICAgc3VwcHJlc3NTZWNvbmRzOiA1LFxyXG4gICAgICBtaXN0YWtlOiAoX2RhdGEsIG1hdGNoZXMpID0+IHtcclxuICAgICAgICByZXR1cm4geyB0eXBlOiAnZmFpbCcsIGJsYW1lOiBtYXRjaGVzLnRhcmdldCwgdGV4dDogbWF0Y2hlcy5zb3VyY2UgfTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHRyaWdnZXJTZXQ7XHJcbiIsImltcG9ydCBmaWxlMCBmcm9tICcuLzAwLW1pc2MvYnVmZnMudHMnO1xuaW1wb3J0IGZpbGUxIGZyb20gJy4vMDAtbWlzYy9nZW5lcmFsLnRzJztcbmltcG9ydCBmaWxlMiBmcm9tICcuLzAwLW1pc2MvdGVzdC50cyc7XG5pbXBvcnQgZmlsZTMgZnJvbSAnLi8wMi1hcnIvdHJpYWwvaWZyaXQtbm0udHMnO1xuaW1wb3J0IGZpbGU0IGZyb20gJy4vMDItYXJyL3RyaWFsL3RpdGFuLW5tLnRzJztcbmltcG9ydCBmaWxlNSBmcm9tICcuLzAyLWFyci90cmlhbC9sZXZpLWV4LnRzJztcbmltcG9ydCBmaWxlNiBmcm9tICcuLzAyLWFyci90cmlhbC9zaGl2YS1obS50cyc7XG5pbXBvcnQgZmlsZTcgZnJvbSAnLi8wMi1hcnIvdHJpYWwvc2hpdmEtZXgudHMnO1xuaW1wb3J0IGZpbGU4IGZyb20gJy4vMDItYXJyL3RyaWFsL3RpdGFuLWhtLnRzJztcbmltcG9ydCBmaWxlOSBmcm9tICcuLzAyLWFyci90cmlhbC90aXRhbi1leC50cyc7XG5pbXBvcnQgZmlsZTEwIGZyb20gJy4vMDMtaHcvYWxsaWFuY2Uvd2VlcGluZ19jaXR5LnRzJztcbmltcG9ydCBmaWxlMTEgZnJvbSAnLi8wMy1ody9kdW5nZW9uL2FldGhlcm9jaGVtaWNhbF9yZXNlYXJjaF9mYWNpbGl0eS50cyc7XG5pbXBvcnQgZmlsZTEyIGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9mcmFjdGFsX2NvbnRpbnV1bS50cyc7XG5pbXBvcnQgZmlsZTEzIGZyb20gJy4vMDMtaHcvZHVuZ2Vvbi9ndWJhbF9saWJyYXJ5X2hhcmQudHMnO1xuaW1wb3J0IGZpbGUxNCBmcm9tICcuLzAzLWh3L2R1bmdlb24vc29obV9hbF9oYXJkLnRzJztcbmltcG9ydCBmaWxlMTUgZnJvbSAnLi8wMy1ody9yYWlkL2ExMm4udHMnO1xuaW1wb3J0IGZpbGUxNiBmcm9tICcuLzA0LXNiL2R1bmdlb24vYWxhX21oaWdvLnRzJztcbmltcG9ydCBmaWxlMTcgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL2JhcmRhbXNfbWV0dGxlLnRzJztcbmltcG9ydCBmaWxlMTggZnJvbSAnLi8wNC1zYi9kdW5nZW9uL2Ryb3duZWRfY2l0eV9vZl9za2FsbGEudHMnO1xuaW1wb3J0IGZpbGUxOSBmcm9tICcuLzA0LXNiL2R1bmdlb24va3VnYW5lX2Nhc3RsZS50cyc7XG5pbXBvcnQgZmlsZTIwIGZyb20gJy4vMDQtc2IvZHVuZ2Vvbi9zdF9tb2NpYW5uZV9oYXJkLnRzJztcbmltcG9ydCBmaWxlMjEgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3N3YWxsb3dzX2NvbXBhc3MudHMnO1xuaW1wb3J0IGZpbGUyMiBmcm9tICcuLzA0LXNiL2R1bmdlb24vdGVtcGxlX29mX3RoZV9maXN0LnRzJztcbmltcG9ydCBmaWxlMjMgZnJvbSAnLi8wNC1zYi9kdW5nZW9uL3RoZV9idXJuLnRzJztcbmltcG9ydCBmaWxlMjQgZnJvbSAnLi8wNC1zYi9yYWlkL28xbi50cyc7XG5pbXBvcnQgZmlsZTI1IGZyb20gJy4vMDQtc2IvcmFpZC9vMm4udHMnO1xuaW1wb3J0IGZpbGUyNiBmcm9tICcuLzA0LXNiL3JhaWQvbzNuLnRzJztcbmltcG9ydCBmaWxlMjcgZnJvbSAnLi8wNC1zYi9yYWlkL280bi50cyc7XG5pbXBvcnQgZmlsZTI4IGZyb20gJy4vMDQtc2IvcmFpZC9vNHMudHMnO1xuaW1wb3J0IGZpbGUyOSBmcm9tICcuLzA0LXNiL3JhaWQvbzdzLnRzJztcbmltcG9ydCBmaWxlMzAgZnJvbSAnLi8wNC1zYi9yYWlkL28xMnMudHMnO1xuaW1wb3J0IGZpbGUzMSBmcm9tICcuLzA0LXNiL3RyaWFsL2J5YWtrby1leC50cyc7XG5pbXBvcnQgZmlsZTMyIGZyb20gJy4vMDQtc2IvdHJpYWwvc2hpbnJ5dS50cyc7XG5pbXBvcnQgZmlsZTMzIGZyb20gJy4vMDQtc2IvdHJpYWwvc3VzYW5vLWV4LnRzJztcbmltcG9ydCBmaWxlMzQgZnJvbSAnLi8wNC1zYi90cmlhbC9zdXpha3UudHMnO1xuaW1wb3J0IGZpbGUzNSBmcm9tICcuLzA0LXNiL3VsdGltYXRlL3VsdGltYV93ZWFwb25fdWx0aW1hdGUudHMnO1xuaW1wb3J0IGZpbGUzNiBmcm9tICcuLzA0LXNiL3VsdGltYXRlL3VuZW5kaW5nX2NvaWxfdWx0aW1hdGUudHMnO1xuaW1wb3J0IGZpbGUzNyBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfY29waWVkX2ZhY3RvcnkudHMnO1xuaW1wb3J0IGZpbGUzOCBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfcHVwcGV0c19idW5rZXIudHMnO1xuaW1wb3J0IGZpbGUzOSBmcm9tICcuLzA1LXNoYi9hbGxpYW5jZS90aGVfdG93ZXJfYXRfcGFyYWRpZ21zX2JyZWFjaC50cyc7XG5pbXBvcnQgZmlsZTQwIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYWthZGFlbWlhX2FueWRlci50cyc7XG5pbXBvcnQgZmlsZTQxIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYW1hdXJvdC50cyc7XG5pbXBvcnQgZmlsZTQyIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vYW5hbW5lc2lzX2FueWRlci50cyc7XG5pbXBvcnQgZmlsZTQzIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vZG9obl9taGVnLnRzJztcbmltcG9ydCBmaWxlNDQgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9oZXJvZXNfZ2F1bnRsZXQudHMnO1xuaW1wb3J0IGZpbGU0NSBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL2hvbG1pbnN0ZXJfc3dpdGNoLnRzJztcbmltcG9ydCBmaWxlNDYgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tYWxpa2Foc193ZWxsLnRzJztcbmltcG9ydCBmaWxlNDcgZnJvbSAnLi8wNS1zaGIvZHVuZ2Vvbi9tYXRveWFzX3JlbGljdC50cyc7XG5pbXBvcnQgZmlsZTQ4IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vbXRfZ3VsZy50cyc7XG5pbXBvcnQgZmlsZTQ5IGZyb20gJy4vMDUtc2hiL2R1bmdlb24vcGFnbHRoYW4udHMnO1xuaW1wb3J0IGZpbGU1MCBmcm9tICcuLzA1LXNoYi9kdW5nZW9uL3FpdGFuYV9yYXZlbC50cyc7XG5pbXBvcnQgZmlsZTUxIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vdGhlX2dyYW5kX2Nvc21vcy50cyc7XG5pbXBvcnQgZmlsZTUyIGZyb20gJy4vMDUtc2hiL2R1bmdlb24vdHdpbm5pbmcudHMnO1xuaW1wb3J0IGZpbGU1MyBmcm9tICcuLzA1LXNoYi9ldXJla2EvZGVsdWJydW1fcmVnaW5hZS50cyc7XG5pbXBvcnQgZmlsZTU0IGZyb20gJy4vMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlX3NhdmFnZS50cyc7XG5pbXBvcnQgZmlsZTU1IGZyb20gJy4vMDUtc2hiL3JhaWQvZTFuLnRzJztcbmltcG9ydCBmaWxlNTYgZnJvbSAnLi8wNS1zaGIvcmFpZC9lMXMudHMnO1xuaW1wb3J0IGZpbGU1NyBmcm9tICcuLzA1LXNoYi9yYWlkL2Uybi50cyc7XG5pbXBvcnQgZmlsZTU4IGZyb20gJy4vMDUtc2hiL3JhaWQvZTJzLnRzJztcbmltcG9ydCBmaWxlNTkgZnJvbSAnLi8wNS1zaGIvcmFpZC9lM24udHMnO1xuaW1wb3J0IGZpbGU2MCBmcm9tICcuLzA1LXNoYi9yYWlkL2Uzcy50cyc7XG5pbXBvcnQgZmlsZTYxIGZyb20gJy4vMDUtc2hiL3JhaWQvZTRuLnRzJztcbmltcG9ydCBmaWxlNjIgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNHMudHMnO1xuaW1wb3J0IGZpbGU2MyBmcm9tICcuLzA1LXNoYi9yYWlkL2U1bi50cyc7XG5pbXBvcnQgZmlsZTY0IGZyb20gJy4vMDUtc2hiL3JhaWQvZTVzLnRzJztcbmltcG9ydCBmaWxlNjUgZnJvbSAnLi8wNS1zaGIvcmFpZC9lNm4udHMnO1xuaW1wb3J0IGZpbGU2NiBmcm9tICcuLzA1LXNoYi9yYWlkL2U2cy50cyc7XG5pbXBvcnQgZmlsZTY3IGZyb20gJy4vMDUtc2hiL3JhaWQvZTduLnRzJztcbmltcG9ydCBmaWxlNjggZnJvbSAnLi8wNS1zaGIvcmFpZC9lN3MudHMnO1xuaW1wb3J0IGZpbGU2OSBmcm9tICcuLzA1LXNoYi9yYWlkL2U4bi50cyc7XG5pbXBvcnQgZmlsZTcwIGZyb20gJy4vMDUtc2hiL3JhaWQvZThzLnRzJztcbmltcG9ydCBmaWxlNzEgZnJvbSAnLi8wNS1zaGIvcmFpZC9lOW4udHMnO1xuaW1wb3J0IGZpbGU3MiBmcm9tICcuLzA1LXNoYi9yYWlkL2U5cy50cyc7XG5pbXBvcnQgZmlsZTczIGZyb20gJy4vMDUtc2hiL3JhaWQvZTEwbi50cyc7XG5pbXBvcnQgZmlsZTc0IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEwcy50cyc7XG5pbXBvcnQgZmlsZTc1IGZyb20gJy4vMDUtc2hiL3JhaWQvZTExbi50cyc7XG5pbXBvcnQgZmlsZTc2IGZyb20gJy4vMDUtc2hiL3JhaWQvZTExcy50cyc7XG5pbXBvcnQgZmlsZTc3IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEybi50cyc7XG5pbXBvcnQgZmlsZTc4IGZyb20gJy4vMDUtc2hiL3JhaWQvZTEycy50cyc7XG5pbXBvcnQgZmlsZTc5IGZyb20gJy4vMDUtc2hiL3RyaWFsL2RpYW1vbmRfd2VhcG9uLWV4LnRzJztcbmltcG9ydCBmaWxlODAgZnJvbSAnLi8wNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24udHMnO1xuaW1wb3J0IGZpbGU4MSBmcm9tICcuLzA1LXNoYi90cmlhbC9lbWVyYWxkX3dlYXBvbi1leC50cyc7XG5pbXBvcnQgZmlsZTgyIGZyb20gJy4vMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLnRzJztcbmltcG9ydCBmaWxlODMgZnJvbSAnLi8wNS1zaGIvdHJpYWwvaGFkZXMtZXgudHMnO1xuaW1wb3J0IGZpbGU4NCBmcm9tICcuLzA1LXNoYi90cmlhbC9oYWRlcy50cyc7XG5pbXBvcnQgZmlsZTg1IGZyb20gJy4vMDUtc2hiL3RyaWFsL2lubm9jZW5jZS1leC50cyc7XG5pbXBvcnQgZmlsZTg2IGZyb20gJy4vMDUtc2hiL3RyaWFsL2lubm9jZW5jZS50cyc7XG5pbXBvcnQgZmlsZTg3IGZyb20gJy4vMDUtc2hiL3RyaWFsL2xldmktdW4udHMnO1xuaW1wb3J0IGZpbGU4OCBmcm9tICcuLzA1LXNoYi90cmlhbC9ydWJ5X3dlYXBvbi1leC50cyc7XG5pbXBvcnQgZmlsZTg5IGZyb20gJy4vMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLnRzJztcbmltcG9ydCBmaWxlOTAgZnJvbSAnLi8wNS1zaGIvdHJpYWwvc2hpdmEtdW4udHMnO1xuaW1wb3J0IGZpbGU5MSBmcm9tICcuLzA1LXNoYi90cmlhbC90aXRhbmlhLnRzJztcbmltcG9ydCBmaWxlOTIgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdGl0YW5pYS1leC50cyc7XG5pbXBvcnQgZmlsZTkzIGZyb20gJy4vMDUtc2hiL3RyaWFsL3RpdGFuLXVuLnRzJztcbmltcG9ydCBmaWxlOTQgZnJvbSAnLi8wNS1zaGIvdHJpYWwvdmFyaXMtZXgudHMnO1xuaW1wb3J0IGZpbGU5NSBmcm9tICcuLzA1LXNoYi90cmlhbC93b2wudHMnO1xuaW1wb3J0IGZpbGU5NiBmcm9tICcuLzA1LXNoYi90cmlhbC93b2wtZXgudHMnO1xuaW1wb3J0IGZpbGU5NyBmcm9tICcuLzA1LXNoYi91bHRpbWF0ZS90aGVfZXBpY19vZl9hbGV4YW5kZXIudHMnO1xuXG5leHBvcnQgZGVmYXVsdCB7JzAwLW1pc2MvYnVmZnMudHMnOiBmaWxlMCwnMDAtbWlzYy9nZW5lcmFsLnRzJzogZmlsZTEsJzAwLW1pc2MvdGVzdC50cyc6IGZpbGUyLCcwMi1hcnIvdHJpYWwvaWZyaXQtbm0udHMnOiBmaWxlMywnMDItYXJyL3RyaWFsL3RpdGFuLW5tLnRzJzogZmlsZTQsJzAyLWFyci90cmlhbC9sZXZpLWV4LnRzJzogZmlsZTUsJzAyLWFyci90cmlhbC9zaGl2YS1obS50cyc6IGZpbGU2LCcwMi1hcnIvdHJpYWwvc2hpdmEtZXgudHMnOiBmaWxlNywnMDItYXJyL3RyaWFsL3RpdGFuLWhtLnRzJzogZmlsZTgsJzAyLWFyci90cmlhbC90aXRhbi1leC50cyc6IGZpbGU5LCcwMy1ody9hbGxpYW5jZS93ZWVwaW5nX2NpdHkudHMnOiBmaWxlMTAsJzAzLWh3L2R1bmdlb24vYWV0aGVyb2NoZW1pY2FsX3Jlc2VhcmNoX2ZhY2lsaXR5LnRzJzogZmlsZTExLCcwMy1ody9kdW5nZW9uL2ZyYWN0YWxfY29udGludXVtLnRzJzogZmlsZTEyLCcwMy1ody9kdW5nZW9uL2d1YmFsX2xpYnJhcnlfaGFyZC50cyc6IGZpbGUxMywnMDMtaHcvZHVuZ2Vvbi9zb2htX2FsX2hhcmQudHMnOiBmaWxlMTQsJzAzLWh3L3JhaWQvYTEybi50cyc6IGZpbGUxNSwnMDQtc2IvZHVuZ2Vvbi9hbGFfbWhpZ28udHMnOiBmaWxlMTYsJzA0LXNiL2R1bmdlb24vYmFyZGFtc19tZXR0bGUudHMnOiBmaWxlMTcsJzA0LXNiL2R1bmdlb24vZHJvd25lZF9jaXR5X29mX3NrYWxsYS50cyc6IGZpbGUxOCwnMDQtc2IvZHVuZ2Vvbi9rdWdhbmVfY2FzdGxlLnRzJzogZmlsZTE5LCcwNC1zYi9kdW5nZW9uL3N0X21vY2lhbm5lX2hhcmQudHMnOiBmaWxlMjAsJzA0LXNiL2R1bmdlb24vc3dhbGxvd3NfY29tcGFzcy50cyc6IGZpbGUyMSwnMDQtc2IvZHVuZ2Vvbi90ZW1wbGVfb2ZfdGhlX2Zpc3QudHMnOiBmaWxlMjIsJzA0LXNiL2R1bmdlb24vdGhlX2J1cm4udHMnOiBmaWxlMjMsJzA0LXNiL3JhaWQvbzFuLnRzJzogZmlsZTI0LCcwNC1zYi9yYWlkL28ybi50cyc6IGZpbGUyNSwnMDQtc2IvcmFpZC9vM24udHMnOiBmaWxlMjYsJzA0LXNiL3JhaWQvbzRuLnRzJzogZmlsZTI3LCcwNC1zYi9yYWlkL280cy50cyc6IGZpbGUyOCwnMDQtc2IvcmFpZC9vN3MudHMnOiBmaWxlMjksJzA0LXNiL3JhaWQvbzEycy50cyc6IGZpbGUzMCwnMDQtc2IvdHJpYWwvYnlha2tvLWV4LnRzJzogZmlsZTMxLCcwNC1zYi90cmlhbC9zaGlucnl1LnRzJzogZmlsZTMyLCcwNC1zYi90cmlhbC9zdXNhbm8tZXgudHMnOiBmaWxlMzMsJzA0LXNiL3RyaWFsL3N1emFrdS50cyc6IGZpbGUzNCwnMDQtc2IvdWx0aW1hdGUvdWx0aW1hX3dlYXBvbl91bHRpbWF0ZS50cyc6IGZpbGUzNSwnMDQtc2IvdWx0aW1hdGUvdW5lbmRpbmdfY29pbF91bHRpbWF0ZS50cyc6IGZpbGUzNiwnMDUtc2hiL2FsbGlhbmNlL3RoZV9jb3BpZWRfZmFjdG9yeS50cyc6IGZpbGUzNywnMDUtc2hiL2FsbGlhbmNlL3RoZV9wdXBwZXRzX2J1bmtlci50cyc6IGZpbGUzOCwnMDUtc2hiL2FsbGlhbmNlL3RoZV90b3dlcl9hdF9wYXJhZGlnbXNfYnJlYWNoLnRzJzogZmlsZTM5LCcwNS1zaGIvZHVuZ2Vvbi9ha2FkYWVtaWFfYW55ZGVyLnRzJzogZmlsZTQwLCcwNS1zaGIvZHVuZ2Vvbi9hbWF1cm90LnRzJzogZmlsZTQxLCcwNS1zaGIvZHVuZ2Vvbi9hbmFtbmVzaXNfYW55ZGVyLnRzJzogZmlsZTQyLCcwNS1zaGIvZHVuZ2Vvbi9kb2huX21oZWcudHMnOiBmaWxlNDMsJzA1LXNoYi9kdW5nZW9uL2hlcm9lc19nYXVudGxldC50cyc6IGZpbGU0NCwnMDUtc2hiL2R1bmdlb24vaG9sbWluc3Rlcl9zd2l0Y2gudHMnOiBmaWxlNDUsJzA1LXNoYi9kdW5nZW9uL21hbGlrYWhzX3dlbGwudHMnOiBmaWxlNDYsJzA1LXNoYi9kdW5nZW9uL21hdG95YXNfcmVsaWN0LnRzJzogZmlsZTQ3LCcwNS1zaGIvZHVuZ2Vvbi9tdF9ndWxnLnRzJzogZmlsZTQ4LCcwNS1zaGIvZHVuZ2Vvbi9wYWdsdGhhbi50cyc6IGZpbGU0OSwnMDUtc2hiL2R1bmdlb24vcWl0YW5hX3JhdmVsLnRzJzogZmlsZTUwLCcwNS1zaGIvZHVuZ2Vvbi90aGVfZ3JhbmRfY29zbW9zLnRzJzogZmlsZTUxLCcwNS1zaGIvZHVuZ2Vvbi90d2lubmluZy50cyc6IGZpbGU1MiwnMDUtc2hiL2V1cmVrYS9kZWx1YnJ1bV9yZWdpbmFlLnRzJzogZmlsZTUzLCcwNS1zaGIvZXVyZWthL2RlbHVicnVtX3JlZ2luYWVfc2F2YWdlLnRzJzogZmlsZTU0LCcwNS1zaGIvcmFpZC9lMW4udHMnOiBmaWxlNTUsJzA1LXNoYi9yYWlkL2Uxcy50cyc6IGZpbGU1NiwnMDUtc2hiL3JhaWQvZTJuLnRzJzogZmlsZTU3LCcwNS1zaGIvcmFpZC9lMnMudHMnOiBmaWxlNTgsJzA1LXNoYi9yYWlkL2Uzbi50cyc6IGZpbGU1OSwnMDUtc2hiL3JhaWQvZTNzLnRzJzogZmlsZTYwLCcwNS1zaGIvcmFpZC9lNG4udHMnOiBmaWxlNjEsJzA1LXNoYi9yYWlkL2U0cy50cyc6IGZpbGU2MiwnMDUtc2hiL3JhaWQvZTVuLnRzJzogZmlsZTYzLCcwNS1zaGIvcmFpZC9lNXMudHMnOiBmaWxlNjQsJzA1LXNoYi9yYWlkL2U2bi50cyc6IGZpbGU2NSwnMDUtc2hiL3JhaWQvZTZzLnRzJzogZmlsZTY2LCcwNS1zaGIvcmFpZC9lN24udHMnOiBmaWxlNjcsJzA1LXNoYi9yYWlkL2U3cy50cyc6IGZpbGU2OCwnMDUtc2hiL3JhaWQvZThuLnRzJzogZmlsZTY5LCcwNS1zaGIvcmFpZC9lOHMudHMnOiBmaWxlNzAsJzA1LXNoYi9yYWlkL2U5bi50cyc6IGZpbGU3MSwnMDUtc2hiL3JhaWQvZTlzLnRzJzogZmlsZTcyLCcwNS1zaGIvcmFpZC9lMTBuLnRzJzogZmlsZTczLCcwNS1zaGIvcmFpZC9lMTBzLnRzJzogZmlsZTc0LCcwNS1zaGIvcmFpZC9lMTFuLnRzJzogZmlsZTc1LCcwNS1zaGIvcmFpZC9lMTFzLnRzJzogZmlsZTc2LCcwNS1zaGIvcmFpZC9lMTJuLnRzJzogZmlsZTc3LCcwNS1zaGIvcmFpZC9lMTJzLnRzJzogZmlsZTc4LCcwNS1zaGIvdHJpYWwvZGlhbW9uZF93ZWFwb24tZXgudHMnOiBmaWxlNzksJzA1LXNoYi90cmlhbC9kaWFtb25kX3dlYXBvbi50cyc6IGZpbGU4MCwnMDUtc2hiL3RyaWFsL2VtZXJhbGRfd2VhcG9uLWV4LnRzJzogZmlsZTgxLCcwNS1zaGIvdHJpYWwvZW1lcmFsZF93ZWFwb24udHMnOiBmaWxlODIsJzA1LXNoYi90cmlhbC9oYWRlcy1leC50cyc6IGZpbGU4MywnMDUtc2hiL3RyaWFsL2hhZGVzLnRzJzogZmlsZTg0LCcwNS1zaGIvdHJpYWwvaW5ub2NlbmNlLWV4LnRzJzogZmlsZTg1LCcwNS1zaGIvdHJpYWwvaW5ub2NlbmNlLnRzJzogZmlsZTg2LCcwNS1zaGIvdHJpYWwvbGV2aS11bi50cyc6IGZpbGU4NywnMDUtc2hiL3RyaWFsL3J1Ynlfd2VhcG9uLWV4LnRzJzogZmlsZTg4LCcwNS1zaGIvdHJpYWwvcnVieV93ZWFwb24udHMnOiBmaWxlODksJzA1LXNoYi90cmlhbC9zaGl2YS11bi50cyc6IGZpbGU5MCwnMDUtc2hiL3RyaWFsL3RpdGFuaWEudHMnOiBmaWxlOTEsJzA1LXNoYi90cmlhbC90aXRhbmlhLWV4LnRzJzogZmlsZTkyLCcwNS1zaGIvdHJpYWwvdGl0YW4tdW4udHMnOiBmaWxlOTMsJzA1LXNoYi90cmlhbC92YXJpcy1leC50cyc6IGZpbGU5NCwnMDUtc2hiL3RyaWFsL3dvbC50cyc6IGZpbGU5NSwnMDUtc2hiL3RyaWFsL3dvbC1leC50cyc6IGZpbGU5NiwnMDUtc2hiL3VsdGltYXRlL3RoZV9lcGljX29mX2FsZXhhbmRlci50cyc6IGZpbGU5Nyx9OyJdLCJzb3VyY2VSb290IjoiIn0=