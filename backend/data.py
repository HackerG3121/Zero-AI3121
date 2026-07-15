# data.py
# Static mock data representing a first-year Computer Science & Engineering student: Alex Mercer

STUDENT_PROFILE = {
    "name": "Alex Mercer",
    "department": "Computer Science & Engineering",
    "batch": "2026 - 2030",
    "current_semester": "Semester 1",
    "roll_number": "CSE-2026-089",
    "exam_roll_number": "26CSE10089",
    "cgpa": "8.25",
    "proctor": "Prof. Arvind Kumar",
    "profile_image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop"
}

ATTENDANCE = {
    "overall": 78.0,
    "requirement": 75.0,
    "explanation": "Students must maintain a minimum of 75% attendance in each subject to be eligible to sit for the end-semester examinations. A short-fall down to 65% can only be condoned by the Dean on production of genuine medical certificates approved by the Proctor and HOD.",
    "subjects": [
        {
            "code": "CS-101",
            "name": "Python Programming",
            "attended": 36,
            "total": 40,
            "percentage": 90.0,
            "status": "Safe"
        },
        {
            "code": "MA-101",
            "name": "Mathematics-I",
            "attended": 33,
            "total": 40,
            "percentage": 82.5,
            "status": "Safe"
        },
        {
            "code": "CY-101",
            "name": "Engineering Chemistry",
            "attended": 31,
            "total": 40,
            "percentage": 77.5,
            "status": "Safe"
        },
        {
            "code": "EC-101",
            "name": "Basic Electronics",
            "attended": 29,
            "total": 40,
            "percentage": 72.5,
            "status": "Critical"
        },
        {
            "code": "PH-101",
            "name": "Applied Physics",
            "attended": 27,
            "total": 40,
            "percentage": 67.5,
            "status": "Critical"
        }
    ]
}

