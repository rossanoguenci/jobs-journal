pub fn init_logger() {
    let level = if cfg!(debug_assertions) {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Info
    };

    let _ = env_logger::builder()
        .format(|buf, record| {
            use std::io::Write;
            writeln!(
                buf,
                "{} {} [{}] - {}\n",
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
                record.level(),
                record.target(),
                record.args()
            )
        })
        .filter_level(level)
        .try_init();

    if cfg!(debug_assertions) {
        crate::debug_log!("init_logger() → debug works!");
        crate::info_log!("Logger initialised successfully");
        crate::warn_log!("Logger test: sample warning");
        crate::error_log!("Logger test: sample error");
    }
}

// Shorthand macros for structured logging
#[macro_export]
macro_rules! debug_log {
    ($($arg:tt)*) => {
        log::debug!("{}", format_args!($($arg)*));
    };
}

#[macro_export]
macro_rules! info_log {
    ($($arg:tt)*) => {
        log::info!("{}", format_args!($($arg)*));
    };
}

#[macro_export]
macro_rules! warn_log {
    ($($arg:tt)*) => {
        log::warn!("{}", format_args!($($arg)*));
    };
}

#[macro_export]
macro_rules! error_log {
    ($($arg:tt)*) => {
        log::error!("{}", format_args!($($arg)*));
    };
}
