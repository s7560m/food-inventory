import { useEffect, useState } from "react";
import { FirebaseClient } from "./firebase";
import {
    AppBar,
    Box,
    Card,
    CardContent,
    CardActions,
    CircularProgress,
    Container,
    CssBaseline,
    IconButton,
    Stack,
    Toolbar,
    Typography,
    Fab, DialogTitle, DialogContent, Button, Dialog, TextField, DialogActions,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {Add, Inventory2Outlined} from "@mui/icons-material";

type FoodItem = {
    id: string;
    name: string;
    price: string;
    count: number;
    timestamp: any;
};

export default function App() {
    const [items, setItems] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", price: "", count: 1 });

    const fetchItems = async () => {
        try {
            const data = await FirebaseClient.getAllItems();
            setItems(data as FoodItem[]);
        } catch (err) {
            console.error("Error fetching items:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleDelete = async (id: string) => {
        await FirebaseClient.deleteItem(id);
        setItems(items.filter(item => item.id !== id));
    };

    const handleIncrement = async (item: FoodItem) => {
        const updated = { ...item, count: item.count + 1 };
        await FirebaseClient.updateItem(item.id, { count: updated.count });
        setItems(items.map(i => (i.id === item.id ? updated : i)));
    };

    const handleDecrement = async (item: FoodItem) => {
        if (item.count === 0) return;
        const updated = { ...item, count: item.count - 1 };
        await FirebaseClient.updateItem(item.id, { count: updated.count });
        setItems(items.map(i => (i.id === item.id ? updated : i)));
    };

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewItem({ name: "", price: "", count: 1 });
    };

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.price) return;
        const id = await FirebaseClient.addItem(newItem);
        setItems([{ ...newItem, id, timestamp: new Date() }, ...items]);
        handleCloseDialog();
    };


    return (
        <>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <RestaurantIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" noWrap>
                        Food Inventory
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 3 }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {items.length === 0 ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: "40vh",
                                    textAlign: "center",
                                    color: "text.secondary",
                                    mt: 5,
                                }}
                            >
                                <Inventory2Outlined sx={{ fontSize: 48, mb: 1 }} />
                                <Typography variant="h6">No food items available</Typography>
                                <Typography variant="body2">Click the + button to add one</Typography>
                            </Box>
                        ) : (
                            items.map((item) => (
                            <Card
                                key={item.id}
                                sx={{
                                    borderRadius: 3,
                                    backgroundColor: "background.paper", // dark-friendly
                                    boxShadow: "none",
                                    border: "1px solid",
                                    borderColor: "divider", // adapts to theme
                                    px: 2,
                                    py: 1.5,
                                }}
                            >
                                <CardContent sx={{ pb: 1 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "start",
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                {item.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "text.secondary", fontSize: "0.9rem", mt: 0.5 }}
                                            >
                                                Price: {item.price}
                                            </Typography>
                                        </Box>
                                        <IconButton onClick={() => handleDelete(item.id)} color="error" size="small">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </CardContent>

                                <CardActions
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        pt: 0,
                                        px: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <IconButton
                                            onClick={() => handleDecrement(item)}
                                            size="small"
                                            sx={{ color: "text.secondary" }}
                                            disabled={item.count === 0}
                                        >
                                            <RemoveCircleOutlineIcon />
                                        </IconButton>
                                        <Typography variant="body1" sx={{ minWidth: 24, textAlign: "center", fontWeight: 500 }}>
                                            {item.count}
                                        </Typography>
                                        <IconButton
                                            onClick={() => handleIncrement(item)}
                                            size="small"
                                            sx={{ color: "text.secondary" }}
                                        >
                                            <AddCircleOutlineIcon />
                                        </IconButton>
                                    </Box>
                                </CardActions>
                            </Card>

                        )))}
                    </Stack>
                )}
            </Container>
            {/* Floating Add Button */}
            <Fab
                aria-label="add"
                onClick={handleOpenDialog}
                sx={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    backgroundColor: "#363636",
                    color: "#fff",
                    "&:hover": {
                        backgroundColor: "#222",
                    },
                }}
            >
                <Add />
            </Fab>

            {/* Add Item Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Food Item</DialogTitle>
                <DialogContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        pt: 1,
                        pb: 1,
                    }}
                >
                    <TextField
                        label="Name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        fullWidth
                        sx={{ mt: 1 }} // padding top to avoid clipping
                        autoFocus
                    />
                    <TextField
                        label="Price"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        fullWidth
                    />

                    {/* Count Increment/Decrement Buttons */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body1" sx={{ minWidth: 70 }}>
                            Count:
                        </Typography>
                        <IconButton
                            onClick={() =>
                                setNewItem((prev) => ({
                                    ...prev,
                                    count: Math.max(0, prev.count - 1),
                                }))
                            }
                            size="small"
                            sx={{ color: "text.secondary" }}
                            disabled={newItem.count === 0}
                        >
                            <RemoveCircleOutlineIcon />
                        </IconButton>
                        <Typography
                            variant="body1"
                            sx={{ minWidth: 24, textAlign: "center", fontWeight: 500 }}
                        >
                            {newItem.count}
                        </Typography>
                        <IconButton
                            onClick={() =>
                                setNewItem((prev) => ({
                                    ...prev,
                                    count: prev.count + 1,
                                }))
                            }
                            size="small"
                            sx={{ color: "text.secondary" }}
                        >
                            <AddCircleOutlineIcon />
                        </IconButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddItem}
                        disabled={
                            !newItem.name.trim() || !newItem.price.trim() || newItem.count < 0
                        }
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>


        </>
    );
}
