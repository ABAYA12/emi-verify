const express = require('express');
const router = express.Router();
const InsuranceCase = require('../models/InsuranceCase');
const DocumentVerification = require('../models/DocumentVerification');

// Get Insurance Cases KPIs with Updated Revenue Calculation
router.get('/insurance-cases', async (req, res) => {
  try {
    const dateFilter = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    // Fetch all KPIs in parallel
    const [
      totalCases,
      closedCases,
      avgTurnaround,
      pendingCases,
      onTimeCases,
      casesByCountry,
      casesByType,
      fraudCases,
      fraudCasesByType,
      fraudCasesBySource,
      fraudRateByCompany,
      countryRiskAssessment,
      statusBreakdown
    ] = await Promise.all([
      InsuranceCase.getTotalCases(dateFilter),
      InsuranceCase.getClosedCases(dateFilter),
      InsuranceCase.getAverageTurnaroundTime(dateFilter),
      InsuranceCase.getPendingCases(dateFilter),
      InsuranceCase.getOnTimeCases(dateFilter),
      InsuranceCase.getCasesByCountry(dateFilter),
      InsuranceCase.getCasesByType(dateFilter),
      InsuranceCase.getFraudCases(dateFilter),
      InsuranceCase.getFraudCasesByType(dateFilter),
      InsuranceCase.getFraudCasesBySource(dateFilter),
      InsuranceCase.getFraudRateByInsuranceCompany(dateFilter),
      InsuranceCase.getCountryRiskAssessment(dateFilter),
      InsuranceCase.getStatusBreakdown(dateFilter)
    ]);

    // Calculate additional metrics
    const onTimePercentage = totalCases > 0 ? (onTimeCases / totalCases * 100).toFixed(2) : 0;
    const fraudPercentage = totalCases > 0 ? (fraudCases / totalCases * 100).toFixed(2) : 0;

    const kpis = {
      // Core KPIs
      total_cases_received: totalCases,
      total_cases_closed: closedCases,
      average_turnaround_time: Math.round(avgTurnaround * 100) / 100,
      percentage_cases_closed_on_time: parseFloat(onTimePercentage),
      pending_cases: pendingCases,
      
      // Volume Analysis
      case_volume_by_country: casesByCountry,
      case_volume_by_case_type: casesByType,
      
      // Fraud Analysis
      total_fraud_cases: fraudCases,
      percentage_fraudulent_cases: parseFloat(fraudPercentage),
      fraud_cases_by_type: fraudCasesByType,
      fraud_cases_by_source: fraudCasesBySource,
      fraud_rate_by_insurance_company: fraudRateByCompany,
      
      // Risk Assessment
      country_risk_assessment: countryRiskAssessment,
      
      // Status Breakdown
      status_breakdown: statusBreakdown
    };

    res.json({
      success: true,
      data: kpis,
      generated_at: new Date().toISOString(),
      date_filter: dateFilter
    });
  } catch (error) {
    console.error('Error generating insurance cases KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating insurance cases KPIs',
      error: error.message
    });
  }
});

