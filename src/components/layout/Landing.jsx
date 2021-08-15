/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import ChartistGraph from "react-chartist";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Accessibility from "@material-ui/icons/Accessibility";
import Update from "@material-ui/icons/Update";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
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
import issueService from "../../services/issueService";
import auth from "../auth/auth-helper";
import Link from "@material-ui/core/Link";

import { bugs, website, server } from "../../variables/general.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart,
} from "../../variables/charts.js";

import styles from "../../assets/styles/dashboardStyle.js";

const useStyles = makeStyles(styles);

function Landing() {
  const classes = useStyles();
  const [issueCount, setIssueCount] = useState(0);
  const [todaysIssues, setTodaysIssues] = useState(0);
  const [solvedIssues, setSolvedIssues] = useState(0);
  const [openIssues, setOpenIssues] = useState(0);
  const [latestCases, setLatestCases] = useState([]);
  const [thisYearCases, setThisYearCases] = useState([]);

  const [yearlyCountIssues, setYearlyCountIssues] = useState({
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mai",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
    series: [[]],
  });

  const [weeklyCountIssues, setThisWeekCountIssues] = useState({
    labels: ["Man", "Tirs", "Ons", "Tors", "Fre", "Lør", "Søn"],
    series: [[0, 0, 0, 0, 0, 0, 0]],
  });

  const [dailyCountIssues, setDailyCountIssues] = useState({
    labels: [
      "00:00",
      "03:00",
      "06:00",
      "09:00",
      "12:00",
      "15:00",
      "18:00",
      "21:00",
      "23:59",
    ],
    series: [[0, 0, 0, 0, 0, 0, 0, 0, 0]],
  });

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) {
      getIssueCount(),
        getTodaysIssueCount(),
        getSolvedIssues(),
        getOpenIssues(),
        getLatestCases(),
        getThisYearIssueCount(),
        getThisWeekIssueCount(),
        getDailyIssueCount();
    }
    return () => (isSubscribed = false);
  }, []);

  const getIssueCount = async () => {
    const jwt = auth.isAuthenticated();
    const res = await issueService.countIssues(jwt.token);
    setIssueCount(res.data);
  };

  const getTodaysIssueCount = async () => {
    const jwt = auth.isAuthenticated();
    const res = await issueService.getTodaysIssues(jwt.token);
    setTodaysIssues(res.data);
  };

  const getSolvedIssues = async () => {
    const jwt = auth.isAuthenticated();
    const res = await issueService.countSolvedIssues(jwt.token);
    setSolvedIssues(res.data);
  };

  const getOpenIssues = async () => {
    const jwt = auth.isAuthenticated();
    const res = await issueService.countOpenIssues(jwt.token);
    setOpenIssues(res.data);
  };

  const getLatestCases = async () => {
    const jwt = auth.isAuthenticated();
    const res = await issueService.getLatestCases(jwt.token);
    if (Object.values(res.data).length !== 0) {
      var valueArr = res.data.map((element) => {
        return [
          moment(element.createdAt).format("DD/MM-YYYY HH:mm"),
          "Test" + element.summary + "<strong>Test</strong><br>",
          element.priority,
          element.severity,
        ];
      });
      setLatestCases(valueArr);
    }
  };

  const getThisYearIssueCount = async () => {
    const jwt = auth.isAuthenticated();
    const res = await issueService.getThisYearCaseCount(jwt.token);
    console.log("This year: ", res);
    var valueArr = Object.values(res.data[0].data).map((element) => {
      return element;
    });
    setYearlyCountIssues({ ...yearlyCountIssues, series: [valueArr] });
  };

  const getThisWeekIssueCount = async () => {
    const jwt = auth.isAuthenticated();
    const res = await issueService.getThisWeeklyCaseCount(jwt.token);
    console.log("Data from this weeks issue count: " + res.data[0].data);

    var valueArr = Object.values(res.data[0].data).map((element) => {
      return element;
    });
    setThisWeekCountIssues({ ...weeklyCountIssues, series: [valueArr] });
  };

  const getDailyIssueCount = async () => {
    const jwt = auth.isAuthenticated();
    const res = await issueService.getDailyIssueCount(jwt.token);
    console.log(res);
    if (Object.values(res.data).length !== 0) {
      var valueArr = Object.values(res.data[0].data).map((element) => {
        return element;
      });
      setDailyCountIssues({ ...dailyCountIssues, series: [valueArr] });
    }
  };

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
              <h3 className={classes.cardTitle}>
                <h1>{todaysIssues}</h1>
              </h3>
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
              <h3 className={classes.cardTitle}>
                <h1>{solvedIssues}</h1>
              </h3>
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
              <h3 className={classes.cardTitle}>
                <h1>{openIssues}</h1>
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
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          <Card chart>
            <CardHeader>
              <ChartistGraph
                className="ct-chart"
                data={weeklyCountIssues}
                type="Line"
                options={dailySalesChart.options}
                listener={dailySalesChart.animation}
              />
            </CardHeader>
            <CardBody>
              <h4 className={classes.cardTitle}>Ukentlige saker</h4>
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
            <CardHeader>
              <ChartistGraph
                className="ct-chart"
                data={yearlyCountIssues}
                type="Bar"
                options={emailsSubscriptionChart.options}
                responsiveOptions={emailsSubscriptionChart.responsiveOptions}
                listener={emailsSubscriptionChart.animation}
              />
            </CardHeader>
            <CardBody>
              <h4 className={classes.cardTitle}>Saker over ett år</h4>
              <p className={classes.cardCategory}>
                Saker over en 12 måneders periode
              </p>
            </CardBody>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> løste saker siste år
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <Card chart>
            <CardHeader>
              <ChartistGraph
                className="ct-chart"
                data={dailyCountIssues}
                type="Line"
                options={completedTasksChart.options}
                listener={completedTasksChart.animation}
              />
            </CardHeader>
            <CardBody>
              <h4 className={classes.cardTitle}>Løste saker</h4>
              <p className={classes.cardCategory}>
                Løste saker i løpet av en dag
              </p>
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
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="success">
              <h4 className={classes.cardTitleWhite}>Siste aktive saker</h4>
              <p className={classes.cardCategoryWhite}>De 5 siste sakene.</p>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="warning"
                tableHead={["Dato", "Oppsummering", "Prioritet", "Alvorlighet"]}
                tableData={latestCases}
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}

Landing.propTypes = {
  // Injected by the documentation to work in an iframe.
  // You won't need it on your project.
  container: PropTypes.object,
};

export default Landing;
