const express = require("express");
const { ApifyClient } = require("apify-client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const PCMRouter = express.Router();
const KEY2 = process.env.KEY2;

PCMRouter.get("/Health", (req, res) => {
    res.status(200).json({
        msg:"Pcm router working"
    });
});


const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// In-memory transcript cache
const transcriptCache = new Map();
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

// Helper function to get transcript using Apify
async function getTranscript(videoId) {
  // Check cache first
  if (transcriptCache.has(videoId)) {
    const cached = transcriptCache.get(videoId);
    if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
      console.log(`Using cached transcript for video: ${videoId}`);
      return {
        transcriptText: cached.transcriptText,
        fullTranscript: cached.fullTranscript
      };
    }
    // Remove expired entry
    transcriptCache.delete(videoId);
  }

  try {
    console.log(`Fetching new transcript with Apify for video: ${videoId}`);
    
    // Run Apify actor
    const input = {
      video_url: `https://www.youtube.com/watch?v=${videoId}`,
    };

    const run = await apifyClient.actor("invideoiq/video-transcript-scraper").call(input);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      throw new Error("Transcript not available for this video");
    }

    // Format transcript
    const transcriptText = items.map(item => item.text).join(" ");
    const fullTranscript = items.map(item => ({
      text: item.text,
      start: item.start,
      duration: item.duration
    }));

    // Cache the result
    transcriptCache.set(videoId, {
      transcriptText,
      fullTranscript,
      timestamp: Date.now()
    });

    return { transcriptText, fullTranscript };
    
  } catch (error) {
    console.error(`Apify fetch failed for ${videoId}:`, error);
    throw error;
  }
}

// Helper function to clear cache (optional)
function clearTranscriptCache(videoId = null) {
  if (videoId) {
    transcriptCache.delete(videoId);
    console.log(`Cleared cache for video: ${videoId}`);
  } else {
    transcriptCache.clear();
    console.log('Cleared entire transcript cache');
  }
}

// Helper function to get cache stats (optional)
function getCacheStats() {
  return {
    size: transcriptCache.size,
    videos: Array.from(transcriptCache.keys()),
    memoryUsage: process.memoryUsage()
  };
}


