import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Container,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import React, { Component } from "react";

// the clock's state has one field: The current time, based upon the
// JavaScript class Date
type ClockState = {
  time: Date;
};

export class QuestionForm extends Component<{}, ClockState> {
  render() {
    return (
      <Container maxWidth="sm">
        <Card variant="outlined" style={{ marginTop: '20px' }}>
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
                  <TextField
                    id="question"
                    label="A question about buddhism"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="answer"
                    label="The answer to the question"
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="context"
                    label="Additional context surrounding the answer"
                    multiline
                    rows={4}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Button variant="outlined">Update</Button>
                </Grid>
                <Grid item xs={6} >
                  <Button variant="outlined" startIcon={<Delete />} color="secondary">
                    Delete
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }
}
