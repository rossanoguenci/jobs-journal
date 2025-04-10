#[cfg(feature = "cli")]
use rand::Rng;
use rand::prelude::IndexedRandom;
use sqlx::SqlitePool;
use std::env;
use tokio::runtime::Runtime;

fn get_db_path() -> String {
    use std::env;

    let current_dir = env::current_dir().expect("Failed to get current directory");

    // Move up one level from `src/` to `src-tauri-dev-tools/`
    // let project_root = current_dir.parent().expect("Failed to find project root");

    let db_path = current_dir
        .join("src-tauri-dev-tools")
        .join("dev_jobs_journal.db");

    println!("db path: {:?}", db_path);

    db_path.to_str().unwrap().to_string()
}

/*Example: run

cargo run --bin seed_db --features cli,dev -- seed 10

*/
fn main() {
    let rt = Runtime::new().expect("Failed to create runtime");
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        println!("Usage: cargo run --bin seed_db -- <seed NUM> | <clear>");
        return;
    }

    let db_url = get_db_path(); // Standalone call without `AppHandle`
    rt.block_on(async {
        let pool = SqlitePool::connect(&db_url)
            .await
            .expect("Failed to connect to DB");

        match args[1].as_str() {
            "seed" if args.len() == 3 => {
                let num_entries: usize = args[2].parse().unwrap_or(10);
                match seed_database(&pool, num_entries).await {
                    Ok(msg) => println!("{}", msg),
                    Err(e) => eprintln!("Error: {}", e),
                }
            }
            "clear" => match clear_database(&pool).await {
                Ok(msg) => println!("{}", msg),
                Err(e) => eprintln!("Error: {}", e),
            },
            _ => {
                println!("Invalid command. Usage: cargo run --bin seed_db -- <seed NUM> | <clear>")
            }
        }
    });
}

/// Inserts random job entries into the database
async fn seed_database(pool: &SqlitePool, num_entries: usize) -> Result<String, String> {
    let companies = vec!["Google", "Microsoft", "Amazon", "Apple", "Spotify"];
    let titles = vec![
        "Frontend Developer",
        "Backend Developer",
        "Full-Stack Engineer",
        "DevOps Engineer",
        "UI/UX Designer",
    ];
    let statuses = vec!["sent", "in_progress", "got_offer", "rejected"];
    let insert_statuses = vec!["inserted", "archived"];

    let mut rng = rand::rng();

    for _ in 0..num_entries {
        let insert_date = chrono::offset::Utc::now().naive_utc();
        let application_date = insert_date - chrono::Duration::days(rng.random_range(1..30));

        let company = companies.choose(&mut rng).unwrap();
        let title = titles.choose(&mut rng).unwrap();
        let link = if rng.random_bool(0.7) {
            Some(format!(
                "https://joblisting.com/{}",
                rng.random_range(1000..9999)
            ))
        } else {
            None
        };
        let status = statuses.choose(&mut rng).unwrap();
        let insert_status = insert_statuses.choose(&mut rng).unwrap();

        let query = "
            INSERT INTO jobs (insert_date, company, title, link, application_date, status, insert_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ";

        let result = sqlx::query(query)
            .bind(insert_date.format("%Y-%m-%d %H:%M:%S").to_string())
            .bind(company)
            .bind(title)
            .bind(link)
            .bind(application_date.format("%Y-%m-%d").to_string())
            .bind(status)
            .bind(insert_status)
            .execute(pool)
            .await;

        if let Err(e) = result {
            return Err(format!("Failed to insert data: {}", e));
        }
    }

    Ok(format!(
        "Inserted {} random job entries into the database.",
        num_entries
    ))
}

/// Clears the database
async fn clear_database(pool: &SqlitePool) -> Result<String, String> {
    let result = sqlx::query("DELETE FROM jobs").execute(pool).await;

    match result {
        Ok(_) => Ok("Database cleared.".to_string()),
        Err(e) => Err(format!("Failed to clear database: {}", e)),
    }
}
