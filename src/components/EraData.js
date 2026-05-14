import React, { useEffect, useState } from 'react'
import { Header, Menu, Segment, Table, Grid, Card, Image, Popup } from 'semantic-ui-react'
import CharCard from './cards/CharCard'
import { getCurrency, getMaterial, getEraData } from '../server/data'
import { getImagePath } from '../utils/inventory.js'

function EraData({ session = '', displayMessage = () => {}, units = [] }) {
  const [activeTab, setActiveTab] = useState('Era Units')
  const [activeBossTab, setActiveBossTab] = useState(0)
  const [activeTierTab, setActiveTierTab] = useState(0)
  const [activeTotalTierTab, setActiveTotalTierTab] = useState(0)
  const [currencyMap, setCurrencyMap] = useState({})
  const [materialMap, setMaterialMap] = useState({})
  const [eraData, setEraData] = useState({})
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
      return `${start.toLocaleString()}`;
    }
    return `${start.toLocaleString()}-${end.toLocaleString()}`;
  }

  useEffect(() => {
    if (!session) {
      return
    }
    getCurrency(session, displayMessage, setCurrencyMap)
    getMaterial(session, displayMessage, setMaterialMap)
    getEraData(session, displayMessage, setEraData)
  }, [session, displayMessage])

  const getEraDefinition = () => {
    return eraData?.eraDefinition
  }

  const getMysteryBoxMap = () => {
    return eraData?.mysteryBoxMap
  }

  const getRecipeMap = () => {
    return eraData?.recipeMap
  }

  const expandReward = (reward) => {
    const mysteryBoxMap = getMysteryBoxMap()
    if (mysteryBoxMap[reward.id]) {
      return mysteryBoxMap[reward.id].previewItem || []
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

  const renderCompactRewardItem = (reward, index) => {
    if (!reward) return null
    const rewardInfo = getRewardInfo(reward)
    const quantity = formatRange(reward.minQuantity, reward.maxQuantity)
    const imageUrl = getRewardImagePath(reward)
    const displayName = rewardInfo?.nameKey || reward.id
    return (
      <Popup
        key={`${reward.id}-${index}`}
        content={displayName}
        trigger={
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginRight: '0.75rem',
            marginBottom: '0.5rem',
            cursor: 'pointer',
            minWidth: '40px'
          }}>
            <Image src={imageUrl} size='mini' rounded style={{ marginBottom: '0.25rem' }} alt={displayName} />
            <div style={{
              fontSize: '0.7rem',
              color: '#666',
              fontWeight: '600',
              textAlign: 'center',
              lineHeight: '1'
            }}>
              {quantity}
            </div>
          </div>
        }
      />
    )
  }

  const renderTierTable = (tier, tableIndex) => {
    return (
      <div style={{ overflowX: 'auto' }}>
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
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              {expandedRewards.map((reward, index) => (
                <div key={index}>{renderRewardItem(reward, index)}</div>
              ))}
            </div>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </div>
    )
  }

  const renderColiseumBosses = () => {
    const bosses = getEraDefinition()?.coliseum?.bossDefinition || []
    if (!bosses.length) {
      return <p>No coliseum boss reward data available.</p>
    }

    const bossNames = bosses.map((boss) => getDataValue(boss.identifier?.campaignNodeId) || `Boss ${bosses.indexOf(boss) + 1}`)
    const allBossNames = [...bossNames, 'Total']

    return (
      <Grid>
        <Grid.Row centered>
            <Grid.Column>
                <Menu attached='top' tabular style={{ overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap' }}>
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
                    style={{ flexShrink: 0 }}
                    >
                      {
                      bosses[index]
                      ?
                    <Image circular src={getImageForBoss(bosses[index]?.identifier?.campaignNodeId)} avatar/>
                    :
                    null
                    }
                       
                       {name}
                      </Menu.Item>
                ))}
                </Menu>

                <Segment attached='bottom'>
                {activeBossTab === bosses.length ? (
                    renderCumulativeRewards()
                ) : bosses[activeBossTab] ? (
                    <Grid>
                      <Grid.Row>
                        <Grid.Column>
                          <Menu secondary style={{ overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap' }}>
                            {(bosses[activeBossTab].bossRewardTable || []).map((tier, tierIndex) => (
                            <Menu.Item
                                key={tierIndex}
                                name={`Tier ${tierIndex + 1}`}
                                active={activeTierTab === tierIndex}
                                onClick={() => setActiveTierTab(tierIndex)}
                                style={{ flexShrink: 0 }}
                            />
                            ))}
                        </Menu>
                        </Grid.Column>
                      </Grid.Row>
                      <Grid.Row>
                        <Grid.Column>
                          <Segment>
                            {bosses[activeBossTab].bossRewardTable[activeTierTab] &&
                            renderTierTable(bosses[activeBossTab].bossRewardTable[activeTierTab], activeTierTab)}
                          </Segment>
                        </Grid.Column>

                        </Grid.Row>


                    </Grid>
                ) : null}
                </Segment>
        </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  const getMaxTierCount = () => {
    const bosses = getEraDefinition()?.coliseum?.bossDefinition || []
    return Math.max(...bosses.map((boss) => boss.bossRewardTable?.length || 0), 0)
  }

  const getCumulativeRewards = (maxTier = null) => {
    const rewards = {}
    const bosses = getEraDefinition()?.coliseum?.bossDefinition || []

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
        <Menu secondary style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {tierTabs.map((tierName, index) => (
            <Menu.Item
              key={index}
              name={tierName}
              active={activeTotalTierTab === index}
              onClick={() => setActiveTotalTierTab(index)}
              style={{ flexShrink: 0 }}
            />
          ))}
        </Menu>
        <Segment>
          <Card fluid style={{ marginBottom: '1.5rem' }}>
            <Card.Content>
              <Card.Header>About these rewards</Card.Header>
              <Card.Description>
                These are the cumulative rewards you can obtain by completing all tiers up to and including {selectedTierLabel} across all coliseum bosses.
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
    const levels = getEraDefinition()?.eraLevel || []
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
      <div style={{ overflowX: 'auto' }}>
        <Table celled compact striped unstackable>
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
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {
                       level.ingredients.map((ingredient, i) => {
                            return renderCompactRewardItem(ingredient, i)
                        })
                    }
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {
                       level.cumulativeIngredients.map((ingredient, i) => {
                            return renderCompactRewardItem(ingredient, i)
                        })
                    }
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
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

    if (includeJourney && getEraDefinition()?.journeyUnit) {
      const journey = getEraDefinition().journeyUnit
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
    const rewards = getEraDefinition()?.totalEraLevelsRewardPreview || []
    if (!rewards.length) {
      return <p>No total era level reward preview available.</p>
    }

    // Calculate cumulative rewards for each tier
    const cumulativeRewards = rewards.reduce((acc, entry, index) => {
      const rewardList = entry.primaryReward?.length ? entry.primaryReward : entry.detailedReward
      const expandedRewards = rewardList?.flatMap((reward) => expandReward(reward)) || []

      // Add current tier rewards to cumulative
      const currentCumulative = JSON.parse(JSON.stringify(acc.cumulative))
      expandedRewards.forEach((reward) => {
        const existing = currentCumulative.find(item => item.id === reward.id && item.type === reward.type)
        if (existing) {
          existing.minQuantity += reward.minQuantity
          existing.maxQuantity += reward.maxQuantity
        } else {
          currentCumulative.push({ ...reward })
        }
      })

      acc.tiers.push({
        ...entry,
        cumulativeRewards: JSON.parse(JSON.stringify(currentCumulative))
      })
      acc.cumulative = currentCumulative

      return acc
    }, { tiers: [], cumulative: [] }).tiers

    return (
      <div style={{ overflowX: 'auto' }}>
        <Table celled compact striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Rank</Table.HeaderCell>
              <Table.HeaderCell>Reward</Table.HeaderCell>
              <Table.HeaderCell>Cumulative Rewards</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {cumulativeRewards.map((entry, index) => {
              const rewardList = entry.primaryReward?.length ? entry.primaryReward : entry.detailedReward
              const expandedRewards = rewardList?.flatMap((reward) => expandReward(reward)) || []
              return (
                <Table.Row key={index}>
                  <Table.Cell>{formatRange(entry.rankStart, entry.rankEnd, true)}</Table.Cell>
                  <Table.Cell>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                          {expandedRewards?.map((reward, rewardIndex) => renderRewardItem(reward, rewardIndex))}
                      </div>
                  </Table.Cell>
                  <Table.Cell>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                          {entry.cumulativeRewards?.map((reward, rewardIndex) => renderRewardItem(reward, rewardIndex))}
                      </div>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </div>
    )
  }

  return (
    <Grid>
        <Grid.Row centered>
            <Image src={getImagePath('era', getEraDefinition()?.icon)} circular />
        </Grid.Row>
        <Grid.Row centered>
            <Header as='h1' textAlign='center'>
                {getDataValue(getEraDefinition()?.nameKey)}
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
                {activeTab === 'Loaned Units' && renderCharCards(getEraDefinition()?.loanedUnit?.map((unit) => unit.id) || [])}
                {activeTab === 'Era Units' && renderCharCards(getEraDefinition()?.eraUnitId || [], true)}
                {activeTab === 'Total Era Level Rewards' && renderTotalRewards()}
              </Segment>
            </Grid.Column>
        </Grid.Row>
    </Grid>
  )
}

export default EraData
