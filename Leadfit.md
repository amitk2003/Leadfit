# LeadFit: Explainable Lead Quality & Prioritization Engine

## Product Evaluation and End-to-End Implementation Workflow

**Prepared for:** Caprae Capital Partners --- Full Stack Developer /
AI-Readiness Pre-Screening Challenge\
**Challenge constraint:** One or two impactful features, built within a
maximum of five hours\
**Status:** Product and implementation plan; not a claim that the system
has already been built or deployed

------------------------------------------------------------------------

## 1. Executive recommendation

Build **LeadFit**, a focused lead-quality and prioritization workflow
that helps a sales or business-development user decide which leads to
contact first, understand why each lead received its score, identify
incomplete or duplicate records, and export a clean prioritized list.

The user uploads a CSV of prospect records, defines an Ideal Customer
Profile (ICP), and receives a ranked table with an explainable score and
data-quality warnings for every row.

**Core promise:** *Turn a raw lead list into an explainable, actionable
priority list---without pretending missing or inferred information is
verified.*

This is a stronger five-hour challenge submission than attempting to
rebuild email verification, company enrichment, AI outreach generation,
news retrieval, multiple databases, caching infrastructure, and cloud
deployment simultaneously.

### Recommended decision

Proceed with the idea, but keep it deliberately narrow:

1.  **Primary feature:** Configurable, explainable lead scoring against
    a user-defined ICP.
2.  **Supporting workflow:** CSV import, data normalization, duplicate
    detection, filtering, and CSV export.

Treat these as one end-to-end feature, not as two independent products.

------------------------------------------------------------------------

## 2. Evaluation of the idea

### Why it is relevant

The Caprae handbook asks candidates to improve SaaSquatch Leads, a
lead-generation tool, by selecting one or two impactful improvements
within five hours. Its evaluation criteria emphasize business
usefulness, lead prioritization, minimizing irrelevant data, usability,
data quality, and actionable value.

LeadFit directly addresses those needs:

-   **Business value:** Users can focus their limited outreach time on
    leads that best match their target customer profile.
-   **Data quality:** Missing fields, malformed rows, and likely
    duplicate records are made visible.
-   **Explainability:** A user can see which criteria contributed to a
    score instead of receiving an unexplained number.
-   **Workflow efficiency:** Search, filters, sorting, and export make
    the results usable after analysis.
-   **Practical scope:** The core logic can run locally or in a small
    web application without a paid AI model or paid enrichment API.

### What the idea does not claim

LeadFit does **not** claim to determine whether a person will buy,
whether an email will reach the inbox, whether a mailbox exists, or
whether a company has been independently verified. It ranks records
according to the criteria and data supplied by the user.

A high ICP-fit score means "matches the configured profile based on
available fields," not "guaranteed to convert."

### Main risks and mitigations

  -----------------------------------------------------------------------
  Risk                    Why it matters          Mitigation
  ----------------------- ----------------------- -----------------------
  A score looks more      Users may mistake a     Call it an "ICP Fit
  authoritative than it   heuristic for a         Score"; show criteria,
  is                      conversion prediction   data coverage, and
                                                  limitations

  Missing values unfairly Incomplete records may  Represent missing
  lower or inflate scores be ranked incorrectly   values as unknown;
                                                  disclose the scoring
                                                  coverage

  Duplicate records       Sales teams may contact Normalize identifiers
  inflate the apparent    the same company        and flag likely
  lead count              multiple times          duplicates for review

  User data contains      Uploads may fail or     Preview column mapping,
  unexpected CSV formats  fields may be misread   validate rows, and show
                                                  actionable errors

  Scoring weights encode  A ranking may not fit   Let users configure
  hidden assumptions      every sales strategy    criteria and weights;
                                                  explain defaults

  Company enrichment is   A CSV may not contain   Do not fabricate
  unavailable             all desired data        missing data; label
                                                  fields as unavailable

  Time limit encourages   A partially implemented Ship one complete
  excessive scope         platform is weaker than workflow before adding
                          a working feature       extras
  -----------------------------------------------------------------------

### Product positioning

Describe LeadFit as a **lead prioritization and data-quality
assistant**, not as a replacement for the entire SaaSquatch product. Its
value is turning an existing list into an explainable next-action list.

