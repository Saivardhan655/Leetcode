const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

// Create a single Express app
const app = express();
app.use(cors());
app.use(express.json());

// MySQL database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database.");
});

// Define a route to fetch data from the database
app.get("/leetcode/ids", (req, res) => {
  const sqlQuery = "SELECT * FROM LEETCODE";
  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error fetching data.");
      return;
    }
    res.json(result);
  });
});

// Define a route to insert data into the database
app.post("/add-user", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).send("Username is required");
  }

  const sqlQuery = "INSERT INTO LEETCODE (username) VALUES (?)";

  db.query(sqlQuery, [username], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).send("Error inserting data into the database.");
    }
    res.status(200).send("User added successfully!");
  });
});

// Route 1: Fetch user profile data from LeetCode
app.get("/leetcode/profile", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        contestBadge {
          name
          expired
          hoverText
          icon
        }
        username
        githubUrl
        twitterUrl
        linkedinUrl
        profile {
          ranking
          userAvatar
          realName
          aboutMe
          school
          websites
          countryName
          company
          jobTitle
          skillTags
          postViewCount
          postViewCountDiff
          reputation
          reputationDiff
          solutionCount
          solutionCountDiff
          categoryDiscussCount
          categoryDiscussCountDiff
        }
      }
    }
  `;

  try {
    const { default: fetch } = await import("node-fetch");

    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    res.json(result.data.matchedUser);
  } catch (error) {
    console.error("Error fetching data:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Route 2: Fetch user problem stats from LeetCode
app.get("/leetcode/stats", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const query = `
    query userProblemsSolved($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        problemsSolvedBeatsStats {
          difficulty
          percentage
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const { default: fetch } = await import("node-fetch");

    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    res.json(result.data);
  } catch (error) {
    console.error("Error fetching data:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Route 3: Fetch user skill stats from LeetCode
app.get("/leetcode/skills", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const query = `
    query skillStats($username: String!) {
      matchedUser(username: $username) {
        tagProblemCounts {
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          fundamental {
            tagName
            tagSlug
            problemsSolved
          }
        }
      }
    }
  `;

  try {
    const { default: fetch } = await import("node-fetch");

    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    res.json(result.data);
  } catch (error) {
    console.error("Error fetching data:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Route 4: Fetch recent problems from LeetCode
app.get("/leetcode/problems", async (req, res) => {
  const { username } = req.query;
  const limit = parseInt(req.query.limit) || 20; // Set a default limit

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const { default: fetch } = await import("node-fetch");

    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username, limit },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    res.json(result.data.recentAcSubmissionList); // Send the actual submission list
  } catch (error) {
    console.error("Error fetching data:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start the server on a single port
const port = 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
