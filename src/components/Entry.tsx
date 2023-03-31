import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Rating,
    TextField,
    Typography,
    Backdrop,
    CircularProgress
} from "@mui/material"
import Link from "./Link"
import { useNavigate } from "react-router-dom"
import { Delete } from "@mui/icons-material"
import { useParams } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import entrySerivce from "../services/entry.service"
import { IEntry, emptyEntry } from "../types/Entry.type"
import { useUserAuth } from "../context/UserAuthContext"

// the clock's state has one field: The current time, based upon the
// JavaScript class Date

const EntryView = () => {
    const { id } = useParams()
    const { user } = useUserAuth()
    const [item, setItem] = useState<IEntry>(emptyEntry)
    const [error, setError] = useState("")
    const [network, setNetwork] = useState(false)
    const navigate = useNavigate()

    if (!user) {
        throw new Error(`ERROR: null 'user' in context`)
    }

    if (!id) {
        throw new Error(`ERROR: null 'id' in context`)
    }

    const fetchData = async () => {
        setNetwork(true)
        const res = await entrySerivce.get(id)
        const data = res.data()
        if (data) {
            setItem(data)
        }
        setNetwork(false)
    }

    const updateRating = (value: number) => {
        let newUsers = new Map<string, number>(item.users)
        newUsers = newUsers.set(user.uid, value)
        setItem({
            ...item,
            rating: value,
            users: newUsers
        })
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setItem({
            ...item,
            [event.target.name]: event.target.value,
        })
    }

    const handleUpdate = async () => {
        console.log(`updating ${item}`)
        console.log(item.users)
        setNetwork(true)
        try {
            await entrySerivce.update(item)
            setNetwork(false)
            navigate(-1)
        } catch (err) {
            setNetwork(false)
            let error = err as Error
            console.log(`Failed ${error.message}`)
            setError(error.message)
        }
    }

    const handleDelete = async () => {
        console.log(`deleting ${item}`)
        setNetwork(true)
        try {
            await entrySerivce.deleteById(item.id)
            setNetwork(false)
            navigate(-1)
        } catch (err) {
            let error = err as Error
            console.log(`Failed ${error.message}`)
            setError(error.message)
            setNetwork(false)
        }
    }

    useEffect(() => {
        console.log(`Use effect called: ${id}!`)
        fetchData()
        return () => {
            // Anything in here is fired on component unmount.
            console.log(`Unmount ${id}`)
        }
    }, [])

    return (
        <Container maxWidth="sm">
            <Card variant="outlined" style={{ marginTop: "20px" }}>
                <CardContent>
                    <Box
                        component="form"
                        sx={{
                            mt: 3,
                            "& .MuiTextField-root": { my: 1, width: "100%" },
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12}>
                                <TextField label="Question"
                                    id="question"
                                    variant="outlined"
                                    name="question"
                                    value={item?.question}
                                    onChange={handleChange}
                                />

                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="answer"
                                    label="Answer to the question"
                                    multiline
                                    rows={8}
                                    value={item?.answer}
                                    name="answer"
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    id="context"
                                    label="Additional context surrounding the answer"
                                    multiline
                                    rows={4}
                                    value={item?.context}
                                    name="context"
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography component="legend">Rating</Typography>
                                <Rating name="simple-controlled" value={item.rating} onChange={(event, newValue) => { updateRating(newValue ? newValue : 0) }} />
                            </Grid>
                            <Grid item xs={6}>
                                {item?.generated_by &&
                                    <Link href={"/entry/" + item.generated_by} variant="body2">
                                        {"Generated from:" + item.generated_by}
                                    </Link>}
                            </Grid>
                            {error && (
                                <Alert severity="error">
                                    <AlertTitle>Error</AlertTitle>
                                    {error}
                                </Alert>
                            )}

                            <Backdrop open={network}>
                                <CircularProgress color="inherit" />
                            </Backdrop>
                            <Grid item xs={6}>
                                <Button variant="outlined" onClick={handleUpdate}>
                                    Update
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    onClick={handleDelete}
                                    variant="outlined"
                                    startIcon={<Delete />}
                                    color="secondary"
                                >
                                    Delete
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    )
}

export const EntryViewWrapper = () => {
    const { id } = useParams();
  
    return <EntryView key={id} />
  };

export default EntryView