------------------------------------------------------------------------

## 3. Target user and problem statement

### Primary user

A business-development representative, founder, search-fund operator, or
small sales team that has a list of potential companies but limited time
to research and contact every lead.

### User problem

"I have a CSV containing potential leads. I need to identify the
best-fit companies, understand why they rank highly, spot incomplete or
duplicated records, and export a clean list for outreach."

### User story

> As a sales or business-development user, I want to upload a lead list,
> define my target customer profile, and receive an explainable ranking
> so I can prioritize outreach without manually reviewing every row.

### Success criteria

A successful prototype should allow a user to:

1.  Upload a valid CSV and preview its records.
2.  map or confirm the available columns.
3.  Define an ICP using fields present in the uploaded dataset.
4.  Generate a score from the actual input data and selected profile.
5.  Inspect score explanations and data-quality warnings per lead.
6.  Search, sort, and filter the results.
7.  Export the prioritized results as a CSV.
8.  Change the ICP and recalculate the rankings without changing code.
9.  Receive clear errors for malformed files and unsupported data.
10. Understand that scores are heuristic profile-fit assessments, not
    predictions of sales success.

------------------------------------------------------------------------

## 4. Scope: what to build and what not to build

### Must-have scope

-   CSV upload with a size limit.
-   CSV parsing and column validation.
-   Column mapping or a clear supported-column convention.
-   ICP configuration using available fields.
-   Configurable weighted scoring.
-   Explanation of each criterion's contribution.
-   Missing-data indicators and coverage.
-   Duplicate detection or duplicate warnings.
-   Search, sort, and basic filters.
-   CSV export.
-   Loading, empty, success, and error states.
-   Tests for scoring, missing fields, duplicates, and invalid input.
-   README with accurate setup and limitations.

### Explicitly out of scope for the five-hour prototype

-   Scraping multiple websites or bypassing anti-bot controls.
-   Paid email verification or enrichment APIs.
-   Predicting reply rates, revenue, or conversion probabilities.
-   Sending emails or LinkedIn messages.
-   CRM integrations.
-   Authentication, team management, and billing.
-   PostgreSQL, Redis, or other infrastructure unless already genuinely
    required.
-   Claims of production-scale performance or zero false negatives.
-   AI-generated company facts that are not sourced and verified.

A narrow, honest, tested feature is preferable to a broad feature list
that is only partially implemented.

------------------------------------------------------------------------

## 5. End-to-end user workflow

### Step 1 --- Open the dashboard

The landing screen should explain the product in one sentence:

> Upload a lead list, define your ideal customer, and see which records
> best match your criteria.

Primary action: **Upload CSV**.

Also show a short note that uploaded data is processed for the current
analysis and that the prototype does not claim to verify company facts
externally.

### Step 2 --- Upload a CSV

The user selects a CSV file.

The system should:

1.  Check file extension and content type where available.
2.  Enforce a configurable maximum file size.
3.  Parse the CSV safely.
4.  Detect empty files and empty rows.
5.  Normalize column headers for matching.
6.  Preview a sample of rows.
7.  Report the number of rows parsed, rejected, and potentially
    duplicated.
8.  Let the user confirm column mappings when automatic mapping is
    ambiguous.

Suggested supported fields:

-   `company_name`
-   `company_domain`
-   `industry`
-   `employee_count`
-   `country`
-   `state_or_region`
-   `contact_name`
-   `contact_email`
-   `last_verified_at` or `last_updated_at`

These are supported schema suggestions, not required fields for every
dataset. The application should work with partial data and explain what
cannot be scored.

### Step 3 --- Validate and normalize the dataset

For each row:

-   Trim leading and trailing whitespace.
-   Normalize header names.
-   Convert empty strings to missing values.
-   Parse employee count as a number when possible.
-   Normalize country and industry text conservatively.
-   Normalize company domains for comparison, without assuming that
    different subdomains always mean the same company.
-   Validate email **syntax only** if an email field is present.
-   Preserve the original row or original values where necessary for
    traceability.
-   Record row-level validation warnings.

Do not silently discard rows. Show the user what was accepted, rejected,
or flagged and why.

