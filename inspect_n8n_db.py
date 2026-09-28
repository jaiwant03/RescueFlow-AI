import sqlite3
import os

db_path = os.path.expanduser('~/.n8n/database.sqlite')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get all tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print("Tables:", tables)

# Check user table
if 'user' in tables:
    cur.execute("SELECT id, email, firstName, lastName FROM user")
    print("Users:", cur.fetchall())

# Check project table
if 'project' in tables:
    cur.execute("SELECT id, name, type FROM project")
    print("Projects:", cur.fetchall())

# Check project_relation table
if 'project_relation' in tables:
    cur.execute("SELECT * FROM project_relation")
    print("Project relations:", cur.fetchall())

# Check shared_workflow table
if 'shared_workflow' in tables:
    cur.execute("SELECT * FROM shared_workflow")
    print("Shared workflow:", cur.fetchall())

# Check workflow_entity
if 'workflow_entity' in tables:
    cur.execute("SELECT id, name, active FROM workflow_entity")
    print("Workflows:", cur.fetchall())

conn.close()
