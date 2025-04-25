import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "https://fullactivity.onrender.com/";

export default function TodoList() {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState("");
    const [editId, setEditId] = useState(null);
    const [filter, setFilter] = useState("all");
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            const storedTheme = await AsyncStorage.getItem("theme");
            setDarkMode(storedTheme === "dark");
        };
        loadTheme();
        fetchTasks();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${API_URL}/`);
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const addTask = async () => {
        if (task.trim() === "") return;
        const newTask = { title: task, completed: false };
        try {
            const response = await axios.post(`${API_URL}/`, newTask);
            setTasks([...tasks, response.data]);
            setTask("");
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const markCompleted = async (id) => {
        const taskToUpdate = tasks.find((t) => t.id === id);
        if (!taskToUpdate) return;

        const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
        try {
            const response = await axios.put(`${API_URL}`, updatedTask);
            setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const editTask = (id) => {
        const taskToEdit = tasks.find((t) => t.id === id);
        if (taskToEdit) {
            setTask(taskToEdit.title);
            setEditId(id);
        }
    };

    const updateTask = async () => {
        if (!editId || task.trim() === "") return;

        const updatedTask = { title: task, completed: false };
        try {
            const response = await axios.put(`${API_URL}/${editId}/update`, updatedTask);
            setTasks(tasks.map((t) => (t.id === editId ? response.data : t)));
            setEditId(null);
            setTask("");
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const removeTask = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}/delete`);
            setTasks(tasks.filter((t) => t.id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const filteredTasks = tasks.filter((t) => {
        if (filter === "all") return true;
        if (filter === "completed") return t.completed;
        return !t.completed;
    });

    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
    };

    return (
        <View style={[styles.container, darkMode ? styles.dark : styles.light]}>
            <Button title={darkMode ? "Switch to Light Mode ☀️" : "Switch to Dark Mode 🌙"} onPress={toggleDarkMode} />

            <Text style={styles.header}>✅ Todo-List App</Text>

            <TextInput
                placeholder="Add a new task..."
                value={task}
                onChangeText={setTask}
                style={styles.input}
            />
            <Button
                title={editId ? "Update Task" : "Add Task"}
                onPress={editId ? updateTask : addTask}
            />

            <View style={styles.filterButtons}>
                {["all", "completed", "pending"].map((status) => (
                    <TouchableOpacity key={status} onPress={() => setFilter(status)} style={styles.filterBtn}>
                        <Text style={{ fontWeight: filter === status ? "bold" : "normal" }}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.taskItem}>
                        <Text style={item.completed ? styles.completed : null}>{item.title}</Text>
                        <View style={styles.actions}>
                            <Button title="✔️" onPress={() => markCompleted(item.id)} />
                            <Button title="✏️" onPress={() => editTask(item.id)} />
                            <Button title="❌" onPress={() => removeTask(item.id)} />
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text>No tasks listed.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 50,
        flex: 1,
    },
    light: {
        backgroundColor: '#fff',
    },
    dark: {
        backgroundColor: '#222',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#6a5acd',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
    },
    filterButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    filterBtn: {
        padding: 5,
    },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    actions: {
        flexDirection: 'row',
        gap: 5,
    },
    completed: {
        textDecorationLine: 'line-through',
        color: 'gray',
    },
});