### Step 4 --- Configure the Ideal Customer Profile

The user defines their target profile through the UI.

Possible criteria:

-   Preferred industries.
-   Minimum and maximum employee count.
-   Target countries or regions.
-   Required data fields.
-   Optional data freshness requirement.

Only show controls supported by the uploaded dataset. For example, if no
employee-count column exists, explain that employee-size matching cannot
be calculated.

The user can choose the importance of each criterion. Default weights
should be visible and editable.

### Step 5 --- Calculate the ICP Fit Score

For every record:

1.  Evaluate each enabled criterion.
2.  Calculate the criterion-level score from the record's actual value
    and user-defined profile.
3.  Account explicitly for missing data.
4.  Combine the eligible criterion scores according to the selected
    weighting policy.
5.  Store the score components and human-readable explanations for
    display.
6.  Assign a priority band based on configurable thresholds.
7.  Mark incomplete records so that a high score cannot hide major
    uncertainty.

Suggested labels:

-   **High fit**
-   **Medium fit**
-   **Low fit**
-   **Insufficient data**

These are operational categories, not statements about purchase intent.

### Step 6 --- Inspect and understand results

The main results table should contain:

-   Company
-   Industry
-   Employee count
-   Country/region
-   ICP Fit Score
-   Priority band
-   Data coverage or completeness
-   Duplicate warning
-   Key reason for the score
-   Available actions

Clicking a record should open a detail panel with:

-   Original input values.
-   Criterion-by-criterion score.
-   Explanation of each match or mismatch.
-   Missing or invalid fields.
-   Duplicate candidates, if any.
-   Clear note that external facts have not been verified unless the
    system actually verified them.

### Step 7 --- Filter and prioritize

Users should be able to:

-   Sort by score, company name, employee count, or completeness.
-   Filter by priority band.
-   Filter by industry and country when those fields exist.
-   Show only incomplete records.
-   Show only suspected duplicates.
-   Search by company or contact name.
-   Clear all filters.

Filters should operate on the current analysis rather than requiring the
user to re-upload the file.

### Step 8 --- Export results

Allow the user to download the prioritized rows as CSV.

Include useful fields:

-   Original lead fields.
-   ICP Fit Score.
-   Priority band.
-   Individual criterion scores.
-   Explanation/reason.
-   Missing-data flags.
-   Duplicate flag.

Export only data that is present or calculated. Do not add invented
company attributes. Escape CSV values correctly to avoid malformed
exports and spreadsheet formula injection risks.

### Step 9 --- Change the profile and recalculate

The user can modify ICP settings and recalculate scores from the same
normalized dataset.

The score must be derived from the configuration and data, not from a
hardcoded company lookup. Different ICPs should generally produce
different rankings when the criteria distinguish the records.

### Step 10 --- Explain the outcome

A compact summary can show:

-   Total input records.
-   Unique records after duplicate review.
-   High-, medium-, and low-fit counts.
-   Records with insufficient data.
-   Duplicate candidates.
-   Most common missing fields.

Make clear that these are statistics about the uploaded dataset, not
market-wide facts.

------------------------------------------------------------------------

## 6. Scoring model and missing-data policy

### Example default criteria

The following weights are starting defaults only. They should be visible
to the user and configurable.

  ------------------------------------------------------------------------
  Criterion                           Example weight How it is evaluated
  --------------------- ---------------------------- ---------------------
  Industry match                                 30% Exact or
                                                     user-approved
                                                     normalized match
                                                     against preferred
                                                     industries

  Employee-size fit                              25% Whether employee
                                                     count falls within
                                                     the user's target
                                                     range

  Data completeness                              20% Proportion of
                                                     selected useful
                                                     fields that are
                                                     populated and valid

  Geographic fit                                 15% Match against the
                                                     user's selected
                                                     target regions

  Data freshness                                 10% Recency of an
                                                     available timestamp,
                                                     using a documented
                                                     rule
  ------------------------------------------------------------------------

If a field is absent from the uploaded file, do not pretend that the
criterion was evaluated. Either disable that criterion or mark it
unavailable and explain the impact.

### Weighted score

For criteria that are actually evaluated:

