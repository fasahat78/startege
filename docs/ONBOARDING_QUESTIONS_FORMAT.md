# Onboarding Scenario Questions - Format & Examples

## 📋 Question Format Specification

### Standard Structure
Each scenario question follows this exact format:

```
**Scenario**: [2-4 sentences describing a realistic AI governance situation]
**Question**: [1 clear question about what should be done/decided]
**Options**:
A) [Option 1 - typically correct or best practice]
B) [Option 2 - common mistake or suboptimal approach]
C) [Option 3 - another alternative]
D) [Option 4 - incorrect or inappropriate approach]
```

### Design Principles
1. **Realistic Scenarios**: Based on actual AI governance challenges
2. **Clear Options**: Each option is distinct and plausible
3. **Knowledge Differentiation**: Options should distinguish between knowledge levels
4. **No Trick Questions**: Straightforward, fair assessment
5. **Educational**: Even wrong answers teach something

---

## 📝 Example Questions by Persona

### Compliance Officer - Question Set

#### Question 1: GDPR Compliance
**Scenario**: 
Your organization has deployed an AI-powered customer service chatbot that processes customer conversations, including personal data, to improve responses. The chatbot has been live for 6 months, but no Data Protection Impact Assessment (DPIA) was conducted before deployment. A customer has now filed a complaint with the data protection authority.

**Question**: 
What is the most appropriate immediate action?

**Options**:
A) Conduct a DPIA immediately, document findings, and implement necessary safeguards before continuing operations
B) Continue operations as-is since the system is already deployed and working well
C) Disable the chatbot immediately and wait for regulatory guidance
D) Only conduct a DPIA if the authority requests it

**Correct Answer**: A
**Explanation**: GDPR requires DPIAs for high-risk processing activities. AI systems processing personal data typically require DPIAs. The correct approach is to conduct the assessment immediately, document risks, and implement safeguards.

---

#### Question 2: AI Act Risk Classification
**Scenario**:
Your company is developing an AI system that analyzes job applications to rank candidates. The system uses machine learning to assess resumes, cover letters, and interview transcripts. It will be used by HR departments across multiple EU member states.

**Question**:
How should this AI system be classified under the EU AI Act?

**Options**:
A) High-risk AI system (Annex III - employment, workers management)
B) Limited risk AI system (transparency requirements only)
C) Minimal risk AI system (no specific requirements)
D) Prohibited AI system (social scoring)

**Correct Answer**: A
**Explanation**: The EU AI Act classifies AI systems used for recruitment, selection, and evaluation of candidates as high-risk AI systems under Annex III. This triggers comprehensive compliance requirements.

---

#### Question 3: Audit Documentation
**Scenario**:
A regulatory audit is scheduled in 2 weeks. Your organization uses several AI systems, including a credit scoring model, a fraud detection system, and a customer recommendation engine. The auditor requests documentation demonstrating compliance with AI governance requirements.

**Question**:
What documentation should be prioritized for the audit?

**Options**:
A) Only the technical documentation for each AI system
B) Risk assessments, compliance records, governance policies, technical documentation, and evidence of ongoing monitoring
C) Marketing materials showing the benefits of AI systems
D) Only the governance policies, as technical details are proprietary

**Correct Answer**: B
**Explanation**: Comprehensive audit readiness requires risk assessments, compliance documentation, governance policies, technical documentation, and evidence of monitoring. This demonstrates a complete governance program.

---

#### Question 4: Cross-Border Data Transfer
**Scenario**:
Your organization's AI training pipeline processes customer data stored in the EU, but the training occurs on cloud infrastructure located in the United States. The AI model is then deployed back to EU servers for inference. Customer data is not stored in the US, but it is processed there during training.

**Question**:
What compliance considerations are most critical for this setup?

**Options**:
A) No special considerations since the model is deployed in the EU
B) Ensure appropriate safeguards for data transfer (e.g., Standard Contractual Clauses), conduct DPIA, and document lawful basis for processing
C) Only GDPR applies, AI Act doesn't matter for cross-border scenarios
D) Move all training to EU infrastructure to avoid any compliance issues

**Correct Answer**: B
**Explanation**: Cross-border data transfers require appropriate safeguards (SCCs, adequacy decisions, etc.). Both GDPR (for data transfer) and AI Act (for AI system compliance) apply. A DPIA should assess risks, and lawful basis must be documented.

---

#### Question 5: Incident Response
**Scenario**:
During a routine compliance audit, auditors discover that your AI-powered fraud detection system has been incorrectly flagging legitimate transactions as fraudulent for the past 3 months, affecting approximately 2,000 customers. The system's performance degraded due to a data drift issue that wasn't detected by monitoring systems.

**Question**:
What is the appropriate response sequence?

**Options**:
A) Fix the system immediately, notify affected customers, document the incident, review monitoring processes, and report to authorities if required
B) Wait to see if customers complain before taking action
C) Only fix the technical issue, as the system will correct itself over time
D) Immediately disable the system and conduct a full investigation before any remediation

**Correct Answer**: A
**Explanation**: Proper incident response involves immediate remediation, customer notification, documentation, process review, and regulatory reporting if required. Balancing speed with thoroughness is key.

---

### AI Ethics Researcher - Question Set

