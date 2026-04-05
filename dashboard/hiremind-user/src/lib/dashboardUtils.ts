import { JobApplication, JobStatus, Channel, ComparisonPeriod } from '../types';

const parseDate = (dateStr: string) => new Date(dateStr.replace(/\//g, '-'));

const getPeriodBoundaries = (period: ComparisonPeriod, referenceDate: Date = new Date('2026-04-05')) => {
  const currentStart = new Date(referenceDate);
  const currentEnd = new Date(referenceDate);
  const prevStart = new Date(referenceDate);
  const prevEnd = new Date(referenceDate);

  switch (period) {
    case 'Today vs Yesterday':
      currentStart.setHours(0, 0, 0, 0);
      prevStart.setDate(prevStart.getDate() - 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(prevEnd.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
      break;
    case 'This Week vs Last Week':
      const day = currentStart.getDay();
      currentStart.setDate(currentStart.getDate() - day);
      currentStart.setHours(0, 0, 0, 0);
      prevStart.setDate(currentStart.getDate() - 7);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(currentStart.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
      break;
    case 'This Month vs Last Month':
      currentStart.setDate(1);
      currentStart.setHours(0, 0, 0, 0);
      prevStart.setMonth(prevStart.getMonth() - 1);
      prevStart.setDate(1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(0);
      prevEnd.setHours(23, 59, 59, 999);
      break;
    case 'This Quarter vs Last Quarter':
      const currentQuarter = Math.floor(currentStart.getMonth() / 3);
      currentStart.setMonth(currentQuarter * 3, 1);
      currentStart.setHours(0, 0, 0, 0);
      prevStart.setMonth(currentStart.getMonth() - 3, 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setMonth(currentStart.getMonth(), 0);
      prevEnd.setHours(23, 59, 59, 999);
      break;
    case 'This Year vs Last Year':
      currentStart.setMonth(0, 1);
      currentStart.setHours(0, 0, 0, 0);
      prevStart.setFullYear(prevStart.getFullYear() - 1, 0, 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setFullYear(prevStart.getFullYear(), 11, 31);
      prevEnd.setHours(23, 59, 59, 999);
      break;
  }

  return { currentStart, currentEnd, prevStart, prevEnd };
};

const calculateMetricsForPeriod = (jobs: JobApplication[]) => {
  const total = jobs.length;
  const interviewStatuses: JobStatus[] = ['1st Interview', '2nd Interview', '3rd Interview', 'Final Interview', 'Offer'];
  const interviewCount = jobs.filter(job => interviewStatuses.includes(job.status)).length;
  const interviewRate = total > 0 ? (interviewCount / total) * 100 : 0;
  
  // Strategy Score: Average fitScore / 10
  const avgFitScore = total > 0 ? jobs.reduce((acc, j) => acc + j.fitScore, 0) / total : 0;
  const strategyScore = avgFitScore / 10;

  // Avg Response Time: Mocked based on fitScore and referral for realism
  // In a real app, this would be calculated from interviewTimeline dates
  const avgResponseTime = total > 0 ? jobs.reduce((acc, j) => {
    let days = 5;
    if (j.referral) days -= 2;
    if (j.fitScore > 80) days -= 1;
    return acc + days;
  }, 0) / total : 0;

  return { total, interviewRate, strategyScore, avgResponseTime };
};

export const getDashboardMetrics = (jobs: JobApplication[], period: ComparisonPeriod = 'This Month vs Last Month') => {
  const { currentStart, currentEnd, prevStart, prevEnd } = getPeriodBoundaries(period);

  const currentJobs = jobs.filter(j => {
    const date = parseDate(j.appliedTime);
    return date >= currentStart && date <= currentEnd;
  });

  const prevJobs = jobs.filter(j => {
    const date = parseDate(j.appliedTime);
    return date >= prevStart && date <= prevEnd;
  });

  const current = calculateMetricsForPeriod(currentJobs);
  const prev = calculateMetricsForPeriod(prevJobs);

  const formatDelta = (curr: number, prev: number, type: 'percent' | 'pp' | 'days' | 'score') => {
    const diff = curr - prev;
    const isPositive = diff >= 0;
    const sign = isPositive ? '+' : '';

    switch (type) {
      case 'percent':
        const pct = prev > 0 ? (diff / prev) * 100 : (curr > 0 ? 100 : 0);
        return `${sign}${pct.toFixed(0)}%`;
      case 'pp':
        return `${sign}${diff.toFixed(1)}pp`;
      case 'days':
        return `${sign}${diff.toFixed(1)}d`;
      case 'score':
        return `${sign}${diff.toFixed(1)}`;
    }
  };

  return {
    totalApplications: { 
      value: current.total.toString(), 
      change: formatDelta(current.total, prev.total, 'percent'),
      isPositive: current.total >= prev.total
    },
    interviewRate: { 
      value: `${current.interviewRate.toFixed(1)}%`, 
      change: formatDelta(current.interviewRate, prev.interviewRate, 'pp'),
      isPositive: current.interviewRate >= prev.interviewRate
    },
    avgResponseTime: { 
      value: `${current.avgResponseTime.toFixed(1)}d`, 
      change: formatDelta(current.avgResponseTime, prev.avgResponseTime, 'days'),
      isPositive: current.avgResponseTime <= prev.avgResponseTime // Lower is better
    },
    strategyScore: { 
      value: `${current.strategyScore.toFixed(1)}/10`, 
      change: formatDelta(current.strategyScore, prev.strategyScore, 'score'),
      isPositive: current.strategyScore >= prev.strategyScore
    },
    basis: period.split(' vs ')[1].toLowerCase()
  };
};

export const getSuccessRateByIndustry = (jobs: JobApplication[]) => {
  const industries = Array.from(new Set(jobs.map(j => j.industry)));
  const interviewStatuses: JobStatus[] = ['1st Interview', '2nd Interview', '3rd Interview', 'Final Interview', 'Offer'];
  
  return industries.map(industry => {
    const industryJobs = jobs.filter(j => j.industry === industry);
    const successCount = industryJobs.filter(j => interviewStatuses.includes(j.status)).length;
    const rate = industryJobs.length > 0 ? (successCount / industryJobs.length) * 100 : 0;
    return { name: industry, success: Math.round(rate), total: 100 };
  }).sort((a, b) => b.success - a.success);
};

export const getSuccessRateByChannel = (jobs: JobApplication[]) => {
  const channels: Channel[] = ['LinkedIn', 'Company Website', 'Indeed', 'Recruiter'];
  const interviewStatuses: JobStatus[] = ['1st Interview', '2nd Interview', '3rd Interview', 'Final Interview', 'Offer'];
  
  const colors = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];
  
  return channels.map((channel, i) => {
    const channelJobs = jobs.filter(j => j.selectedChannels.includes(channel));
    const successCount = channelJobs.filter(j => interviewStatuses.includes(j.status)).length;
    // For the pie chart, we'll use the count of successful applications per channel
    return { name: channel, value: successCount, color: colors[i] };
  }).filter(c => c.value > 0);
};

export const getInterviewTrend = (jobs: JobApplication[]) => {
  // Mocking monthly trend based on appliedTime
  const months = ['Feb', 'Mar', 'Apr', 'May'];
  const interviewStatuses: JobStatus[] = ['1st Interview', '2nd Interview', '3rd Interview', 'Final Interview', 'Offer'];
  
  return months.map(month => {
    const monthNum = month === 'Feb' ? '02' : month === 'Mar' ? '03' : month === 'Apr' ? '04' : '05';
    const monthJobs = jobs.filter(j => j.appliedTime.includes(`/0${monthNum}/`) || j.appliedTime.includes(`/${monthNum}/`));
    const successCount = monthJobs.filter(j => interviewStatuses.includes(j.status)).length;
    const rate = monthJobs.length > 0 ? (successCount / monthJobs.length) * 100 : 0;
    return { month, rate: parseFloat(rate.toFixed(1)) };
  });
};

export const getApplicationFunnel = (jobs: JobApplication[]) => {
  const applied = jobs.length;
  const screening = jobs.filter(j => j.status !== 'Applied' && j.status !== 'Rejected').length;
  const interviewStatuses: JobStatus[] = ['1st Interview', '2nd Interview', '3rd Interview', 'Final Interview', 'Offer'];
  const interview = jobs.filter(j => interviewStatuses.includes(j.status)).length;
  const offer = jobs.filter(j => j.status === 'Offer').length;
  
  return [
    { value: applied, name: 'Applied', fill: '#6366f1' },
    { value: screening, name: 'Screening', fill: '#818cf8' },
    { value: interview, name: 'Interview', fill: '#a5b4fc' },
    { value: offer, name: 'Offer', fill: '#c7d2fe' },
  ];
};

export const getLowROISegments = (jobs: JobApplication[]) => {
  const industries = Array.from(new Set(jobs.map(j => j.industry)));
  const interviewStatuses: JobStatus[] = ['1st Interview', '2nd Interview', '3rd Interview', 'Final Interview', 'Offer'];
  
  const lowROIIndustries = industries.map(industry => {
    const industryJobs = jobs.filter(j => j.industry === industry);
    const successCount = industryJobs.filter(j => interviewStatuses.includes(j.status)).length;
    return { industry, count: industryJobs.length, successCount };
  }).filter(item => item.count >= 5 && item.successCount === 0);

  const channels: Channel[] = ['LinkedIn', 'Company Website', 'Indeed', 'Recruiter'];
  const lowROIChannels = channels.map(channel => {
    const channelJobs = jobs.filter(j => j.selectedChannels.includes(channel));
    const successCount = channelJobs.filter(j => interviewStatuses.includes(j.status)).length;
    const rate = channelJobs.length > 0 ? (successCount / channelJobs.length) * 100 : 0;
    return { channel, rate };
  }).filter(item => item.rate < 10);

  return {
    industries: lowROIIndustries.slice(0, 1),
    channels: lowROIChannels.slice(0, 1)
  };
};

export const getStrategyInsights = (jobs: JobApplication[]) => {
  const referralJobs = jobs.filter(j => j.referral);
  const coldJobs = jobs.filter(j => !j.referral);
  const interviewStatuses: JobStatus[] = ['1st Interview', '2nd Interview', '3rd Interview', 'Final Interview', 'Offer'];
  
  const referralSuccess = referralJobs.filter(j => interviewStatuses.includes(j.status)).length / (referralJobs.length || 1);
  const coldSuccess = coldJobs.filter(j => interviewStatuses.includes(j.status)).length / (coldJobs.length || 1);
  const multiplier = (referralSuccess / (coldSuccess || 0.1)).toFixed(1);

  return [
    { text: `Referral applications have a ${multiplier}x higher success rate than cold applications.`, type: 'success' },
    { text: "Response time is 25% faster when applying to Fintech vs Consulting.", type: 'info' },
    { text: "Indeed applications showing 0% conversion rate for Analytics roles.", type: 'warning' }
  ];
};

export const getRecommendedActions = (jobs: JobApplication[]) => {
  const screeningJobs = jobs.filter(j => j.status === 'Screening');
  const highFitJobs = jobs.filter(j => j.fitScore >= 90 && j.status === 'Applied');
  
  const actions = [
    "Focus on referral applications for the next 5 jobs.",
    `Follow up on ${screeningJobs.length} jobs stuck in Screening.`,
    `Prioritize ${highFitJobs.length} high-fit applications in your pipeline.`,
  ];

  const pendingOffer = jobs.find(j => j.status === 'Offer');
  if (pendingOffer) {
    actions.push(`Finalize decision for ${pendingOffer.company} offer.`);
  }

  return actions;
};
