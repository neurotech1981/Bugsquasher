import React, { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { getProjects } from '../../services/projectService'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import auth from '../auth/auth-helper'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
}))

const ProjectsPage = () => {
  const jwt = auth.isAuthenticated()

  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getProjects({ t: jwt.token }).then((data) => {
      console.log('Data', data.data)
      if (data.error) {
        setValues({ redirectToSignin: true })
      } else {
        setProjects(data.data)
        setIsLoading(false)
      }
    })
  }, [])

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Projects
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Link component={RouterLink} to="/opprett-prosjekt/">
            <Button variant="contained" color="primary">
              New Project
            </Button>
          </Link>
        </Grid>
      </Grid>
      <Divider sx={{ mt: 2, mb: 3 }} />
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Team Members</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Start Date</StyledTableCell>
                <StyledTableCell>End Date</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell>
                    <Link component={RouterLink} to={`/rediger-project/${project._id}`}>
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>{project.teamMembers.map((member) => member.name).join(', ')}</TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  )
}

export default ProjectsPage