// Get Document Verification KPIs
router.get('/document-verifications', async (req, res) => {
  try {
    const dateFilter = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    // Fetch all KPIs in parallel
    const [
      totalVerifications,
      completedVerifications,
      avgTurnaround,
      pendingVerifications,
      onTimeVerifications,
      verificationsByDocType,
      verificationsByCountry,
      totalProcessingFees,
      totalAgentPayments,
      agentPerformance
    ] = await Promise.all([
      DocumentVerification.getTotalVerifications(dateFilter),
      DocumentVerification.getCompletedVerifications(dateFilter),
      DocumentVerification.getAverageTurnaroundTime(dateFilter),
      DocumentVerification.getPendingVerifications(dateFilter),
      DocumentVerification.getOnTimeVerifications(dateFilter),
      DocumentVerification.getVerificationsByDocumentType(dateFilter),
      DocumentVerification.getVerificationsByCountry(dateFilter),
      DocumentVerification.getTotalProcessingFees(dateFilter),
      DocumentVerification.getTotalAgentPayments(dateFilter),
      DocumentVerification.getAgentPerformance(dateFilter)
    ]);

    // Calculate additional metrics
    const onTimePercentage = totalVerifications > 0 ? 
      (onTimeVerifications / totalVerifications * 100).toFixed(2) : 0;

    const kpis = {
      // Core KPIs
      total_verifications_received: totalVerifications,
      total_completed_verifications: completedVerifications,
      average_turnaround_time: Math.round(avgTurnaround * 100) / 100,
      percentage_on_time_verifications: parseFloat(onTimePercentage),
      pending_verifications: pendingVerifications,
      
      // Volume Analysis
      verification_volume_by_document_type: verificationsByDocType,
      verification_volume_by_country_region: verificationsByCountry,
      
      // Financial Metrics
      total_processing_fees_collected: totalProcessingFees,
      total_agent_payments: totalAgentPayments,
      
      // Agent Performance
      agent_performance: agentPerformance.map(agent => ({
        ...agent,
        avg_turnaround: agent.avg_turnaround ? Math.round(agent.avg_turnaround * 100) / 100 : null,
        completion_rate: parseFloat(agent.completion_rate) || 0
      }))
    };

    res.json({
      success: true,
      data: kpis,
      generated_at: new Date().toISOString(),
      date_filter: dateFilter
    });
  } catch (error) {
    console.error('Error generating document verification KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating document verification KPIs',
      error: error.message
    });
  }
});

// Get Combined Dashboard KPIs
router.get('/dashboard', async (req, res) => {
  try {
    const dateFilter = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    // Fetch high-level metrics for both datasets
    const [
      totalInsuranceCases,
      closedInsuranceCases,
      totalDocVerifications,
      completedDocVerifications,
      insuranceProcessingFees,
      insuranceAmountPaid,
      docProcessingFees,
      docAmountPaid,
      fraudCases
    ] = await Promise.all([
      InsuranceCase.getTotalCases(dateFilter),
      InsuranceCase.getClosedCases(dateFilter),
      DocumentVerification.getTotalVerifications(dateFilter),
      DocumentVerification.getCompletedVerifications(dateFilter),
      InsuranceCase.getTotalProcessingFees(dateFilter),
      InsuranceCase.getTotalAmountPaid(dateFilter),
      DocumentVerification.getTotalProcessingFees(dateFilter),
      DocumentVerification.getTotalAmountPaid(dateFilter),
      InsuranceCase.getFraudCases(dateFilter)
    ]);

    const dashboard = {
      summary: {
        total_records: totalInsuranceCases + totalDocVerifications,
        total_completed: closedInsuranceCases + completedDocVerifications,
        total_pending: (totalInsuranceCases - closedInsuranceCases) + 
                      (totalDocVerifications - completedDocVerifications)
      },
      insurance_cases: {
        total: totalInsuranceCases,
        closed: closedInsuranceCases,
        pending: totalInsuranceCases - closedInsuranceCases,
        fraud_cases: fraudCases,
        fraud_rate: totalInsuranceCases > 0 ? 
          ((fraudCases / totalInsuranceCases) * 100).toFixed(2) : 0
      },
      document_verifications: {
        total: totalDocVerifications,
        completed: completedDocVerifications,
        pending: totalDocVerifications - completedDocVerifications,
        completion_rate: totalDocVerifications > 0 ? 
          ((completedDocVerifications / totalDocVerifications) * 100).toFixed(2) : 0
      },
      financial_overview: {
        total_processing_fees: insuranceProcessingFees + docProcessingFees,
        total_amount_paid: insuranceAmountPaid + docAmountPaid,
        total_revenue: (insuranceProcessingFees + insuranceAmountPaid) + (docProcessingFees + docAmountPaid) // Processing Fee + Amount Paid for both
      }
    };

    res.json({
      success: true,
      data: dashboard,
      generated_at: new Date().toISOString(),
      date_filter: dateFilter
    });
  } catch (error) {
    console.error('Error generating dashboard KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating dashboard KPIs',
      error: error.message
    });
  }
});

module.exports = router;
