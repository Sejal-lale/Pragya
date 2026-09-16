# Pragya — Smart Civic Complaint & Resolution Platform

**Document Type:** Product Requirements Document (PRD)
**Product:** Civic WebApp
**Primary Users:** Citizens, Government Employees, Department Supervisors
**Platforms:** Web App / PWA, Government Dashboard
**Languages:** English, Hindi, and regional Indian languages

---

## 1. Product Overview

**Pragya** is a multilingual civic complaint management platform that allows citizens to report local problems through **voice or text**, supported by **photo evidence and automatic geolocation**.

The system converts an unstructured citizen complaint into a structured civic service request, automatically identifies the appropriate category and government department, and assigns it to the responsible government employee.

Government employees receive assigned complaints with a defined **resolution timeline/SLA**, update progress, upload proof of completion, and close the complaint. Supervisors can monitor department performance, overdue complaints, workloads, and resolution progress.

### Core Citizen Flow

**Speak/Write → Understand → Take Photo → Capture Location → Submit → Track → Resolution**

### Core Government Flow

**Receive → Categorize → Assign → Set Timeline → Work → Update → Submit Proof → Supervisor Verification → Resolve**

---

# 2. Problem Statement

Citizens often face problems such as:

* Potholes
* Garbage accumulation
* Broken streetlights
* Drainage problems
* Water leakage
* Damaged roads
* Illegal dumping
* Broken public infrastructure
* Unclean public spaces
* Stray animal-related civic complaints
* Other municipal issues

Current complaint systems can be difficult because citizens may:

* Not know which government department handles the problem.
* Not know the correct terminology or complaint category.
* Have difficulty filling long forms.
* Prefer speaking rather than typing.
* Speak languages other than English.
* Have difficulty describing the exact location.
* Not know what happened after submitting a complaint.
* Have no clear visibility into the expected resolution time.

Civic aims to remove these barriers.

---

# 3. Product Vision

> **Make reporting a civic problem as easy as sending a voice message.**

The citizen should not need to understand the government administrative structure.

Instead of asking:

> "Which department should I complain to?"

Civic asks:

> **"What's the problem?"**

The platform handles categorization, location, department routing, assignment, tracking, and escalation.

---

# 4. Goals

## Primary Goals

1. Make civic complaints extremely easy to submit.
2. Prioritize **voice-based complaint submission**.
3. Support English, Hindi, and regional languages.
4. Automatically convert unstructured complaints into structured data.
5. Automatically identify complaint category.
6. Automatically identify the appropriate government department.
7. Capture photo evidence.
8. Capture accurate geographic location.
9. Assign complaints to responsible government employees.
10. Give every complaint a resolution timeline.
11. Allow citizens to track complaint progress.
12. Allow supervisors to monitor government employee performance.
13. Provide transparency throughout the complaint lifecycle.

---

# 5. Non-Goals

The initial version will not:

* Replace existing government administrative systems.
* Make legal decisions.
* Automatically approve government actions.
* Determine whether a citizen's complaint is factually true.
* Automatically penalize government employees.
* Handle emergency services such as police, fire, or ambulance dispatch.

Emergency situations should instead display an appropriate emergency-service message and redirect citizens to the relevant emergency channel.

---

# 6. Target Users

## 6.1 Citizen

A person reporting a civic issue.

### Needs

* Simple interface
* Voice-first reporting
* Local-language support
* Minimal typing
* Easy photo capture
* Automatic location
* Complaint tracking
* Notifications
* Expected resolution date

---

## 6.2 Government Employee

The employee responsible for resolving assigned complaints.

### Needs

* Assigned complaints
* Location and map
* Complaint description
* Photo evidence
* Priority
* Resolution deadline
* Status updates
* Ability to communicate progress
* Ability to upload completion evidence

---

## 6.3 Government Supervisor

A senior employee responsible for monitoring a department/team.

### Needs

* Department-wide complaint overview
* Employee workload
* Pending complaints
* Overdue complaints
* SLA compliance
* Complaint priority
* Escalation management
* Verification of completed work
* Performance reports

---

# 7. Citizen Application

## 7.1 Home Screen

