import React from "react";
import {
  Card,
  CardContent,
  makeStyles,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import IEntry from "../types/Entry.type";

interface Props {
  items: IEntry[];
}

function ItemList({ items }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          Item List
        </Typography>
        <List>
          {items.map((item) => (
            <ListItem key={item.id}>
              <ListItemText primary={item.question} secondary={item.votes} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default ItemList;
