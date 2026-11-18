use std::time::Duration;

use serde_json::Value;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions},
    SqlitePool,
};
use tauri::{Manager, State};

struct Database {
    pool: SqlitePool,
    path: String,
}

// Load the saved journal.
#[tauri::command]
async fn load_journal(
    db: State<'_, Database>,
) -> Result<Value, String> {
    let payload = sqlx::query_scalar::<_, String>(
        "SELECT payload FROM journal_state WHERE id = 1",
    )
    .fetch_one(&db.pool)
    .await
    .map_err(|error| format!("Failed to load journal: {error}"))?;

    serde_json::from_str(&payload)
        .map_err(|error| format!("Invalid journal data: {error}"))
}

// Save the entire journal using one atomic SQL operation.
#[tauri::command]
async fn save_journal(
    db: State<'_, Database>,
    snapshot: Value,
) -> Result<(), String> {
    if !snapshot.is_object() {
        return Err("Journal data must be a JSON object".into());
    }

    let payload = serde_json::to_string(&snapshot)
        .map_err(|error| {
            format!("Failed to serialize journal data: {error}")
        })?;

    sqlx::query(
        r#"
        INSERT INTO journal_state (id, payload, updated_at)
        VALUES (1, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            payload = excluded.payload,
            updated_at = CURRENT_TIMESTAMP
        "#,
    )
    .bind(payload)
    .execute(&db.pool)
    .await
    .map_err(|error| format!("Failed to save journal: {error}"))?;

    Ok(())
}

// Return the exact SQLite database path.
#[tauri::command]
fn database_path(db: State<'_, Database>) -> String {
    db.path.clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let directory = app.path().app_data_dir()?;

            std::fs::create_dir_all(&directory)?;

            let path = directory.join("journal.sqlite");

            let options = SqliteConnectOptions::new()
                .filename(&path)
                .create_if_missing(true)
                .journal_mode(SqliteJournalMode::Wal)
                .busy_timeout(Duration::from_secs(5));

            let pool = tauri::async_runtime::block_on(async {
                let pool = SqlitePoolOptions::new()
                    .max_connections(1)
                    .connect_with(options)
                    .await?;

                sqlx::migrate!("./migrations")
                    .run(&pool)
                    .await?;

                Ok::<SqlitePool, Box<dyn std::error::Error>>(pool)
            })?;

            app.manage(Database {
                pool,
                path: path.to_string_lossy().into_owned(),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_journal,
            save_journal,
            database_path,
        ])
        .run(tauri::generate_context!())
        .expect("Failed to start DndJournal");
}