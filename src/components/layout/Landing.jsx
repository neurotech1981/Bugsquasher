import React, { useState, useEffect } from 'react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { makeStyles } from '@mui/styles'
import { Icon, Grid, Typography } from '@mui/material'
import moment from 'moment'
import {
    CheckCircle as CheckCircleIcon,
    PlaylistAdd as PlaylistAddIcon,
    ArrowUpward,
    Accessibility,
    Update,
    AccessTime,
} from '@mui/icons-material'
import Table from '../Table/Table.jsx'
import GridContainer from '../grid/GridContainer.jsx'
import GridItem from '../grid/GridItem.jsx'
import Card from '../Card/Card.jsx'
import CardHeader from '../Card/CardHeader.jsx'
import CardIcon from '../Card/CardIcon.jsx'
import CardBody from '../Card/CardBody.jsx'
import CardFooter from '../Card/CardFooter.jsx'
import issueService from '../../services/issueService'
import auth from '../auth/auth-helper'

import styles from '../../assets/styles/dashboardStyle.jsx'

const useStyles = makeStyles(styles)

const Landing = () => {
    const classes = useStyles()
    const [issueCount, setIssueCount] = useState(0)
    const [todaysIssues, setTodaysIssues] = useState(0)
    const [solvedIssues, setSolvedIssues] = useState(0)
    const [openIssues, setOpenIssues] = useState(0)
    const [latestCases, setLatestCases] = useState([])
    const [yearlyCountIssues, setYearlyCountIssues] = useState([])
    const [weeklyCountIssues, setWeeklyCountIssues] = useState([])
    const [dailyCountIssues, setDailyCountIssues] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const jwt = auth.isAuthenticated()
        if (!jwt) return

        try {
            const [
                issueCountRes,
                todaysIssuesRes,
                solvedIssuesRes,
                openIssuesRes,
                latestCasesRes,
                thisYearCasesRes,
                weeklyCountIssuesRes,
                dailyCountIssuesRes,
            ] = await Promise.all([
                issueService.countIssues(jwt.token),
                issueService.getTodaysIssues(jwt.token),
                issueService.countSolvedIssues(jwt.token),
                issueService.countOpenIssues(jwt.token),
                issueService.getLatestCases(jwt.token),
                issueService.getThisYearCaseCount(jwt.token),
                issueService.getThisWeeklyCaseCount(jwt.token),
                issueService.getDailyIssueCount(jwt.token),
            ])

            setIssueCount(issueCountRes.data)
            setTodaysIssues(todaysIssuesRes.data)
            setSolvedIssues(solvedIssuesRes.data)
            setOpenIssues(openIssuesRes.data)
            setLatestCases(formatLatestCases(latestCasesRes.data))
            setYearlyCountIssues(formatYearlyData(thisYearCasesRes.data))
            setWeeklyCountIssues(formatWeeklyData(weeklyCountIssuesRes.data))
            setDailyCountIssues(formatDailyData(dailyCountIssuesRes.data))
        } catch (error) {
            console.error('Failed to fetch data', error)
        }
    }

    const formatLatestCases = (data) =>
        data.map((element, key) => [
            moment(element.createdAt).format('DD/MM-YYYY HH:mm'),
            <a href={`/vis-sak/${element._id}`} className="link underline" key={key}>
                {element.summary}
            </a>,
            element.priority,
            element.severity,
        ])

    const formatYearlyData = (data) => {
        if (data.length === 0) return []
        return Object.keys(data[0].data).map((key) => ({ name: key, value: data[0].data[key] }))
    }

    const formatWeeklyData = (data) => {
        if (!data) return []
        const daysArray = { Man: 0, Tirs: 0, Ons: 0, Tors: 0, Fre: 0, Lør: 0, Søn: 0 }
        Object.keys(daysArray).forEach((day) => {
            daysArray[day] = data[day] || 0
        })
        return Object.keys(daysArray).map((key) => ({ name: key, value: daysArray[key] }))
    }

    const formatDailyData = (data) => {
        if (data.length === 0) return []
        return data.map((value, index) => ({ name: index, value }))
    }

    const renderCard = (title, count, color, icon) => (
        <GridItem xs={12} sm={6} md={3}>
            <Card>
                <CardHeader color={color} stats icon>
                    <CardIcon color={color}>{icon}</CardIcon>
                    <p className={classes.cardCategory}>{title}</p>
                    <div className={classes.cardTitle}>
                        <h1>{count}</h1>
                    </div>
                </CardHeader>
                <CardFooter stats>
                    <div className={classes.stats}>
                        <Update />
                        Nettopp oppdatert
                    </div>
                </CardFooter>
            </Card>
        </GridItem>
    )

    const renderChartCard = (title, data, ChartComponent, color) => (
        <GridItem xs={12} sm={12} md={4}>
            <Card chart>
                <CardHeader color={color}>
                    <h4 className={classes.cardTitleWhite}>{title}</h4>
                </CardHeader>
                <CardBody>
                    <ResponsiveContainer width="100%" height={300}>
                        <ChartComponent data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {ChartComponent === LineChart ? (
                                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                            ) : (
                                <Bar dataKey="value" fill="#8884d8" />
                            )}
                        </ChartComponent>
                    </ResponsiveContainer>
                </CardBody>
                <CardFooter chart>
                    <div className={classes.stats}>
                        <AccessTime /> Nettopp oppdatert
                    </div>
                </CardFooter>
            </Card>
        </GridItem>
    )

    return (
        <div className={classes.root}>
            <GridContainer>
                {renderCard('Antall saker totalt', issueCount, 'warning', <PlaylistAddIcon />)}
                {renderCard('Nye saker', todaysIssues, 'danger', <PlaylistAddIcon />)}
                {renderCard('Løste saker', solvedIssues, 'success', <CheckCircleIcon />)}
                {renderCard('Åpne saker', openIssues, 'info', <Accessibility />)}
            </GridContainer>
            <GridContainer sx={{ pt: 2 }}>
                {renderChartCard('Ukentlige saker', weeklyCountIssues, LineChart, 'success')}
                {renderChartCard('Saker over ett år', yearlyCountIssues, BarChart, 'warning')}
                {renderChartCard('Løste saker', dailyCountIssues, LineChart, 'danger')}
            </GridContainer>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>Siste aktive saker</h4>
                            <p className={classes.cardCategoryWhite}>De 5 siste sakene.</p>
                        </CardHeader>
                        <CardBody>
                            <Table
                                tableHeaderColor="warning"
                                tableHead={['Dato', 'Oppsummering', 'Prioritet', 'Alvorlighet']}
                                tableData={latestCases}
                            />
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
        </div>
    )
}

export default Landing