// Add this route to your STEMRouter
PCMRouter.post("/FormulaFusion", async (req, res) => {
  try {
    const { videoId } = req.body;

    // Validate video ID format
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript object
    const transcriptResult = await getTranscript(videoId);
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript exists
    if (!transcriptText || transcriptText.length < 100) {
      return res.status(404).json({
        success: false,
        error: "Transcript unavailable or too short"
      });
    }

    const genAI = new GoogleGenerativeAI(KEY2); // Using KEY2 for Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Truncate transcript
    const maxLength = 30000;
    const truncatedText = transcriptText.length > maxLength 
      ? transcriptText.substring(0, maxLength) 
      : transcriptText;

    const prompt = `Generate a FormulaFusion module for STEM education based on this video transcript.
    
    Requirements:
    1. Create 3-5 mathematical derivations with:
       - Title
       - Complexity rating (1-5)
       - Time required (minutes)
       - 5-8 step-by-step derivation steps (equation + explanation)
       - 2-4 real-world applications
    2. Create an equation database with 3-5 categories containing 2-4 equations each
    3. Create 4 subject categories with derivation counts
    4. Focus on mathematical concepts from the transcript
    
    Format EXACTLY as valid JSON:
    {
      "derivations": [
        {
          "id": "deriv1",
          "title": "Derivation Title",
          "complexity": 3,
          "timeRequired": 15,
          "steps": [
            {
              "step": 1,
              "equation": "E = mc^2",
              "explanation": "Explanation of this step"
            },
            ...
          ],
          "applications": [
            "Nuclear energy calculation",
            "Particle physics"
          ]
        },
        ...
      ],
      "equationDatabase": [
        {
          "name": "Category Name",
          "equations": [
            "F = ma",
            "v = u + at"
          ]
        },
        ...
      ],
      "categories": [
        {
          "name": "Physics",
          "derivationCount": 5
        },
        ...
      ]
    }
    
    Transcript: ${truncatedText}`;

    // Generate content with retries
    let result;
    const maxRetries = 3;
    let attempt = 1;
    
    while (attempt <= maxRetries) {
      try {
        result = await model.generateContent(prompt, { timeout: 30000 });
        break;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        attempt++;
      }
    }

    const rawOutput = (await result.response).text();
    
    // Extract JSON from response
    const jsonStart = rawOutput.indexOf('{');
    const jsonEnd = rawOutput.lastIndexOf('}') + 1;
    const jsonString = rawOutput.slice(jsonStart, jsonEnd);
    let moduleData = JSON.parse(jsonString);

    // Validation and fallbacks
    if (!Array.isArray(moduleData.derivations)) {
      moduleData.derivations = [];
    }

    if (!Array.isArray(moduleData.equationDatabase)) {
      moduleData.equationDatabase = [];
    }

    if (!Array.isArray(moduleData.categories)) {
      moduleData.categories = [];
    }

    // Ensure derivations have required structure
    moduleData.derivations = moduleData.derivations.map((deriv, index) => ({
      id: deriv.id || `deriv${index + 1}`,
      title: deriv.title || `Derivation ${index + 1}`,
      complexity: Math.min(5, Math.max(1, deriv.complexity || 3)),
      timeRequired: Math.max(5, Math.min(60, deriv.timeRequired || 15)),
      steps: Array.isArray(deriv.steps) 
        ? deriv.steps.slice(0, 8).map((step, i) => ({
            step: step.step || i + 1,
            equation: step.equation || `x_{${i+1}} = y_{${i+1}}^2 + c`,
            explanation: step.explanation || "Key derivation step explanation"
          }))
        : [],
      applications: Array.isArray(deriv.applications) 
        ? deriv.applications.slice(0, 4) 
        : ["Physics applications", "Engineering use cases"]
    }));

    // Ensure equation database has required structure
    moduleData.equationDatabase = moduleData.equationDatabase.map((cat, idx) => ({
      name: cat.name || `Category ${idx + 1}`,
      equations: Array.isArray(cat.equations) 
        ? cat.equations.slice(0, 4)
        : ["F = ma", "E = mc²"]
    }));

    // Ensure categories have required structure
    moduleData.categories = moduleData.categories.slice(0, 4).map((cat, i) => ({
      name: cat.name || ["Physics", "Calculus", "Algebra", "Geometry"][i] || `Category ${i + 1}`,
      derivationCount: Math.max(1, Math.min(20, cat.derivationCount || 5))
    }));

    res.status(200).json({
      success: true,
      moduleData,
      videoId,
      transcriptLength: transcriptText.length
    });

  } catch (error) {
    console.error('FormulaFusion Error:', error);
    
    let statusCode = 500;
    let errorMessage = "Failed to generate module content";
    
    if (error.message.includes("transcript")) {
      statusCode = 404;
      errorMessage = "Transcript unavailable or too short";
    } 
    else if (error.message.includes("JSON")) {
      statusCode = 500;
      errorMessage = "Failed to parse module content";
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message
    });
  }
});

