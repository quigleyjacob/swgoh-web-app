import { Accordion, Icon } from 'semantic-ui-react';
import Datacron from '../components/profile/Datacron';

export function getGuildDatacronTestResults(account, guildDatacronTest, datacrons) {
    let playerDatacrons = JSON.parse(JSON.stringify(account.datacron))
    playerDatacrons.forEach(datacron => {
        datacron.statsMap = getStats(datacron)
        datacron.countMap = getCounts(datacron)
    })
    let playerDatacronsMap = playerDatacrons.reduce((map, obj) => (map[obj.id] = obj, map), {})
    let tests = guildDatacronTest.active.list

    return tests.map(test => {
        let scores = datacronScores(playerDatacrons, test, datacrons)
        
        let bestMatch = findBestMatch(playerDatacrons, test, scores)
        if(bestMatch.score > 0) {
            playerDatacrons = playerDatacrons.filter(datacron => datacron.id !== bestMatch.id)
            let datacron = playerDatacronsMap[bestMatch.id]
        
            return {
                passed: bestMatch.score === 1,
                score: bestMatch.score,
                datacron: datacron,
                testCases: datacronTestResults(datacron, test)
            }
        } else {
            return {
                passed: false,
                score: 0
            }
        }
        

        
    })
}

function findBestMatch(datacrons, test, scores) {

    let findMax = test.stats?.find(stat => stat.type === 'max') || false
    if(findMax) {
        let candidates = scores.filter(obj => obj.score === 1)
        if(candidates.length > 0) {
            let idArray = candidates.map(obj => obj.id)
            let candidateDatacrons = datacrons.filter(datacron => idArray.includes(datacron.id))
            let stat = findMax.stat
            let bestMatch = candidateDatacrons.reduce((prev, curr) => {
                return prev && prev.statsMap[stat] > curr.statsMap[stat] ? prev : curr
            })
            return candidates.find(obj => obj.id === bestMatch.id)
        }
    }
    return scores.reduce((prev, curr) => {
        return prev && prev.score > curr.score ? prev : curr
    })
}

function datacronScores(playerDatacrons, test, datacrons) {
    let numTests = (test.alignment === "" ? 0 : 1) + (test.faction === "" ? 0 : 1) + (test.character === "" ? 0 : 1) + (test.stats?.length || 0)

    return playerDatacrons.map(datacron => {
        return {id: datacron.id, score: getScore(datacron, test, datacrons) / numTests}
    })

}

function getScore(datacron, test, datacrons) {
    let alignment = test.alignment !== '' && alignmentTest(datacron, test) ? 1 : 0
    let faction = test.faction !== '' && factionTest(datacron, test) ? 1 : 0
    let character = test.character !== '' && characterTest(datacron, test) ? 1 : 0
    let stats = test.stats?.map(stat => {
        return getStatScore(datacron, stat)
    }).reduce((a,b) => a + b, 0) || 0
    return isTargetable(datacron, test, datacrons) ? alignment + faction + character + stats : 0
}

function getStatScore(datacron, statTest) {
    let datacronStats = datacron.statsMap
    let datacronCounts = datacron.countMap
    let min = statTest.min || 0
    let max = statTest.max || Number.MAX_SAFE_INTEGER
    let stat = statTest.stat
    let value = (datacronStats[stat] || 0) / 1000000
    let count = datacronCounts[stat] || 0
    switch(statTest.type) {
        case 'max':
        case 'has':
            return stat in datacronStats ? 1 : 0
        case 'count':
            return stat in datacronCounts && min <= count && count <= max ? 1 : 1 - Math.max((min - count)/min, (count - max)/max)
        case 'percent':
            return stat in datacronStats && min <= value && value <= max ? 1 : 1 - Math.max((min - value)/min, (value - max)/max)
    }
}

function datacronTestResults(datacron, test) {
    return {
        alignment: alignmentTest(datacron, test),
        faction: factionTest(datacron, test),
        character: characterTest(datacron, test),
        stats: test.stats?.map(stat => { return {statTest: stat, score: getStatScore(datacron, stat)}}) || []
    }
}

