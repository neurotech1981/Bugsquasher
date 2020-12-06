import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ChartistGraph from 'react-chartist';
import { makeStyles } from '@material-ui/core/styles'
import Icon from "@material-ui/core/Icon";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Accessibility from "@material-ui/icons/Accessibility";
import Update from "@material-ui/icons/Update";
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import AccessTime from "@material-ui/icons/AccessTime";
import CustomTabs from "../CustomTabs/CustomTabs.js";
import Table from "../Table/Table.js";
import Tasks from "../Tasks/Tasks.js";
import GridContainer from "../grid/GridContainer.js";
import GridItem from "../grid/GridItem.js";
import Card from "../Card/Card.js";
import CardHeader from "../Card/CardHeader.js";
import CardIcon from "../Card/CardIcon.js";
import CardBody from "../Card/CardBody.js";
import CardFooter from "../Card/CardFooter.js";
import issueService from '../../services/issueService'

import { bugs, website, server } from "../../variables/general.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart
} from "../../variables/charts.js";

import styles from "../../assets/styles/dashboardStyle.js";


const useStyles = makeStyles(styles);

function Landing () {
  const classes = useStyles()
  const [issueCount, setIssueCount] = useState(0)
  const [todaysIssues, setTodaysIssues] = useState(0)
  const [solvedIssues, setSolvedIssues] = useState(0)
  const [openIssues, setOpenIssues] = useState(0)

  useEffect(() => {
    let isSubscribed = true
        if (isSubscribed) {
          getIssueCount(),
          getTodaysIssueCount(),
          getSolvedIssues(),
          getOpenIssues()
        }
    return () => isSubscribed = false
  }, [issueCount, todaysIssues, solvedIssues, openIssues])

  const getIssueCount = async () => {
    const res = await issueService.countIssues()
    setIssueCount(res.data)
  }

  const getTodaysIssueCount = async () => {
    const res = await issueService.getTodaysIssues()
    setTodaysIssues(res.data)
  }

  const getSolvedIssues = async () => {
    const res = await issueService.countSolvedIssues()
    setSolvedIssues(res.data)
  }

  const getOpenIssues = async () => {
    const res = await issueService.countOpenIssues()
    setOpenIssues(res.data)
  }

  return (
  <div>
    <GridContainer>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="warning" stats icon>
              <CardIcon color="warning">
                <Icon>content_copy</Icon>
              </CardIcon>
              <p className={classes.cardCategory}>Antall saker totalt</p>
              <h3 className={classes.cardTitle}>
                <h1>{issueCount}</h1>
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Update />
                Nettopp oppdatert
              </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="danger" stats icon>
              <CardIcon color="danger">
                <PlaylistAddIcon />
              </CardIcon>
              <p className={classes.cardCategory}>Nye saker idag</p>
              <h3 className={classes.cardTitle}><h1>{todaysIssues}</h1></h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <DateRange />
                Siste 24 Timer
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success">
                <CheckCircleIcon />
              </CardIcon>
              <p className={classes.cardCategory}>Løste saker</p>
              <h3 className={classes.cardTitle}><h1>{solvedIssues}</h1></h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <LocalOffer />
                Spores fra Github
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="info" stats icon>
              <CardIcon color="info">
                <Accessibility />
              </CardIcon>

              <p className={classes.cardCategory}>Åpne saker</p>
              <h3 className={classes.cardTitle}><h1>{openIssues}</h1></h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Update />
                Nettopp oppdatert
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          <Card chart>
            <CardHeader >
              <ChartistGraph
                className="ct-chart"
                data={dailySalesChart.data}
                type="Line"
                options={dailySalesChart.options}
                listener={dailySalesChart.animation}
              />
            </CardHeader>
            <CardBody>
              <h4 className={classes.cardTitle}>Daglige saker</h4>
              <p className={classes.cardCategory}>
                <span className={classes.successText}>
                  <ArrowUpward className={classes.upArrowCardCategory} /> 55%
                </span>
                økning i saker.
              </p>
            </CardBody>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> 4 minutter siden sist oppdatering
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <Card chart>
            <CardHeader >
              <ChartistGraph
                className="ct-chart"
                data={emailsSubscriptionChart.data}
                type="Bar"
                options={emailsSubscriptionChart.options}
                responsiveOptions={emailsSubscriptionChart.responsiveOptions}
                listener={emailsSubscriptionChart.animation}
              />
            </CardHeader>
            <CardBody>
              <h4 className={classes.cardTitle}>Saker over ett år</h4>
              <p className={classes.cardCategory}>Saker over en 12 måneders periode</p>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <Card chart>
            <CardHeader >
              <ChartistGraph
                className="ct-chart"
                data={completedTasksChart.data}
                type="Line"
                options={completedTasksChart.options}
                listener={completedTasksChart.animation}
              />
            </CardHeader>
            <CardBody>
              <h4 className={classes.cardTitle}>Løste saker</h4>
              <p className={classes.cardCategory}>Løste saker i løpet av en dag</p>
            </CardBody>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> løste saker siste 24 timer
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
            <GridContainer>
        <GridItem xs={12} sm={12} md={6}>
          <CustomTabs
            title="Tasks:"
            headerColor="primary"
            tabs={[
              {
                tabName: "Bugs",
                tabIcon: BugReport,
                tabContent: (
                  <Tasks
                    checkedIndexes={[0, 3]}
                    tasksIndexes={[0, 1, 2, 3]}
                    tasks={bugs}
                  />
                )
              },
              {
                tabName: "Website",
                tabIcon: Code,
                tabContent: (
                  <Tasks
                    checkedIndexes={[0]}
                    tasksIndexes={[0, 1]}
                    tasks={website}
                  />
                )
              },
              {
                tabName: "Server",
                tabIcon: Cloud,
                tabContent: (
                  <Tasks
                    checkedIndexes={[1]}
                    tasksIndexes={[0, 1, 2]}
                    tasks={server}
                  />
                )
              }
            ]}
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <Card>
            <CardHeader color="warning">
              <h4 className={classes.cardTitleWhite}>Siste aktive saker</h4>
              <p className={classes.cardCategoryWhite}>
                Nye saker siste måned.
              </p>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="warning"
                tableHead={["ID", "Name", "Prioritet", "Alvorlighet"]}
                tableData={[
                  ["1", "Dakota Rice", "$36,738", "Niger"],
                  ["2", "Minerva Hooper", "$23,789", "Curaçao"],
                  ["3", "Sage Rodriguez", "$56,142", "Netherlands"],
                  ["4", "Philip Chaney", "$38,735", "Korea, South"]
                ]}
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  )
}

Landing.propTypes = {
  // Injected by the documentation to work in an iframe.
  // You won't need it on your project.
  container: PropTypes.object
}

export default Landing
