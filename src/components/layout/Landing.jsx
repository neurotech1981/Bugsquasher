/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import '../../App.css'
import ChartistGraph from 'react-chartist'
import { makeStyles } from '@mui/styles'
import { Icon, Grid, CircularProgress, Typography } from '@mui/material'
import {
    CheckCircle as CheckCircleIcon,
    DateRange,
    LocalOffer,
    Accessibility,
    Update,
    PlaylistAdd as PlaylistAddIcon,
    ArrowUpward,
    AccessTime,
} from '@mui/icons-material'
import Table from '../Table/Table.js'
import GridContainer from '../grid/GridContainer.js'
import GridItem from '../grid/GridItem.js'
import Card from '../Card/Card.js'
import CardHeader from '../Card/CardHeader.js'
import CardIcon from '../Card/CardIcon.js'
import CardBody from '../Card/CardBody.js'
import CardFooter from '../Card/CardFooter.js'
import issueService from '../../services/issueService'
import auth from '../auth/auth-helper'

import { dailySalesChart, emailsSubscriptionChart, completedTasksChart } from '../../variables/charts'
import styles from '../../assets/styles/dashboardStyle.js'

const useStyles = makeStyles(styles)

const Landing = () => {
    const classes = useStyles()
    const [issueCount, setIssueCount] = useState(0)
    const [todaysIssues, setTodaysIssues] = useState(0)
    const [solvedIssues, setSolvedIssues] = useState(0)
    const [openIssues, setOpenIssues] = useState(0)
    const [latestCases, setLatestCases] = useState([])
    const [thisYearCases, setThisYearCases] = useState([])

    const [yearlyCountIssues, setYearlyCountIssues] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
        series: [[]],
    })

    const [weeklyCountIssues, setWeeklyCountIssues] = useState({
        labels: ['Man', 'Tirs', 'Ons', 'Tors', 'Fre', 'Lør', 'Søn'],
        series: [[0, 0, 0, 0, 0, 0, 0]],
    })

    const [dailyCountIssues, setDailyCountIssues] = useState({
        labels: [
            '00:00',
            '',
            '',
            '03:00',
            '',
            '',
            '06:00',
            '',
            '',
            '09:00',
            '',
            '',
            '12:00',
            '',
            '',
            '15:00',
            '',
            '',
            '18:00',
            '',
            '',
            '21:00',
            '',
            '',
            '23:59',
        ],
        series: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    })

    useEffect(() => {
        let isSubscribed = true
        if (isSubscribed) {
            fetchData()
        }
        return () => {
            isSubscribed = false
        }
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
            setYearlyCountIssues({
                ...yearlyCountIssues,
                series: [formatYearlyData(thisYearCasesRes.data)],
            })
            setWeeklyCountIssues({
                ...weeklyCountIssues,
                series: [formatWeeklyData(weeklyCountIssuesRes.data)],
            })
            setDailyCountIssues({
                ...dailyCountIssues,
                series: [formatDailyData(dailyCountIssuesRes.data)],
            })
        } catch (error) {
            console.error('Failed to fetch data', error)
        }
    }

    const formatLatestCases = (data) => {
        return data.map((element, key) => [
            moment(element.createdAt).format('DD/MM-YYYY HH:mm'),
            <a href={`/vis-sak/${element._id}`} className="link underline" key={key}>
                {element.summary}
            </a>,
            element.priority,
            element.severity,
        ])
    }

    const formatYearlyData = (data) => {
        if (data.length === 0) return []
        return Object.values(data[0].data)
    }

    const formatWeeklyData = (data) => {
        if (!data) return []
        const combinedData = Object.entries(data).reduce((acc, [day, count]) => {
            acc[day] = (acc[day] || 0) + count
            return acc
        }, {})
        const daysArray = { Man: 0, Tirs: 0, Ons: 0, Tors: 0, Fre: 0, Lør: 0, Søn: 0 }
        Object.keys(daysArray).forEach((day) => {
            daysArray[day] = combinedData[day] || 0
        })
        return Object.values(daysArray)
    }

    const formatDailyData = (data) => {
        if (data.length === 0) return []
        return Object.values(data)
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

    const renderChartCard = (title, data, chartConfig, type, icon, text, footer) => (
        <GridItem xs={12} sm={12} md={4}>
            <Card chart>
                <CardHeader>
                    <ChartistGraph
                        className="ct-chart"
                        data={data}
                        type={type}
                        options={chartConfig.options}
                        responsiveOptions={chartConfig.responsiveOptions}
                        listener={chartConfig.animation}
                    />
                </CardHeader>
                <CardBody>
                    <h4 className={classes.cardTitle}>{title}</h4>
                    {icon && (
                        <p className={classes.cardCategory}>
                            <span className={classes.successText}>{icon}</span> {text}
                        </p>
                    )}
                    {!icon && <p className={classes.cardCategory}>{text}</p>}
                </CardBody>
                <CardFooter chart>
                    <div className={classes.stats}>
                        <AccessTime /> {footer}
                    </div>
                </CardFooter>
            </Card>
        </GridItem>
    )

    return (
        <div className={classes.root}>
            <GridContainer>
                {renderCard('Antall saker totalt', issueCount, 'warning', <Icon>content_copy</Icon>)}
                {renderCard('Nye saker', todaysIssues, 'danger', <PlaylistAddIcon />)}
                {renderCard('Løste saker', solvedIssues, 'success', <CheckCircleIcon />)}
                {renderCard('Åpne saker', openIssues, 'info', <Accessibility />)}
            </GridContainer>
            <GridContainer sx={{ pt: 2 }}>
                {renderChartCard(
                    'Ukentlige saker',
                    weeklyCountIssues,
                    dailySalesChart,
                    'Line',
                    <ArrowUpward className={classes.upArrowCardCategory} />,
                    '55% økning i saker',
                    'Nåværende uke'
                )}
                {renderChartCard(
                    'Saker over ett år',
                    yearlyCountIssues,
                    emailsSubscriptionChart,
                    'Bar',
                    null,
                    'Saker over en 12 måneders periode',
                    'løste saker siste år'
                )}
                {renderChartCard(
                    'Løste saker',
                    dailyCountIssues,
                    completedTasksChart,
                    'Line',
                    null,
                    'Løste saker i løpet av en dag',
                    'løste saker siste 24 timer'
                )}
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

Landing.propTypes = {
    container: PropTypes.object,
}

export default Landing
