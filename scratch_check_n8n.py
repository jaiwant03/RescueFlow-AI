import sqlite3
import os
import json

db_path = os.path.expanduser('~/.n8n/database.sqlite')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("--- CREDENTIALS ---")
cur.execute("SELECT id, name, type FROM credentials_entity")
for row in cur.fetchall():
    print(row)

print("\n--- WORKFLOWS ---")
cur.execute("SELECT id, name, active FROM workflow_entity")
for row in cur.fetchall():
    print(row)

conn.close()
