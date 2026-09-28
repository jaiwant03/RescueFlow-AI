import sqlite3
import os

db_path = os.path.expanduser('~/.n8n/database.sqlite')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Check execution_entity
cur.execute("SELECT id, workflowId, status, createdAt FROM execution_entity ORDER BY id DESC LIMIT 5")
print("Executions:", cur.fetchall())

# Check workflow_history
cur.execute("SELECT * FROM workflow_history ORDER BY createdAt DESC LIMIT 5")
print("Workflow history:", cur.fetchall())

# Check workflow_entity for rO6qrACYalZyNUMc
cur.execute("SELECT id, name, versionId, isArchived, active FROM workflow_entity WHERE id='rO6qrACYalZyNUMc'")
print("RescueFlow AI entity:", cur.fetchone())

conn.close()
