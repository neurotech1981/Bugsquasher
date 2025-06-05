import React, { useState } from 'react'
import {
    Dashboard,
    Insights,
    Security,
    Speed,
    CloudQueue,
    Visibility,
    Settings,
    NotificationsNone,
    Search,
    PersonOutline,
} from '@mui/icons-material'

const GlassmorphicDemo = () => {
    const [activeSection, setActiveSection] = useState('overview')
    const [searchQuery, setSearchQuery] = useState('')

    const features = [
        {
            id: 1,
            title: 'Analytics Dashboard',
            description: 'Clean, minimal data visualization with floating glass cards and subtle animations.',
            icon: <Dashboard className="text-2xl" />,
            metrics: '94%',
        },
        {
            id: 2,
            title: 'Performance Insights',
            description: 'Real-time monitoring through elegant glassmorphic interfaces with smooth transitions.',
            icon: <Insights className="text-2xl" />,
            metrics: '2.4s',
        },
        {
            id: 3,
            title: 'Security Overview',
            description: 'Transparent security monitoring with floating status indicators and frosted overlays.',
            icon: <Security className="text-2xl" />,
            metrics: '99.9%',
        },
        {
            id: 4,
            title: 'System Performance',
            description: 'Minimalist performance tracking with gentle floating animations and glass effects.',
            icon: <Speed className="text-2xl" />,
            metrics: '1.2ms',
        },
    ]

    const stats = [
        { label: 'Active Users', value: '12,847', change: '+8.2%', trend: 'up' },
        { label: 'Response Time', value: '124ms', change: '-12%', trend: 'down' },
        { label: 'Uptime', value: '99.98%', change: '+0.02%', trend: 'up' },
        { label: 'Satisfaction', value: '4.9/5', change: '+0.1', trend: 'up' },
    ]

    return (
        <div className="min-h-screen bg-mesh-gradient">
            {/* Glass Navigation */}
            <nav className="glass-nav animate-fade-in">
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-3">
                        <CloudQueue className="text-accent-600" />
                        <span className="font-medium text-gray-700">BugSquasher</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        {['Overview', 'Analytics', 'Settings'].map((item) => (
                            <button
                                key={item}
                                onClick={() => setActiveSection(item.toLowerCase())}
                                className={`px-4 py-2 rounded-button transition-all duration-300 ${
                                    activeSection === item.toLowerCase()
                                        ? 'bg-accent-200/50 text-accent-700'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-glass-300'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center space-x-3">
                        <NotificationsNone className="text-gray-600 hover:text-accent-600 cursor-pointer transition-colors" />
                        <PersonOutline className="text-gray-600 hover:text-accent-600 cursor-pointer transition-colors" />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-24 px-8 pb-8">
                {/* Header Section */}
                <div className="max-w-6xl mx-auto mb-12">
                    <div className="text-center animate-slide-up">
                        <h1 className="text-5xl font-light text-gray-800 mb-4">Glassmorphic Design</h1>
                        <p className="text-xl minimal-text max-w-2xl mx-auto mb-8">
                            Experience minimalist beauty with floating glass elements, subtle transparency, and smooth
                            interactions.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-md mx-auto relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="glass-input pl-12"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="max-w-6xl mx-auto mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="floating-card text-center animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="text-3xl font-light text-gray-800 mb-2">{stat.value}</div>
                                <div className="text-sm minimal-text mb-3">{stat.label}</div>
                                <div
                                    className={`glass-badge ${stat.trend === 'up' ? 'text-green-700' : 'text-red-700'}`}
                                >
                                    {stat.change}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="max-w-6xl mx-auto">
                    {activeSection === 'overview' && (
                        <div className="space-y-8">
                            {/* Hero Glass Card */}
                            <div className="floating-card text-center max-w-4xl mx-auto">
                                <h2 className="text-3xl font-light text-gray-800 mb-6">
                                    Minimalist. Elegant. Functional.
                                </h2>
                                <p className="minimal-text text-lg mb-8">
                                    Our glassmorphic interface combines the beauty of transparency with the
                                    functionality you need. Every element floats with purpose, creating a serene and
                                    productive workspace.
                                </p>
                                <div className="flex justify-center space-x-4">
                                    <button className="glass-button-primary">Get Started</button>
                                    <button className="glass-button">Learn More</button>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {features.map((feature, index) => (
                                    <div
                                        key={feature.id}
                                        className="floating-card-delayed group cursor-pointer"
                                        style={{ animationDelay: `${index * 0.2}s` }}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="p-4 bg-accent-100/50 rounded-card text-accent-600 group-hover:bg-accent-200/50 transition-all duration-300">
                                                {feature.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-xl font-medium text-gray-800">
                                                        {feature.title}
                                                    </h3>
                                                    <span className="accent-text text-2xl font-light">
                                                        {feature.metrics}
                                                    </span>
                                                </div>
                                                <p className="minimal-text">{feature.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'analytics' && (
                        <div className="space-y-8">
                            {/* Analytics Dashboard */}
                            <div className="floating-card">
                                <h3 className="text-2xl font-light text-gray-800 mb-8 flex items-center">
                                    <Insights className="mr-3 text-accent-600" />
                                    Analytics Overview
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Chart 1 - Frosted */}
                                    <div className="bg-frost-100 backdrop-blur-frost rounded-card p-6 border border-glass-400">
                                        <h4 className="font-medium text-gray-700 mb-4">User Engagement</h4>
                                        <div className="space-y-3">
                                            {[92, 78, 85, 94].map((value, i) => (
                                                <div key={i} className="flex items-center space-x-3">
                                                    <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse-subtle"></div>
                                                    <div className="flex-1 bg-glass-300 rounded-full h-2">
                                                        <div
                                                            className="bg-accent-400 h-2 rounded-full transition-all duration-1000 ease-out"
                                                            style={{
                                                                width: `${value}%`,
                                                                animationDelay: `${i * 0.2}s`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-frost">{value}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chart 2 - Glass Bars */}
                                    <div className="bg-glass-200 backdrop-blur-glass rounded-card p-6 border border-glass-400">
                                        <h4 className="font-medium text-gray-700 mb-4">Performance Metrics</h4>
                                        <div className="flex justify-center items-end space-x-2 h-32">
                                            {[70, 85, 60, 92, 78, 88, 65].map((height, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-accent-300/60 rounded-t-lg w-6 transition-all duration-1000 ease-out animate-gentle-float"
                                                    style={{
                                                        height: `${height}%`,
                                                        animationDelay: `${i * 0.15}s`,
                                                    }}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chart 3 - Circular Progress */}
                                    <div className="bg-glass-200 backdrop-blur-glass rounded-card p-6 border border-glass-400">
                                        <h4 className="font-medium text-gray-700 mb-4">System Health</h4>
                                        <div className="relative w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 rounded-full border-4 border-glass-400"></div>
                                            <div className="absolute inset-0 rounded-full border-4 border-accent-400 border-t-transparent animate-pulse-subtle"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xl font-light text-accent-600">98%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div className="space-y-8">
                            <div className="floating-card">
                                <h3 className="text-2xl font-light text-gray-800 mb-8 flex items-center">
                                    <Settings className="mr-3 text-accent-600" />
                                    Interface Settings
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Theme Opacity
                                            </label>
                                            <input type="range" min="0" max="100" value="75" className="w-full" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Blur Intensity
                                            </label>
                                            <input type="range" min="0" max="100" value="60" className="w-full" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <button className="glass-button w-full justify-center">Reset to Default</button>
                                        <button className="glass-button-primary w-full justify-center">
                                            Apply Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Elements */}
            <div className="fixed bottom-8 right-8 space-y-4">
                <div className="w-4 h-4 bg-accent-400/30 rounded-full animate-float"></div>
                <div className="w-6 h-6 bg-accent-300/20 rounded-full animate-float-delayed"></div>
                <div className="w-3 h-3 bg-accent-500/40 rounded-full animate-gentle-float"></div>
            </div>

            {/* Background Floating Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent-200/10 rounded-full animate-gentle-float"></div>
                <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-accent-300/10 rounded-full animate-float"></div>
                <div className="absolute top-1/2 left-3/4 w-40 h-40 bg-accent-100/10 rounded-full animate-float-delayed"></div>
            </div>
        </div>
    )
}

export default GlassmorphicDemo
