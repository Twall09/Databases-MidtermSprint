const { Pool } = require("pg");

// PostgreSQL connection
const pool = new Pool({
  user: "postgres", //This _should_ be your username, as it's the default one Postgres uses
  host: "localhost",
  database: "MidtermSprint", //This should be changed to reflect your actual database
  password: "wall.11", //This should be changed to reflect the password you used when setting up Postgres
  port: 5432,
});

/**
 * Creates the database tables, if they do not already exist.
 */
async function createTable() {
  // TODO: Add code to create Movies, Customers, and Rentals tables
  // Added in movie_id as the primary key
  const moviesTable = `
    CREATE TABLE IF NOT EXISTS Movies (
      movie_id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      release_year INT NOT NULL,
      genre VARCHAR(50) NOT NULL,
      director VARCHAR(50) NOT NULL);`;

  // Added in the customer_id as the primary key
  const customerTable = `
    CREATE TABLE IF NOT EXISTS Customers (
      customer_id SERIAL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone_number VARCHAR(20));`;

  // Added in the rental_id as the primary key
  const rentalTable = `
    CREATE TABLE IF NOT EXISTS Rentals (
      rental_id SERIAL PRIMARY KEY,
      customer_id INT NOT NULL,
      movie_id INT NOT NULL,
      rental_date DATE DEFAULT CURRENT_DATE,
      return_date DATE,
      FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
      FOREIGN KEY (movie_id) REFERENCES Movies(movie_id));`;

  // essentially a test
  try {
    await pool.query(moviesTable);
    await pool.query(customerTable);
    await pool.query(rentalTable);
    console.log("Tables created successfully.");
  } catch (error) {
    console.error("Error creating tables: ", error.message);
  }
}

/**
 * Inserts a new movie into the Movies table.
 *
 * @param {string} title Title of the movie
 * @param {number} year Year the movie was released
 * @param {string} genre Genre of the movie
 * @param {string} director Director of the movie
 */
async function insertMovie(title, releaseYear, genre, director) {
  // TODO: Add code to insert a new movie into the Movies table
  const query = `
  INSERT INTO Movies (title, release_year, genre, director)
  VALUES ($1, $2, $3, $4) RETURNING *;`;

  // essentially a test
  try {
    const res = await pool.query(query, [title, releaseYear, genre, director]);
    console.log("Movie inserted: ", res.rows[0]);
  } catch (error) {
    console.error("Error inserting movie: ", error.message);
  }
}

/**
 * Prints all movies in the database to the console
 */
async function displayMovies() {
  // TODO: Add code to retrieve and print all movies from the Movies table
  const query = `SELECT * FROM Movies;`;
  try {
    const res = await pool.query(query);
    console.log("Movies rendered: ");
    res.rows.forEach((movie) => {
      console.log(
        `${movie.movie_id}: ${movie.title} (${movie.release_year}) - ${movie.genre}, directed by ${movie.director}`
      );
    });
  } catch (error) {
    console.error("Error displaying movies: ", error.message);
  }
}

/**
 * Inserts a new customer into the Customers table.
 *
 * @param {string} first_name customer first name
 * @param {string} last_name customer last name
 * @param {string} email customer email
 * @param {string} phone_number customer phone number
 */
async function insertCustomer(firstName, lastName, email, phone) {
  const query = `
  INSERT INTO Customers (first_name, last_name, email, phone_number)
  VALUES ($1, $2, $3, $4) RETURNING *;`;

  try {
    const res = await pool.query(query, [firstName, lastName, email, phone]);
    console.log("Successfully inserted customer: ", res.rows[0]);
  } catch (error) {
    console.error("Error - cannot insert customer: ", error.message);
  }
}

/**
 * Inserts a new rental into the rentals table.
 *
 * @param {string} customerId  customer who rented
 * @param {string} movieId the movie they rented
 * @param {Date} rentalDate date they rented
 * @param {Date} returnDate the return date
 */
async function insertRental(customerId, movieId, rentalDate, returnDate) {
  // after some confusion and research, I realized I had to convert the date to allow my entries to store in Postgres.
  const formattedRentalDate = rentalDate.toISOString().split("T")[0];
  const formattedReturnDate = returnDate
    ? returnDate.toISOString().split("T")[0]
    : null;

  const query = `
  INSERT INTO Rentals (customer_id, movie_id, rental_date, return_date)
  VALUES ($1, $2, $3, $4) RETURNING *;`;

  try {
    const res = await pool.query(query, [
      customerId,
      movieId,
      formattedRentalDate,
      formattedReturnDate,
    ]);
    console.log("Successfully inserted a rental: ", res.rows[0]);
  } catch (error) {
    console.error("Error - cannot insert a rental: ", error.message);
  }
}

/**
 * Updates a customer's email address.
 *
 * @param {number} customerId ID of the customer
 * @param {string} newEmail New email address of the customer
 */
async function updateCustomerEmail(customerId, newEmail) {
  // TODO: Add code to update a customer's email address
  const query = `UPDATE Customers SET email = $1 WHERE customer_id = $2 RETURNING *;`;

  try {
    const res = await pool.query(query, [newEmail, customerId]);
    if (res.rowCount > 0) {
      console.log("Updated email address: ", res.rows[0]);
    } else {
      console.log("Error - Not a customer");
    }
  } catch (error) {
    console.error("Error - Cannot update customers email.", error.message);
  }
}

/**
 * Removes a customer from the database along with their rental history.
 *
 * @param {number} customerId ID of the customer to remove
 */
async function removeCustomer(customerId) {
  // TODO: Add code to remove a customer and their rental history
  const query = `DELETE FROM Customers WHERE customer_id = $1 RETURNING *;`;
  try {
    const res = await pool.query(query, [customerId]);
    if (res.rowCount > 0) {
      console.log("Successfully removed customer!", res.rows[0]);
    } else {
      console.log("Error - Not a customer");
    }
  } catch (error) {
    console.error("Failed to remove customer!", error.message);
  }
}

/**
 * Prints a help message to the console
 */
function printHelp() {
  console.log("Usage:");
  console.log("  insert <title> <year> <genre> <director> - Insert a movie");
  console.log("  show - Show all movies");
  console.log("  update <customer_id> <new_email> - Update a customer's email");
  console.log("  remove <customer_id> - Remove a customer from the database");
}

/**
 * Runs our CLI app to manage the movie rentals database
 */
async function runCLI() {
  await createTable();

  const args = process.argv.slice(2);
  switch (args[0]) {
    case "insert":
      if (args.length !== 5) {
        printHelp();
        return;
      }
      await insertMovie(args[1], parseInt(args[2]), args[3], args[4]);
      break;
    case "insert_customer":
      if (args.length !== 5) {
        printHelp();
        return;
      }
      await insertCustomer(args[1], args[2], args[3], args[4]);
      break;
    case "insert_rental":
      if (args.length !== 5) {
        printHelp();
        return;
      }
      const rentalDate = new Date(args[3]);
      const returnDate = new Date(args[4]);
      await insertRental(args[1], args[2], rentalDate, returnDate);
      break;
    case "show":
      await displayMovies();
      break;
    case "update":
      if (args.length !== 3) {
        printHelp();
        return;
      }
      await updateCustomerEmail(parseInt(args[1]), args[2]);
      break;
    case "remove":
      if (args.length !== 2) {
        printHelp();
        return;
      }
      await removeCustomer(parseInt(args[1]));
      break;
    default:
      printHelp();
      break;
  }
}

runCLI();
