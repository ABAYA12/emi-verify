const express = require('express');
const router = express.Router();
const InsuranceCase = require('../models/InsuranceCase');
const DocumentVerification = require('../models/DocumentVerification');

// Get Insurance Cases KPIs
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
      casesByCountry,
      fraudCases,
      agentPerformance
    ] = await Promise.all([
      InsuranceCase.getTotalCases(dateFilter),
      InsuranceCase.getClosedCases(dateFilter),
      InsuranceCase.getAverageTurnaroundTime(dateFilter),
      InsuranceCase.getPendingCases(dateFilter),
      InsuranceCase.getCasesByCountry(dateFilter),
      InsuranceCase.getFraudCases(dateFilter),
      InsuranceCase.getAgentPerformance(dateFilter)
    ]);

    // Calculate additional metrics
    const closureRate = totalCases > 0 ? (closedCases / totalCases * 100).toFixed(2) : 0;
    const fraudRate = totalCases > 0 ? (fraudCases / totalCases * 100).toFixed(2) : 0;

    const kpis = {
      overview: {
        total_cases_received: totalCases,
        total_cases_closed: closedCases,
        pending_cases: pendingCases,
        case_closure_rate: parseFloat(closureRate),
        average_turnaround_time: Math.round(avgTurnaround * 100) / 100
      },
      fraud_analysis: {
        total_fraud_cases: fraudCases,
        fraud_rate_percentage: parseFloat(fraudRate),
        non_fraud_cases: totalCases - fraudCases
      },
      geographical_distribution: casesByCountry,
      agent_performance: agentPerformance.map(agent => ({
        ...agent,
        avg_turnaround: agent.avg_turnaround ? Math.round(agent.avg_turnaround * 100) / 100 : null,
        closure_rate: agent.total_cases > 0 ? 
          Math.round((agent.closed_cases / agent.total_cases * 100) * 100) / 100 : 0
      }))
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
      verificationsByDocType,
      verificationsByCountry,
      totalProcessingFees,
      totalAgentPayments,
      outstandingPayments,
      agentPerformance
    ] = await Promise.all([
      DocumentVerification.getTotalVerifications(dateFilter),
      DocumentVerification.getCompletedVerifications(dateFilter),
      DocumentVerification.getAverageTurnaroundTime(dateFilter),
      DocumentVerification.getPendingVerifications(dateFilter),
      DocumentVerification.getVerificationsByDocumentType(dateFilter),
      DocumentVerification.getVerificationsByCountry(dateFilter),
      DocumentVerification.getTotalProcessingFees(dateFilter),
      DocumentVerification.getTotalAgentPayments(dateFilter),
      DocumentVerification.getOutstandingPayments(dateFilter),
      DocumentVerification.getAgentPerformance(dateFilter)
    ]);

    // Calculate additional metrics
    const completionRate = totalVerifications > 0 ? 
      (completedVerifications / totalVerifications * 100).toFixed(2) : 0;
    const netRevenue = totalProcessingFees - totalAgentPayments;

    const kpis = {
      overview: {
        total_verifications_received: totalVerifications,
        total_completed_verifications: completedVerifications,
        pending_verifications: pendingVerifications,
        completion_rate: parseFloat(completionRate),
        average_turnaround_time: Math.round(avgTurnaround * 100) / 100
      },
      financial_metrics: {
        total_processing_fees_collected: totalProcessingFees,
        total_agent_payments: totalAgentPayments,
        net_revenue: netRevenue,
        outstanding_payments: {
          count: outstandingPayments.count,
          amount: outstandingPayments.amount
        }
      },
      document_type_distribution: verificationsByDocType,
      geographical_distribution: verificationsByCountry,
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
      totalProcessingFees,
      totalAgentPayments,
      fraudCases
    ] = await Promise.all([
      InsuranceCase.getTotalCases(dateFilter),
      InsuranceCase.getClosedCases(dateFilter),
      DocumentVerification.getTotalVerifications(dateFilter),
      DocumentVerification.getCompletedVerifications(dateFilter),
      DocumentVerification.getTotalProcessingFees(dateFilter),
      DocumentVerification.getTotalAgentPayments(dateFilter),
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
        total_processing_fees: totalProcessingFees,
        total_agent_payments: totalAgentPayments,
        net_revenue: totalProcessingFees - totalAgentPayments
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
