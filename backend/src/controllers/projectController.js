const { pool } = require('../config/db');

exports.createProject = async (req, res) => {
  const { name, description, memberIds } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1,$2,$3) RETURNING *',
      [name, description, req.user.id]
    );
    const project = result.rows[0];
    if (memberIds && memberIds.length > 0) {
      for (const uid of memberIds) {
        await pool.query('INSERT INTO project_members (project_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [project.id, uid]);
      }
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT p.*, u.name as owner_name FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = $1 OR pm.user_id = $1
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id=$1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE projects SET name=$1, description=$2 WHERE id=$3 RETURNING *',
      [name, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
