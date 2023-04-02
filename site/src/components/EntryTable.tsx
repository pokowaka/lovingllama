import * as React from 'react'
import { useState, useEffect } from "react"
import { IEntry } from "../types/Entry.type"
import { useNavigate } from "react-router-dom"
import { useUserAuth } from "../context/UserAuthContext"
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
import entrySerivce from "../services/entry.service"
import FirstPageIcon from '@mui/icons-material/FirstPage'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import Paper from '@mui/material/Paper'
import Rating from '@mui/material/Rating'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableFooter from "@mui/material/TableFooter"
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import Tooltip from '@mui/material/Tooltip'
import { CircularProgress, Backdrop } from '@mui/material'

interface TablePaginationActionsProps {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme()
  const navigate = useNavigate()

  const { count, page, rowsPerPage, onPageChange } = props

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0)
  }

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1)
  }

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1)
  }

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
  }

  const handleCreateButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    navigate(`/create`)
  }

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleCreateButtonClick}
      >
        <AddCircleIcon />
      </IconButton>
    </Box>
  )
}

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [items, setItems] = useState<IEntry[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useUserAuth()
  const navigate = useNavigate()

  if (!user) {
    throw new Error(`ERROR: null 'user' in context`)
  }

  const fetchData = async () => {
    setLoading(true)
    const res = await entrySerivce.getAll(null)
    const items: IEntry[] = []
    res.forEach((entry) => {
      let item = entry.data()
      items.push(item)
    })

    console.log("Got items.")
    setItems(items)
    setLoading(false)
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

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const updateRating = async (entry: IEntry, value: number) => {
    console.log(`${entry.id}  ${entry.rating} --> ${value}`)
    let newUsers = new Map<string, number>(entry.users)
    newUsers = newUsers.set(user.uid, value)
    entry.users = newUsers
    await entrySerivce.updateUserVote(entry)
    fetchData()
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Backdrop open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <TableContainer>
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
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    <TableCell>
                      <Typography variant="body1">{row.question}</Typography>
                      <Typography variant="caption">{row.answer}</Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Your rating of this Q&A">
                      <Rating name="simple-controlled" value={row.users?.get(user?.uid)} onChange={(event, newValue) => { updateRating(row, newValue ? newValue : 0) }} />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      {row.generated_by && <Tooltip title="This is AI generated"><SmartToyIcon /></Tooltip>}
                    </TableCell>
                    <TableCell align="right">
                    <Tooltip title="Edit or Delete this entry">
                      <IconButton onClick={(e) => editItem(row.id!)} color="primary" aria-label="edit" component="label">
                        <EditIcon />
                      </IconButton>
                      </Tooltip>
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
            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
            colSpan={3}
            count={items.length}
            rowsPerPage={rowsPerPage}
            page={page}
            SelectProps={{
              inputProps: {
                'aria-label': 'rows per page',
              },
              native: true,
            }}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
          />
        </TableRow>
      </TableFooter>
    </Paper>
  )
}