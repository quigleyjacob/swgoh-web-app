import React, { useCallback, useEffect, useState } from "react";
import { getGACServerLeaderboard } from "../server/leaderboard";
import { Segment, Container, Header } from "semantic-ui-react";
import SortableTable from "./displays/SortableTable";
import { Link } from "react-router-dom";

function Leaderboard({displayMessage}) {
    const [leaderboard, setLeaderboard] = useState([])

    let getLeaderboardCallback = useCallback(async () => {
        getGACServerLeaderboard(displayMessage, setLeaderboard)
    }, [displayMessage])

    useEffect(() => {
        getLeaderboardCallback()
    }, [getLeaderboardCallback])

    const meta = [
        {text: "Rank", key: 'rank', collapsing: true},
        {text: "Name", key: 'name', textAlign: 'left'},
        {text: "AllyCode", key: 'allyCode'},
        {text: "Skill Rating", key: 'skillRating'},
        {text: "Galactic Power", key: 'galacticPower'},
        {text: "GAC Power Score", key: 'gacPowerScore'},
        {text: "Mod Score", key: 'modScore'}
    ]

    const render = {
        'galacticPower': ({galacticPower}) => {
            return Number(galacticPower).toLocaleString("en-US")
        },
        'modScore': ({modScore}) => {
            return Number(modScore).toLocaleString('en-US', {maximumFractionDigits: 2})
        },
        'gacPowerScore': ({gacPowerScore}) => {
            return Number(gacPowerScore).toLocaleString('en-US', {maximumFractionDigits: 2})
        },
        'name': ({name, allyCode}) => {
            return <Header size="tiny" as={Link} color="blue" to={`/profile/${allyCode}`}>{name}</Header>
        },
        'rank': (_, index) => {
            return index + 1
        }
    }

    return <div>
        <Container>
            <Segment>
                <Header textAlign='center' size='huge'>GAC Server Leaderboard
                <Header.Subheader>
                To join the leaderboard and become a part of an amazing community, join the <Header size="tiny" color="blue" as={'a'} target='_blank' href='https://discord.gg/eKGWGcu7W9'>GAC Community Discord</Header>!
                </Header.Subheader>
                </Header>
                <SortableTable sortable centered meta={meta} row={leaderboard} render={render} defaultSort={{column: 'skillRating', direction: 'descending'}} />
            </Segment>
        </Container>
    </div>
}

export default Leaderboard;