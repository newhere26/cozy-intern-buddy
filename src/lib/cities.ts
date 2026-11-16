/**
 * Cities offered in the onboarding city picker, grouped by country.
 * A country that has a list here only accepts cities from that list.
 * "Other" (or any country without a list) falls back to free text.
 */
export const CITIES: Record<string, string[]> = {
  India: [
    "Agartala", "Agra", "Ahmedabad", "Ajmer", "Akola", "Aligarh", "Allahabad (Prayagraj)", "Alappuzha", "Alwar",
    "Ambala", "Amravati", "Amritsar", "Anantapur", "Asansol", "Aurangabad", "Bareilly", "Belagavi", "Ballari",
    "Bengaluru", "Bhagalpur", "Bhavnagar", "Bhilai", "Bhopal", "Bhubaneswar", "Bikaner", "Bilaspur", "Burdwan",
    "Calicut (Kozhikode)", "Chandigarh", "Chennai", "Coimbatore", "Cuttack", "Darbhanga", "Dehradun", "Delhi",
    "Dhanbad", "Dibrugarh", "Durgapur", "Erode", "Faridabad", "Gandhinagar", "Gaya", "Ghaziabad", "Gorakhpur",
    "Gulbarga (Kalaburagi)", "Guntur", "Gurugram", "Guwahati", "Gwalior", "Haldia", "Hubballi", "Hyderabad",
    "Imphal", "Indore", "Itanagar", "Jabalpur", "Jaipur", "Jalandhar", "Jammu", "Jamnagar", "Jamshedpur",
    "Jodhpur", "Jorhat", "Kakinada", "Kannur", "Kanpur", "Karimnagar", "Karnal", "Kochi", "Kohima", "Kolhapur",
    "Kolkata", "Kollam", "Kota", "Kottayam", "Kurnool", "Lucknow", "Ludhiana", "Madurai", "Mangaluru", "Meerut",
    "Mirzapur", "Moradabad", "Mumbai", "Muzaffarpur", "Mysuru", "Nagpur", "Nanded", "Nashik", "Navi Mumbai",
    "Nellore", "Noida", "Panaji", "Patiala", "Patna", "Pondicherry (Puducherry)", "Port Blair", "Pune", "Raichur",
    "Raipur", "Rajahmundry", "Rajkot", "Ranchi", "Rohtak", "Rourkela", "Sagar", "Salem", "Sangli", "Shillong",
    "Shimla", "Siliguri", "Solapur", "Srinagar", "Surat", "Thane", "Thiruvananthapuram", "Thrissur",
    "Tiruchirappalli", "Tirunelveli", "Tirupati", "Udaipur", "Ujjain", "Vadodara", "Varanasi", "Vellore",
    "Vijayawada", "Visakhapatnam", "Warangal",
  ],
  Pakistan: [
    "Abbottabad", "Bahawalpur", "Faisalabad", "Gujranwala", "Hyderabad", "Islamabad", "Karachi", "Lahore",
    "Larkana", "Multan", "Peshawar", "Quetta", "Rawalpindi", "Sargodha", "Sialkot", "Sukkur",
  ],
  Bangladesh: [
    "Barisal", "Bogra", "Chattogram", "Comilla", "Dhaka", "Dinajpur", "Faridpur", "Khulna", "Mymensingh",
    "Rajshahi", "Rangpur", "Savar", "Sylhet",
  ],
  "Sri Lanka": [
    "Anuradhapura", "Batticaloa", "Colombo", "Galle", "Jaffna", "Kandy", "Kurunegala", "Matara", "Negombo",
    "Ratnapura",
  ],
  Nepal: [
    "Bharatpur", "Biratnagar", "Birgunj", "Butwal", "Dharan", "Dhulikhel", "Hetauda", "Janakpur", "Kathmandu",
    "Lalitpur", "Nepalgunj", "Pokhara",
  ],
  Bhutan: ["Gelephu", "Paro", "Phuentsholing", "Punakha", "Thimphu", "Trongsa"],
  Maldives: ["Addu City", "Fuvahmulah", "Hulhumalé", "Kulhudhuffushi", "Malé"],
  "United States": [
    "Atlanta", "Austin", "Baltimore", "Boston", "Charlotte", "Chicago", "Cincinnati", "Cleveland", "Columbus",
    "Dallas", "Denver", "Detroit", "Houston", "Indianapolis", "Jacksonville", "Kansas City", "Las Vegas",
    "Los Angeles", "Louisville", "Memphis", "Miami", "Milwaukee", "Minneapolis", "Nashville", "New Haven",
    "New Orleans", "New York", "Newark", "Oakland", "Philadelphia", "Phoenix", "Pittsburgh", "Portland",
    "Rochester", "Sacramento", "Salt Lake City", "San Antonio", "San Diego", "San Francisco", "Seattle",
    "St. Louis", "Tampa", "Washington DC",
  ],
  "United Kingdom": [
    "Aberdeen", "Belfast", "Birmingham", "Bradford", "Brighton", "Bristol", "Cambridge", "Cardiff", "Coventry",
    "Dundee", "Edinburgh", "Exeter", "Glasgow", "Leeds", "Leicester", "Liverpool", "London", "Manchester",
    "Newcastle", "Norwich", "Nottingham", "Oxford", "Plymouth", "Portsmouth", "Sheffield", "Southampton",
    "Swansea",
  ],
  Canada: [
    "Calgary", "Edmonton", "Halifax", "Hamilton", "Kingston", "London", "Montreal", "Ottawa", "Quebec City",
    "Saskatoon", "St. John's", "Toronto", "Vancouver", "Victoria", "Winnipeg",
  ],
  Australia: [
    "Adelaide", "Brisbane", "Canberra", "Darwin", "Geelong", "Gold Coast", "Hobart", "Melbourne", "Newcastle",
    "Perth", "Sydney", "Townsville", "Wollongong",
  ],
  "United Arab Emirates": ["Abu Dhabi", "Ajman", "Al Ain", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah"],
  Singapore: ["Singapore"],
};

export function citiesFor(country: string): string[] | null {
  return CITIES[country] ?? null;
}

/** True when `city` is an accepted value for `country`. */
export function isValidCity(country: string, city: string): boolean {
  const list = citiesFor(country);
  if (!list) return /^[\p{L}\s'.-]+$/u.test(city.trim()) && city.trim().length > 0;
  return list.some((c) => c.toLowerCase() === city.trim().toLowerCase());
}

/** Best matches first: names starting with the query, then names containing it. */
export function searchCities(country: string, query: string, limit = 50): string[] {
  const list = citiesFor(country) ?? [];
  const q = query.trim().toLowerCase();
  if (!q) return list.slice(0, limit);
  const starts = list.filter((c) => c.toLowerCase().startsWith(q));
  const contains = list.filter((c) => !c.toLowerCase().startsWith(q) && c.toLowerCase().includes(q));
  return [...starts, ...contains].slice(0, limit);
}