TIMETABLE = {
    "weekly": {
        "Monday": [
            {"time": "09:00 AM - 10:00 AM", "subject": "Mathematics-I", "code": "MA-101", "room": "Room A-302", "block": "Block A"},
            {"time": "10:00 AM - 11:00 AM", "subject": "Applied Physics", "code": "PH-101", "room": "Room B-105", "block": "Block B"},
            {"time": "11:00 AM - 11:30 AM", "subject": "Short Break", "code": "BREAK", "room": "Canteen", "block": "Central Courtyard"},
            {"time": "11:30 AM - 01:30 PM", "subject": "Python Programming Lab", "code": "CS-101P", "room": "Lab-3, 1st Floor", "block": "CSE Block"},
            {"time": "01:30 PM - 02:30 PM", "subject": "Lunch Break", "code": "BREAK", "room": "Main Canteen", "block": "Central Courtyard"},
            {"time": "02:30 PM - 04:30 PM", "subject": "Basic Electronics", "code": "EC-101", "room": "Room C-201", "block": "Block C"}
        ],
        "Tuesday": [
            {"time": "09:00 AM - 10:00 AM", "subject": "Engineering Chemistry", "code": "CY-101", "room": "Room A-202", "block": "Block A"},
            {"time": "10:00 AM - 11:00 AM", "subject": "Basic Electronics", "code": "EC-101", "room": "Room C-201", "block": "Block C"},
            {"time": "11:00 AM - 11:30 AM", "subject": "Short Break", "code": "BREAK", "room": "Canteen", "block": "Central Courtyard"},
            {"time": "11:30 AM - 01:30 PM", "subject": "Mathematics-I", "code": "MA-101", "room": "Room A-302", "block": "Block A"},
            {"time": "01:30 PM - 02:30 PM", "subject": "Lunch Break", "code": "BREAK", "room": "Main Canteen", "block": "Central Courtyard"},
            {"time": "02:30 PM - 04:30 PM", "subject": "Applied Physics Lab", "code": "PH-101P", "room": "Physics Lab", "block": "Science Block"}
        ],
        "Wednesday": [
            {"time": "09:00 AM - 11:00 AM", "subject": "Python Programming", "code": "CS-101", "room": "Room B-204", "block": "Block B"},
            {"time": "11:00 AM - 11:30 AM", "subject": "Short Break", "code": "BREAK", "room": "Canteen", "block": "Central Courtyard"},
            {"time": "11:30 AM - 01:30 PM", "subject": "Professional Communication", "code": "HS-101", "room": "Room A-101", "block": "Block A"},
            {"time": "01:30 PM - 02:30 PM", "subject": "Lunch Break", "code": "BREAK", "room": "Main Canteen", "block": "Central Courtyard"},
            {"time": "02:30 PM - 04:30 PM", "subject": "Library Hour", "code": "LIB", "room": "Central Library", "block": "Central Block"}
        ],
        "Thursday": [
            {"time": "09:00 AM - 10:00 AM", "subject": "Applied Physics", "code": "PH-101", "room": "Room B-105", "block": "Block B"},
            {"time": "10:00 AM - 11:00 AM", "subject": "Mathematics-I", "code": "MA-101", "room": "Room A-302", "block": "Block A"},
            {"time": "11:00 AM - 11:30 AM", "subject": "Short Break", "code": "BREAK", "room": "Canteen", "block": "Central Courtyard"},
            {"time": "11:30 AM - 01:30 PM", "subject": "Basic Electronics Lab", "code": "EC-101P", "room": "Electronics Lab", "block": "Block C"},
            {"time": "01:30 PM - 02:30 PM", "subject": "Lunch Break", "code": "BREAK", "room": "Main Canteen", "block": "Central Courtyard"},
            {"time": "02:30 PM - 04:30 PM", "subject": "Engineering Chemistry Lab", "code": "CY-101P", "room": "Chemistry Lab", "block": "Science Block"}
        ],
        "Friday": [
            {"time": "09:00 AM - 10:00 AM", "subject": "Python Programming", "code": "CS-101", "room": "Room B-204", "block": "Block B"},
            {"time": "10:00 AM - 11:00 AM", "subject": "Engineering Chemistry", "code": "CY-101", "room": "Room A-202", "block": "Block A"},
            {"time": "11:00 AM - 11:30 AM", "subject": "Short Break", "code": "BREAK", "room": "Canteen", "block": "Central Courtyard"},
            {"time": "11:30 AM - 01:30 PM", "subject": "Mathematics-I", "code": "MA-101", "room": "Room A-302", "block": "Block A"},
            {"time": "01:30 PM - 02:30 PM", "subject": "Lunch Break", "code": "BREAK", "room": "Main Canteen", "block": "Central Courtyard"},
            {"time": "02:30 PM - 04:30 PM", "subject": "Seminar / Aptitude Prep", "code": "APT", "room": "Seminar Hall-1", "block": "Block D"}
        ]
    }
}

EXAMS = {
    "hall_ticket": {
        "status": "Available for Download",
        "roll_number": "26CSE10089",
        "center_code": "CSE-BLOCK-MAIN",
        "instructions": "1. Download hall ticket from Zero AI portal.\n2. Print in high quality.\n3. Obtain signature from your Proctor (Prof. Arvind Kumar) before July 18, 2026."
    },
    "guidelines": [
        "Carrying college ID card and physical Hall Ticket is mandatory for entry.",
        "Mobile phones, smartwatches, digital calculators, and bluetooth devices are strictly prohibited in the exam hall.",
        "Students must report to the examination center at least 30 minutes before the scheduled time.",
        "Non-programmable scientific calculators are permitted for Mathematics and Electronics exams only."
    ],
    "schedules": [
        {
            "type": "Internal Assessment 2",
            "start_date": "2026-07-20",
            "status": "Upcoming",
            "subjects": [
                {"date": "2026-07-20", "time": "09:30 AM - 11:00 AM", "subject": "Mathematics-I", "code": "MA-101", "room": "Room A-302"},
                {"date": "2026-07-21", "time": "09:30 AM - 11:00 AM", "subject": "Applied Physics", "code": "PH-101", "room": "Room B-105"},
                {"date": "2026-07-22", "time": "09:30 AM - 11:00 AM", "subject": "Engineering Chemistry", "code": "CY-101", "room": "Room A-202"},
                {"date": "2026-07-23", "time": "09:30 AM - 11:00 AM", "subject": "Python Programming", "code": "CS-101", "room": "Room B-204"},
                {"date": "2026-07-23", "time": "01:30 PM - 03:00 PM", "subject": "Basic Electronics", "code": "EC-101", "room": "Room C-201"}
            ]
        },
        {
            "type": "Semester End Examination",
            "start_date": "2026-08-24",
            "status": "Scheduled",
            "subjects": [
                {"date": "2026-08-24", "time": "02:00 PM - 05:00 PM", "subject": "Mathematics-I", "code": "MA-101", "room": "Exam Hall-A"},
                {"date": "2026-08-26", "time": "02:00 PM - 05:00 PM", "subject": "Applied Physics", "code": "PH-101", "room": "Exam Hall-B"},
                {"date": "2026-08-28", "time": "02:00 PM - 05:00 PM", "subject": "Engineering Chemistry", "code": "CY-101", "room": "Exam Hall-A"},
                {"date": "2026-08-31", "time": "02:00 PM - 05:00 PM", "subject": "Python Programming", "code": "CS-101", "room": "Exam Hall-C"},
                {"date": "2026-09-02", "time": "02:00 PM - 05:00 PM", "subject": "Basic Electronics", "code": "EC-101", "room": "Exam Hall-B"}
            ]
        }
    ]
}

