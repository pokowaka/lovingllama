import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Link,
    Rating,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material"
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
    const [loading, setLoading] = useState(false)
    const [item, setItem] = useState<IEntry>(emptyEntry)

    const fetchData = async () => {
        setLoading(true)
        if (id) {
            const res = await entrySerivce.get(id)
            const data = res.data()
            if (data) {
                setItem(data)
            }
            setLoading(false)
        }
    }

    const updateRating = (value: number) => {
        if (!user) // Can't happen...
            return

        let newUsers = new Map<string, number>(item.users)
        newUsers = newUsers.set(user.uid, value)
        console.log(newUsers)
        setItem({
            ...item,
            votes: value,
            users: newUsers
        })
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(`change ${item} to ${event.target.value}`)

        if (item)
            setItem({
                ...item,
                [event.target.name]: event.target.value,
            })
    }

    const handleUpdate = async () => {
        console.log(`updating ${item}`)
        console.log(item.users)
        if (item && id) {
            await entrySerivce.update(item)
        }
    }

    useEffect(() => {
        fetchData()
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
                                    <TextField helperText="Question"
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
                                    helperText="Answer to the question"
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
                                    helperText="Additional context surrounding the answer"
                                    multiline
                                    rows={4}
                                    value={item?.context}
                                    name="context"
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography component="legend">Rating</Typography>
                                <Rating name="simple-controlled" value={item.votes} onChange={(event, newValue) => { updateRating(newValue ? newValue : 0) }} />
                            </Grid>
                            <Grid item xs={6}>
                                {item?.generated_by &&
                                    <Link href={"/entry/" + item.generated_by} variant="body2">
                                        {"Generated from:" + item.generated_by}
                                    </Link>}
                            </Grid>
                            <Grid item xs={6}>
                                <Button variant="outlined" onClick={handleUpdate}>
                                    Update
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
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

export default EntryView