// function datacronTestFailCount(datacron, test) {
//     return Object.values(datacronTestResults(datacron, test)).filter(test => !test).length
// }

// function datacronMatchesTest(datacron, test) {
//     return datacronTestFailCount(datacron, test) === 0
// }

function alignmentTest(datacron, test) {
    if(test.alignment !== '') {
        if(datacron.affix.length < 3 || test.alignment !== `${datacron.affix[2].abilityId}:${datacron.affix[2].targetRule}`) {
            return false
        }
    }
    return true
}
function factionTest(datacron, test) {
    if(test.faction !== '') {
        if(datacron.affix.length < 6 || test.faction !== `${datacron.affix[5].abilityId}:${datacron.affix[5].targetRule}`) {
            return false
        }
    }
    return true
}
function characterTest(datacron, test) {
    if(test.character !== '') {
        if(datacron.affix.length < 9 || test.character !== `${datacron.affix[8].abilityId}:${datacron.affix[8].targetRule}`) {
            return false
        }
    }
    return true
}
const subset = (a,b) => {
    let first = [...a]
    let second = [...b]
    return first.every(elt => second.includes(elt))
}
function isTargetable(datacron, test, datacrons) {
    // ensure they come from the same set
    let testSet = getSetFromTest(test, datacrons)
    if(!testSet.includes(datacron.setId)) {
        return false
    }
    

    // if we are testing for a specific character bonus
    if(test.character !== '') {
        let lockedTags = getLockedTags(datacron, 9)
        let testTags = getTagsFromBonus(test.character, datacrons)
        // ensure datacron is not locked into incompatible tags
        if(!subset(lockedTags, testTags)) {
            return false
        }
    }
    if(test.faction !== '') {
        let lockedTags = getLockedTags(datacron, 6)
        let testTags = getTagsFromBonus(test.faction, datacrons)
        // ensure datacron is not locked into incompatible tags
        if(!subset(lockedTags, testTags)) {
            return false
        }
    }
    if(test.alignment !== '') {
        let lockedTags = getLockedTags(datacron, 3)
        let testTags = getTagsFromBonus(test.alignment, datacrons)
        // ensure datacron is not locked into incompatible tags
        if(!subset(lockedTags, testTags)) {
            return false
        }
    }
    return true
}

export function isValidDatacronTest(test, datacrons) {
    let arrays = [
        test.alignment !== '' ? getSetFromBonus(test.alignment, datacrons) : undefined,
        test.faction !== '' ? getSetFromBonus(test.faction, datacrons) : undefined,
        test.character !== '' ? getSetFromBonus(test.character, datacrons) : undefined,
        test.stats && test.stats.length !== 0 ? getSetFromStat(test.stats, datacrons) : undefined
    ].filter(elt => elt !== undefined)
    let intersection = arrays?.reduce((a, b) => a.filter(c => b.includes(c)))
    if(intersection.length === 0) {
        return false
    }
    let validDatacronSets = datacrons.filter(set => intersection.includes(set.id))

    let characterTags = test.character !== '' ? getTagsFromBonus(test.character, validDatacronSets) : undefined
    let factionTags = test.faction !== '' ? getTagsFromBonus(test.faction, validDatacronSets) : undefined
    let alignmentTags = test.alignment !== '' ? getTagsFromBonus(test.alignment, validDatacronSets) : undefined
    if(characterTags && factionTags && !subset(factionTags, characterTags)) {
        return false
    }
    if(characterTags && alignmentTags && !subset(alignmentTags, characterTags)) {
        return false
    }
    if(factionTags && alignmentTags && !subset(alignmentTags, factionTags)) {
        return false
    }

    let testStats = test.stats?.map(stat => stat.stat) || []
    let validStats = getValidDatacronStats(validDatacronSets)
    if(testStats.some(stat => !validStats.has(stat))) {
        return false
    }
    return true
}

