const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Constants
const USER_ID = "Yash_Salvi_09082005"; // Format: fullname_ddmmyyyy
const EMAIL = "yashsalvi230501@acropolis.in";
const ROLL_NUMBER = "0827AL231151";

// Helper function to check for prime
const isPrime = (num) => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  let i = 5;
  while (i * i <= num) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
    i += 6;
  }
  return true;
};

// GET Route
app.get("/bfhl", (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

// POST Route
app.post("/bfhl", (req, res) => {
  try {
    const { data, file_b64 } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ is_success: false, message: "Invalid input data format" });
    }

    const numbers = [];
    const alphabets = [];
    let highest_lowercase_alphabet = [];
    let is_prime_found = false;

    data.forEach((item) => {
      // Check if item is a number
      if (!isNaN(item) && item.trim() !== "") {
        numbers.push(item);
        if (isPrime(parseInt(item, 10))) {
          is_prime_found = true;
        }
      } else if (typeof item === "string" && item.length === 1 && /[a-zA-Z]/.test(item)) {
        alphabets.push(item);
        if (/[a-z]/.test(item)) {
          if (
            highest_lowercase_alphabet.length === 0 ||
            item > highest_lowercase_alphabet[0]
          ) {
            highest_lowercase_alphabet = [item];
          }
        }
      }
    });

    // File Handling
    let file_valid = false;
    let file_mime_type = "";
    let file_size_kb = 0;

    if (file_b64 && typeof file_b64 === "string") {
      try {
        // Base64 string might contain data URL prefix like "data:image/png;base64,..."
        // Or it might be just the base64 encoded string
        let base64Data = file_b64;
        
        if (file_b64.includes("base64,")) {
            const parts = file_b64.split("base64,");
            base64Data = parts[1];
            // Try to extract mime type from the prefix
            const match = parts[0].match(/data:(.*?);/);
            if (match && match[1]) {
              file_mime_type = match[1];
            }
        }

        const buffer = Buffer.from(base64Data, "base64");
        
        // Simple validation to check if buffer has content
        if (buffer.length > 0) {
          file_valid = true;
          file_size_kb = Math.round((buffer.length / 1024) * 100) / 100; // Size in KB
          
          if (!file_mime_type) {
            // Attempt a naive mime type guess or fallback
            // In a real scenario, we could use file-type library, but to keep it simple:
            file_mime_type = "application/octet-stream"; // default fallback
            
            // basic check for common signatures
            if (buffer[0] === 0xFF && buffer[1] === 0xD8) file_mime_type = "image/jpeg";
            else if (buffer[0] === 0x89 && buffer[1] === 0x50) file_mime_type = "image/png";
            else if (buffer[0] === 0x25 && buffer[1] === 0x50) file_mime_type = "application/pdf";
          }
        }
      } catch (err) {
        file_valid = false;
      }
    }

    res.status(200).json({
      is_success: true,
      user_id: USER_ID,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      numbers,
      alphabets,
      highest_lowercase_alphabet,
      is_prime_found,
      file_valid,
      file_mime_type: file_valid ? file_mime_type : undefined,
      file_size_kb: file_valid ? file_size_kb.toString() : undefined
    });
  } catch (error) {
    res.status(500).json({ is_success: false, message: "Internal server error" });
  }
});

// For local testing
if (process.env.NODE_ENV !== "production" && !process.env.NETLIFY) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports.handler = serverless(app);
