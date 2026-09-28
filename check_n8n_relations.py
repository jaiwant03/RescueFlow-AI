import sqlite3
import os

db_path = os.path.expanduser('~/.n8n/database.sqlite')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("--- USERS ---")
cur.execute("SELECT * FROM user")
for r in cur.fetchall():
    print(r)

print("\n--- PROJECTS ---")
cur.execute("SELECT * FROM project")
for r in cur.fetchall():
    print(r)

print("\n--- PROJECT RELATIONS ---")
cur.execute("SELECT * FROM project_relation")
for r in cur.fetchall():
    print(r)

print("\n--- SHARED WORKFLOW ---")
cur.execute("SELECT * FROM shared_workflow")
for r in cur.fetchall():
    print(r)

print("\n--- SHARED CREDENTIALS ---")
cur.execute("SELECT * FROM shared_credentials")
for r in cur.fetchall():
    print(r)

conn.close()