ASSIGNMENTS = [
    {
        "id": "asg-01",
        "subject": "Applied Physics",
        "code": "PH-101",
        "title": "Fiber Optics and Lasers",
        "due_date": "2026-07-15",
        "status": "Pending",
        "instructions": "Complete the derivation for numerical aperture and acceptance angle. Upload the scanned copy in PDF format to the LMS portal.",
        "weightage": "10%"
    },
    {
        "id": "asg-02",
        "subject": "Basic Electronics",
        "code": "EC-101",
        "title": "BJT Biasing Circuits",
        "due_date": "2026-07-16",
        "status": "Pending",
        "instructions": "Solve the 5 design problems on Fixed Bias and Voltage Divider Bias configurations. Submit your physical homework notebooks to Dr. Sneha Sharma.",
        "weightage": "5%"
    },
    {
        "id": "asg-03",
        "subject": "Mathematics-I",
        "code": "MA-101",
        "title": "Calculus and its Applications",
        "due_date": "2026-07-18",
        "status": "Pending",
        "instructions": "Solve the practice sheet on Double and Triple Integrals. Handwritten submissions are to be dropped in the designated box outside Room A-302.",
        "weightage": "10%"
    },
    {
        "id": "asg-04",
        "subject": "Python Programming",
        "code": "CS-101",
        "title": "File Handling & Exception Handling",
        "due_date": "2026-07-22",
        "status": "Pending",
        "instructions": "Create a console-based student database manager implementing CSV file operations and error validation. Submit your GitHub repository link.",
        "weightage": "10%"
    },
    {
        "id": "asg-05",
        "subject": "Engineering Chemistry",
        "code": "CY-101",
        "title": "Water Treatment Technologies",
        "due_date": "2026-07-12",
        "status": "Submitted",
        "instructions": "Research paper summary on the comparison of Reverse Osmosis and Electro-dialysis. Upload on portal.",
        "weightage": "5%"
    }
]