The home screen should focus on one primary action:

### "Report a Problem"

Two input methods:

**🎤 Speak your problem**

**⌨️ Write your problem**

Voice should be visually emphasized because it is the preferred interaction.

Example:

> 🎤 **Tell us what's wrong**

Citizen taps the microphone and says:

> "Hamare area mein pichle teen din se street light kharab hai aur raat ko pura road dark rehta hai."

The system processes the speech.

---

# 8. Voice Complaint System

## User Flow

1. Citizen taps microphone.
2. Citizen speaks in their preferred language.
3. Speech is converted into text.
4. System identifies the language.
5. System extracts the complaint.
6. System asks for additional information if necessary.
7. Citizen reviews the generated complaint.
8. Citizen confirms.

### Example

Citizen says:

> "Mere ghar ke paas road mein bahut bada pothole hai."

System generates:

**Category:** Road → Pothole
**Priority:** Medium
**Description:** Large pothole reported on road near the citizen's location.

The citizen can edit or correct the generated information before submitting.

---

# 9. Multilingual Support

The system should support:

* English
* Hindi
* Regional languages

The architecture should be designed so additional languages can be added later.

### Language Flow

**Citizen Language → Speech/Text Understanding → Standardized Internal Complaint → Government Language/Preferred Language**

For example:

Citizen:

> "Yaha bahut kachra jama ho gaya hai."

System:

**Category:** Garbage/Waste Management
**Department:** Municipal Sanitation
**Issue:** Garbage accumulation
**Location:** Automatically captured

The government employee does not need to understand the original language to process the complaint.

---

# 10. Photo Evidence

After describing the problem, the application asks:

> **"Can you show us the problem?"**

Options:

* 📷 Take Photo
* 🖼️ Upload Photo

The citizen can capture one or more photos.

### Photo Metadata

Each photo should contain:

* Complaint ID
* Timestamp
* Geographic coordinates
* Optional device metadata

The system should associate the photo with the complaint.

---

# 11. Geolocation

The application requests location permission after the complaint is created.

The system captures:

* Latitude
* Longitude
* Timestamp
* Approximate address
* Map location

The citizen should see the detected location before submission.

Example:

> **Problem location**
>
> 📍 Ward 12, Nagpur
> Near XYZ Road
>
> [Map]

The citizen can manually adjust the pin if GPS accuracy is insufficient.

---

# 12. Complaint Intelligence

The system converts the citizen's raw complaint into structured information.

### Input

> "There is garbage everywhere near the school and it has been there for almost a week."

### Structured Output

```text
Complaint Type:
Garbage Accumulation

Department:
Municipal Sanitation

Location:
Captured GPS coordinates

Duration:
~7 days

Priority:
Medium

Evidence:
Photo attached

Language:
English

Status:
Submitted
```

---

# 13. Complaint Categorization

The system should automatically classify complaints.

Example categories:

### Roads

* Pothole
* Damaged road
* Broken pavement
* Road obstruction

### Waste Management

* Garbage accumulation
* Uncollected garbage
* Illegal dumping
* Overflowing dustbin

### Water

* Water leakage
* Broken pipeline
* Water supply issue
* Drainage issue

### Electricity / Street Infrastructure

* Broken streetlight
* Damaged electrical infrastructure

### Public Infrastructure

* Broken benches
* Damaged public toilets
* Damaged bus stops
* Broken public facilities

Categories should be configurable by the government administrator.

---

# 14. Department Assignment

Once categorized, the system determines the responsible department.

Example:

| Complaint             | Department                       |
| --------------------- | -------------------------------- |
| Pothole               | Roads/Public Works               |
| Garbage               | Sanitation                       |
| Streetlight           | Electrical/Municipal Lighting    |
| Water leakage         | Water Department                 |
| Drain blockage        | Drainage/Sanitation              |
| Damaged public toilet | Public Health/Municipal Services |

The department mapping should be configurable according to the local government's organizational structure.

---

# 15. Employee Assignment

After department identification, the complaint is assigned to an employee.

Assignment can consider:

* Department
* Geographic jurisdiction
* Ward
* Employee workload
* Complaint priority
* Employee availability

Example:

