# ONCE — European and United Nations Funding & Recognition Pitch

**Tagline:** #AdFreeWorld — Open communication infrastructure for everyone  
**Project:** ONCE — Open Global Communication  
**Entry experience:** HeavenKey  
**Status date:** 3 November 2026  
**Stage:** Early prototype and public architecture draft; not a production service.

## 1. Executive proposal

ONCE proposes an open, interoperable and privacy-preserving communications commons: a free-to-use, ad-free user experience that allows people to communicate across independent providers and compatible applications without being locked into one proprietary platform.

ONCE is not asking the European Union or the United Nations to endorse a finished global messenger. It is asking them to support a transparent, multi-stakeholder research and implementation programme that can test whether secure, open and federated communication infrastructure can become a reusable digital public good.

**HeavenKey** is the proposed entry experience: passkey-first account access, user-controlled identity and transparent device management. It is not intended to become a central identity authority or a custodian of users' encryption keys.

**Current reality:** The public GitHub project contains an architecture draft, initial message-envelope schema and a local browser prototype. The prototype demonstrates interface flows and browser-local encrypted storage only. It does not yet provide server-verified passkey authentication, person-to-person network delivery, audited end-to-end encryption, federation, production mobile apps or external messenger bridges. Funding would support those next stages.

## 2. Why now

The European Commission's 2026 Open Source Strategy puts open source at the centre of technological sovereignty and explicitly identifies secure e-mail and decentralised social media among open alternatives relevant to Europe. It also recognises the need for sustainable funding, maintenance, security and public-sector adoption of open source.

The UN Global Digital Compact calls for safe, secure, inclusive and interoperable digital public infrastructure; increased investment in digital public goods; open standards; privacy safeguards; and multi-stakeholder partnerships.

ONCE translates those policy objectives into a concrete, testable communications project.

## 3. Public-interest mission

### #AdFreeWorld

- No behavioural advertising in private communications.
- No sale of message content or personal contact graphs.
- No advertising-driven profiling or engagement manipulation.
- Free core messaging for end users.
- Open-source client and protocol development.
- Provider choice, federation, export and migration.
- Accessible interfaces, localisation and low-bandwidth support.
- Transparent governance, security disclosure and public roadmaps.

"Free" refers to access to the core user experience, not a claim that hosting, moderation, security operations and long-term maintenance have no cost. Sustainability should come from a diversified mix of public-interest grants, public procurement, institutional hosting/support contracts, donations and transparent sponsorships that do not buy access to user data or private conversations.

## 4. Proposed work programme: 18 months

### Work package 1 — Protocol and governance (months 1–4)
- Compare Matrix federation and event semantics, MLS (RFC 9420), and relevant open messaging standards.
- Select the smallest interoperable architecture that avoids unnecessary protocol reinvention.
- Publish a versioned protocol profile, conformance tests and open governance process.
- Establish a public technical steering group and independent security advisory process.

### Work package 2 — HeavenKey identity and device security (months 2–8)
- Implement server-verified WebAuthn/FIDO2 passkey registration and authentication.
- Separate account authentication from messaging identity and device encryption keys.
- Build device enrolment, verification, revocation and account recovery.
- Conduct privacy and usability testing; no central master key or default provider escrow.

### Work package 3 — Secure messaging and federation (months 4–12)
- Integrate maintained, reviewed cryptographic implementations; no custom cryptography.
- Deliver direct messaging between at least two independently operated test homeservers.
- Implement encrypted attachments, offline delivery and multi-device synchronisation.
- Document server-visible metadata and retention.

### Work package 4 — Interoperability and portability (months 9–15)
- Demonstrate ONCE-to-ONCE interoperability across independent providers.
- Prototype email interoperability with clear security and downgrade warnings.
- Publish a bridge security matrix and implement only permitted APIs or open protocols.
- Demonstrate export, migration and identity continuity.

### Work package 5 — Public-interest pilot and evaluation (months 13–18)
- Pilot with a small, diverse group of civil-society, education, community and public-sector partners.
- Measure usability, accessibility, reliability, privacy, security and adoption.
- Publish independent audit findings, open test results and implementation guidance.
- Produce a roadmap for wider European and international deployment.