\[ S = `\frac{\sum_{i \in E} w_i s_i}{\sum_{i \in E} w_i}`{=tex} \]

Where:

-   \(S\) is the weighted ICP Fit Score.
-   \(E\) is the set of criteria that can be evaluated for that record.
-   (w_i) is the configured weight for criterion (i).
-   (s_i) is the criterion score between 0 and 100.

This formula renormalizes the evaluated weights, so missing fields do
not automatically become zero-score mismatches. However, a renormalized
score can look overly confident when little data is available.
Therefore, always display **coverage** alongside the score.

### Coverage

A simple coverage metric is:

\[ C = 100 `\times`{=tex}
`\frac{\sum_{i \in E} w_i}{\sum_{i \in A} w_i}`{=tex} \]

Where (A) is the set of enabled criteria applicable to the uploaded
schema.

Display the coverage percentage next to the score. Define a configurable
minimum coverage threshold below which the priority label becomes
**Insufficient data**.

### Criterion-specific rules

**Industry**

-   Normalize case and whitespace.
-   Use only documented aliases or mappings.
-   Do not infer a company's industry from its name.
-   If industry is missing, mark the criterion unknown.

**Employee count**

-   Parse only valid numeric values.
-   Score exact in-range values according to the configured rule.
-   Explain out-of-range values.
-   Treat malformed or missing counts as unknown, not as a definite
    mismatch.

**Geography**

-   Normalize only known country/region aliases.
-   Do not infer geography from company names.
-   Mark missing geography as unknown.

**Completeness**

-   Define which fields count toward completeness.
-   Distinguish "field is populated" from "fact is verified."
-   Do not claim a populated email address is deliverable.

**Freshness**

-   Use only a meaningful source timestamp.
-   Document the freshness window.
-   If no timestamp exists, mark freshness unknown.
-   Do not use the date of upload as evidence that the underlying
    company data is current.

### Weight validation

-   Weights must be non-negative.
-   At least one criterion must have a positive weight.
-   The UI should normalize weights or require a total of 100%.
-   Invalid configuration must produce a clear error.
-   The same data and configuration must produce the same result.

### Score interpretation

A suggested initial configuration might use:

-   High fit: 75--100.
-   Medium fit: 50--74.99.
-   Low fit: below 50.
-   Insufficient data: below the minimum coverage threshold.

These thresholds must be configurable and documented. They are not
statistically validated conversion thresholds.

------------------------------------------------------------------------

## 7. Duplicate detection

Duplicate detection is a supporting data-quality capability, not a claim
that two records definitely refer to the same legal entity.

### Suggested process

1.  Normalize company domains to a consistent representation.
2.  Flag exact matching non-empty domains.
3.  If domains are absent, use conservative combinations of normalized
    company name and location.
4.  Do not automatically merge records when the match is uncertain.
5.  Show the user the matching fields and allow review.
6.  Keep an audit-friendly link to the original rows.

Do not assume that similar company names always represent the same
business. Parent companies, subsidiaries, franchises, and regional
domains may be distinct.

------------------------------------------------------------------------

## 8. UX/UI requirements

### Main screens

**Screen A --- Upload**

-   Product title and one-line explanation.
-   CSV upload area.
-   Supported columns and file-size limit.
-   Clear error messages.
-   Data-handling note.

**Screen B --- ICP configuration**

-   Industry multi-select.
-   Employee minimum/maximum.
-   Country/region selection.
-   Weight controls.
-   Enabled/disabled criteria.
-   "Analyze leads" action.

**Screen C --- Results dashboard**

-   Dataset summary.
-   Score distribution.
-   Searchable and sortable table.
-   Priority and data-quality badges.
-   Filters.
-   CSV export.

**Screen D --- Lead detail panel**

-   Score and coverage.
-   Criterion breakdown.
-   Reasons for match/mismatch.
-   Missing values and duplicate warnings.
-   Original record values.

### UX principles

-   Explain what a score means beside the score itself.
-   Never use color as the only signal; pair color with text.
-   Make unknown, missing, invalid, and mismatched values visually
    distinct.
-   Provide loading, empty, error, and success states.
-   Keep the upload-to-results journey short.
-   Avoid charts that imply predictive accuracy.
-   Make the table usable on smaller screens, even if some columns
    collapse into a detail view.