#### Question 1: Bias Detection
**Scenario**:
You're evaluating a hiring AI system that has been trained on historical hiring data from a company. The system shows that it recommends male candidates 60% more often than female candidates for technical roles, even when qualifications are similar. Historical data shows the company had similar hiring patterns.

**Question**:
What is the most appropriate approach to address this bias?

**Options**:
A) Retrain the model with balanced gender representation in training data and implement fairness constraints
B) Accept the bias as reflecting historical reality and market conditions
C) Only adjust the model's output post-processing to balance recommendations
D) Use the model as-is but add a disclaimer about potential bias

**Correct Answer**: A
**Explanation**: Addressing bias requires both retraining with balanced data and implementing fairness constraints. Post-processing alone doesn't address root causes, and accepting bias perpetuates discrimination.

---

#### Question 2: Fairness Metrics
**Scenario**:
A healthcare AI system is being developed to assist in prioritizing patients for treatment. The system needs to balance multiple objectives: maximizing health outcomes, ensuring fair access across demographic groups, and considering resource constraints.

**Question**:
Which combination of fairness metrics would be most appropriate for this scenario?

**Options**:
A) Only demographic parity (equal treatment rates across groups)
B) Equalized odds (equal true positive and false positive rates) combined with calibration (accurate probability estimates)
C) Only individual fairness (similar individuals receive similar treatment)
D) No fairness metrics needed if the model maximizes overall health outcomes

**Correct Answer**: B
**Explanation**: Healthcare scenarios require both equalized odds (fair treatment) and calibration (accurate risk assessment). Multiple metrics provide a more complete fairness picture than a single metric.

---

#### Question 3: Ethical Frameworks
**Scenario**:
An autonomous vehicle AI must decide between two courses of action in an unavoidable accident scenario: swerve left (hitting a pedestrian) or continue forward (hitting a barrier, injuring passengers). Both options result in harm, but to different parties.

**Question**:
How should ethical frameworks guide the development of such decision-making systems?

**Options**:
A) Implement a single ethical framework (e.g., utilitarianism) and optimize for that
B) Engage stakeholders, consider multiple ethical perspectives, document ethical choices transparently, and ensure human oversight for critical decisions
C) Avoid making ethical choices and let the system learn from data alone
D) Defer all ethical decisions to the vehicle manufacturer's legal team

**Correct Answer**: B
**Explanation**: Ethical AI development requires stakeholder engagement, consideration of multiple perspectives, transparency, and human oversight. No single framework captures all ethical considerations.

---

#### Question 4: Societal Impact
**Scenario**:
A social media platform deploys an AI recommendation system that increases user engagement by 40% but also increases the spread of misinformation and polarizing content. The system is highly profitable and users report high satisfaction with their feeds.

**Question**:
How should the long-term societal implications be evaluated?

**Options**:
A) Focus only on user satisfaction and business metrics since users are choosing to engage
B) Conduct comprehensive impact assessments considering democratic health, information quality, social cohesion, and long-term consequences, even if it reduces short-term engagement
C) Only consider immediate user feedback and engagement metrics
D) Defer societal impact evaluation to regulators and policymakers

**Correct Answer**: B
**Explanation**: Long-term societal impact requires comprehensive assessment beyond immediate metrics. Organizations deploying AI systems have responsibility to consider broader consequences, even if they reduce short-term engagement.

---

#### Question 5: Research Ethics
**Scenario**:
You're conducting research on AI bias detection methods. Your study involves analyzing a dataset of loan applications that includes sensitive demographic information. The dataset was collected without explicit consent for research purposes, though it was originally collected for legitimate business operations.

**Question**:
What ethical considerations are most important for this research?

**Options**:
A) Use the data as-is since it's already collected and anonymized
B) Obtain proper consent, ensure data minimization, implement privacy safeguards, get IRB approval, and consider potential harms from research findings
C) Only anonymize the data and proceed with research
D) Skip ethical review since the research is for academic purposes

**Correct Answer**: B
**Explanation**: Research ethics require proper consent (or justification for waiver), data minimization, privacy safeguards, institutional review, and consideration of potential harms. Anonymization alone is insufficient.

---

## 🎯 Knowledge Level Scoring

### Scoring Logic
- **0-1 correct**: BEGINNER
- **2-3 correct**: INTERMEDIATE  
- **4-5 correct**: ADVANCED
- **Skipped**: NOT_ASSESSED

### Implementation Notes
- Questions are presented in random order (not sequential)
- User can skip individual questions
- If user skips all questions → NOT_ASSESSED
- If user answers some but not all → Score based on answered questions

---

## 📊 Question Quality Checklist

For each question, ensure:
- [ ] Scenario is realistic and relevant to persona
- [ ] Question is clear and unambiguous
- [ ] Options are distinct and plausible
- [ ] Correct answer reflects best practice
- [ ] Wrong answers represent common mistakes or misconceptions
- [ ] Explanation educates the user
- [ ] Question tests knowledge appropriate for the persona

---

## 🔄 Question Updates

Questions should be periodically reviewed and updated to:
- Reflect new regulations (e.g., AI Act updates)
- Incorporate lessons learned from real-world scenarios
- Maintain relevance to current AI governance challenges
- Ensure accuracy of correct answers

