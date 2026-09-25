import { KnowledgeDoc, RagChunk } from '../types';

export const INITIAL_KNOWLEDGE_BASE: KnowledgeDoc[] = [
  {
    id: 'kb-phys-01',
    subject: 'Physics',
    topic: 'Current Electricity',
    title: 'Kirchhoff’s Laws and Resistor Network Combinations',
    content: `When resistors are connected in parallel, the equivalent resistance R_eq satisfies 1/R_eq = 1/R_1 + 1/R_2. In series, R_eq = R_1 + R_2.
Kirchhoff's Current Law (KCL) states that the algebraic sum of currents meeting at a junction is zero (conservation of charge).
Kirchhoff's Voltage Law (KVL) states that the directed sum of potential differences around any closed loop is zero.
In balanced bridge circuits (Wheatstone condition), no current flows through the central galvanometer branch when R_1/R_2 = R_3/R_4.
Visual diagrams are essential: circuit schematics must indicate node junctions, current branch arrows, battery polarity (+/-), and component values.`,
    formulas: ['V = IR', 'R_parallel = (R_1 * R_2) / (R_1 + R_2)', 'R_series = R_1 + R_2 + ...', 'P = I^2 * R = V^2 / R'],
    diagramCategory: 'circuit',
    sampleDiagramSpec: 'circuit'
  },
  {
    id: 'kb-phys-02',
    subject: 'Physics',
    topic: 'Laws of Motion & Friction',
    title: 'Inclined Planes, Friction, and Connected Pulley Systems',
    content: `For a block of mass m_1 on an incline of angle θ with friction coefficient μ:
Normal force N = m_1 * g * cos(θ).
The limiting static friction force is f_s = μ_s * N, while kinetic friction is f_k = μ_k * N.
Component of gravity pulling down the plane is m_1 * g * sin(θ).
When connected by a massless, inextensible string over a frictionless pulley to a hanging mass m_2:
Equation of motion for m_1: T - m_1 * g * sin(θ) - f_k = m_1 * a.
Equation of motion for m_2: m_2 * g - T = m_2 * a.
A precise Free Body Diagram (FBD) is mandatory to resolve coordinate axes parallel and perpendicular to the incline.`,
    formulas: ['N = m * g * cos(θ)', 'f_k = μ_k * m * g * cos(θ)', 'a = (m_2 - m_1(sin θ + μ cos θ)) g / (m_1 + m_2)'],
    diagramCategory: 'mechanics_fbd',
    sampleDiagramSpec: 'mechanics_fbd'
  },
  {
    id: 'kb-phys-03',
    subject: 'Physics',
    topic: 'Ray Optics & Optical Instruments',
    title: 'Thin Convex and Concave Lenses, Image Formation',
    content: `For a thin spherical lens with focal length f:
Lens formula: 1/f = 1/v - 1/u (using Cartesian sign convention where incident light direction is positive).
Linear magnification: m = v / u = height of image (h_i) / height of object (h_o).
For a convex lens (f > 0):
- Object between F and 2F produces an inverted, real, and magnified image beyond 2F.
- Object at 2F produces an inverted, real image of same size at 2F.
- Object between Optical Center O and F forms an erect, virtual, and magnified image on the same side.
Ray diagrams require drawing at least two standard rays: (1) ray parallel to principal axis passing through focus, and (2) ray through optical center O undeflected.`,
    formulas: ['1/f = 1/v - 1/u', 'm = v/u = h_i / h_o', 'P = 1/f (in meters, diopters)'],
    diagramCategory: 'ray_optics',
    sampleDiagramSpec: 'ray_optics'
  },
  {
    id: 'kb-phys-04',
    subject: 'Physics',
    topic: 'Kinematics in One Dimension',
    title: 'Velocity-Time (v-t) Graphs and Motion Analysis',
    content: `In a velocity-time graph:
The slope of the tangent at any instant represents instantaneous acceleration: a = dv/dt.
The area under the v-t curve between time t_1 and t_2 represents the total displacement: s = ∫ v dt.
For uniform acceleration, the graph is a straight line with slope a.
Trapezoidal motion profiles (acceleration, uniform velocity, deceleration) are frequent in JEE Main questions to test area partitioning into triangles and rectangles.`,
    formulas: ['v = u + at', 's = ut + 0.5 * a * t^2', 'v^2 = u^2 + 2as', 'Displacement = Area under v-t graph'],
    diagramCategory: 'graph_kinematics',
    sampleDiagramSpec: 'graph_kinematics'
  },
  {
    id: 'kb-phys-05',
    subject: 'Physics',
    topic: 'Thermodynamics',
    title: 'Indicator Diagrams (P-V Curves) and Cyclic Processes',
    content: `A thermodynamic state is represented on a Pressure-Volume (P-V) indicator diagram.
Work done by the system during an expansion from V_1 to V_2 is the area under the curve: W = ∫ P dV.
In a closed cyclic process (e.g., A -> B -> C -> D -> A):
The net work done during one complete cycle equals the enclosed area of the loop.
If the cycle is traced clockwise, net work done by the gas is positive (heat engine). If counter-clockwise, work is negative (refrigerator/heat pump).
Change in internal energy over a complete cycle is zero (ΔU = 0), so Q_net = W_net.`,
    formulas: ['ΔQ = ΔU + ΔW', 'W_isobaric = P * (V_2 - V_1)', 'W_isothermal = n * R * T * ln(V_2 / V_1)', 'W_cycle = Area enclosed in P-V loop'],
    diagramCategory: 'thermo_pv',
    sampleDiagramSpec: 'thermo_pv'
  },
  {
    id: 'kb-chem-01',
    subject: 'Chemistry',
    topic: 'Organic Chemistry - Arenes & Hydrocarbons',
    title: 'Electrophilic Aromatic Substitution (EAS) and Nitration of Benzene',
    content: `Benzene undergoes electrophilic aromatic substitution due to its delocalized 6 pi-electron resonance stability.
In nitration, concentrated nitric acid (HNO_3) acts as a base and reacts with concentrated sulfuric acid (H_2SO_4) to generate the active electrophile, the nitronium ion (NO_2^+):
HNO_3 + 2 H_2SO_4 ⇌ NO_2^+ + H_3O^+ + 2 HSO_4^-.
The electrophile attacks the aromatic ring forming a resonance-stabilized arenium ion (sigma complex), followed by loss of a proton to restore aromaticity, producing nitrobenzene.
Reaction mechanism diagrams require drawing the hexagonal aromatic ring, delocalized circle, reagents, and the nitro (-NO_2) substituent.`,
    formulas: ['Ar-H + HNO_3 (conc H_2SO_4, 55°C) -> Ar-NO_2 + H_2O', 'Nitronium ion generation: [O=N=O]^+'],
    diagramCategory: 'chemistry_organic',
    sampleDiagramSpec: 'chemistry_organic'
  },
  {
    id: 'kb-math-01',
    subject: 'Mathematics',
    topic: 'Coordinate Geometry & Conics',
    title: 'Circles, Tangents from External Point, and Chord of Contact',
    content: `From any external point P(x_1, y_1) to the circle x^2 + y^2 = r^2, exactly two real tangents PT_1 and PT_2 can be drawn.
The length of each tangent is L = √(x_1^2 + y_1^2 - r^2).
The radius drawn to the point of contact is perpendicular to the tangent line (OT ⟂ PT).
The equation of the chord of contact T_1T_2 is given by T = 0, i.e., x*x_1 + y*y_1 = r^2.
The angle θ between the tangents satisfies tan(θ/2) = r / L.
Geometric diagrams must accurately render the circle center O, radius vectors, tangent lines, and labeled vertices.`,
    formulas: ['Length of tangent: L = √S_1', 'Chord of contact: x*x_1 + y*y_1 = r^2', 'tan(θ/2) = r / √S_1'],
    diagramCategory: 'geometry',
    sampleDiagramSpec: 'geometry'
  },
  {
    id: 'kb-bio-01',
    subject: 'Biology',
    topic: 'Cell Biology & Cell Structure',
    title: 'Ultrastructure of Mitochondria and Cellular Respiration',
    content: `Mitochondria are double membrane-bound semi-autonomous organelles found in eukaryotic cells.
The outer membrane is smooth and contains porin proteins.
The inner membrane is deeply folded into cristae to tremendously increase surface area for ATP synthase (F_0-F_1 complexes) and electron transport chain (ETC) complexes I-IV.
The interior fluid space is the mitochondrial matrix, containing 70S ribosomes, circular double-stranded mtDNA, and enzymes of the Krebs (TCA) cycle.
Diagrams require displaying outer membrane, inner membrane cristae infoldings, matrix, and circular DNA molecules for NEET cell biology questions.`,
    formulas: ['C_6H_12O_6 + 6 O_2 -> 6 CO_2 + 6 H_2O + ~36-38 ATP', 'Oxidative phosphorylation across cristae membrane'],
    diagramCategory: 'biology_cell',
    sampleDiagramSpec: 'biology_cell'
  }
];

