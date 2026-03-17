# Respondent-Driven Sampling Methodology

## What Is Respondent-Driven Sampling?

**Respondent-Driven Sampling (RDS)** is a network-based sampling method designed to reach "hidden" or hard-to-survey populations — groups that have no sampling frame (no list of members) and are unlikely to be reached through random-digit dialing or address-based sampling.

Classic examples include unsheltered people experiencing homelessness, people who inject drugs, undocumented immigrants, and sex workers. For all of these groups, there is no census or registry to sample from, making traditional probability sampling impossible.

RDS was introduced by Douglas Heckathorn in 1997 and has since been validated as one of the most statistically rigorous approaches for hidden-population research. It combines chain-referral sampling (like snowball sampling) with statistical adjustments that account for the social network structure of the population, allowing valid population estimates to be made.

## How RDS Works

1. **Seeds:** A small number of initial participants (called "seeds") are recruited directly — through outreach workers, shelters, or community contacts. These are not randomly selected; they are simply starting points.
2. **Referral coupons:** Each participant who completes a survey receives **3 referral coupons** (unique QR codes). They can share these with peers in their social network who meet eligibility criteria.
3. **Chain referral:** When a peer uses a coupon to participate, they also receive 3 new coupons to share — and so on, creating a chain of referrals that propagates through the social network.
4. **Population estimates:** Because each participant's social network size (degree) is recorded, and the probability of being recruited can be modeled from the network structure, RDS allows valid population-level estimates (e.g., proportion unhoused for more than a year) to be calculated from a non-random sample.

## Why It Works Better Than Snowball Sampling

Pure snowball sampling starts from seeds and grows through referrals, but makes no probabilistic claims — the sample is not generalizable. RDS adds two key improvements:

- **Dual incentive:** Participants are incentivized both for completing the survey and for recruiting peers who complete surveys. This improves chain propagation and reduces bias from seeds.
- **Network-adjusted estimation:** By recording how many people each participant knows who could have been referred, the data can be reweighted to correct for differential recruitment probabilities.

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

