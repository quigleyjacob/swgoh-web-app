import React, { useEffect, useState } from 'react'
import { Header, Menu, Segment, Table, Grid, Card, Image, Divider } from 'semantic-ui-react'
import CharCard from './cards/CharCard'
import { getCurrency, getMaterial } from '../server/data'
import { getImagePath } from '../utils/inventory.js'
import eraData from '../utils/era-data.json'
import mysteryBoxData from '../utils/mystery-box.json'
import recipeData from '../utils/recipe.json'

function EraData({ session = '', displayMessage = () => {}, units = [] }) {
  const [activeTab, setActiveTab] = useState('Era Units')
  const [activeBossTab, setActiveBossTab] = useState(0)
  const [activeTierTab, setActiveTierTab] = useState(0)
  const [activeTotalTierTab, setActiveTotalTierTab] = useState(0)
  const [currencyMap, setCurrencyMap] = useState({})
  const [materialMap, setMaterialMap] = useState({})
  const tabs = ['Era Units','Coliseum Bosses', 'Era Leveling Materials', 'Loaned Units', 'Total Era Level Rewards']

  const data = {
    'ERA_TITLE_08_NEWREPUBLIC': 'Era of the New Republic',
    'KRAYTDRAGON': 'Krayt Dragon',
    'ZEFFOTOMBGUARDIAN': 'Zeffo Tomb Guardians',
    'JOTAZ': 'Jotaz',
    'DRYAX': 'Dryax',
  }

  const getDataValue = (key) => {
    return data[key] || key
  }

  const imageData = {
    'KRAYTDRAGON': 'tex.coliseum_event_kraytdragon',
    'ZEFFOTOMBGUARDIAN': 'tex.coliseum_event_zeffotombguardian',
    'JOTAZ': 'tex.coliseum_event_jotaz',
    'DRYAX': 'tex.coliseum_event_dryax',
  }
    const getImageForBoss = (identifier) => {
        const imageKey = imageData[identifier] || identifier
        return getImagePath('era', imageKey)
    }

  const formatRange = (start, end, onlyDisplayStart = false) => {
    if (start === end || end === 0 || onlyDisplayStart) {
      return `${start}`
    }
    return `${start}-${end}`
  }

  useEffect(() => {
    if (!session) {
      return
    }
    getCurrency(session, displayMessage, setCurrencyMap)
    getMaterial(session, displayMessage, setMaterialMap)
  }, [session, displayMessage])

  const getMysteryBoxMap = () => {
    return mysteryBoxData.reduce((map, box) => {
      map[box.id] = box.previewItem || []
      return map
    }, {})
  }

  const getRecipeMap = () => {
    console.log(recipeData)
    let map = recipeData.reduce((map, recipe) => {
      map[recipe.id] = JSON.parse(JSON.stringify(recipe))
      return map
    }, {})
    console.log(map)
    return map
  }

  const expandReward = (reward) => {
    const mysteryBoxMap = getMysteryBoxMap()
    if (mysteryBoxMap[reward.id]) {
      return mysteryBoxMap[reward.id]
    }
    return [reward]
  }

  const getRewardInfo = (reward) => {
    if (reward.type === 3) {
      if (reward.id === 'ERA_CURRENCY') {
        return currencyMap[49] || currencyMap['49']
      }
    if (reward.id === 'ERA_UPGRADE_CURRENCY') {
        return currencyMap[50] || currencyMap['50']
      }
      return currencyMap[reward.id]
    }
    return materialMap[reward.id]
  }

  const getRewardImagePath = (reward) => {
    const rewardInfo = getRewardInfo(reward)
    const iconKey = rewardInfo?.iconKey || reward.iconKey || reward.id
    const inventoryType = reward.type === 3 ? 'currency' : 'material'
    return getImagePath(inventoryType, iconKey)
  }

  const renderRewardItem = (reward, index) => {
    // console.log(reward)
    if (!reward) return null
    const rewardInfo = getRewardInfo(reward)
    const quantity = formatRange(reward.minQuantity, reward.maxQuantity)
    const imageUrl = getRewardImagePath(reward)
    const displayName = rewardInfo?.nameKey || reward.id
    return (
      <div key={`${reward.id}-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <Image src={imageUrl} size='mini' rounded style={{ marginRight: '0.75rem' }} alt={displayName} />
        <div>
          <div style={{ fontWeight: '700' }}>{displayName}</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>{quantity}</div>
        </div>
      </div>
    )
  }

  const renderTierTable = (tier, tableIndex) => {
    return (
      <Table celled compact key={tableIndex} definition>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Rank</Table.HeaderCell>
            <Table.HeaderCell>Rewards</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(tier.bossProgressionRewardPreview || []).map((preview, previewIndex) => {
            const rewardList = preview.detailedReward?.length ? preview.detailedReward : preview.primaryReward
            const expandedRewards = rewardList?.flatMap((reward) => expandReward(reward)) || []
            return (
              <Table.Row key={previewIndex}>
                <Table.Cell>{formatRange(preview.rankStart, preview.rankEnd)}</Table.Cell>
                <Table.Cell>
                  {expandedRewards.map((reward, rewardIndex) => renderRewardItem(reward, rewardIndex))}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    )
  }

  const renderColiseumBosses = () => {
    const bosses = eraData.coliseum?.bossDefinition || []
    if (!bosses.length) {
      return <p>No coliseum boss reward data available.</p>
    }

    const bossNames = bosses.map((boss) => getDataValue(boss.identifier?.campaignNodeId) || `Boss ${bosses.indexOf(boss) + 1}`)
    const allBossNames = [...bossNames, 'Total']

    return (
      <Grid>
        <Grid.Row centered>
            <Grid.Column width = {4}>
                {
                        bosses[activeBossTab] ? 
                        <Image src={getImageForBoss(bosses[activeBossTab]?.identifier?.campaignNodeId)} size='normal'/>
                        : null
                }
            </Grid.Column>
            <Grid.Column width = {12}>
                <Menu attached='top' tabular>
                {allBossNames.map((name, index) => (
                    <Menu.Item
                    key={index}
                    name={name}
                    active={activeBossTab === index}
                    onClick={() => {
                        setActiveBossTab(index)
                        setActiveTierTab(0)
                        setActiveTotalTierTab(0)
                    }}
                    />
                ))}
                </Menu>

                <Segment attached='bottom'>
                {activeBossTab === bosses.length ? (
                    renderCumulativeRewards()
                ) : bosses[activeBossTab] ? (
                    <div>
                    <Menu secondary>
                        {(bosses[activeBossTab].bossRewardTable || []).map((tier, tierIndex) => (
                        <Menu.Item
                            key={tierIndex}
                            name={`Tier ${tierIndex + 1}`}
                            active={activeTierTab === tierIndex}
                            onClick={() => setActiveTierTab(tierIndex)}
                        />
                        ))}
                    </Menu>
                    <Segment>
                        {bosses[activeBossTab].bossRewardTable[activeTierTab] &&
                        renderTierTable(bosses[activeBossTab].bossRewardTable[activeTierTab], activeTierTab)}
                    </Segment>
                    </div>
                ) : null}
                </Segment>
        </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  const getMaxTierCount = () => {
    const bosses = eraData.coliseum?.bossDefinition || []
    return Math.max(...bosses.map((boss) => boss.bossRewardTable?.length || 0), 0)
  }

  const getCumulativeRewards = (maxTier = null) => {
    const rewards = {}
    const bosses = eraData.coliseum?.bossDefinition || []

    bosses.forEach((boss) => {
      (boss.bossRewardTable || []).forEach((tier, tierIndex) => {
        if (maxTier !== null && tierIndex > maxTier) {
          return
        }
        (tier.bossProgressionRewardPreview || []).forEach((preview) => {
          const rewardList = preview.detailedReward?.length ? preview.detailedReward : preview.primaryReward
          const expandedRewards = rewardList?.flatMap((reward) => expandReward(reward)) || []
          expandedRewards?.forEach((reward) => {
            if (!rewards[reward.id]) {
              rewards[reward.id] = { ...reward, minQuantity: 0, maxQuantity: 0 }
            }
            rewards[reward.id].minQuantity += reward.minQuantity
            rewards[reward.id].maxQuantity += reward.maxQuantity
          })
        })
      })
    })

    return Object.values(rewards)
  }

  const renderCumulativeRewards = () => {
    const maxTiers = getMaxTierCount()
    const tierTabs = Array.from({ length: maxTiers }, (_, i) => `Tier ${i + 1}`)
    const cumulativeRewards = getCumulativeRewards(activeTotalTierTab)

    if (!cumulativeRewards.length) {
      return <p>No cumulative reward data available.</p>
    }

    const selectedTierLabel = `Tier ${activeTotalTierTab + 1}`

    return (
      <div>
        <Menu secondary>
          {tierTabs.map((tierName, index) => (
            <Menu.Item
              key={index}
              name={tierName}
              active={activeTotalTierTab === index}
              onClick={() => setActiveTotalTierTab(index)}
            />
          ))}
        </Menu>
        <Segment>
          <Card fluid style={{ marginBottom: '1.5rem' }}>
            <Card.Content>
              <Card.Header>About these rewards</Card.Header>
              <Card.Description>
                These are the cumulative rewards you can obtain by completing all tiers up to and including {selectedTierLabel} across all coliseum bosses. The quantity ranges represent the minimum and maximum you can earn based on your final rank within each tier.
              </Card.Description>
            </Card.Content>
          </Card>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            {cumulativeRewards.map((reward, index) => (
              <div key={index}>{renderRewardItem(reward, index)}</div>
            ))}
          </div>
        </Segment>
      </div>
    )
  }

  const renderEraLevels = () => {
    const levels = eraData.eraLevel || []
    if (!levels.length) {
      return <p>No era level data available.</p>
    }

    let recipeMap = getRecipeMap()

    let combineIngredients = (list1, list2) => {
        let combined = JSON.parse(JSON.stringify(list1))
        list2.forEach(ingredient => {
            let existing = combined.find(item => item.id === ingredient.id && item.type === ingredient.type)
            if (existing) {
                existing.minQuantity += ingredient.minQuantity
                existing.maxQuantity += ingredient.maxQuantity
            } else {
                combined.push(ingredient)
            }
        })
        return combined
    }

    let cells = levels.reduce((acc, level) => {
        let ingredients = JSON.parse(JSON.stringify(recipeMap[level.upgradeRecipeId]?.ingredients || []))
        let prevIngredients = acc.length > 0 ? JSON.parse(JSON.stringify(acc[acc.length - 1].cumulativeIngredients)) : []
        acc.push({
            level: level.level,
            ingredients,
            cumulativeIngredients: combineIngredients(ingredients, prevIngredients)
        })
        return acc
    }, [])

    return (
      <Table celled compact striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Level</Table.HeaderCell>
            <Table.HeaderCell>Materials</Table.HeaderCell>
            <Table.HeaderCell>Cumulative Materials</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {cells.map((level, index) => (
            <Table.Row key={level.level}>
              <Table.Cell>{level.level}</Table.Cell>
              <Table.Cell>
                {
                   level.ingredients.map((ingredient, i) => {
                        return renderRewardItem(ingredient, i)
                    })
                }
              </Table.Cell>
              <Table.Cell>
                {
                   level.cumulativeIngredients.map((ingredient, i) => {
                        return renderRewardItem(ingredient, i)
                    })
                }
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  const renderCharCards = (ids = [], includeJourney = false) => {
    if (!ids.length && !includeJourney) {
      return <p>No units available.</p>
    }

    const cards = ids.map((id) => {
        let unit = units.find(unit => unit.baseId === id) || {
        baseId: id,
        nameKey: id,
        thumbnailName: id,
        combatType: 1
      }
      return (
          <CharCard size='normal' unit={unit} simpleName />
      )
    })

    if (includeJourney && eraData.journeyUnit) {
      const journey = eraData.journeyUnit
      cards.unshift(
        <Grid.Column key={journey} computer={2} tablet={4} mobile={8} style={{ marginBottom: '1rem' }}>
          <CharCard size='normal' unit={{ baseId: journey, nameKey: journey, thumbnailName: journey, combatType: 1 }} simple />
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontWeight: '700', wordBreak: 'break-word' }}>{journey} (Journey Unit)</div>
        </Grid.Column>
      )
    }

    return <Grid columns={5} stackable centered>{cards}</Grid>
  }

  const renderTotalRewards = () => {
    const rewards = eraData.totalEraLevelsRewardPreview || []
    if (!rewards.length) {
      return <p>No total era level reward preview available.</p>
    }

    return (
      <Table celled compact striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Rank</Table.HeaderCell>
            <Table.HeaderCell>Reward</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rewards.map((entry, index) => {
            const rewardList = entry.primaryReward?.length ? entry.primaryReward : entry.detailedReward
            return (
              <Table.Row key={index}>
                <Table.Cell>{formatRange(entry.rankStart, entry.rankEnd, true)}</Table.Cell>
                <Table.Cell>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                        {rewardList?.map((reward, rewardIndex) => renderRewardItem(reward, rewardIndex))}
                    </div>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    )
  }

  return (
    <Grid>
        <Grid.Row centered>
            <Image src={getImagePath('era', eraData.icon)} circular />
        </Grid.Row>
        <Grid.Row centered>
            <Header as='h2' textAlign='center'>
                {getDataValue(eraData.nameKey)}
            </Header>
        </Grid.Row>

       <Grid.Row centered>
        <Menu pointing secondary widths={tabs.length}>
            {tabs.map((tab) => (
            <Menu.Item
                key={tab}
                name={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
            />
            ))}
        </Menu>
        </Grid.Row>

<Grid.Row>
    <Grid.Column>
      <Segment>
        {activeTab === 'Coliseum Bosses' && renderColiseumBosses()}
        {activeTab === 'Era Leveling Materials' && renderEraLevels()}
        {activeTab === 'Loaned Units' && renderCharCards(eraData.loanedUnit?.map((unit) => unit.id) || [])}
        {activeTab === 'Era Units' && renderCharCards(eraData.eraUnitId || [], true)}
        {activeTab === 'Total Era Level Rewards' && renderTotalRewards()}
      </Segment>
    </Grid.Column>

</Grid.Row>
    </Grid>
  )
}

export default EraData