## 5. Illustrative budget and funding request

**Indicative 18-month programme: €1.2 million**, subject to partner roles, eligible-cost rules and call requirements.

| Workstream | Indicative amount |
|---|---:|
| Protocol engineering and open standards | €220,000 |
| HeavenKey, identity and device security | €190,000 |
| Messaging, federation and interoperability | €300,000 |
| Independent security audits and privacy review | €120,000 |
| Accessibility, localisation and pilot deployment | €110,000 |
| Project coordination, legal, governance and evaluation | €160,000 |
| Infrastructure, testing and contingency | €100,000 |
| **Total** | **€1,200,000** |

This is a planning estimate, not a grant offer or a confirmed eligible budget. A smaller €25,000–€50,000 technical demonstrator is a realistic first funding target through suitable open-internet cascade-funding calls. A larger EU application would normally require a qualified consortium and a call whose topic and eligibility conditions match the work.

## 6. Proposed consortium

The project should be built with independent partners rather than presented as a single-vendor product.

Potential partner roles:
- Open-source protocol and federation maintainers.
- University cryptography and privacy research groups.
- Independent penetration-testing and security-audit organisations.
- European non-profit digital-rights organisations.
- Accessibility and digital-inclusion organisations.
- Public administrations or education/community pilot hosts.
- European hosting and infrastructure providers.

The lead applicant must be a legally eligible entity for the selected funding call. The current GitHub project/repository is not itself evidence of a grant-eligible legal applicant. Before submission, establish the applicant entity, ownership and contributor rights, governance, financial controls and consortium agreements.

## 7. European Union pathway

### Strategic fit

The strongest policy alignment is the European Commission's Open Source Strategy and the Digital Commons EDIC. The Commission's strategy expressly aims to support development, scaling and long-term sustainability of open-source technologies, public administration reuse, standards and European digital sovereignty.

### Priority engagement
1. **Digital Commons EDIC:** request a technical scoping meeting and guidance on whether ONCE could become a candidate digital commons project or reusable building block.
2. **DG CONNECT / European Commission:** present ONCE as an open communication infrastructure demonstrator aligned with open-source alternatives, secure e-mail, decentralised social media and interoperability.
3. **EU Funding & Tenders Portal:** monitor Digital Europe, Horizon Europe and other calls. Apply only where the topic, applicant type, consortium and deadline genuinely fit.
4. **NGI / open-internet cascade funding:** target future calls for open internet infrastructure, privacy, security, interoperability and end-user applications.

### Current call note — 3 November 2026

The NGI OIS Restack first open call advertised grants of €5,000–€50,000 for open internet commons, open standards and open-source infrastructure, with a closing deadline of **3 November 2026 at 12:00 CET**. As of the evening of 3 November 2026, that deadline has passed. Do not present this call as still open; monitor subsequent rounds and related NGI opportunities.

The current Digital Europe cybersecurity calls include topics with deadlines in January 2027, but the published topics are targeted at defined cybersecurity capabilities, AI cybersecurity tools, public authorities and other specified stakeholders. ONCE should not claim eligibility or fit without matching its work to the precise call text and building the required consortium.

## 8. United Nations pathway: recognition and partnerships

The UN is not a single general-purpose grant agency, and there is no automatic UN grant or endorsement simply by submitting a project description. ONCE should pursue concrete recognition and partnership routes.

### A. Digital Public Goods Alliance (DPGA)

Prepare for nomination to the Digital Public Goods Registry against the nine indicators of the Digital Public Goods Standard:
1. SDG relevance;
2. open licensing;
3. clear ownership;
4. platform independence;
5. documentation;
6. mechanism for extracting data;
7. privacy and applicable laws;
8. standards and best practices;
9. safeguards covering data privacy/security, illegal content and harassment.

ONCE is not yet ready to claim DPG status. The current prototype and project documentation are an initial foundation; a mature, functioning, documented and responsibly governed open-source solution is needed. Complete the eligibility assessment, resolve licensing and ownership, implement safety and privacy processes, and then submit for independent review. DPGA recognition is a registry decision, not UN certification or a grant award.