```text
Complaint #CVC-10291

Category:
Pothole

Department:
Roads

Ward:
12

Assigned Employee:
Employee #R042

Priority:
High

Resolution Deadline:
48 hours
```

---

# 16. Priority System

The system can automatically suggest a priority based on factors such as:

* Safety risk
* Number of people affected
* Severity
* Duration
* Location
* Type of civic issue

Suggested levels:

### Low

Routine civic issue.

### Medium

Issue affecting local residents.

### High

Major disruption or potential safety concern.

### Critical

Potential immediate danger or significant public impact.

Government rules should ultimately determine the official priority.

---

# 17. Government Employee Dashboard

The employee sees:

### Dashboard

```text
Assigned Complaints
-------------------

🔴 Overdue             3
🟠 Due Today           5
🟡 In Progress         12
🟢 Completed           27
```

Each complaint card shows:

* Complaint ID
* Category
* Description
* Photo
* Location
* Priority
* Submission time
* Deadline
* Current status

---

# 18. Complaint Details Page

Example:

```text
Complaint #CVC-10291

Pothole reported on XYZ Road

📍 Ward 12
🕐 Reported: 15 Sept, 10:32 AM

Priority:
HIGH

Deadline:
17 Sept, 10:32 AM

Citizen Evidence:
[Photo]

Description:
Large pothole reported near XYZ Road.

Assigned Employee:
Rahul Sharma

Status:
IN PROGRESS
```

Employee actions:

* Accept Task
* Start Work
* Update Status
* Add Comment
* Upload Photo
* Mark Completed

---

# 19. Complaint Status Lifecycle

Every complaint follows a standardized lifecycle:

```text
SUBMITTED
    ↓
AI CLASSIFIED
    ↓
DEPARTMENT ASSIGNED
    ↓
EMPLOYEE ASSIGNED
    ↓
ACCEPTED
    ↓
IN PROGRESS
    ↓
COMPLETED
    ↓
SUPERVISOR VERIFICATION
    ↓
RESOLVED
```

Possible additional states:

* Needs More Information
* Reassigned
* Rejected with Reason
* Escalated
* Reopened

---

# 20. Resolution Timeline / SLA

Every complaint should receive a defined expected resolution time.

Example:

> **Expected Resolution: 48 hours**

The employee sees a countdown:

> ⏱️ 31 hours remaining

The system automatically tracks whether the complaint is resolved within the assigned timeline.

### SLA States

**On Track**

Employee has sufficient time remaining.

**Due Soon**

Deadline approaching.

**Overdue**

Deadline has passed.

---

# 21. Supervisor Dashboard

The supervisor gets a department-level overview.

### Dashboard

```text
Total Complaints       1,284
Pending                  312
In Progress              187
Completed                785
Overdue                   42
```

### Supervisor can view:

* Complaints by department
* Complaints by ward
* Complaints by category
* Employee workload
* Pending complaints
* Overdue complaints
* High-priority complaints
* Average resolution time
* Reopened complaints
* Escalated complaints

---

# 22. Escalation System

If an employee does not update or complete a complaint within the required timeline:

```text
Deadline Approaching
        ↓
Employee Notification
        ↓
Deadline Passed
        ↓
Supervisor Notification
        ↓
Escalation
        ↓
Reassignment / Administrative Action
```

Escalation rules should be configurable by the government.

---

# 23. Completion Verification

Employees should provide evidence when marking a complaint completed.

For example:

**Before**

Citizen-submitted photo of pothole.

**After**

Employee uploads photo showing repaired road.

Supervisor can then verify the completion.

The supervisor can:

* Approve
* Reject
* Request additional evidence
* Reopen the complaint

---

# 24. Citizen Tracking

Citizens should be able to see:

```text
Complaint #CVC-10291

✓ Complaint Submitted
✓ Department Assigned
✓ Employee Assigned
✓ Work Started
● Awaiting Completion
○ Supervisor Verification
○ Resolved
```

The citizen can see:

* Current status
* Assigned department
* Expected completion date
* Updates
* Uploaded completion evidence
* Location
* Complaint history

---

# 25. Notifications

Citizens receive notifications when:

