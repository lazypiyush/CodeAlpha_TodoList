// Task management class
class ToDoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // DOM elements
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        // Event listeners
        this.taskForm.addEventListener('submit', (e) => this.addTask(e));
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Initial render
        this.render();
    }

    // Load tasks from localStorage
    loadTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // Add new task
    addTask(e) {
        e.preventDefault();
        const taskText = this.taskInput.value.trim();

        if (taskText === '') return;

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.taskInput.value = '';
        this.render();
    }

    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    // Delete task
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    }

    // Edit task
    editTask(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveTasks();
            this.render();
        }
    }

    // Clear completed tasks
    clearCompleted() {
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.render();
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.render();
    }

    // Get filtered tasks
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    // Render tasks
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Clear task list
        this.taskList.innerHTML = '';

        // Render each task
        filteredTasks.forEach(task => {
            const li = this.createTaskElement(task);
            this.taskList.appendChild(li);
        });

        // Update task count
        const activeCount = this.tasks.filter(t => !t.completed).length;
        this.taskCount.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'}`;

        // Enable/disable clear completed button
        const completedCount = this.tasks.filter(t => t.completed).length;
        this.clearCompletedBtn.disabled = completedCount === 0;

        // Show message if no tasks
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#999';
            emptyMessage.style.padding = '20px';
            
            if (this.tasks.length === 0) {
                emptyMessage.textContent = '📋 No tasks yet. Add one to get started!';
            } else {
                emptyMessage.textContent = `No ${this.currentFilter} tasks`;
            }
            
            this.taskList.appendChild(emptyMessage);
        }
    }

    // Create task element
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="checkbox-wrapper">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                >
            </div>
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <div class="task-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        // Checkbox event
        const checkbox = li.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => this.toggleTask(task.id));

        // Delete button event
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        // Edit button event
        const editBtn = li.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => this.startEdit(li, task));

        return li;
    }

    // Start editing a task
    startEdit(li, task) {
        const taskText = li.querySelector('.task-text');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        const currentText = task.text;
        
        // Create input and save button
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = currentText;
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = 'Save';
        
        // Replace text with input
        taskText.replaceWith(input);
        editBtn.replaceWith(saveBtn);
        deleteBtn.style.display = 'none';
        
        input.focus();
        input.select();
        
        // Save on button click
        saveBtn.addEventListener('click', () => {
            this.editTask(task.id, input.value);
        });
        
        // Save on Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.editTask(task.id, input.value);
            }
        });
        
        // Cancel on Escape key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.render();
            }
        });
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ToDoApp();
});