PCMRouter.post("/JEEAccelerator", async (req, res) => {
  try {
    const { videoId } = req.body;

    // Validate video ID
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript
    const transcriptResult = await getTranscript(videoId);
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript length
    if (!transcriptText || transcriptText.length < 100) {
      return res.status(404).json({
        success: false,
        error: "Transcript unavailable or too short"
      });
    }

    const genAI = new GoogleGenerativeAI(KEY2);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Truncate transcript
    const maxLength = 30000;
    const truncatedText = transcriptText.substring(0, maxLength);

    const prompt = `Generate a JEE Accelerator module based on this video transcript.
    
    Requirements:
    1. Create 3-5 JEE-level problems with:
       - Unique ID (e.g., prob1, prob2)
       - Physics topic (e.g., "Rotational Dynamics")
       - Difficulty (Easy, Medium, Hard)
       - Year (e.g., "JEE 2023")
       - Marks (4-12)
       - Time required (5-15 minutes)
       - Clear question text
       - Step-by-step solution (each step on new line)
       - 2-3 similar problem descriptions
    2. Create 4 topic categories with:
       - Topic name
       - Problem count
       - Weightage percentage (sum to 100)
    
    Format EXACTLY as valid JSON:
    {
      "id": "module_123",
      "title": "Module Title",
      "description": "Brief module description",
      "subject": "Physics",
      "level": "Advanced",
      "content": {
        "problems": [
          {
            "id": "prob1",
            "topic": "Thermodynamics",
            "difficulty": "Hard",
            "year": "JEE 2022",
            "marks": 6,
            "timeRequired": 12,
            "question": "A heat engine operates between...",
            "solution": "Step 1: Apply first law of thermodynamics...\nStep 2: Calculate efficiency...",
            "similarProblems": [
              "Similar problem about Carnot engines",
              "Efficiency calculation with different temps"
            ]
          }
        ],
        "topics": [
          {
            "name": "Mechanics",
            "problemCount": 3,
            "weightage": 40
          }
        ]
      }
    }
    
    Transcript: ${truncatedText}`;

    // Generate content with retries
    let result;
    let attempt = 1;
    const maxRetries = 3;
    
    while (attempt <= maxRetries) {
      try {
        result = await model.generateContent(prompt, { timeout: 30000 });
        break;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        attempt++;
      }
    }

    const rawOutput = (await result.response).text();
    
    // Extract JSON from response
    const jsonStart = rawOutput.indexOf('{');
    const jsonEnd = rawOutput.lastIndexOf('}') + 1;
    const jsonString = rawOutput.substring(jsonStart, jsonEnd);
    let moduleData = JSON.parse(jsonString);

    // Validation and normalization
    moduleData = validateModuleStructure(moduleData);

    res.status(200).json({
      success: true,
      moduleData
    });

  } catch (error) {
    console.error('JEEAccelerator Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to generate module content",
      details: error.message
    });
  }
});


PCMRouter.post("/NumericalNavigator", async (req, res) => {
  try {
    const { videoId } = req.body;

    // Validate video ID
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript
    const transcriptResult = await getTranscript(videoId);
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript length
    if (!transcriptText || transcriptText.length < 100) {
      return res.status(404).json({
        success: false,
        error: "Transcript unavailable or too short"
      });
    }

    const genAI = new GoogleGenerativeAI(KEY2);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Truncate transcript
    const maxLength = 30000;
    const truncatedText = transcriptText.substring(0, maxLength);

    const prompt = `Generate a Numerical Navigator module for STEM education based on this video transcript.

    Requirements:
    1. Create 3-5 numerical problems with:
       - Unique ID
       - Title
       - Short description
       - Numerical method name (e.g., "Newton-Raphson", "Euler's Method")
       - Time required (5-15 minutes)
       - Governing equation (LaTeX format)
       - Parameters with 3-5 numerical values each
       - 4-6 step-by-step solution steps
       - Final solution with accuracy (± value)
    2. Create 3-5 computational methods with examples
    3. Create 4 application domains with problem counts
    
    Format EXACTLY as valid JSON:
    {
      "id": "numerical_123",
      "title": "Numerical Methods Module",
      "description": "Module focused on computational techniques",
      "subject": "Mathematics",
      "level": "Advanced",
      "content": {
        "problems": [
          {
            "id": "prob1",
            "title": "Root Finding",
            "description": "Find roots using Newton-Raphson method",
            "method": "Newton-Raphson",
            "timeRequired": 10,
            "equation": "x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}",
            "parameters": {
              "Initial Guess": [1.0, 1.5, 2.0],
              "Tolerance": [0.001, 0.0001, 0.00001]
            },
            "steps": [
              {
                "step": 1,
                "equation": "x_1 = x_0 - \\frac{f(x_0)}{f'(x_0)}",
                "explanation": "Calculate first approximation"
              },
              ...
            ],
            "solution": "1.618 ± 0.001",
            "accuracy": "0.001"
          }
        ],
        "methods": [
          {
            "name": "Newton-Raphson",
            "examples": [
              "Root finding for polynomials",
              "Solving transcendental equations"
            ]
          }
        ],
        "domains": [
          {
            "name": "Engineering",
            "problemCount": 3
          }
        ]
      }
    }
    
    Transcript: ${truncatedText}`;

    // Generate content with retries
    let result;
    let attempt = 1;
    const maxRetries = 3;
    
    while (attempt <= maxRetries) {
      try {
        result = await model.generateContent(prompt, { timeout: 30000 });
        break;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        attempt++;
      }
    }

    const rawOutput = (await result.response).text();
    
    // Extract JSON from response
    const jsonStart = rawOutput.indexOf('{');
    const jsonEnd = rawOutput.lastIndexOf('}') + 1;
    const jsonString = rawOutput.substring(jsonStart, jsonEnd);
    let moduleData = JSON.parse(jsonString);

    // Validation and normalization
    moduleData = normalizeNumericalModule(moduleData);

    res.status(200).json({
      success: true,
      moduleData
    });

  } catch (error) {
    console.error('NumericalNavigator Error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to generate numerical module",
      details: error.message
    });
  }
});

