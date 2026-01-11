package db

import (
	"database/sql"
	"log"
	"os"
    "fmt"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
    var err error
    os.MkdirAll("data", 0755)
    
	DB, err = sql.Open("sqlite3", "./data/synapse.db")
	if err != nil {
		log.Fatal(err)
	}

	createTables()
    seedData()
}

func createTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS verification_stats (
			id INTEGER PRIMARY KEY,
			checked INTEGER DEFAULT 0,
			false_positives INTEGER DEFAULT 0
		);`,
        `CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            txn_id TEXT,
            action TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
	}

	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			log.Printf("Error creating table: %v", err)
		}
	}
}

func seedData() {
    // Check if stats exist
    var count int
    DB.QueryRow("SELECT count(*) FROM verification_stats").Scan(&count)
    if count == 0 {
        _, err := DB.Exec("INSERT INTO verification_stats (id, checked, false_positives) VALUES (1, 125, 1)")
        if err != nil {
            fmt.Println("Error seeding stats:", err)
        }
    }

    // Check if user exists
    DB.QueryRow("SELECT count(*) FROM users WHERE username = 'analyst@synapse.bank'").Scan(&count)
    if count == 0 {
        // Plaintext for demo, or simple hash
        _, err := DB.Exec("INSERT INTO users (username, password) VALUES ('analyst@synapse.bank', 'secure')")
        if err != nil {
            fmt.Println("Error seeding user:", err)
        }
    }
}
