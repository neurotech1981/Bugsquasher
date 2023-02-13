import Project from '../models/project.js'

// Create a new project
export const createProject = async (req, res) => {
  try {
    const newProject = new Project(req.body)
    const project = await newProject.save()
    res.json(project)
  } catch (err) {
    res.status(400).json(`Error: ${err}`)
  }
}

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
    res.json(projects)
  } catch (err) {
    res.status(400).json(`Error: ${err}`)
  }
}

// Get a specific project by id
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    res.json(project)
  } catch (err) {
    res.status(400).json(`Error: ${err}`)
  }
}

// Update a specific project by id
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(project)
  } catch (err) {
    res.status(400).json(`Error: ${err}`)
  }
}

// Delete a specific project by id
export const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id)
    res.json('Project deleted.')
  } catch (err) {
    res.status(400).json(`Error: ${err}`)
  }
}