------------------------------------------------------------------------

## 9. Technical implementation plan

### Recommended stack

For a focused implementation, use the stack already present in the
SmartDossier prototype unless there is a compelling reason to change it:

-   **Frontend:** HTML, CSS, and JavaScript.
-   **Backend:** Node.js and Express.
-   **Parsing:** A reliable CSV parsing library, such as `csv-parse`, or
    an already installed equivalent.
-   **Scoring:** A deterministic JavaScript module with unit tests.
-   **Storage:** In-memory processing for the prototype; no persistent
    database is required for the core workflow.
-   **Testing:** Node's built-in test runner or the repository's
    existing test setup.
-   **Deployment:** Only document and claim a deployment after it is
    actually configured and verified.

Do not add a Python/FastAPI rewrite, a database, Redis, an LLM, or a
cloud architecture just for appearance. The goal is to finish and test
the end-to-end feature inside the challenge time limit.

### Suggested module boundaries

``` text
src/
  server.js
  routes/
    leads.js
  services/
    csvParser.js
    normalizeLead.js
    deduplicateLeads.js
    icpScorer.js
    leadExplanations.js
    exportCsv.js
  public/
    index.html
    styles.css
    app.js
  tests/
    csvParser.test.js
    normalization.test.js
    deduplication.test.js
    scoring.test.js
    export.test.js
README.md
package.json
package-lock.json
```

Adapt this to the existing repository instead of duplicating modules
unnecessarily.

### Suggested API contract

**`POST /api/leads/analyze`**

Accepts a CSV upload and ICP configuration. Returns validated rows,
score components, coverage, explanations, and data-quality flags.

**`POST /api/leads/recalculate`**

Accepts normalized records or a server-side analysis identifier plus a
new ICP configuration. Recalculates scores without re-uploading where
practical.

**`GET /api/health`**

Returns a simple service health response.

**Export**

Either generate the CSV on the server or generate it in the browser from
the current filtered results. Document which approach is implemented.

### Example response shape

``` json
{
  "summary": {
    "inputRows": 100,
    "processedRows": 96,
    "duplicateCandidates": 4,
    "insufficientDataRows": 12
  },
  "results": [
    {
      "companyName": "Example Company",
      "score": 82.5,
      "coverage": 100,
      "priority": "High fit",
      "criteria": [
        {
          "name": "industry",
          "score": 100,
          "weight": 0.3,
          "status": "matched",
          "reason": "Industry matches the selected profile"
        }
      ],
      "warnings": []
    }
  ]
}
```

This is an illustrative contract, not an assertion that the current
project already returns this response.

### Error handling

Handle at least:

-   No file provided.
-   File too large.
-   Empty CSV.
-   Invalid CSV syntax.
-   Missing required identifying field.
-   Ambiguous column mapping.
-   Invalid employee counts.
-   Invalid or negative weights.
-   All criteria unavailable.
-   Empty result set.
-   Export failure.

Return safe, actionable error messages without exposing stack traces or
internal filesystem paths to the user.

### Security and privacy

-   Enforce file-size and row-count limits.
-   Parse uploaded files as data; never execute uploaded content.
-   Do not log complete contact records or email addresses
    unnecessarily.
-   Avoid persistent storage unless required.
-   Use secure temporary-file handling if files are written to disk.
-   Escape output when rendering user-provided values into HTML.
-   Protect CSV exports against spreadsheet formula injection.
-   If deployed, use HTTPS and appropriate request limits.
-   Explain the data-retention behavior accurately.

------------------------------------------------------------------------

## 10. Testing strategy

The test suite should verify behavior rather than print predetermined
success messages.

### Unit tests

**CSV parser** - Valid CSV. - Quoted commas. - Empty file. - Malformed
rows. - Unexpected column names.

**Normalization** - Whitespace and case normalization. - Empty strings
treated as missing. - Valid and invalid employee counts. - Domain
normalization without unsafe merging.

**Scoring** - Exact industry match. - Industry mismatch. - Employee
count inside and outside range. - Geographic match and mismatch. -
Missing criteria. - Weights that do not sum to 100%. - All criteria
missing. - Zero-weight criteria. - Deterministic result for identical
input.

