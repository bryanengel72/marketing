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
  // Return empty object so form starts with no pre-filled data
  return {};
};