PCMRouter.post("/ProofBuilder", async (req, res) => {
  try {
    const { videoId } = req.body;

    // Validate video ID format
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript using shared function
    const transcriptResult = await getTranscript(videoId);
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript length
    if (!transcriptText || transcriptText.length < 100) {
      return res.status(404).json({
        success: false,
        error: "Transcript unavailable or too short"
      });
    }

    const genAI = new GoogleGenerativeAI(KEY2);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Truncate transcript to stay within token limits
    const maxLength = 30000;
    const truncatedText = transcriptText.substring(0, maxLength);

    const prompt = `Generate a Proof Builder module for mathematical theorems based on this video transcript.

    Requirements:
    1. Create 3-5 theorems with:
       - Unique ID (e.g., thm1, thm2)
       - Name
       - Difficulty (Basic, Intermediate, Advanced)
       - Time required (10-30 minutes)
       - Precise statement
       - 4-6 proof steps (each with step number, statement, and explanation)
       - 2-4 related theorems
       - 3-5 real-world applications
    2. Create 3-5 proof methods with example counts
    3. Create 4 theorem categories with theorem counts
    
    Format EXACTLY as valid JSON:
    {
      "id": "proof_123",
      "title": "Advanced Calculus Proofs",
      "description": "Module focused on mathematical proofs",
      "subject": "Mathematics",
      "level": "Advanced",
      "content": {
        "theorems": [
          {
            "id": "thm1",
            "name": "Fundamental Theorem of Calculus",
            "difficulty": "Intermediate",
            "timeRequired": 20,
            "statement": "If f is continuous on [a, b] and F is an antiderivative of f, then ∫ₐᵇ f(x) dx = F(b) - F(a)",
            "steps": [
              {
                "step": 1,
                "statement": "Define G(x) = ∫ₐˣ f(t) dt",
                "explanation": "Construct an accumulation function"
              },
              {
                "step": 2,
                "statement": "Show G'(x) = f(x)",
                "explanation": "Apply fundamental theorem part 1"
              }
            ],
            "relatedTheorems": [
              "Mean Value Theorem",
              "Leibniz Integral Rule"
            ],
            "applications": [
              "Physics: Calculating work done",
              "Economics: Total profit calculation"
            ]
          }
        ],
        "proofMethods": [
          {
            "name": "Proof by Induction",
            "examples": 5
          }
        ],
        "categories": [
          {
            "name": "Calculus",
            "theoremCount": 3
          }
        ]
      }
    }
    
    Transcript: ${truncatedText}`;

    // Generate content with retry mechanism
    let result;
    let attempt = 1;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds
    
    while (attempt <= maxRetries) {
      try {
        result = await model.generateContent(prompt, { timeout: 30000 });
        break;
      } catch (error) {
        if (attempt === maxRetries) {
          console.error(`Gemini API failed after ${maxRetries} attempts:`, error);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        attempt++;
      }
    }

    const rawOutput = (await result.response).text();
    
    // Extract JSON from response
    const jsonStart = rawOutput.indexOf('{');
    const jsonEnd = rawOutput.lastIndexOf('}') + 1;
    const jsonString = rawOutput.substring(jsonStart, jsonEnd);
    let moduleData = JSON.parse(jsonString);

    // Normalize and validate the data
    moduleData = normalizeProofModule(moduleData);

    res.status(200).json({
      success: true,
      moduleData
    });

  } catch (error) {
    console.error('Proof Builder Error:', error);
    
    let statusCode = 500;
    let errorMessage = "Failed to generate proof module";
    
    if (error.message.includes("transcript")) {
      statusCode = 404;
      errorMessage = "Transcript unavailable or too short";
    } 
    else if (error.message.includes("JSON")) {
      statusCode = 500;
      errorMessage = "Failed to parse module content";
    }
    else if (error.message.includes("timeout")) {
      statusCode = 504;
      errorMessage = "AI processing timeout";
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
});

PCMRouter.post("/ThreeDExplorer", async (req, res) => {
  try {
    const { videoId } = req.body;

    // Validate video ID format
    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid YouTube video ID format",
        example: "dQw4w9WgXcQ"
      });
    }

    // Get transcript using shared function
    const transcriptResult = await getTranscript(videoId);
    const transcriptText = transcriptResult.transcriptText;

    // Validate transcript length
    if (!transcriptText || transcriptText.length < 100) {
      return res.status(404).json({
        success: false,
        error: "Transcript unavailable or too short"
      });
    }

    const genAI = new GoogleGenerativeAI(KEY2);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Truncate transcript to stay within token limits
    const maxLength = 30000;
    const truncatedText = transcriptText.substring(0, maxLength);

    const prompt = `Generate a 3D Molecular Explorer module based on this chemistry video transcript.

    Requirements:
    1. Create 3-5 molecules with:
       - Unique ID
       - Name
       - Chemical formula
       - Structure type (e.g., "Linear", "Tetrahedral")
       - List of atoms with:
            - Element symbol
            - Position [x, y] (relative coordinates from -5 to 5)
       - List of bonds with:
            - Atom indices [index1, index2]
            - Bond length (relative)
       - Properties:
            - Molecular weight (g/mol)
            - Density (g/cm³)
            - Melting point (°C)
            - Boiling point (°C)
       - Functional groups
       - Isomer names
    2. Create 4 interaction tools
    3. Create 4 molecule categories with counts
    
    Format EXACTLY as valid JSON:
    {
      "id": "molecule_123",
      "title": "Organic Chemistry Explorer",
      "description": "3D visualization of molecular structures",
      "subject": "Chemistry",
      "level": "Intermediate",
      "content": {
        "molecules": [
          {
            "id": "mol1",
            "name": "Water",
            "formula": "H₂O",
            "structureType": "Bent",
            "atoms": [
              { "element": "O", "position": [0, 0] },
              { "element": "H", "position": [0.76, 0.58] },
              { "element": "H", "position": [-0.76, 0.58] }
            ],
            "bonds": [
              { "atoms": [0, 1], "length": 0.96 },
              { "atoms": [0, 2], "length": 0.96 }
            ],
            "properties": {
              "molecularWeight": 18.02,
              "density": 1.0,
              "meltingPoint": 0,
              "boilingPoint": 100
            },
            "functionalGroups": ["Hydroxyl"],
            "isomers": ["Water"]
          }
        ],
        "tools": [
          { "name": "Rotate", "icon": "🔄" },
          { "name": "Zoom", "icon": "🔍" },
          { "name": "Measure", "icon": "📏" },
          { "name": "Select", "icon": "✏️" }
        ],
        "categories": [
          { "name": "Organic", "moleculeCount": 3 },
          { "name": "Inorganic", "moleculeCount": 2 }
        ]
      }
    }
    
    Transcript: ${truncatedText}`;

    // Generate content with retry mechanism
    let result;
    let attempt = 1;
    const maxRetries = 3;
    
    while (attempt <= maxRetries) {
      try {
        result = await model.generateContent(prompt, { timeout: 30000 });
        break;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        attempt++;
      }
    }

    const rawOutput = (await result.response).text();
    
    // Extract JSON from response
    const jsonStart = rawOutput.indexOf('{');
    const jsonEnd = rawOutput.lastIndexOf('}') + 1;
    const jsonString = rawOutput.substring(jsonStart, jsonEnd);
    let moduleData = JSON.parse(jsonString);

    // Normalize and validate the data
    moduleData = normalizeMoleculeData(moduleData);

    res.status(200).json({
      success: true,
      moduleData
    });

  } catch (error) {
    console.error('3D Explorer Error:', error);
    
    let statusCode = 500;
    let errorMessage = "Failed to generate molecular module";
    
    if (error.message.includes("transcript")) {
      statusCode = 404;
      errorMessage = "Transcript unavailable or too short";
    } 
    else if (error.message.includes("JSON")) {
      statusCode = 500;
      errorMessage = "Failed to parse molecular data";
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
});

// Helper function to normalize molecular data
function normalizeMoleculeData(data) {
  // Default values for missing top-level properties
  const defaults = {
    id: `mol_${Date.now()}`,
    title: "Molecular Structures Explorer",
    description: "Interactive 3D visualization of chemical compounds",
    subject: "Chemistry",
    level: "Intermediate"
  };
  
  data = { ...defaults, ...data };
  
  // Initialize content structure
  if (!data.content) data.content = {};
  if (!Array.isArray(data.content.molecules)) data.content.molecules = [];
  if (!Array.isArray(data.content.tools)) data.content.tools = [];
  if (!Array.isArray(data.content.categories)) data.content.categories = [];

  // Element color mapping
  const elementColors = {
    'H': '#FFFFFF', 'C': '#404040', 'O': '#FF4444', 'N': '#4444FF',
    'S': '#FFCC33', 'P': '#FF8000', 'F': '#00FF00', 'Cl': '#00FF00'
  };

  // Normalize molecules
  const moleculeDefaults = {
    structureType: "Unknown",
    atoms: [],
    bonds: [],
    properties: {
      molecularWeight: 0,
      density: 0,
      meltingPoint: 0,
      boilingPoint: 0
    },
    functionalGroups: [],
    isomers: []
  };
  
  data.content.molecules = data.content.molecules.slice(0, 5).map((mol, idx) => {
    const defaultNames = ["Methane", "Ethanol", "Benzene", "Glucose", "Aspirin"];
    
    return {
      id: mol.id || `mol${idx + 1}`,
      name: mol.name || defaultNames[idx] || `Molecule ${idx + 1}`,
      formula: mol.formula || "C?H?O?",
      structureType: mol.structureType || moleculeDefaults.structureType,
      atoms: Array.isArray(mol.atoms) 
        ? mol.atoms.slice(0, 20).map(atom => ({
            element: atom.element || "C",
            position: Array.isArray(atom.position) && atom.position.length === 2
              ? atom.position
              : [Math.random() * 2 - 1, Math.random() * 2 - 1],
            color: elementColors[atom.element] || '#888888'
          }))
        : moleculeDefaults.atoms,
      bonds: Array.isArray(mol.bonds) 
        ? mol.bonds.slice(0, 30).map(bond => ({
            atoms: Array.isArray(bond.atoms) && bond.atoms.length === 2
              ? bond.atoms
              : [0, 1],
            length: bond.length || 1.0
          }))
        : moleculeDefaults.bonds,
      properties: {
        molecularWeight: mol.properties?.molecularWeight || 0,
        density: mol.properties?.density || 0,
        meltingPoint: mol.properties?.meltingPoint || 0,
        boilingPoint: mol.properties?.boilingPoint || 0
      },
      functionalGroups: Array.isArray(mol.functionalGroups) 
        ? mol.functionalGroups.slice(0, 5)
        : moleculeDefaults.functionalGroups,
      isomers: Array.isArray(mol.isomers) 
        ? mol.isomers.slice(0, 3)
        : moleculeDefaults.isomers
    };
  });

  // Normalize tools
  const defaultTools = [
    { name: "Rotate", icon: "🔄" },
    { name: "Zoom", icon: "🔍" },
    { name: "Measure", icon: "📏" },
    { name: "Select", icon: "✏️" }
  ];
  
  data.content.tools = data.content.tools.slice(0, 4).map((tool, idx) => ({
    name: tool.name || defaultTools[idx]?.name || `Tool ${idx + 1}`,
    icon: tool.icon || defaultTools[idx]?.icon || "⚙️"
  }));

  // Normalize categories
  const defaultCategories = ["Organic", "Inorganic", "Biochemical", "Polymer"];
  
  data.content.categories = data.content.categories.slice(0, 4).map((cat, idx) => ({
    name: cat.name || defaultCategories[idx] || `Category ${idx + 1}`,
    moleculeCount: Math.max(0, Math.min(20, cat.moleculeCount || data.content.molecules.length / 2))
  }));

  return data;
}

// Helper function to normalize and validate module data
function normalizeProofModule(data) {
  // Ensure required top-level fields
  const defaults = {
    id: `proof_${Date.now()}`,
    title: "Mathematical Proofs Module",
    description: "Interactive theorem proving experience",
    subject: "Mathematics",
    level: "Advanced"
  };
  
  data = { ...defaults, ...data };
  
  // Initialize content structure
  if (!data.content) data.content = {};
  if (!Array.isArray(data.content.theorems)) data.content.theorems = [];
  if (!Array.isArray(data.content.proofMethods)) data.content.proofMethods = [];
  if (!Array.isArray(data.content.categories)) data.content.categories = [];

  // Normalize theorems
  const theoremDefaults = {
    difficulty: "Intermediate",
    timeRequired: 20,
    steps: [],
    relatedTheorems: [],
    applications: []
  };
  
  data.content.theorems = data.content.theorems.slice(0, 5).map((thm, idx) => {
    const defaultName = ["Pythagorean Theorem", "Fundamental Theorem of Algebra", "Bayes' Theorem"][idx] || `Theorem ${idx + 1}`;
    
    return {
      id: thm.id || `thm${idx + 1}`,
      name: thm.name || defaultName,
      difficulty: ["Basic", "Intermediate", "Advanced"].includes(thm.difficulty) 
        ? thm.difficulty 
        : theoremDefaults.difficulty,
      timeRequired: Math.max(10, Math.min(60, thm.timeRequired || theoremDefaults.timeRequired)),
      statement: thm.statement || `Formal statement of ${defaultName}`,
      steps: Array.isArray(thm.steps) 
        ? thm.steps.slice(0, 6).map((step, i) => ({
            step: step.step || i + 1,
            statement: step.statement || `Proof step ${i + 1}`,
            explanation: step.explanation || "Logical justification for this step"
          }))
        : theoremDefaults.steps,
      relatedTheorems: Array.isArray(thm.relatedTheorems) 
        ? thm.relatedTheorems.slice(0, 4)
        : theoremDefaults.relatedTheorems,
      applications: Array.isArray(thm.applications) 
        ? thm.applications.slice(0, 5)
        : theoremDefaults.applications
    };
  });

  // Normalize proof methods
  const methodDefaults = {
    examples: 3
  };
  
  data.content.proofMethods = data.content.proofMethods.slice(0, 5).map((method, idx) => {
    const defaultName = ["Contradiction", "Construction", "Exhaustion"][idx] || `Method ${idx + 1}`;
    
    return {
      name: method.name || defaultName,
      examples: Math.max(1, Math.min(20, method.examples || methodDefaults.examples))
    };
  });

  // Normalize categories
  const categoryDefaults = {
    theoremCount: 2
  };
  
  data.content.categories = data.content.categories.slice(0, 4).map((cat, idx) => {
    const defaultName = ["Algebra", "Geometry", "Calculus", "Number Theory"][idx] || `Category ${idx + 1}`;
    
    return {
      name: cat.name || defaultName,
      theoremCount: Math.max(1, Math.min(20, cat.theoremCount || categoryDefaults.theoremCount))
    };
  });

  return data;
}

// Helper function for data validation
function normalizeNumericalModule(data) {
  // Ensure required top-level fields
  if (!data.id) data.id = `numerical_${Date.now()}`;
  if (!data.title) data.title = "Numerical Methods Module";
  if (!data.description) data.description = "Computational techniques for STEM";
  if (!data.subject) data.subject = "Mathematics";
  if (!data.level) data.level = "Advanced";

  // Ensure content structure
  if (!data.content) data.content = {};
  if (!Array.isArray(data.content.problems)) data.content.problems = [];
  if (!Array.isArray(data.content.methods)) data.content.methods = [];
  if (!Array.isArray(data.content.domains)) data.content.domains = [];

  // Normalize problems
  data.content.problems = data.content.problems.slice(0, 5).map((prob, idx) => ({
    id: prob.id || `prob${idx + 1}`,
    title: prob.title || ["Root Finding", "ODE Solution", "Integration", "Optimization"][idx] || `Problem ${idx + 1}`,
    description: prob.description || `Numerical solution using ${prob.method || "computational method"}`,
    method: prob.method || ["Newton-Raphson", "Euler's Method", "Runge-Kutta", "Monte Carlo"][idx] || "Numerical Method",
    timeRequired: Math.max(5, Math.min(20, prob.timeRequired || 10)),
    equation: prob.equation || `x_{${idx+1}} = y_{${idx+1}}^2 + c`,
    parameters: prob.parameters || {
      "Parameter 1": [1, 2, 3],
      "Parameter 2": [0.1, 0.2, 0.3]
    },
    steps: Array.isArray(prob.steps) 
      ? prob.steps.slice(0, 6).map((step, i) => ({
          step: step.step || i + 1,
          equation: step.equation || `step_{${i+1}} = equation_{${i+1}}`,
          explanation: step.explanation || "Computational step explanation"
        }))
      : [],
    solution: prob.solution || `${(Math.random() * 10).toFixed(3)} ± 0.01`,
    accuracy: prob.accuracy || "0.01"
  }));

  // Normalize methods
  data.content.methods = data.content.methods.slice(0, 5).map((method, idx) => ({
    name: method.name || ["Finite Difference", "Gaussian Elimination", "Simpson's Rule", "Linear Regression"][idx] || `Method ${idx + 1}`,
    examples: Array.isArray(method.examples) 
      ? method.examples.slice(0, 3)
      : ["Example application 1", "Real-world use case"]
  }));

  // Normalize domains
  data.content.domains = data.content.domains.slice(0, 4).map((domain, idx) => ({
    name: domain.name || ["Physics", "Engineering", "Finance", "Biology"][idx] || `Domain ${idx + 1}`,
    problemCount: Math.max(1, Math.min(20, domain.problemCount || Math.floor(data.content.problems.length / 2)))
  }));

  return data;
}

// Helper function for data validation
function validateModuleStructure(data) {
  // Ensure required top-level fields
  if (!data.id) data.id = `module_${Date.now()}`;
  if (!data.title) data.title = "JEE Physics Module";
  if (!data.description) data.description = "Comprehensive JEE preparation module";
  if (!data.subject) data.subject = "Physics";
  if (!data.level) data.level = "Advanced";

  // Ensure content structure
  if (!data.content) data.content = {};
  if (!Array.isArray(data.content.problems)) data.content.problems = [];
  if (!Array.isArray(data.content.topics)) data.content.topics = [];

  // Normalize problems
  data.content.problems = data.content.problems.slice(0, 5).map((prob, idx) => ({
    id: prob.id || `prob${idx + 1}`,
    topic: prob.topic || ["Mechanics", "Electrodynamics", "Thermodynamics", "Optics"][idx] || "Physics",
    difficulty: ["Easy", "Medium", "Hard"][idx % 3] || "Medium",
    year: prob.year || `JEE ${2020 + (idx % 4)}`,
    marks: Math.max(1, Math.min(12, prob.marks || 4)),
    timeRequired: Math.max(5, Math.min(20, prob.timeRequired || 10)),
    question: prob.question || `A JEE-level problem about ${prob.topic || "physics"}...`,
    solution: prob.solution || "Step 1: Apply relevant concept\nStep 2: Solve equation\nStep 3: Verify solution",
    similarProblems: Array.isArray(prob.similarProblems) 
      ? prob.similarProblems.slice(0, 3)
      : [`Similar ${prob.topic || "physics"} problem`, "Related conceptual question"]
  }));

  // Normalize topics
  data.content.topics = data.content.topics.slice(0, 4).map((topic, idx) => ({
    name: topic.name || ["Mechanics", "Electrodynamics", "Modern Physics", "Thermodynamics"][idx] || `Topic ${idx + 1}`,
    problemCount: Math.max(1, Math.min(10, topic.problemCount || data.content.problems.length / 2)),
    weightage: Math.max(5, Math.min(100, topic.weightage || (100 / (idx + 1))))
  }));

  // Normalize weightage sum
  const totalWeightage = data.content.topics.reduce((sum, topic) => sum + topic.weightage, 0);
  if (totalWeightage !== 100) {
    data.content.topics.forEach(topic => {
      topic.weightage = Math.round((topic.weightage / totalWeightage) * 100);
    });
  }

  return data;
}

module.exports = PCMRouter;