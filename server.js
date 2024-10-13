import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const app = express()


// PostgreSQL database connection configuration
const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
  });


  // Test the database connection
pool.connect((err) => {
    if (err) {
      console.error('Error acquiring client', err.stack);
    } else {
      console.log('Connected to the database successfully');
    }
  });

//   server
const port = process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send('Welcome to Telemedicine!')
})
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Question 1 goes here

// Create GET endpoint to fetch all patients
app.get('/patients', async (req, res) => {
    try {
      // SQL query to select patient_id, first_name, last_name, and gender
      const queryText = `
        SELECT 
          patient_id, 
          first_name, 
          last_name, 
          gender 
        FROM patients
      `;
  
      // Executing the query
      const result = await pool.query(queryText);
  
      // Send back the data as JSON
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching patients:', error.message);
      res.status(500).json({ error: 'An error occurred while fetching patients' });
    }
  });


// Question 2 goes here

app.get('/providers', async (req,res) =>{

    try{
        const queryText = `
        SELECT 
        first_name,
        last_name,
        provider_speciality
        FROM providers
        `;

         // Executing the query
      const result = await pool.query(queryText);

      // Send back the data as JSON
      res.status(200).json(result.rows);
    }catch(error){
        console.error('Error fetching providers:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching providers' });
    }
    
})

// Question 3 goes here

app.get('/patients', async (req, res) => {
    const { first_name } = req.query; // Capture first_name from query parameters

    try {
        const result = await pool.query(
            'SELECT patient_id, first_name, last_name FROM patients WHERE first_name = $1',
            [first_name]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No patients found with the given first name' });
        }


        res.status(200).json(result.rows); // Return the filtered patients
    } catch (error) {
        console.error('Error fetching patients by first name:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Question 4 goes here
// GET endpoint to filter providers by specialty
app.get('/providers', async (req, res) => {
    const speciality = req.query.speciality; // Capture the specialty query parameter

    // Check if the specialty parameter is provided
    if (!speciality) {
        return res.status(400).json({ message: 'Specialty query parameter is required' });
    }

    try {
        // Query the database for providers with the given specialty
        const result = await pool.query(
            'SELECT first_name, last_name, provider_specialty FROM providers WHERE provider_specialty = $1',
            [specialty] // Parameterized query to avoid SQL injection
        );

        // Check if any providers were found
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No providers found for specialty: ${speciality}` });
        }

        // Return the filtered providers
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching providers by specialty:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
