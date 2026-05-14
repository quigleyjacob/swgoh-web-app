import React, {useState, useEffect} from 'react'
import { Table } from 'semantic-ui-react'


function SortableTable({meta = [], row = [], render = {}, defaultSort = {column: '', direction: ''}, sortable=false, centered=false, fixed=false}) {

        const [sortData, setSortData] = useState({column: defaultSort.column || '', direction: defaultSort.direction || ''})
        const [tableData, setTableData] = useState([])

    const getInitialRowData = (row, meta, sort) => {
        if(row.length === 0 ) {
            return
        }
        let data = row.map((row) => {
            return meta.reduce((obj, {key}) => {
                obj[key] = row[key]
                return obj
            }, {})
        })
        if(sort.column !== '' && sort.direction !== '') {
            sortTableData(data, sort)
        }
        return data
    }

    const handleClick = (key) => {
        if(!sortable) {
            return
        }
        let {column, direction} = sortData
        let newSortData
        if(column === key) {
            // flip the sort order
            if(direction === 'ascending') {
                newSortData = {column, direction: 'descending'}
            } else {
                newSortData = {column: '', direction: ''}
            }
        } else {
            newSortData = {column: key, direction: 'ascending'}
        }

        let newTableData = JSON.parse(JSON.stringify(tableData))
        
        if(newSortData.column === '' || newSortData.direction === '') {
            setSortData(newSortData)
            setTableData(getInitialRowData(row, meta, newSortData))
            return
        }
        sortTableData(newTableData, newSortData)
        setSortData(newSortData)
        setTableData(newTableData)
    }

    const sortTableData = (tableData, sortData) => {
        return tableData.sort((a,b) => {
            switch(typeof a[sortData.column]) {
                case 'number':
                    return (sortData.direction === 'ascending' ? 1 : -1) * (a[sortData.column] - b[sortData.column])
                case 'string':
                    return (sortData.direction === 'ascending' ? 1 : -1) * a[sortData.column].localeCompare(b[sortData.column])
                default:
                    return 0
            }
        })
    }

    useEffect(() => {
        let initTableData = getInitialRowData(row, meta, sortData)
        setTableData(initTableData)
        // eslint-disable-next-line
    }, [meta, row, defaultSort])

    const getHeaders = () => {
        if(Object.keys(meta).length === 0) {
            return
        }
		return meta.map(data => {
			return <Table.HeaderCell
                textAlign={data.textAlign}
                collapsing={data.collapsing}
				key={data.key}
				sorted={sortData.column === data.key ? (sortData.direction) : null}
				onClick={() => handleClick(data.key)}>
				{data.text}
			</Table.HeaderCell>
		})
	}

    const getBody = () => {
        if(tableData === undefined || tableData.length === 0) {
            return
        }
        return tableData.map((row, index) => (
            <Table.Row key={index}>
                {meta.map(cell => {
                    let cellData = row[cell.key]
                    let contents = render[cell.key] ? render[cell.key](row, index) : cellData
                    let positive = cell.positive || ((key) => false)
                    let warning = cell.warning || ((key) => false)
                    let negative = cell.negative || ((key) => false)
                    return <Table.Cell textAlign={cell.textAlign} collapsing={cell.collapsing} key={cell.key} positive={positive(row[cell.key])} warning={warning(row[cell.key])} negative={negative(row[cell.key])}>{contents}</Table.Cell>
                })}
            </Table.Row>
            ))
    }

        return <Table striped celled fixed={fixed} sortable={sortable} textAlign={centered ? 'center' : 'left'}>
        <Table.Header>
            <Table.Row>
            {getHeaders()}
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {getBody()}
        </Table.Body>
    </Table>
}

export default SortableTable