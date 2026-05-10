import bcrypt from "bcryptjs";
import { PrismaClient, PositionCategory, PositionLevel, StateType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const stateRecords = [
  { name: "Andhra Pradesh", code: "AP", type: StateType.STATE, capital: "Amaravati", zone: "South", mapX: 61, mapY: 65, assemblySeats: 175, councilSeats: 58, lokSabhaSeats: 25, rajyaSabhaSeats: 11 },
  { name: "Arunachal Pradesh", code: "AR", type: StateType.STATE, capital: "Itanagar", zone: "North East", mapX: 88, mapY: 17, assemblySeats: 60, councilSeats: 0, lokSabhaSeats: 2, rajyaSabhaSeats: 1 },
  { name: "Assam", code: "AS", type: StateType.STATE, capital: "Dispur", zone: "North East", mapX: 78, mapY: 27, assemblySeats: 126, councilSeats: 0, lokSabhaSeats: 14, rajyaSabhaSeats: 7 },
  { name: "Bihar", code: "BR", type: StateType.STATE, capital: "Patna", zone: "East", mapX: 58, mapY: 29, assemblySeats: 243, councilSeats: 75, lokSabhaSeats: 40, rajyaSabhaSeats: 16 },
  { name: "Chhattisgarh", code: "CG", type: StateType.STATE, capital: "Raipur", zone: "Central", mapX: 50, mapY: 43, assemblySeats: 90, councilSeats: 0, lokSabhaSeats: 11, rajyaSabhaSeats: 5 },
  { name: "Goa", code: "GA", type: StateType.STATE, capital: "Panaji", zone: "West", mapX: 23, mapY: 63, assemblySeats: 40, councilSeats: 0, lokSabhaSeats: 2, rajyaSabhaSeats: 1 },
  { name: "Gujarat", code: "GJ", type: StateType.STATE, capital: "Gandhinagar", zone: "West", mapX: 15, mapY: 40, assemblySeats: 182, councilSeats: 0, lokSabhaSeats: 26, rajyaSabhaSeats: 11 },
  { name: "Haryana", code: "HR", type: StateType.STATE, capital: "Chandigarh", zone: "North", mapX: 29, mapY: 18, assemblySeats: 90, councilSeats: 0, lokSabhaSeats: 10, rajyaSabhaSeats: 5 },
  { name: "Himachal Pradesh", code: "HP", type: StateType.STATE, capital: "Shimla", zone: "North", mapX: 31, mapY: 12, assemblySeats: 68, councilSeats: 0, lokSabhaSeats: 4, rajyaSabhaSeats: 3 },
  { name: "Jharkhand", code: "JH", type: StateType.STATE, capital: "Ranchi", zone: "East", mapX: 53, mapY: 36, assemblySeats: 81, councilSeats: 0, lokSabhaSeats: 14, rajyaSabhaSeats: 6 },
  { name: "Karnataka", code: "KA", type: StateType.STATE, capital: "Bengaluru", zone: "South", mapX: 28, mapY: 61, assemblySeats: 224, councilSeats: 75, lokSabhaSeats: 28, rajyaSabhaSeats: 12 },
  { name: "Kerala", code: "KL", type: StateType.STATE, capital: "Thiruvananthapuram", zone: "South", mapX: 21, mapY: 74, assemblySeats: 140, councilSeats: 0, lokSabhaSeats: 20, rajyaSabhaSeats: 9 },
  { name: "Madhya Pradesh", code: "MP", type: StateType.STATE, capital: "Bhopal", zone: "Central", mapX: 34, mapY: 38, assemblySeats: 230, councilSeats: 0, lokSabhaSeats: 29, rajyaSabhaSeats: 11 },
  { name: "Maharashtra", code: "MH", type: StateType.STATE, capital: "Mumbai", zone: "West", mapX: 24, mapY: 51, assemblySeats: 288, councilSeats: 78, lokSabhaSeats: 48, rajyaSabhaSeats: 19 },
  { name: "Manipur", code: "MN", type: StateType.STATE, capital: "Imphal", zone: "North East", mapX: 84, mapY: 35, assemblySeats: 60, councilSeats: 0, lokSabhaSeats: 2, rajyaSabhaSeats: 1 },
  { name: "Meghalaya", code: "ML", type: StateType.STATE, capital: "Shillong", zone: "North East", mapX: 73, mapY: 33, assemblySeats: 60, councilSeats: 0, lokSabhaSeats: 2, rajyaSabhaSeats: 1 },
  { name: "Mizoram", code: "MZ", type: StateType.STATE, capital: "Aizawl", zone: "North East", mapX: 79, mapY: 42, assemblySeats: 40, councilSeats: 0, lokSabhaSeats: 1, rajyaSabhaSeats: 1 },
  { name: "Nagaland", code: "NL", type: StateType.STATE, capital: "Kohima", zone: "North East", mapX: 84, mapY: 29, assemblySeats: 60, councilSeats: 0, lokSabhaSeats: 1, rajyaSabhaSeats: 1 },
  { name: "Odisha", code: "OD", type: StateType.STATE, capital: "Bhubaneswar", zone: "East", mapX: 53, mapY: 49, assemblySeats: 147, councilSeats: 0, lokSabhaSeats: 21, rajyaSabhaSeats: 10 },
  { name: "Punjab", code: "PB", type: StateType.STATE, capital: "Chandigarh", zone: "North", mapX: 22, mapY: 16, assemblySeats: 117, councilSeats: 0, lokSabhaSeats: 13, rajyaSabhaSeats: 7 },
  { name: "Rajasthan", code: "RJ", type: StateType.STATE, capital: "Jaipur", zone: "North", mapX: 18, mapY: 27, assemblySeats: 200, councilSeats: 0, lokSabhaSeats: 25, rajyaSabhaSeats: 10 },
  { name: "Sikkim", code: "SK", type: StateType.STATE, capital: "Gangtok", zone: "North East", mapX: 61, mapY: 20, assemblySeats: 32, councilSeats: 0, lokSabhaSeats: 1, rajyaSabhaSeats: 1 },
  { name: "Tamil Nadu", code: "TN", type: StateType.STATE, capital: "Chennai", zone: "South", mapX: 33, mapY: 76, assemblySeats: 234, councilSeats: 0, lokSabhaSeats: 39, rajyaSabhaSeats: 18 },
  { name: "Telangana", code: "TS", type: StateType.STATE, capital: "Hyderabad", zone: "South", mapX: 38, mapY: 55, assemblySeats: 119, councilSeats: 40, lokSabhaSeats: 17, rajyaSabhaSeats: 7 },
  { name: "Tripura", code: "TR", type: StateType.STATE, capital: "Agartala", zone: "North East", mapX: 73, mapY: 40, assemblySeats: 60, councilSeats: 0, lokSabhaSeats: 2, rajyaSabhaSeats: 1 },
  { name: "Uttar Pradesh", code: "UP", type: StateType.STATE, capital: "Lucknow", zone: "North", mapX: 42, mapY: 24, assemblySeats: 403, councilSeats: 100, lokSabhaSeats: 80, rajyaSabhaSeats: 31 },
  { name: "Uttarakhand", code: "UK", type: StateType.STATE, capital: "Dehradun", zone: "North", mapX: 37, mapY: 16, assemblySeats: 70, councilSeats: 0, lokSabhaSeats: 5, rajyaSabhaSeats: 3 },
  { name: "West Bengal", code: "WB", type: StateType.STATE, capital: "Kolkata", zone: "East", mapX: 61, mapY: 34, assemblySeats: 294, councilSeats: 0, lokSabhaSeats: 42, rajyaSabhaSeats: 16 },
  { name: "Andaman and Nicobar Islands", code: "AN", type: StateType.UNION_TERRITORY, capital: "Port Blair", zone: "Islands", mapX: 60, mapY: 90, assemblySeats: 0, councilSeats: 0, lokSabhaSeats: 1, rajyaSabhaSeats: 0 },
  { name: "Chandigarh", code: "CH", type: StateType.UNION_TERRITORY, capital: "Chandigarh", zone: "North", mapX: 24, mapY: 15, assemblySeats: 0, councilSeats: 0, lokSabhaSeats: 1, rajyaSabhaSeats: 0 },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DN", type: StateType.UNION_TERRITORY, capital: "Daman", zone: "West", mapX: 15, mapY: 49, assemblySeats: 0, councilSeats: 0, lokSabhaSeats: 2, rajyaSabhaSeats: 0 },
  { name: "Delhi", code: "DL", type: StateType.UNION_TERRITORY, capital: "New Delhi", zone: "North", mapX: 28, mapY: 21, assemblySeats: 70, councilSeats: 0, lokSabhaSeats: 7, rajyaSabhaSeats: 3 },
  { name: "Jammu and Kashmir", code: "JK", type: StateType.UNION_TERRITORY, capital: "Srinagar / Jammu", zone: "North", mapX: 26, mapY: 6, assemblySeats: 90, councilSeats: 0, lokSabhaSeats: 5, rajyaSabhaSeats: 4 },
  { name: "Ladakh", code: "LA", type: StateType.UNION_TERRITORY, capital: "Leh", zone: "North", mapX: 39, mapY: 5, assemblySeats: 0, councilSeats: 0, lokSabhaSeats: 1, rajyaSabhaSeats: 0 },
  { name: "Lakshadweep", code: "LD", type: StateType.UNION_TERRITORY, capital: "Kavaratti", zone: "Islands", mapX: 8, mapY: 74, assemblySeats: 0, councilSeats: 0, lokSabhaSeats: 1, rajyaSabhaSeats: 0 },
  { name: "Puducherry", code: "PY", type: StateType.UNION_TERRITORY, capital: "Puducherry", zone: "South", mapX: 36, mapY: 71, assemblySeats: 30, councilSeats: 0, lokSabhaSeats: 1, rajyaSabhaSeats: 1 }
];

const parties = [
  { name: "Bharatiya Janata Party", abbreviation: "BJP", ideology: "Conservative, nationalist", colorHex: "#f97316" },
  { name: "Indian National Congress", abbreviation: "INC", ideology: "Big tent, social liberal", colorHex: "#2563eb" },
  { name: "Dravida Munnetra Kazhagam", abbreviation: "DMK", ideology: "Regional, social justice", colorHex: "#be123c" },
  { name: "All India Trinamool Congress", abbreviation: "AITC", ideology: "Regional, centrist", colorHex: "#16a34a" },
  { name: "Independent / Non-partisan", abbreviation: "IND", ideology: "Non-partisan", colorHex: "#64748b" }
];

const positions = [
  { name: "President of India", category: PositionCategory.CONSTITUTIONAL, level: PositionLevel.NATIONAL, isElective: true, sortOrder: 1 },
  { name: "Prime Minister of India", category: PositionCategory.POLITICAL, level: PositionLevel.NATIONAL, isElective: true, sortOrder: 2 },
  { name: "Vice President of India", category: PositionCategory.CONSTITUTIONAL, level: PositionLevel.NATIONAL, isElective: true, sortOrder: 3 },
  { name: "Union Cabinet Minister", category: PositionCategory.POLITICAL, level: PositionLevel.NATIONAL, isElective: false, sortOrder: 4 },
  { name: "Governor", category: PositionCategory.CONSTITUTIONAL, level: PositionLevel.STATE, isElective: false, sortOrder: 5 },
  { name: "Lt. Governor / Administrator", category: PositionCategory.CONSTITUTIONAL, level: PositionLevel.UNION_TERRITORY, isElective: false, sortOrder: 6 },
  { name: "Chief Minister", category: PositionCategory.POLITICAL, level: PositionLevel.STATE, isElective: true, sortOrder: 7 },
  { name: "Deputy Chief Minister", category: PositionCategory.POLITICAL, level: PositionLevel.STATE, isElective: true, sortOrder: 8 },
  { name: "State Cabinet Minister", category: PositionCategory.POLITICAL, level: PositionLevel.STATE, isElective: true, sortOrder: 9 },
  { name: "Chief Justice of India", category: PositionCategory.JUDICIAL, level: PositionLevel.NATIONAL, isElective: false, sortOrder: 10 },
  { name: "Supreme Court Judge", category: PositionCategory.JUDICIAL, level: PositionLevel.NATIONAL, isElective: false, sortOrder: 11 },
  { name: "Chief of Defence Staff", category: PositionCategory.DEFENCE, level: PositionLevel.NATIONAL, isElective: false, sortOrder: 12 },
  { name: "Chief of Army Staff", category: PositionCategory.DEFENCE, level: PositionLevel.NATIONAL, isElective: false, sortOrder: 13 },
  { name: "Chief of Naval Staff", category: PositionCategory.DEFENCE, level: PositionLevel.NATIONAL, isElective: false, sortOrder: 14 },
  { name: "Chief of Air Staff", category: PositionCategory.DEFENCE, level: PositionLevel.NATIONAL, isElective: false, sortOrder: 15 },
  { name: "Lok Sabha Speaker", category: PositionCategory.LEGISLATIVE, level: PositionLevel.NATIONAL, isElective: true, sortOrder: 16 },
  { name: "Rajya Sabha Chairman", category: PositionCategory.LEGISLATIVE, level: PositionLevel.NATIONAL, isElective: true, sortOrder: 17 },
  { name: "Member of Legislative Assembly", category: PositionCategory.LEGISLATIVE, level: PositionLevel.STATE, isElective: true, sortOrder: 18 },
  { name: "Lok Sabha MP", category: PositionCategory.LEGISLATIVE, level: PositionLevel.NATIONAL, isElective: true, sortOrder: 19 },
  { name: "Rajya Sabha MP", category: PositionCategory.LEGISLATIVE, level: PositionLevel.NATIONAL, isElective: true, sortOrder: 20 },
  { name: "Vidhan Sabha Speaker", category: PositionCategory.LEGISLATIVE, level: PositionLevel.STATE, isElective: true, sortOrder: 21 },
  { name: "Vidhan Parishad Chairman", category: PositionCategory.LEGISLATIVE, level: PositionLevel.STATE, isElective: true, sortOrder: 22 },
  { name: "Cabinet Secretary", category: PositionCategory.ADMINISTRATIVE, level: PositionLevel.NATIONAL, isElective: false, sortOrder: 23 },
  { name: "Chief Secretary", category: PositionCategory.ADMINISTRATIVE, level: PositionLevel.STATE, isElective: false, sortOrder: 24 }
];

const ministries = [
  { name: "Ministry of Defence", shortName: "Defence", description: "National defence, military affairs, and strategic policy." },
  { name: "Ministry of Home Affairs", shortName: "Home", description: "Internal security, centre-state relations, and public safety." },
  { name: "Ministry of Finance", shortName: "Finance", description: "Budget, revenue, fiscal policy, and economic governance." },
  { name: "Ministry of External Affairs", shortName: "External Affairs", description: "Diplomatic relations and foreign policy." },
  { name: "Ministry of Education", shortName: "Education", description: "National education policy, higher education, and schooling." },
  { name: "Ministry of Railways", shortName: "Railways", description: "Rail transport, infrastructure, and modernization." },
  { name: "Ministry of Agriculture", shortName: "Agriculture", description: "Agriculture policy, farmers welfare, and rural productivity." },
  { name: "Ministry of Urban Development", shortName: "Urban Development", description: "Urban planning, civic infrastructure, and housing." }
];

const people = [
  {
    fullName: "Droupadi Murmu",
    honorific: "Smt.",
    party: "Independent / Non-partisan",
    homeState: "Odisha",
    photoUrl: "/images/official-placeholder.svg",
    biography: "India's 15th President and a former Governor of Jharkhand, known for a long public service career spanning grassroots politics and constitutional office.",
    education: "Rama Devi Women's College, Bhubaneswar",
    officialWebsite: "https://presidentofindia.nic.in/"
  },
  {
    fullName: "Narendra Modi",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Gujarat",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Serving as Prime Minister with a governance agenda focused on infrastructure, digital public services, manufacturing, and welfare delivery.",
    education: "University of Delhi, Gujarat University",
    officialWebsite: "https://www.pmindia.gov.in/",
    twitterUrl: "https://x.com/narendramodi"
  },
  {
    fullName: "Jagdeep Dhankhar",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Rajasthan",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Vice President of India and ex officio Chairman of the Rajya Sabha, with experience across law, parliamentary affairs, and public office.",
    education: "University of Rajasthan",
    officialWebsite: "https://vicepresidentofindia.nic.in/"
  },
  {
    fullName: "Om Birla",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Rajasthan",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Senior parliamentarian serving as Speaker of the Lok Sabha with a focus on legislative productivity and parliamentary innovation.",
    education: "Maharshi Dayanand Saraswati University"
  },
  {
    fullName: "Rajnath Singh",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Uttar Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Union Defence Minister and former Chief Minister of Uttar Pradesh, overseeing defence modernization and strategic policy.",
    education: "Gorakhpur University"
  },
  {
    fullName: "Amit Shah",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Gujarat",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Union Home Minister overseeing internal security, disaster response, and centre-state coordination.",
    education: "CU Shah Science College, Ahmedabad"
  },
  {
    fullName: "Nirmala Sitharaman",
    honorific: "Smt.",
    party: "Bharatiya Janata Party",
    homeState: "Tamil Nadu",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Union Finance Minister leading fiscal strategy, budget policy, and macroeconomic reforms.",
    education: "Seethalakshmi Ramaswami College, Jawaharlal Nehru University"
  },
  {
    fullName: "S. Jaishankar",
    honorific: "Dr.",
    party: "Bharatiya Janata Party",
    homeState: "Delhi",
    photoUrl: "/images/official-placeholder.svg",
    biography: "External Affairs Minister and former diplomat focused on strategic partnerships, regional diplomacy, and India's global positioning.",
    education: "St. Stephen's College, Jawaharlal Nehru University"
  },
  {
    fullName: "Ashwini Vaishnaw",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Odisha",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Union minister associated with large-scale transport and digital modernization portfolios.",
    education: "MBM Engineering College, IIT Kanpur, Wharton School"
  },
  {
    fullName: "Shivraj Singh Chouhan",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Madhya Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Union minister and former Chief Minister with a governance focus on agriculture, welfare, and rural systems.",
    education: "Barkatullah University"
  },
  {
    fullName: "Justice B. R. Gavai",
    honorific: "Justice",
    party: "Independent / Non-partisan",
    homeState: "Maharashtra",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Senior jurist whose work spans constitutional interpretation, federal balance, and access to justice.",
    education: "Government Law College, Mumbai"
  },
  {
    fullName: "Justice Surya Kant",
    honorific: "Justice",
    party: "Independent / Non-partisan",
    homeState: "Haryana",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Judge of the Supreme Court of India with notable contributions across civil, constitutional, and administrative law.",
    education: "Kurukshetra University"
  },
  {
    fullName: "Justice Vikram Nath",
    honorific: "Justice",
    party: "Independent / Non-partisan",
    homeState: "Uttar Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Supreme Court judge with experience from constitutional benches and high court administration.",
    education: "University of Allahabad"
  },
  {
    fullName: "General Anil Chauhan",
    honorific: "General",
    party: "Independent / Non-partisan",
    homeState: "Uttarakhand",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Chief of Defence Staff coordinating tri-service planning, jointness, and theatre-level modernization.",
    education: "National Defence Academy, Indian Military Academy"
  },
  {
    fullName: "General Upendra Dwivedi",
    honorific: "General",
    party: "Independent / Non-partisan",
    homeState: "Madhya Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Chief of Army Staff leading personnel readiness, doctrine evolution, and operational preparedness.",
    education: "Sainik School Rewa, National Defence Academy"
  },
  {
    fullName: "Admiral Dinesh K. Tripathi",
    honorific: "Admiral",
    party: "Independent / Non-partisan",
    homeState: "Uttar Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Chief of Naval Staff with a focus on maritime security, fleet capability, and regional presence.",
    education: "National Defence Academy"
  },
  {
    fullName: "Air Chief Marshal Amar Preet Singh",
    honorific: "Air Chief Marshal",
    party: "Independent / Non-partisan",
    homeState: "Punjab",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Chief of Air Staff leading capability enhancement, aerospace readiness, and air power strategy.",
    education: "National Defence Academy, Defence Services Staff College"
  },
  {
    fullName: "Anandiben Patel",
    honorific: "Smt.",
    party: "Bharatiya Janata Party",
    homeState: "Gujarat",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Governor with prior experience as Chief Minister and senior legislator.",
    education: "M.Ed., Gujarat University"
  },
  {
    fullName: "Yogi Adityanath",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Uttar Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Chief Minister of Uttar Pradesh focused on infrastructure, law and order, and welfare systems.",
    education: "Hemwati Nandan Bahuguna Garhwal University"
  },
  {
    fullName: "C. V. Ananda Bose",
    honorific: "Dr.",
    party: "Independent / Non-partisan",
    homeState: "Kerala",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Governor and former civil servant with experience in administration and public policy.",
    education: "Kerala University"
  },
  {
    fullName: "Mamata Banerjee",
    honorific: "Smt.",
    party: "All India Trinamool Congress",
    homeState: "West Bengal",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Chief Minister of West Bengal and a long-standing national political figure.",
    education: "University of Calcutta"
  },
  {
    fullName: "R. N. Ravi",
    honorific: "Shri",
    party: "Independent / Non-partisan",
    homeState: "Bihar",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Governor with experience in public security and national administration.",
    education: "University of Patna"
  },
  {
    fullName: "M. K. Stalin",
    honorific: "Thiru",
    party: "Dravida Munnetra Kazhagam",
    homeState: "Tamil Nadu",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Chief Minister of Tamil Nadu focused on social welfare, industrial growth, and administrative modernization.",
    education: "Presidency College, Chennai"
  },
  {
    fullName: "Thawar Chand Gehlot",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Madhya Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Governor and former Union minister with experience in parliamentary and social justice portfolios.",
    education: "Vikram University"
  },
  {
    fullName: "Siddaramaiah",
    honorific: "Shri",
    party: "Indian National Congress",
    homeState: "Karnataka",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Chief Minister of Karnataka and senior legislator with long experience in finance and welfare policymaking.",
    education: "Sharada Vilas Law College"
  },
  {
    fullName: "Sanjay Verma",
    party: "Bharatiya Janata Party",
    homeState: "Uttar Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Illustrative sample record representing a state cabinet portfolio.",
    education: "Sample profile for demo data."
  },
  {
    fullName: "Priya Sharma",
    party: "Bharatiya Janata Party",
    homeState: "Uttar Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Illustrative sample MLA record used to demonstrate constituency-level data structures.",
    education: "Sample profile for demo data."
  },
  {
    fullName: "Aarav Deshmukh",
    party: "Bharatiya Janata Party",
    homeState: "Maharashtra",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Illustrative sample Lok Sabha member record for portal demonstrations.",
    education: "Sample profile for demo data."
  },
  {
    fullName: "Meera Nair",
    party: "Indian National Congress",
    homeState: "Karnataka",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Illustrative sample Chief Secretary record for administrative category coverage.",
    education: "Sample profile for demo data."
  },
  {
    fullName: "T. V. Raman",
    party: "Independent / Non-partisan",
    homeState: "Delhi",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Illustrative sample Cabinet Secretary profile for administrative workflows.",
    education: "Sample profile for demo data."
  },
  {
    fullName: "Ram Nath Kovind",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Uttar Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Former President of India.",
    education: "DAV College, Kanpur University"
  },
  {
    fullName: "Pranab Mukherjee",
    honorific: "Shri",
    party: "Indian National Congress",
    homeState: "West Bengal",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Former President of India and veteran parliamentarian.",
    education: "University of Calcutta"
  },
  {
    fullName: "A. P. J. Abdul Kalam",
    honorific: "Dr.",
    party: "Independent / Non-partisan",
    homeState: "Tamil Nadu",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Former President of India and eminent scientist.",
    education: "Madras Institute of Technology"
  },
  {
    fullName: "Manmohan Singh",
    honorific: "Dr.",
    party: "Indian National Congress",
    homeState: "Punjab",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Former Prime Minister of India and economist.",
    education: "Panjab University, University of Cambridge, University of Oxford"
  },
  {
    fullName: "Atal Bihari Vajpayee",
    honorific: "Shri",
    party: "Bharatiya Janata Party",
    homeState: "Madhya Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Former Prime Minister of India and distinguished parliamentarian.",
    education: "DAV College, Kanpur"
  },
  {
    fullName: "Indira Gandhi",
    honorific: "Smt.",
    party: "Indian National Congress",
    homeState: "Uttar Pradesh",
    photoUrl: "/images/official-placeholder.svg",
    biography: "Former Prime Minister of India and central figure in modern Indian political history.",
    education: "Somerville College, Oxford"
  }
];

type AppointmentSeed = {
  person: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  state?: string;
  ministry?: string;
  orderRank?: number;
  titleOverride?: string;
};

const appointments: AppointmentSeed[] = [
  { person: "Droupadi Murmu", position: "President of India", startDate: "2022-07-25", isCurrent: true, orderRank: 1 },
  { person: "Narendra Modi", position: "Prime Minister of India", startDate: "2014-05-26", isCurrent: true, orderRank: 1 },
  { person: "Jagdeep Dhankhar", position: "Vice President of India", startDate: "2022-08-11", isCurrent: true, orderRank: 1 },
  { person: "Jagdeep Dhankhar", position: "Rajya Sabha Chairman", startDate: "2022-08-11", isCurrent: true, orderRank: 1 },
  { person: "Om Birla", position: "Lok Sabha Speaker", startDate: "2019-06-19", isCurrent: true, orderRank: 1 },
  { person: "Rajnath Singh", position: "Union Cabinet Minister", startDate: "2019-05-31", isCurrent: true, ministry: "Ministry of Defence", orderRank: 2, titleOverride: "Defence Minister" },
  { person: "Amit Shah", position: "Union Cabinet Minister", startDate: "2019-05-31", isCurrent: true, ministry: "Ministry of Home Affairs", orderRank: 2, titleOverride: "Home Minister" },
  { person: "Nirmala Sitharaman", position: "Union Cabinet Minister", startDate: "2019-05-31", isCurrent: true, ministry: "Ministry of Finance", orderRank: 2, titleOverride: "Finance Minister" },
  { person: "S. Jaishankar", position: "Union Cabinet Minister", startDate: "2019-05-31", isCurrent: true, ministry: "Ministry of External Affairs", orderRank: 2, titleOverride: "External Affairs Minister" },
  { person: "Ashwini Vaishnaw", position: "Union Cabinet Minister", startDate: "2021-07-08", isCurrent: true, ministry: "Ministry of Railways", orderRank: 2, titleOverride: "Railways Minister" },
  { person: "Shivraj Singh Chouhan", position: "Union Cabinet Minister", startDate: "2024-06-10", isCurrent: true, ministry: "Ministry of Agriculture", orderRank: 2, titleOverride: "Agriculture Minister" },
  { person: "Justice B. R. Gavai", position: "Chief Justice of India", startDate: "2025-05-14", isCurrent: true, orderRank: 1 },
  { person: "Justice Surya Kant", position: "Supreme Court Judge", startDate: "2019-05-24", isCurrent: true, orderRank: 2 },
  { person: "Justice Vikram Nath", position: "Supreme Court Judge", startDate: "2021-08-31", isCurrent: true, orderRank: 2 },
  { person: "General Anil Chauhan", position: "Chief of Defence Staff", startDate: "2022-09-30", isCurrent: true, orderRank: 1 },
  { person: "General Upendra Dwivedi", position: "Chief of Army Staff", startDate: "2024-06-30", isCurrent: true, orderRank: 2 },
  { person: "Admiral Dinesh K. Tripathi", position: "Chief of Naval Staff", startDate: "2024-04-30", isCurrent: true, orderRank: 2 },
  { person: "Air Chief Marshal Amar Preet Singh", position: "Chief of Air Staff", startDate: "2024-09-30", isCurrent: true, orderRank: 2 },
  { person: "Anandiben Patel", position: "Governor", state: "Uttar Pradesh", startDate: "2019-07-29", isCurrent: true, orderRank: 1 },
  { person: "Yogi Adityanath", position: "Chief Minister", state: "Uttar Pradesh", startDate: "2017-03-19", isCurrent: true, orderRank: 1 },
  { person: "Sanjay Verma", position: "State Cabinet Minister", state: "Uttar Pradesh", startDate: "2022-03-25", isCurrent: true, ministry: "Ministry of Home Affairs", orderRank: 2, titleOverride: "Minister for Urban Governance (Sample)" },
  { person: "Priya Sharma", position: "Member of Legislative Assembly", state: "Uttar Pradesh", startDate: "2022-03-10", isCurrent: true, orderRank: 3, titleOverride: "MLA, Lucknow Central (Sample)" },
  { person: "Priya Sharma", position: "Vidhan Sabha Speaker", state: "Uttar Pradesh", startDate: "2024-03-28", isCurrent: true, orderRank: 1 },
  { person: "Aarav Deshmukh", position: "Lok Sabha MP", state: "Maharashtra", startDate: "2024-06-09", isCurrent: true, orderRank: 3, titleOverride: "MP, Mumbai South (Sample)" },
  { person: "C. V. Ananda Bose", position: "Governor", state: "West Bengal", startDate: "2022-11-23", isCurrent: true, orderRank: 1 },
  { person: "Mamata Banerjee", position: "Chief Minister", state: "West Bengal", startDate: "2011-05-20", isCurrent: true, orderRank: 1 },
  { person: "R. N. Ravi", position: "Governor", state: "Tamil Nadu", startDate: "2021-09-18", isCurrent: true, orderRank: 1 },
  { person: "M. K. Stalin", position: "Chief Minister", state: "Tamil Nadu", startDate: "2021-05-07", isCurrent: true, orderRank: 1 },
  { person: "Thawar Chand Gehlot", position: "Governor", state: "Karnataka", startDate: "2021-07-06", isCurrent: true, orderRank: 1 },
  { person: "Siddaramaiah", position: "Chief Minister", state: "Karnataka", startDate: "2023-05-20", isCurrent: true, orderRank: 1 },
  { person: "Meera Nair", position: "Chief Secretary", state: "Karnataka", startDate: "2024-01-15", isCurrent: true, orderRank: 2 },
  { person: "T. V. Raman", position: "Cabinet Secretary", startDate: "2024-08-30", isCurrent: true, orderRank: 2 },
  { person: "Ram Nath Kovind", position: "President of India", startDate: "2017-07-25", endDate: "2022-07-25", isCurrent: false, orderRank: 5 },
  { person: "Pranab Mukherjee", position: "President of India", startDate: "2012-07-25", endDate: "2017-07-25", isCurrent: false, orderRank: 5 },
  { person: "A. P. J. Abdul Kalam", position: "President of India", startDate: "2002-07-25", endDate: "2007-07-25", isCurrent: false, orderRank: 5 },
  { person: "Manmohan Singh", position: "Prime Minister of India", startDate: "2004-05-22", endDate: "2014-05-26", isCurrent: false, orderRank: 5 },
  { person: "Atal Bihari Vajpayee", position: "Prime Minister of India", startDate: "1998-03-19", endDate: "2004-05-22", isCurrent: false, orderRank: 5 },
  { person: "Indira Gandhi", position: "Prime Minister of India", startDate: "1980-01-14", endDate: "1984-10-31", isCurrent: false, orderRank: 5 }
];

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.person.deleteMany();
  await prisma.position.deleteMany();
  await prisma.state.deleteMany();
  await prisma.ministry.deleteMany();
  await prisma.politicalParty.deleteMany();
  await prisma.adminUser.deleteMany();

  const createdStates = new Map<string, string>();
  for (const state of stateRecords) {
    const record = await prisma.state.create({
      data: {
        ...state,
        slug: slugify(state.name),
        description: `${state.name} is tracked in the portal with executive, legislative, and administrative data layers.`,
        officialWebsite: "https://www.india.gov.in/"
      }
    });
    createdStates.set(state.name, record.id);
  }

  const createdParties = new Map<string, string>();
  for (const party of parties) {
    const record = await prisma.politicalParty.create({
      data: {
        ...party,
        slug: slugify(party.name)
      }
    });
    createdParties.set(party.name, record.id);
  }

  const createdPositions = new Map<string, string>();
  for (const position of positions) {
    const record = await prisma.position.create({
      data: {
        ...position,
        slug: slugify(position.name),
        description: `${position.name} records are managed through appointments so the portal can track both current office holders and historical timelines.`
      }
    });
    createdPositions.set(position.name, record.id);
  }

  const createdMinistries = new Map<string, string>();
  for (const ministry of ministries) {
    const record = await prisma.ministry.create({
      data: {
        ...ministry,
        slug: slugify(ministry.name),
        officialWebsite: "https://www.india.gov.in/"
      }
    });
    createdMinistries.set(ministry.name, record.id);
  }

  const createdPeople = new Map<string, string>();
  for (const person of people) {
    const record = await prisma.person.create({
      data: {
        fullName: person.fullName,
        slug: slugify(person.fullName),
        honorific: person.honorific,
        photoUrl: person.photoUrl,
        biography: person.biography,
        education: person.education,
        officialWebsite: person.officialWebsite,
        twitterUrl: person.twitterUrl,
        homeStateId: person.homeState ? createdStates.get(person.homeState) : undefined,
        politicalPartyId: person.party ? createdParties.get(person.party) : undefined,
        seoDescription: `${person.fullName} profile on the India Governance Portal.`
      }
    });
    createdPeople.set(person.fullName, record.id);
  }

  for (const appointment of appointments) {
    await prisma.appointment.create({
      data: {
        personId: createdPeople.get(appointment.person)!,
        positionId: createdPositions.get(appointment.position)!,
        stateId: appointment.state ? createdStates.get(appointment.state) : undefined,
        ministryId: appointment.ministry ? createdMinistries.get(appointment.ministry) : undefined,
        titleOverride: appointment.titleOverride,
        startDate: new Date(appointment.startDate),
        endDate: appointment.endDate ? new Date(appointment.endDate) : undefined,
        isCurrent: appointment.isCurrent ?? true,
        orderRank: appointment.orderRank ?? 0,
        notes: appointment.isCurrent === false ? "Historical timeline entry." : "Current appointment in starter dataset.",
        sourceUrl: "https://www.india.gov.in/"
      }
    });
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "Admin@123", 10);
  await prisma.adminUser.create({
    data: {
      name: "Portal Admin",
      email: process.env.ADMIN_EMAIL ?? "admin@indiagov.in",
      passwordHash,
      role: UserRole.SUPER_ADMIN
    }
  });

  console.log("Seeded India Governance Portal database.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