function getValidDatacronStats(datacrons) {
    return new Set(datacrons.map(set => {
        return set.tier.map(tier => {
            return tier.stats?.map(statArray => {
                return statArray.map(statData => {
                    return String(statData.statType)
                })
            })
        })
    }).flat(3).filter(stat => stat !== undefined))
}

function getTagsFromBonus(key, datacrons) {
    let tags = undefined
    datacrons.forEach(set => {
        set.tier.forEach(tier => {
            if(tier.bonuses) {
                tier.bonuses.forEach(bonusesSet => {
                    bonusesSet.forEach(bonus => {
                        if(bonus.key === key) {
                            tags = bonus.tag
                        }
                    })
                })
            }
        })
    })
    return tags
}
export function getSetFromTest(test, datacrons) {
    if(test.character !== '') {
        return getSetFromBonus(test.character, datacrons)
    }
    if(test.faction !== '') {
        return getSetFromBonus(test.faction, datacrons)
    }
    if(test.alignment !== '') {
        return getSetFromBonus(test.alignment, datacrons)
    }
    if(test.stats.length !== 0) {
        return getSetFromStat(test.stats, datacrons)
    }
    return 0 // this should never happen, guaranteed that something exists.
}
 // key is in form abilityId:targetRule
function getSetFromBonus(key, datacrons) {
    let filteredSets = datacrons.filter(set => {
        return set.tier.some(tier => {
            return tier.bonuses && tier.bonuses.some(bonusesSet => {
                return bonusesSet.some(bonus => {
                    return bonus.key === key
                })
            })
        })
    })
    return filteredSets.map(set => set.id)
}

function getSetFromStat(stats, datacrons) {
    let statTypes = stats?.map(stat => stat.stat)
    let filteredSets = datacrons.filter(set => {
        return set.tier.some(tier => {
            return tier.stats?.some(statArray => {
                return statArray.some(statData => {
                    return statTypes?.includes(String(statData.statType))
                })
            })
        })
    })
    return filteredSets.map(set => set.id)
}

// given a player datacron, determine which tags cannot be rolled out of
function getLockedTags(datacron, maxLevel = undefined) {
    let level = Math.min(maxLevel,datacron.affix.length)
    if(level >= 9) {
        return datacron.affix[8].tag
    } else if (level >=6) {
        return datacron.affix[2].tag
    } else {
        return []
    }
}

function displayTestResults(testResults, guildDatacronTest, datacrons) {
    return testResults.map((result, index) => {
        let name = result.passed ? 'check circle' : result.datacron ? 'warning circle' : 'times circle'
        let color = result.passed ? 'green' : result.datacron ? 'yellow' : 'red'
        let test = guildDatacronTest.active.list[index]
        return {
            key: index,
            title: {content: <span><Icon name={name} color={color}/>{`${test.title} (Score: ${+(Math.round(result.score + "e+3")  + "e-3")})`}</span>},
            content: {content: result.datacron ? <Datacron datacron={result.datacron} datacrons={datacrons} simple={false} test={test} result={result}/> : <div>No Datacron Found</div>}
        }
    })
}

export function displayAccordian(testResults, guildDatacronTest, datacrons) {
    return <Accordion
        styled
        fluid
        exclusive={false}
        panels={displayTestResults(testResults, guildDatacronTest, datacrons)}
    />
}

function getStats(datacron) {
    let statMap = {}
    datacron.affix.forEach(affix => {
        let statType = String(affix.statType)
        if(statType === '1') return
        if(statMap[statType]) {
            statMap[statType] += Number(affix.statValue)
        } else {
            statMap[statType] = Number(affix.statValue)
        }
    })
    return statMap
}

function getCounts(datacron) {
    let statMap = {}
    datacron.affix.forEach(affix => {
        let statType = String(affix.statType)
        if(statType === '1') return
        if(statMap[statType]) {
            statMap[statType] += 1
        } else {
            statMap[statType] = 1
        }
    })
    return statMap
}