/**
 * In-memory / vector-like semantic retrieval function.
 * Matches input topic, subject, keywords, and semantic intent.
 */
export function searchKnowledgeBase(
  docs: KnowledgeDoc[],
  query: string,
  subject?: string,
  topK: number = 3
): RagChunk[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scoredDocs = docs.map((doc) => {
    let score = 0;
    const docSubject = doc.subject.toLowerCase();
    const docTopic = doc.topic.toLowerCase();
    const docTitle = doc.title.toLowerCase();
    const docContent = doc.content.toLowerCase();

    if (subject && docSubject === subject.toLowerCase()) {
      score += 4.0;
    }

    for (const term of queryTerms) {
      if (docTopic.includes(term)) score += 3.5;
      if (docTitle.includes(term)) score += 3.0;
      if (docContent.includes(term)) score += 1.2;
      for (const f of doc.formulas) {
        if (f.toLowerCase().includes(term)) score += 1.8;
      }
    }

    // Normalized relevance score (0.0 to 1.0)
    const normalizedScore = Math.min(0.98, Math.max(0.45, score / (queryTerms.length * 4 + 4)));

    return {
      id: doc.id,
      title: `${doc.subject}: ${doc.topic} - ${doc.title}`,
      source: `NCERT / Standard Syllabus (${doc.subject})`,
      snippet: doc.content.slice(0, 320) + '...',
      relevanceScore: parseFloat(normalizedScore.toFixed(2)),
      diagramType: doc.diagramCategory
    };
  });

  scoredDocs.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scoredDocs.slice(0, topK);
}