PLACEMENTS = {
    "drives": [
        {
            "id": "plc-01",
            "company": "Google",
            "role": "Software Engineer Intern",
            "ctc": "25 LPA equivalent (Stipend: 1.2 Lakhs/month)",
            "eligibility": "B.Tech CSE/IT, CGPA >= 8.0, No active backlogs",
            "date": "2026-08-01",
            "status": "Open",
            "process": "Online Coding Test (DSA) -> 3 Technical Rounds -> 1 Googleness Round"
        },
        {
            "id": "plc-02",
            "company": "Microsoft",
            "role": "Support Engineer Intern",
            "ctc": "15 LPA",
            "eligibility": "B.Tech All branches, CGPA >= 7.5, No active backlogs",
            "date": "2026-08-10",
            "status": "Open",
            "process": "MCQ Aptitude & Coding Test -> 2 Technical Rounds -> HR Round"
        },
        {
            "id": "plc-03",
            "company": "TCS (Tata Consultancy Services)",
            "role": "Ninja / Digital Developer",
            "ctc": "3.6 LPA - 7.2 LPA",
            "eligibility": "B.Tech All branches, CGPA >= 6.0, Max 1 active backlog",
            "date": "2026-08-18",
            "status": "Open",
            "process": "TCS NQT Test -> Coding Round (for Digital) -> Interview Round"
        }
    ],
    "internships": [
        {
            "company": "Infosys InStep",
            "role": "Global Internship Program",
            "duration": "8-12 weeks",
            "stipend": "Paid",
            "eligibility": "Pre-final and Final Year Students"
        },
        {
            "company": "Zero AI Labs",
            "role": "Frontend Developer Intern (PWA/Vue/React)",
            "duration": "12 weeks",
            "stipend": "15,000/month",
            "eligibility": "1st and 2nd Year B.Tech, solid HTML/JS/CSS understanding"
        }
    ],
    "preparation_tips": [
        "Solve at least 2 questions daily on LeetCode/GeeksforGeeks, focusing on Arrays, Strings, Hashing, and Trees.",
        "Thoroughly understand object-oriented programming concepts (OOPS) in Python/C++.",
        "Ensure your resume is formatted in a single-column layout (e.g. Jake's Resume or Deedy format) and highlights metrics and project outcomes."
    ],
    "aptitude_resources": [
        "IndiaBIX: Quant, Logical Reasoning, and Verbal Ability tests.",
        "R.S. Aggarwal - Quantitative Aptitude book.",
        "GeeksforGeeks Aptitude section: standard questions on work-time, speed-distance, probability."
    ]
}

FACULTY = [
    {
        "name": "Prof. Arvind Kumar",
        "designation": "HOD & Professor",
        "department": "Computer Science & Engineering",
        "cabin": "C-101, Main Block",
        "email": "arvind.kumar@college.edu",
        "timings": "02:00 PM - 04:00 PM (Tuesday, Thursday)",
        "subjects": ["Python Programming (CS-101)"]
    },
    {
        "name": "Dr. Sneha Sharma",
        "designation": "Associate Professor",
        "department": "Electronics & Comm. Engineering",
        "cabin": "E-203, Block E",
        "email": "sneha.sharma@college.edu",
        "timings": "11:30 AM - 01:00 PM (Monday, Wednesday)",
        "subjects": ["Basic Electronics (EC-101)"]
    },
    {
        "name": "Prof. Rajesh Patel",
        "designation": "Assistant Professor",
        "department": "Mathematics",
        "cabin": "M-302, Science Block",
        "email": "rajesh.patel@college.edu",
        "timings": "10:00 AM - 12:00 PM (Monday to Friday)",
        "subjects": ["Mathematics-I (MA-101)"]
    },
    {
        "name": "Dr. Anita Roy",
        "designation": "Professor",
        "department": "Applied Physics",
        "cabin": "P-102, Science Block",
        "email": "anita.roy@college.edu",
        "timings": "03:00 PM - 04:30 PM (Wednesday, Friday)",
        "subjects": ["Applied Physics (PH-101)"]
    },
    {
        "name": "Dr. Vikas Verma",
        "designation": "Assistant Professor",
        "department": "Applied Chemistry",
        "cabin": "CH-105, Science Block",
        "email": "vikas.verma@college.edu",
        "timings": "01:30 PM - 03:00 PM (Monday, Thursday)",
        "subjects": ["Engineering Chemistry (CY-101)"]
    }
]

