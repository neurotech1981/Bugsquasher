# 🎯 Teams Usage Guide - BugSquasher

## Overview
Teams in BugSquasher provide a powerful way to organize users and assign them to projects with clear roles and permissions. The system supports both **team-based assignment** and **individual user assignment** for maximum flexibility.

## 🚀 Getting Started with Teams

### 1. Access Team Management
- Open the sidebar navigation
- Click on **"Team"** → This takes you to `/team-admin`
- You'll see the Team Management Hub with overview statistics

### 2. Create Your First Team

#### Step-by-Step:
1. **Click "Opprett Team" (Create Team)**
2. **Fill in team details:**
   - **Team Name**: Required (e.g., "Frontend Development Team")
   - **Description**: Optional but recommended (e.g., "Handles all React and UI development")
   - **Team Members**: Select from available users
   - **Team Leader**: Choose a team lead from selected members

3. **Click "Opprett Team" to save**

#### Example Teams to Create:
```
🎨 Frontend Team
   Description: React, UI/UX, and client-side development
   Members: [UI Developers, UX Designers]
   Lead: Senior Frontend Developer

⚙️ Backend Team
   Description: API development, database, and server infrastructure
   Members: [Backend Developers, DevOps Engineers]
   Lead: Senior Backend Developer

🧪 QA Team
   Description: Testing, quality assurance, and bug verification
   Members: [QA Engineers, Test Automation Engineers]
   Lead: QA Manager
```

## 🎯 Using Teams in Projects

### Team Assignment to Projects

Once you have teams created, you can assign them to projects:

#### In Project Dashboard:
1. **Open any project** (navigate to `/prosjekt/:id`)
2. **Click on "Team Management" tab**
3. **Assign Teams:**
   - Click "Assign Team" button
   - Select teams from dropdown
   - Choose team role:
     - **Primary**: Main team responsible for the project
     - **Support**: Supporting team for specific tasks
     - **Consulting**: External or consulting team

4. **Assign Individual Users** (optional):
   - Click "Add User" button
   - Select users not in assigned teams
   - Set role: Manager, Developer, Tester, Designer, Consultant
   - Set permissions: Admin, Write, Read

### Team Roles & Permissions

#### Team Roles:
- **Primary Team**: Full project responsibility and access
- **Support Team**: Assists primary team with specific tasks
- **Consulting Team**: External expertise or temporary assistance

#### Individual User Roles:
- **Manager**: Project oversight and decision making
- **Developer**: Feature development and implementation
- **Tester**: Quality assurance and bug testing
- **Designer**: UI/UX design and mockups
- **Consultant**: External expertise and advice

#### Permission Levels:
- **Admin**: Full access to project settings and team management
- **Write**: Can create, edit, and manage issues
- **Read**: View-only access to project and issues

## 🔄 Workflow Examples

### Example 1: Web Application Project
```
Project: "E-commerce Website Redesign"

Assigned Teams:
├── Frontend Team (Primary)
│   ├── 4 developers with Write permissions
│   └── UI Lead with Admin permissions
├── Backend Team (Support)
│   ├── 3 developers with Write permissions
│   └── API Lead with Write permissions
└── QA Team (Support)
    ├── 2 testers with Write permissions
    └── QA Manager with Write permissions

Individual Assignments:
├── Project Manager (Admin permissions)
├── UX Consultant (Read permissions)
└── External Security Auditor (Read permissions)
```

### Example 2: Bug Fix Sprint
```
Project: "Critical Bug Fixes Q4"

Assigned Teams:
├── Backend Team (Primary)
└── Frontend Team (Support)

Individual Assignments:
├── Senior Developer (Admin - coordinates across teams)
└── Customer Support Rep (Read - monitors customer impact)
```

## 📊 Benefits of Team-Based Management

### ✅ Advantages:
1. **Scalability**: Assign entire teams in one action
2. **Clear Organization**: Teams reflect real organizational structure
3. **Permission Inheritance**: Team leads automatically get elevated access
4. **Easier Management**: Update team membership, updates project access
5. **Cross-Project Consistency**: Same teams can be reused across projects

### 🎯 When to Use Teams vs Individuals:

#### Use Teams For:
- Core project work aligned with organizational structure
- Long-term project assignments
- When you want standardized roles and permissions
- Large groups with clear hierarchy

#### Use Individual Assignment For:
- External consultants or contractors
- Cross-team collaboration (borrowing expertise)
- Project managers who oversee multiple teams
- Temporary assignments or special roles

## 🛠️ Advanced Features

### Team Management Hub Features:
- **Team Overview**: Statistics on total teams, members, and projects
- **Team Details**: Drill down into individual team information
- **Member Management**: Add/remove members, update roles
- **Project Tracking**: See which projects each team is assigned to

### Project Team Management Features:
- **Visual Team Display**: See teams as chips and individual users as avatars
- **Role-Based Access**: Different permissions for different roles
- **Hybrid Assignment**: Mix team and individual assignments on same project
- **Real-Time Updates**: Changes reflect immediately across the system

## 🏃‍♂️ Quick Start Checklist

- [ ] Create your first team via Team Management Hub
- [ ] Add team members and designate a team lead
- [ ] Open a project and navigate to "Team Management" tab
- [ ] Assign your team to the project with appropriate role
- [ ] Test team member access to project and issues
- [ ] Add individual users for specialized roles if needed

## 🎉 You're Ready!

Teams are now fully integrated and working! The header in project dashboards will show:
- **Team chips** for assigned teams
- **User avatars** for individual assignments
- **"No teams assigned"** message when empty

Start by creating a few demo teams and experimenting with different assignment patterns to see what works best for your organization!