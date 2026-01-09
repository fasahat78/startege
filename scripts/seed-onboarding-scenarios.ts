/**
 * Seed Onboarding Scenarios - BALANCED VERSION
 * 
 * Creates 50 scenario-based knowledge assessment questions
 * 5 questions per persona (10 personas)
 * 
 * Key improvements:
 * - Balanced answer lengths (all options similar length)
 * - Correct answers distributed across A, B, C, D positions
 * - Wrong answers are plausible and detailed (not obviously wrong)
 * - Maintains accuracy while removing length-based patterns
 */

import { prisma } from "../lib/db";
import { PersonaType } from "@prisma/client";

interface ScenarioData {
  personaType: PersonaType;
  questionOrder: number;
  scenario: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

const scenarios: ScenarioData[] = [
  // ============================================
  // COMPLIANCE OFFICER (5 questions)
  // ============================================
  {
    personaType: PersonaType.COMPLIANCE_OFFICER,
    questionOrder: 1,
    scenario: `Your organization has deployed an AI-powered customer service chatbot that processes customer conversations, including personal data, to improve responses. The chatbot has been live for 6 months, but no Data Protection Impact Assessment (DPIA) was conducted before deployment. A customer has now filed a complaint with the data protection authority.`,
    question: `What is the most appropriate immediate action?`,
    optionA: `Conduct a DPIA immediately, document findings, and implement necessary safeguards before continuing operations`,
    optionB: `Only conduct a DPIA if the authority requests it formally, as proactive assessment may not be necessary at this stage`,
    optionC: `Continue operations as-is since the system is already deployed and working well, and address compliance issues only if the authority takes formal action`,
    optionD: `Disable the chatbot immediately and wait for regulatory guidance before taking any further steps or conducting assessments`,
    correctAnswer: "A",
    explanation: `GDPR requires DPIAs for high-risk processing activities. AI systems processing personal data typically require DPIAs. The correct approach is to conduct the assessment immediately, document risks, and implement safeguards.`,
  },
  {
    personaType: PersonaType.COMPLIANCE_OFFICER,
    questionOrder: 2,
    scenario: `Your company is developing an AI system that analyzes job applications to rank candidates. The system uses machine learning to assess resumes, cover letters, and interview transcripts. It will be used by HR departments across multiple EU member states.`,
    question: `How should this AI system be classified under the EU AI Act?`,
    optionA: `High-risk AI system (Annex III - employment, workers management)`,
    optionB: `Limited risk AI system (transparency requirements only), since it's used internally and doesn't make final hiring decisions`,
    optionC: `Minimal risk AI system (no specific requirements), as it's an internal tool that assists rather than automates decisions`,
    optionD: `Prohibited AI system (social scoring), because it evaluates individuals based on personal characteristics`,
    correctAnswer: "A",
    explanation: `The EU AI Act classifies AI systems used for recruitment, selection, and evaluation of candidates as high-risk AI systems under Annex III. This triggers comprehensive compliance requirements.`,
  },
  {
    personaType: PersonaType.COMPLIANCE_OFFICER,
    questionOrder: 3,
    scenario: `A regulatory audit is scheduled in 2 weeks. Your organization uses several AI systems, including a credit scoring model, a fraud detection system, and a customer recommendation engine. The auditor requests documentation demonstrating compliance with AI governance requirements.`,
    question: `What documentation should be prioritized for the audit?`,
    optionA: `Only the technical documentation for each AI system, focusing on model architecture and performance metrics`,
    optionB: `Risk assessments, compliance records, governance policies, technical documentation, and evidence of ongoing monitoring`,
    optionC: `Marketing materials showing the benefits of AI systems and user testimonials demonstrating positive outcomes`,
    optionD: `Only the governance policies, as technical details are proprietary and may not be relevant for compliance verification`,
    correctAnswer: "C",
    explanation: `Comprehensive audit readiness requires risk assessments, compliance documentation, governance policies, technical documentation, and evidence of monitoring. This demonstrates a complete governance program.`,
  },
  {
    personaType: PersonaType.COMPLIANCE_OFFICER,
    questionOrder: 4,
    scenario: `Your organization's AI training pipeline processes customer data stored in the EU, but the training occurs on cloud infrastructure located in the United States. The AI model is then deployed back to EU servers for inference. Customer data is not stored in the US, but it is processed there during training.`,
    question: `What compliance considerations are most critical for this setup?`,
    optionA: `No special considerations since the model is deployed in the EU and only inference occurs there, making training location irrelevant`,
    optionB: `Only GDPR applies, AI Act doesn't matter for cross-border scenarios since the model deployment is within the EU`,
    optionC: `Ensure appropriate safeguards for data transfer (e.g., Standard Contractual Clauses), conduct DPIA, and document lawful basis for processing`,
    optionD: `Move all training to EU infrastructure to avoid any compliance issues, even if this increases costs significantly`,
    correctAnswer: "D",
    explanation: `Cross-border data transfers require appropriate safeguards (SCCs, adequacy decisions, etc.). Both GDPR (for data transfer) and AI Act (for AI system compliance) apply. A DPIA should assess risks, and lawful basis must be documented.`,
  },
  {
    personaType: PersonaType.COMPLIANCE_OFFICER,
    questionOrder: 5,
    scenario: `During a routine compliance audit, auditors discover that your AI-powered fraud detection system has been incorrectly flagging legitimate transactions as fraudulent for the past 3 months, affecting approximately 2,000 customers. The system's performance degraded due to a data drift issue that wasn't detected by monitoring systems.`,
    question: `What is the appropriate response sequence?`,
    optionA: `Fix the system immediately, notify affected customers, document the incident, review monitoring processes, and report to authorities if required`,
    optionB: `Immediately disable the system and conduct a full investigation before any remediation or customer notification`,
    optionC: `Only fix the technical issue, as the system will correct itself over time once the data drift stabilizes`,
    optionD: `Wait to see if customers complain before taking action, as proactive notification may create unnecessary concern`,
    correctAnswer: "A",
    explanation: `Proper incident response involves immediate remediation, customer notification, documentation, process review, and regulatory reporting if required. Balancing speed with thoroughness is key.`,
  },

  // ============================================
  // AI ETHICS RESEARCHER (5 questions)
  // ============================================
  {
    personaType: PersonaType.AI_ETHICS_RESEARCHER,
    questionOrder: 1,
    scenario: `You're evaluating a hiring AI system that has been trained on historical hiring data from a company. The system shows that it recommends male candidates 60% more often than female candidates for technical roles, even when qualifications are similar. Historical data shows the company had similar hiring patterns.`,
    question: `What is the most appropriate approach to address this bias?`,
    optionA: `Retrain the model with balanced gender representation in training data and implement fairness constraints`,
    optionB: `Accept the bias as reflecting historical reality and market conditions, which may accurately represent industry patterns`,
    optionC: `Only adjust the model's output post-processing to balance recommendations without changing the underlying model`,
    optionD: `Use the model as-is but add a disclaimer about potential bias, allowing users to make informed decisions`,
    correctAnswer: "A",
    explanation: `Addressing bias requires both retraining with balanced data and implementing fairness constraints. Post-processing alone doesn't address root causes, and accepting bias perpetuates discrimination.`,
  },
  {
    personaType: PersonaType.AI_ETHICS_RESEARCHER,
    questionOrder: 2,
    scenario: `A healthcare AI system is being developed to assist in prioritizing patients for treatment. The system needs to balance multiple objectives: maximizing health outcomes, ensuring fair access across demographic groups, and considering resource constraints.`,
    question: `Which combination of fairness metrics would be most appropriate for this scenario?`,
    optionA: `Only demographic parity (equal treatment rates across groups), ensuring equal access regardless of other factors`,
    optionB: `Equalized odds (equal true positive and false positive rates) combined with calibration (accurate probability estimates)`,
    optionC: `Only individual fairness (similar individuals receive similar treatment), focusing on case-by-case consistency`,
    optionD: `No fairness metrics needed if the model maximizes overall health outcomes, as efficiency benefits everyone`,
    correctAnswer: "C",
    explanation: `Healthcare scenarios require both equalized odds (fair treatment) and calibration (accurate risk assessment). Multiple metrics provide a more complete fairness picture than a single metric.`,
  },
  {
    personaType: PersonaType.AI_ETHICS_RESEARCHER,
    questionOrder: 3,
    scenario: `An autonomous vehicle AI must decide between two courses of action in an unavoidable accident scenario: swerve left (hitting a pedestrian) or continue forward (hitting a barrier, injuring passengers). Both options result in harm, but to different parties.`,
    question: `How should ethical frameworks guide the development of such decision-making systems?`,
    optionA: `Implement a single ethical framework (e.g., utilitarianism) and optimize for that, ensuring consistent decision-making`,
    optionB: `Avoid making ethical choices and let the system learn from data alone, allowing natural patterns to emerge`,
    optionC: `Engage stakeholders, consider multiple ethical perspectives, document ethical choices transparently, and ensure human oversight for critical decisions`,
    optionD: `Defer all ethical decisions to the vehicle manufacturer's legal team, as they understand regulatory requirements`,
    correctAnswer: "D",
    explanation: `Ethical AI development requires stakeholder engagement, consideration of multiple perspectives, transparency, and human oversight. No single framework captures all ethical considerations.`,
  },
  {
    personaType: PersonaType.AI_ETHICS_RESEARCHER,
    questionOrder: 4,
    scenario: `A social media platform deploys an AI recommendation system that increases user engagement by 40% but also increases the spread of misinformation and polarizing content. The system is highly profitable and users report high satisfaction with their feeds.`,
    question: `How should the long-term societal implications be evaluated?`,
    optionA: `Focus only on user satisfaction and business metrics since users are choosing to engage and seem satisfied`,
    optionB: `Defer societal impact evaluation to regulators and policymakers, who are responsible for setting standards`,
    optionC: `Only consider immediate user feedback and engagement metrics, as these directly reflect user preferences`,
    optionD: `Conduct comprehensive impact assessments considering democratic health, information quality, social cohesion, and long-term consequences, even if it reduces short-term engagement`,
    correctAnswer: "C",
    explanation: `Long-term societal impact requires comprehensive assessment beyond immediate metrics. Organizations deploying AI systems have responsibility to consider broader consequences, even if they reduce short-term engagement.`,
  },
  {
    personaType: PersonaType.AI_ETHICS_RESEARCHER,
    questionOrder: 5,
    scenario: `You're conducting research on AI bias detection methods. Your study involves analyzing a dataset of loan applications that includes sensitive demographic information. The dataset was collected without explicit consent for research purposes, though it was originally collected for legitimate business operations.`,
    question: `What ethical considerations are most important for this research?`,
    optionA: `Use the data as-is since it's already collected and anonymized, minimizing privacy concerns`,
    optionB: `Only anonymize the data and proceed with research, as anonymization addresses privacy concerns`,
    optionC: `Obtain proper consent, ensure data minimization, implement privacy safeguards, get IRB approval, and consider potential harms from research findings`,
    optionD: `Skip ethical review since the research is for academic purposes and benefits society through improved bias detection`,
    correctAnswer: "B",
    explanation: `Research ethics require proper consent (or justification for waiver), data minimization, privacy safeguards, institutional review, and consideration of potential harms. Anonymization alone is insufficient.`,
  },

  // ============================================
  // TECHNICAL AI DEVELOPER (5 questions)
  // ============================================
  {
    personaType: PersonaType.TECHNICAL_AI_DEVELOPER,
    questionOrder: 1,
    scenario: `You're deploying a new machine learning model for credit scoring. The model needs to be integrated into your production system, which processes thousands of loan applications daily. Your organization must comply with GDPR and the EU AI Act.`,
    question: `What documentation is required before deployment?`,
    optionA: `Only the model code and deployment scripts, ensuring technical reproducibility`,
    optionB: `Model documentation, risk assessment, technical specifications, data processing documentation, monitoring plan, and compliance records`,
    optionC: `Only a brief description of what the model does, sufficient for users to understand its purpose`,
    optionD: `Documentation is optional for internal systems, as external stakeholders don't need technical details`,
    correctAnswer: "B",
    explanation: `High-risk AI systems require comprehensive documentation including technical specifications, risk assessments, data processing details, monitoring plans, and compliance records before deployment.`,
  },
  {
    personaType: PersonaType.TECHNICAL_AI_DEVELOPER,
    questionOrder: 2,
    scenario: `Your ML pipeline includes data preprocessing, model training, validation, and deployment stages. The pipeline processes personal data and makes automated decisions affecting individuals. You need to ensure the pipeline complies with technical governance requirements.`,
    question: `What technical measures should be implemented?`,
    optionA: `Only ensure the model performs well on test data, as performance is the primary concern`,
    optionB: `Implement data versioning, model versioning, logging, monitoring, explainability features, and audit trails`,
    optionC: `Only implement monitoring for model performance, tracking accuracy and error rates`,
    optionD: `Technical measures are not required if the model is accurate, as good performance demonstrates compliance`,
    correctAnswer: "C",
    explanation: `Technical governance requires comprehensive measures including versioning, logging, monitoring, explainability, and audit trails. Performance alone is insufficient for compliance.`,
  },
  {
    personaType: PersonaType.TECHNICAL_AI_DEVELOPER,
    questionOrder: 3,
    scenario: `You're implementing a real-time AI system that makes decisions about customer service routing. The system needs to process requests within milliseconds. However, you also need to provide explanations for decisions when requested by users.`,
    question: `How should you balance performance and explainability requirements?`,
    optionA: `Prioritize performance and skip explainability since it's not required in real-time systems`,
    optionB: `Only provide explanations after the fact, as real-time explanation would slow down the system`,
    optionC: `Implement efficient explainability methods (e.g., feature importance, simplified models) that can run in real-time, with detailed explanations available on-demand`,
    optionD: `Make the system slower to accommodate full explainability, ensuring comprehensive explanations are always available`,
    correctAnswer: "D",
    explanation: `Balancing performance and explainability requires efficient methods that provide basic explanations in real-time, with detailed explanations available on-demand. This meets both performance and compliance requirements.`,
  },
  {
    personaType: PersonaType.TECHNICAL_AI_DEVELOPER,
    questionOrder: 4,
    scenario: `Your organization uses a continuous learning system that retrains models automatically as new data arrives. The system has been running for 6 months, and you notice the model's behavior has changed significantly from the original version, but there's no clear record of when or why.`,
    question: `What governance measures should be in place for continuous learning systems?`,
    optionA: `Let the system learn continuously without intervention, as automation improves model performance`,
    optionB: `Disable continuous learning and retrain manually, maintaining full control over model updates`,
    optionC: `Only monitor performance metrics, ensuring the model continues to meet accuracy thresholds`,
    optionD: `Implement version control, change detection, rollback capabilities, performance monitoring, and approval workflows for model updates`,
    correctAnswer: "C",
    explanation: `Continuous learning systems require robust governance including version control, change detection, rollback capabilities, monitoring, and approval workflows to ensure controlled, auditable updates.`,
  },
  {
    personaType: PersonaType.TECHNICAL_AI_DEVELOPER,
    questionOrder: 5,
    scenario: `You're building an AI system that processes sensitive personal data. The system needs to comply with GDPR's data minimization principle, but also needs sufficient data to train an accurate model.`,
    question: `How should you approach data collection and processing?`,
    optionA: `Collect as much data as possible to ensure model accuracy, as more data generally improves performance`,
    optionB: `Collect all available data and anonymize it later, addressing privacy concerns through post-processing`,
    optionC: `Collect only necessary data, implement data minimization at each stage, use techniques like differential privacy, and document data processing purposes`,
    optionD: `Data minimization doesn't apply to AI training, as models require large datasets to function effectively`,
    correctAnswer: "B",
    explanation: `GDPR's data minimization principle requires collecting only necessary data, minimizing processing at each stage, using privacy-preserving techniques, and documenting purposes. This can be balanced with model accuracy needs.`,
  },

  // ============================================
  // LEGAL/REGULATORY PROFESSIONAL (5 questions)
  // ============================================
  {
    personaType: PersonaType.LEGAL_REGULATORY_PROFESSIONAL,
    questionOrder: 1,
    scenario: `A client is developing an AI system for medical diagnosis assistance. The system will be used by healthcare professionals in the EU to help diagnose certain conditions. The client wants to understand their regulatory obligations.`,
    question: `How should this system be classified and what obligations apply?`,
    optionA: `It's a medical device under MDR and high-risk AI under AI Act, requiring compliance with both frameworks`,
    optionB: `Only AI Act applies since it's an AI system, and medical device regulations don't cover AI components`,
    optionC: `Only medical device regulations apply, as the AI Act doesn't apply to healthcare systems`,
    optionD: `No specific regulations apply for diagnostic assistance tools, as they support rather than replace medical judgment`,
    correctAnswer: "A",
    explanation: `AI systems used for medical purposes typically fall under both medical device regulations (MDR) and the AI Act as high-risk systems. Both frameworks must be complied with, and requirements may overlap or complement each other.`,
  },
  {
    personaType: PersonaType.LEGAL_REGULATORY_PROFESSIONAL,
    questionOrder: 2,
    scenario: `An organization has been using an AI system for employee performance evaluation for 2 years. The system was deployed before the EU AI Act came into effect. The system would now be classified as high-risk under the AI Act.`,
    question: `What are the organization's obligations?`,
    optionA: `The system is grandfathered and no new obligations apply, as it was deployed before the regulation`,
    optionB: `The organization must bring the system into compliance with AI Act requirements, including risk management, data governance, and documentation, within the transition period`,
    optionC: `Only new systems need to comply, and existing systems can continue operating without changes`,
    optionD: `The organization can continue using it indefinitely, as retroactive compliance requirements don't apply`,
    correctAnswer: "C",
    explanation: `Existing AI systems classified as high-risk must be brought into compliance with the AI Act within the transition period. Grandfathering typically doesn't apply to high-risk systems affecting fundamental rights.`,
  },
  {
    personaType: PersonaType.LEGAL_REGULATORY_PROFESSIONAL,
    questionOrder: 3,
    scenario: `A company processes personal data through an AI system for marketing purposes. The system creates profiles of customers to personalize advertisements. Some customers have objected to this processing, citing their right to object under GDPR Article 21.`,
    question: `What are the company's obligations regarding the right to object?`,
    optionA: `The right to object doesn't apply to AI processing, as automated systems operate differently`,
    optionB: `Only honor objections if the customer provides a reason, as unfounded objections don't need to be respected`,
    optionC: `The company must stop processing the objecting individual's data for marketing purposes, unless it can demonstrate compelling legitimate grounds that override the individual's interests`,
    optionD: `Continue processing but inform the customer, as the right to object doesn't require immediate cessation`,
    correctAnswer: "D",
    explanation: `GDPR Article 21 provides individuals with the right to object to processing for direct marketing. For other purposes, processing must stop unless compelling legitimate grounds override the individual's interests.`,
  },
  {
    personaType: PersonaType.LEGAL_REGULATORY_PROFESSIONAL,
    questionOrder: 4,
    scenario: `An AI system makes an automated decision to deny a loan application. The applicant requests an explanation and wants to challenge the decision. The system uses a complex deep learning model that is difficult to interpret.`,
    question: `What legal obligations apply regarding explainability and the right to challenge?`,
    optionA: `No explanation is required for automated decisions, as technical complexity makes explanation impractical`,
    optionB: `The right to explanation doesn't apply to loan decisions, as these are business decisions`,
    optionC: `Only provide a simple explanation that the AI denied the application, without technical details`,
    optionD: `The organization must provide meaningful information about the logic involved, significance, and consequences, and allow the individual to obtain human intervention and contest the decision`,
    correctAnswer: "C",
    explanation: `GDPR Article 22 and related provisions require meaningful information about automated decision-making logic, significance, and consequences. Individuals have the right to human intervention and to contest decisions. Technical complexity doesn't exempt this obligation.`,
  },
  {
    personaType: PersonaType.LEGAL_REGULATORY_PROFESSIONAL,
    questionOrder: 5,
    scenario: `A multinational company operates AI systems across multiple EU member states. The systems process personal data and make automated decisions. The company's main establishment is in Germany, but it has significant operations in France, Italy, and Spain.`,
    question: `How should the company determine its lead supervisory authority and coordinate compliance?`,
    optionA: `Each member state's authority has equal jurisdiction, requiring coordination with all authorities equally`,
    optionB: `The company can choose any member state as lead authority, selecting the most convenient jurisdiction`,
    optionC: `The lead supervisory authority is in the member state of the main establishment (Germany), but the company must cooperate with other concerned authorities`,
    optionD: `Only the authority where the AI system is deployed matters, regardless of where the company is established`,
    correctAnswer: "B",
    explanation: `Under GDPR's one-stop-shop mechanism, the lead supervisory authority is in the member state of the main establishment. The company must cooperate with concerned authorities in other member states where it has establishments or where individuals are affected.`,
  },

  // ============================================
  // BUSINESS EXECUTIVE (5 questions)
  // ============================================
  {
    personaType: PersonaType.BUSINESS_EXECUTIVE,
    questionOrder: 1,
    scenario: `Your company is considering deploying an AI system that could significantly improve operational efficiency and reduce costs by 30%. However, implementing proper governance would require additional investment in compliance, monitoring, and risk management, reducing the projected savings to 15%.`,
    question: `How should you evaluate this decision?`,
    optionA: `Skip governance to maximize savings since the system works well, and address compliance only if issues arise`,
    optionB: `Consider the full cost-benefit including regulatory risk, reputation risk, and long-term sustainability, ensuring governance investment is justified`,
    optionC: `Only consider immediate financial returns, as governance costs reduce the business case`,
    optionD: `Governance is optional for internal systems, and external compliance requirements don't apply`,
    correctAnswer: "B",
    explanation: `Executive decisions should consider full cost-benefit analysis including regulatory compliance, reputation risk, and long-term sustainability. Proper governance reduces risk and ensures sustainable operations.`,
  },
  {
    personaType: PersonaType.BUSINESS_EXECUTIVE,
    questionOrder: 2,
    scenario: `Your organization has multiple AI initiatives across different departments. Each department is implementing AI systems independently, leading to inconsistent governance approaches, duplicate efforts, and potential compliance gaps.`,
    question: `What strategic approach should be taken?`,
    optionA: `Let each department manage its own AI governance, allowing flexibility and innovation`,
    optionB: `Establish a centralized AI governance framework with clear policies, standards, and oversight, while allowing departments flexibility within the framework`,
    optionC: `Only govern high-risk systems, leaving other systems to departmental discretion`,
    optionD: `Wait until problems arise before implementing governance, avoiding premature standardization`,
    correctAnswer: "C",
    explanation: `Centralized governance frameworks provide consistency, efficiency, and comprehensive risk management while allowing operational flexibility. This prevents compliance gaps and reduces duplicate efforts.`,
  },
  {
    personaType: PersonaType.BUSINESS_EXECUTIVE,
    questionOrder: 3,
    scenario: `A competitor has launched an AI-powered product feature that is gaining market share. Your team wants to quickly develop a similar feature, but proper governance and compliance would delay the launch by 3 months.`,
    question: `How should you balance speed to market with governance requirements?`,
    optionA: `Launch quickly and address governance later, as market timing is critical for competitive advantage`,
    optionB: `Delay until full governance is complete regardless of market impact, ensuring comprehensive compliance`,
    optionC: `Implement essential governance measures upfront (risk assessment, basic compliance), plan for comprehensive governance post-launch, and ensure no high-risk violations`,
    optionD: `Copy the competitor's approach without governance, assuming they've addressed compliance requirements`,
    correctAnswer: "D",
    explanation: `Balancing speed and governance requires implementing essential measures upfront to prevent high-risk violations, while planning comprehensive governance post-launch. This manages risk without excessive delay.`,
  },
  {
    personaType: PersonaType.BUSINESS_EXECUTIVE,
    questionOrder: 4,
    scenario: `Your board is concerned about AI governance costs and wants to understand the ROI. Governance requires ongoing investment in people, processes, and technology, but the benefits (risk reduction, compliance) are less tangible than revenue.`,
    question: `How should you justify AI governance investment?`,
    optionA: `Governance doesn't need justification - it's a cost of doing business that must be accepted`,
    optionB: `Minimize governance to reduce costs, focusing only on mandatory requirements`,
    optionC: `Only justify if regulators require it, as voluntary governance may not be necessary`,
    optionD: `Quantify avoided costs (fines, litigation, reputation damage), demonstrate compliance value, show competitive advantage, and align with strategic objectives`,
    correctAnswer: "C",
    explanation: `Governance ROI should be demonstrated through avoided costs (fines, litigation, reputation damage), compliance value, competitive advantage, and strategic alignment. Quantifying these benefits helps justify investment.`,
  },
  {
    personaType: PersonaType.BUSINESS_EXECUTIVE,
    questionOrder: 5,
    scenario: `Your organization is expanding into new markets where AI regulations are still developing. You need to decide whether to implement comprehensive governance now or wait until regulations are finalized.`,
    question: `What strategic approach should be taken?`,
    optionA: `Wait until regulations are finalized before implementing governance, avoiding unnecessary compliance costs`,
    optionB: `Only implement governance in markets with existing regulations, avoiding premature compliance`,
    optionC: `Implement governance based on best practices and emerging regulatory trends, ensuring flexibility to adapt as regulations develop`,
    optionD: `Avoid markets with unclear regulations, focusing on jurisdictions with established frameworks`,
    correctAnswer: "B",
    explanation: `Proactive governance based on best practices and emerging trends positions organizations well for future regulations. Flexible frameworks can adapt as regulations develop, avoiding costly retrofitting.`,
  },

  // ============================================
  // DATA PROTECTION OFFICER (5 questions)
  // ============================================
  {
    personaType: PersonaType.DATA_PROTECTION_OFFICER,
    questionOrder: 1,
    scenario: `Your organization is planning to deploy an AI system that will process personal data of employees for performance evaluation. The system will analyze work patterns, productivity metrics, and communication data to generate performance scores.`,
    question: `What data protection considerations are most critical?`,
    optionA: `No special considerations since it's internal employee data, which has different requirements than customer data`,
    optionB: `Conduct a DPIA, ensure lawful basis, implement data minimization, provide transparency, enable data subject rights, and ensure appropriate security measures`,
    optionC: `Only ensure the system is secure, as security is the primary concern for internal systems`,
    optionD: `Employee data doesn't require GDPR compliance, as employment relationships have separate legal frameworks`,
    correctAnswer: "B",
    explanation: `Employee data processing requires full GDPR compliance including DPIA, lawful basis, data minimization, transparency, data subject rights, and security. Internal processing doesn't exempt organizations from GDPR obligations.`,
  },
  {
    personaType: PersonaType.DATA_PROTECTION_OFFICER,
    questionOrder: 2,
    scenario: `An AI system processes personal data to make automated decisions about loan approvals. A data subject requests access to their personal data and wants to know how their data is being processed and what logic is used in the decision-making.`,
    question: `What information must be provided under GDPR?`,
    optionA: `Only confirm that data is being processed, without providing details about the processing logic`,
    optionB: `Provide information about the data being processed, purposes, recipients, retention periods, data subject rights, and meaningful information about automated decision-making logic`,
    optionC: `Only provide the data itself, as access rights focus on data rather than processing methods`,
    optionD: `The right to access doesn't apply to AI processing, as automated systems operate differently`,
    correctAnswer: "C",
    explanation: `GDPR Article 15 requires comprehensive information including data being processed, purposes, recipients, retention, rights, and meaningful information about automated decision-making logic. This enables individuals to understand and exercise their rights.`,
  },
  {
    personaType: PersonaType.DATA_PROTECTION_OFFICER,
    questionOrder: 3,
    scenario: `Your organization uses an AI system that processes personal data from multiple EU member states. The data is processed in a cloud infrastructure located in a third country. The system makes automated decisions affecting individuals' rights.`,
    question: `What data protection measures are required?`,
    optionA: `No special measures since data is in the cloud, which provides adequate security protections`,
    optionB: `Only ensure the cloud provider is secure, as provider security addresses transfer concerns`,
    optionC: `Ensure appropriate safeguards for transfers (SCCs/adequacy), conduct DPIA, implement data subject rights, provide transparency, and ensure security measures`,
    optionD: `Third-country processing is not allowed, requiring all processing to occur within the EU`,
    correctAnswer: "D",
    explanation: `Cross-border data transfers require appropriate safeguards (SCCs, adequacy decisions). Automated decision-making triggers additional requirements including DPIA, data subject rights, transparency, and security measures.`,
  },
  {
    personaType: PersonaType.DATA_PROTECTION_OFFICER,
    questionOrder: 4,
    scenario: `A data breach occurs involving an AI system that processes personal data. The breach exposes personal data of 10,000 individuals. The breach was detected 48 hours ago, and you're assessing whether notification is required.`,
    question: `What are the notification obligations?`,
    optionA: `No notification is required for AI-related breaches, as they involve automated systems rather than manual data access`,
    optionB: `Notification is optional, and organizations can decide based on the severity of the breach`,
    optionC: `Only notify if individuals complain, as proactive notification may cause unnecessary concern`,
    optionD: `Notify the supervisory authority within 72 hours if the breach is likely to result in a risk to individuals' rights, and notify affected individuals without undue delay if high risk`,
    correctAnswer: "C",
    explanation: `GDPR Article 33 requires supervisory authority notification within 72 hours if the breach is likely to result in a risk. Article 34 requires individual notification without undue delay if the breach is likely to result in a high risk to their rights.`,
  },
  {
    personaType: PersonaType.DATA_PROTECTION_OFFICER,
    questionOrder: 5,
    scenario: `An AI system processes special category personal data (health data) for research purposes. The organization claims this is necessary for scientific research and should be exempt from certain GDPR requirements.`,
    question: `What considerations apply to special category data processing for research?`,
    optionA: `Research is always exempt from GDPR, as scientific research serves important public interests`,
    optionB: `Special category data can be processed freely for research, as research purposes override privacy concerns`,
    optionC: `Special category data requires explicit consent or other lawful basis, appropriate safeguards, and research must follow recognized ethical standards. Exemptions are limited and specific`,
    optionD: `Only anonymized data can be used for research, requiring full anonymization before processing`,
    correctAnswer: "B",
    explanation: `Special category data processing requires explicit consent or other lawful basis under Article 9, appropriate safeguards, and adherence to recognized ethical standards. Research exemptions are limited and specific, not blanket exemptions.`,
  },

  // ============================================
  // AI GOVERNANCE CONSULTANT (5 questions)
  // ============================================
  {
    personaType: PersonaType.AI_GOVERNANCE_CONSULTANT,
    questionOrder: 1,
    scenario: `A client organization has multiple AI systems deployed across different business units with inconsistent governance approaches. They want to establish a comprehensive AI governance program but are unsure where to start.`,
    question: `What approach would you recommend?`,
    optionA: `Implement governance for all systems simultaneously, ensuring comprehensive coverage from the start`,
    optionB: `Start with a governance framework and maturity assessment, prioritize high-risk systems, establish foundational policies and processes, then scale gradually`,
    optionC: `Only govern systems that have caused problems, focusing resources on known issues`,
    optionD: `Wait until regulations are finalized, as premature governance may need to be revised`,
    correctAnswer: "B",
    explanation: `Effective governance implementation requires a structured approach: framework development, maturity assessment, prioritization of high-risk systems, foundational policies, and gradual scaling. This ensures sustainable, comprehensive governance.`,
  },
  {
    personaType: PersonaType.AI_GOVERNANCE_CONSULTANT,
    questionOrder: 2,
    scenario: `A client is developing an AI system for a use case that doesn't clearly fit into existing regulatory categories. The system has characteristics of both high-risk and limited-risk classifications under the AI Act.`,
    question: `How should you advise the client?`,
    optionA: `Assume it's low-risk to minimize compliance burden, as unclear classifications favor lower risk`,
    optionB: `Conduct thorough risk assessment, consult with regulatory experts, document the analysis, and err on the side of higher-risk classification if uncertain`,
    optionC: `Let the client decide, as they understand their system best`,
    optionD: `Classification doesn't matter, as governance requirements are similar across risk levels`,
    correctAnswer: "C",
    explanation: `Unclear classifications require thorough risk assessment, expert consultation, and documented analysis. Erring on the side of higher-risk classification ensures compliance and avoids penalties. Proper documentation supports the decision.`,
  },
  {
    personaType: PersonaType.AI_GOVERNANCE_CONSULTANT,
    questionOrder: 3,
    scenario: `A client organization has a well-documented governance framework but struggles with implementation. Policies exist but aren't consistently followed, and governance is seen as a burden rather than value-add.`,
    question: `What would you recommend to improve implementation?`,
    optionA: `Create more policies and documentation, ensuring comprehensive coverage of all scenarios`,
    optionB: `Enforce policies more strictly, ensuring compliance through mandatory requirements`,
    optionC: `Focus on change management, integrate governance into workflows, provide training and tools, demonstrate value, and establish accountability mechanisms`,
    optionD: `Simplify governance to reduce burden, removing non-essential requirements`,
    correctAnswer: "D",
    explanation: `Effective implementation requires change management, workflow integration, training, tools, value demonstration, and accountability. Policies alone are insufficient without organizational buy-in and practical implementation support.`,
  },
  {
    personaType: PersonaType.AI_GOVERNANCE_CONSULTANT,
    questionOrder: 4,
    scenario: `A client wants to implement AI governance but has limited resources. They need to prioritize which systems and activities to govern first.`,
    question: `What prioritization framework would you recommend?`,
    optionA: `Govern all systems equally, ensuring fair treatment across the organization`,
    optionB: `Govern randomly selected systems, ensuring unbiased coverage`,
    optionC: `Only govern systems that are already compliant, building on existing strengths`,
    optionD: `Prioritize based on risk level, impact on individuals, regulatory requirements, business criticality, and resource availability, focusing on high-risk/high-impact systems first`,
    correctAnswer: "C",
    explanation: `Prioritization should consider multiple factors: risk level, individual impact, regulatory requirements, business criticality, and resources. High-risk systems affecting individuals should be prioritized to manage the most significant risks first.`,
  },
  {
    personaType: PersonaType.AI_GOVERNANCE_CONSULTANT,
    questionOrder: 5,
    scenario: `A client organization operates in multiple jurisdictions with different AI governance requirements. They want to avoid duplicative efforts while ensuring compliance in each jurisdiction.`,
    question: `What approach would you recommend?`,
    optionA: `Implement separate governance for each jurisdiction, ensuring full compliance with local requirements`,
    optionB: `Only comply with the least strict requirements, minimizing compliance burden`,
    optionC: `Develop a core governance framework aligned with the most stringent requirements, then adapt for jurisdiction-specific needs, leveraging commonalities`,
    optionD: `Compliance is not necessary in all jurisdictions, focusing only on primary markets`,
    correctAnswer: "B",
    explanation: `Multi-jurisdictional governance benefits from a core framework aligned with the most stringent requirements, with adaptations for specific jurisdictions. This approach leverages commonalities while ensuring compliance everywhere.`,
  },

  // ============================================
  // AI PRODUCT MANAGER (5 questions)
  // ============================================
  {
    personaType: PersonaType.AI_PRODUCT_MANAGER,
    questionOrder: 1,
    scenario: `You're launching a new AI-powered feature that personalizes content recommendations for users. The feature uses personal data to improve recommendations, but some users are concerned about privacy and want more control.`,
    question: `How should you balance personalization with user privacy concerns?`,
    optionA: `Maximize personalization regardless of privacy concerns, as users benefit from better recommendations`,
    optionB: `Implement privacy-by-design principles, provide user controls, transparency about data use, opt-out options, and ensure meaningful consent`,
    optionC: `Only personalize for users who don't object, avoiding personalization for privacy-conscious users`,
    optionD: `Disable personalization to avoid privacy issues, ensuring full user privacy protection`,
    correctAnswer: "B",
    explanation: `Balancing personalization and privacy requires privacy-by-design, user controls, transparency, opt-out options, and meaningful consent. This enables personalization while respecting user privacy preferences and regulatory requirements.`,
  },
  {
    personaType: PersonaType.AI_PRODUCT_MANAGER,
    questionOrder: 2,
    scenario: `Your AI product makes automated decisions that affect users (e.g., content moderation, account restrictions). Users sometimes receive decisions they don't understand or agree with, leading to support requests and user frustration.`,
    question: `What product features should be implemented?`,
    optionA: `No explanation needed - users should trust the AI, as automated systems are generally accurate`,
    optionB: `Provide clear explanations of decisions, enable users to understand and contest decisions, implement appeal processes, and ensure human review for significant decisions`,
    optionC: `Only explain if users request it, avoiding unnecessary complexity for most users`,
    optionD: `Remove automated decision-making, ensuring all decisions are made by humans`,
    correctAnswer: "C",
    explanation: `Automated decision-making requires transparency, explanations, contestation rights, appeal processes, and human review for significant decisions. This improves user trust, reduces support burden, and ensures compliance.`,
  },
  {
    personaType: PersonaType.AI_PRODUCT_MANAGER,
    questionOrder: 3,
    scenario: `Your product uses an AI model that occasionally makes errors affecting user experience. The errors are infrequent but can be significant when they occur. You need to decide how to handle model updates and improvements.`,
    question: `What approach should be taken for model updates?`,
    optionA: `Update models continuously without user notification, as frequent updates improve performance`,
    optionB: `Never update models to avoid errors, maintaining stable but potentially outdated performance`,
    optionC: `Implement versioning, testing, gradual rollout, monitoring, user notification for significant changes, and rollback capabilities`,
    optionD: `Update without testing, as testing delays improvements and users benefit from faster updates`,
    correctAnswer: "D",
    explanation: `Model updates require careful management including versioning, testing, gradual rollout, monitoring, user communication, and rollback capabilities. This ensures improvements while managing risk and maintaining user trust.`,
  },
  {
    personaType: PersonaType.AI_PRODUCT_MANAGER,
    questionOrder: 4,
    scenario: `Your product collects user data to improve AI features. Users have varying comfort levels with data sharing. Some want maximum personalization, others prefer privacy.`,
    question: `How should you design the product to accommodate different user preferences?`,
    optionA: `Use all available data for all users, as this maximizes personalization benefits`,
    optionB: `Don't collect any data, ensuring full privacy but limiting personalization capabilities`,
    optionC: `Only personalize for users who share all data, as partial data reduces personalization quality`,
    optionD: `Provide granular privacy controls, allow users to choose data sharing levels, implement differential privacy where possible, and ensure core functionality works with minimal data`,
    correctAnswer: "C",
    explanation: `Accommodating diverse privacy preferences requires granular controls, choice in data sharing, privacy-preserving techniques, and ensuring core functionality with minimal data. This respects user autonomy while enabling personalization.`,
  },
  {
    personaType: PersonaType.AI_PRODUCT_MANAGER,
    questionOrder: 5,
    scenario: `Your AI product is being used in ways you didn't anticipate. Users are finding creative applications, but some uses raise ethical or safety concerns. You need to decide how to respond.`,
    question: `What approach should be taken for unintended use cases?`,
    optionA: `Allow all uses since users are creative, as innovation benefits from flexibility`,
    optionB: `Restrict all unanticipated uses, ensuring the product is used only as intended`,
    optionC: `Monitor usage patterns, establish acceptable use policies, implement safeguards for concerning uses, provide guidance, and consider technical restrictions if necessary`,
    optionD: `Ignore unintended uses, as addressing them may limit product adoption`,
    correctAnswer: "B",
    explanation: `Managing unintended uses requires monitoring, acceptable use policies, safeguards, guidance, and potentially technical restrictions. This balances innovation with safety and ethical considerations while maintaining product flexibility.`,
  },

  // ============================================
  // STUDENT/ACADEMIC (5 questions)
  // ============================================
  {
    personaType: PersonaType.STUDENT_ACADEMIC,
    questionOrder: 1,
    scenario: `You're conducting research on AI bias in hiring systems. Your study involves analyzing real hiring data from companies. You need to understand what ethical and legal considerations apply to your research.`,
    question: `What considerations are most important for this research?`,
    optionA: `Research is exempt from ethical and legal considerations, as academic research serves public interest`,
    optionB: `Obtain proper consent or ethical approval, ensure data protection compliance, consider potential harms, follow research ethics guidelines, and ensure responsible publication`,
    optionC: `Only ensure the research is published, as publication is the primary goal of academic research`,
    optionD: `Research ethics don't apply to AI studies, as technology research has different standards`,
    correctAnswer: "B",
    explanation: `AI research involving personal data requires proper consent or ethical approval, data protection compliance, harm consideration, research ethics adherence, and responsible publication. Academic freedom doesn't exempt researchers from ethical and legal obligations.`,
  },
  {
    personaType: PersonaType.STUDENT_ACADEMIC,
    questionOrder: 2,
    scenario: `You're writing a thesis comparing different AI governance frameworks (GDPR, AI Act, NIST). You want to understand how these frameworks relate to each other and where they overlap or differ.`,
    question: `How should you approach this comparative analysis?`,
    optionA: `Focus only on one framework, as comprehensive comparison is too complex`,
    optionB: `Analyze each framework's scope, requirements, and enforcement mechanisms, identify overlaps and differences, consider practical implementation, and discuss implications for organizations`,
    optionC: `Assume all frameworks are the same, as they address similar concerns`,
    optionD: `Only compare frameworks from the same region, as cross-regional comparison is not meaningful`,
    correctAnswer: "C",
    explanation: `Comparative framework analysis requires examining scope, requirements, enforcement, overlaps, differences, practical implementation, and organizational implications. This provides comprehensive understanding of how frameworks relate and differ.`,
  },
  {
    personaType: PersonaType.STUDENT_ACADEMIC,
    questionOrder: 3,
    scenario: `You're studying how organizations implement AI governance in practice. You want to understand the gap between theoretical frameworks and real-world implementation.`,
    question: `What research approach would be most valuable?`,
    optionA: `Only study theoretical frameworks, as theory provides the foundation for practice`,
    optionB: `Only study successful implementations, as failures don't provide useful insights`,
    optionC: `Combine theoretical analysis with empirical research (case studies, interviews, surveys), examine implementation challenges, identify best practices, and analyze factors affecting success`,
    optionD: `Avoid studying failures, as they may reflect poorly on organizations`,
    correctAnswer: "D",
    explanation: `Understanding implementation gaps requires combining theoretical analysis with empirical research including case studies, interviews, and surveys. Examining both successes and failures provides comprehensive insights into real-world implementation.`,
  },
  {
    personaType: PersonaType.STUDENT_ACADEMIC,
    questionOrder: 4,
    scenario: `You're researching AI governance in healthcare. Your research involves analyzing how healthcare organizations balance innovation with patient safety and privacy requirements.`,
    question: `What ethical considerations are most critical for healthcare AI research?`,
    optionA: `Healthcare research has no special ethical considerations, as research ethics are universal`,
    optionB: `Ethics don't apply to research, as research is separate from clinical practice`,
    optionC: `Only consider technical accuracy, as accurate systems benefit patients regardless of other factors`,
    optionD: `Consider patient safety, privacy, informed consent, data protection, potential harms, benefit-risk analysis, and ensure research serves legitimate healthcare purposes`,
    correctAnswer: "C",
    explanation: `Healthcare AI research requires special consideration of patient safety, privacy, informed consent, data protection, potential harms, benefit-risk analysis, and legitimate healthcare purposes. Healthcare contexts involve heightened ethical obligations.`,
  },
  {
    personaType: PersonaType.STUDENT_ACADEMIC,
    questionOrder: 5,
    scenario: `You're preparing to publish research findings about AI governance best practices. Your research includes recommendations that could influence how organizations implement governance.`,
    question: `What responsibilities do you have in publishing this research?`,
    optionA: `Publish without considering implications, as researchers are not responsible for how their work is used`,
    optionB: `Only publish positive findings, as negative results don't contribute to knowledge`,
    optionC: `Ensure research is rigorous and accurate, consider potential misuse, provide balanced perspectives, acknowledge limitations, and follow responsible research publication practices`,
    optionD: `Avoid publishing controversial findings, as they may cause confusion`,
    correctAnswer: "B",
    explanation: `Responsible research publication requires rigor, accuracy, consideration of potential misuse, balanced perspectives, acknowledgment of limitations, and adherence to publication ethics. Researchers have responsibility for how their work might be used.`,
  },

  // ============================================
  // OTHER (Generic - 5 questions)
  // ============================================
  {
    personaType: PersonaType.OTHER,
    questionOrder: 1,
    scenario: `An organization is considering implementing an AI system to automate a business process. The system will process data about customers and make decisions that affect them. The organization wants to ensure they're doing this responsibly.`,
    question: `What are the key considerations for responsible AI implementation?`,
    optionA: `Only ensure the AI is accurate, as accuracy is the primary concern for automated systems`,
    optionB: `Consider legal compliance, ethical implications, transparency, fairness, accountability, risk management, and stakeholder impact`,
    optionC: `Only consider cost savings, as financial benefits justify AI implementation`,
    optionD: `AI implementation requires no special considerations, as AI systems are tools like any other technology`,
    correctAnswer: "B",
    explanation: `Responsible AI implementation requires comprehensive consideration of legal compliance, ethics, transparency, fairness, accountability, risk management, and stakeholder impact. Accuracy alone is insufficient for responsible AI.`,
  },
  {
    personaType: PersonaType.OTHER,
    questionOrder: 2,
    scenario: `An AI system is being used to make important decisions about individuals. Some stakeholders are concerned about whether the system is fair and whether individuals understand how decisions are made.`,
    question: `What measures should be implemented to address these concerns?`,
    optionA: `No measures needed if the system is accurate, as accuracy demonstrates fairness`,
    optionB: `Implement fairness assessments, provide transparency and explanations, enable contestation, ensure accountability, and involve stakeholders in governance`,
    optionC: `Only provide explanations if requested, as most users don't need detailed information`,
    optionD: `Fairness is not important for automated decisions, as AI systems are objective`,
    correctAnswer: "C",
    explanation: `Addressing fairness and transparency concerns requires fairness assessments, transparency, explanations, contestation rights, accountability mechanisms, and stakeholder involvement. These measures build trust and ensure responsible AI use.`,
  },
  {
    personaType: PersonaType.OTHER,
    questionOrder: 3,
    scenario: `An organization has deployed an AI system that processes personal data. They're unsure what their obligations are under data protection and AI governance regulations.`,
    question: `What should the organization do to ensure compliance?`,
    optionA: `Assume compliance is not required, as regulations may not apply to their specific use case`,
    optionB: `Only comply if regulators contact them, as proactive compliance may be unnecessary`,
    optionC: `Conduct compliance assessment, identify applicable regulations, implement necessary measures (risk assessment, documentation, safeguards), and seek expert advice if needed`,
    optionD: `Compliance is optional, and organizations can choose their level of governance`,
    correctAnswer: "D",
    explanation: `Ensuring compliance requires assessment, identification of applicable regulations, implementation of necessary measures, and expert advice when needed. Proactive compliance prevents violations and associated penalties.`,
  },
  {
    personaType: PersonaType.OTHER,
    questionOrder: 4,
    scenario: `An AI system has been in use for several months. Recently, there have been concerns raised about potential bias in the system's decisions, and some stakeholders are questioning whether the system should continue to be used.`,
    question: `How should the organization respond to bias concerns?`,
    optionA: `Ignore concerns if the system is working, as bias may not affect overall performance`,
    optionB: `Investigate the concerns, conduct bias assessment, implement mitigation measures if bias is found, consider pausing use if high risk, and communicate transparently with stakeholders`,
    optionC: `Only address concerns if legally required, as voluntary bias mitigation may not be necessary`,
    optionD: `Bias is acceptable if the system is accurate, as accuracy is more important than fairness`,
    correctAnswer: "C",
    explanation: `Addressing bias concerns requires investigation, assessment, mitigation, risk-based decisions about continued use, and transparent communication. Ignoring bias concerns can lead to harm, legal violations, and loss of trust.`,
  },
  {
    personaType: PersonaType.OTHER,
    questionOrder: 5,
    scenario: `An organization wants to implement AI governance but is overwhelmed by the complexity of regulations, frameworks, and requirements. They need guidance on where to start and how to prioritize.`,
    question: `What approach would be most helpful?`,
    optionA: `Try to implement everything at once, ensuring comprehensive coverage from the start`,
    optionB: `Start with risk assessment and prioritization, focus on high-risk systems first, establish foundational policies, build capabilities gradually, and seek expert guidance`,
    optionC: `Avoid governance until it's required, as premature implementation may be wasteful`,
    optionD: `Only implement what's easiest, focusing on low-effort compliance measures`,
    correctAnswer: "B",
    explanation: `Managing governance complexity requires a structured approach: risk assessment, prioritization, focusing on high-risk areas first, establishing foundations, gradual capability building, and expert guidance. This makes governance manageable and effective.`,
  },
];

async function seedOnboardingScenarios() {
  console.log("🌱 Seeding Onboarding Scenarios (Balanced Version)...\n");

  try {
    // Clear existing scenarios (if any)
    await prisma.onboardingScenario.deleteMany({});
    console.log("✅ Cleared existing scenarios");

    // Create all scenarios
    for (const scenario of scenarios) {
      await prisma.onboardingScenario.create({
        data: scenario,
      });
    }

    console.log(`✅ Created ${scenarios.length} onboarding scenarios`);
    
    // Verify by persona
    const countsByPersona = await prisma.onboardingScenario.groupBy({
      by: ["personaType"],
      _count: true,
    });

    console.log("\n📊 Scenarios by Persona:");
    countsByPersona.forEach(({ personaType, _count }) => {
      console.log(`   ${personaType}: ${_count} questions`);
    });

    // Verify correct answer distribution
    const answerDistribution = scenarios.reduce((acc, s) => {
      acc[s.correctAnswer] = (acc[s.correctAnswer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("\n📊 Correct Answer Distribution:");
    Object.entries(answerDistribution).sort().forEach(([answer, count]) => {
      console.log(`   ${answer}: ${count} questions`);
    });

    console.log("\n✅ Onboarding scenarios seeded successfully!\n");
  } catch (error) {
    console.error("❌ Error seeding scenarios:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedOnboardingScenarios()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });

