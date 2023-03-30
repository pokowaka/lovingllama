import * as React from 'react'
import { useState, useEffect } from "react"
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Rating from '@mui/material/Rating'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Grid from "@mui/material/Grid"
import TableFooter from "@mui/material/TableFooter"
import { IEntry } from "../types/Entry.type"
import entrySerivce from "../services/entry.service"
import { useNavigate } from "react-router-dom"
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import EditIcon from '@mui/icons-material/Edit'
import { useUserAuth } from "../context/UserAuthContext"


export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [items, setItems] = useState<IEntry[]>([])
  const { user } = useUserAuth()
  const navigate = useNavigate()

  if (!user) {
    throw new Error(`ERROR: null 'user' in context`)
  }

  const fetchData = async () => {
    const res = await entrySerivce.getAll(null)
    const items: IEntry[] = []
    res.forEach((entry) => {
      let item = entry.data()
      items.push(item)
    })

    console.log("Got items.")
    setItems(items)
  }

  useEffect(() => {
    fetchData()
  }, [])


  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const editItem = (id: string) => {
    navigate(`/entry/${id}`)
  }

  const deleteItem = async (id: string) => {
    await entrySerivce.deleteById(id)
    fetchData()
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const updateRating = async (entry: IEntry, value: number) => {
    console.log(`${entry.id}  ${entry.votes} --> ${value}`)
    let newUsers = new Map<string, number>(entry.users)
    newUsers = newUsers.set(user.uid, value)
    entry.users = newUsers
    await entrySerivce.updateUserVote(entry)
    fetchData()
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell key="question" style={{ minWidth: 180 }}>Question</TableCell>
              <TableCell key="rating" style={{ minWidth: 50 }}>Rating</TableCell>
              <TableCell key="generated" style={{ minWidth: 20 }}>Generated?</TableCell>
              <TableCell key="edit" style={{ minWidth: 80 }}>Modify</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.generated_by}>
                    <TableCell key={row.question}>
                      <Typography variant="body1">{row.question}</Typography>
                      <Typography variant="caption">{row.answer}</Typography>
                      {/* <Grid container direction="column">
                        <Grid item>{row.question}</Grid>
                        <Grid item>{row.answer}</Grid>
                      </Grid> */}
                    </TableCell>
                    {/*   */}
                    <TableCell key={row.votes}><Rating name="simple-controlled" value={row.users?.get(user?.uid)} onChange={(event, newValue) => { updateRating(row, newValue ? newValue : 0) }} /> </TableCell>
                    <TableCell key={row.generated_by} align="right">
                      {row.generated_by && <SmartToyIcon />}
                    </TableCell>
                    <TableCell key={row.context} align="right">
                      <Grid container>
                        <Grid item>
                          <IconButton onClick={(e) => editItem(row.id!)} color="primary" aria-label="edit" component="label">
                            <EditIcon />
                          </IconButton>
                        </Grid>
                        <Grid item>
                          <IconButton onClick={(e) => deleteItem(row.id!)} color="primary" aria-label="delete" component="label">
                            <DeleteForeverIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TableFooter>
        <TableRow>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={items.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableRow>
      </TableFooter>
    </Paper>
  )
}