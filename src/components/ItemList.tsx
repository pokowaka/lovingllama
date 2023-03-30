
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  ListItemButton,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { IEntry } from "../types/Entry.type";
import entrySerivce from "../services/entry.service";
import { useNavigate } from "react-router-dom";


interface SingleItemProps {
    primaryText: string;
    secondaryText: string;
    maxLen: number
  }
  
function SingleItem({ primaryText, secondaryText, maxLen } : SingleItemProps) {
    const truncatedText = secondaryText.length > maxLen
      ? `${secondaryText.slice(0, maxLen)}...`
      : secondaryText;
  
    return (
      <ListItem>
        <ListItemText primary={primaryText} secondary={truncatedText} />
      </ListItem>
    );
  }

function ItemList() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<IEntry[]>([]);
  const navigate = useNavigate();
  const fetchData = async () => {
    setLoading(true);

    const res = await entrySerivce.getAll(null);
    const items: IEntry[] = [];
    res.forEach((entry) => {
      let item = entry.data();
      items.push(item);
    });
    setItems(items);
    setLoading(false);
  };

  const handleClick = (item: IEntry) => () => {
    console.log(`Clicked on ${item.id}`)
    navigate(`/entry/${item.id}`);
  }


  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          Item List
        </Typography>
        <List>
          {items.map((item: IEntry) => (
            <ListItemButton key={item.id} onClick={handleClick(item)}>
              <SingleItem primaryText={item.question} secondaryText={item.answer} maxLen={120}/>
            </ListItemButton>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default ItemList;
