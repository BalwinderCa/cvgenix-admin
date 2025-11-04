import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local manually
try {
  const envLocalPath = resolve(process.cwd(), '.env.local');
  const envLocal = readFileSync(envLocalPath, 'utf8');
  envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  });
} catch (e) {
  // .env.local doesn't exist, try .env
  try {
    const envPath = resolve(process.cwd(), '.env');
    const env = readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    });
  } catch (e2) {
    // No .env file
  }
}

import Template from '../models/Template.js';

// Helper function to create complete Fabric.js textbox objects matching the existing template structure
function createTextBox(text, left, top, width, height, options = {}) {
  const {
    fontSize = 12,
    fontFamily = 'Arial',
    fontWeight = 'normal',
    fill = '#1a1a1a',
    textAlign = 'left',
    originX = 'left',
    originY = 'top',
    lineHeight = 1.16,
    fontStyle = 'normal',
  } = options;

  return {
    type: 'textbox',
    version: '5.5.2',
    originX: originX,
    originY: originY,
    left: left,
    top: top,
    width: width,
    height: height,
    fill: fill,
    stroke: null,
    strokeWidth: 1,
    strokeDashArray: null,
    strokeLineCap: 'butt',
    strokeDashOffset: 0,
    strokeLineJoin: 'miter',
    strokeUniform: false,
    strokeMiterLimit: 4,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    shadow: null,
    visible: true,
    backgroundColor: '',
    fillRule: 'nonzero',
    paintFirst: 'fill',
    globalCompositeOperation: 'source-over',
    skewX: 0,
    skewY: 0,
    fontFamily: fontFamily,
    fontWeight: fontWeight,
    fontSize: fontSize,
    text: text,
    underline: false,
    overline: false,
    linethrough: false,
    textAlign: textAlign,
    fontStyle: fontStyle,
    lineHeight: lineHeight,
    textBackgroundColor: '',
    charSpacing: 0,
    styles: [],
    direction: 'ltr',
    path: null,
    pathStartOffset: 0,
    pathSide: 'left',
    pathAlign: 'baseline',
    minWidth: 20,
    splitByGrapheme: false,
  };
}

// Helper function to create complete Fabric.js rect objects
function createRect(left, top, width, height, fill, options = {}) {
  const {
    selectable = true,
    evented = true,
    stroke = null,
    strokeWidth = 0,
    rx = 0,
    ry = 0,
  } = options;

  return {
    type: 'rect',
    version: '5.5.2',
    originX: 'left',
    originY: 'top',
    left: left,
    top: top,
    width: width,
    height: height,
    fill: fill,
    stroke: stroke || fill,
    strokeWidth: strokeWidth,
    strokeDashArray: null,
    strokeLineCap: 'butt',
    strokeDashOffset: 0,
    strokeLineJoin: 'miter',
    strokeUniform: false,
    strokeMiterLimit: 4,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    shadow: null,
    visible: true,
    backgroundColor: '',
    fillRule: 'nonzero',
    paintFirst: 'fill',
    globalCompositeOperation: 'source-over',
    skewX: 0,
    skewY: 0,
    rx: rx,
    ry: ry,
    selectable: selectable,
    evented: evented,
  };
}

