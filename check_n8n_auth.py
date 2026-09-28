import sqlite3
import os

db_path = os.path.expanduser('~/.n8n/database.sqlite')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT id, email, password FROM user")
users = cur.fetchall()
print("Users:", [(u[0], u[1]) for u in users])

cur.execute("SELECT * FROM settings")
print("Settings:", cur.fetchall())

conn.close()
