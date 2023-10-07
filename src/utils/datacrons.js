import { Accordion, Icon } from 'semantic-ui-react';
import Datacron from '../components/profile/Datacron';

export function getGuildDatacronTestResults(account, guildDatacronTest, datacrons) {
    let playerDatacrons = JSON.parse(JSON.stringify(account.datacron))
    let tests = guildDatacronTest.active.list
    let results = []
    // find datacrons that pass tests
    tests.forEach(test => {
        let matchingDatacron = playerDatacrons.find(datacron => datacronMatchesTest(datacron, test))
        if(matchingDatacron) {
            results.push({passed: true, datacron: matchingDatacron})
            playerDatacrons = playerDatacrons.filter(datacron => datacron.id !== matchingDatacron.id)
        } else {
            results.push({passed: false})
        }
    })
    // now, from remaining datacrons, find best match that is close
    results.forEach((result, index) => {
        if(!result.passed) {
            
            let test = tests[index]
            let bestMatch = playerDatacrons.filter(datacron => isTargetable(datacron, test, datacrons)).reduce((prev, curr) => datacronTestFailCount(prev, test) < datacronTestFailCount(curr, test) ? prev: curr)
            let testResults = datacronTestResults(bestMatch, test)
            // only accept this if at least one success
            if(Object.values(testResults).filter(res => res).length > 0) {
                result.datacron = bestMatch
                result.testCases = testResults
                playerDatacrons.filter(datacron => datacron.id === bestMatch.id)
            }
        }
    })
    return results
}

function datacronTestResults(datacron, test) {
    return {
        alignment: alignmentTest(datacron, test),
        faction: factionTest(datacron, test),
        character: characterTest(datacron, test)
    }
}

function datacronTestFailCount(datacron, test) {
    return Object.values(datacronTestResults(datacron, test)).filter(test => !test).length
}

function datacronMatchesTest(datacron, test) {
    return datacronTestFailCount(datacron, test) === 0
}

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
    let lockedTags = getLockedTags(datacron)

    // if we are testing for a specific character bonus
    if(test.character !== '') {
        let testTags = getTagsFromBonus(test.character, datacrons)
        // ensure datacron is not locked into incompatible tags
        if(!subset(lockedTags, testTags)) {
            return false
        }
    }
    if(test.faction !== '') {
        let testTags = getTagsFromBonus(test.faction, datacrons)
        // ensure datacron is not locked into incompatible tags
        if(!subset(lockedTags, testTags)) {
            return false
        }
    }
    if(test.alignment !== '') {
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
        test.character !== '' ? getSetFromBonus(test.character, datacrons) : undefined
    ].filter(elt => elt !== undefined)
    let intersection = arrays.reduce((a, b) => a.filter(c => b.includes(c)))
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
    return true
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
function getSetFromTest(test, datacrons) {
    if(test.character !== '') {
        return getSetFromBonus(test.character, datacrons)
    }
    if(test.faction !== '') {
        return getSetFromBonus(test.faction, datacrons)
    }
    if(test.alignment !== '') {
        return getSetFromBonus(test.alignment, datacrons)
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

// given a player datacron, determine which tags cannot be rolled out of
function getLockedTags(datacron) {
    let level = datacron.affix.length
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
            title: {content: <span><Icon name={name} color={color}/>{test.title}</span>},
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