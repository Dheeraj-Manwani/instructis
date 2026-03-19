const questions = [
    {
        text: "A particle moves with constant acceleration. If initial velocity is 5 m/s and acceleration is 2 m/s², what will be velocity after 5 seconds?",
        subject: "PHYSICS",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "Using v = u + at → v = 5 + 2×5 = 15 m/s"
    },
    {
        text: "Which of the following quantities is conserved in an elastic collision?",
        subject: "PHYSICS",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Momentum", isCorrect: true },
            { text: "Kinetic Energy", isCorrect: false },
            { text: "Potential Energy", isCorrect: false },
            { text: "Angular Momentum", isCorrect: false }
        ]
    },
    {
        text: "The SI unit of electric field is:",
        subject: "PHYSICS",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "N/C", isCorrect: true },
            { text: "Volt", isCorrect: false },
            { text: "Ampere", isCorrect: false },
            { text: "Tesla", isCorrect: false }
        ]
    },
    {
        text: "A capacitor of capacitance 2 µF is connected to 10V battery. Calculate charge stored.",
        subject: "PHYSICS",
        difficulty: "MODERATE",
        type: "NUMERICAL",
        explanation: "Q = CV → Q = 2×10⁻⁶ × 10 = 2×10⁻⁵ C"
    },
    {
        text: "Which of the following waves require a medium to propagate?",
        subject: "PHYSICS",
        difficulty: "EASY",
        type: "MULTI_CORRECT",
        options: [
            { text: "Sound waves", isCorrect: true },
            { text: "Light waves", isCorrect: false },
            { text: "Water waves", isCorrect: false },
            { text: "Radio waves", isCorrect: false }
        ]
    },

    {
        text: "Which quantum number determines the shape of orbital?",
        subject: "CHEMISTRY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Principal quantum number", isCorrect: false },
            { text: "Azimuthal quantum number", isCorrect: true },
            { text: "Magnetic quantum number", isCorrect: false },
            { text: "Spin quantum number", isCorrect: false }
        ]
    },
    {
        text: "pH of pure water at 25°C is:",
        subject: "CHEMISTRY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "7", isCorrect: true },
            { text: "0", isCorrect: false },
            { text: "14", isCorrect: false },
            { text: "1", isCorrect: false }
        ]
    },
    {
        text: "Which of the following are strong acids?",
        subject: "CHEMISTRY",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "HCl", isCorrect: true },
            { text: "H2SO4", isCorrect: false },
            { text: "CH3COOH", isCorrect: false },
            { text: "HNO3", isCorrect: false }
        ]
    },
    {
        text: "Number of moles in 44 g of CO₂:",
        subject: "CHEMISTRY",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "Moles = mass / molar mass → 44/44 = 1 mole"
    },
    {
        text: "Which of the following compounds exhibit hydrogen bonding?",
        subject: "CHEMISTRY",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "H2O", isCorrect: true },
            { text: "NH3", isCorrect: false },
            { text: "CH4", isCorrect: false },
            { text: "HF", isCorrect: false }
        ]
    },

    {
        text: "Derivative of sin(x) is:",
        subject: "MATHEMATICS",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "cos(x)", isCorrect: true },
            { text: "-sin(x)", isCorrect: false },
            { text: "-cos(x)", isCorrect: false },
            { text: "tan(x)", isCorrect: false }
        ]
    },
    {
        text: "Value of ∫0→1 x dx is:",
        subject: "MATHEMATICS",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "Integral = x²/2 from 0 to1 = 1/2"
    },
    {
        text: "Which of the following matrices are square matrices?",
        subject: "MATHEMATICS",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "2×2 matrix", isCorrect: true },
            { text: "3×3 matrix", isCorrect: false },
            { text: "2×3 matrix", isCorrect: false },
            { text: "3×2 matrix", isCorrect: false }
        ]
    },
    {
        text: "Slope of line passing through (1,2) and (3,6):",
        subject: "MATHEMATICS",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "(6-2)/(3-1) = 4/2 = 2"
    },
    {
        text: "Which of the following functions are continuous everywhere?",
        subject: "MATHEMATICS",
        difficulty: "HARD",
        type: "MULTI_CORRECT",
        options: [
            { text: "sin(x)", isCorrect: true },
            { text: "cos(x)", isCorrect: false },
            { text: "1/x", isCorrect: false },
            { text: "e^x", isCorrect: false }
        ]
    },

    {
        text: "The basic unit of life is:",
        subject: "ZOOLOGY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Cell", isCorrect: true },
            { text: "Tissue", isCorrect: false },
            { text: "Organ", isCorrect: false },
            { text: "Organism", isCorrect: false }
        ]
    },
    {
        text: "Which blood cells help in immunity?",
        subject: "ZOOLOGY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "RBC", isCorrect: false },
            { text: "WBC", isCorrect: true },
            { text: "Platelets", isCorrect: false },
            { text: "Plasma", isCorrect: false }
        ]
    },
    {
        text: "Which of the following are parts of the human digestive system?",
        subject: "ZOOLOGY",
        difficulty: "EASY",
        type: "MULTI_CORRECT",
        options: [
            { text: "Stomach", isCorrect: true },
            { text: "Small intestine", isCorrect: false },
            { text: "Lungs", isCorrect: false },
            { text: "Liver", isCorrect: false }
        ]
    },
    {
        text: "Normal human body temperature is:",
        subject: "ZOOLOGY",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "Approximately 37°C"
    },
    {
        text: "Which hormone regulates blood sugar level?",
        subject: "ZOOLOGY",
        difficulty: "MODERATE",
        type: "MCQ",
        options: [
            { text: "Insulin", isCorrect: true },
            { text: "Adrenaline", isCorrect: false },
            { text: "Thyroxine", isCorrect: false },
            { text: "Melatonin", isCorrect: false }
        ]
    },

    {
        text: "Photosynthesis occurs in:",
        subject: "BOTANY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Chloroplast", isCorrect: true },
            { text: "Mitochondria", isCorrect: false },
            { text: "Nucleus", isCorrect: false },
            { text: "Ribosome", isCorrect: false }
        ]
    },
    {
        text: "Which of the following are macronutrients for plants?",
        subject: "BOTANY",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "Nitrogen", isCorrect: true },
            { text: "Phosphorus", isCorrect: false },
            { text: "Potassium", isCorrect: false },
            { text: "Zinc", isCorrect: false }
        ]
    },
    {
        text: "Process of water movement through plant roots is called:",
        subject: "BOTANY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Osmosis", isCorrect: true },
            { text: "Diffusion", isCorrect: false },
            { text: "Transpiration", isCorrect: false },
            { text: "Respiration", isCorrect: false }
        ]
    },
    {
        text: "Which pigment is responsible for green color in plants?",
        subject: "BOTANY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Chlorophyll", isCorrect: true },
            { text: "Carotene", isCorrect: false },
            { text: "Xanthophyll", isCorrect: false },
            { text: "Anthocyanin", isCorrect: false }
        ]
    },
    {
        text: "Which of the following are plant hormones?",
        subject: "BOTANY",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "Auxin", isCorrect: true },
            { text: "Gibberellin", isCorrect: false },
            { text: "Cytokinin", isCorrect: false },
            { text: "Insulin", isCorrect: false }
        ]
    },
    {
        text: "A body moving with velocity 20 m/s comes to rest in 5 seconds. What is its acceleration?",
        subject: "PHYSICS",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "a = (v-u)/t = (0-20)/5 = -4 m/s²"
    },
    {
        text: "Which of the following are vector quantities?",
        subject: "PHYSICS",
        difficulty: "EASY",
        type: "MULTI_CORRECT",
        options: [
            { text: "Velocity", isCorrect: true },
            { text: "Force", isCorrect: false },
            { text: "Speed", isCorrect: false },
            { text: "Acceleration", isCorrect: false }
        ]
    },
    {
        text: "Unit of magnetic flux is:",
        subject: "PHYSICS",
        difficulty: "MODERATE",
        type: "MCQ",
        options: [
            { text: "Tesla", isCorrect: false },
            { text: "Weber", isCorrect: true },
            { text: "Henry", isCorrect: false },
            { text: "Ampere", isCorrect: false }
        ]
    },
    {
        text: "Which of the following are applications of Bernoulli’s principle?",
        subject: "PHYSICS",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "Aeroplane wings lift", isCorrect: true },
            { text: "Venturimeter", isCorrect: false },
            { text: "Hydraulic press", isCorrect: false },
            { text: "Atomizer spray", isCorrect: false }
        ]
    },
    {
        text: "Momentum of a body of mass 2 kg moving with velocity 3 m/s:",
        subject: "PHYSICS",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "p = mv = 2 × 3 = 6 kg m/s"
    },

    {
        text: "Avogadro number is approximately:",
        subject: "CHEMISTRY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "6.022 × 10²³", isCorrect: true },
            { text: "3 × 10⁸", isCorrect: false },
            { text: "9.8", isCorrect: false },
            { text: "1.6 × 10⁻¹⁹", isCorrect: false }
        ]
    },
    {
        text: "Which of the following are noble gases?",
        subject: "CHEMISTRY",
        difficulty: "EASY",
        type: "MULTI_CORRECT",
        options: [
            { text: "Helium", isCorrect: true },
            { text: "Neon", isCorrect: false },
            { text: "Argon", isCorrect: false },
            { text: "Nitrogen", isCorrect: false }
        ]
    },
    {
        text: "Molar mass of NaCl:",
        subject: "CHEMISTRY",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "Na = 23, Cl = 35.5 → total ≈ 58.5 g/mol"
    },
    {
        text: "Which of the following are exothermic reactions?",
        subject: "CHEMISTRY",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "Combustion of methane", isCorrect: true },
            { text: "Neutralization reaction", isCorrect: false },
            { text: "Photosynthesis", isCorrect: false },
            { text: "Respiration", isCorrect: false }
        ]
    },
    {
        text: "Which element has atomic number 6?",
        subject: "CHEMISTRY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Carbon", isCorrect: true },
            { text: "Oxygen", isCorrect: false },
            { text: "Nitrogen", isCorrect: false },
            { text: "Hydrogen", isCorrect: false }
        ]
    },

    {
        text: "Value of sin(90°):",
        subject: "MATHEMATICS",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "sin 90° = 1"
    },
    {
        text: "Which of the following are even functions?",
        subject: "MATHEMATICS",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "cos(x)", isCorrect: true },
            { text: "x²", isCorrect: false },
            { text: "sin(x)", isCorrect: false },
            { text: "x³", isCorrect: false }
        ]
    },
    {
        text: "Determinant of identity matrix of order 3:",
        subject: "MATHEMATICS",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "Determinant of identity matrix = 1"
    },
    {
        text: "Which of the following are trigonometric identities?",
        subject: "MATHEMATICS",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "sin²x + cos²x = 1", isCorrect: true },
            { text: "1 + tan²x = sec²x", isCorrect: false },
            { text: "sinx + cosx = 1", isCorrect: false },
            { text: "tanx = sinx/cosx", isCorrect: false }
        ]
    },
    {
        text: "Distance between points (0,0) and (3,4):",
        subject: "MATHEMATICS",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "√(3²+4²) = 5"
    },

    {
        text: "Which organ pumps blood in the human body?",
        subject: "ZOOLOGY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Heart", isCorrect: true },
            { text: "Lungs", isCorrect: false },
            { text: "Kidney", isCorrect: false },
            { text: "Brain", isCorrect: false }
        ]
    },
    {
        text: "Which of the following are components of blood?",
        subject: "ZOOLOGY",
        difficulty: "EASY",
        type: "MULTI_CORRECT",
        options: [
            { text: "RBC", isCorrect: true },
            { text: "WBC", isCorrect: false },
            { text: "Platelets", isCorrect: false },
            { text: "Neurons", isCorrect: false }
        ]
    },
    {
        text: "Normal human heartbeat per minute (approx):",
        subject: "ZOOLOGY",
        difficulty: "EASY",
        type: "NUMERICAL",
        explanation: "About 72 beats per minute"
    },
    {
        text: "Which vitamin is produced in skin by sunlight?",
        subject: "ZOOLOGY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Vitamin D", isCorrect: true },
            { text: "Vitamin A", isCorrect: false },
            { text: "Vitamin C", isCorrect: false },
            { text: "Vitamin B12", isCorrect: false }
        ]
    },
    {
        text: "Which organs are part of the respiratory system?",
        subject: "ZOOLOGY",
        difficulty: "EASY",
        type: "MULTI_CORRECT",
        options: [
            { text: "Lungs", isCorrect: true },
            { text: "Trachea", isCorrect: false },
            { text: "Bronchi", isCorrect: false },
            { text: "Kidney", isCorrect: false }
        ]
    },

    {
        text: "Which part of plant performs photosynthesis?",
        subject: "BOTANY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Leaf", isCorrect: true },
            { text: "Root", isCorrect: false },
            { text: "Stem", isCorrect: false },
            { text: "Flower", isCorrect: false }
        ]
    },
    {
        text: "Which of the following are types of plant tissues?",
        subject: "BOTANY",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "Xylem", isCorrect: true },
            { text: "Phloem", isCorrect: false },
            { text: "Parenchyma", isCorrect: false },
            { text: "Neuron", isCorrect: false }
        ]
    },
    {
        text: "Gas released during photosynthesis:",
        subject: "BOTANY",
        difficulty: "EASY",
        type: "MCQ",
        options: [
            { text: "Oxygen", isCorrect: true },
            { text: "Carbon dioxide", isCorrect: false },
            { text: "Nitrogen", isCorrect: false },
            { text: "Hydrogen", isCorrect: false }
        ]
    },
    {
        text: "Which pigment absorbs maximum light for photosynthesis?",
        subject: "BOTANY",
        difficulty: "MODERATE",
        type: "MCQ",
        options: [
            { text: "Chlorophyll a", isCorrect: true },
            { text: "Carotene", isCorrect: false },
            { text: "Xanthophyll", isCorrect: false },
            { text: "Anthocyanin", isCorrect: false }
        ]
    },
    {
        text: "Which of the following are plant macromolecules?",
        subject: "BOTANY",
        difficulty: "MODERATE",
        type: "MULTI_CORRECT",
        options: [
            { text: "Proteins", isCorrect: true },
            { text: "Carbohydrates", isCorrect: false },
            { text: "Lipids", isCorrect: false },
            { text: "Water", isCorrect: false }
        ]
    }
];

export default questions;