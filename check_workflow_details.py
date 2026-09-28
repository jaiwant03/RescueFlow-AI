import sqlite3
import os
import json

db_path = os.path.expanduser('~/.n8n/database.sqlite')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("PRAGMA table_info(workflow_entity)")
print("workflow_entity columns:", [col[1] for col in cur.fetchall()])

cur.execute("SELECT id, name, active, versionId FROM workflow_entity WHERE id='rO6qrACYalZyNUMc'")
print("RescueFlow AI row:", cur.fetchone())

cur.execute("PRAGMA table_info(shared_workflow)")
print("shared_workflow columns:", [col[1] for col in cur.fetchall()])

cur.execute("SELECT * FROM shared_workflow WHERE workflowId='rO6qrACYalZyNUMc'")
print("shared_workflow row:", cur.fetchall())

conn.close()
