import React, { Fragment, useState, useEffect, useRef } from 'react'
import auth from '../auth/auth-helper'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Dashboard,
  Visibility,
  Add,
  People,
  Settings,
  Menu,
  Close,
  Notifications,
  AccountCircle,
  Search,
  ChevronRight,
  BugReport,
  ExitToApp,
  FolderOpen,
  Person
} from '@mui/icons-material'
import BugIcon from '../../images/bug.svg'
import { searchAll } from '../../services/searchService'

function NavBar() {
    const jwt = auth.isAuthenticated()
    const userId = jwt && jwt.user ? jwt.user.id : null
    const location = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)

    // Search functionality state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState({ issues: [], projects: [], users: [] })
    const [searchLoading, setSearchLoading] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false)
    const searchTimeoutRef = useRef(null)
    const searchInputRef = useRef(null)
    const searchDropdownRef = useRef(null)

    // Search functionality
    const performSearch = async (query) => {
        if (!query.trim() || query.length < 2) {
            setSearchResults({ issues: [], projects: [], users: [] })
            setShowSearchResults(false)
            return
        }

        setSearchLoading(true)
        try {
            const results = await searchAll(query, jwt.token)
            setSearchResults(results)
            setShowSearchResults(true)
        } catch (error) {
            console.error('Search error:', error)
            setSearchResults({ issues: [], projects: [], users: [] })
        } finally {
            setSearchLoading(false)
        }
    }

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        searchTimeoutRef.current = setTimeout(() => {
            performSearch(searchQuery)
        }, 300)

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchQuery])

    // Click outside to close search results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchDropdownRef.current &&
                !searchDropdownRef.current.contains(event.target) &&
                !searchInputRef.current.contains(event.target)
            ) {
                setShowSearchResults(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearchResultClick = (type, id) => {
        setShowSearchResults(false)
        setSearchQuery('')

        switch (type) {
            case 'issue':
                navigate(`/vis-sak/${id}`)
                break
            case 'project':
                navigate(`/prosjekt-oversikt/`)
                break
            case 'user':
                navigate(`/users/${id}`)
                break
            default:
                break
        }
    }

    const navigationItems = [
        {
            label: 'Dashboard',
            icon: <Dashboard className="w-5 h-5" />,
            path: '/landing/',
            description: 'Overview and analytics'
        },
        {
            label: 'Issues',
            icon: <BugReport className="w-5 h-5" />,
            path: '/saker',
            description: 'View and manage issues'
        },
        {
            label: 'Projects',
            icon: <Visibility className="w-5 h-5" />,
            path: '/prosjekt-oversikt/',
            description: 'Project overview'
        },
        {
            label: 'New Project',
            icon: <Add className="w-5 h-5" />,
            path: '/opprett-prosjekt/',
            description: 'Create new project'
        },
        {
            label: 'New Issue',
            icon: <Add className="w-5 h-5" />,
            path: '/ny-sak',
            description: 'Report new issue'
        },
        {
            label: 'Team',
            icon: <People className="w-5 h-5" />,
            path: '/team-admin',
            description: 'Team management'
        },
        {
            label: 'Settings',
            icon: <Settings className="w-5 h-5" />,
            path: '/innstillinger',
            description: 'System preferences'
        },
    ]

        const isActiveRoute = (path, label) => {
        const currentPath = location.pathname

        // Only Dashboard should be active when on /landing/ or /
        if (currentPath === '/landing/' || currentPath === '/') {
            return label === 'Dashboard'
        }

        // For all other paths, require exact match
        return currentPath === path
    }

    if (!auth.isAuthenticated()) {
        return null
    }

    return (
        <>
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-sm" style={{ backgroundColor: 'rgba(238, 238, 238, 0.95)', borderColor: 'rgba(221, 221, 221, 0.8)' }}>
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Left Section */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-xl transition-colors lg:hidden"
                            style={{ backgroundColor: 'rgba(221, 221, 221, 0.5)' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(221, 221, 221, 0.8)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(221, 221, 221, 0.5)'}
                        >
                            <Menu className="w-5 h-5" style={{ color: '#2A4759' }} />
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #F79B72, #2A4759)' }}>
                                <img src={BugIcon} alt="BugSquasher" className="w-6 h-6 filter brightness-0 invert" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-semibold" style={{ color: '#2A4759' }}>BugSquasher</h1>
                                <p className="text-xs" style={{ color: '#F79B72' }}>Issue Management</p>
                            </div>
                        </div>
                    </div>

                    {/* Center Section - Search */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full">
                            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all ${searchLoading ? 'animate-spin' : ''}`}
                                   style={{ color: '#F79B72' }} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search issues, projects, users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all border"
                                style={{
                                    backgroundColor: 'rgba(238, 238, 238, 0.8)',
                                    borderColor: showSearchResults ? '#F79B72' : 'rgba(221, 221, 221, 0.8)',
                                    color: '#2A4759'
                                }}
                                onFocus={(e) => {
                                    e.target.style.ringColor = '#F79B72'
                                    e.target.style.borderColor = '#F79B72'
                                    if (searchQuery.length >= 2) {
                                        setShowSearchResults(true)
                                    }
                                }}
                            />

                            {/* Search Results Dropdown */}
                            {showSearchResults && (searchResults.issues.length > 0 || searchResults.projects.length > 0 || searchResults.users.length > 0 || searchLoading) && (
                                <div
                                    ref={searchDropdownRef}
                                    className="absolute top-full mt-2 w-full rounded-xl border shadow-xl z-50 max-h-96 overflow-y-auto"
                                    style={{ backgroundColor: '#EEEEEE', borderColor: 'rgba(221, 221, 221, 0.8)' }}
                                >
                                    {searchLoading && (
                                        <div className="p-4 text-center">
                                            <div className="inline-flex items-center space-x-2">
                                                <Search className="w-4 h-4 animate-spin" style={{ color: '#F79B72' }} />
                                                <span className="text-sm" style={{ color: '#2A4759' }}>Searching...</span>
                                            </div>
                                        </div>
                                    )}

                                    {!searchLoading && (
                                        <>
                                            {/* Issues Section */}
                                            {searchResults.issues.length > 0 && (
                                                <div className="border-b" style={{ borderColor: 'rgba(221, 221, 221, 0.6)' }}>
                                                    <div className="px-4 py-2" style={{ backgroundColor: 'rgba(247, 155, 114, 0.1)' }}>
                                                        <span className="text-xs font-medium" style={{ color: '#F79B72' }}>ISSUES</span>
                                                    </div>
                                                    {searchResults.issues.slice(0, 3).map((issue) => (
                                                        <button
                                                            key={issue._id}
                                                            onClick={() => handleSearchResultClick('issue', issue._id)}
                                                            className="w-full text-left px-4 py-3 transition-colors border-b last:border-b-0"
                                                            style={{ borderColor: 'rgba(221, 221, 221, 0.3)' }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(247, 155, 114, 0.1)'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <BugReport className="w-4 h-4" style={{ color: '#F79B72' }} />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate" style={{ color: '#2A4759' }}>
                                                                        {issue.summary}
                                                                    </p>
                                                                    <p className="text-xs truncate" style={{ color: 'rgba(42, 71, 89, 0.6)' }}>
                                                                        #{issue._id?.slice(-8)} • {issue.status}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Projects Section */}
                                            {searchResults.projects.length > 0 && (
                                                <div className="border-b" style={{ borderColor: 'rgba(221, 221, 221, 0.6)' }}>
                                                    <div className="px-4 py-2" style={{ backgroundColor: 'rgba(247, 155, 114, 0.1)' }}>
                                                        <span className="text-xs font-medium" style={{ color: '#F79B72' }}>PROJECTS</span>
                                                    </div>
                                                    {searchResults.projects.slice(0, 3).map((project) => (
                                                        <button
                                                            key={project._id}
                                                            onClick={() => handleSearchResultClick('project', project._id)}
                                                            className="w-full text-left px-4 py-3 transition-colors border-b last:border-b-0"
                                                            style={{ borderColor: 'rgba(221, 221, 221, 0.3)' }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(247, 155, 114, 0.1)'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <FolderOpen className="w-4 h-4" style={{ color: '#F79B72' }} />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate" style={{ color: '#2A4759' }}>
                                                                        {project.title}
                                                                    </p>
                                                                    <p className="text-xs truncate" style={{ color: 'rgba(42, 71, 89, 0.6)' }}>
                                                                        {project.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Users Section */}
                                            {searchResults.users.length > 0 && (
                                                <div>
                                                    <div className="px-4 py-2" style={{ backgroundColor: 'rgba(247, 155, 114, 0.1)' }}>
                                                        <span className="text-xs font-medium" style={{ color: '#F79B72' }}>USERS</span>
                                                    </div>
                                                    {searchResults.users.slice(0, 3).map((user) => (
                                                        <button
                                                            key={user._id}
                                                            onClick={() => handleSearchResultClick('user', user._id)}
                                                            className="w-full text-left px-4 py-3 transition-colors border-b last:border-b-0"
                                                            style={{ borderColor: 'rgba(221, 221, 221, 0.3)' }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(247, 155, 114, 0.1)'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <Person className="w-4 h-4" style={{ color: '#F79B72' }} />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate" style={{ color: '#2A4759' }}>
                                                                        {user.name}
                                                                    </p>
                                                                    <p className="text-xs truncate" style={{ color: 'rgba(42, 71, 89, 0.6)' }}>
                                                                        {user.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* No Results */}
                                            {!searchLoading && searchResults.issues.length === 0 && searchResults.projects.length === 0 && searchResults.users.length === 0 && searchQuery.length >= 2 && (
                                                <div className="p-4 text-center">
                                                    <p className="text-sm" style={{ color: 'rgba(42, 71, 89, 0.6)' }}>
                                                        No results found for "{searchQuery}"
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-3">
                        <button className="relative p-2 rounded-xl transition-colors"
                                style={{ backgroundColor: 'rgba(221, 221, 221, 0.5)' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(221, 221, 221, 0.8)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(221, 221, 221, 0.5)'}
                        >
                            <Notifications className="w-5 h-5" style={{ color: '#2A4759' }} />
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: '#F79B72' }}></span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="flex items-center space-x-2 p-2 rounded-xl transition-colors"
                                style={{ backgroundColor: profileMenuOpen ? 'rgba(221, 221, 221, 0.6)' : 'transparent' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(221, 221, 221, 0.4)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = profileMenuOpen ? 'rgba(221, 221, 221, 0.6)' : 'transparent'}
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F79B72, #2A4759)' }}>
                                    <AccountCircle className="w-5 h-5 text-white" />
                                </div>
                                <span className="hidden sm:block text-sm font-medium" style={{ color: '#2A4759' }}>
                                    {jwt.user?.name || 'User'}
                                </span>
                            </button>

                            {/* Profile Dropdown */}
                            {profileMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-xl z-50"
                                     style={{ backgroundColor: '#EEEEEE', borderColor: 'rgba(221, 221, 221, 0.8)' }}>
                                    <div className="p-4 border-b" style={{ borderColor: 'rgba(221, 221, 221, 0.6)' }}>
                                        <p className="font-medium" style={{ color: '#2A4759' }}>{jwt.user?.name}</p>
                                        <p className="text-sm" style={{ color: '#F79B72' }}>{jwt.user?.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <Link
                                            to={userId ? `/users/${userId}` : '/landing/'}
                                            onClick={() => setProfileMenuOpen(false)}
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors"
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(221, 221, 221, 0.4)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <AccountCircle className="w-5 h-5" style={{ color: '#F79B72' }} />
                                            <span className="text-sm" style={{ color: '#2A4759' }}>Profile</span>
                                        </Link>
                                        <button
                                            onClick={() => auth.signout(() => navigate('/signin'))}
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left"
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(221, 221, 221, 0.4)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <ExitToApp className="w-5 h-5" style={{ color: '#F79B72' }} />
                                            <span className="text-sm" style={{ color: '#2A4759' }}>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 w-72 h-screen pt-20 transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 border-r`} style={{ backgroundColor: '#EEEEEE', borderColor: 'rgba(221, 221, 221, 0.8)' }}>

                {/* Mobile close button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-24 right-4 p-2 rounded-lg transition-colors lg:hidden"
                    style={{ backgroundColor: 'rgba(221, 221, 221, 0.5)' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(221, 221, 221, 0.8)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(221, 221, 221, 0.5)'}
                >
                    <Close className="w-5 h-5" style={{ color: '#2A4759' }} />
                </button>

                <div className="h-full px-4 pb-4 overflow-y-auto">
                    <div className="space-y-2 pt-6">
                        {navigationItems.map((item, index) => {
                            const isActive = isActiveRoute(item.path, item.label)
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className="group flex items-center justify-between p-4 rounded-xl transition-all duration-200 border"
                                    style={{
                                        backgroundColor: isActive ? 'rgba(247, 155, 114, 0.15)' : 'transparent',
                                        borderColor: isActive ? 'rgba(247, 155, 114, 0.3)' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.target.style.backgroundColor = 'rgba(221, 221, 221, 0.3)'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.target.style.backgroundColor = 'transparent'
                                        }
                                    }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 rounded-lg transition-colors" style={{
                                            backgroundColor: isActive ? '#F79B72' : 'rgba(221, 221, 221, 0.6)',
                                            color: isActive ? 'white' : '#2A4759'
                                        }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="font-medium transition-colors" style={{
                                                color: isActive ? '#2A4759' : '#2A4759'
                                            }}>
                                                {item.label}
                                            </p>
                                            <p className="text-xs" style={{ color: '#F79B72' }}>{item.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 transition-all" style={{
                                        color: isActive ? '#F79B72' : 'rgba(42, 71, 89, 0.6)',
                                        transform: isActive ? 'rotate(90deg)' : 'none'
                                    }} />
                                </Link>
                            )
                        })}
                    </div>

                    {/* Bottom section */}
                    <div className="mt-8 p-4 rounded-xl border" style={{
                        background: 'linear-gradient(135deg, rgba(247, 155, 114, 0.1), rgba(247, 155, 114, 0.2))',
                        borderColor: 'rgba(247, 155, 114, 0.3)'
                    }}>
                        <h3 className="text-sm font-medium mb-2" style={{ color: '#2A4759' }}>Quick Stats</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span style={{ color: '#F79B72' }}>Open Issues</span>
                                <span className="font-medium" style={{ color: '#2A4759' }}>12</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span style={{ color: '#F79B72' }}>In Progress</span>
                                <span className="font-medium" style={{ color: '#2A4759' }}>8</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Click outside to close profile menu */}
            {profileMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                ></div>
            )}
        </>
    )
}

export default NavBar
