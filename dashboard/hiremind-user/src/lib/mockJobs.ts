import { JobApplication, JobDescription } from '../types';

const getMockDescription = (title: string): JobDescription => {
  const descriptions: Record<string, Partial<JobDescription>> = {
    'Data Analyst': {
      responsibilities: [
        'Analyze complex datasets to identify trends and patterns',
        'Build and maintain automated dashboards using Tableau/Power BI',
        'Collaborate with cross-functional teams to define key performance indicators',
        'Present data-driven insights to stakeholders for strategic decision making'
      ],
      requirements: [
        '2+ years of experience in data analytics or related field',
        'Strong proficiency in SQL and Excel',
        'Experience with data visualization tools (Tableau, Looker, or Power BI)',
        'Bachelor\'s degree in Statistics, Mathematics, or Computer Science'
      ],
      skills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Excel']
    },
    'Business Analyst': {
      responsibilities: [
        'Evaluate business processes and identify areas for improvement',
        'Document business requirements and translate them into technical specifications',
        'Perform cost-benefit analysis for new projects and initiatives',
        'Facilitate workshops and meetings with business stakeholders'
      ],
      requirements: [
        '3+ years of experience in business analysis or project management',
        'Strong analytical and problem-solving skills',
        'Excellent communication and documentation abilities',
        'Experience with Agile/Scrum methodologies'
      ],
      skills: ['Business Analysis', 'Agile', 'Jira', 'Process Mapping', 'SQL']
    },
    'Product Analyst': {
      responsibilities: [
        'Analyze product usage data to identify opportunities for growth',
        'Design and analyze A/B tests to evaluate new features',
        'Develop product health metrics and monitoring systems',
        'Work closely with Product Managers to define product strategy'
      ],
      requirements: [
        'Experience with product analytics tools (Amplitude, Mixpanel, or Heap)',
        'Strong understanding of experimental design and A/B testing',
        'Ability to translate complex data into actionable product insights',
        'Proficiency in SQL and Python/R'
      ],
      skills: ['A/B Testing', 'Amplitude', 'SQL', 'Python', 'Product Strategy']
    },
    'Strategy Analyst': {
      responsibilities: [
        'Conduct market research and competitive analysis',
        'Develop financial models to support strategic planning',
        'Identify and evaluate new market opportunities',
        'Prepare executive-level presentations on strategic initiatives'
      ],
      requirements: [
        'Background in management consulting or corporate strategy',
        'Advanced financial modeling skills in Excel',
        'Strong strategic thinking and structured problem-solving',
        'MBA or equivalent advanced degree preferred'
      ],
      skills: ['Financial Modeling', 'Market Research', 'Strategy', 'Excel', 'PowerPoint']
    },
    'Analytics Engineer': {
      responsibilities: [
        'Build and maintain data models in dbt',
        'Optimize data pipelines for performance and reliability',
        'Implement data quality checks and monitoring',
        'Bridge the gap between data engineering and data analysis'
      ],
      requirements: [
        'Strong proficiency in SQL and dbt',
        'Experience with cloud data warehouses (Snowflake, BigQuery, or Redshift)',
        'Understanding of software engineering best practices (Git, CI/CD)',
        'Experience with data orchestration tools (Airflow or Dagster)'
      ],
      skills: ['dbt', 'SQL', 'Snowflake', 'Git', 'Data Modeling']
    }
  };

  const desc = descriptions[title] || descriptions['Data Analyst'];
  return {
    responsibilities: desc.responsibilities || [],
    requirements: desc.requirements || [],
    skills: desc.skills || [],
    visaInfo: 'Sponsorship Available'
  };
};

