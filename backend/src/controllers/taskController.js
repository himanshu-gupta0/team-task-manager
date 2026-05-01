const { pool } = require('../config/db');

exports.createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, status, priority, due_date, project_id, assignee_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, description, status||'TODO', priority||'MEDIUM', dueDate||null, projectId, assigneeId||null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id=u.id WHERE t.project_id=$1 ORDER BY t.created_at DESC',
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id=p.id WHERE t.assignee_id=$1 ORDER BY t.created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOverdueTasks = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id=p.id WHERE t.due_date < NOW() AND t.status != 'DONE'"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title=$1, description=$2, status=$3, priority=$4, due_date=$5, assignee_id=$6 WHERE id=$7 RETURNING *',
      [title, description, status, priority, dueDate||null, assigneeId||null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
