import sqlite3
import os

db_path = os.path.expanduser('~/.n8n/database.sqlite')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("ALL WORKFLOWS:")
cur.execute("SELECT id, name FROM workflow_entity")
for r in cur.fetchall():
    print(" -", r[0], ":", r[1])

print("\nALL SHARED WORKFLOWS:")
cur.execute("SELECT workflowId, projectId, role FROM shared_workflow")
for r in cur.fetchall():
    print(" -", r)

conn.close()
