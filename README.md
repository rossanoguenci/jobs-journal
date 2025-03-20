# Jobs Journal

A simple and efficient job journal app to help you track and manage your job search process. Built with Next.js (app routing), Tauri v2, HeroUI, Rust, and SQLite.

## Current Status

This is an **alpha version** of the app. At the moment, it provides basic functionality to **insert** and **delete** (hide) job journal entries. More features will be added in due course, including tagging, filtering, and more robust tracking options.

We are committed to publishing this project as open-source and welcome any contributions. If you would like to contribute or suggest improvements, please feel free to open an issue or create a pull request.

## Features

- Track job applications and interviews (basic insert and delete functionality).
- Simple and reusable components for easy future extensions.
- Backend powered by Rust and SQLite for performance and simplicity.

## Tech Stack

- **Frontend**: Next.js (app routing), HeroUI (React UI library)
- **Backend**: Rust, SQLite, Tauri v2
- **Package Management**: pnpm

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or above)
- [Rust](https://www.rust-lang.org/)
- [pnpm](https://pnpm.io/)

### Steps

1. Clone the repository:

    ```bash
    git clone https://github.com/rossanoguenci/jobs-journal.git
    cd jobs-journal
    ```

2. Install the frontend dependencies:

    ```bash
    pnpm install
    ```

3. Install the Tauri dependencies for the backend:

    ```bash
    cd src-tauri
    cargo install
    ```

4. Run the app in development mode:

    ```bash
    pnpm dev
    ```
   
5. To build the app:

   ```bash
   pnpm build
   ```

## Project Structure

- `src/`: Frontend code using Next.js (app routing)
- `src-tauri/`: Backend code for the Tauri app written in Rust
- `components/`: Reusable UI components
- `public/`: Static assets like images and icons

## Contributing

We love to publish this project as open-source, and any contributions are most welcome! If you find any bugs, have suggestions, or want to improve the project, feel free to open an issue or create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.
