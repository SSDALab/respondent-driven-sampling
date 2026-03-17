# Respondent-Driven Sampling Methodology

## What Is Respondent-Driven Sampling?

**Respondent-Driven Sampling (RDS)** is a network-based sampling method designed to reach "hidden" or hard-to-survey populations — groups that have no sampling frame (no list of members) and are unlikely to be reached through random-digit dialing or address-based sampling.

Classic examples include unsheltered people experiencing homelessness, people who inject drugs, undocumented immigrants, and sex workers. For all of these groups, there is no census or registry to sample from, making traditional probability sampling impossible.

Despite a well-established methodological literature RDS has remained difficult to deploy at scale. Field implementation has historically relied on paper coupons and manual tracking of referral chains — a process prone to linkage errors and dependent on significant operational expertise. This application was developed to address that gap: it replaces manual coupon tracking with a QR-code-based referral system. Includes one-time password authentication and device-agnostic data capture — reducing field error and lowering the barrier to adoption. The system was developed and validated through field deployment with the King County Regional Homelessness Authority's Point-in-Time (PIT) count. The detailed methodology can be found here: [https://doi.org/10.1093/aje/kwae342.](https://doi.org/10.1093/aje/kwae342) 

## How RDS Works

1. **Seeds:** A small number of initial participants (called "seeds") are recruited directly — through outreach workers, shelters, or community contacts. These are not randomly selected; they are simply starting points.
2. **Referral coupons:** Each participant who completes a survey receives **3 referral coupons** (unique QR codes). They can share these with peers in their social network who meet eligibility criteria.
3. **Chain referral:** When a peer uses a coupon to participate, they also receive 3 new coupons to share — and so on, creating a chain of referrals that propagates through the social network.
4. **Population estimates:** Because each participant's social network size (degree) is recorded, and the probability of being recruited can be modeled from the network structure, RDS allows valid population-level estimates (e.g., proportion unhoused for more than a year) to be calculated from a non-random sample.

## How the RDS App Implements This

```
Seed (starting QR code distributed by outreach worker)
    │
    ▼
Survey completed → 3 child QR codes generated
    │               │
    │               └─ Printed / shared with referred peers
    ▼
Peer scans QR code → starts their own survey
    │
    ▼
Survey completed → 3 more child QR codes generated
    │
    └─ ... (chain continues)
```

In the app:

- Each survey record has a `surveyCode` (the code used to start it), a `parentSurveyCode` (the code that referred it), and `childSurveyCodes` (the 3 codes it generates).
- Scanning a QR code on the QR page after survey completion takes a peer directly to their survey, pre-filled with the referring code.
- All referral relationships are stored in MongoDB and can be exported for network analysis.

## Population Estimation from RDS Data

The RDS App collects the data; population estimation is done with external tools. The two most commonly used are:

See [Post-Survey Analysis](../how-to/analysis.md) for how to export data from the app for use with these tools.

## Further Reading

- Heckathorn, D.D. (1997). Respondent-Driven Sampling: A New Approach to the Study of Hidden Populations. *Social Problems*, 44(2), 174–199. [doi:10.2307/3096941](https://doi.org/10.2307/3096941)
- Volz, E. & Heckathorn, D.D. (2008). Probability Based Estimation Theory for Respondent Driven Sampling. *Journal of Official Statistics*, 24(1), 79–97.
- [https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2142964](https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2142964)

