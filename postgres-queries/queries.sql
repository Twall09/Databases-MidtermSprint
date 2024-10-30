-- QUERIES TO INSERT DATA INTO TABLES
-- I had the functions created in index.js so you can use the terminal to insert data using the printHelp() message.

-- 5 movies:

INSERT INTO Movies (title, release_year, genre, director) VALUES
('The Dark Knight', 2008, 'Action', 'Christopher Nolan'),
('Purple Hearts', 2022, 'Romance', 'Elizabeth Allen Rosenbaum'),
('Grown Ups', 2010, 'Comedy', 'Dennis Dugan'),
('The Shawshank Redemption', 1994, 'Drama', 'Frank Darabont'),
('Forrest Gump', 1994, 'Drama', 'Robert Zemeckis');

-- 5 customers:

INSERT INTO Customers (first_name, last_name, email, phone_number) VALUES
('Tom', 'Brady', 'tom.brady@example.com', '123-456-7890'),
('Patrick', 'Mahomes', 'patrick.mahomes@example.com', '234-567-8901'),
('Aaron', 'Rodgers', 'aaron.rodgers@example.com', '345-678-9012'),
('Lamar', 'Jackson', 'lamar.jackson@example.com', '456-789-0123'),
('Jordan', 'Love', 'jordan.love@example.com', '567-890-1234');

-- 10 rentals:

INSERT INTO Rentals (customer_id, movie_id, rental_date, return_date) VALUES
(1, 1, '2024-10-01', '2024-10-15'), 
(2, 2, '2024-10-05', '2024-10-20'), 
(3, 3, '2024-10-10', NULL), 
(4, 4, '2024-10-12', '2024-10-26'), 
(5, 5, '2024-10-15', '2024-10-30'), -- NULL means all rented out movies (movies who's return dates haven't been met)
(1, 2, '2024-10-02', '2024-10-16'), 
(2, 3, '2024-10-06', NULL), 
(3, 4, '2024-10-11', '2024-10-25'), 
(4, 5, '2024-10-13', NULL), 
(5, 1, '2024-10-14', '2024-10-28'); 



-- PROVIDE POSTGRES QUERIES TO SOLVE THE FOLLOWING:

-- 1. Find all movies rented by a specific customer, given their email.

SELECT m.title, m.release_year, m.genre, m.director, r.rental_date, r.return_date
FROM Rentals r
JOIN Customers c ON r.customer_id = c.customer_id
JOIN Movies m ON r.movie_id = m.movie_id
WHERE c.email = 'tom.brady@example.com';


-- 2. Given a movie title, list all customers who have rented the movie

SELECT customers.first_name || ' ' || customers.last_name AS full_name
FROM rentals
JOIN customers ON rentals.customer_id = customers.customer_id
JOIN movies ON rentals.movie_id = movies.movie_id
WHERE movies.title = 'The Dark Knight';

-- 3. Get the rental history for a specific movie title

SELECT customers.first_name || ' ' || customers.last_name AS full_name, rentals.rental_date, rentals.return_date
FROM rentals
JOIN customers ON rentals.customer_id = customers.customer_id
JOIN movies ON rentals.movie_id = movies.movie_id
WHERE movies.title = 'The Shawshank Redemption';

-- 4. For a specific movie director: 
-- Find the name of the customer, the date of the rental and title of the movie, each time a movie by that director was rented

SELECT customers.first_name || ' ' || customers.last_name AS full_name, rentals.rental_date, movies.title
FROM rentals
JOIN customers ON rentals.customer_id = customers.customer_id
JOIN movies ON rentals.movie_id = movies.movie_id
WHERE movies.director = 'Dennis Dugan';

-- 5. List all currently rented out movies (movies who's return dates haven't been met)

SELECT movies.title, rentals.rental_date, customers.first_name || ' ' || customers.last_name AS full_name
FROM rentals
JOIN customers ON rentals.customer_id = customers.customer_id
JOIN movies ON rentals.movie_id = movies.movie_id
WHERE rentals.return_date IS NULL;