* Complaint is submitted
* Complaint is assigned
* Work begins
* Deadline changes
* Complaint is completed
* Complaint is verified
* Complaint is resolved
* Complaint is reopened

Government employees receive notifications for:

* New assignments
* Upcoming deadlines
* Overdue complaints
* Supervisor messages
* Reassigned complaints

Supervisors receive notifications for:

* Overdue complaints
* High-priority complaints
* SLA violations
* Escalations

---

# 26. Citizen Feedback

After resolution:

> **Was your problem resolved?**

Options:

👍 Yes
👎 No

If the citizen selects "No":

> **Tell us what is still wrong.**

The complaint can be reopened for review.

---

# 27. Maps & Geographic Intelligence

The government dashboard should provide a map view.

Example:

```text
          CITY MAP

   🔴 Pothole
   🔴 Garbage
   🟠 Streetlight
   🟡 Drainage
   🟢 Resolved
```

Supervisors can identify clusters of complaints.

For example:

> 37 garbage complaints within one ward

This can help identify recurring civic problems rather than treating every complaint as an isolated incident.

---

# 28. AI Features

AI can assist with:

### 1. Speech-to-Text

Convert spoken complaints into text.

### 2. Language Detection

Identify the language used by the citizen.

### 3. Translation

Translate complaints between supported languages.

### 4. Complaint Classification

Identify the type of civic issue.

### 5. Department Recommendation

Suggest the responsible department.

### 6. Priority Recommendation

Suggest complaint priority based on configured rules.

### 7. Information Extraction

Extract:

* Location references
* Duration
* Severity
* Issue type
* Infrastructure involved

### 8. Duplicate Detection

Detect whether multiple citizens are reporting the same issue.

Example:

100 people report:

> "Huge pothole near XYZ school."

The system can identify these as potentially related complaints.

---

# 29. Duplicate Complaint Handling

If a new complaint appears to describe an existing issue nearby:

> **"A similar complaint has already been reported nearby."**

Citizen can:

**Join Existing Complaint**

or

**Submit New Complaint**

This prevents government departments from receiving hundreds of duplicate work orders for the same physical issue.

---

# 30. Authentication

## Citizen

Possible options:

* Mobile number + OTP
* Email
* Optional anonymous reporting for selected categories

## Government Employee

* Official government credentials
* Employee ID
* Role-based authentication

## Supervisor

* Official government credentials
* Role-based access

---

# 31. Role-Based Access Control

### Citizen

Can:

* Create complaint
* View own complaints
* Track complaints
* Add evidence
* Reopen eligible complaints
* Provide feedback

### Employee

Can:

* View assigned complaints
* Update assigned complaints
* Upload evidence
* Change permitted statuses

### Supervisor

Can:

* View department complaints
* Assign/reassign employees
* Monitor SLAs
* Verify completion
* Escalate complaints

### Administrator

Can:

* Configure departments
* Configure categories
* Configure SLA rules
* Manage users
* Manage wards
* Configure language support
* Access system analytics

---

# 32. Core Data Model

### User

```text
user_id
name
phone
email
role
language
department_id
ward_id
```

### Complaint

```text
complaint_id
citizen_id
description
original_language
translated_description
category
sub_category
department_id
assigned_employee_id
priority
status
created_at
deadline
resolved_at
```

### Location

```text
complaint_id
latitude
longitude
address
ward
```

### Evidence

```text
evidence_id
complaint_id
uploaded_by
image_url
timestamp
latitude
longitude
type
```

### Status History

```text
complaint_id
status
changed_by
timestamp
comment
```

This creates an auditable history of every complaint.

---

# 33. Example End-to-End Scenario

### Citizen

A citizen sees a large pothole.

She opens Civic.

### Step 1 — Speak

She taps:

> 🎤 Tell us your problem

She says:

> "There is a very big pothole near the bus stop. Bikes are almost falling into it."

### Step 2 — AI Processing

Civic identifies:

```text
Category:
Road → Pothole

Priority:
High

Department:
Roads/Public Works
```

### Step 3 — Photo

Civic asks:

> "Please take a photo of the problem."

Citizen takes a photograph.

