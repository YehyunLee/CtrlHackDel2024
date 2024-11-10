import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the API route handler
export default async function handler(req, res) {
  if (req.method === "POST") {
    // Check if the request method is POST
    try {
      const { user_prompt } = req.body; // Get prompt from request body

      // Make sure to include these imports:
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(user_prompt);
      console.log(result.response.text());

      res.status(200).json({ result }); // Send the generated text as a JSON response
    } catch (error) {
      console.error(error); // Log any errors
      res
        .status(500)
        .json({ error: "An error occurred while generating text." }); // Send error response
    }
  } else {
    res.setHeader("Allow", ["POST"]); // Set allowed methods
    res.status(405).end(`Method ${req.method} Not Allowed`); // Handle method not allowed
  }
}
