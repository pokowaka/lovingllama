import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    TextField,
} from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import entrySerivce from "../services/entry.service"
import { IEntry, emptyEntry } from "../types/Entry.type"
import { useUserAuth } from "../context/UserAuthContext"


// the clock's state has one field: The current time, based upon the
// JavaScript class Date

const CreateEntryView = () => {
    const { user } = useUserAuth()
    const [item, setItem] = useState<IEntry>(emptyEntry)
    const [error, setError] = useState("")

    const navigate = useNavigate()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setItem({
            ...item,
            [event.target.name]: event.target.value,
        })
    }

    const handleCreate = async () => {
        console.log(`creating ${item}`)
        item.created_by = user?.displayName ? user?.displayName : "unknown"
        item.created_by_uid = user?.uid ? user?.uid : "unknown"
        try {
            const doc = await entrySerivce.create(item)
            console.log(`Written as: ${doc.id}`)
            navigate(-1)
        } catch (err) {
            let error = err as Error
            console.log(`Failed ${error.message}`)
            setError(error.message)
        }
    }

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
                                    helperText="This context will be used when auto generating questions."
                                    multiline
                                    rows={4}
                                    value={item?.context}
                                    name="context"
                                    onChange={handleChange}
                                />
                            </Grid>

                            {error && (
                                <Alert severity="error">
                                    <AlertTitle>Error</AlertTitle>
                                    {error}
                                </Alert>
                            )}
                            <Grid item xs={6}>
                                <Button variant="outlined" onClick={handleCreate}>
                                    Create
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    )
}

export default CreateEntryView