**Deduplication** - Exact normalized domain duplicates. - Same name in
different locations. - Missing domain. - Similar but distinct company
names. - Review flag rather than automatic merge for uncertain cases.

**Export** - Correct column names. - Correct score and explanation
values. - Unicode and commas in fields. - Safe handling of cells
beginning with spreadsheet formula characters.

### Integration tests

1.  Upload a valid CSV and receive scored records.
2.  Upload an invalid CSV and receive a helpful error.
3.  Change the ICP and verify the rankings are recalculated.
4.  Filter results and export the intended records.
5.  Verify that the result count and duplicate summary agree.
6.  Confirm that no external API or fixed company lookup is needed for
    the core workflow.

### Essential anti-hardcoding test

Use a dataset containing unfamiliar company names, then change the ICP.

The expected behavior is that scores derive from the actual fields and
configuration. The test must not depend on a specific company name being
present in a lookup table.

### Acceptance criteria

The feature is ready for demonstration when:

-   A user can upload a valid CSV without code changes.
-   Scoring works for arbitrary records with supported fields.
-   Every score has an explanation and a coverage indicator.
-   Missing values are not fabricated or silently treated as verified
    mismatches.
-   Duplicates are flagged transparently.
-   Filters and export work.
-   Invalid inputs fail safely.
-   Tests can be run from a clean checkout using documented commands.

------------------------------------------------------------------------

## 11. Five-hour execution schedule

The handbook's five-hour constraint should be treated as a hard limit
for the development scope.

  -----------------------------------------------------------------------
  Time                    Task                    Deliverable
  ----------------------- ----------------------- -----------------------
  0:00--0:30              Inspect the existing    Confirmed scope and
                          code and choose the     field contract
                          minimum supported CSV   
                          schema                  

  0:30--1:00              Implement CSV parsing   Validated rows and
                          and normalization       clear errors

  1:00--2:00              Implement ICP           Tested scoring engine
                          configuration, scoring, 
                          coverage, and           
                          explanations            

  2:00--3:15              Implement upload,       Complete primary UI
                          configuration form,     flow
                          results table, and      
                          detail view             

  3:15--4:00              Add sorting, filtering, Usable end-to-end
                          duplicate flags, and    workflow
                          CSV export              

  4:00--4:35              Add unit and            Reproducible test suite
                          integration tests; fix  
                          critical failures       

  4:35--5:00              Update README, verify   Submission-ready
                          clean setup, and        prototype
                          prepare demo            
  -----------------------------------------------------------------------

If the existing application requires significant repair, reduce UI
decoration or optional summary charts. Do not sacrifice scoring
correctness, explanations, input validation, or a reproducible demo to
add more features.

------------------------------------------------------------------------

## 12. How the project addresses the 40-point rubric

The rubric below maps implementation evidence to the handbook's
evaluation categories. It is a strategy, not a predicted score.

### Business understanding --- 10 points

Demonstrate: - A clear target user and real lead-prioritization
problem. - A configurable ICP rather than a fixed company-specific
rule. - Reasons for each ranking. - Missing-data and duplicate
visibility. - A clean export into an existing sales workflow.

Evidence: a short demo showing the same lead list ranked differently for
two different ICPs.

### UX/UI --- 10 points

Demonstrate: - Short upload-to-results flow. - Column preview and clear
validation errors. - Intuitive ICP configuration. - Search, filters,
sorting, and export. - Score explanations, coverage, and accessible
statuses.

Evidence: a screen recording of a first-time user completing the
workflow.

### Technicality --- 10 points

Demonstrate: - Real CSV parsing and normalization. - Deterministic,
configurable scoring. - Explicit missing-data handling. - Duplicate
detection. - Robust input validation and error handling. - Meaningful
automated tests.

Evidence: test output, source code, and a live run on a new dataset.

### Design --- 5 points

Demonstrate: - Consistent typography, spacing, and color. - Readable
table and detail view. - Responsive layout. - Accessible labels and
non-color status indicators. - Helpful empty, loading, and error states.

Evidence: the actual working UI, not only screenshots of a mockup.

### Other --- 5 points