### B. UN Global Digital Compact and Digital Cooperation Portal

Submit ONCE as a digital cooperation initiative for visibility, partner discovery and contribution to implementation of the Global Digital Compact. The Compact explicitly supports open-source digital public goods, interoperability, privacy safeguards and investment in digital public infrastructure.

Request a scoping conversation with the UN Office for Digital and Emerging Technologies (ODET) and the Global Digital Compact team. Seek feedback on the initiative's relevance to the Compact and suitable multi-stakeholder forums. Do not imply UN endorsement before it is formally granted.

### C. UN agencies and development partners

Explore programme-specific partnerships with UNDP and ITU, and relevant country-level digital inclusion programmes. These are partnership-development pathways, not confirmed open grants for ONCE. A credible pilot in an underserved or multilingual community, with a local implementation partner, measurable outcomes and sustainable operating plan, will strengthen the case.

## 9. Recognition requests

ONCE asks the EU and UN ecosystem to consider:
- Technical review and feedback on interoperability and safeguards.
- Inclusion in relevant open-source and digital public infrastructure catalogues where eligible.
- Introductions to research, civil-society and public-sector pilot partners.
- Participation in relevant consultations, workshops and multi-stakeholder events.
- Guidance on suitable calls and funding instruments.
- Consideration for a funded, independently evaluated pilot.

ONCE does **not** ask for political endorsement of a private company, exclusive status, or privileged access to citizens' data.

## 10. Impact indicators

Targets for the 18-month pilot, to be validated with partners:
- Two independently operated test providers successfully federated.
- At least two independently developed clients or interoperable implementations.
- 100% of private message bodies encrypted client-side under the selected reviewed E2EE profile.
- Published threat model, metadata assessment and independent security audit.
- Device verification, revocation and tested account recovery.
- Successful export and migration between test providers.
- Accessibility review and pilot localisation into at least five languages.
- Public conformance tests, documentation and transparent governance.
- No behavioural advertising or sale of personal communication data in the core service.

## 11. Risk management and credibility

- **Security:** no production claims before independent audit; use established protocols and libraries.
- **Interoperability:** proprietary networks are only connected through official APIs or permitted mechanisms; a bridge may weaken E2EE and must disclose this.
- **Privacy:** minimise metadata, avoid public contact directories, perform data-protection impact assessment where required.
- **Abuse and safety:** implement reporting, blocking, anti-spam controls and safeguards against harassment and illegal content without routine plaintext surveillance.
- **Sustainability:** fund maintenance, moderation, incident response and accessibility beyond the grant period.
- **Governance:** publish decision-making, conflict-of-interest and contributor policies; avoid unilateral control by one founder or vendor.
- **Licensing:** reconcile the ONCE project licence and contributor rights with the parent repository's GPL-3.0 declaration; publish a clear licence file and third-party dependency inventory before external funding or DPG nomination.

## 12. Closing statement

We invite European and international partners to help build a communication layer that people can trust, inspect, adapt and use without being turned into advertising inventory.

**ONCE — Open Global Communication**  
**HeavenKey — a user-controlled entry**  
**#AdFreeWorld — communication as a public-interest digital commons**

One open network. Many independent providers. Human communication without advertising surveillance.

## Official sources and application pathways

- European Commission, EU Open Source Strategy: https://digital-strategy.ec.europa.eu/en/policies/open-source-strategy
- Digital Commons EDIC: https://digital-strategy.ec.europa.eu/en/policies/edic
- Digital Europe Programme: https://digital-strategy.ec.europa.eu/en/activities/digital-programme
- EU Funding & Tenders Portal: https://ec.europa.eu/info/funding-tenders/opportunities/portal/
- NGI open calls: https://ngi.eu/opencalls/
- UN Global Digital Compact: https://www.un.org/global-digital-compact/en
- UN Office for Digital and Emerging Technologies: https://www.un.org/digital-emerging-technologies/
- UN Digital Cooperation Portal: https://www.undigitalcooperation.org/
- Digital Public Goods Standard: https://www.digitalpublicgoods.net/standard
- Digital Public Goods application FAQs: https://www.digitalpublicgoods.net/digital-public-goods/faqs