const sampleTemplates = [
  {
    name: "Business Development Executive",
    description: "Strategic and results-oriented resume template for business development and sales professionals.",
    category: "Executive",
    renderEngine: "canvas",
    status: "active",
    isActive: true,
    isPremium: true,
    isPopular: true,
    isNewTemplate: true,
    tags: ["executive", "business", "sales", "strategy"],
    createdBy: "System",
    thumbnail: "/assets/images/templates/default.jpg",
    canvasData: {
      version: "5.5.2",
      objects: [
        // Left sidebar accent
        createRect(0, 0, 8, 950, "#1e40af", { selectable: false, evented: false }),
        
        // Header Name - Left aligned
        createTextBox("ROBERT THOMPSON", 60, 35, 650, 40.68, {
          fontSize: 38,
          fontWeight: "bold",
          fill: "#1e40af",
          textAlign: "left",
        }),
        
        // Title
        createTextBox("VP of Business Development", 60, 85, 650, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#4b5563",
        }),
        
        // Contact Info - Left aligned
        createTextBox("r.thompson@email.com", 60, 110, 300, 13.56, {
          fontSize: 11,
          fill: "#666666",
        }),
        createTextBox("+1 (555) 123-4567", 380, 110, 200, 13.56, {
          fontSize: 11,
          fill: "#666666",
        }),
        createTextBox("New York, NY", 60, 130, 300, 13.56, {
          fontSize: 11,
          fill: "#666666",
        }),
        
        // Section divider
        createRect(60, 155, 650, 1, "#cbd5e1", { selectable: false, evented: false, strokeWidth: 0 }),
        
        // Professional Summary
        createTextBox("PROFILE", 60, 170, 650, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e40af",
          textAlign: "left",
        }),
        createTextBox("Accomplished business development executive with 15+ years driving revenue growth and strategic partnerships for Fortune 500 companies. Proven expertise in B2B sales, market expansion, and cross-functional team leadership. Track record of closing $50M+ in annual deals and building high-performing sales organizations.", 60, 195, 650, 54.56, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Section divider
        createRect(60, 265, 650, 1, "#cbd5e1", { selectable: false, evented: false, strokeWidth: 0 }),
        
        // Core Competencies - Two columns
        createTextBox("CORE COMPETENCIES", 60, 280, 650, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e40af",
        }),
        createTextBox("Strategic Planning • Market Analysis • Client Relations\nNegotiation • Pipeline Management • CRM Systems", 60, 305, 310, 41.27, {
          fontSize: 11,
          fill: "#374151",
        }),
        createTextBox("Team Leadership • Contract Management • Revenue Growth\nTerritory Expansion • Partner Development • Presentations", 380, 305, 330, 41.27, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Section divider
        createRect(60, 360, 650, 1, "#cbd5e1", { selectable: false, evented: false, strokeWidth: 0 }),
        
        // Professional Experience
        createTextBox("PROFESSIONAL EXPERIENCE", 60, 375, 650, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e40af",
        }),
        
        // Job 1
        createTextBox("Vice President, Business Development", 60, 400, 450, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1e3a8a",
        }),
        createTextBox("Global Tech Solutions | 2019 - Present", 60, 420, 450, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("• Led business development team generating $45M annual revenue across North America\n• Established strategic partnerships with 20+ enterprise clients including Fortune 500 companies\n• Developed and executed go-to-market strategies for new product lines\n• Managed $12M annual budget and consistently exceeded revenue targets by 25%+", 60, 440, 650, 68.2, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Job 2
        createTextBox("Director of Sales", 60, 525, 450, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1e3a8a",
        }),
        createTextBox("Enterprise Software Corp | 2015 - 2019", 60, 545, 450, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("• Built and managed sales team of 15 professionals across multiple regions\n• Increased annual revenue from $18M to $32M through strategic account management\n• Developed comprehensive sales training programs improving close rates by 40%\n• Negotiated complex enterprise contracts worth $5M-$15M each", 60, 565, 650, 68.2, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Job 3
        createTextBox("Senior Business Development Manager", 60, 650, 450, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1e3a8a",
        }),
        createTextBox("Tech Innovations Inc. | 2011 - 2015", 60, 670, 450, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("• Managed key accounts and expanded market presence in Western region\n• Closed deals totaling $25M+ over 4-year period\n• Collaborated with product teams to develop customer-focused solutions\n• Mentored junior sales professionals and contributed to team success", 60, 690, 650, 68.2, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Section divider
        createRect(60, 775, 650, 1, "#cbd5e1", { selectable: false, evented: false, strokeWidth: 0 }),
        
        // Education
        createTextBox("EDUCATION", 60, 790, 650, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e40af",
        }),
        createTextBox("MBA, Business Administration", 60, 815, 450, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1e3a8a",
        }),
        createTextBox("Wharton School, University of Pennsylvania | 2009 - 2011", 60, 835, 550, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("Bachelor of Science, Business Management", 60, 860, 450, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1e3a8a",
        }),
        createTextBox("University of Pennsylvania | 2005 - 2009", 60, 880, 550, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        
        // Section divider
        createRect(60, 910, 650, 1, "#cbd5e1", { selectable: false, evented: false, strokeWidth: 0 }),
        
        // Achievements
        createTextBox("KEY ACHIEVEMENTS", 60, 925, 650, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e40af",
        }),
        createTextBox("• Sales Excellence Award 2022 & 2023 • President's Club Member (5 years) • Top Performer Q4 2021", 60, 948, 650, 2, {
          fontSize: 11,
          fill: "#374151",
        }),
      ],
      background: "#ffffff",
    },
  },
  {
    name: "Creative Graphic Designer",
    description: "Vibrant and artistic resume template perfect for creative professionals and designers.",
    category: "Creative",
    renderEngine: "canvas",
    status: "active",
    isActive: true,
    isPremium: true,
    isPopular: true,
    isNewTemplate: true,
    tags: ["creative", "designer", "artistic", "colorful"],
    createdBy: "System",
    thumbnail: "/assets/images/templates/default.jpg",
    canvasData: {
      version: "5.5.2",
      objects: [
        // Top colored header
        createRect(0, 0, 800, 140, "#ec4899", { selectable: false, evented: false }),
        
        // Name in header
        createTextBox("OLIVIA PARKER", 50, 45, 700, 48.72, {
          fontSize: 42,
          fontWeight: "bold",
          fill: "#ffffff",
          textAlign: "left",
        }),
        
        // Title in header
        createTextBox("Senior Graphic Designer", 50, 100, 700, 18.56, {
          fontSize: 16,
          fill: "#fce7f3",
          textAlign: "left",
        }),
        
        // Contact info below header
        createTextBox("olivia@designstudio.com  •  +1 555 777 8888  •  Los Angeles, CA", 50, 155, 700, 13.56, {
          fontSize: 12,
          fill: "#666666",
        }),
        
        // About section with colored background
        createRect(50, 185, 700, 90, "#fdf2f8", { selectable: false, evented: false }),
        createTextBox("ABOUT", 65, 200, 670, 18.08, {
          fontSize: 16,
          fontWeight: "bold",
          fill: "#be185d",
        }),
        createTextBox("Award-winning graphic designer with 12+ years creating impactful visual identities and brand experiences. Specialized in logo design, print media, and digital campaigns. Passionate about merging artistry with strategic thinking to deliver compelling visual solutions.", 65, 225, 670, 41.27, {
          fontSize: 11,
          fill: "#831843",
        }),
        
        // Experience
        createTextBox("EXPERIENCE", 50, 295, 700, 18.08, {
          fontSize: 16,
          fontWeight: "bold",
          fill: "#1a1a1a",
        }),
        
        // Job 1 with pink accent
        createRect(50, 325, 4, 70, "#ec4899", { selectable: false, evented: false }),
        createTextBox("Senior Graphic Designer", 65, 325, 635, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1a1a1a",
        }),
        createTextBox("Creative Agency Studio | 2018 - Present", 65, 345, 500, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("• Designed brand identities for 30+ clients including startups and established companies\n• Led creative direction for packaging design projects winning 3 industry awards\n• Managed design projects from concept to production with budgets up to $500K\n• Collaborated with copywriters and marketers to create cohesive brand experiences", 65, 365, 635, 54.56, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Job 2
        createRect(50, 415, 4, 70, "#ec4899", { selectable: false, evented: false }),
        createTextBox("Graphic Designer", 65, 415, 635, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1a1a1a",
        }),
        createTextBox("Brand Design Collective | 2014 - 2018", 65, 435, 500, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("• Created visual designs for print, web, and social media campaigns\n• Developed style guides and brand guidelines for client portfolios\n• Worked on diverse projects including magazines, websites, and marketing materials\n• Participated in client presentations and design reviews", 65, 455, 635, 54.56, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Job 3
        createRect(50, 505, 4, 60, "#ec4899", { selectable: false, evented: false }),
        createTextBox("Junior Designer", 65, 505, 635, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1a1a1a",
        }),
        createTextBox("Design Studio Inc. | 2012 - 2014", 65, 525, 500, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("• Assisted senior designers on various client projects\n• Created digital assets and prepared files for production\n• Maintained brand consistency across multiple touchpoints\n• Learned industry-standard design tools and workflows", 65, 545, 635, 41.27, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Education
        createTextBox("EDUCATION", 50, 600, 700, 18.08, {
          fontSize: 16,
          fontWeight: "bold",
          fill: "#1a1a1a",
        }),
        createTextBox("Bachelor of Fine Arts, Graphic Design", 50, 630, 500, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1a1a1a",
        }),
        createTextBox("Art Center College of Design | 2008 - 2012", 50, 650, 550, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        
        // Skills with colored boxes
        createTextBox("SKILLS", 50, 675, 700, 18.08, {
          fontSize: 16,
          fontWeight: "bold",
          fill: "#1a1a1a",
        }),
        createRect(50, 700, 150, 35, "#fce7f3", { selectable: false, evented: false }),
        createTextBox("Adobe Creative\nSuite", 55, 705, 140, 27.7, {
          fontSize: 11,
          fontWeight: "bold",
          fill: "#be185d",
        }),
        createRect(210, 700, 150, 35, "#fce7f3", { selectable: false, evented: false }),
        createTextBox("Brand Identity\n& Logo Design", 215, 705, 140, 27.7, {
          fontSize: 11,
          fontWeight: "bold",
          fill: "#be185d",
        }),
        createRect(370, 700, 150, 35, "#fce7f3", { selectable: false, evented: false }),
        createTextBox("Print & Digital\nProduction", 375, 705, 140, 27.7, {
          fontSize: 11,
          fontWeight: "bold",
          fill: "#be185d",
        }),
        createRect(530, 700, 150, 35, "#fce7f3", { selectable: false, evented: false }),
        createTextBox("Typography &\nLayout Design", 535, 705, 140, 27.7, {
          fontSize: 11,
          fontWeight: "bold",
          fill: "#be185d",
        }),
        
        // Awards
        createTextBox("AWARDS & RECOGNITION", 50, 755, 700, 18.08, {
          fontSize: 16,
          fontWeight: "bold",
          fill: "#1a1a1a",
        }),
        createTextBox("• AIGA Design Award 2023 • Print Excellence Award 2022 • Creative Excellence 2021", 50, 780, 700, 13.56, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Portfolio link
        createTextBox("Portfolio: www.oliviaparkerdesign.com | Dribbble: @oliviaparker", 50, 805, 700, 13.56, {
          fontSize: 11,
          fill: "#ec4899",
        }),
      ],
      background: "#ffffff",
    },
  },
  {
    name: "Classic Professional Resume",
    description: "Traditional and timeless resume template with elegant typography and classic layout.",
    category: "Classic",
    renderEngine: "canvas",
    status: "active",
    isActive: true,
    isPremium: false,
    isPopular: true,
    isNewTemplate: true,
    tags: ["classic", "traditional", "professional", "elegant"],
    createdBy: "System",
    thumbnail: "/assets/images/templates/default.jpg",
    canvasData: {
      version: "5.5.2",
      objects: [
        // Name - Classic serif style
        createTextBox("JAMES PATTERSON", 50, 40, 700, 40.68, {
          fontSize: 34,
          fontWeight: "bold",
          fill: "#000000",
          textAlign: "left",
        }),
        
        // Underline
        createRect(50, 85, 200, 1.5, "#000000", { selectable: false, evented: false, strokeWidth: 0 }),
        
        // Contact - Traditional format
        createTextBox("123 Main Street, Suite 100", 50, 100, 300, 13.56, {
          fontSize: 11,
          fill: "#4b5563",
        }),
        createTextBox("New York, NY 10001", 50, 115, 300, 13.56, {
          fontSize: 11,
          fill: "#4b5563",
        }),
        createTextBox("(555) 123-4567", 400, 100, 300, 13.56, {
          fontSize: 11,
          fill: "#4b5563",
        }),
        createTextBox("james.patterson@email.com", 400, 115, 300, 13.56, {
          fontSize: 11,
          fill: "#4b5563",
        }),
        
        // Objective
        createTextBox("OBJECTIVE", 50, 145, 700, 15.68, {
          fontSize: 14,
          fontWeight: "bold",
          fill: "#000000",
          textAlign: "left",
        }),
        createTextBox("Seeking a senior management position where I can leverage my 15+ years of experience in operations, strategic planning, and team leadership to drive organizational growth and operational excellence.", 50, 165, 700, 27.7, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Experience
        createTextBox("PROFESSIONAL EXPERIENCE", 50, 205, 700, 15.68, {
          fontSize: 14,
          fontWeight: "bold",
          fill: "#000000",
        }),
        
        // Job 1
        createTextBox("Operations Director", 50, 230, 450, 15.68, {
          fontSize: 12,
          fontWeight: "bold",
          fill: "#000000",
        }),
        createTextBox("Manufacturing Corporation | 2018 - Present", 50, 247, 450, 13.56, {
          fontSize: 11,
          fill: "#6b7280",
        }),
        createTextBox("Responsible for overseeing daily operations, managing cross-functional teams, and implementing process improvements. Led initiatives that increased operational efficiency by 35% and reduced costs by $2M annually. Developed and executed strategic plans aligning with company objectives.", 50, 265, 700, 41.27, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Job 2
        createTextBox("Operations Manager", 50, 320, 450, 15.68, {
          fontSize: 12,
          fontWeight: "bold",
          fill: "#000000",
        }),
        createTextBox("Industrial Solutions Group | 2012 - 2018", 50, 337, 450, 13.56, {
          fontSize: 11,
          fill: "#6b7280",
        }),
        createTextBox("Managed operations for multi-site manufacturing facilities. Coordinated production schedules, quality control, and logistics. Implemented lean manufacturing principles reducing waste by 28%. Led team of 50+ employees across three locations.", 50, 355, 700, 41.27, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Job 3
        createTextBox("Production Supervisor", 50, 410, 450, 15.68, {
          fontSize: 12,
          fontWeight: "bold",
          fill: "#000000",
        }),
        createTextBox("Advanced Manufacturing Co. | 2008 - 2012", 50, 427, 450, 13.56, {
          fontSize: 11,
          fill: "#6b7280",
        }),
        createTextBox("Supervised production line operations and quality assurance processes. Trained new employees and maintained safety standards. Improved production output by 20% through workflow optimization. Maintained ISO 9001 certification compliance.", 50, 445, 700, 41.27, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Education
        createTextBox("EDUCATION", 50, 500, 700, 15.68, {
          fontSize: 14,
          fontWeight: "bold",
          fill: "#000000",
        }),
        createTextBox("Master of Business Administration", 50, 525, 450, 15.68, {
          fontSize: 12,
          fontWeight: "bold",
          fill: "#000000",
        }),
        createTextBox("University of Chicago | 2006 - 2008", 50, 542, 450, 13.56, {
          fontSize: 11,
          fill: "#6b7280",
        }),
        createTextBox("Bachelor of Science, Industrial Engineering", 50, 565, 450, 15.68, {
          fontSize: 12,
          fontWeight: "bold",
          fill: "#000000",
        }),
        createTextBox("Pennsylvania State University | 2002 - 2006", 50, 582, 450, 13.56, {
          fontSize: 11,
          fill: "#6b7280",
        }),
        
        // Skills
        createTextBox("PROFESSIONAL SKILLS", 50, 610, 700, 15.68, {
          fontSize: 14,
          fontWeight: "bold",
          fill: "#000000",
        }),
        createTextBox("Operations Management • Supply Chain Optimization • Quality Control • Lean Manufacturing\nTeam Leadership • Strategic Planning • Budget Management • Process Improvement", 50, 635, 700, 27.7, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // Certifications
        createTextBox("CERTIFICATIONS", 50, 675, 700, 15.68, {
          fontSize: 14,
          fontWeight: "bold",
          fill: "#000000",
        }),
        createTextBox("Six Sigma Black Belt • Certified Production and Inventory Management (CPIM) • ISO 9001 Lead Auditor", 50, 700, 700, 13.56, {
          fontSize: 11,
          fill: "#374151",
        }),
        
        // References
        createTextBox("REFERENCES", 50, 730, 700, 15.68, {
          fontSize: 14,
          fontWeight: "bold",
          fill: "#000000",
        }),
        createTextBox("Available upon request", 50, 755, 700, 13.56, {
          fontSize: 11,
          fill: "#374151",
        }),
      ],
      background: "#ffffff",
    },
  },
  {
    name: "Modern Data Analyst",
    description: "Clean and data-focused resume template for analysts, data scientists, and business intelligence professionals.",
    category: "Professional",
    renderEngine: "canvas",
    status: "active",
    isActive: true,
    isPremium: false,
    isPopular: true,
    isNewTemplate: true,
    tags: ["modern", "data", "analyst", "analytics"],
    createdBy: "System",
    thumbnail: "/assets/images/templates/default.jpg",
    canvasData: {
      version: "5.5.2",
      objects: [
        // Name with modern typography
        createTextBox("SOPHIA KIM", 50, 35, 700, 40.68, {
          fontSize: 36,
          fontWeight: "bold",
          fill: "#0f172a",
          textAlign: "left",
        }),
        
        // Title
        createTextBox("Data Analyst & Business Intelligence Specialist", 50, 80, 700, 18.08, {
          fontSize: 14,
          fill: "#475569",
        }),
        
        // Contact - Modern format
        createTextBox("sophia.kim@email.com", 50, 105, 250, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("+1 (555) 234-5678", 310, 105, 200, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("linkedin.com/in/sophiakim", 520, 105, 230, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        
        // Thin divider
        createRect(50, 130, 700, 0.5, "#e2e8f0", { selectable: false, evented: false, strokeWidth: 0 }),
        
        // Summary
        createTextBox("SUMMARY", 50, 145, 700, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("Data-driven analyst with 8+ years transforming complex datasets into actionable business insights. Expert in SQL, Python, and visualization tools. Proven ability to identify trends, forecast performance, and communicate findings to stakeholders at all levels.", 50, 165, 700, 41.27, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Skills - Compact
        createTextBox("TECHNICAL SKILLS", 50, 220, 700, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("SQL • Python (Pandas, NumPy) • R • Tableau • Power BI • Excel (Advanced) • Google Analytics • Statistical Analysis • Machine Learning", 50, 240, 700, 13.56, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Experience
        createTextBox("PROFESSIONAL EXPERIENCE", 50, 265, 700, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        
        // Job 1
        createTextBox("Senior Data Analyst", 50, 290, 500, 15.68, {
          fontSize: 12,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("Data Insights Inc. | 2020 - Present", 520, 290, 230, 13.56, {
          fontSize: 11,
          fill: "#64748b",
          textAlign: "right",
        }),
        createTextBox("• Analyze large datasets (10M+ records) to identify business trends and opportunities\n• Build interactive dashboards in Tableau reducing reporting time by 60%\n• Collaborate with stakeholders to define KPIs and establish data-driven decision frameworks\n• Present findings to C-suite executives influencing strategic business decisions", 50, 310, 700, 54.56, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Job 2
        createTextBox("Data Analyst", 50, 380, 500, 15.68, {
          fontSize: 12,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("Tech Analytics Corp | 2017 - 2020", 520, 380, 230, 13.56, {
          fontSize: 11,
          fill: "#64748b",
          textAlign: "right",
        }),
        createTextBox("• Developed SQL queries and Python scripts for data extraction and transformation\n• Created automated reporting solutions saving 15 hours per week\n• Performed A/B testing analysis resulting in 25% conversion rate improvement\n• Maintained data quality standards and documentation for analytics projects", 50, 400, 700, 54.56, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Job 3
        createTextBox("Junior Data Analyst", 50, 470, 500, 15.68, {
          fontSize: 12,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("Market Research Solutions | 2015 - 2017", 520, 470, 230, 13.56, {
          fontSize: 11,
          fill: "#64748b",
          textAlign: "right",
        }),
        createTextBox("• Prepared weekly and monthly reports for client presentations\n• Cleaned and validated data ensuring accuracy and completeness\n• Supported senior analysts in complex data analysis projects\n• Learned advanced Excel functions and data visualization techniques", 50, 490, 700, 41.27, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Education
        createTextBox("EDUCATION", 50, 545, 700, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("Master of Science, Data Science", 50, 570, 450, 15.68, {
          fontSize: 12,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("University of California, Los Angeles | 2013 - 2015", 520, 570, 230, 13.56, {
          fontSize: 11,
          fill: "#64748b",
          textAlign: "right",
        }),
        createTextBox("Bachelor of Science, Statistics", 50, 595, 450, 15.68, {
          fontSize: 12,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("University of California, Berkeley | 2009 - 2013", 520, 595, 230, 13.56, {
          fontSize: 11,
          fill: "#64748b",
          textAlign: "right",
        }),
        
        // Projects
        createTextBox("KEY PROJECTS", 50, 625, 700, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("• Customer Segmentation Analysis - Identified 5 distinct customer segments using clustering algorithms\n• Sales Forecasting Model - Built predictive model with 92% accuracy using time series analysis", 50, 650, 700, 41.27, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Certifications
        createTextBox("CERTIFICATIONS", 50, 705, 700, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("Google Data Analytics Professional Certificate • Tableau Desktop Certified Professional • Microsoft Certified: Power BI Data Analyst", 50, 730, 700, 27.7, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Languages
        createTextBox("LANGUAGES", 50, 775, 700, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#0f172a",
        }),
        createTextBox("English (Native) • Korean (Fluent) • Spanish (Conversational)", 50, 800, 700, 13.56, {
          fontSize: 11,
          fill: "#334155",
        }),
      ],
      background: "#ffffff",
    },
  },
  {
    name: "Bold Executive Resume",
    description: "Powerful and confident resume template with strong typography for C-level executives.",
    category: "Executive",
    renderEngine: "canvas",
    status: "active",
    isActive: true,
    isPremium: true,
    isPopular: true,
    isNewTemplate: true,
    tags: ["executive", "bold", "leadership", "corporate"],
    createdBy: "System",
    thumbnail: "/assets/images/templates/default.jpg",
    canvasData: {
      version: "5.5.2",
      objects: [
        // Bold header with dark background
        createRect(0, 0, 800, 110, "#1e293b", { selectable: false, evented: false }),
        
        // Name - Large and bold
        createTextBox("MARCUS JOHNSON", 50, 30, 700, 54.24, {
          fontSize: 44,
          fontWeight: "bold",
          fill: "#ffffff",
          textAlign: "left",
        }),
        
        // Title in header
        createTextBox("Chief Operating Officer", 50, 85, 700, 18.08, {
          fontSize: 15,
          fill: "#cbd5e1",
        }),
        
        // Contact section below header
        createTextBox("mjohnson@email.com", 50, 125, 250, 13.56, {
          fontSize: 11,
          fill: "#475569",
        }),
        createTextBox("+1 (555) 999-8888", 320, 125, 200, 13.56, {
          fontSize: 11,
          fill: "#475569",
        }),
        createTextBox("Chicago, IL", 540, 125, 210, 13.56, {
          fontSize: 11,
          fill: "#475569",
        }),
        
        // Executive Summary
        createTextBox("EXECUTIVE SUMMARY", 50, 155, 700, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        createTextBox("Results-driven COO with 20+ years transforming operations and driving profitability for mid-size to Fortune 500 companies. Proven expertise in scaling operations, optimizing supply chains, and building high-performance teams. Led organizations through periods of 300%+ growth while maintaining operational excellence.", 50, 180, 700, 54.56, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Core Expertise
        createTextBox("CORE EXPERTISE", 50, 250, 700, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        createTextBox("Operations Management • Strategic Planning • P&L Management • Supply Chain Optimization\nChange Management • Team Building • Process Improvement • M&A Integration", 50, 275, 700, 27.7, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Experience
        createTextBox("EXECUTIVE EXPERIENCE", 50, 315, 700, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        
        // Job 1
        createTextBox("Chief Operating Officer", 50, 340, 500, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        createTextBox("Global Manufacturing Solutions | 2018 - Present", 50, 360, 500, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("• Oversee all operations across 12 facilities with 5,000+ employees globally\n• Reduced operational costs by $15M annually through strategic initiatives\n• Led digital transformation improving productivity by 45%\n• Reported directly to CEO and Board of Directors on operational performance", 50, 380, 700, 54.56, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Job 2
        createTextBox("VP of Operations", 50, 450, 500, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        createTextBox("Industrial Holdings Group | 2012 - 2018", 50, 470, 500, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("• Managed operations for $500M revenue business unit\n• Improved EBITDA margin from 12% to 18% over 6-year period\n• Executed successful integration of 3 acquired companies\n• Built operations team of 200+ professionals across multiple locations", 50, 490, 700, 54.56, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Job 3
        createTextBox("Director of Operations", 50, 560, 500, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        createTextBox("Production Systems Inc. | 2008 - 2012", 50, 580, 500, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("• Directed operations for manufacturing division with $200M annual revenue\n• Implemented lean manufacturing reducing costs by 25%\n• Led cross-functional initiatives improving on-time delivery from 85% to 98%\n• Developed and mentored management team of 15 direct reports", 50, 600, 700, 54.56, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Education
        createTextBox("EDUCATION", 50, 670, 700, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        createTextBox("Executive MBA", 50, 695, 500, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        createTextBox("Northwestern University, Kellogg School | 2006 - 2008", 50, 715, 550, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        createTextBox("Bachelor of Engineering, Industrial Engineering", 50, 740, 500, 15.68, {
          fontSize: 13,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        createTextBox("Purdue University | 1998 - 2002", 50, 760, 550, 13.56, {
          fontSize: 11,
          fill: "#64748b",
        }),
        
        // Board & Advisory
        createTextBox("BOARD & ADVISORY ROLES", 50, 790, 700, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        createTextBox("Board Member - Manufacturing Excellence Institute (2019 - Present) • Advisory Board - TechStart Ventures (2020 - Present)", 50, 815, 700, 27.7, {
          fontSize: 11,
          fill: "#334155",
        }),
        
        // Achievements
        createTextBox("KEY ACHIEVEMENTS", 50, 860, 700, 18.08, {
          fontSize: 15,
          fontWeight: "bold",
          fill: "#1e293b",
        }),
        createTextBox("• Recognized as Operations Executive of the Year 2023 • Led company to record profits 4 consecutive years • Successfully managed 5 major acquisitions", 50, 885, 700, 41.27, {
          fontSize: 11,
          fill: "#334155",
        }),
      ],
      background: "#ffffff",
    },
  },
];

async function seedTemplates() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix';
    
    // Determine database type
    let dbType = 'Unknown';
    if (mongoUri.includes('mongodb.net') || mongoUri.includes('mongodb+srv')) {
      dbType = 'MongoDB Atlas (Cloud)';
    } else if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      dbType = 'Local MongoDB';
    } else {
      dbType = 'Custom MongoDB';
    }
    
    console.log(`📡 Connecting to: ${dbType}`);
    console.log(`🔗 URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: "${dbName}"`);

    // Check existing templates
    const allExisting = await Template.find({});
    console.log(`Found ${allExisting.length} existing templates in database:`);
    allExisting.forEach(t => {
      console.log(`  - ${t.name} (${t.category})`);
    });

    // Check if our specific templates already exist
    const existingTemplates = await Template.find({
      name: { $in: sampleTemplates.map(t => t.name) }
    });

    if (existingTemplates.length > 0) {
      console.log(`\nFound ${existingTemplates.length} matching templates. Deleting and recreating...`);
      await Template.deleteMany({
        name: { $in: sampleTemplates.map(t => t.name) }
      });
    }

    // Insert templates
    const createdTemplates = await Template.insertMany(sampleTemplates);
    console.log(`\n✅ Successfully created ${createdTemplates.length} templates:`);
    createdTemplates.forEach(template => {
      console.log(`  - ${template.name} (${template.category}) - ID: ${template._id}`);
    });

    // Verify total count
    const finalCount = await Template.find({}).countDocuments();
    console.log(`\n📊 Total templates in database: ${finalCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();

