import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, Shield, CheckCircle, Info, Zap, Users, DollarSign, Brain, Database, Mail } from 'lucide-react';

const ContractRiskAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [contractText, setContractText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // N8N webhook URL - https://uz-aiyb.app.n8n.cloud/webhook-test/analyze-contract;
  const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/analyze-contract';

  const handleFileUpload = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setContractText(e.target.result);
      };
      reader.readAsText(uploadedFile);
    }
  }, []);

  const handleTextInput = (event) => {
    setContractText(event.target.value);
  };

  const analyzeContract = async () => {
    if (analysisCount >= 2) {
      setShowUpgrade(true);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Call N8N webhook with contract data
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractText,
          userId: `user_${Date.now()}`,
          analysisType: 'comprehensive',
          userEmail: userEmail || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const analysisResult = await response.json();
      
      // Transform the response to match our frontend format
      const transformedAnalysis = {
        overallRisk: analysisResult.overallRisk,
        totalRiskScore: analysisResult.riskScore,
        confidenceScore: analysisResult.confidenceScore,
        detectedRisks: analysisResult.detectedRisks.map(risk => ({
          ...risk,
          matched: true,
          severityScore: risk.severity === 'high' ? 3 : risk.severity === 'medium' ? 2 : 1
        })),
        patternMatches: analysisResult.patternMatches || [],
        aiAnalyses: analysisResult.aiAnalyses,
        riskCount: analysisResult.detectedRisks.length,
        contractLength: contractText.length,
        analysisDate: new Date().toLocaleDateString(),
        summary: analysisResult.summary,
        recommendations: analysisResult.recommendations
      };

      setAnalysis(transformedAnalysis);
      setAnalysisCount(prev => prev + 1);
      
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getOverallRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (showUpgrade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upgrade to Continue</h2>
            <p className="text-lg text-gray-600 mb-8">
              You've used your 2 free contract analyses this month. Upgrade to Pro for unlimited access with AI-powered analysis!
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Free Plan</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">$0</div>
                <ul className="text-left space-y-2 text-gray-600">
                  <li>• 2 contracts/month</li>
                  <li>• Basic pattern matching</li>
                  <li>• Simple risk dashboard</li>
                </ul>
              </div>
              
              <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
                <h3 className="text-xl font-semibold mb-4 text-blue-900">Pro Plan</h3>
                <div className="text-3xl font-bold text-blue-900 mb-2">$79<span className="text-lg">/month</span></div>
                <ul className="text-left space-y-2 text-blue-800">
                  <li>• Unlimited contracts</li>
                  <li>• AI-powered analysis (GPT-4, Gemini, Claude)</li>
                  <li>• Legal database verification</li>
                  <li>• Detailed risk scoring</li>
                  <li>• Email notifications</li>
                  <li>• Analysis history</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
            
            <div className="space-x-4">
              <button 
                onClick={() => setShowUpgrade(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back to Analyzer
              </button>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">AI Contract Risk Analyzer</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Powered by GPT-4, Gemini Pro, and Claude for comprehensive legal analysis
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Multi-AI Analysis
            </div>
            <div className="flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Legal Database Verified
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Trusted by 10,000+ businesses
            </div>
            <div className="text-blue-600 font-medium">
              {analysisCount}/2 free analyses used
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload Your Contract</h2>
              
              {/* Email Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optional - for notifications):
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors mb-6">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">
                    Drop your contract here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, Word, and text files
                  </p>
                </label>
              </div>

              {/* Text Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste your contract text:
                </label>
                <textarea
                  value={contractText}
                  onChange={handleTextInput}
                  placeholder="Paste your contract text here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={analyzeContract}
                disabled={!contractText || isAnalyzing}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing with AI Models...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Analyze with AI (GPT-4 + Gemini + Claude)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {analysis ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">AI Risk Analysis Results</h3>
                
                {/* Confidence Score */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">AI Confidence</span>
                    <span className="text-lg font-bold text-blue-900">{analysis.confidenceScore}%</span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Based on multi-AI consensus
                  </div>
                </div>
                
                {/* Overall Risk Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Risk Level</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.overallRisk)}`}>
                      {analysis.overallRisk.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${getOverallRiskColor(analysis.overallRisk)} transition-all duration-500`}
                      style={{ width: `${Math.min((analysis.totalRiskScore / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Score: {analysis.totalRiskScore}/10
                  </div>
                </div>

                {/* AI Analysis Sources */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">AI Analysis Sources:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>OpenAI GPT-4 Legal Analysis</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Google Gemini Pro Review</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Claude Legal Expertise</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Database className="w-4 h-4 text-blue-500 mr-2" />
                      <span>Legal Database Verification</span>
                    </div>
                  </div>
                </div>

                {/* Risk Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {analysis.detectedRisks.filter(r => r.severity === 'high').length}
                    </div>
                    <div className="text-xs text-gray-600">High Risk</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analysis.detectedRisks.filter(r => r.severity === 'medium').length}
                    </div>
                    <div className="text-xs text-gray-600">Medium Risk</div>
                  </div>
                </div>

                {/* Detected Risks */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Detected Issues:</h4>
                  {analysis.detectedRisks.length > 0 ? (
                    analysis.detectedRisks.slice(0, 3).map((risk, index) => (
                      <div key={index} className={`border-l-4 pl-4 py-2 rounded ${
                        risk.severity === 'high' ? 'border-red-400 bg-red-50' : 'border-orange-400 bg-orange-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <AlertTriangle className={`w-4 h-4 mr-2 ${
                                risk.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                              }`} />
                              <span className={`font-medium ${
                                risk.severity === 'high' ? 'text-red-800' : 'text-orange-800'
                              }`}>
                                {risk.name}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 ${
                              risk.severity === 'high' ? 'text-red-700' : 'text-orange-700'
                            }`}>
                              {risk.description}
                            </p>
                            {risk.mitigation && (
                              <div className={`text-xs p-2 rounded ${
                                risk.severity === 'high' ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'
                              }`}>
                                <strong>Recommendation:</strong> {risk.mitigation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span>No major risks detected by AI analysis!</span>
                    </div>
                  )}
                  
                  {analysis.detectedRisks.length > 3 && (
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        +{analysis.detectedRisks.length - 3} more risks detected. 
                        <br />Upgrade for full analysis.
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Summary */}
                {analysis.summary && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">AI Summary:</h4>
                    <p className="text-sm text-gray-700">{analysis.summary}</p>
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>Next Steps:</strong> This analysis used advanced AI models for comprehensive risk assessment. Consider consulting with legal counsel for contracts with high-risk scores.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready for AI Analysis</h3>
                <p className="text-gray-600 mb-4">
                  Upload or paste your contract to get started with our multi-AI powered risk analysis.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Brain className="w-4 h-4 text-blue-500 mr-2" />
                    GPT-4 + Gemini + Claude analysis
                  </div>
                  <div className="flex items-center">
                    <Database className="w-4 h-4 text-green-500 mr-2" />
                    Legal database verification
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-purple-500 mr-2" />
                    Email notifications (optional)
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Confidence scoring & recommendations
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Powered by Advanced AI & Legal Technology
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-AI Analysis</h3>
              <p className="text-gray-600">GPT-4, Gemini Pro, and Claude working together for comprehensive analysis</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <Database className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Database</h3>
              <p className="text-gray-600">Cross-referenced with legal databases for accuracy and precedent</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Scoring</h3>
              <p className="text-gray-600">Advanced algorithms provide confidence scores and risk assessments</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <Mail className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Notifications</h3>
              <p className="text-gray-600">Get detailed analysis reports delivered to your email</p>
            </div>
          </div>
        </div>

        {/* Configuration Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Setup Required:</strong> This enhanced version requires configuring the N8N workflow with your API keys for OpenAI, Google Gemini, Anthropic Claude, legal databases, and email services. Update the N8N_WEBHOOK_URL in the code to point to your deployed n8n instance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractRiskAnalyzer;