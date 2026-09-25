import { Question } from '../types';
import { generateDiagramSvg } from './diagramRenderer';

export const INITIAL_QUESTIONS: Question[] = [
  // QUESTION 1: Physics - Text Only (JEE Main / NEET Modern Physics)
  {
    id: 'q-phys-text-01',
    subject: 'Physics',
    topic: 'Modern Physics',
    subtopic: 'Photoelectric Effect & Einstein Equation',
    difficulty: 'JEE Main',
    questionType: 'mcq_single',
    questionText: 'When ultraviolet light of wavelength $\\lambda = 200\\text{ nm}$ is incident on a clean metallic photosurface, the stopping potential measured for emitted photoelectrons is $V_0 = 3.8\\text{ V}$. When the wavelength is increased to $\\lambda\' = 300\\text{ nm}$, what is the new stopping potential $V_0\'$? Take $hc = 1240\\text{ eV}\\cdot\\text{nm}$.',
    requiresDiagram: false,
    diagramType: 'none',
    diagram: null,
    options: [
      { id: 'opt-t1-1', label: 'A', text: 'V_0\' = 1.73 V', isCorrect: true },
      { id: 'opt-t1-2', label: 'B', text: 'V_0\' = 2.45 V', isCorrect: false },
      { id: 'opt-t1-3', label: 'C', text: 'V_0\' = 0.95 V', isCorrect: false },
      { id: 'opt-t1-4', label: 'D', text: 'V_0\' = 3.10 V', isCorrect: false },
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: Energy of the first photon: E_1 = hc / \\lambda_1 = 1240 eV·nm / 200 nm = 6.20 eV.',
        'Step 2: Using Einstein\'s photoelectric equation: eV_0 = E_1 - \\Phi \\implies \\Phi = E_1 - eV_0 = 6.20 eV - 3.80 eV = 2.40 eV (Work function).',
        'Step 3: Energy of the second incident photon: E_2 = hc / \\lambda_2 = 1240 eV·nm / 300 nm = 4.133 eV.',
        'Step 4: New stopping potential: eV_0\' = E_2 - \\Phi = 4.133 eV - 2.40 eV = 1.733 eV \\implies V_0\' \\approx 1.73 V.'
      ],
      finalAnswer: 'V_0\' = 1.73 V (Option A)',
      conceptFormula: 'eV_0 = \\frac{hc}{\\lambda} - \\Phi; \\quad \\Phi = E - eV_0',
      diagramInsight: 'Purely theoretical energy balance problem; no circuit or ray diagram is necessary.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 52,
      discriminationIndex: 0.68,
      expectedAccuracyRate: 59,
      rankImpact: 'Moderate',
      topicWeightage: 'Standard JEE Main (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-modern-1',
          title: 'Dual Nature of Matter and Radiation: Photoelectric Equation',
          source: 'NCERT Physics Class 12, Chapter 11',
          snippet: 'Einstein explained photoelectric emission using photon quantum hypothesis: K_max = eV0 = h nu - Phi...',
          relevanceScore: 0.97,
        }
      ],
      similarQuestionRef: 'JEE Main 2023 Shift 2'
    },
    createdAt: '2026-09-04T10:00:00.000Z'
  },

  // QUESTION 2: Physics - Text + Diagram (Current Electricity Resistor Bridge)
  {
    id: 'q-phys-diag-01',
    subject: 'Physics',
    topic: 'Current Electricity',
    subtopic: 'Parallel-Series Resistor Networks',
    difficulty: 'JEE Main',
    questionType: 'mcq_single',
    questionText: 'In the circuit diagram shown below, two resistors $R_1 = 6\\ \\Omega$ and $R_2 = 12\\ \\Omega$ are connected in parallel between Node A and Node B. This parallel combination is connected in series with resistor $R_3 = 4\\ \\Omega$ across a DC voltage source of $V = 24\\text{ V}$. Calculate the total electric current supplied by the battery and the potential difference $V_{AB}$ across the parallel combination.',
    requiresDiagram: true,
    diagramType: 'circuit',
    diagram: generateDiagramSvg('circuit', { r1: '6 Ω', r2: '12 Ω', r3: '4 Ω', voltage: '24 V' }),
    options: [
      { id: 'opt-1', label: 'A', text: 'I = 2.0 A, V_{AB} = 8.0 V', isCorrect: false },
      { id: 'opt-2', label: 'B', text: 'I = 3.0 A, V_{AB} = 12.0 V', isCorrect: true },
      { id: 'opt-3', label: 'C', text: 'I = 4.0 A, V_{AB} = 16.0 V', isCorrect: false },
      { id: 'opt-4', label: 'D', text: 'I = 2.5 A, V_{AB} = 10.0 V', isCorrect: false }
    ],
    correctAnswer: 'B',
    solution: {
      stepByStep: [
        'Step 1: Calculate equivalent resistance of parallel branch: 1/R_{AB} = 1/6 + 1/12 = 3/12 = 1/4 \\implies R_{AB} = 4\\ \\Omega.',
        'Step 2: Total equivalent resistance: R_{total} = R_{AB} + R_3 = 4\\ \\Omega + 4\\ \\Omega = 8\\ \\Omega.',
        'Step 3: Total circuit current: I_{total} = V / R_{total} = 24\\text{ V} / 8\\ \\Omega = 3.0\\text{ A}.',
        'Step 4: Potential difference across Node A and B: V_{AB} = I_{total} \\times R_{AB} = 3.0\\text{ A} \\times 4\\ \\Omega = 12.0\\text{ V}.'
      ],
      finalAnswer: 'I = 3.0 A, V_{AB} = 12.0 V (Option B)',
      conceptFormula: 'R_{eq} = \\frac{R_1 R_2}{R_1 + R_2}; \\quad I = \\frac{V}{R_{eq} + R_3}',
      diagramInsight: 'Node A and Node B junction divides the 3.0 A current into 2.0 A through R1 and 1.0 A through R2, adhering to KCL.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 58,
      discriminationIndex: 0.65,
      expectedAccuracyRate: 62,
      rankImpact: 'Moderate',
      topicWeightage: 'High (8-12 marks in JEE Main Paper 1)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-1',
          title: 'Current Electricity: Kirchhoff’s Laws and Resistor Networks',
          source: 'NCERT Physics Class 12, Chapter 3',
          snippet: 'When resistors are connected in parallel, equivalent resistance satisfies 1/R = 1/R1 + 1/R2...',
          relevanceScore: 0.94,
          diagramType: 'circuit'
        }
      ],
      similarQuestionRef: 'JEE Main 2022 Session 1'
    },
    createdAt: '2026-09-04T12:00:00.000Z'
  },

  // QUESTION 3: Physics - Text + Diagram (Mechanics Inclined Plane & Pulley Constraint)
  {
    id: 'q-phys-diag-02',
    subject: 'Physics',
    topic: 'Laws of Motion & Friction',
    subtopic: 'Inclined Plane Pulley Constraint',
    difficulty: 'JEE Advanced',
    questionType: 'mcq_single',
    questionText: 'A block of mass $m_1 = 5\\text{ kg}$ rests on a rough inclined plane of inclination $\\theta = 30^\\circ$ with coefficient of kinetic friction $\\mu = 0.2$. It is connected via a lightweight inextensible cord over a frictionless pulley to a hanging mass $m_2 = 3\\text{ kg}$ as illustrated in the figure. Taking $g = 10\\text{ m/s}^2$ and $\\sqrt{3} \\approx 1.732$, determine the magnitude of acceleration of the system when released from rest.',
    requiresDiagram: true,
    diagramType: 'mechanics_fbd',
    diagram: generateDiagramSvg('mechanics_fbd', { theta: '30°', m1: '5 kg', m2: '3 kg', mu: '0.2' }),
    options: [
      { id: 'opt-21', label: 'A', text: 'a = 0.46 m/s²', isCorrect: false },
      { id: 'opt-22', label: 'B', text: 'a = 0.82 m/s²', isCorrect: false },
      { id: 'opt-23', label: 'C', text: 'a = 0.58 m/s²', isCorrect: false },
      { id: 'opt-24', label: 'D', text: '0 (Block remains at rest due to static friction)', isCorrect: true }
    ],
    correctAnswer: 'D',
    solution: {
      stepByStep: [
        'Step 1: Normal force on m_1: N = m_1 g \\cos 30^\\circ = 5 \\times 10 \\times (\\sqrt{3}/2) \\approx 43.30\\text{ N}.',
        'Step 2: Component of gravity along incline: F_{g1} = m_1 g \\sin 30^\\circ = 5 \\times 10 \\times 0.5 = 25.0\\text{ N}.',
        'Step 3: Downward tension force from hanging mass: F_{g2} = m_2 g = 3 \\times 10 = 30.0\\text{ N}.',
        'Step 4: Net driving force pulling m_1 upwards: F_{drive} = 30.0 - 25.0 = 5.0\\text{ N}.',
        'Step 5: Maximum limiting static friction: f_{max} = \\mu N = 0.2 \\times 43.30 = 8.66\\text{ N}.',
        'Step 6: Since driving force (5.0 N) < f_{max} (8.66 N), static friction self-adjusts to 5.0 N. System remains at rest: a = 0.'
      ],
      finalAnswer: 'The system does not accelerate; a = 0 m/s² (Option D)',
      conceptFormula: 'f_{max} = \\mu m_1 g \\cos \\theta; \\quad \\text{Condition for motion: } |m_2 g - m_1 g \\sin \\theta| > f_{max}',
      diagramInsight: 'Classic JEE Advanced conceptual trap testing static friction equilibrium vs dynamic formula.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 84,
      discriminationIndex: 0.88,
      expectedAccuracyRate: 31,
      rankImpact: 'Critical Filter',
      topicWeightage: 'Core JEE Advanced Mechanics'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-2',
          title: 'Laws of Motion & Friction: Inclined Plane Mechanics',
          source: 'Concepts of Physics (HC Verma Vol 1)',
          snippet: 'When testing whether a block accelerates on an incline, one must verify if the unbalance exceeds static threshold...',
          relevanceScore: 0.96,
          diagramType: 'mechanics_fbd'
        }
      ],
      similarQuestionRef: 'JEE Advanced 2021 Paper 2'
    },
    createdAt: '2026-09-04T12:05:00.000Z'
  },

  // QUESTION 4: Chemistry - Text Only (NEET & JEE Chemical Kinetics)
  {
    id: 'q-chem-text-01',
    subject: 'Chemistry',
    topic: 'Chemical Kinetics',
    subtopic: 'First Order Kinetics & Arrhenius Activation Energy',
    difficulty: 'NEET',
    questionType: 'mcq_single',
    questionText: 'For a first-order chemical reaction $A \\rightarrow \\text{Products}$, the half-life period $t_{1/2}$ is $20\\text{ minutes}$. What is the time required for $87.5\\%$ of the reactant $A$ to be completely decomposed?',
    requiresDiagram: false,
    diagramType: 'none',
    diagram: null,
    options: [
      { id: 'opt-ct-1', label: 'A', text: '40 minutes', isCorrect: false },
      { id: 'opt-ct-2', label: 'B', text: '60 minutes', isCorrect: true },
      { id: 'opt-ct-3', label: 'C', text: '80 minutes', isCorrect: false },
      { id: 'opt-ct-4', label: 'D', text: '100 minutes', isCorrect: false }
    ],
    correctAnswer: 'B',
    solution: {
      stepByStep: [
        'Step 1: If 87.5% of reactant A has decomposed, the amount remaining is: [A]_t = 100% - 87.5% = 12.5% = 1/8 of original [A]_0.',
        'Step 2: Recognize that (1/2)^n = 1/8 = (1/2)^3. Thus, the reaction has undergone exactly n = 3 half-lives.',
        'Step 3: Total time required: t = n \\times t_{1/2} = 3 \\times 20\\text{ minutes} = 60\\text{ minutes}.'
      ],
      finalAnswer: 'Time required = 60 minutes (Option B)',
      conceptFormula: '[A]_t = [A]_0 \\left(\\frac{1}{2}\\right)^n; \\quad t = n \\times t_{1/2}',
      diagramInsight: 'Standard exponential decay without visual plot requirement.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 42,
      discriminationIndex: 0.60,
      expectedAccuracyRate: 74,
      rankImpact: 'High',
      topicWeightage: 'Guaranteed NEET Question (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-kinetics-1',
          title: 'Chemical Kinetics: Integrated Rate Laws',
          source: 'NCERT Chemistry Class 12, Chapter 4',
          snippet: 'For first order reactions, half-life is independent of initial concentration...',
          relevanceScore: 0.93
        }
      ],
      similarQuestionRef: 'NEET 2022'
    },
    createdAt: '2026-09-04T12:08:00.000Z'
  },

  // QUESTION 5: Chemistry - Text + Diagram (Organic Nitration of Benzene)
  {
    id: 'q-chem-diag-01',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    subtopic: 'Arenes & Electrophilic Aromatic Substitution',
    difficulty: 'NEET',
    questionType: 'mcq_single',
    questionText: 'In the reaction scheme depicted below, benzene is treated with a mixture of concentrated $\\text{HNO}_3$ and concentrated $\\text{H}_2\\text{SO}_4$ at $50^\\circ\\text{C}-60^\\circ\\text{C}$ to produce nitrobenzene. What is the active attacking electrophile and what role is played by concentrated $\\text{HNO}_3$ in this transformation?',
    requiresDiagram: true,
    diagramType: 'chemistry_organic',
    diagram: generateDiagramSvg('chemistry_organic', { reagent: 'HNO₃ / H₂SO₄', compound: 'Nitrobenzene' }),
    options: [
      { id: 'opt-31', label: 'A', text: 'Electrophile: NO₂⁺ (Nitronium ion); HNO₃ acts as a Bronsted base', isCorrect: true },
      { id: 'opt-32', label: 'B', text: 'Electrophile: NO₂⁻ (Nitrite ion); HNO₃ acts as a Bronsted acid', isCorrect: false },
      { id: 'opt-33', label: 'C', text: 'Electrophile: NO⁺ (Nitrosonium ion); HNO₃ acts as an oxidizer', isCorrect: false },
      { id: 'opt-34', label: 'D', text: 'Electrophile: HNO₂; HNO₃ acts as a catalyst', isCorrect: false }
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: H₂SO₄ is a stronger acid than HNO₃ and protonates the hydroxyl group of nitric acid: HNO₃ + H₂SO₄ ⇌ H₂O⁺-NO₂ + HSO₄⁻.',
        'Step 2: Protonated nitric acid loses H₂O to form the linear nitronium ion (NO₂⁺), which serves as the active electrophile.',
        'Step 3: Because HNO₃ accepts a proton from H₂SO₄, it acts as a Bronsted-Lowry base in this reaction.',
        'Step 4: The NO₂⁺ ion attacks the aromatic ring to form nitrobenzene.'
      ],
      finalAnswer: 'Electrophile: NO₂⁺; HNO₃ acts as a Bronsted base (Option A)',
      conceptFormula: '\\text{HNO}_3 + 2\\text{H}_2\\text{SO}_4 \\rightleftharpoons \\text{NO}_2^+ + \\text{H}_3\\text{O}^+ + 2\\text{HSO}_4^-',
      diagramInsight: 'Reaction diagram exhibits the substitution of an aromatic C-H bond with the -NO₂ functional group.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 50,
      discriminationIndex: 0.72,
      expectedAccuracyRate: 68,
      rankImpact: 'High',
      topicWeightage: 'Frequent NEET question (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-3',
          title: 'Arenes: Nitration Mechanism of Benzene',
          source: 'NCERT Chemistry Class 11 & 12',
          snippet: 'Nitration requires concentrated nitric and sulfuric acids...',
          relevanceScore: 0.95,
          diagramType: 'chemistry_organic'
        }
      ],
      similarQuestionRef: 'NEET 2020 / AIPMT'
    },
    createdAt: '2026-09-04T12:10:00.000Z'
  },

  // QUESTION 6: Mathematics - Text Only (JEE Advanced Definite Integral)
  {
    id: 'q-math-text-01',
    subject: 'Mathematics',
    topic: 'Integral Calculus',
    subtopic: 'Definite Integrals & King\'s Symmetry Property',
    difficulty: 'JEE Advanced',
    questionType: 'mcq_single',
    questionText: 'Evaluate the definite integral: $$I = \\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x}\\ dx$$',
    requiresDiagram: false,
    diagramType: 'none',
    diagram: null,
    options: [
      { id: 'opt-mt-1', label: 'A', text: '\\pi / 4', isCorrect: true },
      { id: 'opt-mt-2', label: 'B', text: '\\pi / 2', isCorrect: false },
      { id: 'opt-mt-3', label: 'C', text: '\\pi / 8', isCorrect: false },
      { id: 'opt-mt-4', label: 'D', text: '1', isCorrect: false }
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: Use King\'s property: \\int_0^a f(x) dx = \\int_0^a f(a - x) dx.',
        'Step 2: Replace x with (\\pi/2 - x): I = \\int_0^{\\pi/2} \\frac{\\cos^3 x}{\\cos^3 x + \\sin^3 x}\\ dx.',
        'Step 3: Add the two equations: 2I = \\int_0^{\\pi/2} \\frac{\\sin^3 x + \\cos^3 x}{\\sin^3 x + \\cos^3 x}\\ dx = \\int_0^{\\pi/2} 1\\ dx = \\frac{\\pi}{2}.',
        'Step 4: Solving for I yields: I = \\frac{\\pi}{4}.'
      ],
      finalAnswer: 'I = \\pi / 4 (Option A)',
      conceptFormula: '\\int_a^b f(x) dx = \\int_a^b f(a + b - x) dx',
      diagramInsight: 'Classic definite integral symmetry problem solved algebraically without area sketch.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 65,
      discriminationIndex: 0.70,
      expectedAccuracyRate: 54,
      rankImpact: 'High',
      topicWeightage: 'Standard JEE Advanced Integral Calculus'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-math-1',
          title: 'Definite Integrals: Fundamental Properties',
          source: 'NCERT Mathematics Class 12, Chapter 7',
          snippet: 'Property 4 states integral from 0 to a of f(x) equals integral from 0 to a of f(a-x)...',
          relevanceScore: 0.98
        }
      ],
      similarQuestionRef: 'JEE Advanced 2019'
    },
    createdAt: '2026-09-04T12:15:00.000Z'
  },

  // QUESTION 7: Mathematics - Text + Diagram (Ray Optics / Geometry)
  {
    id: 'q-math-diag-01',
    subject: 'Physics',
    topic: 'Ray Optics',
    subtopic: 'Convex Lens Image Formation',
    difficulty: 'JEE Main',
    questionType: 'mcq_single',
    questionText: 'An illuminated object of height $h = 2\\text{ cm}$ is placed at a distance $u = -30\\text{ cm}$ in front of a thin converging convex lens of focal length $f = +20\\text{ cm}$ as depicted in the ray diagram below. Determine the position $v$, height $h\'$, and nature of the image formed.',
    requiresDiagram: true,
    diagramType: 'ray_optics',
    diagram: generateDiagramSvg('ray_optics', { f: '20 cm', u: '30 cm', v: '60 cm' }),
    options: [
      { id: 'opt-ro-1', label: 'A', text: 'v = +60 cm, h\' = -4 cm (Real, inverted, magnified)', isCorrect: true },
      { id: 'opt-ro-2', label: 'B', text: 'v = +30 cm, h\' = -2 cm (Real, inverted, same size)', isCorrect: false },
      { id: 'opt-ro-3', label: 'C', text: 'v = -60 cm, h\' = +4 cm (Virtual, erect, magnified)', isCorrect: false },
      { id: 'opt-ro-4', label: 'D', text: 'v = +45 cm, h\' = -3 cm (Real, inverted, magnified)', isCorrect: false }
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: Apply thin lens formula: 1/f = 1/v - 1/u.',
        'Step 2: Substitute sign conventions: f = +20 cm, u = -30 cm: 1/v = 1/20 + 1/(-30) = 3/60 - 2/60 = 1/60 \\implies v = +60 cm.',
        'Step 3: Transverse magnification: m = v / u = (+60) / (-30) = -2.',
        'Step 4: Height of image: h\' = m \\times h = (-2) \\times 2 cm = -4 cm. Real and inverted.'
      ],
      finalAnswer: 'v = +60 cm, h\' = -4 cm (Option A)',
      conceptFormula: '\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}; \\quad m = \\frac{h\'}{h} = \\frac{v}{u}',
      diagramInsight: 'Ray passing through the optical center continues undeviated while ray parallel to principal axis passes through second focal point F₂.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 56,
      discriminationIndex: 0.64,
      expectedAccuracyRate: 64,
      rankImpact: 'Moderate',
      topicWeightage: 'Standard JEE Main Ray Optics (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-optics-1',
          title: 'Ray Optics: Refraction Through Spherical Lenses',
          source: 'NCERT Physics Class 12, Chapter 9',
          snippet: 'Applying Cartesian sign conventions to the lens equation yields real images on positive side...',
          relevanceScore: 0.96,
          diagramType: 'ray_optics'
        }
      ],
      similarQuestionRef: 'JEE Main 2021 Shift 1'
    },
    createdAt: '2026-09-04T12:20:00.000Z'
  },

  // QUESTION 8: Biology - Text Only (NEET Molecular Genetics)
  {
    id: 'q-bio-text-01',
    subject: 'Biology',
    topic: 'Molecular Genetics',
    subtopic: 'DNA Replication Enzymes & Okazaki Fragments',
    difficulty: 'NEET',
    questionType: 'mcq_single',
    questionText: 'During semi-conservative DNA replication in prokaryotes, which enzyme is specifically responsible for unwinding the double helix at the replication fork, and which enzyme joins the discontinuous Okazaki fragments synthesized on the lagging strand?',
    requiresDiagram: false,
    diagramType: 'none',
    diagram: null,
    options: [
      { id: 'opt-bt-1', label: 'A', text: 'Unwinding: DNA Helicase; Joining: DNA Ligase', isCorrect: true },
      { id: 'opt-bt-2', label: 'B', text: 'Unwinding: Topoisomerase; Joining: DNA Polymerase I', isCorrect: false },
      { id: 'opt-bt-3', label: 'C', text: 'Unwinding: DNA Primase; Joining: DNA Ligase', isCorrect: false },
      { id: 'opt-bt-4', label: 'D', text: 'Unwinding: DNA Polymerase III; Joining: RNA Primase', isCorrect: false }
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: DNA Helicase breaks hydrogen bonds between nitrogenous base pairs, unwinding the parental double helix at the replication fork.',
        'Step 2: DNA Polymerase III synthesizes continuous DNA on the leading strand and discontinuous Okazaki fragments on the lagging strand.',
        'Step 3: DNA Ligase catalyzes the formation of phosphodiester bonds to seal nicks between adjacent Okazaki fragments on the lagging strand.'
      ],
      finalAnswer: 'Unwinding: DNA Helicase; Joining: DNA Ligase (Option A)',
      conceptFormula: '\\text{DNA Helicase (Unwinds)} + \\text{DNA Polymerase III (Synthesizes)} + \\text{DNA Ligase (Seals)}',
      diagramInsight: 'Purely biochemical enzyme function question testing NCERT Chapter 6 recall.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 38,
      discriminationIndex: 0.58,
      expectedAccuracyRate: 82,
      rankImpact: 'High',
      topicWeightage: 'Core NEET Biology (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-bio-1',
          title: 'Molecular Basis of Inheritance: Replication Machinery',
          source: 'NCERT Biology Class 12, Chapter 6',
          snippet: 'DNA ligase joins Okazaki fragments, while helicase unwinds the double stranded DNA helix...',
          relevanceScore: 0.99
        }
      ],
      similarQuestionRef: 'NEET 2023'
    },
    createdAt: '2026-09-04T12:25:00.000Z'
  },

  // QUESTION 9: Physics - Text + Diagram (Thermodynamic Indicator P-V Cycle)
  {
    id: 'q-phys-diag-03',
    subject: 'Physics',
    topic: 'Thermodynamics',
    subtopic: 'Cyclic Processes & Work Done',
    difficulty: 'JEE Main',
    questionType: 'mcq_single',
    questionText: 'An ideal monatomic gas is taken through a cyclic thermodynamic process $A \\rightarrow B \\rightarrow C \\rightarrow D \\rightarrow A$ as shown in the indicator $P-V$ diagram. The states are given by $P_A = P_B = 300\\text{ kPa}$, $P_C = P_D = 100\\text{ kPa}$, $V_A = V_D = 2.0\\text{ m}^3$, and $V_B = V_C = 5.0\\text{ m}^3$. Calculate the net mechanical work performed by the gas during one complete clockwise cycle.',
    requiresDiagram: true,
    diagramType: 'thermo_pv',
    diagram: generateDiagramSvg('thermo_pv', { p1: '100 kPa', p2: '300 kPa', v1: '2.0 m³', v2: '5.0 m³' }),
    options: [
      { id: 'opt-pv-1', label: 'A', text: 'W_{net} = +600 kJ', isCorrect: true },
      { id: 'opt-pv-2', label: 'B', text: 'W_{net} = -600 kJ', isCorrect: false },
      { id: 'opt-pv-3', label: 'C', text: 'W_{net} = +300 kJ', isCorrect: false },
      { id: 'opt-pv-4', label: 'D', text: 'W_{net} = +900 kJ', isCorrect: false }
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: Work done in a cyclic process equals the enclosed area on the P-V indicator diagram.',
        'Step 2: Area of rectangle = \\Delta P \\times \\Delta V = (P_{top} - P_{bottom}) \\times (V_{right} - V_{left}).',
        'Step 3: \\Delta P = 300\\text{ kPa} - 100\\text{ kPa} = 200\\text{ kPa} = 200 \\times 10^3\\text{ N/m}^2.',
        'Step 4: \\Delta V = 5.0\\text{ m}^3 - 2.0\\text{ m}^3 = 3.0\\text{ m}^3.',
        'Step 5: W_{net} = 200 \\times 10^3 \\times 3.0 = 600 \\times 10^3\\text{ J} = +600\\text{ kJ}. Clockwise loop implies positive work.'
      ],
      finalAnswer: 'W_{net} = +600 kJ (Option A)',
      conceptFormula: 'W_{\\text{cycle}} = \\oint P\\ dV = \\text{Area of closed loop}',
      diagramInsight: 'Clockwise progression on P-V diagram indicates engine doing positive net external work.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 48,
      discriminationIndex: 0.62,
      expectedAccuracyRate: 70,
      rankImpact: 'Moderate',
      topicWeightage: 'Standard JEE Main (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-thermo-1',
          title: 'Thermodynamics: Indicator Diagrams and Cycles',
          source: 'NCERT Physics Class 11, Chapter 12',
          snippet: 'The work done by the gas in a cyclic process is equal to the area enclosed by the cycle...',
          relevanceScore: 0.97,
          diagramType: 'thermo_pv'
        }
      ],
      similarQuestionRef: 'JEE Main 2022'
    },
    createdAt: '2026-09-04T12:30:00.000Z'
  },

  // QUESTION 10: Physics - Text Only (Thermodynamics / Kinetic Theory)
  {
    id: 'q-phys-text-02',
    subject: 'Physics',
    topic: 'Thermodynamics',
    subtopic: 'Molar Specific Heat & Degrees of Freedom',
    difficulty: 'JEE Main',
    questionType: 'mcq_single',
    questionText: 'A rigid diatomic ideal gas is heated at constant pressure. What fraction of the total heat energy supplied $Q$ is converted into internal energy increase $\\Delta U$ of the gas? Neglect vibrational modes.',
    requiresDiagram: false,
    diagramType: 'none',
    diagram: null,
    options: [
      { id: 'opt-pt2-1', label: 'A', text: '5 / 7', isCorrect: true },
      { id: 'opt-pt2-2', label: 'B', text: '2 / 7', isCorrect: false },
      { id: 'opt-pt2-3', label: 'C', text: '3 / 5', isCorrect: false },
      { id: 'opt-pt2-4', label: 'D', text: '5 / 9', isCorrect: false }
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: For a rigid diatomic gas without vibration, degrees of freedom f = 5.',
        'Step 2: Molar heat capacity at constant volume: C_v = \\frac{f}{2}R = \\frac{5}{2}R.',
        'Step 3: Molar heat capacity at constant pressure: C_p = C_v + R = \\frac{7}{2}R.',
        'Step 4: Fraction converted to internal energy: \\frac{\\Delta U}{Q} = \\frac{n C_v \\Delta T}{n C_p \\Delta T} = \\frac{C_v}{C_p} = \\frac{5/2}{7/2} = \\frac{5}{7}.'
      ],
      finalAnswer: 'Fraction = 5/7 (Option A)',
      conceptFormula: '\\frac{\\Delta U}{Q} = \\frac{C_v}{C_p} = \\frac{1}{\\gamma}',
      diagramInsight: 'Pure theoretical thermodynamic partition problem.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 50,
      discriminationIndex: 0.65,
      expectedAccuracyRate: 64,
      rankImpact: 'Moderate',
      topicWeightage: 'Standard JEE Main (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-kt-1',
          title: 'Kinetic Theory of Gases: Degrees of Freedom',
          source: 'NCERT Physics Class 11, Chapter 13',
          snippet: 'For rigid diatomic gas with 5 degrees of freedom, gamma = Cp/Cv = 7/5...',
          relevanceScore: 0.98
        }
      ],
      similarQuestionRef: 'JEE Main 2021 Shift 2'
    },
    createdAt: '2026-09-04T12:35:00.000Z'
  },

  // QUESTION 11: Chemistry - Text Only (Electrochemistry & Nernst Equation)
  {
    id: 'q-chem-text-02',
    subject: 'Chemistry',
    topic: 'Electrochemistry',
    subtopic: 'Standard Reduction Potentials & Gibbs Free Energy',
    difficulty: 'JEE Main',
    questionType: 'mcq_single',
    questionText: 'Given the standard reduction potentials: $E^\\circ(\\text{Zn}^{2+}/\\text{Zn}) = -0.76\\text{ V}$ and $E^\\circ(\\text{Cu}^{2+}/\\text{Cu}) = +0.34\\text{ V}$. Calculate the standard Gibbs free energy change $\\Delta G^\\circ$ for the cell reaction: $\\text{Zn}(s) + \\text{Cu}^{2+}(aq) \\rightarrow \\text{Zn}^{2+}(aq) + \\text{Cu}(s)$. Take $F = 96500\\text{ C/mol}$.',
    requiresDiagram: false,
    diagramType: 'none',
    diagram: null,
    options: [
      { id: 'opt-ct2-1', label: 'A', text: '\\Delta G^\\circ = -212.3 kJ/mol', isCorrect: true },
      { id: 'opt-ct2-2', label: 'B', text: '\\Delta G^\\circ = +212.3 kJ/mol', isCorrect: false },
      { id: 'opt-ct2-3', label: 'C', text: '\\Delta G^\\circ = -106.1 kJ/mol', isCorrect: false },
      { id: 'opt-ct2-4', label: 'D', text: '\\Delta G^\\circ = -424.6 kJ/mol', isCorrect: false }
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: Cell standard electromotive force: E^\\circ_{cell} = E^\\circ_{cathode} - E^\\circ_{anode} = 0.34\\text{ V} - (-0.76\\text{ V}) = +1.10\\text{ V}.',
        'Step 2: Number of electrons transferred in the redox couple: n = 2.',
        'Step 3: Calculate \\Delta G^\\circ: \\Delta G^\\circ = -n F E^\\circ_{cell} = -2 \\times 96500 \\times 1.10 = -212300\\text{ J/mol} = -212.3\\text{ kJ/mol}.'
      ],
      finalAnswer: '\\Delta G^\\circ = -212.3 kJ/mol (Option A)',
      conceptFormula: '\\Delta G^\\circ = -n F E^\\circ_{\\text{cell}}',
      diagramInsight: 'Direct thermodynamic calculation from electrochemical potential.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 45,
      discriminationIndex: 0.61,
      expectedAccuracyRate: 72,
      rankImpact: 'Moderate',
      topicWeightage: 'Standard JEE Main (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-elchem-1',
          title: 'Electrochemistry: Nernst Equation and Gibbs Energy',
          source: 'NCERT Chemistry Class 12, Chapter 3',
          snippet: 'Delta G standard equals minus n F E cell standard...',
          relevanceScore: 0.96
        }
      ],
      similarQuestionRef: 'JEE Main 2023 Session 1'
    },
    createdAt: '2026-09-04T12:40:00.000Z'
  },

  // QUESTION 12: Mathematics - Text + Diagram (Conic Sections & Tangents)
  {
    id: 'q-math-diag-02',
    subject: 'Mathematics',
    topic: 'Coordinate Geometry',
    subtopic: 'Conic Sections: Parabola & Tangents',
    difficulty: 'JEE Main',
    questionType: 'mcq_single',
    questionText: 'A focal chord of the parabola $y^2 = 8x$ is inclined at an angle $\\theta = 45^\\circ$ to the positive x-axis as depicted in the figure. Tangents are drawn at the extremities $P$ and $Q$ of this focal chord. Find the locus/coordinate of their point of intersection $T$ and the length of the chord $PQ$.',
    requiresDiagram: true,
    diagramType: 'geometry',
    diagram: generateDiagramSvg('geometry', { curve: 'Parabola y² = 8x', focalChord: '45° through (2, 0)', pointT: '(-2, y)' }),
    options: [
      { id: 'opt-md2-1', label: 'A', text: 'Point T lies on directrix x = -2; Length PQ = 16 units', isCorrect: true },
      { id: 'opt-md2-2', label: 'B', text: 'Point T lies on directrix x = -4; Length PQ = 8 units', isCorrect: false },
      { id: 'opt-md2-3', label: 'C', text: 'Point T lies on axis y = 0; Length PQ = 12 units', isCorrect: false },
      { id: 'opt-md2-4', label: 'D', text: 'Point T lies on x = -2; Length PQ = 8 units', isCorrect: false }
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: Standard parabola y^2 = 4ax with 4a = 8 \\implies a = 2. Directrix equation is x = -a = -2.',
        'Step 2: Property of Parabola: Tangents at extremities of any focal chord always intersect at right angles on the directrix (x = -a = -2).',
        'Step 3: Length of focal chord inclined at angle \\theta: L = 4a \\csc^2 \\theta = 4(2) \\csc^2 45^\\circ = 8 \\times (\\sqrt{2})^2 = 8 \\times 2 = 16\\text{ units}.'
      ],
      finalAnswer: 'T lies on directrix x = -2; Length PQ = 16 units (Option A)',
      conceptFormula: 'L_{\\text{focal chord}} = 4a \\csc^2 \\theta; \\quad \\text{Directrix: } x = -a',
      diagramInsight: 'Right-angled intersection of orthogonal tangents on directrix.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 60,
      discriminationIndex: 0.71,
      expectedAccuracyRate: 58,
      rankImpact: 'High',
      topicWeightage: 'Standard JEE Main Coordinate Geometry (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-conics-1',
          title: 'Conic Sections: Focal Chords of Parabola',
          source: 'NCERT Mathematics Class 11, Chapter 11',
          snippet: 'Extremities of focal chord t1 and t2 satisfy t1*t2 = -1. Tangents intersect at directrix...',
          relevanceScore: 0.98,
          diagramType: 'geometry'
        }
      ],
      similarQuestionRef: 'JEE Main 2022'
    },
    createdAt: '2026-09-04T12:45:00.000Z'
  },

  // QUESTION 13: Mathematics - Text Only (Matrices & Determinants)
  {
    id: 'q-math-text-02',
    subject: 'Mathematics',
    topic: 'Matrices & Determinants',
    subtopic: 'System of Linear Equations (Cramer\'s Rule)',
    difficulty: 'JEE Main',
    questionType: 'mcq_single',
    questionText: 'Consider the system of linear equations in $x, y, z$: \n$$\\begin{cases} x + y + z = 6 \\\\ x + 2y + 3z = 10 \\\\ x + 2y + \\lambda z = \\mu \\end{cases}$$\nFor which values of $\\lambda$ and $\\mu$ does this system possess infinitely many solutions?',
    requiresDiagram: false,
    diagramType: 'none',
    diagram: null,
    options: [
      { id: 'opt-mt2-1', label: 'A', text: '\\lambda = 3, \\mu = 10', isCorrect: true },
      { id: 'opt-mt2-2', label: 'B', text: '\\lambda \\neq 3, \\mu = 10', isCorrect: false },
      { id: 'opt-mt2-3', label: 'C', text: '\\lambda = 3, \\mu \\neq 10', isCorrect: false },
      { id: 'opt-mt2-4', label: 'D', text: '\\lambda = 2, \\mu = 6', isCorrect: false }
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: The coefficient determinant: D = |[1, 1, 1], [1, 2, 3], [1, 2, \\lambda]|.',
        'Step 2: Performing R_3 \\rightarrow R_3 - R_2: [0, 0, \\lambda - 3]. Expanding yields D = \\lambda - 3.',
        'Step 3: For infinitely many solutions, D = 0 \\implies \\lambda = 3.',
        'Step 4: When \\lambda = 3, Equation 2 is x + 2y + 3z = 10 and Equation 3 is x + 2y + 3z = \\mu. For consistency, \\mu must equal 10. If \\mu \\neq 10, no solution exists.'
      ],
      finalAnswer: '\\lambda = 3, \\mu = 10 (Option A)',
      conceptFormula: 'D = 0 \\text{ and } D_x = D_y = D_z = 0 \\implies \\text{Infinitely many solutions}',
      diagramInsight: 'Pure linear algebra rank consistency analysis.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 46,
      discriminationIndex: 0.63,
      expectedAccuracyRate: 68,
      rankImpact: 'Moderate',
      topicWeightage: 'Standard JEE Main (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-matrices-1',
          title: 'Determinants: Consistency of Linear Systems',
          source: 'NCERT Mathematics Class 12, Chapter 4',
          snippet: 'If D = 0 and Dx=Dy=Dz=0 then system is consistent with infinite solutions...',
          relevanceScore: 0.99
        }
      ],
      similarQuestionRef: 'JEE Main 2023 Shift 1'
    },
    createdAt: '2026-09-04T12:50:00.000Z'
  },

  // QUESTION 14: Biology - Text + Diagram (Cell Structure & Mitochondria)
  {
    id: 'q-bio-diag-01',
    subject: 'Biology',
    topic: 'Cell Biology',
    subtopic: 'Mitochondrial Ultrastructure & ATP Synthase',
    difficulty: 'NEET',
    questionType: 'mcq_single',
    questionText: 'Observe the labelled schematic diagram of the mitochondrion below. Identify the region marked (A) and (B), and state the exact site where oxidative phosphorylation and the $F_0-F_1$ ATP synthase complexes are located.',
    requiresDiagram: true,
    diagramType: 'biology_cell',
    diagram: generateDiagramSvg('biology_cell', { organelle: 'Mitochondrion', cristae: 'Inner folded membrane', matrix: 'Matrix with 70S ribosomes' }),
    options: [
      { id: 'opt-bd-1', label: 'A', text: '(A) Inner Membrane Cristae; (B) Mitochondrial Matrix. ATP Synthase is on Cristae', isCorrect: true },
      { id: 'opt-bd-2', label: 'B', text: '(A) Outer membrane; (B) Stroma. ATP Synthase is in Matrix', isCorrect: false },
      { id: 'opt-bd-3', label: 'C', text: '(A) Thylakoid; (B) Granum. ATP Synthase is on Outer membrane', isCorrect: false },
      { id: 'opt-bd-4', label: 'D', text: '(A) Peroxisome; (B) Cytosol. ATP Synthase is in Intermembrane space', isCorrect: false }
    ],
    correctAnswer: 'A',
    solution: {
      stepByStep: [
        'Step 1: The inner mitochondrial membrane forms infoldings called cristae (A) that expand surface area.',
        'Step 2: The fluid enclosed by inner membrane is the matrix (B), containing circular DNA and 70S ribosomes.',
        'Step 3: The inner mitochondrial membrane / cristae hosts the electron transport chain (ETC) and oxysomes (F0-F1 ATP synthase particles).'
      ],
      finalAnswer: '(A) Cristae; (B) Matrix. ATP Synthase is on Cristae (Option A)',
      conceptFormula: '\\text{Oxidative Phosphorylation} \\rightarrow \\text{Inner Mitochondrial Cristae}',
      diagramInsight: 'High-yield NEET diagram checking inner cristae folds vs matrix.'
    },
    reviewStatus: 'approved',
    scorePrediction: {
      jeeDifficultyScore: 40,
      discriminationIndex: 0.58,
      expectedAccuracyRate: 78,
      rankImpact: 'High',
      topicWeightage: 'Core NEET Biology (4 marks)'
    },
    ragMetadata: {
      retrievedChunks: [
        {
          id: 'chunk-bio-cell-1',
          title: 'Cell: The Unit of Life - Mitochondria',
          source: 'NCERT Biology Class 11, Chapter 8',
          snippet: 'Mitochondria is double membrane bound organelle. Inner membrane forms number of infoldings called cristae...',
          relevanceScore: 0.99,
          diagramType: 'biology_cell'
        }
      ],
      similarQuestionRef: 'NEET 2021'
    },
    createdAt: '2026-09-04T12:55:00.000Z'
  }
];