### Step 4 — Location

Civic captures GPS.

> 📍 XYZ Bus Stop, Ward 12

Citizen confirms.

### Step 5 — Submit

Complaint:

**CVC-10291**

Expected resolution:

**48 hours**

### Step 6 — Government

The Roads Department receives the complaint.

An employee is assigned.

### Step 7 — Employee

Employee visits the location and updates:

> **Work Started**

After repairing the pothole, they upload an after-photo.

### Step 8 — Supervisor

Supervisor reviews the evidence.

> **Verified**

### Step 9 — Citizen

Citizen receives:

> **Your complaint CVC-10291 has been resolved.**

Citizen can provide feedback.

---

# 34. MVP

The first version should focus on the core workflow rather than building every feature.

## Citizen MVP

* Login
* Voice complaint
* Text complaint
* English/Hindi support
* Photo capture
* Geolocation
* Complaint preview
* Submit complaint
* Complaint tracking
* Notifications

## Government MVP

* Employee login
* Complaint dashboard
* Complaint assignment
* Category and department
* SLA/deadline
* Status updates
* Photo upload
* Supervisor dashboard
* Completion verification

## AI MVP

* Speech-to-text
* Language detection
* Translation
* Complaint categorization
* Department mapping

---

# 35. Future Features

### Phase 2

* More regional languages
* Duplicate complaint detection
* Advanced maps
* Citizen feedback
* Automatic escalation
* Analytics

### Phase 3

* Predictive civic issue detection
* Recurring problem identification
* AI-generated government reports
* Ward-level analytics
* Integration with existing municipal systems
* WhatsApp/phone-based complaint submission
* Public transparency dashboard

---

# 36. Success Metrics

### Citizen

* Average complaint submission time
* Complaint completion rate
* Voice vs text usage
* Complaint abandonment rate
* Citizen satisfaction
* Percentage of complaints with usable evidence

### Government

* Average resolution time
* SLA compliance
* Number of overdue complaints
* Employee workload
* Reopened complaints
* Department response time

### AI

* Speech transcription accuracy
* Complaint classification accuracy
* Department assignment accuracy
* Translation quality
* Duplicate detection accuracy

---

# 37. Key Product Principle

The entire system should follow one principle:

> **Citizens should describe the problem, not navigate the bureaucracy.**

The citizen does not need to know:

> "This belongs to the Public Works Department."

They simply say:

> **"There's a huge pothole outside my house."**

Civic handles the administrative complexity behind the scenes.

---

# 38. High-Level Architecture

```text
                 CITIZEN
                    │
          ┌─────────┴─────────┐
          │                   │
       🎤 Voice             ✍️ Text
          │                   │
          └─────────┬─────────┘
                    ↓
             LANGUAGE / AI
                    │
          ┌─────────┴─────────┐
          │                   │
     Classification       Translation
          │                   │
          └─────────┬─────────┘
                    ↓
            COMPLAINT ENGINE
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    Category    Department   Priority
        │           │           │
        └───────────┼───────────┘
                    ↓
              GEOLOCATION
                    │
                    ↓
              PHOTO EVIDENCE
                    │
                    ↓
               COMPLAINT
                    │
                    ↓
             EMPLOYEE ASSIGNMENT
                    │
                    ↓
              GOVERNMENT PORTAL
                    │
              ┌─────┴─────┐
              ↓           ↓
          Employee     Supervisor
              │           │
              ↓           ↓
            Work       Monitor
              │           │
              └─────┬─────┘
                    ↓
             PROOF OF WORK
                    │
                    ↓
             VERIFICATION
                    │
                    ↓
                RESOLVED
                    │
                    ↓
             CITIZEN FEEDBACK
```

---

# 39. One-Line Product Pitch

> **Civic is a multilingual, voice-first civic complaint platform that turns a citizen's spoken problem into a geo-tagged, evidence-backed government task—and tracks it until resolution.**

# 40. Core Value Proposition

**For Citizens:**
"Just tell us what's wrong."

**For Government Employees:**
"Get the right problem, at the right location, with a clear deadline."

**For Supervisors:**
"See what's pending, who's responsible, and what is actually getting resolved."
