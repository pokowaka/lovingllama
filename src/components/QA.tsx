import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import React, { Component } from "react";

// the clock's state has one field: The current time, based upon the
// JavaScript class Date
type ClockState = {
  time: Date;
};

export class QuestionForm extends Component<{}, ClockState> {
  render() {
    return (
      <Box
        component="form"
        sx={{
          mt: 3,
          "& .MuiTextField-root": { my: 1, width: "100%" },
        }}
        noValidate
        autoComplete="off"
      >
        <Container maxWidth="xl">
          <div>
            <TextField
              id="question"
              label="A question about buddhism"
              variant="outlined"
            />
          </div>
          <div>
            <TextField
              id="answer"
              label="The answer to the question"
              multiline
              rows={4}
            />
          </div>
          <div>
            <TextField
              id="context"
              label="Additional context surrounding the answer"
              multiline
              rows={4}
            />
          </div>
          <div>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Example switch"
            />
          </div>
          <div>
            <Button variant="contained">Open modal</Button>
          </div>
        </Container>
      </Box>
    );
  }
}
