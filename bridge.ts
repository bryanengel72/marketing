export interface CampaignData {
  business_industry: string;
  business_model: string;
  offer_type: string;
  offer_description: string;
  offer_price: string;
  objective: string;
  audience_persona: string;
  audience_geo: string;
  monthly_budget: string;
  channels: string[];
  timeframe: string;
  brand_tone: string;
}

export const submit = async (data: CampaignData): Promise<any> => {
  const url = 'https://v1.mindstudio-api.com/developer/v2/agents/run';
  
  console.log('Submitting data to MindStudio Agent:', data);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer skOLsDjnxz0Iks4wYgyuM8GmYUkkWaMeIaUyceW60YCUmoGKuUi8c0GYQc2c0iSEGcuWSUC806Aow6g0uuAWwG4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: '75142e1e-6b73-4f2c-8414-61a49356a5da',
        workflow: 'Main',
        variables: {
          webhookParams: JSON.stringify(data),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent run failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Submission successful:', result);
    return result;
    
  } catch (error) {
    console.error('Error submitting data:', error);
    throw error;
  }
};

export const useTemplateVariables = (): Partial<CampaignData> => {
  // Pre-filling with the user's requested default data
  return {
    business_industry: "SaaS",
    business_model: "B2C",
    offer_type: "Lead Magnet",
    offer_description: "AI Audit and 90 Day Roadmap",
    offer_price: "$2000",
    objective: "Leads",
    audience_persona: "CTO and Director of IT in a SMB",
    audience_geo: "USA",
    monthly_budget: "$200",
    channels: ["Paid Social", "Influencer", "SEO/Content"],
    timeframe: "30 days",
    brand_tone: "Authority"
  };
};