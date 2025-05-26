const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Thêm để dùng biến môi trường

const app = express();
app.use(cors());
app.use(express.json());

// Route mặc định cho "/"
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the To Do List API. Use /api/tasks for operations.' });
});

// Kết nối MongoDB với URI cụ thể
mongoose.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

// Định nghĩa schema cho Task
const taskSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Trường id để đồng bộ với React Native
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
}, { collection: 'example' }); // Chỉ định tên collection là 'example'
const Task = mongoose.model('Example', taskSchema);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Lấy danh sách tasks
app.get('/api/tasks', async (req, res, next) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        next(error);
    }
});

// Thêm task mới
app.post('/api/tasks', async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ message: 'Task text is required and must be a non-empty string' });
        }
        const task = new Task({
            id: Date.now().toString(), // Tạo id để đồng bộ với React Native
            text: text.trim(),
            completed: false
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
});

// Xóa task
app.delete('/api/tasks/:id', async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ id: req.params.id }); // Tìm theo id tùy chỉnh
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Đánh dấu công việc hoàn thành
app.put('/api/tasks/:id/toggle', async (req, res, next) => {
    try {
        const task = await Task.findOne({ id: req.params.id }); // Tìm theo id tùy chỉnh
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        task.completed = !task.completed;
        await task.save();
        res.json(task);
    } catch (error) {
        next(error);
    }
});

// Xóa tất cả tasks
app.delete('/api/tasks', async (req, res, next) => {
    try {
        await Task.deleteMany({});
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));