export const MOCK_JOBS: JobApplication[] = [
  // --- Applied (10) ---
  ...Array.from({ length: 10 }, (_, i) => {
    const jobTitle = ['Data Analyst', 'Business Analyst', 'Product Analyst', 'Strategy Analyst', 'Analytics Engineer'][i % 5];
    return {
      id: `app-${i + 1}`,
      jobTitle,
      company: ['Goldman Sachs', 'Salesforce', 'Google', 'Amazon', 'McKinsey', 'Stripe', 'HubSpot', 'Meta', 'Uber', 'Bain'][i],
      industry: ['Fintech', 'SaaS', 'Tech', 'Marketplace', 'Consulting'][i % 5],
      location: ['New York, NY', 'San Francisco, CA', 'Remote', 'Seattle, WA', 'Chicago, IL'][i % 5],
      experienceLevel: ['Entry Level', 'Mid-Level'][i % 2],
      fitScore: 70 + Math.floor(Math.random() * 25),
      fitBreakdown: { skills: 80, experience: 75, industry: 85, visa: 100, gap: 'Minor skill gap in specific tool.' },
      status: 'Applied' as const,
      selectedChannels: [['LinkedIn', 'Company Website', 'Indeed', 'Recruiter'][i % 4]] as any,
      referral: i % 3 === 0,
      appliedTime: `2026/04/${1 + i} 10:00`,
      resumeUrl: '#',
      coverLetterUrl: '#',
      notes: [],
      tags: i % 4 === 0 ? ['High Priority'] : [],
      jobDescription: getMockDescription(jobTitle),
      interviewTimeline: [],
      interviewProbability: 0.2 + (i * 0.05),
      attempts: 1
    };
  }),

  // --- Screening (8) ---
  ...Array.from({ length: 8 }, (_, i) => {
    const jobTitle = ['Business Analyst', 'Data Analyst', 'Strategy Analyst', 'Analytics Engineer'][i % 4];
    return {
      id: `scr-${i + 1}`,
      jobTitle,
      company: ['JPMorgan', 'Adobe', 'Netflix', 'Lyft', 'BCG', 'Square', 'Slack', 'Airbnb'][i],
      industry: ['Fintech', 'SaaS', 'Tech', 'Marketplace', 'Consulting', 'Fintech', 'SaaS', 'Marketplace'][i],
      location: ['New York, NY', 'San Jose, CA', 'Los Gatos, CA', 'San Francisco, CA', 'Boston, MA', 'Remote', 'Remote', 'San Francisco, CA'][i],
      experienceLevel: ['Mid-Level', 'Entry Level'][i % 2],
      fitScore: 75 + Math.floor(Math.random() * 20),
      fitBreakdown: { skills: 85, experience: 80, industry: 80, visa: 100, gap: 'Good alignment.' },
      status: 'Screening' as const,
      selectedChannels: [['LinkedIn', 'Recruiter', 'Company Website'][i % 3]] as any,
      referral: i % 2 === 0,
      appliedTime: `2026/04/${1 + i} 09:00`,
      resumeUrl: '#',
      coverLetterUrl: '#',
      notes: [{ id: `n-scr-${i}`, content: 'Recruiter screen scheduled.', timestamp: '2026/04/05', type: 'call' as const }],
      tags: ['Follow-up'],
      jobDescription: getMockDescription(jobTitle),
      interviewTimeline: [],
      interviewProbability: 0.4,
      attempts: 1
    };
  }),

  // --- 1st Interview (10) ---
  ...Array.from({ length: 10 }, (_, i) => {
    const jobTitle = ['Analytics Engineer', 'Product Analyst', 'Data Analyst', 'Business Analyst', 'Strategy Analyst'][i % 5];
    return {
      id: `int1-${i + 1}`,
      jobTitle,
      company: ['Morgan Stanley', 'Zendesk', 'Microsoft', 'DoorDash', 'Deloitte', 'PayPal', 'Atlassian', 'Apple', 'Instacart', 'KPMG'][i],
      industry: ['Fintech', 'SaaS', 'Tech', 'Marketplace', 'Consulting'][i % 5],
      location: ['New York, NY', 'San Francisco, CA', 'Redmond, WA', 'San Francisco, CA', 'New York, NY', 'Remote', 'Sydney, AU', 'Cupertino, CA', 'Remote', 'Chicago, IL'][i],
      experienceLevel: 'Mid-Level',
      fitScore: 80 + Math.floor(Math.random() * 15),
      fitBreakdown: { skills: 90, experience: 85, industry: 85, visa: 100, gap: 'Strong match.' },
      status: '1st Interview' as const,
      selectedChannels: [['LinkedIn', 'Recruiter'][i % 2]] as any,
      referral: true,
      appliedTime: `2026/03/${15 + i} 11:00`,
      resumeUrl: '#',
      coverLetterUrl: '#',
      notes: [],
      tags: ['Interviewing'],
      jobDescription: getMockDescription(jobTitle),
      interviewTimeline: [{ id: `r1-${i}`, roundNumber: 1, name: '1st Interview', date: '2026/03/20', time: '10:00 AM', result: 'Pending' as const, quality: '--' as const, notes: '' }],
      interviewProbability: 0.6,
      attempts: 1
    };
  }),

  // --- 2nd Interview (8) ---
  ...Array.from({ length: 8 }, (_, i) => {
    const jobTitle = ['Data Analyst', 'Business Analyst', 'Product Analyst', 'Strategy Analyst'][i % 4];
    return {
      id: `int2-${i + 1}`,
      jobTitle,
      company: ['Robinhood', 'Datadog', 'Oracle', 'eBay', 'EY', 'Affirm', 'Snowflake', 'Booking.com'][i],
      industry: ['Fintech', 'SaaS', 'Tech', 'Marketplace', 'Consulting', 'Fintech', 'SaaS', 'Marketplace'][i],
      location: ['Menlo Park, CA', 'New York, NY', 'Austin, TX', 'San Jose, CA', 'London, UK', 'Remote', 'Bozeman, MT', 'Amsterdam, NL'][i],
      experienceLevel: 'Mid-Level',
      fitScore: 85 + Math.floor(Math.random() * 10),
      fitBreakdown: { skills: 92, experience: 88, industry: 90, visa: 100, gap: 'Very high alignment.' },
      status: '2nd Interview' as const,
      selectedChannels: [['LinkedIn', 'Company Website'][i % 2]] as any,
      referral: i % 2 === 0,
      appliedTime: `2026/03/${1 + i} 14:00`,
      resumeUrl: '#',
      coverLetterUrl: '#',
      notes: [],
      tags: ['High Priority', 'Interviewing'],
      jobDescription: getMockDescription(jobTitle),
      interviewTimeline: [
        { id: `r1-2-${i}`, roundNumber: 1, name: '1st Interview', date: '2026/03/15', time: '10:00 AM', result: 'Pass' as const, quality: 'Good Fit' as const, notes: 'Great technical skills.' },
        { id: `r2-2-${i}`, roundNumber: 2, name: '2nd Interview', date: '2026/03/22', time: '02:00 PM', result: 'Pending' as const, quality: '--' as const, notes: '' }
      ],
      interviewProbability: 0.75,
      attempts: 1
    };
  }),

  // --- 3rd Interview (4) ---
  ...Array.from({ length: 4 }, (_, i) => {
    const jobTitle = ['Analytics Engineer', 'Data Analyst'][i % 2];
    return {
      id: `int3-${i + 1}`,
      jobTitle,
      company: ['Databricks', 'Confluent', 'MongoDB', 'Elastic'][i],
      industry: 'Tech',
      location: 'Remote',
      experienceLevel: 'Mid-Level',
      fitScore: 90 + Math.floor(Math.random() * 5),
      fitBreakdown: { skills: 95, experience: 90, industry: 95, visa: 100, gap: 'Perfect match.' },
      status: '3rd Interview' as const,
      selectedChannels: ['Recruiter'] as any,
      referral: true,
      appliedTime: `2026/02/${20 + i} 09:00`,
      resumeUrl: '#',
      coverLetterUrl: '#',
      notes: [],
      tags: ['High Priority', 'Interviewing'],
      jobDescription: getMockDescription(jobTitle),
      interviewTimeline: [
        { id: `r1-3-${i}`, roundNumber: 1, name: '1st Interview', date: '2026/03/01', time: '10:00 AM', result: 'Pass' as const, quality: 'Good Fit' as const, notes: 'Strong SQL.' },
        { id: `r2-3-${i}`, roundNumber: 2, name: '2nd Interview', date: '2026/03/10', time: '11:00 AM', result: 'Pass' as const, quality: 'Good Fit' as const, notes: 'Excellent logic.' },
        { id: `r3-3-${i}`, roundNumber: 3, name: '3rd Interview', date: '2026/03/25', time: '01:00 PM', result: 'Pending' as const, quality: '--' as const, notes: '' }
      ],
      interviewProbability: 0.85,
      attempts: 1
    };
  }),

  // --- Final Interview (2) ---
  ...Array.from({ length: 2 }, (_, i) => {
    const jobTitle = 'Product Analyst';
    return {
      id: `final-${i + 1}`,
      jobTitle,
      company: ['TikTok', 'Pinterest'][i],
      industry: 'Tech',
      location: 'San Francisco, CA',
      experienceLevel: 'Mid-Level',
      fitScore: 95,
      fitBreakdown: { skills: 98, experience: 95, industry: 95, visa: 100, gap: 'Exceptional candidate.' },
      status: 'Final Interview' as const,
      selectedChannels: ['LinkedIn'] as any,
      referral: true,
      appliedTime: `2026/02/15 10:00`,
      resumeUrl: '#',
      coverLetterUrl: '#',
      notes: [],
      tags: ['High Priority', 'Interviewing'],
      jobDescription: getMockDescription(jobTitle),
      interviewTimeline: [
        { id: `r1-f-${i}`, roundNumber: 1, name: '1st Interview', date: '2026/02/25', time: '10:00 AM', result: 'Pass' as const, quality: 'Good Fit' as const, notes: 'Great product sense.' },
        { id: `r2-f-${i}`, roundNumber: 2, name: '2nd Interview', date: '2026/03/05', time: '11:00 AM', result: 'Pass' as const, quality: 'Good Fit' as const, notes: 'Strong analytical skills.' },
        { id: `r3-f-${i}`, roundNumber: 3, name: '3rd Interview', date: '2026/03/20', time: '01:00 PM', result: 'Pass' as const, quality: 'Good Fit' as const, notes: 'Excellent cultural fit.' },
        { id: `r4-f-${i}`, roundNumber: 4, name: 'Final Interview', date: '2026/03/28', time: '03:00 PM', result: 'Pending' as const, quality: '--' as const, notes: '' }
      ],
      interviewProbability: 0.9,
      attempts: 1
    };
  }),

  // --- Offer (4) ---
  ...Array.from({ length: 4 }, (_, i) => {
    const jobTitle = ['Data Analyst', 'Analytics Engineer'][i % 2];
    return {
      id: `off-${i + 1}`,
      jobTitle,
      company: ['Stripe', 'Airbnb', 'Snowflake', 'Databricks'][i],
      industry: 'Tech',
      location: 'Remote',
      experienceLevel: 'Mid-Level',
      fitScore: 98,
      fitBreakdown: { skills: 100, experience: 95, industry: 100, visa: 100, gap: 'Perfect fit.' },
      status: 'Offer' as const,
      selectedChannels: ['LinkedIn'] as any,
      referral: true,
      appliedTime: `2026/01/15 10:00`,
      resumeUrl: '#',
      coverLetterUrl: '#',
      notes: [],
      tags: ['High Priority'],
      jobDescription: getMockDescription(jobTitle),
      interviewTimeline: [
        { id: `r1-o-${i}`, roundNumber: 1, name: '1st Interview', date: '2026/01/25', time: '10:00 AM', result: 'Pass' as const, quality: 'Good Fit' as const, notes: 'Strong technical skills.' },
        { id: `r2-o-${i}`, roundNumber: 2, name: '2nd Interview', date: '2026/02/05', time: '11:00 AM', result: 'Pass' as const, quality: 'Good Fit' as const, notes: 'Great problem solver.' },
        { id: `r3-o-${i}`, roundNumber: 3, name: '3rd Interview', date: '2026/02/20', time: '01:00 PM', result: 'Pass' as const, quality: 'Good Fit' as const, notes: 'Excellent communication.' },
        { id: `r4-o-${i}`, roundNumber: 4, name: 'Final Interview', date: '2026/03/05', time: '03:00 PM', result: 'Pass' as const, quality: 'Good Fit' as const, notes: 'Perfect cultural fit.' }
      ],
      offerDetails: {
        salary: ['$140,000', '$155,000', '$160,000', '$145,000'][i],
        pto: 'Unlimited',
        bonus: '15%',
        deadline: '2026/04/15',
        decision: 'Pending' as const,
        notes: 'Includes equity and signing bonus.'
      },
      interviewProbability: 1.0,
      attempts: 1
    };
  }),

  // --- Rejected (4) ---
  ...Array.from({ length: 4 }, (_, i) => {
    const jobTitle = ['Strategy Analyst', 'Business Analyst'][i % 2];
    return {
      id: `rej-${i + 1}`,
      jobTitle,
      company: ['McKinsey', 'Bain', 'BCG', 'Deloitte'][i],
      industry: 'Consulting',
      location: 'New York, NY',
      experienceLevel: 'Mid-Level',
      fitScore: 65,
      fitBreakdown: { skills: 70, experience: 60, industry: 70, visa: 100, gap: 'High competition.' },
      status: 'Rejected' as const,
      selectedChannels: ['Indeed'] as any,
      referral: false,
      appliedTime: `2026/01/05 10:00`,
      resumeUrl: '#',
      coverLetterUrl: '#',
      notes: [],
      tags: [],
      jobDescription: getMockDescription(jobTitle),
      interviewTimeline: [],
      rejectedReason: 'High Competition',
      rejectedNotes: 'Decided to move forward with candidates who have more specific industry experience.',
      interviewProbability: 0.1,
      attempts: 1
    };
  })
];
