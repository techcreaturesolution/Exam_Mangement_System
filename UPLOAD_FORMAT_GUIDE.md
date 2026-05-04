# Question Upload Format Guide

## CSV/Excel File Format for Importing Questions

### Required Columns

| Column Name | Description | Example |
|-------------|-------------|---------|
| **Question** | The MCQ question text | What is the full form of GFR? |
| **Option A** | First option | General Financial Rules |
| **Option B** | Second option | Government Fund Regulations |
| **Option C** | Third option | General Fund Rules |
| **Option D** | Fourth option | Government Financial Resources |
| **Answer** | Correct answer (A, B, C, or D) | A |
| **Marks** | Marks for correct answer (optional, default: 1) | 1 |
| **Negative Marks** | Marks deducted for wrong answer (optional, default: 0) | 0.25 |
| **Explanation** | Explanation for the correct answer (optional) | GFR stands for General Financial Rules... |

### Sample CSV File

```csv
Question,Option A,Option B,Option C,Option D,Answer,Marks,Negative Marks,Explanation
What is the full form of GFR?,General Financial Rules,Government Fund Regulations,General Fund Rules,Government Financial Resources,A,1,0,GFR stands for General Financial Rules issued by the Ministry of Finance
Which article of the Constitution deals with finance?,Article 112,Article 110,Article 114,Article 115,B,1,0.25,Article 110 deals with the definition of Money Bills
What is the minimum age for voting in India?,16,18,21,25,B,1,0,The 61st Amendment Act of 1988 reduced the voting age from 21 to 18 years
```

### How to Upload

1. **Admin Panel** → Go to **Question Bank** page
2. Click **"Import CSV/Excel"** button
3. Select the **Category** (e.g., Non Teaching Exam Preparation)
4. Select the **Subject/Topic** (e.g., GFR, Computer, English)
5. Select the **Level** (e.g., Easy, Medium, Hard)
6. Choose your CSV or Excel (.xlsx) file
7. Click **Upload**

### Important Notes

- **File formats supported:** `.csv`, `.xlsx`, `.xls`
- Column headers must match **exactly** as shown above (case-sensitive)
- The **Answer** column must contain only: `A`, `B`, `C`, or `D`
- **Marks** and **Negative Marks** are optional (defaults: 1 and 0)
- **Explanation** is optional but recommended for practice mode
- Maximum recommended: **500 questions per file** for best performance

### Category & Subject Hierarchy

```
Category (e.g., "Non Teaching Exam Preparation")
├── Subject/Topic 1 (e.g., "GFR - General Financial Rules")
│   ├── Practice Set 1 (25 MCQs)
│   ├── Practice Set 2 (25 MCQs)
│   └── Practice Set 3 (25 MCQs)
├── Subject/Topic 2 (e.g., "Computer Knowledge")
│   ├── Practice Set 1 (25 MCQs)
│   └── Practice Set 2 (25 MCQs)
├── Subject/Topic 3 (e.g., "English Grammar")
│   └── Practice Set 1 (25 MCQs)
└── Mock Tests (100 MCQs each, mixed topics)
    ├── Mock Test 1
    ├── Mock Test 2
    └── Mock Test 3
```

### Workflow for Creating Exams with Categories

1. **Create Category** (Admin → Categories)
   - Example: "Non Teaching Exam Preparation"

2. **Create Subjects/Topics** under the category (Admin → Subjects)
   - Example: "GFR", "Computer", "English", "General Knowledge"

3. **Upload Questions** for each subject (Admin → Question Bank → Import)
   - Select correct Category + Subject + Level when uploading
   - Upload separate CSV files per subject for organization

4. **Create Practice Sets** (Admin → Exams → Create Exam)
   - Type: Practice Set
   - Select Category + Subject
   - Set Number: 1, 2, 3... (25 questions each)
   - Duration: 30 minutes

5. **Create Mock Tests** (Admin → Exams → Create Exam)
   - Type: Mock Test
   - Select Category + Subject (can be mixed)
   - Questions: 100
   - Duration: 120 minutes

### Sample Excel Template

Download the template and fill in your questions:

| Question | Option A | Option B | Option C | Option D | Answer | Marks | Negative Marks | Explanation |
|----------|----------|----------|----------|----------|--------|-------|----------------|-------------|
| Your question here? | Option 1 | Option 2 | Option 3 | Option 4 | A | 1 | 0 | Explanation text |