Demonstrate: - Explainability rather than an opaque score. -
Configurable weights. - Data-quality and duplicate summaries. - Export
that preserves explanations and source fields. - Clear README and
thoughtful privacy handling.

Evidence: documentation and a concise explanation of why the design
helps users.

------------------------------------------------------------------------

## 13. Two-minute video walkthrough

### 0:00--0:20 --- Problem

"Lead generation is not only about collecting more companies. Teams also
need to decide which prospects best fit their target customer profile
and which records need attention. I built LeadFit to turn a raw lead
list into an explainable priority list."

### 0:20--0:45 --- Upload and configure

"I upload a CSV and define the target industries, company size, and
geography. The tool uses the available fields rather than relying on a
fixed list of companies."

### 0:45--1:15 --- Explain the scores

"Each lead receives an ICP Fit Score based on configurable criteria. I
can inspect the contribution of each criterion, see missing information,
and identify duplicate candidates. The score is transparent and does not
claim to predict conversion."

### 1:15--1:40 --- Demonstrate adaptability

"Now I change the target profile. The rankings recalculate from the same
dataset, showing that the results are driven by the data and
user-defined criteria."

### 1:40--2:00 --- Business value and engineering

"I can filter and export the prioritized leads for the next step in a
sales workflow. I focused the five-hour implementation on data quality,
explainability, and usability rather than building several incomplete
features."

Only describe behavior that is present in the final implementation. Show
a real run, not a hardcoded success screen.

------------------------------------------------------------------------

## 14. README structure for the final repository

The final repository README should contain:

1.  Project name and concise purpose.
2.  Problem statement and target user.
3.  Features actually implemented.
4.  Screenshots or a short demo link.
5.  Technology stack actually used.
6.  Architecture and request/data flow.
7.  Supported CSV schema and sample input.
8.  Scoring formula, default weights, and missing-data policy.
9.  Setup and run instructions.
10. Environment variables, if any.
11. Test command and real test results.
12. Limitations and known issues.
13. Privacy and data-handling behavior.
14. Deployment details only if deployment is complete.
15. Future improvements clearly separated from current features.

Do not claim PostgreSQL, Redis, cloud hosting, CI/CD, mailbox
verification, or production-scale performance unless implemented and
verified.

------------------------------------------------------------------------

## 15. Submission checklist

### Product

-   [ ] CSV upload and parsing work.
-   [ ] ICP settings are configurable.
-   [ ] Scoring is based on actual input fields.
-   [ ] Score explanations and coverage are visible.
-   [ ] Missing data is handled transparently.
-   [ ] Duplicate candidates are flagged.
-   [ ] Search, sort, filters, and CSV export work.
-   [ ] The UI handles invalid inputs and empty states.

### Engineering

-   [ ] Unit tests cover scoring and normalization.
-   [ ] Integration tests cover upload-to-export.
-   [ ] New company names do not require code changes.
-   [ ] Changing the ICP recalculates results.
-   [ ] No fake success output or fabricated enrichment is presented as
    real.
-   [ ] A clean checkout can be installed and run using the README.

### Submission package

-   [ ] Actual GitHub repository URL.
-   [ ] Accurate README and source code.
-   [ ] Test results reproduced from the submitted code.
-   [ ] One- to two-minute video walkthrough.
-   [ ] Demo link if available.
-   [ ] Current resume.
-   [ ] All Caprae business-understanding questions answered.
-   [ ] Employment and availability answers are truthful and complete.
-   [ ] Email subject follows the handbook's requested format.

------------------------------------------------------------------------

## 16. Final recommendation

**Build LeadFit as one cohesive, explainable lead-prioritization
feature.**

The most important differentiator is not the sophistication of the
formula. It is the combination of:

1.  User-defined criteria.
2.  Scores derived from real uploaded data.
3.  Transparent reasons and data coverage.
4.  Honest handling of unknown or duplicate records.
5.  A useful workflow from upload to export.

That scope aligns with Caprae's stated lead-generation challenge and is
achievable as a focused prototype. A five-hour implementation cannot
guarantee a perfect rubric score, but a small, reproducible,
well-explained product gives you a more defensible submission than a
broad application with unverified claims.
