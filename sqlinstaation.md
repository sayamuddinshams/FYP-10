# SQLite Installation Notes

## Summary

SQLite was installed on this machine (Windows) on **Oct 06, 2026**.

## What got installed

### Command-line tool (`sqlite3.exe`)
- **Version:** 3.53.4 (64-bit)
- **Installed via:** winget (`winget install SQLite.SQLite --source winget`)
- **Location:** `C:\Users\uddin\AppData\Local\Microsoft\WinGet\Packages\SQLite.SQLite_Microsoft.Winget.Source_8wekyb3d8bbwe\`
- **Also included:** `sqldiff`, `sqlite3_analyzer`, `sqlite3_rsync`

### Python built-in module (already present)
- **Python version:** 3.14
- **SQLite version bundled with Python:** 3.50.4

## Installation command used

```
winget install SQLite.SQLite --source winget --accept-source-agreements --accept-package-agreements --silent
```

> Note: The first attempt failed because the `msstore` source could not be
> reached (network error `0x80072ee7`). Specifying `--source winget` fixed it.

## Verify the installation

Run this in a **new terminal** (restart your shell so the updated PATH is picked up):

```
sqlite3 --version
```

Expected output: `3.53.4 2026-07-24 ... (64-bit)`

From Python:

```
python -c "import sqlite3; print(sqlite3.sqlite_version)"
```

## How to use it

### CLI

```bash
# Open an in-memory database
sqlite3

# Open / create a database file
sqlite3 mydatabase.db

# Run SQL directly without opening the shell
sqlite3 test.db "CREATE TABLE hello(msg TEXT); INSERT INTO hello VALUES('Hi there!'); SELECT * FROM hello;"
```

### Python

```python
import sqlite3
conn = sqlite3.connect("mydatabase.db")
cur = conn.cursor()
cur.execute("CREATE TABLE hello(msg TEXT)")
cur.execute("INSERT INTO hello VALUES (?)", ("Hi there!",))
conn.commit()
print(cur.execute("SELECT * FROM hello").fetchall())
conn.close()
```

## Notes

- SQLite does not require a server — databases are single files.
- PATH environment variable was modified by the installer; restart your
  terminal before running `sqlite3` from a plain shell.