CAMPUS_NAVIGATION = [
    {
        "name": "Central Library",
        "location": "Central Block, 2nd & 3rd Floors",
        "hours": "08:00 AM - 09:00 PM (Daily)",
        "description": "Housing over 50,000 physical books, digital reference systems, quiet study zones, and a computer research lab.",
        "facilities": "High-speed Wi-Fi, Discussion rooms, Printer services",
        "directions": "Enter through Central Block main gates. Walk straight past the atrium and take the central elevator or stairs to the 2nd floor."
    },
    {
        "name": "Computer Labs",
        "location": "CSE Block, 1st & 2nd Floors",
        "hours": "09:00 AM - 08:00 PM (Mon-Sat)",
        "description": "Equipped with high-performance workstations for programming, AI, and systems engineering courses.",
        "facilities": "Linux/Windows systems, GPU servers, high-speed wired LAN",
        "directions": "Go to the CSE Block. Take the main staircase on the left side of the entrance lobby. The labs (Lab 1 to 5) are aligned along the corridor."
    },
    {
        "name": "Main Canteen",
        "location": "Central Courtyard",
        "hours": "07:30 AM - 07:00 PM (Daily)",
        "description": "Offering a variety of affordable meals, healthy fresh juices, and hot snacks for students and staff.",
        "facilities": "Digital payment counters, outdoor and indoor seating",
        "directions": "Located at the center of the campus, easily visible from the admin block, with an open courtyard and umbrella-shaded tables."
    },
    {
        "name": "Administrative Office",
        "location": "Main Block, Ground Floor",
        "hours": "09:30 AM - 04:30 PM (Mon-Fri)",
        "description": "Responsible for student fees, verification certificates, transcript generation, admissions, and general queries.",
        "facilities": "Helpdesk counter, Token billing machines",
        "directions": "Located immediately on the right-hand side as you enter the campus's main administration building."
    },
    {
        "name": "Placement Cell",
        "location": "Admin Block, 1st Floor",
        "hours": "09:30 AM - 05:30 PM (Mon-Fri)",
        "description": "The hub for placement drives, internship notifications, resume reviews, and aptitude coaching sessions.",
        "facilities": "Interview cabins, Group discussion boardrooms",
        "directions": "Enter the Admin Block, walk up the main staircase to the 1st floor, and look for the Placement Cell entrance on your left."
    },
    {
        "name": "Central Auditorium",
        "location": "Behind Block C",
        "hours": "Events only",
        "description": "A state-of-the-art air-conditioned auditorium with 1000 seating capacity hosting fests, guest lectures, and inductions.",
        "facilities": "Surround sound, Stage setups, green rooms",
        "directions": "Walk past Block C and follow the wide concrete path leading towards the green lawn. The large circular building is the Auditorium."
    },
    {
        "name": "Student Hostels",
        "location": "North Campus Sector",
        "hours": "24/7 (Gate curfew: 09:30 PM)",
        "description": "Fully functional hostels offering single/double occupancy rooms, mess, and sports facilities for boys and girls.",
        "facilities": "Mess hall, Gymnasium, Recreation room, 24/7 security",
        "directions": "Walk along the main peripheral road towards the north end of the campus. Pass Gate 3, and you will see the hostel gates."
    },
    {
        "name": "Parking Yards",
        "location": "Near Gate 1 (Two-Wheelers) & Gate 2 (Cars)",
        "hours": "06:00 AM - 10:00 PM (Daily)",
        "description": "Segregated and security-monitored parking space for student, faculty, and visitor vehicles.",
        "facilities": "CCTV monitoring, EV charging points",
        "directions": "Gate 1 parking is immediately on the left of the main entrance gate. Gate 2 parking is located adjacent to the Science Block entrance."
    },
    {
        "name": "Medical Room",
        "location": "Block B, Ground Floor (Room B-101)",
        "hours": "09:00 AM - 05:00 PM (Doctor on Call 24/7)",
        "description": "First aid clinic offering medical consultations, pharmacy supplies, rest beds, and emergency ambulance access.",
        "facilities": "Emergency beds, Oxygen concentrators, Proctor approval slips",
        "directions": "Enter Block B from the courtyard side. Room B-101 is the very first room on the ground floor corridor."
    },
    {
        "name": "Sports Complex",
        "location": "South Campus Sector",
        "hours": "06:00 AM - 08:30 PM (Daily)",
        "description": "Campus sports facility with an open cricket/football ground, athletics track, and an indoor court for badminton and table tennis.",
        "facilities": "Showers, lockers, sports gear renting counter",
        "directions": "Proceed towards the south boundary behind the Science Block. The outdoor fields and the large steel-framed sports center are located here."
    }
]
