// ##############################
// // // javascript library for creating charts
// #############################
var Chartist = require('chartist')

// ##############################
// // // variables used to create animation on charts
// #############################
var delays = 80,
  durations = 500
var delays2 = 80,
  durations2 = 500

// ##############################
// // // Daily Sales
// #############################

const dailySalesChart = {
  options: {
    lineSmooth: Chartist.Interpolation.cardinal({
      tension: 0,
    }),
    low: 0,
    high: 30, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
    chartPadding: {
      top: 0,
      right: 20,
      bottom: 0,
      left: 0,
    },
  },
  // for animation
  animation: {
    draw: function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint,
          },
        })
      } else if (data.type === 'point') {
        data.element.animate({
          opacity: {
            begin: (data.index + 1) * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease',
          },
        })
      }
    },
  },
}

// ##############################
// // // Email Subscriptions
// #############################

const emailsSubscriptionChart = {
  options: {
    axisX: {
      showGrid: false,
    },
    low: 0,
    high: 100,
    chartPadding: {
      top: 0,
      right: 20,
      bottom: 0,
      left: 0,
    },
  },
  responsiveOptions: [
    [
      'screen and (max-width: 640px)',
      {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function (value) {
            return value[0]
          },
        },
      },
    ],
  ],
  animation: {
    draw: function (data) {
      if (data.type === 'bar') {
        data.element.animate({
          opacity: {
            begin: (data.index + 1) * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease',
          },
        })
      }
    },
  },
}

// ##############################
// // // Completed Tasks
// #############################

const completedTasksChart = {
  options: {
    lineSmooth: Chartist.Interpolation.simple({
      divisor: 4,
    }),
    low: 0,
    high: 6, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
    chartPadding: {
      top: 0,
      right: 10,
      bottom: 0,
      left: 0,
    },
  },
  animation: {
    draw: function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint,
          },
        })
      } else if (data.type === 'point') {
        data.element.animate({
          opacity: {
            begin: (data.index + 1) * delays,
            dur: durations,
            from: 0,
            to: 5,
            easing: 'ease',
          },
        })
      }
    },
  },
}

module.exports = {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart,
}
