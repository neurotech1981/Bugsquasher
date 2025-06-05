import express, { Request, Response } from 'express'
import Data from '../models/issue.js'
import moment from 'moment-timezone'

const router = express.Router()

router.get('/countIssues', async (req: Request, res: Response) => {
    try {
        const count = await Data.countDocuments({})
        res.json(count)
    } catch (err) {
        res.status(500).send(err instanceof Error ? err.message : 'An error occurred')
    }
})

router.get('/getLatestCases', async (req: Request, res: Response) => {
    try {
        const result = await Data.find({})
            .select(['createdAt', 'summary', 'priority', 'severity'])
            .sort({ createdAt: -1 })
            .limit(5)
        res.json(result)
    } catch (err) {
        res.status(500).send(err instanceof Error ? err.message : 'An error occurred')
    }
})

router.get('/getTodaysIssues', async (req: Request, res: Response) => {
    try {
        const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        const count = await Data.countDocuments({ createdAt: { $gte: yesterday } })
        res.json(count)
    } catch (err) {
        res.status(500).send(err instanceof Error ? err.message : 'An error occurred')
    }
})

router.get('/countSolvedIssues', async (req: Request, res: Response) => {
    try {
        const count = await Data.countDocuments({ status: 'Løst' })
        res.json(count)
    } catch (err) {
        res.status(500).send(err instanceof Error ? err.message : 'An error occurred')
    }
})

router.get('/countOpenIssues', async (req: Request, res: Response) => {
    try {
        const count = await Data.countDocuments({ status: 'Åpen' })
        res.json(count)
    } catch (err) {
        res.status(500).send(err instanceof Error ? err.message : 'An error occurred')
    }
})

router.get('/dailyIssueCount', async (req: Request, res: Response) => {
    try {
        const timeZone = 'Europe/Oslo'
        const now = moment.tz(timeZone)
        const endOfToday = now.clone().endOf('day').toDate()
        const startOfWeek = now.clone().subtract(6, 'days').startOf('day').toDate()
        const hoursArray = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

        const result = await Data.aggregate([
            {
                $match: {
                    updatedAt: {
                        $gte: startOfWeek,
                        $lte: endOfToday,
                    },
                    status: { $eq: 'Løst' },
                },
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt', timezone: timeZone } },
                        hour: { $hour: { date: '$updatedAt', timezone: timeZone } },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { '_id.date': 1, '_id.hour': 1 },
            },
            {
                $group: {
                    _id: '$_id.date',
                    hourlyData: {
                        $push: {
                            k: { $concat: [{ $toString: '$_id.hour' }, ':00'] },
                            v: '$count',
                        },
                    },
                },
            },
            {
                $addFields: {
                    hourlyData: {
                        $arrayToObject: '$hourlyData',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    data: '$hourlyData',
                },
            },
        ])

        const lastDayData = result.length > 0 ? result[result.length - 1] : null

        if (lastDayData) {
            const completeHourlyData = hoursArray.reduce((acc, hour) => {
                acc[hour] = lastDayData.data[hour] || 0
                return acc
            }, {} as Record<string, number>)

            res.json(completeHourlyData)
        } else {
            res.json({})
        }
    } catch (err) {
        res.status(500).send(err instanceof Error ? err.message : 'An error occurred')
    }
})

interface MonthData {
    month_year: string;
    count: number;
}

router.get('/availableYears', async (req: Request, res: Response) => {
    try {
        const result = await Data.aggregate([
            {
                $group: {
                    _id: { $year: { date: '$createdAt', timezone: 'Europe/Oslo' } }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ])
        res.json(result.map(item => item._id))
    } catch (err) {
        res.status(500).send(err instanceof Error ? err.message : 'An error occurred')
    }
})

router.get('/thisYearIssuesCount', async (req: Request, res: Response) => {
    try {
        const timeZone = 'Europe/Oslo'
        const now = moment.tz(timeZone)
        const year = parseInt(req.query.year as string) || now.year()
        const startOfYear = moment.tz(timeZone).year(year).startOf('year').toDate()
        const endOfYear = moment.tz(timeZone).year(year).endOf('year').toDate()
        const monthsArray = [
            'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
        ]

        const result = await Data.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfYear,
                        $lte: endOfYear,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: { date: '$createdAt', timezone: timeZone } },
                        month: { $month: { date: '$createdAt', timezone: timeZone } },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 },
            },
            {
                $project: {
                    _id: 0,
                    month_year: {
                        $concat: [
                            { $arrayElemAt: [monthsArray, { $subtract: ['$_id.month', 1] }] },
                            ' ',
                            { $toString: '$_id.year' },
                        ],
                    },
                    count: 1,
                },
            },
        ])

        // Create an array with all months of the selected year
        const allMonthsData = monthsArray.map((month, index) => ({
            month_year: `${month} ${year}`,
            count: 0
        }))

        // Update counts for months that have data
        result.forEach((item: MonthData) => {
            const monthIndex = monthsArray.indexOf(item.month_year.split(' ')[0])
            if (monthIndex !== -1) {
                allMonthsData[monthIndex].count = item.count
            }
        })

        res.json(allMonthsData)
    } catch (err) {
        res.status(500).send(err instanceof Error ? err.message : 'An error occurred')
    }
})

router.get('/weekdayIssueCount', async (req: Request, res: Response) => {
    try {
        const timeZone = 'Europe/Oslo'
        const now = moment.tz(timeZone)
        const startOfWeek = now.clone().startOf('isoWeek').toDate()
        const endOfWeek = now.clone().endOf('isoWeek').toDate()
        const daysArray = ['Man', 'Tirs', 'Ons', 'Tors', 'Fre', 'Lør', 'Søn']
        const initialDays = daysArray.reduce((acc, day) => {
            acc[day] = 0
            return acc
        }, {} as Record<string, number>)

        const result = await Data.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfWeek,
                        $lte: endOfWeek,
                    },
                },
            },
            {
                $project: {
                    weekDay: {
                        $isoDayOfWeek: '$createdAt',
                    },
                },
            },
            {
                $group: {
                    _id: '$weekDay',
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
            {
                $project: {
                    _id: 0,
                    weekDayIndex: '$_id',
                    count: '$count',
                },
            },
            {
                $addFields: {
                    weekDay: {
                        $arrayElemAt: [daysArray, { $subtract: ['$weekDayIndex', 1] }],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    data: {
                        $push: {
                            k: '$weekDay',
                            v: '$count',
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    data: {
                        $arrayToObject: '$data',
                    },
                },
            },
            {
                $addFields: {
                    data: {
                        $mergeObjects: [initialDays, '$data'],
                    },
                },
            },
        ])

        const responseData = result.length > 0 ? result[0].data : initialDays
        res.json(responseData)
    } catch (err) {
        res.status(500).send(err instanceof Error ? err.message : 'An error occurred')
    }
})

export default router