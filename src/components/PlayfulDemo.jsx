import React, { useState } from 'react'
import {
    BugReport,
    CheckCircle,
    Star,
    Favorite,
    Rocket,
    Lightbulb,
    Security,
    Speed,
    Timeline,
} from '@mui/icons-material'

const PlayfulDemo = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [likedCards, setLikedCards] = useState({})

    const toggleLike = (cardId) => {
        setLikedCards((prev) => ({
            ...prev,
            [cardId]: !prev[cardId],
        }))
    }

    const features = [
        {
            id: 1,
            title: 'Bug Tracking',
            description: 'Track and squash bugs with style! Our playful interface makes bug hunting fun.',
            icon: <BugReport className="text-3xl" />,
            color: 'primary',
        },
        {
            id: 2,
            title: 'Task Management',
            description: 'Manage tasks with a smile. Bright colors and smooth animations keep you motivated.',
            icon: <CheckCircle className="text-3xl" />,
            color: 'accent',
        },
        {
            id: 3,
            title: 'Team Collaboration',
            description: 'Work together seamlessly with our bold and beautiful collaboration tools.',
            icon: <Star className="text-3xl" />,
            color: 'electric',
        },
        {
            id: 4,
            title: 'Performance Analytics',
            description: 'Visualize your progress with stunning charts and playful data representations.',
            icon: <Speed className="text-3xl" />,
            color: 'warning',
        },
    ]

    const stats = [
        { label: 'Bugs Squashed', value: '1,234', trend: '+12%', color: 'bg-gradient-primary' },
        { label: 'Happy Users', value: '5,678', trend: '+24%', color: 'bg-gradient-secondary' },
        { label: 'Projects Active', value: '89', trend: '+8%', color: 'bg-gradient-electric' },
        { label: 'Team Members', value: '42', trend: '+15%', color: 'bg-accent-400' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-6xl font-bold mb-4">
                    <span className="text-gradient">Bugsquasher</span>
                </h1>
                <p className="text-xl text-gray-600 font-playful max-w-2xl mx-auto">
                    Experience bug tracking like never before with our playful, bold, and colorful interface!
                </p>
                <div className="mt-8 space-x-4">
                    <button className="btn-primary animate-float">
                        <Rocket className="mr-2" />
                        Get Started
                    </button>
                    <button className="btn-electric">
                        <Lightbulb className="mr-2" />
                        Learn More
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="nav-playful max-w-md mx-auto mb-12 p-2">
                <div className="flex space-x-2">
                    {['overview', 'features', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                                activeTab === tab
                                    ? 'bg-gradient-primary text-white shadow-purple'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`card-playful text-white ${stat.color} animate-float`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2">{stat.value}</div>
                            <div className="text-sm opacity-90 mb-2">{stat.label}</div>
                            <div className="badge-playful bg-white/20 text-white">{stat.trend}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
                {activeTab === 'overview' && (
                    <div className="text-center">
                        <div className="card-playful max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold mb-4 gradient-text-primary">
                                Welcome to the Future of Bug Tracking!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Our playful interface combines bold design with powerful functionality. Every button
                                click, every animation, every color choice is designed to make your work experience
                                delightful and productive.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <span className="badge-primary">Playful</span>
                                <span className="badge-secondary">Bold</span>
                                <span className="badge-accent">Colorful</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'features' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                className="card-playful group cursor-pointer relative overflow-hidden"
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                <div className="flex items-start space-x-4">
                                    <div
                                        className={`p-4 rounded-2xl ${
                                            feature.color === 'primary'
                                                ? 'bg-primary-100 text-primary-600'
                                                : feature.color === 'accent'
                                                ? 'bg-accent-100 text-accent-600'
                                                : feature.color === 'electric'
                                                ? 'bg-electric-100 text-electric-600'
                                                : 'bg-warning-100 text-warning-600'
                                        } group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        {feature.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                        <p className="text-gray-600 mb-4">{feature.description}</p>
                                        <button
                                            onClick={() => toggleLike(feature.id)}
                                            className={`p-2 rounded-full transition-all duration-300 ${
                                                likedCards[feature.id]
                                                    ? 'bg-red-100 text-red-500 animate-pulse'
                                                    : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'
                                            }`}
                                        >
                                            <Favorite className={likedCards[feature.id] ? 'animate-bounce' : ''} />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-br from-transparent to-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-8">
                        {/* Demo Chart Area */}
                        <div className="card-playful">
                            <h3 className="text-2xl font-bold mb-6 gradient-text-electric flex items-center">
                                <Timeline className="mr-3" />
                                Performance Analytics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Fake Chart 1 */}
                                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6">
                                    <h4 className="font-bold text-primary-800 mb-4">Bug Resolution Rate</h4>
                                    <div className="space-y-2">
                                        {[85, 72, 91, 68].map((value, i) => (
                                            <div key={i} className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                                                <div className="flex-1 bg-white rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-primary h-2 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${value}%`, animationDelay: `${i * 0.2}s` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-primary-700">{value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Fake Chart 2 */}
                                <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-2xl p-6">
                                    <h4 className="font-bold text-accent-800 mb-4">Team Productivity</h4>
                                    <div className="flex justify-center items-end space-x-2 h-32">
                                        {[65, 85, 45, 92, 78, 88, 70].map((height, i) => (
                                            <div
                                                key={i}
                                                className="bg-gradient-to-t from-accent-400 to-accent-300 rounded-t-lg w-8 transition-all duration-1000 ease-out animate-bounce"
                                                style={{
                                                    height: `${height}%`,
                                                    animationDelay: `${i * 0.1}s`,
                                                    animationDuration: '2s',
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Fake Chart 3 */}
                                <div className="bg-gradient-to-br from-electric-50 to-electric-100 rounded-2xl p-6">
                                    <h4 className="font-bold text-electric-800 mb-4">User Satisfaction</h4>
                                    <div className="relative w-24 h-24 mx-auto">
                                        <div className="absolute inset-0 rounded-full border-8 border-electric-200"></div>
                                        <div
                                            className="absolute inset-0 rounded-full border-8 border-electric-400 border-t-transparent animate-spin"
                                            style={{ animationDuration: '3s' }}
                                        ></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-electric-600">94%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Elements Demo */}
                        <div className="card-playful">
                            <h3 className="text-2xl font-bold mb-6 gradient-text-secondary">Interactive Elements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <button className="btn-primary animate-wiggle">Wiggle Button</button>
                                <button className="btn-secondary animate-pulse-slow">Pulse Button</button>
                                <button className="btn-electric animate-bounce-slow">Bounce Button</button>
                                <button className="bg-gradient-to-r from-warning-400 to-warning-600 btn-playful animate-glow">
                                    Glow Button
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8">
                <button className="w-16 h-16 bg-gradient-primary rounded-full shadow-bold hover:shadow-purple transition-all duration-300 transform hover:scale-110 animate-float">
                    <Security className="text-white text-2xl" />
                </button>
            </div>
        </div>
    )
}

export default PlayfulDemo
