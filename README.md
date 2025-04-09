# Adding dbfile.sql into Local MySQL

To add `dbfile.sql` into your local MySQL database, follow these steps:

1. Open your terminal.
2. Navigate to the directory where `dbfile.sql` is located.
3. Run the following command:

   ```sh
   mysql -u root -p < dbfile.sql
   ```

4. You will be prompted to enter your MySQL root password. Enter the password and press Enter.
5. The SQL file will be executed, and the database will be updated accordingly.

Note: Ensure that MySQL server is running on your local machine before executing the command.

# Creating a .env File

To create a `.env` file, follow these steps:

1. Open your terminal.
2. Navigate to the root directory of your project.
3. Create a new file named `.env` using the following command:

   ```sh
   touch .env
   ```

4. Open the `.env` file in your preferred text editor and add your environment variables in the format `KEY=VALUE`. For example:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=password
   ```

5. Save the file and close the text editor.

The `.env` file is now created and can be used to store environment-specific variables.

# Installing Node Modules and Running the Server

To install the necessary node modules and run the server, follow these steps:

1. Open your terminal.
2. Navigate to the root directory of your project.
3. Install the node modules using the following command:

   ```sh
   npm install
   ```

4. Once the installation is complete, run the server using the following command:

   ```sh
   npx ts-node src/server.ts
   ```

The server should now be running and accessible according to the configuration in `src/server.ts`.
